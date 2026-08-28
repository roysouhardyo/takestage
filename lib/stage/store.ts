import type { Stage, StageEvent } from '@/types'
import fs from 'fs'
import path from 'path'

export interface MemoryStageState {
  activeStage: Stage | null
  pastStages: Stage[]
  events: StageEvent[]
}

const STORE_FILE_PATH = path.join(process.cwd(), '.next', 'stage_store.json')

function loadStoreFromDisk(): MemoryStageState {
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const raw = fs.readFileSync(STORE_FILE_PATH, 'utf-8')
      const parsed = JSON.parse(raw)
      return {
        activeStage: parsed.activeStage || null,
        pastStages: Array.isArray(parsed.pastStages) ? parsed.pastStages : [],
        events: Array.isArray(parsed.events) ? parsed.events : [],
      }
    }
  } catch (err) {
    console.warn('[loadStoreFromDisk] Failed to read store file:', err)
  }
  return { activeStage: null, pastStages: [], events: [] }
}

function saveStoreToDisk(state: MemoryStageState) {
  try {
    const dir = path.dirname(STORE_FILE_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[saveStoreToDisk] Failed to write store file:', err)
  }
}

// In-process memory cache
let memoryState: MemoryStageState = loadStoreFromDisk()

/**
 * Returns active stage from memory store, marking it completed if expired.
 */
export function getMemoryActiveStage(): Stage | null {
  memoryState = loadStoreFromDisk()
  if (!memoryState.activeStage) return null
  if (!memoryState.activeStage.expires_at) return memoryState.activeStage

  const now = Date.now()
  const exp = new Date(memoryState.activeStage.expires_at).getTime()
  if (now >= exp) {
    if (!memoryState.pastStages.some((s) => s.id === memoryState.activeStage!.id)) {
      memoryState.pastStages.unshift({ ...memoryState.activeStage, status: 'completed' })
    }
    memoryState.activeStage = null
    saveStoreToDisk(memoryState)
    return null
  }
  return memoryState.activeStage
}

export function getMemoryPastStages(): Stage[] {
  getMemoryActiveStage() // purge expired
  return [...memoryState.pastStages]
}

export function getMemoryEvents(): StageEvent[] {
  return [...memoryState.events]
}

/**
 * Records a click on a stage by ID. Used by /api/stage/click.
 */
export function recordStageClick(stageId: string): number {
  memoryState = loadStoreFromDisk()
  let count = 0

  if (memoryState.activeStage && memoryState.activeStage.id === stageId) {
    memoryState.activeStage.click_count = (memoryState.activeStage.click_count || 0) + 1
    count = memoryState.activeStage.click_count
  }

  const pastItem = memoryState.pastStages.find((s) => s.id === stageId)
  if (pastItem) {
    pastItem.click_count = (pastItem.click_count || 0) + 1
    count = pastItem.click_count
  }

  saveStoreToDisk(memoryState)
  return count
}

/**
 * Activates a stage in the in-memory store.
 * Called by the Polar webhook handler after a confirmed payment.
 */
export function activateStageInMemory(params: {
  websiteUrl: string
  normalizedDomain: string
  brandName: string
  logoUrl?: string | null
  fallbackInitial?: string
  message?: string | null
  durationMinutes: number
  stageId?: string
}) {
  const {
    websiteUrl,
    normalizedDomain,
    brandName,
    logoUrl = null,
    fallbackInitial = normalizedDomain[0]?.toUpperCase() || '?',
    message = null,
    durationMinutes,
    stageId = `stage_${Date.now()}`,
  } = params

  memoryState = loadStoreFromDisk()
  const now = new Date()
  const startedAt = now.toISOString()
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString()
  const amount = durationMinutes * 100

  const currentActive = getMemoryActiveStage()
  let replacedStage: Stage | null = null

  if (currentActive) {
    if (durationMinutes <= currentActive.original_duration_minutes) {
      return {
        success: false,
        reason: `Must buy more than ${currentActive.original_duration_minutes} minutes to take over.`,
      }
    }
    replacedStage = { ...currentActive, status: 'taken_over' as const }
    if (!memoryState.pastStages.some((s) => s.id === replacedStage!.id)) {
      memoryState.pastStages.unshift(replacedStage)
    }
  }

  const newStage: Stage = {
    id: stageId,
    website_url: websiteUrl,
    normalized_domain: normalizedDomain,
    brand_name: brandName,
    logo_url: logoUrl,
    fallback_initial: fallbackInitial,
    message,
    duration_minutes: durationMinutes,
    original_duration_minutes: durationMinutes,
    amount,
    currency: 'usd',
    started_at: startedAt,
    expires_at: expiresAt,
    status: 'active',
    created_at: startedAt,
  }

  memoryState.activeStage = newStage
  saveStoreToDisk(memoryState)

  return { success: true, stage: newStage, replacedStage }
}

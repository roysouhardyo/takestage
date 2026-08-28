'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import type { Stage, StageEvent } from '@/types'
import { createBrowserClient } from '@/lib/supabase/client'

export type RealtimeStatus = 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR'

interface RealtimeContextType {
  activeStage: Stage | null
  pastStages: Stage[]
  activityEvents: StageEvent[]
  watcherCount: number
  status: RealtimeStatus
  isTransitioning: boolean
  lastTakeoverOwner: string | null
  refreshStage: () => Promise<void>
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

interface RealtimeProviderProps {
  initialStage: Stage | null
  initialPastStages?: Stage[]
  initialEvents?: StageEvent[]
  children: React.ReactNode
}

export function RealtimeProvider({
  initialStage,
  initialPastStages = [],
  initialEvents = [],
  children,
}: RealtimeProviderProps) {
  const [activeStage, setActiveStage] = useState<Stage | null>(initialStage)
  const [pastStages, setPastStages] = useState<Stage[]>(initialPastStages)
  const [activityEvents, setActivityEvents] = useState<StageEvent[]>(initialEvents)
  const [watcherCount, setWatcherCount] = useState<number>(1)
  const [status, setStatus] = useState<RealtimeStatus>('CONNECTED')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [lastTakeoverOwner, setLastTakeoverOwner] = useState<string | null>(null)

  // Use refs to avoid re-subscribing on activeStage change
  const activeStageRef = useRef<Stage | null>(initialStage)
  activeStageRef.current = activeStage

  const processedStageIdsRef = useRef<Set<string>>(new Set())

  // Server re-fetch helper for authoritative reconciliation
  const refreshStage = useCallback(async () => {
    try {
      const res = await fetch('/api/stage/active')
      if (res.ok) {
        const data = await res.json()
        if (data.stage) {
          setActiveStage(data.stage)
        } else {
          setActiveStage(null)
        }
        if (data.pastStages) {
          setPastStages(data.pastStages)
        }
      }
    } catch (err) {
      console.warn('[RealtimeProvider] Failed to reconcile stage state:', err)
    }
  }, [])

  useEffect(() => {
    // Initial authoritative reconciliation from server
    refreshStage()

    const supabase = createBrowserClient()

    // ── 1. STAGE REALTIME SUBSCRIPTION ──────────────────────────────────────────
    const stageChannel = supabase
      .channel('takestage-central-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stages',
        },
        async (payload) => {
          const { eventType, new: newRow } = payload as {
            eventType: 'INSERT' | 'UPDATE' | 'DELETE'
            new: Record<string, unknown>
            old: Record<string, unknown>
          }

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const updated = newRow as unknown as Stage
            if (!updated || !updated.id) return

            const eventKey = `${eventType}-${updated.id}-${updated.status}`
            if (processedStageIdsRef.current.has(eventKey)) {
              return
            }
            processedStageIdsRef.current.add(eventKey)
            if (processedStageIdsRef.current.size > 200) {
              processedStageIdsRef.current.clear()
            }

            const current = activeStageRef.current

            if (updated.status === 'active') {
              if (current && current.id !== updated.id) {
                setIsTransitioning(true)
                const ownerName = updated.brand_name || updated.normalized_domain
                setLastTakeoverOwner(ownerName)

                setPastStages((prev) => {
                  if (prev.some((s) => s.id === current.id)) return prev
                  return [{ ...current, status: 'taken_over' }, ...prev]
                })

                setActivityEvents((prev) => [
                  {
                    id: `evt-takeover-${updated.id}`,
                    event_type: 'stage_takeover',
                    stage_id: updated.id,
                    session_id: null,
                    metadata: {
                      domain: updated.normalized_domain,
                      duration_minutes: updated.duration_minutes,
                    },
                    created_at: new Date().toISOString(),
                  },
                  ...prev,
                ])

                setTimeout(() => {
                  setActiveStage(updated)
                  setIsTransitioning(false)
                }, 600)
              } else {
                setActiveStage(updated)
                setActivityEvents((prev) => [
                  {
                    id: `evt-start-${updated.id}`,
                    event_type: 'stage_started',
                    stage_id: updated.id,
                    session_id: null,
                    metadata: {
                      domain: updated.normalized_domain,
                      duration_minutes: updated.duration_minutes,
                    },
                    created_at: new Date().toISOString(),
                  },
                  ...prev,
                ])
              }
            } else if (
              (updated.status === 'completed' || updated.status === 'taken_over' || updated.status === 'cancelled') &&
              current?.id === updated.id
            ) {
              setActiveStage(null)
              setPastStages((prev) => {
                if (prev.some((s) => s.id === updated.id)) return prev
                return [updated, ...prev]
              })
              setActivityEvents((prev) => [
                {
                  id: `evt-complete-${updated.id}`,
                  event_type: 'stage_completed',
                  stage_id: updated.id,
                  session_id: null,
                  metadata: {
                    domain: updated.normalized_domain,
                    duration_minutes: updated.duration_minutes,
                  },
                  created_at: new Date().toISOString(),
                },
                ...prev,
              ])
            }
          }
        },
      )
      .subscribe((subStatus) => {
        if (subStatus === 'SUBSCRIBED') {
          setStatus('CONNECTED')
        }
      })

    // ── 2. LIVE PRESENCE SUBSCRIPTION & HEARTBEAT ───────────────────────────────
    const sessionIdRef = `sess_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`

    // Heartbeat function to report session to server and fetch active visitor count
    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionIdRef }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.count) {
            setWatcherCount((prev) => Math.max(prev, data.count))
          }
        }
      } catch {
        // Fallback silently
      }
    }

    sendHeartbeat()
    const heartbeatInterval = setInterval(sendHeartbeat, 12000)

    const presenceChannel = supabase.channel('presence-stage-viewers', {
      config: { presence: { key: sessionIdRef } },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const count = Object.keys(state).length
        if (count > 0) {
          setWatcherCount(count)
        }
      })
      .subscribe(async (subStatus) => {
        if (subStatus === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      clearInterval(heartbeatInterval)
      supabase.removeChannel(stageChannel)
      supabase.removeChannel(presenceChannel)
    }
  }, [refreshStage])

  return (
    <RealtimeContext.Provider
      value={{
        activeStage,
        pastStages,
        activityEvents,
        watcherCount,
        status,
        isTransitioning,
        lastTakeoverOwner,
        refreshStage,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    return {
      activeStage: null,
      pastStages: [],
      activityEvents: [],
      watcherCount: 1,
      status: 'CONNECTED' as RealtimeStatus,
      isTransitioning: false,
      lastTakeoverOwner: null,
      refreshStage: async () => {},
    }
  }
  return context
}

'use client'

import { useState, useEffect } from 'react'
import { Clock, Minus, Plus, Zap } from 'lucide-react'
import type { Stage } from '@/types'
import { DEFAULT_PRESET_TIERS, TAKEOVER_PRESET_TIERS, formatPrice } from '@/lib/pricing/config'

interface DurationPickerProps {
  selectedMinutes: number | null
  onSelectMinutes: (minutes: number) => void
  currentStage: Stage | null
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

function formatMinutesToLabel(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}m`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function DurationPicker({
  selectedMinutes,
  onSelectMinutes,
  currentStage,
}: DurationPickerProps) {
  const activeOriginalMins = currentStage?.original_duration_minutes ?? 0
  const minimumRequiredMins = activeOriginalMins > 0 ? activeOriginalMins + 1 : 1

  const defaultStartMins = Math.max(30, minimumRequiredMins)
  const [customHours, setCustomHours] = useState<number>(Math.floor(defaultStartMins / 60))
  const [customMins, setCustomMins] = useState<number>(defaultStartMins % 60)
  const [isCustom, setIsCustom] = useState(false)

  const availablePresets = currentStage
    ? TAKEOVER_PRESET_TIERS.filter((t) => t.minutes >= minimumRequiredMins)
    : DEFAULT_PRESET_TIERS

  useEffect(() => {
    if (isCustom) {
      const total = customHours * 60 + customMins
      onSelectMinutes(total)
    }
  }, [isCustom, customHours, customMins, onSelectMinutes])

  const handleCustomChange = (h: number, m: number) => {
    const validH = Math.max(0, Math.min(24, h))
    const validM = Math.max(0, Math.min(59, m))
    setCustomHours(validH)
    setCustomMins(validM)
    setIsCustom(true)
    const total = validH * 60 + validM
    onSelectMinutes(total)
  }

  const isSelectedValid = selectedMinutes ? selectedMinutes >= minimumRequiredMins : false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* PROMINENT TAKEOVER WARNING CALLOUT BANNER AT TOP OF STEP 1 */}
      {currentStage && (
        <div
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(198,254,30,0.06)',
            border: '1px solid rgba(198,254,30,0.35)',
            boxShadow: '0 0 20px rgba(198,254,30,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#C6FE1E',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: FONT_DISPLAY,
              }}
            >
              <Zap style={{ width: 14, height: 14, fill: '#C6FE1E', color: '#C6FE1E' }} /> TAKEOVER REQUIREMENT
            </span>
            <span style={{ fontSize: '12px', color: '#C6FE1E', fontFamily: FONT_MONO, fontWeight: 800 }}>
              MIN {minimumRequiredMins} MIN (${minimumRequiredMins})
            </span>
          </div>

          <p style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', fontFamily: FONT_DISPLAY, margin: '0 0 6px 0' }}>
            Current Holder: {currentStage.brand_name || currentStage.normalized_domain}
          </p>

          <p style={{ fontSize: '13px', color: '#dddddd', margin: 0, fontFamily: FONT_BODY, lineHeight: 1.5 }}>
            The previous spot was purchased for <strong style={{ color: '#ffffff' }}>{activeOriginalMins} min (${activeOriginalMins})</strong>. To take over the stage now, you must buy strictly more than {activeOriginalMins} min (<strong style={{ color: '#C6FE1E' }}>{minimumRequiredMins}+ min</strong>).
          </p>
        </div>
      )}

      {/* Preset Tiers Grid */}
      {availablePresets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
          {availablePresets.map((tier) => {
            const isSelected = !isCustom && selectedMinutes === tier.minutes
            const priceCents = tier.minutes * 100

            return (
              <button
                key={tier.minutes}
                type="button"
                id={`duration-preset-${tier.minutes}`}
                onClick={() => {
                  setIsCustom(false)
                  onSelectMinutes(tier.minutes)
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 10px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(198,254,30,0.12)' : 'rgba(255,255,255,0.03)',
                  border: isSelected ? '1px solid #C6FE1E' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isSelected ? '0 0 20px rgba(198,254,30,0.15)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    fontFamily: FONT_DISPLAY,
                    color: isSelected ? '#C6FE1E' : '#ffffff',
                    marginBottom: '2px',
                  }}
                >
                  {tier.label}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? '#ffffff' : '#888888', fontFamily: FONT_MONO }}>
                  {formatPrice(priceCents)}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Custom Duration Section */}
      <div
        style={{
          padding: '16px',
          borderRadius: '14px',
          background: isCustom ? 'rgba(198,254,30,0.04)' : 'rgba(255,255,255,0.02)',
          border: isCustom
            ? isSelectedValid
              ? '1px solid rgba(198,254,30,0.35)'
              : '1px solid rgba(239,68,68,0.5)'
            : '1px solid rgba(255,255,255,0.08)',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#dddddd', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_DISPLAY }}>
            <Clock style={{ width: 14, height: 14, color: '#C6FE1E' }} /> Custom Duration
          </label>
          {isCustom && selectedMinutes && isSelectedValid && (
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#C6FE1E', fontFamily: FONT_MONO }}>
              = {formatMinutesToLabel(selectedMinutes)} ({formatPrice(selectedMinutes * 100)})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Hours Segment */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#888888', textTransform: 'uppercase', fontFamily: FONT_DISPLAY }}>
              HOURS
            </span>
            <div style={{ display: 'flex', alignItems: 'center', background: '#111111', border: '1px solid #282828', borderRadius: '10px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => handleCustomChange(customHours - 1, customMins)}
                style={{ width: '32px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#aaaaaa', cursor: 'pointer' }}
                aria-label="Decrease hours"
              >
                <Minus style={{ width: 14, height: 14 }} />
              </button>
              <input
                type="number"
                min={0}
                max={24}
                value={customHours}
                onChange={(e) => handleCustomChange(parseInt(e.target.value) || 0, customMins)}
                id="custom-hours-input"
                style={{
                  flex: 1,
                  height: '40px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  textAlign: 'center',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 800,
                  fontFamily: FONT_MONO,
                }}
              />
              <button
                type="button"
                onClick={() => handleCustomChange(customHours + 1, customMins)}
                style={{ width: '32px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#aaaaaa', cursor: 'pointer' }}
                aria-label="Increase hours"
              >
                <Plus style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>

          <span style={{ fontSize: '18px', fontWeight: 800, color: '#444444', paddingTop: '18px' }}>:</span>

          {/* Minutes Segment */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#888888', textTransform: 'uppercase', fontFamily: FONT_DISPLAY }}>
              MINUTES
            </span>
            <div style={{ display: 'flex', alignItems: 'center', background: '#111111', border: '1px solid #282828', borderRadius: '10px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => handleCustomChange(customHours, customMins - 1)}
                style={{ width: '32px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#aaaaaa', cursor: 'pointer' }}
                aria-label="Decrease minutes"
              >
                <Minus style={{ width: 14, height: 14 }} />
              </button>
              <input
                type="number"
                min={0}
                max={59}
                value={customMins}
                onChange={(e) => handleCustomChange(customHours, parseInt(e.target.value) || 0)}
                id="custom-minutes-input"
                style={{
                  flex: 1,
                  height: '40px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  textAlign: 'center',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 800,
                  fontFamily: FONT_MONO,
                }}
              />
              <button
                type="button"
                onClick={() => handleCustomChange(customHours, customMins + 1)}
                style={{ width: '32px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#aaaaaa', cursor: 'pointer' }}
                aria-label="Increase minutes"
              >
                <Plus style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Validation error display right on Step 1 */}
        {currentStage && selectedMinutes !== null && !isSelectedValid && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: FONT_BODY,
              marginTop: '12px',
              lineHeight: 1.4,
            }}
          >
            ⚠️ The previous spot was purchased for {activeOriginalMins} min (${activeOriginalMins}). You must buy strictly more than {activeOriginalMins} min (<strong style={{ color: '#ffffff' }}>{minimumRequiredMins}+ min</strong>) to take over the stage.
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { Zap, Clock, Minus, Plus } from 'lucide-react'
import type { Stage } from '@/types'
import { DEFAULT_PRESET_TIERS, TAKEOVER_PRESET_TIERS, formatPrice } from '@/lib/pricing/config'

interface DurationPickerProps {
  selectedMinutes: number | null
  onSelectMinutes: (minutes: number) => void
  currentStage: Stage | null
}

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
  const [customHours, setCustomHours] = useState<number>(0)
  const [customMins, setCustomMins] = useState<number>(30)
  const [isCustom, setIsCustom] = useState(false)

  const activeOriginalMins = currentStage?.original_duration_minutes ?? 0

  const availablePresets = currentStage
    ? TAKEOVER_PRESET_TIERS.filter((t) => t.minutes > activeOriginalMins)
    : DEFAULT_PRESET_TIERS

  useEffect(() => {
    if (isCustom) {
      const total = customHours * 60 + customMins
      if (total > activeOriginalMins) {
        onSelectMinutes(total)
      }
    }
  }, [isCustom, customHours, customMins, activeOriginalMins, onSelectMinutes])

  const handleCustomChange = (h: number, m: number) => {
    const validH = Math.max(0, Math.min(24, h))
    const validM = Math.max(0, Math.min(59, m))
    setCustomHours(validH)
    setCustomMins(validM)
    setIsCustom(true)
    const total = validH * 60 + validM
    onSelectMinutes(total)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Active Stage Takeover Callout */}
      {currentStage && (
        <div
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(198,254,30,0.06)',
            border: '1px solid rgba(198,254,30,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C6FE1E', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              <Zap style={{ width: 14, height: 14, fill: '#C6FE1E', color: '#C6FE1E' }} /> CURRENT SPOT
            </span>
            <span style={{ fontSize: '12px', color: '#dddddd', fontFamily: "'Fira Code', monospace", fontWeight: 700 }}>
              Original: {formatMinutesToLabel(currentStage.original_duration_minutes)}
            </span>
          </div>

          <p style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', system-ui, sans-serif", margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentStage.brand_name || currentStage.normalized_domain}
          </p>

          <p style={{ fontSize: '12px', color: '#aaaaaa', margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
            ⚡ <strong style={{ color: '#ffffff' }}>Rush the Spot:</strong> Buy a full duration strictly greater than{' '}
            <strong style={{ color: '#C6FE1E' }}>{currentStage.original_duration_minutes} min</strong> to take over now.
          </p>
        </div>
      )}

      {/* Preset Tiers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        {availablePresets.map((tier) => {
          const isSelected = !isCustom && selectedMinutes === tier.minutes
          const priceCents = tier.minutes * 100 // $1 / min

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
                padding: '16px 12px',
                borderRadius: '14px',
                background: isSelected ? 'rgba(198,254,30,0.1)' : 'rgba(255,255,255,0.03)',
                border: isSelected ? '1px solid #C6FE1E' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isSelected ? '0 0 20px rgba(198,254,30,0.15)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  color: isSelected ? '#C6FE1E' : '#ffffff',
                  marginBottom: '2px',
                }}
              >
                {tier.label}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#ffffff' : '#888888', fontFamily: "'Fira Code', monospace" }}>
                {formatPrice(priceCents)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Professional Custom Duration Section */}
      <div
        style={{
          padding: '20px',
          borderRadius: '16px',
          background: isCustom ? 'rgba(198,254,30,0.04)' : 'rgba(255,255,255,0.02)',
          border: isCustom ? '1px solid rgba(198,254,30,0.35)' : '1px solid rgba(255,255,255,0.08)',
          transition: 'border-color 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#dddddd', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            <Clock style={{ width: 14, height: 14, color: '#C6FE1E' }} /> Custom Duration
          </label>
          {isCustom && selectedMinutes && (
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#C6FE1E', fontFamily: "'Fira Code', monospace" }}>
              = {formatMinutesToLabel(selectedMinutes)} ({formatPrice(selectedMinutes * 100)})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Hours Segment */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#888888', textTransform: 'uppercase', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              HOURS
            </span>
            <div style={{ display: 'flex', alignItems: 'center', background: '#111111', border: '1px solid #282828', borderRadius: '12px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => handleCustomChange(customHours - 1, customMins)}
                style={{ width: '36px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#aaaaaa', cursor: 'pointer' }}
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
                  height: '44px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  textAlign: 'center',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: "'Fira Code', monospace",
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                }}
              />
              <button
                type="button"
                onClick={() => handleCustomChange(customHours + 1, customMins)}
                style={{ width: '36px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#aaaaaa', cursor: 'pointer' }}
                aria-label="Increase hours"
              >
                <Plus style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>

          <span style={{ fontSize: '20px', fontWeight: 800, color: '#444444', paddingTop: '22px' }}>:</span>

          {/* Minutes Segment */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#888888', textTransform: 'uppercase', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              MINUTES
            </span>
            <div style={{ display: 'flex', alignItems: 'center', background: '#111111', border: '1px solid #282828', borderRadius: '12px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => handleCustomChange(customHours, customMins - 5)}
                style={{ width: '36px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#aaaaaa', cursor: 'pointer' }}
                aria-label="Decrease minutes"
              >
                <Minus style={{ width: 14, height: 14 }} />
              </button>
              <input
                type="number"
                min={0}
                max={59}
                step={5}
                value={customMins}
                onChange={(e) => handleCustomChange(customHours, parseInt(e.target.value) || 0)}
                id="custom-minutes-input"
                style={{
                  flex: 1,
                  height: '44px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  textAlign: 'center',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: "'Fira Code', monospace",
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                }}
              />
              <button
                type="button"
                onClick={() => handleCustomChange(customHours, customMins + 5)}
                style={{ width: '36px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#aaaaaa', cursor: 'pointer' }}
                aria-label="Increase minutes"
              >
                <Plus style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        </div>

        {currentStage && isCustom && selectedMinutes && selectedMinutes <= activeOriginalMins && (
          <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '12px', fontFamily: "'Inter', system-ui, sans-serif" }}>
            Must be strictly greater than {activeOriginalMins} min for a takeover.
          </p>
        )}
      </div>
    </div>
  )
}

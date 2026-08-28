'use client'

import { useState, useEffect, useRef } from 'react'
import { useRealtime } from '@/context/RealtimeContext'
import type { Stage } from '@/types'

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

interface TickerItemData {
  id: string
  domain: string
  action: string
  logo_url: string | null
  initial: string
  status: 'active' | 'taken_over' | 'completed' | 'visit'
}

export function StageTicker() {
  const { activeStage, pastStages } = useRealtime()
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const trackRef = useRef<HTMLDivElement>(null)

  // Inject keyframe animation once into document head
  useEffect(() => {
    const id = 'ts-ticker-style'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      @keyframes ts-rtl {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .ts-ticker-track {
        animation: ts-rtl 30s linear infinite;
        will-change: transform;
      }
      .ts-ticker-track:hover {
        animation-play-state: paused;
      }
    `
    document.head.appendChild(style)
    return () => { document.getElementById(id)?.remove() }
  }, [])

  // Derive real activity items
  const rawItems: TickerItemData[] = []

  if (activeStage && activeStage.status === 'active') {
    const domain = activeStage.normalized_domain || activeStage.brand_name || 'Active Spot'
    rawItems.push({
      id: `active-${activeStage.id}`,
      domain,
      action: `NOW ON STAGE (${activeStage.original_duration_minutes} MIN)`,
      logo_url: activeStage.logo_url,
      initial: activeStage.fallback_initial || domain[0]?.toUpperCase() || 'A',
      status: 'active',
    })
    if (activeStage.click_count && activeStage.click_count > 0) {
      rawItems.push({
        id: `active-clicks-${activeStage.id}`,
        domain,
        action: `GAINED ${activeStage.click_count} REAL ${activeStage.click_count === 1 ? 'VISIT' : 'VISITS'}`,
        logo_url: activeStage.logo_url,
        initial: activeStage.fallback_initial || domain[0]?.toUpperCase() || 'A',
        status: 'visit',
      })
    }
  }

  pastStages.forEach((s: Stage) => {
    const domain = s.normalized_domain || s.brand_name || 'Stage'
    const initial = s.fallback_initial || domain[0]?.toUpperCase() || '?'

    if (s.status === 'taken_over') {
      rawItems.push({
        id: `past-rushed-${s.id}`,
        domain,
        action: `JUST TOOK THE STAGE (${s.original_duration_minutes} MIN)`,
        logo_url: s.logo_url,
        initial,
        status: 'taken_over',
      })
    } else {
      rawItems.push({
        id: `past-ended-${s.id}`,
        domain,
        action: `SPOT ENDED (${s.original_duration_minutes} MIN)`,
        logo_url: s.logo_url,
        initial,
        status: 'completed',
      })
    }

    if (s.click_count && s.click_count > 0) {
      rawItems.push({
        id: `past-clicks-${s.id}`,
        domain,
        action: `GAINED ${s.click_count} REAL ${s.click_count === 1 ? 'VISIT' : 'VISITS'}`,
        logo_url: s.logo_url,
        initial,
        status: 'visit',
      })
    }
  })

  // If no real data yet, show a subtle waiting message — no fake data
  if (rawItems.length === 0) {
    rawItems.push(
      { id: 'waiting-1', domain: 'takestage.com', action: 'WAITING FOR FIRST TAKEOVER — BE THE FIRST!', logo_url: null, initial: 'T', status: 'active' },
    )
  }

  // Duplicate 4x for seamless infinite loop (animate -50% so it repeats seamlessly)
  const tickerItems = [...rawItems, ...rawItems, ...rawItems, ...rawItems]

  return (
    <aside
      style={{
        width: '100%',
        height: '46px',
        background: '#070707',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: '56px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        zIndex: 40,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
      aria-label="Live Stage Activity"
    >
      {/* Pinned Left Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0 20px',
          height: '100%',
          background: '#070707',
          position: 'relative',
          zIndex: 10,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-block', flexShrink: 0 }}>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: '#C6FE1E',
              opacity: 0.6,
              animation: 'ping 1.5s ease-in-out infinite',
            }}
          />
          <span
            style={{
              position: 'relative',
              display: 'block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#C6FE1E',
            }}
          />
        </span>
        <span
          className="ts-ticker-live-label"
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: '11px',
            fontWeight: 900,
            color: '#C6FE1E',
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            whiteSpace: 'nowrap',
          }}
        >
          LIVE STAGE ACTIVITY
        </span>
      </div>

      {/* Right fade */}
      <div
        style={{
          position: 'absolute',
          top: 0, bottom: 0, right: 0,
          width: '60px',
          background: 'linear-gradient(to left, #070707, transparent)',
          zIndex: 9,
          pointerEvents: 'none',
        }}
      />

      {/* Scrolling track */}
      <div style={{ flex: 1, overflow: 'hidden', height: '100%', display: 'flex', alignItems: 'center' }}>
        <div
          ref={trackRef}
          className="ts-ticker-track"
          style={{
            display: 'flex',
            alignItems: 'center',
            width: 'max-content',
            height: '100%',
          }}
        >
          {tickerItems.map((item, idx) => {
            const hasImgError = imgErrors[`${item.id}-${idx}`]
            const isVisit = item.status === 'visit'
            const isTakeover = item.status === 'taken_over'
            const isActive = item.status === 'active'

            return (
              <div
                key={`${item.id}-${idx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0 28px',
                  whiteSpace: 'nowrap',
                  height: '100%',
                  flexShrink: 0,
                }}
              >
                {/* Status dot */}
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'inline-block',
                    background: isActive ? '#4ade80' : isTakeover ? '#C6FE1E' : isVisit ? '#38bdf8' : '#555',
                  }}
                />

                {/* Icon */}
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '5px',
                    background: isActive
                      ? 'rgba(74,222,128,0.15)'
                      : isTakeover
                      ? 'rgba(198,254,30,0.15)'
                      : 'rgba(255,255,255,0.06)',
                    border: isActive
                      ? '1px solid rgba(74,222,128,0.35)'
                      : isTakeover
                      ? '1px solid rgba(198,254,30,0.35)'
                      : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {item.logo_url && !hasImgError ? (
                    <img
                      src={item.logo_url}
                      alt={item.domain}
                      onError={() => setImgErrors(p => ({ ...p, [`${item.id}-${idx}`]: true }))}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 900,
                        color: isActive ? '#4ade80' : isTakeover ? '#C6FE1E' : '#aaa',
                        fontFamily: FONT_DISPLAY,
                      }}
                    >
                      {item.initial}
                    </span>
                  )}
                </div>

                {/* Domain */}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#fff',
                    fontFamily: FONT_DISPLAY,
                    letterSpacing: '0.01em',
                  }}
                >
                  {item.domain}
                </span>

                {/* Action */}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: isActive ? '#4ade80' : isTakeover ? '#C6FE1E' : isVisit ? '#38bdf8' : '#666',
                    fontFamily: FONT_MONO,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase' as const,
                  }}
                >
                  {item.action}
                </span>

                {/* Divider */}
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px', paddingLeft: '12px' }}>|</span>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

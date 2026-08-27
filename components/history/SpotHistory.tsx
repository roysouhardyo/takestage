'use client'

import { useState } from 'react'
import type { Stage } from '@/types'

interface SpotHistoryProps {
  stages: Stage[]
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

export function SpotHistory({ stages }: SpotHistoryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const recentStages = stages.slice(0, 16)

  if (recentStages.length === 0) {
    return null
  }

  return (
    <section
      style={{
        width: '100%',
        padding: '48px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: '#0a0a0a',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#888888',
            marginBottom: '20px',
            textAlign: 'center',
            fontFamily: FONT_DISPLAY,
          }}
        >
          SPOT HISTORY
        </p>

        {/* Visual Strip of Logos / Icons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {recentStages.map((stage) => {
            const name = stage.brand_name || stage.normalized_domain
            const initial = stage.fallback_initial || name[0]?.toUpperCase() || '?'
            const isHovered = hoveredId === stage.id

            return (
              <div
                key={stage.id}
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveredId(stage.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <a
                  href={stage.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: '#141414',
                    border: isHovered ? '1px solid #C6FE1E' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isHovered ? '0 0 16px rgba(198,254,30,0.2)' : 'none',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    overflow: 'hidden',
                  }}
                  aria-label={`Visit ${name}`}
                >
                  {stage.logo_url ? (
                    <img
                      src={stage.logo_url}
                      alt={name}
                      style={{
                        width: '32px',
                        height: '32px',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        // Fallback to text initial if image load fails
                        ;(e.currentTarget as HTMLElement).style.display = 'none'
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerText = initial
                          e.currentTarget.parentElement.style.color = '#C6FE1E'
                          e.currentTarget.parentElement.style.fontWeight = '800'
                          e.currentTarget.parentElement.style.fontFamily = FONT_DISPLAY
                        }
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#C6FE1E',
                        fontFamily: FONT_DISPLAY,
                      }}
                    >
                      {initial}
                    </span>
                  )}
                </a>

                {/* Refined Tooltip */}
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 10px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#161616',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      whiteSpace: 'nowrap',
                      zIndex: 30,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                      pointerEvents: 'none',
                    }}
                  >
                    <p style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: FONT_DISPLAY }}>
                      {name}
                    </p>
                    <p style={{ fontSize: '11px', color: '#aaaaaa', margin: '2px 0 0 0', fontFamily: FONT_MONO }}>
                      {stage.original_duration_minutes} MIN SLOT
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

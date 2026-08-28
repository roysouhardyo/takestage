'use client'

import { useState } from 'react'
import type { Stage } from '@/types'
import { formatPrice } from '@/lib/pricing/tiers'
import { ExternalLink, Zap } from 'lucide-react'
import Link from 'next/link'

interface SpotHistoryProps {
  activeStage?: Stage | null
  stages: Stage[]
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

function formatTimestamp(isoString: string | null): string {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function SpotHistory({ activeStage, stages = [] }: SpotHistoryProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  // Combine activeStage at top (if active) + past stages (deduped by ID)
  const allHistory: Array<{ stage: Stage; isCurrent: boolean }> = []

  if (activeStage && activeStage.status === 'active') {
    allHistory.push({ stage: activeStage, isCurrent: true })
  }

  stages.forEach((s) => {
    if (!allHistory.some((item) => item.stage.id === s.id)) {
      allHistory.push({ stage: s, isCurrent: false })
    }
  })

  // Limit home page timeline to latest 10 takeovers; rest are accessible in /archive
  const displayHistory = allHistory.slice(0, 10)
  const takeoverCount = Math.max(0, allHistory.length - 1)

  return (
    <section
      style={{
        width: '100%',
        padding: 'clamp(40px, 8vw, 64px) clamp(16px, 4vw, 24px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: '#0a0a0a',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {/* Header Block */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 900,
                fontSize: '22px',
                letterSpacing: '0.08em',
                color: '#ffffff',
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
              }}
            >
              SPOT HISTORY
            </h2>
            <p style={{ fontSize: '13px', color: '#888888', margin: 0, fontFamily: FONT_BODY }}>
              The people who took the stage before you.
            </p>
          </div>

          {allHistory.length > 0 && (
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '100px',
                background: 'rgba(198,254,30,0.08)',
                border: '1px solid rgba(198,254,30,0.2)',
                fontSize: '11px',
                fontWeight: 800,
                color: '#C6FE1E',
                fontFamily: FONT_MONO,
                letterSpacing: '0.1em',
              }}
            >
              {takeoverCount} {takeoverCount === 1 ? 'TAKEOVER' : 'TAKEOVERS'}
            </div>
          )}
        </div>

        {/* Empty State */}
        {allHistory.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(198,254,30,0.1)',
                border: '1px solid rgba(198,254,30,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap style={{ width: 20, height: 20, color: '#C6FE1E', fill: '#C6FE1E' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: FONT_DISPLAY, margin: 0 }}>
              NO TAKEOVERS YET
            </h3>
            <p style={{ fontSize: '14px', color: '#888888', margin: 0, fontFamily: FONT_BODY }}>
              Be the first to take the stage.
            </p>
          </div>
        ) : (
          /* Vertical Takeover Timeline (Latest 10) */
          <div style={{ position: 'relative', paddingLeft: '8px' }}>
            {displayHistory.map(({ stage, isCurrent }, index) => {
              const name = stage.brand_name || stage.normalized_domain
              const initial = stage.fallback_initial || name[0]?.toUpperCase() || '?'
              const hasImgError = imgErrors[stage.id]
              const isLast = index === displayHistory.length - 1
              const timeStr = formatTimestamp(stage.started_at)
              const priceFormatted = formatPrice(stage.amount)

              return (
                <div key={stage.id} style={{ position: 'relative', display: 'flex', gap: '20px', paddingBottom: isLast ? '0' : '28px' }}>
                  {/* Vertical Connecting Line */}
                  {!isLast && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '11px',
                        top: '24px',
                        bottom: '0',
                        width: '2px',
                        background: 'linear-gradient(to bottom, rgba(198,254,30,0.4), rgba(255,255,255,0.06))',
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Glowing Node Icon */}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isCurrent ? '#C6FE1E' : '#1e1e1e',
                      border: isCurrent ? '2px solid #C6FE1E' : '2px solid rgba(255,255,255,0.15)',
                      boxShadow: isCurrent ? '0 0 16px rgba(198,254,30,0.5)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '4px',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isCurrent ? '#000000' : '#888888',
                      }}
                    />
                  </div>

                  {/* Content Card */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: 'clamp(12px, 3vw, 16px) clamp(14px, 3vw, 20px)',
                      borderRadius: '16px',
                      background: isCurrent ? 'rgba(198,254,30,0.04)' : 'rgba(255,255,255,0.02)',
                      border: isCurrent ? '1px solid rgba(198,254,30,0.3)' : '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      {/* Logo / Favicon */}
                      {stage.logo_url && !hasImgError ? (
                        <img
                          src={stage.logo_url}
                          alt={name}
                          onError={() => setImgErrors((prev) => ({ ...prev, [stage.id]: true }))}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            objectFit: 'contain',
                            background: '#141414',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '3px',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isCurrent ? 'rgba(198,254,30,0.15)' : 'rgba(255,255,255,0.06)',
                            border: isCurrent ? '1px solid rgba(198,254,30,0.3)' : '1px solid rgba(255,255,255,0.1)',
                            color: isCurrent ? '#C6FE1E' : '#888888',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 800,
                            fontFamily: FONT_DISPLAY,
                            flexShrink: 0,
                          }}
                        >
                          {initial}
                        </div>
                      )}

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <a
                          href={stage.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            try {
                              fetch('/api/stage/click', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ stageId: stage.id }),
                              })
                            } catch {}
                          }}
                          className="ts-history-domain"
                          style={{
                            fontSize: '15px',
                            fontWeight: 800,
                            fontFamily: FONT_DISPLAY,
                            color: '#ffffff',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {name}
                          <ExternalLink style={{ width: 12, height: 12, color: '#888888' }} />
                        </a>
                        <p style={{ fontSize: '12px', color: '#888888', margin: '4px 0 0 0', fontFamily: FONT_MONO, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span>{stage.original_duration_minutes} MIN</span>
                          <span style={{ color: '#555555' }}>•</span>
                          <span style={{ color: '#ffffff', fontWeight: 700 }}>{priceFormatted}</span>
                          <span style={{ color: '#555555' }}>•</span>
                          <span style={{ color: '#C6FE1E', fontWeight: 800, background: 'rgba(198,254,30,0.12)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(198,254,30,0.25)', fontSize: '11px' }}>
                            {stage.click_count || 0} CLICKS
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right side: Timestamp & Badge */}
                    <div className="ts-history-card-right" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      {timeStr && (
                        <span style={{ fontSize: '11px', color: '#888888', fontFamily: FONT_MONO }}>
                          {timeStr}
                        </span>
                      )}

                      {isCurrent ? (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 900,
                            fontFamily: FONT_DISPLAY,
                            letterSpacing: '0.12em',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#C6FE1E',
                            color: '#000000',
                            textTransform: 'uppercase',
                          }}
                        >
                          CURRENT
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            fontFamily: FONT_MONO,
                            letterSpacing: '0.08em',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#888888',
                            textTransform: 'uppercase',
                          }}
                        >
                          TAKEN OVER
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* View full archive link if history exceeds 10 items */}
            {allHistory.length > 10 && (
              <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <Link
                  href="/archive"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '100px',
                    background: 'rgba(198,254,30,0.08)',
                    border: '1px solid rgba(198,254,30,0.25)',
                    color: '#C6FE1E',
                    fontSize: '13px',
                    fontWeight: 800,
                    fontFamily: FONT_DISPLAY,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  View Full Stage Archive ({allHistory.length} Takeovers Recorded) →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

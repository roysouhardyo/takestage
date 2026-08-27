'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import type { Stage } from '@/types'

interface LiveCanvasProps {
  pastStages?: Stage[]
  onClaimStage: () => void
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : null
}

export function LiveCanvas({ pastStages = [], onClaimStage }: LiveCanvasProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  // Cap to controlled subset (Requirement 8: 15-24 on desktop, 6-10 on mobile)
  const displayStages = pastStages.slice(0, 16)

  // Outer placement coordinates that keep the center safe area 100% CLEAR
  const getOuterPos = (index: number) => {
    const quadrant = index % 4
    const subIdx = Math.floor(index / 4)

    let left = '50%'
    let top = '50%'

    if (quadrant === 0) {
      // Top-left
      left = `${4 + (subIdx * 14) % 32}%`
      top = `${6 + (subIdx * 12) % 22}%`
    } else if (quadrant === 1) {
      // Top-right
      left = `${58 + (subIdx * 14) % 32}%`
      top = `${6 + (subIdx * 12) % 22}%`
    } else if (quadrant === 2) {
      // Bottom-left
      left = `${4 + (subIdx * 14) % 32}%`
      top = `${68 + (subIdx * 12) % 22}%`
    } else {
      // Bottom-right
      left = `${58 + (subIdx * 14) % 32}%`
      top = `${68 + (subIdx * 12) % 22}%`
    }

    return { left, top }
  }

  const driftClasses = ['float-card-1', 'float-card-2', 'float-card-3', 'float-card-4']

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        overflow: 'hidden',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Subtle grid pattern background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          pointerEvents: 'none',
        }}
      />

      {/* Central subtle radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 640px)',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(198,254,30,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
        }}
      />

      {/* ── FLOATING WEBSITE CARDS LAYER ───────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {displayStages.map((stage, idx) => {
            const name = stage.brand_name || stage.normalized_domain
            const safeLink = sanitizeUrl(stage.website_url)
            const initial = stage.fallback_initial || name[0]?.toUpperCase() || '?'
            const pos = getOuterPos(idx)
            const driftClass = driftClasses[idx % 4]

            // Responsive duration-bounded card sizing (min 95px to max 140px cap)
            const cardWidth = Math.min(140, Math.max(95, 95 + Math.floor(stage.original_duration_minutes / 15)))
            const isTooltipOpen = activeTooltip === stage.id

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={driftClass}
                style={{
                  position: 'absolute',
                  left: pos.left,
                  top: pos.top,
                  pointerEvents: 'auto',
                  zIndex: isTooltipOpen ? 40 : 15,
                }}
              >
                <a
                  href={safeLink || '#'}
                  target={safeLink ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!safeLink) e.preventDefault()
                  }}
                  onMouseEnter={() => setActiveTooltip(stage.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: `${cardWidth}px`,
                    padding: '6px 10px',
                    borderRadius: '10px',
                    background: isTooltipOpen ? '#1a1a1a' : '#121212',
                    border: isTooltipOpen ? '1px solid #C6FE1E' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isTooltipOpen ? '0 0 20px rgba(198,254,30,0.2)' : '0 4px 16px rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    transform: isTooltipOpen ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {/* Logo Icon */}
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {stage.logo_url ? (
                      <img
                        src={stage.logo_url}
                        alt={name}
                        style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                        onError={(e) => {
                          ;(e.currentTarget as HTMLElement).style.display = 'none'
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerText = initial
                            e.currentTarget.parentElement.style.color = '#C6FE1E'
                            e.currentTarget.parentElement.style.fontSize = '11px'
                            e.currentTarget.parentElement.style.fontWeight = '800'
                            e.currentTarget.parentElement.style.fontFamily = FONT_DISPLAY
                          }
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#C6FE1E', fontFamily: FONT_DISPLAY }}>
                        {initial}
                      </span>
                    )}
                  </div>

                  {/* Compact Text */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#ffffff',
                        fontFamily: FONT_DISPLAY,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {name}
                    </p>
                  </div>
                </a>

                {/* Desktop Hover Tooltip */}
                {isTooltipOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 6px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#161616',
                      border: '1px solid rgba(198,254,30,0.3)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.85)',
                      pointerEvents: 'none',
                      zIndex: 50,
                    }}
                  >
                    <p style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: FONT_DISPLAY }}>
                      {name}
                    </p>
                    <p style={{ fontSize: '10px', color: '#C6FE1E', margin: '2px 0 0 0', fontFamily: FONT_MONO }}>
                      {stage.original_duration_minutes} MIN SPOT · VISIT →
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* ── SAFE CENTRAL AREA — OPEN STAGE ACTION ───────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '14px',
          padding: '28px 24px',
          borderRadius: '20px',
          background: 'rgba(10,10,10,0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          maxWidth: '420px',
          width: '92%',
          boxSizing: 'border-box',
          margin: 'auto',
        }}
      >
        <p
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 'clamp(16px, 4vw, 20px)',
            lineHeight: 1.1,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#ffffff',
            margin: 0,
          }}
        >
          THE SPOT IS OPEN
        </p>

        <button
          onClick={onClaimStage}
          id="canvas-claim-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            fontSize: '14px',
            fontWeight: 800,
            fontFamily: FONT_DISPLAY,
            color: '#000000',
            background: '#C6FE1E',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 0 0 1px rgba(198,254,30,0.4), 0 4px 24px rgba(198,254,30,0.25)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          }}
        >
          <Zap style={{ width: 15, height: 15, fill: '#000' }} />
          GET THE SPOT
        </button>

        <p style={{ fontSize: '11px', color: '#888888', fontFamily: FONT_MONO, margin: 0 }}>
          from $1 / min
        </p>
      </div>
    </div>
  )
}

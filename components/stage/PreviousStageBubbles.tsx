'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Stage } from '@/types'

interface PreviousStageBubblesProps {
  stages: Stage[]
  activeStageId?: string | null
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

/**
 * Returns dynamic bubble dimensions & typography scaling based on purchased spot duration.
 * Enforces a strict max size cap so long takeovers do not overpower the current stage.
 */
function getBubbleMetrics(durationMinutes: number) {
  const mins = durationMinutes || 5
  if (mins <= 15) {
    return {
      sizeDesktop: 104,
      sizeMobile: 82,
      iconSize: 22,
      domainFontSize: 11,
      durationFontSize: 10,
    }
  }
  if (mins <= 60) {
    return {
      sizeDesktop: 124,
      sizeMobile: 94,
      iconSize: 26,
      domainFontSize: 12,
      durationFontSize: 10.5,
    }
  }
  if (mins <= 120) {
    return {
      sizeDesktop: 144,
      sizeMobile: 106,
      iconSize: 28,
      domainFontSize: 13,
      durationFontSize: 11,
    }
  }
  // Max size cap for > 120 minutes
  return {
    sizeDesktop: 160,
    sizeMobile: 116,
    iconSize: 30,
    domainFontSize: 13.5,
    durationFontSize: 11,
  }
}

export function PreviousStageBubbles({ stages = [], activeStageId }: PreviousStageBubblesProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  // Exclude current active stage if present in array, limit to top 8 completed entries
  const displayStages = stages
    .filter((s) => s.id !== activeStageId)
    .slice(0, 8)

  if (displayStages.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 10,
        userSelect: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {displayStages.map((stage, idx) => {
          const domain = stage.normalized_domain || stage.brand_name || 'stage.com'
          const initial = stage.fallback_initial || domain[0]?.toUpperCase() || '?'
          const metrics = getBubbleMetrics(stage.original_duration_minutes)
          const posClass = `ts-bubble-pos-${idx + 1}`
          const floatClass = `float-bubble-${(idx % 4) + 1}`
          const hasImgError = imgErrors[stage.id]

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`ts-bubble ${posClass} ${floatClass}`}
              style={{
                position: 'absolute',
                pointerEvents: 'none', // Strictly non-clickable
                ['--bubble-size' as string]: `${metrics.sizeDesktop}px`,
                ['--bubble-size-mobile' as string]: `${metrics.sizeMobile}px`,
              }}
            >
              <div
                className="ts-bubble-inner"
                style={{
                  width: 'var(--bubble-size)',
                  height: 'var(--bubble-size)',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 35% 35%, rgba(20,24,18,0.92) 0%, rgba(10,10,10,0.96) 100%)',
                  border: '1px solid rgba(198,254,30,0.3)',
                  boxShadow:
                    '0 0 24px rgba(198,254,30,0.14), inset 0 0 16px rgba(198,254,30,0.06), 0 10px 32px rgba(0,0,0,0.85)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  transition: 'width 0.3s ease, height 0.3s ease',
                }}
              >
                {/* 1. Website / Logo Icon */}
                <div
                  style={{
                    width: `${metrics.iconSize}px`,
                    height: `${metrics.iconSize}px`,
                    borderRadius: '50%',
                    background: 'rgba(198,254,30,0.1)',
                    border: '1px solid rgba(198,254,30,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: '4px',
                    flexShrink: 0,
                  }}
                >
                  {stage.logo_url && !hasImgError ? (
                    <img
                      src={stage.logo_url}
                      alt={`${domain} icon`}
                      onError={() => setImgErrors((prev) => ({ ...prev, [stage.id]: true }))}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 900,
                        fontSize: `${Math.max(10, Math.round(metrics.iconSize * 0.45))}px`,
                        color: '#C6FE1E',
                        lineHeight: 1,
                      }}
                    >
                      {initial}
                    </span>
                  )}
                </div>

                {/* 2. Domain Name */}
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 800,
                    fontSize: `${metrics.domainFontSize}px`,
                    color: '#ffffff',
                    lineHeight: 1.15,
                    maxWidth: '86%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {domain}
                </span>

                {/* 3. Purchased Duration */}
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontWeight: 700,
                    fontSize: `${metrics.durationFontSize}px`,
                    color: '#C6FE1E',
                    marginTop: '2px',
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {stage.original_duration_minutes} min
                </span>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

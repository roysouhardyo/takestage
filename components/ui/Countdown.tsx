'use client'

import { useState, useEffect, useRef } from 'react'

interface CountdownProps {
  expiresAt: string // ISO timestamp
  onExpire?: () => void
  className?: string
  large?: boolean
  hero?: boolean
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

function parseTimeLeft(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

function getTimerSegments(totalSeconds: number): string[] {
  if (totalSeconds <= 0) return ['00', ':', '00']

  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  const mStr = String(m).padStart(2, '0')
  const sStr = String(s).padStart(2, '0')

  if (h > 0) {
    const hStr = String(h).padStart(2, '0')
    return [hStr, ':', mStr, ':', sStr]
  }

  return [mStr, ':', sStr]
}

function formatSimpleTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  if (totalSeconds < 60) return `0:${String(totalSeconds).padStart(2, '0')}`
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  return `${m}m`
}

export function Countdown({ expiresAt, onExpire, large = false, hero = false }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => parseTimeLeft(expiresAt))
  const expiredRef = useRef(false)

  useEffect(() => {
    expiredRef.current = false

    const interval = setInterval(() => {
      const remaining = parseTimeLeft(expiresAt)
      setTimeLeft(remaining)

      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpire?.()
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  const isUnderMinute = timeLeft > 0 && timeLeft < 60
  const isUnderTwoMin = timeLeft > 0 && timeLeft < 120
  const isExpired = timeLeft === 0

  const urgency = isExpired
    ? 'expired'
    : isUnderMinute
    ? 'danger'
    : isUnderTwoMin
    ? 'warning'
    : 'normal'

  const timerColor =
    urgency === 'danger'
      ? '#ef4444'
      : urgency === 'warning'
      ? '#f59e0b'
      : urgency === 'expired'
      ? '#666666'
      : '#ffffff'

  // Segments for hero/large mode to ensure perfect colon spacing & digit alignment
  const segments = isExpired ? ['00', ':', '00'] : getTimerSegments(timeLeft)

  if (hero || large) {
    return (
      <div
        aria-live="polite"
        aria-label={`Time remaining: ${segments.join('')}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: hero ? '6px' : '4px',
          fontFamily: FONT_DISPLAY,
          fontWeight: 900,
          fontVariantNumeric: 'tabular-nums',
          color: timerColor,
          fontSize: hero ? 'clamp(52px, 11vw, 108px)' : 'clamp(36px, 8vw, 72px)',
          lineHeight: 1,
          letterSpacing: '0.02em',
          filter: hero ? 'drop-shadow(0 0 35px rgba(198,254,30,0.25))' : 'none',
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
      >
        {segments.map((seg, i) =>
          seg === ':' ? (
            <span
              key={`colon-${i}`}
              style={{
                display: 'inline-block',
                color: urgency === 'expired' ? '#666666' : '#C6FE1E',
                opacity: 0.85,
                padding: '0 4px',
                transform: 'translateY(-2px)',
              }}
            >
              :
            </span>
          ) : (
            <span
              key={`seg-${i}`}
              style={{
                display: 'inline-block',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.02em',
              }}
            >
              {seg}
            </span>
          )
        )}
      </div>
    )
  }

  return (
    <span
      aria-live="polite"
      aria-label={`Time remaining: ${formatSimpleTime(timeLeft)}`}
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        color: timerColor,
        fontSize: '14px',
      }}
    >
      {formatSimpleTime(timeLeft)}
    </span>
  )
}

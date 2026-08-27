'use client'

import { useState, useEffect, useRef } from 'react'
import { clsx } from 'clsx'

interface CountdownProps {
  expiresAt: string // ISO timestamp
  onExpire?: () => void
  className?: string
  large?: boolean
}

function parseTimeLeft(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

/**
 * Format per spec:
 * - Normally: no seconds — show "4h 32m" or "47m" or "<1m"
 * - Under 60 seconds: show seconds for urgency e.g. "0:42"
 */
function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0:00'

  // Under 60 seconds: show raw seconds
  if (totalSeconds < 60) {
    return `0:${String(totalSeconds).padStart(2, '0')}`
  }

  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)

  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  return `${m}m`
}

export function Countdown({ expiresAt, onExpire, className, large = false }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => parseTimeLeft(expiresAt))
  const expiredRef = useRef(false)

  useEffect(() => {
    expiredRef.current = false

    const interval = setInterval(() => {
      // Always recalculate from the authoritative expires_at timestamp
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

  // Urgency thresholds
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

  const colorClass = clsx({
    'countdown-normal':  urgency === 'normal',
    'countdown-warning': urgency === 'warning',
    'countdown-danger':  urgency === 'danger',
    'text-gray-600':     urgency === 'expired',
  })

  const baseClass = large
    ? 'font-display font-extrabold tabular-nums tracking-tighter'
    : 'font-mono font-semibold tabular-nums'

  const sizeClass = large
    ? 'text-6xl sm:text-7xl md:text-8xl'
    : 'text-xl'

  return (
    <span
      className={clsx(baseClass, sizeClass, colorClass, className)}
      aria-live="polite"
      aria-label={`Time remaining: ${formatTime(timeLeft)}`}
      style={{ letterSpacing: large ? '-0.04em' : undefined }}
    >
      {isExpired ? 'Expired' : formatTime(timeLeft)}
    </span>
  )
}

'use client'

import React from 'react'
import type { StageStatus } from '@/types'

interface BadgeProps {
  label?: string
  variant?: 'live' | 'ended' | 'taken_over' | 'pending' | 'default'
  className?: string
  style?: React.CSSProperties
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"

const variantInlineStyles: Record<NonNullable<BadgeProps['variant']>, React.CSSProperties> = {
  live: {
    background: 'rgba(34, 197, 94, 0.12)',
    color: '#4ade80',
    border: '1px solid rgba(34, 197, 94, 0.35)',
  },
  ended: {
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#999999',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  taken_over: {
    background: 'rgba(198, 254, 30, 0.12)',
    color: '#C6FE1E',
    border: '1px solid rgba(198, 254, 30, 0.35)',
  },
  pending: {
    background: 'rgba(245, 158, 11, 0.12)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.35)',
  },
  default: {
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#999999',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
}

export function statusToVariant(status: StageStatus): BadgeProps['variant'] {
  switch (status) {
    case 'active':     return 'live'
    case 'completed':  return 'ended'
    case 'taken_over': return 'taken_over'
    case 'pending':    return 'pending'
    case 'cancelled':  return 'default'
    default:           return 'default'
  }
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const isLive = variant === 'live'
  const activeStyle = variantInlineStyles[variant] || variantInlineStyles.default

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 9px',
        borderRadius: '6px',
        fontSize: '10px',
        fontWeight: 800,
        fontFamily: FONT_DISPLAY,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        lineHeight: 1,
        boxSizing: 'border-box',
        ...activeStyle,
        ...style,
      }}
    >
      {isLive && (
        <span style={{ position: 'relative', width: 6, height: 6, display: 'inline-block' }}>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: '#4ade80',
              opacity: 0.75,
              animation: 'ping 1.5s ease-in-out infinite',
            }}
          />
          <span
            style={{
              position: 'relative',
              display: 'block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#4ade80',
            }}
          />
        </span>
      )}
      {label ?? variant.replace('_', ' ')}
    </span>
  )
}

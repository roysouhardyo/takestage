'use client'

import { useState } from 'react'
import { ExternalLink, Clock } from 'lucide-react'
import type { Stage } from '@/types'
import { Badge, statusToVariant } from '@/components/ui/Badge'
import { formatDuration, formatPrice } from '@/lib/pricing/tiers'

interface ArchiveItemProps {
  stage: Stage
  rank?: number
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export function ArchiveItem({ stage, rank }: ArchiveItemProps) {
  const [imgError, setImgError] = useState(false)
  const displayName = stage.brand_name || stage.normalized_domain
  const initial = stage.fallback_initial || displayName[0]?.toUpperCase() || '?'
  const priceFormatted = formatPrice(stage.amount)

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        borderRadius: '16px',
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.15s ease',
        boxSizing: 'border-box',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(198,254,30,0.3)'
        ;(e.currentTarget as HTMLElement).style.background = '#141414'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
        ;(e.currentTarget as HTMLElement).style.background = '#111111'
      }}
    >
      {/* Rank */}
      {rank !== undefined && (
        <span
          style={{
            width: '20px',
            fontSize: '12px',
            fontFamily: FONT_MONO,
            color: '#666666',
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {rank}
        </span>
      )}

      {/* Logo / Initial Icon */}
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: '#161616',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {stage.logo_url && !imgError ? (
          <img
            src={stage.logo_url}
            alt={displayName}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
          />
        ) : (
          <span style={{ color: '#C6FE1E', fontSize: '16px', fontWeight: 800, fontFamily: FONT_DISPLAY }}>
            {initial}
          </span>
        )}
      </div>

      {/* Main Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, marginBottom: '4px', flexWrap: 'nowrap' }}>
          <span
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: FONT_DISPLAY,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {displayName}
          </span>
          <Badge
            variant={statusToVariant(stage.status)}
            label={stage.status === 'taken_over' ? 'RUSHED' : stage.status}
          />
        </div>

        {stage.message && (
          <p
            style={{
              fontSize: '12px',
              color: '#888888',
              margin: 0,
              fontFamily: FONT_BODY,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {stage.message}
          </p>
        )}
      </div>

      {/* Right Stats */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px',
          flexShrink: 0,
          textAlign: 'right',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#dddddd', fontFamily: FONT_MONO }}>
          <Clock style={{ width: 12, height: 12, color: '#C6FE1E' }} />
          <span>{formatDuration(stage.duration_minutes)}</span>
          <span style={{ color: '#666666' }}>•</span>
          <span style={{ color: '#C6FE1E', fontWeight: 700 }}>{priceFormatted}</span>
          <span style={{ color: '#666666' }}>•</span>
          <span style={{ color: '#C6FE1E', fontWeight: 800 }}>{stage.click_count || 0} clicks</span>
        </div>

        <span style={{ fontSize: '11px', color: '#666666', fontFamily: FONT_MONO }}>
          {stage.started_at ? formatDate(stage.started_at) : '—'}
        </span>
      </div>

      {/* Visit link */}
      <a
        href={stage.website_url}
        target="_blank"
        rel="noopener noreferrer"
        id={`archive-visit-${stage.id}`}
        onClick={() => {
          try {
            fetch('/api/stage/click', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stageId: stage.id }),
            })
          } catch {}
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          color: '#888888',
          textDecoration: 'none',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.color = '#ffffff'
          ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.color = '#888888'
          ;(e.currentTarget as HTMLElement).style.background = 'transparent'
        }}
        aria-label={`Visit ${displayName}`}
      >
        <ExternalLink style={{ width: 14, height: 14 }} />
      </a>
    </div>
  )
}

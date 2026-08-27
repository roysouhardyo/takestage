import { ExternalLink, Clock } from 'lucide-react'
import type { Stage } from '@/types'
import { Badge, statusToVariant } from '@/components/ui/Badge'
import { formatDuration } from '@/lib/pricing/tiers'

interface ArchiveItemProps {
  stage: Stage
  rank?: number
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

export function ArchiveItem({ stage, rank }: ArchiveItemProps) {
  const displayName = stage.brand_name || stage.normalized_domain
  const initial = stage.fallback_initial || displayName[0]?.toUpperCase() || '?'

  return (
    <div
      className="relative flex items-center gap-4 px-5 py-4 rounded-xl group transition-all duration-150"
      style={{ background: '#111', border: '1px solid #1a1a1a' }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = '#1a1a1a'
      }}
    >
      {/* Rank */}
      {rank !== undefined && (
        <span className="w-5 text-xxs font-mono text-stage-muted text-right shrink-0">
          {rank}
        </span>
      )}

      {/* Logo / Initial */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-display shrink-0 overflow-hidden"
        style={{ background: '#1a1a1a', border: '1px solid #222' }}
      >
        {stage.logo_url ? (
          <img
            src={stage.logo_url}
            alt={displayName}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <span style={{ color: '#C6FE1E' }}>{initial}</span>
        )}
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-white font-display truncate">
            {displayName}
          </span>
          <Badge
            variant={statusToVariant(stage.status)}
            label={stage.status === 'taken_over' ? 'rushed' : stage.status}
          />
        </div>
        {stage.message && (
          <p className="text-xs text-gray-600 truncate">{stage.message}</p>
        )}
      </div>

      {/* Stats */}
      <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0 text-right">
        <div className="flex items-center gap-1 text-xs text-stage-muted">
          <Clock className="w-3 h-3" />
          {formatDuration(stage.duration_minutes)}
        </div>
        <span className="text-xxs text-stage-muted font-mono">
          {stage.started_at ? formatDate(stage.started_at) : '—'}
        </span>
      </div>

      {/* Visit link */}
      <a
        href={stage.website_url}
        target="_blank"
        rel="noopener noreferrer"
        id={`archive-visit-${stage.id}`}
        className="shrink-0 p-2 rounded-lg text-stage-muted hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
        aria-label={`Visit ${displayName}`}
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  )
}

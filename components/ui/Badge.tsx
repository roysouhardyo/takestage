import { clsx } from 'clsx'
import type { StageStatus } from '@/types'

interface BadgeProps {
  label?: string
  variant?: 'live' | 'ended' | 'taken_over' | 'pending' | 'default'
  className?: string
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  live:       'bg-live-green/15 text-live-green border border-live-green/30',
  ended:      'bg-white/5 text-gray-400 border border-white/10',
  taken_over: 'bg-stage-lime/10 text-stage-lime border border-stage-lime/25',
  pending:    'bg-warning-amber/10 text-warning-amber border border-warning-amber/20',
  default:    'bg-white/5 text-gray-400 border border-white/10',
}

/**
 * Maps a stage status to a badge variant.
 */
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

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  const isLive = variant === 'live'

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xxs font-semibold uppercase tracking-widest',
        variantStyles[variant],
        className,
      )}
    >
      {isLive && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-green opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-live-green" />
        </span>
      )}
      {label ?? variant.replace('_', ' ')}
    </span>
  )
}

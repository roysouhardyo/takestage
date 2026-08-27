import { Clock, TrendingUp, Globe, Zap } from 'lucide-react'
import { formatDuration, formatPrice } from '@/lib/pricing/tiers'

interface StatsGridProps {
  stats: {
    total_stages: number
    total_minutes: number
    total_revenue_cents: number
    unique_domains: number
  }
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div
      style={{
        padding: '28px',
        borderRadius: '16px',
        background: '#111111',
        border: '1px solid #222222',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'rgba(198,254,30,0.08)',
          border: '1px solid rgba(198,254,30,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#C6FE1E',
          marginBottom: '20px',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: '32px',
            lineHeight: 1.1,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            margin: '0 0 6px 0',
          }}
        >
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: '12px', color: '#888888', fontFamily: FONT_MONO, margin: '0 0 6px 0' }}>
            {sub}
          </p>
        )}
        <p
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#C6FE1E',
            fontFamily: FONT_DISPLAY,
            margin: 0,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  )
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <StatCard
        icon={<Zap style={{ width: 20, height: 20 }} />}
        label="Total Stages"
        value={stats.total_stages.toLocaleString()}
      />
      <StatCard
        icon={<Clock style={{ width: 20, height: 20 }} />}
        label="Time Purchased"
        value={formatDuration(stats.total_minutes)}
        sub={`${stats.total_minutes.toLocaleString()} mins`}
      />
      <StatCard
        icon={<TrendingUp style={{ width: 20, height: 20 }} />}
        label="Total Revenue"
        value={formatPrice(stats.total_revenue_cents)}
      />
      <StatCard
        icon={<Globe style={{ width: 20, height: 20 }} />}
        label="Unique Sites"
        value={stats.unique_domains.toLocaleString()}
      />
    </div>
  )
}

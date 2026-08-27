'use client'

import { useRealtime } from '@/context/RealtimeContext'

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

export function ActivityFeed() {
  const { activityEvents, watcherCount, activeStage } = useRealtime()

  // Display top 4 recent events
  const events = activityEvents.slice(0, 4)

  return (
    <div
      style={{
        width: '100%',
        background: '#080808',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          fontSize: '12px',
          color: '#aaaaaa',
          fontFamily: FONT_DISPLAY,
        }}
      >
        {/* Watcher status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
          <span style={{ color: '#ffffff', fontWeight: 700 }}>
            {Math.max(1, watcherCount)} {watcherCount === 1 ? 'person is' : 'people are'} watching live
          </span>
        </div>

        {/* Active stage item */}
        {activeStage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#C6FE1E' }}>●</span>
            <span>
              <strong style={{ color: '#ffffff' }}>{activeStage.brand_name || activeStage.normalized_domain}</strong> on stage ({activeStage.original_duration_minutes}m)
            </span>
          </div>
        )}

        {/* Real activity events */}
        {events.map((evt) => {
          const domain = (evt.metadata?.domain as string) || 'Spot'
          const dur = (evt.metadata?.duration_minutes as number) || 0

          let label = ''
          if (evt.event_type === 'stage_takeover') {
            label = `${domain} Rushed the Spot · ${dur}m`
          } else if (evt.event_type === 'stage_started') {
            label = `${domain} took the Spot · ${dur}m`
          } else if (evt.event_type === 'stage_completed') {
            label = `${domain} completed duration`
          }

          if (!label) return null

          return (
            <div key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#C6FE1E' }}>●</span>
              <span style={{ color: '#888888', fontFamily: FONT_MONO }}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

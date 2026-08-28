'use client'

import type { Stage } from '@/types'
import { ArchiveItem } from '@/components/archive/ArchiveItem'

interface ArchiveListProps {
  stages: Stage[]
  total: number
  loading?: boolean
}

export function ArchiveList({ stages, total, loading }: ArchiveListProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
        <span style={{ color: '#C6FE1E', fontSize: '14px', fontFamily: "'Fira Code', monospace" }}>Loading archive...</span>
      </div>
    )
  }

  if (stages.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '64px 24px',
          background: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <p style={{ fontSize: '40px', margin: '0 0 16px 0' }}>📜</p>
        <p
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 8px 0',
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          No past stages yet
        </p>
        <p style={{ fontSize: '14px', color: '#888888', margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
          Be the first to take the stage!
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', color: '#666666', fontFamily: "'Fira Code', monospace", margin: 0 }}>
          {total} stage{total !== 1 ? 's' : ''} recorded
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {stages.map((stage, i) => (
          <ArchiveItem key={stage.id} stage={stage} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}

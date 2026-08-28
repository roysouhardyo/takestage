'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import type { Stage } from '@/types'

interface LiveCanvasProps {
  pastStages?: Stage[]
  onClaimStage: () => void
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

export function LiveCanvas({ onClaimStage }: LiveCanvasProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        zIndex: 20,
        width: 'min(100%, 520px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        margin: '0 auto',
        padding: '0 16px',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Open Stage Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '100px',
          background: 'rgba(198,254,30,0.12)',
          border: '1px solid rgba(198,254,30,0.3)',
          fontSize: '11px',
          fontWeight: 800,
          fontFamily: FONT_DISPLAY,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#C6FE1E',
          marginBottom: '16px',
        }}
      >
        <span style={{ position: 'relative', width: 6, height: 6, display: 'inline-block' }}>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: '#C6FE1E',
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
              background: '#C6FE1E',
            }}
          />
        </span>
        <span>THE SPOT IS OPEN</span>
      </div>

      {/* 2. TakeStage Brand Logo */}
      <img
        src="/logo.png"
        alt="TakeStage Logo"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          objectFit: 'cover',
          border: '1px solid rgba(198,254,30,0.35)',
          boxShadow: '0 0 30px rgba(198,254,30,0.35)',
          marginBottom: '16px',
        }}
      />

      {/* 3. Headline & Description */}
      <h1
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 900,
          fontSize: 'clamp(28px, 5.5vw, 44px)',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          color: '#ffffff',
          margin: '0 0 10px 0',
        }}
      >
        No Active Spotlight
      </h1>

      <p
        style={{
          fontSize: '14px',
          lineHeight: 1.5,
          color: '#aaaaaa',
          maxWidth: '380px',
          margin: '0 0 24px 0',
          fontFamily: FONT_BODY,
        }}
      >
        Be the first to claim the stage, set your duration, and broadcast your website live.
      </p>

      {/* 4. Primary CTA */}
      <button
        onClick={onClaimStage}
        id="canvas-claim-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          width: 'min(100%, 360px)',
          padding: 'clamp(14px, 3.5vw, 16px) clamp(20px, 5vw, 32px)',
          fontSize: 'clamp(15px, 3.5vw, 18px)',
          fontWeight: 900,
          fontFamily: FONT_DISPLAY,
          color: '#000000',
          background: '#C6FE1E',
          border: 'none',
          borderRadius: '14px',
          cursor: 'pointer',
          boxShadow: '0 0 35px rgba(198,254,30,0.35)',
          transition: 'transform 0.15s ease, background-color 0.15s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
        }}
      >
        <Zap style={{ width: 20, height: 20, fill: '#000', color: '#000' }} />
        GET THE SPOT
      </button>

      <p style={{ fontSize: '11px', color: '#666666', fontFamily: FONT_MONO, margin: '14px 0 0 0' }}>
        from $1 / min · instant activation
      </p>
    </motion.div>
  )
}

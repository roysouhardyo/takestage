'use client'

import { useState } from 'react'
import { ExternalLink, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Stage } from '@/types'
import { Countdown } from '@/components/ui/Countdown'

interface StageCardProps {
  stage: Stage
  onTakeover?: () => void
  onExpire?: () => void
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

export function StageCard({ stage, onTakeover, onExpire }: StageCardProps) {
  const [imgError, setImgError] = useState(false)

  const domainDisplay = stage.normalized_domain || stage.brand_name || stage.website_url || 'Unknown'
  const initial = stage.fallback_initial || domainDisplay[0]?.toUpperCase() || '?'
  const requiredTakeoverMins = stage.original_duration_minutes + 1

  const handleDomainClick = () => {
    try {
      fetch('/api/stage/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: stage.id }),
      })
    } catch {
      // ignore
    }
  }

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'calc(100vh - 108px)',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 48px) 16px clamp(32px, 6vw, 56px)',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid pattern background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          pointerEvents: 'none',
        }}
      />

      {/* Central subtle radial green glow */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 750px)',
          height: '450px',
          background: 'radial-gradient(ellipse, rgba(198,254,30,0.13) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: 'min(100%, 760px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          margin: '0 auto',
        }}
      >
        {/* 1. Small LIVE indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '100px',
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.3)',
            fontSize: '11px',
            fontWeight: 800,
            fontFamily: FONT_DISPLAY,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#4ade80',
            marginBottom: '20px',
          }}
        >
          <span style={{ position: 'relative', width: 6, height: 6, display: 'inline-block' }}>
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: '#22c55e',
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
                background: '#22c55e',
              }}
            />
          </span>
          <span>LIVE NOW ON STAGE</span>
        </div>

        {/* 2. Primary Brand Identity: Favicon + Clickable Domain Name */}
        <a
          href={stage.website_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDomainClick}
          id="stage-visit-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            textDecoration: 'none',
            marginBottom: '8px',
            flexWrap: 'wrap',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
          }}
        >
          {stage.logo_url && !imgError ? (
            <img
              src={stage.logo_url}
              alt={`${domainDisplay} icon`}
              onError={() => setImgError(true)}
              style={{
                width: 'clamp(36px, 6vw, 44px)',
                height: 'clamp(36px, 6vw, 44px)',
                borderRadius: '12px',
                objectFit: 'contain',
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '4px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 'clamp(36px, 6vw, 44px)',
                height: 'clamp(36px, 6vw, 44px)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(16px, 4vw, 20px)',
                fontWeight: 900,
                fontFamily: FONT_DISPLAY,
                background: 'rgba(198,254,30,0.12)',
                border: '1px solid rgba(198,254,30,0.3)',
                color: '#C6FE1E',
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
          )}

          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: 'clamp(26px, 6vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              margin: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              wordBreak: 'break-all',
            }}
          >
            {domainDisplay}
            <ExternalLink style={{ width: 18, height: 18, color: '#888888', strokeWidth: 2.5, flexShrink: 0 }} />
          </h1>
        </a>

        {/* 3. CURRENTLY ON STAGE */}
        <p
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#888888',
            fontFamily: FONT_MONO,
            margin: '0 0 20px 0',
          }}
        >
          CURRENTLY ON STAGE
        </p>

        {/* Short Optional Message */}
        {stage.message && (
          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.5,
              color: '#cccccc',
              maxWidth: '540px',
              margin: '0 0 20px 0',
              fontFamily: FONT_BODY,
            }}
          >
            &ldquo;{stage.message}&rdquo;
          </p>
        )}

        {/* 4. Current countdown — DOMINANT VISUAL ELEMENT */}
        {stage.expires_at && (
          <div style={{ margin: '12px 0 20px' }}>
            <Countdown expiresAt={stage.expires_at} onExpire={onExpire} hero />
          </div>
        )}

        {/* 5. Current purchased duration */}
        <p
          style={{
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#aaaaaa',
            fontFamily: FONT_MONO,
            margin: '0 0 6px 0',
          }}
        >
          CURRENT SPOT · {stage.original_duration_minutes} MIN
        </p>

        {/* 6. Clear takeover requirement */}
        <p
          style={{
            fontSize: '15px',
            color: '#dddddd',
            margin: '0 0 28px 0',
            fontFamily: FONT_BODY,
          }}
        >
          Buy <strong style={{ color: '#C6FE1E', fontWeight: 800 }}>{requiredTakeoverMins}+ minutes</strong> to take over.
        </p>

        {/* 7. Primary RUSH THE SPOT CTA */}
        <button
          onClick={onTakeover}
          id="stage-takeover-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: 'min(100%, 400px)',
            padding: 'clamp(13px, 3vw, 16px) clamp(20px, 5vw, 32px)',
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
          RUSH THE SPOT
        </button>
      </motion.div>
    </section>
  )
}

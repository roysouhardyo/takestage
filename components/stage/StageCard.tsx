'use client'

import { useState } from 'react'
import { ExternalLink, Zap, Clock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Stage } from '@/types'
import { Countdown } from '@/components/ui/Countdown'
import { formatDuration, formatPrice } from '@/lib/pricing/tiers'

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

  const displayName = stage.brand_name || stage.normalized_domain
  const initial = stage.fallback_initial || displayName[0]?.toUpperCase() || '?'
  const requiredTakeoverMins = stage.original_duration_minutes + 1

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100dvh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '80px 16px 60px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(198,254,30,0.09) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
        }}
      />

      {/* ── 1. SPOTLIGHT MAIN HERO (Requirement 9 & 10) ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: 'min(90vw, 900px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          margin: '0 auto',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          {stage.logo_url && !imgError ? (
            <img
              src={stage.logo_url}
              alt={`${displayName} logo`}
              onError={() => setImgError(true)}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                objectFit: 'contain',
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '8px',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 800,
                fontFamily: FONT_DISPLAY,
                background: 'rgba(198,254,30,0.1)',
                border: '1px solid rgba(198,254,30,0.25)',
                color: '#C6FE1E',
              }}
            >
              {initial}
            </div>
          )}
        </div>

        {/* Brand Name */}
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 'clamp(36px, 7vw, 68px)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            margin: '0 0 12px 0',
          }}
        >
          {displayName}
        </h1>

        {/* Short Message */}
        {stage.message && (
          <p
            style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: '#cccccc',
              maxWidth: '560px',
              margin: '0 0 16px 0',
              fontFamily: FONT_BODY,
            }}
          >
            {stage.message}
          </p>
        )}

        {/* Domain tag & Visit button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <span
            style={{
              fontSize: '13px',
              color: '#888888',
              fontFamily: FONT_MONO,
            }}
          >
            {stage.normalized_domain}
          </span>
          <a
            href={stage.website_url}
            target="_blank"
            rel="noopener noreferrer"
            id="stage-visit-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#C6FE1E',
              textDecoration: 'none',
              fontFamily: FONT_DISPLAY,
            }}
          >
            VISIT <ExternalLink style={{ width: 14, height: 14 }} />
          </a>
        </div>

        {/* Countdown */}
        {stage.expires_at && (
          <div style={{ marginBottom: '24px' }}>
            <Countdown
              expiresAt={stage.expires_at}
              onExpire={onExpire}
              large
            />
          </div>
        )}
      </motion.div>

      {/* ── 2. TAKEOVER PANEL (Requirement 12 & 13) ────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: 'min(90vw, 720px)',
          padding: '24px 28px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxSizing: 'border-box',
          margin: '32px auto 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px', textAlign: 'left' }}>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#C6FE1E',
                marginBottom: '6px',
                fontFamily: FONT_DISPLAY,
              }}
            >
              CURRENT SPOT · {formatDuration(stage.original_duration_minutes)} ORIGINAL
            </p>
            <p style={{ fontSize: '14px', color: '#dddddd', margin: 0, fontFamily: FONT_BODY }}>
              Want the Spot now? Buy a longer FULL duration.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <button
              onClick={onTakeover}
              id="stage-takeover-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 800,
                fontFamily: FONT_DISPLAY,
                color: '#000000',
                background: '#C6FE1E',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 0 0 1px rgba(198,254,30,0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              <Zap style={{ width: 16, height: 16, fill: '#000' }} />
              ⚡ RUSH THE SPOT
            </button>
            <span style={{ fontSize: '11px', color: '#888888', fontFamily: FONT_MONO }}>
              {formatDuration(requiredTakeoverMins)}+ required
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Archive, ArrowRight } from 'lucide-react'
import { StageCard } from '@/components/stage/StageCard'
import { LiveCanvas } from '@/components/canvas/LiveCanvas'
import { PreviousStageBubbles } from '@/components/stage/PreviousStageBubbles'
import { AmbientParticles } from '@/components/stage/AmbientParticles'
import { TakeoverBanner } from '@/components/stage/TakeoverBanner'
import { CheckoutModal } from '@/components/checkout/CheckoutModal'
import { useRealtime } from '@/context/RealtimeContext'

interface StageCanvasProps {
  onOpenCheckout?: () => void
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"

export function StageCanvas({ onOpenCheckout }: StageCanvasProps) {
  const {
    activeStage,
    pastStages,
    isTransitioning,
    lastTakeoverOwner,
    refreshStage,
  } = useRealtime()

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [takeoverBannerDismissed, setTakeoverBannerDismissed] = useState(false)

  const handleExpire = useCallback(() => {
    refreshStage()
  }, [refreshStage])

  const openCheckout = () => {
    if (onOpenCheckout) {
      onOpenCheckout()
    } else {
      setCheckoutOpen(true)
    }
  }

  const showTakeoverBanner = isTransitioning && !takeoverBannerDismissed

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 92px)',
        minHeight: '560px',
        maxHeight: '820px',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        padding: '16px',
      }}
    >
      {/* 1. Subtle technical grid pattern background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* 2. Central subtle radial green glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 750px)',
          height: '450px',
          background: 'radial-gradient(ellipse, rgba(198,254,30,0.11) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(60px)',
          zIndex: 1,
        }}
      />

      {/* 3. Ambient Glowing Lime Particles */}
      <AmbientParticles />

      {/* 4. Takeover Banner Alert */}
      <TakeoverBanner
        visible={showTakeoverBanner}
        newOwner={lastTakeoverOwner}
        onDismiss={() => setTakeoverBannerDismissed(true)}
      />

      {/* 5. PREVIOUS STAGES FLOATING CIRCULAR BUBBLES SYSTEM (Orbiting surrounding layer) */}
      <PreviousStageBubbles stages={pastStages} activeStageId={activeStage?.id} />

      {/* 6. PROTECTED EXCLUSION ZONE — Central Hero Spotlight */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: 'translateY(-30px)',
        }}
      >
        <AnimatePresence mode="wait">
          {activeStage && activeStage.status === 'active' && activeStage.expires_at && !isTransitioning ? (
            <motion.div
              key={`stage-${activeStage.id}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%' }}
            >
              <StageCard
                stage={activeStage}
                onTakeover={openCheckout}
                onExpire={handleExpire}
              />
            </motion.div>
          ) : (
            <motion.div
              key="open-canvas"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              style={{ width: '100%' }}
            >
              <LiveCanvas
                pastStages={pastStages}
                onClaimStage={openCheckout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 7. Bottom-Corner Stage Archive Notice */}
      <div
        className="hidden md:flex"
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 25,
        }}
      >
        <Link
          href="/archive"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '100px',
            background: 'rgba(15,15,15,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#aaaaaa',
            fontSize: '12px',
            fontFamily: FONT_BODY,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(198,254,30,0.3)'
            ;(e.currentTarget as HTMLElement).style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
            ;(e.currentTarget as HTMLElement).style.color = '#aaaaaa'
          }}
        >
          <Archive style={{ width: 14, height: 14, color: '#C6FE1E' }} />
          <span>Full Stage Archive</span>
          <ArrowRight style={{ width: 12, height: 12, color: '#C6FE1E' }} />
        </Link>
      </div>

      {/* Local checkout modal fallback */}
      {!onOpenCheckout && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          currentStage={activeStage}
        />
      )}
    </section>
  )
}

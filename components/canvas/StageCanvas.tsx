'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { StageCard } from '@/components/stage/StageCard'
import { LiveCanvas } from '@/components/canvas/LiveCanvas'
import { TakeoverBanner } from '@/components/stage/TakeoverBanner'
import { CheckoutModal } from '@/components/checkout/CheckoutModal'
import { useRealtime } from '@/context/RealtimeContext'

interface StageCanvasProps {
  onOpenCheckout?: () => void
}

/**
 * PHASE 20 — Stage Canvas.
 * Consumes state from single centralized RealtimeProvider context.
 * Renders instant takeover animation, spotlight card, and open canvas.
 */
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
    <section className="relative w-full">
      {/* Takeover Banner */}
      <TakeoverBanner
        visible={showTakeoverBanner}
        newOwner={lastTakeoverOwner}
        onDismiss={() => setTakeoverBannerDismissed(true)}
      />

      <AnimatePresence mode="wait">
        {activeStage && activeStage.status === 'active' && activeStage.expires_at && !isTransitioning ? (
          <motion.div
            key={`stage-${activeStage.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <LiveCanvas
              pastStages={pastStages}
              onClaimStage={openCheckout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local checkout modal (fallback if no parent handler) */}
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

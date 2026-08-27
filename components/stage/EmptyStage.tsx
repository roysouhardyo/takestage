'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EmptyStageProps {
  onClaim?: () => void
}

export function EmptyStage({ onClaim }: EmptyStageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #161616 0%, #0f0f0f 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Dashed border effect */}
        <div
          className="absolute inset-3 rounded-xl pointer-events-none"
          style={{
            border: '1px dashed rgba(255,255,255,0.07)',
          }}
        />

        <div className="relative z-10 py-20 px-8 text-center">
          {/* Stage icon */}
          <div className="flex items-center justify-center mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(198,254,30,0.06)',
                border: '1px solid rgba(198,254,30,0.12)',
              }}
            >
              <span className="text-4xl">🎭</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight mb-3">
            The Stage is Empty
          </h2>

          <p className="text-gray-500 text-base mb-8 max-w-sm mx-auto leading-relaxed">
            No one is on stage right now.
            <br />
            Be the first to claim it.
          </p>

          <Button
            variant="primary"
            size="xl"
            onClick={onClaim}
            className="inline-flex mx-auto"
            id="empty-stage-claim-btn"
          >
            <Zap className="w-5 h-5" />
            Take the Stage
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

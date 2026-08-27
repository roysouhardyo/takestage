'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

interface TakeoverBannerProps {
  newOwner: string | null
  visible: boolean
  onDismiss?: () => void
}

export function TakeoverBanner({ newOwner, visible, onDismiss }: TakeoverBannerProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => onDismiss?.(), 4000)
      return () => clearTimeout(t)
    }
  }, [visible, onDismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg"
          style={{
            background: 'rgba(198,254,30,0.12)',
            border: '1px solid rgba(198,254,30,0.35)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#C6FE1E' }}
          >
            <Zap className="w-4 h-4 text-black" strokeWidth={3} />
          </div>
          <p className="text-sm font-bold text-white font-display">
            <span className="text-stage-lime">{newOwner || 'Someone'}</span>
            {' '}just rushed the stage!
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

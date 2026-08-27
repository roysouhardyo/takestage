'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeWidths: Record<NonNullable<ModalProps['size']>, string> = {
  sm: '480px',
  md: '560px',
  lg: '680px',
  xl: '880px',
}

export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  size = 'lg',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose()
          }}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: `min(94vw, ${sizeWidths[size]})`,
              maxHeight: 'calc(100vh - 32px)',
              background: '#161616',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(198,254,30,0.15)',
              overflowY: 'auto',
              boxSizing: 'border-box',
              margin: 'auto',
            }}
          >
            {/* Top lime accent border */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #C6FE1E, transparent)',
                zIndex: 30,
              }}
            />

            {/* Header (if provided) */}
            {(title || description) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '20px 24px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  position: 'sticky',
                  top: '2px',
                  background: '#161616',
                  zIndex: 20,
                }}
              >
                <div>
                  {title && (
                    <h2
                      style={{
                        fontFamily: "'Space Grotesk', system-ui, sans-serif",
                        fontWeight: 800,
                        fontSize: '18px',
                        color: '#ffffff',
                        margin: 0,
                      }}
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#aaaaaa',
                        margin: '4px 0 0 0',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                    >
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                  aria-label="Close modal"
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            )}

            {/* Close button if no header */}
            {!title && !description && (
              <button
                onClick={onClose}
                style={{
                  position: 'sticky',
                  float: 'right',
                  top: '16px',
                  right: '16px',
                  zIndex: 30,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  margin: '16px 16px 0 0',
                }}
                aria-label="Close modal"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            )}

            {/* Children content */}
            <div style={{ padding: title || description ? '20px 24px' : '0 24px 24px 24px', clear: 'both' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

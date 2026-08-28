'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/ui/Header'
import { StageCanvas } from '@/components/canvas/StageCanvas'
import { RealtimeProvider, useRealtime } from '@/context/RealtimeContext'
import type { Stage } from '@/types'
import { Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { CheckoutModal } from '@/components/checkout/CheckoutModal'

import { StageTicker } from '@/components/stage/StageTicker'

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"

function HomeContent() {
  const { activeStage } = useRealtime()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#e8e8e8' }}>
      <Header onGetSpot={() => setCheckoutOpen(true)} />
      <StageTicker />

      <main style={{ flex: 1 }}>
        {/* Live Experience (Open Canvas or Active Spotlight with Previous Stage Floating Bubbles) */}
        <StageCanvas onOpenCheckout={() => setCheckoutOpen(true)} />

        {/* ── Concise Mechanic Explanation ──────────────────── */}
        <section
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: 'clamp(40px, 8vw, 64px) clamp(16px, 4vw, 24px)',
            background: '#0a0a0a',
          }}
        >
          <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#C6FE1E',
                  marginBottom: '12px',
                  fontFamily: FONT_DISPLAY,
                }}
              >
                The Mechanic
              </p>
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: 'clamp(24px, 4vw, 40px)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  margin: '0 0 12px 0',
                }}
              >
                One spot. One owner. At a time.
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: '#999999',
                  maxWidth: '520px',
                  margin: '0 auto',
                  fontFamily: FONT_BODY,
                }}
              >
                Buy a full duration. Go live immediately. Anyone can take over — with a strictly larger purchase.
              </p>
            </div>

            {/* Takeover rule callout */}
            <div
              style={{
                padding: '28px',
                borderRadius: '16px',
                background: 'rgba(198,254,30,0.04)',
                border: '1px solid rgba(198,254,30,0.2)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Shield style={{ width: 16, height: 16, color: '#C6FE1E' }} />
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: '#C6FE1E',
                        fontFamily: FONT_DISPLAY,
                      }}
                    >
                      Locked Rule
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#dddddd', margin: 0, fontFamily: FONT_BODY }}>
                    User A buys <strong style={{ color: '#ffffff' }}>5 min</strong>. User B must buy{' '}
                    <strong style={{ color: '#C6FE1E', fontWeight: 700 }}>6+ min</strong> to take over — regardless of how much time A has left.
                    B gets their <strong style={{ color: '#ffffff' }}>full</strong> purchased duration. A&apos;s remaining time is gone.
                  </p>
                </div>
                <Link
                  href="/how-it-works"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#C6FE1E',
                    textDecoration: 'none',
                    fontFamily: FONT_DISPLAY,
                    flexShrink: 0,
                  }}
                >
                  Full breakdown <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: '#080808',
          padding: 'clamp(16px, 4vw, 24px) clamp(16px, 4vw, 20px)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/logo.png"
              alt="TakeStage Logo"
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                objectFit: 'cover',
                boxShadow: '0 0 10px rgba(198,254,30,0.4)',
              }}
            />
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: '13px',
                color: '#ffffff',
              }}
            >
              TAKESTAGE
            </span>
          </div>
          <p
            style={{
              fontSize: '11px',
              fontFamily: "'Fira Code', monospace",
              color: '#555555',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            BUY TIME · TAKE THE STAGE · BE SEEN
          </p>
          <p style={{ fontSize: '11px', color: '#555555', margin: 0 }}>© {new Date().getFullYear()}</p>
        </div>
      </footer>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        currentStage={activeStage}
      />
    </div>
  )
}

export default function HomePage() {
  const [initialStage, setInitialStage] = useState<Stage | null>(null)
  const [initialPastStages, setInitialPastStages] = useState<Stage[]>([])

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/stage/active')
        if (res.ok) {
          const data = await res.json()
          setInitialStage(data.stage || null)
          setInitialPastStages(data.pastStages || [])
        }
      } catch {
        // silent fallback
      }
    }
    init()
  }, [])

  return (
    <RealtimeProvider
      initialStage={initialStage}
      initialPastStages={initialPastStages}
    >
      <HomeContent />
    </RealtimeProvider>
  )
}

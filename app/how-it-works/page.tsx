import { Header } from '@/components/ui/Header'
import Link from 'next/link'
import { Zap, Clock, Shield, ArrowRight, AlertCircle } from 'lucide-react'

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#e8e8e8' }}>
      <Header />

      <main style={{ flex: 1, paddingTop: '80px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
        {/* Hero */}
        <div style={{ maxWidth: '720px', margin: '0 auto 64px', textAlign: 'center', width: '100%' }}>
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
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 'clamp(36px, 7vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              margin: '0 0 20px 0',
            }}
          >
            How TakeStage<br />
            <span style={{ color: '#C6FE1E' }}>Works</span>
          </h1>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#aaaaaa',
              maxWidth: '540px',
              margin: '0 auto',
              fontFamily: FONT_BODY,
            }}
          >
            One public stage. One owner at a time. Buy full time. Go live immediately.
            Anyone can take over — with a strictly larger purchase.
          </p>
        </div>

        {/* Steps */}
        <div style={{ maxWidth: '1100px', margin: '0 auto 64px', width: '100%' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              width: '100%',
            }}
          >
            {[
              {
                num: '01',
                icon: <Clock style={{ width: 22, height: 22 }} />,
                title: 'Buy Time',
                body: 'Choose how long you want the spotlight. 5 minutes is $5. 1 hour is $60. You pay exactly $1 per minute.',
              },
              {
                num: '02',
                icon: <Zap style={{ width: 22, height: 22 }} />,
                title: 'Take the Stage',
                body: 'Enter your URL. Optionally add a short message (80 chars). You go live instantly — no moderation, no delay.',
              },
              {
                num: '03',
                icon: <Shield style={{ width: 22, height: 22 }} />,
                title: 'The Takeover Rule',
                body: 'Anyone can rush the stage — but only by purchasing strictly MORE minutes than your original buy. Remaining time doesn\'t matter.',
              },
            ].map(({ num, icon, title, body }) => (
              <div
                key={num}
                style={{
                  position: 'relative',
                  padding: '32px',
                  borderRadius: '16px',
                  background: '#111111',
                  border: '1px solid #222222',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 800,
                    fontSize: '36px',
                    color: 'rgba(255,255,255,0.04)',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  {num}
                </span>

                <div>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(198,254,30,0.08)',
                      border: '1px solid rgba(198,254,30,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#C6FE1E',
                      marginBottom: '20px',
                    }}
                  >
                    {icon}
                  </div>

                  <h3
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 700,
                      fontSize: '18px',
                      color: '#ffffff',
                      margin: '0 0 10px 0',
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: '#888888',
                      margin: 0,
                      fontFamily: FONT_BODY,
                    }}
                  >
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The Takeover Rule — Deep dive */}
        <div style={{ maxWidth: '800px', margin: '0 auto 64px', width: '100%' }}>
          <div
            style={{
              padding: '32px',
              borderRadius: '16px',
              background: 'rgba(198,254,30,0.04)',
              border: '1px solid rgba(198,254,30,0.2)',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#C6FE1E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertCircle style={{ width: 20, height: 20, color: '#000' }} />
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 800,
                    fontSize: '18px',
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  The Locked Takeover Rule
                </h2>
                <p style={{ fontSize: '12px', color: '#888888', margin: '2px 0 0 0', fontFamily: FONT_BODY }}>
                  This is the core mechanic. Read it carefully.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span style={{ color: '#C6FE1E', fontWeight: 800, fontFamily: "'Fira Code', monospace", flexShrink: 0 }}>A</span>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#dddddd', margin: 0, fontFamily: FONT_BODY }}>
                  User A buys <strong style={{ color: '#fff' }}>5 minutes ($5)</strong>. They own the stage with a 5:00 countdown.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span style={{ color: '#C6FE1E', fontWeight: 800, fontFamily: "'Fira Code', monospace", flexShrink: 0 }}>B</span>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#dddddd', margin: 0, fontFamily: FONT_BODY }}>
                  User B wants to take over. B must buy a <strong style={{ color: '#fff' }}>NEW FULL duration strictly greater than 5 minutes</strong> —
                  for example 6 min, 10 min, or 30 min. The remaining time on A&apos;s clock is irrelevant.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(198,254,30,0.06)',
                  border: '1px solid rgba(198,254,30,0.25)',
                }}
              >
                <span style={{ color: '#C6FE1E', fontWeight: 800, fontFamily: "'Fira Code', monospace", flexShrink: 0 }}>→</span>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#C6FE1E', fontWeight: 700, margin: 0, fontFamily: FONT_BODY }}>
                  B gets their complete purchased duration from the moment of takeover.
                  A&apos;s remaining time is gone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing table */}
        <div style={{ maxWidth: '800px', margin: '0 auto 64px', width: '100%' }}>
          <h2
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: '24px',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            Simple Pricing
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px',
              width: '100%',
            }}
          >
            {[
              { dur: '5 min', price: '$5' },
              { dur: '10 min', price: '$10', tag: 'Popular' },
              { dur: '30 min', price: '$30', tag: 'Best Value' },
              { dur: '1 hour', price: '$60' },
            ].map(({ dur, price, tag }) => (
              <div
                key={dur}
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: '#111111',
                  border: '1px solid #222222',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                {tag ? (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#000000',
                      background: '#C6FE1E',
                      padding: '2px 8px',
                      borderRadius: '100px',
                      marginBottom: '10px',
                      fontFamily: FONT_DISPLAY,
                    }}
                  >
                    {tag}
                  </span>
                ) : (
                  <div style={{ height: '18px', marginBottom: '10px' }} />
                )}
                <p
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 800,
                    fontSize: '28px',
                    color: '#ffffff',
                    margin: '0 0 4px 0',
                  }}
                >
                  {price}
                </p>
                <p style={{ fontSize: '12px', color: '#888888', fontFamily: "'Fira Code', monospace", margin: 0 }}>
                  {dur}
                </p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#666666', marginTop: '16px', fontFamily: FONT_BODY }}>
            Custom duration available — enter any amount at checkout ($1/min)
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 36px',
              fontSize: '16px',
              fontWeight: 800,
              fontFamily: FONT_DISPLAY,
              color: '#000000',
              background: '#C6FE1E',
              borderRadius: '14px',
              textDecoration: 'none',
              boxShadow: '0 0 0 1px rgba(198,254,30,0.4), 0 4px 20px rgba(198,254,30,0.2)',
            }}
          >
            <Zap style={{ width: 18, height: 18, fill: '#000' }} strokeWidth={2} />
            See the Live Stage
            <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>
        </div>
      </main>
    </div>
  )
}

import { Header } from '@/components/ui/Header'
import { StatsGrid } from '@/components/stats/StatsGrid'
import { getPlatformStats } from '@/lib/stage/queries'

export const dynamic = 'force-dynamic'

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"

export default async function StatsPage() {
  const stats = await getPlatformStats()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#e8e8e8' }}>
      <Header />

      <main style={{ flex: 1, paddingTop: '80px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
              Public Analytics
            </p>
            <h1
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: 'clamp(32px, 6vw, 56px)',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                margin: '0 0 16px 0',
              }}
            >
              Platform Stats
            </h1>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#aaaaaa',
                maxWidth: '480px',
                margin: '0 auto',
                fontFamily: FONT_BODY,
              }}
            >
              Transparent, real-time numbers for TakeStage.
            </p>
          </div>
          <StatsGrid stats={stats} />
        </div>
      </main>
    </div>
  )
}

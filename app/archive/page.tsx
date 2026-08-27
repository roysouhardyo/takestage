import { Header } from '@/components/ui/Header'
import { ArchiveList } from '@/components/archive/ArchiveList'
import { getArchive } from '@/lib/stage/queries'

export const dynamic = 'force-dynamic'

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"

export default async function ArchivePage() {
  const { stages, total } = await getArchive(0, 50)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#e8e8e8' }}>
      <Header />

      <main style={{ flex: 1, paddingTop: '80px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              Hall of Fame
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
              Stage Archive
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
              Every website that has taken the stage. {total > 0 ? `${total} total.` : ''}
            </p>
          </div>

          <div style={{ width: '100%' }}>
            <ArchiveList stages={stages} total={total} />
          </div>
        </div>
      </main>
    </div>
  )
}

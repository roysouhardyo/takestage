'use client'

interface StagePreviewProps {
  websiteUrl: string
  brandName: string
  message: string
  previewImage?: string | null
  durationMinutes: number
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

export function StagePreview({
  websiteUrl,
  brandName,
  message,
  durationMinutes,
}: StagePreviewProps) {
  let domain = ''
  try {
    const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
    domain = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    domain = websiteUrl
  }

  const displayName = brandName || domain || 'Your Site'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaaaaa', fontFamily: FONT_DISPLAY, margin: 0 }}>
        Live Preview
      </p>

      <div
        style={{
          position: 'relative',
          borderRadius: '16px',
          padding: '24px',
          background: '#111111',
          border: '1px solid #222222',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Top lime border accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #C6FE1E, transparent)',
          }}
        />

        {/* Live Pill */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '100px',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#22c55e',
              fontFamily: FONT_DISPLAY,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            LIVE
          </div>
        </div>

        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(198,254,30,0.1)',
              border: '1px solid rgba(198,254,30,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 800,
              color: '#C6FE1E',
              fontFamily: FONT_DISPLAY,
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', fontFamily: FONT_DISPLAY, margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </p>
            {message ? (
              <p style={{ fontSize: '13px', color: '#aaaaaa', margin: 0, fontFamily: FONT_BODY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {message}
              </p>
            ) : (
              <p style={{ fontSize: '12px', color: '#666666', margin: 0, fontFamily: FONT_MONO, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {domain || 'yoursite.com'}
              </p>
            )}
          </div>
        </div>

        {/* Duration box */}
        {durationMinutes > 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888888', margin: '0 0 4px 0', fontFamily: FONT_DISPLAY }}>
              PURCHASED DURATION
            </p>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#C6FE1E', margin: 0, fontFamily: FONT_DISPLAY }}>
              {durationMinutes} min
            </p>
          </div>
        )}
      </div>

      {!websiteUrl && (
        <p style={{ fontSize: '11px', color: '#666666', textAlign: 'center', fontStyle: 'italic', margin: '4px 0 0 0', fontFamily: FONT_BODY }}>
          Enter your website URL to see a live preview
        </p>
      )}
    </div>
  )
}

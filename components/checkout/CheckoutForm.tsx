'use client'

import { Input } from '@/components/ui/Input'

interface CheckoutFormProps {
  websiteUrl: string
  onWebsiteUrlChange: (val: string) => void
  websiteUrlError: string | undefined

  message: string
  onMessageChange: (val: string) => void
  messageError?: string
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

export function CheckoutForm({
  websiteUrl,
  onWebsiteUrlChange,
  websiteUrlError,
  message,
  onMessageChange,
  messageError,
}: CheckoutFormProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Required: Website / Handle */}
      <Input
        id="checkout-website-url"
        label="Website or Project URL *"
        type="url"
        placeholder="https://yoursite.com"
        value={websiteUrl}
        onChange={(e) => onWebsiteUrlChange(e.target.value)}
        error={websiteUrlError}
        prefix="🌐"
        helperText="Enter your link. TakeStage will automatically resolve your logo and brand."
        autoComplete="url"
        spellCheck={false}
      />

      {/* Optional: Short Message (Max 80 chars) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            htmlFor="checkout-short-message"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#dddddd',
              fontFamily: FONT_DISPLAY,
            }}
          >
            Short Message <span style={{ color: '#777777', fontWeight: 400, fontSize: '12px' }}>(optional)</span>
          </label>
          <span style={{ fontSize: '11px', fontFamily: FONT_MONO, color: '#888888' }}>
            {message.length}/80
          </span>
        </div>
        <textarea
          id="checkout-short-message"
          rows={2}
          placeholder="Launching something new..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value.slice(0, 80))}
          maxLength={80}
          style={{
            width: '100%',
            minHeight: '72px',
            padding: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: messageError ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '14px',
            fontFamily: FONT_BODY,
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />
        {messageError && (
          <p style={{ fontSize: '12px', color: '#ef4444', margin: 0, fontFamily: FONT_BODY }} role="alert">
            {messageError}
          </p>
        )}
      </div>

      <div
        style={{
          padding: '14px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#C6FE1E', margin: 0, fontFamily: FONT_DISPLAY }}>
          ✨ Automatic Spotlight Generation
        </p>
        <p style={{ fontSize: '12px', color: '#888888', margin: 0, fontFamily: FONT_BODY, lineHeight: 1.5 }}>
          Your logo, title, and domain are automatically fetched. Long URLs are normalized (e.g. example.com).
        </p>
      </div>
    </div>
  )
}

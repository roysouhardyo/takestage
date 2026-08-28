'use client'

import { useState, useId, useEffect } from 'react'
import { Zap, ArrowRight } from 'lucide-react'
import type { Stage } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { DurationPicker } from '@/components/checkout/DurationPicker'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { StagePreview } from '@/components/preview/StagePreview'
import { formatPrice } from '@/lib/pricing/config'
import { validateUrl, validateMessage } from '@/lib/validation/schemas'
import { useRealtime } from '@/context/RealtimeContext'
import { MINIMUM_FRESH_STAGE_MINUTES } from '@/lib/stage/takeover'

type Step = 'duration' | 'details'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  currentStage: Stage | null
}

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"
const FONT_MONO = "'Fira Code', monospace"

export function CheckoutModal({ open, onClose, currentStage }: CheckoutModalProps) {
  const { minimumTakeoverMinutes } = useRealtime()
  const [step, setStep] = useState<Step>('duration')

  const [liveStage, setLiveStage] = useState<Stage | null>(currentStage)
  const effectiveStage = liveStage || currentStage

  // Minimum derived from REMAINING TIME (ticking every second from context)
  const minimumRequiredMins = effectiveStage ? minimumTakeoverMinutes : MINIMUM_FRESH_STAGE_MINUTES
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(minimumRequiredMins)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [message, setMessage] = useState('')

  const [urlError, setUrlError] = useState<string | undefined>()
  const [messageError, setMessageError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const sessionId = useId()

  useEffect(() => {
    setLiveStage(currentStage)
  }, [currentStage])

  useEffect(() => {
    if (open) {
      async function fetchLatestStage() {
        try {
          const res = await fetch('/api/stage/active')
          if (res.ok) {
            const data = await res.json()
            if (data.stage) {
              setLiveStage(data.stage)
              // Use server-computed minimum (remaining-time based)
              if (typeof data.minimumTakeoverMinutes === 'number') {
                setSelectedMinutes(data.minimumTakeoverMinutes)
              }
            } else {
              setLiveStage(null)
              setSelectedMinutes(MINIMUM_FRESH_STAGE_MINUTES)
            }
          }
        } catch {
          // fallback to currentStage
        }
      }
      fetchLatestStage()
    }
  }, [open, currentStage])

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep('duration')
      setSelectedMinutes(minimumRequiredMins)
      setWebsiteUrl('')
      setMessage('')
      setUrlError(undefined)
      setMessageError(undefined)
      setServerError(null)
    }, 300)
  }

  const isTakeover = !!effectiveStage
  const isValidDuration = selectedMinutes ? selectedMinutes >= minimumRequiredMins : false
  const calculatedPriceCents = selectedMinutes ? selectedMinutes * 100 : 0
  const formattedPrice = formatPrice(calculatedPriceCents)

  const handleNextStep = () => {
    if (!selectedMinutes || !isValidDuration) return
    setStep('details')
  }

  const handleSubmit = async () => {
    const urlResult = validateUrl(websiteUrl)
    if (!urlResult.valid) {
      setUrlError(urlResult.error)
      return
    }

    const msgResult = validateMessage(message)
    if (!msgResult.valid) {
      setMessageError(msgResult.error)
      return
    }
    if (msgResult.value && msgResult.value.length > 80) {
      setMessageError('Message must be 80 characters or less.')
      return
    }

    if (!selectedMinutes || !isValidDuration) return

    setUrlError(undefined)
    setMessageError(undefined)
    setServerError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_url: urlResult.url,
          message: msgResult.value || undefined,
          duration_minutes: selectedMinutes,
          session_id: sessionId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.error || 'Something went wrong. Please try again.')
        return
      }

      window.location.href = data.checkout_url
    } catch {
      setServerError('Network error. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Modal Header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(198,254,30,0.12)',
                border: '1px solid rgba(198,254,30,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap style={{ width: 16, height: 16, color: '#C6FE1E', fill: '#C6FE1E' }} />
            </div>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: '22px',
                color: '#ffffff',
                margin: 0,
              }}
            >
              {isTakeover ? 'Rush the Stage' : 'Take the Stage'}
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: '#aaaaaa', margin: '0 0 16px 0', fontFamily: FONT_BODY }}>
            {isTakeover
              ? `${minimumRequiredMins - 1} min remaining. Buy ${minimumRequiredMins}+ min to take over instantly.`
              : 'Choose a duration, enter your link, and go live.'}
          </p>

          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: step === 'duration' ? '#C6FE1E' : 'rgba(198,254,30,0.2)',
                color: step === 'duration' ? '#000' : '#C6FE1E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: FONT_DISPLAY,
              }}
            >
              1
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: step === 'duration' ? '#fff' : '#888', fontFamily: FONT_BODY }}>
              Duration
            </span>
            <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: step === 'details' ? '#C6FE1E' : 'rgba(255,255,255,0.1)',
                color: step === 'details' ? '#000' : '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: FONT_DISPLAY,
              }}
            >
              2
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: step === 'details' ? '#fff' : '#888', fontFamily: FONT_BODY }}>
              URL & Pay
            </span>
          </div>
        </div>

        {/* Step 1: Duration */}
        {step === 'duration' && (
          <div>
            <DurationPicker
              selectedMinutes={selectedMinutes}
              onSelectMinutes={setSelectedMinutes}
              currentStage={effectiveStage}
              minimumRequiredMins={minimumRequiredMins}
            />
            <div style={{ marginTop: '24px' }}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!isValidDuration}
                onClick={handleNextStep}
                id="checkout-duration-next-btn"
                style={{
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: 800,
                  fontFamily: FONT_DISPLAY,
                  width: '100%',
                }}
              >
                {isTakeover ? `RUSH THE SPOT — ${formattedPrice}` : `CLAIM THE SPOT — ${formattedPrice}`}
                <ArrowRight style={{ width: 18, height: 18 }} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div>
                <CheckoutForm
                  websiteUrl={websiteUrl}
                  onWebsiteUrlChange={(v) => { setWebsiteUrl(v); setUrlError(undefined) }}
                  websiteUrlError={urlError}
                  message={message}
                  onMessageChange={(v) => { setMessage(v); setMessageError(undefined) }}
                  messageError={messageError}
                />
              </div>

              <div className="hidden md:block">
                <StagePreview
                  websiteUrl={websiteUrl}
                  brandName=""
                  message={message}
                  previewImage={null}
                  durationMinutes={selectedMinutes ?? 0}
                />
              </div>
            </div>

            {/* Summary */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span style={{ fontSize: '13px', color: '#aaaaaa', fontFamily: FONT_MONO }}>
                {selectedMinutes} minutes slot ($1 per min)
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: FONT_DISPLAY }}>
                {formattedPrice}
              </span>
            </div>

            {serverError && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: '#ef4444',
                  fontWeight: 600,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                }}
                role="alert"
              >
                {serverError}
              </div>
            )}

              <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setStep('duration')}
                    disabled={submitting}
                    id="checkout-step-back-btn"
                    style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={submitting}
                    disabled={!isValidDuration || submitting}
                    onClick={handleSubmit}
                    id="checkout-pay-btn"
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 800,
                      flex: 1,
                      padding: '12px',
                      background: '#C6FE1E',
                      color: '#000000',
                      boxShadow: '0 0 20px rgba(198,254,30,0.3)',
                    }}
                  >
                    <Zap style={{ width: 16, height: 16, fill: '#000' }} />
                    {isTakeover ? `RUSH THE STAGE — ${formattedPrice}` : `TAKE THE STAGE — ${formattedPrice}`}
                  </Button>
                </div>

              <p style={{ textAlign: 'center', fontSize: '11px', color: '#666666', fontFamily: FONT_MONO, margin: 0 }}>
                Secured by Polar · Standard Webhooks verification
              </p>
            </div>
        )}
      </div>
    </Modal>
  )
}

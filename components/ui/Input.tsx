import { type InputHTMLAttributes, forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  prefix?: string
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, prefix, suffix, className, id, style, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#dddddd',
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {prefix && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              fontSize: '14px',
              color: '#888888',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 5,
            }}
          >
            {prefix}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          style={{
            width: '100%',
            height: '44px',
            paddingLeft: prefix ? '40px' : '14px',
            paddingRight: suffix ? '40px' : '14px',
            background: 'rgba(255,255,255,0.04)',
            border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '14px',
            fontFamily: "'Inter', system-ui, sans-serif",
            outline: 'none',
            boxSizing: 'border-box',
            ...style,
          }}
          {...props}
        />

        {suffix && (
          <span
            style={{
              position: 'absolute',
              right: '12px',
              fontSize: '14px',
              color: '#888888',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '12px', color: '#ef4444', margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }} role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p style={{ fontSize: '12px', color: '#777777', margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
          {helperText}
        </p>
      )}
    </div>
  )
})

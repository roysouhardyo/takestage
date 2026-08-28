'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, Eye, Menu, X } from 'lucide-react'
import { useRealtime } from '@/context/RealtimeContext'

interface HeaderProps {
  onGetSpot?: () => void
}

export function Header({ onGetSpot }: HeaderProps) {
  const { watcherCount, activeStage } = useRealtime()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/archive', label: 'Archive' },
    { href: '/stats', label: 'Stats' },
    { href: '/how-it-works', label: 'How it works' },
  ]

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        height: '56px',
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Brand Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', zIndex: 10 }}>
          <img
            src="/logo.png"
            alt="TakeStage Logo"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              objectFit: 'cover',
              boxShadow: '0 0 12px rgba(198,254,30,0.4)',
            }}
          />
          <span
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            TAKESTAGE
          </span>
        </Link>

        {/* Center: Live status indicator pill (Visible on sm: screens >= 640px to prevent mobile cramming) */}
        <div
          className="hidden sm:flex items-center gap-2"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '11px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            <span style={{ position: 'relative', width: 6, height: 6, display: 'inline-block' }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', opacity: 0.6, animation: 'ping 1.5s ease-in-out infinite' }} />
              <span style={{ position: 'relative', display: 'block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            </span>
            <span style={{ fontWeight: 800, color: '#ffffff', letterSpacing: '0.08em', fontSize: '10px', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>LIVE</span>
            <span style={{ color: '#444444' }}>·</span>
            <Eye style={{ width: 12, height: 12, color: '#aaaaaa' }} />
            <span style={{ fontWeight: 700, color: '#ffffff', fontFamily: "'Fira Code', monospace" }}>{Math.max(1, watcherCount)}</span>
          </div>
        </div>

        {/* Right: Desktop Nav + Action CTA + Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0" style={{ zIndex: 10 }}>
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-5" style={{ marginRight: '8px' }}>
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#aaaaaa',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ffffff' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#aaaaaa' }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* GET THE SPOT Action Button */}
          <button
            onClick={onGetSpot}
            id="header-get-spot-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              letterSpacing: '-0.01em',
              color: '#000000',
              background: '#C6FE1E',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 0 0 1px rgba(198,254,30,0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            <Zap style={{ width: 13, height: 13 }} strokeWidth={2.5} fill="#000" />
            <span>GET SPOT</span>
          </button>

          {/* Mobile Menu Trigger Button — ONLY visible on mobile (< 768px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="flex md:hidden items-center justify-center"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'absolute',
            top: '56px',
            left: 0,
            right: 0,
            background: '#111111',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            padding: '20px 20px 24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 60,
          }}
        >
          {/* Mobile Live Status Indicator inside menu */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '12px',
            }}
          >
            <span style={{ position: 'relative', width: 6, height: 6, display: 'inline-block' }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', opacity: 0.6, animation: 'ping 1.5s ease-in-out infinite' }} />
              <span style={{ position: 'relative', display: 'block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            </span>
            <span style={{ fontWeight: 800, color: '#ffffff' }}>LIVE NOW</span>
            <span style={{ color: '#444444' }}>·</span>
            <span style={{ color: '#aaaaaa' }}>{Math.max(1, watcherCount)} watching</span>
          </div>

          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#ffffff',
                textDecoration: 'none',
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {label}
            </Link>
          ))}

          {/* Active stage info if active */}
          {activeStage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(198,254,30,0.08)',
                border: '1px solid rgba(198,254,30,0.2)',
                color: '#C6FE1E',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>On Stage Now:</span>
              <strong style={{ color: '#ffffff' }}>{activeStage.brand_name || activeStage.normalized_domain}</strong>
            </div>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false)
              if (onGetSpot) onGetSpot()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              color: '#000000',
              background: '#C6FE1E',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              width: '100%',
              marginTop: '4px',
            }}
          >
            <Zap style={{ width: 16, height: 16 }} strokeWidth={2.5} fill="#000" />
            GET THE SPOT
          </button>
        </div>
      )}
    </header>
  )
}

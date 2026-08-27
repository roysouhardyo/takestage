import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Brand ──────────────────────────────────────
        'stage-lime':    '#C6FE1E',  // electric lime — primary accent
        'stage-lime-dim':'#9BCB0F',  // muted lime
        'stage-black':   '#080808',  // near-black background
        'stage-dark':    '#111111',  // card/surface dark
        'stage-card':    '#181818',  // elevated card
        'stage-border':  '#222222',  // subtle borders
        'stage-muted':   '#666666',  // muted text
        'stage-subtle':  '#333333',  // subtle backgrounds

        // ── Status colors ──────────────────────────────
        'live-green':    '#22c55e',
        'warning-amber': '#f59e0b',
        'danger-red':    '#ef4444',
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)', 'monospace'],
        display: ['var(--font-space)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xxs': ['0.65rem', { lineHeight: '1rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.5rem',
        'xl4': '2rem',
      },
      boxShadow: {
        'lime':     '0 0 20px rgba(198, 254, 30, 0.15)',
        'lime-lg':  '0 0 40px rgba(198, 254, 30, 0.25)',
        'glow':     '0 0 60px rgba(198, 254, 30, 0.1), 0 0 20px rgba(198, 254, 30, 0.05)',
        'card':     '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
        'card-lg':  '0 4px 24px rgba(0,0,0,0.6)',
        'inner-glow':'inset 0 0 30px rgba(198, 254, 30, 0.05)',
      },
      animation: {
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'pulse-glow':   'pulse-glow 2s ease-in-out infinite',
        'countdown':    'countdown-tick 1s ease-in-out infinite',
        'fade-in':      'fade-in 0.4s ease-out forwards',
        'slide-up':     'slide-up 0.4s ease-out forwards',
        'slide-in':     'slide-in-right 0.3s ease-out forwards',
        'shimmer':      'shimmer 1.5s ease-in-out infinite',
        'spin-slow':    'spin 3s linear infinite',
        'bounce-light': 'bounce 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(198, 254, 30, 0.2)',
            opacity: '1',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(198, 254, 30, 0.5)',
            opacity: '0.8',
          },
        },
        'countdown-tick': {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise':            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(198,254,30,0.08) 50%, transparent 100%)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

export default config

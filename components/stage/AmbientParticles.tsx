'use client'

import { memo } from 'react'

const PARTICLE_POSITIONS = [
  { top: '15%', left: '20%', size: 4, duration: 8, delay: 0 },
  { top: '25%', left: '85%', size: 3, duration: 11, delay: 1 },
  { top: '45%', left: '12%', size: 5, duration: 9, delay: 0.5 },
  { top: '60%', left: '88%', size: 4, duration: 12, delay: 2 },
  { top: '75%', left: '24%', size: 3, duration: 7, delay: 1.5 },
  { top: '82%', left: '70%', size: 5, duration: 10, delay: 0.8 },
  { top: '35%', left: '68%', size: 3, duration: 13, delay: 2.2 },
  { top: '18%', left: '42%', size: 4, duration: 9.5, delay: 0.3 },
]

export const AmbientParticles = memo(function AmbientParticles() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      {PARTICLE_POSITIONS.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: '#C6FE1E',
            opacity: 0.25,
            boxShadow: '0 0 10px #C6FE1E',
            filter: 'blur(0.5px)',
            animation: `bubble-float-${(i % 4) + 1} ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
})

import React from 'react'

const AMBER = '#D97706'
const TEAL = '#134E4A'

function lerpColor(score) {
  const t = Math.min(100, Math.max(0, score)) / 100
  const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const a = hexToRgb(AMBER)
  const b = hexToRgb(TEAL)
  const mix = a.map((v, i) => Math.round(v + (b[i] - v) * t))
  return `rgb(${mix.join(', ')})`
}

/**
 * AI match score shown as a circular progress ring.
 * The arc is filled proportionally to `score` and fades amber -> teal as the
 * score climbs, making this the visually distinct AI-match differentiator.
 */
export default function MatchScoreBadge({
  score,
  size = 64,
  strokeWidth = 5,
  showLabel = true,
  className = '',
}) {
  const uniqueId = React.useId().replace(/:/g, '')
  const clamped = Math.min(100, Math.max(0, Number(score) || 0))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (circumference * clamped) / 100
  const color = lerpColor(clamped)

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="img"
      aria-label={`AI match score ${clamped} out of 100`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`msb-${uniqueId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={AMBER} />
            <stop offset="100%" stopColor={TEAL} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-stone-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#msb-${uniqueId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute inset-0 flex items-center justify-center font-heading font-bold text-ink"
          style={{ fontSize: size * 0.28, color }}
        >
          {Math.round(clamped)}
        </span>
      )}
    </div>
  )
}
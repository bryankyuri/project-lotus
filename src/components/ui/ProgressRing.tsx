import { useId } from 'react'
import { motion } from 'framer-motion'

interface ProgressRingProps {
  /** Current value */
  readonly value: number
  /** Maximum value */
  readonly max: number
  /** Ring size in px */
  readonly size?: number
  /** Ring stroke width in px */
  readonly strokeWidth?: number
  /** Ring color (CSS color or tailwind variable) — ignored when gradientColors is set */
  readonly color?: string
  /** Two-stop gradient [from, to] applied to the progress arc */
  readonly gradientColors?: [string, string]
  /** Track color */
  readonly trackColor?: string
  /** Show percentage text inside */
  readonly showLabel?: boolean
  /** Custom label (overrides percentage) */
  readonly label?: string
  /** Sublabel shown below the main label */
  readonly sublabel?: string
  /** Custom label color (CSS color) */
  readonly labelColor?: string
}

export function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = 'var(--color-primary)',
  gradientColors,
  trackColor = 'var(--color-border)',
  showLabel = true,
  label,
  sublabel,
  labelColor,
}: ProgressRingProps) {
  const uid = useId().replaceAll(':', '')
  const gradId = `ring-grad-${uid}`

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / Math.max(max, 1), 1)
  const offset = circumference * (1 - progress)

  const strokePaint = gradientColors ? `url(#${gradId})` : color

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {gradientColors && (
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        )}
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokePaint}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold leading-none" style={{ color: labelColor ?? 'var(--color-text)' }}>
            {label ?? Math.round(value)}
          </span>
          {sublabel && (
            <span className="text-[10px] text-text-secondary mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  readonly value: number
  /** Number of decimal places. Default 0 */
  readonly decimals?: number
  /** Animation duration in ms. Default 600 */
  readonly duration?: number
  readonly className?: string
  /** Prefix string, e.g. "+" */
  readonly prefix?: string
  /** Suffix string, e.g. " kcal" */
  readonly suffix?: string
}

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 600,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + (to - from) * eased
      setDisplay(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        prevRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}

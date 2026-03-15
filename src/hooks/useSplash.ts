import { useEffect, useState } from 'react'

/**
 * Shows splash screen for a minimum duration, then fades out.
 */
export function useSplash(minDuration = 1200) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), minDuration)
    return () => clearTimeout(timer)
  }, [minDuration])

  return visible
}

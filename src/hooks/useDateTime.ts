import { useState, useEffect } from 'react'

interface DateTime {
  time: string      // "14:30"
  seconds: string   // "05"
  date: Date
}

/**
 * Live clock that updates every second.
 * Returns formatted time (HH:MM), seconds, and the raw Date object.
 */
export function useDateTime(): DateTime {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')

  return {
    time: `${hh}:${mm}`,
    seconds: ss,
    date: now,
  }
}

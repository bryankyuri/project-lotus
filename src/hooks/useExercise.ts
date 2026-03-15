import { useState, useCallback, useMemo } from 'react'
import { storage, toDateKey, type LoggedExercise } from '../store/localStorage'

/**
 * Hook for managing a single day's exercise log.
 */
export function useExercise(date?: string) {
  const dateKey = date ?? toDateKey()
  const [exercises, setExercisesState] = useState<LoggedExercise[]>(
    () => storage.getExercises(dateKey),
  )

  const refresh = useCallback(() => {
    setExercisesState(storage.getExercises(dateKey))
  }, [dateKey])

  const addExercise = useCallback(
    (exercise: LoggedExercise) => {
      storage.addExercise(dateKey, exercise)
      refresh()
    },
    [dateKey, refresh],
  )

  const removeExercise = useCallback(
    (id: string) => {
      storage.removeExercise(dateKey, id)
      refresh()
    },
    [dateKey, refresh],
  )

  const totalBurned = useMemo(
    () => exercises.reduce((sum, e) => sum + e.calories_burned, 0),
    [exercises],
  )

  const totalMinutes = useMemo(
    () => exercises.reduce((sum, e) => sum + e.duration_minutes, 0),
    [exercises],
  )

  return {
    exercises,
    totalBurned,
    totalMinutes,
    addExercise,
    removeExercise,
    refresh,
  }
}

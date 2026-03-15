import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  storage,
  toDateKey,
  createEmptyDayLog,
  type DayLog,
  type SlotType,
  type LoggedFood,
} from '../store/localStorage'

/**
 * Hook for managing a single day's food log.
 * Reads/writes directly to localStorage via the storage helper.
 */
export function useDayLog(date?: string) {
  const dateKey = date ?? toDateKey()
  const [dayLog, setDayLogState] = useState<DayLog>(() => storage.getDayLog(dateKey))

  // Re-read from localStorage whenever dateKey changes
  useEffect(() => {
    setDayLogState(storage.getDayLog(dateKey))
  }, [dateKey])

  // Force re-read from localStorage
  const refresh = useCallback(() => {
    setDayLogState(storage.getDayLog(dateKey))
  }, [dateKey])

  const addFood = useCallback(
    (slot: SlotType, food: LoggedFood) => {
      storage.addFoodToSlot(dateKey, slot, food)
      refresh()
    },
    [dateKey, refresh],
  )

  const removeFood = useCallback(
    (slot: SlotType, index: number) => {
      storage.removeFoodFromSlot(dateKey, slot, index)
      refresh()
    },
    [dateKey, refresh],
  )

  const updateFood = useCallback(
    (slot: SlotType, index: number, food: LoggedFood) => {
      storage.updateFoodInSlot(dateKey, slot, index, food)
      refresh()
    },
    [dateKey, refresh],
  )

  const clearDay = useCallback(() => {
    storage.clearDayLog(dateKey)
    setDayLogState(createEmptyDayLog(dateKey))
  }, [dateKey])

  // Aggregated totals
  const totals = useMemo(() => {
    const all = [
      ...dayLog.breakfast,
      ...dayLog.lunch,
      ...dayLog.dinner,
      ...dayLog.snack,
    ]
    return {
      calories: all.reduce((s, f) => s + f.calories, 0),
      protein: all.reduce((s, f) => s + f.protein, 0),
      carbs: all.reduce((s, f) => s + f.carbs, 0),
      fat: all.reduce((s, f) => s + f.fat, 0),
      foodCount: all.length,
    }
  }, [dayLog])

  return {
    dayLog,
    totals,
    addFood,
    removeFood,
    updateFood,
    clearDay,
    refresh,
    dateKey,
  }
}

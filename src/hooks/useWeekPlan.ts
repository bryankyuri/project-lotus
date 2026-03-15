import { useMemo } from 'react'
import { storage, toDateKey, type DayLog, type LoggedFood } from '../store/localStorage'

/**
 * Returns a 7-day plan (Mon→Sun) for the week containing the given date.
 */
export function useWeekPlan(referenceDate?: Date) {
  const ref = referenceDate ?? new Date()

  const weekDates = useMemo(() => {
    const d = new Date(ref)
    // Go to Monday of this week
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust for Sunday
    d.setDate(diff)

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(d)
      date.setDate(d.getDate() + i)
      return toDateKey(date)
    })
  }, [ref])

  const weekLogs = useMemo(() => {
    const allLogs = storage.getAllDayLogs()
    return weekDates.map((dateKey) => ({
      date: dateKey,
      log: allLogs[dateKey] ?? null,
    }))
  }, [weekDates])

  // Calculate totals per day
  const weekSummary = useMemo(() => {
    return weekLogs.map(({ date, log }) => {
      if (!log) {
        return { date, calories: 0, protein: 0, carbs: 0, fat: 0, foodCount: 0 }
      }
      const all: LoggedFood[] = [...log.breakfast, ...log.lunch, ...log.dinner, ...log.snack]
      return {
        date,
        calories: all.reduce((s, f) => s + f.calories, 0),
        protein: all.reduce((s, f) => s + f.protein, 0),
        carbs: all.reduce((s, f) => s + f.carbs, 0),
        fat: all.reduce((s, f) => s + f.fat, 0),
        foodCount: all.length,
      }
    })
  }, [weekLogs])

  // Grocery-style consolidated ingredient list
  const groceryItems = useMemo(() => {
    const map = new Map<number, { food_name: string; total_grams: number }>()

    weekLogs.forEach(({ log }) => {
      if (!log) return
      const slots: (keyof DayLog)[] = ['breakfast', 'lunch', 'dinner', 'snack']
      slots.forEach((slot) => {
        if (slot === 'date') return
        const foods = log[slot] as LoggedFood[]
        foods.forEach((f) => {
          const existing = map.get(f.food_id)
          if (existing) {
            existing.total_grams += f.grams
          } else {
            map.set(f.food_id, { food_name: f.food_name, total_grams: f.grams })
          }
        })
      })
    })

    return Array.from(map.entries()).map(([food_id, data]) => ({
      id: `grocery-${food_id}`,
      food_id,
      ...data,
    }))
  }, [weekLogs])

  return {
    weekDates,
    weekLogs,
    weekSummary,
    groceryItems,
  }
}

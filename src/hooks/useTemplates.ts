import { useState, useCallback } from 'react'
import {
  storage,
  type SlotType,
  type LoggedFood,
  type SavedMeal,
  type DayTemplate,
  type WeekTemplate,
  type DayLog,
  type DayKey,
} from '../store/localStorage'

// ─── Helpers ─────────────────────────────────────────────

function sumFoods(foods: LoggedFood[]) {
  return {
    totalCalories: foods.reduce((s, f) => s + f.calories, 0),
    totalProtein: foods.reduce((s, f) => s + f.protein, 0),
    totalCarbs: foods.reduce((s, f) => s + f.carbs, 0),
    totalFat: foods.reduce((s, f) => s + f.fat, 0),
  }
}

function sumDaySlots(b: LoggedFood[], l: LoggedFood[], d: LoggedFood[], s: LoggedFood[]) {
  return sumFoods([...b, ...l, ...d, ...s])
}

const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

// ─── Hook ────────────────────────────────────────────────

export function useTemplates() {
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() => storage.getSavedMeals())
  const [dayTemplates, setDayTemplates] = useState<DayTemplate[]>(() => storage.getDayTemplates())
  const [weekTemplates, setWeekTemplates] = useState<WeekTemplate[]>(() => storage.getWeekTemplates())

  const refresh = useCallback(() => {
    setSavedMeals(storage.getSavedMeals())
    setDayTemplates(storage.getDayTemplates())
    setWeekTemplates(storage.getWeekTemplates())
  }, [])

  // ── Saved Meals ──

  const saveMeal = useCallback((name: string, slot: SlotType, foods: LoggedFood[]) => {
    const meal: SavedMeal = {
      id: `sm_${Date.now()}`,
      name,
      slot,
      foods,
      ...sumFoods(foods),
      createdAt: new Date().toISOString(),
    }
    storage.addSavedMeal(meal)
    setSavedMeals(storage.getSavedMeals())
    return meal
  }, [])

  const getMealsForSlot = useCallback((slot: SlotType) => {
    return savedMeals.filter((m) => m.slot === slot)
  }, [savedMeals])

  const deleteSavedMeal = useCallback((id: string) => {
    storage.deleteSavedMeal(id)
    setSavedMeals(storage.getSavedMeals())
  }, [])

  const renameSavedMeal = useCallback((id: string, name: string) => {
    storage.updateSavedMeal(id, { name })
    setSavedMeals(storage.getSavedMeals())
  }, [])

  // ── Day Templates ──

  const saveDayTemplate = useCallback((name: string, dayLog: DayLog) => {
    const template: DayTemplate = {
      id: `dt_${Date.now()}`,
      name,
      breakfast: dayLog.breakfast,
      lunch: dayLog.lunch,
      dinner: dayLog.dinner,
      snack: dayLog.snack,
      ...sumDaySlots(dayLog.breakfast, dayLog.lunch, dayLog.dinner, dayLog.snack),
      createdAt: new Date().toISOString(),
    }
    storage.addDayTemplate(template)
    setDayTemplates(storage.getDayTemplates())
    return template
  }, [])

  const deleteDayTemplate = useCallback((id: string) => {
    storage.deleteDayTemplate(id)
    setDayTemplates(storage.getDayTemplates())
  }, [])

  const renameDayTemplate = useCallback((id: string, name: string) => {
    storage.updateDayTemplate(id, { name })
    setDayTemplates(storage.getDayTemplates())
  }, [])

  // ── Week Templates ──

  const saveWeekTemplate = useCallback((
    name: string,
    _weekDates: string[],
    weekLogs: { date: string; log: DayLog | null }[],
  ) => {
    const days = {} as Record<DayKey, DayTemplate | null>
    let totalCalories = 0

    DAY_KEYS.forEach((key, i) => {
      const log = weekLogs[i]?.log
      if (log && [...log.breakfast, ...log.lunch, ...log.dinner, ...log.snack].length > 0) {
        const totals = sumDaySlots(log.breakfast, log.lunch, log.dinner, log.snack)
        days[key] = {
          id: `dt_inline_${Date.now()}_${i}`,
          name: key,
          breakfast: log.breakfast,
          lunch: log.lunch,
          dinner: log.dinner,
          snack: log.snack,
          ...totals,
          createdAt: new Date().toISOString(),
        }
        totalCalories += totals.totalCalories
      } else {
        days[key] = null
      }
    })

    const template: WeekTemplate = {
      id: `wt_${Date.now()}`,
      name,
      days,
      totalCalories,
      createdAt: new Date().toISOString(),
    }
    storage.addWeekTemplate(template)
    setWeekTemplates(storage.getWeekTemplates())
    return template
  }, [])

  const deleteWeekTemplate = useCallback((id: string) => {
    storage.deleteWeekTemplate(id)
    setWeekTemplates(storage.getWeekTemplates())
  }, [])

  const renameWeekTemplate = useCallback((id: string, name: string) => {
    storage.updateWeekTemplate(id, { name })
    setWeekTemplates(storage.getWeekTemplates())
  }, [])

  // ── Apply templates ──

  const applyDayTemplate = useCallback((
    dateKey: string,
    template: DayTemplate,
    mode: 'replace' | 'append',
  ) => {
    if (mode === 'replace') {
      storage.setDayLog({
        date: dateKey,
        breakfast: [...template.breakfast],
        lunch: [...template.lunch],
        dinner: [...template.dinner],
        snack: [...template.snack],
      })
    } else {
      const existing = storage.getDayLog(dateKey)
      storage.setDayLog({
        date: dateKey,
        breakfast: [...existing.breakfast, ...template.breakfast],
        lunch: [...existing.lunch, ...template.lunch],
        dinner: [...existing.dinner, ...template.dinner],
        snack: [...existing.snack, ...template.snack],
      })
    }
  }, [])

  const applyWeekTemplate = useCallback((
    weekDates: string[],
    template: WeekTemplate,
  ) => {
    DAY_KEYS.forEach((key, i) => {
      const dayTemplate = template.days[key]
      const dateKey = weekDates[i]
      if (!dateKey) return
      if (dayTemplate) {
        storage.setDayLog({
          date: dateKey,
          breakfast: [...dayTemplate.breakfast],
          lunch: [...dayTemplate.lunch],
          dinner: [...dayTemplate.dinner],
          snack: [...dayTemplate.snack],
        })
      } else {
        storage.clearDayLog(dateKey)
      }
    })
  }, [])

  return {
    // Data
    savedMeals,
    dayTemplates,
    weekTemplates,
    // Saved meals
    saveMeal,
    getMealsForSlot,
    deleteSavedMeal,
    renameSavedMeal,
    // Day templates
    saveDayTemplate,
    deleteDayTemplate,
    renameDayTemplate,
    // Week templates
    saveWeekTemplate,
    deleteWeekTemplate,
    renameWeekTemplate,
    // Apply
    applyDayTemplate,
    applyWeekTemplate,
    // Refresh
    refresh,
  }
}

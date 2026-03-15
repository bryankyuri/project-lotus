import { useMemo } from 'react'
import { storage, type NutritionTargets } from '../store/localStorage'

interface NutritionProgress {
  calories: { value: number; target: number; pct: number }
  protein: { value: number; target: number; pct: number }
  carbs: { value: number; target: number; pct: number }
  fat: { value: number; target: number; pct: number }
}

/**
 * Computes progress percentages for a given day's totals vs user targets.
 */
export function useNutritionProgress(totals: {
  calories: number
  protein: number
  carbs: number
  fat: number
}): NutritionProgress {
  const targets: NutritionTargets = useMemo(() => storage.getTargets(), [])

  return useMemo(() => {
    const make = (value: number, target: number) => ({
      value,
      target,
      pct: target > 0 ? Math.min((value / target) * 100, 100) : 0,
    })

    return {
      calories: make(totals.calories, targets.calories),
      protein: make(totals.protein, targets.protein),
      carbs: make(totals.carbs, targets.carbs),
      fat: make(totals.fat, targets.fat),
    }
  }, [totals, targets])
}

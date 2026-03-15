import type { Gender } from '../store/localStorage'

/**
 * Calculate age in years from a date of birth string (YYYY-MM-DD).
 */
export function calculateAge(dob: string): number {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

/**
 * Calculate Basal Metabolic Rate using the Mifflin-St Jeor equation.
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
): number {
  const base = 10 * weight + 6.25 * height - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

/**
 * Suggest macro targets based on BMR using balanced macro split.
 */
export function suggestTargetsFromBMR(bmr: number) {
  const tdee = Math.round(bmr * 1.2)
  return {
    calories: tdee,
    protein: Math.round((tdee * 0.3) / 4),
    carbs: Math.round((tdee * 0.45) / 4),
    fat: Math.round((tdee * 0.25) / 9),
  }
}

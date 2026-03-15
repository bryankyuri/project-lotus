/**
 * Exercise catalog with MET (Metabolic Equivalent of Task) values.
 * MET values sourced from the Compendium of Physical Activities.
 *
 * Calorie formula: calories = MET × weight_kg × duration_hours
 */

export interface ExerciseEntry {
  key: string
  emoji: string
  met: number          // MET value
  category: 'cardio' | 'strength' | 'sport' | 'daily' | 'flexibility'
}

export const EXERCISE_CATALOG: ExerciseEntry[] = [
  // ─── Cardio ─────────────────────────────────────────────
  { key: 'running',           emoji: '🏃', met: 9.8,  category: 'cardio' },
  { key: 'running_slow',      emoji: '🏃', met: 7.0,  category: 'cardio' },
  { key: 'walking',           emoji: '🚶', met: 3.5,  category: 'cardio' },
  { key: 'walking_brisk',     emoji: '🚶', met: 5.0,  category: 'cardio' },
  { key: 'cycling',           emoji: '🚴', met: 7.5,  category: 'cardio' },
  { key: 'cycling_light',     emoji: '🚴', met: 4.0,  category: 'cardio' },
  { key: 'swimming',          emoji: '🏊', met: 7.0,  category: 'cardio' },
  { key: 'jump_rope',         emoji: '⏭️', met: 12.3, category: 'cardio' },
  { key: 'hiit',              emoji: '🔥', met: 8.0,  category: 'cardio' },
  { key: 'stair_climbing',    emoji: '🪜', met: 8.8,  category: 'cardio' },
  { key: 'elliptical',        emoji: '🏋️', met: 5.0,  category: 'cardio' },
  { key: 'rowing',            emoji: '🚣', met: 7.0,  category: 'cardio' },

  // ─── Strength ───────────────────────────────────────────
  { key: 'weight_training',   emoji: '🏋️', met: 6.0,  category: 'strength' },
  { key: 'push_ups',          emoji: '💪', met: 8.0,  category: 'strength' },
  { key: 'pull_ups',          emoji: '💪', met: 8.0,  category: 'strength' },
  { key: 'resistance_band',   emoji: '🏋️', met: 4.3,  category: 'strength' },
  { key: 'bodyweight',        emoji: '🤸', met: 5.0,  category: 'strength' },

  // ─── Sports ─────────────────────────────────────────────
  { key: 'badminton',         emoji: '🏸', met: 5.5,  category: 'sport' },
  { key: 'basketball',        emoji: '🏀', met: 6.5,  category: 'sport' },
  { key: 'football',          emoji: '⚽', met: 7.0,  category: 'sport' },
  { key: 'futsal',            emoji: '⚽', met: 8.0,  category: 'sport' },
  { key: 'tennis',            emoji: '🎾', met: 7.3,  category: 'sport' },
  { key: 'table_tennis',      emoji: '🏓', met: 4.0,  category: 'sport' },
  { key: 'volleyball',        emoji: '🏐', met: 4.0,  category: 'sport' },
  { key: 'martial_arts',      emoji: '🥋', met: 10.3, category: 'sport' },
  { key: 'boxing',            emoji: '🥊', met: 7.8,  category: 'sport' },
  { key: 'golf',              emoji: '⛳', met: 3.5,  category: 'sport' },

  // ─── Daily / Lifestyle ─────────────────────────────────
  { key: 'house_cleaning',    emoji: '🧹', met: 3.3,  category: 'daily' },
  { key: 'gardening',         emoji: '🌱', met: 3.8,  category: 'daily' },
  { key: 'dancing',           emoji: '💃', met: 5.5,  category: 'daily' },
  { key: 'cooking',           emoji: '🍳', met: 2.0,  category: 'daily' },

  // ─── Flexibility / Mind-body ────────────────────────────
  { key: 'yoga',              emoji: '🧘', met: 3.0,  category: 'flexibility' },
  { key: 'pilates',           emoji: '🧘', met: 3.8,  category: 'flexibility' },
  { key: 'stretching',        emoji: '🤸', met: 2.3,  category: 'flexibility' },
  { key: 'tai_chi',           emoji: '🧘', met: 3.0,  category: 'flexibility' },
]

export const EXERCISE_CATEGORIES = ['cardio', 'strength', 'sport', 'daily', 'flexibility'] as const
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number]

/**
 * Calculate calories burned from MET value.
 * Formula: calories = MET × weight_kg × (duration_minutes / 60)
 */
export function calculateCaloriesBurned(
  met: number,
  weightKg: number,
  durationMinutes: number,
): number {
  return Math.round(met * weightKg * (durationMinutes / 60))
}

/**
 * Calculate BMR using Mifflin-St Jeor equation.
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: 'male' | 'female',
): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5)
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161)
}

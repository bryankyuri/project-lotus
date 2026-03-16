// ─── Storage Keys ────────────────────────────────────────

const STORAGE_KEYS = {
  PROFILE: 'mp_profile',
  DAYLOG: 'mp_daylog',
  EXERCISES: 'mp_exercises',
  TARGETS: 'mp_targets',
  SETTINGS: 'mp_settings',
  LANGUAGE: 'mp_language',
  GROCERY_CHECKED: 'mp_grocery_checked',
  ONBOARDING_DONE: 'mp_onboarding_done',
  SAVED_MEALS: 'mp_saved_meals',
  DAY_TEMPLATES: 'mp_day_templates',
  WEEK_TEMPLATES: 'mp_week_templates',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

// ─── Types ───────────────────────────────────────────────

export type SlotType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type Gender = 'male' | 'female'

/** A single food entry logged into a meal slot */
export interface LoggedFood {
  food_id: number
  food_name: string
  portion_id: number | null   // null = raw grams entry
  portion_label: string       // e.g. "1 sdm (15g)" or "100g"
  quantity: number            // how many of that portion
  grams: number              // total grams after quantity calc
  calories: number
  protein: number
  carbs: number
  fat: number
}

/** A single day's food log, keyed by date string */
export interface DayLog {
  date: string                // 'YYYY-MM-DD'
  breakfast: LoggedFood[]
  lunch: LoggedFood[]
  dinner: LoggedFood[]
  snack: LoggedFood[]
}

/** A logged exercise entry */
export interface LoggedExercise {
  id: string                  // unique id (timestamp-based)
  activity_key: string        // key into EXERCISE_CATALOG
  duration_minutes: number
  calories_burned: number
}

export interface UserProfile {
  name: string
  weight: number              // kg
  height: number              // cm
  gender: Gender
  date_of_birth: string       // 'YYYY-MM-DD'
  bmr: number
  created_at: string
}

export interface NutritionTargets {
  calories: number
  protein: number             // grams
  carbs: number               // grams
  fat: number                 // grams
}

export interface AppSettings {
  language: string
}

// ─── Template Types ──────────────────────────────────────

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

/** Level 1 — A saved group of foods for a single meal slot */
export interface SavedMeal {
  id: string
  name: string
  slot: SlotType
  foods: LoggedFood[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  createdAt: string
}

/** Level 2 — A saved full-day plan */
export interface DayTemplate {
  id: string
  name: string
  breakfast: LoggedFood[]
  lunch: LoggedFood[]
  dinner: LoggedFood[]
  snack: LoggedFood[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  createdAt: string
}

/** Level 3 — A saved 7-day plan */
export interface WeekTemplate {
  id: string
  name: string
  days: Record<DayKey, DayTemplate | null>
  totalCalories: number
  createdAt: string
}

// ─── Defaults ────────────────────────────────────────────

export const DEFAULT_TARGETS: NutritionTargets = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
}

export function createEmptyDayLog(date: string): DayLog {
  return { date, breakfast: [], lunch: [], dinner: [], snack: [] }
}

// ─── Generic helpers ─────────────────────────────────────

function get<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function set<T>(key: StorageKey, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function remove(key: StorageKey): void {
  localStorage.removeItem(key)
}

// ─── Date helper ─────────────────────────────────────────

export function toDateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10)
}

// ─── Typed accessors ─────────────────────────────────────

export const storage = {
  // ── Profile ──
  getProfile: (): UserProfile | null => get<UserProfile | null>(STORAGE_KEYS.PROFILE, null),
  setProfile: (profile: UserProfile) => set(STORAGE_KEYS.PROFILE, profile),
  hasProfile: (): boolean => storage.getProfile() !== null,
  clearProfile: () => remove(STORAGE_KEYS.PROFILE),

  // ── Day Logs ──
  getAllDayLogs: (): Record<string, DayLog> => get(STORAGE_KEYS.DAYLOG, {}),

  getDayLog: (date: string): DayLog => {
    const all = storage.getAllDayLogs()
    return all[date] ?? createEmptyDayLog(date)
  },

  setDayLog: (log: DayLog) => {
    const all = storage.getAllDayLogs()
    all[log.date] = log
    set(STORAGE_KEYS.DAYLOG, all)
  },

  addFoodToSlot: (date: string, slot: SlotType, food: LoggedFood) => {
    const log = storage.getDayLog(date)
    log[slot] = [...log[slot], food]
    storage.setDayLog(log)
  },

  removeFoodFromSlot: (date: string, slot: SlotType, index: number) => {
    const log = storage.getDayLog(date)
    log[slot] = log[slot].filter((_, i) => i !== index)
    storage.setDayLog(log)
  },

  updateFoodInSlot: (date: string, slot: SlotType, index: number, food: LoggedFood) => {
    const log = storage.getDayLog(date)
    log[slot] = log[slot].map((f, i) => (i === index ? food : f))
    storage.setDayLog(log)
  },

  clearDayLog: (date: string) => {
    const all = storage.getAllDayLogs()
    delete all[date]
    set(STORAGE_KEYS.DAYLOG, all)
  },

  // ── Targets ──
  getTargets: (): NutritionTargets => get(STORAGE_KEYS.TARGETS, DEFAULT_TARGETS),
  setTargets: (targets: NutritionTargets) => set(STORAGE_KEYS.TARGETS, targets),

  // ── Settings ──
  getSettings: (): AppSettings => get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  setSettings: (settings: AppSettings) => set(STORAGE_KEYS.SETTINGS, settings),

  // ── Language shortcut ──
  getLanguage: (): string => localStorage.getItem(STORAGE_KEYS.LANGUAGE) ?? 'en',
  setLanguage: (lang: string) => localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang),

  // ── Onboarding ──
  isOnboardingDone: (): boolean => localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true',
  setOnboardingDone: () => localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true'),

  // ── Grocery checked items ──
  getGroceryChecked: (): string[] => get(STORAGE_KEYS.GROCERY_CHECKED, []),
  setGroceryChecked: (ids: string[]) => set(STORAGE_KEYS.GROCERY_CHECKED, ids),
  toggleGroceryItem: (id: string) => {
    const checked = storage.getGroceryChecked()
    const next = checked.includes(id) ? checked.filter((i) => i !== id) : [...checked, id]
    storage.setGroceryChecked(next)
    return next
  },

  // ── Exercises ──
  getAllExerciseLogs: (): Record<string, LoggedExercise[]> => get(STORAGE_KEYS.EXERCISES, {}),

  getExercises: (date: string): LoggedExercise[] => {
    const all = storage.getAllExerciseLogs()
    return all[date] ?? []
  },

  addExercise: (date: string, exercise: LoggedExercise) => {
    const all = storage.getAllExerciseLogs()
    all[date] = [...(all[date] ?? []), exercise]
    set(STORAGE_KEYS.EXERCISES, all)
  },

  removeExercise: (date: string, id: string) => {
    const all = storage.getAllExerciseLogs()
    all[date] = (all[date] ?? []).filter((e) => e.id !== id)
    set(STORAGE_KEYS.EXERCISES, all)
  },

  // ── Saved Meals ──
  getSavedMeals: (): SavedMeal[] => get(STORAGE_KEYS.SAVED_MEALS, []),
  setSavedMeals: (meals: SavedMeal[]) => set(STORAGE_KEYS.SAVED_MEALS, meals),

  addSavedMeal: (meal: SavedMeal) => {
    const all = storage.getSavedMeals()
    storage.setSavedMeals([...all, meal])
  },

  updateSavedMeal: (id: string, updates: Partial<Omit<SavedMeal, 'id'>>) => {
    const all = storage.getSavedMeals()
    storage.setSavedMeals(all.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  },

  deleteSavedMeal: (id: string) => {
    storage.setSavedMeals(storage.getSavedMeals().filter((m) => m.id !== id))
  },

  // ── Day Templates ──
  getDayTemplates: (): DayTemplate[] => get(STORAGE_KEYS.DAY_TEMPLATES, []),
  setDayTemplates: (templates: DayTemplate[]) => set(STORAGE_KEYS.DAY_TEMPLATES, templates),

  addDayTemplate: (template: DayTemplate) => {
    const all = storage.getDayTemplates()
    storage.setDayTemplates([...all, template])
  },

  updateDayTemplate: (id: string, updates: Partial<Omit<DayTemplate, 'id'>>) => {
    const all = storage.getDayTemplates()
    storage.setDayTemplates(all.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  },

  deleteDayTemplate: (id: string) => {
    storage.setDayTemplates(storage.getDayTemplates().filter((t) => t.id !== id))
  },

  // ── Week Templates ──
  getWeekTemplates: (): WeekTemplate[] => get(STORAGE_KEYS.WEEK_TEMPLATES, []),
  setWeekTemplates: (templates: WeekTemplate[]) => set(STORAGE_KEYS.WEEK_TEMPLATES, templates),

  addWeekTemplate: (template: WeekTemplate) => {
    const all = storage.getWeekTemplates()
    storage.setWeekTemplates([...all, template])
  },

  updateWeekTemplate: (id: string, updates: Partial<Omit<WeekTemplate, 'id'>>) => {
    const all = storage.getWeekTemplates()
    storage.setWeekTemplates(all.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  },

  deleteWeekTemplate: (id: string) => {
    storage.setWeekTemplates(storage.getWeekTemplates().filter((t) => t.id !== id))
  },

  // ── Clear all ──
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach((key) => remove(key))
  },
}

export { STORAGE_KEYS }

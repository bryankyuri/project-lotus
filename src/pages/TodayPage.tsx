import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MapPin, Flame, Clock, Equal, TrendingDown, TrendingUp, Utensils, Dumbbell } from 'lucide-react'
import { useDayLog } from '../hooks/useDayLog'
import { useNutritionProgress } from '../hooks/useNutritionProgress'
import { useDateTime } from '../hooks/useDateTime'
import { useWeather } from '../hooks/useWeather'
import { useExercise } from '../hooks/useExercise'
import { ProgressRing, AnimatedNumber, MealSlotCard, FoodModal } from '../components/ui'
import type { SlotType, LoggedFood, LoggedExercise } from '../store/localStorage'
import { storage } from '../store/localStorage'
import { EXERCISE_CATALOG } from '../data/exerciseCatalog'
import { variants } from '../utils/animations'
import { FoodAddSheet } from './sheets/FoodAddSheet'
import { ExerciseAddSheet } from './sheets/ExerciseAddSheet'

type ActiveTab = 'meals' | 'exercise'

export default function TodayPage() {
  const { t, i18n } = useTranslation()
  const { dayLog, totals, addFood, removeFood } = useDayLog()
  const progress = useNutritionProgress(totals)
  const profile = storage.getProfile()

  // Clock & weather
  const { time, seconds, date } = useDateTime()
  const weather = useWeather(i18n.language)

  // Exercise
  const { exercises, totalBurned, totalMinutes, addExercise, removeExercise } = useExercise()

  // UI state
  const [addingSlot, setAddingSlot] = useState<SlotType | null>(null)
  const [showExerciseSheet, setShowExerciseSheet] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('meals')

  const handleAddFood = useCallback((slot: SlotType) => {
    setAddingSlot(slot)
  }, [])

  const handleFoodSelected = useCallback(
    (food: LoggedFood) => {
      if (addingSlot) {
        addFood(addingSlot, food)
        setAddingSlot(null)
      }
    },
    [addingSlot, addFood],
  )

  const handleExerciseAdded = useCallback(
    (exercise: LoggedExercise) => {
      addExercise(exercise)
      setShowExerciseSheet(false)
    },
    [addExercise],
  )

  // Energy balance
  const bmr = profile?.bmr ?? 1800
  const caloriesIn = Math.round(totals.calories)
  const netCalories = caloriesIn - bmr - totalBurned
  const isDeficit = netCalories < 0

  const greeting = profile?.name
    ? t('today.greeting', { name: profile.name })
    : t('today.greeting_default')

  const slots: SlotType[] = ['breakfast', 'lunch', 'dinner', 'snack']

  const DATE_LOCALE_MAP: Record<string, string> = {
    en: 'en-US', id: 'id-ID', zh: 'zh-CN', ar: 'ar-SA',
    ja: 'ja-JP', ko: 'ko-KR', ru: 'ru-RU', fr: 'fr-FR',
    de: 'de-DE', es: 'es-ES', nl: 'nl-NL', hi: 'hi-IN',
  }
  const dateLocale = DATE_LOCALE_MAP[i18n.language] ?? 'en-US'

  const formattedDate = date.toLocaleDateString(dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="px-5 py-6 space-y-5 max-w-5xl mx-auto">
      {/* ── Row 1: Greeting ── */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <h1 className="text-2xl font-bold text-text">{greeting}</h1>
      </motion.div>

      {/* ── Row 2: Weather | Time + Date ── */}
      <motion.div
        variants={variants.fadeInUp}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {/* Weather card */}
        <div className="bg-white rounded-2xl shadow-card px-4 py-3 flex items-center gap-3 min-h-17">
          {!weather.isLoading && weather.city ? (
            <>
              <span className="text-3xl leading-none">{weather.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text">
                  {weather.temperature}°C · {weather.description}
                </p>
                <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="shrink-0" />
                  {weather.city}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <span className="text-2xl">🌤️</span>
              <span>{t('common.loading')}</span>
            </div>
          )}
        </div>

        {/* Time + Date card */}
        <div className="bg-white rounded-2xl shadow-card px-4 py-3 flex items-center justify-between min-h-17">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-secondary leading-tight">{formattedDate}</p>
          </div>
          <div className="text-right shrink-0 pl-4">
            <p className="text-3xl font-bold text-text tabular-nums tracking-tight leading-none">
              {time}
              <span className="text-sm font-medium text-text-secondary">:{seconds}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Row 3: Nutrition Progress | Energy Balance ── */}
      <motion.div
        variants={variants.fadeInUp}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {/* Nutrition progress card */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            {t('today.daily_progress')}
          </p>
          <div className="flex items-center gap-5">
            {(() => {
              const isOver = totals.calories > progress.calories.target
              const ringGradient: [string, string] = isOver
                ? ['#FCA5A5', '#DC2626']
                : ['#BEF264', '#4ADE80']
              return (
                <ProgressRing
                  value={totals.calories}
                  max={progress.calories.target}
                  size={100}
                  strokeWidth={14}
                  gradientColors={ringGradient}
                  labelColor={isOver ? '#DC2626' : undefined}
                  label={Math.round(totals.calories).toString()}
                  sublabel={`/ ${progress.calories.target} ${t('today.kcal')}`}
                />
              )
            })()}
            <div className="flex-1 space-y-2.5">
              {[
                { key: 'protein', val: progress.protein, gradient: 'linear-gradient(90deg, #A5C8FF, #5B8DEF)', label: t('today.protein') },
                { key: 'carbs',   val: progress.carbs,   gradient: 'linear-gradient(90deg, #BBF7D0, #7AC74F)', label: t('today.carbs') },
                { key: 'fat',     val: progress.fat,     gradient: 'linear-gradient(90deg, #FEF08A, #FFB800)', label: t('today.fat') },
              ].map(({ key, val, gradient, label }) => {
                const isOver = val.value > val.target
                const barGradient = isOver
                  ? 'linear-gradient(90deg, #FCA5A5, #DC2626)'
                  : gradient
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">{label}</span>
                      <span className="font-semibold" style={{ color: isOver ? '#DC2626' : 'var(--color-text)' }}>
                        <AnimatedNumber value={val.value} decimals={1} />
                        <span className="text-text-secondary font-normal"> / {val.target}{t('today.g')}</span>
                      </span>
                    </div>
                    <div className="h-3 bg-border rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: barGradient }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(val.pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Energy Balance card */}
        <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
            {isDeficit ? <TrendingDown size={13} className="text-green-500" /> : <TrendingUp size={13} className="text-red-500" />}
            {t('exercise.energy_balance')}
          </p>

          <div className="space-y-2 flex-1">
            {/* Food intake */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">🍽️</span>
                {t('exercise.food_intake')}
              </span>
              <span className="text-sm font-semibold text-text tabular-nums">+{caloriesIn}</span>
            </div>

            {/* BMR */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">🫀</span>
                {t('exercise.bmr')}
              </span>
              <span className="text-sm font-semibold text-text tabular-nums">−{bmr}</span>
            </div>

            {/* Exercise */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-[10px]">🔥</span>
                {t('exercise.exercise_burned')}
              </span>
              <span className="text-sm font-semibold text-text tabular-nums">−{totalBurned}</span>
            </div>

            <div className="border-t border-border" />

            {/* Net */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text flex items-center gap-2">
                <Equal size={13} className="text-text-secondary" />
                {t('exercise.net_calories')}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold tabular-nums ${isDeficit ? 'text-green-600' : 'text-red-500'}`}>
                  {netCalories > 0 ? '+' : ''}{netCalories}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isDeficit ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {isDeficit ? t('exercise.deficit') : t('exercise.surplus')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Row 4: Tabs (Meals / Exercise) ── */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate" className="space-y-4">
        {/* Tab bar */}
        <div className="flex bg-white rounded-2xl shadow-card p-1 gap-1">
          {[
            { key: 'meals' as ActiveTab, icon: <Utensils size={15} />, label: t('today.meals'), badge: dayLog.breakfast.length + dayLog.lunch.length + dayLog.dinner.length + dayLog.snack.length },
            { key: 'exercise' as ActiveTab, icon: <Dumbbell size={15} />, label: t('exercise.title'), badge: exercises.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-gradient-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-primary-light hover:text-primary-dark'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-border text-text-secondary'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'meals' ? (
            <motion.div
              key="meals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-text">{t('today.meals')}</h2>
                <button
                  onClick={() => setAddingSlot('snack')}
                  className="text-xs text-primary-dark font-semibold flex items-center gap-1"
                >
                  <Plus size={14} />
                  {t('today.quick_add')}
                </button>
              </div>
              {slots.map((slot) => (
                <MealSlotCard
                  key={slot}
                  slot={slot}
                  foods={dayLog[slot]}
                  onAddFood={() => handleAddFood(slot)}
                  onRemoveFood={(index) => removeFood(slot, index)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-text flex items-center gap-2">
                  <Flame size={16} className="text-orange-500" />
                  {t('exercise.title')}
                </h2>
                <button
                  onClick={() => setShowExerciseSheet(true)}
                  className="text-xs text-primary-dark font-semibold flex items-center gap-1"
                >
                  <Plus size={14} />
                  {t('exercise.add')}
                </button>
              </div>

              {/* Exercise list card */}
              <div className="bg-white rounded-2xl shadow-card p-4">
                {exercises.length === 0 ? (
                  <p className="text-xs text-text-secondary py-2">{t('exercise.tap_to_add')}</p>
                ) : (
                  <div className="space-y-2">
                    {exercises.map((ex) => {
                      const entry = EXERCISE_CATALOG.find((c) => c.key === ex.activity_key)
                      return (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between py-1.5 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="text-lg">{entry?.emoji ?? '🏃'}</span>
                            <div className="min-w-0">
                              <p className="text-sm text-text truncate">{t(`exercise.${ex.activity_key}`)}</p>
                              <p className="text-[10px] text-text-secondary flex items-center gap-1">
                                <Clock size={9} />
                                {ex.duration_minutes} {t('exercise.minutes')} · {ex.calories_burned} kcal
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeExercise(ex.id)}
                            className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                          >
                            {t('exercise.remove')}
                          </button>
                        </div>
                      )
                    })}
                    <div className="flex justify-between pt-2 border-t border-border text-xs">
                      <span className="text-text-secondary">
                        {t('exercise.total_minutes', { count: totalMinutes })}
                      </span>
                      <span className="font-semibold text-orange-600">
                        {totalBurned} kcal {t('exercise.total_burned').toLowerCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Modals ── */}
      <FoodModal
        open={addingSlot !== null}
        onClose={() => setAddingSlot(null)}
        title={addingSlot ? t(`today.${addingSlot}`) + ' — ' + t('today.add_food') : ''}
      >
        {addingSlot && <FoodAddSheet onSelect={handleFoodSelected} />}
      </FoodModal>

      <FoodModal
        open={showExerciseSheet}
        onClose={() => setShowExerciseSheet(false)}
        title={t('exercise.add_exercise')}
      >
        <ExerciseAddSheet onAdd={handleExerciseAdded} />
      </FoodModal>
    </div>
  )
}

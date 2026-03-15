import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Search, Clock, Flame, Plus } from 'lucide-react'
import {
  EXERCISE_CATALOG,
  EXERCISE_CATEGORIES,
  calculateCaloriesBurned,
  type ExerciseEntry,
  type ExerciseCategory,
} from '../../data/exerciseCatalog'
import { storage, type LoggedExercise } from '../../store/localStorage'
import { Chip } from '../../components/ui'

interface ExerciseAddSheetProps {
  readonly onAdd: (exercise: LoggedExercise) => void
}

export function ExerciseAddSheet({ onAdd }: ExerciseAddSheetProps) {
  const { t } = useTranslation()
  const profile = storage.getProfile()
  const weight = profile?.weight ?? 65

  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | null>(null)
  const [selected, setSelected] = useState<ExerciseEntry | null>(null)
  const [duration, setDuration] = useState(30)

  // Filter exercises
  const filtered = useMemo(() => {
    let list = EXERCISE_CATALOG
    if (activeCategory) {
      list = list.filter((e) => e.category === activeCategory)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((e) => {
        const name = t(`exercise.${e.key}`, e.key).toLowerCase()
        return name.includes(q) || e.key.includes(q)
      })
    }
    return list
  }, [query, activeCategory, t])

  // Calories preview
  const caloriesPreview = useMemo(() => {
    if (!selected) return 0
    return calculateCaloriesBurned(selected.met, weight, duration)
  }, [selected, weight, duration])

  const handleAdd = () => {
    if (!selected) return
    const exercise: LoggedExercise = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      activity_key: selected.key,
      duration_minutes: duration,
      calories_burned: caloriesPreview,
    }
    onAdd(exercise)
    // Reset
    setSelected(null)
    setDuration(30)
  }

  const categoryIcons: Record<ExerciseCategory, string> = {
    cardio: '❤️',
    strength: '💪',
    sport: '⚽',
    daily: '🏠',
    flexibility: '🧘',
  }

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* If an exercise is selected, show config */}
      {selected ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Selected exercise header */}
          <div className="flex items-center gap-3 bg-bg rounded-2xl p-4">
            <span className="text-3xl">{selected.emoji}</span>
            <div className="flex-1">
              <p className="font-bold text-text">{t(`exercise.${selected.key}`)}</p>
              <p className="text-xs text-text-secondary">
                MET {selected.met} · {t(`exercise.cat_${selected.category}`)}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-primary-dark font-semibold"
            >
              {t('common.change')}
            </button>
          </div>

          {/* Duration input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text flex items-center gap-1.5">
              <Clock size={14} className="text-text-secondary" />
              {t('exercise.duration')}
            </label>
            <div className="flex items-center gap-3">
              {/* Quick presets */}
              {[15, 30, 45, 60, 90].map((min) => (
                <button
                  key={min}
                  onClick={() => setDuration(min)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    duration === min
                      ? 'bg-gradient-primary text-white shadow-sm'
                      : 'bg-white border border-border text-text-secondary hover:bg-primary-light hover:text-primary-dark hover:border-primary-light'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
            {/* Custom input */}
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
                className="w-full h-11 px-4 rounded-xl bg-white border border-border text-[16px] text-text focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                {t('exercise.minutes')}
              </span>
            </div>
          </div>

          {/* Calories preview */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 flex items-center gap-3">
            <Flame size={24} className="text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-text">{caloriesPreview}</p>
              <p className="text-xs text-text-secondary">{t('exercise.calories_burned')}</p>
            </div>
            <div className="flex-1 text-right text-xs text-text-secondary">
              {t('exercise.based_on_weight', { weight })}
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            className="w-full h-12 rounded-2xl bg-gradient-primary text-white font-bold text-sm flex items-center justify-center gap-2 bg-gradient-primary-hover transition-colors shadow-sm"
          >
            <Plus size={16} />
            {t('exercise.add_exercise')}
          </button>
        </motion.div>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('exercise.search_placeholder')}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-border text-[16px] shadow-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <Chip
              label={t('explore.all_categories')}
              active={!activeCategory}
              onClick={() => setActiveCategory(null)}
            />
            {EXERCISE_CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                label={t(`exercise.cat_${cat}`)}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                icon={<span className="text-xs">{categoryIcons[cat]}</span>}
              />
            ))}
          </div>

          {/* Exercise list */}
          <div className="space-y-1 overflow-y-auto max-h-[50vh] no-scrollbar">
            {filtered.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-8">
                {t('explore.no_results')}
              </p>
            ) : (
              filtered.map((entry) => (
                <button
                  key={entry.key}
                  onClick={() => setSelected(entry)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-xl">{entry.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text">{t(`exercise.${entry.key}`)}</p>
                    <p className="text-[10px] text-text-secondary">
                      MET {entry.met} · {t(`exercise.cat_${entry.category}`)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-text-secondary">
                      ~{calculateCaloriesBurned(entry.met, weight, 30)} kcal
                    </p>
                    <p className="text-[10px] text-text-secondary/60">30 min</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

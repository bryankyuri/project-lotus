import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { Button, EmptyState } from '../../components/ui'
import type { SavedMeal, DayTemplate, WeekTemplate } from '../../store/localStorage'

// ─── Saved Meal Picker ───────────────────────────────────

interface LoadSavedMealSheetProps {
  readonly meals: SavedMeal[]
  readonly onSelect: (meal: SavedMeal) => void
  readonly onDelete?: (id: string) => void
}

export function LoadSavedMealSheet({ meals, onSelect, onDelete }: LoadSavedMealSheetProps) {
  const { t } = useTranslation()

  if (meals.length === 0) {
    return <EmptyState title={t('templates.empty_meals')} />
  }

  return (
    <div className="space-y-2 pb-4">
      {meals.map((meal) => (
        <button
          key={meal.id}
          onClick={() => onSelect(meal)}
          className="w-full text-left bg-bg rounded-2xl p-3 hover:bg-gray-100 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text truncate">{meal.name}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">
                {meal.foods.length} {t('templates.foods_count')} · {Math.round(meal.totalCalories)} kcal
              </p>
              <p className="text-[10px] text-text-secondary">
                P: {Math.round(meal.totalProtein)}g · C: {Math.round(meal.totalCarbs)}g · F: {Math.round(meal.totalFat)}g
              </p>
            </div>
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(meal.id) }}
                className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── Day Template Picker ─────────────────────────────────

interface LoadDayTemplateSheetProps {
  readonly templates: DayTemplate[]
  readonly onSelect: (template: DayTemplate, mode: 'replace' | 'append') => void
  readonly onDelete?: (id: string) => void
}

export function LoadDayTemplateSheet({ templates, onSelect, onDelete }: LoadDayTemplateSheetProps) {
  const { t } = useTranslation()
  const [picked, setPicked] = useState<DayTemplate | null>(null)

  if (templates.length === 0) {
    return <EmptyState title={t('templates.empty_days')} />
  }

  // Confirmation step
  if (picked) {
    return (
      <div className="space-y-4 pb-4">
        <h3 className="font-bold text-text text-base">{picked.name}</h3>
        <p className="text-xs text-text-secondary">{Math.round(picked.totalCalories)} kcal</p>
        <p className="text-sm text-text">{t('templates.replace_confirm')}</p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => onSelect(picked, 'append')}
            className="flex-1"
          >
            {t('templates.add_to_existing')}
          </Button>
          <Button
            onClick={() => onSelect(picked, 'replace')}
            className="flex-1"
          >
            {t('templates.replace')}
          </Button>
        </div>
        <Button variant="secondary" onClick={() => setPicked(null)} className="w-full">
          {t('onboarding.back')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2 pb-4">
      {templates.map((tpl) => (
        <button
          key={tpl.id}
          onClick={() => setPicked(tpl)}
          className="w-full text-left bg-bg rounded-2xl p-3 hover:bg-gray-100 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text truncate">{tpl.name}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">
                {Math.round(tpl.totalCalories)} kcal · P: {Math.round(tpl.totalProtein)}g · C: {Math.round(tpl.totalCarbs)}g · F: {Math.round(tpl.totalFat)}g
              </p>
            </div>
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(tpl.id) }}
                className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── Week Template Picker ────────────────────────────────

interface LoadWeekTemplateSheetProps {
  readonly templates: WeekTemplate[]
  readonly onSelect: (template: WeekTemplate) => void
  readonly onDelete?: (id: string) => void
}

export function LoadWeekTemplateSheet({ templates, onSelect, onDelete }: LoadWeekTemplateSheetProps) {
  const { t } = useTranslation()
  const [picked, setPicked] = useState<WeekTemplate | null>(null)

  if (templates.length === 0) {
    return <EmptyState title={t('templates.empty_weeks')} />
  }

  // Confirmation step
  if (picked) {
    const filledDays = Object.values(picked.days).filter(Boolean).length
    return (
      <div className="space-y-4 pb-4">
        <h3 className="font-bold text-text text-base">{picked.name}</h3>
        <p className="text-xs text-text-secondary">
          {filledDays} {t('templates.days_filled')} · {Math.round(picked.totalCalories)} kcal {t('templates.total')}
        </p>
        <p className="text-sm text-text">{t('templates.replace_week_confirm')}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setPicked(null)} className="flex-1">
            {t('common.cancel')}
          </Button>
          <Button onClick={() => onSelect(picked)} className="flex-1">
            {t('templates.replace')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 pb-4">
      {templates.map((tpl) => {
        const filledDays = Object.values(tpl.days).filter(Boolean).length
        const avgCal = filledDays > 0 ? tpl.totalCalories / filledDays : 0
        return (
          <button
            key={tpl.id}
            onClick={() => setPicked(tpl)}
            className="w-full text-left bg-bg rounded-2xl p-3 hover:bg-gray-100 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text truncate">{tpl.name}</p>
                <p className="text-[10px] text-text-secondary mt-0.5">
                  {filledDays} {t('templates.days_filled')} · ~{Math.round(avgCal)} kcal/{t('templates.per_day')}
                </p>
              </div>
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(tpl.id) }}
                  className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

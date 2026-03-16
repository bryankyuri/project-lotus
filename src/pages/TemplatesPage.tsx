import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Trash2, Pencil } from 'lucide-react'
import { useTemplates } from '../hooks/useTemplates'
import { BottomSheet, EmptyState, Button } from '../components/ui'
import { variants, stagger } from '../utils/animations'
import type { SavedMeal, DayTemplate, WeekTemplate } from '../store/localStorage'

type Tab = 'meals' | 'days' | 'weeks'

export default function TemplatesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    savedMeals,
    dayTemplates,
    weekTemplates,
    deleteSavedMeal,
    renameSavedMeal,
    deleteDayTemplate,
    renameDayTemplate,
    deleteWeekTemplate,
    renameWeekTemplate,
  } = useTemplates()

  const [activeTab, setActiveTab] = useState<Tab>('meals')
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'meals', label: t('templates.saved_meals'), count: savedMeals.length },
    { key: 'days', label: t('templates.day_templates'), count: dayTemplates.length },
    { key: 'weeks', label: t('templates.week_templates'), count: weekTemplates.length },
  ]

  const handleRename = () => {
    if (!renaming?.name.trim()) return
    if (activeTab === 'meals') renameSavedMeal(renaming.id, renaming.name.trim())
    else if (activeTab === 'days') renameDayTemplate(renaming.id, renaming.name.trim())
    else renameWeekTemplate(renaming.id, renaming.name.trim())
    setRenaming(null)
  }

  return (
    <div className="px-5 py-6 space-y-5">
      {/* Header */}
      <motion.div
        variants={variants.fadeInUp}
        initial="initial"
        animate="animate"
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-xl shadow-card flex items-center justify-center text-text-secondary hover:text-text transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-text">{t('templates.title')}</h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-gradient-primary text-white shadow-sm'
                : 'bg-white text-text-secondary hover:bg-gray-50'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        variants={stagger(0.04)}
        initial="initial"
        animate="animate"
        className="space-y-2"
      >
        {activeTab === 'meals' && (
          savedMeals.length === 0 ? (
            <EmptyState title={t('templates.empty_meals')} />
          ) : (
            savedMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onDelete={() => deleteSavedMeal(meal.id)}
                onRename={() => setRenaming({ id: meal.id, name: meal.name })}
                t={t}
              />
            ))
          )
        )}

        {activeTab === 'days' && (
          dayTemplates.length === 0 ? (
            <EmptyState title={t('templates.empty_days')} />
          ) : (
            dayTemplates.map((tpl) => (
              <DayCard
                key={tpl.id}
                template={tpl}
                onDelete={() => deleteDayTemplate(tpl.id)}
                onRename={() => setRenaming({ id: tpl.id, name: tpl.name })}
                t={t}
              />
            ))
          )
        )}

        {activeTab === 'weeks' && (
          weekTemplates.length === 0 ? (
            <EmptyState title={t('templates.empty_weeks')} />
          ) : (
            weekTemplates.map((tpl) => (
              <WeekCard
                key={tpl.id}
                template={tpl}
                onDelete={() => deleteWeekTemplate(tpl.id)}
                onRename={() => setRenaming({ id: tpl.id, name: tpl.name })}
                t={t}
              />
            ))
          )
        )}
      </motion.div>

      {/* Rename Sheet */}
      <BottomSheet
        open={renaming !== null}
        onClose={() => setRenaming(null)}
        title={t('templates.rename')}
      >
        {renaming && (
          <div className="space-y-4 pb-4">
            <input
              type="text"
              value={renaming.name}
              onChange={(e) => setRenaming({ ...renaming, name: e.target.value })}
              className="w-full h-11 px-4 rounded-2xl bg-white border border-border text-[16px] focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setRenaming(null)} className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button onClick={handleRename} className="flex-1" disabled={!renaming.name.trim()}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────

interface CardActionsProps {
  readonly onDelete: () => void
  readonly onRename: () => void
}

function CardActions({ onDelete, onRename }: CardActionsProps) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); onRename() }}
        className="p-2 text-text-secondary hover:text-text transition-colors"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="p-2 text-red-400 hover:text-red-500 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function MealCard({
  meal,
  onDelete,
  onRename,
  t,
}: { meal: SavedMeal } & CardActionsProps & { t: (key: string, opts?: Record<string, unknown>) => string }) {
  return (
    <motion.div variants={variants.fadeInUp} className="bg-white rounded-2xl shadow-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text truncate">{meal.name}</p>
          <p className="text-[10px] text-text-secondary mt-0.5 capitalize">{t(`today.${meal.slot}`)}</p>
          <p className="text-[10px] text-text-secondary">
            {meal.foods.length} {t('templates.foods_count')} · {Math.round(meal.totalCalories)} kcal
          </p>
          <p className="text-[10px] text-text-secondary">
            P: {Math.round(meal.totalProtein)}g · C: {Math.round(meal.totalCarbs)}g · F: {Math.round(meal.totalFat)}g
          </p>
        </div>
        <CardActions onDelete={onDelete} onRename={onRename} />
      </div>
    </motion.div>
  )
}

function DayCard({
  template,
  onDelete,
  onRename,
  t,
}: { template: DayTemplate } & CardActionsProps & { t: (key: string, opts?: Record<string, unknown>) => string }) {
  const foodCount = template.breakfast.length + template.lunch.length + template.dinner.length + template.snack.length
  return (
    <motion.div variants={variants.fadeInUp} className="bg-white rounded-2xl shadow-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text truncate">{template.name}</p>
          <p className="text-[10px] text-text-secondary mt-0.5">
            {foodCount} {t('templates.foods_count')} · {Math.round(template.totalCalories)} kcal
          </p>
          <p className="text-[10px] text-text-secondary">
            P: {Math.round(template.totalProtein)}g · C: {Math.round(template.totalCarbs)}g · F: {Math.round(template.totalFat)}g
          </p>
        </div>
        <CardActions onDelete={onDelete} onRename={onRename} />
      </div>
    </motion.div>
  )
}

function WeekCard({
  template,
  onDelete,
  onRename,
  t,
}: { template: WeekTemplate } & CardActionsProps & { t: (key: string, opts?: Record<string, unknown>) => string }) {
  const filledDays = Object.values(template.days).filter(Boolean).length
  const avgCal = filledDays > 0 ? template.totalCalories / filledDays : 0
  return (
    <motion.div variants={variants.fadeInUp} className="bg-white rounded-2xl shadow-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text truncate">{template.name}</p>
          <p className="text-[10px] text-text-secondary mt-0.5">
            {filledDays} {t('templates.days_filled')} · ~{Math.round(avgCal)} kcal/{t('templates.per_day')}
          </p>
          <p className="text-[10px] text-text-secondary">
            {t('templates.total')}: {Math.round(template.totalCalories)} kcal
          </p>
        </div>
        <CardActions onDelete={onDelete} onRename={onRename} />
      </div>
    </motion.div>
  )
}

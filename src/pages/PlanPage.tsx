import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, ShoppingCart, Check,
  Save, CalendarDays, CalendarRange, ClipboardList,
} from 'lucide-react'
import { useWeekPlan } from '../hooks/useWeekPlan'
import { useDayLog } from '../hooks/useDayLog'
import { useTemplates } from '../hooks/useTemplates'
import { storage, toDateKey, type SlotType, type LoggedFood, type DayTemplate, type WeekTemplate } from '../store/localStorage'
import { MealSlotCard, BottomSheet, FoodModal, EmptyState, Button, useToast } from '../components/ui'
import { variants, stagger } from '../utils/animations'
import { FoodAddSheet } from './sheets/FoodAddSheet'
import { SaveTemplateSheet } from './sheets/SaveTemplateSheet'
import { LoadDayTemplateSheet, LoadWeekTemplateSheet } from './sheets/LoadTemplateSheet'

export default function PlanPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()

  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0)
  const referenceDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + weekOffset * 7)
    return d
  }, [weekOffset])

  const { weekDates, weekLogs, weekSummary, groceryItems } = useWeekPlan(referenceDate)

  // Selected day — default to today if visible in the current week
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = toDateKey()
    return weekDates.includes(today) ? today : weekDates[0]
  })
  const { dayLog, addFood, removeFood, refresh: refreshDay } = useDayLog(selectedDate)

  // Templates
  const templates = useTemplates()

  // Grocery sheet
  const [showGrocery, setShowGrocery] = useState(false)
  const [checkedItems, setCheckedItems] = useState<string[]>(() => storage.getGroceryChecked())

  // Add food sheet
  const [addingSlot, setAddingSlot] = useState<SlotType | null>(null)

  // Template sheets
  const [saveMealSlot, setSaveMealSlot] = useState<{ slot: SlotType; foods: LoggedFood[] } | null>(null)
  const [showSaveDaySheet, setShowSaveDaySheet] = useState(false)
  const [showSaveWeekSheet, setShowSaveWeekSheet] = useState(false)
  const [showLoadDaySheet, setShowLoadDaySheet] = useState(false)
  const [showLoadWeekSheet, setShowLoadWeekSheet] = useState(false)

  const handleFoodSelected = (food: LoggedFood) => {
    if (addingSlot) {
      addFood(addingSlot, food)
      setAddingSlot(null)
    }
  }

  // ── Template handlers ──

  const handleSaveMeal = (slot: SlotType, foods: LoggedFood[]) => {
    setSaveMealSlot({ slot, foods })
  }

  const handleSaveMealConfirm = (name: string) => {
    if (saveMealSlot) {
      templates.saveMeal(name, saveMealSlot.slot, saveMealSlot.foods)
      setSaveMealSlot(null)
      toast.toast(t('templates.saved_success'))
    }
  }

  const handleSaveDayConfirm = (name: string) => {
    templates.saveDayTemplate(name, dayLog)
    setShowSaveDaySheet(false)
    toast.toast(t('templates.saved_success'))
  }

  const handleSaveWeekConfirm = (name: string) => {
    templates.saveWeekTemplate(name, weekDates, weekLogs)
    setShowSaveWeekSheet(false)
    toast.toast(t('templates.saved_success'))
  }

  const handleLoadDay = (template: DayTemplate, mode: 'replace' | 'append') => {
    templates.applyDayTemplate(selectedDate, template, mode)
    setShowLoadDaySheet(false)
    refreshDay()
    toast.toast(t('templates.saved_success'))
  }

  const handleLoadWeek = (template: WeekTemplate) => {
    templates.applyWeekTemplate(weekDates, template)
    setShowLoadWeekSheet(false)
    refreshDay()
    toast.toast(t('templates.saved_success'))
  }

  const toggleGroceryItem = (id: string) => {
    const next = storage.toggleGroceryItem(id)
    setCheckedItems(next)
  }

  const dayLabels = [
    t('plan.mon'), t('plan.tue'), t('plan.wed'), t('plan.thu'),
    t('plan.fri'), t('plan.sat'), t('plan.sun'),
  ]

  const slots: SlotType[] = ['breakfast', 'lunch', 'dinner', 'snack']

  return (
    <div className="px-5 py-6 space-y-5">
      {/* Header */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate" className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">{t('plan.title')}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<ClipboardList size={14} />}
            onClick={() => navigate('/templates')}
          >
            {t('templates.title')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ShoppingCart size={14} />}
            onClick={() => setShowGrocery(true)}
          >
            {t('plan.grocery_list')}
          </Button>
        </div>
      </motion.div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-text">
          {weekOffset === 0 ? t('plan.this_week') : t('plan.week_of', { date: weekDates[0] })}
        </span>
        <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day selector */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDates.map((date, i) => {
          const summary = weekSummary[i]
          const isSelected = date === selectedDate
          const dayNum = new Date(date + 'T00:00:00').getDate()

          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`
                flex flex-col items-center py-2 rounded-xl transition-colors text-center
                ${isSelected ? 'bg-gradient-primary text-white shadow-sm' : 'bg-white hover:bg-gray-50'}
              `}
            >
              <span className="text-[10px] font-medium opacity-70">{dayLabels[i]}</span>
              <span className="text-sm font-bold">{dayNum}</span>
              {summary && summary.foodCount > 0 && (
                <span className="text-[8px] mt-0.5 opacity-60">{Math.round(summary.calories)}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Template quick-actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowSaveDaySheet(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-white rounded-xl px-3 py-1.5 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Save size={12} />
          {t('templates.save_day')}
        </button>
        <button
          onClick={() => setShowLoadDaySheet(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-white rounded-xl px-3 py-1.5 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <CalendarDays size={12} />
          {t('templates.load_day')}
        </button>
        <button
          onClick={() => setShowSaveWeekSheet(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-white rounded-xl px-3 py-1.5 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Save size={12} />
          {t('templates.save_week')}
        </button>
        <button
          onClick={() => setShowLoadWeekSheet(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-white rounded-xl px-3 py-1.5 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <CalendarRange size={12} />
          {t('templates.load_week')}
        </button>
      </div>

      {/* Day's meal slots */}
      <motion.div
        key={selectedDate}
        variants={stagger(0.06)}
        initial="initial"
        animate="animate"
        className="space-y-3"
      >
        {slots.map((slot) => (
          <motion.div key={slot} variants={variants.fadeInUp}>
            <MealSlotCard
              slot={slot}
              foods={dayLog[slot]}
              onAddFood={() => setAddingSlot(slot)}
              onRemoveFood={(index) => removeFood(slot, index)}
              onSaveMeal={handleSaveMeal}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Grocery List Bottom Sheet */}
      <BottomSheet
        open={showGrocery}
        onClose={() => setShowGrocery(false)}
        title={t('plan.grocery_list')}
      >
        {groceryItems.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart />}
            title={t('plan.grocery_empty')}
          />
        ) : (
          <div className="space-y-1 pb-6">
            <p className="text-xs text-text-secondary mb-3">
              {t('plan.items', { count: groceryItems.length })} · {t('plan.checked', { count: checkedItems.length })}
            </p>
            {groceryItems.map((item) => {
              const isChecked = checkedItems.includes(item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => toggleGroceryItem(item.id)}
                  className="w-full flex items-center gap-3 py-2.5 px-1 text-left"
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-gradient-primary border-primary-dark' : 'border-border'
                  }`}>
                    {isChecked && <Check size={12} className="text-white" />}
                  </div>
                  <span className={`text-sm flex-1 ${isChecked ? 'line-through text-text-secondary' : 'text-text'}`}>
                    {item.food_name}
                  </span>
                  <span className="text-xs text-text-secondary">{Math.round(item.total_grams)}g</span>
                </button>
              )
            })}
          </div>
        )}
      </BottomSheet>

      {/* Food Add Modal — bottom sheet on mobile, centered dialog on desktop */}
      <FoodModal
        open={addingSlot !== null}
        onClose={() => setAddingSlot(null)}
        title={addingSlot ? t(`today.${addingSlot}`) + ' — ' + t('today.add_food') : ''}
      >
        {addingSlot && (
          <FoodAddSheet
            onSelect={handleFoodSelected}
            savedMeals={templates.getMealsForSlot(addingSlot)}
            onSelectSavedMeal={(meal) => {
              meal.foods.forEach((f) => addFood(addingSlot, f))
              setAddingSlot(null)
              toast.toast(t('templates.saved_success'))
            }}
          />
        )}
      </FoodModal>

      {/* Save Meal Sheet */}
      <BottomSheet
        open={saveMealSlot !== null}
        onClose={() => setSaveMealSlot(null)}
        title={t('templates.save_meal')}
      >
        {saveMealSlot && (
          <SaveTemplateSheet
            type="meal"
            onSave={handleSaveMealConfirm}
            onCancel={() => setSaveMealSlot(null)}
          />
        )}
      </BottomSheet>

      {/* Save Day Sheet */}
      <BottomSheet
        open={showSaveDaySheet}
        onClose={() => setShowSaveDaySheet(false)}
        title={t('templates.save_day')}
      >
        <SaveTemplateSheet
          type="day"
          onSave={handleSaveDayConfirm}
          onCancel={() => setShowSaveDaySheet(false)}
        />
      </BottomSheet>

      {/* Save Week Sheet */}
      <BottomSheet
        open={showSaveWeekSheet}
        onClose={() => setShowSaveWeekSheet(false)}
        title={t('templates.save_week')}
      >
        <SaveTemplateSheet
          type="week"
          onSave={handleSaveWeekConfirm}
          onCancel={() => setShowSaveWeekSheet(false)}
        />
      </BottomSheet>

      {/* Load Day Template Sheet */}
      <BottomSheet
        open={showLoadDaySheet}
        onClose={() => setShowLoadDaySheet(false)}
        title={t('templates.load_day')}
      >
        <LoadDayTemplateSheet
          templates={templates.dayTemplates}
          onSelect={handleLoadDay}
          onDelete={(id) => templates.deleteDayTemplate(id)}
        />
      </BottomSheet>

      {/* Load Week Template Sheet */}
      <BottomSheet
        open={showLoadWeekSheet}
        onClose={() => setShowLoadWeekSheet(false)}
        title={t('templates.load_week')}
      >
        <LoadWeekTemplateSheet
          templates={templates.weekTemplates}
          onSelect={handleLoadWeek}
          onDelete={(id) => templates.deleteWeekTemplate(id)}
        />
      </BottomSheet>
    </div>
  )
}

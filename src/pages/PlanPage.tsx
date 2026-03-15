import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react'
import { useWeekPlan } from '../hooks/useWeekPlan'
import { useDayLog } from '../hooks/useDayLog'
import { storage, toDateKey, type SlotType } from '../store/localStorage'
import { MealSlotCard, BottomSheet, FoodModal, EmptyState, Button } from '../components/ui'
import { variants, stagger } from '../utils/animations'
import { FoodAddSheet } from './sheets/FoodAddSheet'
import type { LoggedFood } from '../store/localStorage'

export default function PlanPage() {
  const { t } = useTranslation()

  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0)
  const referenceDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + weekOffset * 7)
    return d
  }, [weekOffset])

  const { weekDates, weekSummary, groceryItems } = useWeekPlan(referenceDate)

  // Selected day — default to today if visible in the current week
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = toDateKey()
    return weekDates.includes(today) ? today : weekDates[0]
  })
  const { dayLog, addFood, removeFood } = useDayLog(selectedDate)

  // Grocery sheet
  const [showGrocery, setShowGrocery] = useState(false)
  const [checkedItems, setCheckedItems] = useState<string[]>(() => storage.getGroceryChecked())

  // Add food sheet
  const [addingSlot, setAddingSlot] = useState<SlotType | null>(null)

  const handleFoodSelected = (food: LoggedFood) => {
    if (addingSlot) {
      addFood(addingSlot, food)
      setAddingSlot(null)
    }
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
        <Button
          variant="secondary"
          size="sm"
          icon={<ShoppingCart size={14} />}
          onClick={() => setShowGrocery(true)}
        >
          {t('plan.grocery_list')}
        </Button>
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
        {addingSlot && <FoodAddSheet onSelect={handleFoodSelected} />}
      </FoodModal>
    </div>
  )
}

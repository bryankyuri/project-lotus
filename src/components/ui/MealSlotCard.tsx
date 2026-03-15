import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { SlotType, LoggedFood } from '../../store/localStorage'
import { useTranslation } from 'react-i18next'
import { portionKey } from '../../utils/portionKey'

interface MealSlotCardProps {
  readonly slot: SlotType
  readonly foods: LoggedFood[]
  readonly onAddFood: () => void
  readonly onRemoveFood: (index: number) => void
}

const slotTranslationKey: Record<SlotType, string> = {
  breakfast: 'today.breakfast',
  lunch: 'today.lunch',
  dinner: 'today.dinner',
  snack: 'today.snack',
}

const slotEmoji: Record<SlotType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍪',
}

export function MealSlotCard({
  slot,
  foods,
  onAddFood,
  onRemoveFood,
}: MealSlotCardProps) {
  const { t } = useTranslation()

  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0)
  const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0)

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-card p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{slotEmoji[slot]}</span>
          <h3 className="font-bold text-text">{t(slotTranslationKey[slot])}</h3>
          {foods.length > 0 && (
            <span className="text-xs text-text-secondary bg-bg rounded-full px-2 py-0.5">
              {Math.round(totalCalories)} kcal
            </span>
          )}
        </div>
        <button
          onClick={onAddFood}
          className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center bg-gradient-primary-hover transition-colors shadow-sm"
        >
          <Plus size={16} className="text-white" />
        </button>
      </div>

      {/* Food list */}
      {foods.length === 0 ? (
        <p className="text-xs text-text-secondary py-2">{t('today.tap_to_add')}</p>
      ) : (
        <div className="space-y-2">
          {foods.map((food, index) => (
            <div
              key={`${food.food_id}-${index}`}
              className="flex items-center justify-between py-1.5 group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text truncate">{food.food_name}</p>
                <p className="text-[10px] text-text-secondary">
                  {t(portionKey(food.portion_label))} × {food.quantity} · {Math.round(food.calories)} kcal
                </p>
              </div>
              <button
                onClick={() => onRemoveFood(index)}
                className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2"
              >
                {t('today.remove')}
              </button>
            </div>
          ))}

          {/* Slot total */}
          <div className="flex justify-between pt-2 border-t border-border text-xs">
            <span className="text-text-secondary">{t('today.total')}</span>
            <span className="font-semibold text-text">
              {Math.round(totalCalories)} kcal · {totalProtein.toFixed(1)}g P
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

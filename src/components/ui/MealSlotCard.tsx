import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, MoreVertical, Bookmark } from 'lucide-react'
import type { SlotType, LoggedFood } from '../../store/localStorage'
import { useTranslation } from 'react-i18next'
import { portionKey } from '../../utils/portionKey'

interface MealSlotCardProps {
  readonly slot: SlotType
  readonly foods: LoggedFood[]
  readonly onAddFood: () => void
  readonly onRemoveFood: (index: number) => void
  readonly onSaveMeal?: (slot: SlotType, foods: LoggedFood[]) => void
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
  onSaveMeal,
}: MealSlotCardProps) {
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

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
        <div className="flex items-center gap-1">
          {/* Kebab menu — only visible when there are foods to save */}
          {foods.length > 0 && onSaveMeal && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <MoreVertical size={16} className="text-text-secondary" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-9 z-30 bg-white rounded-xl shadow-lg border border-border py-1 min-w-40">
                  <button
                    onClick={() => {
                      onSaveMeal(slot, foods)
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-gray-50 transition-colors"
                  >
                    <Bookmark size={14} />
                    {t('templates.save_meal')}
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={onAddFood}
            className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center bg-gradient-primary-hover transition-colors shadow-sm"
          >
            <Plus size={16} className="text-white" />
          </button>
        </div>
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

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getCategoryIcon } from '../../utils/categoryIcons'

interface FoodListItemProps {
  readonly foodId: number
  readonly name: string
  readonly category: string
  readonly foodType?: string
  readonly calories: number
  readonly protein: number
  readonly onClick?: () => void
}

export function FoodListItem({
  name,
  category,
  foodType,
  calories,
  protein,
  onClick,
}: FoodListItemProps) {
  const { t } = useTranslation()
  const { icon: Icon, color, bg } = getCategoryIcon(category)

  const translatedCategory = t(`category.${category}`, category)
  const translatedType = foodType ? t(`food_type.${foodType}`, foodType) : undefined

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
    >
      {/* Category icon */}
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={color} />
      </div>

      {/* Food info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text truncate">{name}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-secondary">{translatedCategory}</span>
          {translatedType && (
            <>
              <span className="text-[10px] text-text-secondary/40">•</span>
              <span className="text-[10px] text-text-secondary/70 font-medium">{translatedType}</span>
            </>
          )}
        </div>
      </div>

      {/* Quick macros */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-text">{Math.round(calories)}</p>
        <p className="text-[10px] text-text-secondary">kcal · {protein.toFixed(1)}g P</p>
      </div>
    </motion.button>
  )
}

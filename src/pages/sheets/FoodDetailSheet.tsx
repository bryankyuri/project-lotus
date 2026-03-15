import { useTranslation } from 'react-i18next'
import { useFoodDetail, useFoodPortions } from '../../hooks/useFood'
import { getCategoryIcon } from '../../utils/categoryIcons'
import { portionKey } from '../../utils/portionKey'
import { SkeletonList } from '../../components/ui'

interface FoodDetailSheetProps {
  readonly foodId: number
}

export function FoodDetailSheet({ foodId }: FoodDetailSheetProps) {
  const { t } = useTranslation()
  const { data: detail, isLoading } = useFoodDetail(foodId)
  const { data: portions } = useFoodPortions(foodId)

  if (isLoading || !detail) return <SkeletonList count={6} />

  const { icon: CatIcon, color, bg } = getCategoryIcon(detail.food_category)
  const macros = detail.macros
  const nutrients = detail.nutrients

  const nutrientGroups = [
    {
      title: t('food.macronutrients'),
      items: [
        { label: 'Calories', value: macros.calories, unit: 'kcal' },
        { label: 'Protein', value: macros.protein, unit: 'g' },
        { label: 'Carbohydrate', value: macros.carbs, unit: 'g' },
        { label: 'Fat', value: macros.fat, unit: 'g' },
        { label: 'Fiber', value: macros.fiber, unit: 'g' },
        { label: 'Sugar', value: macros.sugar, unit: 'g' },
        { label: 'Water', value: nutrients?.water, unit: 'g' },
        { label: 'Ash', value: nutrients?.ash, unit: 'g' },
      ],
    },
    {
      title: t('food.minerals'),
      items: nutrients ? [
        { label: 'Calcium', value: nutrients.calcium, unit: 'mg' },
        { label: 'Phosphorus', value: nutrients.phosphorus, unit: 'mg' },
        { label: 'Iron', value: nutrients.iron, unit: 'mg' },
        { label: 'Sodium', value: macros.sodium, unit: 'mg' },
        { label: 'Potassium', value: nutrients.potassium, unit: 'mg' },
        { label: 'Copper', value: nutrients.copper, unit: 'mg' },
        { label: 'Zinc', value: nutrients.zinc, unit: 'mg' },
      ] : [],
    },
    {
      title: t('food.vitamins'),
      items: nutrients ? [
        { label: 'Retinol', value: nutrients.retinol, unit: 'mcg' },
        { label: 'Beta-carotene', value: nutrients.beta_carotene, unit: 'mcg' },
        { label: 'Thiamin (B1)', value: nutrients.thiamin, unit: 'mg' },
        { label: 'Riboflavin (B2)', value: nutrients.riboflavin, unit: 'mg' },
        { label: 'Niacin (B3)', value: nutrients.niacin, unit: 'mg' },
        { label: 'Vitamin C', value: nutrients.vitamin_c, unit: 'mg' },
      ] : [],
    },
  ]

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
          <CatIcon size={20} className={color} />
        </div>
        <div>
          <h3 className="font-bold text-text text-base">{detail.name}</h3>
          <p className="text-xs text-text-secondary">
            {t(`category.${detail.food_category}`, detail.food_category)}
            {detail.food_type && (
              <> · {t(`food_type.${detail.food_type}`, detail.food_type)}</>
            )}
            {' · '}{t('food.per_100g')}
          </p>
        </div>
      </div>

      {/* Quick macro grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Cal', value: macros.calories, unit: '', color: 'bg-macro-calories/10 text-macro-calories' },
          { label: 'P', value: macros.protein, unit: 'g', color: 'bg-macro-protein/10 text-macro-protein' },
          { label: 'C', value: macros.carbs, unit: 'g', color: 'bg-macro-carbs/10 text-macro-carbs' },
          { label: 'F', value: macros.fat, unit: 'g', color: 'bg-macro-fat/10 text-macro-fat' },
        ].map(({ label, value, unit, color: c }) => (
          <div key={label} className={`rounded-xl p-3 text-center ${c.split(' ')[0]}`}>
            <p className={`text-lg font-bold ${c.split(' ')[1]}`}>
              {value != null ? Number(value).toFixed(1) : '-'}{unit}
            </p>
            <p className="text-[10px] text-text-secondary">{label}</p>
          </div>
        ))}
      </div>

      {/* Available portions */}
      {portions && portions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text mb-2">{t('food.portion_size')}</h4>
          <div className="flex flex-wrap gap-2">
            {portions.map((p) => (
              <span
                key={p.id}
                className="px-3 py-1.5 rounded-xl bg-bg text-xs text-text-secondary"
              >
                {t(portionKey(p.portion_description))} ({p.gram_weight}g)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nutrient groups */}
      {nutrientGroups.map((group) => (
        group.items.length > 0 && (
          <div key={group.title}>
            <h4 className="text-sm font-semibold text-text mb-2">{group.title}</h4>
            <div className="bg-bg rounded-xl divide-y divide-border">
              {group.items.map(({ label, value, unit }) => (
                <div key={label} className="flex justify-between px-3 py-2 text-xs">
                  <span className="text-text-secondary">{label}</span>
                  <span className="font-medium text-text">
                    {value != null ? Number(value).toFixed(2) : t('food.no_data')} {unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {/* Source */}
      <p className="text-[10px] text-text-secondary text-center">{t('food.source')}</p>
    </div>
  )
}

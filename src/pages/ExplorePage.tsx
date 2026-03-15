import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Search, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFoodSearch, useFoodCategories, useFavoriteFoods } from '../hooks/useFood'
import { FoodListItem, Chip, SkeletonList, EmptyState, BottomSheet } from '../components/ui'
import { getCategoryIcon } from '../utils/categoryIcons'
import { variants, stagger } from '../utils/animations'
import { FoodDetailSheet } from './sheets/FoodDetailSheet'

export default function ExplorePage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const perPage = 20
  const { data: categories } = useFoodCategories()

  const { data: searchResult, isLoading } = useFoodSearch(query, activeCategory, page, perPage)
  const foods = searchResult?.data
  const meta = searchResult?.meta

  const { data: favorites, isLoading: favLoading } = useFavoriteFoods()

  // Reset page when query or category changes
  useEffect(() => {
    setPage(1)
  }, [query, activeCategory])

  // Food detail sheet
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null)

  const displayCategories = useMemo(() => categories ?? [], [categories])

  const isIdle = query.length === 0 && !activeCategory
  const hasResults = foods && foods.length > 0

  // ─── Category chip scroll ───────────────────────────────
  const chipScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = chipScrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = chipScrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState, displayCategories])

  const scrollChips = (dir: 'left' | 'right') => {
    const el = chipScrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  return (
    <div className="px-5 py-6 space-y-5">
      {/* Header */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <h1 className="text-2xl font-bold text-text">{t('explore.title')}</h1>
      </motion.div>

      {/* Search bar */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate" className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value.length > 0) setActiveCategory(undefined)
          }}
          placeholder={t('explore.search_placeholder')}
          className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white border border-border text-[16px] shadow-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
        />
      </motion.div>

      {/* Category chips with scroll arrows */}
      <div className="relative">
        {/* Left arrow — desktop only */}
        {canScrollLeft && (
          <button
            onClick={() => scrollChips('left')}
            className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white border border-border shadow-md hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div
          ref={chipScrollRef}
          className="flex gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
        >
          <Chip
            label={t('explore.all_categories')}
            active={!activeCategory}
            onClick={() => setActiveCategory(undefined)}
          />
          {displayCategories.map((cat) => {
            const { icon: Icon } = getCategoryIcon(cat)
            return (
              <Chip
                key={cat}
                label={t(`category.${cat}`, cat)}
                active={activeCategory === cat}
                onClick={() => {
                  setActiveCategory(activeCategory === cat ? undefined : cat)
                  setQuery('')
                }}
                icon={<Icon size={14} />}
              />
            )
          })}
        </div>

        {/* Right arrow — desktop only */}
        {canScrollRight && (
          <button
            onClick={() => scrollChips('right')}
            className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white border border-border shadow-md hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Favorite picks — shown when idle */}
      {isIdle && (
        <motion.div
          variants={stagger(0.04)}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          <motion.div variants={variants.fadeInUp} className="flex items-center gap-2">
            <Heart size={18} className="text-red-400" />
            <h2 className="text-lg font-semibold text-text">{t('explore.favorites_title')}</h2>
          </motion.div>
          {favLoading && <SkeletonList count={6} />}
          {!favLoading && favorites && favorites.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card divide-y divide-border">
              {favorites.map((food) => (
                <motion.div key={food.id} variants={variants.fadeInUp}>
                  <FoodListItem
                    foodId={food.id}
                    name={food.name}
                    category={food.food_category}
                    foodType={food.food_type}
                    calories={food.macros.calories}
                    protein={food.macros.protein}
                    onClick={() => setSelectedFoodId(food.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Results */}
      {!isIdle && (
        <motion.div
          variants={stagger(0.04)}
          initial="initial"
          animate="animate"
        >
          {isLoading && <SkeletonList count={8} />}

          {!isLoading && hasResults && (
            <>
              {/* Result count */}
              {meta && (
                <p className="text-xs text-text-secondary mb-2">
                  {t('explore.foods_count', { count: meta.total })}
                </p>
              )}

              <div className="bg-white rounded-2xl shadow-card divide-y divide-border">
                {foods.map((food) => (
                  <motion.div key={food.id} variants={variants.fadeInUp}>
                    <FoodListItem
                      foodId={food.id}
                      name={food.name}
                      category={food.food_category}
                      foodType={food.food_type}
                      calories={food.macros.calories}
                      protein={food.macros.protein}
                      onClick={() => setSelectedFoodId(food.id)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-border shadow-card disabled:opacity-30 transition-opacity"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {generatePageNumbers(meta.current_page, meta.last_page).map((p) =>
                    typeof p === 'string' ? (
                      <span key={p} className="text-text-secondary text-sm px-1">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${
                          page === p
                            ? 'bg-gradient-primary text-white shadow-card'
                            : 'bg-white border border-border shadow-card text-text hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                    disabled={page >= meta.last_page}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-border shadow-card disabled:opacity-30 transition-opacity"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

          {!isLoading && !hasResults && (
            <EmptyState
              icon={<Search />}
              title={t('explore.no_results')}
              subtitle={t('explore.try_different')}
            />
          )}
        </motion.div>
      )}

      {/* Food Detail Bottom Sheet */}
      <BottomSheet
        open={selectedFoodId !== null}
        onClose={() => setSelectedFoodId(null)}
        title={t('food.nutrition_facts')}
      >
        {selectedFoodId && (
          <FoodDetailSheet foodId={selectedFoodId} />
        )}
      </BottomSheet>
    </div>
  )
}

// ─── Pagination helper ───────────────────────────────────

function generatePageNumbers(current: number, last: number): (number | 'dots-start' | 'dots-end')[] {
  if (last <= 5) return Array.from({ length: last }, (_, i) => i + 1)

  const pages: (number | 'dots-start' | 'dots-end')[] = []

  // Always show first page
  pages.push(1)

  if (current > 3) pages.push('dots-start')

  // Window around current
  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < last - 2) pages.push('dots-end')

  // Always show last page
  pages.push(last)

  return pages
}

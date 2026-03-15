import { useQuery } from '@tanstack/react-query'
import {
  searchFoods,
  getFoodDetail as fetchFoodDetail,
  getFoodPortions as fetchFoodPortions,
  getCategories,
  getFoodsByCategory,
  getFavoriteFoods,
} from '../services/mockApi'
import type { FoodItem, FoodDetail, FoodPortion, FoodSearchResponse } from '../services/api'

/**
 * Search foods locally with mock API — supports pagination.
 */
export function useFoodSearch(query: string, category?: string, page = 1, perPage = 20) {
  return useQuery<FoodSearchResponse>({
    queryKey: ['food-search', query, category, page, perPage],
    queryFn: async (): Promise<FoodSearchResponse> => {
      if (category && !query) {
        // Browse by category
        return getFoodsByCategory(category, page, perPage)
      }
      const res = await searchFoods(query, page, perPage)
      // Client-side category filter if both query + category
      if (category) {
        const filtered = res.data.filter((f) => f.food_category === category)
        return { ...res, data: filtered }
      }
      return res
    },
    enabled: query.length > 0 || !!category,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get curated list of popular Indonesian foods.
 */
export function useFavoriteFoods() {
  return useQuery<FoodItem[]>({
    queryKey: ['favorite-foods'],
    queryFn: () => getFavoriteFoods(),
    staleTime: Infinity,
  })
}

/**
 * Get full nutrition detail for a single food.
 */
export function useFoodDetail(foodId: number | null) {
  return useQuery<FoodDetail | null>({
    queryKey: ['food-detail', foodId],
    queryFn: () => (foodId ? fetchFoodDetail(foodId) : null),
    enabled: foodId !== null,
    staleTime: 60 * 60 * 1000, // 1 hr
  })
}

/**
 * Get available portions for a food.
 */
export function useFoodPortions(foodId: number | null) {
  return useQuery<FoodPortion[]>({
    queryKey: ['food-portions', foodId],
    queryFn: () => (foodId ? fetchFoodPortions(foodId) : []),
    enabled: foodId !== null,
    staleTime: 60 * 60 * 1000,
  })
}

/**
 * Get all food categories.
 */
export function useFoodCategories() {
  return useQuery<string[]>({
    queryKey: ['food-categories'],
    queryFn: () => getCategories(),
    staleTime: Infinity,
  })
}

/**
 * Mock API service — uses Indonesian TKPI food data.
 * Mirrors the exact JSON contract that the Laravel API will return.
 */

import mockFoodsData from '../data/mockFoods.json'
import favoriteFoodsData from '../data/favoriteFoods.json'
import type {
  FoodItem,
  FoodDetail,
  FoodPortion,
  FoodSearchResponse,
  FoodMacros,
  FoodNutrients,
} from './api'

// ─── Internal types for the raw JSON ─────────────────────

interface RawPortion {
  id: number
  amount: number
  portion_description: string
  modifier: string
  gram_weight: number
}

interface RawFood {
  id: number
  code: string
  name: string
  food_category: string
  food_type: string
  source: string
  macros: FoodMacros
  nutrients: FoodNutrients
  bdd: number
  portions: RawPortion[]
}

const allFoods: RawFood[] = mockFoodsData as unknown as RawFood[]

// ─── Simulate network delay ──────────────────────────────

function delay(ms = 80): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ─── Convert raw → API shape ─────────────────────────────

function toFoodItem(raw: RawFood): FoodItem {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    food_category: raw.food_category,
    food_type: raw.food_type,
    macros: raw.macros,
  }
}

function toFoodDetail(raw: RawFood): FoodDetail {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    food_category: raw.food_category,
    food_type: raw.food_type,
    source: raw.source,
    macros: raw.macros,
    nutrients: raw.nutrients,
    bdd: raw.bdd,
    portions: raw.portions.map((p) => ({
      id: p.id,
      portion_description: p.portion_description,
      modifier: p.modifier,
      gram_weight: p.gram_weight,
      amount: p.amount,
    })),
  }
}

// ─── Search ──────────────────────────────────────────────

export async function searchFoods(
  search: string,
  page = 1,
  perPage = 20,
): Promise<FoodSearchResponse> {
  await delay()
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean)
  const filtered = allFoods.filter((food) => {
    const haystack = `${food.name} ${food.food_category}`.toLowerCase()
    return terms.every((term) => haystack.includes(term))
  })
  const total = filtered.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(Math.max(1, page), lastPage)
  const start = (safePage - 1) * perPage
  const slice = filtered.slice(start, start + perPage)
  return {
    data: slice.map(toFoodItem),
    meta: { current_page: safePage, last_page: lastPage, per_page: perPage, total },
  }
}

// ─── Detail ──────────────────────────────────────────────

export async function getFoodDetail(id: number): Promise<FoodDetail> {
  await delay()
  const food = allFoods.find((f) => f.id === id)
  if (!food) throw new Error(`Food not found: ${id}`)
  return toFoodDetail(food)
}

// ─── Portions ────────────────────────────────────────────

export async function getFoodPortions(id: number): Promise<FoodPortion[]> {
  await delay()
  const food = allFoods.find((f) => f.id === id)
  if (!food) return []
  return food.portions.map((p) => ({
    id: p.id,
    portion_description: p.portion_description,
    modifier: p.modifier,
    gram_weight: p.gram_weight,
    amount: p.amount,
  }))
}

// ─── Sync helpers ────────────────────────────────────────

export function getFoodItemSync(id: number): FoodItem | undefined {
  const raw = allFoods.find((f) => f.id === id)
  return raw ? toFoodItem(raw) : undefined
}

export function getCategories(): string[] {
  const cats = new Set(allFoods.map((f) => f.food_category))
  return [...cats].sort((a, b) => a.localeCompare(b))
}

export async function getFoodsByCategory(
  category: string,
  page = 1,
  perPage = 20,
): Promise<FoodSearchResponse> {
  await delay()
  const filtered = allFoods.filter((f) => f.food_category === category)
  const total = filtered.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(Math.max(1, page), lastPage)
  const start = (safePage - 1) * perPage
  const slice = filtered.slice(start, start + perPage)
  return {
    data: slice.map(toFoodItem),
    meta: { current_page: safePage, last_page: lastPage, per_page: perPage, total },
  }
}

// ─── Favorite Foods ──────────────────────────────────────

const favoriteIds = new Set(
  (favoriteFoodsData as { id: number; label: string }[]).map((f) => f.id),
)

export async function getFavoriteFoods(): Promise<FoodItem[]> {
  await delay()
  return allFoods.filter((f) => favoriteIds.has(f.id)).map(toFoodItem)
}

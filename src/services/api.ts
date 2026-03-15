import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
})

// ─── Types ───────────────────────────────────────────────

export interface FoodMacros {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number | null
  sugar: number | null
  sodium: number | null
  cholesterol: number | null
  saturated_fat: number | null
}

export interface FoodNutrients {
  water: number | null
  ash: number | null
  calcium: number | null
  phosphorus: number | null
  iron: number | null
  potassium: number | null
  copper: number | null
  zinc: number | null
  retinol: number | null
  beta_carotene: number | null
  carotene: number | null
  thiamin: number | null
  riboflavin: number | null
  niacin: number | null
  vitamin_c: number | null
}

export interface FoodItem {
  id: number
  fdc_id?: number
  code?: string
  name: string
  food_category: string
  food_type?: string
  macros: FoodMacros
}

export interface FoodPortion {
  id: number
  portion_description: string
  modifier: string
  gram_weight: number
  amount: number
}

export interface FoodDetail extends FoodItem {
  portions: FoodPortion[]
  nutrients?: FoodNutrients
  bdd?: number
  source?: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface FoodSearchResponse {
  data: FoodItem[]
  meta: PaginationMeta
}

export interface FoodDetailResponse {
  data: FoodDetail
}

// ─── API Functions ───────────────────────────────────────

export async function searchFoods(
  search: string,
  page = 1,
  perPage = 20,
): Promise<FoodSearchResponse> {
  const { data } = await api.get<FoodSearchResponse>('/foods', {
    params: { search, page, per_page: perPage },
  })
  return data
}

export async function getFoodDetail(id: number): Promise<FoodDetail> {
  const { data } = await api.get<FoodDetailResponse>(`/foods/${id}`)
  return data.data
}

export async function getFoodPortions(id: number): Promise<FoodPortion[]> {
  const { data } = await api.get<{ data: FoodPortion[] }>(`/foods/${id}/portions`)
  return data.data
}

export { api }

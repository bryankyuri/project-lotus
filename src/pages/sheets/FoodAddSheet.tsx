import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, Scale, Heart, Bookmark } from "lucide-react";
import {
  useFoodSearch,
  useFoodDetail,
  useFoodPortions,
  useFavoriteFoods,
} from "../../hooks/useFood";
import {
  FoodListItem,
  SkeletonList,
  EmptyState,
  Button,
} from "../../components/ui";
import type { LoggedFood, SavedMeal } from "../../store/localStorage";
import type { FoodPortion } from "../../services/api";
import { portionKey } from "../../utils/portionKey";

const CUSTOM_PORTION = "custom" as const;

interface FoodAddSheetProps {
  readonly onSelect: (food: LoggedFood) => void;
  /** Optional: saved meals for current slot */
  readonly savedMeals?: SavedMeal[];
  /** Optional: callback when a saved meal is selected */
  readonly onSelectSavedMeal?: (meal: SavedMeal) => void;
}

export function FoodAddSheet({ onSelect, savedMeals, onSelectSavedMeal }: FoodAddSheetProps) {
  const { t } = useTranslation();

  // Search state
  const [query, setQuery] = useState("");
  const { data: searchResult, isLoading } = useFoodSearch(query);
  const foods = searchResult?.data;

  // Favorites (shown when idle)
  const { data: favorites, isLoading: favLoading } = useFavoriteFoods();

  // Selected food state
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
  const { data: detail } = useFoodDetail(selectedFoodId);
  const { data: portions } = useFoodPortions(selectedFoodId);

  // Portion selection
  const [selectedPortionId, setSelectedPortionId] = useState<
    number | null | typeof CUSTOM_PORTION
  >(null);
  const [quantity, setQuantity] = useState(1);
  const [customGrams, setCustomGrams] = useState(100);

  const isCustom = selectedPortionId === CUSTOM_PORTION;

  const handleSelectFood = useCallback((foodId: number) => {
    setSelectedFoodId(foodId);
    setSelectedPortionId(null);
    setQuantity(1);
    setCustomGrams(100);
  }, []);

  const handleAdd = useCallback(() => {
    if (!detail) return;

    let grams = 100;
    let portionLabel = "100g";
    let portionId: number | null = null;

    if (isCustom) {
      grams = customGrams * quantity;
      portionLabel = `${customGrams}g`;
    } else if (
      selectedPortionId &&
      typeof selectedPortionId === "number" &&
      portions
    ) {
      const p = portions.find((pt: FoodPortion) => pt.id === selectedPortionId);
      if (p) {
        grams = p.gram_weight * quantity;
        portionLabel = t(portionKey(p.portion_description));
        portionId = p.id;
      }
    } else {
      grams = 100 * quantity;
    }

    const factor = grams / 100;
    const macros = detail.macros;

    const food: LoggedFood = {
      food_id: detail.id,
      food_name: detail.name,
      portion_id: portionId,
      portion_label: portionLabel,
      quantity,
      grams,
      calories: (macros.calories ?? 0) * factor,
      protein: (macros.protein ?? 0) * factor,
      carbs: (macros.carbs ?? 0) * factor,
      fat: (macros.fat ?? 0) * factor,
    };

    onSelect(food);
  }, [
    detail,
    portions,
    selectedPortionId,
    quantity,
    customGrams,
    isCustom,
    onSelect,
    t,
  ]);

  // ── If food selected, show portion picker ──
  if (selectedFoodId && detail) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-6">
        <h3 className="font-bold text-text text-base">{detail.name}</h3>
        <p className="text-xs text-text-secondary">{detail.food_category}</p>

        {/* Portion options */}
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">
            {t("food.portion_size")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPortionId(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                selectedPortionId === null
                  ? "bg-gradient-primary text-white shadow-sm"
                  : "bg-gray-100 text-text-secondary"
              }`}
            >
              100g
            </button>
            {portions?.map((p: FoodPortion) => (
              <button
                key={p.id}
                onClick={() => setSelectedPortionId(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  selectedPortionId === p.id
                    ? "bg-gradient-primary text-white shadow-sm"
                    : "bg-gray-100 text-text-secondary"
                }`}
              >
                {t(portionKey(p.portion_description))} ({p.gram_weight}g)
              </button>
            ))}
            <button
              onClick={() => setSelectedPortionId(CUSTOM_PORTION)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 inline-flex items-center gap-1 ${
                isCustom
                  ? "bg-gradient-primary text-white shadow-sm"
                  : "bg-gray-100 text-text-secondary"
              }`}
            >
              <Scale size={12} />
              {t("portion.custom")}
            </button>
          </div>
        </div>

        {/* Custom gram input — shown when custom portion is selected */}
        {isCustom && (
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2">
              {t("food.weight_grams")}
            </p>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={customGrams}
              onChange={(e) =>
                setCustomGrams(
                  Math.max(1, Number.parseInt(e.target.value) || 1),
                )
              }
              className="w-full h-11 px-4 rounded-2xl bg-white border border-border text-[16px] focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
        )}

        {/* Quantity */}
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">
            {t("food.quantity")}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
              className="w-9 h-9 rounded-xl bg-gray-100 text-text font-bold text-lg flex items-center justify-center"
            >
              −
            </button>
            <span className="text-lg font-bold text-text w-10 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 0.5)}
              className="w-9 h-9 rounded-xl bg-gray-100 text-text font-bold text-lg flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Macro preview */}
        <div className="bg-bg rounded-2xl p-4 grid grid-cols-4 gap-2 text-center">
          {(() => {
            const gw = isCustom
              ? customGrams
              : (typeof selectedPortionId === "number" &&
                  portions?.find((p: FoodPortion) => p.id === selectedPortionId)
                    ?.gram_weight) ||
                100;
            const f = (gw * quantity) / 100;
            return [
              {
                label: "Cal",
                value: (detail.macros.calories ?? 0) * f,
                color: "text-macro-calories",
              },
              {
                label: "P",
                value: (detail.macros.protein ?? 0) * f,
                color: "text-macro-protein",
              },
              {
                label: "C",
                value: (detail.macros.carbs ?? 0) * f,
                color: "text-macro-carbs",
              },
              {
                label: "F",
                value: (detail.macros.fat ?? 0) * f,
                color: "text-macro-fat",
              },
            ];
          })().map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-[10px] text-text-secondary">{label}</p>
              <p className={`text-sm font-bold ${color}`}>
                {Math.round(value)}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setSelectedFoodId(null)}
            className="flex-1"
          >
            {t("onboarding.back")}
          </Button>
          <Button onClick={handleAdd} className="flex-1">
            {t("today.add_food")}
          </Button>
        </div>
      </div>
    );
  }

  // ── Search view ──
  return (
    // flex-1 fills the modal content wrapper
    // On mobile: search (order-last) sits at bottom, results (order-first) scroll above
    // On desktop: search (md:order-first) sits at top, results (md:order-last) scroll below
    <div className="flex-1 flex flex-col gap-3">
      {/* Search input — bottom on mobile, top on desktop */}
      <div className="relative shrink-0 order-last md:order-first mb-4">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("explore.search_placeholder")}
          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white border border-border text-[16px] focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          autoFocus
        />
      </div>

      {/* Results — top on mobile, bottom on desktop */}
      <div className="flex-1 min-h-0 order-first md:order-last">
        {isLoading ? (
          <div className="space-y-0.5 overflow-y-auto md:h-[500px] h-[25vh] no-scrollbar">
            <SkeletonList count={5} />
          </div>
        ) : foods && foods.length > 0 ? (
          <div className="space-y-0.5 overflow-y-auto md:h-[500px] h-[25vh] no-scrollbar">
            {foods.map((food) => (
              <FoodListItem
                key={food.id}
                foodId={food.id}
                name={food.name}
                category={food.food_category}
                foodType={food.food_type}
                calories={food.macros.calories}
                protein={food.macros.protein}
                onClick={() => handleSelectFood(food.id)}
              />
            ))}
          </div>
        ) : query.length > 0 ? (
           <div className="space-y-0.5 overflow-y-auto md:h-[500px] h-[25vh] no-scrollbar">
          <EmptyState
            title={t("explore.no_results")}
            subtitle={t("explore.try_different")}
          />
          </div>
        ) : (
          <div className="overflow-y-auto md:h-[500px] h-[65vh] no-scrollbar">
            {/* Saved Meals — shown when there are saved meals for this slot */}
            {savedMeals && savedMeals.length > 0 && onSelectSavedMeal && (
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  <Bookmark size={14} className="text-primary" />
                  <p className="text-xs font-semibold text-text-secondary">
                    {t("templates.saved_meals")}
                  </p>
                </div>
                <div className="space-y-1">
                  {savedMeals.map((meal) => (
                    <button
                      key={meal.id}
                      onClick={() => onSelectSavedMeal(meal)}
                      className="w-full text-left bg-primary/5 border border-primary/10 rounded-2xl p-3 hover:bg-primary/10 transition-colors"
                    >
                      <p className="text-sm font-semibold text-text truncate">{meal.name}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">
                        {meal.foods.length} {t("templates.foods_count")} · {Math.round(meal.totalCalories)} kcal
                        {" · "}P: {Math.round(meal.totalProtein)}g · C: {Math.round(meal.totalCarbs)}g · F: {Math.round(meal.totalFat)}g
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Heart size={14} className="text-red-400" />
              <p className="text-xs font-semibold text-text-secondary">
                {t("explore.favorites_title")}
              </p>
            </div>
            {favLoading ? (
              <SkeletonList count={5} />
            ) : (
              <div className="space-y-0.5">
                {(favorites ?? []).map((food) => (
                  <FoodListItem
                    key={food.id}
                    foodId={food.id}
                    name={food.name}
                    category={food.food_category}
                    foodType={food.food_type}
                    calories={food.macros.calories}
                    protein={food.macros.protein}
                    onClick={() => handleSelectFood(food.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

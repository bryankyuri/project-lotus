# 🔬 Research: Meal Template / Preset System

## 1. Industry Terminology

After researching popular nutrition & meal planning apps (MyFitnessPal, Eat This Much, Lifesum, MacroFactor, Cronometer, Mealime, FatSecret, Strongr Fastr), here are the standard terms used for each level of saved meals:

| Your concept | Industry standard name | Also known as | Used by |
|---|---|---|---|
| Group of foods saved for a slot (breakfast/lunch/dinner/snack) | **Saved Meal** | "Quick Meal", "Meal Preset", "Meal Combo" | MyFitnessPal, FatSecret, Lifesum |
| A full day's meals across all slots | **Day Template** | "Day Preset", "Meal Plan Template" | Eat This Much, Cronometer |
| A 7-day plan saved as reusable | **Week Template** | "Weekly Plan", "Meal Plan" | Eat This Much, Mealime, Strongr Fastr |

### Recommended names for NutriPlan

| Level | English name | Page / section name |
|---|---|---|
| Slot-level (group of foods) | **Saved Meal** | "My Meals" |
| Day-level (full day plan) | **Day Template** | "My Templates" |
| Week-level (7-day plan) | **Week Template** | "My Templates" |

### Why "Saved Meals" (not "Presets" or "Combos")

- ✅ **"Saved Meal"** is the most universally understood term (MyFitnessPal, Lifesum, FatSecret all use it)
- ❌ "Preset" sounds too technical / settings-related
- ❌ "Combo" sounds like fast food
- ❌ "Quick Meal" is ambiguous — could mean "fast to cook"
- ❌ "Recipe" implies cooking instructions — our app tracks nutrition, not cooking steps

### The management page should be called **"My Templates"**

This page manages all 3 levels (Saved Meals + Day Templates + Week Templates). The word "template" communicates reusability. Alternative: **"Meal Library"** — sounds good but doesn't convey the "reuse/apply" action as clearly.

---

## 2. Data Model Design

### Current data structures (existing)
```ts
type SlotType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface LoggedFood {
  food_id: number
  food_name: string
  portion_id: number | null
  portion_label: string
  quantity: number
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface DayLog {
  date: string              // 'YYYY-MM-DD'
  breakfast: LoggedFood[]
  lunch: LoggedFood[]
  dinner: LoggedFood[]
  snack: LoggedFood[]
}
```

### New types needed

```ts
/** Level 1 — A saved group of foods for a single slot */
interface SavedMeal {
  id: string                // unique, e.g. 'sm_1710000000000'
  name: string              // user-given name, e.g. "My Power Breakfast"
  slot: SlotType            // which slot this is designed for
  foods: LoggedFood[]       // the foods in this meal
  totalCalories: number     // precomputed for display
  totalProtein: number
  totalCarbs: number
  totalFat: number
  createdAt: string         // ISO timestamp
}

/** Level 2 — A saved full-day plan */
interface DayTemplate {
  id: string                // e.g. 'dt_1710000000000'
  name: string              // e.g. "Cutting Day", "High Carb Day"
  breakfast: LoggedFood[]
  lunch: LoggedFood[]
  dinner: LoggedFood[]
  snack: LoggedFood[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  createdAt: string
}

/** Level 3 — A saved 7-day plan */
interface WeekTemplate {
  id: string                // e.g. 'wt_1710000000000'
  name: string              // e.g. "Bulk Week", "Balanced Week"
  days: {
    mon: DayTemplate | null
    tue: DayTemplate | null
    wed: DayTemplate | null
    thu: DayTemplate | null
    fri: DayTemplate | null
    sat: DayTemplate | null
    sun: DayTemplate | null
  }
  totalCalories: number     // weekly total
  createdAt: string
}
```

### localStorage keys
```ts
SAVED_MEALS: 'mp_saved_meals'        // SavedMeal[]
DAY_TEMPLATES: 'mp_day_templates'    // DayTemplate[]
WEEK_TEMPLATES: 'mp_week_templates'  // WeekTemplate[]
```

---

## 3. User Flow & UX

### 3A. Saving a Saved Meal (from Plan Page)

```
User is on Plan Page → has foods in "Breakfast" slot
   ↓
Long-press or tap ⋯ (kebab menu) on MealSlotCard header
   ↓
Option: "Save as Meal"
   ↓
Bottom sheet: enter name → Save
   ↓
Stored in SavedMeal[] with slot = 'breakfast'
```

### 3B. Saving a Day Template (from Plan Page)

```
User is on Plan Page → viewing a day with meals in all/some slots
   ↓
Tap ⋯ or "Save Day" button near the day header
   ↓
Option: "Save as Day Template"
   ↓
Bottom sheet: enter name → Save
   ↓
Stored in DayTemplate[]
```

### 3C. Saving a Week Template (from Plan Page)

```
User is on Plan Page → week header area
   ↓
Tap "Save Week" button or ⋯ menu
   ↓
Option: "Save as Week Template"
   ↓
Bottom sheet: enter name → Save
   ↓
Stored in WeekTemplate[]
```

### 3D. Applying a Saved Meal (to a slot)

```
User is on Plan Page → taps "+" on Breakfast card
   ↓
Food add modal appears (existing FoodAddSheet)
   ↓
NEW tab/section at top: "Saved Meals" (alongside search)
   ↓
Shows saved meals filtered by slot = 'breakfast'
   ↓
Tap one → all foods from that SavedMeal are added to the slot
```

### 3E. Applying a Day Template

```
User is on Plan Page → taps ⋯ on a day or "Load Template" button
   ↓
Bottom sheet: list of Day Templates with calorie summary
   ↓
User picks one → confirmation "Replace today's meals?" or "Add to existing?"
   ↓
All 4 slots populated from the DayTemplate
```

### 3F. Applying a Week Template

```
User is on Plan Page → week header → "Load Week Template"
   ↓
Bottom sheet: list of WeekTemplates
   ↓
User picks one → confirmation
   ↓
All 7 days populated from the WeekTemplate
```

---

## 4. Page Structure Plan

### New Route: `/templates` — "My Templates" Page

This page manages all 3 template types via a tabbed UI:

```
┌─────────────────────────────────────────────┐
│  ← Back         My Templates                │
├─────────────────────────────────────────────┤
│  [ Saved Meals ]  [ Day ]  [ Week ]         │  ← Tabs
├─────────────────────────────────────────────┤
│                                             │
│  🌅 My Power Breakfast            420 kcal  │  ← SavedMeal cards
│     Oatmeal, Banana, Protein Shake          │
│                                   ⋯ (edit)  │
│                                             │
│  ☀️ Quick Chicken Lunch           650 kcal  │
│     Rice, Grilled Chicken, Salad            │
│                                   ⋯ (edit)  │
│                                             │
│  + Create New Saved Meal                    │
│                                             │
└─────────────────────────────────────────────┘
```

**Day tab:**
```
┌─────────────────────────────────────────────┐
│  [ Saved Meals ]  [ Day ]  [ Week ]         │
├─────────────────────────────────────────────┤
│                                             │
│  📅 Cutting Day                  1800 kcal  │
│     B: 420  L: 650  D: 530  S: 200         │
│                                   ⋯ (edit)  │
│                                             │
│  📅 High Carb Day               2400 kcal  │
│     B: 600  L: 800  D: 700  S: 300         │
│                                   ⋯ (edit)  │
│                                             │
│  + Create from today's plan                 │
│                                             │
└─────────────────────────────────────────────┘
```

**Week tab:**
```
┌─────────────────────────────────────────────┐
│  [ Saved Meals ]  [ Day ]  [ Week ]         │
├─────────────────────────────────────────────┤
│                                             │
│  📆 Balanced Bulk Week     ~2400 kcal/day  │
│     7 days · 16,800 total kcal              │
│                                   ⋯ (edit)  │
│                                             │
│  + Save current week                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Navigation to "My Templates"

Two entry points:
1. **From Plan Page** — a button in the header or week nav area (e.g., 📋 icon)
2. **From Profile/Settings** — link row "My Templates"

No bottom nav tab needed — it's a secondary page like Settings or Edit Profile.

---

## 5. Integration Points in Existing Code

### Files to modify

| File | Changes |
|---|---|
| `localStorage.ts` | Add 3 new STORAGE_KEYS, new types, CRUD methods for SavedMeal/DayTemplate/WeekTemplate |
| `PlanPage.tsx` | Add "Save" actions on MealSlotCard, day header, week header. Add "Load Template" buttons. Add link to Templates page |
| `MealSlotCard.tsx` | Add kebab menu (⋯) with "Save as Meal" option |
| `FoodAddSheet.tsx` | Add "Saved Meals" tab/section for quick-loading |
| `App.tsx` | Add `/templates` route |
| `BottomNav.tsx` / `Sidebar.tsx` | Not needed — templates is secondary page |
| Translations (all 12 langs) | New keys for templates UI |

### New files to create

| File | Purpose |
|---|---|
| `src/pages/TemplatesPage.tsx` | Main templates management page with 3 tabs |
| `src/hooks/useTemplates.ts` | Hook for CRUD operations on all 3 template types |
| `src/components/ui/SavedMealCard.tsx` | Card component for displaying a saved meal |
| `src/components/ui/DayTemplateCard.tsx` | Card for day template display |
| `src/components/ui/WeekTemplateCard.tsx` | Card for week template display |
| `src/pages/sheets/SaveTemplateSheet.tsx` | Bottom sheet for naming & saving a template |
| `src/pages/sheets/LoadTemplateSheet.tsx` | Bottom sheet for picking a template to apply |

---

## 6. Suggested Implementation Order

| Phase | What | Complexity |
|---|---|---|
| **Phase 1** | Data layer — types, localStorage CRUD, `useTemplates` hook | 🟢 Low |
| **Phase 2** | Saved Meals — save from MealSlotCard, load in FoodAddSheet | 🟡 Medium |
| **Phase 3** | TemplatesPage — basic management UI with Saved Meals tab | 🟡 Medium |
| **Phase 4** | Day Templates — save/load from PlanPage day view | 🟡 Medium |
| **Phase 5** | Week Templates — save/load from PlanPage week view | 🟡 Medium |
| **Phase 6** | Polish — edit/rename/delete templates, i18n for all 12 langs | 🟡 Medium |

### Estimated total: ~6 focused sessions

---

## 7. Translation Keys Needed

```json
{
  "templates": {
    "title": "My Templates",
    "saved_meals": "Saved Meals",
    "day_templates": "Day Templates",
    "week_templates": "Week Templates",
    "save_meal": "Save as Meal",
    "save_day": "Save Day as Template",
    "save_week": "Save Week as Template",
    "load_meal": "Load Saved Meal",
    "load_day": "Load Day Template",
    "load_week": "Load Week Template",
    "name_placeholder": "Template name...",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "replace_confirm": "Replace current meals?",
    "add_confirm": "Add to existing meals?",
    "replace": "Replace",
    "add_to_existing": "Add to Existing",
    "empty_meals": "No saved meals yet",
    "empty_days": "No day templates yet",
    "empty_weeks": "No week templates yet",
    "create_meal": "Create New Saved Meal",
    "create_from_today": "Create from today's plan",
    "save_current_week": "Save current week",
    "foods_count": "{{count}} foods",
    "per_day": "~{{calories}} kcal/day"
  }
}
```

---

## 8. Summary

| Concept | Name | Scope |
|---|---|---|
| Group of foods for one slot | **Saved Meal** | `LoggedFood[]` for one `SlotType` |
| Full day across all 4 slots | **Day Template** | `{ breakfast, lunch, dinner, snack }` |
| 7-day plan | **Week Template** | `{ mon..sun: DayTemplate }` |
| Management page | **My Templates** | Route `/templates`, 3 tabs |

This system gives users a **3-tier reusability hierarchy**:
- 🍽️ **Saved Meal** → "I eat this combo often" → quick-add to any slot
- 📅 **Day Template** → "This is my typical cutting day" → apply to any date
- 📆 **Week Template** → "This is my standard week" → apply to any week

All stored in localStorage, consistent with the existing architecture. No backend needed.

---

## 9. Sequence Diagrams

### 9A. Save Slot as Saved Meal

```mermaid
sequenceDiagram
    actor User
    participant PC as PlanPage
    participant MSC as MealSlotCard
    participant STS as SaveTemplateSheet
    participant UT as useTemplates
    participant LS as localStorage

    User->>PC: Views day with foods in Breakfast
    User->>MSC: Taps ⋯ (kebab menu) on Breakfast header
    MSC->>MSC: Shows context menu
    User->>MSC: Selects "Save as Meal"
    MSC->>PC: onSaveMeal(slot, foods[])
    PC->>STS: Opens SaveTemplateSheet(type='meal', slot, foods)
    STS->>STS: Renders name input + food preview
    User->>STS: Types "My Power Breakfast"
    User->>STS: Taps "Save"
    STS->>UT: saveMeal({ name, slot, foods })
    UT->>UT: Generates id = 'sm_' + Date.now()
    UT->>UT: Computes totalCalories/protein/carbs/fat
    UT->>LS: Read mp_saved_meals[]
    LS-->>UT: existing SavedMeal[]
    UT->>LS: Write [...existing, newSavedMeal]
    UT-->>STS: success
    STS->>PC: onClose()
    PC->>User: Shows toast "Meal saved!"
```

### 9B. Save Day as Day Template

```mermaid
sequenceDiagram
    actor User
    participant PC as PlanPage
    participant STS as SaveTemplateSheet
    participant UT as useTemplates
    participant LS as localStorage

    User->>PC: Views selected day (e.g. Monday Mar 16)
    Note over PC: Day has foods in breakfast, lunch, dinner, snack
    User->>PC: Taps ⋯ menu on day area
    PC->>PC: Shows context menu
    User->>PC: Selects "Save Day as Template"
    PC->>PC: Collects dayLog { breakfast[], lunch[], dinner[], snack[] }
    PC->>STS: Opens SaveTemplateSheet(type='day', dayLog)
    STS->>STS: Renders name input + 4-slot summary preview
    User->>STS: Types "Cutting Day"
    User->>STS: Taps "Save"
    STS->>UT: saveDayTemplate({ name, breakfast, lunch, dinner, snack })
    UT->>UT: Generates id = 'dt_' + Date.now()
    UT->>UT: Computes totals across all 4 slots
    UT->>LS: Read mp_day_templates[]
    LS-->>UT: existing DayTemplate[]
    UT->>LS: Write [...existing, newDayTemplate]
    UT-->>STS: success
    STS->>PC: onClose()
    PC->>User: Shows toast "Day template saved!"
```

### 9C. Save Week as Week Template

```mermaid
sequenceDiagram
    actor User
    participant PC as PlanPage
    participant STS as SaveTemplateSheet
    participant WP as useWeekPlan
    participant UT as useTemplates
    participant LS as localStorage

    User->>PC: Views current week (Mon–Sun)
    User->>PC: Taps "Save Week" button in week header
    PC->>WP: Read weekLogs (7 days of DayLog)
    WP-->>PC: weekLogs[]
    PC->>STS: Opens SaveTemplateSheet(type='week', weekLogs)
    STS->>STS: Renders name input + 7-day overview
    User->>STS: Types "Balanced Bulk Week"
    User->>STS: Taps "Save"
    STS->>UT: saveWeekTemplate({ name, days: { mon..sun } })
    UT->>UT: Generates id = 'wt_' + Date.now()
    UT->>UT: Maps each day's DayLog → DayTemplate (strip date)
    UT->>UT: Computes weekly totalCalories
    UT->>LS: Read mp_week_templates[]
    LS-->>UT: existing WeekTemplate[]
    UT->>LS: Write [...existing, newWeekTemplate]
    UT-->>STS: success
    STS->>PC: onClose()
    PC->>User: Shows toast "Week template saved!"
```

### 9D. Load Saved Meal into Slot

```mermaid
sequenceDiagram
    actor User
    participant PC as PlanPage
    participant FM as FoodModal
    participant FAS as FoodAddSheet
    participant UT as useTemplates
    participant LS as localStorage
    participant DL as useDayLog

    User->>PC: Taps "+" on Breakfast card
    PC->>FM: Opens FoodModal(slot='breakfast')
    FM->>FAS: Renders FoodAddSheet
    FAS->>FAS: Shows tabs: [Search] [Saved Meals]
    User->>FAS: Taps "Saved Meals" tab
    FAS->>UT: getSavedMeals(slot='breakfast')
    UT->>LS: Read mp_saved_meals[]
    LS-->>UT: all SavedMeal[]
    UT->>UT: Filter where meal.slot === 'breakfast'
    UT-->>FAS: filteredMeals[]
    FAS->>FAS: Renders list of saved meals with calorie info
    User->>FAS: Taps "My Power Breakfast" (420 kcal)
    FAS->>PC: onSelectSavedMeal(savedMeal)
    PC->>DL: addFood('breakfast', food) for each food in savedMeal.foods
    loop For each food in SavedMeal.foods
        DL->>LS: Append food to dayLog.breakfast
    end
    DL-->>PC: Updated dayLog
    PC->>FM: Close modal
    FM->>PC: onClose()
    PC->>User: Breakfast card shows all added foods
```

### 9E. Load Day Template into Selected Day

```mermaid
sequenceDiagram
    actor User
    participant PC as PlanPage
    participant LTS as LoadTemplateSheet
    participant UT as useTemplates
    participant LS as localStorage
    participant DL as useDayLog

    User->>PC: Taps ⋯ menu on selected day
    User->>PC: Selects "Load Day Template"
    PC->>LTS: Opens LoadTemplateSheet(type='day')
    LTS->>UT: getDayTemplates()
    UT->>LS: Read mp_day_templates[]
    LS-->>UT: DayTemplate[]
    UT-->>LTS: allDayTemplates[]
    LTS->>LTS: Renders list with calorie summaries
    User->>LTS: Taps "Cutting Day" (1800 kcal)
    LTS->>LTS: Shows confirmation dialog

    alt User chooses "Replace"
        User->>LTS: Taps "Replace"
        LTS->>PC: onApplyDayTemplate(template, mode='replace')
        PC->>DL: clearDayLog(selectedDate)
        DL->>LS: Delete dayLog[selectedDate]
        PC->>DL: setDayLog({ date, ...template slots })
        DL->>LS: Write new dayLog
    else User chooses "Add to Existing"
        User->>LTS: Taps "Add to Existing"
        LTS->>PC: onApplyDayTemplate(template, mode='append')
        loop For each slot (breakfast, lunch, dinner, snack)
            loop For each food in template[slot]
                PC->>DL: addFood(slot, food)
                DL->>LS: Append food to dayLog[slot]
            end
        end
    end

    DL-->>PC: Updated dayLog
    LTS->>PC: onClose()
    PC->>User: All 4 meal slot cards reflect template foods
```

### 9F. Load Week Template into Current Week

```mermaid
sequenceDiagram
    actor User
    participant PC as PlanPage
    participant LTS as LoadTemplateSheet
    participant UT as useTemplates
    participant LS as localStorage
    participant WP as useWeekPlan

    User->>PC: Taps "Load Week Template" in week header
    PC->>LTS: Opens LoadTemplateSheet(type='week')
    LTS->>UT: getWeekTemplates()
    UT->>LS: Read mp_week_templates[]
    LS-->>UT: WeekTemplate[]
    UT-->>LTS: allWeekTemplates[]
    LTS->>LTS: Renders list with kcal/day summaries
    User->>LTS: Taps "Balanced Bulk Week"
    LTS->>LTS: Shows confirmation "Replace entire week?"
    User->>LTS: Confirms "Replace"
    LTS->>PC: onApplyWeekTemplate(template)

    PC->>WP: Get weekDates[] (Mon–Sun date keys)
    WP-->>PC: ['2026-03-16', ..., '2026-03-22']

    loop For each day (mon→sun, i = 0..6)
        PC->>PC: dayTemplate = template.days[dayKey]
        alt dayTemplate exists
            PC->>LS: Write dayLog { date: weekDates[i], ...dayTemplate slots }
        else dayTemplate is null
            PC->>LS: Clear dayLog[weekDates[i]]
        end
    end

    LS-->>PC: All 7 days updated
    LTS->>PC: onClose()
    PC->>PC: Re-renders week view
    PC->>User: All 7 days reflect the week template
```

### 9G. Manage Templates (Templates Page)

```mermaid
sequenceDiagram
    actor User
    participant PC as PlanPage
    participant Nav as Router
    participant TP as TemplatesPage
    participant UT as useTemplates
    participant LS as localStorage

    User->>PC: Taps 📋 "My Templates" button
    PC->>Nav: navigate('/templates')
    Nav->>TP: Renders TemplatesPage

    TP->>TP: Default tab = "Saved Meals"
    TP->>UT: getSavedMeals()
    UT->>LS: Read mp_saved_meals[]
    LS-->>UT: SavedMeal[]
    UT-->>TP: savedMeals[]
    TP->>User: Renders list of SavedMealCards

    Note over User,TP: User switches to "Day" tab
    User->>TP: Taps "Day" tab
    TP->>UT: getDayTemplates()
    UT->>LS: Read mp_day_templates[]
    LS-->>UT: DayTemplate[]
    UT-->>TP: dayTemplates[]
    TP->>User: Renders list of DayTemplateCards

    Note over User,TP: User deletes a template
    User->>TP: Taps ⋯ on "Old Cutting Day"
    TP->>TP: Shows context menu
    User->>TP: Selects "Delete"
    TP->>TP: Shows confirmation dialog
    User->>TP: Confirms delete
    TP->>UT: deleteDayTemplate(id)
    UT->>LS: Read mp_day_templates[]
    LS-->>UT: DayTemplate[]
    UT->>UT: Filter out template with matching id
    UT->>LS: Write filtered DayTemplate[]
    UT-->>TP: success
    TP->>User: Card removed with animation
```

### 9H. Edit / Rename a Template

```mermaid
sequenceDiagram
    actor User
    participant TP as TemplatesPage
    participant STS as SaveTemplateSheet
    participant UT as useTemplates
    participant LS as localStorage

    User->>TP: Taps ⋯ on "My Power Breakfast"
    TP->>TP: Shows context menu [Edit, Delete]
    User->>TP: Selects "Edit"
    TP->>STS: Opens SaveTemplateSheet(mode='edit', template)
    STS->>STS: Pre-fills name + shows food list
    User->>STS: Renames to "High Protein Breakfast"
    User->>STS: Taps "Save"
    STS->>UT: updateSavedMeal(id, { name: "High Protein Breakfast" })
    UT->>LS: Read mp_saved_meals[]
    LS-->>UT: SavedMeal[]
    UT->>UT: Find by id, merge updated fields
    UT->>LS: Write updated SavedMeal[]
    UT-->>STS: success
    STS->>TP: onClose()
    TP->>User: Card reflects new name
```

### 9I. Complete User Journey — End to End

```mermaid
sequenceDiagram
    actor User
    participant PP as PlanPage
    participant TP as TemplatesPage
    participant LS as localStorage

    Note over User,LS: === WEEK 1: Building templates ===

    User->>PP: Plans Monday meals manually
    User->>PP: Plans full week Mon–Sun
    User->>PP: Saves Breakfast as "Power Breakfast"
    PP->>LS: Store SavedMeal
    User->>PP: Saves Monday as "Cutting Day"
    PP->>LS: Store DayTemplate
    User->>PP: Saves full week as "Cut Week"
    PP->>LS: Store WeekTemplate

    Note over User,LS: === WEEK 2: Reusing templates ===

    User->>PP: Navigates to next week
    User->>PP: Loads "Cut Week" template
    PP->>LS: Read WeekTemplate → apply to 7 days
    LS-->>PP: All 7 days populated
    User->>PP: Wants to change Wednesday lunch
    User->>PP: Removes existing Wednesday lunch foods
    User->>PP: Adds new foods manually
    User->>PP: Saves Wednesday as "Rest Day"
    PP->>LS: Store new DayTemplate

    Note over User,LS: === WEEK 3: Mix and match ===

    User->>PP: Loads "Cut Week" for the week
    PP->>LS: Apply WeekTemplate
    User->>PP: Replaces Wednesday with "Rest Day" template
    PP->>LS: Apply DayTemplate to Wednesday
    User->>PP: For Saturday breakfast, loads "Power Breakfast"
    PP->>LS: Apply SavedMeal to Saturday breakfast

    Note over User,LS: === Managing templates ===

    User->>PP: Taps 📋 My Templates
    PP->>TP: Navigate to /templates
    User->>TP: Renames, deletes, reviews templates
    TP->>LS: CRUD operations
    User->>TP: Taps ← Back
    TP->>PP: Navigate back to /plan
```

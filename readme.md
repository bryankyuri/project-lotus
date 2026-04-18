# NutriPlan -- Web Application

**Version:** 1.0.0  
**Last Updated:** July 2025  
**Status:** Active Development

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Technology Stack](#technology-stack)  
3. [Architecture Overview](#architecture-overview)  
4. [Spec-Driven Development (SDD)](#spec-driven-development-sdd)  
   - [Data Models](#data-models)  
   - [API Contracts](#api-contracts)  
   - [Storage Schema](#storage-schema)  
   - [Route Specifications](#route-specifications)  
5. [User Journey](#user-journey)  
   - [Onboarding Flow](#onboarding-flow)  
   - [Daily Tracking](#daily-tracking)  
   - [Food Exploration](#food-exploration)  
   - [Weekly Planning](#weekly-planning)  
   - [Profile and Settings](#profile-and-settings)  
   - [Template Management](#template-management)  
6. [Design System](#design-system)  
   - [Color Tokens](#color-tokens)  
   - [Typography](#typography)  
   - [Shadows and Elevation](#shadows-and-elevation)  
   - [Dark Mode](#dark-mode)  
   - [Responsive Layout](#responsive-layout)  
   - [Component Library](#component-library)  
   - [Animation System](#animation-system)  
7. [Internationalization](#internationalization)  
8. [PWA Configuration](#pwa-configuration)  
9. [Project Structure](#project-structure)  
10. [Getting Started](#getting-started)  
11. [Environment Variables](#environment-variables)  
12. [Build and Deployment](#build-and-deployment)

---

## Project Overview

NutriPlan is a Progressive Web Application (PWA) for personal nutrition tracking and meal planning. It provides daily food logging against calorie and macronutrient targets, a searchable food database sourced from the Indonesian Food Composition Table (Tabel Komposisi Pangan Indonesia / TKPI), weekly meal planning with grocery list generation, exercise tracking with energy balance calculations, and a three-tier template system for reusable meals and plans. The application supports 12 languages and features full dark mode support.

---

## Technology Stack

| Category | Technology | Version |
|---|---|---|
| UI Framework | React | 19.2.4 |
| Language | TypeScript | 5.9.3 |
| Build Tool | Vite | 8.0.0 |
| CSS Framework | Tailwind CSS | 4.2.1 |
| Animation | Framer Motion | 11.18.0 |
| Routing | React Router DOM | 7.13.1 |
| Server State | TanStack React Query | 5.90.21 |
| HTTP Client | Axios | 1.13.6 |
| Internationalization | i18next / react-i18next | 25.8.18 / 16.5.8 |
| Date Handling | date-fns | 4.1.0 |
| Date Picker | react-day-picker | 9.14.0 |
| Icons | lucide-react | 0.577.0 |
| Lottie Animation | lottie-react | 2.4.1 |
| PWA | vite-plugin-pwa | 1.2.0 |
| Linting | ESLint | 9.31.0 |

**Notable architectural decisions:**

- Tailwind CSS v4 uses native `@theme` directives in CSS instead of the v3 `tailwind.config.js` approach.
- All client-side data persistence uses `localStorage`. There is no user authentication or backend database for user data.
- The REST API backend serves read-only food composition data. All user state is local.
- Path aliasing is configured as `@` mapping to `/src` via Vite resolve alias.

---

## Architecture Overview

```
Browser
  |
  +-- React SPA (Vite)
  |     |
  |     +-- Pages (lazy-loaded via React.lazy + Suspense)
  |     +-- Contexts (ThemeContext, DeviceContext)
  |     +-- Hooks (custom business logic)
  |     +-- Components (layout + ui)
  |     +-- Store (localStorage adapter)
  |     +-- Services (API client)
  |
  +-- External APIs
        |
        +-- Food API (TKPI backend at /api/v1)
        +-- Open-Meteo Weather API (open-meteo.com)
        +-- Google Fonts CDN (Plus Jakarta Sans)
```

**Provider hierarchy (outermost to innermost):**

```
React.StrictMode
  > DeviceProvider
    > ToastProvider
      > QueryClientProvider
        > ThemeProvider
          > BrowserRouter
            > Routes
```

**Rendering strategy:**

- All page components are lazy-loaded with `React.lazy` and wrapped in `Suspense` with a `SkeletonLoader` fallback.
- The `AppShell` component selects between `MobileLayout` (viewport width below 1280px) and `DesktopLayout` (viewport width 1280px and above).
- An onboarding guard in `App.tsx` redirects to `/onboarding` if the user has not completed initial setup.
- A `SplashScreen` displays for 2800ms on initial load.

---

## Spec-Driven Development (SDD)

### Data Models

All data models are defined in `src/store/localStorage.ts`.

#### SlotType

```
type SlotType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
```

#### LoggedFood

Represents a single food item logged into a meal slot.

| Field | Type | Description |
|---|---|---|
| id | number | Food item identifier from the API |
| name | string | Display name of the food |
| portion | string | Portion description (e.g., "1 sdm" / "100 g") |
| portionWeight | number | Weight of the selected portion in grams |
| quantity | number | Number of portions |
| calories | number | Total calories for quantity x portion |
| protein | number | Total protein in grams |
| carbs | number | Total carbohydrates in grams |
| fat | number | Total fat in grams |

#### DayLog

Represents all meals logged for a single day.

| Field | Type | Description |
|---|---|---|
| date | string | ISO date string (YYYY-MM-DD) |
| slots | Record<SlotType, LoggedFood[]> | Four meal slots each containing an array of logged foods |

#### LoggedExercise

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| exerciseId | string | Reference to exercise catalog entry |
| name | string | Exercise name |
| duration | number | Duration in minutes |
| caloriesBurned | number | Calculated calories burned |
| met | number | MET value used for calculation |
| timestamp | number | Unix timestamp of logging |

#### UserProfile

| Field | Type | Description |
|---|---|---|
| name | string | User display name |
| gender | 'male' or 'female' | Biological sex for BMR calculation |
| dateOfBirth | string | ISO date string |
| weight | number | Body weight in kilograms |
| height | number | Height in centimeters |

#### NutritionTargets

| Field | Type | Description |
|---|---|---|
| calories | number | Daily calorie target (default: 2000) |
| protein | number | Daily protein target in grams (default: 150) |
| carbs | number | Daily carbohydrate target in grams (default: 200) |
| fat | number | Daily fat target in grams (default: 60) |

#### SavedMeal

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| name | string | User-defined meal name |
| foods | LoggedFood[] | Array of food items in this meal |
| createdAt | number | Unix timestamp |

#### DayTemplate

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| name | string | User-defined template name |
| slots | Record<SlotType, LoggedFood[]> | Complete day of meals across all four slots |
| createdAt | number | Unix timestamp |

#### WeekTemplate

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| name | string | User-defined template name |
| days | Record<DayKey, DayTemplate['slots']> | Seven days (mon through sun) each with full slot data |
| createdAt | number | Unix timestamp |

Where `DayKey` is: `'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'`

#### AppSettings

| Field | Type | Description |
|---|---|---|
| language | string | Selected language code |
| theme | 'light' or 'dark' | Selected theme |

### API Contracts

The application consumes a REST API serving the Indonesian Food Composition Table (TKPI). Base URL is configured via the `VITE_API_URL` environment variable (default: `http://localhost:8000/api/v1`). The Axios client uses a 10-second timeout.

#### Search Foods

```
GET /foods?search={query}&page={page}&per_page={perPage}
```

**Response shape:**

| Field | Type |
|---|---|
| data | FoodItem[] |
| meta | PaginationMeta |

**FoodItem:**

| Field | Type |
|---|---|
| id | number |
| name | string |
| category | string |
| calories | number |
| protein | number |
| fat | number |
| carbs | number |

**PaginationMeta:**

| Field | Type |
|---|---|
| current_page | number |
| last_page | number |
| per_page | number |
| total | number |

#### Get Food Detail

```
GET /foods/{id}
```

**Response shape (FoodDetail):** Extends FoodItem with:

| Field | Type |
|---|---|
| macros | FoodMacros (fiber, sugar, saturated_fat, cholesterol, sodium) |
| nutrients | FoodNutrients (vitamin_a through zinc) |

#### Get Food Portions

```
GET /foods/{id}/portions
```

**Response shape:** `FoodPortion[]`

| Field | Type |
|---|---|
| id | number |
| description | string |
| weight | number |

### Storage Schema

All client-side data is persisted in `localStorage` under the following keys:

| Key | Type | Description |
|---|---|---|
| `mp_profile` | UserProfile | User profile data |
| `mp_daylog` | Record<string, DayLog> | Day logs keyed by ISO date |
| `mp_exercises` | Record<string, LoggedExercise[]> | Exercise logs keyed by ISO date |
| `mp_targets` | NutritionTargets | Daily nutrition targets |
| `mp_settings` | AppSettings | Application settings |
| `mp_language` | string | Selected language code (also used by i18next LanguageDetector) |
| `mp_grocery_checked` | Record<string, boolean> | Grocery list checked state |
| `mp_onboarding_done` | boolean | Whether onboarding has been completed |
| `mp_saved_meals` | SavedMeal[] | Saved meal templates |
| `mp_day_templates` | DayTemplate[] | Day templates |
| `mp_week_templates` | WeekTemplate[] | Week templates |
| `mp_theme` | string | Theme preference ('light' or 'dark') |

### Route Specifications

| Path | Component | Layout | Description |
|---|---|---|---|
| `/onboarding` | OnboardingPage | None | First-time user setup flow |
| `/` | TodayPage | AppShell | Daily dashboard with food and exercise tracking |
| `/explore` | ExplorePage | AppShell | Food database browser with search and categories |
| `/plan` | PlanPage | AppShell | Weekly meal planner with grocery list |
| `/profile` | ProfilePage | AppShell | User profile overview |
| `/profile/edit` | EditProfilePage | AppShell | Edit profile details |
| `/profile/targets` | EditTargetsPage | AppShell | Edit nutrition targets |
| `/settings` | SettingsPage | AppShell | Language and theme settings |
| `/templates` | TemplatesPage | AppShell | Template management (saved meals, day, week) |
| `/info` | InfoPage | AppShell | Portion guide, data sources, disclaimers |

---

## User Journey

### Onboarding Flow

The onboarding experience is a five-phase sequence managed by a state machine in `OnboardingPage.tsx` (894 lines).

**Phase 1 -- Language Selection**

- Grid of 12 languages, each displayed with its native name and corresponding country flag (SVG).
- Selection persists to `localStorage` and updates the i18next language.
- Supported: English, Bahasa Indonesia, Chinese, Arabic, Japanese, Korean, Russian, French, German, Spanish, Dutch, Hindi.

**Phase 2 -- Introduction Carousel**

- Three animated slides introducing core features.
- Slide transitions use Framer Motion `slideFromRight` / `slideFromLeft` variants with `AnimatePresence` and directional exit.
- Each slide has an illustration, title, and description.
- Navigation via Next/Skip buttons and dot indicators.

**Phase 3 -- Transition Setup**

- Intermediate screen bridging the intro to the profile wizard.
- Provides context for the data collection that follows.

**Phase 4 -- Profile and Targets Wizard**

- **Step 1 (Profile):** Collects name, gender (male/female toggle), date of birth (DatePickerInput), weight (kg), and height (cm).
- **Step 2 (Targets):** Displays calculated BMR using the Mifflin-St Jeor equation, with auto-suggested calorie and macro targets. Users may override all values.

**BMR Calculation (Mifflin-St Jeor equation):**

```
Male:   BMR = (10 x weight_kg) + (6.25 x height_cm) - (5 x age_years) + 5
Female: BMR = (10 x weight_kg) + (6.25 x height_cm) - (5 x age_years) - 161
```

TDEE is estimated at a sedentary activity factor of 1.2. Default macro split: 30% protein, 45% carbohydrates, 25% fat.

**Phase 5 -- Completion**

- Confirmation screen with a Lottie animation.
- Sets `mp_onboarding_done` to `true` in localStorage.
- Navigates to the main dashboard.

### Daily Tracking

**TodayPage** serves as the primary dashboard.

- **Header:** Personalized greeting with the user's name, live clock with seconds (`useDateTime` hook), and current weather conditions.
- **Weather:** Fetched from Open-Meteo API using browser geolocation (falls back to Jakarta coordinates: -6.2, 106.8). Displays temperature and a localized weather description derived from WMO weather codes. Descriptions are available in all 12 supported languages.
- **Progress Ring:** Circular SVG visualization showing current calorie intake as a percentage of the daily target.
- **Macro Breakdown:** Four horizontal progress bars for calories, protein, carbohydrates, and fat showing consumed vs. target.
- **Tabbed View:**
  - **Meals Tab:** Four meal slot cards (breakfast, lunch, dinner, snack). Each card shows logged foods with an add button that opens `FoodAddSheet`. Each logged item supports quantity editing and removal. Cards include a kebab menu for saving the slot as a saved meal.
  - **Exercise Tab:** Exercise log with add functionality via `ExerciseAddSheet`. Shows energy balance calculation: `Food Intake - BMR - Exercise Burned = Net Calories`.
- **Date Navigation:** `DatePickerInput` component for navigating to any date's log. Date formatting respects the selected locale using a `DATE_LOCALE_MAP` covering all 12 languages.

### Food Exploration

**ExplorePage** provides a searchable interface to the TKPI food database (1200+ items).

- **Search:** Real-time text search with debounced API calls via TanStack React Query.
- **Category Filters:** Horizontally scrollable chip list of food categories. Each category has a mapped icon from `categoryIcons.ts`.
- **Results:** Paginated food list with infinite-scroll-style "Load More" pagination.
- **Favorites:** Locally stored favorite foods displayed in a dedicated section above search results.
- **Food Detail:** Tapping a food item opens `FoodDetailSheet` (bottom sheet) displaying full nutritional information including macros, vitamins, and minerals.

### Weekly Planning

**PlanPage** provides a seven-day (Monday through Sunday) meal planning interface.

- **Day Selector:** Horizontal day picker showing the current week. Each day shows a summary dot indicator.
- **Meal Slots:** Same four-slot structure as TodayPage, but for the selected plan day.
- **Grocery List:** Auto-generated consolidated ingredient list from all planned meals for the week, derived from `useWeekPlan` hook. Items support checked/unchecked state.
- **Template Integration:**
  - Save current day as a Day Template.
  - Save current week as a Week Template.
  - Load a Saved Meal into a specific slot.
  - Load a Day Template into the selected day (with replace or append options).
  - Load a Week Template across the entire week (with confirmation dialog).
  - Quick link to `/templates` for template management.

### Profile and Settings

- **ProfilePage:** Displays current user profile with navigation to edit pages.
- **EditProfilePage:** Full-page form for editing name, gender, date of birth, weight, and height.
- **EditTargetsPage:** Full-page form for editing calorie and macro targets with BMR recalculation.
- **SettingsPage:** Language switcher (grid of 12 languages with flags) and theme toggle (light/dark).

### Template Management

**TemplatesPage** provides a three-tab interface for managing reusable templates.

| Tab | Entity | Operations |
|---|---|---|
| Saved Meals | SavedMeal | View, rename, delete |
| Day Templates | DayTemplate | View, rename, delete |
| Week Templates | WeekTemplate | View, rename, delete |

Templates are created from context menus within TodayPage and PlanPage. The TemplatesPage serves as a centralized management view.

---

## Design System

### Color Tokens

All design tokens are defined in `src/index.css` using the Tailwind CSS v4 `@theme` directive.

**Light Mode (default):**

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | #4ade80 | Primary interactive elements |
| `--color-primary-light` | #dcfce7 | Light primary backgrounds |
| `--color-primary-dark` | #16a34a | Dark primary variant |
| `--color-gradient-from` | #bef264 | Gradient start (lime) |
| `--color-gradient-to` | #4ade80 | Gradient end (green) |
| `--color-accent` | #facc15 | Accent / highlight color (warm banana) |
| `--color-bg` | #ecf5e4 | Page background |
| `--color-surface` | #ffffff | Card and container backgrounds |
| `--color-surface-elevated` | #f8fdf4 | Elevated surface variant |
| `--color-border` | #d0e8c0 | Border color |
| `--color-text` | #1b1b18 | Primary text |
| `--color-text-secondary` | #78776e | Secondary text |
| `--color-text-muted` | #a8a89e | Muted text |

**Macronutrient colors:**

| Token | Value | Usage |
|---|---|---|
| `--color-calories` | #ff6b35 | Calorie indicators |
| `--color-protein` | #5b8def | Protein indicators |
| `--color-carbs` | #7ac74f | Carbohydrate indicators |
| `--color-fat` | #ffb800 | Fat indicators |

**Gradient utilities (CSS classes):**

| Class | Description |
|---|---|
| `.bg-gradient-primary` | Linear gradient from `gradient-from` to `gradient-to` (135 degrees) |
| `.bg-gradient-primary-hover` | Slightly adjusted gradient for hover states |
| `.bg-gradient-primary-soft` | Subtle gradient with low opacity for backgrounds |

### Typography

- **Font Family:** Plus Jakarta Sans (loaded from Google Fonts CDN).
- **Loading:** `<link>` tag in `index.html` with `font-display: swap`.
- **Weights Used:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold).
- **Scale:** Standard Tailwind CSS typographic scale (`text-xs` through `text-4xl`).

### Shadows and Elevation

| Token | Value | Usage |
|---|---|---|
| `--shadow-card` | 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03) | Default card elevation |
| `--shadow-card-hover` | 0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04) | Hovered card elevation |
| `--shadow-sheet` | 0 -4px 24px rgba(0,0,0,0.08) | Bottom sheet overlay |
| `--shadow-nav` | 0 -1px 12px rgba(0,0,0,0.06), 0 -1px 4px rgba(0,0,0,0.03) | Bottom navigation bar |

### Dark Mode

Dark mode is toggled via `ThemeContext` and persisted in `localStorage` under `mp_theme`. The system detects OS preference via `matchMedia('(prefers-color-scheme: dark)')` as the initial default.

Activation applies the `dark` class to the `<html>` element. All color overrides are defined in `index.css` under `html.dark`.

**Dark mode color overrides:**

| Token | Dark Value |
|---|---|
| `--color-bg` | #0f1a12 |
| `--color-surface` | #1a2b1f |
| `--color-surface-elevated` | #223829 |
| `--color-border` | #2e4a37 |
| `--color-text` | #e8f5e9 |
| `--color-text-secondary` | #a5d6a7 |
| `--color-text-muted` | #6b9b7a |
| `--color-primary-light` | #1a3a25 |
| `--color-primary-dark` | #6ee7a0 |
| `--shadow-card` | 0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.15) |
| `--shadow-nav` | 0 -1px 12px rgba(0,0,0,0.3), 0 -1px 4px rgba(0,0,0,0.2) |

### Responsive Layout

The application uses a single breakpoint at **1280px**.

| Viewport | Layout | Navigation |
|---|---|---|
| Below 1280px | MobileLayout | BottomNav (floating pill-shaped bar with sliding indicator) |
| 1280px and above | DesktopLayout | Sidebar (fixed 256px left panel with NutriPlan branding) |

The layout switch is handled by the `AppShell` component which reads viewport width from `DeviceContext`. The `DeviceContext` also provides browser detection, OS detection, PWA mode detection, and touch capability flags.

### Component Library

The application includes 16 reusable UI components exported from `src/components/ui/index.ts`.

| Component | Description |
|---|---|
| AnimatedNumber | Smooth number transitions using Framer Motion |
| BottomSheet | Draggable modal sheet with backdrop, snap-to-close gesture |
| Button | Standard button with variant and size props |
| Chip | Selectable filter chip for categories |
| DatePickerInput | Date selector using react-day-picker with locale support |
| EmptyState | Placeholder illustration for empty lists |
| FoodListItem | Food item row with macros summary |
| FoodModal | Full-screen food detail overlay |
| MealSlotCard | Meal slot container with food list, add button, and kebab menu |
| PageTransition | Framer Motion wrapper for route transitions |
| ProgressRing | SVG circular progress indicator |
| SkeletonLoader | Animated placeholder shimmer for loading states |
| SplashScreen | Branded loading screen with Lottie animation |
| ThemeSwitch | Light/dark mode toggle switch |
| Toast | Notification toast with auto-dismiss |

**Bottom sheet components (pages/sheets/):**

| Component | Description |
|---|---|
| FoodAddSheet | Food search with portion selection, saved meals section, quantity picker, macro preview |
| FoodDetailSheet | Full nutritional breakdown (macros, vitamins, minerals) |
| ExerciseAddSheet | Exercise catalog browser with duration input and calorie preview |
| SaveTemplateSheet | Name input for saving new templates |
| LoadTemplateSheet | Template picker with LoadSavedMealSheet, LoadDayTemplateSheet (replace/append), LoadWeekTemplateSheet (confirmation) |

### Animation System

Animation presets are defined in `src/utils/animations.ts` using Framer Motion.

**Transition presets:**

| Preset | Configuration |
|---|---|
| `spring` | type: spring, stiffness: 300, damping: 30 |
| `springBouncy` | type: spring, stiffness: 400, damping: 25 |
| `smooth` | type: tween, duration: 0.3, ease: easeInOut |
| `quick` | type: tween, duration: 0.15, ease: easeOut |

**Variant presets:**

| Variant | Animation |
|---|---|
| `fadeInUp` | Fade in with 12px upward translation |
| `scaleIn` | Scale from 0.95 to 1.0 with fade |
| `slideFromRight` | Slide in from 100% right |
| `slideFromLeft` | Slide in from -100% left |
| `slideFromBottom` | Slide in from 100% below |
| `staggerContainer` | Parent container with configurable child stagger delay |

The `stagger` utility function generates container variants with custom `staggerChildren` timing.

---

## Internationalization

The application supports 12 languages using i18next with HTTP backend loading.

| Code | Language | Flag |
|---|---|---|
| en | English | us.svg |
| id | Bahasa Indonesia | id.svg |
| zh | Chinese (Simplified) | cn.svg |
| ar | Arabic | sa.svg |
| ja | Japanese | jp.svg |
| ko | Korean | kr.svg |
| ru | Russian | ru.svg |
| fr | French | fr.svg |
| de | German | de.svg |
| es | Spanish | es.svg |
| nl | Dutch | nl.svg |
| hi | Hindi | in.svg |

**Configuration:**

- Backend: HTTP backend loading JSON files from `/locales/{lng}/translation.json`.
- Detection: `localStorage` key `mp_language`, then browser `navigator` language.
- Fallback: English (`en`).
- Each translation file contains approximately 345 keys covering all UI text.
- Weather descriptions (WMO codes) are translated inline within the `useWeather` hook for all 12 languages.
- Date formatting uses `date-fns` locale objects mapped per language via `DATE_LOCALE_MAP`.

---

## PWA Configuration

The application is configured as a Progressive Web App via `vite-plugin-pwa`.

| Property | Value |
|---|---|
| App Name | NutriPlan |
| Short Name | NutriPlan |
| Theme Color | #A8D922 |
| Background Color | #F6F6F6 |
| Display Mode | standalone |
| Register Type | autoUpdate |

**Caching strategy:**

- **Static assets:** Precached via Workbox with glob pattern `**/*.{js,css,html,ico,png,svg}`.
- **API responses:** Runtime caching with `StaleWhileRevalidate` strategy for food API calls (`/api/v1/foods`). Cache named `food-api-cache` with a maximum of 200 entries and 1-hour expiration.

---

## Project Structure

```
web_revamp/
  public/
    flags/                    -- SVG country flag icons (12 files)
    locales/                  -- Translation JSON files (12 language directories)
  src/
    components/
      layout/
        AppShell.tsx          -- Responsive layout switcher
        BottomNav.tsx         -- Mobile floating bottom navigation
        DesktopLayout.tsx     -- Desktop layout wrapper
        MobileLayout.tsx      -- Mobile layout wrapper
        Sidebar.tsx           -- Desktop sidebar navigation
      ui/
        index.ts              -- Barrel export for all UI components
        AnimatedNumber.tsx
        BottomSheet.tsx
        Button.tsx
        Chip.tsx
        DatePickerInput.tsx
        EmptyState.tsx
        FoodListItem.tsx
        FoodModal.tsx
        MealSlotCard.tsx
        PageTransition.tsx
        ProgressRing.tsx
        SkeletonLoader.tsx
        SplashScreen.tsx
        ThemeSwitch.tsx
        Toast.tsx
    contexts/
      DeviceContext.tsx        -- Browser, OS, PWA, touch, viewport detection
      ThemeContext.tsx          -- Light/dark theme management
    data/
      exerciseCatalog.ts      -- Exercise MET values (Compendium of Physical Activities)
      favoriteFoods.json      -- Static favorite foods data
      mockFoods.json          -- Mock food data for development
    hooks/
      useDayLog.ts            -- Single-day food log CRUD operations
      useDateTime.ts          -- Live clock with seconds
      useDevice.ts            -- DeviceContext consumer hook
      useExercise.ts          -- Exercise logging with MET-based calorie calculation
      useFood.ts              -- React Query hooks for food search, detail, portions
      useNutritionProgress.ts -- Progress calculation against targets
      useSplash.ts            -- Splash screen timer
      useTemplates.ts         -- Save, delete, rename, apply for all three template tiers
      useWeather.ts           -- Open-Meteo API with geolocation and WMO codes
      useWeekPlan.ts          -- Seven-day plan with summary and grocery list
    i18n/
      index.ts                -- i18next configuration
    pages/
      sheets/
        ExerciseAddSheet.tsx  -- Exercise picker bottom sheet
        FoodAddSheet.tsx      -- Food search and portion picker bottom sheet
        FoodDetailSheet.tsx   -- Nutritional detail bottom sheet
        LoadTemplateSheet.tsx -- Template loader (saved meal, day, week)
        SaveTemplateSheet.tsx -- Template name input sheet
      EditProfilePage.tsx
      EditTargetsPage.tsx
      ExplorePage.tsx
      InfoPage.tsx
      OnboardingPage.tsx
      PlanPage.tsx
      ProfilePage.tsx
      SettingsPage.tsx
      TemplatesPage.tsx
      TodayPage.tsx
    services/
      api.ts                  -- Axios client and API endpoint functions
    store/
      localStorage.ts         -- Type definitions and localStorage CRUD operations
    utils/
      animations.ts           -- Framer Motion transition and variant presets
      bmr.ts                  -- Mifflin-St Jeor BMR, TDEE, macro suggestion
      categoryIcons.ts        -- Food category to icon mapping
      portionKey.ts           -- Portion description to i18n key mapping
    App.tsx                   -- Root component with routing and providers
    index.css                 -- Global styles, theme tokens, dark mode overrides
    main.tsx                  -- Application entry point
    vite-env.d.ts             -- Vite type declarations
  index.html                  -- HTML entry point with font loading
  package.json
  tsconfig.json
  tsconfig.app.json
  vite.config.ts
  eslint.config.js
```

---

## Getting Started

**Prerequisites:**

- Node.js (version 18 or higher recommended)
- npm or yarn
- A running instance of the TKPI food API backend (default: `http://localhost:8000/api/v1`)

**Installation:**

```bash
cd web_revamp
npm install
```

**Development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Base URL for the food composition API backend |

---

## Build and Deployment

**Production build:**

```bash
npm run build
```

Output is generated in the `dist/` directory. The build includes PWA service worker registration and asset precaching.

**Preview production build locally:**

```bash
npm run preview
```

**Lint:**

```bash
npm run lint
```

---

*This document is intended for internal reference and Confluence publication. For contribution guidelines or API backend documentation, refer to the respective project repositories.*

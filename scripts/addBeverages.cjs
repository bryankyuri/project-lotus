/**
 * addBeverages.cjs
 * ─────────────────────────────────────────────────────────────────
 * Adds ~55 common Indonesian & international beverages to mockFoods.json
 * Nutritional values are per 100 g/ml, sourced from:
 *   - USDA FoodData Central SR Legacy
 *   - DKBM (Daftar Komposisi Bahan Makanan) Indonesia
 *   - Nutrition labels of common Indonesian products
 * ─────────────────────────────────────────────────────────────────
 */
const fs = require('fs');
const path = require('path');

const FOODS_PATH = path.join(__dirname, '..', 'src', 'data', 'mockFoods.json');
const foods = JSON.parse(fs.readFileSync(FOODS_PATH, 'utf8'));

const START_ID = Math.max(...foods.map(f => f.id)) + 1;           // 1149
const START_PORTION_ID = Math.max(...foods.flatMap(f => f.portions.map(p => p.id))) + 1; // 865

let nextId = START_ID;
let nextPortionId = START_PORTION_ID;
let codeNum = 2; // QR002, QR003, …

function makeCode() {
  return `QR${String(codeNum++).padStart(3, '0')}`;
}

// Default drink portions (ml≈g for water-based drinks)
function drinkPortions() {
  const base = nextPortionId;
  nextPortionId += 4;
  return [
    { id: base,     portion_description: '1 gelas',   modifier: '200 ml', gram_weight: 200, amount: 1 },
    { id: base + 1, portion_description: '½ gelas',   modifier: '100 ml', gram_weight: 100, amount: 0.5 },
    { id: base + 2, portion_description: '1 cangkir',  modifier: '150 ml', gram_weight: 150, amount: 1 },
    { id: base + 3, portion_description: '100g',       modifier: '',       gram_weight: 100, amount: 1 },
  ];
}

// Small cup / bottle portions for special drinks
function smallPortions() {
  const base = nextPortionId;
  nextPortionId += 4;
  return [
    { id: base,     portion_description: '1 gelas',    modifier: '200 ml', gram_weight: 200, amount: 1 },
    { id: base + 1, portion_description: '1 cangkir',  modifier: '150 ml', gram_weight: 150, amount: 1 },
    { id: base + 2, portion_description: '1 botol kecil', modifier: '250 ml', gram_weight: 250, amount: 1 },
    { id: base + 3, portion_description: '100g',       modifier: '',       gram_weight: 100, amount: 1 },
  ];
}

// Can / bottle portions for packaged drinks
function canPortions() {
  const base = nextPortionId;
  nextPortionId += 4;
  return [
    { id: base,     portion_description: '1 kaleng',    modifier: '330 ml', gram_weight: 330, amount: 1 },
    { id: base + 1, portion_description: '1 gelas',     modifier: '200 ml', gram_weight: 200, amount: 1 },
    { id: base + 2, portion_description: '1 botol',     modifier: '500 ml', gram_weight: 500, amount: 1 },
    { id: base + 3, portion_description: '100g',        modifier: '',       gram_weight: 100, amount: 1 },
  ];
}

function espressoPortions() {
  const base = nextPortionId;
  nextPortionId += 4;
  return [
    { id: base,     portion_description: '1 shot',      modifier: '30 ml',  gram_weight: 30, amount: 1 },
    { id: base + 1, portion_description: '1 cangkir',   modifier: '150 ml', gram_weight: 150, amount: 1 },
    { id: base + 2, portion_description: '1 gelas',     modifier: '240 ml', gram_weight: 240, amount: 1 },
    { id: base + 3, portion_description: '100g',        modifier: '',       gram_weight: 100, amount: 1 },
  ];
}

function makeBeverage(name, macros, nutrients, opts = {}) {
  const portionFn = opts.portionFn || drinkPortions;
  const item = {
    id: nextId++,
    code: makeCode(),
    name,
    food_category: 'Minuman',
    food_type: opts.food_type || 'Olahan',
    source: opts.source || 'USDA-SR/DKBM',
    macros: {
      calories:      macros.cal   ?? 0,
      protein:       macros.pro   ?? 0,
      carbs:         macros.carb  ?? 0,
      fat:           macros.fat   ?? 0,
      fiber:         macros.fiber ?? null,
      sugar:         macros.sugar ?? null,
      sodium:        macros.na    ?? null,
      cholesterol:   macros.chol  ?? null,
      saturated_fat: macros.sfa   ?? null,
    },
    nutrients: {
      water:         nutrients.water  ?? null,
      ash:           nutrients.ash    ?? null,
      calcium:       nutrients.ca     ?? null,
      phosphorus:    nutrients.p      ?? null,
      iron:          nutrients.fe     ?? null,
      potassium:     nutrients.k      ?? null,
      copper:        nutrients.cu     ?? null,
      zinc:          nutrients.zn     ?? null,
      retinol:       nutrients.retinol ?? null,
      beta_carotene: nutrients.bc     ?? null,
      carotene:      nutrients.car    ?? null,
      thiamin:       nutrients.b1     ?? null,
      riboflavin:    nutrients.b2     ?? null,
      niacin:        nutrients.b3     ?? null,
      vitamin_c:     nutrients.vc     ?? null,
    },
    bdd: 100,
    portions: portionFn(),
  };
  return item;
}

// ═══════════════════════════════════════════════════════════════
//  BEVERAGE DATA  (all values per 100 g/ml)
// ═══════════════════════════════════════════════════════════════

const beverages = [

  // ─── TEA ────────────────────────────────────────────────
  makeBeverage('Teh tawar (tanpa gula)', // Unsweetened brewed tea
    { cal: 1, pro: 0, carb: 0.3, fat: 0, sugar: 0, na: 3 },
    { water: 99.7, ca: 0, p: 1, fe: 0, k: 12, b1: 0, b2: 0.01, b3: 0, vc: 0 }),

  makeBeverage('Teh manis', // Sweet tea (2 tsp sugar per glass)
    { cal: 30, pro: 0, carb: 7.5, fat: 0, sugar: 7.5, na: 3 },
    { water: 92.2, ca: 0, p: 1, fe: 0, k: 12, vc: 0 }),

  makeBeverage('Es teh manis', // Iced sweet tea
    { cal: 30, pro: 0, carb: 7.5, fat: 0, sugar: 7.5, na: 3 },
    { water: 92.2, ca: 0, p: 1, fe: 0, k: 12, vc: 0 }),

  makeBeverage('Teh hijau, seduh', // Brewed green tea
    { cal: 1, pro: 0.2, carb: 0, fat: 0, sugar: 0, na: 1 },
    { water: 99.9, ca: 0, p: 1, fe: 0, k: 8, b1: 0.01, b2: 0.06, b3: 0.03, vc: 0.3 }),

  makeBeverage('Teh botol manis (kemasan)', // Bottled sweet tea
    { cal: 32, pro: 0, carb: 8, fat: 0, sugar: 8, na: 12 },
    { water: 91.8, ca: 0, k: 5 },
    { portionFn: canPortions }),

  // ─── COFFEE ─────────────────────────────────────────────
  makeBeverage('Kopi hitam (tanpa gula)', // Black coffee, no sugar
    { cal: 2, pro: 0.1, carb: 0, fat: 0, sugar: 0, na: 2 },
    { water: 99.4, ca: 2, p: 3, fe: 0.01, k: 49, b2: 0.01, b3: 0.19 },
    { portionFn: espressoPortions }),

  makeBeverage('Kopi tubruk manis', // Tubruk coffee with sugar
    { cal: 35, pro: 0.1, carb: 8.5, fat: 0, sugar: 8.5, na: 2 },
    { water: 91, ca: 2, p: 3, fe: 0.01, k: 49, b3: 0.19 }),

  makeBeverage('Kopi susu', // Coffee with milk
    { cal: 30, pro: 0.8, carb: 4.5, fat: 0.8, sugar: 4.5, na: 18, sfa: 0.5 },
    { water: 93.5, ca: 22, p: 20, fe: 0, k: 66, b2: 0.04 }),

  makeBeverage('Es kopi susu (kekinian)', // Iced milk coffee (modern style)
    { cal: 45, pro: 1, carb: 7, fat: 1.2, sugar: 6.5, na: 20, sfa: 0.7 },
    { water: 90.3, ca: 25, p: 22, k: 70 }),

  makeBeverage('Kopi instan, bubuk kering', // Instant coffee powder
    { cal: 353, pro: 12.2, carb: 41.1, fat: 0.5, fiber: 0, sugar: 0, na: 148 },
    { water: 3.1, ash: 9.5, ca: 141, p: 303, fe: 4.4, k: 3535, zn: 0.4, b2: 0.12, b3: 28.2 },
    { food_type: 'Tunggal' }),

  makeBeverage('Kopi susu sachet (3in1)', // 3-in-1 instant coffee sachet
    { cal: 75, pro: 0.8, carb: 13, fat: 2.2, sugar: 11, na: 50, sfa: 1.8 },
    { water: 83.5, ca: 15, p: 12, k: 40 }),

  makeBeverage('Espresso', 
    { cal: 9, pro: 0.1, carb: 1.7, fat: 0.2, sugar: 0, na: 14 },
    { water: 97.8, ca: 2, p: 7, fe: 0.1, k: 115, b3: 5.2 },
    { portionFn: espressoPortions }),

  makeBeverage('Cappuccino', 
    { cal: 30, pro: 1.5, carb: 3, fat: 1.2, sugar: 2.5, na: 22, sfa: 0.7, chol: 4 },
    { water: 93.8, ca: 45, p: 35, k: 75, b2: 0.07 }),

  makeBeverage('Latte', 
    { cal: 37, pro: 1.8, carb: 3.5, fat: 1.5, sugar: 3, na: 25, sfa: 0.9, chol: 5 },
    { water: 92.8, ca: 55, p: 42, k: 80, b2: 0.08 }),

  // ─── CHOCOLATE & MALT ──────────────────────────────────
  makeBeverage('Susu cokelat', // Chocolate milk
    { cal: 83, pro: 3.2, carb: 10.7, fat: 3.4, sugar: 9.5, na: 60, sfa: 2.1, chol: 12 },
    { water: 82, ca: 112, p: 89, fe: 0.2, k: 197, zn: 0.4, b1: 0.04, b2: 0.17, b3: 0.2, vc: 1 }),

  makeBeverage('Cokelat panas (hot chocolate)', // Hot chocolate
    { cal: 77, pro: 3.1, carb: 10.5, fat: 2.8, sugar: 9.5, na: 45, sfa: 1.7, chol: 10 },
    { water: 83, ca: 100, p: 85, fe: 0.3, k: 190, b2: 0.15, vc: 0.5 }),

  makeBeverage('Milo (seduh)', // Milo drink prepared
    { cal: 60, pro: 1.5, carb: 10.5, fat: 1.5, sugar: 8, na: 30, sfa: 0.8 },
    { water: 86, ca: 60, p: 50, fe: 1.5, k: 100, b1: 0.1, b2: 0.1, b3: 1, vc: 3 }),

  // ─── MILK-BASED ─────────────────────────────────────────
  makeBeverage('Susu segar (whole milk)', // Whole milk
    { cal: 61, pro: 3.2, carb: 4.8, fat: 3.3, sugar: 5, na: 43, sfa: 1.9, chol: 10 },
    { water: 88.1, ash: 0.7, ca: 113, p: 91, fe: 0, k: 132, zn: 0.4, b1: 0.04, b2: 0.18, b3: 0.1, vc: 0 }),

  makeBeverage('Susu skim (low fat)', // Skim milk
    { cal: 34, pro: 3.4, carb: 5, fat: 0.1, sugar: 5, na: 42, sfa: 0.1, chol: 2 },
    { water: 90.8, ca: 122, p: 101, fe: 0, k: 156, zn: 0.4, b1: 0.04, b2: 0.18, b3: 0.1, vc: 0 }),

  makeBeverage('Susu UHT cokelat', // UHT chocolate milk
    { cal: 82, pro: 2.9, carb: 11, fat: 3, sugar: 10, na: 55, sfa: 1.8, chol: 10 },
    { water: 82.5, ca: 100, p: 80, k: 170, b2: 0.15 },
    { portionFn: canPortions }),

  makeBeverage('Susu UHT stroberi', // UHT strawberry milk
    { cal: 78, pro: 2.8, carb: 11, fat: 2.5, sugar: 10, na: 55, sfa: 1.5, chol: 8 },
    { water: 83, ca: 95, p: 75, k: 160, b2: 0.14 },
    { portionFn: canPortions }),

  makeBeverage('Susu kental manis (encer)', // Sweetened condensed milk diluted
    { cal: 80, pro: 1.6, carb: 13.5, fat: 2.2, sugar: 13, na: 30, sfa: 1.3, chol: 8 },
    { water: 82, ca: 55, p: 45, k: 80, b2: 0.08 }),

  makeBeverage('Susu kedelai', // Soy milk
    { cal: 33, pro: 2.8, carb: 1.8, fat: 1.6, sugar: 0.8, na: 12, sfa: 0.2 },
    { water: 93.3, ca: 4, p: 42, fe: 0.4, k: 141, zn: 0.2, b1: 0.02, b2: 0.02, b3: 0.1 }),

  makeBeverage('Susu kedelai manis', // Sweet soy milk
    { cal: 50, pro: 2.5, carb: 6.5, fat: 1.5, sugar: 5.5, na: 15, sfa: 0.2 },
    { water: 89, ca: 4, p: 40, fe: 0.3, k: 130, b1: 0.02 }),

  makeBeverage('Susu almond', // Almond milk
    { cal: 15, pro: 0.6, carb: 0.6, fat: 1.1, sugar: 0, na: 67, sfa: 0.1 },
    { water: 97.3, ca: 184, p: 9, fe: 0.3, k: 67, b2: 0.01, vc: 0 }),

  makeBeverage('Susu oat', // Oat milk
    { cal: 47, pro: 1, carb: 7, fat: 1.5, sugar: 4, na: 36, sfa: 0.2, fiber: 0.8 },
    { water: 90, ca: 120, p: 50, fe: 0.2, k: 60 }),

  makeBeverage('Yogurt drink (cair)', // Yogurt drink (liquid)
    { cal: 63, pro: 2.8, carb: 9.5, fat: 1.5, sugar: 9, na: 40, sfa: 0.9, chol: 5 },
    { water: 85.5, ca: 100, p: 80, k: 130, b2: 0.14, vc: 0.5 },
    { portionFn: smallPortions }),

  makeBeverage('Yakult', // Yakult probiotic drink
    { cal: 50, pro: 0.8, carb: 11.5, fat: 0, sugar: 11, na: 10 },
    { water: 87.5, ca: 15, p: 12, k: 20 },
    { portionFn: smallPortions }),

  // ─── FRUIT JUICES ───────────────────────────────────────
  makeBeverage('Jus jeruk (segar)', // Fresh orange juice
    { cal: 45, pro: 0.7, carb: 10.4, fat: 0.2, sugar: 8.4, na: 1, fiber: 0.2 },
    { water: 88.3, ca: 11, p: 17, fe: 0.2, k: 200, b1: 0.09, b2: 0.03, b3: 0.4, vc: 50 }),

  makeBeverage('Es jeruk manis', // Iced orange drink with sugar
    { cal: 55, pro: 0.4, carb: 13.5, fat: 0.1, sugar: 12.5, na: 2 },
    { water: 85.8, ca: 8, p: 12, k: 130, vc: 30 }),

  makeBeverage('Jus alpukat', // Avocado juice (blended with milk & sugar)
    { cal: 85, pro: 1.5, carb: 9, fat: 5, sugar: 7, na: 15, sfa: 1.2 },
    { water: 84, ca: 20, p: 25, fe: 0.2, k: 200, b1: 0.02, vc: 5 }),

  makeBeverage('Jus mangga', // Mango juice
    { cal: 51, pro: 0.1, carb: 12.7, fat: 0.1, sugar: 12, na: 3 },
    { water: 86.8, ca: 8, p: 9, fe: 0.1, k: 78, bc: 215, b1: 0.02, vc: 18 }),

  makeBeverage('Jus jambu biji', // Guava juice
    { cal: 40, pro: 0.4, carb: 9.6, fat: 0.1, sugar: 8.5, na: 3 },
    { water: 89.5, ca: 12, p: 10, fe: 0.2, k: 152, vc: 72 }),

  makeBeverage('Jus semangka', // Watermelon juice
    { cal: 30, pro: 0.6, carb: 7.6, fat: 0.2, sugar: 6.2, na: 1 },
    { water: 91.5, ca: 7, p: 11, fe: 0.2, k: 112, vc: 8.1 }),

  makeBeverage('Jus melon', // Melon juice
    { cal: 34, pro: 0.8, carb: 8.2, fat: 0.2, sugar: 7.9, na: 16 },
    { water: 90.2, ca: 9, p: 15, fe: 0.2, k: 267, vc: 37 }),

  makeBeverage('Jus nanas', // Pineapple juice
    { cal: 53, pro: 0.4, carb: 12.9, fat: 0.1, sugar: 10, na: 2, fiber: 0.2 },
    { water: 86.4, ca: 13, p: 8, fe: 0.3, k: 130, b1: 0.06, b2: 0.02, b3: 0.2, vc: 10 }),

  makeBeverage('Jus apel', // Apple juice
    { cal: 46, pro: 0.1, carb: 11.3, fat: 0.1, sugar: 9.6, na: 4 },
    { water: 88.2, ca: 8, p: 7, fe: 0.1, k: 101, vc: 0.9 }),

  makeBeverage('Jus tomat', // Tomato juice
    { cal: 17, pro: 0.8, carb: 3.9, fat: 0.1, sugar: 2.6, na: 10, fiber: 0.4 },
    { water: 94.5, ca: 10, p: 18, fe: 0.4, k: 229, bc: 270, b1: 0.04, b2: 0.03, b3: 0.7, vc: 18.3 }),

  makeBeverage('Jus wortel', // Carrot juice
    { cal: 40, pro: 0.9, carb: 9.3, fat: 0.2, sugar: 3.9, na: 29, fiber: 0.8 },
    { water: 88.9, ca: 24, p: 21, fe: 0.3, k: 292, bc: 6450, b1: 0.04, b2: 0.02, b3: 0.4, vc: 3.6 }),

  // ─── TRADITIONAL INDONESIAN ─────────────────────────────
  makeBeverage('Es cendol / dawet', // Cendol iced dessert drink
    { cal: 95, pro: 0.5, carb: 18, fat: 2.5, sugar: 15, na: 25, sfa: 2 },
    { water: 78.5, ca: 10, p: 8, fe: 0.2, k: 50 }),

  makeBeverage('Es campur', // Mixed ice dessert
    { cal: 80, pro: 0.8, carb: 16, fat: 1.5, sugar: 14, na: 15, sfa: 1.2 },
    { water: 81, ca: 12, p: 10, fe: 0.3, k: 55, vc: 3 }),

  makeBeverage('Wedang jahe', // Ginger warm drink
    { cal: 25, pro: 0.1, carb: 6, fat: 0, sugar: 5.5, na: 3 },
    { water: 93.5, ca: 2, p: 2, fe: 0.1, k: 20, vc: 0.5 }),

  makeBeverage('Bandrek', // Bandrek (Sundanese ginger drink with coconut milk)
    { cal: 55, pro: 0.3, carb: 10, fat: 1.5, sugar: 9, na: 8, sfa: 1.2 },
    { water: 87.8, ca: 5, p: 5, fe: 0.1, k: 30, vc: 0.5 }),

  makeBeverage('Bajigur', // Bajigur (Sundanese warm coconut drink)
    { cal: 70, pro: 0.5, carb: 10, fat: 3, sugar: 8, na: 10, sfa: 2.5 },
    { water: 86, ca: 8, p: 10, k: 45 }),

  makeBeverage('Sekoteng', // Sekoteng (warm ginger drink with toppings)
    { cal: 65, pro: 1, carb: 13, fat: 0.8, sugar: 10, na: 5 },
    { water: 84.8, ca: 10, p: 15, fe: 0.3, k: 35, vc: 0 }),

  makeBeverage('STMJ (Susu Telur Madu Jahe)', // Milk egg honey ginger drink
    { cal: 95, pro: 4, carb: 12, fat: 3.5, sugar: 10, na: 40, sfa: 1.5, chol: 40 },
    { water: 80, ca: 60, p: 55, fe: 0.3, k: 100, b1: 0.03, b2: 0.12 }),

  makeBeverage('Es kelapa muda', // Young coconut ice
    { cal: 25, pro: 0.3, carb: 5, fat: 0.2, sugar: 4.5, na: 5 },
    { water: 94, ca: 15, p: 8, fe: 0.2, k: 149, vc: 1 }),

  makeBeverage('Jamu kunyit asam', // Turmeric tamarind herbal drink
    { cal: 30, pro: 0.2, carb: 7, fat: 0, sugar: 6, na: 5 },
    { water: 92.5, ca: 5, p: 5, fe: 0.3, k: 30, vc: 2 }),

  makeBeverage('Jamu beras kencur', // Rice and kencur herbal drink
    { cal: 35, pro: 0.3, carb: 8.5, fat: 0, sugar: 7, na: 3 },
    { water: 91, ca: 3, p: 5, fe: 0.2, k: 25, vc: 1 }),

  // ─── SOFT DRINKS / SODA ─────────────────────────────────
  makeBeverage('Cola (Coca-Cola)', // Cola
    { cal: 42, pro: 0, carb: 10.6, fat: 0, sugar: 10.6, na: 4 },
    { water: 89.4, ca: 2, p: 10, k: 2 },
    { portionFn: canPortions }),

  makeBeverage('Sprite / Lemon-lime soda', // Lemon-lime soda
    { cal: 41, pro: 0, carb: 10.2, fat: 0, sugar: 10.2, na: 12 },
    { water: 89.8, ca: 2, k: 1 },
    { portionFn: canPortions }),

  makeBeverage('Fanta (rasa jeruk)', // Orange soda
    { cal: 48, pro: 0, carb: 12.3, fat: 0, sugar: 12.3, na: 8 },
    { water: 87.6, ca: 3, k: 2 },
    { portionFn: canPortions }),

  makeBeverage('Soda / air soda (tanpa gula)', // Plain soda water
    { cal: 0, pro: 0, carb: 0, fat: 0, sugar: 0, na: 21 },
    { water: 99.9, ca: 5, k: 2 },
    { portionFn: canPortions }),

  // ─── ENERGY & ISOTONIC ──────────────────────────────────
  makeBeverage('Minuman isotonik (Pocari Sweat)', // Isotonic drink
    { cal: 26, pro: 0, carb: 6.6, fat: 0, sugar: 6.6, na: 49 },
    { water: 93, ca: 2, p: 0, k: 20 },
    { portionFn: canPortions }),

  makeBeverage('Minuman energi (Kratingdaeng)', // Energy drink
    { cal: 45, pro: 0, carb: 11, fat: 0, sugar: 11, na: 40 },
    { water: 88.5, k: 5, b3: 4, b2: 0.1 },
    { portionFn: canPortions }),

  // ─── SMOOTHIES & BLENDED ────────────────────────────────
  makeBeverage('Smoothie pisang', // Banana smoothie
    { cal: 60, pro: 1.5, carb: 12, fat: 1, sugar: 9, na: 15, sfa: 0.5, fiber: 0.5 },
    { water: 85, ca: 20, p: 18, k: 160, b1: 0.02, vc: 3 }),

  makeBeverage('Smoothie stroberi', // Strawberry smoothie
    { cal: 50, pro: 1.2, carb: 10, fat: 0.8, sugar: 8, na: 15, sfa: 0.4 },
    { water: 87.5, ca: 25, p: 20, k: 120, vc: 15 }),

  // ─── WATER ──────────────────────────────────────────────
  makeBeverage('Air putih / air mineral', // Plain water
    { cal: 0, pro: 0, carb: 0, fat: 0, sugar: 0, na: 4 },
    { water: 100, ca: 3, p: 0, k: 0 },
    { food_type: 'Tunggal', source: 'USDA-SR' }),

  makeBeverage('Air infused (lemon)', // Lemon infused water
    { cal: 2, pro: 0, carb: 0.5, fat: 0, sugar: 0.3, na: 1 },
    { water: 99.5, ca: 2, k: 5, vc: 3 }),

];

// ═══════════════════════════════════════════════════════════════
//  INJECT INTO mockFoods.json
// ═══════════════════════════════════════════════════════════════
const updatedFoods = [...foods, ...beverages];

fs.writeFileSync(FOODS_PATH, JSON.stringify(updatedFoods, null, 2), 'utf8');

console.log(`✅ Added ${beverages.length} beverages (IDs ${START_ID}–${nextId - 1})`);
console.log(`   Portion IDs: ${START_PORTION_ID}–${nextPortionId - 1}`);
console.log(`   Total foods now: ${updatedFoods.length}`);
console.log(`\nBeverages added:`);
beverages.forEach(b => console.log(`  [${b.id}] ${b.name}`));

/**
 * Fix portion assignments in mockFoods.json
 * 
 * Problem: All 135 Serealia foods get the same portions including "1 lembar roti" (bread slice)
 * even though only 3 are actually bread. This script assigns portions based on food sub-type.
 */

const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'src', 'data', 'mockFoods.json')
const foods = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

// Portion ID counter — find the max existing ID first
let maxPortionId = 0
for (const food of foods) {
  for (const p of food.portions) {
    if (p.id > maxPortionId) maxPortionId = p.id
  }
}
let nextPortionId = maxPortionId + 1

function makePortion(desc, modifier, gramWeight, amount = 1) {
  return {
    id: nextPortionId++,
    portion_description: desc,
    modifier: modifier,
    gram_weight: gramWeight,
    amount: amount,
  }
}

// ─── Sub-type detection for Serealia ─────────────────────

function isRiceDish(name) {
  const n = name.toLowerCase()
  // Exclude raw beras (handled by isRawGrain)
  return /^nasi\b/.test(n) || /^bubur\b/.test(n) || /^lontong\b/.test(n) || /^ketupat\b/.test(n)
}

function isBread(name) {
  const n = name.toLowerCase()
  return /^roti\b/.test(n) || n.includes('roti tawar')
}

function isNoodle(name) {
  const n = name.toLowerCase()
  return /^mi\b/.test(n) || /^mie\b/.test(n) || /^bihun\b/.test(n) || /^soun\b/.test(n) ||
    /^spaghetti\b/.test(n) || /^makaroni\b/.test(n) || /^kwetiau\b/.test(n) || 
    n.includes('mie ') || n.includes('mi ')
}

function isFlour(name) {
  const n = name.toLowerCase()
  return /^tepung\b/.test(n) || /^maizena\b/.test(n) || /^sagu\b/.test(n) || /^tapioka\b/.test(n)
}

function isRawGrain(name) {
  const n = name.toLowerCase()
  return (/^beras\b/.test(n) || /^jagung\b/.test(n) || /^gandum\b/.test(n) || /^havermut\b/.test(n) || /^oat\b/.test(n)) &&
    !n.includes('nasi') && !n.includes('bubur')
}

// ─── Portion templates ───────────────────────────────────

function getPortionsForRice() {
  return [
    makePortion('1 piring', 'sedang', 200),
    makePortion('½ piring', 'kecil', 100, 0.5),
    makePortion('1 mangkuk', '', 250),
  ]
}

function getPortionsForBread() {
  return [
    makePortion('1 lembar roti', '', 30),
    makePortion('1 potong', '', 40),
  ]
}

function getPortionsForNoodle() {
  return [
    makePortion('1 piring', 'sedang', 200),
    makePortion('½ piring', 'kecil', 100, 0.5),
    makePortion('1 mangkuk', '', 250),
  ]
}

function getPortionsForFlour() {
  return [
    makePortion('1 sdm', '', 10),
  ]
}

function getPortionsForRawGrain() {
  return [
    makePortion('1 sdm', '', 15),
    makePortion('1 mangkuk', '', 150),
  ]
}

// Cakes, snacks, cookies, etc. (default for Serealia)
function getPortionsForCakeSnack() {
  return [
    makePortion('1 potong', '', 50),
    makePortion('1 buah sedang', '', 60),
  ]
}

// ─── Process all foods ───────────────────────────────────

let fixedCount = 0

for (const food of foods) {
  // Only fix Serealia
  if (food.food_category !== 'Serealia') continue

  const name = food.name

  let newPortions

  if (isFlour(name)) {
    newPortions = getPortionsForFlour()
  } else if (isRawGrain(name)) {
    newPortions = getPortionsForRawGrain()
  } else if (isBread(name)) {
    newPortions = getPortionsForBread()
  } else if (isRiceDish(name)) {
    newPortions = getPortionsForRice()
  } else if (isNoodle(name)) {
    newPortions = getPortionsForNoodle()
  } else {
    // Default: cake/snack
    newPortions = getPortionsForCakeSnack()
  }

  // Always add 100g
  newPortions.push(makePortion('100g', '', 100))

  food.portions = newPortions
  fixedCount++
}

// ─── Write back ──────────────────────────────────────────

fs.writeFileSync(filePath, JSON.stringify(foods, null, 2) + '\n', 'utf-8')

console.log(`Fixed portions for ${fixedCount} Serealia foods`)

// Print summary
const summary = {}
for (const food of foods) {
  if (food.food_category !== 'Serealia') continue
  const types = food.portions.map(p => p.portion_description).filter(d => d !== '100g').join(', ')
  if (!summary[types]) summary[types] = []
  summary[types].push(food.name)
}

for (const [portions, names] of Object.entries(summary)) {
  console.log(`\n[${portions}] (${names.length} foods):`)
  console.log(`  ${names.slice(0, 5).join(', ')}${names.length > 5 ? `, ... +${names.length - 5} more` : ''}`)
}

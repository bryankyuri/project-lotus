import type { LucideIcon } from 'lucide-react'
import {
  Apple, Beef, Coffee, Droplets, Egg, Fish, Flame,
  Leaf, Milk, Nut, Sprout, Wheat, Candy,
} from 'lucide-react'

interface CategoryIconEntry {
  icon: LucideIcon
  color: string          // tailwind text color class
  bg: string             // tailwind bg color class
}

/**
 * Map Indonesian TKPI food categories (13 categories) to Lucide icons + colors.
 */
const categoryIconMap: Record<string, CategoryIconEntry> = {
  'Serealia': { icon: Wheat,    color: 'text-amber-600',  bg: 'bg-amber-50'  },
  'Sayur':    { icon: Leaf,     color: 'text-green-600',  bg: 'bg-green-50'  },
  'Buah':     { icon: Apple,    color: 'text-red-500',    bg: 'bg-red-50'    },
  'Daging':   { icon: Beef,     color: 'text-red-700',    bg: 'bg-red-50'    },
  'Ikan dsb': { icon: Fish,     color: 'text-blue-500',   bg: 'bg-blue-50'   },
  'Telur':    { icon: Egg,      color: 'text-amber-500',  bg: 'bg-amber-50'  },
  'Susu':     { icon: Milk,     color: 'text-sky-500',    bg: 'bg-sky-50'    },
  'Kacang':   { icon: Nut,      color: 'text-amber-800',  bg: 'bg-amber-50'  },
  'Umbi':     { icon: Sprout,   color: 'text-orange-600', bg: 'bg-orange-50' },
  'Bumbu':    { icon: Flame,    color: 'text-orange-500', bg: 'bg-orange-50' },
  'Gula':     { icon: Candy,    color: 'text-pink-500',   bg: 'bg-pink-50'   },
  'Lemak':    { icon: Droplets, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  'Minuman':  { icon: Coffee,   color: 'text-stone-600',  bg: 'bg-stone-50'  },
}

const DEFAULT_ENTRY: CategoryIconEntry = {
  icon: Leaf,
  color: 'text-green-500',
  bg: 'bg-green-50',
}

export function getCategoryIcon(category: string): CategoryIconEntry {
  return categoryIconMap[category] ?? DEFAULT_ENTRY
}

export { categoryIconMap }
export type { CategoryIconEntry }

/**
 * Maps a raw portion_description from the database (Indonesian)
 * to its i18n translation key under the "portion" namespace.
 *
 * Example: "1 potong besar" → "portion.1_potong_besar"
 */

const PORTION_KEY_MAP: Record<string, string> = {
  '100g': 'portion.100g',
  '1 piring': 'portion.1_piring',
  '½ piring': 'portion.half_piring',
  '1 mangkuk': 'portion.1_mangkuk',
  '½ mangkuk': 'portion.half_mangkuk',
  '1 lembar roti': 'portion.1_lembar_roti',
  '1 porsi': 'portion.1_porsi',
  '1 porsi tumis': 'portion.1_porsi_tumis',
  '1 potong': 'portion.1_potong',
  '1 potong besar': 'portion.1_potong_besar',
  '1 potong kecil': 'portion.1_potong_kecil',
  '1 potong sedang': 'portion.1_potong_sedang',
  '1 buah besar': 'portion.1_buah_besar',
  '1 buah kecil': 'portion.1_buah_kecil',
  '1 buah sedang': 'portion.1_buah_sedang',
  '½ buah': 'portion.half_buah',
  '1 butir besar': 'portion.1_butir_besar',
  '1 butir kecil': 'portion.1_butir_kecil',
  '1 butir sedang': 'portion.1_butir_sedang',
  '1 ekor kecil': 'portion.1_ekor_kecil',
  '1 ekor sedang': 'portion.1_ekor_sedang',
  '1 bungkus': 'portion.1_bungkus',
  '1 gelas': 'portion.1_gelas',
  '½ gelas': 'portion.half_gelas',
  '1 cangkir': 'portion.1_cangkir',
  '1 sdm': 'portion.1_sdm',
  '1 sdm bubuk': 'portion.1_sdm_bubuk',
  '1 sdt': 'portion.1_sdt',
  '1 kaleng': 'portion.1_kaleng',
  '1 botol kecil': 'portion.1_botol_kecil',
  '1 botol': 'portion.1_botol',
  '1 shot': 'portion.1_shot',
  'custom': 'portion.custom',
}

/**
 * Returns the i18n key for a portion description.
 * Falls back to the raw description if no mapping exists.
 */
export function portionKey(description: string): string {
  return PORTION_KEY_MAP[description] ?? description
}

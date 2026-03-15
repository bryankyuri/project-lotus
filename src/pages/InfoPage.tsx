import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Scale,
  ShieldAlert,
  Database,
  AlertTriangle,
  HeartPulse,
  BookOpen,
} from 'lucide-react'
import { Button } from '../components/ui'
import { variants, stagger } from '../utils/animations'

// ─── Portion guide data ──────────────────────────────────
// key: translation key under "portion.*", weight: typical grams, example foods
const PORTION_DATA = [
  { key: '1_piring', weight: '150–200g', example: 'Rice, fried rice' },
  { key: 'half_piring', weight: '75–100g', example: 'Rice (half)' },
  { key: '1_mangkuk', weight: '200–250g', example: 'Soup, porridge' },
  { key: 'half_mangkuk', weight: '100–125g', example: 'Salad, vegetables' },
  { key: '1_lembar_roti', weight: '25–35g', example: 'Bread' },
  { key: '1_porsi', weight: '100–200g', example: 'General serving' },
  { key: '1_porsi_tumis', weight: '100–150g', example: 'Stir-fried dishes' },
  { key: '1_potong_besar', weight: '100–150g', example: 'Meat, tempeh' },
  { key: '1_potong_sedang', weight: '50–80g', example: 'Tofu, chicken' },
  { key: '1_potong_kecil', weight: '25–40g', example: 'Snacks, cake' },
  { key: '1_potong', weight: '40–100g', example: 'General cut' },
  { key: '1_buah_besar', weight: '150–300g', example: 'Mango, papaya' },
  { key: '1_buah_sedang', weight: '80–150g', example: 'Apple, orange' },
  { key: '1_buah_kecil', weight: '30–80g', example: 'Banana, rambutan' },
  { key: 'half_buah', weight: '40–100g', example: 'Half an avocado' },
  { key: '1_butir_besar', weight: '55–70g', example: 'Egg (large)' },
  { key: '1_butir_sedang', weight: '40–55g', example: 'Egg (medium)' },
  { key: '1_butir_kecil', weight: '30–40g', example: 'Quail egg' },
  { key: '1_ekor_sedang', weight: '100–200g', example: 'Fried fish' },
  { key: '1_ekor_kecil', weight: '50–100g', example: 'Small fish' },
  { key: '1_bungkus', weight: '50–200g', example: 'Packet noodles' },
  { key: '1_gelas', weight: '200–250ml', example: 'Water, milk, juice' },
  { key: 'half_gelas', weight: '100–125ml', example: 'Half glass' },
  { key: '1_cangkir', weight: '150–200ml', example: 'Tea, coffee' },
  { key: '1_sdm', weight: '10–15g', example: 'Oil, sauce, sugar' },
  { key: '1_sdm_bubuk', weight: '5–10g', example: 'Powdered spices' },
  { key: '1_sdt', weight: '3–5g', example: 'Salt, pepper' },
  { key: '100g', weight: '100g', example: 'Standard reference' },
] as const

// ─── Disclaimer sections ─────────────────────────────────
const DISCLAIMER_SECTIONS = [
  { icon: Database, titleKey: 'info.data_approach_title', descKey: 'info.data_approach_desc' },
  { icon: BookOpen, titleKey: 'info.data_source_title', descKey: 'info.data_source_desc' },
  { icon: AlertTriangle, titleKey: 'info.accuracy_title', descKey: 'info.accuracy_desc' },
  { icon: HeartPulse, titleKey: 'info.medical_title', descKey: 'info.medical_desc' },
  { icon: Scale, titleKey: 'info.portion_weights_title', descKey: 'info.portion_weights_desc' },
] as const

export default function InfoPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="px-5 py-6 space-y-8 max-w-2xl mx-auto">
      {/* Back button */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
        >
          {t('info.back')}
        </Button>
      </motion.div>

      {/* Page title */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <h1 className="text-2xl font-bold text-text">{t('info.title')}</h1>
      </motion.div>

      {/* ════════ PORTION GUIDE ════════ */}
      <motion.section
        variants={variants.fadeInUp}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <Scale size={20} className="text-primary-dark" />
          <h2 className="text-lg font-bold text-text">{t('info.portion_guide')}</h2>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {t('info.portion_guide_desc')}
        </p>

        {/* Portion table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_90px_1fr] gap-2 px-4 py-2.5 bg-bg text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            <span>{t('info.portion_name')}</span>
            <span className="text-center">{t('info.portion_weight')}</span>
            <span className="text-right">{t('info.portion_example')}</span>
          </div>

          {/* Table rows */}
          <motion.div variants={stagger(0.02)} initial="initial" animate="animate">
            {PORTION_DATA.map(({ key, weight, example }) => (
              <motion.div
                key={key}
                variants={variants.fadeInUp}
                className="grid grid-cols-[1fr_90px_1fr] gap-2 px-4 py-2.5 border-t border-border text-xs"
              >
                <span className="font-medium text-text">
                  {t(`portion.${key}`)}
                </span>
                <span className="text-center text-text-secondary">{weight}</span>
                <span className="text-right text-text-secondary">{example}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ════════ DISCLAIMER & DATA SOURCE ════════ */}
      <motion.section
        variants={variants.fadeInUp}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert size={20} className="text-primary-dark" />
          <h2 className="text-lg font-bold text-text">{t('info.disclaimer_title')}</h2>
        </div>

        <motion.div
          variants={stagger(0.06)}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          {DISCLAIMER_SECTIONS.map(({ icon: Icon, titleKey, descKey }) => (
            <motion.div
              key={titleKey}
              variants={variants.fadeInUp}
              className="bg-white rounded-2xl shadow-card p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-primary-dark shrink-0" />
                <h3 className="text-sm font-bold text-text">{t(titleKey)}</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed pl-6">
                {t(descKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.div
        variants={variants.fadeInUp}
        initial="initial"
        animate="animate"
        className="text-center pb-6"
      >
        <p className="text-[10px] text-text-secondary">
          NutriPlan v2.0 · {t('food.source')}
        </p>
      </motion.div>
    </div>
  )
}

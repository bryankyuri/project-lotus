import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Save } from 'lucide-react'
import { storage, type NutritionTargets } from '../store/localStorage'
import { Button } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { variants } from '../utils/animations'

export default function EditTargetsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const nav = useNavigate()

  const [targets] = useState(() => storage.getTargets())

  const [formCal, setFormCal] = useState(targets.calories)
  const [formPro, setFormPro] = useState(targets.protein)
  const [formCarb, setFormCarb] = useState(targets.carbs)
  const [formFat, setFormFat] = useState(targets.fat)

  const saveTargets = useCallback(() => {
    const updated: NutritionTargets = {
      calories: formCal,
      protein: formPro,
      carbs: formCarb,
      fat: formFat,
    }
    storage.setTargets(updated)
    toast(t('profile.saved'), 'success')
    nav('/profile')
  }, [formCal, formPro, formCarb, formFat, toast, t, nav])

  const inputCls =
    'mt-1 w-full h-11 px-4 rounded-2xl bg-white border border-border text-[16px] text-right font-semibold focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none'

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Header with back button — same as SettingsPage */}
      <motion.div
        variants={variants.fadeInUp}
        initial="initial"
        animate="animate"
        className="flex items-center gap-3"
      >
        <button
          onClick={() => nav('/profile')}
          className="w-10 h-10 bg-white rounded-xl shadow-card flex items-center justify-center text-text-secondary hover:text-text transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-text">{t('profile.edit_targets')}</h1>
      </motion.div>

      {/* Form card */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
          {[
            { label: t('onboarding.calories_label'), value: formCal, set: setFormCal },
            { label: t('onboarding.protein_label'), value: formPro, set: setFormPro },
            { label: t('onboarding.carbs_label'), value: formCarb, set: setFormCarb },
            { label: t('onboarding.fat_label'), value: formFat, set: setFormFat },
          ].map(({ label, value, set }) => (
            <label key={label} className="block">
              <span className="text-xs font-medium text-text-secondary">{label}</span>
              <input
                type="number"
                value={value}
                onChange={(e) => set(Number(e.target.value))}
                className={inputCls}
              />
            </label>
          ))}

          <div className="pt-2">
            <Button onClick={saveTargets} fullWidth icon={<Save size={16} />}>
              {t('profile.save')}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

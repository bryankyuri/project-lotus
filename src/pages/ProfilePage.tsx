import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { User, Target, Settings, Info, Trash2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { storage } from '../store/localStorage'
import { Button } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { variants } from '../utils/animations'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const nav = useNavigate()

  const [profile, setProfile] = useState(() => storage.getProfile())
  const [targets] = useState(() => storage.getTargets())

  const clearAllData = useCallback(() => {
    if (confirm(t('profile.clear_data_confirm'))) {
      storage.clearAll()
      setProfile(null)
      toast(t('profile.clear_data_success'), 'info')
    }
  }, [toast, t])

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Header */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <h1 className="text-2xl font-bold text-text">{t('profile.title')}</h1>
      </motion.div>

      {/* Profile card */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-primary-soft rounded-2xl flex items-center justify-center">
              <User size={24} className="text-primary-dark" />
            </div>
            <div>
              <h2 className="font-bold text-text text-lg">{profile?.name ?? 'Guest'}</h2>
              <p className="text-xs text-text-secondary">
                {profile ? `${profile.weight}kg · ${profile.height}cm · BMR: ${profile.bmr} kcal` : t('onboarding.subtitle')}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => nav('/profile/edit')} fullWidth>
            {t('profile.edit_profile')}
          </Button>
        </div>
      </motion.div>

      {/* Targets card */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-primary-dark" />
            <h3 className="font-bold text-text">{t('profile.nutrition_targets')}</h3>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: t('today.calories'), value: targets.calories, unit: 'kcal', color: 'text-macro-calories' },
              { label: t('today.protein'), value: targets.protein, unit: 'g', color: 'text-macro-protein' },
              { label: t('today.carbs'), value: targets.carbs, unit: 'g', color: 'text-macro-carbs' },
              { label: t('today.fat'), value: targets.fat, unit: 'g', color: 'text-macro-fat' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="text-center">
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-text-secondary">{label} ({unit})</p>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={() => nav('/profile/targets')} fullWidth>
            {t('profile.edit_targets')}
          </Button>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <button
          onClick={() => nav('/settings')}
          className="w-full bg-white rounded-2xl shadow-card p-5 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 bg-gradient-primary-soft rounded-xl flex items-center justify-center shrink-0">
            <Settings size={18} className="text-primary-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-text text-sm">{t('settings.title')}</h3>
            <p className="text-[11px] text-text-secondary truncate">{t('settings.settings_desc')}</p>
          </div>
          <ChevronRight size={18} className="text-text-secondary shrink-0" />
        </button>
      </motion.div>

      {/* About / Disclaimer */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <button
          onClick={() => nav('/info')}
          className="w-full bg-white rounded-2xl shadow-card p-5 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 bg-gradient-primary-soft rounded-xl flex items-center justify-center shrink-0">
            <Info size={18} className="text-primary-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-text text-sm">{t('profile.about')}</h3>
            <p className="text-[11px] text-text-secondary truncate">{t('profile.data_source_desc')}</p>
          </div>
          <ChevronRight size={18} className="text-text-secondary shrink-0" />
        </button>
      </motion.div>

      {/* Clear data */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={clearAllData} fullWidth>
          {t('profile.clear_data')}
        </Button>
      </motion.div>

    </div>
  )
}

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Save } from 'lucide-react'
import { storage, type UserProfile, type Gender } from '../store/localStorage'
import { calculateAge, calculateBMR } from '../utils/bmr'
import { Button, DatePickerInput } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { variants } from '../utils/animations'

export default function EditProfilePage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const nav = useNavigate()

  const [profile] = useState(() => storage.getProfile())

  const [formName, setFormName] = useState(profile?.name ?? '')
  const [formGender, setFormGender] = useState<Gender>(profile?.gender ?? 'male')
  const [formDob, setFormDob] = useState(profile?.date_of_birth ?? '')
  const [formWeight, setFormWeight] = useState(profile?.weight?.toString() ?? '')
  const [formHeight, setFormHeight] = useState(profile?.height?.toString() ?? '')

  const saveProfile = useCallback(() => {
    const w = Number.parseFloat(formWeight) || 70
    const h = Number.parseFloat(formHeight) || 170
    const age = formDob ? calculateAge(formDob) : 25
    const bmr = calculateBMR(w, h, age, formGender)

    const updated: UserProfile = {
      name: formName || 'User',
      weight: w,
      height: h,
      gender: formGender,
      date_of_birth: formDob || '2000-01-01',
      bmr,
      created_at: profile?.created_at ?? new Date().toISOString(),
    }
    storage.setProfile(updated)
    toast(t('profile.saved'), 'success')
    nav('/profile')
  }, [formName, formGender, formDob, formWeight, formHeight, profile, toast, t, nav])

  const inputCls =
    'mt-1 w-full h-11 px-4 rounded-2xl bg-white border border-border text-[16px] focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none'

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
        <h1 className="text-2xl font-bold text-text">{t('profile.edit_profile')}</h1>
      </motion.div>

      {/* Form card */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-text-secondary">{t('onboarding.name_label')}</span>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className={inputCls}
            />
          </label>

          <div>
            <span className="text-xs font-medium text-text-secondary">{t('onboarding.gender_label')}</span>
            <div className="flex gap-3 mt-1">
              {(['male', 'female'] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setFormGender(g)}
                  className={`flex-1 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                    formGender === g ? 'bg-gradient-primary text-white shadow-sm' : 'bg-gray-100 text-text-secondary'
                  }`}
                >
                  {t(`onboarding.${g}`)}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-text-secondary">{t('onboarding.dob_label')}</span>
            <DatePickerInput
              value={formDob}
              onChange={setFormDob}
              placeholder={t('onboarding.dob_label')}
              dropDirection="down"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">{t('onboarding.weight_label')}</span>
              <input
                type="number"
                value={formWeight}
                onChange={(e) => setFormWeight(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">{t('onboarding.height_label')}</span>
              <input
                type="number"
                value={formHeight}
                onChange={(e) => setFormHeight(e.target.value)}
                className={inputCls}
              />
            </label>
          </div>

          <div className="pt-2">
            <Button onClick={saveProfile} fullWidth icon={<Save size={16} />}>
              {t('profile.save')}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

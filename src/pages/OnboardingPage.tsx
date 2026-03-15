import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Salad,
  Target,
  BarChart3,
  Search,
  CalendarDays,
  Sparkles,
  Settings,
  CheckCircle2,
  Globe,
} from 'lucide-react'
import { Button, ThemeSwitch, DatePickerInput } from '../components/ui'
import { storage, type UserProfile, type Gender } from '../store/localStorage'
import { calculateAge, calculateBMR, suggestTargetsFromBMR } from '../utils/bmr'

// ─── Phase & step types ──────────────────────────────────
type Phase = 'language' | 'intro' | 'transition-setup' | 'wizard' | 'completion'
type IntroStep = 0 | 1 | 2
type WizardStep = 'profile' | 'targets'
const WIZARD_STEPS: WizardStep[] = ['profile', 'targets']

// ─── Available languages ─────────────────────────────────
const LANGUAGES = [
  { code: 'en', flag: '/flags/us.svg', native: 'English' },
  { code: 'id', flag: '/flags/id.svg', native: 'Indonesia' },
  { code: 'zh', flag: '/flags/cn.svg', native: '中文' },
  { code: 'ar', flag: '/flags/sa.svg', native: 'العربية' },
  { code: 'ja', flag: '/flags/jp.svg', native: '日本語' },
  { code: 'ko', flag: '/flags/kr.svg', native: '한국어' },
  { code: 'ru', flag: '/flags/ru.svg', native: 'Русский' },
  { code: 'fr', flag: '/flags/fr.svg', native: 'Français' },
  { code: 'de', flag: '/flags/de.svg', native: 'Deutsch' },
  { code: 'es', flag: '/flags/es.svg', native: 'Español' },
  { code: 'nl', flag: '/flags/nl.svg', native: 'Nederlands' },
  { code: 'hi', flag: '/flags/in.svg', native: 'हिन्दी' },
] as const

export { LANGUAGES }

// ─── Slide animation variants ────────────────────────────
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.96,
  }),
}

// ─── Splash transition variants ──────────────────────────
const splashVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
}

// ─── Validation errors type ──────────────────────────────
interface ValidationErrors {
  name?: string
  dob?: string
  weight?: string
  height?: string
  calories?: string
  protein?: string
  carbs?: string
  fat?: string
}

export default function OnboardingPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  // ─── Phase state ─────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('language')
  const [introStep, setIntroStep] = useState<IntroStep>(0)
  const [wizardStep, setWizardStep] = useState<WizardStep>('profile')
  const [direction, setDirection] = useState(1)

  // Track which fields were touched for validation
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Profile state
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [dob, setDob] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')

  // Targets state
  const [calories, setCalories] = useState(2000)
  const [protein, setProtein] = useState(150)
  const [carbs, setCarbs] = useState(200)
  const [fat, setFat] = useState(60)

  const wizardIndex = WIZARD_STEPS.indexOf(wizardStep)

  // ─── Validation logic ──────────────────────────────────
  const errors = useMemo((): ValidationErrors => {
    const e: ValidationErrors = {}

    if (!name.trim()) e.name = t('onboarding.validation.name_required')
    if (!dob) e.dob = t('onboarding.validation.dob_required')
    else {
      const dobDate = new Date(dob)
      const now = new Date()
      if (dobDate >= now) e.dob = t('onboarding.validation.dob_future')
    }

    const w = Number.parseFloat(weight)
    if (!weight) e.weight = t('onboarding.validation.weight_required')
    else if (Number.isNaN(w) || w < 20 || w > 300) e.weight = t('onboarding.validation.weight_range')

    const h = Number.parseFloat(height)
    if (!height) e.height = t('onboarding.validation.height_required')
    else if (Number.isNaN(h) || h < 80 || h > 250) e.height = t('onboarding.validation.height_range')

    if (calories < 500 || calories > 10000) e.calories = t('onboarding.validation.calories_range')
    if (protein < 10 || protein > 500) e.protein = t('onboarding.validation.protein_range')
    if (carbs < 10 || carbs > 1000) e.carbs = t('onboarding.validation.carbs_range')
    if (fat < 5 || fat > 500) e.fat = t('onboarding.validation.fat_range')

    return e
  }, [name, dob, weight, height, calories, protein, carbs, fat, t])

  const profileValid = !errors.name && !errors.dob && !errors.weight && !errors.height
  const targetsValid = !errors.calories && !errors.protein && !errors.carbs && !errors.fat

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  // ─── Intro navigation ─────────────────────────────────
  const introNext = useCallback(() => {
    if (introStep < 2) {
      setDirection(1)
      setIntroStep((s) => (s + 1) as IntroStep)
    } else {
      setPhase('transition-setup')
    }
  }, [introStep])

  const introBack = useCallback(() => {
    if (introStep > 0) {
      setDirection(-1)
      setIntroStep((s) => (s - 1) as IntroStep)
    } else {
      setDirection(-1)
      setPhase('language')
    }
  }, [introStep])

  const skipIntro = useCallback(() => {
    setPhase('transition-setup')
  }, [])

  // ─── Transition → wizard ───────────────────────────────
  const startWizard = useCallback(() => {
    setDirection(1)
    setPhase('wizard')
  }, [])

  // ─── Wizard navigation ────────────────────────────────
  const wizardNext = useCallback(() => {
    if (wizardStep === 'profile') {
      if (!profileValid) {
        setTouched({ name: true, dob: true, weight: true, height: true })
        return
      }
      const age = dob ? calculateAge(dob) : 25
      const w = Number.parseFloat(weight) || 70
      const h = Number.parseFloat(height) || 170
      const bmr = calculateBMR(w, h, age, gender)
      const suggested = suggestTargetsFromBMR(bmr)
      setCalories(suggested.calories)
      setProtein(suggested.protein)
      setCarbs(suggested.carbs)
      setFat(suggested.fat)
      setDirection(1)
      setWizardStep('targets')
    } else if (wizardStep === 'targets') {
      if (!targetsValid) {
        setTouched((p) => ({ ...p, calories: true, protein: true, carbs: true, fat: true }))
        return
      }
      const w = Number.parseFloat(weight) || 70
      const h = Number.parseFloat(height) || 170
      const age = dob ? calculateAge(dob) : 25
      const bmr = calculateBMR(w, h, age, gender)

      const profile: UserProfile = {
        name: name.trim() || 'User',
        weight: w,
        height: h,
        gender,
        date_of_birth: dob || '2000-01-01',
        bmr,
        created_at: new Date().toISOString(),
      }

      storage.setProfile(profile)
      storage.setTargets({ calories, protein, carbs, fat })
      storage.setOnboardingDone()
      setPhase('completion')
    }
  }, [wizardStep, profileValid, targetsValid, dob, weight, height, gender, name, calories, protein, carbs, fat])

  const wizardBack = useCallback(() => {
    if (wizardStep === 'targets') {
      setDirection(-1)
      setWizardStep('profile')
    }
  }, [wizardStep])

  // ─── Completion auto-redirect ──────────────────────────
  useEffect(() => {
    if (phase !== 'completion') return
    const timer = setTimeout(() => {
      navigate('/', { replace: true })
    }, 2500)
    return () => clearTimeout(timer)
  }, [phase, navigate])

  // ─── Intro slide data ──────────────────────────────────
  const introSlides = [
    {
      icon: BarChart3,
      gradient: 'from-primary/20 to-emerald-200/40',
      iconBg: 'bg-gradient-primary-soft',
      iconColor: 'text-primary-dark',
    },
    {
      icon: Search,
      gradient: 'from-primary/10 to-emerald-100/50',
      iconBg: 'bg-gradient-primary-soft',
      iconColor: 'text-primary-dark',
    },
    {
      icon: CalendarDays,
      gradient: 'from-emerald-100/50 to-primary/20',
      iconBg: 'bg-gradient-primary-soft',
      iconColor: 'text-primary-dark',
    },
  ]

  // Helper for field error display
  const fieldError = (field: string) =>
    touched[field] && errors[field as keyof ValidationErrors]
      ? errors[field as keyof ValidationErrors]
      : null

  const inputClass = (field: string) => {
    const hasError = touched[field] && errors[field as keyof ValidationErrors]
    return `mt-1 w-full h-11 px-4 rounded-2xl bg-white border text-[16px] outline-none transition-colors ${
      hasError
        ? 'border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-400'
        : 'border-border focus:ring-2 focus:ring-primary/30 focus:border-primary'
    }`
  }

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5 py-10">
      <AnimatePresence mode="wait" custom={direction}>
        {/* ═══════════ PHASE: LANGUAGE ═══════════ */}
        {phase === 'language' && (
          <motion.div
            key="language-phase"
            variants={splashVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            {/* Globe icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-gradient-primary-soft rounded-2xl flex items-center justify-center mb-6"
            >
              <Globe size={32} className="text-primary-dark" />
            </motion.div>

            <motion.h1
              className="text-2xl font-bold text-text mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {t('onboarding.language_title')}
            </motion.h1>
            <motion.p
              className="text-sm text-text-secondary mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {t('onboarding.language_desc')}
            </motion.p>

            {/* Language grid */}
            <motion.div
              className="w-full grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto px-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {LANGUAGES.map((lang) => {
                const active =
                  i18n.language === lang.code ||
                  i18n.language?.startsWith(`${lang.code}-`)
                return (
                  <motion.button
                    key={lang.code}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      i18n.changeLanguage(lang.code)
                      localStorage.setItem('mp_language', lang.code)
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                      active
                        ? 'bg-gradient-primary text-white shadow-sm ring-2 ring-primary/30'
                        : 'bg-white border border-border text-text hover:border-primary/50'
                    }`}
                  >
                    <img src={lang.flag} alt={lang.native} className="w-7 h-5 rounded-sm object-cover" />
                    <span className="text-sm font-medium truncate">{lang.native}</span>
                  </motion.button>
                )
              })}
            </motion.div>

            {/* Theme toggle */}
            <motion.div
              className="w-full mt-5 flex items-center justify-between px-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-sm font-medium text-text-secondary">{t('settings.theme')}</span>
              <ThemeSwitch />
            </motion.div>

            {/* Continue button */}
            <motion.div
              className="w-full mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={() => {
                  setDirection(1)
                  setPhase('intro')
                }}
                fullWidth
                icon={<ChevronRight size={16} />}
              >
                {t('onboarding.continue')}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════════ PHASE: INTRO ═══════════════ */}
        {phase === 'intro' && (
          <motion.div
            key="intro-phase"
            variants={splashVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            {/* Intro progress dots */}
            <div className="flex gap-2 mb-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={`intro-dot-${i}`}
                  className="h-1.5 rounded-full"
                  animate={{
                    width: i <= introStep ? 32 : 16,
                    backgroundColor: i <= introStep ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`intro-${introStep}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="w-full"
              >
                {(() => {
                  const slide = introSlides[introStep]
                  const SlideIcon = slide.icon
                  return (
                    <div className="text-center space-y-6">
                      <div className={`mx-auto w-full max-w-xs aspect-square rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute w-32 h-32 rounded-full bg-white/20 -top-6 -right-6" />
                        <div className="absolute w-20 h-20 rounded-full bg-white/15 bottom-4 -left-4" />
                        <motion.div
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
                          className={`w-24 h-24 rounded-3xl ${slide.iconBg} flex items-center justify-center shadow-lg`}
                        >
                          <SlideIcon size={48} className={slide.iconColor} strokeWidth={1.5} />
                        </motion.div>
                      </div>

                      <div className="space-y-2 px-2">
                        <motion.h1
                          className="text-2xl font-bold text-text"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {t(`onboarding.intro${introStep + 1}_title`)}
                        </motion.h1>
                        <motion.p
                          className="text-sm text-text-secondary leading-relaxed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {t(`onboarding.intro${introStep + 1}_desc`)}
                        </motion.p>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            </AnimatePresence>

            {/* Intro nav buttons */}
            <div className="flex gap-3 mt-8 w-full">
              <Button variant="secondary" onClick={introBack} icon={<ChevronLeft size={16} />}>
                {introStep === 0 ? t('onboarding.change_language') : t('onboarding.back')}
              </Button>
              <Button
                onClick={introNext}
                className="flex-1"
                icon={<ChevronRight size={16} />}
              >
                {t('onboarding.next')}
              </Button>
            </div>

            {/* Skip link */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={skipIntro}
              className="mt-4 text-sm text-text-secondary hover:text-text transition-colors"
            >
              {t('onboarding.skip')}
            </motion.button>
          </motion.div>
        )}

        {/* ═══════ PHASE: TRANSITION TO SETUP ═══════ */}
        {phase === 'transition-setup' && (
          <motion.div
            key="transition-setup"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -10 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="w-full max-w-sm text-center space-y-6 relative"
          >
            {/* Animated icon */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
                className="w-20 h-20 bg-gradient-primary-soft rounded-3xl flex items-center justify-center"
              >
                <Settings size={40} className="text-primary-dark" />
              </motion.div>
            </div>

            {/* Floating sparkles */}
            {[
              { x: -50, y: -30, delay: 0.3, size: 16 },
              { x: 55, y: -20, delay: 0.45, size: 14 },
              { x: 40, y: 35, delay: 0.6, size: 12 },
            ].map((spark) => (
              <motion.div
                key={`spark-${spark.x}-${spark.y}`}
                className="absolute left-1/2 top-12 pointer-events-none"
                initial={{ opacity: 0, scale: 0, x: spark.x, y: spark.y }}
                animate={{ opacity: [0, 1, 0.6], scale: [0, 1.2, 1], x: spark.x, y: spark.y }}
                transition={{ duration: 0.8, delay: spark.delay, ease: 'easeOut' }}
              >
                <Sparkles size={spark.size} className="text-primary-dark/50" />
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <h1 className="text-2xl font-bold text-text">
                {t('onboarding.setup_transition_title')}
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed px-4">
                {t('onboarding.setup_transition_desc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button onClick={startWizard} fullWidth icon={<ChevronRight size={16} />}>
                {t('onboarding.lets_go')}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════ PHASE: WIZARD ═══════════ */}
        {phase === 'wizard' && (
          <motion.div
            key="wizard-phase"
            variants={splashVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            {/* Wizard progress dots */}
            <div className="flex gap-2 mb-8">
              {WIZARD_STEPS.map((s, i) => (
                <motion.div
                  key={`wiz-dot-${s}`}
                  className="h-1.5 rounded-full"
                  animate={{
                    width: i <= wizardIndex ? 32 : 16,
                    backgroundColor: i <= wizardIndex ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={wizardStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="w-full"
              >
                {/* ── Wizard: Profile ── */}
                {wizardStep === 'profile' && (
                  <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-14 h-14 bg-gradient-primary-soft rounded-2xl flex items-center justify-center"
                      >
                        <Salad size={28} className="text-primary-dark" />
                      </motion.div>
                    </div>
                    <div className="text-center mb-4">
                      <h1 className="text-xl font-bold text-text">{t('onboarding.step_profile')}</h1>
                      <p className="text-sm text-text-secondary mt-1">{t('onboarding.subtitle')}</p>
                    </div>

                    {/* Name */}
                    <label className="block">
                      <span className="text-xs font-medium text-text-secondary">{t('onboarding.name_label')}</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => markTouched('name')}
                        placeholder={t('onboarding.name_placeholder')}
                        className={inputClass('name')}
                      />
                      {fieldError('name') && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {fieldError('name')}
                        </motion.p>
                      )}
                    </label>

                    {/* Gender */}
                    <div>
                      <span className="text-xs font-medium text-text-secondary">{t('onboarding.gender_label')}</span>
                      <div className="flex gap-3 mt-1">
                        {(['male', 'female'] as Gender[]).map((g) => (
                          <button
                            key={g}
                            onClick={() => setGender(g)}
                            className={`flex-1 h-11 rounded-2xl text-sm font-medium transition-all duration-200 ${
                              gender === g
                                ? 'bg-gradient-primary text-white shadow-sm'
                                : 'bg-white border border-border text-text-secondary'
                            }`}
                          >
                            {t(`onboarding.${g}`)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DOB */}
                    <label className="block">
                      <span className="text-xs font-medium text-text-secondary">{t('onboarding.dob_label')}</span>
                      <DatePickerInput
                        value={dob}
                        onChange={setDob}
                        onBlur={() => markTouched('dob')}
                        error={!!(touched.dob && errors.dob)}
                        placeholder={t('onboarding.dob_label')}
                      />
                      {fieldError('dob') && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {fieldError('dob')}
                        </motion.p>
                      )}
                    </label>

                    {/* Weight & Height */}
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs font-medium text-text-secondary">{t('onboarding.weight_label')}</span>
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          onBlur={() => markTouched('weight')}
                          placeholder="70"
                          className={inputClass('weight')}
                        />
                        {fieldError('weight') && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-500 mt-1"
                          >
                            {fieldError('weight')}
                          </motion.p>
                        )}
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-text-secondary">{t('onboarding.height_label')}</span>
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          onBlur={() => markTouched('height')}
                          placeholder="170"
                          className={inputClass('height')}
                        />
                        {fieldError('height') && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-500 mt-1"
                          >
                            {fieldError('height')}
                          </motion.p>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {/* ── Wizard: Targets ── */}
                {wizardStep === 'targets' && (
                  <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-14 h-14 bg-gradient-primary-soft rounded-2xl flex items-center justify-center"
                      >
                        <Target size={28} className="text-primary-dark" />
                      </motion.div>
                    </div>
                    <div className="text-center mb-4">
                      <h1 className="text-xl font-bold text-text">{t('onboarding.step_targets')}</h1>
                      <p className="text-sm text-text-secondary mt-1">{t('onboarding.customize_hint')}</p>
                    </div>

                    {[
                      { label: t('onboarding.calories_label'), value: calories, set: setCalories, field: 'calories', color: 'bg-macro-calories/10 text-macro-calories' },
                      { label: t('onboarding.protein_label'), value: protein, set: setProtein, field: 'protein', color: 'bg-macro-protein/10 text-macro-protein' },
                      { label: t('onboarding.carbs_label'), value: carbs, set: setCarbs, field: 'carbs', color: 'bg-macro-carbs/10 text-macro-carbs' },
                      { label: t('onboarding.fat_label'), value: fat, set: setFat, field: 'fat', color: 'bg-macro-fat/10 text-macro-fat' },
                    ].map(({ label, value, set, field, color }) => (
                      <div key={field}>
                        <div className={`flex items-center gap-3 p-3 rounded-2xl ${color.split(' ')[0]}`}>
                          <span className={`text-sm font-medium flex-1 ${color.split(' ')[1]}`}>{label}</span>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => set(Number(e.target.value))}
                            onBlur={() => markTouched(field)}
                            className={`w-20 h-9 px-3 rounded-xl bg-white border text-[16px] text-right font-semibold outline-none transition-colors ${
                              touched[field] && errors[field as keyof ValidationErrors]
                                ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                                : 'border-border focus:ring-2 focus:ring-primary/30 focus:border-primary'
                            }`}
                          />
                        </div>
                        {touched[field] && errors[field as keyof ValidationErrors] && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-500 mt-1 ml-3"
                          >
                            {errors[field as keyof ValidationErrors]}
                          </motion.p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Wizard nav buttons */}
            <div className="flex gap-3 mt-8 w-full">
              {wizardStep !== 'profile' && (
                <Button variant="secondary" onClick={wizardBack} icon={<ChevronLeft size={16} />}>
                  {t('onboarding.back')}
                </Button>
              )}
              <Button
                onClick={wizardNext}
                fullWidth={wizardStep === 'profile'}
                className={wizardStep !== 'profile' ? 'flex-1' : ''}
                icon={wizardStep === 'targets' ? undefined : <ChevronRight size={16} />}
              >
                {wizardStep === 'targets' ? t('onboarding.finish') : t('onboarding.next')}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ═══════ PHASE: COMPLETION ═══════ */}
        {phase === 'completion' && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="w-full max-w-sm text-center space-y-6"
          >
            {/* Animated check icon */}
            <div className="flex justify-center relative">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.1 }}
                className="w-24 h-24 bg-gradient-primary-soft rounded-full flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 15, delay: 0.3 }}
                >
                  <CheckCircle2 size={52} className="text-primary-dark" strokeWidth={1.5} />
                </motion.div>
              </motion.div>

              {/* Burst rings */}
              {[0, 1, 2].map((ring) => (
                <motion.div
                  key={`comp-ring-${ring}`}
                  className="absolute inset-0 m-auto rounded-full border-2 border-primary/20"
                  style={{ width: 96, height: 96 }}
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 1.6 + ring * 0.3, opacity: 0 }}
                  transition={{
                    duration: 1.2,
                    delay: 0.4 + ring * 0.15,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2"
            >
              <h1 className="text-2xl font-bold text-text">
                {t('onboarding.completion_title')}
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed px-4">
                {t('onboarding.completion_desc')}
              </p>
            </motion.div>

            {/* Summary card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white rounded-2xl shadow-card p-5 grid grid-cols-2 gap-4 text-left"
            >
              <div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wide">Calories</p>
                <p className="text-lg font-bold text-macro-calories">{calories}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wide">Protein</p>
                <p className="text-lg font-bold text-macro-protein">{protein}g</p>
              </div>
              <div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wide">Carbs</p>
                <p className="text-lg font-bold text-macro-carbs">{carbs}g</p>
              </div>
              <div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wide">Fat</p>
                <p className="text-lg font-bold text-macro-fat">{fat}g</p>
              </div>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mx-auto w-32 h-1 rounded-full bg-border overflow-hidden"
            >
              <motion.div
                className="h-full bg-gradient-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, delay: 0.8, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

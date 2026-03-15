import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Globe, Palette } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { ThemeSwitch } from '../components/ui'
import { storage } from '../store/localStorage'
import { LANGUAGES } from './OnboardingPage'
import { variants } from '../utils/animations'
import i18n from '../i18n'

export default function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { theme } = useTheme()

  const currentLang = i18n.language

  const switchLanguage = useCallback((lang: string) => {
    storage.setLanguage(lang)
    i18n.changeLanguage(lang)
  }, [])

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Header with back button */}
      <motion.div
        variants={variants.fadeInUp}
        initial="initial"
        animate="animate"
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-xl shadow-card flex items-center justify-center text-text-secondary hover:text-text transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-text">{t('settings.title')}</h1>
      </motion.div>

      {/* ── Theme Section ── */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary-soft rounded-xl flex items-center justify-center">
                <Palette size={18} className="text-primary-dark" />
              </div>
              <div>
                <h3 className="font-bold text-text text-sm">{t('settings.theme')}</h3>
                <p className="text-[11px] text-text-secondary">
                  {theme === 'dark' ? t('settings.dark') : t('settings.light')}
                </p>
              </div>
            </div>
            <ThemeSwitch />
          </div>
        </div>
      </motion.div>

      {/* ── Language Section ── */}
      <motion.div variants={variants.fadeInUp} initial="initial" animate="animate">
        <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-primary-dark" />
            <h3 className="font-bold text-text">{t('settings.language')}</h3>
          </div>
          <p className="text-xs text-text-secondary">{t('settings.language_desc')}</p>

          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((lang) => {
              const active =
                currentLang === lang.code ||
                currentLang?.startsWith(`${lang.code}-`)
              return (
                <motion.button
                  key={lang.code}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => switchLanguage(lang.code)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                    active
                      ? 'bg-gradient-primary text-white shadow-sm ring-2 ring-primary/30'
                      : 'bg-white border border-border text-text hover:border-primary/50'
                  }`}
                >
                  <img
                    src={lang.flag}
                    alt={lang.native}
                    className="w-7 h-5 rounded-sm object-cover"
                  />
                  <span className="text-sm font-medium truncate">{lang.native}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck, Compass, LayoutDashboard, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const NAV_ITEMS = [
  { key: 'today', path: '/', icon: LayoutDashboard, labelKey: 'nav.today' },
  { key: 'explore', path: '/explore', icon: Compass, labelKey: 'nav.explore' },
  { key: 'plan', path: '/plan', icon: CalendarCheck, labelKey: 'nav.plan' },
  { key: 'profile', path: '/profile', icon: User, labelKey: 'nav.profile' },
] as const

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  useTranslation() // keep i18n context active for locale reactivity

  const activeIndex = NAV_ITEMS.findIndex((item) => {
    if (item.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.path)
  })

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-32px)] max-w-md">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-nav py-2 flex items-center relative">
        {/* Sliding indicator */}
        {activeIndex >= 0 && (
          <motion.div
            className="absolute top-2 bottom-2 bg-gradient-primary rounded-xl"
            layoutId="nav-indicator"
            style={{ width: `calc(${100 / NAV_ITEMS.length}% - 8px)` }}
            animate={{
              left: `calc(${(activeIndex * 100) / NAV_ITEMS.length}% + 4px)`,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}

        {NAV_ITEMS.map((item, idx) => {
          const isActive = idx === activeIndex
          const Icon = item.icon

          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`
                relative z-10 flex-1 flex items-center justify-center
                h-10 rounded-xl transition-colors
                ${isActive ? 'text-white' : 'text-text-secondary'}
              `}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export { NAV_ITEMS }

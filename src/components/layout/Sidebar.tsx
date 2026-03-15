import { useLocation, useNavigate } from 'react-router-dom'
import { CalendarCheck, Compass, LayoutDashboard, User, Salad } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const NAV_ITEMS = [
  { key: 'today', path: '/', icon: LayoutDashboard, labelKey: 'nav.today' },
  { key: 'explore', path: '/explore', icon: Compass, labelKey: 'nav.explore' },
  { key: 'plan', path: '/plan', icon: CalendarCheck, labelKey: 'nav.plan' },
  { key: 'profile', path: '/profile', icon: User, labelKey: 'nav.profile' },
] as const

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const activeIndex = NAV_ITEMS.findIndex((item) => {
    if (item.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.path)
  })

  return (
    <aside className="w-64 h-screen bg-white border-r border-border flex flex-col p-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 mb-4">
        <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm">
          <Salad size={20} className="text-white" />
        </div>
        <span className="text-lg font-bold text-text">NutriPlan</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = idx === activeIndex
          const Icon = item.icon

          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-primary text-white shadow-sm'
                    : 'text-text-secondary hover:bg-primary-light hover:text-primary-dark'
                }
              `}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {t(item.labelKey)}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 text-[10px] text-text-secondary">
        NutriPlan v2.0 ·{' '}
        <button onClick={() => navigate('/info')} className="underline hover:text-primary-dark transition-colors">
          TKPI Data
        </button>
      </div>
    </aside>
  )
}

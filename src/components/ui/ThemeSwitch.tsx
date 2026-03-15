import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

/**
 * Pill-shaped theme toggle switch with Sun/Moon icons.
 * Inspired by a neumorphic light/dark toggle.
 */
export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className={`
        relative flex items-center w-18 h-9 rounded-full p-1 cursor-pointer
        transition-colors duration-300 ease-in-out
        ${isDark
          ? 'bg-[#1A2B1F] border border-[#2E4A37]'
          : 'bg-white border border-border shadow-card'
        }
      `}
    >
      {/* Sliding knob */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`
          w-7 h-7 rounded-full flex items-center justify-center shadow-md
          ${isDark
            ? 'bg-linear-to-br from-[#6EE7A0] to-[#22C55E]'
            : 'bg-linear-to-br from-primary-from to-primary-to'
          }
        `}
        style={{ marginLeft: isDark ? 'auto' : '0' }}
      >
        {isDark ? (
          <Moon size={14} className="text-white" strokeWidth={2.5} />
        ) : (
          <Sun size={14} className="text-white" strokeWidth={2.5} />
        )}
      </motion.div>

      {/* Background label icons (dim, behind the knob) */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
        <Sun
          size={13}
          className={`transition-opacity duration-200 ${
            isDark ? 'opacity-30 text-text-secondary' : 'opacity-0'
          }`}
        />
        <Moon
          size={13}
          className={`transition-opacity duration-200 ${
            isDark ? 'opacity-0' : 'opacity-30 text-text-secondary'
          }`}
        />
      </div>
    </button>
  )
}

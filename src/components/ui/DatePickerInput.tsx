import { useState, useRef, useEffect, useCallback } from 'react'
import { DayPicker, type ChevronProps } from 'react-day-picker'
import { format, parse, isValid, type Locale } from 'date-fns'
import {
  enUS, id as idLocale, zhCN, ar, ja, ko, ru, fr, de, es, nl, hi,
} from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import 'react-day-picker/style.css'

/* ─── locale map ──────────────────────────────────── */
const LOCALE_MAP: Record<string, Locale> = {
  en: enUS, id: idLocale, zh: zhCN, ar, ja, ko, ru, fr, de, es, nl, hi,
}

/* ─── nav chevron (defined outside to avoid lint warning) ── */
function NavChevron({ orientation }: Readonly<ChevronProps>) {
  return orientation === 'left'
    ? <ChevronLeft className="w-4 h-4" />
    : <ChevronRight className="w-4 h-4" />
}

/* ─── props ───────────────────────────────────────── */
interface DatePickerInputProps {
  /** ISO date string (YYYY-MM-DD) */
  value: string
  onChange: (iso: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: boolean
  className?: string
  /** 'up' opens above field (default), 'down' opens below */
  dropDirection?: 'up' | 'down'
}

/* ─── component ───────────────────────────────────── */
export function DatePickerInput({
  value,
  onChange,
  onBlur,
  placeholder,
  error = false,
  className = '',
  dropDirection = 'up',
}: Readonly<DatePickerInputProps>) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const locale = LOCALE_MAP[i18n.language] ?? enUS

  /* parse value → Date */
  const parsed = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined

  /* display text */
  const displayText = selected
    ? format(selected, 'dd MMM yyyy', { locale })
    : ''

  /* format month dropdown labels as 3-char abbreviations */
  const formatMonthDropdown = useCallback(
    (month: Date) => format(month, 'MMM', { locale }),
    [locale],
  )

  /* close on outside click */
  useEffect(() => {
    if (!open) return
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        onBlur?.()
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [open, onBlur])

  /* close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); onBlur?.() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onBlur])

  const handleSelect = useCallback(
    (day: Date | undefined) => {
      if (day) onChange(format(day, 'yyyy-MM-dd'))
      setOpen(false)
      onBlur?.()
    },
    [onChange, onBlur],
  )

  /* ─── ring classes ───────────────────────────────── */
  const ringClass = error
    ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-400'
    : 'border-border focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`mt-1 flex items-center w-full h-11 px-4 rounded-2xl bg-white border text-[16px] outline-none transition-colors cursor-pointer ${ringClass}`}
      >
        <CalendarDays className="w-4 h-4 text-text-secondary shrink-0" />
        <span
          className={`ml-2 flex-1 text-left truncate ${
            displayText ? 'text-text' : 'text-text-secondary/50'
          }`}
        >
          {displayText || placeholder || 'Select date'}
        </span>
      </button>

      {/* calendar dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: dropDirection === 'up' ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropDirection === 'up' ? 6 : -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className={`absolute z-50 left-0 right-0 flex justify-center ${
              dropDirection === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'
            }`}
          >
            <div className="rdp-wrapper rounded-2xl bg-white border border-border shadow-card overflow-hidden">
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={handleSelect}
                locale={locale}
                captionLayout="dropdown"
                defaultMonth={selected ?? new Date()}
                startMonth={new Date(1930, 0)}
                endMonth={new Date()}
                formatters={{ formatMonthDropdown }}
                components={{ Chevron: NavChevron }}
                classNames={{
                  root: 'rdp-nutri',
                  months: 'rdp-months',
                  month_caption: 'rdp-caption',
                  nav: 'rdp-nav',
                  button_previous: 'rdp-nav-btn',
                  button_next: 'rdp-nav-btn',
                  weekday: 'rdp-weekday',
                  day: 'rdp-day',
                  day_button: 'rdp-day-btn',
                  selected: 'rdp-selected',
                  today: 'rdp-today',
                  outside: 'rdp-outside',
                  dropdowns: 'rdp-dropdowns',
                  dropdown_root: 'rdp-dropdown-root',
                  dropdown: 'rdp-dropdown',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

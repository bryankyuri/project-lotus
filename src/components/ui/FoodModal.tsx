import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { transitions } from '../../utils/animations'

interface FoodModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly title?: string
  readonly children: ReactNode
}

export function FoodModal({ open, onClose, title, children }: FoodModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Render into document.body via portal so parent CSS (space-y-6, etc.) cannot affect it
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.quick}
            onClick={onClose}
          />

          {/* ── Mobile: bottom sheet (hidden on md+) ── */}
          <motion.div
            className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-sheet flex flex-col"
            style={{ minHeight: '70vh', maxHeight: '90vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={transitions.spring}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 pb-3 shrink-0">
                <h2 className="text-lg font-bold text-text">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={18} className="text-text-secondary" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 px-5 min-h-0 flex flex-col">
              {children}
            </div>
          </motion.div>

          {/* ── Desktop: centered dialog (visible on md+) ── */}
          <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-6 pointer-events-none">
            <motion.div
              className="pointer-events-auto bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col"
              style={{ maxHeight: '80vh', minHeight: '520px' }}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={transitions.spring}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                  <h2 className="text-lg font-bold text-text">{title}</h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={18} className="text-text-secondary" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 px-6 py-4 min-h-0 flex flex-col">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

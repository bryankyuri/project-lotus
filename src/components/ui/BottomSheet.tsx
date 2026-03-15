import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { variants, transitions } from '../../utils/animations'

interface BottomSheetProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly title?: string
  readonly children: ReactNode
  /** Max height as viewport percentage. Default 85 */
  readonly maxHeight?: number
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  maxHeight = 85,
}: BottomSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
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

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-sheet"
            style={{ maxHeight: `${maxHeight}vh` }}
            variants={variants.slideFromBottom}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitions.spring}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose()
              }
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 pb-3">
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
            <div
              className="px-5 pb-safe-bottom overflow-y-auto no-scrollbar"
              style={{ maxHeight: `calc(${maxHeight}vh - 80px)` }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

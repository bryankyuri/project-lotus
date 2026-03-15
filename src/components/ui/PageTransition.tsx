import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'
import { variants, transitions } from '../../utils/animations'

interface PageTransitionProps {
  readonly children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants.fadeInUp}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitions.quick}
        className="flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

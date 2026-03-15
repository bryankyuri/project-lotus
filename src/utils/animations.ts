/**
 * Shared animation presets for Framer Motion.
 * Import these in components to keep animations consistent.
 */

export const transitions = {
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring' as const, stiffness: 400, damping: 25 },
  smooth: { duration: 0.3, ease: [0.32, 0.72, 0, 1] as const },
  quick: { duration: 0.15, ease: 'easeOut' as const },
}

export const variants = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideFromRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-30%', opacity: 0 },
  },
  slideFromLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '30%', opacity: 0 },
  },
  slideFromBottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
  },
  staggerContainer: {
    animate: { transition: { staggerChildren: 0.05 } },
  },
}

/** Stagger children with custom delay */
export function stagger(delay = 0.05) {
  return {
    animate: { transition: { staggerChildren: delay } },
  }
}

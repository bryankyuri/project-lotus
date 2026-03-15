import { motion } from 'framer-motion'

interface ChipProps {
  readonly label: string
  readonly active?: boolean
  readonly onClick?: () => void
  readonly icon?: React.ReactNode
  readonly className?: string
}

export function Chip({
  label,
  active = false,
  onClick,
  icon,
  className = '',
}: ChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3.5 py-2
        rounded-2xl text-sm font-medium whitespace-nowrap
        transition-colors duration-150 select-none
        ${
          active
            ? 'bg-gradient-primary text-white shadow-sm'
            : 'bg-white text-text-secondary border border-border hover:bg-primary-light hover:text-primary-dark hover:border-primary-light'
        }
        ${className}
      `}
    >
      {icon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
      {label}
    </motion.button>
  )
}

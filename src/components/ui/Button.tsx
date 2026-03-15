import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  loading?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-gradient-primary text-white bg-gradient-primary-hover active:scale-[0.97] shadow-card',
  secondary: 'bg-white text-text border border-border hover:bg-gray-50 active:scale-[0.97]',
  ghost: 'bg-transparent text-text-secondary hover:bg-black/5 active:scale-[0.97]',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.97]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-2xl',
  lg: 'h-13 px-6 text-base gap-2.5 rounded-2xl',
}

const MotionButton = motion.create(
  forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => <button ref={ref} {...props} />
  )
)

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const motionProps: HTMLMotionProps<'button'> = {
    whileTap: disabled || loading ? undefined : { scale: 0.97 },
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  }

  return (
    <MotionButton
      className={`
        inline-flex items-center justify-center font-semibold
        transition-colors duration-150 select-none
        disabled:opacity-50 disabled:pointer-events-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...motionProps}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </MotionButton>
  )
}

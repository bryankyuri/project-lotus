import type { ReactNode } from 'react'

interface EmptyStateProps {
  readonly icon?: ReactNode
  readonly title: string
  readonly subtitle?: string
  readonly action?: ReactNode
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center mb-4 [&>svg]:w-7 [&>svg]:h-7 [&>svg]:text-text-secondary">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text mb-1">{title}</h3>
      {subtitle && (
        <p className="text-sm text-text-secondary max-w-[260px]">{subtitle}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

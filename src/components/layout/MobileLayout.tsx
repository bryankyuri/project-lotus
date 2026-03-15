import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface MobileLayoutProps {
  readonly children: ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-bg">
      {/* Main content — bottom padding for nav */}
      <main className="pb-24 pt-safe-top">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

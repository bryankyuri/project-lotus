import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface DesktopLayoutProps {
  readonly children: ReactNode
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

import type { ReactNode } from 'react'
import { useDevice } from '../../hooks/useDevice'
import { MobileLayout } from './MobileLayout'
import { DesktopLayout } from './DesktopLayout'

interface AppShellProps {
  readonly children: ReactNode
}

/**
 * Picks the correct layout (mobile vs desktop) based on viewport width.
 * Wraps the entire app below the router.
 */
export function AppShell({ children }: AppShellProps) {
  const { isMobile } = useDevice()

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>
  }

  return <DesktopLayout>{children}</DesktopLayout>
}

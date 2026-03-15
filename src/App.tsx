import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from './components/layout'
import { SplashScreen } from './components/ui'
import { useSplash } from './hooks/useSplash'
import { storage } from './store/localStorage'
import { ThemeProvider } from './contexts/ThemeContext'

// Lazy-loaded pages
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const TodayPage = lazy(() => import('./pages/TodayPage'))
const ExplorePage = lazy(() => import('./pages/ExplorePage'))
const PlanPage = lazy(() => import('./pages/PlanPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'))
const EditTargetsPage = lazy(() => import('./pages/EditTargetsPage'))
const InfoPage = lazy(() => import('./pages/InfoPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AppRoutes() {
  useLocation() // subscribe to location changes so needsOnboarding is re-evaluated on every navigation
  const needsOnboarding = !storage.isOnboardingDone()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={<OnboardingPage />}
        />

        {/* Main app routes — wrapped in AppShell */}
        <Route
          path="/"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <AppShell>
                <TodayPage />
              </AppShell>
            )
          }
        />
        <Route
          path="/explore"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <AppShell>
                <ExplorePage />
              </AppShell>
            )
          }
        />
        <Route
          path="/plan"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <AppShell>
                <PlanPage />
              </AppShell>
            )
          }
        />
        <Route
          path="/profile"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <AppShell>
                <ProfilePage />
              </AppShell>
            )
          }
        />

        <Route
          path="/profile/edit"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <AppShell>
                <EditProfilePage />
              </AppShell>
            )
          }
        />
        <Route
          path="/profile/targets"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <AppShell>
                <EditTargetsPage />
              </AppShell>
            )
          }
        />

        <Route
          path="/settings"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <AppShell>
                <SettingsPage />
              </AppShell>
            )
          }
        />

        <Route
          path="/info"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <AppShell>
                <InfoPage />
              </AppShell>
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  const showSplash = useSplash(2800)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <SplashScreen visible={showSplash} />
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

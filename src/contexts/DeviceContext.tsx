import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

// ─── Types ───────────────────────────────────────────────

type BrowserType = 'chrome' | 'safari' | 'firefox' | 'edge' | 'opera' | 'other'
type OSType = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'other'

interface DeviceInfo {
  /** true when viewport width < 1280px */
  isMobile: boolean
  /** true when viewport width >= 1280px */
  isDesktop: boolean
  /** touch-capable device */
  isTouchDevice: boolean
  /** Running on iOS */
  isIOS: boolean
  /** Running on Android */
  isAndroid: boolean
  /** Launched as installed PWA (standalone) */
  isPWA: boolean
  /** Detected browser engine */
  browser: BrowserType
  /** Detected operating system */
  os: OSType
  /** Current viewport width in px */
  width: number
  /** Current viewport height in px */
  height: number
}

const MOBILE_BREAKPOINT = 1280

// ─── Detection helpers ───────────────────────────────────

function detectBrowser(): BrowserType {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('edg/')) return 'edge'
  if (ua.includes('opr/') || ua.includes('opera')) return 'opera'
  if (ua.includes('chrome') && !ua.includes('edg/')) return 'chrome'
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari'
  if (ua.includes('firefox')) return 'firefox'
  return 'other'
}

function detectOS(): OSType {
  const ua = navigator.userAgent
  const uaData = navigator as Navigator & { userAgentData?: { platform?: string }; standalone?: boolean }
  const nav = navigator as unknown as Record<string, unknown>
  const legacyPlatform = typeof nav['platform'] === 'string' ? nav['platform'] : ''
  const platform = uaData.userAgentData?.platform ?? legacyPlatform

  if (
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ) {
    return 'ios'
  }
  if (/android/i.test(ua)) return 'android'
  if (/Win/.test(platform)) return 'windows'
  if (/Mac/.test(platform)) return 'macos'
  if (/Linux/.test(platform)) return 'linux'
  return 'other'
}

function detectIsPWA(): boolean {
  if (globalThis.matchMedia('(display-mode: standalone)').matches) return true
  const nav = navigator as Navigator & { standalone?: boolean }
  if (nav.standalone === true) return true
  if (document.referrer.includes('android-app://')) return true
  return false
}

function detectIsTouch(): boolean {
  return 'ontouchstart' in globalThis || navigator.maxTouchPoints > 0
}

function buildDeviceInfo(): DeviceInfo {
  const width = globalThis.innerWidth
  const height = globalThis.innerHeight
  const os = detectOS()

  return {
    isMobile: width < MOBILE_BREAKPOINT,
    isDesktop: width >= MOBILE_BREAKPOINT,
    isTouchDevice: detectIsTouch(),
    isIOS: os === 'ios',
    isAndroid: os === 'android',
    isPWA: detectIsPWA(),
    browser: detectBrowser(),
    os,
    width,
    height,
  }
}

// ─── Context ─────────────────────────────────────────────

const DeviceContext = createContext<DeviceInfo>(buildDeviceInfo())

export function DeviceProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [info, setInfo] = useState<DeviceInfo>(buildDeviceInfo)

  const handleResize = useCallback(() => {
    setInfo(buildDeviceInfo())
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const debounced = () => {
      clearTimeout(timer)
      timer = setTimeout(handleResize, 150)
    }

    globalThis.addEventListener('resize', debounced)
    globalThis.addEventListener('orientationchange', handleResize)

    const mql = globalThis.matchMedia('(display-mode: standalone)')
    mql.addEventListener('change', handleResize)

    return () => {
      clearTimeout(timer)
      globalThis.removeEventListener('resize', debounced)
      globalThis.removeEventListener('orientationchange', handleResize)
      mql.removeEventListener('change', handleResize)
    }
  }, [handleResize])

  return (
    <DeviceContext.Provider value={info}>{children}</DeviceContext.Provider>
  )
}

export { DeviceContext, MOBILE_BREAKPOINT }
export type { DeviceInfo, BrowserType, OSType }

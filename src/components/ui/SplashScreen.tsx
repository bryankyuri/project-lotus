import { useMemo, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  readonly visible: boolean
}

// ─── Floating blob config ────────────────────────────────
const BLOBS = [
  { size: 180, x: '-10%', y: '-5%', delay: 0, dur: 6 },
  { size: 120, x: '70%', y: '10%', delay: 0.5, dur: 7 },
  { size: 200, x: '60%', y: '65%', delay: 1, dur: 8 },
  { size: 140, x: '-5%', y: '60%', delay: 0.3, dur: 5 },
  { size: 100, x: '30%', y: '80%', delay: 0.8, dur: 6.5 },
  { size: 90, x: '85%', y: '40%', delay: 1.2, dur: 7.5 },
]

// ─── Floating particle config ────────────────────────────
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: `${10 + Math.random() * 80}%`,
  y: `${10 + Math.random() * 80}%`,
  size: 4 + Math.random() * 6,
  delay: Math.random() * 2,
  dur: 3 + Math.random() * 3,
}))

// ─── Healthy ornament SVGs — each uses multiple <path>s for reliability ──
const ORNAMENT_ICONS = [
  // Apple (from Lucide)
  { label: 'apple', paths: ['M12 20.94c1.5 0 2.75 1.06 4-1.06 3.5-4 5.5-7 2-10-1.04-.89-2.48-.89-3.53-.02L12 12l-2.47-2.14c-1.05-.87-2.49-.87-3.53.02-3.5 3-1.5 6 2 10 1.25 2.12 2.5 1.06 4 1.06z', 'M12 7c0-3-2-5-2-5s-2 2-2 5'] },
  // Carrot
  { label: 'carrot', paths: ['M2.27 21.7s9.87-9.87 4.67-15.06', 'M8.64 14.36a4 4 0 0 0 5.66-5.66l-6.36 6.36z', 'M12.95 7.05a1 1 0 0 1 1.41 0l2.59 2.59a1 1 0 0 1 0 1.41', 'M15 2l5 5-2 2', 'M2 22l4-4'] },
  // Dumbbell
  { label: 'dumbbell', paths: ['M14.4 14.4L9.6 9.6', 'M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.414-1.414a2 2 0 1 1 2.828-2.829l1.415 1.414a2 2 0 1 1 2.829 2.829z', 'M5.343 2.515a2 2 0 1 1 2.829 2.828l1.414 1.414a2 2 0 1 1-2.828 2.829L5.343 8.172a2 2 0 1 1-2.829-2.829z'] },
  // Heart
  { label: 'heart', paths: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z'] },
  // Bike wheel (simple circles + frame)
  { label: 'bike', paths: ['M5.5 17a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z', 'M18.5 17a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z', 'M15 6l-4 6h6l-3 5', 'M8 12h4'] },
  // Droplet
  { label: 'water', paths: ['M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z'] },
  // Running (stick figure)
  { label: 'run', paths: ['M13 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M4 17l3-3 2 2 4-4 3 6', 'M10 22l-1-4', 'M16 22l1-4', 'M7 11l3-3 4 2 3-4'] },
  // Banana curve
  { label: 'banana', paths: ['M4 13c3.5-2 8-10 14-10', 'M5.5 20S8 18 12 14s6-10 6-10'] },
  // Bowl
  { label: 'salad', paths: ['M3 11h18', 'M5 11c0 4.4 3.1 8 7 8s7-3.6 7-8', 'M8 7c0-2.2 1.8-4 4-4s4 1.8 4 4', 'M6 7h12'] },
  // Flame
  { label: 'flame', paths: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 2-6.5 0 0 .5 2 2 3.5 1.5 1.5 2 3.5 2 4.5a5 5 0 1 1-10 0c0-.97.22-1.82.58-2.5'] },
]

// ─── Base ornament positions (mobile: 10, tablet: +6, desktop: +8 more) ──
const BASE_POSITIONS = [
  { x: 5,  y: 6  }, { x: 80, y: 4  }, { x: 10, y: 30 }, { x: 87, y: 28 }, { x: 3,  y: 58 },
  { x: 82, y: 55 }, { x: 18, y: 78 }, { x: 73, y: 80 }, { x: 40, y: 4  }, { x: 50, y: 88 },
]
const TABLET_POSITIONS = [
  { x: 30, y: 18 }, { x: 65, y: 15 }, { x: 92, y: 48 }, { x: 8,  y: 45 }, { x: 55, y: 70 }, { x: 35, y: 90 },
]
const DESKTOP_POSITIONS = [
  { x: 15, y: 12 }, { x: 70, y: 8  }, { x: 95, y: 65 }, { x: 2,  y: 85 },
  { x: 60, y: 40 }, { x: 28, y: 55 }, { x: 85, y: 85 }, { x: 45, y: 25 },
]

function buildOrnaments(screenW: number) {
  // Pick how many positions to use based on screen width
  let positions = [...BASE_POSITIONS]
  let baseSize = 36 // mobile
  if (screenW >= 768) { positions = [...positions, ...TABLET_POSITIONS]; baseSize = 44 }
  if (screenW >= 1200) { positions = [...positions, ...DESKTOP_POSITIONS]; baseSize = 52 }

  return positions.map((pos, i) => {
    const icon = ORNAMENT_ICONS[i % ORNAMENT_ICONS.length]
    const sizeVariance = ((i * 7) % 5) - 2 // -2..+2
    return {
      ...icon,
      id: `${icon.label}-${i}`,
      x: `${pos.x}%`,
      y: `${pos.y}%`,
      size: baseSize + sizeVariance * 2,
      rotation: ((i * 47 + 13) % 60) - 30, // -30..+30
      delay: 0.1 + (i * 0.12),
      dur: 6 + (i % 4) * 1.5,
    }
  })
}

// Subscribe to window resize for SSR-safe width
const subscribeResize = (cb: () => void) => {
  window.addEventListener('resize', cb)
  return () => window.removeEventListener('resize', cb)
}
const getWidth = () => window.innerWidth
const getWidthServer = () => 375

export function SplashScreen({ visible }: SplashScreenProps) {
  const screenW = useSyncExternalStore(subscribeResize, getWidth, getWidthServer)
  const ornaments = useMemo(() => buildOrnaments(screenW), [screenW])

  // Responsive sizing — computed once per breakpoint
  const isDesktop = screenW >= 1200
  const isTablet = screenW >= 768
  const sz = useMemo(() => {
    if (isDesktop) return { burst: 500, ring: 160, icon: 72, gap: 'mt-10', title: 'text-5xl', sub: 'text-lg mt-3', bar: 'w-48 h-1.5' }
    if (isTablet)  return { burst: 400, ring: 140, icon: 60, gap: 'mt-8',  title: 'text-4xl', sub: 'text-base mt-2', bar: 'w-40 h-1' }
    return                  { burst: 300, ring: 112, icon: 48, gap: 'mt-6',  title: 'text-3xl', sub: 'text-sm mt-1.5', bar: 'w-32 h-1' }
  }, [isDesktop, isTablet])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-200 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Gradient background */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #BEF264 0%, #86EFAC 40%, #4ADE80 70%, #22C55E 100%)',
            }}
            animate={{
              background: [
                'linear-gradient(135deg, #BEF264 0%, #86EFAC 40%, #4ADE80 70%, #22C55E 100%)',
                'linear-gradient(225deg, #86EFAC 0%, #BEF264 40%, #22C55E 70%, #4ADE80 100%)',
                'linear-gradient(315deg, #4ADE80 0%, #22C55E 40%, #BEF264 70%, #86EFAC 100%)',
                'linear-gradient(135deg, #BEF264 0%, #86EFAC 40%, #4ADE80 70%, #22C55E 100%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />

          {/* Floating blobs */}
          {BLOBS.map((blob, i) => (
            <motion.div
              key={`blob-${i}`}
              className="absolute rounded-full"
              style={{
                width: blob.size,
                height: blob.size,
                left: blob.x,
                top: blob.y,
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 70%, transparent 100%)',
                filter: 'blur(1px)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0.8, 1.2, 0.9, 1.1, 0.8],
                opacity: [0.3, 0.6, 0.4, 0.5, 0.3],
                x: [0, 20, -15, 10, 0],
                y: [0, -15, 10, -20, 0],
              }}
              transition={{
                duration: blob.dur,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: blob.delay,
              }}
            />
          ))}

          {/* Floating particles */}
          {PARTICLES.map((p) => (
            <motion.div
              key={`particle-${p.id}`}
              className="absolute rounded-full bg-white/30"
              style={{
                width: p.size,
                height: p.size,
                left: p.x,
                top: p.y,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [0.5, 1, 0.5],
                y: [0, -30, 0],
              }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: p.delay,
              }}
            />
          ))}

          {/* Healthy ornament icons — quantity scales with screen */}
          {ornaments.map((orn) => (
            <motion.div
              key={`orn-${orn.id}`}
              className="absolute z-10"
              style={{
                left: orn.x,
                top: orn.y,
                width: orn.size,
                height: orn.size,
              }}
              initial={{ opacity: 0.3, scale: 0.7, rotate: orn.rotation }}
              animate={{
                opacity: [0.35, 0.65, 0.5, 0.65, 0.35],
                scale: [0.85, 1.05, 0.95, 1.1, 0.85],
                y: [0, -14, 5, -10, 0],
                x: [0, 8, -5, 10, 0],
                rotate: [orn.rotation, orn.rotation + 15, orn.rotation - 10, orn.rotation + 8, orn.rotation],
              }}
              transition={{
                duration: orn.dur,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: orn.delay,
              }}
            >
              <svg
                width={orn.size}
                height={orn.size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {orn.paths.map((d) => (
                  <path key={d} d={d} />
                ))}
              </svg>
            </motion.div>
          ))}

          {/* Radial light burst behind logo */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: sz.burst,
              height: sz.burst,
              background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            {/* Lottie ring behind icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="relative"
            >
              <div className="relative" style={{ width: sz.ring, height: sz.ring }}>
                {/* Animated concentric rings */}
                {[0, 1, 2].map((ring) => (
                  <motion.div
                    key={`ring-${ring}`}
                    className="absolute inset-0 rounded-full border-2 border-white/30"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{
                      scale: [0.6, 1 + ring * 0.2, 0.6],
                      opacity: [0, 0.4 - ring * 0.1, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: ring * 0.4,
                    }}
                  />
                ))}
                {/* Inner filled circle */}
                <motion.div
                  className="absolute inset-3 rounded-full bg-white/15"
                  animate={{
                    scale: [0.9, 1.05, 0.9],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                {/* Leaf SVG icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
                >
                  <svg width={sz.icon} height={sz.icon} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                      d="M2 22c1.25-.987 2.27-1.975 3.9-2.2 1.6-.22 2.4.2 4.1-.1 1.7-.3 2.8-1.2 3.5-2.1.7-.9 1.1-2 1.2-3.1.1-1.1-.1-2.3-.6-3.3-.5-1-1.3-1.8-2.2-2.4-.9-.6-2-.9-3.1-1s-2.2.1-3.2.5C4.5 9 3.7 9.7 3 10.5c-.7.8-1.2 1.8-1.4 2.9-.2 1.1-.2 2.2 0 3.3.2 1.1.7 2.1 1.3 3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.4, ease: 'easeInOut' }}
                    />
                    <motion.path
                      d="M2 22 17 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.8, ease: 'easeInOut' }}
                    />
                    <motion.path
                      d="m15 4.7 1.5 1.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 1.2, ease: 'easeInOut' }}
                    />
                    <motion.path
                      d="m17 2 3 3-1.5 1.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 1, ease: 'easeInOut' }}
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            {/* App name */}
            <motion.div
              className={`${sz.gap} text-center`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
            >
              <h1 className={`${sz.title} font-extrabold text-white tracking-tight drop-shadow-sm`}>
                {'NutriPlan'.split('').map((char, i) => (
                  <motion.span
                    key={`char-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                className={`${sz.sub} text-white/80 font-medium`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                Plan smart. Eat well.
              </motion.p>
            </motion.div>

            {/* Animated loading bar */}
            {(() => {
              return (
                <motion.div
                  className={`absolute bottom-24 ${sz.bar} rounded-full bg-white/20 overflow-hidden`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div
                    className="h-full rounded-full bg-white/70"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.8, delay: 0.9, ease: [0.32, 0.72, 0, 1] }}
                  />
                </motion.div>
              )
            })()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

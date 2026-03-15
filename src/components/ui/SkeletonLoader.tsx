interface SkeletonLoaderProps {
  readonly className?: string
  /** Number of skeleton rows */
  readonly count?: number
}

function SkeletonLine({ className = 'h-4 w-full' }: Readonly<{ className?: string }>) {
  return (
    <div className={`skeleton rounded-lg ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card space-y-3">
      <SkeletonLine className="h-5 w-3/4" />
      <SkeletonLine className="h-4 w-1/2" />
      <div className="flex gap-3">
        <SkeletonLine className="h-8 w-16 rounded-xl" />
        <SkeletonLine className="h-8 w-16 rounded-xl" />
        <SkeletonLine className="h-8 w-16 rounded-xl" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 4 }: SkeletonLoaderProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <SkeletonLine className="h-10 w-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="h-4 w-3/4" />
            <SkeletonLine className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonRing() {
  return (
    <div className="skeleton h-[120px] w-[120px] rounded-full" />
  )
}

export { SkeletonLine }

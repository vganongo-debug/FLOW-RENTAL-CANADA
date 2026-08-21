import { Award, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

type Tier = 'Silver' | 'Gold' | 'Platinum'

interface Props {
  memberName: string
  points: number
  tier: Tier
  pointsToNext?: number
  nextTier?: Tier | null
  className?: string
}

const TIER_TONE: Record<Tier, string> = {
  Silver: 'from-g60 to-g40',
  Gold: 'from-copper to-copper-dark',
  Platinum: 'from-teal to-teal-dark',
}

export function FlowRewardsCard({ memberName, points, tier, pointsToNext = 0, nextTier, className }: Props) {
  const total = points + pointsToNext
  const pct = total ? Math.min(100, Math.round((points / total) * 100)) : 100
  return (
    <div className={cn('rounded-card overflow-hidden text-white shadow-card', className)}>
      <div className={cn('bg-gradient-to-br p-5', TIER_TONE[tier])}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="label-caps">Flow Rewards · {tier}</span>
          </div>
          <Sparkles className="h-4 w-4 opacity-70" />
        </div>
        <div className="mt-3 font-display text-4xl font-bold leading-none">
          {points.toLocaleString()}
          <span className="ml-1 text-sm font-normal opacity-80">pts</span>
        </div>
        <div className="mt-1 text-sm opacity-90">{memberName}</div>
      </div>
      <div className="bg-white dark:bg-panel-mid p-4">
        {nextTier ? (
          <>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-g40">Progress to {nextTier}</span>
              <span className="font-medium text-ink dark:text-ivory">{pointsToNext.toLocaleString()} to go</span>
            </div>
            <div className="h-2 rounded-full bg-ivory dark:bg-panel overflow-hidden">
              <div className="h-full bg-copper" style={{ width: `${pct}%` }} />
            </div>
          </>
        ) : (
          <div className="text-xs text-g40">You've reached the top tier 🎉</div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <button className="px-2 py-1.5 rounded-input border border-g20 text-ink dark:text-ivory hover:bg-ivory">Redeem night</button>
          <button className="px-2 py-1.5 rounded-input border border-g20 text-ink dark:text-ivory hover:bg-ivory">Upgrade rental</button>
        </div>
      </div>
    </div>
  )
}

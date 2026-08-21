import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props {
  label: string
  value: string | number
  delta?: { pct: number; direction: 'up' | 'down' | 'flat' }
  hint?: string
  accent?: 'copper' | 'teal' | 'ink'
  icon?: React.ReactNode
  className?: string
}

const ACCENT: Record<NonNullable<Props['accent']>, string> = {
  copper: 'text-copper',
  teal: 'text-teal',
  ink: 'text-ink dark:text-ivory',
}

export function FlowKPICard({ label, value, delta, hint, accent = 'copper', icon, className }: Props) {
  const Arrow =
    delta?.direction === 'up' ? ArrowUpRight : delta?.direction === 'down' ? ArrowDownRight : Minus
  const deltaTone =
    delta?.direction === 'up'
      ? 'text-teal'
      : delta?.direction === 'down'
      ? 'text-red-600 dark:text-red-400'
      : 'text-g40'
  return (
    <div
      className={cn(
        'rounded-card border border-g20/60 bg-white dark:bg-panel-mid p-5 shadow-card flex flex-col gap-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="label-caps text-g40 dark:text-g60">{label}</span>
        {icon && <div className="text-teal">{icon}</div>}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={cn('font-display font-bold text-3xl leading-none', ACCENT[accent])}>
          {value}
        </span>
        {delta && (
          <span className={cn('flex items-center text-xs font-medium', deltaTone)}>
            <Arrow className="h-3.5 w-3.5" />
            {Math.abs(delta.pct).toFixed(1)}%
          </span>
        )}
      </div>
      {hint && <span className="text-xs text-g40 dark:text-g60">{hint}</span>}
    </div>
  )
}

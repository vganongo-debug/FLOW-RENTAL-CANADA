import { cn } from '../../lib/utils'

type Tone =
  | 'active'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'info'
  | 'warning'
  | 'success'
  | 'neutral'

interface Props {
  tone?: Tone
  children: React.ReactNode
  dot?: boolean
  className?: string
}

const TONE: Record<Tone, string> = {
  active:    'bg-teal text-white',
  success:   'bg-teal text-white',
  pending:   'bg-copper text-white',
  warning:   'bg-copper-light text-copper-dark',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  completed: 'bg-g20 text-g80 dark:bg-g20 dark:text-g80',
  info:      'bg-teal-light text-teal-dark',
  neutral:   'bg-g20/40 text-g40 dark:bg-g20 dark:text-g80',
}

export function FlowStatusBadge({ tone = 'neutral', children, dot, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-badge px-2 py-0.5 text-xs font-medium label-caps',
        TONE[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  )
}

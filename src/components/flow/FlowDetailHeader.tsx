/**
 * <FlowDetailHeader> · the consistent hero block used at the top of every
 * entity detail page.
 *
 * Renders: back-link → eyebrow → title → subtitle → status badge → CTAs.
 * Everything except `title` is optional.
 */
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface Props {
  /** Small uppercase label above the title (e.g. "Reservation · RES-2026001"). */
  eyebrow?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Right-aligned status badge or pill. */
  status?: React.ReactNode
  /** Right-aligned action buttons. */
  actions?: React.ReactNode
  /** Optional "back to list" href · adds an ArrowLeft pill. */
  backTo?: string
  backLabel?: string
  className?: string
}

export function FlowDetailHeader({
  eyebrow, title, subtitle, status, actions, backTo, backLabel = 'Back', className,
}: Props) {
  return (
    <div className={cn('space-y-3', className)}>
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 text-xs label-caps text-g40 hover:text-teal transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> {backLabel}
        </Link>
      )}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="min-w-0">
          {eyebrow && <div className="label-caps text-g40 dark:text-g60 text-xs">{eyebrow}</div>}
          <h1 className="font-display text-3xl text-ink dark:text-ivory truncate mt-1">{title}</h1>
          {subtitle && <p className="text-sm text-g40 dark:text-g60 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {status}
          {actions}
        </div>
      </div>
    </div>
  )
}

/**
 * <FlowRef> · the universal clickable entity pill.
 *
 * Use it anywhere you need to surface an entity inline (table cells, KPI
 * footers, breadcrumbs, chat bubbles, audit logs). Pass either:
 *
 *   <FlowRef id="RES-2026001" />            // auto-resolve from ID
 *   <FlowRef ref={resolvedRef} />           // when you already have it
 *
 * If the ID is unrecognised, the pill renders as plain text (no link).
 *
 * Use <FlowLinkify> for free-text strings that may contain multiple IDs.
 */
import { Link } from 'react-router-dom'
import { resolveRef, type EntityRef, type AccentColour } from '../../lib/refs'
import { cn } from '../../lib/utils'
import { linkify, type LinkifySegment } from '../../lib/refs'

interface FlowRefProps {
  /** The entity ID · auto-resolves via resolveRef(). */
  id?: string
  /** Pre-resolved reference · skips the lookup. */
  ref?: EntityRef
  /** Display variant. Default 'pill'. */
  variant?: 'pill' | 'inline' | 'plain'
  /** Override the displayed label · falls back to ref.label. */
  label?: string
  /** Hide the icon (for tight cells). */
  noIcon?: boolean
  className?: string
}

const ACCENT_CLASSES: Record<AccentColour, { pill: string; inline: string }> = {
  teal: {
    pill: 'bg-teal-light text-teal-dark hover:bg-teal hover:text-white border-teal/20',
    inline: 'text-teal-dark hover:text-teal underline decoration-teal/30 hover:decoration-teal',
  },
  copper: {
    pill: 'bg-copper-light text-copper-dark hover:bg-copper hover:text-white border-copper/20',
    inline: 'text-copper-dark hover:text-copper underline decoration-copper/30 hover:decoration-copper',
  },
  gold: {
    pill: 'bg-amber-100 text-amber-900 hover:bg-amber-500 hover:text-white border-amber-300/40 dark:bg-amber-900/30 dark:text-amber-200',
    inline: 'text-amber-700 hover:text-amber-900 underline decoration-amber-400/40 dark:text-amber-300',
  },
  neutral: {
    pill: 'bg-g20/50 text-g80 hover:bg-g40 hover:text-white border-g20/60 dark:bg-g20 dark:text-ivory',
    inline: 'text-g80 hover:text-ink dark:text-ivory underline decoration-g40/40',
  },
}

export function FlowRef({ id, ref, variant = 'pill', label, noIcon, className }: FlowRefProps) {
  const r = ref ?? (id ? resolveRef(id) : null)
  if (!r) {
    // Unresolvable · just show the raw ID inline.
    return <span className={cn('font-mono text-xs text-g40', className)}>{label ?? id}</span>
  }
  const Icon = r.icon
  const accentClasses = ACCENT_CLASSES[r.accent]
  const displayLabel = label ?? r.label

  if (variant === 'plain') {
    return (
      <Link
        to={r.href}
        title={r.hint}
        className={cn(
          'text-inherit hover:text-teal hover:underline transition-colors',
          className
        )}
      >
        {displayLabel}
      </Link>
    )
  }

  if (variant === 'inline') {
    return (
      <Link
        to={r.href}
        title={r.hint}
        className={cn(
          'transition-colors decoration-1 underline-offset-2',
          accentClasses.inline,
          className
        )}
      >
        {displayLabel}
      </Link>
    )
  }

  // default: pill
  return (
    <Link
      to={r.href}
      title={r.hint}
      data-entity-kind={r.kind}
      data-entity-id={r.id}
      className={cn(
        'inline-flex items-center gap-1 rounded-badge px-2 py-0.5 text-xs font-medium border transition-colors max-w-[18ch] truncate align-middle',
        accentClasses.pill,
        r.fallback && 'opacity-70 italic',
        className
      )}
    >
      {!noIcon && <Icon className="h-3 w-3 shrink-0" />}
      <span className="truncate">{displayLabel}</span>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Free-text linkify wrapper                                          */
/* ------------------------------------------------------------------ */

interface FlowLinkifyProps {
  text: string
  /** Variant applied to every detected ref. Default 'inline'. */
  variant?: FlowRefProps['variant']
  className?: string
}

/**
 * Renders a string with every detected entity ID converted into a clickable
 * <FlowRef>. Plain text segments stay untouched.
 *
 *   <FlowLinkify text="Confirmed RES-2026001 for m-1 at p-kla" />
 */
export function FlowLinkify({ text, variant = 'inline', className }: FlowLinkifyProps) {
  const segments: LinkifySegment[] = linkify(text)
  if (segments.length === 0) return <span className={className}>{text}</span>
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === 'text'
          ? <span key={i}>{seg.text}</span>
          : <FlowRef key={i} ref={seg.ref} variant={variant} />
      )}
    </span>
  )
}

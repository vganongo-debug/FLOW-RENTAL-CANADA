import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '../../lib/utils'

type Tone = 'info' | 'success' | 'warning'

interface Props {
  tone?: Tone
  title: string
  body?: string
  onClose?: () => void
  className?: string
}

const TONE: Record<Tone, { bg: string; icon: React.ComponentType<{ className?: string }>; ico: string }> = {
  info: { bg: 'bg-teal-light text-teal-dark border-teal/30', icon: Info, ico: 'text-teal' },
  success: { bg: 'bg-teal text-white border-teal-dark', icon: CheckCircle2, ico: 'text-white' },
  warning: { bg: 'bg-copper-light text-copper-dark border-copper/30', icon: AlertTriangle, ico: 'text-copper' },
}

export function FlowNotification({ tone = 'info', title, body, onClose, className }: Props) {
  const { bg, icon: Icon, ico } = TONE[tone]
  return (
    <div className={cn('flex items-start gap-3 px-4 py-3 rounded-card border shadow-card animate-flow-fade', bg, className)}>
      <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', ico)} />
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        {body && <div className="text-xs opacity-80 mt-0.5">{body}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

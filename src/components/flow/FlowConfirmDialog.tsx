import { AlertTriangle, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useFocusTrap } from '../../lib/useFocusTrap'

interface Props {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function FlowConfirmDialog({
  open, title, description,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  destructive, onConfirm, onCancel,
}: Props) {
  const ref = useFocusTrap<HTMLDivElement>(open, onCancel)
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-ink/50 z-40 animate-flow-fade" onClick={onCancel} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={ref}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="bg-white dark:bg-panel-mid w-full max-w-md rounded-card shadow-panel animate-flow-fade"
        >
          <div className="flex items-start gap-3 p-5">
            {destructive && <AlertTriangle className="h-5 w-5 text-copper shrink-0 mt-0.5" aria-hidden="true" />}
            <div className="flex-1">
              <h3 id="confirm-title" className="font-display text-lg text-ink dark:text-ivory">{title}</h3>
              {description && <p className="text-sm text-g40 dark:text-g60 mt-1">{description}</p>}
            </div>
            <button onClick={onCancel} aria-label="Cancel" className="p-1 rounded-input hover:bg-ivory">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-5 py-3 border-t border-g20/60 flex justify-end gap-2">
            <button onClick={onCancel} className="px-3 py-2 rounded-input border border-g20 text-sm">
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                'px-3 py-2 rounded-input text-sm font-medium text-white',
                destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-teal hover:bg-teal-dark'
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

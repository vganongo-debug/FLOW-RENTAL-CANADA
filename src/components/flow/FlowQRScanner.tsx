import { QrCode, ScanLine } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props { className?: string; onScan?: (code: string) => void }

export function FlowQRScanner({ className, onScan }: Props) {
  return (
    <button
      onClick={() => onScan?.('FLOW-DEMO-2026')}
      className={cn(
        'group relative aspect-square w-40 rounded-card border-2 border-dashed border-teal/60 bg-teal-light/40 dark:bg-teal-dark/20 flex flex-col items-center justify-center text-teal-dark dark:text-teal-light hover:border-teal transition',
        className
      )}
    >
      <QrCode className="h-12 w-12 mb-2" />
      <span className="text-xs label-caps">Scan QR</span>
      <ScanLine className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 w-32 bg-teal opacity-0 group-hover:opacity-80 transition" />
    </button>
  )
}

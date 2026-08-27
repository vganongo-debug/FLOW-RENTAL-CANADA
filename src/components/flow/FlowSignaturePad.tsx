import { useEffect, useRef, useState } from 'react'
import { Eraser } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props { className?: string; label?: string }

export function FlowSignaturePad({ className, label = 'Sign here' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [empty, setEmpty] = useState(true)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 1.6
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#081D38'
  }, [])

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setDrawing(true); setEmpty(false)
    const ctx = e.currentTarget.getContext('2d'); if (!ctx) return
    const p = point(e); ctx.beginPath(); ctx.moveTo(p.x, p.y)
  }
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const ctx = e.currentTarget.getContext('2d'); if (!ctx) return
    const p = point(e); ctx.lineTo(p.x, p.y); ctx.stroke()
  }
  const end = () => setDrawing(false)
  const clear = () => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d'); ctx?.clearRect(0, 0, c.width, c.height)
    setEmpty(true)
  }

  return (
    <div className={cn('rounded-card border border-g20 bg-white dark:bg-panel-mid', className)}>
      <div className="px-3 py-2 border-b border-g20/60 flex items-center justify-between">
        <span className="label-caps text-g40">{label}</span>
        <button onClick={clear} className="text-xs text-g40 hover:text-red-600 inline-flex items-center gap-1">
          <Eraser className="h-3 w-3" /> Clear
        </button>
      </div>
      <canvas
        ref={ref}
        width={420}
        height={120}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="block w-full h-28 touch-none cursor-crosshair"
      />
      {empty && (
        <div className="-mt-28 h-28 pointer-events-none flex items-center justify-center text-g60 italic font-display">
          Sign with mouse or finger
        </div>
      )}
    </div>
  )
}

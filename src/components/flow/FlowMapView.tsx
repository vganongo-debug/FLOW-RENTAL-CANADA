import { Car as CarIcon, MapPin } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Vehicle } from '../../lib/types'

interface Props {
  vehicles: Vehicle[]
  className?: string
  height?: number
}

// Stylised SVG map of Africa with vehicle pins. Placeholder for Mapbox/OSM.
export function FlowMapView({ vehicles, className, height = 380 }: Props) {
  // Project lat/lng to SVG coords roughly for Africa bounding box
  const project = (lat: number, lng: number) => {
    const minLat = -15, maxLat = 22
    const minLng = 5,  maxLng = 50
    const x = ((lng - minLng) / (maxLng - minLng)) * 600
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 400
    return { x, y }
  }

  return (
    <div
      className={cn(
        'relative rounded-card border border-g20/60 bg-teal-light/30 dark:bg-teal-dark/20 overflow-hidden',
        className
      )}
      style={{ height }}
    >
      <svg
        viewBox="0 0 600 400"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0B6E6E" strokeOpacity="0.08" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="600" height="400" fill="url(#grid)" />
        {/* Stylised continent silhouette */}
        <path
          d="M 195 60 C 250 50, 320 55, 380 80 C 430 100, 470 140, 480 200 C 490 260, 470 310, 430 340 C 380 370, 320 365, 280 360 C 220 350, 180 320, 160 270 C 140 220, 145 160, 165 110 C 175 90, 185 70, 195 60 Z"
          fill="#0B6E6E"
          fillOpacity="0.15"
          stroke="#0B6E6E"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        {vehicles.map((v) => {
          const { x, y } = project(v.gps.lat, v.gps.lng)
          const color = v.owner === 'flow' ? '#0B6E6E' : '#B87333'
          return (
            <g key={v.id} transform={`translate(${x},${y})`}>
              <circle r="14" fill={color} fillOpacity="0.18" />
              <circle r="6" fill={color} stroke="white" strokeWidth="1.5" />
            </g>
          )
        })}
      </svg>

      <div className="absolute top-3 left-3 bg-white/95 dark:bg-panel-mid/95 backdrop-blur rounded-card px-3 py-2 text-xs shadow-card">
        <div className="label-caps text-g40 mb-1">Live fleet</div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-ink dark:text-ivory">
            <span className="h-2 w-2 rounded-full bg-teal" /> Flow ({vehicles.filter(v => v.owner === 'flow').length})
          </span>
          <span className="flex items-center gap-1 text-ink dark:text-ivory">
            <span className="h-2 w-2 rounded-full bg-copper" /> Partner ({vehicles.filter(v => v.owner === 'partner').length})
          </span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-panel-mid/95 backdrop-blur rounded-card px-3 py-2 text-xs shadow-card flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-teal" />
        <span className="text-g40">Map placeholder · OpenStreetMap / Mapbox</span>
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <button className="bg-white dark:bg-panel-mid border border-g20/60 rounded-input p-1.5 text-ink dark:text-ivory text-xs hover:bg-ivory">
          <CarIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

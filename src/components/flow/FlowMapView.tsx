import { Car as CarIcon, MapPin } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Vehicle } from '../../lib/types'

interface Props {
  vehicles: Vehicle[]
  className?: string
  height?: number
}

// Stylised SVG map of the Quebec North Shore / Labrador with vehicle pins.
// Placeholder for Mapbox/OSM.
export function FlowMapView({ vehicles, className, height = 380 }: Props) {
  // Project lat/lng to SVG coords over the operating bounding box:
  // Côte-Nord, Basse-Côte-Nord and Labrador (plus the Montréal hub).
  const project = (lat: number, lng: number) => {
    const minLat = 45, maxLat = 57
    const minLng = -75, maxLng = -55
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
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#015FC4" strokeOpacity="0.08" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="600" height="400" fill="url(#grid)" />
        {/* Stylised coastline silhouette */}
        <path
          d="M 60 330 C 130 300, 200 285, 265 265 C 330 245, 385 225, 440 195 C 480 172, 515 150, 545 120 C 560 105, 570 88, 575 70 L 575 20 L 500 20 C 470 55, 430 90, 380 120 C 320 155, 250 185, 180 215 C 130 236, 85 262, 55 292 Z"
          fill="#015FC4"
          fillOpacity="0.15"
          stroke="#015FC4"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        {vehicles.map((v) => {
          const { x, y } = project(v.gps.lat, v.gps.lng)
          const color = v.owner === 'flow' ? '#015FC4' : '#B30307'
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

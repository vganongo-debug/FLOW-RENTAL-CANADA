import { useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props {
  label?: string
  accept?: string
  multiple?: boolean
  className?: string
  hint?: string
}

export function FlowFileUpload({ label = 'Upload documents', accept, multiple = true, className, hint }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [drag, setDrag] = useState(false)

  const onPick = (list: FileList | null) => {
    if (!list) return
    setFiles((f) => [...f, ...Array.from(list)])
  }

  return (
    <div className={cn('rounded-card border-2 border-dashed', drag ? 'border-teal bg-teal-light/40' : 'border-g20', className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onPick(e.dataTransfer.files) }}
        className="px-6 py-8 text-center cursor-pointer"
        onClick={() => ref.current?.click()}
      >
        <Upload className="h-6 w-6 text-teal mx-auto mb-2" />
        <div className="font-medium text-ink dark:text-ivory text-sm">{label}</div>
        <div className="text-xs text-g40 dark:text-g60 mt-1">
          {hint ?? 'Drop files here or click to browse'}
        </div>
        <input
          ref={ref}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => onPick(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="border-t border-g20/60 p-3 space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs">
              <FileText className="h-3.5 w-3.5 text-teal" />
              <span className="flex-1 truncate text-ink dark:text-ivory">{f.name}</span>
              <span className="text-g40">{(f.size / 1024).toFixed(1)} KB</span>
              <button
                onClick={() => setFiles((cur) => cur.filter((_, idx) => idx !== i))}
                className="text-g40 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

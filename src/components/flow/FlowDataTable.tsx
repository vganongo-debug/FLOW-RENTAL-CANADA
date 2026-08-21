import { useMemo, useState, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Inbox } from 'lucide-react'
import { cn, exportToCsv } from '../../lib/utils'

export interface Column<T> {
  key: keyof T & string
  header: string
  render?: (row: T) => ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'right' | 'center'
}

interface Props<T extends Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  pageSize?: number
  exportable?: boolean
  exportFilename?: string
  emptyState?: ReactNode
  className?: string
}

export function FlowDataTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowKey,
  onRowClick,
  pageSize = 10,
  exportable = true,
  exportFilename = 'export.csv',
  emptyState,
  className,
}: Props<T>) {
  const { t } = useTranslation()
  const [sortKey, setSortKey] = useState<keyof T & string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    const copy = [...data]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
    return copy
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key: keyof T & string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div className={cn('rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden', className)}>
      {exportable && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-g20/60 bg-white dark:bg-panel-mid">
          <span className="label-caps text-g40 dark:text-g60">{sorted.length} {t('common.records')}</span>
          <button
            className="inline-flex items-center gap-2 text-xs font-medium text-teal hover:text-teal-dark"
            onClick={() => exportToCsv(exportFilename, sorted as Record<string, unknown>[])}
          >
            <Download className="h-3.5 w-3.5" />
            {t('common.exportCsv')}
          </button>
        </div>
      )}
      <div className="overflow-x-auto flow-scroll">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {columns.map((c, ci) => (
                <th
                  key={`${c.key}-${ci}`}
                  style={{ width: c.width }}
                  className={cn(
                    'label-caps font-semibold px-4 py-3 text-left whitespace-nowrap',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center'
                  )}
                >
                  {c.sortable !== false ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:opacity-90"
                    >
                      {c.header}
                      {sortKey === c.key ? (
                        sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-60" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  {emptyState ?? (
                    <div className="flex flex-col items-center gap-2 text-g40 dark:text-g60">
                      <span className="h-12 w-12 rounded-full bg-ivory dark:bg-panel flex items-center justify-center">
                        <Inbox className="h-5 w-5 text-g40" />
                      </span>
                      <div className="font-display text-base text-ink dark:text-ivory">{t('common.empty')}</div>
                      <div className="text-xs">{t('common.emptyHint')}</div>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              visible.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-g20/40 last:border-0 transition-colors',
                    i % 2 === 0
                      ? 'bg-white dark:bg-panel-mid'
                      : 'bg-ivory dark:bg-panel',
                    onRowClick && 'cursor-pointer hover:bg-teal-light dark:hover:bg-teal-dark/30'
                  )}
                >
                  {columns.map((c, ci) => (
                    <td
                      key={`${c.key}-${ci}`}
                      className={cn(
                        'px-4 py-3 text-ink dark:text-ivory align-middle',
                        c.align === 'right' && 'text-right',
                        c.align === 'center' && 'text-center'
                      )}
                    >
                      {c.render ? c.render(row) : String(row[c.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-g20/60 bg-white dark:bg-panel-mid">
          <span className="text-xs text-g40 dark:text-g60">
            {t('common.page')} {page} {t('common.of')} {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs rounded-input border border-g20 disabled:opacity-50"
            >
              {t('common.previous')}
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs rounded-input border border-g20 disabled:opacity-50"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

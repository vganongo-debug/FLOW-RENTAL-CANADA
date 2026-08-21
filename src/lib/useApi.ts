import { useEffect, useState } from 'react'

/**
 * Minimal data-fetching hook for the mock API layer.
 * If we switch to a real backend, this can be replaced wholesale by
 * @tanstack/react-query with no caller changes (same return shape).
 *
 *   const { data, loading, error, refetch } = useApi(() => api.hotels.listRooms())
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fetcher()
      .then((r) => { if (alive) { setData(r); setLoading(false) } })
      .catch((err) => { if (alive) { setError(err); setLoading(false) } })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  return { data, loading, error, refetch: () => setTick((t) => t + 1) }
}

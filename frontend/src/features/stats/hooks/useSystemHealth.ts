import { useState, useCallback, useEffect } from 'react'
import { getStatus, type Status } from '../api'
import { usePolling } from '../../../hooks/usePolling'
import { useWindowFocus } from '../../../hooks/useWindowFocus'

function useNowTick(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
  return `${m}m`
}

export interface SystemHealthViewModel {
  loading: boolean
  uptimeLabel: string | null
  uptimeSeconds: number
  cacheHitRate: number
  blockRate: number
  elapsedLabel: string
}

export function useSystemHealth(): SystemHealthViewModel {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const now = useNowTick(1000)

  const fetch = useCallback(async () => {
    try {
      const data = await getStatus()
      setStatus(data)
      setLastChecked(new Date())
    } catch {
      // keep last known values
    } finally {
      setLoading(false)
    }
  }, [])

  usePolling(fetch, 3000)
  useWindowFocus(fetch)

  const ch = status?.cache_hits ?? 0
  const cm = status?.cache_misses ?? 0
  const cacheHitRate = (ch + cm) > 0 ? Math.round((ch / (ch + cm)) * 100) : 0

  const totalQueries = (status?.queries_forwarded ?? 0) + (status?.queries_blocked ?? 0) + (status?.queries_cached ?? 0)
  const blockRate = totalQueries > 0 ? Math.round(((status?.queries_blocked ?? 0) / totalQueries) * 100) : 0

  const uptimeLabel = loading ? null : formatUptime(status?.uptime_seconds ?? 0)

  const elapsedLabel = (() => {
    if (!lastChecked) return 'Checking…'
    const sec = Math.floor((now.getTime() - lastChecked.getTime()) / 1000)
    if (sec < 5) return 'Last checked: just now'
    if (sec < 60) return `Last checked: ${sec}s ago`
    return `Last checked: ${Math.floor(sec / 60)}m ago`
  })()

  const uptimeSeconds = status?.uptime_seconds ?? 0

  return { loading, uptimeLabel, uptimeSeconds, cacheHitRate, blockRate, elapsedLabel }
}

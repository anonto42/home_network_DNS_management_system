import { useState } from 'react'
import { getStatus, type Status } from '../api'
import { usePolling } from '../../../hooks/usePolling'
import { Card } from '../../../components/ui/Card'

function fmtUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function StatsCards() {
  const [stats, setStats] = useState<Status>({
    queries_forwarded: 0,
    queries_blocked: 0,
    queries_custom: 0,
    queries_cached: 0,
    cache_size: 0,
    cache_hits: 0,
    cache_misses: 0,
    uptime_seconds: 0,
  })

  usePolling(async () => {
    try {
      setStats(await getStatus())
    } catch {}
  }, 3000)

  const total = stats.cache_hits + stats.cache_misses
  const hitRate = total > 0 ? Math.round((stats.cache_hits / total) * 100) : 0

  const cards = [
    { label: 'Total Queries', value: stats.queries_forwarded, color: 'text-primary', icon: 'query_stats' },
    { label: 'Queries Blocked', value: stats.queries_blocked, color: 'text-error', icon: 'block' },
    { label: 'Percent Blocked', value: `${hitRate}%`, color: 'text-secondary', icon: 'percent' },
    { label: 'Domains on Adlist', value: stats.cache_size, color: 'text-tertiary', icon: 'list' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
      {cards.map((c) => (
        <Card key={c.label}>
          <div className="flex justify-between items-start mb-md">
            <div className={`p-sm bg-surface-container rounded-lg`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
            </div>
          </div>
          <h3 className="font-label-md text-on-surface-variant mb-xs">{c.label}</h3>
          <p className={`font-headline-md text-headline-md text-on-surface ${c.color}`}>{c.value.toLocaleString()}</p>
        </Card>
      ))}
    </div>
  )
}

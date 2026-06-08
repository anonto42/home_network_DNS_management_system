import { useState } from 'react'
import { getStatus, type Status } from '../api'
import { usePolling } from '../../../hooks/usePolling'
import { Card } from '../../../components/ui/Card'

export const StatCard: React.FC<{ label: string, value: string | number, color: string, icon: string, trend?: string }> = ({ label, value, color, icon, trend }) => (
  <Card>
    <div className="flex justify-between items-start mb-md">
      <div className={`p-sm bg-surface-container rounded-lg ${color.replace('text-', 'text-')}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      {trend && <span className="text-secondary font-label-sm bg-secondary-container px-sm py-xs rounded-full">{trend}</span>}
    </div>
    <h3 className="font-label-md text-on-surface-variant mb-xs">{label}</h3>
    <p className={`font-headline-md text-headline-md text-on-surface ${color}`}>{value}</p>
  </Card>
);

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
      <StatCard label="Total Queries" value={stats.queries_forwarded.toLocaleString()} color="text-primary" icon="query_stats" trend="+12%" />
      <StatCard label="Queries Blocked" value={stats.queries_blocked.toLocaleString()} color="text-error" icon="block" trend="+4.2%" />
      <StatCard label="Percent Blocked" value={`${hitRate}%`} color="text-secondary" icon="percent" trend="Stable" />
      <StatCard label="Domains on Adlist" value={stats.cache_size.toLocaleString()} color="text-tertiary" icon="list" trend="Updated 2h ago" />
    </div>
  )
}

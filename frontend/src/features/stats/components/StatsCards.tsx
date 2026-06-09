import { useState } from 'react'
import { getStatus, type Status } from '../api'
import { usePolling } from '../../../hooks/usePolling'

export const StatCard: React.FC<{ label: string, value: string | number, icon: string, iconBg: string, iconColor: string, trend?: string, trendBg?: string, trendColor?: string }> = ({ label, value, icon, iconBg, iconColor, trend, trendBg = 'bg-secondary-container', trendColor = 'text-secondary' }) => (
  <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-lg transition-shadow duration-300">
    <div className="flex justify-between items-start mb-md">
      <div className={`p-sm ${iconBg} ${iconColor} rounded-lg`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      {trend && <span className={`${trendColor} font-label-sm text-label-sm ${trendBg} px-sm py-xs rounded-full`}>{trend}</span>}
    </div>
    <h3 className="font-label-md text-label-md text-on-surface-variant mb-xs">{label}</h3>
    <p className="font-headline-md text-headline-md text-on-surface">{value}</p>
  </div>
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

  const qf = stats.queries_forwarded ?? 0
  const qb = stats.queries_blocked ?? 0
  const cs = stats.cache_size ?? 0
  const total = qf + qb
  const percentBlocked = total > 0 ? Math.round((qb / total) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
      <StatCard label="Total Queries" value={qf.toLocaleString()} icon="query_stats" iconBg="bg-primary-fixed" iconColor="text-primary" trend="+12%" />
      <StatCard label="Queries Blocked" value={qb.toLocaleString()} icon="block" iconBg="bg-error-container" iconColor="text-error" trend="+4.2%" trendBg="bg-error-container" trendColor="text-error" />
      <StatCard label="Percent Blocked" value={`${percentBlocked}%`} icon="percent" iconBg="bg-secondary-fixed" iconColor="text-secondary" trend="Stable" trendBg="bg-surface-container" trendColor="text-on-surface-variant" />
      <StatCard label="Domains on Adlist" value={cs.toLocaleString()} icon="list" iconBg="bg-tertiary-fixed" iconColor="text-tertiary" trend="Updated 2h ago" trendBg="bg-surface-container" trendColor="text-on-surface-variant" />
    </div>
  )
}

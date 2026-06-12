import { useState, useCallback } from 'react'
import { Activity, Ban, Percent, Database } from 'lucide-react'
import { getStatus, type Status } from '../api'
import { usePolling } from '../../../hooks/usePolling'
import { useWindowFocus } from '../../../hooks/useWindowFocus'
import { StatCard, StatsGrid } from '@/components/ui/stat-card'

export default function StatsCards() {
  const [stats, setStats] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const data = await getStatus()
      if (data) {
        setStats(data)
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }, [])

  usePolling(fetchStats, 3000)
  useWindowFocus(fetchStats)

  const qf = stats?.queries_forwarded ?? 0
  const qb = stats?.queries_blocked ?? 0
  const qc = stats?.queries_cached ?? 0
  const cs = stats?.cache_size ?? 0
  const ch = stats?.cache_hits ?? 0
  const cm = stats?.cache_misses ?? 0
  const total = qf + qb + qc

  const percentBlocked  = total > 0 ? (qb / total) * 100 : 0
  const percentAllowed  = total > 0 ? (qf / total) * 100 : 0
  const cacheHitRate    = (ch + cm) > 0 ? (ch / (ch + cm)) * 100 : 0

  const fmt = (n: number) => n.toLocaleString()
  const pct = (n: number) => `${Math.round(n)}%`

  return (
    <StatsGrid columns={4} className="mb-8">
      <StatCard
        loading={loading}
        label="Total Queries"
        value={fmt(total)}
        sub={`${fmt(qf)} allowed · ${fmt(qc)} cached`}
        icon={Activity}
        bg="bg-primary/10 text-primary"
        progressColor="bg-primary"
        progress={total > 0 ? 100 : 0}
      />
      <StatCard
        loading={loading}
        label="Queries Blocked"
        value={fmt(qb)}
        sub={total > 0 ? `${pct(percentBlocked)} of all queries` : 'no queries yet'}
        icon={Ban}
        bg="bg-rose-500/10 text-rose-500"
        progressColor="bg-rose-500"
        progress={percentBlocked}
      />
      <StatCard
        loading={loading}
        label="Percent Blocked"
        value={pct(percentBlocked)}
        sub={total > 0 ? `${fmt(total)} total · ${pct(percentAllowed)} allowed` : 'no queries yet'}
        icon={Percent}
        bg="bg-amber-500/10 text-amber-500"
        progressColor="bg-amber-500"
        progress={percentBlocked}
      />
      <StatCard
        loading={loading}
        label="Cache Size"
        value={fmt(cs)}
        sub={`${pct(cacheHitRate)} hit rate · ${fmt(ch)} hits`}
        icon={Database}
        bg="bg-emerald-500/10 text-emerald-500"
        progressColor="bg-emerald-500"
        progress={cacheHitRate}
      />
    </StatsGrid>
  )
}

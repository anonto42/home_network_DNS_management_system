import { useState, useCallback } from 'react'
import { Activity, Ban, Percent, Database } from 'lucide-react'
import { getStatus, type Status } from '../api'
import { usePolling } from '../../../hooks/usePolling'
import { useWindowFocus } from '../../../hooks/useWindowFocus'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  label: string
  value: string
  sub: string
  icon: React.ElementType
  accent: string
  loading?: boolean
  bar?: number
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon: Icon, accent, loading, bar }) => {
  if (loading) {
    return (
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-1.5 w-full" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <div className={`p-2 ${accent}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <h3 className="text-3xl font-bold tracking-tight text-foreground mb-3">{value}</h3>
        {bar !== undefined && (
          <div className="h-1 bg-muted mb-3 overflow-hidden">
            <div
              className={`h-full ${accent.replace('/10', '').replace('text-', 'bg-').split(' ')[0]} transition-all duration-700`}
              style={{ width: `${Math.max(2, bar)}%` }}
            />
          </div>
        )}
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{sub}</p>
      </CardContent>
    </Card>
  )
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
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const data = await getStatus()
      if (data) { setStats(data); setLoading(false) }
    } catch {
      setLoading(false)
    }
  }, [])

  usePolling(fetchStats, 3000)
  useWindowFocus(fetchStats)

  const qf = stats.queries_forwarded ?? 0
  const qb = stats.queries_blocked ?? 0
  const qc = stats.queries_cached ?? 0
  const cs = stats.cache_size ?? 0
  const ch = stats.cache_hits ?? 0
  const cm = stats.cache_misses ?? 0
  const total = qf + qb + qc
  const percentBlocked = total > 0 ? Math.round((qb / total) * 100) : 0
  const cacheHitRate = (ch + cm) > 0 ? Math.round((ch / (ch + cm)) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        loading={loading}
        label="Total Queries"
        value={total.toLocaleString()}
        sub={`${qf.toLocaleString()} allowed · ${qc.toLocaleString()} cached`}
        icon={Activity}
        accent="bg-primary/10 text-primary"
        bar={100}
      />
      <StatCard
        loading={loading}
        label="Queries Blocked"
        value={qb.toLocaleString()}
        sub={total > 0 ? `${percentBlocked}% of all queries` : 'no queries yet'}
        icon={Ban}
        accent="bg-rose-500/10 text-rose-500"
        bar={percentBlocked}
      />
      <StatCard
        loading={loading}
        label="Percent Blocked"
        value={`${percentBlocked}%`}
        sub={total > 0 ? `${total.toLocaleString()} total queries` : 'no queries yet'}
        icon={Percent}
        accent="bg-amber-500/10 text-amber-500"
        bar={percentBlocked}
      />
      <StatCard
        loading={loading}
        label="Cache Size"
        value={cs.toLocaleString()}
        sub={`${cacheHitRate}% hit rate · ${ch} hits`}
        icon={Database}
        accent="bg-emerald-500/10 text-emerald-500"
        bar={cacheHitRate}
      />
    </div>
  )
}

import { useState, useCallback } from 'react'
import { Activity, Ban, Percent, List } from 'lucide-react'
import { getStatus, type Status } from '../api'
import { usePolling } from '../../../hooks/usePolling'
import { useWindowFocus } from '../../../hooks/useWindowFocus'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  sub?: string
  loading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, sub, loading }) => {
  if (loading) {
    return (
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
              {sub && <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{sub}</p>}
            </div>
          </div>
        </div>
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

  const qf = stats.queries_forwarded ?? 0
  const qb = stats.queries_blocked ?? 0
  const qc = stats.queries_cached ?? 0
  const cs = stats.cache_size ?? 0
  const total = qf + qb + qc
  const percentBlocked = total > 0 ? Math.round((qb / total) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard loading={loading} label="Total Queries"   value={total.toLocaleString()} icon={Activity} />
      <StatCard loading={loading} label="Queries Blocked" value={qb.toLocaleString()}    icon={Ban} />
      <StatCard loading={loading} label="Percent Blocked" value={`${percentBlocked}%`}   icon={Percent} />
      <StatCard loading={loading} label="Cache Size"      value={cs.toLocaleString()}    icon={List} sub="entries cached" />
    </div>
  )
}

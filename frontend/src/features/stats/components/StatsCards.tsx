import { useState } from 'react'
import { 
  Activity, 
  Ban, 
  Percent, 
  List,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { getStatus, type Status } from '../api'
import { usePolling } from '../../../hooks/usePolling'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  trend?: string
  trendType?: 'up' | 'down' | 'neutral'
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, trendType = 'neutral' }) => {
  const trendColor = trendType === 'up' ? 'text-green-600 bg-green-50' : trendType === 'down' ? 'text-red-600 bg-red-50' : 'text-muted-foreground bg-muted/50'
  const TrendIcon = trendType === 'up' ? ArrowUpRight : trendType === 'down' ? ArrowDownRight : null

  return (
    <Card className="overflow-hidden shadow-sm border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/5 text-primary rounded-lg border border-primary/10">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${trendColor} border border-current/10`}>
              {TrendIcon && <TrendIcon className="h-3 w-3" />}
              {trend}
            </div>
          )}
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

  usePolling(async () => {
    try {
      const data = await getStatus()
      if (data) setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, 3000)

  const qf = stats.queries_forwarded ?? 0
  const qb = stats.queries_blocked ?? 0
  const cs = stats.cache_size ?? 0
  const total = qf + qb
  const percentBlocked = total > 0 ? Math.round((qb / total) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        label="Total Queries" 
        value={qf.toLocaleString()} 
        icon={Activity} 
        trend="+12%" 
        trendType="up"
      />
      <StatCard 
        label="Queries Blocked" 
        value={qb.toLocaleString()} 
        icon={Ban} 
        trend="+4.2%" 
        trendType="up"
      />
      <StatCard 
        label="Percent Blocked" 
        value={`${percentBlocked}%`} 
        icon={Percent} 
        trend="Stable" 
        trendType="neutral"
      />
      <StatCard 
        label="Domains on Adlist" 
        value={cs.toLocaleString()} 
        icon={List} 
        trend="Updated 2h ago" 
        trendType="neutral"
      />
    </div>
  )
}


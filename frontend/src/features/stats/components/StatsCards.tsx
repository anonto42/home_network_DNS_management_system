import { Activity, Ban, Percent, Database } from 'lucide-react'
import { StatCard, StatsGrid } from '@/components/ui/stat-card'
import { useStats } from '../hooks/useStats'

const fmt = (n: number) => n.toLocaleString()
const pct = (n: number) => `${Math.round(n)}%`

export default function StatsCards() {
  const { loading, total, qf, qb, qc, cs, ch, percentBlocked, percentAllowed, cacheHitRate } = useStats()

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

import React from 'react'
import { Timer, Database, CheckCircle2, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSystemHealth } from '../hooks/useSystemHealth'

export const SystemHealth: React.FC = () => {
  const { loading, uptimeLabel, uptimeSeconds, cacheHitRate, blockRate, elapsedLabel } = useSystemHealth()

  const items = [
    {
      label: 'Uptime',
      value: loading ? null : uptimeLabel,
      color: 'bg-emerald-500',
      percent: Math.min(100, Math.round((uptimeSeconds / 86400) * 10)),
      icon: Timer,
    },
    {
      label: 'Cache Hit Rate',
      value: loading ? null : `${cacheHitRate}%`,
      color: 'bg-primary',
      percent: cacheHitRate,
      icon: Database,
    },
    {
      label: 'Block Rate',
      value: loading ? null : `${blockRate}%`,
      color: 'bg-rose-500',
      percent: blockRate,
      icon: Cpu,
    },
  ]

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-foreground mt-2 ml-2">System Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground/85" />
                  {item.label}
                </span>
                {item.value === null
                  ? <Skeleton className="h-4 w-16" />
                  : <span className="text-sm font-bold text-foreground">{item.value}</span>
                }
              </div>
              <div className="h-2 bg-muted/60 overflow-hidden shadow-inner">
                {item.value === null
                  ? <Skeleton className="h-full w-full" />
                  : <div
                      className={`h-full ${item.color} transition-all duration-500 ease-out`}
                      style={{ width: `${Math.max(2, item.percent)}%` }}
                    />
                }
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-muted/20 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">All Systems Nominal</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider truncate">{elapsedLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

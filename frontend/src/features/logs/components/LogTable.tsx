import { useState } from 'react'
import { 
  Laptop, 
  Smartphone, 
  Router, 
  Monitor, 
  Cloud, 
  Copy, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'
import { getLogs, type QueryLog } from '../api'
import { usePolling } from '../../../hooks/usePolling'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
  forwarded: { variant: 'secondary', label: 'Allowed' },
  blocked: { variant: 'destructive', label: 'Blocked' },
  custom: { variant: 'outline', label: 'Custom' },
  cached: { variant: 'default', label: 'Cached' },
}

const clientIcons: Record<string, React.ElementType> = {
  '192.168.1.45': Laptop,
  '192.168.1.102': Smartphone,
  '192.168.1.1': Router,
  '192.168.1.12': Monitor,
  '10.0.4.19': Cloud,
}

function getClientIcon(ip: string): React.ElementType {
  return clientIcons[ip] || Laptop
}

interface Props {
  compact?: boolean
}

export default function LogTable({ compact }: Props) {
  const [logs, setLogs] = useState<QueryLog[]>([])
  const [filter, setFilter] = useState<'all' | 'blocked' | 'allowed'>('all')

  usePolling(async () => {
    try {
      const data = await getLogs()
      if (data) setLogs(data)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }, 3000)

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(l => {
        if (filter === 'blocked') return l.action === 'blocked'
        return l.action === 'forwarded' || l.action === 'cached' || l.action === 'custom'
      })

  const showFilters = !compact

  return (
    <Card className="overflow-hidden shadow-sm border-border/50">
      {showFilters && (
        <CardHeader className="pb-4 border-b border-border/50 bg-muted/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">Query Logs</CardTitle>
            <div className="flex bg-muted/50 p-1 rounded-lg w-fit border border-border/30">
              {(['all', 'blocked', 'allowed'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={`px-4 h-7 text-[10px] font-bold uppercase tracking-wider ${filter === f ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      )}
      {compact && (
        <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between bg-muted/5">
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">Recent Queries</CardTitle>
          <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold uppercase tracking-widest text-primary">View All</Button>
        </CardHeader>
      )}
      <div className="overflow-x-auto p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 border-b border-border/50">
              <TableHead className="w-[180px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Timestamp</TableHead>
              {!compact && <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Client</TableHead>}
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Domain</TableHead>
              {!compact && <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</TableHead>}
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!filteredLogs || filteredLogs.length === 0) ? (
              <TableRow>
                <TableCell colSpan={compact ? 3 : 5} className="h-24 text-center text-muted-foreground text-sm font-medium">
                  No queries yet. Make a DNS request to see it here.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.slice(0, compact ? 5 : undefined).map((l) => {
                const config = statusConfig[l.action || 'forwarded'] || statusConfig.forwarded
                const ClientIcon = getClientIcon(l.client_ip || '')
                return (
                  <TableRow key={l.id} className="group transition-all duration-200 hover:bg-muted/50 hover:shadow-sm">
                    <TableCell className="font-mono text-[10px] text-muted-foreground/80">
                      {compact
                        ? new Date(l.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : new Date(l.timestamp || '').toLocaleString()
                      }
                    </TableCell>
                    {!compact && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ClientIcon className="h-3.5 w-3.5 text-primary opacity-80" />
                          <span className="text-xs font-bold text-foreground">{l.client_ip}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center justify-between group/cell">
                        <span className={`font-mono text-xs truncate max-w-[120px] sm:max-w-[200px] font-medium ${l.action === 'blocked' ? 'text-destructive' : 'text-primary'}`}>
                          {l.domain}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                    {!compact && (
                      <TableCell className="text-[10px] font-bold text-muted-foreground uppercase">
                        {l.action === 'forwarded' ? 'A (IPv4)' : l.action === 'blocked' ? 'HTTPS' : l.action === 'cached' ? 'A (IPv4)' : 'TXT'}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Badge variant={config.variant} className="uppercase text-[9px] font-bold px-2 py-0 border-none">
                        {config.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      {!compact && (
        <div className="p-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Showing <span className="text-foreground">1-{Math.min(filteredLogs.length, 50)}</span> of <span className="text-foreground">{filteredLogs.length}</span> queries
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-border/50" disabled>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" className="h-7 px-3 text-[10px] font-bold rounded-md">1</Button>
            <Button variant="ghost" size="sm" className="h-7 px-3 text-[10px] font-bold text-muted-foreground hover:text-foreground">2</Button>
            <Button variant="ghost" size="sm" className="h-7 px-3 text-[10px] font-bold text-muted-foreground hover:text-foreground">3</Button>
            <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-border/50">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}


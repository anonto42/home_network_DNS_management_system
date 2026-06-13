import { Trash2, Globe } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableEmptyState } from '@/components/ui/table-empty-state'
import { SearchInput } from '@/components/ui/search-input'
import { CardTableHeader } from '@/components/ui/card-table-header'
import { ACTION_COLORS, type SteeringRule } from '../types'

interface Props {
  loading: boolean
  filteredRules: SteeringRule[]
  rules: SteeringRule[]
  activeCount: number
  search: string
  onSearchChange: (v: string) => void
  onDelete: (id: number) => void
  onToggle: (rule: SteeringRule) => void
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i} className={i % 2 === 1 ? 'bg-muted/[0.15]' : ''}>
          <TableCell className="pl-4"><Skeleton className="h-3 w-6" /></TableCell>
          <TableCell><Skeleton className="h-3 w-36" /></TableCell>
          <TableCell><Skeleton className="h-3 w-28" /></TableCell>
          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
          <TableCell><Skeleton className="h-5 w-9" /></TableCell>
          <TableCell className="pr-4"><Skeleton className="h-7 w-7 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function SteeringTable({ loading, filteredRules, rules, activeCount, search, onSearchChange, onDelete, onToggle }: Props) {
  return (
    <Card className="overflow-hidden shadow-sm glass-panel rounded-lg" data-tour="traffic-steering-list">
      <CardTableHeader
        title="Steering Rules"
        subtitle="Evaluated in priority order — #1 runs first. Toggle to enable or disable without deleting."
        actions={
          <>
            <SearchInput value={search} onChange={onSearchChange} placeholder="Search rules..." />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
              {activeCount} active / {rules.length} total
            </span>
          </>
        }
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 border-b border-border">
              <TableHead className="pl-6 w-[70px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5">#</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5">Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5">Condition</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5">Action</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[100px] py-3.5">Status</TableHead>
              <TableHead className="pr-6 w-[80px] py-3.5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <SkeletonRows /> : filteredRules.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                icon={Globe}
                primaryText={search ? 'No matches found' : 'No steering rules yet'}
                secondaryText={search ? 'Try adjusting your search query' : 'Click "New Rule" to start routing DNS traffic'}
              />
            ) : filteredRules.map((rule, idx) => (
              <TableRow
                key={rule.id}
                className={`group transition-colors hover:bg-muted/20 border-b border-border ${idx % 2 === 1 ? 'bg-muted/[0.08]' : ''}`}
              >
                <TableCell className="pl-6 py-3">
                  <span className="text-[10px] font-bold text-muted-foreground tabular-nums">#{rule.priority}</span>
                </TableCell>
                <TableCell className="py-3">
                  <span className={`text-sm font-semibold ${rule.enabled ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                    {rule.name}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/60 px-2 py-0.5 rounded shrink-0">
                      {rule.condition_type}
                    </span>
                    <span className="font-mono text-[12px] text-foreground font-semibold">{rule.condition_value}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[9px] font-bold px-2 py-0.5 border-none rounded-md shrink-0 ${ACTION_COLORS[rule.action_type] || ACTION_COLORS['Forward']}`}>
                      {rule.action_type}
                    </Badge>
                    {rule.action_target && (
                      <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[120px]">→ {rule.action_target}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Switch checked={rule.enabled} onCheckedChange={() => onToggle(rule)} size="sm" />
                </TableCell>
                <TableCell className="pr-6 text-right py-3">
                  <Button
                    variant="ghost" size="icon"
                    className="h-7.5 w-7.5 opacity-0 group-hover:opacity-100 transition-all duration-200 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
                    onClick={() => onDelete(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

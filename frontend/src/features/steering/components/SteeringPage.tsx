import {
  PlusCircle,
  Trash2,
  Gauge,
  Globe,
  Power,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ACTION_COLORS } from '../types'
import { useSteeringRules } from '../hooks/useSteeringRules'
import SteeringRuleModal from './SteeringRuleModal'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard, StatsGrid } from '@/components/ui/stat-card'
import { SearchInput } from '@/components/ui/search-input'

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

export default function SteeringPage() {
  const {
    rules, filteredRules, loading, saving, activeCount, search, setSearch,
    deleteTarget, setDeleteTarget, deleteRule,
    showForm, setShowForm, resetForm,
    name, setName,
    conditionType, setConditionType,
    conditionValue, setConditionValue,
    actionType, setActionType,
    actionTarget, setActionTarget,
    priority, setPriority,
    handleAdd, toggleRule,
  } = useSteeringRules()

  const pageActions = (
    <Button
      className="w-full sm:w-auto shrink-0 gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm btn-premium glow-primary rounded-sm"
      onClick={() => setShowForm(true)}
    >
      <PlusCircle className="h-4 w-4" /> New Rule
    </Button>
  )

  return (
    <div className="w-full space-y-6 md:space-y-8">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete steering rule?"
        description="This rule will be permanently removed and no longer applied to DNS traffic."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteTarget !== null && deleteRule(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {showForm && (
        <SteeringRuleModal
          name={name} setName={setName}
          conditionType={conditionType} setConditionType={setConditionType}
          conditionValue={conditionValue} setConditionValue={setConditionValue}
          actionType={actionType} setActionType={setActionType}
          actionTarget={actionTarget} setActionTarget={setActionTarget}
          priority={priority} setPriority={setPriority}
          saving={saving}
          onSubmit={handleAdd}
          onClose={resetForm}
        />
      )}

      {/* Header */}
      <PageHeader
        title="Traffic Steering"
        description="Define routing rules to control how DNS traffic is resolved across your network."
        actions={pageActions}
      />

      {/* Stat cards */}
      <StatsGrid columns={3}>
        <StatCard
          label="Total Rules"
          value={loading ? null : rules.length}
          icon={Globe}
          bg="bg-primary/10 text-primary"
        />
        <StatCard
          label="Active Rules"
          value={loading ? null : activeCount}
          icon={Gauge}
          bg="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          label="Disabled Rules"
          value={loading ? null : rules.length - activeCount}
          icon={Power}
          bg="bg-muted text-muted-foreground"
        />
      </StatsGrid>

      {/* Rules table */}
      <Card className="overflow-hidden shadow-sm glass-panel rounded-lg" data-tour="traffic-steering-list">
        <CardHeader className="pb-3 bg-muted/10 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Steering Rules</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                Evaluated in priority order — #1 runs first. Toggle to enable or disable without deleting.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search rules..."
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
                {activeCount} active / {rules.length} total
              </span>
            </div>
          </div>
        </CardHeader>
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
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
                      <Globe className="h-8 w-8 opacity-40 animate-pulse" />
                      <div>
                        <p className="text-sm font-medium">{search ? 'No matches found' : 'No steering rules yet'}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {search ? 'Try adjusting your search query' : 'Click "New Rule" to start routing DNS traffic'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
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
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(_checked) => toggleRule(rule)}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="pr-6 text-right py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7.5 w-7.5 opacity-0 group-hover:opacity-100 transition-all duration-200 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
                      onClick={() => setDeleteTarget(rule.id)}
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
    </div>
  )
}

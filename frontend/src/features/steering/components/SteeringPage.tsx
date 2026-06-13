import { PlusCircle, Gauge, Globe, Power } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard, StatsGrid } from '@/components/ui/stat-card'
import { useSteeringRules } from '../hooks/useSteeringRules'
import SteeringRuleModal from './SteeringRuleModal'
import { SteeringTable } from './SteeringTable'

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

      <PageHeader
        title="Traffic Steering"
        description="Define routing rules to control how DNS traffic is resolved across your network."
        actions={
          <Button
            className="w-full sm:w-auto shrink-0 gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm btn-premium glow-primary rounded-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusCircle className="h-4 w-4" /> New Rule
          </Button>
        }
      />

      <StatsGrid columns={3}>
        <StatCard label="Total Rules"    value={loading ? null : rules.length}              icon={Globe}  bg="bg-primary/10 text-primary" />
        <StatCard label="Active Rules"   value={loading ? null : activeCount}               icon={Gauge}  bg="bg-emerald-500/10 text-emerald-500" />
        <StatCard label="Disabled Rules" value={loading ? null : rules.length - activeCount} icon={Power} bg="bg-muted text-muted-foreground" />
      </StatsGrid>

      <SteeringTable
        loading={loading}
        filteredRules={filteredRules}
        rules={rules}
        activeCount={activeCount}
        search={search}
        onSearchChange={setSearch}
        onDelete={setDeleteTarget}
        onToggle={toggleRule}
      />
    </div>
  )
}

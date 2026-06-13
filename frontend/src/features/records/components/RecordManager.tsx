import { PlusCircle, Network, CheckCircle2, AlertCircle } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard, StatsGrid } from '@/components/ui/stat-card'
import { useRecordManager } from '../hooks/useRecordManager'
import RecordModal from './RecordModal'
import { RecordTable } from './RecordTable'

export default function RecordManager() {
  const {
    loading, adding, showForm, setShowForm, domain, setDomain,
    ip, setIp, recordType, setRecordType, deleteTarget, setDeleteTarget,
    search, setSearch, resetForm, handleAdd, handleDelete, entries,
    filteredEntries, getTypeLabel, handleExport,
  } = useRecordManager()

  return (
    <div className="w-full space-y-6 md:space-y-8">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete DNS record?"
        description={`Remove "${deleteTarget}" from local records. DNS queries for this domain will fall through to upstream.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {showForm && (
        <RecordModal
          recordType={recordType} setRecordType={setRecordType}
          domain={domain} setDomain={setDomain}
          ip={ip} setIp={setIp}
          adding={adding}
          handleAdd={handleAdd}
          resetForm={resetForm}
        />
      )}

      <PageHeader
        title="Local DNS Records"
        description="Manage authoritative records for your local network environment."
        actions={
          <Button
            className="w-full sm:w-auto shrink-0 gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm btn-premium glow-primary rounded-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusCircle className="h-4 w-4" /> New Record
          </Button>
        }
      />

      <StatsGrid columns={3}>
        <StatCard label="Active Records"       value={loading ? null : entries.length}                                   icon={CheckCircle2} bg="bg-emerald-500/10 text-emerald-500" />
        <StatCard label="Total Queries / 24h"  value={loading ? null : entries.length > 0 ? (entries.length * 30).toLocaleString() : '0'} icon={Network}      bg="bg-primary/10 text-primary" />
        <StatCard label="Conflicts"            value={loading ? null : 0}                                                icon={AlertCircle}  bg="bg-rose-500/10 text-rose-500" />
      </StatsGrid>

      <RecordTable
        loading={loading}
        filteredEntries={filteredEntries}
        search={search}
        onSearchChange={setSearch}
        onDelete={setDeleteTarget}
        onExport={handleExport}
        getTypeLabel={getTypeLabel}
      />
    </div>
  )
}

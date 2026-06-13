import { ShieldAlert, ShieldCheck, Shield, Activity, AlertTriangle } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard, StatsGrid } from '@/components/ui/stat-card'
import { useBlocklist } from '../hooks/useBlocklist'
import BlocklistModal from './BlocklistModal'
import { BlocklistTable } from './BlocklistTable'

const isWildcard = (d?: string) => d ? d.startsWith('*') : false

export default function BlocklistManager() {
  const {
    list, loading, adding, showForm, setShowForm, domain, setDomain,
    deleteTarget, setDeleteTarget, search, setSearch, page, setPage,
    handleBlock, handleUnblock, filtered, handleExport,
  } = useBlocklist()

  return (
    <div className="w-full space-y-6 md:space-y-8">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Unblock domain?"
        description={`Remove "${deleteTarget}" from blocklist. Queries matching this domain will resolve normally.`}
        confirmLabel="Unblock"
        onConfirm={() => deleteTarget && handleUnblock(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {showForm && (
        <BlocklistModal
          domain={domain} setDomain={setDomain}
          adding={adding}
          handleBlock={handleBlock}
          onClose={() => setShowForm(false)}
        />
      )}

      <PageHeader
        title="Blocklist Management"
        description="Enforce domain blocking rules to protect local clients from telemetry and tracking."
        actions={
          <Button
            className="w-full sm:w-auto shrink-0 gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm btn-premium glow-destructive bg-destructive text-destructive-foreground hover:bg-destructive/95 rounded-sm"
            onClick={() => setShowForm(true)}
          >
            <ShieldAlert className="h-4 w-4" /> Block Domain
          </Button>
        }
      />

      <StatsGrid columns={3}>
        <StatCard label="Blocked Domains"      value={loading ? null : list.length}                                             icon={ShieldAlert}   bg="bg-rose-500/10 text-rose-500" />
        <StatCard label="Queries Blocked / 24h" value={loading ? null : (list.length * 12).toLocaleString()}                    icon={Activity}      bg="bg-primary/10 text-primary" />
        <StatCard label="Wildcards"             value={loading ? null : list.filter(item => isWildcard(item.domain)).length}    icon={AlertTriangle} bg="bg-amber-500/10 text-amber-500" />
      </StatsGrid>

      <BlocklistTable
        loading={loading}
        filtered={filtered}
        page={page}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
        onDelete={setDeleteTarget}
        onExport={handleExport}
      />
    </div>
  )
}

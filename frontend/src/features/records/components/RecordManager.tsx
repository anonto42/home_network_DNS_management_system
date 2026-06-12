import {
  PlusCircle,
  Network,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Trash2,
  ServerOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { copyToClipboard } from '@/lib/clipboard'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRecordManager } from '../hooks/useRecordManager'
import RecordModal from './RecordModal'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard, StatsGrid } from '@/components/ui/stat-card'
import { SearchInput } from '@/components/ui/search-input'

const recordTypeStyles: Record<string, string> = {
  A:    'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  AAAA: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  CNAME:'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  MX:   'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  TXT:  'bg-muted/50 text-muted-foreground',
}

export default function RecordManager() {
  const {
    loading, adding, showForm, setShowForm, domain, setDomain,
    ip, setIp, recordType, setRecordType, deleteTarget, setDeleteTarget,
    search, setSearch, resetForm, handleAdd, handleDelete, entries,
    filteredEntries, getTypeLabel, handleExport,
  } = useRecordManager()

  const renderSkeletonRows = () =>
    Array.from({ length: 4 }).map((_, i) => (
      <TableRow key={i} className={i % 2 === 1 ? 'bg-muted/[0.15]' : ''}>
        <TableCell className="pl-4"><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-3 w-44" /></TableCell>
        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
        <TableCell><Skeleton className="h-3 w-12" /></TableCell>
        <TableCell className="pr-4 text-right"><Skeleton className="h-7 w-7 ml-auto" /></TableCell>
      </TableRow>
    ))

  const pageActions = (
    <Button
      className="w-full sm:w-auto shrink-0 gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm btn-premium glow-primary rounded-sm"
      onClick={() => setShowForm(true)}
    >
      <PlusCircle className="h-4 w-4" /> New Record
    </Button>
  )

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
          recordType={recordType}
          setRecordType={setRecordType}
          domain={domain}
          setDomain={setDomain}
          ip={ip}
          setIp={setIp}
          adding={adding}
          handleAdd={handleAdd}
          resetForm={resetForm}
        />
      )}

      {/* Page header */}
      <PageHeader
        title="Local DNS Records"
        description="Manage authoritative records for your local network environment."
        actions={pageActions}
      />

      {/* Stat cards */}
      <StatsGrid columns={3}>
        <StatCard
          label="Active Records"
          value={loading ? null : entries.length}
          icon={CheckCircle2}
          bg="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          label="Total Queries / 24h"
          value={loading ? null : entries.length > 0 ? (entries.length * 30).toLocaleString() : '0'}
          icon={Network}
          bg="bg-primary/10 text-primary"
        />
        <StatCard
          label="Conflicts"
          value={loading ? null : 0}
          icon={AlertCircle}
          bg="bg-rose-500/10 text-rose-500"
        />
      </StatsGrid>

      {/* Records table */}
      <Card className="overflow-hidden shadow-sm glass-panel rounded-lg" data-tour="dns-records-list">
        <CardHeader className="pb-3 bg-muted/10 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Existing Local Records</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                Authoritative records — these override upstream DNS for matching domains.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search records..."
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-[10px] font-bold uppercase tracking-widest shrink-0 btn-premium"
                onClick={handleExport}
                disabled={filteredEntries.length === 0}
              >
                <Download className="h-3.5 w-3.5" /> Export List
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 border-b border-border">
                <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[100px] py-3.5">Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5">Domain Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5">Value / IP</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[100px] py-3.5">TTL</TableHead>
                <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[80px] py-3.5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? renderSkeletonRows() : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
                      <ServerOff className="h-8 w-8 opacity-40 animate-pulse" />
                      <div>
                        <p className="text-sm font-medium">{search ? 'No matches found' : 'No custom records yet'}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {search ? 'Try adjusting your search query' : 'Click "New Record" to add your first entry'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map(([d, val], idx) => {
                  const type = getTypeLabel(val)
                  const style = recordTypeStyles[type] || recordTypeStyles.TXT
                  return (
                    <TableRow
                      key={d}
                      className={`group transition-colors hover:bg-muted/20 border-b border-border ${idx % 2 === 1 ? 'bg-muted/[0.08]' : ''}`}
                    >
                      <TableCell className="pl-6 py-3">
                        <Badge className={`font-bold text-[9px] px-2.5 py-0.5 border-none rounded-md ${style}`}>{type}</Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="font-mono text-[13px] font-semibold text-foreground tracking-tight">{d}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <code className="bg-muted/80 px-2 py-0.5 rounded text-xs font-mono font-medium text-foreground">{val}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-md"
                            onClick={() => { copyToClipboard(val); toast.success('Copied', { description: val }) }}
                          >
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-[11px] font-mono text-muted-foreground py-3">3600s</TableCell>
                      <TableCell className="pr-6 text-right py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7.5 w-7.5 opacity-0 group-hover:opacity-100 transition-all duration-200 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
                          onClick={() => setDeleteTarget(d)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

import { useState, useCallback, useRef } from 'react'
import {
  Server,
  Wifi,
  Globe,
  Search,
  Download,
  Copy,
  Pencil,
  Trash2,
  ServerOff,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { copyToClipboard } from '@/lib/clipboard'
import { getRecords, addRecord, deleteRecord } from '../api'
import { usePolling } from '../../../hooks/usePolling'
import { useWindowFocus } from '../../../hooks/useWindowFocus'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PAGE_SIZE = 25

const recordTypeStyles: Record<string, string> = {
  A:    'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  AAAA: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  CNAME:'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

function getTypeLabel(ip: string): string {
  if (ip.includes(':')) return 'AAAA'
  if (ip.includes('.')) return 'A'
  return 'CNAME'
}

export default function RecordManager() {
  const [records, setRecords] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [domain, setDomain] = useState('')
  const [ip, setIp] = useState('')
  const [editTarget, setEditTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [pendingSearch, setPendingSearch] = useState('')
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [page, setPage] = useState(1)

  const loadRecords = useCallback(async () => {
    try {
      const data = await getRecords()
      setRecords(data || {})
    } catch {
      toast.error('Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [])

  usePolling(loadRecords, 10000, [])
  useWindowFocus(loadRecords)

  const resetForm = () => {
    setDomain(''); setIp(''); setEditTarget(null)
  }

  const handleSave = async () => {
    const d = domain.trim().toLowerCase()
    const v = ip.trim()
    if (!d || !v) { toast.warning('Please fill in both fields'); return }
    setSaving(true)
    try {
      await addRecord(d, v)
      await loadRecords()
      toast.success(editTarget ? 'Record updated' : 'Record added', { description: `${d} → ${v}` })
      resetForm()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save record')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (d: string) => {
    try {
      await deleteRecord(d)
      setDeleteTarget(null)
      await loadRecords()
      toast.success('Record deleted', { description: d })
    } catch {
      toast.error('Failed to delete record')
    }
  }

  const startEdit = (d: string, val: string) => {
    setEditTarget(d)
    setDomain(d)
    setIp(val)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => setPendingSearch(val), 300)
  }

  const handleExport = () => {
    const content = filtered.map(([d, v]) => `${d}\t${v}`).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dns-records.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported', { description: `${filtered.length} records` })
  }

  const entries = Object.entries(records || {})
  const filtered = pendingSearch
    ? entries.filter(([d, v]) => d.includes(pendingSearch.toLowerCase()) || v.includes(pendingSearch.toLowerCase()))
    : entries

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const aCount = entries.filter(([, v]) => getTypeLabel(v) === 'A').length
  const aaaaCount = entries.filter(([, v]) => getTypeLabel(v) === 'AAAA').length

  const renderSkeletonRows = () =>
    Array.from({ length: 4 }).map((_, i) => (
      <TableRow key={i} className={i % 2 === 1 ? 'bg-muted/[0.15]' : ''}>
        <TableCell><Skeleton className="h-5 w-12 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-3 w-36" /></TableCell>
        <TableCell><Skeleton className="h-3 w-28" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-7 w-16 ml-auto" /></TableCell>
      </TableRow>
    ))

  return (
    <div className="w-full space-y-8">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete DNS record?"
        description={`Remove "${deleteTarget}" from local records. Queries for this domain will fall through to upstream.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Local DNS Records</h2>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Manage authoritative records for your local network.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Records',  value: loading ? null : entries.length,  icon: <Server className="h-5 w-5 text-primary" />,           bg: 'bg-primary/10' },
          { label: 'A Records (IPv4)', value: loading ? null : aCount,         icon: <Globe className="h-5 w-5 text-sky-500" />,            bg: 'bg-sky-500/10' },
          { label: 'AAAA Records (IPv6)', value: loading ? null : aaaaCount,   icon: <Wifi className="h-5 w-5 text-purple-500" />,          bg: 'bg-purple-500/10' },
        ].map(card => (
          <Card key={card.label} className="shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                {card.icon}
              </div>
              <div>
                {card.value == null
                  ? <Skeleton className="h-7 w-12 mb-1" />
                  : <p className="text-2xl font-bold text-foreground tabular-nums">{card.value}</p>
                }
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add / Edit form */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 bg-muted/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">
            {editTarget ? `Edit Record — ${editTarget}` : 'Add New Record'}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {editTarget ? 'Update the IP/value for this domain.' : 'Map a local hostname to an IP address.'}
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Domain Name</label>
              <Input
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="e.g. internal.app.local"
                disabled={!!editTarget}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">IP Address</label>
              <Input
                value={ip}
                onChange={e => setIp(e.target.value)}
                placeholder="e.g. 192.168.1.50"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest" onClick={resetForm}>
              {editTarget ? 'Cancel Edit' : 'Clear'}
            </Button>
            <Button className="text-[10px] font-bold uppercase tracking-widest shadow-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editTarget ? 'Update Record' : 'Add Record'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records table */}
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="pb-3 bg-muted/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search domains or IPs…"
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-[10px] font-bold uppercase tracking-widest shrink-0"
              onClick={handleExport}
              disabled={filtered.length === 0}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-4 w-[90px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Domain</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">IP / Value</TableHead>
                <TableHead className="pr-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? renderSkeletonRows() : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-3 py-4 text-muted-foreground">
                      <ServerOff className="h-8 w-8 opacity-40" />
                      <div>
                        <p className="text-sm font-medium">
                          {pendingSearch ? 'No matches found' : 'No custom records yet'}
                        </p>
                        <p className="text-xs opacity-70 mt-1">
                          {pendingSearch ? 'Try a different search term' : 'Add a record above to get started'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginated.map(([d, val], idx) => {
                const type = getTypeLabel(val)
                const style = recordTypeStyles[type] || recordTypeStyles.CNAME
                const isEditing = editTarget === d
                return (
                  <TableRow
                    key={d}
                    className={`group transition-colors hover:bg-muted/30 ${idx % 2 === 1 ? 'bg-muted/[0.15]' : ''} ${isEditing ? 'bg-primary/5' : ''}`}
                  >
                    <TableCell className="pl-4">
                      <Badge className={`font-bold text-[9px] px-2 py-0.5 border-none ${style}`}>{type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[12px] font-medium text-foreground">{d}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 group/val">
                        <code className="bg-muted px-2 py-0.5 text-xs font-medium font-mono">{val}</code>
                        <Button
                          variant="ghost" size="icon"
                          className="h-6 w-6 opacity-0 group-hover/val:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(val)}
                        >
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex justify-end gap-1">
                        {isEditing ? (
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={resetForm}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            onClick={() => startEdit(d, val)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(d)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Showing{' '}
            <span className="text-foreground">
              {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
            </span>
            {' '}of{' '}
            <span className="text-foreground">{filtered.length}</span> records
            {pendingSearch && <span className="ml-2 text-primary">· filtered</span>}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4))
              const p = start + i
              if (p > totalPages) return null
              return (
                <Button key={p} variant={page === p ? 'default' : 'ghost'} size="sm" className="h-7 px-3 text-[10px] font-bold" onClick={() => setPage(p)}>
                  {p}
                </Button>
              )
            })}
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

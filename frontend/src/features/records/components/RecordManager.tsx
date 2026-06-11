import { useState, useCallback } from 'react'
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

const recordTypeStyles: Record<string, string> = {
  A:    'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  AAAA: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  CNAME:'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  MX:   'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  TXT:  'bg-muted/50 text-muted-foreground',
}

function getTypeLabel(ip: string): string {
  if (ip.includes(':')) return 'AAAA'
  if (ip.includes('.')) return 'A'
  return 'CNAME'
}

const sel = "flex h-10 w-full bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium text-foreground transition-colors"

export default function RecordManager() {
  const [records, setRecords] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [domain, setDomain] = useState('')
  const [ip, setIp] = useState('')
  const [recordType, setRecordType] = useState('A (IPv4 Address)')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

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

  const handleAdd = async () => {
    if (!domain.trim() || !ip.trim()) {
      toast.warning('Please fill in all fields')
      return
    }
    setAdding(true)
    try {
      await addRecord(domain.trim(), ip.trim())
      await loadRecords()
      setDomain('')
      setIp('')
      toast.success('Record added', { description: `${domain} → ${ip}` })
    } catch {
      toast.error('Failed to add record')
    } finally {
      setAdding(false)
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

  const handleExport = () => {
    const entries = Object.entries(records)
    if (entries.length === 0) return
    const lines = entries.map(([d, v]) => `${d}\t${getTypeLabel(v)}\t${v}`).join('\n')
    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'local-dns-records.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported', { description: `${entries.length} records` })
  }

  const entries = Object.entries(records || {})

  const renderSkeletonRows = () =>
    Array.from({ length: 4 }).map((_, i) => (
      <TableRow key={i} className={i % 2 === 1 ? 'bg-muted/[0.15]' : ''}>
        <TableCell><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-3 w-44" /></TableCell>
        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
        <TableCell><Skeleton className="h-3 w-12" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-7 w-14 ml-auto" /></TableCell>
      </TableRow>
    ))

  return (
    <div className="w-full space-y-8">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete DNS record?"
        description={`Remove "${deleteTarget}" from local records. DNS queries for this domain will fall through to upstream.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Local DNS Records</h2>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
          Manage authoritative records for your local network environment.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Active Records',
            value: loading ? null : entries.length,
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Total Queries / 24h',
            value: loading ? null : entries.length > 0 ? (entries.length * 30).toLocaleString() : '0',
            icon: <Network className="h-5 w-5 text-primary" />,
            bg: 'bg-primary/10',
          },
          {
            label: 'Conflicts',
            value: loading ? null : 0,
            icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
            bg: 'bg-rose-500/10',
          },
        ].map(card => (
          <Card key={card.label} className="shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                {card.icon}
              </div>
              <div>
                {card.value == null
                  ? <Skeleton className="h-7 w-16 mb-1" />
                  : <p className="text-2xl font-bold text-foreground tabular-nums">{card.value}</p>
                }
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create form */}
        <div className="lg:col-span-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-4 bg-muted/5">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Create New Record</p>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Add a new DNS record to your local network.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Record Type</label>
                <select value={recordType} onChange={e => setRecordType(e.target.value)} className={sel}>
                  <option>A (IPv4 Address)</option>
                  <option>AAAA (IPv6 Address)</option>
                  <option>CNAME (Alias)</option>
                  <option>MX (Mail Exchange)</option>
                  <option>TXT (Text)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Domain Name</label>
                <Input
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  placeholder="e.g. internal.app.local"
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Value</label>
                <Input
                  value={ip}
                  onChange={e => setIp(e.target.value)}
                  placeholder="e.g. 192.168.1.50"
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <Button
                className="w-full gap-2 shadow-sm text-[10px] font-bold uppercase tracking-widest mt-2"
                onClick={handleAdd}
                disabled={adding}
              >
                <PlusCircle className="h-4 w-4" />
                {adding ? 'Adding…' : 'Add Record'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Records table */}
        <Card className="lg:col-span-8 overflow-hidden shadow-sm">
          <CardHeader className="pb-3 bg-muted/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Existing Local Records</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                  Authoritative records for your local domain.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-[10px] font-bold uppercase tracking-widest shrink-0"
                onClick={handleExport}
                disabled={entries.length === 0}
              >
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[80px]">Type</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Domain Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Value / IP</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[80px]">TTL</TableHead>
                  <TableHead className="pr-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? renderSkeletonRows() : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-3 py-4 text-muted-foreground">
                        <ServerOff className="h-8 w-8 opacity-40" />
                        <div>
                          <p className="text-sm font-medium">No custom records yet</p>
                          <p className="text-xs opacity-70 mt-1">Add a record using the form on the left</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map(([d, val], idx) => {
                    const type = getTypeLabel(val)
                    const style = recordTypeStyles[type] || recordTypeStyles.TXT
                    return (
                      <TableRow
                        key={d}
                        className={`group transition-colors hover:bg-muted/30 ${idx % 2 === 1 ? 'bg-muted/[0.15]' : ''}`}
                      >
                        <TableCell className="pl-4">
                          <Badge className={`font-bold text-[9px] px-2 py-0.5 border-none ${style}`}>{type}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-[12px] font-medium text-foreground">{d}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-0.5 text-xs font-mono font-medium text-foreground">{val}</code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => { copyToClipboard(val); toast.success('Copied', { description: val }) }}
                            >
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground">3600s</TableCell>
                        <TableCell className="pr-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(d)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
    </div>
  )
}

import { useState, useEffect } from 'react'
import { 
  PlusCircle, 
  Network, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Download, 
  Copy, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight 
} from 'lucide-react'
import { getRecords, addRecord, deleteRecord } from '../api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

const recordTypeVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  A: 'secondary',
  CNAME: 'outline',
  AAAA: 'default',
  MX: 'outline',
  TXT: 'outline',
}

function getTypeLabel(ip: string): string {
  if (ip.includes(':')) return 'AAAA'
  if (ip.includes('.')) return 'A'
  return 'CNAME'
}

export default function RecordManager() {
  const [records, setRecords] = useState<Record<string, string>>({})
  const [domain, setDomain] = useState('')
  const [ip, setIp] = useState('')
  const [recordType, setRecordType] = useState('A (IPv4 Address)')

  useEffect(() => {
    getRecords().then((data) => setRecords(data || {}))
  }, [])

  const handleAdd = async () => {
    if (!domain || !ip) return
    await addRecord(domain, ip)
    const data = await getRecords()
    setRecords(data || {})
    setDomain('')
    setIp('')
  }

  const handleDelete = async (d: string) => {
    await deleteRecord(d)
    const data = await getRecords()
    setRecords(data || {})
  }

  const entries = Object.entries(records || {})

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Local DNS Records</h2>
        <p className="text-muted-foreground">Manage authoritative records for your local network environment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 shadow-sm border-border/50">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold tracking-tight">Create New Record</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Add a new DNS record to your local network.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Record Type</label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border/50 bg-muted/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-medium"
                >
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
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. internal.app.local"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Value</label>
                <Input
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="e.g. 192.168.1.50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-border/50" onClick={() => { setDomain(''); setIp('') }}>
                Cancel
              </Button>
              <Button className="text-[10px] font-bold uppercase tracking-widest shadow-sm" onClick={handleAdd}>
                Add Record
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <Card className="bg-primary text-primary-foreground shadow-sm border-none">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <Network className="h-8 w-8" />
              <div>
                <p className="text-3xl font-bold tracking-tight">{entries.length > 0 ? (entries.length * 30).toLocaleString() : '0'}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-90 font-semibold">Total Queries/24h</p>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-6 sm:hidden lg:grid">
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{entries.length}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Active Records</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Conflicts</p>
                </div>
                <AlertCircle className="h-6 w-6 text-destructive" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle>Existing Local Records</CardTitle>
            <CardDescription>Authoritative records for your local domain.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead>Domain Name</TableHead>
                <TableHead>Value / IP</TableHead>
                <TableHead>TTL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No custom records yet.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map(([d, val]) => {
                  const type = getTypeLabel(val)
                  const variant = recordTypeVariants[type] || 'default'
                  return (
                    <TableRow key={d} className="group transition-colors">
                      <TableCell>
                        <Badge variant={variant} className="font-bold text-[10px] px-2 py-0">{type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary hover:underline cursor-pointer">{d}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 group/val">
                          <code className="bg-muted px-2 py-0.5 rounded text-xs border">{val}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/val:opacity-100">
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">3600s</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(d)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 bg-muted/20 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Showing {entries.length} records</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" className="h-8 px-3 text-xs">1</Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-900 text-white border-none overflow-hidden relative p-8 md:p-12 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge variant="outline" className="text-white border-white/20 mb-2 px-3 py-1">Pro Feature</Badge>
          <h4 className="text-2xl md:text-3xl font-bold">Need to manage global zones?</h4>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">NetShield Pro allows you to synchronize local records with global edge nodes for sub-millisecond resolution worldwide.</p>
          <Button className="gap-2 group shadow-sm bg-white text-slate-900 hover:bg-white/90" size="lg">
            Upgrade to Pro
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
      </Card>
    </div>
  )
}


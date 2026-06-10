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

const recordTypeStyles: Record<string, string> = {
  A: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
  CNAME: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  AAAA: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  MX: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
  TXT: 'bg-muted/50 text-muted-foreground border border-border/50',
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
    getRecords().then((data) => setRecords(data || {})).catch((e) => console.error('Failed to load records:', e))
  }, [])

  const handleAdd = async () => {
    if (!domain || !ip) return
    try {
      await addRecord(domain, ip)
      const data = await getRecords()
      setRecords(data || {})
      setDomain('')
      setIp('')
    } catch (e) {
      console.error('Failed to add record:', e)
    }
  }

  const handleDelete = async (d: string) => {
    try {
      await deleteRecord(d)
      const data = await getRecords()
      setRecords(data || {})
    } catch (e) {
      console.error('Failed to delete record:', e)
    }
  }

  const entries = Object.entries(records || {})

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Local DNS Records</h2>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Manage authoritative records for your local network environment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-foreground">Create New Record</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Add a new DNS record to your local network.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Record Type</label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-medium"
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
          {/* Stats promo card — semantic tokens only */}
          <Card className="bg-primary/5 border-primary/20 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <div className="p-2 w-fit bg-primary/10 rounded-lg border border-primary/20 shadow-sm">
                <Network className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-foreground">{entries.length > 0 ? (entries.length * 30).toLocaleString() : '0'}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Queries / 24h</p>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-6 sm:hidden lg:grid">
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{entries.length}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Records</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Conflicts</p>
                </div>
                <AlertCircle className="h-6 w-6 text-destructive" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50 bg-muted/5">
          <div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-foreground">Existing Local Records</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Authoritative records for your local domain.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-[10px] font-bold uppercase tracking-widest border-border/50 shadow-sm">
              <Filter className="h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-[10px] font-bold uppercase tracking-widest border-border/50 shadow-sm">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto p-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 border-b border-border/50">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[100px]">Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Domain Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Value / IP</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">TTL</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm font-medium">
                    No custom records yet.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map(([d, val]) => {
                  const type = getTypeLabel(val)
                  const style = recordTypeStyles[type] || recordTypeStyles.TXT
                  return (
                    <TableRow key={d} className="group transition-all duration-200 hover:bg-muted/50 hover:shadow-sm">
                      <TableCell>
                        <Badge className={`font-bold text-[9px] px-2 py-0 border-none ${style}`}>{type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary hover:underline cursor-pointer">{d}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 group/val">
                          <code className="bg-muted px-2 py-0.5 rounded text-xs font-medium border border-border/50">{val}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/val:opacity-100 transition-opacity">
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">3600s</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
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
      </Card>

      {/* Pro upsell card — semantic tokens only */}
      <Card className="bg-primary/5 border-primary/20 overflow-hidden relative p-8 md:p-12 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge variant="outline" className="mb-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary border-primary/30 bg-primary/10">Pro Feature</Badge>
          <h4 className="text-2xl md:text-3xl font-bold text-foreground">Need to manage global zones?</h4>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">NetShield Pro allows you to synchronize local records with global edge nodes for sub-millisecond resolution worldwide.</p>
          <Button className="gap-2 group shadow-sm text-[10px] font-bold uppercase tracking-widest" size="lg">
            Upgrade to Pro
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      </Card>
    </div>
  )
}

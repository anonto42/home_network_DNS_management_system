import { useState, useEffect } from 'react'
import { 
  Ban, 
  PlusCircle, 
  Download, 
  Filter, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Zap,
  Cloud
} from 'lucide-react'
import { getBlocklist, addToBlocklist, removeFromBlocklist, type BlockedDomain } from '../api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdlistSource {
  name: string
  url: string
  domains: number
  lastSynced: string
  enabled: boolean
}

export default function BlocklistManager() {
  const [list, setList] = useState<BlockedDomain[]>([])
  const [listName, setListName] = useState('')
  const [listUrl, setListUrl] = useState('')
  const [listDesc, setListDesc] = useState('')

  const [sources] = useState<AdlistSource[]>([
    { name: 'StevenBlack Unified Ads', url: 'raw.githubusercontent.com/...', domains: 134812, lastSynced: '2 mins ago', enabled: true },
    { name: 'OISD Full (Security Only)', url: 'small.oisd.nl/dns', domains: 892104, lastSynced: '1 hour ago', enabled: true },
    { name: 'Experimental Cryptojacking', url: 'mirror.blocklist.net/...', domains: 12476, lastSynced: '3 days ago', enabled: false },
    { name: 'Privacy Protections', url: 'tracking-list.internal', domains: 209000, lastSynced: '12 mins ago', enabled: true },
  ])

  useEffect(() => {
    getBlocklist().then((data) => setList(data || []))
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Blocklist Management</h2>
          <p className="text-muted-foreground">Control the security perimeter of your network by managing active blocklists.</p>
        </div>
        <Card className="flex items-center gap-6 p-6 min-w-full md:min-w-[320px] shadow-sm ">
          <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
            <Ban className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Blocked Domains</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{list.length.toLocaleString()}</span>
              <Badge variant="secondary" className="text-[10px] bg-destructive/10 text-destructive border-none">+{Math.max(1, Math.round(list.length * 0.01))} today</Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <Card className="shadow-sm ">
            <CardHeader className="pb-4  ">
              <CardTitle className="text-lg font-bold tracking-tight">Add New Adlist</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Add a new source for domain filtering.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">List Name</label>
                  <Input
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="e.g. Social Media Block"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Source URL</label>
                  <Input
                    value={listUrl}
                    onChange={(e) => setListUrl(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/..."
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Description (Optional)</label>
                  <textarea
                    value={listDesc}
                    onChange={(e) => setListDesc(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border  bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-medium"
                    placeholder="Brief description of this list..."
                    rows={2}
                  />
                </div>
                <Button className="w-full gap-2 shadow-sm" type="submit">
                  <PlusCircle className="h-4 w-4" /> Save and Sync List
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="relative h-[240px] overflow-hidden group border-none bg-slate-900 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
              <Badge variant="outline" className="w-fit mb-2 text-white border-white/20">Network Insights</Badge>
              <h4 className="text-white font-semibold text-lg leading-tight mb-1">Protect your fleet with AI-driven threat intelligence.</h4>
              <p className="text-white/70 text-sm">Automated updates for over 2M malicious domains.</p>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-8 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between  pb-4">
            <div>
              <CardTitle>Active Blocklists</CardTitle>
              <CardDescription>Currently active domain filters.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Update All
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Source Name</TableHead>
                  <TableHead>Domains</TableHead>
                  <TableHead>Last Synced</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.name} className="group">
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-semibold ${!source.enabled && 'text-muted-foreground'}`}>{source.name}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[240px] font-mono">{source.url}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-xs ${source.enabled ? 'text-primary' : 'text-muted-foreground'}`}>
                        {source.domains.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {source.lastSynced}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch checked={source.enabled} />
                        <span className={`text-xs font-medium ${source.enabled ? 'text-primary' : 'text-muted-foreground'}`}>
                          {source.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Download className="h-4 w-4" /> Sync Now
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Cloud className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive gap-2">
                            <Ban className="h-4 w-4" /> Disable
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 bg-muted/30 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">Showing {sources.length} active blocklists</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" className="h-8 w-8 p-0">1</Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <Button size="lg" className="rounded-full shadow-lg h-14 px-6 gap-3 group">
          <Zap className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Optimise All Lists</span>
        </Button>
      </div>
    </div>
  )
}


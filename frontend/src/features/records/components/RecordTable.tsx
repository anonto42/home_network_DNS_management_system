import { Copy, Trash2, ServerOff, Download } from 'lucide-react'
import { toast } from 'sonner'
import { copyToClipboard } from '@/lib/clipboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableEmptyState } from '@/components/ui/table-empty-state'
import { SearchInput } from '@/components/ui/search-input'
import { CardTableHeader } from '@/components/ui/card-table-header'

const recordTypeStyles: Record<string, string> = {
  A:    'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  AAAA: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  CNAME:'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  MX:   'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  TXT:  'bg-muted/50 text-muted-foreground',
}

interface Props {
  loading: boolean
  filteredEntries: [string, string][]
  search: string
  onSearchChange: (v: string) => void
  onDelete: (domain: string) => void
  onExport: () => void
  getTypeLabel: (val: string) => string
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i} className={i % 2 === 1 ? 'bg-muted/[0.15]' : ''}>
          <TableCell className="pl-4"><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-3 w-44" /></TableCell>
          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
          <TableCell><Skeleton className="h-3 w-12" /></TableCell>
          <TableCell className="pr-4 text-right"><Skeleton className="h-7 w-7 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function RecordTable({ loading, filteredEntries, search, onSearchChange, onDelete, onExport, getTypeLabel }: Props) {
  return (
    <Card className="overflow-hidden shadow-sm glass-panel rounded-lg" data-tour="dns-records-list">
      <CardTableHeader
        title="Existing Local Records"
        subtitle="Authoritative records — these override upstream DNS for matching domains."
        actions={
          <>
            <SearchInput value={search} onChange={onSearchChange} placeholder="Search records..." />
            <Button
              variant="outline" size="sm"
              className="gap-2 text-[10px] font-bold uppercase tracking-widest shrink-0 btn-premium"
              onClick={onExport}
              disabled={filteredEntries.length === 0}
            >
              <Download className="h-3.5 w-3.5" /> Export List
            </Button>
          </>
        }
      />

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
            {loading ? <SkeletonRows /> : filteredEntries.length === 0 ? (
              <TableEmptyState
                colSpan={5}
                icon={ServerOff}
                primaryText={search ? 'No matches found' : 'No custom records yet'}
                secondaryText={search ? 'Try adjusting your search query' : 'Click "New Record" to add your first entry'}
              />
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
                          variant="ghost" size="icon"
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
                        variant="ghost" size="icon"
                        className="h-7.5 w-7.5 opacity-0 group-hover:opacity-100 transition-all duration-200 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
                        onClick={() => onDelete(d)}
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
  )
}

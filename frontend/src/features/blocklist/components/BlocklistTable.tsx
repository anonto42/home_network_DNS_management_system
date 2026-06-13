import { Shield, ShieldCheck, Copy, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { copyToClipboard } from '@/lib/clipboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableEmptyState } from '@/components/ui/table-empty-state'
import { TablePagination } from '@/components/ui/table-pagination'
import { SearchInput } from '@/components/ui/search-input'
import { CardTableHeader } from '@/components/ui/card-table-header'

const PAGE_SIZE = 15

interface BlocklistItem {
  domain?: string
}

interface Props {
  loading: boolean
  filtered: BlocklistItem[]
  page: number
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (v: string) => void
  onDelete: (domain: string) => void
  onExport: () => void
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i} className={i % 2 === 1 ? 'bg-muted/[0.15]' : ''}>
          <TableCell className="pl-6"><Skeleton className="h-4 w-4" /></TableCell>
          <TableCell><Skeleton className="h-3.5 w-64" /></TableCell>
          <TableCell className="pr-6 text-right"><Skeleton className="h-7 w-7 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function BlocklistTable({ loading, filtered, page, onPageChange, search, onSearchChange, onDelete, onExport }: Props) {
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const isWildcard = (d?: string) => d ? d.startsWith('*') : false

  return (
    <Card className="overflow-hidden shadow-sm glass-panel rounded-lg" data-tour="blocklist-list">
      <CardTableHeader
        title="Active Block Rules"
        subtitle="Domains matching these rules resolve directly to 0.0.0.0."
        actions={
          <>
            <SearchInput
              value={search}
              onChange={val => { onSearchChange(val); onPageChange(1) }}
              placeholder="Search blocklist..."
            />
            <Button
              variant="outline" size="sm"
              className="gap-2 text-[10px] font-bold uppercase tracking-widest shrink-0 btn-premium"
              onClick={onExport}
              disabled={filtered.length === 0}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </>
        }
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 border-b border-border">
              <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[80px] py-3.5" />
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5">Blocked Domain / Rule</TableHead>
              <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[80px] py-3.5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <SkeletonRows /> : pageItems.length === 0 ? (
              <TableEmptyState
                colSpan={3}
                icon={ShieldCheck}
                iconClassName="text-emerald-500"
                primaryText={search ? 'No matches found' : 'Blocklist is empty'}
                secondaryText={search ? 'Try adjusting your search criteria' : 'Click "Block Domain" to secure your local DNS queries'}
              />
            ) : (
              pageItems.map((item, idx) => {
                const d = item.domain || ''
                const wild = isWildcard(d)
                return (
                  <TableRow
                    key={d}
                    className={`group transition-colors hover:bg-muted/20 border-b border-border ${idx % 2 === 1 ? 'bg-muted/[0.08]' : ''}`}
                  >
                    <TableCell className="pl-6 py-3">
                      <Shield className={`h-4 w-4 ${wild ? 'text-amber-500' : 'text-rose-500'}`} />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-semibold text-foreground tracking-tight">{d}</span>
                        {wild && <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">Wildcard</span>}
                        <Button
                          variant="ghost" size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-md"
                          onClick={() => { copyToClipboard(d); toast.success('Copied', { description: d }) }}
                        >
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
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

      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        itemLabel="domains"
        onPageChange={onPageChange}
      />
    </Card>
  )
}

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface Props {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  itemLabel?: string
  filterLabel?: string
  onPageChange: (page: number) => void
}

export function TablePagination({ page, totalPages, totalItems, pageSize, itemLabel = 'items', filterLabel, onPageChange }: Props) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <div className="p-4 bg-muted/10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Showing{' '}
        <span className="text-foreground">{from}–{to}</span>
        {' '}of{' '}
        <span className="text-foreground">{totalItems}</span> {itemLabel}
        {filterLabel && <span className="ml-2 text-primary">{filterLabel}</span>}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 btn-premium" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const start = Math.max(1, Math.min(page - 2, totalPages - 4))
          const p = start + i
          if (p > totalPages) return null
          return (
            <Button key={p} variant={page === p ? 'default' : 'ghost'} size="sm" className="h-8 w-8 text-[10px] font-bold rounded-md btn-premium" onClick={() => onPageChange(p)}>
              {p}
            </Button>
          )
        })}
        <Button variant="ghost" size="icon" className="h-8 w-8 btn-premium" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

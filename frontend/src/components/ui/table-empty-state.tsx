import type { LucideIcon } from 'lucide-react'
import { TableCell, TableRow } from './table'

interface Props {
  colSpan: number
  icon: LucideIcon
  iconClassName?: string
  primaryText: string
  secondaryText: string
}

export function TableEmptyState({ colSpan, icon: Icon, iconClassName, primaryText, secondaryText }: Props) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-48 text-center">
        <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
          <Icon className={`h-8 w-8 opacity-40 animate-pulse ${iconClassName ?? ''}`} />
          <div>
            <p className="text-sm font-medium">{primaryText}</p>
            <p className="text-xs opacity-70 mt-1">{secondaryText}</p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

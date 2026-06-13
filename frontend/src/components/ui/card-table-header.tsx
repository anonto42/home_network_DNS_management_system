import type { ReactNode } from 'react'
import { CardHeader } from './card'

interface Props {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function CardTableHeader({ title, subtitle, actions }: Props) {
  return (
    <CardHeader className="pb-3 bg-muted/10 border-b border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">{title}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </CardHeader>
  )
}

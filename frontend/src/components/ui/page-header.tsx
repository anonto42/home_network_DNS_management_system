import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.ComponentProps<"div"> {
  title: string
  description: string
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest leading-relaxed">
          {description}
        </p>
      </div>
      {actions && (
        <div className="w-full sm:w-auto shrink-0 flex flex-col sm:flex-row gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string | number | null | undefined
  icon: React.ElementType | React.ReactNode
  bg?: string
  sub?: string
  progress?: number
  progressColor?: string
  loading?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  bg = "bg-primary/10",
  sub,
  progress,
  progressColor = "bg-primary",
  loading = false,
  className,
}: StatCardProps) {
  const isIconComponent = typeof Icon === "function" || (Icon && typeof (Icon as any).render === "function")
  const IconComponent = isIconComponent ? (Icon as React.ElementType) : null

  if (loading) {
    return (
      <Card className={cn("shadow-sm glass-panel overflow-hidden rounded-lg", className)}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20" />
          {progress !== undefined && <Skeleton className="h-1 w-full rounded-full" />}
          {sub && <Skeleton className="h-3 w-36" />}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("shadow-sm glass-panel hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-foreground", bg)}>
            {IconComponent ? <IconComponent className="h-4 w-4" /> : (Icon as React.ReactNode)}
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3 tabular-nums leading-none">
          {value ?? <Skeleton className="h-7 w-16 inline-block" />}
        </h3>

        {progress !== undefined && (
          <div className="h-1 bg-muted mb-3 overflow-hidden rounded-full">
            <div
              className={cn("h-full transition-all duration-700 ease-out", progressColor)}
              style={{ width: `${Math.max(progress > 0 ? 2 : 0, progress)}%` }}
            />
          </div>
        )}

        {sub && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed">
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface StatsGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function StatsGrid({
  children,
  columns = 3,
  className,
}: StatsGridProps) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns]

  return (
    <div className={cn("grid gap-4", colClass, className)}>
      {children}
    </div>
  )
}

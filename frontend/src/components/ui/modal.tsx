import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}: ModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  const widthClass = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
  }[maxWidth]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Content Panel */}
      <div
        className={cn(
          "relative z-10 w-full bg-card border border-border shadow-2xl sm:rounded-lg overflow-hidden flex flex-col max-h-[90vh]",
          "animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200",
          widthClass
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-muted/20 border-b border-border shrink-0">
          <div>
            <h2 className="text-sm font-bold text-foreground">{title}</h2>
            {description && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-muted/40 rounded-sm"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-4 flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 bg-muted/10 border-t border-border shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

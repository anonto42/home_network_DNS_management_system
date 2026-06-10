import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'
import { Button } from './button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[400px] border-border/50 shadow-lg">
        <DialogHeader className="gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${destructive ? 'bg-destructive/10 border border-destructive/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
            <AlertTriangle className={`h-5 w-5 ${destructive ? 'text-destructive' : 'text-amber-500'}`} />
          </div>
          <DialogTitle className="text-base font-bold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onCancel} className="text-[10px] font-bold uppercase tracking-widest border-border/50">
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={() => { onConfirm(); onCancel() }}
            className="text-[10px] font-bold uppercase tracking-widest"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

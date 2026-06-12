import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'

interface BlocklistModalProps {
  domain: string
  setDomain: (d: string) => void
  adding: boolean
  handleBlock: () => void
  onClose: () => void
}

export default function BlocklistModal({
  domain,
  setDomain,
  adding,
  handleBlock,
  onClose
}: BlocklistModalProps) {
  const footer = (
    <>
      <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest btn-premium" onClick={onClose}>
        Cancel
      </Button>
      <Button
        className="text-[10px] font-bold uppercase tracking-widest shadow-sm gap-2 btn-premium glow-destructive bg-destructive text-destructive-foreground hover:bg-destructive/95"
        onClick={handleBlock}
        disabled={adding}
      >
        <ShieldAlert className="h-3.5 w-3.5" />
        {adding ? 'Blocking…' : 'Block Domain'}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Block Domain"
      description="Prevent resolving a domain or wildcard matching."
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Domain or Wildcard</label>
        <Input
          value={domain}
          onChange={e => setDomain(e.target.value)}
          placeholder="e.g. tracking-domain.com or *.doubleclick.net"
          onKeyDown={e => e.key === 'Enter' && handleBlock()}
          spellCheck={false}
          autoComplete="off"
          className="input-premium"
          autoFocus
        />
      </div>
    </Modal>
  )
}

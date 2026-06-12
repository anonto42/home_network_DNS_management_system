import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'

interface RecordModalProps {
  recordType: string
  setRecordType: (t: string) => void
  domain: string
  setDomain: (d: string) => void
  ip: string
  setIp: (i: string) => void
  adding: boolean
  handleAdd: () => void
  resetForm: () => void
}

const RECORD_TYPES = ['A (IPv4 Address)', 'AAAA (IPv6 Address)', 'CNAME (Alias)', 'MX (Mail Exchange)', 'TXT (Text)']

const PLACEHOLDERS: Record<string, { domain: string; value: string }> = {
  'A (IPv4 Address)':   { domain: 'nas.home', value: '192.168.1.100' },
  'AAAA (IPv6 Address)':{ domain: 'nas.home', value: 'fd00::1' },
  'CNAME (Alias)':      { domain: 'www.home', value: 'nas.home' },
  'MX (Mail Exchange)': { domain: 'home.local', value: '10 mail.home' },
  'TXT (Text)':         { domain: 'home.local', value: 'v=spf1 ...' },
}

const sel = "flex h-10 w-full select-premium focus:outline-none focus:ring-2 focus:ring-ring font-medium text-foreground transition-colors"

export default function RecordModal({
  recordType, setRecordType,
  domain, setDomain,
  ip, setIp,
  adding,
  handleAdd,
  resetForm
}: RecordModalProps) {
  const ph = PLACEHOLDERS[recordType] || PLACEHOLDERS['A (IPv4 Address)']

  const footer = (
    <>
      <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest btn-premium" onClick={resetForm}>
        Cancel
      </Button>
      <Button
        className="text-[10px] font-bold uppercase tracking-widest shadow-sm gap-2 btn-premium glow-primary"
        onClick={handleAdd}
        disabled={adding}
      >
        <PlusCircle className="h-3.5 w-3.5" />
        {adding ? 'Adding…' : 'Add Record'}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={true}
      onClose={resetForm}
      title="Add DNS Record"
      description="Create an authoritative record for your local network."
      footer={footer}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Record Type</label>
          <select value={recordType} onChange={e => setRecordType(e.target.value)} className={sel}>
            {RECORD_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Domain Name</label>
          <Input
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder={ph.domain}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            spellCheck={false}
            autoComplete="off"
            className="input-premium"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Value</label>
          <Input
            value={ip}
            onChange={e => setIp(e.target.value)}
            placeholder={ph.value}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            spellCheck={false}
            autoComplete="off"
            className="input-premium"
          />
        </div>
      </div>
    </Modal>
  )
}

import { LogTable } from '@/features/logs'

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Query Log</h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Real-time DNS traffic and security events across your network.</p>
      </div>
      <LogTable />
    </div>
  )
}

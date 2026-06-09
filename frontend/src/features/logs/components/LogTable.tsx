import { useState } from 'react'
import { getLogs, clearLogs, type QueryLog } from '../api'
import { usePolling } from '../../../hooks/usePolling'

const statusConfig: Record<string, { badge: string, dot: string, label: string }> = {
  forwarded: { badge: 'bg-secondary-container/30 text-secondary', dot: 'bg-secondary', label: 'Allowed' },
  blocked: { badge: 'bg-error-container/30 text-error', dot: 'bg-error', label: 'Blocked' },
  custom: { badge: 'bg-tertiary-fixed/40 text-tertiary', dot: 'bg-tertiary', label: 'Custom' },
  cached: { badge: 'bg-secondary-container/30 text-secondary', dot: 'bg-secondary', label: 'Cached' },
}

const clientIcons: Record<string, string> = {
  '192.168.1.45': 'laptop_mac',
  '192.168.1.102': 'smartphone',
  '192.168.1.1': 'router',
  '192.168.1.12': 'desktop_windows',
  '10.0.4.19': 'cloud',
}

function getClientIcon(ip: string): string {
  return clientIcons[ip] || 'laptop_mac'
}

interface Props {
  compact?: boolean
}

export default function LogTable({ compact }: Props) {
  const [logs, setLogs] = useState<QueryLog[]>([])
  const [filter, setFilter] = useState<'all' | 'blocked' | 'allowed'>('all')

  usePolling(async () => {
    try {
      const data = await getLogs()
      setLogs(data || [])
    } catch {}
  }, 3000)

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(l => {
        if (filter === 'blocked') return l.action === 'blocked'
        return l.action === 'forwarded' || l.action === 'cached' || l.action === 'custom'
      })

  const showFilters = !compact

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      {showFilters && (
        <div className="p-lg border-b border-outline-variant">
          <div className="inline-flex bg-surface-container-low p-base rounded-lg border border-outline-variant">
            {(['all', 'blocked', 'allowed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-lg py-sm rounded-md font-label-md transition-all duration-200 ${
                  filter === f
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {f === 'all' ? 'All' : f === 'blocked' ? 'Blocked' : 'Allowed'}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        {compact && (
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Queries</h3>
            <button className="text-primary font-label-md text-label-md hover:underline">View All</button>
          </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Timestamp</th>
              {!compact && <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Client</th>}
              <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Domain</th>
              {!compact && <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Result</th>}
              <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {(!filteredLogs || filteredLogs.length === 0) ? (
              <tr>
                <td colSpan={compact ? 3 : 5} className="py-xl px-lg text-center text-on-surface-variant font-body-md">
                  No queries yet. Make a DNS request to see it here.
                </td>
              </tr>
            ) : (
              filteredLogs.slice(0, compact ? 5 : undefined).map((l) => {
                const config = statusConfig[l.action || 'forwarded'] || statusConfig.forwarded
                return (
                  <tr key={l.id} className="dns-table-row hover:bg-surface-container transition-colors group">
                    <td className="py-md px-lg font-code text-code text-on-surface-variant">
                      {compact
                        ? new Date(l.timestamp || '').toLocaleTimeString()
                        : new Date(l.timestamp || '').toISOString().replace('T', ' ').slice(0, 19)
                      }
                    </td>
                    {!compact && (
                      <td className="py-md px-lg">
                        <div className="flex items-center gap-sm">
                          <span className="material-symbols-outlined text-[18px] text-primary">{getClientIcon(l.client_ip || '')}</span>
                          <span className="font-body-sm font-semibold text-on-surface">{l.client_ip}</span>
                        </div>
                      </td>
                    )}
                    <td className="py-md px-lg">
                      <div className="flex items-center justify-between">
                        <span className={`font-code text-code ${l.action === 'blocked' ? 'text-error' : 'text-primary'}`}>{l.domain}</span>
                        <button className="copy-action opacity-0 material-symbols-outlined text-[16px] text-outline hover:text-primary transition-all p-xs rounded hover:bg-surface-container-high cursor-pointer">content_copy</button>
                      </div>
                    </td>
                    {!compact && (
                      <td className="py-md px-lg font-body-sm text-body-sm text-on-surface">
                        {l.action === 'forwarded' ? 'A (IPv4)' : l.action === 'blocked' ? 'HTTPS' : l.action === 'cached' ? 'A (IPv4)' : 'TXT'}
                      </td>
                    )}
                    <td className="py-md px-lg text-right">
                      <span className={`inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm uppercase ${config.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-2`}></span>
                        {config.label}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {!compact && (
        <div className="px-lg py-md border-t border-outline-variant flex items-center justify-between bg-surface-container-low">
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            Showing <span className="font-semibold">1-{Math.min(filteredLogs.length, 50)}</span> of <span className="font-semibold">{filteredLogs.length}</span> queries
          </div>
          <div className="flex items-center gap-sm">
            <button className="p-xs rounded border border-outline-variant hover:bg-surface-container-lowest transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="px-md py-xs rounded border border-outline-variant bg-primary text-on-primary font-label-sm">1</button>
            <button className="px-md py-xs rounded border border-outline-variant hover:bg-surface-container-lowest transition-colors font-label-sm">2</button>
            <button className="px-md py-xs rounded border border-outline-variant hover:bg-surface-container-lowest transition-colors font-label-sm">3</button>
            <button className="p-xs rounded border border-outline-variant hover:bg-surface-container-lowest transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

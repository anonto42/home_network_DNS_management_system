import { useState } from 'react'
import { getStatus, type Status } from '../api/client'
import { usePolling } from '../hooks/usePolling'

export default function StatsCards() {
  const [stats, setStats] = useState<Status>({
    queries_forwarded: 0,
    queries_blocked: 0,
    queries_custom: 0,
    cache_size: 0,
    uptime_seconds: 0,
  })

  usePolling(async () => {
    try {
      setStats(await getStatus())
    } catch {}
  }, 3000)

  const cards = [
    { label: 'Forwarded', value: stats.queries_forwarded, color: 'text-blue-400' },
    { label: 'Blocked', value: stats.queries_blocked, color: 'text-red-400' },
    { label: 'Custom', value: stats.queries_custom, color: 'text-yellow-400' },
    { label: 'Cache', value: stats.cache_size, color: 'text-green-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</div>
          <div className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}

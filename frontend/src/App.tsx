import { useState } from 'react'
import { StatsCards } from './features/stats'
import { LogTable } from './features/logs'
import { RecordManager } from './features/records'
import { BlocklistManager } from './features/blocklist'

type Tab = 'dashboard' | 'logs' | 'records' | 'blocklist'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')

  const navItems: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'logs', label: 'Query Log' },
    { key: 'records', label: 'Local DNS' },
    { key: 'blocklist', label: 'Blocklist' },
  ]

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 p-4">
        <h1 className="text-lg font-bold text-cyan-400 mb-8">DNS Dashboard</h1>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === item.key
                  ? 'bg-gray-800 text-cyan-400'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {tab === 'dashboard' && (
            <>
              <h2 className="text-xl font-semibold mb-6">System Status</h2>
              <StatsCards />
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Recent Queries</h3>
                <LogTable />
              </div>
            </>
          )}
          {tab === 'logs' && <LogTable />}
          {tab === 'records' && <RecordManager />}
          {tab === 'blocklist' && <BlocklistManager />}
        </div>
      </div>
    </div>
  )
}

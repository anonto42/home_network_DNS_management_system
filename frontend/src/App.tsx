import { useState } from 'react'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { StatsCards } from './features/stats'
import { LogTable } from './features/logs'
import { RecordManager } from './features/records'
import { BlocklistManager } from './features/blocklist'

type Tab = 'dashboard' | 'logs' | 'records' | 'blocklist'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <DashboardLayout activeTab={tab} setTab={(t) => setTab(t as Tab)}>
      {tab === 'dashboard' && (
        <>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-xl">Network Overview</h2>
          <StatsCards />
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-lg">Recent Queries</h3>
          <LogTable />
        </>
      )}
      {tab === 'logs' && <LogTable />}
      {tab === 'records' && <RecordManager />}
      {tab === 'blocklist' && <BlocklistManager />}
    </DashboardLayout>
  )
}

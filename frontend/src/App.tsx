import { useState } from 'react'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { StatsCards } from './features/stats'
import { SystemHealth } from './features/stats/components/SystemHealth'
import { LogTable } from './features/logs'
import { RecordManager } from './features/records'
import { BlocklistManager } from './features/blocklist'

type Tab = 'dashboard' | 'logs' | 'records' | 'blocklist' | 'steering'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <DashboardLayout activeTab={tab} setTab={(t) => setTab(t as Tab)}>
      {tab === 'dashboard' && (
        <>
          <div className="flex justify-between items-end mb-xl">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Network Overview</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Real-time monitoring for north-america-east-1 cluster.</p>
            </div>
            <div className="flex gap-sm">
              <button className="flex items-center gap-sm px-md py-sm border border-outline text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                Last 24 Hours
              </button>
              <button className="flex items-center gap-sm px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 shadow-sm transition-opacity">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Report
              </button>
            </div>
          </div>
          <StatsCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <div className="lg:col-span-2">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
                <div className="p-lg border-b border-outline-variant flex justify-between items-center">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Queries</h3>
                  <button className="text-primary font-label-md text-label-md hover:underline">View All</button>
                </div>
                <LogTable compact />
              </div>
            </div>
            <div className="space-y-lg">
              <SystemHealth />
              <div className="bg-primary text-on-primary p-lg rounded-xl border border-primary-container shadow-lg relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="font-headline-sm text-headline-sm mb-xs">Network Load</h3>
                  <p className="font-body-sm text-body-sm text-primary-fixed mb-lg">Traffic distribution across nodes</p>
                  <div className="flex items-end gap-xs h-24">
                    <div className="flex-1 bg-primary-fixed/30 rounded-t-sm h-[40%] group-hover:h-[50%] transition-all"></div>
                    <div className="flex-1 bg-primary-fixed/30 rounded-t-sm h-[60%] group-hover:h-[45%] transition-all"></div>
                    <div className="flex-1 bg-primary-fixed/30 rounded-t-sm h-[80%] group-hover:h-[70%] transition-all"></div>
                    <div className="flex-1 bg-primary-fixed/30 rounded-t-sm h-[50%] group-hover:h-[85%] transition-all"></div>
                    <div className="flex-1 bg-primary-fixed/30 rounded-t-sm h-[90%] group-hover:h-[60%] transition-all"></div>
                    <div className="flex-1 bg-primary-fixed/30 rounded-t-sm h-[70%] group-hover:h-[90%] transition-all"></div>
                    <div className="flex-1 bg-white rounded-t-sm h-[85%] group-hover:h-[75%] transition-all"></div>
                  </div>
                </div>
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
                    <path d="M0 100 Q 25 0 50 100 Q 75 0 100 100" fill="none" stroke="white" strokeWidth="2"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {tab === 'logs' && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg mb-lg">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface">Query Log</h1>
              <p className="font-body-sm text-on-surface-variant">Real-time DNS traffic and security events across your organization.</p>
            </div>
          </div>
          <LogTable />
        </>
      )}
      {tab === 'records' && <RecordManager />}
      {tab === 'blocklist' && <BlocklistManager />}
      {tab === 'steering' && (
        <div className="flex items-center justify-center h-64 text-on-surface-variant">
          <p className="font-body-lg">Traffic Steering — Coming soon</p>
        </div>
      )}
    </DashboardLayout>
  )
}

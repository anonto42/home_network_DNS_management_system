import { Routes, Route } from 'react-router-dom'
import { 
  Calendar, 
  Download,
  BarChart3,
  ExternalLink
} from 'lucide-react'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { StatsCards } from './features/stats'
import { SystemHealth } from './features/stats/components/SystemHealth'
import { LogTable } from './features/logs'
import { RecordManager } from './features/records'
import { BlocklistManager } from './features/blocklist'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const Dashboard = () => (
  <div className="space-y-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Network Overview</h2>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Real-time monitoring for north-america-east-1 cluster.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2 text-[10px] font-bold uppercase tracking-widest border-border/50 shadow-sm">
          <Calendar className="h-3.5 w-3.5" />
          Last 24 Hours
        </Button>
        <Button size="sm" className="gap-2 shadow-sm text-[10px] font-bold uppercase tracking-widest">
          <Download className="h-3.5 w-3.5" />
          Export Report
        </Button>
      </div>
    </div>

    <StatsCards />

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <LogTable compact />
      </div>
      <div className="lg:col-span-4 space-y-8">
        <SystemHealth />
        <Card className="overflow-hidden relative group border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 font-bold tracking-tight text-foreground">
              <BarChart3 className="h-5 w-5 text-primary" />
              Network Load
            </CardTitle>
            <CardDescription className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Traffic distribution across nodes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-24 mt-2">
              {[40, 60, 80, 50, 90, 70, 85].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm transition-all duration-500 ${i === 6 ? 'bg-primary' : 'bg-foreground/10'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none -bottom-10">
              <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
                <path d="M0 100 Q 25 0 50 100 Q 75 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)

const LogsPage = () => (
  <div className="space-y-6">
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Query Log</h1>
      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Real-time DNS traffic and security events across your organization.</p>
    </div>
    <LogTable />
  </div>
)

const SteeringPage = () => (
  <Card className="flex items-center justify-center h-64 border-dashed border-border/50 bg-muted/5 shadow-sm">
    <div className="text-center space-y-2">
      <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Traffic Steering — Coming soon</p>
      <Button variant="link" className="gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
        Learn more <ExternalLink className="h-3.5 w-3.5" />
      </Button>
    </div>
  </Card>
)

const SettingsPage = () => (
  <div className="max-w-4xl space-y-8">
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Configure your DNS server and security preferences.</p>
    </div>

    <div className="grid gap-6">
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="font-bold tracking-tight text-foreground">General Configuration</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Basic node settings and updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">Server Name</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Identify this node in your cluster</p>
            </div>
            <input
              className="flex h-9 w-full sm:w-64 rounded-md border border-border/50 bg-muted/5 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-medium text-foreground"
              defaultValue="north-america-east-1"
            />
          </div>
          <div className="h-[1px] bg-border/50" />
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">Automatic Updates</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Keep blocklists and firmware up to date</p>
            </div>
            <div className="flex items-center h-6">
              <div className="h-5 w-10 rounded-full bg-primary relative cursor-pointer transition-colors shadow-inner">
                <div className="absolute right-1 top-1 h-3 w-3 rounded-full bg-primary-foreground shadow-sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="font-bold tracking-tight text-foreground">Upstream DNS</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Select your preferred upstream DNS providers for resolution.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Cloudflare (1.1.1.1)', 'Google (8.8.8.8)', 'Quad9 (9.9.9.9)', 'Custom Provider'].map((p, i) => (
              <div key={p} className="flex items-center space-x-3 p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group">
                <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${i === 0 ? 'bg-primary border-primary shadow-sm' : 'border-border/50 group-hover:border-primary/50'}`}>
                  {i === 0 && <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />}
                </div>
                <span className="text-sm font-bold text-foreground opacity-80 group-hover:opacity-100">{p}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-border/50">Discard Changes</Button>
        <Button className="shadow-sm text-[10px] font-bold uppercase tracking-widest">Save Configuration</Button>
      </div>
    </div>
  </div>
)

export default function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/records" element={<RecordManager />} />
        <Route path="/blocklist" element={<BlocklistManager />} />
        <Route path="/steering" element={<SteeringPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </DashboardLayout>
  )
}

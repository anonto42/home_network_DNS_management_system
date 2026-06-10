import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import { 
  Calendar, 
  Download,
  BarChart3,
  ExternalLink,
  CheckCircle2,
  PlusCircle,
  Trash2,
  Gauge,
  Globe,
  ArrowRight,
  Network,
  Power
} from 'lucide-react'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { StatsCards } from './features/stats'
import { SystemHealth } from './features/stats/components/SystemHealth'
import { LogTable } from './features/logs'
import { RecordManager } from './features/records'
import { BlocklistManager } from './features/blocklist'
import { getSettings, saveSettings } from './features/settings/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

const SteeringPage = () => {
  const [rules, setRules] = useState([
    { id: 1, name: 'Corporate VPN Traffic', condition: 'Domain: *.corp.internal', action: 'Forward to 10.0.0.1', enabled: true, priority: 1 },
    { id: 2, name: 'Block Malicious Domains', condition: 'Domain: *.malware.test', action: 'Block', enabled: true, priority: 2 },
    { id: 3, name: 'Redirect Legacy Services', condition: 'Domain: legacy.app.local', action: 'Redirect to 192.168.1.100', enabled: false, priority: 3 },
    { id: 4, name: 'Parental Controls', condition: 'Client IP: 192.168.1.0/24', action: 'Forward to Cloudflare (1.1.1.2)', enabled: true, priority: 4 },
  ])
  const [name, setName] = useState('')
  const [conditionType, setConditionType] = useState('Domain')
  const [conditionValue, setConditionValue] = useState('')
  const [actionType, setActionType] = useState('Forward')
  const [actionValue, setActionValue] = useState('')

  const handleAdd = () => {
    if (!name || !conditionValue) return
    const actionLabel = actionType === 'Block' ? 'Block' : `${actionType === 'Forward' ? 'Forward to' : 'Redirect to'} ${actionValue}`
    setRules([...rules, {
      id: Date.now(),
      name,
      condition: `${conditionType}: ${conditionValue}`,
      action: actionLabel,
      enabled: true,
      priority: rules.length + 1,
    }])
    setName('')
    setConditionValue('')
    setActionValue('')
  }

  const toggleRule = (id: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  const deleteRule = (id: number) => {
    setRules(rules.filter(r => r.id !== id))
  }

  const activeCount = rules.filter(r => r.enabled).length

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Traffic Steering</h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Define routing rules to control how DNS traffic is resolved across your network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-foreground">Create Steering Rule</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Route traffic based on domain, client IP, or query type.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Rule Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Corporate VPN Traffic"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Priority</label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-medium"
                  defaultValue={rules.length + 1}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                    <option key={p} value={p}>#{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Condition Type</label>
                <select
                  value={conditionType}
                  onChange={(e) => setConditionType(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-medium"
                >
                  <option>Domain</option>
                  <option>Client IP</option>
                  <option>Query Type</option>
                  <option>Time Range</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Condition Value</label>
                <Input
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  placeholder={conditionType === 'Domain' ? '*.corp.internal' : conditionType === 'Client IP' ? '192.168.1.0/24' : conditionType === 'Query Type' ? 'A, AAAA' : '09:00-18:00'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Action</label>
                <select
                  value={actionType}
                  onChange={(e) => { setActionType(e.target.value); if (e.target.value === 'Block') setActionValue('') }}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-medium"
                >
                  <option>Forward</option>
                  <option>Block</option>
                  <option>Redirect</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Target{actionType === 'Block' ? ' (N/A)' : ''}</label>
                <Input
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  placeholder={actionType === 'Forward' ? '10.0.0.1' : actionType === 'Redirect' ? '192.168.1.100' : '—'}
                  disabled={actionType === 'Block'}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-border/50" onClick={() => { setName(''); setConditionValue(''); setActionValue('') }}>
                Cancel
              </Button>
              <Button className="text-[10px] font-bold uppercase tracking-widest shadow-sm" onClick={handleAdd}>
                Add Rule
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <Card className="bg-primary/5 border-primary/20 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <div className="p-2 w-fit bg-primary/10 rounded-lg border border-primary/20 shadow-sm">
                <Gauge className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-foreground">{activeCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Active Rules</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{rules.length}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Rules</p>
              </div>
              <Globe className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50 bg-muted/5">
          <div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-foreground">Steering Rules</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Ordered by priority — higher rules are evaluated first.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-[10px] font-bold uppercase tracking-widest border-border/50 shadow-sm">
              <Power className="h-4 w-4" /> Toggle All
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto p-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 border-b border-border/50">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[60px]">#</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rule</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Condition</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Action</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[80px]">Status</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm font-medium">
                    No steering rules configured yet.
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id} className="group transition-all duration-200 hover:bg-muted/50 hover:shadow-sm">
                    <TableCell>
                      <span className="text-xs font-bold text-muted-foreground">#{rule.priority}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">{rule.name}</span>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-0.5 rounded text-xs font-medium border border-border/50 text-muted-foreground">{rule.condition}</code>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={`font-bold text-[9px] px-2 py-0 border-none ${
                        rule.action === 'Block' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {rule.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteRule(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="bg-primary/5 border-primary/20 overflow-hidden relative p-8 md:p-12 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge variant="outline" className="mb-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary border-primary/30 bg-primary/10">Pro Feature</Badge>
          <h4 className="text-2xl md:text-3xl font-bold text-foreground">Need geo-aware routing?</h4>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">NetShield Pro enables latency-based steering, failover policies, and multi-region DNS routing for global deployments.</p>
          <Button className="gap-2 group shadow-sm text-[10px] font-bold uppercase tracking-widest" size="lg">
            Upgrade to Pro
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      </Card>
    </div>
  )
}

const SettingsPage = () => {
  const [serverName, setServerName] = useState('north-america-east-1')
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getSettings().then((s) => {
      if (s.server_name) setServerName(s.server_name)
      if (s.auto_update) setAutoUpdate(s.auto_update === 'true')
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSettings({ server_name: serverName, auto_update: String(autoUpdate) })
    } catch (e) {
      console.error('Failed to save settings:', e)
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return null

  return (
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
                value={serverName}
                onChange={e => setServerName(e.target.value)}
              />
            </div>
            <div className="h-[1px] bg-border/50" />
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground">Automatic Updates</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Keep blocklists and firmware up to date</p>
              </div>
              <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
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
          <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-border/50" onClick={() => { setServerName('north-america-east-1'); setAutoUpdate(true) }}>Discard Changes</Button>
          <Button className="shadow-sm text-[10px] font-bold uppercase tracking-widest" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Configuration'}</Button>
        </div>
      </div>
    </div>
  )
}

const ProfilePage = () => (
  <div className="max-w-4xl space-y-8">
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Manage your account details and preferences.</p>
    </div>
    <div className="grid gap-6">
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="font-bold tracking-tight text-foreground">Account Information</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Your personal account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">Display Name</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your public display name</p>
            </div>
            <input
              className="flex h-9 w-full sm:w-64 rounded-md border border-border/50 bg-muted/5 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-medium text-foreground"
              defaultValue="Enterprise User"
            />
          </div>
          <div className="h-[1px] bg-border/50" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">Email Address</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Used for notifications and account recovery</p>
            </div>
            <input
              className="flex h-9 w-full sm:w-64 rounded-md border border-border/50 bg-muted/5 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-medium text-foreground"
              defaultValue="admin@netshield.local"
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-border/50">Discard Changes</Button>
        <Button className="shadow-sm text-[10px] font-bold uppercase tracking-widest">Save Changes</Button>
      </div>
    </div>
  </div>
)

const CloudSyncPage = () => {
  const [autoSync, setAutoSync] = useState(true)
  return (
  <div className="max-w-4xl space-y-8">
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Cloud Sync</h1>
      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Synchronize your configuration across nodes and clusters.</p>
    </div>
    <div className="grid gap-6">
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="font-bold tracking-tight text-foreground">Sync Status</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Current synchronization state of your cluster.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">All nodes are in sync</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last synchronized 2 hours ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="font-bold tracking-tight text-foreground">Sync Configuration</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Configure automatic synchronization settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">Auto-Sync</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Automatically sync configuration changes</p>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
          <div className="h-[1px] bg-border/50" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">Sync Interval</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">How often to sync with remote nodes</p>
            </div>
            <select className="flex h-9 w-full sm:w-48 rounded-md border border-border/50 bg-muted/5 px-3 py-1 text-sm shadow-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option>Every 5 minutes</option>
              <option>Every 15 minutes</option>
              <option>Every hour</option>
              <option>Every 6 hours</option>
            </select>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-border/50">Sync Now</Button>
        <Button className="shadow-sm text-[10px] font-bold uppercase tracking-widest">Save Configuration</Button>
      </div>
    </div>
  </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/records" element={<RecordManager />} />
              <Route path="/blocklist" element={<BlocklistManager />} />
              <Route path="/steering" element={<SteeringPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/cloud-sync" element={<CloudSyncPage />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

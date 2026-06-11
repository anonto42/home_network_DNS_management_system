import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useTheme, type Theme } from './hooks/useTheme'
import LoginPage from './pages/LoginPage'
import { apiGet, apiPost, apiPut, apiDelete } from './hooks/api'
import {
  Calendar,
  Download,
  BarChart3,
  PlusCircle,
  Trash2,
  Gauge,
  Globe,
  Power,
  Sun,
  Moon,
  Monitor,
  Cloud,
} from 'lucide-react'

import { toast } from 'sonner'
import { Toaster } from 'sonner'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { StatsCards } from './features/stats'
import { SystemHealth } from './features/stats/components/SystemHealth'
import { LogTable } from './features/logs'
import { RecordManager } from './features/records'
import { BlocklistManager } from './features/blocklist'
import { getSettings, saveSettings } from './features/settings/api'
import { getStatus } from './features/stats/api'
import { usePolling } from './hooks/usePolling'
import { useWindowFocus } from './hooks/useWindowFocus'
import { ConfirmDialog } from './components/ui/confirm-dialog'
import { Skeleton } from './components/ui/skeleton'
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

type TimeRange =
  | { mode: 'live' }
  | { mode: 'preset'; hours: number; label: string }
  | { mode: 'custom'; from: string; to: string }

function rangeLabel(r: TimeRange): string {
  if (r.mode === 'live') return 'Live'
  if (r.mode === 'preset') return r.label
  if (r.from && r.to) return `${r.from.slice(0, 16)} → ${r.to.slice(0, 16)}`
  return 'Custom Range'
}

function rangeCutoff(r: TimeRange): { from?: string; to?: string } {
  if (r.mode === 'live') return {}
  if (r.mode === 'preset') return { from: new Date(Date.now() - r.hours * 3_600_000).toISOString() }
  return { from: r.from ? new Date(r.from).toISOString() : undefined, to: r.to ? new Date(r.to).toISOString() : undefined }
}

async function exportLogsCSV(range: TimeRange) {
  const { from, to } = rangeCutoff(range)
  const logs = await apiGet<Array<{ id: number; timestamp: string; domain: string; client_ip: string; action: string }>>('/logs?limit=10000')
  const filtered = logs.filter(l => {
    if (from && l.timestamp < from) return false
    if (to   && l.timestamp > to)   return false
    return true
  })
  if (filtered.length === 0) {
    toast.info('No logs to export', { description: `No queries found for the selected range.` })
    return
  }
  const header = 'id,timestamp,domain,client_ip,action'
  const rows = filtered.map(l => `${l.id},${l.timestamp},${l.domain},${l.client_ip},${l.action}`)
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `netshield-logs-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Report exported', { description: `${filtered.length} entries downloaded.` })
}

// Page wrapper with enter animation
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      {children}
    </div>
  )
}

const CHART_POINTS = 30
const TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: 'none',
  borderRadius: 0,
  fontSize: 11,
  fontFamily: 'monospace',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
}

// Each sample stores the DELTA (new queries since last poll), not cumulative totals.
type ChartSample = { time: string; total: number; blocked: number; cached: number; allowed: number }
// Snapshot of raw cumulative counts from the API — used to compute deltas.
type Snapshot = { forwarded: number; blocked: number; cached: number }

function NetworkLoadChart() {
  const [data, setData] = useState<ChartSample[]>(() =>
    Array(CHART_POINTS).fill(null).map(() => ({ time: '', total: 0, blocked: 0, cached: 0, allowed: 0 }))
  )
  // Holds the last raw cumulative counts so we can diff
  const prevRef = useMemo<{ current: Snapshot | null }>(() => ({ current: null }), [])
  // Cumulative totals from API (for the analytics pills)
  const [cumulative, setCumulative] = useState<Snapshot>({ forwarded: 0, blocked: 0, cached: 0 })
  const [loading, setLoading] = useState(true)

  const fetchFn = useCallback(async () => {
    try {
      const s = await getStatus()
      const fwd  = s.queries_forwarded ?? 0
      const blk  = s.queries_blocked   ?? 0
      const cach = s.queries_cached    ?? 0

      setCumulative({ forwarded: fwd, blocked: blk, cached: cach })

      // Compute delta vs last snapshot
      const prev = prevRef.current
      const dFwd  = prev ? Math.max(0, fwd  - prev.forwarded) : 0
      const dBlk  = prev ? Math.max(0, blk  - prev.blocked)   : 0
      const dCach = prev ? Math.max(0, cach - prev.cached)    : 0
      prevRef.current = { forwarded: fwd, blocked: blk, cached: cach }

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      setData(prev => [...prev.slice(1), {
        time,
        total:   dFwd + dBlk + dCach,
        allowed: dFwd,
        blocked: dBlk,
        cached:  dCach,
      }])
      setLoading(false)
    } catch { setLoading(false) }
  }, [prevRef])

  usePolling(fetchFn, 3000)

  const cumTotal = cumulative.forwarded + cumulative.blocked + cumulative.cached
  const cumPctBlocked  = cumTotal > 0 ? Math.round((cumulative.blocked  / cumTotal) * 100) : 0
  const cumPctAllowed  = cumTotal > 0 ? Math.round((cumulative.forwarded / cumTotal) * 100) : 0
  const cumPctCached   = cumTotal > 0 ? Math.round((cumulative.cached   / cumTotal) * 100) : 0

  const pieData = useMemo(() => [
    { name: 'Allowed', value: cumulative.forwarded, pct: cumPctAllowed,  color: '#22c55e' },
    { name: 'Blocked', value: cumulative.blocked,   pct: cumPctBlocked,  color: '#f43f5e' },
    { name: 'Cached',  value: cumulative.cached,    pct: cumPctCached,   color: 'hsl(var(--primary))' },
  ].filter(d => d.value > 0), [cumulative, cumPctAllowed, cumPctBlocked, cumPctCached])

  const hasData = cumTotal > 0

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="pb-0 pt-4 px-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Title */}
          <div>
            <CardTitle className="text-lg flex items-center gap-2 font-bold tracking-tight text-foreground">
              <BarChart3 className="h-5 w-5 text-primary" />
              Network Load
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-0.5">
              Live query rate · updates every 3s
            </CardDescription>
          </div>

          {/* Analytics pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Total Queries',    value: cumTotal.toLocaleString(),          color: 'text-foreground',                   bg: 'bg-muted/50' },
              { label: 'Blocked',          value: cumulative.blocked.toLocaleString(), color: 'text-rose-500',                     bg: 'bg-rose-500/10' },
              { label: '% Blocked',        value: `${cumPctBlocked}%`,                color: 'text-rose-500',                     bg: 'bg-rose-500/10' },
              { label: '% Allowed',        value: `${cumPctAllowed}%`,                color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map(pill => (
              <div key={pill.label} className={`flex flex-col items-center px-3 py-1.5 ${pill.bg}`}>
                <span className={`text-sm font-bold tabular-nums ${pill.color}`}>{loading ? '—' : pill.value}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{pill.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 px-2 pt-2">
        {loading ? (
          <Skeleton className="w-full h-[200px]" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Area chart — 2/3 width */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradAllowed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradBlocked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCached" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'currentColor', opacity: 0.4 }}
                    tickLine={false}
                    axisLine={false}
                    interval={Math.floor(CHART_POINTS / 5)}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'currentColor', opacity: 0.4 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={30}
                    label={{ value: 'req/3s', angle: -90, position: 'insideLeft', offset: 16, style: { fontSize: 8, fill: 'currentColor', opacity: 0.3, fontFamily: 'monospace' } }}
                  />
                  <RechartsTooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 9 }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 2' }}
                    formatter={(value: number, name: string) => [`${value} req`, name]}
                  />
                  <Area type="monotone" dataKey="allowed" name="Allowed" stroke="#22c55e" strokeWidth={1.5} fill="url(#gradAllowed)" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="blocked" name="Blocked" stroke="#f43f5e" strokeWidth={1.5} fill="url(#gradBlocked)" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="cached"  name="Cached"  stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#gradCached)" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut + legend — 1/3 width */}
            <div className="flex flex-col items-center justify-center px-2 py-2">
              {hasData ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={TOOLTIP_STYLE}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full space-y-1.5 px-1">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-2 h-2 shrink-0" style={{ background: d.color }} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold text-foreground tabular-nums">{d.value.toLocaleString()}</span>
                          <span className="text-[9px] text-muted-foreground tabular-nums">({d.pct}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-10">
                  <div className="w-16 h-16 bg-muted/30 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">No traffic yet</p>
                  <p className="text-[9px] text-muted-foreground/60 text-center">Make a DNS query to see data</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const PRESETS: TimeRange[] = [
  { mode: 'live' },
  { mode: 'preset', hours: 1,    label: 'Last 1 Hour'  },
  { mode: 'preset', hours: 24,   label: 'Last 24 Hours' },
  { mode: 'preset', hours: 168,  label: 'Last 7 Days'  },
]

const Dashboard = () => {
  const [range, setRange] = useState<TimeRange>({ mode: 'live' })
  const [showPicker, setShowPicker] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo,   setCustomTo]   = useState('')
  const [exporting, setExporting] = useState(false)

  const applyCustom = () => {
    if (!customFrom || !customTo) return
    setRange({ mode: 'custom', from: customFrom, to: customTo })
    setShowPicker(false)
  }

  const handleExport = async () => {
    setExporting(true)
    try { await exportLogsCSV(range) } finally { setExporting(false) }
  }

  const isLive = range.mode === 'live'

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Network Overview</h2>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Real-time monitoring for your DNS server.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time range selector */}
            <div className="relative">
              <div className="flex bg-muted/50 p-0.5 gap-0">
                {PRESETS.map(p => {
                  const label = p.mode === 'live' ? 'Live' : (p.mode === 'preset' ? p.label : 'Custom')
                  const active = range.mode === p.mode && (p.mode !== 'preset' || (range.mode === 'preset' && range.hours === p.hours))
                  return (
                    <button
                      key={label}
                      onClick={() => { setRange(p); setShowPicker(false) }}
                      className={`px-3 h-8 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        active
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {p.mode === 'live' && (
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
                      )}
                      {label}
                    </button>
                  )
                })}
                <button
                  onClick={() => setShowPicker(v => !v)}
                  className={`px-3 h-8 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                    range.mode === 'custom'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  {range.mode === 'custom' ? rangeLabel(range) : 'Custom'}
                </button>
              </div>

              {/* Custom date-time range picker dropdown */}
              {showPicker && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-card shadow-xl p-4 w-[340px] space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Custom Date & Time Range</p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">From</label>
                      <input
                        type="datetime-local"
                        value={customFrom}
                        onChange={e => setCustomFrom(e.target.value)}
                        className="w-full bg-muted px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">To</label>
                      <input
                        type="datetime-local"
                        value={customTo}
                        onChange={e => setCustomTo(e.target.value)}
                        className="w-full bg-muted px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="flex-1 text-[10px] font-bold uppercase tracking-widest" onClick={applyCustom} disabled={!customFrom || !customTo}>
                      Apply Range
                    </Button>
                    <Button size="sm" variant="ghost" className="text-[10px] font-bold uppercase tracking-widest" onClick={() => setShowPicker(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Export */}
            <Button
              size="sm"
              className="gap-2 shadow-sm text-[10px] font-bold uppercase tracking-widest"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? 'Exporting…' : 'Export Report'}
            </Button>
          </div>
        </div>

        <StatsCards />
        <NetworkLoadChart />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <LogTable compact />
          </div>
          <div className="lg:col-span-4 flex flex-col">
            <SystemHealth />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

const LogsPage = () => (
  <PageTransition>
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Query Log</h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Real-time DNS traffic and security events across your network.</p>
      </div>
      <LogTable />
    </div>
  </PageTransition>
)

type SteeringRule = {
  id: number
  name: string
  condition_type: string
  condition_value: string
  action_type: string
  action_target: string
  priority: number
  enabled: boolean
}

const CONDITION_PLACEHOLDERS: Record<string, string> = {
  'Domain':     '*.corp.internal',
  'Client IP':  '192.168.1.0/24',
  'Query Type': 'A, AAAA',
  'Time Range': '09:00-18:00',
}

const ACTION_COLORS: Record<string, string> = {
  'Forward':  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'Block':    'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'Redirect': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

const sel = "flex h-10 w-full bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-colors"

const SteeringPage = () => {
  const [rules, setRules] = useState<SteeringRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [conditionType, setConditionType] = useState('Domain')
  const [conditionValue, setConditionValue] = useState('')
  const [actionType, setActionType] = useState('Forward')
  const [actionTarget, setActionTarget] = useState('')
  const [priority, setPriority] = useState(1)
  const fetchedRef = useRef(false)

  const fetchRules = useCallback(async () => {
    try {
      const data = await apiGet<SteeringRule[]>('/steering')
      setRules(data ?? [])
    } catch {
      toast.error('Failed to load steering rules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!fetchedRef.current) { fetchedRef.current = true; fetchRules() }
  }, [fetchRules])

  usePolling(fetchRules, 10000, [])
  useWindowFocus(fetchRules)

  const resetForm = () => {
    setName(''); setConditionValue(''); setActionTarget(''); setPriority(1)
    setConditionType('Domain'); setActionType('Forward')
  }

  const handleAdd = async () => {
    if (!name.trim() || !conditionValue.trim()) {
      toast.warning('Fill in rule name and condition value')
      return
    }
    setSaving(true)
    try {
      const res = await apiPost('/steering', {
        name: name.trim(),
        condition_type: conditionType,
        condition_value: conditionValue.trim(),
        action_type: actionType,
        action_target: actionType === 'Block' ? '' : actionTarget.trim(),
        priority,
        enabled: true,
      }) as { id: number }
      setRules(prev => [...prev, {
        id: res.id,
        name: name.trim(),
        condition_type: conditionType,
        condition_value: conditionValue.trim(),
        action_type: actionType,
        action_target: actionType === 'Block' ? '' : actionTarget.trim(),
        priority,
        enabled: true,
      }].sort((a, b) => a.priority - b.priority))
      resetForm()
      toast.success('Rule added', { description: name.trim() })
    } catch {
      toast.error('Failed to add rule')
    } finally {
      setSaving(false)
    }
  }

  const toggleRule = async (rule: SteeringRule) => {
    try {
      await apiPut('/steering', { id: rule.id, enabled: !rule.enabled })
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
      toast.success(rule.enabled ? 'Rule disabled' : 'Rule enabled', { description: rule.name })
    } catch {
      toast.error('Failed to update rule')
    }
  }

  const deleteRule = async (id: number) => {
    try {
      await apiDelete('/steering', { id })
      setRules(prev => prev.filter(r => r.id !== id))
      setDeleteTarget(null)
      toast.success('Rule deleted')
    } catch {
      toast.error('Failed to delete rule')
    }
  }

  const activeCount = rules.filter(r => r.enabled).length

  const renderSkeletonRows = () =>
    Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i} className={i % 2 === 1 ? 'bg-muted/[0.15]' : ''}>
        <TableCell><Skeleton className="h-3 w-6" /></TableCell>
        <TableCell><Skeleton className="h-3 w-32" /></TableCell>
        <TableCell><Skeleton className="h-3 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-9 ml-auto" /></TableCell>
        <TableCell />
      </TableRow>
    ))

  return (
    <PageTransition>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete steering rule?"
        description="This rule will be permanently removed and no longer applied to DNS traffic."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteTarget !== null && deleteRule(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Traffic Steering</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Define routing rules to control how DNS traffic is resolved across your network.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Rules',    value: loading ? null : rules.length,       icon: <Globe className="h-5 w-5 text-primary" />,      bg: 'bg-primary/10' },
            { label: 'Active Rules',   value: loading ? null : activeCount,         icon: <Gauge className="h-5 w-5 text-emerald-500" />,   bg: 'bg-emerald-500/10' },
            { label: 'Disabled Rules', value: loading ? null : rules.length - activeCount, icon: <Power className="h-5 w-5 text-muted-foreground" />, bg: 'bg-muted/60' },
          ].map(card => (
            <Card key={card.label} className="shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                  {card.icon}
                </div>
                <div>
                  {card.value == null
                    ? <Skeleton className="h-7 w-12 mb-1" />
                    : <p className="text-2xl font-bold text-foreground tabular-nums">{card.value}</p>
                  }
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create rule form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-12 shadow-sm">
            <CardHeader className="pb-4 bg-muted/5">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-primary" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-foreground">Create Steering Rule</CardTitle>
              </div>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Route DNS traffic based on domain, client IP, query type, or time.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Rule Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Block Social Media" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Priority</label>
                  <select value={priority} onChange={e => setPriority(Number(e.target.value))} className={sel}>
                    {[1,2,3,4,5,6,7,8,9,10].map(p => <option key={p} value={p}>#{p} — {p === 1 ? 'Highest' : p === 10 ? 'Lowest' : `Priority ${p}`}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Condition Type</label>
                  <select value={conditionType} onChange={e => setConditionType(e.target.value)} className={sel}>
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
                    onChange={e => setConditionValue(e.target.value)}
                    placeholder={CONDITION_PLACEHOLDERS[conditionType]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Action</label>
                  <select value={actionType} onChange={e => { setActionType(e.target.value); if (e.target.value === 'Block') setActionTarget('') }} className={sel}>
                    <option>Forward</option>
                    <option>Block</option>
                    <option>Redirect</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">
                    Target {actionType === 'Block' ? <span className="text-muted-foreground font-normal">(not required)</span> : ''}
                  </label>
                  <Input
                    value={actionTarget}
                    onChange={e => setActionTarget(e.target.value)}
                    placeholder={actionType === 'Forward' ? '10.0.0.1:53' : actionType === 'Redirect' ? '192.168.1.100' : '—'}
                    disabled={actionType === 'Block'}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest" onClick={resetForm}>
                  Reset
                </Button>
                <Button className="text-[10px] font-bold uppercase tracking-widest shadow-sm gap-2" onClick={handleAdd} disabled={saving}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  {saving ? 'Adding…' : 'Add Rule'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules table */}
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="pb-3 bg-muted/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-foreground">Active Rules</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Evaluated in priority order — #1 runs first.</CardDescription>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {rules.length} rule{rules.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-4 w-[50px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground">#</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Condition</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[90px]">Enabled</TableHead>
                  <TableHead className="pr-4 w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? renderSkeletonRows() : rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-3 py-4 text-muted-foreground">
                        <Globe className="h-8 w-8 opacity-40" />
                        <div>
                          <p className="text-sm font-medium">No steering rules yet</p>
                          <p className="text-xs opacity-70 mt-1">Create a rule above to start routing DNS traffic</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rules.map((rule, idx) => (
                  <TableRow key={rule.id} className={`group transition-colors hover:bg-muted/30 ${idx % 2 === 1 ? 'bg-muted/[0.15]' : ''} ${!rule.enabled ? 'opacity-50' : ''}`}>
                    <TableCell className="pl-4">
                      <span className="text-[10px] font-bold text-muted-foreground tabular-nums">#{rule.priority}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-foreground">{rule.name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/60 px-2 py-1 shrink-0">
                          {rule.condition_type}
                        </span>
                        <span className="font-mono text-[11px] text-foreground">{rule.condition_value}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[9px] font-bold px-2 py-0.5 border-none shrink-0 ${ACTION_COLORS[rule.action_type] || ACTION_COLORS['Forward']}`}>
                          {rule.action_type}
                        </Badge>
                        {rule.action_target && (
                          <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[120px]">→ {rule.action_target}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule)} size="sm" />
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(rule.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}

const UPSTREAM_OPTIONS = [
  { label: 'Cloudflare (1.1.1.1) — DoT', value: '1.1.1.1:853' },
  { label: 'Google (8.8.8.8) — DoT', value: '8.8.8.8:853' },
  { label: 'Quad9 (9.9.9.9) — DoT', value: '9.9.9.9:853' },
]

const THEME_OPTIONS: { label: string; value: Theme; icon: React.ElementType }[] = [
  { label: 'Light', value: 'light', icon: Sun },
  { label: 'Dark', value: 'dark', icon: Moon },
  { label: 'System', value: 'system', icon: Monitor },
]

const SettingsPage = () => {
  const { theme, setTheme } = useTheme()
  const [serverName, setServerName] = useState('north-america-east-1')
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [upstream, setUpstream] = useState('1.1.1.1:853')
  const [customUpstream, setCustomUpstream] = useState('')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [savedSnapshot, setSavedSnapshot] = useState<{ serverName: string; autoUpdate: boolean; upstream: string; customUpstream: string } | null>(null)

  useEffect(() => {
    getSettings().then((s) => {
      const sn = s.server_name || 'north-america-east-1'
      const au = s.auto_update ? s.auto_update === 'true' : true
      const up = s.upstream_dns || '1.1.1.1:53'
      const isKnown = UPSTREAM_OPTIONS.some(o => o.value === up)
      const cu = isKnown ? '' : up
      const resolvedUp = isKnown ? up : 'custom'
      setServerName(sn); setAutoUpdate(au); setUpstream(resolvedUp); setCustomUpstream(cu)
      setSavedSnapshot({ serverName: sn, autoUpdate: au, upstream: resolvedUp, customUpstream: cu })
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const resolvedUpstream = upstream === 'custom' ? customUpstream : upstream
    try {
      await saveSettings({ server_name: serverName, auto_update: String(autoUpdate), upstream_dns: resolvedUpstream })
      setSavedSnapshot({ serverName, autoUpdate, upstream, customUpstream })
      toast.success('Settings saved', { description: `Upstream: ${resolvedUpstream}` })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    if (savedSnapshot) {
      setServerName(savedSnapshot.serverName)
      setAutoUpdate(savedSnapshot.autoUpdate)
      setUpstream(savedSnapshot.upstream)
      setCustomUpstream(savedSnapshot.customUpstream)
    }
  }

  const isCustom = upstream === 'custom' || !UPSTREAM_OPTIONS.find(o => o.value === upstream)

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Configure your DNS server and security preferences.</p>
        </div>

        {!loaded ? (
          <div className="grid gap-6">
            <Card className="shadow-sm">
              <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="font-bold tracking-tight text-foreground">Appearance</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Choose between light, dark, or follow your device setting.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map(({ label, value, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`flex flex-col items-center gap-2 p-4 transition-colors cursor-pointer ${theme === value ? 'bg-primary/10 text-primary' : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
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
                  <input className="flex h-9 w-full sm:w-64 bg-muted px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-medium text-foreground" value={serverName} onChange={e => setServerName(e.target.value)} />
                </div>
                <div className="h-[1px] bg-muted" />
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">Automatic Updates</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Keep blocklists and firmware up to date</p>
                  </div>
                  <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="font-bold tracking-tight text-foreground">Upstream DNS</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Select your preferred upstream DNS provider for resolution.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {UPSTREAM_OPTIONS.map((opt) => (
                    <div key={opt.value} onClick={() => setUpstream(opt.value)} className={`flex items-center space-x-3 p-3 transition-colors cursor-pointer ${upstream === opt.value ? 'bg-primary/10 text-primary' : 'bg-muted/40 hover:bg-muted/70'}`}>
                      <div className={`h-4 w-4 flex items-center justify-center transition-colors ${upstream === opt.value ? 'bg-primary' : 'bg-muted'}`}>
                        {upstream === opt.value && <div className="h-1.5 w-1.5 bg-primary-foreground" />}
                      </div>
                      <span className="text-sm font-bold text-foreground">{opt.label}</span>
                    </div>
                  ))}
                  <div onClick={() => setUpstream('custom')} className={`flex items-center space-x-3 p-3 transition-colors cursor-pointer ${isCustom ? 'bg-primary/10 text-primary' : 'bg-muted/40 hover:bg-muted/70'}`}>
                    <div className={`h-4 w-4 flex items-center justify-center transition-colors ${isCustom ? 'bg-primary' : 'bg-muted'}`}>
                      {isCustom && <div className="h-1.5 w-1.5 bg-primary-foreground" />}
                    </div>
                    <span className="text-sm font-bold text-foreground">Custom Provider</span>
                  </div>
                </div>
                {isCustom && (
                  <input className="flex h-9 w-full bg-muted px-3 py-1 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="e.g. 192.168.1.1:53" value={customUpstream} onChange={e => setCustomUpstream(e.target.value)} />
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest" onClick={handleDiscard} disabled={!savedSnapshot}>Discard Changes</Button>
              <Button className="shadow-sm text-[10px] font-bold uppercase tracking-widest" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Configuration'}</Button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

const ProfilePage = () => {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      await apiPut('/password', { current_password: currentPw, new_password: newPw })
      toast.success('Password changed successfully')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Manage your account details and preferences.</p>
        </div>
        <div className="grid gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-bold tracking-tight text-foreground">Change Password</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Update your admin account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(['Current Password', 'New Password', 'Confirm New Password'] as const).map((label, i) => {
                const val = [currentPw, newPw, confirmPw][i]
                const setter = [setCurrentPw, setNewPw, setConfirmPw][i]
                return (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm font-bold text-foreground">{label}</p>
                    <input type="password" value={val} onChange={e => setter(e.target.value)} className="flex h-9 w-full sm:w-64 bg-muted px-3 py-1 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                )
              })}
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest" onClick={() => { setCurrentPw(''); setNewPw(''); setConfirmPw('') }}>Discard</Button>
            <Button className="shadow-sm text-[10px] font-bold uppercase tracking-widest" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

const CloudSyncPage = () => {
  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Cloud Sync</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Synchronize your configuration across nodes and clusters.</p>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-muted/60 flex items-center justify-center">
              <Cloud className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">Coming Soon</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Multi-node synchronisation is not yet available in this release.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Animated route container — re-triggers on path change
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <Routes location={location}>
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
  )
}

export default function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'bg-card text-foreground shadow-lg',
            title: 'text-sm font-bold',
            description: 'text-xs text-muted-foreground',
            success: 'border-emerald-500/30',
            error: 'border-destructive/30',
            warning: 'border-amber-500/30',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AnimatedRoutes />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

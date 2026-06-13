import React from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { UPSTREAM_OPTIONS, THEME_OPTIONS } from '../constants'
import type { Theme } from '@/hooks/useTheme'
import type { SettingsViewModel } from '../hooks/useSettings'

interface SettingsPresenterProps extends SettingsViewModel {}

export const SettingsPresenter: React.FC<SettingsPresenterProps> = ({
  theme,
  setTheme,
  upstream,
  setUpstream,
  customUpstream,
  setCustomUpstream,
  blockNXDomain,
  setBlockNXDomain,
  saving,
  loaded,
  isCustom,
  handleSave,
  handleDiscard,
}) => {
  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Settings"
        description="Configure your DNS server and security preferences."
      />

      {!loaded ? (
        <div className="grid gap-6">
          <Card className="shadow-sm rounded-none">
            <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6" data-tour="settings-card">
          <Card className="shadow-sm rounded-none">
            <CardHeader>
              <CardTitle className="font-bold tracking-tight text-foreground">Appearance</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Choose between light, dark, or follow your device setting.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {THEME_OPTIONS.map(({ label, value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as Theme)}
                    className={`flex flex-col items-center gap-2 p-4 transition-colors cursor-pointer rounded-none ${theme === value ? 'bg-primary/10 text-primary' : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm rounded-none">
            <CardHeader>
              <CardTitle className="font-bold tracking-tight text-foreground">DNS Behaviour</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Control how blocked domains are answered.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">Return NXDOMAIN for blocked domains</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Off — returns <span className="font-mono text-foreground">0.0.0.0</span> (sink-hole, faster for clients)
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    On — returns <span className="font-mono text-foreground">NXDOMAIN</span> (domain does not exist)
                  </p>
                </div>
                <Switch checked={blockNXDomain} onCheckedChange={setBlockNXDomain} className="rounded-none" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm rounded-none">
            <CardHeader>
              <CardTitle className="font-bold tracking-tight text-foreground">Upstream DNS</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Select your preferred upstream DNS provider for resolution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {UPSTREAM_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setUpstream(opt.value)}
                    className={`flex items-center space-x-3 p-3 transition-colors cursor-pointer rounded-none ${upstream === opt.value ? 'bg-primary/10 text-primary' : 'bg-muted/40 hover:bg-muted/70'}`}
                  >
                    <div className={`h-4 w-4 flex items-center justify-center transition-colors rounded-none ${upstream === opt.value ? 'bg-primary' : 'bg-muted'}`}>
                      {upstream === opt.value && <div className="h-1.5 w-1.5 bg-primary-foreground rounded-none" />}
                    </div>
                    <span className="text-sm font-bold text-foreground">{opt.label}</span>
                  </div>
                ))}
                <div
                  onClick={() => setUpstream('custom')}
                  className={`flex items-center space-x-3 p-3 transition-colors cursor-pointer rounded-none ${isCustom ? 'bg-primary/10 text-primary' : 'bg-muted/40 hover:bg-muted/70'}`}
                >
                  <div className={`h-4 w-4 flex items-center justify-center transition-colors rounded-none ${isCustom ? 'bg-primary' : 'bg-muted'}`}>
                    {isCustom && <div className="h-1.5 w-1.5 bg-primary-foreground rounded-none" />}
                  </div>
                  <span className="text-sm font-bold text-foreground">Custom Provider</span>
                </div>
              </div>
              {isCustom && (
                <div className="space-y-2">
                  <input
                    className="flex h-10 w-full font-mono text-sm input-premium rounded-none"
                    placeholder="e.g. 192.168.1.1:53 or 192.168.1.1:853"
                    value={customUpstream}
                    onChange={e => setCustomUpstream(e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Use <span className="font-mono text-foreground">:853</span> for DNS-over-TLS (encrypted) · <span className="font-mono text-foreground">:53</span> for plain UDP (ISP can see queries)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button variant="outline" className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest btn-premium rounded-none" onClick={handleDiscard}>Discard Changes</Button>
            <Button className="w-full sm:w-auto shadow-sm text-[10px] font-bold uppercase tracking-widest btn-premium glow-primary rounded-none" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Configuration'}</Button>
          </div>
        </div>
      )}
    </div>
  )
}

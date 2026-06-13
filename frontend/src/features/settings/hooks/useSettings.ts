import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTheme, type Theme } from '@/hooks/useTheme'
import { dispatchNotificationsUpdate } from '@/lib/notifications'
import { getSettings, saveSettings } from '../api'
import { UPSTREAM_OPTIONS } from '../constants'

export interface SettingsViewModel {
  theme: Theme
  setTheme: (v: Theme) => void
  upstream: string
  setUpstream: (v: string) => void
  customUpstream: string
  setCustomUpstream: (v: string) => void
  blockNXDomain: boolean
  setBlockNXDomain: (v: boolean) => void
  saving: boolean
  loaded: boolean
  isCustom: boolean
  handleSave: () => Promise<void>
  handleDiscard: () => void
}

export function useSettings(): SettingsViewModel {
  const { theme, setTheme } = useTheme()
  const [upstream, setUpstream] = useState('1.1.1.1:853')
  const [customUpstream, setCustomUpstream] = useState('')
  const [blockNXDomain, setBlockNXDomain] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getSettings().then((s) => {
      if (s.upstream_dns) {
        const isKnown = UPSTREAM_OPTIONS.find(o => o.value === s.upstream_dns)
        if (isKnown) {
          setUpstream(s.upstream_dns)
        } else {
          setUpstream('custom')
          setCustomUpstream(s.upstream_dns)
        }
      }
      if (s.block_nxdomain) setBlockNXDomain(s.block_nxdomain === 'true')
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  const handleSave = async () => {
    const resolvedUpstream = upstream === 'custom' ? customUpstream.trim() : upstream
    if (!resolvedUpstream) {
      toast.error('Enter a custom DNS address')
      return
    }
    setSaving(true)
    try {
      await saveSettings({ upstream_dns: resolvedUpstream, block_nxdomain: String(blockNXDomain) })
      toast.success('Settings saved', { description: `Upstream: ${resolvedUpstream}` })
      dispatchNotificationsUpdate()
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setUpstream('1.1.1.1:853')
    setBlockNXDomain(false)
  }

  return {
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
    isCustom: upstream === 'custom',
    handleSave,
    handleDiscard,
  }
}

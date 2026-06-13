import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth'
import { apiPut } from '@/hooks/api'
import { dispatchNotificationsUpdate } from '@/lib/notifications'

export interface ProfileViewModel {
  displayName: string
  setDisplayName: (v: string) => void
  email: string
  setEmail: (v: string) => void
  currentPw: string
  setCurrentPw: (v: string) => void
  newPw: string
  setNewPw: (v: string) => void
  confirmPw: string
  setConfirmPw: (v: string) => void
  saving: boolean
  handleSave: () => Promise<void>
  handleDiscard: () => void
}

export function useProfile(): ProfileViewModel {
  const { user, updateProfile } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  const handleDiscard = () => {
    if (user) {
      setDisplayName(user.name || '')
      setEmail(user.email || '')
    }
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
  }

  const handleSave = async () => {
    const isChangingPassword = currentPw || newPw || confirmPw
    if (isChangingPassword) {
      if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
      if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return }
    }
    if (!displayName.trim() || !email.trim()) {
      toast.error('Display Name and Email cannot be empty')
      return
    }

    setSaving(true)
    try {
      const profileChanged = displayName.trim() !== (user?.name || '') || email.trim().toLowerCase() !== (user?.email || '').toLowerCase()
      if (profileChanged) {
        await updateProfile(displayName.trim(), email.trim().toLowerCase())
        toast.success('Profile updated successfully')
        dispatchNotificationsUpdate()
      }

      if (isChangingPassword) {
        const res = await apiPut('/password', { current_password: currentPw, new_password: newPw }) as { ok?: boolean; error?: string }
        if (res.ok) {
          toast.success('Password changed successfully')
          dispatchNotificationsUpdate()
          setCurrentPw(''); setNewPw(''); setConfirmPw('')
        } else {
          toast.error(res.error ?? 'Failed to change password')
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return { displayName, setDisplayName, email, setEmail, currentPw, setCurrentPw, newPw, setNewPw, confirmPw, setConfirmPw, saving, handleSave, handleDiscard }
}

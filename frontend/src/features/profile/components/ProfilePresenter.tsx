import React from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ProfileViewModel } from '../hooks/useProfile'

interface ProfilePresenterProps extends ProfileViewModel {}

export const ProfilePresenter: React.FC<ProfilePresenterProps> = ({
  displayName,
  setDisplayName,
  email,
  setEmail,
  currentPw,
  setCurrentPw,
  newPw,
  setNewPw,
  confirmPw,
  setConfirmPw,
  saving,
  handleSave,
  handleDiscard,
}) => {
  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Profile"
        description="Manage your account details and preferences."
      />
      <div className="grid gap-6">
        <Card className="shadow-sm rounded-none" data-tour="profile-card">
          <CardHeader>
            <CardTitle className="font-bold tracking-tight text-foreground">Account Details</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Your dynamic OmniDNS account profile info.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-border/40">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Account Type</p>
              <p className="text-sm font-bold text-foreground">System Administrator</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-border/40">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Display Name</p>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="flex h-10 w-full sm:w-64 input-premium rounded-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Email Address</p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex h-10 w-full sm:w-64 input-premium rounded-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-none">
          <CardHeader>
            <CardTitle className="font-bold tracking-tight text-foreground">Change Password</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Update your admin account password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(
              [
                { label: 'Current Password', value: currentPw, setter: setCurrentPw },
                { label: 'New Password',     value: newPw,     setter: setNewPw     },
                { label: 'Confirm New Password', value: confirmPw, setter: setConfirmPw },
              ] as const
            ).map(({ label, value, setter }) => (
              <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm font-bold text-foreground">{label}</p>
                <input
                  type="password"
                  value={value}
                  onChange={e => setter(e.target.value)}
                  className="flex h-10 w-full sm:w-64 input-premium rounded-none"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest btn-premium rounded-none"
            onClick={handleDiscard}
          >
            Discard
          </Button>
          <Button
            className="w-full sm:w-auto shadow-sm text-[10px] font-bold uppercase tracking-widest btn-premium glow-primary rounded-none"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

import { useSettings } from '../hooks/useSettings'
import { SettingsPresenter } from './SettingsPresenter'

export default function SettingsPage() {
  const settingsState = useSettings()

  return <SettingsPresenter {...settingsState} />
}

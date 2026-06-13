import { useProfile } from '../hooks/useProfile'
import { ProfilePresenter } from './ProfilePresenter'

export default function ProfilePage() {
  const profileState = useProfile()

  return <ProfilePresenter {...profileState} />
}

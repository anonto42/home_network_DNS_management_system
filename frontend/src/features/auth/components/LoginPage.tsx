import { useLogin } from '../hooks/useLogin'
import { LoginPresenter } from './LoginPresenter'

export default function LoginPage() {
  const loginState = useLogin()

  return <LoginPresenter {...loginState} />
}

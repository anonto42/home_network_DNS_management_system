import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

export interface LoginViewModel {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  showPw: boolean
  setShowPw: (v: boolean) => void
  error: string
  loading: boolean
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function useLogin(): LoginViewModel {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Email and password required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return { email, setEmail, password, setPassword, showPw, setShowPw, error, loading, handleSubmit }
}

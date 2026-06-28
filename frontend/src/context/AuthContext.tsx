import { createContext, useContext, useEffect, useState } from 'react'
import { login, getMe } from '../api/auth'
import { getToken, setToken } from '../api/client'

type AuthStatus = 'loading' | 'authenticated' | 'error'

interface AuthState {
  status: AuthStatus
  error: string | null
  retry: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME ?? 'admin'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? ''

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  async function authenticate() {
    setStatus('loading')
    setError(null)
    try {
      // Reuse an existing valid token if present, else auto-login.
      if (getToken()) {
        try {
          await getMe()
          setStatus('authenticated')
          return
        } catch {
          setToken(null)
        }
      }
      await login(ADMIN_USERNAME, ADMIN_PASSWORD)
      setStatus('authenticated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setStatus('error')
    }
  }

  useEffect(() => {
    authenticate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ status, error, retry: authenticate }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

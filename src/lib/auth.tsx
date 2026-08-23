import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createServerFn } from '@tanstack/react-start'
import {
  handleAuthCallback,
  getUser,
  onAuthChange,
  type User,
} from '@netlify/identity'

type AuthState = {
  user: User | null
  loading: boolean
  callbackType: string | null
  error: string | null
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  callbackType: null,
  error: null,
})

export const getServerUser = createServerFn({ method: 'GET' }).handler(async () => {
  return await getUser()
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, callbackType: null, error: null })

  useEffect(() => {
    let active = true
    const unsubscribe = onAuthChange((_event, user) => {
      if (active) setState((current) => ({ ...current, user, loading: false }))
    })

    async function hydrate() {
      try {
        const callback = await handleAuthCallback()
        if (callback?.type === 'recovery') {
          window.sessionStorage.setItem('handoffos-recovery', '1')
          if (window.location.pathname !== '/reset-password') {
            window.location.assign('/reset-password')
            return
          }
        }
        const user = callback?.user ?? await getUser()
        const recovery = window.sessionStorage.getItem('handoffos-recovery') === '1'
        if (active) setState({ user, loading: false, callbackType: callback?.type ?? (recovery ? 'recovery' : null), error: null })
        if (callback && callback.type !== 'recovery' && user && !['/login', '/signup'].includes(window.location.pathname)) window.location.assign('/dashboard')
      } catch (error) {
        if (active) setState({ user: null, loading: false, callbackType: null, error: error instanceof Error ? error.message : 'Authentication failed.' })
      }
    }
    void hydrate()
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value = useMemo(() => state, [state])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

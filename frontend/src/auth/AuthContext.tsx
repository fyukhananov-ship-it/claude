import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  email: string
  role: string
  partner_id?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          id: payload.sub,
          email: '',
          role: payload.role,
          partner_id: payload.partner_id,
        })
      } catch {
        localStorage.removeItem('access_token')
      }
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) throw new Error('Invalid credentials')

    const data = await response.json()
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)

    const payload = JSON.parse(atob(data.access_token.split('.')[1]))
    setUser({
      id: payload.sub,
      email,
      role: payload.role,
      partner_id: payload.partner_id,
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

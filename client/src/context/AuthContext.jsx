
// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('mm_token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await authAPI.getMe()
        if (res?.data?.user) setUser(res.data.user)
        else logout()
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [token])

  const login = (newToken, userData) => {
    localStorage.setItem('mm_token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('mm_token')
    setToken(null)
    setUser(null)
  }

  const updateUser = (data) => setUser((prev) => ({ ...prev, ...data }))

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
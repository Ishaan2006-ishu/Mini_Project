
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
        setUser(null)
        setLoading(false)
        return
      }
      try {
        const res = await authAPI.getMe()
        if (res?.data?.user) {
          setUser(res.data.user)
        } else {
          logout()
        }
      } catch (err) {
        // Token might be invalid or expired
        logout()
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [token])

  const login = (newToken, userData) => {
    if (!newToken) {
      throw new Error('Token is required for login')
    }
    localStorage.setItem('mm_token', newToken)
    if (userData) {
      localStorage.setItem('mm_user', JSON.stringify(userData))
      setUser(userData)
    }
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('mm_token')
    localStorage.removeItem('mm_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (data) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...data }
      localStorage.setItem('mm_user', JSON.stringify(nextUser))
      return nextUser
    })
  }

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
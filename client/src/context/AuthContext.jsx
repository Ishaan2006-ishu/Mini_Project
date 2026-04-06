import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mm_token')
    const saved = localStorage.getItem('mm_user')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) } catch { localStorage.clear() }
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('mm_token', token)
    localStorage.setItem('mm_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('mm_token')
    localStorage.removeItem('mm_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
import { useState } from 'react'
import { AuthContext } from './authContext'

const readStoredUser = () => {
  const token = localStorage.getItem('mm_token')
  const saved = localStorage.getItem('mm_user')

  if (!token || !saved) return null

  try {
    return JSON.parse(saved)
  } catch {
    localStorage.clear()
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => readStoredUser())
  const [loading] = useState(false)

  const login = (token, userData) => {
    localStorage.setItem('mm_token', token)
    localStorage.setItem('mm_user', JSON.stringify(userData))
    setUser(userData)
  }

  const updateUser = (userData) => {
    localStorage.setItem('mm_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('mm_token')
    localStorage.removeItem('mm_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
import { createContext, useContext, useState } from 'react'
import { login as loginApi } from '../api/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [name, setName] = useState(localStorage.getItem('name'))
  const [email, setEmail] = useState(localStorage.getItem('email'))
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [error, setError] = useState('')

  const login = async (emailInput, password) => {
    setError('')
    try {
      const res = await loginApi(emailInput, password)
      const { token, name, email, systemRole } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('name', name)
      localStorage.setItem('email', email)
      localStorage.setItem('role', systemRole)
      setName(name)
      setEmail(email)
      setRole(systemRole)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    setName(null)
    setEmail(null)
    setRole(null)
  }

  const isAuthenticated = Boolean(localStorage.getItem('token'))
  const isAdmin = role === 'ADMIN'
  const isProjectManager = role === 'PROJECT_MANAGER'

  return (
    <AuthContext.Provider value={{ name, email, role, isAuthenticated, isAdmin, isProjectManager, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

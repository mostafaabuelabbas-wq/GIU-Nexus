import { createContext, useContext, useState } from 'react'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '../utils/tokenUtils'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(getToken())
  const [user, setUserState] = useState(getUser())

  const login = (token, user) => {
    setToken(token)
    setUser(user)
    setTokenState(token)
    setUserState(user)
  }

  const logout = () => {
    removeToken()
    removeUser()
    setTokenState(null)
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{
      token, user, login, logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
import axios from 'axios'
import { getToken, removeToken, removeUser } from '../utils/tokenUtils'

const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      removeToken()
      removeUser()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
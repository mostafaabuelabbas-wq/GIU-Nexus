import axios from 'axios'
import { getToken, removeToken, removeUser } from '../utils/tokenUtils'

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      removeUser()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
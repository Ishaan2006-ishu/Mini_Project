import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5800/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mm_token')
      localStorage.removeItem('mm_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register:  (data)  => api.post('/auth/register', data),
  verifyOtp: (data)  => api.post('/auth/verify-otp', data),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
  login:     (data)  => api.post('/auth/login', data),
  getMe:     ()      => api.get('/auth/me'),
  updateMe:   (data)  => api.patch('/auth/me', data),
}

export const sessionAPI = {
  getRoles:      ()            => api.get('/sessions/roles'),
  getHistory:    ()            => api.get('/sessions/history'),
  getSession:    (id)          => api.get(`/sessions/${id}`),
  startSession:  (data)        => api.post('/sessions/start', data),
  submitSession: (id, answers) => api.post(`/sessions/${id}/submit`, { answers }),
}

export const planAPI = {
  getPlans: () => api.get('/plans'),
}

export default api
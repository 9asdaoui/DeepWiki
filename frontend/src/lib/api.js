import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
}

export const aiAPI = {
  summarizeWiki: (url) => api.get('/ai/summarize', { params: { url } }),
  translateWiki: (url, targetLang) => api.get('/ai/translate', { params: { url, target_lang: targetLang } }),
  generateQuiz: (url) => api.get('/ai/quiz', { params: { url } }),
  submitQuiz: (data) => api.post('/ai/quiz/submit', data),
  getHistory: () => api.get('/ai/history'),
  getQuizHistory: () => api.get('/ai/quiz/history'),
  exportArticle: (articleId, format) => api.get(`/ai/export/${articleId}/${format}`, { responseType: 'blob' }),
  getAdminStats: () => api.get('/ai/admin/stats'),
}

export const uploadAPI = {
  summarizePDF: (formData) => api.post('/upload/pdf/summarize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  translatePDF: (formData) => api.post('/upload/pdf/translate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  generatePDFQuiz: (formData) => api.post('/upload/pdf/quiz', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

export default api

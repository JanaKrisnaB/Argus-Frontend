import axios from 'axios'
import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const http = axios.create({ baseURL: BASE })

// Attach auth token to every request
http.interceptors.request.use(async (config) => {
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const reviewCode = (code, config) =>
  http.post('/api/review', { code, config }).then(r => r.data)

export const getMemoryCount = () =>
  http.get('/api/memory/count').then(r => r.data)

export const listMemories = (limit = 50) =>
  http.get('/api/memory', { params: { limit } }).then(r => r.data)

export const searchMemories = (q, top_k = 5) =>
  http.get('/api/memory/search', { params: { q, top_k } }).then(r => r.data)

export const deleteMemory = (id) =>
  http.delete(`/api/memory/${id}`).then(r => r.data)

export const getMe = () =>
  http.get('/api/auth/me').then(r => r.data)

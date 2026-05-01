import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// If keys are missing (dev mode), create a no-op client
export const supabase = (url && key && !url.includes('your-project'))
  ? createClient(url, key)
  : null

export const isSupabaseConfigured = !!supabase

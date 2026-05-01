import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabase'

import Login         from './pages/Login'
import Dashboard     from './pages/Dashboard'
import Playground    from './pages/Playground'
import ReviewHistory from './pages/ReviewHistory'
import Navbar        from './components/Navbar'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Dev mode — auto-login with a fake user
      setUser({ id: 'dev-user-id', email: 'dev@local.dev' })
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = () => supabase ? supabase.auth.signOut() : setUser(null)

  return (
    <AuthCtx.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <Protected>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 p-6 max-w-screen-2xl mx-auto w-full">
                  <Dashboard />
                </main>
              </div>
            </Protected>
          } />
          <Route path="/playground" element={
            <Protected>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 p-6 max-w-screen-2xl mx-auto w-full">
                  <Playground />
                </main>
              </div>
            </Protected>
          } />
          <Route path="/history" element={
            <Protected>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 p-6 max-w-screen-2xl mx-auto w-full">
                  <ReviewHistory />
                </main>
              </div>
            </Protected>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

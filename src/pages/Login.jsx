import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [mode, setMode]         = useState('signin')  // 'signin' | 'signup'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const navigate = useNavigate()

  // Dev mode — bypass login
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-sm w-full text-center flex flex-col gap-6">
          <div>
            <div className="w-12 h-12 rounded-xl bg-accent mx-auto flex items-center justify-center text-white font-black text-xl mb-4">A</div>
            <h1 className="text-2xl font-bold">Argus</h1>
            <p className="text-muted text-sm mt-1">Dev mode — Supabase not configured</p>
          </div>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
            Continue as Dev User
          </button>
          <p className="text-xs text-muted">
            Add Supabase keys to <code className="bg-white/5 px-1 rounded">frontend/.env</code> to enable auth
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setDone(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-sm w-full text-center flex flex-col gap-4">
        <span className="text-4xl">✓</span>
        <h2 className="font-bold text-lg">Check your email</h2>
        <p className="text-muted text-sm">We sent a confirmation link to <strong>{email}</strong></p>
        <button onClick={() => setDone(false)} className="btn-ghost text-sm">Back to login</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-sm w-full flex flex-col gap-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-accent mx-auto flex items-center justify-center text-white font-black text-xl mb-4">A</div>
          <h1 className="text-2xl font-bold">Argus</h1>
          <p className="text-muted text-sm mt-1">AI-powered code reviewer</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-bg rounded-lg p-1">
          {['signin', 'signup'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all
                ${mode === m ? 'bg-surface text-white shadow' : 'text-muted hover:text-white'}`}>
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted mb-1.5 block">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" className="input" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="input" minLength={6} />
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

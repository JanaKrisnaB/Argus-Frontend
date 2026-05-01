import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMemoryCount, listMemories } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'

function StatCard({ label, value, sub }) {
  return (
    <div className="card flex flex-col gap-1">
      <span className="text-3xl font-bold text-white">{value ?? '—'}</span>
      <span className="text-sm font-medium text-white">{label}</span>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [memCount,  setMemCount]  = useState(null)
  const [revCount,  setRevCount]  = useState(null)
  const [recent,    setRecent]    = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      getMemoryCount().then(d => setMemCount(d.count)).catch(() => setMemCount(0)),
      fetchHistory(),
    ]).finally(() => setLoading(false))
  }, [])

  async function fetchHistory() {
    if (!supabase) { setRevCount(0); setRecent([]); return }
    const { data } = await supabase
      .from('reviews')
      .select('id, config, comment_count, created_at, code_snippet')
      .order('created_at', { ascending: false })
      .limit(5)
    setRevCount(data?.length ?? 0)
    setRecent(data ?? [])
  }

  const configs = { A: 'Baseline', B: 'Tools only', C: 'Full system' }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Welcome back, {user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Memory Records"  value={loading ? '...' : memCount} sub="Isolated to your account" />
        <StatCard label="Reviews Done"    value={loading ? '...' : revCount} sub="Via Playground" />
        <StatCard label="Active Config"   value="C" sub="Full system (recommended)" />
        <StatCard label="LLM Model"       value="Llama 3.3" sub="70B via Groq" />
      </div>

      {/* Quick actions */}
      <div className="flex gap-4">
        <Link to="/playground" className="btn-primary">Start Review</Link>
        <Link to="/history"    className="btn-ghost border border-border">View History</Link>
      </div>

      {/* Recent reviews */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Recent Reviews</h2>
        {recent.length === 0
          ? <p className="text-muted text-sm">No reviews yet — head to the Playground</p>
          : (
            <div className="flex flex-col divide-y divide-border">
              {recent.map(r => (
                <div key={r.id} className="py-3 flex items-center gap-4 text-sm">
                  <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded font-mono">
                    Config {r.config}
                  </span>
                  <span className="text-slate-400 flex-1 truncate font-mono text-xs">
                    {r.code_snippet?.split('\n')[0] || '—'}
                  </span>
                  <span className="text-muted whitespace-nowrap">{r.comment_count} issues</span>
                  <span className="text-muted text-xs whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* About configs */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { key: 'A', name: 'Baseline',    desc: 'Plain LLM review. Fast, ~2 API calls. Higher false-positive rate.', calls: '~2' },
          { key: 'B', name: 'Tools only',  desc: 'ReAct agent + flake8/radon/AST + memory context.', calls: '~4' },
          { key: 'C', name: 'Full system', desc: 'Agent + memory + critic filter. 89% fewer false positives.', calls: '~4+N' },
        ].map(c => (
          <div key={c.key} className="card border-border hover:border-accent/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-accent/15 text-accent w-6 h-6 flex items-center justify-center rounded">{c.key}</span>
              <span className="font-semibold text-sm">{c.name}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">{c.desc}</p>
            <p className="text-xs text-muted mt-2">API calls per review: <span className="text-white">{c.calls}</span></p>
          </div>
        ))}
      </div>
    </div>
  )
}

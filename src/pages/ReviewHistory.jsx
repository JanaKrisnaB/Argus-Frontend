import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const SEVERITY_MAP = {
  low:    'badge-low',
  medium: 'badge-medium',
  high:   'badge-high',
}

function CommentList({ comments }) {
  if (!comments?.length) return <p className="text-xs text-muted">No comments stored</p>
  return (
    <div className="flex flex-col gap-2 mt-3">
      {comments.map((c, i) => (
        <div key={i} className="flex gap-2 text-xs">
          <span className={SEVERITY_MAP[c.severity] || 'badge-low'}>{c.severity?.toUpperCase()}</span>
          <span className="text-slate-400">L{c.line}</span>
          <span className="text-slate-300">{c.comment}</span>
        </div>
      ))}
    </div>
  )
}

function HistoryRow({ r }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 py-4 text-left hover:bg-white/[0.02] transition-colors px-2 rounded-lg"
      >
        <span className="text-xs font-bold bg-accent/15 text-accent w-7 h-7 flex items-center justify-center rounded shrink-0">
          {r.config}
        </span>
        <span className="font-mono text-xs text-slate-400 flex-1 truncate">
          {r.code_snippet?.split('\n')[0] || '—'}
        </span>
        <span className="text-sm text-muted whitespace-nowrap shrink-0">
          {r.comment_count} issue{r.comment_count !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-muted whitespace-nowrap shrink-0">
          {new Date(r.created_at).toLocaleString()}
        </span>
        <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4">
          <pre className="code-editor text-xs max-h-48 overflow-y-auto mb-3">{r.code_snippet}</pre>
          <CommentList comments={r.comments} />
        </div>
      )}
    </div>
  )
}

export default function ReviewHistory() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [config,  setConfig]  = useState('all')

  useEffect(() => { fetchHistory() }, [config])

  async function fetchHistory() {
    setLoading(true)
    if (!supabase) { setRows([]); setLoading(false); return }

    let q = supabase
      .from('reviews')
      .select('id, config, comment_count, created_at, code_snippet, comments')
      .order('created_at', { ascending: false })
      .limit(100)

    if (config !== 'all') q = q.eq('config', config)

    const { data } = await q
    setRows(data ?? [])
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review History</h1>
          <p className="text-muted text-sm mt-1">All your past code reviews</p>
        </div>

        {/* Config filter */}
        <div className="flex gap-2">
          {['all', 'A', 'B', 'C'].map(c => (
            <button key={c} onClick={() => setConfig(c)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all
                ${config === c
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border text-muted hover:text-white'
                }`}
            >
              {c === 'all' ? 'All' : `Config ${c}`}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-muted text-sm text-center py-12">
            No reviews yet — go to the Playground to run your first review
          </p>
        ) : (
          <div>
            <div className="text-xs text-muted mb-4">{rows.length} review{rows.length !== 1 ? 's' : ''}</div>
            {rows.map(r => <HistoryRow key={r.id} r={r} />)}
          </div>
        )}
      </div>
    </div>
  )
}

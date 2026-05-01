import { useState } from 'react'
import { searchMemories } from '../lib/api'

const SEVERITY = {
  low:    'badge-low',
  medium: 'badge-medium',
  high:   'badge-high',
}

function MemoryItem({ m }) {
  return (
    <div className="border border-border rounded-lg p-3 flex flex-col gap-1.5 text-sm hover:border-accent/30 transition-colors">
      <div className="flex items-center gap-2">
        <span className={SEVERITY[m.severity] || 'badge-low'}>{m.severity?.toUpperCase()}</span>
        {m.distance !== undefined && (
          <span className="text-xs text-muted ml-auto">dist {m.distance?.toFixed(3)}</span>
        )}
      </div>
      <p className="text-slate-400 leading-snug">{m.comment}</p>
    </div>
  )
}

export default function MemoryPanel({ count, memories: initial = [] }) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState(null)
  const [loading, setLoading]   = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const data = await searchMemories(query)
      setResults(data.memories || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const displayed = results ?? initial

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Memory</span>
        <span className="text-xs text-muted bg-white/5 px-2 py-0.5 rounded-full">{count ?? '—'} records</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search memory..."
          className="input text-sm"
        />
        <button type="submit" disabled={loading}
          className="btn-primary text-sm px-3 py-2 whitespace-nowrap">
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {/* Results */}
      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
        {displayed.length === 0
          ? <p className="text-xs text-muted text-center py-6">No memories yet</p>
          : displayed.map((m, i) => <MemoryItem key={m.id ?? i} m={m} />)
        }
      </div>
    </div>
  )
}

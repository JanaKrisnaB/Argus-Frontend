import { useState, useEffect } from 'react'
import { reviewCode, getMemoryCount, listMemories } from '../lib/api'
import ReviewPanel from '../components/ReviewPanel'
import MemoryPanel from '../components/MemoryPanel'

const DEFAULT_CODE = `import os
import re

def calculate(a,b,c):
    if a>0:
        if b>0:
            if c>0:
                return a+b+c
    return 0`

const CONFIGS = [
  { key: 'A', label: 'A — Baseline',    desc: '~2 API calls' },
  { key: 'B', label: 'B — Tools only',  desc: '~4 API calls' },
  { key: 'C', label: 'C — Full system', desc: '~4+N API calls' },
]

export default function Playground() {
  const [code,       setCode]       = useState(DEFAULT_CODE)
  const [config,     setConfig]     = useState('C')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [result,     setResult]     = useState(null)
  const [memCount,   setMemCount]   = useState(null)
  const [memories,   setMemories]   = useState([])
  const [criticOpen, setCriticOpen] = useState(false)

  useEffect(() => {
    getMemoryCount().then(d => setMemCount(d.count)).catch(() => {})
    listMemories(10).then(d => setMemories(d.memories || [])).catch(() => {})
  }, [])

  const handleReview = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await reviewCode(code, config)
      setResult(data)
      setMemCount(data.memory_count)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Review failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Playground</h1>
          <p className="text-muted text-sm mt-1">Paste Python code to get AI-powered review</p>
        </div>
        {/* Config selector */}
        <div className="flex gap-2">
          {CONFIGS.map(c => (
            <button key={c.key} onClick={() => setConfig(c.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all
                ${config === c.key
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border text-muted hover:text-white hover:border-white/20'
                }`}
              title={c.desc}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_320px] gap-5">

        {/* Column 1 — Code Input */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Python Code</span>
            <button onClick={() => setCode('')}
              className="text-xs text-muted hover:text-white transition-colors">
              Clear
            </button>
          </div>
          <textarea
            className="code-editor flex-1"
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            placeholder="# Paste your Python code here..."
          />
          <button
            onClick={handleReview}
            disabled={loading || !code.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading
              ? <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Reviewing...
                </>
              : 'Review Code'
            }
          </button>
          {result && (
            <p className="text-xs text-muted text-center">
              Config {config} · {result.comments?.length ?? 0} issue(s) · Memory: {result.memory_count} records
            </p>
          )}
        </div>

        {/* Column 2 — Review Results */}
        <div className="card flex flex-col gap-4 min-h-[400px]">
          <span className="text-sm font-semibold text-white">Review Comments</span>
          <ReviewPanel
            comments={result?.comments ?? null}
            loading={loading}
            error={error}
          />

          {/* Critic log (collapsible) */}
          {result?.critic_log && config === 'C' && (
            <div className="mt-auto">
              <button
                onClick={() => setCriticOpen(o => !o)}
                className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1"
              >
                {criticOpen ? '▼' : '▶'} Critic log
              </button>
              {criticOpen && (
                <pre className="mt-2 text-xs text-muted bg-bg rounded-lg p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {result.critic_log}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Column 3 — Memory Panel */}
        <div className="card">
          <MemoryPanel count={memCount} memories={memories} />
        </div>
      </div>
    </div>
  )
}

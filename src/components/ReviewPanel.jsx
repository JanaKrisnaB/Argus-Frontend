const SEVERITY = {
  low:    { label: 'LOW',    cls: 'badge-low' },
  medium: { label: 'MED',   cls: 'badge-medium' },
  high:   { label: 'HIGH',  cls: 'badge-high' },
}

function CommentCard({ comment: c, index }) {
  const sev = SEVERITY[c.severity] || SEVERITY.low
  return (
    <div className="border border-border rounded-xl p-4 flex flex-col gap-2 hover:border-accent/40 transition-colors">
      <div className="flex items-center gap-3">
        <span className={sev.cls}>{sev.label}</span>
        <span className="text-xs text-muted font-mono">Line {c.line}</span>
        <span className="ml-auto text-xs text-muted">conf {(c.confidence * 100).toFixed(0)}%</span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{c.comment}</p>
    </div>
  )
}

export default function ReviewPanel({ comments, loading, error }) {
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      <span className="text-sm">Analyzing code...</span>
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
      {error}
    </div>
  )

  if (!comments) return (
    <div className="flex flex-col items-center justify-center h-48 text-muted text-sm">
      Paste code and click Review to see feedback
    </div>
  )

  if (comments.length === 0) return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-green-400">
      <span className="text-3xl">✓</span>
      <span className="font-semibold">No issues found</span>
    </div>
  )

  const counts = { high: 0, medium: 0, low: 0 }
  comments.forEach(c => { if (c.severity in counts) counts[c.severity]++ })

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-semibold text-white">{comments.length} issue{comments.length !== 1 ? 's' : ''}</span>
        {counts.high   > 0 && <span className="badge-high">{counts.high} high</span>}
        {counts.medium > 0 && <span className="badge-medium">{counts.medium} medium</span>}
        {counts.low    > 0 && <span className="badge-low">{counts.low} low</span>}
      </div>
      {comments.map((c, i) => <CommentCard key={i} comment={c} index={i} />)}
    </div>
  )
}

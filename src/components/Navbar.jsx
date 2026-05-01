import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../App'

const links = [
  { to: '/',           label: 'Dashboard' },
  { to: '/playground', label: 'Playground' },
  { to: '/history',    label: 'History' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur">
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-sm font-black">A</span>
          Argus
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${pathname === l.to
                  ? 'bg-accent/15 text-accent'
                  : 'text-muted hover:text-white hover:bg-white/5'
                }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted hidden sm:block">{user?.email}</span>
          <button onClick={signOut} className="btn-ghost text-sm">Sign out</button>
        </div>
      </div>
    </nav>
  )
}

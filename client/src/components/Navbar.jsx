import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const links = [
    { to: '/dashboard',   label: 'Dashboard' },
    { to: '/role-select', label: 'New Interview' },
    { to: '/history',     label: 'History' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-sm hidden sm:block">MockMate Pro</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                pathname === to
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 font-medium hidden md:block">{user?.name}</span>
          </div>
          <button onClick={() => { logout(); navigate('/login') }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50 font-medium">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
export default Navbar
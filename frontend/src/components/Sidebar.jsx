import { Link, useNavigate } from 'react-router-dom'
import { Home, History, Trophy, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'History', href: '/history', icon: History },
  { name: 'Quiz Scores', href: '/quiz-history', icon: Trophy },
  { name: 'Admin Panel', href: '/admin', icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400">DeepWiki</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-slate-800 hover:text-white transition-colors',
              location.pathname === item.href ? 'bg-slate-800 text-white' : 'text-slate-300'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <div className="mb-3 flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}

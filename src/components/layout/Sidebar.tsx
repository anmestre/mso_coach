import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, Swords, BarChart3, Settings, Shield, ClipboardList } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/squad', label: 'Squad', icon: Users },
  { to: '/training', label: 'Training', icon: ClipboardList },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/matchday', label: 'Match Day', icon: Swords },
  { to: '/opponents', label: 'Opponents', icon: Shield },
  { to: '/stats', label: 'Statistics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const MOBILE_NAV = NAV_ITEMS.slice(0, 5)

export function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 z-30" style={{ backgroundColor: '#0d1529' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-wide">MSO Coach</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Season badge */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
            <span className="text-xs text-slate-400">Current Season</span>
            <p className="text-white font-semibold text-sm">2025/26</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200" style={{ backgroundColor: '#0d1529' }}>
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs transition-colors ${
                isActive ? 'text-green-400' : 'text-slate-400'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}

import { NavLink } from 'react-router-dom'
import Icon from '../ui/Icon'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/events', label: 'My Events', icon: 'event_available' },
  { to: '/following', label: 'Following', icon: 'group' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col bg-[#FAFAFA] text-sm font-medium tracking-tight transition-all duration-300 ease-in-out z-40 ${
        collapsed ? 'w-[72px] p-3' : 'w-64 p-6'
      }`}
    >
      {/* Header */}
      <div className={`mb-10 flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-[#0A0A0A]">Command</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#999] mt-1">The Silent Orchestrator</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg hover:bg-[#f0f0f0] transition-colors text-[#999] hover:text-[#0A0A0A] ${collapsed ? 'mx-auto' : ''}`}
        >
          <Icon name={collapsed ? 'menu' : 'menu_open'} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-full transition-all duration-200 active:scale-95 ${
                collapsed
                  ? `justify-center px-0 py-2.5 ${isActive ? 'bg-[#0A0A0A] text-white' : 'text-[#999] hover:text-[#0A0A0A] hover:bg-[#f0f0f0]'}`
                  : `gap-3 px-4 py-2 ${isActive ? 'bg-[#0A0A0A] text-white' : 'text-[#999] hover:text-[#0A0A0A] hover:bg-[#f0f0f0]'}`
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} filled={isActive} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={`mt-auto pb-4 ${collapsed ? 'px-0 flex justify-center' : 'px-4'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 p-2'}`}>
          <div className="w-8 h-8 rounded-full bg-[#e8e8e8] flex items-center justify-center text-[10px] font-bold text-[#777] shrink-0">
            R
          </div>
          {!collapsed && (
            <div>
              <p className="text-xs font-semibold text-[#1a1c1c]">Rivaldo</p>
              <p className="text-[10px] text-[#999]">Pro Organizer</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

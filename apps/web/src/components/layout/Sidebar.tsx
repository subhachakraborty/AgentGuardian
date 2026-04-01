import { NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  LayoutDashboard, Settings, Link2, ScrollText, Shield, LogOut
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/permissions', icon: Settings, label: 'Permissions' },
  { to: '/connections', icon: Link2, label: 'Connections' },
  { to: '/audit', icon: ScrollText, label: 'Audit Log' },
];

export function Sidebar() {
  const { user, logout } = useAuth0();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 gradient-sidebar text-white flex flex-col z-40">
      {/* Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-6 h-6 text-accent-light" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Agent Guardian</h1>
            <p className="text-xs text-white/50">Trust Layer for AI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Connected services summary */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Connected Services</p>
        <div className="flex gap-2">
          {['G', 'GH', 'S', 'N'].map((label, i) => (
            <div
              key={label}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                ${['bg-red-500/80', 'bg-gray-700/80', 'bg-purple-600/80', 'bg-gray-800/80'][i]}`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* User profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          {user?.picture ? (
            <img src={user.picture} alt="" className="w-9 h-9 rounded-full ring-2 ring-white/20" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

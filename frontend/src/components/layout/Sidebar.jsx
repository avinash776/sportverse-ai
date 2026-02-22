// ==================================================
// SportVerse AI - Sidebar Navigation Component
// ==================================================

import {
    Brain,
    Gamepad2,
    LayoutDashboard,
    MessageCircle,
    Shield,
    UserCircle,
    Users,
    Video,
    Zap
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/personalized-trainer', label: 'Video Trainer', icon: Video },
  { path: '/ai-trainer', label: 'AI Trainer', icon: Brain },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/messages', label: 'Messages', icon: MessageCircle },
  { path: '/find-players', label: 'Find Players', icon: Gamepad2 },
  { path: '/profile', label: 'My Profile', icon: UserCircle },
];

const coachItems = [
  { path: '/coach-portal', label: 'Coach Portal', icon: Shield },
];

export default function Sidebar() {
  const { user, isCoach } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200/80 h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <a href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-sport-blue flex items-center justify-center shadow-lg shadow-primary-200">
            <Zap className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display gradient-text">SportVerse</h1>
            <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">AI Platform</p>
          </div>
        </a>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Main Menu</p>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm border border-primary-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} className="group-hover:scale-110 transition-transform" />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Coach-only section */}
        {isCoach && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Coach Tools</p>
            </div>
            {coachItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-50 to-orange-100/50 text-sport-orange shadow-sm border border-orange-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform" />
                <span>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User Card Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-sport-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-gray-400 capitalize">{user?.role || 'Player'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

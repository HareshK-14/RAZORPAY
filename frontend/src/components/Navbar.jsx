import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, LayoutDashboard, Search, ClipboardList, FileText,
  BarChart2, Settings, LogOut, User, Activity, ChevronRight,
  Users as UsersIcon, ShieldAlert
} from 'lucide-react';

const allNavItems = [
  { to: '/customer-investigation', label: 'Customer Investigation', icon: ShieldAlert, roles: ['Administrator', 'Risk Analyst', 'Reviewer'] },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrator', 'Risk Analyst', 'Reviewer'] },
  { to: '/analyze', label: 'Investigate Transaction', icon: Search, roles: ['Administrator', 'Risk Analyst'] },
  { to: '/review', label: 'Investigation Queue', icon: ClipboardList, roles: ['Administrator', 'Risk Analyst', 'Reviewer'] },
  { to: '/transactions', label: 'Transactions', icon: Activity, roles: ['Administrator', 'Risk Analyst', 'Reviewer'] },
  { to: '/audit', label: 'Audit Trail', icon: FileText, roles: ['Administrator', 'Risk Analyst', 'Reviewer'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart2, roles: ['Administrator', 'Risk Analyst'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['Administrator', 'Risk Analyst'] },
  { to: '/users', label: 'User Management', icon: UsersIcon, roles: ['Administrator'] }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const currentRole = user?.role || 'Administrator';
  const permittedNavItems = allNavItems.filter(item => item.roles.includes(currentRole));

  // Role badge styling
  const badgeStyles = {
    Administrator: 'bg-purple-50 text-purple-700 border border-purple-200',
    'Risk Analyst': 'bg-blue-50 text-blue-700 border border-blue-200',
    Reviewer: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  };

  const badgeClass = badgeStyles[currentRole] || badgeStyles.Administrator;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200/90 shadow-sm flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm leading-tight">TransactionGuard AI</div>
            <div className="text-blue-600 text-[11px] font-bold">Banking Risk Assistant</div>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></div>
          <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Defense-Only AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Navigation</p>
          <span className="text-[9px] text-slate-400 font-medium uppercase">{user?.role}</span>
        </div>

        {permittedNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full"></span>
                )}
                <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                <span className="text-sm">{label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto text-blue-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Status */}
      <div className="px-4 py-3 mx-3 mb-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Status</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Risk Engine</span>
            <span className="text-emerald-700 font-medium">● Active</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Database</span>
            <span className="text-emerald-700 font-medium">● Online</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">API</span>
            <span className="text-emerald-700 font-medium">● Operational</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>TransactionGuard-v1</span>
          <span className="text-emerald-600 font-medium">Operational</span>
        </div>
      </div>

      {/* User profile & Role Badge section */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeClass}`}>
            {user?.role?.toUpperCase() || 'ADMINISTRATOR'}
          </span>
          <span className="text-[10px] text-slate-400">Session Active</span>
        </div>

        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 font-bold text-white text-xs shadow-sm">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Admin'}</div>
            <div className="text-xs text-slate-500 truncate">{user?.roleTitle || user?.role || 'Platform Administrator'}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

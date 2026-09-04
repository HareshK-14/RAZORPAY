import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Search,
  HelpCircle,
  User,
  Settings,
  LogOut,
  X,
  Shield,
  Users,
  ArrowUpRight,
  Check,
  Filter,
  ChevronDown,
  Sparkles,
  UserCheck
} from 'lucide-react';
import axios from 'axios';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard Overview',
  '/analyze': 'Analyze Transaction',
  '/review': 'Review Queue',
  '/transactions': 'Transactions Database',
  '/audit': 'Audit Trail & Compliance',
  '/analytics': 'Risk Analytics & Intelligence',
  '/settings': 'Platform Settings',
  '/users': 'User & Access Management'
};

const NOTIF_COLORS = {
  CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  SYSTEM: 'bg-blue-50 text-blue-700 border-blue-200',
};

const ROLES_LIST = [
  { id: 'admin', name: 'Administrator', user: 'Admin', desc: 'Full platform access' },
  { id: 'analyst', name: 'Risk Analyst', user: 'Alex', desc: 'Scoring & investigation' },
  { id: 'reviewer', name: 'Reviewer', user: 'Priya', desc: 'Case queue & notes' }
];

export default function Header() {
  const { user, logout, loginWithRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertFilter, setAlertFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'SYSTEM'
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const roleRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] || 'TransactionGuard AI';

  useEffect(() => {
    axios.get('/api/notifications').then(r => {
      setNotifications(r.data.notifications || []);
      setUnreadCount(r.data.unread_count || 0);
    }).catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setShowRoleMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleRoleSwitch = (roleId) => {
    loginWithRole(roleId);
    setShowRoleMenu(false);
    setShowProfile(false);
    navigate('/dashboard');
  };

  const handleClickNotification = (n) => {
    setShowNotif(false);

    // Mark as read locally
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (n.link) {
      navigate(n.link);
      return;
    }

    // Smart fallback: extract transaction ID from message or property
    const txId = n.transaction_id || n.message?.match(/Transaction\s+([A-Za-z0-9_-]+)/i)?.[1];
    if (txId) {
      navigate(`/review?search=${encodeURIComponent(txId)}`);
    } else if (n.type === 'CRITICAL' || n.type === 'HIGH') {
      navigate('/review');
    } else if (n.type === 'SYSTEM') {
      navigate('/audit');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const currentRole = user?.role || 'Administrator';
  const canAccessSettings = currentRole !== 'Reviewer';
  const canAccessUsers = currentRole === 'Administrator';

  // Badge styling
  const badgeStyles = {
    Administrator: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    'Risk Analyst': 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    Reviewer: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
  };

  const badgeClass = badgeStyles[currentRole] || badgeStyles.Administrator;

  const filteredNotifs = alertFilter === 'ALL'
    ? notifications
    : notifications.filter(n => n.type === alertFilter);

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-slate-200/90 flex items-center px-6 gap-4 sticky top-0 z-40 shadow-xs">
      {/* Page title & role context */}
      <div className="flex-1 flex items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 leading-tight">{title}</h1>
          <p className="text-xs text-slate-500 font-mono">DEFENSE-ONLY RISK INTELLIGENCE</p>
        </div>

        {/* Clickable Role Switcher Pill */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${badgeClass}`}
            title="Click to switch demo role"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
            {currentRole} Mode
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {showRoleMenu && (
            <div className="absolute left-0 top-9 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                Switch Demo Persona
              </span>
              <div className="space-y-1 mt-1">
                {ROLES_LIST.map(r => {
                  const isCurrent = r.name === currentRole;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleRoleSwitch(r.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{r.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({r.user})</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">{r.desc}</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Quick Search (Innovation 9 & Ergonomics) */}
      <div className="relative" ref={searchRef}>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-slate-600 rounded-lg text-xs transition-colors cursor-pointer"
          title="Search transactions or entities"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-400 font-mono">⌘K</kbd>
        </button>

        {showSearch && (
          <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tx ID, customer, IP, or card hash..."
                autoFocus
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Go
              </button>
            </form>
            <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
              <span>Press Enter to search transactions</span>
              <button onClick={() => setShowSearch(false)} className="text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Smart Alert Center (Innovation 9) */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Alerts"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotif && (
          <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">Smart Alert Center</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
                <button onClick={() => setShowNotif(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-3 py-2 bg-white border-b border-slate-100 text-xs">
              <Filter className="w-3 h-3 text-slate-400 mr-1" />
              {['ALL', 'CRITICAL', 'HIGH', 'SYSTEM'].map(f => (
                <button
                  key={f}
                  onClick={() => setAlertFilter(f)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    alertFilter === f
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {filteredNotifs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No {alertFilter !== 'ALL' ? alertFilter.toLowerCase() : ''} alerts found
                </div>
              ) : (
                filteredNotifs.map(n => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-slate-50/80 transition-colors flex items-start gap-3 cursor-pointer ${
                      !n.read ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => handleClickNotification(n)}
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold border shrink-0 mt-0.5 ${
                      NOTIF_COLORS[n.type] || NOTIF_COLORS.SYSTEM
                    }`}>
                      {n.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        {n.created_at ? new Date(n.created_at).toLocaleTimeString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => { setShowNotif(false); navigate('/review'); }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                Go to Review Queue <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User profile dropdown with Switch Role section */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-medium text-xs shadow-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'TG'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Demo User'}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{user?.role || 'Administrator'}</p>
          </div>
        </button>

        {showProfile && (
          <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-xs animate-in fade-in slide-in-from-top-2">
            <div className="px-3.5 py-2.5 border-b border-slate-100">
              <p className="font-semibold text-slate-900">{user?.name}</p>
              <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium border ${badgeClass}`}>
                {currentRole}
              </span>
            </div>

            {/* Switch Role Quick Selection */}
            <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Switch Active Persona
              </span>
              <div className="space-y-1">
                {ROLES_LIST.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSwitch(r.id)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between cursor-pointer ${
                      r.name === currentRole ? 'bg-white font-bold text-blue-600 shadow-xs' : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span>{r.name}</span>
                    {r.name === currentRole && <Check className="w-3 h-3 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {canAccessSettings && (
              <button
                onClick={() => { setShowProfile(false); navigate('/settings'); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Platform Settings
              </button>
            )}

            {canAccessUsers && (
              <button
                onClick={() => { setShowProfile(false); navigate('/users'); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-400" /> Team & Roles
              </button>
            )}

            <div className="border-t border-slate-100 my-1" />

            <button
              onClick={handleLogout}
              className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

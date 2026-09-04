import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ROLES } from '../context/AuthContext';
import { Shield, BarChart2, UserCheck, Eye, EyeOff, AlertCircle, Lock, CheckCircle2, ArrowRight, Sparkles, Mail, KeyRound } from 'lucide-react';
import RoleDetails from '../components/RoleDetails';

export default function Login() {
  const { login, loginWithRole } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState(DEMO_ROLES.admin.email);
  const [password, setPassword] = useState(DEMO_ROLES.admin.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleCardConfigs = [
    {
      id: 'admin',
      title: 'Administrator',
      icon: Shield,
      tagline: 'Full platform access',
      submodules: 'Dashboard • Reviews • Analytics • Settings',
      activeColor: 'border-purple-500 bg-purple-50/70 text-purple-900 ring-2 ring-purple-400/30 shadow-sm',
      inactiveColor: 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:bg-purple-50/30',
      iconBg: 'bg-purple-100 text-purple-700',
      checkColor: 'bg-purple-600 text-white'
    },
    {
      id: 'analyst',
      title: 'Risk Analyst',
      icon: BarChart2,
      tagline: 'Analyze and investigate transactions',
      submodules: 'Dashboard • Analyze • Reviews • Analytics',
      activeColor: 'border-blue-500 bg-blue-50/70 text-blue-900 ring-2 ring-blue-400/30 shadow-sm',
      inactiveColor: 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30',
      iconBg: 'bg-blue-100 text-blue-700',
      checkColor: 'bg-blue-600 text-white'
    },
    {
      id: 'reviewer',
      title: 'Reviewer',
      icon: UserCheck,
      tagline: 'Review suspicious transactions',
      submodules: 'Dashboard • Review Queue • Transactions',
      activeColor: 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-400/30 shadow-sm',
      inactiveColor: 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/30',
      iconBg: 'bg-emerald-100 text-emerald-700',
      checkColor: 'bg-emerald-600 text-white'
    }
  ];

  // When role changes, autofill email and password
  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    const target = DEMO_ROLES[roleId];
    if (target) {
      setEmail(target.email);
      setPassword(target.password);
    }
  };

  const handleRoleContinue = async (roleId) => {
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 400));
    loginWithRole(roleId);
    navigate('/dashboard', { replace: true });
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(email, password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f8fafc] to-[#ffffff] flex text-slate-800">
      {/* Left panel - Modern Light Branding & Platform Overview */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-white/95 backdrop-blur border-r border-slate-200/80 p-12 sticky top-0 h-screen overflow-hidden shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-900 font-bold text-base tracking-tight">TransactionGuard</div>
            <div className="text-blue-600 text-xs font-bold tracking-widest uppercase">AI Risk Manager</div>
          </div>
        </div>

        <div className="space-y-8 my-auto py-8">
          <div>
            {/* Pill like LocalLink */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-full mb-6 text-blue-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold tracking-wide">
                Razorpay AI Buildathon 2026 · Track 2
              </span>
            </div>

            <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              AI Payment<br />
              <span className="text-blue-600">
                Risk Intelligence
              </span>
            </h1>

            <p className="text-slate-600 text-base leading-relaxed">
              "Explain Every Risk. Trust Every Decision." Real-time explainable transaction risk engine with role-based human-in-the-loop oversight.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              {
                icon: '🛡️',
                title: 'Administrator',
                desc: 'Full platform governance, settings & user permissions',
                pill: 'Full Platform Access',
                pillClass: 'bg-purple-100 text-purple-800 border-purple-200'
              },
              {
                icon: '📊',
                title: 'Risk Analyst',
                desc: 'Transaction simulation, behavioral analysis & anomaly charts',
                pill: 'Analysis & Scoring',
                pillClass: 'bg-blue-100 text-blue-800 border-blue-200'
              },
              {
                icon: '👤',
                title: 'Transaction Reviewer',
                desc: 'Review queue processing & human judgment audit recording',
                pill: 'Human Reviewer',
                pillClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-slate-900 text-sm font-bold">{f.title}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${f.pillClass}`}>
                    {f.pill}
                  </span>
                </div>
                <div className="text-slate-500 text-xs pl-7 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-xs pt-4 border-t border-slate-200/80">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Defense-only AI · Human-in-the-loop · Strict Role Permissions</span>
        </div>
      </div>

      {/* Right panel - Light Theme Form with Prominent Email & Password Inputs */}
      <div className="flex-1 flex justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto max-h-screen">
        <div className="w-full max-w-xl py-4 space-y-6">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-900 font-bold text-sm">TransactionGuard AI</div>
              <div className="text-blue-600 text-xs">Payment Risk Intelligence</div>
            </div>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to TransactionGuard
            </h2>
            <p className="text-slate-500 text-sm mt-1.5">
              Enter your email and password, or select a role below for instant demo credentials.
            </p>
          </div>

          {/* PROMINENT EMAIL & PASSWORD CREDENTIALS CARD */}
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Authentication Credentials</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Active Role: <strong className="text-blue-600">{DEMO_ROLES[selectedRole]?.role}</strong>
              </span>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@transactionguard.ai"
                  className="w-full bg-slate-50/80 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 pl-9 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50/80 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 pl-9 pr-10 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* SECTION: CHOOSE DEMO ROLE */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <span>Choose Demo Role</span>
                <span className="text-[11px] text-blue-600 font-normal">(Autofills credentials & sets permissions)</span>
              </span>
            </div>

            {/* 3 Role Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roleCardConfigs.map((cfg) => {
                const isSelected = selectedRole === cfg.id;
                const Icon = cfg.icon;

                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => handleSelectRole(cfg.id)}
                    className={`relative p-3.5 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between ${
                      isSelected
                        ? `${cfg.activeColor}`
                        : `${cfg.inactiveColor} shadow-sm`
                    }`}
                  >
                    {/* Top row: Icon & Checked Indicator */}
                    <div className="flex items-center justify-between w-full mb-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected ? (
                        <div className={`w-5 h-5 rounded-full ${cfg.checkColor} flex items-center justify-center shadow-sm`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                      )}
                    </div>

                    <div>
                      <div className={`font-bold text-sm leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                        {cfg.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                        {cfg.tagline}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5 truncate font-medium">
                        {cfg.submodules}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* DYNAMIC ROLE DETAILS PANEL (SAME SCREEN, LIGHT THEME) */}
            <div className="mt-3">
              <RoleDetails
                selectedRole={selectedRole}
                onContinue={handleRoleContinue}
                loading={loading}
              />
            </div>
          </div>

          {/* DEMO ACCOUNTS QUICK AUTOFILL REFERENCE */}
          <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Demo Accounts (Click any to autofill)
              </span>
              <span className="text-[10px] text-slate-400">Password format: role+123</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Admin */}
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedRole === 'admin'
                    ? 'border-purple-300 bg-purple-50 text-purple-900'
                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-purple-700 flex items-center justify-between">
                  <span>Administrator</span>
                  {selectedRole === 'admin' && <span className="text-[10px] text-purple-600 font-semibold">Active</span>}
                </div>
                <div className="text-[11px] font-mono mt-1 text-slate-800">admin@transactionguard.ai</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Password: <span className="font-mono text-slate-700 font-semibold">admin123</span></div>
              </button>

              {/* Analyst */}
              <button
                type="button"
                onClick={() => handleSelectRole('analyst')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedRole === 'analyst'
                    ? 'border-blue-300 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-blue-700 flex items-center justify-between">
                  <span>Risk Analyst</span>
                  {selectedRole === 'analyst' && <span className="text-[10px] text-blue-600 font-semibold">Active</span>}
                </div>
                <div className="text-[11px] font-mono mt-1 text-slate-800">analyst@transactionguard.ai</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Password: <span className="font-mono text-slate-700 font-semibold">analyst123</span></div>
              </button>

              {/* Reviewer */}
              <button
                type="button"
                onClick={() => handleSelectRole('reviewer')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedRole === 'reviewer'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-emerald-700 flex items-center justify-between">
                  <span>Reviewer</span>
                  {selectedRole === 'reviewer' && <span className="text-[10px] text-emerald-600 font-semibold">Active</span>}
                </div>
                <div className="text-[11px] font-mono mt-1 text-slate-800">reviewer@transactionguard.ai</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Password: <span className="font-mono text-slate-700 font-semibold">reviewer123</span></div>
              </button>
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs">
            Defense-only AI platform · Human-in-the-loop · No automated payment blocking
          </p>
        </div>
      </div>
    </div>
  );
}

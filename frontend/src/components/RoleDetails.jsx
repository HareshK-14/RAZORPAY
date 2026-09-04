import React from 'react';
import { Shield, BarChart2, UserCheck, Check, X, ArrowRight, Mail, Lock } from 'lucide-react';
import { DEMO_ROLES } from '../context/AuthContext';

export default function RoleDetails({ selectedRole = 'admin', onContinue, loading = false }) {
  const roleData = DEMO_ROLES[selectedRole] || DEMO_ROLES.admin;

  const roleIcons = {
    admin: Shield,
    analyst: BarChart2,
    reviewer: UserCheck
  };

  const Icon = roleIcons[selectedRole] || Shield;

  const roleThemes = {
    admin: {
      accentText: 'text-purple-700',
      accentBg: 'bg-purple-100',
      accentBorder: 'border-purple-200',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      cardBorder: 'border-purple-200 shadow-purple-100/50',
      buttonBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/25',
      buttonText: 'Continue as Administrator'
    },
    analyst: {
      accentText: 'text-blue-700',
      accentBg: 'bg-blue-100',
      accentBorder: 'border-blue-200',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      cardBorder: 'border-blue-200 shadow-blue-100/50',
      buttonBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25',
      buttonText: 'Continue as Risk Analyst'
    },
    reviewer: {
      accentText: 'text-emerald-700',
      accentBg: 'bg-emerald-100',
      accentBorder: 'border-emerald-200',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cardBorder: 'border-emerald-200 shadow-emerald-100/50',
      buttonBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/25',
      buttonText: 'Continue as Reviewer'
    }
  };

  const theme = roleThemes[selectedRole] || roleThemes.admin;

  return (
    <div className={`p-5 rounded-2xl bg-white border ${theme.cardBorder} shadow-sm transition-all duration-300 fade-in`}>
      {/* Header */}
      <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${theme.accentBg} ${theme.accentBorder} border flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${theme.accentText}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{roleData.role}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badgeClass}`}>
                {roleData.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{roleData.roleTitle}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="my-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
        "{roleData.description}"
      </div>

      {/* Permissions Grid: ACCESS vs RESTRICTED */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-slate-100 text-xs">
        {/* ACCESS LIST */}
        <div>
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-700 mb-2 text-[11px]">
            <Check className="w-3.5 h-3.5" />
            <span>Permitted Access</span>
          </div>
          <ul className="space-y-1.5">
            {roleData.access.map((item) => (
              <li key={item} className="flex items-center gap-2 text-slate-700">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RESTRICTED LIST */}
        <div>
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-600 mb-2 text-[11px]">
            <X className="w-3.5 h-3.5" />
            <span>Restricted Access</span>
          </div>
          {roleData.restricted.length > 0 ? (
            <ul className="space-y-1.5">
              {roleData.restricted.map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-bold">
                    ✕
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Full platform permissions granted</span>
            </div>
          )}
        </div>
      </div>

      {/* Demo Credentials & Action */}
      <div className="pt-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>Email:</span>
            <span className="font-mono text-slate-900 font-semibold">{roleData.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Password:</span>
            <span className="font-mono text-slate-900 font-semibold">{roleData.password}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onContinue(selectedRole)}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${theme.buttonBg} disabled:opacity-50`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>{theme.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

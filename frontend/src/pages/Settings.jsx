import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Bell, User, Database, Monitor, Save, CheckCircle } from 'lucide-react';

const DEFAULT_PREFS = {
  notifications: true,
  risk_alerts: true,
  compact_dashboard: false,
  high_risk_threshold: 75,
  critical_threshold: 90,
  email_alerts: false
};

function loadPrefs() {
  try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem('tg_prefs') || '{}') }; }
  catch { return DEFAULT_PREFS; }
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`}></span>
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">{title}</h3>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div>
        <div className="text-sm text-slate-900 font-semibold">{label}</div>
        {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(loadPrefs);
  const [saved, setSaved] = useState(false);

  const setPref = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const save = () => {
    localStorage.setItem('tg_prefs', JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Profile */}
      <Section title="User Profile">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <div className="text-slate-900 font-extrabold text-lg">{user?.name || 'Admin'}</div>
            <div className="text-blue-600 text-sm font-semibold">{user?.roleTitle || user?.role || 'Platform Administrator'}</div>
            <div className="text-slate-500 text-xs mt-0.5 font-mono">{user?.email}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Name', user?.name],
            ['Role', user?.role],
            ['Email', user?.email],
            ['Access Level', user?.role === 'Administrator' ? 'Full Platform Access' : 'Analyst Access']
          ].map(([k, v]) => (
            <div key={k} className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{k}</div>
              <div className="text-sm text-slate-900 font-semibold mt-1">{v}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">Active profile is mapped to the current authenticated role.</p>
      </Section>

      {/* Risk Engine */}
      <Section title="Risk Engine Configuration">
        <SettingRow label="Engine Version" description="Current risk scoring engine specification">
          <span className="text-xs text-blue-600 font-mono font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">TransactionGuard-v1</span>
        </SettingRow>
        <SettingRow label="Operational Health" description="Real-time risk engine status">
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span> Operational
          </span>
        </SettingRow>
        <SettingRow label="Execution Mode" description="Operational doctrine — no auto-blocking">
          <span className="text-xs text-slate-800 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">Defense-Only (Human-in-the-Loop)</span>
        </SettingRow>
        <SettingRow label="Database Engine" description="Embedded storage backend">
          <span className="text-xs text-slate-700 font-mono">node:sqlite</span>
        </SettingRow>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="label text-xs">High Risk Threshold</label>
            <div className="flex items-center gap-3">
              <input type="range" min={50} max={100} value={prefs.high_risk_threshold}
                onChange={e => setPref('high_risk_threshold', parseInt(e.target.value))}
                className="flex-1 accent-orange-500" />
              <span className="text-orange-600 text-sm font-bold w-8">{prefs.high_risk_threshold}</span>
            </div>
          </div>
          <div>
            <label className="label text-xs">Critical Threshold</label>
            <div className="flex items-center gap-3">
              <input type="range" min={50} max={100} value={prefs.critical_threshold}
                onChange={e => setPref('critical_threshold', parseInt(e.target.value))}
                className="flex-1 accent-red-500" />
              <span className="text-rose-600 text-sm font-bold w-8">{prefs.critical_threshold}</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">Threshold updates affect display badge boundaries.</p>
      </Section>

      {/* Preferences */}
      <Section title="Preferences & Notifications">
        {[
          { key: 'notifications', label: 'In-App Notifications', desc: 'Display alerts for high-risk pending transactions' },
          { key: 'risk_alerts', label: 'Risk Alerts', desc: 'Prominently flag critical risk items' },
          { key: 'compact_dashboard', label: 'Compact Dashboard', desc: 'Optimized spacing for dense data views' },
          { key: 'email_alerts', label: 'Email Alerts (Demo)', desc: 'Simulate outbound dispatch for critical risks' }
        ].map(({ key, label, desc }) => (
          <SettingRow key={key} label={label} description={desc}>
            <Toggle value={prefs[key]} onChange={v => setPref(key, v)} />
          </SettingRow>
        ))}
      </Section>

      {/* Platform Info */}
      <Section title="Platform Specifications">
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Platform', 'TransactionGuard AI'],
            ['Track', 'Razorpay AI Buildathon 2026'],
            ['Architecture', 'React 18 + Node.js + SQLite'],
            ['Compliance', 'Audited Decision Trail']
          ].map(([k, v]) => (
            <div key={k} className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{k}</div>
              <div className="text-xs text-slate-800 font-semibold mt-1">{v}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button onClick={save} className="btn-primary flex items-center gap-2">
          {saved ? <><CheckCircle className="w-4 h-4" /> Preferences Saved!</> : <><Save className="w-4 h-4" /> Save Preferences</>}
        </button>
        {saved && <span className="text-emerald-700 text-xs font-semibold fade-in">Preferences persisted to localStorage</span>}
      </div>
    </div>
  );
}

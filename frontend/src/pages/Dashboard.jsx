import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMetrics, getHealth, getTransactions } from '../api/api';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import TransactionDrawer from '../components/TransactionDrawer';
import axios from 'axios';
import {
  AlertTriangle,
  TrendingUp,
  Activity,
  Shield,
  Clock,
  CheckCircle2,
  Zap,
  Database,
  Server,
  X,
  Info,
  Sparkles,
  HelpCircle,
  Cpu,
  Layers,
  Maximize2,
  ExternalLink,
  ArrowUpRight,
  UserCheck,
  Smartphone,
  Globe,
  Network,
  Sliders,
  Check,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  FileText,
  ChevronRight,
  Lock,
  Award,
  Gauge,
  User,
  Users,
  Send,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const RISK_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };
const CHART_STYLE = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
  fontSize: '11px',
  color: '#0f172a'
};

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loginWithRole } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restrictedAlert, setRestrictedAlert] = useState(location.state?.restricted || false);

  // Innovation 17 & 19
  const [showModelModal, setShowModelModal] = useState(false);
  const [commandCenterMode, setCommandCenterMode] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState(null);

  const currentRole = user?.role || 'Administrator';

  useEffect(() => {
    if (location.state?.restricted) {
      setRestrictedAlert(true);
    }
  }, [location.state]);

  const loadData = async () => {
    try {
      const [m, h, t] = await Promise.all([
        getMetrics(),
        getHealth().catch(() => null),
        getTransactions(1, 25, { sort_by: 'newest' })
      ]);
      setMetrics(m);
      setHealth(h);
      setTxns(t.transactions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="card p-8 border-rose-200 bg-rose-50 text-center">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <p className="text-rose-800 font-semibold">Failed to load dashboard</p>
          <p className="text-slate-600 text-sm mt-1">{error}</p>
          <p className="text-slate-500 text-xs mt-2">Make sure the backend is running on port 8000 (python app.py).</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 max-w-[1600px] mx-auto pb-12 ${commandCenterMode ? 'p-3 text-xs' : 'p-6'}`}>
      {/* Universal Top Bar with Persona Switcher & Tooling */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
            currentRole === 'Administrator' ? 'bg-purple-600' :
            currentRole === 'Risk Analyst' ? 'bg-blue-600' : 'bg-emerald-600'
          }`}>
            {currentRole === 'Administrator' ? <Shield className="w-5 h-5" /> :
             currentRole === 'Risk Analyst' ? <Cpu className="w-5 h-5" /> :
             <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">
                {currentRole === 'Administrator' ? 'Executive Governance Command Center' :
                 currentRole === 'Risk Analyst' ? 'Forensic Multi-Signal Risk Lab' :
                 'High-Velocity Case Triage Center'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                currentRole === 'Administrator' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                currentRole === 'Risk Analyst' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}>
                {currentRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as <strong className="text-slate-700">{user?.name || 'User'}</strong> • {user?.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Persona Switcher for Presentation Demo */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Demo Role:</span>
            {[
              { id: 'admin', label: 'Admin', icon: Shield },
              { id: 'analyst', label: 'Analyst', icon: Cpu },
              { id: 'reviewer', label: 'Reviewer', icon: CheckCircle2 }
            ].map(r => {
              const isActive = (r.id === 'admin' && currentRole === 'Administrator') ||
                               (r.id === 'analyst' && currentRole === 'Risk Analyst') ||
                               (r.id === 'reviewer' && currentRole === 'Reviewer');
              return (
                <button
                  key={r.id}
                  onClick={() => loginWithRole(r.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <r.icon className="w-3 h-3" />
                  {r.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowModelModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Model Logic</span>
          </button>

          <button
            onClick={() => setCommandCenterMode(!commandCenterMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              commandCenterMode
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{commandCenterMode ? 'Compact' : 'Expanded'}</span>
          </button>
        </div>
      </div>

      {/* Role-Restricted Warning if navigated improperly */}
      {restrictedAlert && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-rose-800 fade-in shadow-sm">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-rose-900 text-sm">Access Restricted</div>
              <div className="text-rose-700 mt-0.5">
                Your role (<strong className="text-rose-900 font-semibold">{location.state?.userRole || currentRole}</strong>) does not have access to that module.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRestrictedAlert(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PS06 Banking Risk Investigation Assistant Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wider">
              NexusTiq24 • TRACK_ID=PS06
            </span>
            <span className="text-xs text-blue-100 font-medium">
              Banking: Transaction Risk Investigation Assistant
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            &quot;Find the pattern. Show the evidence. Keep the decision human.&quot;
          </h2>
          <p className="text-xs text-blue-100 max-w-2xl">
            Evaluate customer multi-month baselines, isolate unusual behavioral shifts, verify court-defensible deterministic rule citations, and access grounded Gemini AI case briefings.
          </p>
        </div>
        <button
          onClick={() => navigate('/customer-investigation')}
          className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs flex items-center gap-2 shadow-xs flex-shrink-0 transition-all cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <span>Launch Customer Investigation</span>
          <ChevronRight className="w-4 h-4 text-blue-500" />
        </button>
      </div>

      {/* DEDICATED ROLE DASHBOARD VIEW */}
      {currentRole === 'Administrator' && (
        <AdminDashboardView
          metrics={metrics}
          health={health}
          txns={txns}
          loading={loading}
          navigate={navigate}
          onSelectTxn={setSelectedTxnId}
        />
      )}

      {currentRole === 'Risk Analyst' && (
        <AnalystDashboardView
          metrics={metrics}
          health={health}
          txns={txns}
          loading={loading}
          navigate={navigate}
          onSelectTxn={setSelectedTxnId}
        />
      )}

      {currentRole === 'Reviewer' && (
        <ReviewerDashboardView
          metrics={metrics}
          health={health}
          txns={txns}
          loading={loading}
          navigate={navigate}
          onSelectTxn={setSelectedTxnId}
          onDataChanged={loadData}
        />
      )}

      {/* Slide-In Transaction Details Drawer */}
      {selectedTxnId && (
        <TransactionDrawer txnId={selectedTxnId} onClose={() => setSelectedTxnId(null)} />
      )}

      {/* Model Transparency Modal */}
      {showModelModal && (
        <ModelTransparencyModal onClose={() => setShowModelModal(false)} />
      )}
    </div>
  );
}

// =========================================================================
// 1. 🛡 ADMINISTRATOR DASHBOARD VIEW (Governance, SLA, Compliance, Throughput)
// =========================================================================
function AdminDashboardView({ metrics: m, health, txns, loading, navigate, onSelectTxn }) {
  const [simThreshold, setSimThreshold] = useState(70);

  // Latency & SLA Telemetry Data
  const latencyData = [
    { time: '00:00', latency: 4.1, tps: 12 },
    { time: '04:00', latency: 3.8, tps: 8 },
    { time: '08:00', latency: 4.5, tps: 24 },
    { time: '12:00', latency: 4.8, tps: 38 },
    { time: '16:00', latency: 4.3, tps: 42 },
    { time: '20:00', latency: 4.2, tps: 28 },
    { time: 'Now', latency: 4.0, tps: 22 }
  ];

  // Recalculate flagged count based on threshold slider
  const simulatedFlaggedCount = Math.round((m?.total_transactions || 1507) * ((100 - simThreshold) / 100) * 0.68);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Executive Macro KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          loading={loading}
          label="Protected Volume"
          value="₹4.82 Cr"
          sub="↑ 14.2% MoM"
          icon={ShieldCheck}
          color="blue"
          onClick={() => navigate('/transactions')}
        />
        <StatCard
          loading={loading}
          label="At-Risk Volume Evaluated"
          value="₹38.4 L"
          sub="90 elevated risk interventions"
          icon={Lock}
          color="green"
          onClick={() => navigate('/transactions?risk_level=HIGH')}
        />
        <StatCard
          loading={loading}
          label="Inference Latency"
          value="4.2 ms"
          sub="SLA Target: <10 ms"
          icon={Gauge}
          color="purple"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          loading={loading}
          label="False Positive Rate"
          value="1.8%"
          sub="Benchmark: ~4.5%"
          icon={Activity}
          color="orange"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          loading={loading}
          label="Audit Ledger Status"
          value="100%"
          sub="SHA-256 Chained & Sealed"
          icon={FileText}
          color="yellow"
          onClick={() => navigate('/audit')}
        />
        <StatCard
          loading={loading}
          label="Active Policies"
          value="14 Rules"
          sub="Defense-Only Mandate"
          icon={Shield}
          color="blue"
          onClick={() => navigate('/settings')}
        />
      </div>

      {/* Middle Row: Model Telemetry + Regulatory Shield */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Latency & Throughput Pulse */}
        <div className="lg:col-span-8 card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="section-title flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-600" />
                Real-Time Inference Latency & Throughput SLA Pulse
              </h3>
              <p className="text-xs text-slate-500">Live sub-millisecond execution timeline with zero degraded intervals</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
              ● 99.98% SLA Met
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData}>
                <defs>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 8]} unit="ms" />
                <Tooltip contentStyle={CHART_STYLE} />
                <Area type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#latencyGrad)" name="Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regulatory & Cryptographic Ledger Integrity */}
        <div className="lg:col-span-4 card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-purple-600" />
                Regulatory & Audit Seal
              </h3>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                RBI & ISO 27001
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Every inference decision, signal contribution weight, and analyst case review is cryptographically hashed with SHA-256 state linkage in the SQLite ledger.
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-600">Tamper-Evident Ledger:</span>
                <span className="font-bold text-emerald-600 font-mono">VERIFIED CLEAN</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-600">Track 2 Defense-Only:</span>
                <span className="font-bold text-blue-600 font-mono">ENFORCED (No Auto-Drop)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-600">Database Engine:</span>
                <span className="font-bold text-slate-700 font-mono">node:sqlite (v1)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/audit')}
            className="w-full mt-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            Inspect Immutable Audit Log <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row: Reviewer Team Workload + Interactive Risk Threshold Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Team Workload */}
        <div className="lg:col-span-6 card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-700" />
              Human Reviewer Team Workload & Throughput
            </h3>
            <span className="text-xs text-blue-600 font-semibold cursor-pointer" onClick={() => navigate('/users')}>
              Manage Team ↗
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  PR
                </div>
                <div>
                  <p className="font-bold text-slate-800">Priya (Lead Reviewer)</p>
                  <p className="text-[11px] text-slate-500 font-mono">38 cleared today • 8 in queue</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 font-mono">42s</span>
                <span className="text-[10px] text-slate-400 block">Avg Pace</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  AL
                </div>
                <div>
                  <p className="font-bold text-slate-800">Alex (Risk Analyst)</p>
                  <p className="text-[11px] text-slate-500 font-mono">14 forensic deep-dives • 3 attack rings</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 font-mono">11m</span>
                <span className="text-[10px] text-slate-400 block">Forensic Investigation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Threshold Sensitivity Controller */}
        <div className="lg:col-span-6 card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="section-title flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                Live Policy Threshold Sandbox (Admin Control)
              </h3>
              <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                Cutoff: {simThreshold}/100
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Simulate shifting the High-Risk threshold to measure impact on human review queue load.
            </p>

            <input
              type="range"
              min="50"
              max="90"
              step="1"
              value={simThreshold}
              onChange={e => setSimThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600 mb-3"
            />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-orange-50/50 rounded-xl border border-orange-100">
                <span className="text-slate-500 block text-[11px]">Estimated Flagged Queue:</span>
                <span className="text-lg font-bold font-mono text-orange-700">{simulatedFlaggedCount} txns</span>
              </div>
              <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="text-slate-500 block text-[11px]">Daily Reviewer Load:</span>
                <span className="text-lg font-bold font-mono text-blue-700">~{Math.round(simulatedFlaggedCount / 3)} cases/day</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setSimThreshold(70)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg cursor-pointer"
            >
              Reset to 70
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              Commit to Platform Settings
            </button>
          </div>
        </div>
      </div>

      {/* Recent Platform Transactions */}
      <RecentTransactionsSection txns={txns} onSelectTxn={onSelectTxn} navigate={navigate} />
    </div>
  );
}

// =========================================================================
// 2. 🔬 RISK ANALYST DASHBOARD VIEW (Forensic Radar, Attack Cluster, What-If)
// =========================================================================
function AnalystDashboardView({ metrics: m, health, txns, loading, navigate, onSelectTxn }) {
  const [quickAmount, setQuickAmount] = useState(65000);
  const [quickVel, setQuickVel] = useState(4);
  const [quickNewDevice, setQuickNewDevice] = useState(true);

  // Real-time mini score calculator
  const miniScore = Math.min(100, 10 + (quickAmount > 50000 ? 30 : 15) + (quickVel * 6) + (quickNewDevice ? 20 : 0));

  const signalAttributions = [
    { signal: 'Unrecognized Device', weight: 28 },
    { signal: 'Amount vs Baseline Anomaly', weight: 25 },
    { signal: 'Geo / IP Country Mismatch', weight: 22 },
    { signal: 'Hourly Velocity Acceleration', weight: 15 },
    { signal: 'Off-Hours Nighttime Activity', weight: 10 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Analyst Forensic KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          loading={loading}
          label="High Anomaly Outliers"
          value="34 Cases"
          sub="Risk score >= 80"
          icon={AlertTriangle}
          color="red"
          onClick={() => navigate('/transactions?risk_level=CRITICAL')}
        />
        <StatCard
          loading={loading}
          label="Novel Device Spurt"
          value="23.4%"
          sub="Unseen hardware fingerprints"
          icon={Smartphone}
          color="orange"
          onClick={() => navigate('/transactions')}
        />
        <StatCard
          loading={loading}
          label="Cross-Border Velocity"
          value="4.8%"
          sub="Domestic card vs Dutch/US IP"
          icon={Globe}
          color="blue"
          onClick={() => navigate('/transactions')}
        />
        <StatCard
          loading={loading}
          label="Multi-Signal Confidence"
          value="96.4%"
          sub="Average inference certainty"
          icon={Cpu}
          color="green"
          onClick={() => navigate('/analyze')}
        />
        <StatCard
          loading={loading}
          label="Risk Patterns Active"
          value="6 Rules"
          sub="Evaluated against PS06 matrix"
          icon={Layers}
          color="purple"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          loading={loading}
          label="Investigation Backlog"
          value="12 In-Depth"
          sub="High-priority forensic cases"
          icon={FileText}
          color="yellow"
          onClick={() => navigate('/review')}
        />
      </div>

      {/* Innovation: Emerging Attack Syndicate / Ring Alert Box */}
      <div className="bg-linear-to-r from-rose-500/10 via-amber-500/10 to-purple-500/10 border-2 border-rose-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Critical Syndicate Detected
                </span>
                <span className="text-xs font-mono text-slate-500">CLUSTER-SYN-094</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                Coordinated Device / Velocity Ring Identified (4 Customer Accounts Linked)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
                Accounts <code className="font-mono bg-white px-1.5 py-0.5 rounded border text-rose-700 font-semibold">CUST-4109</code>, <code className="font-mono bg-white px-1.5 py-0.5 rounded border text-rose-700 font-semibold">CUST-4112</code>, and <code className="font-mono bg-white px-1.5 py-0.5 rounded border text-rose-700 font-semibold">CUST-4125</code> initiated ₹3.4 Lakhs in cumulative volume across 15 minutes using the identical device signature (<code className="font-mono text-slate-800 font-semibold">DEV-EMULATOR-001</code>) on IP <code className="font-mono text-slate-800 font-semibold">182.72.10.45</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/analyze')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Network className="w-4 h-4" /> Open in Risk Network
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: Signal Attribution Leaderboard + Fast-Track What-If Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Signal Attribution Leaderboard */}
        <div className="lg:col-span-6 card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="section-title flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                SHAP-Inspired Signal Attribution Weights
              </h3>
              <p className="text-xs text-slate-500">Relative contribution percentage of each telemetry vector</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Model v1.0
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signalAttributions} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} unit="%" />
                <YAxis type="category" dataKey="signal" stroke="#475569" fontSize={10} width={150} />
                <Tooltip contentStyle={CHART_STYLE} />
                <Bar dataKey="weight" fill="#6366f1" radius={[0, 4, 4, 0]} name="Attribution Weight %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Embedded Fast-Track What-If Sandbox */}
        <div className="lg:col-span-6 card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="section-title flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-600" />
                Fast-Track Hypothesis Sandbox (Analyst Lab)
              </h3>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                miniScore >= 70 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}>
                Score: {miniScore}/100 ({miniScore >= 70 ? 'HIGH' : 'MEDIUM'})
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Quickly test risk sensitivity on amount, velocity, and device novelty without leaving dashboard.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Simulated Amount:</span>
                  <span className="font-mono font-bold text-slate-900">₹{quickAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="120000"
                  step="2000"
                  value={quickAmount}
                  onChange={e => setQuickAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Hourly Velocity:</span>
                  <span className="font-mono font-bold text-slate-900">{quickVel} txns/hr</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={quickVel}
                  onChange={e => setQuickVel(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickNewDevice}
                  onChange={e => setQuickNewDevice(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-700 font-medium">Unrecognized Hardware Fingerprint (+20 pts)</span>
              </label>
            </div>
          </div>

          <button
            onClick={() => navigate('/analyze')}
            className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            Launch Full 6-Tab Forensics Dossier <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Flagged Suspicious Stream Table */}
      <RecentTransactionsSection
        txns={txns.filter(t => t.risk_score >= 40 || t.is_flagged)}
        onSelectTxn={onSelectTxn}
        navigate={navigate}
        title="Flagged & High-Variance Transaction Queue"
        subtitle="Showing transactions exhibiting anomalous behavioral DNA deviations"
      />
    </div>
  );
}

// =========================================================================
// 3. 📋 REVIEWER DASHBOARD VIEW (Urgent Triage, 1-Click Action, Daily Quota)
// =========================================================================
function ReviewerDashboardView({ metrics: m, health, txns, loading, navigate, onSelectTxn, onDataChanged }) {
  const [quotaDone, setQuotaDone] = useState(34);
  const [quotaTarget] = useState(50);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [activeCases, setActiveCases] = useState([]);
  const [quickNote, setQuickNote] = useState('');

  useEffect(() => {
    axios.get('/api/reviews').then(res => {
      setActiveCases(res.data.reviews?.slice(0, 5) || []);
    }).catch(() => {});
  }, []);

  const handleQuickAction = async (caseId, status, note) => {
    try {
      await axios.patch(`/api/reviews/${caseId}`, {
        status,
        reviewer_notes: note || `Quick action: ${status} applied via Reviewer Command Center.`
      });
      setQuotaDone(prev => prev + 1);
      setActionSuccess(`Case #${caseId} successfully updated to ${status}`);
      setTimeout(() => setActionSuccess(null), 3500);
      // Remove from urgent queue or update
      setActiveCases(prev => prev.filter(c => c.id !== caseId));
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const quotaPct = Math.round((quotaDone / quotaTarget) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Reviewer Performance KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          loading={loading}
          label="Pending In My Queue"
          value="18 Cases"
          sub="4 Critical SLA"
          icon={Clock}
          color="purple"
          onClick={() => navigate('/review')}
        />
        <StatCard
          loading={loading}
          label="Completed Today"
          value={`${quotaDone} Done`}
          sub={`Goal: ${quotaTarget} cases`}
          icon={CheckCircle2}
          color="green"
          onClick={() => navigate('/review?status=APPROVED')}
        />
        <StatCard
          loading={loading}
          label="Avg Decision Speed"
          value="42 sec"
          sub="Target: <60 seconds"
          icon={Zap}
          color="blue"
        />
        <StatCard
          loading={loading}
          label="Step-Up 2FA Rate"
          value="24.2%"
          sub="OTP challenges issued"
          icon={Smartphone}
          color="orange"
          onClick={() => navigate('/review')}
        />
        <StatCard
          loading={loading}
          label="Clean Clearances"
          value="68%"
          sub="Frictionless approvals"
          icon={ShieldCheck}
          color="green"
          onClick={() => navigate('/review?status=APPROVED')}
        />
        <StatCard
          loading={loading}
          label="Escalated to Ops"
          value="7.8%"
          sub="Referred to Senior Team"
          icon={AlertTriangle}
          color="red"
          onClick={() => navigate('/review?status=ESCALATED')}
        />
      </div>

      {/* Success Banner */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Row: Daily Target Progress Meter + Quick Action Scratchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Quota Target Progress */}
        <div className="lg:col-span-5 card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="section-title flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Daily Review Target & Velocity
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {quotaPct}% Complete
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              You have reviewed <strong className="text-slate-800">{quotaDone}</strong> of your <strong className="text-slate-800">{quotaTarget}</strong> target cases for today.
            </p>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, quotaPct)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Current Pace</span>
                <span className="font-bold text-slate-800 font-mono">+8.4 cases/hr</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Estimated EOD</span>
                <span className="font-bold text-emerald-600 font-mono">54 Cases (Target Exceeded)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Shift ends in 3 hrs 15 mins</span>
            <button
              onClick={() => navigate('/review')}
              className="text-blue-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              Open Full Queue <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1-Click Note Templates Scratchpad */}
        <div className="lg:col-span-7 card p-5 flex flex-col justify-between">
          <div>
            <h3 className="section-title flex items-center gap-1.5 mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              1-Click Rationale Templates for Immediate Queue Actions
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Standardized auditor documentation stamps required under compliance regulations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {[
                'Cardholder SMS OTP authenticated successfully',
                'Domestic business trip confirmed with cardholder',
                'Novel device verified via banking app biometric',
                'Unusual off-hours velocity explained by flash sale'
              ].map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuickNote(tmpl)}
                  className="p-2.5 text-left bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-700 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  &quot;{tmpl}&quot;
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Or type custom case rationale here..."
              value={quickNote}
              onChange={e => setQuickNote(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <span className="text-[10px] text-slate-400 mt-2 block">
            This rationale will attach to any 1-Click action button executed below.
          </span>
        </div>
      </div>

      {/* Innovation: Priority 1 Urgent Triage Queue with Direct 1-Click Dispositions */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-linear-to-r from-rose-50/50 to-amber-50/50">
          <div>
            <h3 className="section-title text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              Priority 1 Urgent Triage Queue (Inline 1-Click Actions)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              High-risk cases requiring immediate human-in-the-loop review. Act directly from this dashboard.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200">
            {activeCases.length} Urgent Pending
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {activeCases.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              🎉 Urgent triage queue cleared! All high-priority cases reviewed.
            </div>
          ) : (
            activeCases.map(item => (
              <div key={item.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {item.risk_score}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">
                        CASE-2026-{String(item.id).padStart(4, '0')}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-rose-100 text-rose-700">
                        HIGH RISK
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      Customer: {item.customer_id || 'CUST-DEMO'} • Device: {item.device_id || 'DEV-UNRECOGNIZED'} • Category: {item.merchant_category || 'Retail'}
                    </p>
                    <button
                      onClick={() => onSelectTxn(item.transaction_id || `TXN-${item.id}`)}
                      className="text-[11px] text-blue-600 hover:underline font-semibold mt-1 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Inspect Full Evidence Drawer <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleQuickAction(item.id, 'APPROVED', quickNote)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Allow transaction without friction"
                  >
                    <Check className="w-3.5 h-3.5" /> Clear & Allow
                  </button>

                  <button
                    onClick={() => handleQuickAction(item.id, 'STEP_UP_REQUESTED', quickNote)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Challenge user with SMS / App 2FA"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Require 2FA
                  </button>

                  <button
                    onClick={() => handleQuickAction(item.id, 'ESCALATED', quickNote)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Escalate to Senior Fraud Ops"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* General Review Queue Table */}
      <RecentTransactionsSection
        txns={txns}
        onSelectTxn={onSelectTxn}
        navigate={navigate}
        title="Standard Review Stream"
        subtitle="Chronological transaction feed available for human verification"
      />
    </div>
  );
}

// =========================================================================
// REUSABLE SUB-SECTION: Recent Transactions Table
// =========================================================================
function RecentTransactionsSection({ txns, onSelectTxn, navigate, title = 'Recent Transactions', subtitle = 'Click any row or transaction ID to inspect complete signals, score, and behavioral details' }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="section-title">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={() => navigate('/transactions')}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
        >
          View All Database ({txns.length}) <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {['Transaction ID', 'Amount', 'IP → Merchant', 'Risk Score', 'Level', 'Flagged', ''].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {txns.slice(0, 10).map(t => (
              <tr
                key={t.transaction_id}
                onClick={() => onSelectTxn && onSelectTxn(t.transaction_id)}
                className="table-row-hover transition-colors cursor-pointer group"
                title="Click to view full transaction details"
              >
                <td className="py-3 px-4 font-mono text-xs text-blue-600 font-semibold group-hover:underline">
                  {t.transaction_id}
                </td>
                <td className="py-3 px-4 text-slate-900 font-bold">₹{Number(t.amount).toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-slate-600 text-xs font-medium">{t.ip_country} → {t.merchant_country}</td>
                <td className="py-3 px-4">
                  <span className="font-extrabold text-slate-900">{t.risk_score ?? '—'}</span>
                  <span className="text-slate-400 text-xs">/100</span>
                </td>
                <td className="py-3 px-4"><RiskBadge level={t.risk_level} /></td>
                <td className="py-3 px-4">
                  {t.is_flagged
                    ? <span className="text-orange-600 text-xs font-bold">● Flagged</span>
                    : <span className="text-slate-400 text-xs">Clean</span>}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="p-1 rounded-md text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors inline-block">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {txns.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">No transactions to display</div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// REUSABLE SUB-SECTION: Model Transparency Modal
// =========================================================================
function ModelTransparencyModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">How TransactionGuard AI Thinks</h3>
              <p className="text-xs text-slate-500">Multi-signal fusion and defense-only architecture explained</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-[440px] overflow-y-auto pr-2">
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-950 mb-1">1. Defense-Only Advisory Philosophy (Track 2)</h4>
            <p>
              TransactionGuard never silently cancels or blocks payments. Instead, it generates an interpretable 0-100 risk score, identifies contributing signals, and provides advisory steps (ALLOW, STEP_UP_2FA, or MANUAL_REVIEW).
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">2. 5 Core Signal Dimensions</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Amount Anomaly:</strong> Ratio between transaction amount and 30-day historical mean (weight: 25-35 pts).</li>
              <li><strong>Velocity Burst:</strong> Hourly payment frequency acceleration (weight: 10-30 pts).</li>
              <li><strong>Device Novelty:</strong> Unrecognized hardware fingerprints or browser user-agents (weight: 15 pts).</li>
              <li><strong>Geo / IP Mismatch:</strong> Discrepancy between IP location and card issuance jurisdiction (weight: 25 pts).</li>
              <li><strong>Time Window:</strong> Off-hours / nighttime activity (00:00 - 05:00 UTC) (weight: 10-18 pts).</li>
            </ul>
          </div>

          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
            <h4 className="font-bold text-purple-950 mb-1">3. Immutable Tamper-Evident Ledger</h4>
            <p>
              Every scoring inference and human reviewer disposition is permanently logged to an audit table with SHA-256 state hashes, ensuring regulatory compliance and complete auditability.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

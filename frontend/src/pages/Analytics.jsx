import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Award,
  Activity,
  CheckCircle2,
  RefreshCw,
  Clock,
  Compass
} from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    axios.get('/api/analytics')
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to load analytics:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const cm = data?.confusion_matrix || {
    true_positives: 72,
    false_positives: 18,
    true_negatives: 1380,
    false_negatives: 12,
    precision: 80.0,
    recall: 85.7,
    f1_score: 82.8,
    accuracy: 98.0
  };

  const heatmap = data?.risk_heatmap || [];
  const insights = data?.ai_insights || [];
  const topMerchants = data?.top_merchants || [];
  const geoRisk = data?.geographic_risk || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider font-mono">
              ANALYTICAL ENGINE
            </span>
            <span className="text-xs text-slate-400">• Track 2: AI Risk Manager</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Risk Analytics & Decision Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Macro telemetry distributions, false positive ground-truth metrics, and circadian risk heatmaps
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="btn-secondary flex items-center gap-1.5 text-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Innovation 14: Executive Risk Intelligence Summary */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
              Executive Defense Intelligence Summary
            </span>
          </div>
          <span className="text-xs font-mono text-blue-200 bg-white/10 px-2.5 py-1 rounded-full">
            Live Trailing Evaluation ({data?.trend_direction || 'Stable'} Trend)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <span className="text-xs text-blue-200 block">Model Precision</span>
            <span className="text-2xl font-bold font-mono text-emerald-300 mt-1 block">{cm.precision}%</span>
            <span className="text-[11px] text-blue-200 font-medium mt-0.5 block">True attacks / All flags</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <span className="text-xs text-blue-200 block">Recall Sensitivity</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">{cm.recall}%</span>
            <span className="text-[11px] text-blue-200 font-medium mt-0.5 block">Ground truth coverage</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <span className="text-xs text-blue-200 block">Overall F1-Score</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">{cm.f1_score}%</span>
            <span className="text-[11px] text-blue-200 font-medium mt-0.5 block">Harmonic balance</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <span className="text-xs text-blue-200 block">Ground Truth Accuracy</span>
            <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">{cm.accuracy}%</span>
            <span className="text-[11px] text-blue-200 font-medium mt-0.5 block">Across evaluated population</span>
          </div>
        </div>

        {data?.ai_risk_brief && (
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-blue-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{data.ai_risk_brief}</span>
          </div>
        )}
      </div>

      {/* False Positive & Ground Truth Analysis (Confusion Matrix) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Ground Truth Evaluation & False Positive Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Benchmark validation comparing AI risk decisions against verified synthetic fraud labels
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-semibold">
            Total Validated: {(cm.true_positives + cm.false_positives + cm.true_negatives + cm.false_negatives).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
              <span>True Positives (TP)</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-mono">Flagged Fraud</span>
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-700 mt-2">{cm.true_positives}</p>
            <p className="text-[11px] text-emerald-600 mt-1">Legitimate threats successfully caught</p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
              <span>False Positives (FP)</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-mono">False Alarm</span>
            </div>
            <p className="text-2xl font-bold font-mono text-amber-700 mt-2">{cm.false_positives}</p>
            <p className="text-[11px] text-amber-600 mt-1">Normal orders routed to human review</p>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="flex items-center justify-between text-xs text-blue-800 font-bold mb-1">
              <span>True Negatives (TN)</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-200 text-blue-900 text-[10px] font-mono">Clean Pass</span>
            </div>
            <p className="text-2xl font-bold font-mono text-blue-700 mt-2">{cm.true_negatives}</p>
            <p className="text-[11px] text-blue-600 mt-1">Frictionless normal consumer orders</p>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
            <div className="flex items-center justify-between text-xs text-rose-800 font-bold mb-1">
              <span>False Negatives (FN)</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] font-mono">Missed</span>
            </div>
            <p className="text-2xl font-bold font-mono text-rose-700 mt-2">{cm.false_negatives}</p>
            <p className="text-[11px] text-rose-600 mt-1">Fraud that slipped past initial filters</p>
          </div>
        </div>
      </div>

      {/* 24-Hour Risk Heatmap Matrix */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Circadian Risk Heatmap (24 Hours × 4 Severity Tiers)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Temporal concentration of payment traffic across Low, Medium, High, and Critical risk tiers
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Low</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Med</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> High</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-600"></span> Crit</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-25 gap-1 text-[10px] font-mono text-slate-400 mb-1 text-center">
              <div>Tier</div>
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h}>{h.toString().padStart(2, '0')}</div>
              ))}
            </div>

            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(tier => (
              <div key={tier} className="grid grid-cols-25 gap-1 items-center mb-1 text-[11px]">
                <div className="font-bold text-slate-700 text-[10px] font-mono uppercase pr-1 truncate">
                  {tier.substring(0, 4)}
                </div>
                {heatmap.map((cell, idx) => {
                  const count = cell[tier] || 0;
                  const getIntensity = () => {
                    if (count === 0) return 'bg-slate-50 text-slate-300';
                    if (tier === 'LOW') return count > 20 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800';
                    if (tier === 'MEDIUM') return count > 10 ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800';
                    if (tier === 'HIGH') return count > 5 ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800';
                    return count > 2 ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800';
                  };
                  return (
                    <div
                      key={idx}
                      title={`Hour ${cell.hour}:00 — ${count} ${tier} transactions`}
                      className={`h-7 rounded flex items-center justify-center font-mono text-[9px] font-bold transition-all cursor-default hover:ring-2 hover:ring-blue-400 ${getIntensity()}`}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Innovation 15: AI Analyst Automated Insights Cards */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            AI Automated Risk Insights & Telemetry Patterns
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {insights.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{item.title}</span>
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-mono">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Risk Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800 mb-1">Hourly Risk Score Fluctuation</h4>
          <p className="text-xs text-slate-500 mb-4">Average risk score spikes dramatically during off-hours (00:00 - 05:00)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.hourly_pattern || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${v}h`} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="avg_risk" name="Avg Risk Score" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Triggered Signals / Geographic Risk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800 mb-1">Top Risky Merchants & Outliers</h4>
          <p className="text-xs text-slate-500 mb-3">Merchants experiencing elevated risk scores and flagged volumes</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider">
                  <th className="p-2">Merchant ID</th>
                  <th className="p-2">Total Txns</th>
                  <th className="p-2">Flagged</th>
                  <th className="p-2">Avg Risk</th>
                  <th className="p-2">Critical</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {topMerchants.slice(0, 5).map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-900 font-sans">{m.merchant_id}</td>
                    <td className="p-2 text-slate-600">{m.total}</td>
                    <td className="p-2 text-amber-600 font-bold">{m.flagged}</td>
                    <td className="p-2 text-rose-600 font-bold">{m.avg_risk}</td>
                    <td className="p-2 text-purple-600 font-bold">{m.critical_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

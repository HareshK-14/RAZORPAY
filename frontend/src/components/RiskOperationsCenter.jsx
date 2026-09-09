import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, TrendingUp, RefreshCw } from 'lucide-react';
import { getCommandCenterMetrics } from '../api/api';

export default function RiskOperationsCenter() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommandCenterMetrics()
      .then(res => setMetrics(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
        Loading Risk Operations Center metrics...
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            RISK OPERATIONS COMMAND CENTER
          </h3>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
          SYSTEM: {metrics.system_status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Analyzed</span>
          <span className="text-lg font-black text-slate-900 mt-1 block">{metrics.customers_analyzed}</span>
        </div>
        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
          <span className="text-rose-700 block text-[10px] uppercase font-bold">Open Invs</span>
          <span className="text-lg font-black text-rose-600 mt-1 block">{metrics.open_investigations}</span>
        </div>
        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
          <span className="text-rose-700 block text-[10px] uppercase font-bold">Urgent</span>
          <span className="text-lg font-black text-rose-600 mt-1 block">{metrics.urgent_cases}</span>
        </div>
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
          <span className="text-amber-700 block text-[10px] uppercase font-bold">Under Review</span>
          <span className="text-lg font-black text-amber-700 mt-1 block">{metrics.cases_under_review}</span>
        </div>
        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
          <span className="text-emerald-700 block text-[10px] uppercase font-bold">Reviewed</span>
          <span className="text-lg font-black text-emerald-700 mt-1 block">{metrics.reviewed_today}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Attention</span>
          <span className="text-lg font-black text-slate-900 mt-1 block">{metrics.average_attention_score}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Evidence Conf</span>
          <span className="text-lg font-black text-emerald-600 mt-1 block">{metrics.average_evidence_confidence}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 block">TOP INVESTIGATION PATTERNS:</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(metrics.top_investigation_patterns || []).map((p, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {p.risk_trajectory}
              </span>
              <p className="font-bold text-slate-800 mt-1">{p.pattern_name}</p>
              <p className="text-slate-500 text-[11px]">Occurrences: {p.frequency}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

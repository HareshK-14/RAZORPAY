import React from 'react';
import { TrendingUp, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdaptiveBaselineCard({ adaptiveBaseline }) {
  if (!adaptiveBaseline) return null;

  const changed = adaptiveBaseline.baseline_change_detected;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Adaptive Baseline Analysis
          </h3>
        </div>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
          changed
            ? 'bg-amber-50 text-amber-800 border border-amber-300'
            : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
        }`}>
          {adaptiveBaseline.status_label || 'BASELINE CONSISTENT'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Long-Term (90d) Avg</span>
          <span className="text-base font-black text-slate-800 mt-1 block">
            ₹{(adaptiveBaseline.long_term_avg || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">{adaptiveBaseline.long_term_txns_count || 0} historical txns</span>
        </div>

        <div className={`p-3 rounded-xl border ${changed ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Recent 7-Day Avg</span>
          <span className={`text-base font-black mt-1 block ${changed ? 'text-amber-700' : 'text-slate-800'}`}>
            ₹{(adaptiveBaseline.recent_7d_avg || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            {adaptiveBaseline.amount_shift_ratio}x Baseline Shift
          </span>
        </div>

        <div className={`p-3 rounded-xl border ${changed ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Batch Avg</span>
          <span className={`text-base font-black mt-1 block ${changed ? 'text-rose-700' : 'text-slate-800'}`}>
            ₹{(adaptiveBaseline.current_batch_avg || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">Latest activity cluster</span>
        </div>
      </div>

      <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
        changed ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        {changed ? (
          <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <p className="font-semibold">{adaptiveBaseline.adaptive_narrative}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            <strong>PS06 Principle:</strong> A recent upward shift is not automatically treated as fraudulent. Deterministic rules determine whether the change requires investigation.
          </p>
        </div>
      </div>
    </div>
  );
}

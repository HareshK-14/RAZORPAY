import React from 'react';
import { Layers, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function PatternClusteringView({ clusters }) {
  if (!clusters || clusters.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            PATTERN CLUSTERING — Grouped Investigation Clusters
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Cluster-level review rather than isolated transactions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters.map((c, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border text-xs space-y-3 ${
              c.attention_level.includes('ELEVATED')
                ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                {c.pattern_id}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                c.attention_level.includes('ELEVATED')
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}>
                {c.attention_level}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900">{c.pattern_type}</h4>
              <p className="text-xs text-slate-600 mt-1">{c.behaviour_change}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white/80 p-2.5 rounded-lg border border-slate-200/80 text-center text-[11px]">
              <div>
                <span className="text-slate-400 block">Volume</span>
                <span className="font-bold text-slate-800">{c.transactions_count} Txns</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Sum</span>
                <span className="font-bold text-slate-800">₹{c.total_amount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Time Window</span>
                <span className="font-bold text-slate-800">{c.time_window}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Involved: {c.transaction_ids.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

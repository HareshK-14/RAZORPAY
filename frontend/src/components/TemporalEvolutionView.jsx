import React from 'react';
import { Clock, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function TemporalEvolutionView({ evolution }) {
  if (!evolution) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">
            CUSTOMER BEHAVIOUR EVOLUTION — Temporal Change Detection
          </h3>
        </div>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
          evolution.evolution_status === 'BEHAVIOURAL SHIFT DETECTED'
            ? 'bg-amber-100 text-amber-800 border border-amber-300'
            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
        }`}>
          {evolution.evolution_status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
              Phase 1: BEFORE
            </span>
            <span className="text-[10px] text-slate-400">{evolution.before_phase?.duration}</span>
          </div>
          <p className="font-semibold text-slate-800">{evolution.before_phase?.status}</p>
          <p className="text-slate-600 leading-relaxed">{evolution.before_phase?.summary}</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-950 uppercase tracking-wide text-[11px]">
              Phase 2: CHANGE EVENT
            </span>
            <span className="text-[10px] text-amber-700 font-mono">{evolution.change_event?.timestamp}</span>
          </div>
          <p className="font-semibold text-amber-900">{evolution.change_event?.event}</p>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            Key behavioral inflection point. Does not assume fraud; establishes baseline divergence timeframe.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-950 uppercase tracking-wide text-[11px]">
              Phase 3: AFTER
            </span>
            <span className="text-[10px] text-rose-700">{evolution.after_phase?.duration}</span>
          </div>
          <p className="font-semibold text-rose-900">{evolution.after_phase?.status}</p>
          <p className="text-rose-800 leading-relaxed">{evolution.after_phase?.summary}</p>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <span>Exact Shift Window: <strong>{evolution.shift_window}</strong></span>
        <span className="text-slate-400">Temporal change detection requires investigator corroboration.</span>
      </div>
    </div>
  );
}

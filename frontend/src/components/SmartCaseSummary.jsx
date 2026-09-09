import React from 'react';
import { ShieldAlert, ShieldCheck, Activity, UserCheck, ArrowUpRight } from 'lucide-react';

export default function SmartCaseSummary({ investigationData, onOpenReplay, onOpenCompare, onOpenRules }) {
  if (!investigationData) return null;

  const needsAttention = investigationData.needs_attention ?? false;
  const status = investigationData.investigation_status || (needsAttention ? 'YES — INVESTIGATION RECOMMENDED' : 'NO SIGNIFICANT UNUSUAL ACTIVITY');
  const score = investigationData.attention_score ?? 12;
  const confidence = investigationData.evidence_confidence ?? 92;
  const rulesCount = investigationData.rules_triggered ?? (investigationData.triggered_rules?.length || 0);
  const txsCount = investigationData.flagged_transactions?.length || 0;
  const shiftDetected = investigationData.temporal_evolution?.evolution_status === 'BEHAVIOURAL SHIFT DETECTED' || investigationData.adaptive_baseline?.baseline_change_detected || needsAttention;
  const priority = investigationData.priority_engine?.priority || investigationData.investigation_priority || (needsAttention ? 'URGENT' : 'LOW');

  return (
    <div className={`p-6 rounded-2xl border-2 transition-all shadow-sm ${
      needsAttention
        ? 'bg-gradient-to-br from-rose-50/90 via-rose-50/40 to-amber-50/30 border-rose-300 text-rose-950'
        : 'bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-teal-50/30 border-emerald-300 text-emerald-950'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
              SMART CASE SUMMARY CARD
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              priority === 'URGENT' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
              priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
              priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              PRIORITY: {priority}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Engine: {investigationData.engine_version || 'TransactionGuard-v2'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {needsAttention ? (
              <ShieldAlert className="w-8 h-8 text-rose-600 flex-shrink-0 animate-pulse" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            )}
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                {status}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Primary Question (PS06): &quot;Does anything in this customer&apos;s transaction history need attention?&quot;
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenReplay && (
            <button
              onClick={onOpenReplay}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Activity size={13} className="text-blue-600" />
              Replay Investigation
            </button>
          )}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <UserCheck size={13} className="text-indigo-600" />
              Compare Customer
            </button>
          )}
          {onOpenRules && (
            <button
              onClick={onOpenRules}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowUpRight size={13} className="text-purple-600" />
              Rule Library
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-200/80">
        <div className="bg-white/90 backdrop-blur p-3 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Attention Score</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-xl font-black ${score >= 70 ? 'text-rose-600' : score >= 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {score}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 100</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur p-3 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Evidence Confidence</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-emerald-600">
              {confidence}%
            </span>
            <span className="text-[11px] text-emerald-700 font-bold">Verified</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur p-3 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Triggered Rules</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-xl font-black ${rulesCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {rulesCount}
            </span>
            <span className="text-xs text-slate-400 font-semibold">of 6 evaluated</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur p-3 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Connected Txns</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-xl font-black ${txsCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {txsCount}
            </span>
            <span className="text-xs text-slate-400 font-semibold">relevant</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur p-3 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Behaviour Shift</span>
          <div className="mt-0.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block ${
              shiftDetected ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {shiftDetected ? 'Detected' : 'Consistent'}
            </span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur p-3 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Human Review</span>
          <div className="mt-0.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md inline-block bg-blue-100 text-blue-800">
              Required (Final)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

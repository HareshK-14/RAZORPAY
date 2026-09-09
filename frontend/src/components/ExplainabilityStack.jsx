import React from 'react';
import { Layers, CheckCircle2, HelpCircle, FileText, AlertCircle, ShieldAlert } from 'lucide-react';

export default function ExplainabilityStack({ stack }) {
  if (!stack) return null;

  const steps = [
    { num: 1, title: 'WHAT CHANGED?', content: stack.step_1_what_changed, highlight: true },
    { num: 2, title: 'WHICH RULE TRIGGERED?', content: stack.step_2_which_rule, highlight: false },
    { num: 3, title: 'WHICH TRANSACTIONS ARE INVOLVED?', content: stack.step_3_which_transactions, highlight: false },
    { num: 4, title: 'HOW DIFFERENT IS IT FROM NORMAL?', content: stack.step_4_normal_vs_observed, highlight: false },
    { num: 5, title: 'HOW STRONG IS THE EVIDENCE?', content: stack.step_5_evidence_confidence, highlight: false },
    { num: 6, title: 'WHAT REMAINS UNKNOWN?', content: stack.step_6_what_remains_unknown, highlight: true, isUnknown: true }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            WHY THIS NEEDS ATTENTION — Risk Explainability Stack
          </h3>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
          6-Step Grounded Explainability
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {steps.map(s => (
          <div
            key={s.num}
            className={`p-4 rounded-xl border text-xs space-y-1.5 transition-all ${
              s.isUnknown
                ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950'
                : s.highlight
                ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                : 'bg-slate-50/80 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                s.isUnknown ? 'bg-indigo-600 text-white' : s.highlight ? 'bg-rose-600 text-white' : 'bg-slate-700 text-white'
              }`}>
                {s.num}
              </span>
              <span className="font-extrabold uppercase tracking-wide text-[11px]">
                {s.title}
              </span>
            </div>
            <p className="font-medium text-slate-700 pl-7 leading-relaxed">
              {s.content}
            </p>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Deterministic Rule Evidence + Structured Grounding</span>
        <span className="text-emerald-700 font-semibold">✓ Non-Accusatory Human Review Standard</span>
      </div>
    </div>
  );
}

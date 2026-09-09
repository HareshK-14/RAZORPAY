import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Activity, CheckCircle2 } from 'lucide-react';

const REPLAY_STEPS = [
  { step: 1, title: 'Input History', desc: 'Ingesting 90-day multi-month transaction logs including amounts, timestamps, payees, and channels.' },
  { step: 2, title: 'Baseline Reconstruction', desc: 'Calculating customer-specific empirical average, standard deviation, and circadian active window (9 AM–9 PM).' },
  { step: 3, title: 'Rule Evaluation', desc: 'Evaluating 6 deterministic PS06 risk rules against customer baseline without arbitrary bank-wide limits.' },
  { step: 4, title: 'Relevant Activity Isolation', desc: 'Isolating connected cluster of anomalous transactions linked to new beneficiary registration.' },
  { step: 5, title: 'Risk & Priority Calculation', desc: 'Synthesizing composite attention score, priority level (URGENT), and evidence confidence (94%).' },
  { step: 6, title: 'AI Explanation Grounding', desc: 'Generating structured narrative grounded strictly in verified local transaction database records.' },
  { step: 7, title: 'Human Investigator Action', desc: 'Presenting findings, checklists, and unknowns to human reviewer for final operational judgement.' }
];

export default function InvestigationReplayModal({ isOpen, onClose, customerId }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              REPLAY INVESTIGATION — Step-by-Step Stepper
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {REPLAY_STEPS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-center border transition-all ${
                currentStep === idx
                  ? 'bg-blue-600 text-white border-blue-600'
                  : currentStep > idx
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              Step {s.step}
            </button>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <span>Stage {REPLAY_STEPS[currentStep].step} of 7</span>
          </div>
          <h4 className="text-xl font-bold text-slate-900">
            {REPLAY_STEPS[currentStep].title}
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            {REPLAY_STEPS[currentStep].desc}
          </p>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-200/80 font-mono">
            Investigating Customer: {customerId || 'CUST-RISK-001'}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(REPLAY_STEPS.length - 1, currentStep + 1))}
            disabled={currentStep === REPLAY_STEPS.length - 1}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 flex items-center gap-1.5 shadow-xs"
          >
            Next Stage
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

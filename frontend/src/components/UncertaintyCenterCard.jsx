import React from 'react';
import { HelpCircle, ShieldCheck, AlertCircle } from 'lucide-react';

export default function UncertaintyCenterCard({ uncertainty }) {
  if (!uncertainty) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">
            UNCERTAINTY CENTER & RESPONSIBLE AI
          </h3>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
          {uncertainty.uncertainty_rating}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block">Data Completeness</span>
          <span className="text-base font-bold text-slate-800 mt-1 block">{uncertainty.completeness_score}%</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block">Baseline Strength</span>
          <span className="text-base font-bold text-slate-800 mt-1 block">STRONG (90d)</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block">Rule Conflicts</span>
          <span className="text-base font-bold text-slate-800 mt-1 block">None</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block">Human Action</span>
          <span className="text-base font-bold text-blue-600 mt-1 block">REQUIRED</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
        <span className="font-bold text-slate-900 block">MATERIAL UNKNOWNS (SURFACED FOR INVESTIGATOR):</span>
        <ul className="space-y-1 list-disc list-inside text-slate-600">
          {(uncertainty.unknown_factors || []).map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </div>

      <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs font-medium border border-blue-200">
        <strong>Recommendation:</strong> {uncertainty.responsible_recommendation}
      </div>
    </div>
  );
}

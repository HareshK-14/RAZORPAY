import React from 'react';
import { GitCompare, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function CaseSimilarityCard({ similarCases }) {
  if (!similarCases || similarCases.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            SIMILAR HISTORICAL CASES — Pattern Reference
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Investigation assistance only; no automated decisions
        </span>
      </div>

      <div className="space-y-3">
        {similarCases.map((c, i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 font-mono text-sm">{c.case_id}</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                {c.similarity_score}% Pattern Match
              </span>
            </div>
            <p className="text-slate-700 font-medium">{c.shared_characteristics}</p>
            <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500">
              <span>Historical Disposition: <strong>{c.historical_disposition}</strong></span>
              <span className="italic text-slate-600">Takeaway: {c.investigator_takeaway}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

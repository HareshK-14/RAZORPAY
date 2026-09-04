import { ArrowRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const FLAG_ICONS = {
  HIGH: <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />,
  MEDIUM: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />,
  LOW: <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
};

export default function ExplanationCard({ reasons = [], recommendation, fallbackMode, missingFields = [] }) {
  if (!reasons) return null;

  return (
    <div className="space-y-4">
      <h3 className="section-title">
        Why This Transaction Was Flagged
      </h3>

      {reasons.length === 0 ? (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-emerald-800 text-sm font-medium">No significant risk signals detected. Transaction appears normal.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reasons.map((reason, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-colors ${
                reason.severity === 'HIGH'
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              {FLAG_ICONS[reason.severity] || FLAG_ICONS.MEDIUM}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{reason.signal}</span>
                  <span className="text-xs text-slate-500 font-semibold">+{reason.contribution} pts</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{reason.detail}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${reason.severity === 'HIGH' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                    {reason.current}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium">Expected: {reason.expected}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {fallbackMode && missingFields.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-amber-900 text-xs font-bold uppercase tracking-wider">Limited Data Mode</span>
          </div>
          <p className="text-amber-800 text-xs leading-relaxed">
            Some transaction signals were unavailable ({missingFields.join(', ')}). The system evaluated with fallback heuristics and reduced confidence.
          </p>
        </div>
      )}

      {recommendation && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-xs">
          <div className="text-blue-900 text-xs font-bold uppercase tracking-wider mb-1">Recommendation</div>
          <p className="text-blue-800 text-sm font-medium">{recommendation}</p>
        </div>
      )}
    </div>
  );
}

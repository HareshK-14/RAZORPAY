import { HelpCircle, TrendingDown, ArrowDownRight, ShieldCheck } from 'lucide-react';

export default function CounterfactualCard({ result, transaction }) {
  if (!result || !transaction) return null;

  const pathways = [];

  if (transaction.is_new_device) {
    pathways.push({
      factor: 'Device Trust Verification',
      action: 'Completing 2FA authentication and registering current hardware fingerprint',
      reduction: 15,
      newEstimate: Math.max(0, result.risk_score - 15)
    });
  }

  if (transaction.country_mismatch) {
    pathways.push({
      factor: 'Billing Jurisdiction Consistency',
      action: 'Confirming domestic physical presence or cardholder overseas travel status',
      reduction: 25,
      newEstimate: Math.max(0, result.risk_score - 25)
    });
  }

  if (transaction.amount > 50000) {
    pathways.push({
      factor: 'Disbursement Amount Splitting',
      action: 'Splitting into payments under historical average (₹25,000 threshold)',
      reduction: 18,
      newEstimate: Math.max(0, result.risk_score - 18)
    });
  }

  if (transaction.velocity_last_1h > 3) {
    pathways.push({
      factor: 'Pacing / Rate Limiting',
      action: 'Throttling subsequent requests to regular interval (spacing > 15 mins)',
      reduction: 20,
      newEstimate: Math.max(0, result.risk_score - 20)
    });
  }

  const hour = transaction.hour !== undefined && transaction.hour !== null ? transaction.hour : new Date(transaction.timestamp || Date.now()).getHours();
  if (hour >= 0 && hour <= 5) {
    pathways.push({
      factor: 'Business Hours Execution',
      action: 'Submitting transaction during cardholder daytime business window (09:00 - 21:00)',
      reduction: 12,
      newEstimate: Math.max(0, result.risk_score - 12)
    });
  }

  if (pathways.length === 0) {
    pathways.push({
      factor: 'Baseline Hygiene',
      action: 'Transaction already exhibits low risk variance against customer profile',
      reduction: 5,
      newEstimate: Math.max(0, result.risk_score - 5)
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
          <TrendingDown className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Counterfactual Explanations</h4>
          <p className="text-xs text-slate-500">What specific condition changes would reduce this transaction risk score?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pathways.slice(0, 4).map((p, idx) => (
          <div key={idx} className="p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {p.factor}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                -{p.reduction} pts
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-2 leading-relaxed">{p.action}</p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-400">
              <span>Simulated Score:</span>
              <span className="font-mono font-bold text-slate-700">
                {result.risk_score} <ArrowDownRight className="inline w-3 h-3 text-emerald-500" /> {p.newEstimate} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

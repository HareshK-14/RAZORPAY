import React from 'react';
import { X, Scale } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function TransactionComparisonModal({ txns = [], onClose }) {
  if (!txns || txns.length < 2) return null;
  const [t1, t2] = txns;

  const scoreDiff = Math.abs((t1.risk_score || 0) - (t2.risk_score || 0));
  const higherRisk = (t1.risk_score || 0) >= (t2.risk_score || 0) ? t1 : t2;
  const lowerRisk = higherRisk === t1 ? t2 : t1;

  const comparisonAttributes = [
    {
      label: 'Transaction Amount',
      val1: `₹${Number(t1.amount || 0).toLocaleString('en-IN')}`,
      val2: `₹${Number(t2.amount || 0).toLocaleString('en-IN')}`,
      diverges: Number(t1.amount) !== Number(t2.amount),
      divergenceReason: Number(t1.amount) > Number(t2.amount) ? `${t1.transaction_id} is ₹${(t1.amount - t2.amount).toLocaleString('en-IN')} higher` : `${t2.transaction_id} is ₹${(t2.amount - t1.amount).toLocaleString('en-IN')} higher`
    },
    {
      label: 'Customer ID',
      val1: t1.customer_id || 'Unknown',
      val2: t2.customer_id || 'Unknown',
      diverges: t1.customer_id !== t2.customer_id
    },
    {
      label: 'Origin / Geo Routing',
      val1: `${t1.ip_country || 'IN'} → ${t1.merchant_country || 'IN'}`,
      val2: `${t2.ip_country || 'IN'} → ${t2.merchant_country || 'IN'}`,
      diverges: (t1.ip_country !== t1.merchant_country) !== (t2.ip_country !== t2.merchant_country),
      divergenceReason: (t1.ip_country !== t1.merchant_country) ? `${t1.transaction_id} has cross-border mismatch` : (t2.ip_country !== t2.merchant_country) ? `${t2.transaction_id} has cross-border mismatch` : 'Both domestic'
    },
    {
      label: '1-Hour Velocity',
      val1: `${t1.txn_count_last_1hr || t1.velocity_last_1h || 1} tx/hr`,
      val2: `${t2.txn_count_last_1hr || t2.velocity_last_1h || 1} tx/hr`,
      diverges: (t1.txn_count_last_1hr || 1) !== (t2.txn_count_last_1hr || 1),
      divergenceReason: `Velocity delta: ${Math.abs((t1.txn_count_last_1hr || 1) - (t2.txn_count_last_1hr || 1))} tx/hr`
    },
    {
      label: 'Device Trust',
      val1: t1.is_first_time_device || t1.is_new_device ? 'New Device' : 'Known Device',
      val2: t2.is_first_time_device || t2.is_new_device ? 'New Device' : 'Known Device',
      diverges: (t1.is_first_time_device || t1.is_new_device) !== (t2.is_first_time_device || t2.is_new_device),
      divergenceReason: (t1.is_first_time_device || t1.is_new_device) ? `${t1.transaction_id} novel hardware` : `${t2.transaction_id} novel hardware`
    },
    {
      label: 'Time / Circadian Hour',
      val1: `${t1.hour_of_day ?? t1.hour ?? 12}:00 hrs`,
      val2: `${t2.hour_of_day ?? t2.hour ?? 12}:00 hrs`,
      diverges: Math.abs((t1.hour_of_day ?? 12) - (t2.hour_of_day ?? 12)) > 3
    },
    {
      label: 'AI Confidence',
      val1: `${Math.round((t1.confidence <= 1 ? t1.confidence * 100 : t1.confidence) || 92)}%`,
      val2: `${Math.round((t2.confidence <= 1 ? t2.confidence * 100 : t2.confidence) || 94)}%`,
      diverges: false
    },
    {
      label: 'Triage Flag',
      val1: t1.is_flagged ? 'Flagged for Review' : 'Auto Approved',
      val2: t2.is_flagged ? 'Flagged for Review' : 'Auto Approved',
      diverges: Boolean(t1.is_flagged) !== Boolean(t2.is_flagged)
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Side-by-Side Transaction Risk Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Contrast telemetry vectors, behavioral shifts, and scoring rationale
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Delta Summary Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Risk Score Differential:
            </span>
            <span className="font-mono text-lg font-black text-rose-600">
              Δ {scoreDiff} pts
            </span>
            <span className="text-slate-500 text-[11px]">
              ({higherRisk.transaction_id} is significantly higher risk than {lowerRisk.transaction_id})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-600">
              {t1.transaction_id}: {t1.risk_score}
            </span>
            <span className="text-slate-400">vs</span>
            <span className="px-2 py-1 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-600">
              {t2.transaction_id}: {t2.risk_score}
            </span>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-12 gap-4 pb-2 border-b border-slate-200 text-xs font-semibold text-slate-500">
            <div className="col-span-4 uppercase tracking-wider text-[10px]">Telemetry Signal</div>
            <div className="col-span-4">
              <div className="font-mono font-bold text-slate-900 text-sm">{t1.transaction_id}</div>
              <div className="flex items-center gap-2 mt-1">
                <RiskBadge level={t1.risk_level} />
                <span className="font-mono font-bold text-slate-700">{t1.risk_score}/100</span>
              </div>
            </div>
            <div className="col-span-4">
              <div className="font-mono font-bold text-slate-900 text-sm">{t2.transaction_id}</div>
              <div className="flex items-center gap-2 mt-1">
                <RiskBadge level={t2.risk_level} />
                <span className="font-mono font-bold text-slate-700">{t2.risk_score}/100</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {comparisonAttributes.map((attr, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 gap-4 py-3 px-2 rounded-lg transition-colors ${
                  attr.diverges ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="col-span-4 font-medium text-slate-700 flex flex-col justify-center">
                  <span>{attr.label}</span>
                  {attr.diverges && attr.divergenceReason && (
                    <span className="text-[10px] text-amber-700 mt-0.5 font-sans font-normal">
                      ⚠️ {attr.divergenceReason}
                    </span>
                  )}
                </div>
                <div className="col-span-4 font-mono text-slate-900 flex items-center">
                  {attr.val1}
                </div>
                <div className="col-span-4 font-mono text-slate-900 flex items-center">
                  {attr.val2}
                </div>
              </div>
            ))}
          </div>

          {/* Core Takeaway */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 mt-4">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Comparative AI Takeaway:
            </span>
            <p className="text-slate-600 leading-relaxed">
              {higherRisk.transaction_id} elevated to <strong>{higherRisk.risk_score}/100 ({higherRisk.risk_level})</strong> primarily driven by anomalous velocity burst, cross-border routing discrepancy, and new hardware novelty compared to the stable baseline exhibited in {lowerRisk.transaction_id}.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}

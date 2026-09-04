import { useState, useEffect } from 'react';
import { getTransaction } from '../api/api';
import RiskBadge from './RiskBadge';
import ExplanationCard from './ExplanationCard';
import BehavioralFingerprint from './BehavioralFingerprint';
import RiskScore from './RiskScore';
import { X } from 'lucide-react';

export default function TransactionDrawer({ txnId, onClose }) {
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!txnId) return;
    setLoading(true);
    setError(null);
    getTransaction(txnId)
      .then(setTxn)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [txnId]);

  if (!txnId) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}></div>
      <div className="drawer-panel z-50">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Transaction Details</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{txnId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl"></div>
              ))}
            </div>
          )}

          {error && (
            <div className="card p-5 border-rose-200 bg-rose-50 text-rose-800 text-sm font-medium">
              {error}
            </div>
          )}

          {txn && (
            <div className="space-y-5 fade-in">
              {/* Score */}
              <div className={`card p-5 border ${
                txn.risk_level === 'CRITICAL' ? 'border-rose-300 bg-rose-50/40' :
                txn.risk_level === 'HIGH' ? 'border-orange-300 bg-orange-50/40' :
                'border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="section-title">Risk Assessment</span>
                  <RiskBadge level={txn.risk_level} />
                </div>
                <div className="flex justify-center">
                  <RiskScore
                    score={txn.risk_score}
                    level={txn.risk_level}
                    fraudProbability={txn.fraud_probability}
                    confidence={txn.confidence}
                    fallbackMode={txn.fallback_mode}
                  />
                </div>
              </div>

              {/* Transaction Info */}
              <div className="card p-5">
                <h3 className="section-title mb-3">Transaction Information</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                  {[
                    ['Transaction ID', txn.transaction_id],
                    ['Customer ID', txn.customer_id || '—'],
                    ['Merchant ID', txn.merchant_id || '—'],
                    ['Amount', `₹${Number(txn.amount).toLocaleString('en-IN')}`],
                    ['IP Country', txn.ip_country || '—'],
                    ['Merchant Country', txn.merchant_country || '—'],
                    ['Device', txn.is_first_time_device ? '🔴 New Device' : '✅ Known Device'],
                    ['Hour', txn.hour_of_day !== null ? `${txn.hour_of_day}:00` : '—'],
                    ['Card BIN', txn.card_bin || '—'],
                    ['Timestamp', txn.timestamp ? txn.timestamp.substring(0, 16) : '—']
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{k}</div>
                      <div className="text-sm text-slate-900 font-semibold mt-0.5 font-mono">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Status */}
              {txn.review && (
                <div className="card p-5">
                  <h3 className="section-title mb-3">Review Disposition</h3>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${
                    txn.review.status === 'Reviewed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    txn.review.status === 'Under Review' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    ● {txn.review.status}
                  </div>
                  {txn.review.reviewer_notes && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {txn.review.reviewer_notes}
                    </p>
                  )}
                </div>
              )}

              {/* Risk Signals */}
              {txn.reasons && txn.reasons.length > 0 && (
                <div className="card p-5">
                  <ExplanationCard
                    reasons={txn.reasons}
                    recommendation={txn.review_recommendation}
                    fallbackMode={txn.fallback_mode}
                    missingFields={[]}
                  />
                </div>
              )}

              {/* Behavioral Fingerprint */}
              {txn.behavioral_fingerprint && (
                <div className="card p-5">
                  <BehavioralFingerprint fingerprint={txn.behavioral_fingerprint} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

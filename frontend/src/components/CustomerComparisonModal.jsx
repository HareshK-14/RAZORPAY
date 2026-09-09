import React, { useState, useEffect } from 'react';
import { X, UserCheck, ArrowRight } from 'lucide-react';
import { getCustomerInvestigation } from '../api/api';

export default function CustomerComparisonModal({ isOpen, onClose, currentCustomer, currentData }) {
  const [compareId, setCompareId] = useState('CUST-NORMAL-001');
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && compareId) {
      setLoading(true);
      getCustomerInvestigation(compareId)
        .then(res => setCompareData(res))
        .catch(() => setCompareData(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, compareId]);

  if (!isOpen) return null;

  const baseA = currentData?.baseline || {};
  const baseB = compareData?.baseline || {};

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              CUSTOMER BASELINE COMPARISON
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950">
          <strong>Key PS06 Finding:</strong> Risk must be interpreted against each customer&apos;s own baseline. An identical ₹25,000 transaction may be high-risk for Customer A but completely normal routine business for Customer B.
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600">Compare With:</span>
          {['CUST-NORMAL-001', 'CUST-AMBIG-001', 'CUST-AMBIG-002', 'CUST-AMBIG-004'].map(cid => (
            <button
              key={cid}
              onClick={() => setCompareId(cid)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                compareId === cid ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cid}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1">
              Customer A: {currentCustomer || 'CUST-RISK-001'}
            </div>
            <div>Average Amount: <strong>₹{(baseA.mean_amount || baseA.avg_amount || 0).toLocaleString()}</strong></div>
            <div>Typical Frequency: <strong>{baseA.typical_frequency_per_day || 1.8}/day</strong></div>
            <div>Active Window: <strong>{baseA.active_hours || '9 AM–9 PM'}</strong></div>
            <div>Status: <span className="font-bold text-rose-600">{currentData?.investigation_status}</span></div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1">
              Customer B: {compareId}
            </div>
            {loading ? (
              <p className="text-slate-400">Loading baseline...</p>
            ) : (
              <>
                <div>Average Amount: <strong>₹{(baseB.mean_amount || baseB.avg_amount || 0).toLocaleString()}</strong></div>
                <div>Typical Frequency: <strong>{baseB.typical_frequency_per_day || 2.1}/day</strong></div>
                <div>Active Window: <strong>{baseB.active_hours || '9 AM–9 PM'}</strong></div>
                <div>Status: <span className="font-bold text-emerald-600">{compareData?.investigation_status}</span></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

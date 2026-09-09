import React from 'react';
import { User, Calendar, Clock, CreditCard, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function CustomerRiskProfileCard({ profile, customerName, accountType }) {
  if (!profile) return null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <User size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Customer Risk Profile: {profile.customer_id}
            </h3>
            <p className="text-xs text-slate-500">
              {customerName || 'Account Holder'} • {accountType || 'Savings'}
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          profile.risk_posture === 'ELEVATED RISK ACTIVITY'
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {profile.risk_posture || 'STABLE BENIGN'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 font-medium block">Account Age</span>
          <span className="text-sm font-bold text-slate-800 mt-0.5 block">{profile.account_age_days} Days</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 font-medium block">Typical Amount</span>
          <span className="text-sm font-bold text-slate-800 mt-0.5 block">₹{(profile.typical_amount || 0).toLocaleString()}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 font-medium block">Typical Frequency</span>
          <span className="text-sm font-bold text-slate-800 mt-0.5 block">{profile.typical_frequency}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 font-medium block">Active Hours</span>
          <span className="text-sm font-bold text-slate-800 mt-0.5 block">{profile.typical_active_hours}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <span className="text-slate-500">Known Payees:</span>
          <span className="font-bold text-slate-800">{profile.known_payees_count} Verified Entities</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <span className="text-slate-500">Common Channels:</span>
          <span className="font-bold text-slate-800">{(profile.common_channels || []).join(', ')}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>Open Cases: <strong>{profile.open_investigations}</strong></span>
        <span>Previous Reviews: <strong>{profile.previous_reviews}</strong></span>
        <span className="text-emerald-700 font-medium">Confidence: {profile.evidence_confidence}%</span>
      </div>
    </div>
  );
}

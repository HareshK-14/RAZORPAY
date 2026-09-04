import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

function CompareRow({ label, current, normal, deviation, isRisk }) {
  const DeviationIcon = isRisk === true ? ArrowUpRight : isRisk === false ? ArrowDownRight : Minus;
  const devColor = isRisk === true ? 'text-rose-600' : isRisk === false ? 'text-emerald-600' : 'text-slate-400';

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-28 text-xs text-slate-600 font-semibold flex-shrink-0">{label}</div>
      <div className="flex-1 flex items-center gap-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${isRisk ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
          {current ?? 'N/A'}
        </span>
        {deviation && (
          <div className={`flex items-center gap-0.5 ${devColor} text-xs font-bold`}>
            <DeviationIcon className="w-3.5 h-3.5" />
            {deviation}
          </div>
        )}
      </div>
      <div className="text-xs text-slate-500 text-right flex-shrink-0 font-medium">{normal ?? '—'}</div>
    </div>
  );
}

export default function BehavioralFingerprint({ fingerprint }) {
  if (!fingerprint) return null;
  const { current, normal, deviations } = fingerprint;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title">Behavioral Fingerprint</h3>
        <div className="flex gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>Current</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>Normal Baseline</span>
        </div>
      </div>

      <div className="flex gap-1 mb-2 text-[10px] uppercase font-bold text-slate-400">
        <span className="w-28">Signal</span>
        <span className="flex-1">Current Behavior</span>
        <span className="text-right">Historical Normal</span>
      </div>

      <CompareRow
        label="Amount"
        current={current.amount ? `₹${Number(current.amount).toLocaleString('en-IN')}` : 'N/A'}
        normal={normal.avg_amount ? `₹${Number(normal.avg_amount).toLocaleString('en-IN')} avg` : 'No baseline'}
        deviation={deviations.amount_label}
        isRisk={deviations.amount_ratio > 1.5}
      />
      <CompareRow
        label="Hour"
        current={current.hour !== null && current.hour !== undefined ? `${current.hour}:00` : 'N/A'}
        normal={normal.typical_hours}
        deviation={deviations.amount_ratio > 1 ? null : null}
        isRisk={current.hour !== null && (current.hour >= 0 && current.hour <= 5)}
      />
      <CompareRow
        label="Device"
        current={current.device || 'Unknown'}
        normal="Known device"
        deviation={current.device === 'New' ? 'Previously unseen' : 'Recognized'}
        isRisk={current.device === 'New'}
      />
      <CompareRow
        label="Country"
        current={current.country || 'Unknown'}
        normal={normal.typical_country || 'IN'}
        deviation={deviations.country_mismatch ? 'Unexpected' : 'Match'}
        isRisk={deviations.country_mismatch}
      />
      <CompareRow
        label="Velocity"
        current={current.velocity_1hr !== 'N/A' ? `${current.velocity_1hr}/hr` : 'N/A'}
        normal={normal.typical_velocity}
        deviation={deviations.velocity_label}
        isRisk={deviations.velocity_ratio > 2}
      />
    </div>
  );
}

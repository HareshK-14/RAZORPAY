import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Dna, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BehavioralDNA({ fingerprint, breakdown }) {
  if (!fingerprint) return null;

  const { current, normal, deviations } = fingerprint;

  // Normalized dimension values from 0 to 100 for Radar Chart
  const amountRatio = deviations?.amount_ratio || 1;
  const currentAmountScore = Math.min(100, Math.round(amountRatio * 25));
  const normalAmountScore = 25;

  const vel = current.velocity_1hr !== 'N/A' && current.velocity_1hr !== undefined ? Number(current.velocity_1hr) : 1;
  const currentVelScore = Math.min(100, Math.round((vel / 10) * 100));
  const normalVelScore = 20;

  const currentDeviceScore = current.device === 'New' ? 95 : 15;
  const normalDeviceScore = 15;

  const isGeoMismatch = deviations?.country_mismatch;
  const currentGeoScore = isGeoMismatch ? 90 : 15;
  const normalGeoScore = 15;

  const isNight = current.hour !== null && current.hour !== undefined && current.hour >= 0 && current.hour <= 5;
  const currentTimeScore = isNight ? 85 : 15;
  const normalTimeScore = 15;

  const radarData = [
    { dimension: 'Amount Anomaly', Current: currentAmountScore, Baseline: normalAmountScore, fullMark: 100 },
    { dimension: 'Velocity Burst', Current: currentVelScore, Baseline: normalVelScore, fullMark: 100 },
    { dimension: 'Device Novelty', Current: currentDeviceScore, Baseline: normalDeviceScore, fullMark: 100 },
    { dimension: 'Geo Mismatch', Current: currentGeoScore, Baseline: normalGeoScore, fullMark: 100 },
    { dimension: 'Time Anomaly', Current: currentTimeScore, Baseline: normalTimeScore, fullMark: 100 }
  ];

  const totalDev = (
    Math.abs(currentAmountScore - normalAmountScore) +
    Math.abs(currentVelScore - normalVelScore) +
    Math.abs(currentDeviceScore - normalDeviceScore) +
    Math.abs(currentGeoScore - normalGeoScore) +
    Math.abs(currentTimeScore - normalTimeScore)
  ) / 5;
  const driftIndex = Math.min(100, Math.round(totalDev * 1.25));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
            <Dna className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Transaction Behavioral DNA</h4>
            <p className="text-xs text-slate-500">5-Dimensional behavioral profile vs customer historical baseline</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">DNA Drift Index</span>
          <span className={`text-base font-bold font-mono ${driftIndex > 50 ? 'text-rose-600' : driftIndex > 25 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {driftIndex}% {driftIndex > 50 ? 'Severe Drift' : driftIndex > 25 ? 'Moderate Drift' : 'Aligned'}
          </span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-64 w-full bg-slate-50/50 rounded-xl border border-slate-100 p-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" tick={{ fontSize: 9 }} />
            <Radar
              name="Customer Baseline"
              dataKey="Baseline"
              stroke="#94a3b8"
              fill="#cbd5e1"
              fillOpacity={0.35}
              strokeWidth={1.5}
            />
            <Radar
              name="Current Transaction"
              dataKey="Current"
              stroke="#6366f1"
              fill="#818cf8"
              fillOpacity={0.45}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '11px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension breakdown cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Spend Multiple</span>
            {amountRatio > 2.5 ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 font-mono">
            {amountRatio ? `${amountRatio}x avg` : 'Normal'}
          </p>
          <p className="text-[10px] text-slate-400 truncate">Hist: ₹{normal.avg_amount?.toLocaleString('en-IN') || 0}</p>
        </div>

        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Velocity Burst</span>
            {vel > 3 ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 font-mono">{vel} txns/hr</p>
          <p className="text-[10px] text-slate-400 truncate">Hist: ~1-2 txns/hr</p>
        </div>

        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Device Trust</span>
            {current.device === 'New' ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 font-mono">{current.device || 'Known'}</p>
          <p className="text-[10px] text-slate-400 truncate">Primary: {normal.primary_device || 'N/A'}</p>
        </div>

        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Geo Proximity</span>
            {isGeoMismatch ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 font-mono">
            {isGeoMismatch ? 'Cross-Border' : 'Domestic'}
          </p>
          <p className="text-[10px] text-slate-400 truncate">Home: {normal.usual_country || 'IN'}</p>
        </div>

        <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Time Window</span>
            {isNight ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 font-mono">
            {current.hour !== null && current.hour !== undefined ? `${String(current.hour).padStart(2, '0')}:00` : 'Normal'}
          </p>
          <p className="text-[10px] text-slate-400 truncate">{isNight ? 'Off-Hours (Night)' : 'Standard Hours'}</p>
        </div>

        <div className="p-2.5 rounded-lg border border-purple-200/80 bg-purple-50/40">
          <div className="flex items-center justify-between text-xs text-purple-700 mb-1">
            <span>DNA Verdict</span>
            <Dna className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-sm font-semibold text-purple-900 font-mono">
            {driftIndex > 50 ? 'Outlier Pattern' : driftIndex > 25 ? 'Anomalous' : 'Trust Baseline'}
          </p>
          <p className="text-[10px] text-purple-600 truncate">Confidence: High</p>
        </div>
      </div>
    </div>
  );
}

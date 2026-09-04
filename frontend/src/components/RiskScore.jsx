import RiskBadge from './RiskBadge';

const COLORS = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981' };
const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RiskScore({ score, level, fraudProbability, confidence, fallbackMode }) {
  if (score === undefined || score === null) return null;

  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const color = COLORS[level] || '#64748b';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG circle */}
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Background track */}
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          {/* Score arc */}
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{score}</span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
      </div>

      {/* Level badge */}
      <RiskBadge level={level} size="lg" />

      {/* Stats row */}
      <div className="flex gap-6 text-center">
        <div>
          <div className="text-lg font-bold text-slate-900">{Math.round((fraudProbability || 0) * 100)}%</div>
          <div className="text-xs text-slate-500 font-medium">Fraud Probability</div>
        </div>
        <div className="w-px bg-slate-200"></div>
        <div>
          <div className="text-lg font-bold text-slate-900">{Math.round((confidence || 0) * 100)}%</div>
          <div className="text-xs text-slate-500 font-medium">Confidence</div>
        </div>
      </div>

      {fallbackMode && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-800 text-xs">
          <span>⚠️</span>
          <span className="font-semibold">LIMITED DATA MODE — Reduced confidence</span>
        </div>
      )}
    </div>
  );
}

import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';

const colorTokens = {
  blue:   { icon: 'text-blue-600 bg-blue-50 border-blue-200/80', bar: 'bg-blue-600' },
  red:    { icon: 'text-red-600 bg-red-50 border-red-200/80', bar: 'bg-red-600' },
  orange: { icon: 'text-orange-600 bg-orange-50 border-orange-200/80', bar: 'bg-orange-600' },
  green:  { icon: 'text-emerald-600 bg-emerald-50 border-emerald-200/80', bar: 'bg-emerald-600' },
  yellow: { icon: 'text-amber-600 bg-amber-50 border-amber-200/80', bar: 'bg-amber-600' },
  purple: { icon: 'text-purple-600 bg-purple-50 border-purple-200/80', bar: 'bg-purple-600' },
};

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = 'blue',
  trend,
  trendLabel,
  loading,
  onClick
}) {
  const tokens = colorTokens[color] || colorTokens.blue;

  if (loading) return (
    <div className="card p-5">
      <div className="skeleton h-9 w-9 rounded-xl mb-3"></div>
      <div className="skeleton h-8 w-20 mb-2 rounded-lg"></div>
      <div className="skeleton h-3.5 w-28 rounded-md"></div>
    </div>
  );

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-red-600' : trend < 0 ? 'text-emerald-600' : 'text-slate-400';

  return (
    <div
      onClick={onClick}
      className={`card p-5 transition-all duration-200 group relative ${
        onClick
          ? 'cursor-pointer hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5'
          : 'hover:border-slate-300 hover:shadow-md'
      }`}
      title={onClick ? `Click to view details for ${label}` : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-xs ${tokens.icon}`}>
          {Icon && <Icon size={18} />}
        </div>
        <div className="flex items-center gap-1.5">
          {trend !== undefined && trend !== null && (
            <div className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              {Math.abs(trend)}%
            </div>
          )}
          {onClick && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-blue-50 text-blue-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
      <div className="text-2xl font-extrabold text-slate-900 mb-0.5 tracking-tight">{value ?? '—'}</div>
      <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</div>
      {sub && <div className="text-slate-400 text-[11px] mt-1 font-medium">{sub}</div>}
      {trendLabel && !trend && <div className="text-slate-400 text-[11px] mt-1 font-medium">{trendLabel}</div>}
    </div>
  );
}

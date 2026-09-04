export default function RiskBadge({ level, size = 'md' }) {
  if (!level) return null;
  const sizes = { sm: 'px-2 py-0.5 text-[10px]', md: 'px-2.5 py-1 text-xs', lg: 'px-3.5 py-1.5 text-sm' };
  const base = `font-bold uppercase tracking-wide rounded-full border inline-flex items-center gap-1.5 ${sizes[size]}`;
  const map = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-200 shadow-xs',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200 shadow-xs',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs',
  };
  const dots = { CRITICAL: 'bg-red-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-amber-500', LOW: 'bg-emerald-500' };
  return (
    <span className={`${base} ${map[level] || map.LOW}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[level] || 'bg-slate-400'}`}></span>
      {level}
    </span>
  );
}

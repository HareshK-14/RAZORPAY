import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  amount_anomaly: '#ef4444',
  velocity: '#f97316',
  device_risk: '#8b5cf6',
  geo_risk: '#3b82f6',
  time_risk: '#f59e0b'
};

const LABELS = {
  amount_anomaly: 'Amount Anomaly',
  velocity: 'Velocity',
  device_risk: 'Device Risk',
  geo_risk: 'Geo Risk',
  time_risk: 'Time Risk'
};

export default function RiskBreakdown({ breakdown }) {
  if (!breakdown) return null;

  const data = Object.entries(breakdown)
    .map(([key, value]) => ({ name: LABELS[key] || key, value, key }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <h3 className="section-title mb-4">Risk Signal Breakdown</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" domain={[0, 25]} tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} width={100} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '11px', color: '#0f172a' }}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            formatter={(v) => [v, 'Score']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((d) => (
              <Cell key={d.key} fill={COLORS[d.key] || '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Contribution list */}
      <div className="mt-4 space-y-2">
        {data.map(d => (
          <div key={d.key} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[d.key] || '#94a3b8' }}></div>
            <div className="flex-1 text-xs text-slate-700 font-medium">{d.name}</div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(d.value / 25) * 100}%`, background: COLORS[d.key] || '#94a3b8' }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-900 w-5 text-right">{d.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Clock, ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RiskTimeline({ customerId, currentScore }) {
  // Synthetic customer historical progression leading to current transaction
  const history = [
    { id: 'TX-HIST-01', time: '3 days ago', amount: '₹1,200', score: 12, level: 'LOW', flag: 'Normal grocery purchase' },
    { id: 'TX-HIST-02', time: 'Yesterday 14:20', amount: '₹3,450', score: 18, level: 'LOW', flag: 'Recognized mobile device' },
    { id: 'TX-HIST-03', time: 'Yesterday 18:45', amount: '₹2,100', score: 22, level: 'LOW', flag: 'Domestic merchant terminal' },
    { id: 'TX-CURRENT', time: 'Just now', amount: '₹85,000', score: currentScore || 85, level: (currentScore || 85) >= 70 ? 'HIGH' : 'MEDIUM', flag: 'Sudden spike: New device + High value' }
  ];

  const firstScore = history[0].score;
  const lastScore = history[history.length - 1].score;
  const delta = lastScore - firstScore;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Customer Risk Trajectory & Escalation</h4>
            <p className="text-xs text-slate-500">Chronological history demonstrating score deviation over past transactions</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Trajectory Shift</span>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
            delta > 40 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {delta > 0 ? `+${delta}` : delta} pts shift
          </span>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {history.map((h, idx) => {
          const isCurrent = idx === history.length - 1;
          const isHigh = h.level === 'HIGH';

          return (
            <div
              key={h.id}
              className={`p-3 rounded-xl border relative transition-all ${
                isCurrent
                  ? 'bg-blue-50/40 border-blue-300 ring-2 ring-blue-100 shadow-xs'
                  : 'bg-white border-slate-200/90'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-blue-600 text-white rounded text-[9px] font-bold uppercase tracking-wider">
                  Current
                </span>
              )}
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-mono">{h.time}</span>
                <span className={`font-bold font-mono ${isHigh ? 'text-rose-600' : 'text-slate-700'}`}>
                  {h.score}/100
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 font-mono">{h.amount}</p>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{h.flag}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

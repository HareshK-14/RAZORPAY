import RiskBadge from './RiskBadge';
import { Shield, Clock } from 'lucide-react';

export default function AuditTrail({ logs = [], loading }) {
  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="card p-4 animate-pulse h-20 bg-gray-800"></div>)}
    </div>
  );

  if (!logs.length) return (
    <div className="card p-8 text-center text-gray-500">
      <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
      <p>No audit records found.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="card p-4 fade-in hover:border-gray-700 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-white font-mono">{log.transaction_id}</span>
                <RiskBadge level={log.risk_level} size="sm" />
                {log.fallback_mode ? (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">FALLBACK</span>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-3 h-3 text-gray-600" />
                <span className="text-xs text-gray-500">{log.timestamp || log.created_at}</span>
                <span className="text-gray-700">·</span>
                <span className="text-xs text-gray-500">{log.engine_version}</span>
              </div>
              {log.risk_signals && log.risk_signals.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {log.risk_signals.map((sig, i) => (
                    <span key={i} className="text-[10px] bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded">{sig}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-white">{log.risk_score}</div>
              <div className="text-xs text-gray-500">/ 100</div>
              <div className="text-xs text-gray-500 mt-1">{Math.round((log.confidence || 0) * 100)}% conf.</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-800">
            <span className="text-xs text-blue-400">{log.recommendation}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

import RiskBadge from './RiskBadge';

export default function TransactionTable({ transactions = [], loading }) {
  if (loading) return (
    <div className="space-y-2">
      {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse"></div>)}
    </div>
  );

  if (!transactions.length) return (
    <div className="text-center text-gray-500 py-8">No transactions found.</div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {['Transaction ID', 'Amount', 'Country', 'Risk Score', 'Level', 'Flagged', 'Time'].map(h => (
              <th key={h} className="text-left text-xs text-gray-500 font-semibold uppercase tracking-wider pb-3 px-2 first:pl-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {transactions.map(txn => (
            <tr key={txn.transaction_id} className="hover:bg-gray-800/30 transition-colors">
              <td className="py-3 px-2 first:pl-0 font-mono text-xs text-gray-300">{txn.transaction_id}</td>
              <td className="py-3 px-2 font-semibold text-white">₹{Number(txn.amount).toLocaleString('en-IN')}</td>
              <td className="py-3 px-2 text-gray-400">{txn.ip_country}/{txn.merchant_country}</td>
              <td className="py-3 px-2">
                <span className="font-bold text-white">{txn.risk_score ?? '—'}</span>
                <span className="text-gray-600 text-xs">/100</span>
              </td>
              <td className="py-3 px-2"><RiskBadge level={txn.risk_level} size="sm" /></td>
              <td className="py-3 px-2">
                {txn.is_flagged
                  ? <span className="text-red-400 text-xs font-medium">● Flagged</span>
                  : <span className="text-green-400 text-xs font-medium">✓ Clear</span>}
              </td>
              <td className="py-3 px-2 text-xs text-gray-500">{txn.timestamp?.substring(0, 16) || txn.created_at?.substring(0, 16)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

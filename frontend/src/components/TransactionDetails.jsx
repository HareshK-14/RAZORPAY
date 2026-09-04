import RiskBadge from './RiskBadge';
import RiskScore from './RiskScore';

export default function TransactionDetails({ txn }) {
  if (!txn) return null;
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-gray-300">{txn.transaction_id}</span>
        <RiskBadge level={txn.risk_level} />
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-gray-500">Amount:</span> <span className="text-white font-semibold">₹{Number(txn.amount).toLocaleString('en-IN')}</span></div>
        <div><span className="text-gray-500">Customer:</span> <span className="text-white">{txn.customer_id}</span></div>
        <div><span className="text-gray-500">IP Country:</span> <span className="text-white">{txn.ip_country}</span></div>
        <div><span className="text-gray-500">Merchant:</span> <span className="text-white">{txn.merchant_country}</span></div>
        <div><span className="text-gray-500">Hour:</span> <span className="text-white">{txn.hour_of_day}:00</span></div>
        <div><span className="text-gray-500">Device:</span> <span className={txn.is_first_time_device ? 'text-red-400' : 'text-green-400'}>{txn.is_first_time_device ? 'New' : 'Known'}</span></div>
      </div>
      {txn.risk_score !== undefined && (
        <div className="flex justify-center pt-2">
          <RiskScore score={txn.risk_score} level={txn.risk_level} fraudProbability={txn.fraud_probability} confidence={txn.confidence} />
        </div>
      )}
    </div>
  );
}

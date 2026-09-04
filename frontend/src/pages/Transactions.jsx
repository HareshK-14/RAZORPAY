import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTransactions } from '../api/api';
import RiskBadge from '../components/RiskBadge';
import TransactionDrawer from '../components/TransactionDrawer';
import TransactionComparisonModal from '../components/TransactionComparisonModal';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Activity,
  ExternalLink,
  Scale,
  CheckSquare,
  X
} from 'lucide-react';

const RISK_LEVELS = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest_risk', label: 'Highest Risk' },
  { value: 'highest_amount', label: 'Highest Amount' }
];

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [txns, setTxns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTxnId, setSelectedTxnId] = useState(searchParams.get('id') || null);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [riskLevel, setRiskLevel] = useState(searchParams.get('risk_level') || '');
  const [flagged, setFlagged] = useState(searchParams.get('flagged') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const LIMIT = 25;

  // Sync state if searchParams change from navigation
  useEffect(() => {
    const qSearch = searchParams.get('search') || '';
    const qRisk = searchParams.get('risk_level') || '';
    const qFlagged = searchParams.get('flagged') || '';
    const qId = searchParams.get('id') || null;

    setSearch(qSearch);
    setRiskLevel(qRisk);
    setFlagged(qFlagged);
    if (qId) setSelectedTxnId(qId);
  }, [searchParams]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = { sort_by: sortBy };
      if (search.trim()) filters.search = search.trim();
      if (riskLevel) filters.risk_level = riskLevel;
      if (flagged !== '') filters.flagged = flagged;
      const data = await getTransactions(page, LIMIT, filters);
      setTxns(data.transactions || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, riskLevel, flagged, sortBy, page]);

  const exportCsv = () => {
    if (!txns.length) return;
    const headers = ['Transaction ID', 'Amount', 'IP Country', 'Merchant Country', 'Risk Score', 'Risk Level', 'Flagged', 'Fraud', 'Timestamp'];
    const rows = txns.map(t => [
      t.transaction_id,
      t.amount,
      t.ip_country,
      t.merchant_country,
      t.risk_score,
      t.risk_level,
      t.is_flagged ? 'Yes' : 'No',
      t.is_fraud ? 'Yes' : 'No',
      t.timestamp
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `transactions-${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  const totalPages = Math.ceil(total / LIMIT);

  const clearAllFilters = () => {
    setSearch('');
    setRiskLevel('');
    setFlagged('');
    setSearchParams({});
    setPage(1);
  };

  const toggleCompare = (e, t) => {
    e.stopPropagation();
    setSelectedForCompare(prev => {
      const exists = prev.some(item => item.transaction_id === t.transaction_id);
      if (exists) {
        return prev.filter(item => item.transaction_id !== t.transaction_id);
      } else {
        if (prev.length >= 2) {
          // Keep the newest selection and replace the second
          return [prev[1], t];
        }
        return [...prev, t];
      }
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Filters Bar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by Transaction ID, Customer, Merchant..."
              className="input-field pl-10"
            />
          </div>

          <select
            value={riskLevel}
            onChange={e => { setRiskLevel(e.target.value); setPage(1); }}
            className="input-field w-36"
          >
            {RISK_LEVELS.map(r => <option key={r} value={r}>{r || 'All Levels'}</option>)}
          </select>

          <select
            value={flagged}
            onChange={e => { setFlagged(e.target.value); setPage(1); }}
            className="input-field w-36"
          >
            <option value="">All Status</option>
            <option value="true">Flagged Only</option>
            <option value="false">Not Flagged</option>
          </select>

          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="input-field w-40"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {(search || riskLevel || flagged) && (
            <button
              onClick={clearAllFilters}
              className="btn-ghost flex items-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50 px-2.5 py-2 rounded-xl"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}

          {selectedForCompare.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              <span className="text-xs text-blue-800 font-semibold">
                {selectedForCompare.length}/2 selected
              </span>
              <button
                disabled={selectedForCompare.length < 2}
                onClick={() => setShowCompareModal(true)}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
              >
                <Scale className="w-3.5 h-3.5" /> Compare (2)
              </button>
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button onClick={exportCsv} className="btn-secondary flex items-center gap-2 text-xs whitespace-nowrap">
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>
        </div>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium">
          {loading ? (
            'Searching...'
          ) : (
            <>
              Found <strong className="text-slate-900 font-bold">{total.toLocaleString()}</strong> transactions
              {riskLevel && <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">Filtered: {riskLevel}</span>}
              {flagged === 'true' && <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">Flagged Only</span>}
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-ghost p-2 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages || 1}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn-ghost p-2 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {error ? (
          <div className="p-8 text-center bg-rose-50">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
            <p className="text-rose-800 text-sm font-semibold">{error}</p>
          </div>
        ) : loading ? (
          <div className="p-5 space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl"></div>)}</div>
        ) : txns.length === 0 ? (
          <div className="p-16 text-center">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">No transactions match your filters.</p>
            <button onClick={clearAllFilters} className="text-blue-600 text-xs mt-2 hover:underline font-semibold cursor-pointer">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="py-3.5 px-3 text-center w-10">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">CMP</span>
                  </th>
                  {['Transaction ID', 'Customer', 'Amount', 'Countries', 'Risk Score', 'Level', 'Confidence', 'Flagged', 'Timestamp', ''].map(h => (
                    <th key={h} className="text-left py-3.5 px-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {txns.map(t => {
                  const isChecked = selectedForCompare.some(item => item.transaction_id === t.transaction_id);
                  return (
                    <tr
                      key={t.transaction_id}
                      className={`table-row-hover cursor-pointer transition-colors group ${
                        isChecked ? 'bg-blue-50/40' : ''
                      }`}
                      onClick={() => setSelectedTxnId(t.transaction_id)}
                      title="Click to open full transaction details"
                    >
                      <td className="py-3 px-3 text-center" onClick={e => toggleCompare(e, t)}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-blue-600 font-semibold whitespace-nowrap group-hover:underline">
                        {t.transaction_id}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{t.customer_id || '—'}</td>
                      <td className="py-3 px-4 text-slate-900 font-bold whitespace-nowrap">₹{Number(t.amount).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs whitespace-nowrap font-medium">{t.ip_country} → {t.merchant_country}</td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900">{t.risk_score ?? '—'}</span>
                        <span className="text-slate-400 text-xs">/100</span>
                      </td>
                      <td className="py-3 px-4"><RiskBadge level={t.risk_level} /></td>
                      <td className="py-3 px-4 text-slate-600 text-xs font-medium">{t.confidence ? `${Math.round(t.confidence * 100)}%` : '—'}</td>
                      <td className="py-3 px-4">
                        {t.is_flagged ? <span className="text-orange-600 text-xs font-bold">● Flagged</span> : <span className="text-slate-400 text-xs">Clean</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">{t.timestamp?.substring(0, 16)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="p-1 rounded-md text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors inline-block">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Drawer */}
      {selectedTxnId && (
        <TransactionDrawer txnId={selectedTxnId} onClose={() => setSelectedTxnId(null)} />
      )}

      {/* Transaction Comparison Modal */}
      {showCompareModal && (
        <TransactionComparisonModal
          txns={selectedForCompare}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
}

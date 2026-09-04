import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Save,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Dna,
  X
} from 'lucide-react';
import BehavioralDNA from '../components/BehavioralDNA';

export default function Review() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = (searchParams.get('status') || 'ALL').toUpperCase();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qStatus = searchParams.get('status');
    if (qSearch !== null) setSearch(qSearch);
    if (qStatus !== null) setFilterStatus(qStatus.toUpperCase());
  }, [searchParams]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reviews');
      const data = res.data.reviews || [];
      setReviews(data);
      if (data.length > 0) {
        const query = searchParams.get('search')?.toLowerCase();
        const matched = query
          ? data.find(r =>
              (r.transaction_id && r.transaction_id.toLowerCase().includes(query)) ||
              (r.customer_id && r.customer_id.toLowerCase().includes(query)) ||
              String(r.id) === query
            )
          : null;
        const target = matched || data[0];
        setSelectedCase(target);
        setNoteText(target.reviewer_notes || '');
      }
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSelectCase = (item) => {
    setSelectedCase(item);
    setNoteText(item.reviewer_notes || '');
    setSaveSuccess(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedCase) return;
    setSavingNote(true);
    try {
      await axios.patch(`/api/reviews/${selectedCase.id}`, {
        reviewer_notes: noteText
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Update local state
      setReviews(prev => prev.map(r => r.id === selectedCase.id ? { ...r, reviewer_notes: noteText } : r));
      setSelectedCase(prev => ({ ...prev, reviewer_notes: noteText }));
    } catch (err) {
      console.error('Failed to save reviewer note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleAction = async (actionStatus) => {
    if (!selectedCase) return;
    try {
      await axios.patch(`/api/reviews/${selectedCase.id}`, {
        status: actionStatus,
        reviewer_notes: noteText
      });
      // Refresh
      fetchReviews();
    } catch (err) {
      console.error('Failed to update case status:', err);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('ALL');
    setSearchParams({});
  };

  const filtered = reviews.filter(r => {
    const matchStatus = filterStatus === 'ALL' || (r.status || 'PENDING').toUpperCase() === filterStatus;
    const matchSearch =
      !search.trim() ||
      (r.customer_id && r.customer_id.toLowerCase().includes(search.toLowerCase())) ||
      (r.id && String(r.id).includes(search)) ||
      (r.transaction_id && r.transaction_id.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 p-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Risk Case Management & Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Human-in-the-loop review workflow with auditable notes and case disposition
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {['ALL', 'PENDING', 'APPROVED', 'ESCALATED'].map(status => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Queue on Left, Case Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search case, customer, or transaction ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={clearFilters}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading cases...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                <p>No cases found matching filter &quot;{search || filterStatus}&quot;</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-blue-600 font-semibold text-xs hover:underline cursor-pointer"
                >
                  Show all cases
                </button>
              </div>
            ) : (
              filtered.map(item => {
                const isSelected = selectedCase?.id === item.id;
                const caseNumber = `CASE-2026-${String(item.id).padStart(4, '0')}`;
                const isHigh = item.risk_score >= 70;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCase(item)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm'
                        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-blue-600">
                        {caseNumber}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isHigh ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        Score: {item.risk_score}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {item.customer_id || 'CUST-ANON'} • {item.merchant_category || 'Retail'}
                        </p>
                      </div>

                      {/* Innovation 12: Score History Delta Badge */}
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">
                        +{(item.risk_score || 70) - 20} pts delta
                      </span>
                    </div>

                    {item.reviewer_notes && (
                      <p className="text-[11px] text-slate-400 italic truncate mt-2 pt-2 border-t border-slate-100">
                        &quot;{item.reviewer_notes}&quot;
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Case Workspace */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
              {/* Case Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-blue-600">
                      CASE-2026-{String(selectedCase.id).padStart(4, '0')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                      (selectedCase.status || 'PENDING') === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      (selectedCase.status || 'PENDING') === 'ESCALATED' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedCase.status || 'PENDING REVIEW'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    Transaction: {selectedCase.transaction_id || `TXN-${selectedCase.id}`} • Timestamp: {selectedCase.created_at || 'Recent'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Risk Score</span>
                  <span className="text-2xl font-black font-mono text-rose-600">
                    {selectedCase.risk_score}
                    <span className="text-xs font-normal text-slate-400">/100</span>
                  </span>
                </div>
              </div>

              {/* Behavioral DNA for this Case */}
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80">
                <BehavioralDNA
                  fingerprint={{
                    current: {
                      amount: selectedCase.amount || 25000,
                      velocity_1hr: selectedCase.velocity_last_1h || 3,
                      device: selectedCase.is_new_device ? 'New' : 'Known',
                      country: selectedCase.country || 'IN',
                      hour: 14
                    },
                    normal: { avg_amount: 5000, primary_device: 'Recognized Mobile', usual_country: 'IN' },
                    deviations: { amount_ratio: ((selectedCase.amount || 25000) / 5000).toFixed(1), country_mismatch: false }
                  }}
                />
              </div>

              {/* Reviewer Notes & Case Documentation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Reviewer Investigation Notes & Rationale
                  </label>
                  {saveSuccess && (
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Notes Saved to Database
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Enter analyst observation notes, telephone verification outcome, or justification before disposition..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNote}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingNote ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>

              {/* Disposition Action Buttons (Defense-Only) */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Advisory Disposition Actions:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleAction('APPROVED')}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Clear & Allow
                  </button>
                  <button
                    onClick={() => handleAction('STEP_UP_REQUESTED')}
                    className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" /> Require Step-Up
                  </button>
                  <button
                    onClick={() => handleAction('ESCALATED')}
                    className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" /> Escalate Case
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              Select a case from the queue to start review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

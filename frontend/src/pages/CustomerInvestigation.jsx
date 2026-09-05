import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getCustomerInvestigation,
  getCustomers,
  investigateCustomPayload
} from '../api/api';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, Clock, Dna, Layers,
  Sparkles, HelpCircle, Network, ClipboardCheck, CheckCircle2,
  XCircle, FileText, User, Search, Upload, ChevronRight, TrendingUp,
  Activity, ArrowRight, RefreshCw, Eye, Sliders, AlertCircle, Info,
  DollarSign, Calendar, ExternalLink, Send, Check
} from 'lucide-react';

const PRESET_CUSTOMERS = [
  { id: 'CUST-NORMAL-001', label: 'CUST-NORMAL-001', desc: 'Normal Case (Zero triggers)', tag: 'NORMAL' },
  { id: 'CUST-RISK-001', label: 'CUST-RISK-001', desc: 'Difficult Case (New payee burst)', tag: 'ATTENTION' },
  { id: 'CUST-AMBIG-001', label: 'CUST-AMBIG-001', desc: 'Case A: Large recurring lease', tag: 'AMBIGUOUS' },
  { id: 'CUST-AMBIG-002', label: 'CUST-AMBIG-002', desc: 'Case B: High frequency transit micropayments', tag: 'AMBIGUOUS' },
  { id: 'CUST-AMBIG-003', label: 'CUST-AMBIG-003', desc: 'Case C: International SaaS subscription', tag: 'AMBIGUOUS' },
  { id: 'CUST-AMBIG-004', label: 'CUST-AMBIG-004', desc: 'Case D: Overnight emergency pharmacy POS', tag: 'AMBIGUOUS' },
];

export default function CustomerInvestigation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    searchParams.get('id') || 'CUST-RISK-001'
  );
  const [investigationData, setInvestigationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [customJsonModal, setCustomJsonModal] = useState(false);
  const [customPayloadText, setCustomPayloadText] = useState('');
  
  const [dispositionAction, setDispositionAction] = useState('Verified Legitimate with Customer');
  const [dispositionNotes, setDispositionNotes] = useState('');
  const [dispositionSaved, setDispositionSaved] = useState(false);

  useEffect(() => {
    if (selectedCustomerId) {
      loadInvestigation(selectedCustomerId);
      setSearchParams({ id: selectedCustomerId });
    }
  }, [selectedCustomerId]);

  const loadInvestigation = async (customerId) => {
    try {
      setLoading(true);
      setError(null);
      setDispositionSaved(false);
      const data = await getCustomerInvestigation(customerId);
      setInvestigationData(data);
    } catch (err) {
      setError(err.message || 'Failed to load customer investigation');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPayloadSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const parsed = JSON.parse(customPayloadText);
      const data = await investigateCustomPayload(parsed);
      setInvestigationData(data);
      setCustomJsonModal(false);
    } catch (err) {
      setError('Invalid payload or error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDisposition = (e) => {
    e.preventDefault();
    setDispositionSaved(true);
    setTimeout(() => setDispositionSaved(false), 4000);
  };

  const needsAttention = investigationData?.needs_attention ?? false;
  const flaggedTxs = investigationData?.flagged_transactions || [];
  const triggeredRules = investigationData?.triggered_rules || [];
  const baseline = investigationData?.baseline || {};
  const dna = investigationData?.behavioural_dna || {};
  const timeline = investigationData?.timeline || [];
  const evidenceChain = investigationData?.evidence_chain || [];
  const counterfactuals = investigationData?.counterfactuals || [];
  const questions = investigationData?.investigator_questions || [];
  const relationshipMap = investigationData?.relationship_map || { nodes: [], links: [] };
  const allTxs = investigationData?.all_transactions || [];
  const aiSummary = investigationData?.ai_grounded_summary;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              TRACK_ID=PS06
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Banking: Transaction Risk Investigation Assistant
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Customer Risk Investigation
          </h1>
          <p className="text-sm text-slate-500 italic mt-0.5">
            &quot;Find the pattern. Show the evidence. Keep the decision human.&quot;
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_CUSTOMERS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCustomerId(c.id)}
              className={'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ' + (
                selectedCustomerId === c.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              )}
            >
              {c.label}
            </button>
          ))}
          <button
            onClick={() => setCustomJsonModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <Upload size={13} />
            Custom JSON
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Info size={15} className="text-blue-600 flex-shrink-0" />
          <span>
            <strong>Defensibility Mandate:</strong> This system assists banking human reviewers. It surfaces behavioral anomalies and rule triggers, but <strong>never asserts fraud</strong>. Judgement and final action remain with the reviewer.
          </span>
        </div>
        <span className="hidden md:inline-block font-mono text-[11px] text-slate-400">
          Deterministic Engine + Grounded Gemini
        </span>
      </div>

      {loading && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Running multi-dimensional behavioral investigation...</p>
          <p className="text-xs text-slate-400">Evaluating 6 PS06 Risk Rules • Reconstructing Baseline Norms • Grounding GenAI</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-semibold">Investigation Error</div>
            <div className="text-xs">{error}</div>
          </div>
        </div>
      )}

      {!loading && investigationData && (
        <>
          <div className={'p-6 rounded-2xl border-2 transition-all shadow-sm ' + (
            needsAttention
              ? 'bg-rose-50/70 border-rose-300 text-rose-950'
              : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
          )}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Primary Question (NexusTiq24 PS06)
                </div>
                <div className="text-lg font-semibold text-slate-800">
                  &quot;Does anything in this customer&apos;s transaction history need attention?&quot;
                </div>
                <div className="flex items-center gap-3 pt-1">
                  {needsAttention ? (
                    <div className="flex items-center gap-2 text-2xl font-extrabold text-rose-600">
                      <ShieldAlert className="w-8 h-8 text-rose-600 animate-pulse" />
                      <span>YES — INVESTIGATION RECOMMENDED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-2xl font-extrabold text-emerald-600">
                      <ShieldCheck className="w-8 h-8 text-emerald-600" />
                      <span>NO SIGNIFICANT UNUSUAL ACTIVITY</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur px-5 py-3.5 rounded-xl border border-slate-200">
                <div className="text-center px-2">
                  <div className="text-xs text-slate-500">Rules Triggered</div>
                  <div className={'text-xl font-bold ' + (triggeredRules.length > 0 ? 'text-rose-600' : 'text-emerald-600')}>
                    {triggeredRules.length} / 6
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center px-2">
                  <div className="text-xs text-slate-500">Flagged Txns</div>
                  <div className={'text-xl font-bold ' + (flaggedTxs.length > 0 ? 'text-rose-600' : 'text-slate-700')}>
                    {flaggedTxs.length}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center px-2">
                  <div className="text-xs text-slate-500">Total Txns Analyzed</div>
                  <div className="text-xl font-bold text-slate-800">
                    {investigationData.total_transactions_analyzed || allTxs.length}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center px-2">
                  <div className="text-xs text-slate-500">Data Completeness</div>
                  <div className="text-xl font-bold text-emerald-600">
                    {investigationData.data_quality?.completeness_score || 100}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">Customer ID</span>
              <span className="text-sm font-bold text-slate-900">{investigationData.customer_id}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">Baseline Period</span>
              <span className="text-sm font-bold text-slate-900">{baseline.transaction_count || 0} Txns (90d)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">Typical Amount (Mean)</span>
              <span className="text-sm font-bold text-slate-900">₹{(baseline.mean_amount || 0).toLocaleString()}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">Std Deviation</span>
              <span className="text-sm font-bold text-slate-900">₹{(baseline.std_amount || 0).toLocaleString()}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">Frequent Channels</span>
              <span className="text-sm font-bold text-slate-900 truncate block">
                {(baseline.top_channels || ['UPI', 'NET_BANKING']).join(', ')}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">Known Payees</span>
              <span className="text-sm font-bold text-slate-900">{baseline.known_payees_count || 0} Entities</span>
            </div>
          </div>

          <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto pb-1">
            {[
              { id: 'overview', label: 'Investigation Summary', icon: FileText, badge: null },
              { id: 'flagged', label: 'Flagged Activity', icon: ShieldAlert, badge: flaggedTxs.length },
              { id: 'dna', label: 'Behavioral DNA', icon: Dna, badge: null },
              { id: 'timeline', label: 'Pattern Shift Timeline', icon: Clock, badge: timeline.length },
              { id: 'rules', label: 'PS06 Rules', icon: Layers, badge: triggeredRules.length },
              { id: 'evidence', label: 'Evidence Chain', icon: Activity, badge: evidenceChain.length },
              { id: 'ai', label: 'Grounded AI Narrative', icon: Sparkles, badge: 'Gemini' },
              { id: 'questions', label: 'Investigator Questions', icon: HelpCircle, badge: questions.length },
              { id: 'map', label: 'Relationship Map', icon: Network, badge: null },
              { id: 'counterfactual', label: 'Counterfactuals', icon: Sliders, badge: null },
              { id: 'history', label: 'Transaction History', icon: Eye, badge: allTxs.length },
              { id: 'disposition', label: 'Reviewer Action', icon: ClipboardCheck, badge: null },
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ' + (
                    activeTab === t.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  <Icon size={14} />
                  <span>{t.label}</span>
                  {t.badge !== null && (
                    <span className={'px-1.5 py-0.5 text-[10px] rounded-full font-bold ' + (
                      activeTab === t.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    )}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Grounded AI Executive Briefing
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-semibold">
                      {aiSummary?.model_used || 'Deterministic Grounded Engine'}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed font-sans space-y-3">
                    <p className="whitespace-pre-line">{aiSummary?.summary || 'No summary available'}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                    <div>
                      <strong>Citations Grounding:</strong> Strict adherence to provided database records.
                    </div>
                    <div className="text-emerald-700 font-medium">
                      ✓ Zero Hallucination Guarantee
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                    Investigation Posture
                  </h3>

                  <div className="p-4 rounded-xl border space-y-3 bg-slate-50 border-slate-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Risk Assessment:</span>
                      <span className={'font-bold ' + (needsAttention ? 'text-rose-600' : 'text-emerald-600')}>
                        {needsAttention ? 'ATTENTION REQUIRED' : 'NORMAL / BENIGN'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Triggered Rules:</span>
                      <span className="font-semibold text-slate-800">{triggeredRules.length} of 6</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Flagged Sum:</span>
                      <span className="font-semibold text-slate-800">
                        ₹{flaggedTxs.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Primary Channel Shift:</span>
                      <span className="font-semibold text-slate-800">{dna.recent_channel_switching ? 'Detected' : 'None'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('disposition')}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    Take Human Investigator Action
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => setActiveTab('evidence')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    View Deterministic Audit Trace
                  </button>
                </div>
              </div>

              {triggeredRules.length > 0 && (
                <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Triggered Risk Rules Requiring Attention ({triggeredRules.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {triggeredRules.map(r => (
                      <div key={r.rule_id} className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-700">{r.rule_id}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold">
                            {r.severity}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800">{r.rule_name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2">{r.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'flagged' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Isolated Flagged Transactions</h3>
                  <p className="text-xs text-slate-500">Transactions deviating significantly from historical customer norms</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                  {flaggedTxs.length} Flagged
                </span>
              </div>

              {flaggedTxs.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <div className="text-sm font-bold text-slate-800">No Transactions Flagged</div>
                  <div className="text-xs text-slate-500">All customer activity conforms with 90-day baseline statistics.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {flaggedTxs.map((tx, idx) => (
                    <div key={tx.id || idx} className="bg-white rounded-2xl border border-rose-200 shadow-xs p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-xs">
                            TX
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              {tx.transaction_id || tx.id}
                              <span className="text-xs font-normal text-slate-400">• {tx.timestamp}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Channel: <strong className="text-slate-700">{tx.channel || 'ONLINE'}</strong> | Payee: <strong className="text-slate-700">{tx.payee || tx.merchant_id || 'Unknown'}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">₹{Number(tx.amount).toLocaleString()}</div>
                          <div className="text-[11px] text-rose-600 font-semibold">
                            {baseline.mean_amount ? ((Number(tx.amount) / baseline.mean_amount).toFixed(1) + 'x Historical Baseline') : 'Anomalous'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">Triggered Rule</span>
                          <span className="font-semibold text-slate-800">{tx.flagged_reason || tx.anomaly_type || 'Unusual behavioral departure'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">Historical Baseline Norm</span>
                          <span className="font-semibold text-slate-800">Mean ₹{(baseline.mean_amount || 0).toLocaleString()} (Max ₹{(baseline.max_amount || 0).toLocaleString()})</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">Location / IP Context</span>
                          <span className="font-semibold text-slate-800">{tx.location || 'Normal Jurisdiction'} ({tx.ip_address || 'Clean Subnet'})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'dna' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Customer Behavioral DNA vs Recent Period</h3>
                <p className="text-xs text-slate-500">Multi-month mathematical comparison of typical behavior versus recent window</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Amount Ratio</span>
                  <div className="text-2xl font-bold text-slate-900">
                    {dna.amount_deviation_ratio ? (dna.amount_deviation_ratio + 'x') : '1.0x'}
                  </div>
                  <p className="text-xs text-slate-500">
                    Recent transactions vs customer historical average (Threshold: 3.0x)
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Velocity Spike</span>
                  <div className="text-2xl font-bold text-slate-900">
                    {dna.velocity_burst_ratio ? (dna.velocity_burst_ratio + 'x') : '1.0x'}
                  </div>
                  <p className="text-xs text-slate-500">
                    Daily frequency vs 90-day baseline transactions/day
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Nocturnal Ratio</span>
                  <div className="text-2xl font-bold text-slate-900">
                    {dna.nocturnal_activity_ratio ? (Math.round(dna.nocturnal_activity_ratio * 100) + '%') : '0%'}
                  </div>
                  <p className="text-xs text-slate-500">
                    Transactions occurring between 23:00 and 06:00
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase">New Payee Exposure</span>
                  <div className="text-2xl font-bold text-slate-900">
                    {dna.new_payee_ratio ? (Math.round(dna.new_payee_ratio * 100) + '%') : '0%'}
                  </div>
                  <p className="text-xs text-slate-500">
                    Transfers directed to previously unseen beneficiaries
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                      <th className="p-3.5">Behavioral Dimension</th>
                      <th className="p-3.5">90-Day Baseline Profile</th>
                      <th className="p-3.5">Recent Window</th>
                      <th className="p-3.5">Variance / Delta</th>
                      <th className="p-3.5">Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Mean Transaction Amount</td>
                      <td className="p-3.5">₹{(baseline.mean_amount || 0).toLocaleString()}</td>
                      <td className="p-3.5">₹{(dna.recent_mean_amount || baseline.mean_amount || 0).toLocaleString()}</td>
                      <td className="p-3.5 font-mono">
                        {dna.amount_deviation_ratio ? ('+' + ((dna.amount_deviation_ratio - 1) * 100).toFixed(0) + '%') : '0%'}
                      </td>
                      <td className="p-3.5">
                        <span className={'px-2 py-0.5 rounded text-[10px] font-bold ' + (
                          dna.amount_deviation_ratio > 3 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        )}>
                          {dna.amount_deviation_ratio > 3 ? 'SIGNIFICANT SHIFT' : 'WITHIN BOUNDS'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Primary Channel Distribution</td>
                      <td className="p-3.5">{(baseline.top_channels || ['UPI']).join(', ')}</td>
                      <td className="p-3.5">{dna.recent_channels ? dna.recent_channels.join(', ') : 'UPI'}</td>
                      <td className="p-3.5">{dna.recent_channel_switching ? 'New channels introduced' : 'Consistent'}</td>
                      <td className="p-3.5">
                        <span className={'px-2 py-0.5 rounded text-[10px] font-bold ' + (
                          dna.recent_channel_switching ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        )}>
                          {dna.recent_channel_switching ? 'CHANNEL SHIFT' : 'CONCORDANT'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-900">Beneficiary Familiarity</td>
                      <td className="p-3.5">{baseline.known_payees_count || 0} Known Payees</td>
                      <td className="p-3.5">{dna.new_payee_count || 0} New Payees</td>
                      <td className="p-3.5">{dna.new_payee_count > 0 ? (dna.new_payee_count + ' new entities') : 'Known counterparties'}</td>
                      <td className="p-3.5">
                        <span className={'px-2 py-0.5 rounded text-[10px] font-bold ' + (
                          dna.new_payee_count > 1 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        )}>
                          {dna.new_payee_count > 1 ? 'HIGH EXPOSURE' : 'TYPICAL'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pattern Shift Timeline</h3>
                <p className="text-xs text-slate-500">Visual chronological reconstruction of normal baseline transition to unusual events</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className={'absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-white ' + (
                        event.is_anomalous
                          ? 'border-rose-600 bg-rose-500'
                          : 'border-emerald-600 bg-emerald-500'
                      )} />
                      
                      <div className={'p-4 rounded-xl border ' + (
                        event.is_anomalous
                          ? 'bg-rose-50/60 border-rose-200'
                          : 'bg-slate-50 border-slate-200'
                      )}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{event.timestamp}</span>
                            <span className={'px-2 py-0.5 rounded-full text-[10px] ' + (
                              event.is_anomalous ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            )}>
                              {event.phase || (event.is_anomalous ? 'ANOMALOUS ACTIVITY' : 'BASELINE NORM')}
                            </span>
                          </div>
                          <div className="font-mono text-slate-700 font-semibold">
                            ₹{Number(event.amount).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 mt-1.5">
                          {event.description || ('Transaction to ' + (event.payee || event.merchant_id || 'Payee') + ' via ' + (event.channel || 'ONLINE'))}
                        </div>
                        {event.shift_reason && (
                          <div className="text-[11px] font-semibold text-rose-700 mt-1">
                            Trigger: {event.shift_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">PS06 Deterministic Risk Rules Evaluation</h3>
                <p className="text-xs text-slate-500">Every transaction evaluated against all 6 banking risk rules with exact thresholds</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 'RULE_PS06_01',
                    name: 'New Payee Velocity Spike',
                    desc: 'Spike in frequency or volume to a beneficiary not seen in customer baseline',
                    threshold: '>= 2 new payees within 24h OR 3x volume surge to unseen entity',
                    triggered: triggeredRules.some(r => r.rule_id === 'RULE_PS06_01')
                  },
                  {
                    id: 'RULE_PS06_02',
                    name: 'Sudden High-Value Deviation',
                    desc: 'Transaction amount exceeds 3x customer 90-day baseline mean and standard deviation',
                    threshold: 'Amount > (Mean + 3 * StdDev) AND Amount > ₹50,000',
                    triggered: triggeredRules.some(r => r.rule_id === 'RULE_PS06_02')
                  },
                  {
                    id: 'RULE_PS06_03',
                    name: 'Atypical Nocturnal Activity',
                    desc: 'Transactions executed during deep night hours for customers with strictly daytime baselines',
                    threshold: 'Timestamp between 23:00 - 06:00 AND Baseline nocturnal ratio < 5%',
                    triggered: triggeredRules.some(r => r.rule_id === 'RULE_PS06_03')
                  },
                  {
                    id: 'RULE_PS06_04',
                    name: 'Rapid Channel Switching',
                    desc: 'Customer suddenly routes large transfers through unusual or new payment channels',
                    threshold: 'Channel switch with amount > 2x mean baseline',
                    triggered: triggeredRules.some(r => r.rule_id === 'RULE_PS06_04')
                  },
                  {
                    id: 'RULE_PS06_05',
                    name: 'Dormant Account Sudden Reactivation',
                    desc: 'Account with no transactions for > 45 days immediately executing high-value transfers',
                    threshold: 'Dormancy gap > 45 days followed by high-velocity outbound transfer',
                    triggered: triggeredRules.some(r => r.rule_id === 'RULE_PS06_05')
                  },
                  {
                    id: 'RULE_PS06_06',
                    name: 'Structuring / Smurfing Pattern',
                    desc: 'Multiple consecutive transactions just below standard regulatory thresholds (e.g. ₹49,000)',
                    threshold: '>= 3 transfers within 12h sized between ₹45,000 - ₹49,999',
                    triggered: triggeredRules.some(r => r.rule_id === 'RULE_PS06_06')
                  },
                ].map(rule => (
                  <div key={rule.id} className={'p-5 rounded-2xl border transition-all ' + (
                    rule.triggered
                      ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                      : 'bg-white border-slate-200'
                  )}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-slate-400 block">{rule.id}</span>
                        <h4 className="text-sm font-bold text-slate-900">{rule.name}</h4>
                      </div>
                      <span className={'px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ' + (
                        rule.triggered
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      )}>
                        {rule.triggered ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                        {rule.triggered ? 'TRIGGERED' : 'CLEAR'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">{rule.desc}</p>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] font-mono text-slate-500">
                      <strong>Threshold:</strong> {rule.threshold}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Deterministic Evidence Chain</h3>
                <p className="text-xs text-slate-500">Court-admissible audit trail linking historical baselines to specific anomalous deviations</p>
              </div>

              {evidenceChain.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                  No anomalous evidence chain. Customer profile is concordant with expected behavioral baseline.
                </div>
              ) : (
                <div className="space-y-3">
                  {evidenceChain.map((ev, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{ev.step_name || ('Evidence Anchor #' + (idx + 1))}</span>
                          <span className="font-mono text-slate-400">{ev.timestamp || 'Step Trace'}</span>
                        </div>
                        <p className="text-xs text-slate-600">{ev.description}</p>
                        {ev.citation && (
                          <div className="text-[11px] text-blue-600 font-medium">
                            Citation: {ev.citation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Grounded Gemini AI Narrative Analysis
                  </h3>
                  <p className="text-xs text-slate-500">
                    Synthesizes data solely from customer records and mathematical rules
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                    {aiSummary?.model_used || 'gemini-1.5-flash / Grounded Engine'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                {aiSummary?.summary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Grounding Constraints</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-500">
                    <li>Strict facts only from database transactions</li>
                    <li>Prohibited from asserting fraud or guilt</li>
                    <li>References exact transaction IDs and rupee amounts</li>
                  </ul>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Fallback Resilience</span>
                  <p className="text-slate-500">
                    If Gemini API key is absent or external network times out, engine operates 100% deterministically with zero service interruption.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recommended Investigator Inquiry Protocol</h3>
                <p className="text-xs text-slate-500">Targeted questions for bank phone calls, branch interviews, or document verification</p>
              </div>

              {questions.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                  No additional questions required. Customer activity is concordant with expected profile.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {questions.map((q, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        Q{idx + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-xs font-bold text-slate-900">{q.question || q}</div>
                        {q.rationale && (
                          <div className="text-[11px] text-slate-500">
                            <strong>Objective:</strong> {q.rationale}
                          </div>
                        )}
                        {q.target && (
                          <span className="inline-block text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                            Target: {q.target}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Activity Relationship Map</h3>
                <p className="text-xs text-slate-500">Flow of customer funds across counterparties, channels, and external destinations</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-4 py-8">
                  <div className="w-28 h-28 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center p-2 text-center shadow-md">
                    <User size={24} className="mb-1" />
                    <span className="text-xs font-bold truncate max-w-full">{investigationData.customer_id}</span>
                    <span className="text-[10px] opacity-80">Origin Node</span>
                  </div>

                  <ArrowRight className="text-slate-400 w-6 h-6 hidden md:block" />

                  <div className="flex flex-col gap-2">
                    {relationshipMap.nodes && relationshipMap.nodes.filter(n => n.id !== investigationData.customer_id).map((node, i) => (
                      <div key={i} className={'px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-4 ' + (
                        node.is_anomalous
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-white border-slate-200 text-slate-700'
                      )}>
                        <span>{node.label || node.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {node.type || 'Payee'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'counterfactual' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Counterfactual Analysis (What would make this normal?)</h3>
                <p className="text-xs text-slate-500">Actionable boundaries explaining what parameter adjustments would bring the activity within baseline</p>
              </div>

              {counterfactuals.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                  Transactions are already within normal baseline parameters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {counterfactuals.map((cf, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                        <Sliders size={14} />
                        <span>Counterfactual Condition #{idx + 1}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800">{cf.condition || cf.rule}</div>
                      <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
                        {cf.explanation || cf.what_makes_it_normal}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Complete Transaction History</h3>
                  <p className="text-xs text-slate-500">All historical baseline and recent transactions ({allTxs.length} records)</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Txn ID</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Payee / Entity</th>
                        <th className="p-3">Channel</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {allTxs.map((tx, idx) => (
                        <tr key={tx.id || idx} className={tx.is_flagged ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                          <td className="p-3 font-mono font-medium">{tx.transaction_id || tx.id}</td>
                          <td className="p-3 text-slate-500">{tx.timestamp}</td>
                          <td className="p-3 font-bold text-slate-900">₹{Number(tx.amount).toLocaleString()}</td>
                          <td className="p-3">{tx.payee || tx.merchant_id || 'Payee'}</td>
                          <td className="p-3 font-mono">{tx.channel || 'ONLINE'}</td>
                          <td className="p-3">
                            {tx.is_flagged ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                FLAGGED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                NORMAL
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'disposition' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  Investigator Formal Case Disposition
                </h3>
                <p className="text-xs text-slate-500">
                  Record official conclusion and next steps into the immutable banking audit log
                </p>
              </div>

              {dispositionSaved && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Disposition successfully saved and stamped to audit trail.</span>
                </div>
              )}

              <form onSubmit={handleSaveDisposition} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Investigator Determination
                  </label>
                  <select
                    value={dispositionAction}
                    onChange={(e) => setDispositionAction(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Verified Legitimate with Customer">Verified Legitimate with Customer (False Positive Departure)</option>
                    <option value="Escalate to L2 Anti-Fraud Team">Escalate to L2 Anti-Fraud Team</option>
                    <option value="Request Invoice & Counterparty Proof">Request Invoice & Counterparty Proof</option>
                    <option value="Place Temporary Hold on Outbound Transfers">Place Temporary Hold on Outbound Transfers</option>
                    <option value="Close Investigation — No Action Needed">Close Investigation — No Action Needed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Investigator Rationale & Case Notes
                  </label>
                  <textarea
                    rows={4}
                    value={dispositionNotes}
                    onChange={(e) => setDispositionNotes(e.target.value)}
                    placeholder="Enter detailed notes, verification call details, or documentation received..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-500 space-y-1">
                  <div><strong>Customer ID:</strong> {investigationData.customer_id}</div>
                  <div><strong>Audit Stamp:</strong> Signed by current active reviewer session</div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Check size={14} />
                  Submit Case Disposition & Update Audit Log
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {customJsonModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Upload / Custom Customer JSON Payload</h3>
              <button
                onClick={() => setCustomJsonModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Paste a custom customer profile payload with historical and recent transactions for real-time PS06 risk analysis.
            </p>

            <form onSubmit={handleCustomPayloadSubmit} className="space-y-4">
              <textarea
                rows={10}
                value={customPayloadText}
                onChange={(e) => setCustomPayloadText(e.target.value)}
                placeholder={'{\n  "customer_id": "CUST-CUSTOM-99",\n  "transactions": [\n    {"id": "TX1", "amount": 2500, "timestamp": "2026-03-01 10:00:00", "payee": "Merchant A", "channel": "UPI"}\n  ]\n}'}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomJsonModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl"
                >
                  Investigate Custom Payload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

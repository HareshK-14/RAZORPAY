import { useState } from 'react';
import axios from 'axios';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Download,
  Dna,
  Network,
  TrendingDown,
  Clock,
  Layers,
  Sparkles,
  FileText,
  Activity,
  CheckCircle2,
  Info
} from 'lucide-react';
import BehavioralDNA from '../components/BehavioralDNA';
import RiskNetwork from '../components/RiskNetwork';
import WhatIfSimulator from '../components/WhatIfSimulator';
import CounterfactualCard from '../components/CounterfactualCard';
import EvidenceChain from '../components/EvidenceChain';
import RiskTimeline from '../components/RiskTimeline';

const PRESETS = [
  {
    name: 'TX-DEMO-001 (High-Risk Attack)',
    tag: 'HIGH RISK',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    data: {
      transaction_id: 'TX-DEMO-001',
      customer_id: 'CUST-7890',
      amount: 42500,
      avg_amount_last_30d: 3800,
      velocity_last_1h: 9,
      txn_count_last_24hr: 15,
      failed_attempts_last_24h: 3,
      hour: 2,
      country: 'RU',
      merchant_country: 'IN',
      country_mismatch: true,
      device_id: 'DEV-NEW-001',
      is_new_device: true,
      merchant_category: 'crypto_exchange',
      currency: 'INR'
    }
  },
  {
    name: 'TX-DEMO-002 (Normal Domestic)',
    tag: 'LOW RISK',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    data: {
      transaction_id: 'TX-DEMO-002',
      customer_id: 'CUST-1234',
      amount: 1200,
      avg_amount_last_30d: 1800,
      velocity_last_1h: 1,
      txn_count_last_24hr: 3,
      failed_attempts_last_24h: 0,
      hour: 14,
      country: 'IN',
      merchant_country: 'IN',
      country_mismatch: false,
      device_id: 'DEV-KNOWN-001',
      is_new_device: false,
      merchant_category: 'grocery',
      currency: 'INR'
    }
  },
  {
    name: 'Velocity Spike Burst',
    tag: 'ELEVATED',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    data: {
      transaction_id: 'TX-DEMO-003',
      customer_id: 'CUST-4109',
      amount: 18500,
      avg_amount_last_30d: 4200,
      velocity_last_1h: 7,
      txn_count_last_24hr: 12,
      failed_attempts_last_24h: 2,
      hour: 23,
      country: 'IN',
      merchant_country: 'IN',
      country_mismatch: false,
      device_id: 'DEV-BROWSER-CHROME',
      is_new_device: false,
      merchant_category: 'digital_goods',
      currency: 'INR'
    }
  },
  {
    name: 'Tor Cross-Border Novelty',
    tag: 'CRITICAL',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    data: {
      transaction_id: 'TX-DEMO-004',
      customer_id: 'CUST-9901',
      amount: 98000,
      avg_amount_last_30d: 6500,
      velocity_last_1h: 4,
      txn_count_last_24hr: 8,
      failed_attempts_last_24h: 4,
      hour: 3,
      country: 'NL',
      merchant_country: 'IN',
      country_mismatch: true,
      device_id: 'DEV-TOR-PROXY-7',
      is_new_device: true,
      merchant_category: 'luxury_jewels',
      currency: 'INR'
    }
  }
];

export default function Analyze() {
  const [formData, setFormData] = useState(PRESETS[0].data);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [viewMode, setViewMode] = useState('detailed'); // 'quick' | 'detailed'
  const [activeTab, setActiveTab] = useState('dna'); // 'dna' | 'network' | 'simulator' | 'counterfactual' | 'timeline' | 'evidence'

  const handleScore = async (payload = formData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/score', {
        ...payload,
        amount: Number(payload.amount),
        avg_amount_last_30d: Number(payload.avg_amount_last_30d || payload.historical_average || 0),
        historical_average: Number(payload.avg_amount_last_30d || payload.historical_average || 0),
        velocity_last_1h: Number(payload.velocity_last_1h || 1),
        txn_count_last_1hr: Number(payload.velocity_last_1h || 1),
        txn_count_last_24hr: Number(payload.txn_count_last_24hr || 1),
        failed_attempts_last_24h: Number(payload.failed_attempts_last_24h || 0),
        hour: Number(payload.hour || 12),
        hour_of_day: Number(payload.hour || 12),
        ip_country: payload.country,
        country: payload.country,
        is_first_time_device: payload.is_new_device,
        is_new_device: payload.is_new_device
      });
      setResult(res.data);
    } catch (err) {
      console.error('Failed to score transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setFormData(preset.data);
    handleScore(preset.data);
  };

  const handleExportDossier = () => {
    if (!result) return;
    const dossier = {
      title: 'TransactionGuard AI — Risk Investigation Dossier',
      generated_at: new Date().toISOString(),
      evaluation: result,
      input_telemetry: formData,
      regulatory_notice: 'Defense-Only advisory intelligence under Razorpay Track 2 specifications.'
    };
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier-${result.transaction_id || formData.transaction_id || 'eval'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate Data Quality Score
  const fields = [
    formData.transaction_id,
    formData.customer_id,
    formData.amount,
    formData.avg_amount_last_30d,
    formData.velocity_last_1h,
    formData.txn_count_last_24hr,
    formData.hour,
    formData.country,
    formData.merchant_country,
    formData.merchant_category,
    formData.device_id
  ];
  const filledFields = fields.filter(v => v !== undefined && v !== '' && v !== null).length;
  const dataQualityScore = Math.round((filledFields / fields.length) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider font-mono">
              INNOVATION CENTER
            </span>
            <span className="text-xs text-slate-400">• Track 2: AI Risk Manager</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            TRANSACTION RISK ANALYZER
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            &quot;Explain Every Risk. Trust Every Decision.&quot; — Real-time multi-signal inference with counterfactuals
          </p>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('quick')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Quick View
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'detailed' ? 'bg-white text-blue-700 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Detailed Intelligence
            </button>
          </div>

          {result && (
            <button
              onClick={handleExportDossier}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Export complete investigation dossier as JSON"
            >
              <Download className="w-3.5 h-3.5" /> Export Dossier
            </button>
          )}
        </div>
      </div>

      {/* Preset Scenarios with TX-DEMO-001 and TX-DEMO-002 Prominently */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Play className="w-3 h-3 text-blue-600 fill-blue-600" />
            Pre-Loaded Buildathon Test Cases:
          </span>
          <span className="text-[11px] text-slate-400">Click any card to instantly populate and run inference</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset)}
              className={`text-left p-3.5 rounded-xl bg-white border transition-all cursor-pointer hover:shadow-md ${
                formData.transaction_id === preset.data.transaction_id
                  ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 truncate">{preset.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${preset.badge}`}>
                  {preset.tag}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-xs text-slate-700 font-mono font-semibold">₹{preset.data.amount.toLocaleString('en-IN')}</p>
                <span className="text-[10px] font-mono text-slate-400">{preset.data.transaction_id}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                <span>{preset.data.country_mismatch ? '🌍 Geo Mismatch' : '🏠 Domestic'}</span>
                <span>•</span>
                <span>{preset.data.is_new_device ? '📱 New Device' : '💻 Known Device'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Telemetry Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Transaction Telemetry Payload (13 Signals)
              </h3>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium">Data Quality:</span>
                <span className={`text-[10px] font-bold font-mono ${
                  dataQualityScore >= 90 ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {dataQualityScore}%
                </span>
                {dataQualityScore < 80 && (
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-mono">
                    Fallback Active
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Transaction ID</label>
                  <input
                    type="text"
                    value={formData.transaction_id || ''}
                    onChange={e => setFormData({ ...formData, transaction_id: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Customer ID</label>
                  <input
                    type="text"
                    value={formData.customer_id || ''}
                    onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Historical 30d Avg (INR)</label>
                  <input
                    type="number"
                    value={formData.avg_amount_last_30d || ''}
                    onChange={e => setFormData({ ...formData, avg_amount_last_30d: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1 truncate">1h Velocity</label>
                  <input
                    type="number"
                    value={formData.velocity_last_1h}
                    onChange={e => setFormData({ ...formData, velocity_last_1h: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1 truncate">24h Velocity</label>
                  <input
                    type="number"
                    value={formData.txn_count_last_24hr || ''}
                    onChange={e => setFormData({ ...formData, txn_count_last_24hr: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1 truncate">Failed (24h)</label>
                  <input
                    type="number"
                    value={formData.failed_attempts_last_24h || 0}
                    onChange={e => setFormData({ ...formData, failed_attempts_last_24h: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Hour (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={formData.hour}
                    onChange={e => setFormData({ ...formData, hour: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">IP Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Merchant Ctry</label>
                  <input
                    type="text"
                    value={formData.merchant_country || 'IN'}
                    onChange={e => setFormData({ ...formData, merchant_country: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Device ID</label>
                  <input
                    type="text"
                    value={formData.device_id}
                    onChange={e => setFormData({ ...formData, device_id: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Merchant Category</label>
                  <input
                    type="text"
                    value={formData.merchant_category}
                    onChange={e => setFormData({ ...formData, merchant_category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>

              {/* Checkbox Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={formData.is_new_device}
                    onChange={e => setFormData({ ...formData, is_new_device: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 font-medium leading-tight">New Hardware Device</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={formData.country_mismatch}
                    onChange={e => setFormData({ ...formData, country_mismatch: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 font-medium leading-tight">Country Mismatch</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => handleScore()}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {loading ? (
                <span>Executing Multi-Signal Inference...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> Run Risk Evaluation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Evaluation Output Right */}
        <div className="lg:col-span-7 space-y-4">
          {!result ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Ready for Risk Evaluation</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Select one of the pre-configured scenarios or edit parameters on the left, then click &quot;Run Risk Evaluation&quot;.
              </p>
              <button
                onClick={() => handleScore()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
              >
                Score Preset Scenario Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary Score Banner */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                        result.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                        result.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {result.risk_level} RISK
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {result.transaction_id || 'EVAL-LIVE'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-4xl font-extrabold font-mono text-slate-900">
                        {result.risk_score}
                      </span>
                      <span className="text-sm font-medium text-slate-400">/ 100</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 max-w-md leading-relaxed">
                      {result.explanation || 'Composite weighted score across 5 biometric and telemetry signals.'}
                    </p>
                  </div>

                  {/* Recommendation & Confidence (Innovation 7) */}
                  <div className="sm:text-right p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Defense Advisory</span>
                    <span className="text-sm font-bold text-slate-900 font-mono block mt-0.5">
                      {result.review_recommendation || result.recommendation || 'ALLOW'}
                    </span>
                    <div className="flex items-center sm:justify-end gap-1.5 mt-2">
                      <span className="text-[11px] text-slate-500">Confidence:</span>
                      <span className="text-xs font-bold font-mono text-blue-600">
                        {Math.round((result.confidence !== undefined && result.confidence <= 1 ? result.confidence * 100 : result.confidence) || 94)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed View Tabs (Innovations 1-5, 8, 16) */}
              {viewMode === 'detailed' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                  {/* Tab Navigation */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
                    {[
                      { id: 'dna', label: 'Behavioral DNA', icon: Dna },
                      { id: 'signals', label: 'Signal Fusion', icon: Activity },
                      { id: 'network', label: 'Risk Network', icon: Network },
                      { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
                      { id: 'counterfactual', label: 'Counterfactuals', icon: TrendingDown },
                      { id: 'timeline', label: 'Customer Timeline', icon: Clock },
                      { id: 'evidence', label: 'Evidence Chain', icon: Layers }
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content */}
                  <div className="pt-2">
                    {activeTab === 'dna' && (
                      <BehavioralDNA
                        fingerprint={result.behavioral_fingerprint || {
                          current: { amount: formData.amount, velocity_1hr: formData.velocity_last_1h, device: formData.is_new_device ? 'New' : 'Known', country: formData.country, hour: formData.hour },
                          normal: { avg_amount: formData.avg_amount_last_30d || 5200, primary_device: 'DEV-KNOWN-001', usual_country: 'IN' },
                          deviations: { amount_ratio: ((formData.amount || 1) / (formData.avg_amount_last_30d || 5200)).toFixed(1), country_mismatch: formData.country_mismatch }
                        }}
                        breakdown={result.risk_breakdown || result.breakdown}
                      />
                    )}

                    {activeTab === 'signals' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Multi-Signal Fusion Matrix (5 Core Dimensions)
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">Deterministic Weighted Inference</span>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                                <th className="p-2.5">Signal Dimension</th>
                                <th className="p-2.5">Weight</th>
                                <th className="p-2.5">Observed Value</th>
                                <th className="p-2.5">Normal Baseline</th>
                                <th className="p-2.5">Contribution</th>
                                <th className="p-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono">
                              <tr>
                                <td className="p-2.5 font-semibold text-slate-800 font-sans">Transaction Velocity</td>
                                <td className="p-2.5 text-slate-500">25%</td>
                                <td className="p-2.5 text-slate-900">{formData.velocity_last_1h} tx / hr</td>
                                <td className="p-2.5 text-slate-500">≤ 3 tx / hr</td>
                                <td className="p-2.5 text-rose-600 font-bold">
                                  +{formData.velocity_last_1h > 5 ? 25 : formData.velocity_last_1h > 2 ? 15 : 0} pts
                                </td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                                    formData.velocity_last_1h > 3 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {formData.velocity_last_1h > 3 ? 'Anomalous Burst' : 'Normal'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-semibold text-slate-800 font-sans">Geolocation Mismatch</td>
                                <td className="p-2.5 text-slate-500">25%</td>
                                <td className="p-2.5 text-slate-900">{formData.country} vs {formData.merchant_country || 'IN'}</td>
                                <td className="p-2.5 text-slate-500">Domestic Origin</td>
                                <td className="p-2.5 text-rose-600 font-bold">
                                  +{formData.country_mismatch || formData.country !== 'IN' ? 25 : 0} pts
                                </td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                                    formData.country_mismatch || formData.country !== 'IN' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {formData.country_mismatch || formData.country !== 'IN' ? 'Cross-Border High' : 'Consistent'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-semibold text-slate-800 font-sans">Device Hardware Novelty</td>
                                <td className="p-2.5 text-slate-500">20%</td>
                                <td className="p-2.5 text-slate-900">{formData.is_new_device ? 'Unseen Hardware' : 'Trusted Binding'}</td>
                                <td className="p-2.5 text-slate-500">Enrolled Device</td>
                                <td className="p-2.5 text-rose-600 font-bold">
                                  +{formData.is_new_device ? 20 : 0} pts
                                </td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                                    formData.is_new_device ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {formData.is_new_device ? 'Novelty Alert' : 'Verified Device'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-semibold text-slate-800 font-sans">Time Anomaly (Circadian)</td>
                                <td className="p-2.5 text-slate-500">15%</td>
                                <td className="p-2.5 text-slate-900">{formData.hour}:00 hrs</td>
                                <td className="p-2.5 text-slate-500">06:00 - 23:00</td>
                                <td className="p-2.5 text-rose-600 font-bold">
                                  +{formData.hour >= 1 && formData.hour <= 5 ? 15 : 0} pts
                                </td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                                    formData.hour >= 1 && formData.hour <= 5 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {formData.hour >= 1 && formData.hour <= 5 ? 'Nighttime Anomaly' : 'Business Hours'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-semibold text-slate-800 font-sans">Amount vs History Ratio</td>
                                <td className="p-2.5 text-slate-500">15%</td>
                                <td className="p-2.5 text-slate-900">
                                  ₹{Number(formData.amount).toLocaleString('en-IN')} (
                                  {formData.avg_amount_last_30d ? `${(Number(formData.amount) / Number(formData.avg_amount_last_30d)).toFixed(1)}x` : '1.0x'})
                                </td>
                                <td className="p-2.5 text-slate-500">₹{Number(formData.avg_amount_last_30d || 3500).toLocaleString('en-IN')}</td>
                                <td className="p-2.5 text-rose-600 font-bold">
                                  +{(Number(formData.amount) / (Number(formData.avg_amount_last_30d) || 3500)) > 5 ? 15 : 5} pts
                                </td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                                    (Number(formData.amount) / (Number(formData.avg_amount_last_30d) || 3500)) > 4 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {(Number(formData.amount) / (Number(formData.avg_amount_last_30d) || 3500)) > 4 ? 'Extreme Outlier' : 'Within Bounds'}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activeTab === 'network' && (
                      <RiskNetwork transaction={formData} result={result} />
                    )}

                    {activeTab === 'simulator' && (
                      <WhatIfSimulator initialTx={formData} baselineScore={result.risk_score} />
                    )}

                    {activeTab === 'counterfactual' && (
                      <CounterfactualCard result={result} transaction={formData} />
                    )}

                    {activeTab === 'timeline' && (
                      <RiskTimeline customerId={formData.customer_id} currentScore={result.risk_score} />
                    )}

                    {activeTab === 'evidence' && (
                      <EvidenceChain result={result} transaction={formData} />
                    )}
                  </div>
                </div>
              )}

              {/* Quick View Summary */}
              {viewMode === 'quick' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <h4 className="text-sm font-semibold text-slate-900">Signal Breakdown Summary</h4>
                  <div className="space-y-2">
                    {(result.top_signals || result.reasons || []).map((sig, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{sig.signal || sig.rule}</p>
                          <p className="text-slate-500 mt-0.5">{sig.explanation || sig.detail}</p>
                        </div>
                        <span className="font-mono font-bold text-rose-600 px-2 py-0.5 bg-rose-50 rounded">
                          +{sig.contribution || sig.weight || 15} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

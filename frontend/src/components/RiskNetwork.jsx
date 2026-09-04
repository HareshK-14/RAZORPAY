import { useState } from 'react';
import { Network, Smartphone, Globe, CreditCard, Store, UserCheck, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export default function RiskNetwork({ transaction, result }) {
  const [selectedEntity, setSelectedEntity] = useState(null);

  if (!transaction) return null;

  const entities = [
    {
      id: 'customer',
      label: 'Customer ID',
      value: transaction.customer_id || 'CUST-DEMO',
      type: 'user',
      icon: UserCheck,
      status: 'evaluated',
      risk: result?.risk_level || 'LOW',
      details: 'Primary identity node. Evaluated against synthetic behavioral history of 1,500 transactions.'
    },
    {
      id: 'device',
      label: 'Device Fingerprint',
      value: transaction.device_id || 'DEV-MOB-0912',
      type: 'device',
      icon: Smartphone,
      status: transaction.is_new_device ? 'Novel / Unseen' : 'Recognized',
      risk: transaction.is_new_device ? 'MEDIUM' : 'LOW',
      details: transaction.is_new_device
        ? 'First observation of this hardware fingerprint for this account.'
        : 'Recognized device associated with 14 prior successful settlements.'
    },
    {
      id: 'geo',
      label: 'IP & Country',
      value: `${transaction.country || 'IN'} (${transaction.ip_address || '103.21.244.2'})`,
      type: 'geo',
      icon: Globe,
      status: transaction.country_mismatch ? 'Cross-Border Mismatch' : 'Domestic Origin',
      risk: transaction.country_mismatch ? 'HIGH' : 'LOW',
      details: transaction.country_mismatch
        ? 'IP location deviates from registered domestic card issuance jurisdiction.'
        : 'Origin matches registered billing jurisdiction.'
    },
    {
      id: 'merchant',
      label: 'Merchant Entity',
      value: transaction.merchant_id || 'MERCH-RAZOR-01',
      type: 'merchant',
      icon: Store,
      status: transaction.merchant_category || 'E-Commerce / Digital',
      risk: transaction.merchant_category === 'Crypto / Gaming' ? 'HIGH' : 'LOW',
      details: `Target payment processor destination categorized as ${transaction.merchant_category || 'Retail'}.`
    },
    {
      id: 'card',
      label: 'Payment Instrument',
      value: transaction.card_hash ? `•••• ${transaction.card_hash.slice(-4)}` : '•••• 8821',
      type: 'card',
      icon: CreditCard,
      status: 'Tokenized SHA-256',
      risk: transaction.failed_attempts_last_24h > 2 ? 'HIGH' : 'LOW',
      details: `Velocity: ${transaction.velocity_last_1h || 1} txns/hr, Failed attempts: ${transaction.failed_attempts_last_24h || 0}.`
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Entity Risk & Association Graph</h4>
            <p className="text-xs text-slate-500">Interactive topology connecting customer, device, instrument, and network telemetry</p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-mono">
          5 Connected Nodes
        </span>
      </div>

      {/* SVG Connected Topology Visualization */}
      <div className="relative bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 overflow-hidden">
        {/* SVG connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300" strokeWidth="1.5" strokeDasharray="4 4">
          {/* Central node to peripheral nodes */}
          <line x1="50%" y1="50%" x2="20%" y2="25%" className="animate-pulse" stroke="#94a3b8" />
          <line x1="50%" y1="50%" x2="80%" y2="25%" className="animate-pulse" stroke="#94a3b8" />
          <line x1="50%" y1="50%" x2="20%" y2="75%" className="animate-pulse" stroke="#94a3b8" />
          <line x1="50%" y1="50%" x2="80%" y2="75%" className="animate-pulse" stroke="#94a3b8" />
        </svg>

        <div className="relative z-10 grid grid-cols-3 gap-6 items-center min-h-[260px]">
          {/* Top Left: Device */}
          <div className="flex justify-start">
            <NodeButton entity={entities[1]} onSelect={setSelectedEntity} isSelected={selectedEntity?.id === 'device'} />
          </div>

          {/* Top Center: Empty spacer */}
          <div />

          {/* Top Right: Geo */}
          <div className="flex justify-end">
            <NodeButton entity={entities[2]} onSelect={setSelectedEntity} isSelected={selectedEntity?.id === 'geo'} />
          </div>

          {/* Middle Row Center: Primary Customer */}
          <div className="col-span-3 flex justify-center py-2">
            <div
              onClick={() => setSelectedEntity(entities[0])}
              className={`p-4 rounded-2xl bg-white border-2 shadow-md cursor-pointer transition-all hover:scale-105 flex items-center gap-3 ${
                selectedEntity?.id === 'customer'
                  ? 'border-blue-600 ring-4 ring-blue-100'
                  : 'border-slate-300 hover:border-blue-400'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Central Identity</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{entities[0].value}</span>
              </div>
            </div>
          </div>

          {/* Bottom Left: Payment Card */}
          <div className="flex justify-start">
            <NodeButton entity={entities[4]} onSelect={setSelectedEntity} isSelected={selectedEntity?.id === 'card'} />
          </div>

          {/* Bottom Center: Empty spacer */}
          <div />

          {/* Bottom Right: Merchant */}
          <div className="flex justify-end">
            <NodeButton entity={entities[3]} onSelect={setSelectedEntity} isSelected={selectedEntity?.id === 'merchant'} />
          </div>
        </div>
      </div>

      {/* Selected Entity Inspector Drawer / Callout */}
      {selectedEntity ? (
        <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl flex items-start justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg border border-blue-200 text-blue-600 shadow-xs">
              <selectedEntity.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">{selectedEntity.label}</span>
                <span className="text-xs font-mono text-slate-500 font-medium">({selectedEntity.value})</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  selectedEntity.risk === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                  selectedEntity.risk === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedEntity.risk} RISK
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{selectedEntity.details}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedEntity(null)}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-slate-400 italic">
          Tip: Click any entity node in the graph above to inspect underlying signal integrity and risk weight
        </p>
      )}
    </div>
  );
}

function NodeButton({ entity, onSelect, isSelected }) {
  const Icon = entity.icon;
  const isHigh = entity.risk === 'HIGH';
  const isMed = entity.risk === 'MEDIUM';

  return (
    <button
      onClick={() => onSelect(entity)}
      className={`p-3 rounded-xl bg-white border text-left shadow-xs transition-all hover:scale-105 cursor-pointer max-w-[190px] ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm'
          : isHigh
          ? 'border-rose-300 hover:border-rose-400'
          : isMed
          ? 'border-amber-300 hover:border-amber-400'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className={`p-1 rounded-md ${isHigh ? 'bg-rose-100 text-rose-600' : isMed ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
          isHigh ? 'bg-rose-50 text-rose-700' : isMed ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {entity.risk}
        </span>
      </div>
      <p className="text-[11px] font-semibold text-slate-800 truncate">{entity.label}</p>
      <p className="text-[10px] text-slate-500 font-mono truncate">{entity.value}</p>
    </button>
  );
}

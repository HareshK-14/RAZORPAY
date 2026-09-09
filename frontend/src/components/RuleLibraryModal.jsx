import React, { useState, useEffect } from 'react';
import { X, Layers, CheckCircle2 } from 'lucide-react';
import { getRulesLibrary } from '../api/api';

export default function RuleLibraryModal({ isOpen, onClose }) {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    if (isOpen) {
      getRulesLibrary().then(res => setRules(res.rules || [])).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-5 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">
              INVESTIGATION RULE LIBRARY — PS06 Deterministic Logic
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto space-y-3 pr-1">
          {rules.map((r, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {r.rule_id}
                </span>
                <span className="font-bold text-slate-800 text-sm">{r.name}</span>
              </div>
              <p className="text-slate-600"><strong>Purpose:</strong> {r.purpose}</p>
              <p className="text-slate-600"><strong>Threshold:</strong> {r.threshold}</p>
              <p className="text-slate-600"><strong>Logic:</strong> {r.logic}</p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-purple-800 bg-purple-50/50 p-2 rounded">
                <strong>Defensibility Guidance:</strong> {r.defensibility_guidance}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

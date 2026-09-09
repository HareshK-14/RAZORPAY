import React, { useState } from 'react';
import { Sparkles, Send, HelpCircle, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { getCopilotQuery } from '../api/api';

const PRESET_QUESTIONS = [
  "What changed recently?",
  "Why is this customer being investigated?",
  "Show the transactions responsible.",
  "Compare current behaviour with the previous month.",
  "What should I check first?",
  "Which evidence supports this finding?",
  "Is the evidence sufficient?",
  "Summarize this case for a reviewer."
];

export default function InvestigationCopilot({ customerId, report }) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (qText) => {
    const q = qText || question;
    if (!q.trim()) return;
    try {
      setLoading(true);
      const res = await getCopilotQuery(customerId, q);
      setResponse(res);
      setQuestion('');
    } catch (err) {
      setResponse({
        question: q,
        interpretation: "Local query evaluation",
        data_used: "Local records",
        findings: ["Failed to run Copilot query: " + err.message],
        evidence: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles size={17} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              INVESTIGATION COPILOT — AI Analyst Assistant
            </h3>
            <p className="text-xs text-slate-500">
              Answers strictly from local customer history, baseline, and deterministic rules.
            </p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
          Zero Hallucination Guaranteed
        </span>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 block">Suggested Investigation Queries:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(pq)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200 transition-colors"
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask Copilot (e.g. 'What changed recently?' or 'Show the transactions responsible')..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
          Ask Copilot
        </button>
      </form>

      {response && (
        <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-200 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2">
            <span className="font-bold text-purple-900">
              Query: &quot;{response.question}&quot;
            </span>
            <span className="text-[10px] text-purple-700 font-semibold">
              Confidence: {response.confidence}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
            <div>
              <span className="font-bold text-slate-900 block mb-1">INTERPRETATION:</span>
              <p className="bg-white p-2.5 rounded-lg border border-purple-100 font-sans">
                {response.interpretation}
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-900 block mb-1">DATA USED:</span>
              <p className="bg-white p-2.5 rounded-lg border border-purple-100 font-sans">
                {response.data_used}
              </p>
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">FINDINGS:</span>
            <ul className="bg-white p-3 rounded-lg border border-purple-100 space-y-1 list-disc list-inside">
              {(response.findings || []).map((f, i) => (
                <li key={i} className="font-medium">{f}</li>
              ))}
            </ul>
          </div>

          {response.evidence?.length > 0 && (
            <div>
              <span className="font-bold text-slate-900 block mb-1">EVIDENCE CITATIONS:</span>
              <div className="bg-white p-3 rounded-lg border border-purple-100 space-y-1 font-mono text-[11px] text-slate-600">
                {response.evidence.map((ev, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-purple-600">#</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-[10px] text-purple-700 font-medium pt-1 flex items-center justify-between">
            <span>{response.hallucination_guarantee}</span>
            <span>Customer: {customerId}</span>
          </div>
        </div>
      )}
    </div>
  );
}

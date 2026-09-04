import { useState, useMemo } from 'react';
import { Sliders, RefreshCw, ArrowRight, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function WhatIfSimulator({ initialTx, baselineScore }) {
  const [amount, setAmount] = useState(initialTx?.amount || 5000);
  const [velocity, setVelocity] = useState(initialTx?.velocity_last_1h || 1);
  const [hour, setHour] = useState(initialTx?.hour !== undefined && initialTx?.hour !== null ? initialTx.hour : 14);
  const [isNewDevice, setIsNewDevice] = useState(Boolean(initialTx?.is_new_device));
  const [countryMismatch, setCountryMismatch] = useState(Boolean(initialTx?.country_mismatch));

  // Compute simulated score in real-time
  const simulated = useMemo(() => {
    let score = 5; // base intercept

    // Amount scoring
    if (amount > 100000) score += 35;
    else if (amount > 50000) score += 25;
    else if (amount > 20000) score += 15;
    else if (amount > 5000) score += 8;

    // Velocity
    if (velocity >= 8) score += 30;
    else if (velocity >= 5) score += 20;
    else if (velocity >= 3) score += 10;

    // Off-hours
    if (hour >= 1 && hour <= 4) score += 18;
    else if (hour === 0 || hour === 5 || hour === 23) score += 10;

    // Device
    if (isNewDevice) score += 15;

    // Country mismatch
    if (countryMismatch) score += 25;

    score = Math.min(100, Math.max(0, score));

    let level = 'LOW';
    let recommendation = 'ALLOW';
    if (score >= 70) {
      level = 'HIGH';
      recommendation = 'MANUAL_REVIEW';
    } else if (score >= 40) {
      level = 'MEDIUM';
      recommendation = 'STEP_UP_2FA';
    }

    const delta = score - (baselineScore || 0);

    return { score, level, recommendation, delta };
  }, [amount, velocity, hour, isNewDevice, countryMismatch, baselineScore]);

  const resetToInitial = () => {
    setAmount(initialTx?.amount || 5000);
    setVelocity(initialTx?.velocity_last_1h || 1);
    setHour(initialTx?.hour !== undefined && initialTx?.hour !== null ? initialTx.hour : 14);
    setIsNewDevice(Boolean(initialTx?.is_new_device));
    setCountryMismatch(Boolean(initialTx?.country_mismatch));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">What-If Risk Simulator</h4>
            <p className="text-xs text-slate-500">Dynamically perturb transaction parameters to observe model sensitivity</p>
          </div>
        </div>

        <button
          onClick={resetToInitial}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-2 space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          {/* Amount Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">Transaction Amount</span>
              <span className="font-mono font-bold text-slate-900">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="500"
              max="150000"
              step="500"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span>₹500</span>
              <span>₹50,000</span>
              <span>₹1,50,000</span>
            </div>
          </div>

          {/* Velocity Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">Hourly Velocity</span>
              <span className="font-mono font-bold text-slate-900">{velocity} txn/hr</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={velocity}
              onChange={e => setVelocity(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span>1</span>
              <span>6</span>
              <span>12 txns</span>
            </div>
          </div>

          {/* Hour of Day Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">Execution Hour (24h)</span>
              <span className="font-mono font-bold text-slate-900">{String(hour).padStart(2, '0')}:00 hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              step="1"
              value={hour}
              onChange={e => setHour(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span>00:00 (Night)</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isNewDevice}
                onChange={e => setIsNewDevice(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-slate-700">Unrecognized Device</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={countryMismatch}
                onChange={e => setCountryMismatch(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-slate-700">Geo / IP Mismatch</span>
            </label>
          </div>
        </div>

        {/* Live Simulation Output Card */}
        <div className="bg-linear-to-b from-white to-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Simulated Output</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                simulated.level === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                simulated.level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {simulated.level} RISK
              </span>
            </div>

            <div className="text-center py-3 bg-white rounded-xl border border-slate-100 shadow-xs mb-3">
              <div className="text-4xl font-extrabold font-mono text-slate-900">
                {simulated.score}
                <span className="text-base font-normal text-slate-400">/100</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-xs text-slate-500">Delta vs Baseline:</span>
                <span className={`text-xs font-mono font-bold ${
                  simulated.delta > 0 ? 'text-rose-600' : simulated.delta < 0 ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  {simulated.delta > 0 ? `+${simulated.delta}` : simulated.delta} pts
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Recommended Action</span>
                <span className="font-semibold text-slate-800 font-mono">{simulated.recommendation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Policy Pathway</span>
                <span className="text-slate-700">
                  {simulated.score >= 70 ? 'Manual Risk Escalation' : simulated.score >= 40 ? 'Step-up OTP Challenge' : 'Frictionless Pass'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-3 pt-2 border-t border-slate-100">
            Real-time inference emulation under Track 2 Defense-Only rules
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  TrendingUp, 
  RefreshCw,
  Info,
  Clock
} from 'lucide-react';
import { api } from '../api';

export default function FinancialSafetyTab({ profile }) {
  const [safety, setSafety] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSafety = async () => {
    try {
      setLoading(true);
      const res = await api.getFinancialSafety();
      setSafety(res);
    } catch (err) {
      console.error('Error fetching financial safety status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafety();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in text-stone-800">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/30 text-emerald-200 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Student Financial Safety Center</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1.5">
              The 5-Gate Financial Safety Gate
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              SEBI guidelines and prudent wealth engineering require evaluating liquidity, debt, and emergency reserves before deploying hard-earned capital into volatile markets.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[240px]">
            <span className="text-[10px] text-emerald-200 font-bold uppercase block">Investing Clearance Status</span>
            <span className="text-base font-black text-amber-300">
              {safety?.clearance_badge || '🔒 Investment Clearance: Limited'}
            </span>
            <span className="text-[10px] text-stone-300 block mt-0.5">
              Runway: {safety?.runway_months || 0.33} Months | Gap: ₹{safety?.emergency_fund_gap_inr?.toLocaleString('en-IN') || '10,000'} remaining
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
          <span>Auditing financial safety parameters...</span>
        </div>
      ) : safety ? (
        <div className="space-y-6">
          {/* Actionable Remedy Banner */}
          <div className={`p-5 rounded-2xl border shadow-sm ${
            safety.readiness_for_equity_investing
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              {safety.readiness_for_equity_investing ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-black mb-1">
                  {safety.readiness_for_equity_investing ? 'Resilience Verified' : 'Safety Priority Advice'}
                </h4>
                <p className="text-xs leading-relaxed font-medium">
                  {safety.actionable_remedy}
                </p>
              </div>
            </div>
          </div>

          {/* Runway & Emergency Fund KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Current Emergency Buffer</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">
                ₹{safety.emergency_fund_current_inr.toLocaleString('en-IN')}
              </span>
              <div className="w-full bg-stone-100 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className={`h-full ${safety.emergency_fund_pct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, safety.emergency_fund_pct)}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-stone-500 mt-1.5 block">
                {safety.emergency_fund_pct}% of recommended target (₹{safety.emergency_fund_target_inr.toLocaleString('en-IN')})
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Essential Living Runway</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {safety.runway_months} Months
              </span>
              <span className="text-[10px] text-stone-500 mt-1 block">
                Target: 2.0 Months (₹{(safety.emergency_recommended_target_inr || 12000).toLocaleString('en-IN')})
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Monthly Cash Flow Surplus</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                ₹{safety.monthly_disposable_cash_flow_inr.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-stone-500 mt-1 block">
                Surplus cash available for SIPs and upskilling
              </span>
            </div>
          </div>

          {/* 5-Gate Checklist Matrix */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                Prudent Investing Pre-Flight Checklist
              </h3>
              <span className="text-xs text-stone-500 font-bold">5 Core Financial Gates</span>
            </div>

            <div className="space-y-3">
              {safety.safety_gates.map((gate, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    gate.passed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {gate.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900">{gate.gate_name}</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">Current: <strong>{gate.current_val}</strong></p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[11px] font-bold text-stone-700 bg-white px-3 py-1 rounded-lg border border-stone-200 inline-block">
                      {gate.recommendation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

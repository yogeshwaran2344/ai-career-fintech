import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Lock, 
  Wallet, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  BookOpen, 
  Award,
  Layers,
  HelpCircle,
  Clock,
  PieChart as PieIcon
} from 'lucide-react';
import { api } from '../api';

export default function FinancialHealthView({ profile, onNavigate }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getFinancialHealth();
      setHealthData(data);
    } catch (err) {
      console.error('Failed to fetch financial health:', err);
      setError(err.message || 'Unable to load financial health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 border-emerald-500 bg-emerald-50';
    if (score >= 60) return 'text-amber-600 border-amber-500 bg-amber-50';
    return 'text-rose-600 border-rose-500 bg-rose-50';
  };

  const getFactorBadge = (status) => {
    if (status === 'HEALTHY') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (status === 'MODERATE') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-stone-600">Evaluating central financial health & safety parameters...</p>
      </div>
    );
  }

  if (error || !healthData) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-rose-900">Failed to Load Financial Health</h3>
        <p className="text-xs text-rose-700">{error || 'Could not retrieve data'}</p>
        <button
          onClick={fetchHealthData}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
        >
          Retry Audit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-stone-800">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-stone-700 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/30 text-amber-200 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Central Financial Intelligence Hub</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-2">
              My Financial Health Command Center
            </h1>
            <p className="text-xs md:text-sm text-stone-300 mt-1.5 max-w-2xl leading-relaxed">
              One authoritative source of truth harmonizing student cash flows, emergency resilience runway, upskilling allocations, and investment readiness.
            </p>
          </div>

          {/* Central Composite Score Pill */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 min-w-[240px] text-center lg:text-right flex flex-col items-center lg:items-end">
            <span className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">
              Composite Financial Health
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl md:text-5xl font-black text-amber-400">
                {healthData.overall_health_score}
              </span>
              <span className="text-base text-stone-400 font-bold">/ 100</span>
            </div>
            <span className="mt-1 text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {healthData.health_status}
            </span>
          </div>
        </div>
      </div>

      {/* Investment Clearance Hard State Warning */}
      {healthData.clearance_state === 'BLOCKED' && (
        <div className="p-5 rounded-2xl border-2 border-rose-500/40 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-600 mt-0.5 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-rose-900 text-sm md:text-base">
                  {healthData.clearance_badge}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                  Runway: {healthData.runway_months} mo (₹{healthData.emergency_current?.toLocaleString('en-IN')} / ₹{healthData.emergency_target?.toLocaleString('en-IN')})
                </span>
              </div>
              <p className="text-xs text-rose-800/90 mt-1 font-medium leading-relaxed max-w-3xl">
                {healthData.clearance_reason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => onNavigate ? onNavigate('safety') : null}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-sm w-full md:w-auto text-center cursor-pointer"
            >
              5-Gate Safety Audit →
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Monthly Income */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Monthly Stipend/Income</span>
          <div className="text-xl md:text-2xl font-black text-stone-900">
            ₹{healthData.monthly_income?.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-stone-500 block">Active college cash inflow</span>
        </div>

        {/* 2. Total vs Essential Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Expenses</span>
          <div className="text-xl md:text-2xl font-black text-stone-900">
            ₹{healthData.total_expenses?.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-stone-500 block">
            Essential baseline: ₹{healthData.essential_monthly_expenses?.toLocaleString('en-IN')}/mo
          </span>
        </div>

        {/* 3. Monthly Surplus */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Monthly Surplus</span>
          <div className="text-xl md:text-2xl font-black text-emerald-600">
            +₹{healthData.monthly_surplus?.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-stone-500 block">36% healthy surplus ratio</span>
        </div>

        {/* 4. Emergency Runway */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Emergency Runway</span>
          <div className="text-xl md:text-2xl font-black text-amber-600">
            {healthData.runway_months} Months
          </div>
          <span className="text-[10px] text-stone-500 block">
            Target: 3.0 Months (₹{healthData.emergency_target?.toLocaleString('en-IN')})
          </span>
        </div>
      </div>

      {/* Capacity Allocation Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Emergency Fund Progress */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-stone-500 tracking-wider">Emergency Fund Gap</span>
            <span className="text-xs font-mono font-bold text-amber-700">{healthData.emergency_fund_pct}% funded</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900">₹{healthData.emergency_current?.toLocaleString('en-IN')}</span>
            <span className="text-xs text-stone-400 font-bold">Goal: ₹{healthData.emergency_target?.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full" 
              style={{ width: `${Math.min(100, healthData.emergency_fund_pct || 11.1)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Gap of <strong>₹{healthData.emergency_gap?.toLocaleString('en-IN')}</strong> needed to clear 3-month survival buffer before market risk exposure.
          </p>
        </div>

        {/* Upskilling Capacity */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">Upskilling Capacity</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              High ROI
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-900">
            ₹{healthData.upskilling_capacity?.toLocaleString('en-IN')}<span className="text-xs font-normal text-stone-500">/month</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Safe discretionary capital recommended for certifications, Cloud sandboxes, and interview prep that multiply future CTC.
          </p>
          <button 
            onClick={() => onNavigate ? onNavigate('career') : null}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>Explore High-ROI Certifications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Investment Capacity */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-stone-500 tracking-wider">Equity Market Capacity</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Locked
            </span>
          </div>
          <div className="text-2xl font-black text-stone-400">
            ₹{healthData.investment_capacity?.toLocaleString('en-IN')}<span className="text-xs font-normal text-stone-400">/month</span>
          </div>
          <p className="text-[11px] text-rose-700/90 leading-relaxed font-medium">
            Temporarily paused by Safety Gate. Unlocks automatically once emergency reserve reaches ₹18,000.
          </p>
          <span className="text-[10px] text-stone-400 block italic">
            Zero capital at market liquidation risk.
          </span>
        </div>
      </div>

      {/* 6 Core Factor Health Diagnostics */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-black text-stone-900 tracking-tight">
              Explainable Factor Score Breakdown
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Transparent, weighted evaluation of the 6 fundamental pillars of student financial solvency.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-xl">
            Weights: Reserve 30% | Surplus 25% | Debt 20% | Rest 25%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthData.factors?.map((f, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-800">{f.factor}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getFactorBadge(f.status)}`}>
                  {f.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-stone-900">{f.score}</span>
                <span className="text-[11px] text-stone-400 font-bold">/ 100</span>
              </div>

              <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    f.score >= 80 ? 'bg-emerald-500' : f.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${f.score}%` }}
                ></div>
              </div>

              <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Prioritized Action Plan */}
      <div className="bg-gradient-to-r from-amber-500/10 via-stone-50 to-amber-500/5 p-6 md:p-8 rounded-3xl border border-amber-500/30 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-stone-900">
              AI Priority Roadmap (Next 90 Days)
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Follow this sequence to graduate from Vulnerable to Invest-Ready with high campus placement leverage.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {healthData.ai_priorities?.map((priorityText, idx) => (
            <div key={idx} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-black shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs md:text-sm font-bold text-stone-800">
                  {priorityText}
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-600 shrink-0">
                Priority #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance / Educational Note */}
      <div className="p-4 bg-stone-100 rounded-2xl text-[11px] text-stone-500 border border-stone-200/80 leading-relaxed">
        <strong>⚖️ Educational Financial Prudence Notice:</strong> The Financial Health Score is an objective analytical index computed against SEBI liquidity principles. It does not constitute registered portfolio advisory. Build liquid emergency security before taking market equity risk.
      </div>
    </div>
  );
}

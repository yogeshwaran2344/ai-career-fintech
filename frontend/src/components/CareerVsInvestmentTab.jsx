import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api';

export default function CareerVsInvestmentTab({ profile }) {
  const [capital, setCapital] = useState(10000);
  const [certName, setCertName] = useState('AWS Solutions Architect & GenAI Specialization');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchComparison = async (amt = capital, course = certName) => {
    try {
      setLoading(true);
      const res = await api.compareCareerVsInvestment(amt, course, amt);
      setData(res);
    } catch (err) {
      console.error('Error fetching career vs investment decision:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(capital, certName);
  }, []);

  const handleRunComparison = (e) => {
    e.preventDefault();
    fetchComparison(capital, certName);
  };

  return (
    <div className="space-y-6 animate-fade-in text-stone-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-stone-700 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/30 text-indigo-200 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Flagship Capital Trade-Off Engine</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1.5">
              Career ROI vs Stock Market ROI
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Should you spend ₹10,000 on an industry certification or invest it into a stock market SIP? AI analyzes your campus readiness to calculate which delivers higher asymmetric compounding.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[220px]">
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Your Target Role</span>
            <span className="text-base font-black text-white">{profile?.career_goal || 'AI Engineer'}</span>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
              Current Readiness: {profile?.academic?.cgpa ? `${Math.round(profile.academic.cgpa * 8)}%` : '68%'}
            </span>
          </div>
        </div>
      </div>

      {/* Input Simulator Form */}
      <form onSubmit={handleRunComparison} className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-end gap-3">
        <div className="flex-1">
          <label className="text-xs font-bold text-stone-700 block mb-1">Capital Under Consideration (₹)</label>
          <div className="flex gap-2">
            {[5000, 10000, 15000, 25000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => { setCapital(amt); fetchComparison(amt, certName); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  capital === amt ? 'bg-indigo-600 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <label className="text-xs font-bold text-stone-700 block mb-1">Option A: Certification / Project Goal</label>
          <input
            type="text"
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            className="w-full text-xs font-bold p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-indigo-500"
            placeholder="e.g. AWS Solutions Architect / Deep Learning"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-black transition cursor-pointer shadow-md self-end md:self-auto"
        >
          {loading ? 'Evaluating...' : 'Simulate ROI →'}
        </button>
      </form>

      {/* Side-by-Side Comparison Grid */}
      {data && (
        <div className="space-y-6">
          {/* AI Strategic Verdict Banner */}
          <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${
            data.ai_verdict === 'CERTIFICATION_RECOMMENDED'
              ? 'bg-gradient-to-r from-indigo-50 via-white to-blue-50 border-indigo-200'
              : 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-emerald-200'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 ${
                  data.ai_verdict === 'CERTIFICATION_RECOMMENDED'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  <span>AI Copilot Recommendation: {data.ai_verdict.replace(/_/g, ' ')}</span>
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-2">
                  {data.strategic_rationale}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">AI Confidence Score</span>
                <span className="text-3xl font-black text-indigo-700">{data.confidence_score}%</span>
              </div>
            </div>

            {/* Attribution Factors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-200">
              {data.attribution_factors.map((f, idx) => (
                <div key={idx} className="p-3 bg-white/70 rounded-xl border border-stone-200 text-xs">
                  <span className="font-black text-stone-800 block text-[11px]">{f.factor}</span>
                  <span className="text-stone-500 text-[10px] mt-0.5 block">{f.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dual Cards: Option A vs Option B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OPTION A: CAREER UPSKILLING */}
            <div className="bg-white rounded-3xl border-2 border-indigo-500/40 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Option A</span>
                    <h4 className="text-base font-black text-stone-900">{data.career_option.option_title}</h4>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {data.career_option.verdict_badge}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Cost</span>
                  <span className="text-base font-black text-stone-900">₹{data.career_option.cost_inr.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Readiness Lift</span>
                  <span className="text-base font-black text-emerald-600">+{data.career_option.career_readiness_lift_pct}%</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Est. Annual CTC Lift</span>
                  <span className="text-base font-black text-stone-900">+₹{data.career_option.estimated_annual_salary_impact_inr.toLocaleString('en-IN')}/yr</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Capital Payback</span>
                  <span className="text-base font-black text-indigo-600">{data.career_option.payback_period_months} Months</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-600 leading-relaxed">
                <strong>Why this works:</strong> An extra ₹1.5L to ₹2.5L on your campus package generates ₹12,000 - ₹20,000 higher cashflow every single month once you graduate, vastly out-earning the capital return on ₹10,000.
              </div>
              <span className="text-[10px] text-stone-400 block italic">{data.career_option.disclaimer}</span>
            </div>

            {/* OPTION B: STOCK MARKET SIP */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Option B</span>
                    <h4 className="text-base font-black text-stone-900">{data.investment_option.option_title}</h4>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                  Market Compounding
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Principal Deployed</span>
                  <span className="text-base font-black text-stone-900">₹{data.investment_option.principal_amount_inr.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Estimated 3Y CAGR</span>
                  <span className="text-base font-black text-emerald-600">~{data.investment_option.expected_3y_cagr_estimate_pct}% p.a.</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Projected 3Y Corpus</span>
                  <span className="text-base font-black text-stone-900">₹{data.investment_option.projected_corpus_3y_inr.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Liquidity & Risk</span>
                  <span className="text-base font-black text-stone-800">{data.investment_option.liquidity_rating}</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-600 leading-relaxed">
                <strong>Market reality:</strong> In 3 years, ₹10,000 at a high 13.5% CAGR yields approximately +₹4,600 in capital gain. Excellent for financial discipline, but a lower immediate income multiplier than landing a high-tier campus tier-1 tech job.
              </div>
              <span className="text-[10px] text-stone-400 block italic">{data.investment_option.disclaimer}</span>
            </div>
          </div>

          {/* Mandatory Regulatory & Educational Footnote */}
          <div className="p-4 bg-stone-100 rounded-2xl text-[11px] text-stone-500 leading-relaxed border border-stone-200/80">
            <strong>⚖️ SEBI Educational Disclosure:</strong> {data.sebi_scenario_disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}

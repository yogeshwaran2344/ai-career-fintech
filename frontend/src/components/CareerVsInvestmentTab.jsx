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
  AlertTriangle,
  BarChart3,
  Layers,
  HelpCircle
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
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-indigo-950 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-stone-700 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/30 text-indigo-200 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Flagship Capital Trade-Off Engine</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1.5">
              Career ROI vs Stock Market Compounding
            </h1>
            <p className="text-xs md:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Quantitative tradeoff simulator: Should you invest ₹10,000 into practical tech credentials or into equity index funds? Evaluates the human capital asymmetry where small package lifts dwarf small portfolio gains.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/15 min-w-[240px]">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Your Target Role</span>
            <span className="text-lg font-black text-white">{profile?.career_goal || 'AI Engineer'}</span>
            <span className="text-[11px] text-emerald-400 font-bold block mt-1">
              Current Readiness: {profile?.academic?.cgpa ? `${Math.round(profile.academic.cgpa * 8)}%` : '68%'}
            </span>
          </div>
        </div>
      </div>

      {/* Input Simulator Form */}
      <form onSubmit={handleRunComparison} className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-end gap-3">
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-stone-700 block mb-1">Capital Under Consideration (₹)</label>
          <div className="flex flex-wrap gap-2">
            {[5000, 10000, 15000, 25000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => { setCapital(amt); fetchComparison(amt, certName); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  capital === amt ? 'bg-indigo-600 text-white shadow-xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-stone-700 block mb-1">Option A: Certification / Project Goal</label>
          <input
            type="text"
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            className="w-full text-xs font-bold p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-indigo-500"
            placeholder="e.g. AWS Solutions Architect & GenAI"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-black transition cursor-pointer shadow-md w-full md:w-auto"
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
              : data.ai_verdict === 'EMERGENCY_RESERVE_FIRST'
              ? 'bg-gradient-to-r from-rose-50 via-white to-amber-50 border-rose-200'
              : 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-emerald-200'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 ${
                  data.ai_verdict === 'CERTIFICATION_RECOMMENDED'
                    ? 'bg-indigo-600 text-white'
                    : data.ai_verdict === 'EMERGENCY_RESERVE_FIRST'
                    ? 'bg-rose-600 text-white'
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
              {data.attribution_factors?.map((f, idx) => (
                <div key={idx} className="p-3 bg-white/80 rounded-xl border border-stone-200 text-xs">
                  <span className="font-black text-stone-800 block text-[11px]">{f.factor}</span>
                  <span className="text-stone-500 text-[10px] mt-0.5 block">{f.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Probabilistic CTC Uplift Interval */}
          {data.probabilistic_salary && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Probabilistic Campus Salary Uplift</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Estimated annual compensation increase upon clearing technical credential & portfolio proof-of-work.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  {data.probabilistic_salary.confidence_pct}% Empirical Confidence
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Conservative Outcome</span>
                  <div className="text-xl font-black text-stone-900">
                    +₹{data.probabilistic_salary.conservative_annual_inr?.toLocaleString('en-IN')}<span className="text-xs font-normal text-stone-500">/yr</span>
                  </div>
                  <p className="text-[10px] text-stone-500">Service or mid-tier firm entry-level bonus/hike.</p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase block">Expected Base Uplift</span>
                  <div className="text-2xl font-black text-indigo-900">
                    +₹{data.probabilistic_salary.expected_annual_inr?.toLocaleString('en-IN')}<span className="text-xs font-normal text-stone-500">/yr</span>
                  </div>
                  <p className="text-[10px] text-indigo-700/80">Product-centric tech startup differential offer.</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Optimistic Uplift</span>
                  <div className="text-xl font-black text-emerald-800">
                    +₹{data.probabilistic_salary.optimistic_annual_inr?.toLocaleString('en-IN')}<span className="text-xs font-normal text-stone-500">/yr</span>
                  </div>
                  <p className="text-[10px] text-emerald-700">Tier-1 campus product offer / high-leverage AI role.</p>
                </div>
              </div>
            </div>
          )}

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

              <div className="p-3.5 bg-indigo-50/50 rounded-xl text-xs text-indigo-950 leading-relaxed font-medium">
                <strong>Why this dominates:</strong> An extra ₹1.2L to ₹1.8L on starting compensation provides an ongoing monthly cash flow boost of ₹10,000–₹15,000 every single month from Year 1 onwards.
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

              <div className="p-3.5 bg-stone-50 rounded-xl text-xs text-stone-600 leading-relaxed space-y-2">
                <p>
                  <strong>Compounding reality:</strong> In 3 years, ₹10,000 at 12% CAGR yields approximately +₹4,050 total nominal return. Disciplined, but lacks the multiplier effect of early-career earning power.
                </p>
                <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-500">
                  Formula: FV = P × (1 + r)ⁿ | Not guaranteed; subject to market volatility.
                </div>
              </div>
              <span className="text-[10px] text-stone-400 block italic">{data.investment_option.disclaimer}</span>
            </div>
          </div>

          {/* 5-Year Trajectory Table: Scenario A vs B vs C Do Nothing */}
          {data.five_year_trajectory && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                    5-Year Trajectory Comparison
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Scenario A (Upskilling Boost) vs Scenario B (₹10,000 Compounding) vs Scenario C (Do Nothing Opportunity Cost)
                  </p>
                </div>
                <span className="text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-xl">
                  5-Year Horizon
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 text-[10px] font-black uppercase border-b border-stone-200">
                    <tr>
                      <th className="p-3">Timeline</th>
                      <th className="p-3 text-indigo-700">Scenario A: Upskilling CTC</th>
                      <th className="p-3 text-emerald-700">Scenario B: ₹10k SIP Corpus</th>
                      <th className="p-3 text-stone-500">Scenario C: Baseline CTC (Do Nothing)</th>
                      <th className="p-3 text-right">Net Annual Advantage (A - C)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {data.five_year_trajectory.map((row) => (
                      <tr key={row.year} className="hover:bg-stone-50/50 transition">
                        <td className="p-3 font-bold text-stone-900">Year {row.year}</td>
                        <td className="p-3 font-black text-indigo-700">
                          ₹{row.scenario_a_career_income?.toLocaleString('en-IN')}/yr
                        </td>
                        <td className="p-3 font-bold text-emerald-700">
                          ₹{row.scenario_b_sip_corpus?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-stone-500">
                          ₹{row.scenario_c_do_nothing_income?.toLocaleString('en-IN')}/yr
                        </td>
                        <td className="p-3 text-right font-black text-emerald-600">
                          +₹{(row.scenario_a_career_income - row.scenario_c_do_nothing_income)?.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Best / Expected / Worst Case Scenarios Matrices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certification Scenarios */}
            {data.certification_scenarios && (
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-indigo-800 uppercase tracking-wider">
                  Career Upskilling Scenario Matrix
                </h4>
                <div className="space-y-2.5">
                  {data.certification_scenarios.map((cs, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex justify-between items-start gap-2">
                      <div>
                        <span className="font-bold text-stone-900 block">{cs.scenario_name}: {cs.outcome_label}</span>
                        <span className="text-[10px] text-stone-500">{cs.description}</span>
                      </div>
                      <span className="font-mono font-black text-indigo-600 text-xs shrink-0">
                        {cs.salary_boost_inr > 0 ? `+₹${cs.salary_boost_inr.toLocaleString('en-IN')}` : '₹0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Scenarios */}
            {data.market_scenarios && (
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                  Market Compounding Sensitivity Matrix
                </h4>
                <div className="space-y-2.5">
                  {data.market_scenarios.map((ms, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex justify-between items-start gap-2">
                      <div>
                        <span className="font-bold text-stone-900 block">{ms.scenario_name}</span>
                        <span className="text-[10px] text-stone-500">{ms.description}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-emerald-700 text-xs block">
                          3Y: ₹{ms.three_year_val_inr?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] text-stone-400">5Y: ₹{ms.five_year_val_inr?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

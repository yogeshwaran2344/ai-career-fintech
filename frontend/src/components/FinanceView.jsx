import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  PiggyBank, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Sparkles, 
  Calculator, 
  BookOpen, 
  ExternalLink,
  ShieldCheck,
  Star,
  DollarSign
} from 'lucide-react';
import { api } from '../api';
import ShouldIBuyModal from './ShouldIBuyModal';

export default function FinanceView({ profile, budgetAnalysis }) {
  const [certName, setCertName] = useState('AWS Certified Solutions Architect');
  const [certCost, setCertCost] = useState(10000);
  const [examTargetMonths, setExamTargetMonths] = useState(4);
  const [affordabilityResult, setAffordabilityResult] = useState(null);
  const [isShouldIBuyOpen, setIsShouldIBuyOpen] = useState(false);

  // Courses state
  const [courses, setCourses] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('Deep Learning');

  useEffect(() => {
    fetchAffordability();
    fetchCourses();
  }, [certName, certCost, examTargetMonths, selectedTopic, profile]);

  const fetchAffordability = async () => {
    try {
      const data = await api.getCertificationAffordability(certName, certCost, examTargetMonths);
      setAffordabilityResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await api.getCourses(selectedTopic);
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fin = profile?.financial || {
    monthly_income: 15000,
    food: 4000,
    travel: 2000,
    entertainment: 1500,
    other: 2500,
    available_for_learning: 2000,
    savings: 3000,
    emergency_buffer: 2000
  };

  const totalExpenses = fin.food + fin.travel + fin.entertainment + fin.other;
  const remaining = Math.max(0, fin.monthly_income - totalExpenses);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white advisor-card p-6 border-l-4 border-l-amber-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Financial Engine Active
              </span>
              <span className="text-xs text-stone-500">Student Budget & Affordability Co-Pilot</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-1">
              Monthly Budget: <span className="text-amber-600">₹{fin.monthly_income.toLocaleString()}</span>
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Balancing essential college living expenses with a structured upskilling fund and safety buffer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShouldIBuyOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-black shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all"
            >
              <DollarSign className="w-4 h-4" />
              <span>"Should I Buy This?" Evaluator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Budget Breakdown + AI Recommendations) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Monthly Expenses Breakdown */}
        <div className="advisor-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-stone-700" />
              <h3 className="text-sm font-bold text-stone-900">Current Monthly Cash Flow</h3>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              Total Spent: ₹{totalExpenses.toLocaleString()}
            </span>
          </div>

          {/* Progress bar of spending */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-stone-600">
              <span>Expenses Burn Rate</span>
              <span className="font-bold text-stone-900">{Math.round((totalExpenses / fin.monthly_income) * 100)}%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden flex">
              <div style={{ width: `${(fin.food / fin.monthly_income) * 100}%` }} className="bg-orange-400" title="Food" />
              <div style={{ width: `${(fin.travel / fin.monthly_income) * 100}%` }} className="bg-blue-400" title="Travel" />
              <div style={{ width: `${(fin.entertainment / fin.monthly_income) * 100}%` }} className="bg-purple-400" title="Entertainment" />
              <div style={{ width: `${(fin.other / fin.monthly_income) * 100}%` }} className="bg-stone-400" title="Other" />
            </div>
          </div>

          {/* Itemized List */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">🍲 Food & Mess</span>
                <span className="font-bold text-stone-900">₹{fin.food.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">🚌 Travel & Commute</span>
                <span className="font-bold text-stone-900">₹{fin.travel.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">🎬 Entertainment</span>
                <span className="font-bold text-stone-900">₹{fin.entertainment.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-stone-100/50 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">📦 Other / Misc</span>
                <span className="font-bold text-stone-900">₹{fin.other.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-900">Remaining Disposable Surplus:</span>
            <span className="font-extrabold text-emerald-700 text-sm">₹{remaining.toLocaleString()}</span>
          </div>
        </div>

        {/* Right: AI-Recommended Financial Allocation */}
        <div className="advisor-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-stone-900">AI-Optimized Student Allocation</h3>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Co-Optimized
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-stone-900">Essential Living Costs</span>
                <p className="text-[11px] text-stone-500">Food (₹{fin.food.toLocaleString()}) + Travel (₹{fin.travel.toLocaleString()})</p>
              </div>
              <span className="font-extrabold text-stone-800 text-sm">
                ₹{(budgetAnalysis?.breakdown?.essential_total || (fin.food + fin.travel)).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-orange-950">Target Learning & Upskilling Budget</span>
                <p className="text-[11px] text-orange-700">Certifications, Courses & Cloud compute credits</p>
              </div>
              <span className="font-extrabold text-orange-600 text-sm">
                ₹{(budgetAnalysis?.ai_recommended_allocation?.learning_budget || fin.available_for_learning).toLocaleString()} / mo
              </span>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-blue-950">Liquid Savings & Wealth Creation</span>
                <p className="text-[11px] text-blue-700">Recommended systematic savings capacity</p>
              </div>
              <span className="font-extrabold text-blue-700 text-sm">
                ₹{(budgetAnalysis?.ai_recommended_allocation?.savings || fin.savings).toLocaleString()} / mo
              </span>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-purple-950">Emergency Cash Runway Target</span>
                <p className="text-[11px] text-purple-700">Min. 1-month essential threshold</p>
              </div>
              <span className="font-extrabold text-purple-700 text-sm">
                ₹{(budgetAnalysis?.min_recommended_emergency_buffer || (fin.food + fin.travel)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: CERTIFICATION AFFORDABILITY & SINKING FUND CALCULATOR */}
      <div className="advisor-card p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-orange-600" />
              <h2 className="text-base font-bold text-stone-900">
                Certification Affordability & Sinking Fund Engine
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Simulate exam costs against your ₹{fin.available_for_learning.toLocaleString()}/month learning budget.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 bg-stone-50/80 p-4 rounded-xl border border-stone-200/80">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Select Certification</label>
              <select
                value={certName}
                onChange={(e) => {
                  setCertName(e.target.value);
                  if (e.target.value.includes('AWS')) setCertCost(10000);
                  else if (e.target.value.includes('TensorFlow')) setCertCost(8000);
                  else if (e.target.value.includes('GCP')) setCertCost(12000);
                  else setCertCost(7000);
                }}
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg font-medium text-stone-900"
              >
                <option value="AWS Certified Solutions Architect">AWS Certified Solutions Architect (₹10,000)</option>
                <option value="TensorFlow Developer Certificate">TensorFlow Developer Certificate (₹8,000)</option>
                <option value="GCP Associate Cloud Engineer">GCP Associate Cloud Engineer (₹12,000)</option>
                <option value="Docker Certified Associate">Docker Certified Associate (₹15,000)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Exam Cost (₹ INR)</span>
                <span className="text-orange-600">₹{certCost.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={certCost}
                onChange={(e) => setCertCost(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Target Exam Timeline</span>
                <span className="text-stone-900">{examTargetMonths} Months</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={examTargetMonths}
                onChange={(e) => setExamTargetMonths(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {affordabilityResult && (
              <div className="h-full bg-gradient-to-br from-amber-50/40 via-white to-orange-50/40 p-5 rounded-2xl border border-orange-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      AI Sinking Fund Verdict
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      affordabilityResult.affordability_verdict === 'AFFORDABLE_IMMEDIATELY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : affordabilityResult.affordability_verdict === 'AFFORDABLE_WITH_PLANNING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {affordabilityResult.affordability_verdict.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 my-3 text-center">
                    <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                      <span className="text-[10px] text-stone-500 block">Exam Cost</span>
                      <span className="text-sm font-black text-stone-900">₹{affordabilityResult.cost_inr.toLocaleString()}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                      <span className="text-[10px] text-stone-500 block">Monthly Budget</span>
                      <span className="text-sm font-black text-stone-900">₹{affordabilityResult.learning_budget_monthly.toLocaleString()}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                      <span className="text-[10px] text-stone-500 block">Time to Accumulate</span>
                      <span className="text-sm font-black text-orange-600">{affordabilityResult.months_to_save} Months</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed bg-white/90 p-3 rounded-xl border border-stone-200">
                    💡 {affordabilityResult.ai_recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION: DYNAMIC COURSE ROI ANALYZER */}
      <div className="advisor-card p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-600" />
              <h2 className="text-base font-bold text-stone-900">
                Personalized Course ROI & Skill Gain Engine
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Calculated via: (Career Relevance × Skill Gap Importance × Skill Gain) ÷ Cost Factor
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600">Focus Skill:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="text-xs p-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
            >
              <option value="Deep Learning">Deep Learning (Highest Gap)</option>
              <option value="FastAPI">FastAPI & Backend APIs</option>
              <option value="Docker">Docker & DevOps</option>
              <option value="DSA">Data Structures & Algorithms</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {courses.map((c, idx) => (
            <div 
              key={idx}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                c.is_recommended 
                  ? 'bg-gradient-to-br from-amber-50/50 via-white to-orange-50/50 border-orange-300 shadow-md ring-2 ring-orange-400/30' 
                  : 'bg-white border-stone-200/80 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {c.platform}
                  </span>
                  {c.is_recommended && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-orange-500 text-white">
                      ⭐ Top ROI Pick
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-stone-900">{c.title}</h3>
                <div className="flex items-center gap-3 my-2 text-xs">
                  <span className="font-black text-stone-900">₹{c.cost_inr.toLocaleString()}</span>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-600 font-semibold">{c.duration_weeks} Weeks</span>
                </div>

                {/* Dynamic ROI Metric Badges */}
                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 my-2 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-stone-500 uppercase font-bold block">Course ROI</span>
                    <span className="font-black text-orange-600">{c.roi_score || 16.0} Score</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-500 uppercase font-bold block">Skill Gain</span>
                    <span className="font-black text-emerald-600">+{c.skill_gain_score || 5.0}/10 Level</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 leading-relaxed mt-2">
                  {c.verdict}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] text-stone-400">{c.difficulty}</span>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1"
                >
                  <span>Explore Course</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Should I Buy This Modal */}
      <ShouldIBuyModal
        isOpen={isShouldIBuyOpen}
        onClose={() => setIsShouldIBuyOpen(false)}
        profile={profile}
      />
    </div>
  );
}

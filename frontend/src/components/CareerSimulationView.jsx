import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  Clock, 
  Wallet, 
  ShieldAlert, 
  Star, 
  Zap, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { api } from '../api';
import confetti from 'canvas-confetti';

export default function CareerSimulationView({ profile }) {
  // Scenario Inputs
  const [studyHours, setStudyHours] = useState(profile?.preferences?.study_hours_per_day || 3.0);
  const [budget, setBudget] = useState(profile?.financial?.available_for_learning || 2000);
  const [targetRole, setTargetRole] = useState(profile?.career_goal || 'AI Engineer');
  const [courseCost, setCourseCost] = useState(5000);
  const [courseName, setCourseName] = useState('DeepLearning.AI Specialization');
  const [includeCourse, setIncludeCourse] = useState(false);

  // Skill boosts
  const [dsaBoost, setDsaBoost] = useState(0);
  const [mlBoost, setMlBoost] = useState(0);
  const [pythonBoost, setPythonBoost] = useState(0);

  // Results
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Multi-Scenario comparison store
  const [savedScenarios, setSavedScenarios] = useState([
    {
      id: 'sc-1',
      name: 'Scenario A: Current Baseline (2 hrs/day, ₹2k/mo)',
      studyHours: 2.0,
      budget: 2000,
      p6: 68,
      months: 7,
      stress: 'LOW',
      stars: 4
    },
    {
      id: 'sc-2',
      name: 'Scenario B: Intensive Sprint (3.5 hrs/day, ₹3k/mo)',
      studyHours: 3.5,
      budget: 3000,
      p6: 86,
      months: 4,
      stress: 'LOW',
      stars: 5
    }
  ]);

  useEffect(() => {
    runSimulation();
  }, [studyHours, budget, targetRole, includeCourse, courseCost, dsaBoost, mlBoost, pythonBoost]);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const payload = {
        study_hours_per_day: Number(studyHours),
        monthly_budget: Number(budget),
        target_role: targetRole,
        skill_boosts: {
          'dsa': Number(dsaBoost),
          'ml': Number(mlBoost),
          'python': Number(pythonBoost)
        },
        invest_course_cost: includeCourse ? Number(courseCost) : null,
        invest_course_name: includeCourse ? courseName : null
      };

      const data = await api.simulateWhatIf(payload);
      setSimulationResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSaveCurrentScenario = () => {
    if (!simulationResult) return;
    const newSc = {
      id: `sc-${Date.now()}`,
      name: `Custom: ${studyHours}h/day • ₹${budget}/mo ${includeCourse ? `+ ₹${courseCost} course` : ''}`,
      studyHours: Number(studyHours),
      budget: Number(budget),
      p6: simulationResult.projected_6m_pct,
      months: simulationResult.estimated_months_to_ready,
      stress: simulationResult.financial_stress,
      stars: simulationResult.recommendation_stars
    };
    setSavedScenarios(prev => [...prev.slice(-2), newSc]);
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-orange-950 to-stone-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-orange-500/20 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-500/30 text-orange-200 border border-orange-400/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ⭐ Killer Feature #2
              </span>
              <span className="text-xs text-stone-300">Decision Sandbox Engine</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1.5 flex items-center gap-2">
              Career Simulation / "What If?" Mode
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-xl leading-relaxed">
              Test decisions before taking them. Simulate study hours, course investments, and skill leaps to predict placement probability and timeline reduction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveCurrentScenario}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Save for Comparison</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Large Columns (Variables on Left, Dynamic Prediction on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 5 COLS: Interactive Variables */}
        <div className="lg:col-span-5 space-y-4">
          <div className="advisor-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Simulation Variables ("What If...")
                </h3>
              </div>
              <button
                onClick={() => {
                  setStudyHours(3.0);
                  setBudget(2000);
                  setIncludeCourse(false);
                  setDsaBoost(0);
                  setMlBoost(0);
                }}
                className="text-[10px] text-stone-400 hover:text-stone-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Study Time Variable */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-1">
                <span>WHAT IF I STUDY:</span>
                <span className="text-orange-600 font-extrabold text-sm">{studyHours} Hours / Day</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.5"
                value={studyHours}
                onChange={(e) => setStudyHours(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5 font-medium">
                <span>1h (Part-time)</span>
                <span>3h (Target Sprint)</span>
                <span>6h (Intensive Bootcamp)</span>
              </div>
            </div>

            {/* Budget Variable */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-1">
                <span>MONTHLY LEARNING BUDGET:</span>
                <span className="text-stone-900 font-extrabold text-sm">₹{budget.toLocaleString()} / mo</span>
              </div>
              <input
                type="range"
                min="500"
                max="8000"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5 font-medium">
                <span>₹500 (Free focus)</span>
                <span>₹2,000 (Standard)</span>
                <span>₹8,000 (Aggressive)</span>
              </div>
            </div>

            {/* Target Role Selector */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Target Placement Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
              >
                <option value="AI Engineer">AI Engineer</option>
                <option value="ML Engineer">ML Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
              </select>
            </div>

            {/* Skill Boost Sandbox */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Simulate Skill Leaps:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between text-[11px] text-stone-600 font-bold mb-0.5">
                    <span>DSA (+{dsaBoost})</span>
                    <span>{dsaBoost > 0 ? '🚀 Boosted' : '0'}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={dsaBoost}
                    onChange={(e) => setDsaBoost(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-600 font-bold mb-0.5">
                    <span>ML & DL (+{mlBoost})</span>
                    <span>{mlBoost > 0 ? '🚀 Boosted' : '0'}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={mlBoost}
                    onChange={(e) => setMlBoost(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* "WHAT IF I SPEND ₹5,000 ON A COURSE?" Variable */}
            <div className="pt-3 border-t border-stone-100 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCourse}
                  onChange={(e) => setIncludeCourse(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 accent-orange-500 cursor-pointer"
                />
                <span className="text-xs font-black text-orange-950">
                  WHAT IF I SPEND ₹5,000 ON A PAID COURSE?
                </span>
              </label>

              {includeCourse && (
                <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-0.5">Course Name</label>
                    <input
                      type="text"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-stone-700 mb-0.5">
                      <span>Course Price</span>
                      <span className="text-orange-700 font-black">₹{courseCost.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="999"
                      max="15000"
                      step="500"
                      value={courseCost}
                      onChange={(e) => setCourseCost(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT 7 COLS: Simulation AI Output & Trajectory */}
        <div className="lg:col-span-7 space-y-4">
          {simulationResult && (
            <div className="advisor-card p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                    AI Simulation Projection
                  </span>
                  <h3 className="text-base font-black text-stone-900 mt-1">
                    {targetRole} Readiness Trajectory
                  </h3>
                </div>

                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(simulationResult.recommendation_stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
              </div>

              {/* 4-Stage Trajectory Bar Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-400 block uppercase">Today</span>
                  <div className="text-lg font-black text-stone-900 mt-1">{simulationResult.current_readiness_pct}%</div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-stone-500 h-full rounded-full" style={{ width: `${simulationResult.current_readiness_pct}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-400 block uppercase">1 Month</span>
                  <div className="text-lg font-black text-stone-900 mt-1">{simulationResult.projected_1m_pct}%</div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${simulationResult.projected_1m_pct}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200">
                  <span className="text-[10px] font-bold text-orange-700 block uppercase">3 Months</span>
                  <div className="text-lg font-black text-orange-600 mt-1">{simulationResult.projected_3m_pct}%</div>
                  <div className="w-full bg-orange-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${simulationResult.projected_3m_pct}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 block uppercase">6 Months</span>
                  <div className="text-lg font-black text-emerald-700 mt-1">{simulationResult.projected_6m_pct}%</div>
                  <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${simulationResult.projected_6m_pct}%` }} />
                  </div>
                </div>
              </div>

              {/* Impact Metrics Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="text-[10px] text-stone-500 block">Readiness Gain</span>
                  <span className="text-base font-black text-emerald-700">+{simulationResult.readiness_gain_pct}% Gain</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="text-[10px] text-stone-500 block">Est. Time to Job Ready</span>
                  <span className="text-base font-black text-stone-900">~{simulationResult.estimated_months_to_ready} Months</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="text-[10px] text-stone-500 block">Financial Stress</span>
                  <span className={`text-base font-black ${
                    simulationResult.financial_stress === 'LOW' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {simulationResult.financial_stress}
                  </span>
                </div>
              </div>

              {/* Course Investment Analysis (if enabled) */}
              {simulationResult.course_investment_analysis && (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-amber-700" />
                      Course Investment Analysis (₹{simulationResult.course_investment_analysis.cost_inr})
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white text-amber-900 border">
                      Stress: {simulationResult.course_investment_analysis.financial_stress}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/80 p-2 rounded-lg">
                      <span className="text-[10px] text-stone-500 block">Expected Skill Gain:</span>
                      <strong className="text-emerald-700 font-black">{simulationResult.course_investment_analysis.expected_skill_improvement}</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg">
                      <span className="text-[10px] text-stone-500 block">Readiness Gain:</span>
                      <strong className="text-orange-600 font-black">{simulationResult.course_investment_analysis.estimated_readiness_gain}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-stone-800 font-medium pt-1">
                    {simulationResult.course_investment_analysis.recommendation}
                  </p>
                </div>
              )}

              {/* AI Strategic Verdict */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  AI Simulator Counsel:
                </span>
                <p className="text-xs text-stone-700 leading-relaxed font-sans">
                  {simulationResult.strategic_verdict}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* SECTION: SCENARIO COMPARATOR (SCENARIO A vs B vs C) */}
      <div className="advisor-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600" />
            <h2 className="text-base font-bold text-stone-900">Compare Saved Scenarios (A vs B vs C)</h2>
          </div>
          <span className="text-xs text-stone-500">Side-by-side Decision Impact</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savedScenarios.map((sc, idx) => (
            <div key={sc.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                  {['Scenario A', 'Scenario B', 'Scenario C'][idx] || 'Custom'}
                </span>
                <div className="flex text-amber-500">
                  {[...Array(sc.stars || 4)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>

              <h4 className="text-xs font-bold text-stone-900">{sc.name}</h4>

              <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                <div className="flex justify-between">
                  <span>6-Month Projected Readiness:</span>
                  <strong className="text-orange-600 font-black">{sc.p6}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Est. Time to Job Ready:</span>
                  <strong className="text-stone-900">{sc.months} Months</strong>
                </div>
                <div className="flex justify-between">
                  <span>Financial Stress:</span>
                  <span className="font-bold text-stone-800">{sc.stress}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

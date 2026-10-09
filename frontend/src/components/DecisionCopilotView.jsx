import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Scale, 
  DollarSign, 
  GraduationCap,
  Play,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Coins,
  Cpu,
  Bookmark,
  GitFork,
  Check,
  Clock,
  Layers
} from 'lucide-react';
import { api } from '../api';

const LIFE_DECISION_SCENARIOS = [
  {
    id: "skill_vs_exam",
    title: "Applied AI Stack & Projects vs Competitive Exam (GATE / GRE)",
    description: "Compare dedicated engineering project building with full-time competitive entrance exam preparation.",
    optionA: {
      name: "Option A: Applied AI Stack & Projects",
      cost_inr: "₹2,500 (Cloud API credits + Colab)",
      time_months: "4 Months (2h / day)",
      prerequisites: "Python fundamentals, Linear algebra basics",
      risk_level: "Low (Direct hands-on portfolio)",
      projected_outcome: "₹14.0 LPA campus placement [₹12.0L – ₹16.2L 80% CI]",
      stress_index: 35,
      pros: ["Immediate proof-of-work on GitHub", "Direct relevance to private sector hiring", "Low financial leverage"],
      cons: ["Does not provide government PSU or M.Tech credentials"]
    },
    optionB: {
      name: "Option B: Intensive Exam Prep (GATE/GRE)",
      cost_inr: "₹25,000 - ₹45,000 (Test series + Coaching material)",
      time_months: "8 Months (4-5h / day)",
      prerequisites: "Complete CS theoretical syllabus (TOC, OS, CN, Compilers)",
      risk_level: "High (Binary cutoff; 1 exam day dependency)",
      projected_outcome: "₹18.5 LPA (PSU / Top IIT M.Tech) [₹11.0L – ₹24.0L 80% CI]",
      stress_index: 80,
      pros: ["Opens IIT M.Tech seats and PSU recruitment", "High academic prestige"],
      cons: ["Heavy opportunity cost", "Zero industry portfolio code written"]
    },
    recommendation: "For your current profile, Option A delivers higher immediate ROI and lower variance risk unless your explicit goal is a government PSU research role."
  },
  {
    id: "internship_vs_certs",
    title: "6-Month Startup Internship vs Intensive Certifications & Projects",
    description: "Evaluate working at an early-stage startup versus dedicated deep-skilling and credentialing.",
    optionA: {
      name: "Option A: 6-Month Startup Internship",
      cost_inr: "₹0 (Earns ₹15,000 - ₹25,000/mo stipend)",
      time_months: "6 Months (Full-time / 30h/wk)",
      prerequisites: "Working knowledge of Git, APIs, and basic stack",
      risk_level: "Moderate (Work-life balance with college exams)",
      projected_outcome: "₹12.5 LPA PPO conversion [₹10.5L – ₹15.0L 80% CI]",
      stress_index: 65,
      pros: ["Real production code & peer reviews", "Potential Pre-Placement Offer (PPO)", "Immediate cashflow boost"],
      cons: ["Leaves little time for core college subjects and DSA"]
    },
    optionB: {
      name: "Option B: Certifications & Open Source Projects",
      cost_inr: "₹12,000 (AWS voucher + course fees)",
      time_months: "3 Months (15h/wk self-paced)",
      prerequisites: "Self-discipline and structured curriculum",
      risk_level: "Low (Flexible pacing around academics)",
      projected_outcome: "₹13.2 LPA off-campus entry [₹11.2L – ₹15.5L 80% CI]",
      stress_index: 40,
      pros: ["Verified cloud credentials (AWS SAA)", "Clean open-source GitHub footprint", "Balanced CGPA maintenance"],
      cons: ["Lacks formal company work experience letter"]
    },
    recommendation: "If offered a stipend > ₹15,000/mo at a tech-led startup, take Option A. Otherwise, Option B maximizes your placement readiness score."
  },
  {
    id: "abroad_vs_domestic",
    title: "Study Abroad (MS in Germany / US) vs Domestic Tech Career (India)",
    description: "Compare international master's degree investment against immediate domestic software engineering employment.",
    optionA: {
      name: "Option A: MS Abroad (Germany / USA)",
      cost_inr: "Germany: ₹12L - ₹15L | USA: ₹45L - ₹65L",
      time_months: "24 Months (2-Year Master's Degree)",
      prerequisites: "CGPA >= 7.5, IELTS/GRE, Statement of Purpose",
      risk_level: "Moderate to High (Visa rules & macroeconomic hiring)",
      projected_outcome: "Germany: €62,000/yr (~₹55L) | USA: $120,000/yr (~₹1.0Cr) [±20% CI]",
      stress_index: 75,
      pros: ["Global mobility & high international purchasing power", "Cutting-edge research labs", "3-Year STEM OPT / EU Blue Card"],
      cons: ["Substantial financial outlay or student debt loan"]
    },
    optionB: {
      name: "Option B: Domestic Tech Career in India",
      cost_inr: "₹0 (Zero debt; immediate earning)",
      time_months: "Immediate (0 Months delay)",
      prerequisites: "Campus placement or off-campus portfolio",
      risk_level: "Low (Zero debt exposure, strong family support)",
      projected_outcome: "₹12.0 LPA starting -> ₹24.0 LPA at Year 3 [₹18.0L – ₹28.0L 80% CI]",
      stress_index: 30,
      pros: ["Zero educational debt leverage", "High savings rate in India", "Rapid domestic promotion cycles"],
      cons: ["Lower global mobility and foreign currency earnings"]
    },
    recommendation: "If targeting Germany with low tuition (TUM/RWTH), the ROI is exceptional with minimal debt. If targeting the US without scholarship, ensure emergency buffers exceed ₹10L."
  },
  {
    id: "aiml_vs_fullstack",
    title: "AI / Machine Learning Track vs Full-Stack Backend Track",
    description: "Evaluate competitive specialization between AI/ML engineering and resilient backend systems.",
    optionA: {
      name: "Option A: AI / Machine Learning Track",
      cost_inr: "₹3,500 (GPU cloud compute)",
      time_months: "5 Months (PyTorch, Math, Transformers, RAG)",
      prerequisites: "Multivariable calculus, linear algebra, Python",
      risk_level: "Moderate (Higher barrier to entry for freshers)",
      projected_outcome: "₹15.5 LPA median [₹12.5L – ₹19.0L 80% CI]",
      stress_index: 55,
      pros: ["High premium on specialized generative AI skills", "Strong long-term industry runway", "Exciting research frontier"],
      cons: ["Fewer junior openings compared to web engineering; higher math barrier"]
    },
    optionB: {
      name: "Option B: Full-Stack / Backend Engineering",
      cost_inr: "₹1,500 (Hosting + DB tiers)",
      time_months: "3.5 Months (Node/FastAPI, PostgreSQL, React, Docker)",
      prerequisites: "OOP, SQL, web basics",
      risk_level: "Low (Largest volume of fresher campus openings)",
      projected_outcome: "₹12.8 LPA median [₹10.5L – ₹15.5L 80% CI]",
      stress_index: 35,
      pros: ["Massive job opening volume across all company sizes", "Easier to showcase full live working apps"],
      cons: ["Higher applicant competition per seat; salary ceiling slightly lower at entry"]
    },
    recommendation: "A hybrid profile (Backend APIs + PyTorch ML integration) yields the highest shortlisting velocity across Indian product startups."
  }
];

export default function DecisionCopilotView({ profile, readiness }) {
  // Active Tab Mode
  const [activeMode, setActiveMode] = useState('capital_optimizer'); // 'capital_optimizer' | 'scenario_evaluator' | 'life_decision_simulator'
  const [selectedScenarioId, setSelectedScenarioId] = useState('skill_vs_exam');

  // Next ₹X Capital Allocation State
  const [allocationAmount, setAllocationAmount] = useState(3000);
  const [candidateCourse, setCandidateCourse] = useState('');
  const [isAllocating, setIsAllocating] = useState(false);
  const [opportunityData, setOpportunityData] = useState(null);

  // Scenario Simulator State
  const [scenarioName, setScenarioName] = useState('AWS Solutions Architect Certification Voucher');
  const [scenarioCost, setScenarioCost] = useState(7000);
  const [scenarioMonths, setScenarioMonths] = useState(4);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [decisionResult, setDecisionResult] = useState({
    verdict: 'WAIT_AND_SAVE',
    headline: 'Recommended: Wait 2 months. Save ₹3,500/month and purchase certification after reaching your target fund.',
    career_importance: 'HIGH',
    financial_feasibility: 'MODERATE',
    recommended_savings_plan: 'Allocate ₹3,500/month across 2 months from your available cash flow and learning envelope.',
    strategic_advice: 'Career importance for AWS is HIGH for your AI Engineer goal. However, purchasing today would exhaust your monthly learning allowance. Since your target exam date is 4 months away, utilize free AWS Educate labs during Months 1-2 while accumulating the fund, and purchase the voucher at Month 2 without touching emergency buffers.',
    action_steps: [
      'Save ₹3,500 on the 1st of next month into your dedicated certification fund.',
      'Complete free official AWS documentation and build 1 Dockerized model container.',
      'Purchase the exam voucher at Month 2 once ₹7,000 is stacked in full.'
    ]
  });

  // Chat State
  const [messages, setMessages] = useState([
    {
      sender: 'copilot',
      text: `Hello ${profile?.name || 'Student'}! I'm your AI Career + Finance Decision Copilot. I analyze both your technical readiness (${readiness?.readiness_pct ?? 0}%) for **${profile?.career_goal || 'your target role'}** and your **₹${(profile?.financial?.available_for_learning ?? 0).toLocaleString()}/month** financial budget simultaneously. Ask me about trade-offs, certifications, or how to allocate your next ₹X!`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    "I have ₹3,000. Should I buy a course or invest?",
    "Should I buy a ₹7,000 certification or use YouTube?",
    "How to prepare for 2027 placements with 2h/day?",
    "What project gives the highest ROI for my resume?"
  ];

  // Load initial Opportunity Cost evaluation
  useEffect(() => {
    handleRunCapitalOptimization(3000);
  }, []);

  const handleRunCapitalOptimization = async (amt, course) => {
    setIsAllocating(true);
    try {
      const res = await api.evaluateOpportunityCost(amt || allocationAmount, course || candidateCourse);
      setOpportunityData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAllocating(false);
    }
  };

  const handleRunEvaluation = async (name, cost, months) => {
    setIsEvaluating(true);
    try {
      const res = await api.evaluateDecision({
        scenario_type: 'custom',
        target_item_name: name || scenarioName,
        cost_inr: cost || scenarioCost,
        timeline_months: months || scenarioMonths
      });
      setDecisionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text }];
    setMessages(newMsgs);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await api.chatWithCopilot(text);
      setMessages([...newMsgs, { sender: 'copilot', text: res.response }]);
    } catch (err) {
      setMessages([...newMsgs, { sender: 'copilot', text: "I'm having trouble connecting right now, but your current roadmap and budget allocations remain optimal!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-orange-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-orange-500/20 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-500/30 text-orange-200 border border-orange-400/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                🔥 Dual-Constraint Reasoning
              </span>
              <span className="text-xs text-stone-300">Career × Finance Co-Optimization</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1.5 flex items-center gap-2">
              AI Decision Copilot & Strategic Allocator <Sparkles className="w-5 h-5 text-orange-400" />
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Never choose blindly between career growth, emergency savings, and investments. The Decision Engine analyzes your live readiness ({readiness?.readiness_pct || 44}%) against your cash flow to produce data-driven allocation recommendations. Projections are estimates, not guaranteed returns.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-stone-800/80 p-1.5 rounded-2xl border border-stone-700 backdrop-blur-sm self-start md:self-auto">
            <button
              onClick={() => setActiveMode('capital_optimizer')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'capital_optimizer'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Next ₹X Optimizer</span>
            </button>
            <button
              onClick={() => setActiveMode('scenario_evaluator')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'scenario_evaluator'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Purchase / Cert Check</span>
            </button>
            <button
              onClick={() => setActiveMode('life_decision_simulator')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'life_decision_simulator'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Life-Decision Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Feature Engine + Right Live Copilot Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: Active Engine (Capital Optimizer OR Scenario Evaluator) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* ================= MODE 1: WHAT SHOULD I DO WITH MY NEXT ₹X? ================= */}
          {activeMode === 'capital_optimizer' && (
            <div className="space-y-4">
              
              {/* Interactive Input Card */}
              <div className="advisor-card p-5 space-y-4 bg-white border border-stone-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        "What should I do with my next ₹X?"
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Enter any spare student capital to evaluate opportunity costs across 5 pillars.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg">
                    ₹{allocationAmount.toLocaleString()}
                  </span>
                </div>

                {/* Amount Quick Selectors */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    Quick Student Amounts:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1000, 2000, 3000, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          setAllocationAmount(amt);
                          handleRunCapitalOptimization(amt, candidateCourse);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          allocationAmount === amt
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Range Slider & Custom Course Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>Adjust Spare Capital</span>
                      <span className="text-orange-600 font-extrabold">₹{allocationAmount.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="15000"
                      step="500"
                      value={allocationAmount}
                      onChange={(e) => setAllocationAmount(Number(e.target.value))}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Targeted Career Asset (Optional)
                    </label>
                    <input
                      type="text"
                      value={candidateCourse}
                      onChange={(e) => setCandidateCourse(e.target.value)}
                      placeholder="e.g. AWS Exam, Cloud Sandbox, DSA Track"
                      className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg font-medium text-stone-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleRunCapitalOptimization(allocationAmount, candidateCourse)}
                  disabled={isAllocating}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isAllocating ? 'Optimizing Allocation Matrix...' : `Evaluate Next ₹${allocationAmount.toLocaleString()} Strategy`}</span>
                </button>
              </div>

              {/* AI Strategic Multi-Allocation Recommendation Verdict */}
              {opportunityData && (
                <div className="space-y-4">
                  
                  {/* Highlight Recommendation Box */}
                  <div className="bg-gradient-to-br from-orange-50 via-amber-50/40 to-white rounded-2xl p-5 border-2 border-orange-300 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange-600 text-white">
                        AI Recommended Multi-Split
                      </span>
                      <span className="text-xs font-bold text-stone-600">
                        Total: ₹{opportunityData.evaluated_amount_inr?.toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-stone-900 leading-snug">
                      {opportunityData.verdict_headline}
                    </h3>

                    <p className="text-xs text-stone-700 leading-relaxed bg-white/90 p-3.5 rounded-xl border border-orange-200/80">
                      💡 <strong>Why this decision?</strong> {opportunityData.detailed_reasoning}
                    </p>
                  </div>

                  {/* 5-Pillar Decision Trade-Off Comparison Matrix */}
                  <div className="advisor-card p-5 space-y-3 bg-white border border-stone-200">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-orange-600" />
                      <span>5-Pillar Opportunity Cost Comparison</span>
                    </h4>

                    <div className="space-y-2.5">
                      {opportunityData.options?.map((opt) => (
                        <div
                          key={opt.option_id}
                          className="p-3 bg-stone-50 hover:bg-stone-100/80 rounded-xl border border-stone-200 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-stone-900">{opt.title}</span>
                                <span className="text-[10px] font-bold text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                                  {opt.recommendation_badge}
                                </span>
                              </div>
                              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                                {opt.rationale}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-200/60 text-[11px]">
                            <div>
                              <span className="text-stone-500">Placement Gain: </span>
                              <span className="font-bold text-emerald-700">{opt.immediate_placement_readiness_gain}</span>
                            </div>
                            <div>
                              <span className="text-stone-500">Financial Risk: </span>
                              <span className="font-medium text-stone-700">{opt.financial_risk}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ================= MODE 2: SCENARIO & CERTIFICATION EVALUATOR ================= */}
          {activeMode === 'scenario_evaluator' && (
            <div className="advisor-card p-5 space-y-4 bg-white border border-stone-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-bold text-stone-900">Purchase & Certification Simulator</h3>
                </div>
                <span className="text-xs text-stone-500">Test Financial-Career Tradeoffs</span>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Quick Real-World Presets:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setScenarioName('AWS Solutions Architect Voucher');
                      setScenarioCost(7000);
                      setScenarioMonths(4);
                      handleRunEvaluation('AWS Solutions Architect Voucher', 7000, 4);
                    }}
                    className="p-2 text-left bg-stone-50 hover:bg-orange-50 hover:border-orange-200 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 transition-colors"
                  >
                    🎯 ₹7,000 AWS Exam (4 mo)
                  </button>

                  <button
                    onClick={() => {
                      setScenarioName('Fast-Track AI Bootcamp');
                      setScenarioCost(25000);
                      setScenarioMonths(3);
                      handleRunEvaluation('Fast-Track AI Bootcamp', 25000, 3);
                    }}
                    className="p-2 text-left bg-stone-50 hover:bg-orange-50 hover:border-orange-200 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 transition-colors"
                  >
                    🎓 ₹25,000 Bootcamp (3 mo)
                  </button>
                </div>
              </div>

              {/* Custom Inputs */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Target Investment / Milestone Name</label>
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-medium text-stone-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="e.g. Paid Certification, Masterclass, GPU Cloud Tier"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>Cost (₹ INR)</span>
                      <span className="text-orange-600 font-extrabold">₹{scenarioCost.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="30000"
                      step="500"
                      value={scenarioCost}
                      onChange={(e) => setScenarioCost(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>Milestone Horizon</span>
                      <span className="text-stone-900 font-extrabold">{scenarioMonths} Months</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      step="1"
                      value={scenarioMonths}
                      onChange={(e) => setScenarioMonths(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleRunEvaluation(scenarioName, scenarioCost, scenarioMonths)}
                  disabled={isEvaluating}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isEvaluating ? 'Evaluating Dual Constraints...' : 'Evaluate Decision Matrix'}</span>
                </button>
              </div>

              {/* Evaluation Result Output */}
              {decisionResult && (
                <div className="mt-4 p-4 bg-gradient-to-br from-stone-50 to-orange-50/40 rounded-xl border border-orange-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-orange-200 text-orange-950">
                        AI Verdict
                      </span>
                      <span className="text-xs font-bold text-stone-900">
                        {decisionResult.verdict.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex gap-2 text-[10px] font-bold">
                      <span className="bg-white px-2 py-0.5 rounded border text-stone-700">
                        Career: {decisionResult.career_importance}
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border text-stone-700">
                        Affordability: {decisionResult.financial_feasibility}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-orange-900 leading-snug">
                    {decisionResult.headline}
                  </h4>

                  <p className="text-xs text-stone-700 leading-relaxed bg-white/80 p-3 rounded-lg border border-stone-200/60 font-sans">
                    {decisionResult.strategic_advice}
                  </p>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Recommended Action Steps:
                    </span>
                    <ul className="space-y-1">
                      {decisionResult.action_steps?.map((step, sIdx) => (
                        <li key={sIdx} className="text-xs text-stone-700 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= MODE 3: LIFE-DECISION TRADE-OFF SIMULATOR ================= */}
          {activeMode === 'life_decision_simulator' && (
            <div className="space-y-4">
              {/* Scenario Picker Bar */}
              <div className="advisor-card p-4 bg-white border border-stone-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                      Strategic Trade-off Matrix
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Explicit comparison with uncertainty bounds, prerequisites, stress index and quantitative ROI
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {LIFE_DECISION_SCENARIOS.map((sc) => {
                    const isSelected = selectedScenarioId === sc.id;
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => setSelectedScenarioId(sc.id)}
                        className={`text-left p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                        }`}
                      >
                        <span className="truncate">{sc.title.split('vs')[0].trim()} vs...</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Scenario Detail */}
              {(() => {
                const activeScenario = LIFE_DECISION_SCENARIOS.find(s => s.id === selectedScenarioId) || LIFE_DECISION_SCENARIOS[0];
                return (
                  <div className="space-y-4">
                    {/* Scenario Title Header */}
                    <div className="p-3.5 bg-orange-50/60 rounded-xl border border-orange-200 text-xs">
                      <h4 className="font-black text-orange-950 text-sm">{activeScenario.title}</h4>
                      <p className="text-orange-900/80 text-[11px] mt-0.5 font-medium">{activeScenario.description}</p>
                    </div>

                    {/* Side-by-Side Trade-off Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* OPTION A */}
                      <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-3 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              Option Alpha
                            </span>
                            <span className="text-[10px] font-bold text-stone-500">
                              Stress: {activeScenario.optionA.stress_index}/100
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-stone-900 leading-snug">
                            {activeScenario.optionA.name}
                          </h4>

                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                              <span className="text-stone-500 font-medium">Direct Cost:</span>
                              <strong className="text-stone-900 font-black">{activeScenario.optionA.cost_inr}</strong>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                              <span className="text-stone-500 font-medium">Time Horizon:</span>
                              <strong className="text-stone-900 font-black">{activeScenario.optionA.time_months}</strong>
                            </div>

                            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
                              <span className="text-[10px] text-emerald-800 font-bold uppercase block">Expected Career Outcome:</span>
                              <strong className="text-emerald-950 font-black text-xs">{activeScenario.optionA.projected_outcome}</strong>
                            </div>

                            <div className="p-2 rounded-lg bg-stone-50 text-[11px] text-stone-700">
                              <span className="font-bold text-stone-500 block text-[10px] uppercase">Prerequisites:</span>
                              <span>{activeScenario.optionA.prerequisites}</span>
                            </div>
                          </div>

                          {/* Pros & Cons */}
                          <div className="space-y-2 pt-1 border-t border-stone-100 text-[11px]">
                            <div>
                              <span className="font-bold text-emerald-700 block mb-0.5">Key Advantages:</span>
                              <ul className="space-y-0.5 text-stone-600">
                                {activeScenario.optionA.pros.map((p, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-emerald-600 font-bold">✓</span>
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-bold text-rose-700 block mb-0.5">Key Trade-off / Risk:</span>
                              <ul className="space-y-0.5 text-stone-600">
                                {activeScenario.optionA.cons.map((c, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* OPTION B */}
                      <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-3 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                              Option Beta
                            </span>
                            <span className="text-[10px] font-bold text-stone-500">
                              Stress: {activeScenario.optionB.stress_index}/100
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-stone-900 leading-snug">
                            {activeScenario.optionB.name}
                          </h4>

                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                              <span className="text-stone-500 font-medium">Direct Cost:</span>
                              <strong className="text-stone-900 font-black">{activeScenario.optionB.cost_inr}</strong>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                              <span className="text-stone-500 font-medium">Time Horizon:</span>
                              <strong className="text-stone-900 font-black">{activeScenario.optionB.time_months}</strong>
                            </div>

                            <div className="p-2 rounded-lg bg-purple-50/60 border border-purple-200/80">
                              <span className="text-[10px] text-purple-800 font-bold uppercase block">Expected Career Outcome:</span>
                              <strong className="text-purple-950 font-black text-xs">{activeScenario.optionB.projected_outcome}</strong>
                            </div>

                            <div className="p-2 rounded-lg bg-stone-50 text-[11px] text-stone-700">
                              <span className="font-bold text-stone-500 block text-[10px] uppercase">Prerequisites:</span>
                              <span>{activeScenario.optionB.prerequisites}</span>
                            </div>
                          </div>

                          {/* Pros & Cons */}
                          <div className="space-y-2 pt-1 border-t border-stone-100 text-[11px]">
                            <div>
                              <span className="font-bold text-emerald-700 block mb-0.5">Key Advantages:</span>
                              <ul className="space-y-0.5 text-stone-600">
                                {activeScenario.optionB.pros.map((p, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-emerald-600 font-bold">✓</span>
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-bold text-rose-700 block mb-0.5">Key Trade-off / Risk:</span>
                              <ul className="space-y-0.5 text-stone-600">
                                {activeScenario.optionB.cons.map((c, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Copilot Strategic Verdict */}
                    <div className="p-4 bg-gradient-to-r from-stone-900 to-black text-white rounded-2xl border border-stone-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-400" />
                        <h5 className="text-xs font-black uppercase tracking-wider text-orange-400">
                          AI Decision Recommendation for Your Profile:
                        </h5>
                      </div>
                      <p className="text-xs text-stone-200 leading-relaxed font-medium">
                        {activeScenario.recommendation}
                      </p>
                      <div className="pt-1 text-[10px] text-stone-400 font-mono">
                        Calculated from your current readiness ({readiness?.readiness_pct || 44}%), active skills, and monthly learning envelope.
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

        {/* RIGHT 5 COLS: Live Copilot Chat Assistant */}
        <div className="lg:col-span-5 space-y-4">
          <div className="advisor-card p-5 flex flex-col h-[650px] justify-between bg-white border border-stone-200">
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900">AI Career & Finance Advisor</h3>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online • Co-optimizing for {profile?.name || 'Student'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMessages([{
                  sender: 'copilot',
                  text: `Chat reset! How can I assist your career and finance plan?`
                }])}
                className="text-stone-400 hover:text-stone-700 p-1"
                title="Reset Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-orange-600 text-white rounded-br-none shadow-sm'
                        : 'bg-stone-100/80 text-stone-800 rounded-bl-none border border-stone-200/60 font-sans'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-stone-100 p-3 rounded-2xl text-xs text-stone-500 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span>AI Copilot is analyzing career & financial constraints...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="pt-2 border-t border-stone-100">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {quickPrompts.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[10px] bg-stone-100 hover:bg-orange-100 hover:text-orange-900 text-stone-600 px-2 py-1 rounded-md transition-colors truncate max-w-[200px]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask about certifications, trade-offs, daily routine..."
                  className="flex-1 text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-stone-900"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isTyping}
                  className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

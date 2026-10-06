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
  Bookmark
} from 'lucide-react';
import { api } from '../api';

export default function DecisionCopilotView({ profile, readiness }) {
  // Active Tab Mode
  const [activeMode, setActiveMode] = useState('capital_optimizer'); // 'capital_optimizer' | 'scenario_evaluator'

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
              Never choose blindly between career growth, emergency savings, and investments. The Decision Engine analyzes your live readiness ({readiness?.readiness_pct || 44}%) against your cash flow to produce mathematically sound capital allocations.
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

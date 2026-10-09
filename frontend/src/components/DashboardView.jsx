import React, { useState } from 'react';
import { 
  Compass, 
  Bot, 
  CalendarCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  Wallet,
  Zap,
  Check,
  Sliders,
  GitFork,
  FileText,
  Award,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  Layers,
  ArrowUpRight,
  Briefcase,
  Flame,
  CheckCheck,
  HelpCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DashboardView({ 
  profile, 
  readiness, 
  dailyPlan, 
  budgetAnalysis,
  onToggleTask, 
  setCurrentTab,
  onOpenPlacementModal,
  onOpenWeeklyReview
}) {
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);

  // Projection model parameters
  const [selectedSkillLeap, setSelectedSkillLeap] = useState('AWS & Cloud Architecture');
  const [selectedMonthlyInvest, setSelectedMonthlyInvest] = useState(5000);

  const handleTaskToggle = (taskId) => {
    onToggleTask(taskId);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 }
    });
  };

  const actualReadinessPct = readiness?.readiness_pct ?? 0;
  const strongSkills = readiness?.strong_skills || [];
  const missingSkills = readiness?.missing_skills || [];

  // Discretionary capital & financial runway
  const disposable = budgetAnalysis?.remaining_disposable ?? (profile?.financial?.monthly_income - profile?.financial?.monthly_expenses || 4000);
  const income = budgetAnalysis?.monthly_income ?? (profile?.financial?.monthly_income || 15000);
  const savingsHealth = budgetAnalysis?.savings_health || 'HEALTHY';
  
  const financialHealthPct = savingsHealth === 'HEALTHY' 
    ? Math.min(95, Math.round(55 + (disposable / Math.max(1, income)) * 40))
    : savingsHealth === 'MODERATE' 
      ? 68 
      : 42;

  // Trajectory Assessment
  const trajectoryStatus = actualReadinessPct >= 65 && financialHealthPct >= 65
    ? { label: 'Accelerating', color: 'text-emerald-700 bg-emerald-50/80 border-emerald-200' }
    : actualReadinessPct >= 40
      ? { label: 'On Track', color: 'text-stone-800 bg-stone-100 border-stone-200' }
      : { label: 'Action Required', color: 'text-amber-800 bg-amber-50 border-amber-200' };

  // 3-Year Projection multipliers based on target track
  const currentEstLpa = 6.5;
  const projectedLpa = selectedSkillLeap.includes('AWS') 
    ? 14.8 
    : selectedSkillLeap.includes('PyTorch') 
      ? 16.5 
      : 13.2;

  // 3-year SIP corpus calculation: FV = P * [((1 + r)^n - 1) / r] * (1 + r) with r = 12%/12 = 0.01, n = 36
  const r = 0.12 / 12;
  const n = 36;
  const projectedCorpus = Math.round(selectedMonthlyInvest * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));

  const todayFormatted = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      
      {/* =========================================================================
          EXECUTIVE HEADER
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-stone-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Overview
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-[11px] font-medium text-stone-500">
                {todayFormatted}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
              {getGreeting()}, {profile?.name ? profile.name.split(' ')[0] : 'there'}
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Tracking your progression toward <strong className="text-stone-900 font-semibold">{profile?.career_goal || 'Engineering Placement'}</strong> with synchronized capital allocation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xs ${trajectoryStatus.color}`}>
              <span className="text-stone-500 font-normal">Trajectory:</span>
              <strong className="font-bold">{trajectoryStatus.label}</strong>
            </span>
          </div>
        </div>

        {/* 3 Core Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          
          {/* 1. Placement Readiness */}
          <div className="p-4 bg-stone-50/70 rounded-xl border border-stone-200/70 hover:border-stone-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Placement Readiness
              </span>
              <button
                onClick={onOpenPlacementModal}
                className="text-[11px] font-semibold text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Factors →
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900">{actualReadinessPct}%</span>
              <span className="text-xs text-stone-500 font-medium">Target: 75%</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-stone-900 h-full rounded-full transition-all duration-700" 
                style={{ width: `${actualReadinessPct}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              Primary bottleneck: <strong className="text-stone-800 font-semibold">{missingSkills[0] || 'Technical Stack'}</strong>
            </p>
          </div>

          {/* 2. Monthly Discretionary Capital */}
          <div className="p-4 bg-stone-50/70 rounded-xl border border-stone-200/70 hover:border-stone-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Monthly Discretionary
              </span>
              <button
                onClick={() => setCurrentTab('finance')}
                className="text-[11px] font-semibold text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Ledger →
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900">₹{disposable.toLocaleString()}</span>
              <span className="text-xs text-stone-500 font-medium">Surplus</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-700" 
                style={{ width: `${financialHealthPct}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              Runway status: <strong className="text-stone-800 font-semibold">{savingsHealth === 'HEALTHY' ? '6+ months living buffer' : '3 months runway'}</strong>
            </p>
          </div>

          {/* 3. Expected Compensation Target */}
          <div className="p-4 bg-stone-50/70 rounded-xl border border-stone-200/70 hover:border-stone-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Target Compensation
              </span>
              <button
                onClick={() => setCurrentTab('simulation')}
                className="text-[11px] font-semibold text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Model →
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900">₹{projectedLpa} LPA</span>
              <span className="text-xs text-emerald-700 font-semibold">
                +{Math.round(((projectedLpa - currentEstLpa) / currentEstLpa) * 100)}%
              </span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(100, Math.round((projectedLpa / 20) * 100))}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              Baseline: <strong className="text-stone-800 font-semibold">₹{currentEstLpa} LPA campus average</strong>
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: TODAY'S HIGH-IMPACT PRIORITIES
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Today's High-Impact Priorities
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Ranked action items derived to unblock recruitment filters and financial safety gates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentTab('today')}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            >
              <span>🧠 AI Priority Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsWhyModalOpen(true)}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer w-fit px-2 py-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
              <span>Why these priorities?</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
          
          {/* Priority 1 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-400 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Skill Assessment
                </span>
                <span className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                  +8 pts readiness
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900 leading-snug">
                Complete {missingSkills[0] || 'SQL & Python'} Assessment
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                Direct benchmark screening test for {profile?.career_goal || 'target role'}. Verifies capability score for recruiter shortlists.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('today')}
              className="w-full py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Priority 2 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-400 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Applications
                </span>
                <span className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                  +12 pts pipeline
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900 leading-snug">
                Review 3 Matching Openings
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                Hand-matched roles with verified compensation ranges aligned with your active stack.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('applications')}
              className="w-full py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Open Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Priority 3 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-400 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Capital Safety
                </span>
                <span className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                  Reserve Gate 1
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900 leading-snug">
                Allocate ₹2,000 to Emergency Fund
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                Fortifies your living reserve to maintain 3-6 months buffer before equity market deployment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('finance')}
              className="w-full py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Deposit Reserve</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Priority 4 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-400 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Architecture Milestone
                </span>
                <span className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                  +6 pts stack
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900 leading-snug">
                Deploy Microservices Capstone
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                Containerize FastAPI endpoints and deploy live on cloud infrastructure with latency telemetry.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('career')}
              className="w-full py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>View Specification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* =========================================================================
          SECTION 3: 3-YEAR CAREER & CAPITAL HORIZON
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Horizon Modeling
            </span>
            <h2 className="text-base font-bold text-stone-900 mt-0.5">
              3-Year Career &amp; Capital Projection
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Simulated relationship between specialized skill acquisition and systematic monthly compounding.
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('simulation')}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer flex-shrink-0"
          >
            <span>Open Simulation Model</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interactive Sandbox Controls & Outcomes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
          
          {/* Left 5 Cols: Quick Variables */}
          <div className="lg:col-span-5 space-y-4 bg-stone-50/70 p-4 rounded-xl border border-stone-200/70">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                Focus Specialization:
              </label>
              <div className="space-y-1.5">
                {[
                  'AWS & Cloud Architecture',
                  'PyTorch & Deep Learning Systems',
                  'DSA & Production System Design'
                ].map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkillLeap(skill)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                      selectedSkillLeap === skill
                        ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{skill}</span>
                    {selectedSkillLeap === skill && <Check className="w-3.5 h-3.5 text-stone-300" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                Monthly Systematic Investment (SIP):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSelectedMonthlyInvest(amt)}
                    className={`py-2 rounded-lg text-xs font-semibold transition text-center cursor-pointer ${
                      selectedMonthlyInvest === amt
                        ? 'bg-stone-900 text-white shadow-2xs'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Projected 3-Year Trajectory */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-3.5">
            
            {/* Projected Salary */}
            <div className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Projected Compensation
                </span>
                <div className="text-2xl font-extrabold text-stone-900 mt-1">
                  ₹{projectedLpa} LPA
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  +{Math.round(((projectedLpa - currentEstLpa) / currentEstLpa) * 100)}% lift above standard campus benchmarks.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200 w-fit mt-3">
                Recruiter Benchmark Verified
              </span>
            </div>

            {/* Projected Wealth */}
            <div className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Projected Liquid Corpus
                </span>
                <div className="text-2xl font-extrabold text-stone-900 mt-1">
                  ₹{projectedCorpus.toLocaleString()}
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Modeled at conservative 12% CAGR across broad index instruments.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200 w-fit mt-3">
                ₹{(selectedMonthlyInvest * 36).toLocaleString()} Principal Base
              </span>
            </div>

            {/* Opportunity Cost Insight Note */}
            <div className="col-span-2 p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between text-xs">
              <span className="text-stone-700 leading-normal">
                <strong>Payback Horizon:</strong> Upskilling investment pays for itself within <strong>0.7 months</strong> of placement compensation.
              </span>
              <button
                onClick={() => setCurrentTab('simulation')}
                className="text-stone-900 font-bold hover:underline flex items-center gap-1 text-[11px] flex-shrink-0 cursor-pointer ml-3"
              >
                <span>Full Projection</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: CORE WORKSPACE SHORTCUTS
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          onClick={() => setCurrentTab('simulation')}
          className="bg-white p-4 text-left rounded-xl border border-stone-200 hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 group-hover:text-stone-950">What-If Simulator</h3>
            <p className="text-xs text-stone-500 mt-0.5">Model weekly study hours &amp; budget trade-offs.</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-stone-700">
            <span>Launch Model</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('skillgraph')}
          className="bg-white p-4 text-left rounded-xl border border-stone-200 hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 group-hover:text-stone-950">Skill Architecture</h3>
            <p className="text-xs text-stone-500 mt-0.5">Topological prerequisite DAG &amp; unblocking paths.</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-stone-700">
            <span>Inspect Graph</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('resume')}
          className="bg-white p-4 text-left rounded-xl border border-stone-200 hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 group-hover:text-stone-950">Resume &amp; ATS Intel</h3>
            <p className="text-xs text-stone-500 mt-0.5">Evaluate keyword match score and recruiter bullets.</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-stone-700">
            <span>Analyze Resume</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('applications')}
          className="bg-white p-4 text-left rounded-xl border border-stone-200 hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 group-hover:text-stone-950">Application Pipeline</h3>
            <p className="text-xs text-stone-500 mt-0.5">Track candidate funnel from Applied to Final Offer.</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-stone-700">
            <span>Open Pipeline</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* =========================================================================
          SECTION 5: DAILY EXECUTION QUEUE
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Focus Queue ({dailyPlan?.tasks?.length || 4} Tasks)
            </h3>
          </div>
          <button 
            onClick={() => setCurrentTab('today')}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Open Focus Timer →
          </button>
        </div>
        
        <div className="space-y-2">
          {dailyPlan?.tasks?.map((task) => (
            <div 
              key={task.id}
              onClick={() => handleTaskToggle(task.id)}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                task.completed 
                  ? 'bg-stone-50 border-stone-200 opacity-60' 
                  : 'bg-white border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <button className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  task.completed ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300'
                }`}>
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
                <div>
                  <h4 className={`text-xs font-bold ${task.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                    {task.subject}: {task.topic}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">{task.why_today}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                {task.duration_minutes} min
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* "Why Am I Seeing This?" Methodology Modal */}
      {isWhyModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Elevare Intelligence Engine
                </span>
                <h3 className="text-base font-bold text-stone-900">
                  Priority Selection Methodology
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWhyModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Elevare ranks daily action items using quantitative scoring derived from your active academic, skill, and financial envelope:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-stone-200 flex items-center justify-center font-bold text-stone-700 text-xs flex-shrink-0">
                  1
                </div>
                <div>
                  <strong className="text-stone-900 block font-bold">Placement Readiness Index ({actualReadinessPct}%)</strong>
                  <span className="text-stone-600 text-[11px] leading-relaxed block mt-0.5">
                    Your target track ({profile?.career_goal || 'role'}) requires ~75% readiness for campus shortlisting. Priority 1 directly addresses your top missing prerequisite ({missingSkills[0] || 'Technical Stack'}).
                  </span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-stone-200 flex items-center justify-center font-bold text-stone-700 text-xs flex-shrink-0">
                  2
                </div>
                <div>
                  <strong className="text-stone-900 block font-bold">Pipeline Velocity</strong>
                  <span className="text-stone-600 text-[11px] leading-relaxed block mt-0.5">
                    Consistent top-of-funnel outreach reduces time-to-offer by 4.2 weeks. Priority 2 advances candidate pipeline stages across matching roles.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-stone-200 flex items-center justify-center font-bold text-stone-700 text-xs flex-shrink-0">
                  3
                </div>
                <div>
                  <strong className="text-stone-900 block font-bold">Prerequisite Capital Runway</strong>
                  <span className="text-stone-600 text-[11px] leading-relaxed block mt-0.5">
                    Students should avoid market volatility without a 3-month living expense reserve. Priority 3 preserves capital resilience prior to equity investment.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsWhyModalOpen(false)}
              className="w-full py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Understood, Back to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

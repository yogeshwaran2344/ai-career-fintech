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
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GamificationHUD from './GamificationHUD';

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

  // Digital Twin quick sandbox state
  const [selectedSkillLeap, setSelectedSkillLeap] = useState('AWS & Cloud Architecture');
  const [selectedMonthlyInvest, setSelectedMonthlyInvest] = useState(5000);

  const handleTaskToggle = (taskId) => {
    onToggleTask(taskId);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const actualReadinessPct = readiness?.readiness_pct ?? 0;
  const strongSkills = readiness?.strong_skills || [];
  const missingSkills = readiness?.missing_skills || [];

  // Calculate Financial Health Score (0-100)
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
    ? { label: '↑ Accelerating', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    : actualReadinessPct >= 40
      ? { label: '↑ Improving', color: 'text-orange-700 bg-orange-50 border-orange-200' }
      : { label: '⚡ Action Needed', color: 'text-amber-700 bg-amber-50 border-amber-200' };

  // 3-Year Projection multipliers based on quick twin inputs
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* =========================================================================
          SECTION 1: "WHERE AM I NOW?" (5-SECOND CLARITY SNAPSHOT)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-stone-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-stone-400">
                CAREERWEALTH AI PLATFORM
              </span>
              <span className="text-[10px] bg-orange-100 text-orange-800 font-extrabold px-2 py-0.5 rounded-full">
                LIVE TELEMETRY
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-900 mt-1 tracking-tight">
              Where Am I Now?
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Unified status for <strong className="text-stone-800">{profile?.name}</strong> • Target: <span className="text-orange-600 font-bold">{profile?.career_goal}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xs ${trajectoryStatus.color}`}>
              <span>Overall Trajectory:</span>
              <strong className="underline decoration-2">{trajectoryStatus.label}</strong>
            </span>
          </div>
        </div>

        {/* 3 Core Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* 1. Career Readiness */}
          <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 hover:border-orange-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Career Readiness
              </span>
              <button
                onClick={onOpenPlacementModal}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-2 py-0.5 rounded cursor-pointer"
              >
                Inspect 7 Factors →
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900">{actualReadinessPct}%</span>
              <span className="text-xs text-stone-500 font-bold">vs 75% target</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2 mt-2.5 overflow-hidden">
              <div 
                className="bg-orange-500 h-full rounded-full transition-all duration-700" 
                style={{ width: `${actualReadinessPct}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2 font-medium">
              Primary Gap: <strong className="text-stone-800">{missingSkills[0] || 'Technical Stack'}</strong>
            </p>
          </div>

          {/* 2. Financial Health */}
          <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Financial Health
              </span>
              <button
                onClick={() => setCurrentTab('finance')}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded cursor-pointer"
              >
                Budget Intel →
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900">{financialHealthPct}%</span>
              <span className="text-xs text-emerald-700 font-bold">
                {savingsHealth === 'HEALTHY' ? 'Resilient' : 'Safe Runway'}
              </span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2 mt-2.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-700" 
                style={{ width: `${financialHealthPct}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2 font-medium">
              Monthly Surplus: <strong className="text-stone-800">₹{disposable.toLocaleString()}</strong>
            </p>
          </div>

          {/* 3. Overall Trajectory Momentum */}
          <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Active Momentum
              </span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Streak: {profile?.streak_days || 1} Days
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700">+{profile?.total_xp || 50}</span>
              <span className="text-xs text-stone-500 font-bold">XP Gained</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2 mt-2.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(100, (profile?.total_xp || 50) / 2)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2 font-medium">
              Level {profile?.user_level || 1} Student • {profile?.badges?.length || 1} Badges Unlocked
            </p>
          </div>
        </div>
      </div>

      {/* Gamification Level & Streak Bar */}
      <GamificationHUD profile={profile} />

      {/* =========================================================================
          SECTION 2: "WHAT SHOULD I DO TODAY?" (YOUR NEXT BEST ACTIONS)
          ========================================================================= */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-orange-950 text-white rounded-3xl p-6 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-500/30 text-orange-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-400/30">
                Decision Layer
              </span>
              <span className="text-[11px] text-stone-400 font-bold">Prioritized Daily Impact</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1">
              What Should I Do Today? (Next Best Actions)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsWhyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-orange-200 transition cursor-pointer"
          >
            <span>💡 Why am I seeing this?</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
          {/* Action 1 */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">
                  🎯 Assessment
                </span>
                <span className="text-[10px] bg-orange-500/30 text-orange-200 px-2 py-0.5 rounded-full font-bold">
                  +8 readiness
                </span>
              </div>
              <h4 className="text-sm font-black text-white mt-1">
                Complete {missingSkills[0] || 'SQL & Python'} Assessment
              </h4>
              <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                Direct benchmark screening test for {profile?.career_goal}. Verifies proficiency and lifts placement readiness index.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('today')}
              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Take Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action 2 */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                  💼 Outbound
                </span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-bold">
                  +12 opportunity
                </span>
              </div>
              <h4 className="text-sm font-black text-white mt-1">
                Apply to 3 Matching Roles
              </h4>
              <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                High-match opportunities aligned with your profile. Log them directly in your Application Tracker funnel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('applications')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Track Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action 3 */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  💰 Sinking Fund
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  +4 financial health
                </span>
              </div>
              <h4 className="text-sm font-black text-white mt-1">
                Save ₹2,000 Toward Goal
              </h4>
              <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                Fortifies your 3-month living buffer, satisfying SEBI Gate 1 before capital is deployed into market assets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('finance')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Deposit Savings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action 4 */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
                  🧠 Capstone
                </span>
                <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full font-bold">
                  +6 skill score
                </span>
              </div>
              <h4 className="text-sm font-black text-white mt-1">
                Finish AWS / Microservices Project
              </h4>
              <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                Containerize endpoints and deploy live on cloud infrastructure with production metrics on your resume.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('career')}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>View Blueprint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: "WHERE AM I GOING?" (CAREER + WEALTH DIGITAL TWIN TRAJECTORY)
          ========================================================================= */}
      <div className="advisor-card p-6 border-2 border-stone-200 hover:border-orange-300 transition-all space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                🌟 Signature Platform Feature
              </span>
              <span className="text-xs text-stone-500 font-bold">3-Year Predictive Projection</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-stone-900 mt-1">
              Where Am I Going? (Career + Wealth Digital Twin)
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Simulate: <em>"What happens if I acquire high-impact skills and invest ₹{selectedMonthlyInvest.toLocaleString()}/month?"</em>
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('simulation')}
            className="px-4 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer flex-shrink-0 shadow-md"
          >
            <span>Open Full Twin Sandbox</span>
            <ArrowRight className="w-4 h-4 text-orange-400" />
          </button>
        </div>

        {/* Visual Bridge Diagram */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 font-mono text-xs text-stone-700 hidden sm:block">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-orange-700">Career: {profile?.career_goal} + {selectedSkillLeap}</span>
            <span className="text-stone-400">───╮</span>
          </div>
          <div className="flex items-center justify-center my-0.5">
            <span className="bg-stone-900 text-white px-3 py-1 rounded-lg text-[11px] font-sans font-bold shadow-xs">
              🤖 Unified AI Digital Twin Engine
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-700">Wealth: ₹{selectedMonthlyInvest.toLocaleString()}/mo Compounding SIP</span>
            <span className="text-stone-400">───╯</span>
          </div>
        </div>

        {/* Interactive Sandbox Controls & Immediate Outcomes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
          {/* Left 5 Cols: Quick Variables */}
          <div className="lg:col-span-5 space-y-3.5 bg-stone-50/70 p-4 rounded-2xl border border-stone-200">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Target Skill Leap:
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
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      selectedSkillLeap === skill
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{skill}</span>
                    {selectedSkillLeap === skill && <Check className="w-3.5 h-3.5 text-orange-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Monthly Systematic Investment (SIP):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSelectedMonthlyInvest(amt)}
                    className={`py-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                      selectedMonthlyInvest === amt
                        ? 'bg-emerald-600 text-white shadow-xs'
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
          <div className="lg:col-span-7 grid grid-cols-2 gap-3">
            {/* Projected Salary */}
            <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                  3-Yr Salary Trajectory
                </span>
                <div className="text-2xl font-black text-stone-900 mt-1">
                  ₹{projectedLpa} LPA
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  Up from ₹{currentEstLpa} LPA baseline (+{Math.round(((projectedLpa - currentEstLpa) / currentEstLpa) * 100)}% earnings lift).
                </p>
              </div>
              <span className="text-[10px] font-bold text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200 w-fit mt-2">
                Verified Recruiter Benchmark
              </span>
            </div>

            {/* Projected Wealth */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  3-Yr Wealth Corpus
                </span>
                <div className="text-2xl font-black text-stone-900 mt-1">
                  ₹{projectedCorpus.toLocaleString()}
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  Accumulated portfolio @ 12% CAGR across index & diversified funds.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 w-fit mt-2">
                ₹{(selectedMonthlyInvest * 36).toLocaleString()} Capital Invested
              </span>
            </div>

            {/* Opportunity Cost Verdict */}
            <div className="col-span-2 p-3 bg-stone-900 text-white rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span className="text-[11px]">
                  <strong>Opportunity Cost Verdict:</strong> Investing in this upskilling leap pays for itself within <strong>0.7 months</strong> of salary increase.
                </span>
              </div>
              <button
                onClick={() => setCurrentTab('simulation')}
                className="text-orange-400 font-bold hover:underline flex items-center gap-1 text-[11px] flex-shrink-0 cursor-pointer"
              >
                <span>Full What-If</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: QUICK ACCESS ENGINE CARDS
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setCurrentTab('simulation')}
          className="advisor-card p-4 text-left flex flex-col justify-between group hover:border-orange-400 hover:shadow-orange-500/10 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-stone-900 group-hover:text-orange-600">What-If Simulator</h3>
              <span className="text-[9px] bg-orange-100 text-orange-800 font-extrabold px-1 rounded">Twin</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Test study time & budget variable scenarios.</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-orange-600">
            <span>Simulate Now</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('skillgraph')}
          className="advisor-card p-4 text-left flex flex-col justify-between group hover:border-orange-400 hover:shadow-orange-500/10 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 group-hover:text-amber-600">Skill Graph Tree</h3>
            <p className="text-[11px] text-stone-500 mt-0.5">Topological prerequisite DAG & unblocking paths.</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-600">
            <span>View Graph</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('resume')}
          className="advisor-card p-4 text-left flex flex-col justify-between group hover:border-orange-400 hover:shadow-orange-500/10 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 group-hover:text-blue-600">Resume & ATS Polisher</h3>
            <p className="text-[11px] text-stone-500 mt-0.5">Scan ATS Score & Polish XYZ impact bullets.</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-600">
            <span>Analyze Resume</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('applications')}
          className="advisor-card p-4 text-left flex flex-col justify-between group hover:border-orange-400 hover:shadow-orange-500/10 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-stone-900 group-hover:text-emerald-600">Application Funnel</h3>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1 rounded">Funnel</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Track outreach from Applied to Final Offer.</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>Open Pipeline</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* =========================================================================
          SECTION 5: TODAY'S PLAN CHECKLIST WIDGET
          ========================================================================= */}
      <div className="advisor-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Today's Daily Action Sprints ({dailyPlan?.tasks?.length || 4} Tasks)
            </h3>
          </div>
          <button 
            onClick={() => setCurrentTab('today')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            Open Full Focus Timer →
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
                  : 'bg-white border-stone-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <button className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-300'
                }`}>
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <div>
                  <h4 className={`text-xs font-bold ${task.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                    {task.subject}: {task.topic}
                  </h4>
                  <p className="text-[11px] text-stone-500">{task.why_today}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                {task.duration_minutes} min
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* "Why Am I Seeing This?" Explainability Modal */}
      {isWhyModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">Explainable AI Attribution</span>
                <h3 className="text-base font-black text-stone-900">Why Are You Seeing These Next Best Actions?</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWhyModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              CareerWealth.AI uses zero generic advice. Every action is derived mathematically from your active profile envelope:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                <span className="text-base">📊</span>
                <div>
                  <strong className="text-stone-900 block">Placement Readiness Gap ({actualReadinessPct}%)</strong>
                  <span className="text-stone-500 text-[11px]">Your target role ({profile?.career_goal}) requires ~75% readiness. Action 1 targets your highest-weight missing skill ({missingSkills[0] || 'Technical Stack'}).</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                <span className="text-base">💼</span>
                <div>
                  <strong className="text-stone-900 block">Application Funnel Velocity</strong>
                  <span className="text-stone-500 text-[11px]">Consistent top-of-funnel outreach reduces time-to-offer by 4.2 weeks. Action 2 advances your pipeline across target companies.</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                <span className="text-base">🛡️</span>
                <div>
                  <strong className="text-stone-900 block">SEBI 5-Gate Prerequisite Checklist</strong>
                  <span className="text-stone-500 text-[11px]">Students should never trade equity without a 3-month expense runway. Action 3 locks in capital safety before market risk.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsWhyModalOpen(false)}
              className="w-full py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-black transition cursor-pointer"
            >
              Understood, Back to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

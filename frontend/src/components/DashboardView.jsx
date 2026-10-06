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
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GamificationHUD from './GamificationHUD';

export default function DashboardView({ 
  profile, 
  readiness, 
  dailyPlan, 
  onToggleTask, 
  setCurrentTab,
  onOpenPlacementModal,
  onOpenWeeklyReview
}) {
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);

  const handleTaskToggle = (taskId) => {
    onToggleTask(taskId);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const actualReadinessPct = readiness?.readiness_pct ?? 0;
  const actualSkillScore = readiness?.readiness_score ?? 0;
  const strongSkills = readiness?.strong_skills || [];
  const missingSkills = readiness?.missing_skills || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Very Top Prominent Bold Welcome Hero Banner */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight flex flex-wrap items-center gap-2">
            Welcome <span className="text-orange-600 font-black underline decoration-orange-400 decoration-wavy decoration-3">{profile?.name || 'Student'}</span> , Let's Get Started
          </h1>
          <p className="text-sm font-bold text-stone-600 mt-2 flex flex-wrap items-center gap-1.5">
            <span>{profile?.academic?.degree || 'B.Tech / B.E'} in {profile?.academic?.branch || 'Computer Science & Engineering'} ({profile?.academic?.year || '3rd Year'})</span>
            <span className="text-stone-400">•</span>
            <span>Target Placement: <strong className="font-black text-stone-900">{profile?.preferences?.target_placement_year || 2027}</strong></span>
          </p>
        </div>
      </div>

      {/* 2. Gamification Level & Streak Bar */}
      <GamificationHUD profile={profile} />

      {/* 3. AI Action Center: 3 Highest-Impact Actions Today */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-orange-950 text-white rounded-3xl p-6 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-500/30 text-orange-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-400/30">
                AI Strategic Dispatch
              </span>
              <span className="text-[11px] text-stone-400 font-bold">Personalized For You</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1">
              Your 3 Highest-Impact Actions Today
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
          {/* Action 1 */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">1. Core Technical</span>
                <span className="text-[10px] bg-orange-500/30 text-orange-200 px-2 py-0.5 rounded-full font-bold">+8% Readiness</span>
              </div>
              <h4 className="text-sm font-black text-white mt-1">
                Finish {missingSkills[0] || 'Python & SQL'} Focus Sprint
              </h4>
              <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                Primary placement bottleneck for {profile?.career_goal}. Completing a 45m sprint closes your highest-weight gap.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('today')}
              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Start Focus Sprint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action 2 */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">2. Placement Funnel</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-bold">Target {profile?.preferences?.target_placement_year || 2027}</span>
              </div>
              <h4 className="text-sm font-black text-white mt-1">
                Apply to 3 Target Internships
              </h4>
              <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                Curated opportunities matching your {profile?.academic?.branch || 'major'}. Early applications yield 2.4x higher interview conversion.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('jobmarket')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Explore Openings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action 3 */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">3. Wealth Safety Gate</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">5-Gate Check</span>
              </div>
              <h4 className="text-sm font-black text-white mt-1">
                Allocate ₹1,500 to Emergency Sinking Fund
              </h4>
              <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                Fulfills SEBI Safety Gate 1 (Emergency Runway) before exposing student capital to market volatility.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('finance')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Deposit Sinking Fund</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* "Why Am I Seeing This?" Explainability Modal */}
      {isWhyModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">Explainable AI Attribution</span>
                <h3 className="text-base font-black text-stone-900">Why Are You Seeing These Recommendations?</h3>
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
                <span className="text-base">🎯</span>
                <div>
                  <strong className="text-stone-900 block">Graduation Horizon ({profile?.preferences?.target_placement_year || 2027})</strong>
                  <span className="text-stone-500 text-[11px]">Companies start hiring 12-18 months prior to batch graduation. Action 2 puts your portfolio in front of active hiring managers.</span>
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


      {/* 4 Feature Power Action Cards */}
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
              <span className="text-[9px] bg-orange-100 text-orange-800 font-extrabold px-1 rounded">HOT</span>
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
          onClick={() => setCurrentTab('today')}
          className="advisor-card p-4 text-left flex flex-col justify-between group hover:border-orange-400 hover:shadow-orange-500/10 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-stone-900 group-hover:text-emerald-600">Today's AI Plan</h3>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1 rounded">Daily</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">{profile?.preferences?.study_hours_per_day || 2}h focus sprints.</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>Start Sprints</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Main Grid: Metrics + Today's Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Progress & Metrics */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: Dynamic Calculated Career Engine Readiness */}
            <div className="advisor-card p-4 text-center">
              <div className="text-2xl font-black text-orange-600">
                {actualReadinessPct}%
              </div>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                {profile?.career_goal} Readiness
              </p>
              <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${actualReadinessPct}%` }}
                ></div>
              </div>
            </div>

            {/* Card 2: 7-Factor Placement Score */}
            <button
              onClick={onOpenPlacementModal}
              className="advisor-card p-4 text-center hover:border-orange-400 cursor-pointer"
            >
              <div className="text-2xl font-black text-stone-900">
                78 <span className="text-xs text-stone-400">/ 100</span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                Placement Factor Score
              </p>
              <span className="inline-block text-[9px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded font-bold mt-1">
                View 7 Factors →
              </span>
            </button>

            {/* Card 3: Financial Sinking Fund */}
            <div className="advisor-card p-4 text-center">
              <div className="text-2xl font-black text-stone-900">
                ₹{(profile?.financial?.available_for_learning ?? 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                Learning Sinking Fund
              </p>
              <span className="inline-block text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold mt-1">
                Sustainable
              </span>
            </div>

            {/* Card 4: Study Capacity */}
            <div className="advisor-card p-4 text-center">
              <div className="text-2xl font-black text-stone-900">
                {profile?.preferences?.study_hours_per_day ?? 2.0} <span className="text-xs font-normal text-stone-500">h/day</span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                Daily Study Sprints
              </p>
              <span className="inline-block text-[9px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-semibold mt-1">
                {Math.round((profile?.preferences?.study_hours_per_day ?? 2.0) * 7)}h/week Pace
              </span>
            </div>
          </div>

          {/* Quick Bottleneck Alert */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  AI Placement Bottleneck: {missingSkills.length > 0 ? missingSkills[0] : 'System Architecture'}
                </h4>
                <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">
                  Your primary technical gap for {profile?.career_goal || 'your target role'} is {missingSkills.length > 0 ? missingSkills[0] : 'core engineering'}. Closing this bottleneck accelerates your placement readiness.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('today')}
              className="text-xs font-bold text-orange-700 bg-white border border-orange-200 px-3 py-1.5 rounded-xl shadow-2xs flex-shrink-0"
            >
              Start Sprint
            </button>
          </div>

          {/* Today's Plan Checklist Widget */}
          <div className="advisor-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Today's AI Action Plan ({dailyPlan?.tasks?.length || 4} Sprints)
                </h3>
              </div>
              <button 
                onClick={() => setCurrentTab('today')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                Open Full Timer →
              </button>
            </div>
            
            <div className="space-y-2">
              {dailyPlan?.tasks?.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => handleTaskToggle(task.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
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
                  <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">
                    {task.duration_minutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Sunday AI Review & Milestones */}
        <div className="space-y-4">
          <div className="advisor-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Sunday AI Career Review
              </span>
              <button
                onClick={onOpenWeeklyReview}
                className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded"
              >
                Full Report →
              </button>
            </div>

            <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2 text-xs">
              <span className="text-[10px] font-extrabold uppercase text-orange-800 block">This Week's Feedback</span>
              <p className="text-stone-800 leading-relaxed font-sans">
                "You completed 18/21 sprints and logged 11.5 hours of study (+0.8 DSA velocity). Next week, unblock your portfolio by containerizing your AI Resume Analyzer."
              </p>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Next Directives:</span>
              <div className="space-y-1 text-stone-700">
                <p className="flex items-center gap-1.5"><span className="text-orange-500">•</span> Dockerize FastAPI backend</p>
                <p className="flex items-center gap-1.5"><span className="text-orange-500">•</span> Solve 15 Tree LeetCode questions</p>
                <p className="flex items-center gap-1.5"><span className="text-orange-500">•</span> Save ₹500 into AWS sinking fund</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

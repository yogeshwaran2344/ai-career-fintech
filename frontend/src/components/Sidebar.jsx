import React from 'react';
import { 
  LayoutDashboard, 
  Sliders, 
  GitFork, 
  Briefcase, 
  FileText, 
  Compass, 
  Wallet, 
  Bot, 
  UserCircle, 
  Sparkles, 
  RotateCcw,
  Zap,
  Calendar,
  Award,
  TrendingUp,
  Settings,
  LogOut,
  ShieldCheck,
  Activity,
  Globe,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  profile, 
  readiness,
  onReset,
  onOpenAuth,
  onOpenPlacementModal,
  onOpenWeeklyReview,
  onLogout
}) {
  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'today', label: "Today's AI Plan & Brain", icon: Zap, badge: 'Intelligence' },
        { id: 'financialhealth', label: 'My Financial Health', icon: Activity, badge: 'Health' },
        { id: 'copilot', label: 'AI Career Copilot', icon: Bot, badge: 'Advisor' }
      ]
    },
    {
      title: 'CAREER',
      items: [
        { id: 'career', label: 'Career Engine', icon: Compass },
        { id: 'interview', label: 'AI Interview Arena', icon: Sparkles, badge: 'STAR Eval' },
        { id: 'simulation', label: 'What-If Simulator', icon: Sliders, badge: 'Twin' },
        { id: 'skillgraph', label: 'Skill Graph Tree', icon: GitFork },
        { id: 'resume', label: 'Resume & ATS', icon: FileText },
        { id: 'jobmarket', label: 'Opportunity Radar', icon: TrendingUp, badge: 'Verified' },
        { id: 'applications', label: 'Application Tracker', icon: Briefcase, badge: 'Funnel' }
      ]
    },
    {
      title: 'WEALTH & FINTECH',
      items: [
        { id: 'finance', label: 'Finance & Budget', icon: Wallet },
        { id: 'investments', label: 'Investments & Orders', icon: TrendingUp, badge: 'Live OMS' }
      ]
    },
    {
      title: 'GLOBAL & HIGHER ED',
      items: [
        { id: 'studyabroad', label: 'Study Abroad & MS', icon: Globe, badge: 'Copilot' },
        { id: 'examprep', label: '10-Yr Papers & 1,000+ Qs', icon: BookOpen, badge: '1,000+ Qs' }
      ]
    },
    {
      title: 'SAFETY & RESILIENCE',
      items: [
        { id: 'safety', label: '5-Gate Safety Center', icon: ShieldCheck, badge: '5-Gate' }
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'profile', label: 'Profile & Setup', icon: UserCircle }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#FCFAF7] border-r border-stone-200/80 flex flex-col justify-between p-4 select-none flex-shrink-0 min-h-screen">
      <div className="overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-3 mb-3 border-b border-stone-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center font-black text-sm tracking-tight shadow-sm border border-stone-800">
              E
            </div>
            <div>
              <div className="font-extrabold text-base text-stone-900 tracking-tight">
                Elevare
              </div>
              <p className="text-[10px] text-stone-500 font-medium tracking-wide">Career &amp; Capital Intelligence</p>
            </div>
          </div>
        </div>

        {/* User Mini Card */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-3 mb-3 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 font-black flex items-center justify-center text-sm border border-orange-200 flex-shrink-0">
              {profile?.avatar || (profile?.name ? profile.name[0] : '🎓')}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-black text-stone-900 truncate">
                {profile?.name || 'Student'}
              </h4>
              <p className="text-[10px] text-orange-700 font-semibold truncate">
                {profile?.career_goal || 'Selected Track'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAuth}
            className="p-1.5 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Setup Questions"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Intelligence Triggers */}
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          <button
            onClick={onOpenPlacementModal}
            className="p-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-left transition-colors cursor-pointer"
          >
            <span className="text-[9px] font-extrabold uppercase text-orange-700 block">Readiness</span>
            <span className="text-xs font-black text-stone-900">{readiness?.readiness_pct || 0}% Score</span>
          </button>

          <button
            onClick={onOpenWeeklyReview}
            className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition-colors cursor-pointer"
          >
            <span className="text-[9px] font-extrabold uppercase text-amber-800 block">Sunday AI</span>
            <span className="text-xs font-black text-stone-900">Weekly Review</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4">
          {sections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <div className="px-3 text-[10px] font-black text-stone-400 uppercase tracking-wider">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      active
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-stone-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        active ? 'bg-orange-600 text-orange-100' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-stone-200/60 space-y-2 bg-[#FCFAF7]">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Account</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-1 px-3 py-1 text-[11px] font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Progress Baseline</span>
        </button>
      </div>
    </aside>
  );
}

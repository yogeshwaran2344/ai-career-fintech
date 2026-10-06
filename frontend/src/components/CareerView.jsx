import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  Calendar, 
  FolderGit2, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Cpu,
  Award
} from 'lucide-react';
import ProjectBlueprintModal from './ProjectBlueprintModal';

export default function CareerView({ 
  profile, 
  readiness, 
  recommendations, 
  skillGaps, 
  roadmap, 
  projects,
  onSelectRole
}) {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [expandedMonth, setExpandedMonth] = useState(1);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white advisor-card p-6 border-l-4 border-l-orange-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Career Engine Active
              </span>
              <span className="text-xs text-stone-500">Target Role Benchmark</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-1">
              Target: <span className="text-orange-600">{profile?.career_goal}</span>
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Benchmarking your current skill vector against 2026-2027 tech hiring criteria for {profile?.career_goal}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBlueprintOpen(true)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>4-Week Project Blueprint & Checklist</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-stone-100">
          {[
            { id: 'recommendations', label: 'Ranked Career Matches', icon: Award },
            { id: 'gaps', label: 'Skill Gap Matrix', icon: AlertTriangle },
            { id: 'roadmap', label: '6-Month Adaptive Roadmap', icon: Calendar },
            { id: 'projects', label: 'Portfolio Projects', icon: FolderGit2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  active 
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                    : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: RANKED CAREER MATCHES */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">Multi-Career Analysis & Explainability</h2>
            <span className="text-xs text-stone-500">Ranked by your profile alignment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations?.map((match, idx) => (
              <div 
                key={idx} 
                className={`advisor-card p-5 flex flex-col justify-between relative overflow-hidden ${
                  match.role === profile?.career_goal ? 'border-2 border-orange-500 bg-orange-50/20' : ''
                }`}
              >
                {match.role === profile?.career_goal && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
                    Current Goal
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{match.badge.split(' ')[0]}</span>
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                      {match.badge.split(' ').slice(1).join(' ') || 'Alternative'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-stone-900">{match.role}</h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{match.description}</p>

                  <div className="mt-4 p-3 bg-stone-50/90 rounded-xl border border-stone-200/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">Match Score</span>
                      <span className="font-extrabold text-orange-600 text-sm">{match.match_percentage}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full rounded-full" 
                        style={{ width: `${match.match_percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                      <span>Salary Range:</span>
                      <span className="font-bold text-stone-800">{match.salary_range_inr}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">AI Explainability: Why this match?</span>
                    <p className="text-xs text-stone-700 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/50 leading-relaxed font-sans">
                      💡 {match.why_recommended}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    {match.missing_skills.length} missing skills
                  </span>
                  {match.role !== profile?.career_goal ? (
                    <button
                      onClick={() => onSelectRole && onSelectRole(match.role)}
                      className="text-xs font-bold text-orange-600 hover:text-orange-800 bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      Switch Target →
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Active Target ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SKILL GAP MATRIX */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">Comprehensive Skill Gap Analysis</h2>
              <p className="text-xs text-stone-500">Detailed breakdown for {profile?.career_goal}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Mastered</span>
              <span className="flex items-center gap-1 text-amber-700 font-semibold"><AlertTriangle className="w-3.5 h-3.5" /> Developing</span>
              <span className="flex items-center gap-1 text-rose-700 font-semibold"><XCircle className="w-3.5 h-3.5" /> Missing</span>
            </div>
          </div>

          <div className="advisor-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Skill Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Target Benchmark</th>
                    <th className="p-3.5">Your Current Level</th>
                    <th className="p-3.5">Importance</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {skillGaps?.map((gap, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">{gap.skill}</td>
                      <td className="p-3.5 text-stone-500">{gap.category}</td>
                      <td className="p-3.5 font-medium text-stone-700">{gap.required_level}</td>
                      <td className="p-3.5 font-semibold text-stone-900">{gap.current_level}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          gap.importance === 'HIGH' 
                            ? 'bg-rose-100 text-rose-800' 
                            : gap.importance === 'MEDIUM' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {gap.importance}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          gap.status === 'MASTERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : gap.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {gap.status === 'MASTERED' ? '✓ Mastered' : gap.status === 'IN_PROGRESS' ? '~ In Progress' : '✗ Missing'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 6-MONTH ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">Personalized 6-Month Adaptive Roadmap</h2>
              <p className="text-xs text-stone-500">
                Calibrated to your <strong className="text-stone-800">{profile?.preferences?.study_hours_per_day || 2} hrs/day</strong> study capacity.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {roadmap?.months?.map((m) => {
              const isOpen = expandedMonth === m.month_number;
              return (
                <div key={m.month_number} className="advisor-card overflow-hidden border">
                  <button
                    onClick={() => setExpandedMonth(isOpen ? null : m.month_number)}
                    className="w-full p-4 flex items-center justify-between bg-stone-50/50 hover:bg-stone-100/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        M{m.month_number}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-stone-900">{m.month_title}</h3>
                        <p className="text-[11px] text-stone-500">{m.focus_theme}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
                        {m.target_completion_weeks} Weeks
                      </span>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-5 border-t border-stone-200/60 bg-white space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {m.milestones.map((ms, msIdx) => (
                          <div key={msIdx} className="bg-stone-50/70 p-4 rounded-xl border border-stone-200/70">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-bold text-stone-900">{ms.title}</h4>
                              <span className="text-[10px] font-bold text-stone-500 bg-white px-2 py-0.5 rounded border">
                                ~{ms.estimated_hours} Hours
                              </span>
                            </div>
                            <ul className="space-y-1 my-2">
                              {ms.topics.map((t, tIdx) => (
                                <li key={tIdx} className="text-xs text-stone-600 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-3 pt-2 border-t border-stone-200/60 text-[11px] text-stone-700 font-medium">
                              🎯 <strong className="text-stone-900">Key Deliverable:</strong> {ms.key_deliverable}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: RECOMMENDED PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">Gap-Bridging Portfolio Projects</h2>
              <p className="text-xs text-stone-500">
                Architectured specifically to turn missing skill gaps into recruiter proof.
              </p>
            </div>

            <button
              onClick={() => setIsBlueprintOpen(true)}
              className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200"
            >
              Open 4-Week Blueprint Modal →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {projects?.map((proj) => (
              <div key={proj.id} className="advisor-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {proj.difficulty}
                    </span>
                    <span className="text-xs font-semibold text-stone-500">~{proj.estimated_hours}h</span>
                  </div>

                  <h3 className="text-sm font-black text-stone-900">{proj.title}</h3>
                  <p className="text-xs text-stone-500 mt-1 font-medium">{proj.tagline}</p>

                  <div className="my-3 flex flex-wrap gap-1">
                    {proj.skills_covered.map((s, idx) => (
                      <span key={idx} className="bg-stone-100 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Architecture Flow</span>
                    <p className="text-[11px] text-stone-700 font-mono leading-tight">{proj.architecture_overview}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100">
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-medium">
                    🌟 <strong className="text-emerald-950">Resume Impact:</strong> {proj.portfolio_impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4-Week Project Blueprint Modal */}
      <ProjectBlueprintModal
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
      />
    </div>
  );
}

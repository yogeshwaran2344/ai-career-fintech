import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  Calendar, 
  HelpCircle, 
  Sparkles, 
  ExternalLink,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function JobRequirementsModal({ isOpen, onClose, job, profile }) {
  const [activeTab, setActiveTab] = useState('skills'); // 'skills', 'rounds', 'questions'
  const [applied, setApplied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const req = job.requirements_detail || {};

  const handleMockApply = () => {
    setApplied(true);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      setApplied(false);
    }, 4000);
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full overflow-hidden my-8 max-h-[90vh] flex flex-col cursor-default"
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Campus Placement Intel
            </span>
            <span className="text-white/80 text-xs font-semibold">2026/2027 Opening</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-white/90 text-sm font-bold">
                <Building2 className="w-4 h-4" />
                <span>{job.company}</span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                <span className="font-extrabold bg-white/20 px-2 py-0.5 rounded-md">{job.salary}</span>
              </div>
            </div>

            <div className="bg-white text-stone-900 p-3 rounded-2xl shadow-lg text-center flex-shrink-0 sm:w-28">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">Your Match</span>
              <span className="text-2xl font-black text-emerald-600">{job.match_pct}%</span>
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded block mt-0.5">
                Strong Fit
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('skills')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'skills'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Skill Benchmark ({req.required_skills?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('rounds')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'rounds'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Interview Rounds & Workflow
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'questions'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Sample Questions & Prep
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Eligibility Criteria Banner */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
            <h4 className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Eligibility & Academic Criteria
            </h4>
            <ul className="space-y-1 text-stone-700 pl-5 list-disc">
              {req.eligibility_criteria?.map((crit, idx) => (
                <li key={idx} className="leading-relaxed">{crit}</li>
              ))}
            </ul>
          </div>

          {/* TAB 1: SKILLS BENCHMARK */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-stone-900 mb-1 flex items-center justify-between">
                  <span>Required Skills vs Your Current Profile</span>
                  <span className="text-[10px] text-stone-500 font-medium">Auto-Evaluated</span>
                </h4>
                <p className="text-stone-500 text-[11px] mb-3">
                  Match analysis comparing recruiter screening filters with your verified proficiencies:
                </p>

                <div className="space-y-2.5">
                  {req.required_skills?.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        item.status === 'MATCHED' ? 'bg-emerald-50/60 border-emerald-200' :
                        item.status === 'DEVELOPING' ? 'bg-amber-50/60 border-amber-200' : 'bg-rose-50/60 border-rose-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900 block">{item.skill}</span>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500">
                          <span>Target: <strong className="text-stone-700">{item.required_level}</strong></span>
                          <span>•</span>
                          <span>You: <strong className="text-stone-700">{item.student_level}</strong></span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'MATCHED' ? 'bg-emerald-200/70 text-emerald-900' :
                        item.status === 'DEVELOPING' ? 'bg-amber-200/70 text-amber-900' : 'bg-rose-200/70 text-rose-900'
                      }`}>
                        {item.status === 'MATCHED' ? '✓ Aligned' : item.status === 'DEVELOPING' ? '⚡ Developing' : '⚠️ Skill Gap'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-to-Day Responsibilities */}
              <div className="pt-2 border-t border-stone-200">
                <h4 className="font-extrabold text-stone-900 mb-2">Day-to-Day Engineering Responsibilities</h4>
                <ul className="space-y-1.5 text-stone-600 pl-4 list-disc">
                  {req.day_to_day_responsibilities?.map((resp, idx) => (
                    <li key={idx} className="leading-relaxed">{resp}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: INTERVIEW ROUNDS */}
          {activeTab === 'rounds' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-stone-900 mb-2">Recruitment Process & Rounds</h4>
                <div className="space-y-3">
                  {req.interview_rounds?.map((round, idx) => (
                    <div key={idx} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="font-bold text-stone-900">{round.split(':')[0]}</h5>
                        <p className="text-stone-600 mt-0.5">{round.split(':').slice(1).join(':') || round}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recruiter Insider Tip */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl space-y-1">
                <h5 className="font-extrabold text-orange-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  Recruiter Insider Tip
                </h5>
                <p className="text-stone-700 leading-relaxed">{req.recruiter_tip}</p>
              </div>
            </div>
          )}

          {/* TAB 3: SAMPLE INTERVIEW QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-stone-900">Recent Campus Interview Questions</h4>
              <div className="space-y-2.5">
                {req.sample_interview_questions?.map((q, idx) => (
                  <div key={idx} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                    <span className="text-[10px] font-bold text-orange-600 uppercase block">Question {idx + 1}</span>
                    <p className="font-bold text-stone-900">{q}</p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
                <p className="font-bold">💡 Preparation Directive:</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Practice these questions by scheduling 45 minutes on Today's AI Plan under the DSA and System Architecture tabs.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-[11px] text-stone-500">
            <span>Work Mode: <strong className="text-stone-700">{req.expected_work_mode || 'Hybrid'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-200 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleMockApply}
              disabled={applied}
              className={`px-5 py-2 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 ${
                applied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-95 shadow-orange-500/20'
              }`}
            >
              {applied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Added to Placement Target!</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Add to Target Companies</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

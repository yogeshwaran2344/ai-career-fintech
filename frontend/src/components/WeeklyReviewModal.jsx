import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  X, 
  Clock, 
  ArrowRight,
  Zap,
  Award
} from 'lucide-react';
import { api } from '../api';

export default function WeeklyReviewModal({ isOpen, onClose, profile }) {
  const [review, setReview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      api.getWeeklyReview().then(setReview).catch(console.error);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, profile, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 cursor-default"
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-orange-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-orange-500/30 text-orange-200 border border-orange-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              Weekly AI Evaluation
            </span>
            <span className="text-xs text-stone-300">{review?.week_date_range || 'Current Sprint Week'}</span>
          </div>

          <h2 className="text-2xl font-black mt-1">Your Weekly AI Performance Review</h2>
          <p className="text-xs text-stone-300 mt-0.5">Automated feedback engine analyzing your sprint consistency and skill gains.</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Key Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Sprints Done</span>
              <span className="text-xs font-black text-stone-900 mt-1 block truncate">{review?.tasks_completed || 'Active Sprint'}</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-1">Verified Log</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Study Hours</span>
              <span className="text-sm font-black text-stone-900 mt-1 block">{review?.study_hours_logged ?? 0} Hours</span>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-1">Sprint Pace</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Top Growth Focus</span>
              <span className="text-xs font-black text-orange-600 mt-1 block truncate">
                {review?.skill_improvements?.[0] ? review.skill_improvements[0].skill : profile?.academic?.career_goal || 'Engineering'}
              </span>
              <span className="text-[10px] text-orange-700 font-bold bg-orange-50 px-1.5 py-0.5 rounded inline-block mt-1">
                {review?.skill_improvements?.[0]?.change || 'Active'}
              </span>
            </div>
          </div>

          {/* AI Counselor Narrative */}
          <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-1.5">
            <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              AI Strategic Evaluation:
            </span>
            <p className="text-xs text-stone-800 leading-relaxed font-sans">
              "{review?.ai_counselor_narrative || `Evaluating sprint pace for ${profile?.name || 'Student'}. Keep completing your daily action tasks to accelerate readiness.`}"
            </p>
          </div>

          {/* Next Week's 4 Directives */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
              Strategic Action Directives:
            </span>
            <div className="space-y-2">
              {review?.next_week_directives?.map((dir, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-stone-800">{dir}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Return / Close Button */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>← Return to Workspace</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

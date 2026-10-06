import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X, 
  TrendingUp, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../api';

export default function PlacementScoreModal({ isOpen, onClose, profile }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      api.getPlacementBreakdown().then(setData).catch(console.error);

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
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white cursor-pointer transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-orange-100">
              Placement Intelligence
            </span>
            <span className="text-xs text-orange-100">7-Factor Readiness Calibration</span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div>
              <h2 className="text-2xl font-black">{profile?.name || 'Student'}'s Placement Score</h2>
              <p className="text-xs text-orange-100 mt-0.5">{data?.tier_classification || 'Tier-1 High Potential'}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 text-center">
              <span className="text-3xl font-black text-white">{data?.overall_placement_score || 78}</span>
              <span className="text-xs text-orange-200 block font-semibold">/ 100 Overall</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Bottleneck Alert */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>AI Bottleneck Identification:</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-sans">
              {data?.bottleneck_analysis || "Your biggest bottleneck is DSA & Problem Solving (61/100). Improving DSA from 4 -> 7 could increase your estimated readiness by ~9%."}
            </p>
          </div>

          {/* 7 Factors Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Factor-by-Factor Breakdown
            </h3>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden text-xs">
              {data?.factors?.map((f, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-stone-50 transition-colors">
                  <div>
                    <span className="font-bold text-stone-900">{f.name}</span>
                    <span className="text-[10px] text-stone-400 block">{f.impact}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-24 bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          f.score >= 75 ? 'bg-emerald-500' : f.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${f.score}%` }}
                      />
                    </div>
                    <span className="font-extrabold text-stone-900 w-8 text-right">{f.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Actions to Boost */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
              Top Actions to Reach 90+ Score:
            </span>
            <ul className="space-y-1.5">
              {data?.top_actions_to_boost?.map((action, idx) => (
                <li key={idx} className="text-xs text-stone-700 flex items-start gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Return / Close Button */}
          <div className="pt-2 border-t border-stone-200">
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

import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Sparkles, 
  X, 
  CheckSquare, 
  Square, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Layers,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { api } from '../api';
import confetti from 'canvas-confetti';

export default function ProjectBlueprintModal({ isOpen, onClose }) {
  const [blueprints, setBlueprints] = useState([]);
  const [activeBlueprint, setActiveBlueprint] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    if (isOpen) {
      api.getProjectBlueprints().then(data => {
        setBlueprints(data);
        if (data.length > 0) setActiveBlueprint(data[0]);
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCheck = (idx) => {
    const updated = { ...checkedItems, [idx]: !checkedItems[idx] };
    setCheckedItems(updated);
    if (updated[idx]) {
      confetti({ particleCount: 30, spread: 50 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-orange-950 to-stone-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-orange-500/30 text-orange-200 border border-orange-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              Feature #6: Production Blueprints
            </span>
            <span className="text-xs text-stone-300">4-Week Structured Implementation</span>
          </div>

          <h2 className="text-2xl font-black mt-1">Portfolio Project Blueprint Generator</h2>
          <p className="text-xs text-stone-300 mt-0.5">Step-by-step weekly milestone execution + Recruiter GitHub checklist.</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeBlueprint && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-black text-stone-900">{activeBlueprint.title}</h3>
                  <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-lg">
                    {activeBlueprint.estimated_cost_inr}
                  </span>
                </div>
                <p className="text-xs text-stone-500">{activeBlueprint.tagline}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {activeBlueprint.skills_gained?.map((s, idx) => (
                    <span key={idx} className="bg-stone-100 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4-Week Schedule */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  4-Week Implementation Roadmap:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeBlueprint.weekly_schedule?.map((week) => (
                    <div key={week.week_number} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-orange-950">
                        <span>{week.title}</span>
                      </div>
                      <ul className="space-y-1">
                        {week.deliverables.map((d, dIdx) => (
                          <li key={dIdx} className="text-[11px] text-stone-600 flex items-start gap-1.5">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive GitHub Production Checklist */}
              <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Recruiter-Ready GitHub Checklist
                    </h4>
                  </div>
                  <span className="text-[10px] text-stone-400">Check off as you build</span>
                </div>

                <div className="space-y-2">
                  {activeBlueprint.github_checklist?.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className="flex items-center gap-3 p-2 bg-stone-800/80 rounded-xl cursor-pointer hover:bg-stone-800 transition-colors"
                    >
                      <button className="text-emerald-400">
                        {checkedItems[idx] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-stone-500" />}
                      </button>
                      <span className={`text-xs ${checkedItems[idx] ? 'line-through text-stone-400' : 'text-stone-200'}`}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

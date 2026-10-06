import React from 'react';
import { 
  Flame, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Zap,
  TrendingUp
} from 'lucide-react';

export default function GamificationHUD({ profile }) {
  const streak = profile?.streak_days || 7;
  const level = profile?.user_level || 7;
  const levelTitle = profile?.level_title || "Interview Ready";
  const xp = profile?.total_xp || 1450;
  const badges = profile?.badges || ["🏅 First Project", "🔥 7-Day Streak", "💻 100 DSA Problems", "📄 Resume Ready"];

  return (
    <div className="bg-white/80 backdrop-blur-md border border-stone-200/80 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      {/* Level & Streak */}
      <div className="flex items-center gap-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-xl border border-orange-200">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span className="text-xs font-black text-orange-950">{streak}-Day Streak</span>
        </div>

        {/* Level */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white text-xs font-black flex items-center justify-center shadow-2xs">
            L{level}
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase leading-none">Status</span>
            <span className="text-xs font-bold text-stone-900">{levelTitle}</span>
          </div>
        </div>

        {/* XP Counter */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-stone-600 font-semibold bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{xp.toLocaleString()} Total XP</span>
        </div>
      </div>

      {/* Badges Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {badges.map((badge, idx) => (
          <span
            key={idx}
            className="text-[11px] font-bold text-stone-700 bg-stone-100 hover:bg-orange-50 hover:text-orange-900 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors whitespace-nowrap"
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}

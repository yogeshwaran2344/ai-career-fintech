import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Flame, 
  Award,
  Zap,
  ArrowRight,
  TrendingUp,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TodayPlanView({ 
  profile, 
  dailyPlan, 
  onToggleTask, 
  onSkillBoost 
}) {
  // Timer state
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      confetti({ particleCount: 100, spread: 80 });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  const startTaskTimer = (task) => {
    setActiveTaskId(task.id);
    setSecondsLeft(task.duration_minutes * 60);
    setIsTimerRunning(true);
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleTaskCheck = (taskId) => {
    onToggleTask(taskId);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 }
    });
  };

  const completedCount = dailyPlan?.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = dailyPlan?.tasks?.length || 4;
  const progressPct = Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-stone-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ⭐ The Killer Daily Loop
              </span>
              <span className="text-xs text-emerald-200/80">{dailyPlan?.date_str}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1.5 flex items-center gap-2">
              What Should I Do TODAY? <Flame className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
              Forget overwhelming 6-month roadmaps. The AI converts your macro skill gaps into <strong>{profile?.preferences?.study_hours_per_day || 2} focused hours</strong> of actionable progress for today.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[190px]">
            <div className="text-xs font-semibold text-emerald-200">Today's Completion</div>
            <div className="text-2xl font-black text-white mt-0.5">{progressPct}%</div>
            <div className="text-[11px] text-emerald-300 mt-1 font-medium">
              {completedCount} of {totalTasks} Sprints Done
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Tasks List & Active Stopwatch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: Action Tasks */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Today's Curated Focus Sprints
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              Total Time: ~{dailyPlan?.total_estimated_minutes || 120} Mins ({dailyPlan?.available_hours || 2}h)
            </span>
          </div>

          {dailyPlan?.tasks?.map((task, idx) => {
            const isSelectedForTimer = activeTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`advisor-card p-4 transition-all border ${
                  task.completed
                    ? 'bg-stone-50/80 border-stone-200 opacity-65'
                    : isSelectedForTimer
                    ? 'border-2 border-emerald-500 bg-emerald-50/20'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleTaskCheck(task.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border mt-0.5 transition-colors cursor-pointer ${
                        task.completed 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-stone-300 hover:border-emerald-500'
                      }`}
                    >
                      {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {task.action_type}
                        </span>
                        <span className="text-xs font-bold text-stone-900">{task.subject}</span>
                      </div>
                      <h3 className={`text-sm font-black mt-1 ${task.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                        {task.topic}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1">
                        💡 {task.why_today}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs font-extrabold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                      {task.duration_minutes} min
                    </span>
                    {!task.completed && (
                      <button
                        onClick={() => startTaskTimer(task)}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Timer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT 5 COLS: Focus Timer & Instant Progress Recalculator */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Sprint Timer Card */}
          <div className="advisor-card p-6 text-center space-y-4 bg-gradient-to-b from-stone-900 to-stone-950 text-white rounded-3xl shadow-xl">
            <div className="flex items-center justify-center gap-2 text-stone-400 text-xs font-semibold">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Sprint Focus Stopwatch</span>
            </div>

            <div className="text-5xl font-mono font-black tracking-wider text-emerald-400 py-2">
              {formatTimer(secondsLeft)}
            </div>

            <p className="text-xs text-stone-300 font-medium truncate px-4">
              {activeTaskId 
                ? dailyPlan?.tasks?.find(t => t.id === activeTaskId)?.topic 
                : 'Select any sprint on the left to start timer'}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isTimerRunning ? 'Pause Sprint' : 'Start Focus'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setSecondsLeft(45 * 60);
                }}
                className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors"
                title="Reset Stopwatch"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {activeTaskId && !dailyPlan?.tasks?.find(t => t.id === activeTaskId)?.completed && (
                <button
                  onClick={() => handleTaskCheck(activeTaskId)}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Done</span>
                </button>
              )}
            </div>

            {/* Timer Quick Duration Presets */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-400">Presets:</span>
              {[
                { label: '15m Sprint', mins: 15 },
                { label: '25m Pomodoro', mins: 25 },
                { label: '45m Deep Work', mins: 45 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setIsTimerRunning(false);
                    setSecondsLeft(p.mins * 60);
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                    secondsLeft === p.mins * 60
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity-Driven Inferred Progress Card */}
          <div className="advisor-card p-5 space-y-3 bg-white border border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Activity-Driven Progress Engine
                </h3>
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Auto-Inferred
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Skill proficiency is never claimed manually. Every task completed with the timer automatically infers <strong>+0.1 proficiency growth</strong> and triggers real-time <code>CareerEngine.calculate_readiness()</code> recalculation.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-xl text-xs border border-stone-200/70">
                <span className="text-base flex-shrink-0">⚡</span>
                <div>
                  <span className="font-bold text-stone-900">Task Completion Loop</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Complete DSA / Architecture Sprint → Auto +0.1 proficiency logged to SQLite → Placement readiness re-indexed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-xl text-xs border border-stone-200/70">
                <span className="text-base flex-shrink-0">📅</span>
                <div>
                  <span className="font-bold text-stone-900">Date-Aware Daily Queue</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Tasks are keyed to the specific calendar date (<code>{dailyPlan?.date_str || "Today"}</code>). Tomorrow starts with a fresh 0/4 queue tailored to your latest remaining skill gaps.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

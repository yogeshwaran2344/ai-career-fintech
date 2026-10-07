import React, { useState, useEffect, useMemo } from 'react';
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
  Check,
  Video,
  BookOpen,
  ExternalLink,
  Target,
  GraduationCap,
  Layers,
  Code
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STREAM_AND_SKILL_RESOURCES = {
  docker: {
    skill: "Docker Containerization",
    category: "DevOps & Deployment",
    videoTitle: "TechWorld with Nana: Docker Tutorial for Beginners",
    videoDuration: "3h 10m",
    videoUrl: "https://www.youtube.com/watch?v=3c-iBn73dDE",
    platform: "YouTube",
    courseTitle: "Dockerizing Python & ML Microservices",
    courseUrl: "https://fastapi.tiangolo.com/deployment/docker/",
    reason: "Your lowest score. Recruiters expect candidates to package apps into reproducible containers."
  },
  "deep learning": {
    skill: "Deep Learning & Neural Networks",
    category: "AI / ML Core",
    videoTitle: "Andrej Karpathy: Neural Networks: Zero to Hero",
    videoDuration: "12 hours (Series)",
    videoUrl: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ",
    platform: "YouTube",
    courseTitle: "Fast.ai Practical Deep Learning for Coders",
    courseUrl: "https://course.fast.ai/",
    reason: "Critical barrier for AI Engineer roles. Explains backprop, attention, and token embeddings from scratch."
  },
  pytorch: {
    skill: "PyTorch Framework",
    category: "AI Modeling",
    videoTitle: "freeCodeCamp: PyTorch for Deep Learning Bootcamp",
    videoDuration: "25 hours",
    videoUrl: "https://www.youtube.com/watch?v=V_xro1bcAuA",
    platform: "YouTube",
    courseTitle: "PyTorch 60-Minute Blitz & Tensors Guide",
    courseUrl: "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html",
    reason: "Used in 88% of industry AI engineering teams for inference and fine-tuning."
  },
  fastapi: {
    skill: "FastAPI & REST Architecture",
    category: "Backend Systems",
    videoTitle: "Sanjeev Thiyagarajan: Python FastAPI Full Course",
    videoDuration: "19 hours",
    videoUrl: "https://www.youtube.com/watch?v=0sOvCWFmrtA",
    platform: "YouTube",
    courseTitle: "FastAPI Async Endpoints & Pydantic Validation",
    courseUrl: "https://fastapi.tiangolo.com/tutorial/",
    reason: "Converts isolated ML scripts into production-ready web APIs with automated Swagger documentation."
  },
  dsa: {
    skill: "Data Structures & Algorithms",
    category: "Technical Screening",
    videoTitle: "NeetCode 150: Core Algorithms Explained",
    videoDuration: "Structured Track",
    videoUrl: "https://neetcode.io/practice",
    platform: "NeetCode.io",
    courseTitle: "Striver's A2Z DSA Placement Sheet",
    courseUrl: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2",
    reason: "Round 1 elimination barrier across all campus placements and product firm tests."
  },
  sql: {
    skill: "SQL & Relational Databases",
    category: "Data Querying",
    videoTitle: "Alex The Analyst: SQL Full Portfolio Course",
    videoDuration: "4h 15m",
    videoUrl: "https://www.youtube.com/watch?v=7S_tz1z_5bA",
    platform: "YouTube",
    courseTitle: "Mode Analytics: Intermediate & Window Functions",
    courseUrl: "https://mode.com/sql-tutorial/",
    reason: "Required for extracting data batches, feature engineering, and analytics."
  },
  python: {
    skill: "Python Core & Advanced OOP",
    category: "Programming Language",
    videoTitle: "Corey Schafer: Python OOP Tutorials",
    videoDuration: "2h 45m",
    videoUrl: "https://www.youtube.com/playlist?list=PL-osiE80TeTsqhI97364245750",
    platform: "YouTube",
    courseTitle: "Real Python: Memory Management & Generators",
    courseUrl: "https://realpython.com/",
    reason: "Demonstrates production code hygiene during live paired coding interviews."
  },
  "machine learning": {
    skill: "Applied Machine Learning",
    category: "AI / ML Core",
    videoTitle: "StatQuest with Josh Starmer: ML Fundamentals",
    videoDuration: "6 hours",
    videoUrl: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaZ420UGCpuL75uJWAbG",
    platform: "YouTube",
    courseTitle: "Scikit-Learn Official Pipelines Guide",
    courseUrl: "https://scikit-learn.org/stable/user_guide.html",
    reason: "Underpins classification, regression, and model performance metric evaluation."
  }
};

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
    setSecondsLeft((task.duration_minutes || 45) * 60);
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

  // Derive user's specific weak skills sorted by lowest proficiency
  const weakSkillRecommendations = useMemo(() => {
    const skillsList = profile?.skills || [];
    if (skillsList.length === 0) {
      return [
        STREAM_AND_SKILL_RESOURCES.docker,
        STREAM_AND_SKILL_RESOURCES["deep learning"],
        STREAM_AND_SKILL_RESOURCES.fastapi,
        STREAM_AND_SKILL_RESOURCES.dsa
      ];
    }

    // Sort by ascending proficiency (lowest first)
    const sorted = [...skillsList].sort((a, b) => {
      const pA = Number(a.proficiency || a.confidence || 0);
      const pB = Number(b.proficiency || b.confidence || 0);
      return pA - pB;
    });

    const recs = [];
    for (const s of sorted) {
      const sName = s.name.toLowerCase();
      for (const [key, resource] of Object.entries(STREAM_AND_SKILL_RESOURCES)) {
        if (sName.includes(key) || key.includes(sName)) {
          if (!recs.find(r => r.skill === resource.skill)) {
            recs.push({
              ...resource,
              currentScore: Number(s.proficiency || s.confidence || 2.0).toFixed(1)
            });
          }
        }
      }
      if (recs.length >= 4) break;
    }

    // If less than 3, add defaults
    if (recs.length < 3) {
      if (!recs.find(r => r.skill.includes('Docker'))) recs.push(STREAM_AND_SKILL_RESOURCES.docker);
      if (!recs.find(r => r.skill.includes('Deep Learning'))) recs.push(STREAM_AND_SKILL_RESOURCES["deep learning"]);
      if (!recs.find(r => r.skill.includes('DSA'))) recs.push(STREAM_AND_SKILL_RESOURCES.dsa);
    }

    return recs;
  }, [profile]);

  // Guaranteed fallback tasks if dailyPlan is empty
  const activeTasks = useMemo(() => {
    if (dailyPlan?.tasks && dailyPlan.tasks.length > 0) {
      return dailyPlan.tasks;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const weakest = weakSkillRecommendations[0]?.skill || "PyTorch";
    const secondWeakest = weakSkillRecommendations[1]?.skill || "Docker";

    return [
      {
        id: `${todayStr}-task-1`,
        subject: "DSA & Problem Solving",
        topic: "Binary Search & Sliding Window (NeetCode 150)",
        duration_minutes: 45,
        action_type: "DSA Practice",
        why_today: "Top filter in technical placement rounds; daily consistency builds algorithmic intuition.",
        completed: false
      },
      {
        id: `${todayStr}-task-2`,
        subject: `Core Weakness: ${weakest}`,
        topic: `${weakest} Architecture & Hands-on Implementation`,
        duration_minutes: 45,
        action_type: "Learn & Code",
        why_today: `Directly bridges your #${1} lowest evaluated skill gap for ${profile?.career_goal || 'AI Engineer'}.`,
        completed: false
      },
      {
        id: `${todayStr}-task-3`,
        subject: `Deployment Sprint: ${secondWeakest}`,
        topic: `Containerizing API endpoints with Docker compose`,
        duration_minutes: 30,
        action_type: "Hands-on Project",
        why_today: "Essential for verified portfolio evidence that recruiters inspect on GitHub.",
        completed: false
      },
      {
        id: `${todayStr}-task-4`,
        subject: "Interview Calibration",
        topic: "3 Technical MCQs + 1 System Design explanation",
        duration_minutes: 20,
        action_type: "Interview Prep",
        why_today: "Builds articulate technical communication under simulated timed pressure.",
        completed: false
      }
    ];
  }, [dailyPlan, weakSkillRecommendations, profile]);

  const completedCount = activeTasks.filter(t => t.completed).length;
  const totalTasks = activeTasks.length;
  const progressPct = Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-stone-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Daily Focus Engine
              </span>
              <span className="text-xs text-emerald-200/80 font-semibold">
                {dailyPlan?.date_str || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1.5 flex items-center gap-2">
              What Should I Do TODAY? <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
              Targeted daily progress calibrated directly to your academic stream (<strong>{profile?.academic?.branch || 'Computer Science / AI'}</strong>) and your specific skill bottlenecks.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[190px]">
            <div className="text-xs font-semibold text-emerald-200">Today's Completion</div>
            <div className="text-2xl font-black text-white mt-0.5">{progressPct}%</div>
            <div className="text-[11px] text-emerald-300 mt-1 font-bold">
              {completedCount} of {totalTasks} Focus Sprints Done
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Tasks List & Active Stopwatch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: Action Tasks */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider">
              Today's Curated Focus Sprints
            </h2>
            <span className="text-xs text-stone-500 font-bold">
              Total Budget: ~{dailyPlan?.total_estimated_minutes || 140} Mins ({profile?.preferences?.study_hours_per_day || 2}h)
            </span>
          </div>

          <div className="space-y-3">
            {activeTasks.map((task, idx) => {
              const isSelectedForTimer = activeTaskId === task.id;
              return (
                <div
                  key={task.id}
                  className={`advisor-card p-4 transition-all border ${
                    task.completed
                      ? 'bg-stone-50/80 border-stone-200 opacity-65'
                      : isSelectedForTimer
                      ? 'border-2 border-emerald-500 bg-emerald-50/20 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleTaskCheck(task.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border mt-0.5 transition-colors cursor-pointer ${
                          task.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-stone-300 hover:border-emerald-500 bg-white'
                        }`}
                        title={task.completed ? "Mark incomplete" : "Mark completed"}
                      >
                        {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                            {task.action_type}
                          </span>
                          <span className="text-xs font-bold text-stone-900">{task.subject}</span>
                        </div>
                        <h3 className={`text-sm font-black mt-1 ${task.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                          {task.topic}
                        </h3>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          💡 {task.why_today}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs font-black text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                        {task.duration_minutes} min
                      </span>
                      {!task.completed && (
                        <button
                          onClick={() => startTaskTimer(task)}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
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
        </div>

        {/* RIGHT 5 COLS: Focus Timer & Instant Progress Recalculator */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Sprint Timer Card */}
          <div className="advisor-card p-6 text-center space-y-4 bg-gradient-to-b from-stone-900 to-stone-950 text-white rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-emerald-400 px-2.5 py-1 rounded-full border border-white/10">
                Focus Stopwatch
              </span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="text-5xl font-mono font-black tracking-tight text-emerald-400">
              {formatTimer(secondsLeft)}
            </div>

            <p className="text-xs text-stone-400">
              {activeTaskId 
                ? "Active sprint in progress. Maintain single-task focus."
                : "Select any task on the left to launch the focused timer."}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-md ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-stone-950'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isTimerRunning ? 'Pause Sprint' : 'Start Sprint'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setSecondsLeft(45 * 60);
                }}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition"
                title="Reset timer to 45m"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stream Focus Banner */}
          <div className="advisor-card p-5 bg-gradient-to-br from-stone-50 to-orange-50/40 border border-orange-200/80 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Target Stream Benchmark
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Calibrated for <strong>{profile?.academic?.degree || 'B.Tech'} ({profile?.academic?.branch || 'Computer Science'})</strong> aiming for <strong>{profile?.career_goal || 'AI Engineer'}</strong>.
            </p>
            <div className="text-[11px] font-bold text-orange-700 bg-orange-100/70 px-2.5 py-1 rounded-lg">
              🎯 Target Placement Year: {profile?.academic?.target_placement_year || 2027}
            </div>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* SECTION: TARGETED LEARNING FOR WEAK AREAS & STREAM */}
      {/* ============================================================== */}
      <div className="advisor-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-orange-600" />
              <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                Targeted Learning: Curated Videos & Courses for Your Weak Areas
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Hand-picked free resources matched specifically to the skills where your evaluated proficiency is lowest.
            </p>
          </div>
          <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            Stream: {profile?.academic?.branch || 'AI & Data Science'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weakSkillRecommendations.map((rec, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/60 hover:bg-white hover:border-orange-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    {rec.skill}
                  </span>
                  <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    Weakness Priority #{idx + 1}
                  </span>
                </div>

                <p className="text-[11px] text-stone-600 leading-snug mb-3 font-medium">
                  💡 {rec.reason}
                </p>

                <div className="space-y-2">
                  {/* Video Recommendation */}
                  <a
                    href={rec.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all flex items-start justify-between group block"
                  >
                    <div className="pr-2 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                          Video Tutorial
                        </span>
                        <span className="text-[10px] text-stone-400 font-semibold">{rec.videoDuration}</span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-orange-900 transition-colors">
                        {rec.videoTitle}
                      </h4>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-600 flex-shrink-0 mt-1" />
                  </a>

                  {/* Course / Documentation */}
                  <a
                    href={rec.courseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-start justify-between group block"
                  >
                    <div className="pr-2 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                          Course / Docs
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">Free & Hands-on</span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-blue-900 transition-colors">
                        {rec.courseTitle}
                      </h4>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-blue-600 flex-shrink-0 mt-1" />
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500 font-bold">
                <span>Category: {rec.category}</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  +8% Target Readiness Boost
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

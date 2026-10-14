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
  Code,
  AlertTriangle,
  Brain,
  ShieldCheck,
  FileText,
  Briefcase,
  DollarSign,
  Activity,
  Compass,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  MessageSquare,
  Send,
  X,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

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
    videoDuration: "4h 10m",
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
    reason: "Foundational programming baseline tested across coding assessments."
  }
};

export default function TodayPlanView({ 
  profile, 
  dailyPlan, 
  onToggleTask, 
  onSkillBoost,
  onRefresh
}) {
  // Navigation tabs within Today's Plan
  const [subTab, setSubTab] = useState('decision_engine'); // decision_engine | focus_sprints | learning_decay | resources

  // Student Intelligence & Digital Twin state
  const [digitalTwin, setDigitalTwin] = useState(null);
  const [isLoadingTwin, setIsLoadingTwin] = useState(true);
  const [executingActionId, setExecutingActionId] = useState(null);
  const [cascadeModalEvents, setCascadeModalEvents] = useState(null);

  // Learning Decay & Quiz state
  const [decayData, setDecayData] = useState(null);
  const [reviewingConcept, setReviewingConcept] = useState(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);

  // AI Video Classroom & Doubt Resolution Bot state
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [doubtTopicName, setDoubtTopicName] = useState('');
  const [doubtPartTimestamp, setDoubtPartTimestamp] = useState('');
  const [doubtQuestionText, setDoubtQuestionText] = useState('');
  const [doubtHistory, setDoubtHistory] = useState([]);
  const [isResolvingDoubt, setIsResolvingDoubt] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Stopwatch timer state
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Load Digital Twin & Learning Decay
  useEffect(() => {
    loadIntelligenceData();
  }, [profile]);

  const loadIntelligenceData = async () => {
    setIsLoadingTwin(true);
    try {
      const [twinRes, decayRes] = await Promise.all([
        api.getDigitalTwin().catch(() => null),
        api.getLearningDecayStatus().catch(() => null)
      ]);
      if (twinRes) setDigitalTwin(twinRes);
      if (decayRes) setDecayData(decayRes);
    } catch (err) {
      console.warn('Student intelligence fetch notice:', err);
    } finally {
      setIsLoadingTwin(false);
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  const startTaskTimer = (task) => {
    setActiveTaskId(task.id);
    setSecondsLeft((task.duration_minutes || 45) * 60);
    setIsTimerRunning(true);
    setSubTab('focus_sprints');
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
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

  // Execute Dynamic Cascade Action (🔴 1 to 🟢 5)
  const handleExecuteCascadeAction = async (action) => {
    setExecutingActionId(action.id);
    try {
      const res = await api.completeStudentAction(action.id, action.action_type, action.target_payload);
      if (res && res.cascade_events) {
        setCascadeModalEvents(res.cascade_events);
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      }
      // Reload intelligence & trigger parent refresh
      await loadIntelligenceData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to execute cascade action:', err);
    } finally {
      setExecutingActionId(null);
    }
  };

  // Review a decaying concept (1-click Ebbinghaus boost)
  const handleReviewConcept = async (conceptName) => {
    setReviewingConcept(conceptName);
    try {
      const res = await api.reviewDecayConcept(conceptName, 1.0);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      await loadIntelligenceData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to review decay concept:', err);
    } finally {
      setReviewingConcept(null);
    }
  };

  // Video URL to YouTube Embed conversion helper
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
    }
    return null;
  };

  // Open interactive AI Video Classroom & Doubt Resolver
  const handleOpenVideoClassroom = (actionOrItem) => {
    const topic = actionOrItem.target_payload?.concept_name || actionOrItem.title || 'Technical Concept';
    const videoUrl = actionOrItem.video_url || 'https://www.youtube.com/watch?v=fAAZixBzIAI';
    const videoTitle = actionOrItem.video_title || `${topic} Masterclass & Code Implementation`;
    const duration = actionOrItem.video_duration || '35 mins';
    const platform = actionOrItem.video_platform || 'YouTube';

    setActiveVideoModal({
      action: actionOrItem,
      topic,
      videoUrl,
      videoTitle,
      duration,
      platform
    });
    setDoubtTopicName(topic);
    setDoubtPartTimestamp('');
    setDoubtQuestionText('');
    setDoubtHistory([]);
  };

  // Submit a specific doubt from any part / timestamp to the AI Bot
  const handleAskVideoDoubt = async (presetQuestion = null, presetPart = null) => {
    const topic = doubtTopicName.trim() || activeVideoModal?.topic || 'Core Concept';
    const part = presetPart || doubtPartTimestamp.trim() || 'the main concept';
    const question = presetQuestion || doubtQuestionText.trim();
    if (!question) return;

    try {
      setIsResolvingDoubt(true);
      const userMsg = {
        role: 'user',
        part,
        text: question,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setDoubtHistory((prev) => [...prev, userMsg]);
      setDoubtQuestionText('');

      const res = await api.resolveVideoDoubt(
        topic,
        part,
        question,
        activeVideoModal?.videoUrl,
        doubtHistory.map((h) => ({ role: h.role, content: h.text }))
      );

      const botMsg = {
        role: 'assistant',
        text: res.explanation,
        responseObj: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setDoubtHistory((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to resolve video doubt:', err);
      const errMsg = {
        role: 'assistant',
        text: 'I could not connect to the AI model right now. Here is the key rule: trace execution step-by-step from the base condition and verify boundary inputs.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setDoubtHistory((prev) => [...prev, errMsg]);
    } finally {
      setIsResolvingDoubt(false);
    }
  };

  // Complete action from inside Video Classroom
  const handleCompleteActionFromModal = async () => {
    if (!activeVideoModal?.action) return;
    const action = activeVideoModal.action;
    await handleExecuteCascadeAction(action);
    setActiveVideoModal(null);
  };

  // Open interactive retention quiz modal
  const handleOpenConceptQuiz = async (conceptName) => {
    setActiveQuiz({
      concept_name: conceptName,
      questions: [],
      selectedAnswers: {},
      showHints: {},
      loading: true,
      submitting: false,
      result: null,
      error: null
    });
    setQuizModalOpen(true);
    try {
      const data = await api.getConceptQuiz(conceptName);
      setActiveQuiz(prev => ({
        ...prev,
        loading: false,
        questions: data?.questions || []
      }));
    } catch (err) {
      console.error('Failed to load concept quiz:', err);
      setActiveQuiz(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch quiz questions. Please ensure the backend is connected.'
      }));
    }
  };

  const handleSelectQuizAnswer = (qId, optionText) => {
    setActiveQuiz(prev => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [qId]: optionText
      }
    }));
  };

  const toggleQuizHint = (qId) => {
    setActiveQuiz(prev => ({
      ...prev,
      showHints: {
        ...prev.showHints,
        [qId]: !prev.showHints[qId]
      }
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !activeQuiz.questions.length) return;
    setActiveQuiz(prev => ({ ...prev, submitting: true, error: null }));
    try {
      const answersPayload = activeQuiz.questions.map(q => ({
        question_id: q.id,
        selected_answer: activeQuiz.selectedAnswers[q.id] || ''
      }));

      const res = await api.submitConceptQuiz({
        concept_name: activeQuiz.concept_name,
        answers: answersPayload,
        study_duration_minutes: 15
      });

      setActiveQuiz(prev => ({
        ...prev,
        submitting: false,
        result: res
      }));

      if (res?.passed) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      }

      await loadIntelligenceData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to submit concept quiz:', err);
      setActiveQuiz(prev => ({
        ...prev,
        submitting: false,
        error: 'Quiz evaluation failed. Please try again.'
      }));
    }
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

  const getPriorityBadge = (pLevel) => {
    switch(pLevel) {
      case 'CRITICAL':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', icon: AlertTriangle };
      case 'HIGH':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', icon: Zap };
      case 'OPPORTUNITY':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: Briefcase };
      case 'PREPARATION':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', icon: GraduationCap };
      default:
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: ShieldCheck };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* ============================================================== */}
      {/* MASTER INTELLIGENCE HEADER BANNER */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-emerald-400" />
                Autonomous Student Intelligence Engine
              </span>
              <span className="text-xs text-stone-400 font-medium">
                {dailyPlan?.date_str || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              What Should I Do Next? <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            
            <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
              {digitalTwin?.summary_analysis || (
                `Cross-evaluating your ${profile?.career_goal || 'AI Engineer'} goal, memory retention curve, resume ATS score, job vacancies, and financial runway into ranked, cascading actions.`
              )}
            </p>
          </div>

          {/* Unified Intelligence Health Score */}
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 self-start lg:self-center">
            <div className="text-center pr-3 border-r border-white/10">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Intelligence Score</span>
              <div className="text-3xl font-black text-emerald-400 mt-0.5">
                {digitalTwin?.overall_health_score || 68}
                <span className="text-sm font-normal text-stone-400">/100</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300">
                {digitalTwin?.overall_health_score >= 75 ? 'Placement Ready' : 'Optimization Active'}
              </span>
            </div>

            <button
              onClick={loadIntelligenceData}
              disabled={isLoadingTwin}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 transition-colors cursor-pointer"
              title="Recalculate live engine telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingTwin ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Real-time Pillar Telemetry Strip */}
        {digitalTwin?.pillars && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-5 mt-5 border-t border-white/10 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-stone-400 block font-bold">1. Career Readiness</span>
              <span className="text-sm font-black text-white">{digitalTwin.pillars.career.readiness_pct}%</span>
              <span className="text-[10px] text-emerald-400 block font-semibold">{digitalTwin.pillars.career.goal}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-stone-400 block font-bold">2. Memory Retention</span>
              <span className={`text-sm font-black ${digitalTwin.pillars.learning_decay.critical_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {digitalTwin.pillars.learning_decay.overall_retention}%
              </span>
              <span className="text-[10px] text-stone-300 block font-semibold">
                {digitalTwin.pillars.learning_decay.critical_count} critical decay
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-stone-400 block font-bold">3. Resume ATS</span>
              <span className="text-sm font-black text-white">{digitalTwin.pillars.resume_ats.ats_score}/100</span>
              <span className="text-[10px] text-stone-300 block font-semibold">
                {digitalTwin.pillars.resume_ats.projects_count} verified projects
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-stone-400 block font-bold">4. Financial Runway</span>
              <span className="text-sm font-black text-amber-300">{digitalTwin.pillars.finances.runway_months} mo</span>
              <span className="text-[10px] text-stone-300 block font-semibold truncate">
                ₹{digitalTwin.pillars.finances.emergency_buffer?.toLocaleString()} buffer
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-stone-400 block font-bold">5. Higher Ed / GRE</span>
              <span className="text-sm font-black text-purple-300">{digitalTwin.pillars.study_abroad.target_gre}</span>
              <span className="text-[10px] text-stone-300 block font-semibold truncate">US / Germany target</span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* SUB-NAVIGATION TABS */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setSubTab('decision_engine')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'decision_engine'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>AI Decision Engine (Ranked Actions)</span>
          <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">5</span>
        </button>

        <button
          onClick={() => setSubTab('learning_decay')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'learning_decay'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Ebbinghaus Memory Decay Radar</span>
          {decayData?.critical_concepts_count > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {decayData.critical_concepts_count} Urgent
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('focus_sprints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'focus_sprints'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Focus Sprints & Stopwatch</span>
          <span className="text-[10px] text-stone-400">({progressPct}%)</span>
        </button>

        <button
          onClick={() => setSubTab('resources')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'resources'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Weakness Videos & Courses</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: AI DECISION ENGINE ("WHAT SHOULD I DO NEXT?") */}
      {/* ============================================================== */}
      {subTab === 'decision_engine' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <span>Top Ranked Next Best Actions</span>
                <span className="text-[11px] font-bold text-stone-400 lowercase">(sorted by urgency & cascade impact)</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Every action executed below propagates live changes across your Skill Graph, Resume ATS, Job Matches, and Finances.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start">
              ⚡ 1-Click Execution Enabled
            </span>
          </div>

          <div className="space-y-4">
            {digitalTwin?.next_best_actions?.map((action) => {
              const badge = getPriorityBadge(action.priority_level);
              const BadgeIcon = badge.icon;
              const isExecuting = executingActionId === action.id;

              return (
                <div
                  key={action.id}
                  className={`advisor-card p-5 transition-all border ${
                    action.completed 
                      ? 'bg-stone-50/70 border-stone-200 opacity-75' 
                      : 'bg-white border-stone-200 hover:border-emerald-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Priority Info */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.bg}`}>
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                          Priority #{action.priority} — {action.priority_level}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                          {action.category}
                        </span>
                        {action.completed && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Completed
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-stone-900">
                        {action.title}
                      </h3>

                      <p className="text-xs text-stone-600 leading-relaxed font-medium">
                        {action.description}
                      </p>

                      {/* Why Now & Impact Box */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                          <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider flex items-center gap-1">
                            <span>🎯 Why Now?</span>
                          </span>
                          <p className="text-[11px] text-stone-700 leading-snug">
                            {action.why_now}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                          <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                            <span>System Cascade Impact</span>
                          </span>
                          <p className="text-[11px] text-emerald-900 font-semibold leading-snug">
                            {action.impact}
                          </p>
                        </div>
                      </div>

                      {/* Video Masterclass Preview Bar */}
                      {action.video_url && (
                        <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-indigo-50/90 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
                              <Video className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-200/80 text-indigo-900">
                                  Video Tutorial & AI Doubt Bot
                                </span>
                                <span className="text-[10px] text-stone-500 font-semibold">{action.video_duration || '35 mins'} • {action.video_platform || 'YouTube'}</span>
                              </div>
                              <div className="text-xs font-bold text-stone-900 truncate mt-0.5">{action.video_title}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenVideoClassroom(action)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Watch & Ask Doubts</span>
                            <Sparkles className="w-3 h-3 text-amber-300" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2 flex-shrink-0 pt-2 md:pt-0">
                      <button
                        onClick={() => handleOpenVideoClassroom(action)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Watch video tutorial and resolve doubts with AI Tutor"
                      >
                        <Video className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Watch Video</span>
                      </button>

                      <button
                        onClick={() => handleExecuteCascadeAction(action)}
                        disabled={isExecuting || action.completed}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                          action.completed
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                        }`}
                      >
                        {isExecuting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Cascading...</span>
                          </>
                        ) : action.completed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Executed</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                            <span>{action.cta_label}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Cascade Audit Log */}
          {digitalTwin?.active_cascade_log && (
            <div className="advisor-card p-4 bg-stone-50/80 border border-stone-200/90 rounded-2xl space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  Live System Cascade Activity Log
                </h4>
              </div>
              <div className="space-y-1 text-[11px] font-mono text-stone-600">
                {digitalTwin.active_cascade_log.map((log, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: EBBINGHAUS MEMORY DECAY RADAR */}
      {/* ============================================================== */}
      {subTab === 'learning_decay' && (
        <div className="space-y-5">
          {/* Theory / Formula Banner */}
          <div className="advisor-card p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl space-y-2 border border-blue-400/30">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-300" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Ebbinghaus Spaced Repetition Retention Engine
              </h3>
            </div>
            <p className="text-xs text-blue-100/90 leading-relaxed font-medium">
              Human memory decays exponentially according to <span className="font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded text-blue-200">R(t) = exp(-t / S) × 100%</span>.
              Elevare tracks when you last practiced each core algorithmic and architectural concept. Whenever retention falls below <strong>60%</strong>, our engine schedules an urgent recall drill to lock the neural pathway.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px]">
              <span className="bg-rose-500/20 text-rose-200 border border-rose-400/30 px-2.5 py-0.5 rounded-full font-bold">
                Critical (&lt;60%): Urgent Revision Today
              </span>
              <span className="bg-amber-500/20 text-amber-200 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold">
                Warning (60-75%): Review in 24h
              </span>
              <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                Optimal / Mastered (75-100%): Stable Long-term Trace
              </span>
            </div>
          </div>

          {/* Weak Topics Watchlist Banner */}
          {decayData?.weak_topics_list && decayData.weak_topics_list.length > 0 && (
            <div className="advisor-card p-4.5 bg-rose-50 border border-rose-200/90 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-200 text-rose-800">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black uppercase text-rose-900 tracking-wider">
                      Weak Topics Priority Watchlist ({decayData.weak_topics_list.length} Concepts Identified)
                    </h4>
                    <span className="text-[11px] text-rose-700 font-medium">
                      Concepts with recent score &lt;70% or rapid forgetting decay. Prioritized for spaced re-testing.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {decayData.weak_topics_list.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => handleOpenConceptQuiz(topic)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 text-xs font-extrabold transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <span>{topic}</span>
                    <span className="text-[10px] bg-rose-800 text-white px-2 py-0.5 rounded-md font-bold">
                      Take Recall Quiz →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decayData?.all_concepts?.map((c, idx) => {
              const isCrit = c.decay_status === 'CRITICAL';
              const isWarn = c.decay_status === 'WARNING';
              const isReviewing = reviewingConcept === c.concept_name;

              return (
                <div
                  key={idx}
                  className={`advisor-card p-4.5 rounded-2xl border transition-all space-y-3 ${
                    isCrit 
                      ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400' 
                      : isWarn 
                      ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400' 
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isCrit ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          isWarn ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {c.decay_status}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                          {c.category}
                        </span>
                        {c.is_weak_topic && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                            Weak Topic
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-stone-900 mt-1.5">
                        {c.concept_name}
                      </h4>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-stone-500 font-bold block uppercase">Retention</span>
                      <div className={`text-xl font-black ${
                        isCrit ? 'text-rose-600' : isWarn ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {c.retention_pct}%
                      </div>
                    </div>
                  </div>

                  {/* Retention Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCrit ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, c.retention_pct))}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                      <span>Last reviewed: {c.days_since_review} days ago</span>
                      <span>Next test: {c.next_scheduled_review || `${c.next_scheduled_days || 2}d`}</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 font-medium leading-snug">
                    {c.recommended_action}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenConceptQuiz(c.concept_name)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Brain className="w-3.5 h-3.5 text-blue-700" />
                      <span>Recall Quiz</span>
                    </button>

                    <button
                      onClick={() => handleReviewConcept(c.concept_name)}
                      disabled={isReviewing}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isReviewing ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Boosting...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-amber-400 fill-current" />
                          <span>Practice (+100%)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: FOCUS SPRINTS & STOPWATCH */}
      {/* ============================================================== */}
      {subTab === 'focus_sprints' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: Action Tasks */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Curated Focus Sprints
              </h2>
              <span className="text-xs text-stone-500 font-bold">
                Total Budget: ~{dailyPlan?.total_estimated_minutes || 140} Mins ({profile?.preferences?.study_hours_per_day || 2}h)
              </span>
            </div>

            <div className="space-y-3">
              {activeTasks.map((task) => {
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

          {/* RIGHT 5 COLS: Focus Timer */}
          <div className="lg:col-span-5 space-y-4">
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
                    const matched = dailyPlan?.tasks?.find(t => t.id === activeTaskId);
                    setSecondsLeft((matched?.duration_minutes || 45) * 60);
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition"
                  title="Reset timer to task duration"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

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
      )}

      {/* ============================================================== */}
      {/* TAB 4: WEAKNESS VIDEOS & COURSES */}
      {/* ============================================================== */}
      {subTab === 'resources' && (
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
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all flex items-start justify-between group">
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
                        <div className="pt-1.5 flex items-center gap-2">
                          <button
                            onClick={() => handleOpenVideoClassroom({
                              title: rec.skill,
                              video_url: rec.videoUrl,
                              video_title: rec.videoTitle,
                              video_duration: rec.videoDuration,
                              video_platform: rec.platform
                            })}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Watch & Ask AI</span>
                            <Sparkles className="w-3 h-3 text-amber-300" />
                          </button>
                          <a
                            href={rec.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1"
                          >
                            <span>Open URL</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

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
      )}

      {/* ============================================================== */}
      {/* CASCADE RESULTS MODAL */}
      {/* ============================================================== */}
      {cascadeModalEvents && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </span>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Dynamic Cascade Completed!
                  </h3>
                  <span className="text-xs text-stone-500">Autonomous multi-module synchronization</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <span className="text-xs font-black uppercase text-emerald-900 tracking-wider block">
                Triggered System Updates:
              </span>
              <div className="space-y-1.5 text-xs text-stone-800 font-medium">
                {cascadeModalEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                    <span>{evt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                onClick={() => {
                  setCascadeModalEvents(null);
                  if (digitalTwin?.next_best_actions?.[0]) {
                    handleOpenVideoClassroom(digitalTwin.next_best_actions[0]);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                <span>Watch Video & Ask AI Doubts 🎥</span>
              </button>

              <button
                onClick={() => setCascadeModalEvents(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Done & Return to AI Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* AI VIDEO CLASSROOM & TIMESTAMP DOUBT RESOLVER MODAL */}
      {/* ============================================================== */}
      {activeVideoModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-indigo-500/30 max-h-[92vh] overflow-y-auto space-y-5 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 tracking-wider">
                      Interactive Video Classroom
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> AI Timestamp Doubt Bot Active
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 mt-0.5">
                    {activeVideoModal.videoTitle || activeVideoModal.topic}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Card */}
            <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 shadow-md">
              {getYouTubeEmbedUrl(activeVideoModal.videoUrl) ? (
                <div className="relative w-full aspect-video">
                  <iframe
                    src={getYouTubeEmbedUrl(activeVideoModal.videoUrl)}
                    title={activeVideoModal.videoTitle}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-white space-y-3">
                  <Video className="w-12 h-12 text-indigo-400 mx-auto" />
                  <h4 className="text-sm font-bold">{activeVideoModal.videoTitle}</h4>
                  <p className="text-xs text-stone-400 max-w-md mx-auto">
                    Click the official link below to open the complete video lecture on {activeVideoModal.platform || 'YouTube'}.
                  </p>
                </div>
              )}

              {/* Video Controls & Direct Link Bar */}
              <div className="p-3 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-stone-300">
                  <span>⏱️ Duration: <strong>{activeVideoModal.duration || '35 mins'}</strong></span>
                  <span>📺 Platform: <strong>{activeVideoModal.platform || 'YouTube'}</strong></span>
                </div>

                <a
                  href={activeVideoModal.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm text-xs"
                >
                  <span>Watch on YouTube in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* AI Doubt Resolution Engine Section */}
            <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white rounded-3xl p-5 border border-indigo-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                      AI Video Doubt Resolver
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.2 rounded-full">
                        Powered by Google Gemini / Engineering Mentor
                      </span>
                    </h4>
                    <p className="text-xs text-stone-500">
                      Didn't understand a part? Enter the topic name & timestamp below and the AI model will explain it!
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      1. Topic Name (Editable):
                    </label>
                    <input
                      type="text"
                      value={doubtTopicName}
                      onChange={(e) => setDoubtTopicName(e.target.value)}
                      placeholder="e.g. Binary Trees & DFS, Machine Learning, Docker"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-900 bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      2. Which Part / Timestamp didn't you understand?
                    </label>
                    <input
                      type="text"
                      value={doubtPartTimestamp}
                      onChange={(e) => setDoubtPartTimestamp(e.target.value)}
                      placeholder="e.g. At 14:20 during backtracking, or Base condition logic"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-900 bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    3. What is your specific doubt or question?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={doubtQuestionText}
                      onChange={(e) => setDoubtQuestionText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAskVideoDoubt();
                      }}
                      placeholder="e.g. Why do we return 1 + max(left, right)? Where does the +1 come from?"
                      className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-900 bg-white focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      onClick={() => handleAskVideoDoubt()}
                      disabled={isResolvingDoubt || !doubtQuestionText.trim()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {isResolvingDoubt ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Explaining...</span>
                        </>
                      ) : (
                        <>
                          <span>Ask AI</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Preset Doubt Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-stone-400">Quick Doubts:</span>
                  {[
                    { label: "💡 Explain the Base Condition", q: "Why is the base condition needed and what happens if we omit it?", part: "Base condition check" },
                    { label: "⏱️ What happens at this timestamp?", q: "Can you explain step by step what the instructor is doing at this exact timestamp?", part: doubtPartTimestamp || "10:30" },
                    { label: "🧠 Give me a simple analogy", q: "Can you give me a simple real-life analogy so I never forget this concept?", part: "Core concept" },
                    { label: "💻 Show code with line-by-line breakdown", q: "Can you show the clean code implementation with line-by-line comments?", part: "Implementation" },
                    { label: "⚡ Why is Time Complexity O(N)?", q: "Why is the time complexity and space complexity calculated this way?", part: "Complexity analysis" }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskVideoDoubt(chip.q, chip.part)}
                      disabled={isResolvingDoubt}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-indigo-200/80 hover:bg-indigo-50 text-indigo-900 transition cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Stream / Explanations History */}
              {doubtHistory.length > 0 && (
                <div className="mt-4 space-y-3 pt-3 border-t border-indigo-100">
                  {doubtHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl text-xs transition-all ${
                        msg.role === 'user'
                          ? 'bg-stone-900 text-white ml-auto max-w-xl shadow-sm'
                          : 'bg-white border border-indigo-100 shadow-sm space-y-3'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <div>
                          <div className="text-[10px] text-stone-400 flex items-center justify-between mb-1">
                            <span>Part: {msg.part}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p className="font-semibold">{msg.text}</p>
                        </div>
                      ) : (
                        <div className="space-y-3 text-stone-800">
                          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                            <div className="flex items-center gap-1.5 text-indigo-700 font-black">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span>AI Engineering Mentor Explanation</span>
                            </div>
                            <span className="text-[10px] text-stone-400">{msg.timestamp}</span>
                          </div>

                          {/* Core Explanation */}
                          <div className="whitespace-pre-line leading-relaxed text-stone-700">
                            {msg.text}
                          </div>

                          {/* Response Object Details */}
                          {msg.responseObj && (
                            <>
                              {/* Analogy Box */}
                              {msg.responseObj.mental_model_or_analogy && (
                                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900">
                                  <strong className="block text-[11px] font-black uppercase text-amber-800 mb-1">
                                    🧠 Intuitive Analogy:
                                  </strong>
                                  <p className="text-xs leading-relaxed">{msg.responseObj.mental_model_or_analogy}</p>
                                </div>
                              )}

                              {/* Step-by-Step Breakdown */}
                              {msg.responseObj.step_by_step_breakdown?.length > 0 && (
                                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                                  <strong className="block text-[11px] font-black uppercase text-stone-700">
                                    📋 Step-by-Step Execution Trace:
                                  </strong>
                                  <ul className="space-y-1 text-[11px] text-stone-700">
                                    {msg.responseObj.step_by_step_breakdown.map((s, sIdx) => (
                                      <li key={sIdx} className="flex items-start gap-1.5">
                                        <span className="text-indigo-600 font-bold">•</span>
                                        <span>{s}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Code / Visual Snippet */}
                              {msg.responseObj.code_or_visual_snippet && (
                                <div className="rounded-xl overflow-hidden border border-stone-800 bg-stone-900 text-stone-100 p-3 font-mono text-[11px]">
                                  <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1.5 border-b border-stone-800 pb-1">
                                    <span>Code / Logic Trace</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(msg.responseObj.code_or_visual_snippet);
                                        setCopiedSnippet(true);
                                        setTimeout(() => setCopiedSnippet(false), 2000);
                                      }}
                                      className="flex items-center gap-1 hover:text-white cursor-pointer"
                                    >
                                      <Copy className="w-3 h-3" />
                                      <span>{copiedSnippet ? 'Copied!' : 'Copy Code'}</span>
                                    </button>
                                  </div>
                                  <pre className="overflow-x-auto whitespace-pre leading-relaxed">
                                    {msg.responseObj.code_or_visual_snippet}
                                  </pre>
                                </div>
                              )}

                              {/* Key Takeaway */}
                              {msg.responseObj.key_takeaway && (
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                                  <strong className="block text-[11px] font-black uppercase text-emerald-800 mb-0.5">
                                    ⭐ Golden Takeaway Rule:
                                  </strong>
                                  <p className="text-xs font-semibold">{msg.responseObj.key_takeaway}</p>
                                </div>
                              )}

                              {/* Follow-up Question Chips */}
                              {msg.responseObj.suggested_followups?.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[10px] font-bold text-stone-400">Ask Next:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {msg.responseObj.suggested_followups.map((fQ, fIdx) => (
                                      <button
                                        key={fIdx}
                                        onClick={() => handleAskVideoDoubt(fQ, msg.responseObj.timestamp_or_part)}
                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                                      >
                                        💬 {fQ}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-stone-500">
                Watching and understanding concepts builds permanent long-term retention.
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer flex-1 sm:flex-initial"
                >
                  Close Video
                </button>

                {activeVideoModal.action && !activeVideoModal.action.completed && (
                  <button
                    onClick={handleCompleteActionFromModal}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md flex-1 sm:flex-initial"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Understood! Mark Action Completed</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* RETENTION RECALL QUIZ MODAL */}
      {/* ============================================================== */}
      {quizModalOpen && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-blue-500/30 max-h-[90vh] overflow-y-auto space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
                  <Brain className="w-5 h-5 text-blue-700" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Spaced Retention Drill
                    </span>
                    <span className="text-[10px] font-bold text-stone-400">
                      Ebbinghaus Memory Verification
                    </span>
                  </div>
                  <h3 className="text-base font-black text-stone-900 mt-0.5">
                    {activeQuiz?.concept_name || 'Concept Recall Quiz'}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setQuizModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Loading State */}
            {activeQuiz?.loading && (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                <p className="text-xs text-stone-500 font-bold">
                  Synthesizing conceptual verification questions...
                </p>
              </div>
            )}

            {/* Error State */}
            {activeQuiz?.error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-2">
                <div className="flex items-center gap-2 font-black">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Unable to complete quiz</span>
                </div>
                <p>{activeQuiz.error}</p>
                <button
                  onClick={() => setQuizModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 text-white font-bold"
                >
                  Close
                </button>
              </div>
            )}

            {/* Active Quiz Questions (Pre-submission) */}
            {!activeQuiz?.loading && !activeQuiz?.result && activeQuiz?.questions?.length > 0 && (
              <div className="space-y-5">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 text-xs text-blue-900">
                  <span className="font-bold">Instructions:</span> Answer all questions below. Scoring &ge;70% locks the memory trace for <strong>{activeQuiz?.questions?.length > 1 ? '7 to 14 days' : '2 to 7 days'}</strong> and resets your retention to 100%.
                </div>

                <div className="space-y-4">
                  {activeQuiz.questions.map((q, qIndex) => {
                    const selected = activeQuiz.selectedAnswers[q.id];
                    const showHint = activeQuiz.showHints[q.id];

                    return (
                      <div key={q.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/40 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                            Q{qIndex + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-stone-900 leading-snug">
                              {q.question}
                            </h4>
                          </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-1.5 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selected === opt;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectQuizAnswer(q.id, opt)}
                                className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                                  isChosen 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-semibold' 
                                    : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-200'
                                }`}
                              >
                                <span className="leading-snug">{opt}</span>
                                {isChosen && <Check className="w-4 h-4 text-white flex-shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Hint Accordion */}
                        {q.hint && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => toggleQuizHint(q.id)}
                              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{showHint ? 'Hide Hint ▴' : 'Need a Hint? 💡'}</span>
                            </button>
                            {showHint && (
                              <div className="mt-1.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 italic">
                                {q.hint}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <span className="text-xs text-stone-500 font-medium">
                    Answered: {Object.keys(activeQuiz.selectedAnswers).length} of {activeQuiz.questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={activeQuiz.submitting || Object.keys(activeQuiz.selectedAnswers).length < activeQuiz.questions.length}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {activeQuiz.submitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Submit Answers</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Post-submission Results Screen */}
            {activeQuiz?.result && (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border ${
                  activeQuiz.result.passed 
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
                    : 'bg-rose-50/80 border-rose-300 text-rose-950'
                } space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xl ${activeQuiz.result.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {activeQuiz.result.passed ? '🎉' : '⚠️'}
                      </span>
                      <h4 className="text-base font-black">
                        {activeQuiz.result.passed ? 'Recall Succeeded: 100% Retention Restored!' : 'Review Incomplete: Focus Revision Needed'}
                      </h4>
                    </div>
                    <span className="text-base font-black px-2.5 py-1 rounded-xl bg-white shadow-2xs">
                      {activeQuiz.result.score_pct}% Score
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed">
                    {activeQuiz.result.passed 
                      ? `Excellent performance! Your neural trace for "${activeQuiz.concept_name}" has been stabilized. Next spaced repetition is scheduled in ${activeQuiz.result.next_scheduled_days || 7} days (${activeQuiz.result.next_scheduled_review}).` 
                      : `You scored below 70%. Spaced repetition interval has been contracted to 1 day to prevent further knowledge decay.`}
                  </p>
                </div>

                {/* Question Evaluations */}
                <div className="space-y-3">
                  <h5 className="text-xs font-black uppercase text-stone-700 tracking-wider">
                    Detailed Verification Breakdown:
                  </h5>
                  {activeQuiz.result.question_evaluations?.map((ev, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-stone-900">Q{idx + 1}: {ev.question}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          ev.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {ev.is_correct ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div><strong className="text-stone-700">Your Answer:</strong> <span className={ev.is_correct ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>{ev.selected_answer || '(None)'}</span></div>
                        {!ev.is_correct && (
                          <div><strong className="text-stone-700">Correct Answer:</strong> <span className="text-stone-900 font-semibold">{ev.correct_answer}</span></div>
                        )}
                        <div className="p-2 rounded-lg bg-white border border-stone-200/80 text-stone-600 italic mt-1">
                          💡 <strong>Explanation:</strong> {ev.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setQuizModalOpen(false);
                      setActiveQuiz(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Done & Return to Learning Radar
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

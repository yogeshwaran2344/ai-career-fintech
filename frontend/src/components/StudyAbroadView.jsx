import React, { useState, useEffect } from 'react';
import {
  Globe,
  GraduationCap,
  BookOpen,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  Circle,
  ExternalLink,
  Award,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Clock,
  Layers,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Building,
  MapPin,
  TrendingUp,
  Percent,
  ShieldCheck,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  Mic,
  PenTool,
  BarChart3,
  Flame,
  Target,
  Trophy,
  Sliders,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { api } from '../api';

export default function StudyAbroadView({ profile, onNavigate }) {
  // Main view navigation tab
  const [activeTab, setActiveTab] = useState('generator'); 
  // tabs: 'readiness', 'overview', 'generator', 'mock', 'mistakes', 'analytics', 'writing_speaking', 'universities', 'roi', 'sop', 'roadmap'

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingSelection, setSavingSelection] = useState(false);

  // Global Readiness & Budget State
  const [readinessData, setReadinessData] = useState(null);
  const [prepBudgetData, setPrepBudgetData] = useState(null);

  // Form selections for destination & program
  const [selectedCountries, setSelectedCountries] = useState(['USA', 'DEU', 'CAN']);
  const [selectedProgram, setSelectedProgram] = useState('MS in Artificial Intelligence / Computer Science');
  const [selectedIntake, setSelectedIntake] = useState('Fall 2027');

  // ==================== PRACTICE SET GENERATOR STATE ====================
  const [examSelect, setExamSelect] = useState('GRE');
  const [sectionSelect, setSectionSelect] = useState('QUANTITATIVE');
  const [topicSelect, setTopicSelect] = useState('All Topics');
  const [difficultySelect, setDifficultySelect] = useState('All');
  const [questionCountSelect, setQuestionCountSelect] = useState(10);
  const [generatingSet, setGeneratingSet] = useState(false);
  const [activePracticeSet, setActivePracticeSet] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceTimeRemaining, setPracticeTimeRemaining] = useState(900); // 15 mins
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [practiceEvaluation, setPracticeEvaluation] = useState(null);
  const [showSolutionId, setShowSolutionId] = useState(null);

  // ==================== FULL-LENGTH MOCK SIMULATOR STATE ====================
  const [mockBlueprint, setMockBlueprint] = useState(null);
  const [loadingMock, setLoadingMock] = useState(false);
  const [activeMockSectionIdx, setActiveMockSectionIdx] = useState(0);
  const [activeMockQuestionIdx, setActiveMockQuestionIdx] = useState(0);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockTimeRemaining, setMockTimeRemaining] = useState(5400); // 90 mins
  const [mockInProgress, setMockInProgress] = useState(false);
  const [submittingMock, setSubmittingMock] = useState(false);
  const [mockEvaluation, setMockEvaluation] = useState(null);

  // ==================== MISTAKE BANK STATE ====================
  const [mistakeBank, setMistakeBank] = useState(null);
  const [mistakeFilterTopic, setMistakeFilterTopic] = useState('All');
  const [practicingMistakes, setPracticingMistakes] = useState(false);
  const [activeMistakeIndex, setActiveMistakeIndex] = useState(0);
  const [mistakeAnswers, setMistakeAnswers] = useState({});

  // ==================== EXAM ANALYTICS STATE ====================
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // ==================== AI WRITING & SPEAKING EVALUATOR STATE ====================
  const [writingExam, setWritingExam] = useState('GRE');
  const [writingPrompt, setWritingPrompt] = useState(
    'Governments should place greater focus on funding foundational scientific inquiries with uncertain economic payback than applied commercial technologies.'
  );
  const [essayText, setEssayText] = useState('');
  const [evaluatingWriting, setEvaluatingWriting] = useState(false);
  const [writingResult, setWritingResult] = useState(null);

  const [speakingCueTopic, setSpeakingCueTopic] = useState(
    'Describe a challenging engineering or research obstacle you resolved under pressure.'
  );
  const [speakingTranscript, setSpeakingTranscript] = useState('');
  const [evaluatingSpeaking, setEvaluatingSpeaking] = useState(false);
  const [speakingResult, setSpeakingResult] = useState(null);

  // ==================== SOP / LOR STATE ====================
  const [sopUniversity, setSopUniversity] = useState('Carnegie Mellon University');
  const [sopProgram, setSopProgram] = useState('MS in Artificial Intelligence & Innovation');
  const [sopResearch, setSopResearch] = useState('Deep Learning Systems & Distributed AI');
  const [sopLab, setSopLab] = useState('AI & Autonomous Systems Lab');
  const [generatingSop, setGeneratingSop] = useState(false);
  const [sopResult, setSopResult] = useState(null);
  const [sopActiveSubtab, setSopActiveSubtab] = useState('sop');
  const [copiedKey, setCopiedKey] = useState(null);

  // University tier filter
  const [tierFilter, setTierFilter] = useState('ALL');

  // Fetch initial data
  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudyAbroadOverview();
      setData(res);
      if (res.target_countries) setSelectedCountries(res.target_countries);
      if (res.target_program) setSelectedProgram(res.target_program);
      if (res.target_intake) setSelectedIntake(res.target_intake);
      if (res.shortlisted_universities && res.shortlisted_universities.length > 0) {
        setSopUniversity(res.shortlisted_universities[0].university_name);
        setSopProgram(res.shortlisted_universities[0].program_name);
      }

      // Fetch readiness & budget in parallel
      const [readiness, budget, analytics, mistakes] = await Promise.all([
        api.getMastersReadinessScore().catch(() => null),
        api.getStudyAbroadPrepBudget().catch(() => null),
        api.getExamAnalytics('GRE').catch(() => null),
        api.getMistakeBank('GRE').catch(() => null)
      ]);
      setReadinessData(readiness);
      setPrepBudgetData(budget);
      setAnalyticsData(analytics);
      setMistakeBank(mistakes);

      // Pre-generate a practice set so the view isn't empty!
      generateNewPracticeSet('GRE', 'QUANTITATIVE', 'All Topics', 'All', 10);
    } catch (err) {
      console.error('Failed to load study abroad data:', err);
      setError(err.message || 'Unable to load study abroad overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Practice Set Timer effect
  useEffect(() => {
    if (!activePracticeSet || practiceSubmitted || practiceTimeRemaining <= 0) return;
    const interval = setInterval(() => {
      setPracticeTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activePracticeSet, practiceSubmitted, practiceTimeRemaining]);

  // Mock Exam Timer effect
  useEffect(() => {
    if (!mockInProgress || mockTimeRemaining <= 0) return;
    const interval = setInterval(() => {
      setMockTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [mockInProgress, mockTimeRemaining]);

  const handleCountryToggle = (countryId) => {
    if (selectedCountries.includes(countryId)) {
      if (selectedCountries.length === 1) return;
      setSelectedCountries(selectedCountries.filter((c) => c !== countryId));
    } else {
      if (selectedCountries.length >= 3) {
        const next = [...selectedCountries.slice(1), countryId];
        setSelectedCountries(next);
      } else {
        setSelectedCountries([...selectedCountries, countryId]);
      }
    }
  };

  const handleSaveSelection = async () => {
    try {
      setSavingSelection(true);
      const res = await api.updateStudyAbroadSelection(selectedCountries, selectedProgram, selectedIntake);
      setData(res);
      alert('Preferences saved and pipeline updated!');
    } catch (err) {
      console.error('Failed to update selection:', err);
      alert('Error saving preferences: ' + (err.message || 'Try again'));
    } finally {
      setSavingSelection(false);
    }
  };

  const generateNewPracticeSet = async (
    exam = examSelect,
    section = sectionSelect,
    topic = topicSelect,
    diff = difficultySelect,
    cnt = questionCountSelect
  ) => {
    try {
      setGeneratingSet(true);
      setPracticeSubmitted(false);
      setPracticeEvaluation(null);
      setPracticeAnswers({});
      setShowSolutionId(null);

      const res = await api.generatePracticeSet({
        exam,
        section,
        topic,
        difficulty: diff,
        question_count: cnt,
        time_limit_minutes: Math.max(10, Math.round(cnt * 1.5))
      });
      setActivePracticeSet(res);
      setPracticeTimeRemaining(res.time_limit_minutes * 60);
    } catch (err) {
      console.error('Failed to generate practice set:', err);
      alert('Error generating questions: ' + err.message);
    } finally {
      setGeneratingSet(false);
    }
  };

  const handleSubmitPractice = async () => {
    if (!activePracticeSet) return;
    try {
      const timeSpent = (activePracticeSet.time_limit_minutes * 60) - Math.max(0, practiceTimeRemaining);
      const evalRes = await api.submitPracticeSet({
        set_id: activePracticeSet.set_id,
        exam: activePracticeSet.exam,
        section: activePracticeSet.section,
        answers: practiceAnswers,
        time_spent_seconds: Math.max(30, timeSpent)
      });
      setPracticeEvaluation(evalRes);
      setPracticeSubmitted(true);

      // Refresh mistake bank & analytics in background
      api.getMistakeBank(activePracticeSet.exam).then(setMistakeBank).catch(() => {});
      api.getExamAnalytics(activePracticeSet.exam).then(setAnalyticsData).catch(() => {});
    } catch (err) {
      console.error('Failed to submit practice set:', err);
      alert('Error submitting test: ' + err.message);
    }
  };

  const handleStartMock = async () => {
    try {
      setLoadingMock(true);
      setMockEvaluation(null);
      setMockAnswers({});
      setActiveMockSectionIdx(0);
      setActiveMockQuestionIdx(0);

      const blueprint = await api.startMockExam({
        exam: examSelect,
        mock_mode: 'FULL_TIMED'
      });
      setMockBlueprint(blueprint);
      setMockTimeRemaining(blueprint.total_time_minutes * 60);
      setMockInProgress(true);
    } catch (err) {
      console.error('Failed to start mock:', err);
      alert('Error initializing full mock exam: ' + err.message);
    } finally {
      setLoadingMock(false);
    }
  };

  const handleSubmitMock = async () => {
    if (!mockBlueprint) return;
    try {
      setSubmittingMock(true);
      const timeSpent = (mockBlueprint.total_time_minutes * 60) - Math.max(0, mockTimeRemaining);
      const evalRes = await api.submitMockExam({
        mock_id: mockBlueprint.mock_id,
        exam: mockBlueprint.exam,
        answers: mockAnswers,
        time_spent_seconds: Math.max(60, timeSpent)
      });
      setMockEvaluation(evalRes);
      setMockInProgress(false);

      // Refresh analytics
      api.getExamAnalytics(mockBlueprint.exam).then(setAnalyticsData).catch(() => {});
      api.getMistakeBank(mockBlueprint.exam).then(setMistakeBank).catch(() => {});
    } catch (err) {
      console.error('Failed to submit mock:', err);
      alert('Error submitting mock exam: ' + err.message);
    } finally {
      setSubmittingMock(false);
    }
  };

  const handleResolveMistake = async (questionId) => {
    try {
      await api.resolveMistake(questionId);
      if (mistakeBank) {
        setMistakeBank({
          ...mistakeBank,
          total_unresolved: Math.max(0, mistakeBank.total_unresolved - 1),
          items: mistakeBank.items.filter((item) => item.question_id !== questionId)
        });
      }
    } catch (err) {
      console.error('Failed to resolve mistake:', err);
    }
  };

  const handleEvaluateWriting = async () => {
    if (!essayText.trim()) {
      alert('Please enter or paste your essay before evaluating.');
      return;
    }
    try {
      setEvaluatingWriting(true);
      const res = await api.evaluateWriting({
        exam: writingExam,
        prompt_type: 'ISSUE_TASK',
        topic_prompt: writingPrompt,
        essay_text: essayText
      });
      setWritingResult(res);
    } catch (err) {
      console.error('Failed to evaluate essay:', err);
      alert('Writing evaluation failed: ' + err.message);
    } finally {
      setEvaluatingWriting(false);
    }
  };

  const handleEvaluateSpeaking = async () => {
    if (!speakingTranscript.trim()) {
      alert('Please speak or enter your transcribed response.');
      return;
    }
    try {
      setEvaluatingSpeaking(true);
      const res = await api.evaluateSpeaking({
        exam: 'IELTS',
        cue_card_topic: speakingCueTopic,
        transcript_text: speakingTranscript,
        speech_duration_seconds: 120
      });
      setSpeakingResult(res);
    } catch (err) {
      console.error('Failed to evaluate speaking:', err);
      alert('Speaking evaluation failed: ' + err.message);
    } finally {
      setEvaluatingSpeaking(false);
    }
  };

  const handleGenerateSop = async () => {
    try {
      setGeneratingSop(true);
      const res = await api.generateSopLor({
        target_university: sopUniversity,
        target_program: sopProgram,
        specific_research_interest: sopResearch,
        target_professor_or_lab: sopLab
      });
      setSopResult(res);
    } catch (err) {
      console.error('SOP generation failed:', err);
      alert('Error generating SOP/LOR: ' + err.message);
    } finally {
      setGeneratingSop(false);
    }
  };

  const handleCopyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-600 font-medium">Initializing Advanced Exam Preparation & Masters Engine...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-2xl mx-auto bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">Failed to Load Study Abroad Copilot</h3>
        <p className="text-sm text-rose-700">{error || 'Data could not be retrieved.'}</p>
        <button
          onClick={fetchOverview}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const {
    all_countries_catalog,
    required_exams,
    shortlisted_universities,
    cost_roi_comparisons,
    roadmap,
    profile_summary
  } = data;

  const filteredUnis = shortlisted_universities.filter((u) => {
    if (tierFilter === 'ALL') return true;
    return u.tier === tierFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* ============================================================== */}
      {/* FLAGSHIP HERO: MASTERS READINESS & COUNTDOWN BANNER */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-7 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> GLOBAL HIGHER EDUCATION & MASTERS COPILOT
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-emerald-400" /> 42 Days to Target Test Date
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Exam Preparation & Masters Engine</h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Complete standardized preparation suite for GRE, IELTS, TOEFL & GMAT. Includes procedural question banks,
              adaptive timed mocks, diagnostic analytics, AI essay & speaking evaluation, and university registration checklists.
            </p>
          </div>

          {/* AI Masters Readiness Score Widget */}
          {readinessData && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[280px] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Masters Readiness</span>
                </div>
                <span className="text-xl font-black text-emerald-400">{readinessData.overall_readiness_pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${readinessData.overall_readiness_pct}%` }}
                ></div>
              </div>

              {/* Breakdown metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div className="flex justify-between">
                  <span>Academics:</span>
                  <span className="font-semibold text-white">{readinessData.academics_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span>GRE / Quant:</span>
                  <span className="font-semibold text-amber-300">{readinessData.gre_gmat_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span>English Test:</span>
                  <span className="font-semibold text-white">{readinessData.english_test_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Finance Runway:</span>
                  <span className="font-semibold text-indigo-300">{readinessData.finance_runway_score}%</span>
                </div>
              </div>

              {readinessData.bottlenecks?.length > 0 && (
                <div className="text-[10px] text-rose-300 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20 truncate">
                  Bottleneck: {readinessData.bottlenecks[0]}
                </div>
              )}
            </div>
          )}
        </div>

        {/* COMPREHENSIVE SUB-NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-indigo-900/60 mt-6 no-scrollbar">
          {[
            { id: 'generator', label: '1. Question Bank & Practice Set', icon: BookOpen },
            { id: 'mock', label: '2. Full Timed Mock Simulator', icon: Clock },
            { id: 'mistakes', label: '3. Practice My Mistakes', icon: RotateCcw, badge: mistakeBank?.total_unresolved },
            { id: 'analytics', label: '4. Exam Analytics & Badges', icon: BarChart3 },
            { id: 'writing_speaking', label: '5. AI Writing & Speaking', icon: PenTool },
            { id: 'overview', label: '6. Destination Matcher', icon: Globe },
            { id: 'universities', label: '7. Universities & Checklist', icon: GraduationCap },
            { id: 'roi', label: '8. 2-Yr Cost & Loan ROI', icon: DollarSign },
            { id: 'sop', label: '9. AI SOP & LOR Copilot', icon: Sparkles },
            { id: 'roadmap', label: '10. 12-Month Roadmap', icon: Calendar },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {t.badge > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: QUESTION BANK & INFINITE GENERATOR */}
      {/* ============================================================== */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          {/* Practice Set Generator Controls */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Infinite Exam Question Generator
                </h3>
                <p className="text-xs text-slate-500">
                  Generate targeted topic tests on demand. Choose exam, section, specific topic, difficulty, and size.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateNewPracticeSet(examSelect, sectionSelect, topicSelect, difficultySelect, questionCountSelect)}
                  disabled={generatingSet}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {generatingSet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>{generatingSet ? 'Synthesizing Questions...' : 'Generate New Practice Set'}</span>
                </button>
              </div>
            </div>

            {/* Filter Selectors Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Exam</label>
                <select
                  value={examSelect}
                  onChange={(e) => setExamSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="GRE">GRE General</option>
                  <option value="IELTS">IELTS Academic</option>
                  <option value="TOEFL">TOEFL iBT</option>
                  <option value="GMAT">GMAT Focus</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Section</label>
                <select
                  value={sectionSelect}
                  onChange={(e) => setSectionSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="QUANTITATIVE">Quantitative Reasoning</option>
                  <option value="VERBAL">Verbal Reasoning</option>
                  <option value="READING">Critical Reading</option>
                  <option value="DATA_INSIGHTS">Data Insights</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Topic</label>
                <select
                  value={topicSelect}
                  onChange={(e) => setTopicSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="All Topics">All Topics</option>
                  <option value="Probability">Probability & Combinatorics</option>
                  <option value="Algebra">Algebra & Functions</option>
                  <option value="Geometry">Geometry & Coordinates</option>
                  <option value="Data Analysis">Data Analysis & Statistics</option>
                  <option value="Arithmetic">Arithmetic & Work Rates</option>
                  <option value="Text Completion">Text Completion</option>
                  <option value="Sentence Equivalence">Sentence Equivalence</option>
                  <option value="Reading Comprehension">Reading Comprehension</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Difficulty</label>
                <select
                  value={difficultySelect}
                  onChange={(e) => setDifficultySelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy (Foundation)</option>
                  <option value="Medium">Medium (Exam Standard)</option>
                  <option value="Hard">Hard (90th Percentile)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Questions</label>
                <select
                  value={questionCountSelect}
                  onChange={(e) => setQuestionCountSelect(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value={10}>10 Questions (~15 mins)</option>
                  <option value={20}>20 Questions (~30 mins)</option>
                  <option value={25}>25 Questions (~38 mins)</option>
                  <option value={50}>50 Questions (~75 mins)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Practice Set Runner */}
          {activePracticeSet && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              {/* Header & Timer Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                      {activePracticeSet.exam} • {activePracticeSet.section}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                      {activePracticeSet.topic}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({activePracticeSet.questions.length} Questions)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 text-slate-800 rounded-xl font-mono text-sm font-bold">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>{formatTimer(practiceTimeRemaining)}</span>
                  </div>

                  {!practiceSubmitted ? (
                    <button
                      onClick={handleSubmitPractice}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                    >
                      Submit Test & View Results
                    </button>
                  ) : (
                    <button
                      onClick={() => generateNewPracticeSet()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Practice Another Set
                    </button>
                  )}
                </div>
              </div>

              {/* Evaluation Summary Card when submitted */}
              {practiceSubmitted && practiceEvaluation && (
                <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 rounded-2xl p-5 border border-indigo-200 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Diagnostic Practice Results</h4>
                      <p className="text-xs text-slate-600">{practiceEvaluation.ai_feedback}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center bg-white px-3.5 py-2 rounded-xl border border-indigo-100 shadow-xs">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Accuracy</span>
                        <span className="text-base font-extrabold text-indigo-600">
                          {practiceEvaluation.accuracy_pct}%
                        </span>
                      </div>
                      <div className="text-center bg-white px-3.5 py-2 rounded-xl border border-indigo-100 shadow-xs">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Score</span>
                        <span className="text-base font-extrabold text-emerald-600">
                          {practiceEvaluation.correct_count} / {practiceEvaluation.total_questions}
                        </span>
                      </div>
                      <div className="text-center bg-white px-3.5 py-2 rounded-xl border border-indigo-100 shadow-xs">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Speed</span>
                        <span className="text-base font-extrabold text-slate-800">
                          {practiceEvaluation.average_time_per_question_sec}s/q
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weak areas badge */}
                  {practiceEvaluation.weak_areas.length > 0 && (
                    <div className="flex items-center gap-2 text-xs pt-2 border-t border-indigo-100">
                      <span className="font-bold text-rose-700">Flagged Weak Areas:</span>
                      {practiceEvaluation.weak_areas.map((w, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[11px]">
                          ⚠️ {w}
                        </span>
                      ))}
                      <button
                        onClick={() => setActiveTab('mistakes')}
                        className="text-indigo-600 hover:underline font-bold text-xs ml-auto cursor-pointer"
                      >
                        Open Mistake Bank →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {activePracticeSet.questions.map((q, idx) => {
                  const userChoice = practiceAnswers[q.id];
                  const hasAnswered = userChoice !== undefined;
                  const isCorrect = userChoice === q.correct_option;
                  const isSolutionOpen = showSolutionId === q.id;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl p-5 border transition ${
                        practiceSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-rose-50/40 border-rose-200'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-indigo-700 uppercase">{q.topic}</span>
                          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-500">
                            {q.difficulty}
                          </span>
                        </div>

                        {practiceSubmitted && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                              isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            {isCorrect ? 'Correct (+1)' : 'Incorrect (Added to Mistake Bank)'}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed mb-4">
                        {q.question}
                      </p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {q.options.map((opt, oidx) => {
                          let optStyle = 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40';
                          if (practiceSubmitted) {
                            if (oidx === q.correct_option) {
                              optStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                            } else if (oidx === userChoice) {
                              optStyle = 'bg-rose-100 border-rose-500 text-rose-950';
                            } else {
                              optStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                            }
                          } else if (userChoice === oidx) {
                            optStyle = 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs';
                          }

                          return (
                            <button
                              key={oidx}
                              disabled={practiceSubmitted}
                              onClick={() => setPracticeAnswers({ ...practiceAnswers, [q.id]: oidx })}
                              className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-3 cursor-pointer ${optStyle}`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                                {String.fromCharCode(65 + oidx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Step-by-Step AI Explanation Dropdown */}
                      {practiceSubmitted && (
                        <div className="mt-4 pt-3 border-t border-slate-200/80">
                          <button
                            onClick={() => setShowSolutionId(isSolutionOpen ? null : q.id)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isSolutionOpen ? 'Hide Detailed Solution' : 'View Step-by-Step Mathematical Explanation & Mistake Diagnostic'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSolutionOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isSolutionOpen && (
                            <div className="mt-3 p-4 bg-white rounded-xl border border-indigo-100 text-xs text-slate-700 space-y-2.5">
                              <div>
                                <strong className="text-emerald-800 font-bold block mb-1">
                                  Correct Answer: Option {String.fromCharCode(65 + q.correct_option)}
                                </strong>
                                <p className="leading-relaxed">{q.explanation}</p>
                              </div>

                              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200/70 text-amber-900 text-[11px] leading-relaxed">
                                <strong className="font-bold block mb-0.5">⚠️ Why students make mistakes here:</strong>
                                {q.mistake_analysis || 'Watch out for boundary condition traps and algebraic distributions.'}
                              </div>

                              <div className="text-[11px] text-slate-500">
                                <strong>Concept Tested: </strong> {q.concept_tested || 'Analytical Deduction'}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: FULL-LENGTH TIMED MOCK SIMULATOR */}
      {/* ============================================================== */}
      {activeTab === 'mock' && (
        <div className="space-y-6">
          {!mockInProgress && !mockEvaluation && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-3xl mx-auto space-y-6">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Official-Style GRE / IELTS Full Mock Simulator</h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Experience true exam conditions. Features timed section blocks, adaptive difficulty scaling,
                  answer review palettes, and scaled percentile predictions (260–340 scale).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Exam Duration</span>
                  <span className="text-sm font-extrabold text-slate-800">90 Minutes Timed</span>
                  <p className="text-[11px] text-slate-500 mt-1">4 Full Sectional Blocks</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Adaptive Engine</span>
                  <span className="text-sm font-extrabold text-indigo-600">Section-Level Dynamic</span>
                  <p className="text-[11px] text-slate-500 mt-1">Section 3 & 4 scale by accuracy</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Feedback Policy</span>
                  <span className="text-sm font-extrabold text-emerald-600">Strict Exam Mode</span>
                  <p className="text-[11px] text-slate-500 mt-1">Zero hints until final submit</p>
                </div>
              </div>

              <button
                onClick={handleStartMock}
                disabled={loadingMock}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2 mx-auto"
              >
                {loadingMock ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{loadingMock ? 'Building Exam Blueprint...' : 'Start Full Diagnostic Mock Exam'}</span>
              </button>
            </div>
          )}

          {/* Live Mock Exam In Progress */}
          {mockInProgress && mockBlueprint && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              {/* Exam Simulator Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase">
                    {mockBlueprint.exam} OFFICIAL MOCK SIMULATION
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {mockBlueprint.sections[activeMockSectionIdx]?.name}
                  </h4>
                </div>

                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-slate-900 text-white font-mono text-base font-extrabold rounded-xl flex items-center gap-2 shadow-xs">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>{formatTimer(mockTimeRemaining)}</span>
                  </div>

                  <button
                    onClick={handleSubmitMock}
                    disabled={submittingMock}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                  >
                    {submittingMock ? 'Scoring...' : 'End & Submit Exam'}
                  </button>
                </div>
              </div>

              {/* Section Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {mockBlueprint.sections.map((sec, sidx) => (
                  <button
                    key={sec.section_id}
                    onClick={() => {
                      setActiveMockSectionIdx(sidx);
                      setActiveMockQuestionIdx(0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeMockSectionIdx === sidx
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sec.name.split(':')[0]} ({sec.questions.length}Q)
                  </button>
                ))}
              </div>

              {/* Question View */}
              {(() => {
                const currentSec = mockBlueprint.sections[activeMockSectionIdx];
                const currentQ = currentSec?.questions[activeMockQuestionIdx];
                if (!currentQ) return null;

                const userPick = mockAnswers[currentQ.id];

                return (
                  <div className="space-y-6">
                    {/* Question Header & Palette */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <span className="text-xs font-bold text-slate-700">
                        Question {activeMockQuestionIdx + 1} of {currentSec.questions.length}
                      </span>

                      {/* Question Palette Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {currentSec.questions.map((q, qidx) => {
                          const isAnswered = mockAnswers[q.id] !== undefined;
                          const isCurrent = activeMockQuestionIdx === qidx;
                          return (
                            <button
                              key={q.id}
                              onClick={() => setActiveMockQuestionIdx(qidx)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                                isCurrent
                                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                                  : isAnswered
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-white text-slate-600 border border-slate-200'
                              }`}
                            >
                              {qidx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50/60 rounded-2xl border border-slate-200/80 space-y-4">
                      <p className="text-base font-semibold text-slate-900 whitespace-pre-line leading-relaxed">
                        {currentQ.question}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {currentQ.options.map((opt, oidx) => (
                          <button
                            key={oidx}
                            onClick={() => setMockAnswers({ ...mockAnswers, [currentQ.id]: oidx })}
                            className={`p-3.5 rounded-xl border text-left text-xs font-medium transition flex items-center gap-3 cursor-pointer ${
                              userPick === oidx
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                              {String.fromCharCode(65 + oidx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        disabled={activeMockQuestionIdx === 0}
                        onClick={() => setActiveMockQuestionIdx(activeMockQuestionIdx - 1)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition disabled:opacity-40 cursor-pointer"
                      >
                        ← Previous Question
                      </button>

                      <button
                        disabled={activeMockQuestionIdx === currentSec.questions.length - 1}
                        onClick={() => setActiveMockQuestionIdx(activeMockQuestionIdx + 1)}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-40 cursor-pointer"
                      >
                        Next Question →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Mock Exam Result Card */}
          {mockEvaluation && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    MOCK COMPLETED • OFFICIAL ESTIMATE
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                    Diagnostic Score: {mockEvaluation.total_scaled_score} / 340
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Estimated Score Range: {mockEvaluation.score_range}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-2xl text-center">
                    <span className="text-[10px] text-indigo-700 font-bold uppercase block">Quant Scaled</span>
                    <span className="text-xl font-black text-indigo-950">{mockEvaluation.quant_scaled_score} / 170</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 px-4 py-2 rounded-2xl text-center">
                    <span className="text-[10px] text-purple-700 font-bold uppercase block">Verbal Scaled</span>
                    <span className="text-xl font-black text-purple-950">{mockEvaluation.verbal_scaled_score} / 170</span>
                  </div>
                </div>
              </div>

              {/* Strategic Advice Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">AI Strategic Gap Assessment</span>
                <p className="text-xs text-slate-700 leading-relaxed">{mockEvaluation.ai_strategic_advice}</p>
              </div>

              {/* Adaptation Log */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Adaptive Difficulty Log</span>
                <ul className="text-xs text-slate-600 space-y-1">
                  {mockEvaluation.difficulty_adaptation_log.map((log, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{log}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab('mistakes')}
                  className="px-5 py-2.5 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Review {mockEvaluation.mistakes_added_to_bank} Mistakes in Mistake Bank →
                </button>
                <button
                  onClick={() => {
                    setMockEvaluation(null);
                    setMockInProgress(false);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Start Another Mock
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PRACTICE MY MISTAKES (MISTAKE BANK) */}
      {/* ============================================================== */}
      {activeTab === 'mistakes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-rose-600" />
                  Your Active Mistake Bank ({mistakeBank?.total_unresolved || 0} Flagged Questions)
                </h3>
                <p className="text-xs text-slate-500">
                  Every question you answer incorrectly in Practice Sets or Full Mocks is automatically recorded here.
                  Drill them until they are fully understood and resolved.
                </p>
              </div>

              {/* Topic Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {['All', ...Object.keys(mistakeBank?.topic_counts || {})].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setMistakeFilterTopic(topic)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      mistakeFilterTopic === topic
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {topic} {topic !== 'All' && `(${mistakeBank?.topic_counts[topic] || 0})`}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Mistake Items */}
            <div className="space-y-4">
              {mistakeBank?.items
                .filter((item) => mistakeFilterTopic === 'All' || item.topic === mistakeFilterTopic)
                .map((m, idx) => (
                  <div key={m.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-full">
                          {m.topic} • {m.difficulty}
                        </span>
                        <span className="text-xs text-slate-500">Missed {m.mistake_count}x</span>
                      </div>

                      <button
                        onClick={() => handleResolveMistake(m.question_id)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark as Mastered
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                      {m.question}
                    </p>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <strong className="text-emerald-800 font-bold block">
                        Correct Answer: Option {String.fromCharCode(65 + m.correct_option)}
                      </strong>
                      <p className="text-slate-600 leading-relaxed">{m.explanation}</p>
                    </div>
                  </div>
                ))}

              {(!mistakeBank || mistakeBank.items.length === 0) && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  🎉 Fantastic! Your mistake bank is clean. Attempt more practice sets to test advanced concepts.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: EXAM ANALYTICS & GAMIFIED LEADERBOARD */}
      {/* ============================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsData && (
            <div className="space-y-6">
              {/* High-Level Performance Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Questions Solved</span>
                  <span className="text-2xl font-black text-slate-900">{analyticsData.total_questions_solved}</span>
                  <span className="text-xs text-indigo-600 font-semibold block mt-1">Across 8 Topic Banks</span>
                </div>
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall Accuracy</span>
                  <span className="text-2xl font-black text-emerald-600">{analyticsData.overall_accuracy_pct}%</span>
                  <span className="text-xs text-slate-500 block mt-1">Target: 80%+</span>
                </div>
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Best Mock Score</span>
                  <span className="text-2xl font-black text-indigo-600">{analyticsData.best_mock_score} / 340</span>
                  <span className="text-xs text-emerald-600 font-semibold block mt-1">+{analyticsData.score_improvement_delta} pts growth</span>
                </div>
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Days to Target</span>
                  <span className="text-2xl font-black text-amber-600">{analyticsData.predicted_target_days} Days</span>
                  <span className="text-xs text-slate-500 block mt-1">At 25 q/day pace</span>
                </div>
              </div>

              {/* Mock Progression History Trajectory */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      Mock Exam Score Progression Trajectory
                    </h4>
                    <p className="text-xs text-slate-500">Tracking diagnostic growth across full simulation attempts</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    +{analyticsData.score_improvement_delta} Estimated Point Improvement
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analyticsData.mock_history.map((m, idx) => (
                    <div key={m.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900">{m.mock_title}</span>
                        <span className="text-slate-400 font-medium">{m.date}</span>
                      </div>
                      <div className="text-xl font-extrabold text-indigo-600">{m.total_score} / 340</div>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Quant: {m.quant_score}</span>
                        <span>Verbal: {m.verbal_score}</span>
                        <span className="text-emerald-700 font-semibold">{m.accuracy_pct}% Acc</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Radar Breakdown */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-base font-bold text-slate-900">Topic-Wise Accuracy Breakdown</h4>
                <div className="space-y-3">
                  {analyticsData.topic_radar.map((top, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800">{top.topic}</span>
                        <span className="font-bold text-slate-900">{top.accuracy_pct}% ({top.correct}/{top.total})</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            top.status === 'STRONG' ? 'bg-emerald-500' : top.status === 'AVERAGE' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${top.accuracy_pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gamified Badges */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Achievements & Masteries
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {analyticsData.gamified_badges.map((b, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-center space-y-1">
                      <span className="text-2xl block">{b.icon}</span>
                      <h5 className="font-bold text-slate-900 text-xs">{b.title}</h5>
                      <p className="text-[10px] text-slate-500">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: AI WRITING & SPEAKING EVALUATOR */}
      {/* ============================================================== */}
      {activeTab === 'writing_speaking' && (
        <div className="space-y-8">
          {/* AI Writing Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-600" />
                AI Essay & Analytical Writing Evaluator
              </h3>
              <p className="text-xs text-slate-500">
                Submit essays for instant rubric feedback across Task Response, Coherence & Cohesion, Lexical Resource,
                and Grammatical Range with Band 8 exemplar rewrites.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-4">
                <button
                  onClick={() => setWritingExam('GRE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    writingExam === 'GRE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  GRE Issue Task (0–6 Scale)
                </button>
                <button
                  onClick={() => setWritingExam('IELTS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    writingExam === 'IELTS' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  IELTS Academic Task 2 (0–9 Band)
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800">
                <strong className="block text-[11px] uppercase text-indigo-700 font-bold mb-1">Prompt:</strong>
                {writingPrompt}
              </div>

              <textarea
                rows={8}
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Type or paste your complete academic essay here (minimum 250 words recommended)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
              ></textarea>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-400">{essayText.split(/\s+/).filter(Boolean).length} words</span>
                <button
                  onClick={handleEvaluateWriting}
                  disabled={evaluatingWriting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {evaluatingWriting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{evaluatingWriting ? 'Analyzing Rubrics...' : 'Evaluate Essay with AI'}</span>
                </button>
              </div>
            </div>

            {/* Writing Result */}
            {writingResult && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 pt-4 mt-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="text-base font-bold text-slate-900">Writing Evaluation Report</h4>
                  <span className="text-xl font-black text-emerald-600">
                    Estimated Score: {writingResult.estimated_score_or_band}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(writingResult.rubric_scores).map(([rubric, sc]) => (
                    <div key={rubric} className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{rubric}</span>
                      <span className="text-base font-extrabold text-indigo-700">{sc}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                  <strong className="text-indigo-900 font-bold block">Model Band 8.5 Exemplar Rewrite:</strong>
                  <p className="font-mono text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {writingResult.band_8_rewrite_sample}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Speaking Simulator */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mic className="w-5 h-5 text-indigo-600" />
                IELTS & TOEFL Speaking Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Practice 2-minute Part 2 cue cards. Evaluate fluency, speech pacing, fillers, and lexical complexity.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
              <strong className="block text-[11px] uppercase text-indigo-700 font-bold">Cue Card Topic:</strong>
              <p>{speakingCueTopic}</p>
              <p className="text-[11px] text-slate-500 pt-1">
                You should say: what the obstacle was, why it was critical, how you resolved it, and what you learned.
              </p>
            </div>

            <textarea
              rows={5}
              value={speakingTranscript}
              onChange={(e) => setSpeakingTranscript(e.target.value)}
              placeholder="Speak or paste your 2-minute speech transcript here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>

            <div className="flex justify-end">
              <button
                onClick={handleEvaluateSpeaking}
                disabled={evaluatingSpeaking}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {evaluatingSpeaking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                <span>{evaluatingSpeaking ? 'Evaluating Speech...' : 'Analyze Speaking Response'}</span>
              </button>
            </div>

            {speakingResult && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 pt-4 mt-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="text-base font-bold text-slate-900">Speaking Diagnostic Band</h4>
                  <span className="text-xl font-black text-emerald-600">
                    Band: {speakingResult.estimated_band} / 9.0
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(speakingResult.rubric_scores).map(([rubric, sc]) => (
                    <div key={rubric} className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{rubric}</span>
                      <span className="text-base font-extrabold text-indigo-700">{sc}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-indigo-900 font-bold block mb-1">Model High-Band Narrative:</strong>
                  <p className="font-mono text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {speakingResult.sample_high_band_response}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: DESTINATION MATCHER */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Configure Your Global Preferences</h3>
                <p className="text-xs text-slate-500">
                  Select up to 3 target countries. The platform automatically identifies required entrance tests,
                  university cutoffs, and cost calculations.
                </p>
              </div>
              <button
                onClick={handleSaveSelection}
                disabled={savingSelection}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {savingSelection ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {savingSelection ? 'Updating...' : 'Save & Recalculate Pipeline'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Target Master's Degree
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium"
                >
                  <option value="MS in Artificial Intelligence / Computer Science">🎯 Recommended: MS in AI / Computer Science</option>
                  <option value="MS in Computer Science (General CS Track)">MS in Computer Science</option>
                  <option value="MS in Data Science & Machine Learning">MS in Data Science & Analytics</option>
                  <option value="MS in Software Engineering">MS in Software Engineering</option>
                  <option value="MS in Cybersecurity & Cloud Systems">MS in Cybersecurity</option>
                  <option value="MS in Robotics & Autonomous Systems">MS in Robotics</option>
                  <option value="Master of Business Administration (MBA - Tech Management)">MBA (Tech Management)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Target Intake Season
                </label>
                <select
                  value={selectedIntake}
                  onChange={(e) => setSelectedIntake(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium"
                >
                  <option value="Fall 2027">Fall 2027 (Most recommended for complete prep cycle)</option>
                  <option value="Spring 2027">Spring 2027 (Accelerated timeline)</option>
                  <option value="Fall 2028">Fall 2028 (Long-term strategic runway)</option>
                </select>
              </div>
            </div>

            {/* Country Selector Multi-Chips */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Target Countries ({selectedCountries.length} / 3 Selected)
              </span>
              <div className="flex flex-wrap gap-2.5">
                {all_countries_catalog.map((country) => {
                  const isSelected = selectedCountries.includes(country.id);
                  return (
                    <button
                      key={country.id}
                      onClick={() => handleCountryToggle(country.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-base">{country.flag}</span>
                      <span>{country.name}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 ml-1" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-300 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: UNIVERSITIES & CHECKLIST */}
      {/* ============================================================== */}
      {activeTab === 'universities' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Curated University Portfolio & Admission Checklist</h3>
              <p className="text-xs text-slate-500">
                Classified by admission selectivity relative to your profile ({profile_summary.cgpa?.toFixed(2)} CGPA).
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              {['ALL', 'AMBITIOUS', 'TARGET', 'SAFE'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    tierFilter === tier ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tier === 'ALL' ? 'All Tiers' : tier}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredUnis.map((uni) => (
              <div key={uni.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl">{uni.flag}</span>
                      <h4 className="text-base font-bold text-slate-900">{uni.university_name}</h4>
                      <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-100 text-indigo-800">
                        {uni.tier}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md">
                        QS #{uni.qs_world_ranking}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700 font-semibold">{uni.program_name}</p>
                  </div>

                  <a
                    href={uni.official_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer self-start"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Annual Tuition</span>
                    <span className="text-xs font-bold text-slate-900">
                      ₹{(uni.annual_tuition_inr / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Living Cost / Yr</span>
                    <span className="text-xs font-bold text-slate-900">
                      ₹{(uni.annual_living_inr / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Min CGPA</span>
                    <span className="text-xs font-bold text-indigo-700">{uni.min_cgpa_cutoff.toFixed(1)}+ / 10.0</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Post-MS CTC</span>
                    <span className="text-xs font-bold text-emerald-700">
                      ₹{(uni.post_ms_avg_starting_salary_inr / 100000).toFixed(1)} Lakhs/yr
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: 2-YEAR COST & ROI CALCULATOR */}
      {/* ============================================================== */}
      {activeTab === 'roi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cost_roi_comparisons.map((c, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{c.university_name}</h4>
                    <p className="text-[11px] text-slate-500">{c.program_name}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                    {c.payback_period_years} Yr Payback
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>2-Year Total Outlay</span>
                    <span>₹{(c.total_estimated_budget_inr / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Post-MS Monthly EMI</span>
                    <span className="font-bold text-rose-600">₹{c.estimated_monthly_emi_inr.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Projected Starting CTC</span>
                    <span className="font-bold text-emerald-600">₹{(c.projected_post_ms_salary_inr / 100000).toFixed(1)} Lakhs/yr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 9: AI SOP & LOR COPILOT */}
      {/* ============================================================== */}
      {activeTab === 'sop' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                AI Statement of Purpose & LOR Generator
              </h3>
              <p className="text-xs text-slate-500">
                Directly incorporates your authentic engineering skillset and CGPA ({profile_summary.cgpa?.toFixed(2)}).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target University</label>
                <select
                  value={sopUniversity}
                  onChange={(e) => setSopUniversity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800"
                >
                  {shortlisted_universities.map((u) => (
                    <option key={u.id} value={u.university_name}>
                      {u.university_name} ({u.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Program</label>
                <input
                  type="text"
                  value={sopProgram}
                  onChange={(e) => setSopProgram(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerateSop}
                disabled={generatingSop}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {generatingSop ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{generatingSop ? 'Synthesizing...' : 'Generate Personalized SOP & LOR'}</span>
              </button>
            </div>
          </div>

          {sopResult && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSopActiveSubtab('sop')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      sopActiveSubtab === 'sop' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Statement of Purpose
                  </button>
                  <button
                    onClick={() => setSopActiveSubtab('lor_prof')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      sopActiveSubtab === 'lor_prof' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Professor LOR
                  </button>
                  <button
                    onClick={() => setSopActiveSubtab('lor_hod')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      sopActiveSubtab === 'lor_hod' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    HOD LOR
                  </button>
                </div>

                <button
                  onClick={() => {
                    const txt =
                      sopActiveSubtab === 'sop'
                        ? sopResult.sop_text
                        : sopActiveSubtab === 'lor_prof'
                        ? sopResult.lor_prof_text
                        : sopResult.lor_hod_text;
                    handleCopyText(txt, sopActiveSubtab);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  {copiedKey === sopActiveSubtab ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === sopActiveSubtab ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-line max-h-[450px] overflow-y-auto">
                {sopActiveSubtab === 'sop' && sopResult.sop_text}
                {sopActiveSubtab === 'lor_prof' && sopResult.lor_prof_text}
                {sopActiveSubtab === 'lor_hod' && sopResult.lor_hod_text}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 10: 12-MONTH MASTER ROADMAP */}
      {/* ============================================================== */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          {roadmap.phases.map((phase, pidx) => (
            <div key={pidx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {pidx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{phase.phase_title}</h4>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                  {phase.timeline_months}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 uppercase block">Milestones</span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {phase.key_milestones.map((m, midx) => (
                      <li key={midx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 uppercase block">Action Items</span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {phase.action_items.map((act, aidx) => (
                      <li key={aidx} className="flex items-start gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

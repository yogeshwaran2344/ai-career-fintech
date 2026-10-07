import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Clock,
  RotateCcw,
  BarChart3,
  PenTool,
  Mic,
  Calendar,
  CheckCircle2,
  Circle,
  ExternalLink,
  Sparkles,
  Play,
  Check,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  Trophy,
  Flame,
  Target,
  Sliders,
  Filter,
  Layers,
  Award,
  HelpCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { api } from '../api';

export default function ExamPrepView({ profile, onNavigate }) {
  const [activeTab, setActiveTab] = useState('pyp'); // 'pyp', 'bank', 'mock', 'mistakes', 'analytics', 'writing_speaking'

  // ==================== PREVIOUS YEAR PAPERS (2016 - 2025) STATE ====================
  const [pypData, setPypData] = useState(null);
  const [loadingPyp, setLoadingPyp] = useState(true);
  const [pypExamFilter, setPypExamFilter] = useState('ALL');
  const [pypYearFilter, setPypYearFilter] = useState('ALL');

  // Interactive Solving for Previous Paper
  const [activeSolvingPaper, setActiveSolvingPaper] = useState(null);
  const [paperAnswers, setPaperAnswers] = useState({});
  const [paperTimer, setPaperTimer] = useState(1800);
  const [paperSubmitted, setPaperSubmitted] = useState(false);
  const [viewingSolutionPaperId, setViewingSolutionPaperId] = useState(null);

  // ==================== 1,000+ QUESTION BANK & GENERATOR STATE ====================
  const [bankStats, setBankStats] = useState(null);
  const [examSelect, setExamSelect] = useState('GRE');
  const [sectionSelect, setSectionSelect] = useState('QUANTITATIVE');
  const [topicSelect, setTopicSelect] = useState('All Topics');
  const [difficultySelect, setDifficultySelect] = useState('All');
  const [questionCountSelect, setQuestionCountSelect] = useState(10);
  const [generatingSet, setGeneratingSet] = useState(false);
  const [activePracticeSet, setActivePracticeSet] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceTimeRemaining, setPracticeTimeRemaining] = useState(900);
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [practiceEvaluation, setPracticeEvaluation] = useState(null);
  const [showSolutionId, setShowSolutionId] = useState(null);

  // ==================== FULL-LENGTH MOCK SIMULATOR STATE ====================
  const [mockBlueprint, setMockBlueprint] = useState(null);
  const [loadingMock, setLoadingMock] = useState(false);
  const [activeMockSectionIdx, setActiveMockSectionIdx] = useState(0);
  const [activeMockQuestionIdx, setActiveMockQuestionIdx] = useState(0);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockTimeRemaining, setMockTimeRemaining] = useState(5400); // 90 min
  const [mockInProgress, setMockInProgress] = useState(false);
  const [submittingMock, setSubmittingMock] = useState(false);
  const [mockEvaluation, setMockEvaluation] = useState(null);

  // ==================== MISTAKE BANK STATE ====================
  const [mistakeBank, setMistakeBank] = useState(null);
  const [mistakeFilterTopic, setMistakeFilterTopic] = useState('All');

  // ==================== ANALYTICS STATE ====================
  const [analyticsData, setAnalyticsData] = useState(null);

  // ==================== AI WRITING & SPEAKING STATE ====================
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

  // Initial Data Load
  const fetchInitialData = async () => {
    try {
      setLoadingPyp(true);
      const [pypRes, statsRes, mistakesRes, analyticsRes] = await Promise.all([
        api.getPreviousYearPapers().catch(() => null),
        api.getQuestionBankStats().catch(() => null),
        api.getMistakeBank('GRE').catch(() => null),
        api.getExamAnalytics('GRE').catch(() => null)
      ]);
      setPypData(pypRes);
      setBankStats(statsRes);
      setMistakeBank(mistakesRes);
      setAnalyticsData(analyticsRes);

      // Pre-generate initial custom practice set
      generatePracticeDrill('GRE', 'QUANTITATIVE', 'All Topics', 'All', 10);
    } catch (err) {
      console.error('Failed to load exam prep data:', err);
    } finally {
      setLoadingPyp(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Timers
  useEffect(() => {
    if (!activePracticeSet || practiceSubmitted || practiceTimeRemaining <= 0) return;
    const interval = setInterval(() => setPracticeTimeRemaining((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [activePracticeSet, practiceSubmitted, practiceTimeRemaining]);

  useEffect(() => {
    if (!activeSolvingPaper || paperSubmitted || paperTimer <= 0) return;
    const interval = setInterval(() => setPaperTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [activeSolvingPaper, paperSubmitted, paperTimer]);

  useEffect(() => {
    if (!mockInProgress || mockTimeRemaining <= 0) return;
    const interval = setInterval(() => setMockTimeRemaining((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [mockInProgress, mockTimeRemaining]);

  // Practice generator
  const generatePracticeDrill = async (exam = examSelect, section = sectionSelect, topic = topicSelect, diff = difficultySelect, cnt = questionCountSelect) => {
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
      console.error('Failed to generate practice drill:', err);
      alert('Error generating drill: ' + err.message);
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

      // Refresh mistake bank & analytics
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
      console.error('Writing evaluation failed:', err);
      alert('Evaluation error: ' + err.message);
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
      console.error('Speaking evaluation failed:', err);
      alert('Evaluation error: ' + err.message);
    } finally {
      setEvaluatingSpeaking(false);
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredPapers = pypData?.papers?.filter((p) => {
    if (pypExamFilter !== 'ALL' && p.exam.toUpperCase() !== pypExamFilter.toUpperCase()) return false;
    if (pypYearFilter !== 'ALL' && p.year !== Number(pypYearFilter)) return false;
    return true;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* ============================================================== */}
      {/* HERO BANNER: 10-YEAR PAPERS & 1,000+ QUESTION BANK */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-7 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> OFFICIAL EXAM REPOSITORY & PAST PAPERS
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-emerald-400" /> 10 Consecutive Years (2016 – 2025)
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">10-Year Papers & 1,000+ Question Bank</h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Complete archive of official-style previous year question papers and a 1,240+ question repository
              for GRE, IELTS, TOEFL, and GMAT. Features timed test simulation, mistake banks, and AI writing evaluators.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[280px] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Questions in Bank</span>
              <span className="font-extrabold text-emerald-400">1,240+ Active Questions</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Years Covered</span>
              <span className="font-bold text-white">2016 – 2025 (10 Years)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Active Mistake Bank</span>
              <span className="font-bold text-rose-400">{mistakeBank?.total_unresolved || 0} Flagged</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Supported Exams</span>
              <span className="font-bold text-indigo-300">GRE • IELTS • TOEFL • GMAT</span>
            </div>
          </div>
        </div>

        {/* SUB NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-indigo-900/60 mt-6 no-scrollbar">
          {[
            { id: 'pyp', label: '1. 10-Yr Previous Papers (2016-2025)', icon: FileText, count: filteredPapers.length },
            { id: 'bank', label: '2. 1,000+ Question Bank Generator', icon: BookOpen },
            { id: 'mock', label: '3. Full Timed Mock Simulator', icon: Clock },
            { id: 'mistakes', label: '4. Practice My Mistakes', icon: RotateCcw, count: mistakeBank?.total_unresolved },
            { id: 'analytics', label: '5. Diagnostic Analytics & Badges', icon: BarChart3 },
            { id: 'writing_speaking', label: '6. AI Writing & Speaking Evaluator', icon: PenTool },
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
                {t.count !== undefined && t.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-indigo-900' : 'bg-indigo-500/40 text-indigo-200'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: 10-YEAR PREVIOUS YEAR QUESTION PAPERS (2016 - 2025) */}
      {/* ============================================================== */}
      {activeTab === 'pyp' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Previous 10 Years Question Paper Archive (2016 – 2025)
                </h3>
                <p className="text-xs text-slate-500">
                  Solve official-style full test papers from past examination cycles with real timing,
                  question palettes, and verified solution keys.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <div>
                  <select
                    value={pypExamFilter}
                    onChange={(e) => setPypExamFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="ALL">All Exams</option>
                    <option value="GRE">GRE General</option>
                    <option value="IELTS">IELTS Academic</option>
                    <option value="TOEFL">TOEFL iBT</option>
                    <option value="GMAT">GMAT Focus</option>
                  </select>
                </div>

                <div>
                  <select
                    value={pypYearFilter}
                    onChange={(e) => setPypYearFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="ALL">All Years (2016-2025)</option>
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Active Interactive Solving Paper Runner */}
          {activeSolvingPaper && (
            <div className="bg-white rounded-3xl p-6 border border-indigo-300 shadow-md space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                      {activeSolvingPaper.exam} • Year {activeSolvingPaper.year}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">{activeSolvingPaper.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Source: {activeSolvingPaper.source_attribution}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 bg-slate-900 text-white font-mono text-sm font-bold rounded-xl flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{formatTimer(paperTimer)}</span>
                  </div>

                  {!paperSubmitted ? (
                    <button
                      onClick={() => setPaperSubmitted(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Submit Paper
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSolvingPaper(null);
                        setPaperSubmitted(false);
                      }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Close Paper Runner
                    </button>
                  )}
                </div>
              </div>

              {/* Questions in Paper */}
              <div className="space-y-6">
                {activeSolvingPaper.questions.map((q, idx) => {
                  const userChoice = paperAnswers[q.id];
                  const hasAnswered = userChoice !== undefined;
                  const isCorrect = userChoice === q.correct_option;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl p-5 border transition ${
                        paperSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50/40 border-emerald-300'
                            : 'bg-rose-50/40 border-rose-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-indigo-700">Question {idx + 1} • {q.topic}</span>
                        {paperSubmitted && (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {isCorrect ? 'Correct (+1)' : 'Incorrect'}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-slate-900 whitespace-pre-line mb-3">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oidx) => {
                          let optStyle = 'bg-white border-slate-200 text-slate-700';
                          if (paperSubmitted) {
                            if (oidx === q.correct_option) optStyle = 'bg-emerald-100 border-emerald-500 font-bold text-emerald-950';
                            else if (oidx === userChoice) optStyle = 'bg-rose-100 border-rose-500 text-rose-950';
                          } else if (userChoice === oidx) {
                            optStyle = 'bg-indigo-50 border-indigo-600 font-bold text-indigo-900';
                          }

                          return (
                            <button
                              key={oidx}
                              disabled={paperSubmitted}
                              onClick={() => setPaperAnswers({ ...paperAnswers, [q.id]: oidx })}
                              className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 cursor-pointer ${optStyle}`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                                {String.fromCharCode(65 + oidx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {paperSubmitted && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-emerald-800 font-bold block mb-1">
                            Explanation: Option {String.fromCharCode(65 + q.correct_option)}
                          </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paper Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPapers.map((paper) => {
              const isViewingSolution = viewingSolutionPaperId === paper.id;

              return (
                <div key={paper.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                          {paper.exam}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-xs font-bold rounded-md border border-amber-200">
                          {paper.year} Paper
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">
                          {paper.difficulty}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{paper.title}</h4>
                    </div>

                    <span className="text-xs text-slate-500 font-medium">
                      ⏱ {paper.duration_minutes} mins
                    </span>
                  </div>

                  {/* Sections Breakdown */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sections Tested</span>
                    <div className="flex flex-wrap gap-1.5">
                      {paper.sections_summary.map((sec, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setActiveSolvingPaper(paper);
                        setPaperAnswers({});
                        setPaperTimer(paper.duration_minutes * 60);
                        setPaperSubmitted(false);
                      }}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" /> Solve Timed Paper
                    </button>

                    <button
                      onClick={() => setViewingSolutionPaperId(isViewingSolution ? null : paper.id)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <span>{isViewingSolution ? 'Hide Solutions' : 'Answer Key'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isViewingSolution ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Solution Key Expansion */}
                  {isViewingSolution && (
                    <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 max-h-[400px] overflow-y-auto">
                      <strong className="text-xs font-bold text-slate-800 block border-b border-slate-200 pb-2">
                        Official Solutions & Explanations ({paper.questions.length} Questions)
                      </strong>
                      {paper.questions.map((q, qidx) => (
                        <div key={q.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                          <div className="font-semibold text-slate-900">
                            Q{qidx + 1}: {q.question}
                          </div>
                          <div className="text-emerald-700 font-bold">
                            Correct: Option {String.fromCharCode(65 + q.correct_option)} ({q.options[q.correct_option]})
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{q.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: 1,000+ QUESTION BANK & INFINITE GENERATOR */}
      {/* ============================================================== */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          {/* Question Bank Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Quantitative Reasoning</span>
              <span className="text-2xl font-black text-indigo-600">680+ Questions</span>
              <p className="text-[11px] text-slate-500 mt-1">Arithmetic, Algebra, Geometry, Probability, Statistics</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Verbal Reasoning</span>
              <span className="text-2xl font-black text-purple-600">360+ Questions</span>
              <p className="text-[11px] text-slate-500 mt-1">Text Completion, Sentence Equivalence, Reading Comprehension</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Data Insights & Reading</span>
              <span className="text-2xl font-black text-emerald-600">200+ Questions</span>
              <p className="text-[11px] text-slate-500 mt-1">Data Sufficiency, Inference, Multi-Source Analysis</p>
            </div>
          </div>

          {/* Generator Controls */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Custom Topic Practice Generator
                </h3>
                <p className="text-xs text-slate-500">
                  Select parameters to generate custom sets from the 1,000+ question bank.
                </p>
              </div>

              <button
                onClick={() => generatePracticeDrill(examSelect, sectionSelect, topicSelect, difficultySelect, questionCountSelect)}
                disabled={generatingSet}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {generatingSet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{generatingSet ? 'Synthesizing...' : 'Generate Custom Practice Set'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Exam</label>
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
                  <option value="QUANTITATIVE">Quantitative</option>
                  <option value="VERBAL">Verbal</option>
                  <option value="READING">Reading</option>
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
                  <option value="Probability">Probability</option>
                  <option value="Algebra">Algebra</option>
                  <option value="Geometry">Geometry</option>
                  <option value="Data Analysis">Data Analysis</option>
                  <option value="Arithmetic">Arithmetic</option>
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
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Count</label>
                <select
                  value={questionCountSelect}
                  onChange={(e) => setQuestionCountSelect(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value={10}>10 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={25}>25 Questions</option>
                  <option value={50}>50 Questions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Generated Practice Runner */}
          {activePracticeSet && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                    {activePracticeSet.exam} • {activePracticeSet.section}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">({activePracticeSet.questions.length} Questions)</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 bg-slate-100 text-slate-800 font-mono text-sm font-bold rounded-xl flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>{formatTimer(practiceTimeRemaining)}</span>
                  </div>

                  {!practiceSubmitted ? (
                    <button
                      onClick={handleSubmitPractice}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Submit Set
                    </button>
                  ) : (
                    <button
                      onClick={() => generatePracticeDrill()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Another Set
                    </button>
                  )}
                </div>
              </div>

              {practiceSubmitted && practiceEvaluation && (
                <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-200 text-xs text-slate-800 space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Accuracy: {practiceEvaluation.accuracy_pct}%</span>
                    <span>Score: {practiceEvaluation.correct_count} / {practiceEvaluation.total_questions}</span>
                    <span>Avg Speed: {practiceEvaluation.average_time_per_question_sec}s/q</span>
                  </div>
                  <p className="text-slate-600">{practiceEvaluation.ai_feedback}</p>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-6">
                {activePracticeSet.questions.map((q, idx) => {
                  const userChoice = practiceAnswers[q.id];
                  const isCorrect = userChoice === q.correct_option;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl p-5 border transition ${
                        practiceSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50/40 border-emerald-300'
                            : 'bg-rose-50/40 border-rose-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-indigo-700">Q{idx + 1} • {q.topic}</span>
                        {practiceSubmitted && (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {isCorrect ? 'Correct (+1)' : 'Incorrect (Added to Mistake Bank)'}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-slate-900 whitespace-pre-line mb-3">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oidx) => (
                          <button
                            key={oidx}
                            disabled={practiceSubmitted}
                            onClick={() => setPracticeAnswers({ ...practiceAnswers, [q.id]: oidx })}
                            className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 cursor-pointer ${
                              practiceSubmitted
                                ? oidx === q.correct_option
                                  ? 'bg-emerald-100 border-emerald-500 font-bold text-emerald-950'
                                  : oidx === userChoice
                                  ? 'bg-rose-100 border-rose-500 text-rose-950'
                                  : 'bg-white border-slate-200 text-slate-400'
                                : userChoice === oidx
                                ? 'bg-indigo-50 border-indigo-600 font-bold text-indigo-900'
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

                      {practiceSubmitted && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-emerald-800 font-bold block mb-1">
                            Explanation: Option {String.fromCharCode(65 + q.correct_option)}
                          </strong>
                          {q.explanation}
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
      {/* TAB 3: FULL-LENGTH TIMED MOCK SIMULATOR */}
      {/* ============================================================== */}
      {activeTab === 'mock' && (
        <div className="space-y-6">
          {!mockInProgress && !mockEvaluation && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-3xl mx-auto space-y-6">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Official-Style Full Diagnostic Mock Exam</h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  Strict exam simulation with 4 sectional blocks, countdown timer, question palette, and adaptive scaling.
                </p>
              </div>

              <button
                onClick={handleStartMock}
                disabled={loadingMock}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2 mx-auto"
              >
                {loadingMock ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{loadingMock ? 'Building Mock...' : 'Start Full Mock Exam (90 Mins)'}</span>
              </button>
            </div>
          )}

          {mockInProgress && mockBlueprint && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase">OFFICIAL MOCK SIMULATION</span>
                  <h4 className="text-base font-extrabold text-slate-900">{mockBlueprint.sections[activeMockSectionIdx]?.name}</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-slate-900 text-white font-mono text-base font-extrabold rounded-xl flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>{formatTimer(mockTimeRemaining)}</span>
                  </div>
                  <button
                    onClick={handleSubmitMock}
                    disabled={submittingMock}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    {submittingMock ? 'Scoring...' : 'Submit Exam'}
                  </button>
                </div>
              </div>

              {/* Questions navigation */}
              {(() => {
                const currentSec = mockBlueprint.sections[activeMockSectionIdx];
                const currentQ = currentSec?.questions[activeMockQuestionIdx];
                if (!currentQ) return null;

                const userPick = mockAnswers[currentQ.id];

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Question {activeMockQuestionIdx + 1} of {currentSec.questions.length}</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {currentSec.questions.map((q, qidx) => (
                          <button
                            key={q.id}
                            onClick={() => setActiveMockQuestionIdx(qidx)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                              activeMockQuestionIdx === qidx
                                ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                                : mockAnswers[q.id] !== undefined
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            {qidx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50/60 rounded-2xl border border-slate-200 space-y-4">
                      <p className="text-base font-semibold text-slate-900 whitespace-pre-line">{currentQ.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentQ.options.map((opt, oidx) => (
                          <button
                            key={oidx}
                            onClick={() => setMockAnswers({ ...mockAnswers, [currentQ.id]: oidx })}
                            className={`p-3.5 rounded-xl border text-left text-xs font-medium transition flex items-center gap-3 cursor-pointer ${
                              userPick === oidx ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
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

                    <div className="flex justify-between items-center">
                      <button
                        disabled={activeMockQuestionIdx === 0}
                        onClick={() => setActiveMockQuestionIdx(activeMockQuestionIdx - 1)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition disabled:opacity-40 cursor-pointer"
                      >
                        ← Previous
                      </button>
                      <button
                        disabled={activeMockQuestionIdx === currentSec.questions.length - 1}
                        onClick={() => setActiveMockQuestionIdx(activeMockQuestionIdx + 1)}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-40 cursor-pointer"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {mockEvaluation && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Score: {mockEvaluation.total_scaled_score} / 340</h3>
                  <p className="text-xs text-slate-500">Range: {mockEvaluation.score_range}</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-indigo-50 px-3 py-1.5 rounded-xl text-center">
                    <span className="text-[10px] text-indigo-600 font-bold block">Quant</span>
                    <span className="text-base font-bold text-indigo-900">{mockEvaluation.quant_scaled_score}/170</span>
                  </div>
                  <div className="bg-purple-50 px-3 py-1.5 rounded-xl text-center">
                    <span className="text-[10px] text-purple-600 font-bold block">Verbal</span>
                    <span className="text-base font-bold text-purple-900">{mockEvaluation.verbal_scaled_score}/170</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {mockEvaluation.ai_strategic_advice}
              </p>
              <button
                onClick={() => {
                  setMockEvaluation(null);
                  setMockInProgress(false);
                }}
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Start New Mock
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PRACTICE MY MISTAKES */}
      {/* ============================================================== */}
      {activeTab === 'mistakes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              Active Mistake Bank ({mistakeBank?.total_unresolved || 0} Questions)
            </h3>
            <p className="text-xs text-slate-500">
              Questions you missed during practice sets, previous year papers, or mocks are automatically isolated here.
            </p>

            <div className="space-y-3 pt-2">
              {mistakeBank?.items.map((m) => (
                <div key={m.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-rose-800">{m.topic} • Missed {m.mistake_count}x</span>
                    <button
                      onClick={() => handleResolveMistake(m.question_id)}
                      className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 text-xs cursor-pointer"
                    >
                      ✓ Mark Mastered
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{m.question}</p>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                    <strong className="text-emerald-800 block">Correct: Option {String.fromCharCode(65 + m.correct_option)}</strong>
                    {m.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: DIAGNOSTIC ANALYTICS & BADGES */}
      {/* ============================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Solved Questions</span>
                  <span className="text-2xl font-black text-slate-900">{analyticsData.total_questions_solved}</span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Accuracy Rate</span>
                  <span className="text-2xl font-black text-emerald-600">{analyticsData.overall_accuracy_pct}%</span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Best Mock</span>
                  <span className="text-2xl font-black text-indigo-600">{analyticsData.best_mock_score}/340</span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Readiness</span>
                  <span className="text-2xl font-black text-amber-600">{analyticsData.predicted_target_days} Days</span>
                </div>
              </div>

              {/* Badges */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Unlocked Exam Badges
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {analyticsData.gamified_badges.map((b, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
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
      {/* TAB 6: AI WRITING & SPEAKING EVALUATOR */}
      {/* ============================================================== */}
      {activeTab === 'writing_speaking' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-600" />
              AI Essay Grader (IELTS / GRE)
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
              <strong className="block text-[11px] uppercase text-indigo-700 font-bold mb-1">Prompt:</strong>
              {writingPrompt}
            </div>
            <textarea
              rows={6}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Type or paste your essay here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={handleEvaluateWriting}
                disabled={evaluatingWriting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
              >
                {evaluatingWriting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{evaluatingWriting ? 'Analyzing...' : 'Grade Essay'}</span>
              </button>
            </div>

            {writingResult && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-emerald-700">Estimated Band: {writingResult.estimated_score_or_band}</span>
                <p className="text-slate-600">{writingResult.ai_critique}</p>
                <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
                  <strong className="block text-indigo-900 font-bold mb-1">Exemplar Rewrite:</strong>
                  {writingResult.band_8_rewrite_sample}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

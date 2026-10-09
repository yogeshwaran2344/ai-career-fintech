import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  Target,
  Layers,
  MessageSquare,
  FileCheck,
  ShieldCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

const AVAILABLE_ROLES = [
  'AI Engineer',
  'ML Engineer',
  'Full Stack Developer',
  'Data Scientist',
  'Backend Engineer',
  'Cloud/DevOps Engineer'
];

export default function InterviewArenaView({ profile, onRefresh }) {
  const [selectedRole, setSelectedRole] = useState(profile?.career_goal || 'AI Engineer');
  const [interviewState, setInterviewState] = useState('idle'); // 'idle' | 'in_progress' | 'evaluating' | 'completed'
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [showHints, setShowHints] = useState({});
  const [result, setResult] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Timer effect during active interview
  useEffect(() => {
    let interval = null;
    if (isTimerActive && interviewState === 'in_progress') {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, interviewState]);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startInterview = async () => {
    setLoadingQuestions(true);
    setResult(null);
    try {
      const data = await api.getMockInterviewQuestions(selectedRole);
      setQuestions(data || []);
      const initialAnswers = {};
      (data || []).forEach(q => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
      setActiveQuestionIdx(0);
      setShowHints({});
      setTimerSeconds(0);
      setIsTimerActive(true);
      setInterviewState('in_progress');
    } catch (err) {
      console.error('Failed to start interview:', err);
      alert('Failed to load interview questions. Please verify your connection.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswerChange = (qId, text) => {
    setAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const toggleHint = (qId) => {
    setShowHints(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const submitInterview = async () => {
    setIsTimerActive(false);
    setInterviewState('evaluating');
    try {
      const answersList = questions.map(q => ({
        question_id: q.id,
        user_answer: answers[q.id] || ''
      }));

      const evalResult = await api.evaluateMockInterview({
        role: selectedRole,
        answers: answersList
      });

      setResult(evalResult);
      setInterviewState('completed');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Interview evaluation error:', err);
      alert('Interview evaluation failed. Please retry submission.');
      setInterviewState('in_progress');
      setIsTimerActive(true);
    }
  };

  const answeredCount = Object.values(answers).filter(a => a && a.trim().length > 0).length;
  const currentQuestion = questions[activeQuestionIdx];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Executive Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-stone-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Career Arena
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                STAR Communication &amp; Technical AI Assessment
              </span>
            </div>
            <h1 className="text-xl font-black text-stone-900 tracking-tight">
              AI Interview &amp; Communication Arena
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Real-time multi-dimensional interview assessment. Evaluates your technical accuracy, system design trade-offs, STAR-format structured delivery, and algorithmic depth for competitive placement filters.
            </p>
          </div>

          {interviewState === 'in_progress' && (
            <div className="flex items-center gap-3 bg-stone-900 text-white px-4 py-2 rounded-xl shadow-xs self-start md:self-auto">
              <Clock className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Interview Timer</span>
                <span className="text-sm font-black font-mono">{formatTimer(timerSeconds)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Role Selection bar (only editable in idle state) */}
        {interviewState === 'idle' && (
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-stone-700 whitespace-nowrap">
                Target Evaluation Role:
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                {AVAILABLE_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <button
              onClick={startInterview}
              disabled={loadingQuestions}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loadingQuestions ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing Assessment...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-orange-400" />
                  <span>Start Mock Interview</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          STATE 1: IDLE / PRE-INTERVIEW BRIEFING
          ========================================================================= */}
      {interviewState === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs mb-1">
              1
            </div>
            <h3 className="text-xs font-black uppercase text-stone-900 tracking-wider">
              Technical Accuracy
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Analyzes algorithmic reasoning, time/space complexity analysis, and domain-specific frameworks (PyTorch, React, Vector DBs).
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-1">
              2
            </div>
            <h3 className="text-xs font-black uppercase text-stone-900 tracking-wider">
              System Architecture &amp; Scale
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Assesses trade-off awareness (latency vs. throughput, consistency vs. availability, indexing vs. write amplification).
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-1">
              3
            </div>
            <h3 className="text-xs font-black uppercase text-stone-900 tracking-wider">
              STAR Communication Format
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tests Situation, Task, Action, and measurable Result articulation to eliminate unstructured rambling.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE 2: ACTIVE INTERVIEW SESSION
          ========================================================================= */}
      {interviewState === 'in_progress' && currentQuestion && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-6">
          {/* Question Stepper Header */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-stone-100 gap-3">
            <div className="flex items-center gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id]?.trim().length > 0;
                const isActive = idx === activeQuestionIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-xs'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-stone-500">
              <span>Answered: {answeredCount} / {questions.length}</span>
              <span className="text-stone-300">•</span>
              <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                {currentQuestion.category}
              </span>
              <span className="text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                Difficulty: {currentQuestion.difficulty}
              </span>
            </div>
          </div>

          {/* Active Question Display */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-sm flex-shrink-0 mt-0.5">
                Q{activeQuestionIdx + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-extrabold text-stone-900 leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>
            </div>

            {/* Expandable Coach Hint */}
            {currentQuestion.sample_hint && (
              <div>
                <button
                  type="button"
                  onClick={() => toggleHint(currentQuestion.id)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHints[currentQuestion.id] ? 'Hide Interview Coach Guidance' : 'View Interview Coach Guidance (Key Concepts to Cover)'}</span>
                </button>
                {showHints[currentQuestion.id] && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    💡 <strong>Coach Tip:</strong> {currentQuestion.sample_hint}
                  </div>
                )}
              </div>
            )}

            {/* Answer Input Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                Your Answer / Technical Architecture Explanation:
              </label>
              <textarea
                rows={7}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Structure your answer clearly: 1. Core definition & approach, 2. Technical mechanisms and data flow, 3. Architectural trade-offs or measurable results..."
                className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-sans leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>
                  Word count: <strong>{(answers[currentQuestion.id] || '').trim().split(/\s+/).filter(Boolean).length}</strong> words
                  {(answers[currentQuestion.id] || '').trim().split(/\s+/).filter(Boolean).length > 30 ? (
                    <span className="text-emerald-600 font-bold ml-1.5">✓ Solid depth</span>
                  ) : (
                    <span className="text-amber-600 font-bold ml-1.5">(Aim for &ge;30 words with trade-offs)</span>
                  )}
                </span>
                <span className="text-stone-400">All responses saved locally</span>
              </div>
            </div>
          </div>

          {/* Stepper Navigation & Submission */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              onClick={() => setActiveQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={activeQuestionIdx === 0}
              className="px-4 py-2 rounded-xl text-stone-700 hover:bg-stone-100 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
            >
              ← Previous Question
            </button>

            <div className="flex items-center gap-2">
              {activeQuestionIdx < questions.length - 1 ? (
                <button
                  onClick={() => setActiveQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={submitInterview}
                  disabled={answeredCount === 0}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit for Multi-Pillar AI Evaluation</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE 3: EVALUATING ANIMATION
          ========================================================================= */}
      {interviewState === 'evaluating' && (
        <div className="bg-white rounded-2xl p-12 border border-stone-200/80 shadow-xs text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
          <h3 className="text-base font-black text-stone-900">
            Evaluating Interview Responses...
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            Running multi-pillar NLP heuristic scoring across technical terminology density, architectural trade-off articulation, and STAR-framework communication structure.
          </p>
        </div>
      )}

      {/* =========================================================================
          STATE 4: COMPREHENSIVE EVALUATION DASHBOARD
          ========================================================================= */}
      {interviewState === 'completed' && result && (
        <div className="space-y-6">
          {/* Executive Score Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Evaluation Complete
                  </span>
                  <span className="text-xs font-bold text-stone-400">
                    Role: {result.role}
                  </span>
                </div>
                <h2 className="text-lg font-black text-stone-900 mt-1">
                  Interview Performance Assessment
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Composite Score</span>
                  <div className="text-3xl font-black text-stone-900">
                    {result.scores?.overall || 75}<span className="text-base text-stone-400 font-normal">/100</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-800 font-black block uppercase">Readiness Impact</span>
                  <span className="text-sm font-black text-emerald-700">
                    +{result.readiness_impact || 4}%
                  </span>
                </div>
              </div>
            </div>

            {/* 5-Pillar Score Bar Radar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Technical Depth', val: result.scores?.technical || 70, color: 'bg-blue-600' },
                { label: 'Accuracy', val: result.scores?.accuracy || 68, color: 'bg-emerald-600' },
                { label: 'Communication', val: result.scores?.communication || 75, color: 'bg-indigo-600' },
                { label: 'STAR Structure', val: result.scores?.structure || 65, color: 'bg-amber-600' },
                { label: 'Confidence', val: result.scores?.confidence || 72, color: 'bg-orange-600' }
              ].map((metric, i) => (
                <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-stone-600 truncate">{metric.label}</span>
                    <span className="font-black text-stone-900">{metric.val}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${metric.color}`}
                      style={{ width: `${metric.val}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actionable Feedback text */}
            <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl text-xs text-orange-950 leading-relaxed space-y-1">
              <span className="font-black text-orange-900 block uppercase tracking-wider text-[11px]">
                AI Evaluator Executive Feedback:
              </span>
              <p>{result.actionable_feedback}</p>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-emerald-50/40 border border-emerald-200/80 rounded-xl space-y-2">
                <span className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Identified Strengths
                </span>
                <ul className="space-y-1.5 text-xs text-emerald-950">
                  {result.strengths?.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-rose-50/40 border border-rose-200/80 rounded-xl space-y-2">
                <span className="text-xs font-black uppercase text-rose-900 tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Areas to Polish Prior to Interviews
                </span>
                <ul className="space-y-1.5 text-xs text-rose-950">
                  {result.areas_to_improve?.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action controls */}
            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-stone-100 gap-3">
              <span className="text-xs text-stone-500 font-medium">
                New Overall Placement Readiness: <strong className="text-stone-900 font-bold">{result.new_readiness_pct}%</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setInterviewState('idle');
                    setResult(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Practice Another Role</span>
                </button>

                <button
                  onClick={startInterview}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-orange-400" />
                  <span>Retake Interview</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

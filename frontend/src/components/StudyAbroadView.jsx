import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronRight,
  ChevronDown,
  Building,
  MapPin,
  TrendingUp,
  Percent,
  ShieldCheck,
  AlertCircle,
  Check,
  Search,
  Filter,
  Calculator,
  Landmark,
  Briefcase,
  Sliders,
  HelpCircle,
  Send,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckSquare,
  Square,
  Plane,
  FileCheck,
  Eye,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

export default function StudyAbroadView({ profile, onNavigate }) {
  // Navigation: 6 Stages + Master Roadmap
  // 'matcher', 'examprep', 'cost_funding', 'applications', 'sop_docs', 'visa_prep', 'roadmap'
  const [activeTab, setActiveTab] = useState('matcher');

  // Central Overview Data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Student Profile Context Tuning
  const [userCgpa, setUserCgpa] = useState(profile?.cgpa || 8.4);
  const [targetProgram, setTargetProgram] = useState('MS in Computer Science & Artificial Intelligence');
  const [targetIntake, setTargetIntake] = useState('Fall 2027');
  const [maxBudgetLakhs, setMaxBudgetLakhs] = useState(40); // ₹40 Lakhs max

  // Feedback Notification Banner
  const [actionNotice, setActionNotice] = useState(null);

  const showNotice = (msg, type = 'success') => {
    setActionNotice({ msg, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // ==================== STAGE 2: SMART UNIVERSITY MATCHER STATE ====================
  const [uniSearchQuery, setUniSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [expandedUniId, setExpandedUniId] = useState(null);
  const [addingToAppsId, setAddingToAppsId] = useState(null);

  // ==================== STAGE 3: EXAM PREPARATION ENGINE STATE ====================
  const [examType, setExamType] = useState('IELTS'); // 'IELTS' or 'GRE'
  const [examSubTab, setExamSubTab] = useState('practice'); // 'practice', 'active_test', 'mistakes', 'analytics'
  const [selectedSection, setSelectedSection] = useState('READING');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [practiceQuestionCount, setPracticeQuestionCount] = useState(5);
  const [generatingPractice, setGeneratingPractice] = useState(false);
  const [activePracticeSet, setActivePracticeSet] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [testTimeRemaining, setTestTimeRemaining] = useState(600);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testEvaluationResult, setTestEvaluationResult] = useState(null);

  // Mistakes Bank & Analytics
  const [mistakesList, setMistakesList] = useState([]);
  const [loadingMistakes, setLoadingMistakes] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // ==================== STAGE 4: TOTAL COST & FUNDING PLANNER STATE ====================
  const [fundingCountry, setFundingCountry] = useState('DEU');
  const [fundingUniName, setFundingUniName] = useState('Technical University of Munich (TUM)');
  const [expectedScholarship, setExpectedScholarship] = useState(200000);
  const [familySupport, setFamilySupport] = useState(400000);
  const [includeOnCampusWork, setIncludeOnCampusWork] = useState(true);
  const [fundingPlanData, setFundingPlanData] = useState(null);
  const [loadingFundingPlan, setLoadingFundingPlan] = useState(false);

  // ==================== STAGE 5: APPLICATION COMMAND CENTER STATE ====================
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    university_name: '',
    program_name: 'MS in Artificial Intelligence',
    country: 'Germany',
    tier: 'TARGET',
    deadline: 'Jan 15, 2027',
    portal_url: ''
  });

  // ==================== STAGE 6: SOP & LOR DOCUMENT AUDITOR STATE ====================
  const [sopTargetUni, setSopTargetUni] = useState('Technical University of Munich (TUM)');
  const [sopTargetProgram, setSopTargetProgram] = useState('M.Sc. Informatics');
  const [sopDraftInput, setSopDraftInput] = useState(
    'My undergraduate engineering investigations at the intersection of distributed systems and machine learning crystallized my ambition to pursue the M.Sc. Informatics at TUM. In my capstone implementation, I architected a high-throughput retrieval pipeline that reduced p95 latency from 420ms to 85ms across a corpus of 100,000 documents. At TUM, I am specifically drawn to the pioneering work conducted in the Intelligent Systems Group.'
  );
  const [auditingSop, setAuditingSop] = useState(false);
  const [sopAuditResult, setSopAuditResult] = useState(null);
  const [generatingTemplateSop, setGeneratingTemplateSop] = useState(false);
  const [templateSopResult, setTemplateSopResult] = useState(null);

  // ==================== STAGE 7: VISA & PRE-DEPARTURE ASSISTANT STATE ====================
  const [visaCountry, setVisaCountry] = useState('DEU');
  const [visaData, setVisaData] = useState(null);
  const [loadingVisa, setLoadingVisa] = useState(false);
  const [checkedPreDepartureItems, setCheckedPreDepartureItems] = useState({});

  // ==================== CENTRAL DATA LOADING ====================
  const loadCentralOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudyAbroadOverview();
      setData(res);
      if (res.target_program) setTargetProgram(res.target_program);
      if (res.target_intake) setTargetIntake(res.target_intake);
    } catch (err) {
      console.error('Failed to load study abroad overview:', err);
      setError('Unable to synchronize study abroad parameters. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await api.getStudyAbroadApplications();
      setApplications(res || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const loadFundingPlan = async (cCode = fundingCountry, uName = fundingUniName) => {
    try {
      setLoadingFundingPlan(true);
      const res = await api.getCostFundingPlan({
        university_name: uName,
        country_code: cCode,
        expected_scholarship_inr: Number(expectedScholarship) || 0,
        family_support_inr: Number(familySupport) || 0,
        include_on_campus_job: includeOnCampusWork
      });
      setFundingPlanData(res);
    } catch (err) {
      console.error('Failed to load funding plan:', err);
    } finally {
      setLoadingFundingPlan(false);
    }
  };

  const loadVisaGuidance = async (cCode = visaCountry) => {
    try {
      setLoadingVisa(true);
      const res = await api.getVisaGuidance(cCode);
      setVisaData(res);
    } catch (err) {
      console.error('Failed to load visa guidance:', err);
    } finally {
      setLoadingVisa(false);
    }
  };

  const loadMistakes = async (eType = examType) => {
    try {
      setLoadingMistakes(true);
      const res = await api.getMistakeBank(eType);
      setMistakesList(res?.mistakes || []);
    } catch (err) {
      console.error('Failed to load mistakes bank:', err);
    } finally {
      setLoadingMistakes(false);
    }
  };

  const loadAnalytics = async (eType = examType) => {
    try {
      const res = await api.getExamAnalytics(eType);
      setAnalyticsData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    loadCentralOverview();
    loadApplications();
    loadFundingPlan('DEU', 'Technical University of Munich (TUM)');
    loadVisaGuidance('DEU');
    loadMistakes('IELTS');
    loadAnalytics('IELTS');
  }, []);

  // Timer countdown for active exam practice
  useEffect(() => {
    let timerId = null;
    if (activePracticeSet && !testSubmitted && testTimeRemaining > 0) {
      timerId = setInterval(() => {
        setTestTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            handleSubmitPracticeSet();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [activePracticeSet, testSubmitted, testTimeRemaining]);

  // ==================== MATCHER LOGIC ====================
  const shortlisted_universities = data?.shortlisted_universities || [];

  const filteredUnis = useMemo(() => {
    return shortlisted_universities.filter((uni) => {
      // Search text
      if (uniSearchQuery.trim()) {
        const q = uniSearchQuery.toLowerCase();
        const matchName = uni.university_name.toLowerCase().includes(q);
        const matchProg = uni.program_name.toLowerCase().includes(q);
        const matchCountry = uni.country.toLowerCase().includes(q);
        if (!matchName && !matchProg && !matchCountry) return false;
      }
      // Country Filter
      if (countryFilter !== 'ALL') {
        const cCode = countryFilter.toUpperCase();
        const uniC = uni.country.toUpperCase();
        if (cCode === 'DEU' && !uniC.includes('GERMANY')) return false;
        if (cCode === 'USA' && !uniC.includes('UNITED STATES') && !uniC.includes('USA')) return false;
        if (cCode === 'CAN' && !uniC.includes('CANADA')) return false;
        if (cCode === 'GBR' && !uniC.includes('KINGDOM') && !uniC.includes('UK')) return false;
        if (cCode === 'AUS' && !uniC.includes('AUSTRALIA')) return false;
      }
      // Tier Filter
      if (tierFilter !== 'ALL' && uni.tier !== tierFilter) return false;
      return true;
    });
  }, [shortlisted_universities, uniSearchQuery, countryFilter, tierFilter]);

  // Group by Ambitious, Target, Safe
  const ambitiousUnis = filteredUnis.filter((u) => u.tier === 'AMBITIOUS');
  const targetUnis = filteredUnis.filter((u) => u.tier === 'TARGET');
  const safeUnis = filteredUnis.filter((u) => u.tier === 'SAFE');

  const handleAddUniToApplications = async (uni) => {
    try {
      setAddingToAppsId(uni.id);
      const res = await api.createStudyAbroadApplication({
        university_name: uni.university_name,
        program_name: uni.program_name,
        country: uni.country,
        tier: uni.tier,
        deadline: uni.application_deadline,
        portal_url: uni.official_portal_url
      });
      setApplications((prev) => [res, ...prev]);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      showNotice(`Successfully added ${uni.university_name} to Application Command Center!`);
    } catch (err) {
      console.error('Failed to add university application:', err);
      showNotice('Failed to track university. Please try again.', 'error');
    } finally {
      setAddingToAppsId(null);
    }
  };

  // ==================== EXAM PREP HANDLERS ====================
  const handleGeneratePracticeSet = async () => {
    try {
      setGeneratingPractice(true);
      const res = await api.generatePracticeSet({
        exam: examType,
        section: selectedSection,
        difficulty: selectedDifficulty,
        question_count: practiceQuestionCount
      });
      setActivePracticeSet(res);
      setPracticeAnswers({});
      setTestTimeRemaining(res.time_limit_minutes * 60 || 600);
      setTestSubmitted(false);
      setTestEvaluationResult(null);
      setExamSubTab('active_test');
    } catch (err) {
      console.error('Failed to generate practice set:', err);
      showNotice('Unable to generate practice set. Check server connectivity.', 'error');
    } finally {
      setGeneratingPractice(false);
    }
  };

  const handleSelectPracticeOption = (questionId, optionIdx) => {
    if (testSubmitted) return;
    setPracticeAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitPracticeSet = async () => {
    if (!activePracticeSet || testSubmitted) return;
    try {
      setTestSubmitted(true);
      const timeSpent = Math.max((activePracticeSet.time_limit_minutes * 60) - testTimeRemaining, 60);
      const res = await api.submitPracticeSet({
        set_id: activePracticeSet.set_id,
        exam: activePracticeSet.exam,
        section: activePracticeSet.section,
        answers: practiceAnswers,
        time_spent_seconds: timeSpent
      });
      setTestEvaluationResult(res);
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
      const acc = res.accuracy_pct ?? res.score_percentage ?? 0;
      showNotice(`Practice Set Graded: Accuracy ${acc}%!`);
      // Refresh mistakes bank & analytics in background
      loadMistakes(examType);
      loadAnalytics(examType);
    } catch (err) {
      console.error('Failed to submit practice set:', err);
      showNotice('Failed to submit set for evaluation.', 'error');
    }
  };

  const handleResolveMistake = async (qId) => {
    try {
      await api.resolveMistake(qId);
      setMistakesList((prev) => prev.filter((m) => m.question_id !== qId));
      showNotice('Mistake marked as resolved and mastered!');
    } catch (err) {
      console.error('Failed to resolve mistake:', err);
    }
  };

  // ==================== APPLICATION COMMAND CENTER HANDLERS ====================
  const handleToggleChecklist = async (appId, chkKey, currentVal) => {
    try {
      const updatedChecklist = { [chkKey]: !currentVal };
      const updated = await api.updateStudyAbroadApplication(appId, {
        checklist: updatedChecklist
      });
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
    } catch (err) {
      console.error('Failed to update checklist item:', err);
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      const updated = await api.updateStudyAbroadApplication(appId, {
        status: newStatus
      });
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      showNotice(`Application stage updated to "${newStatus}"!`);
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  const handleDeleteApplication = async (appId) => {
    try {
      await api.deleteStudyAbroadApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      showNotice('Application removed from tracker.');
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const handleCreateNewApp = async (e) => {
    e.preventDefault();
    if (!newAppForm.university_name.trim()) return;
    try {
      const created = await api.createStudyAbroadApplication(newAppForm);
      setApplications((prev) => [created, ...prev]);
      setShowAddAppModal(false);
      setNewAppForm({
        university_name: '',
        program_name: 'MS in Artificial Intelligence',
        country: 'Germany',
        tier: 'TARGET',
        deadline: 'Jan 15, 2027',
        portal_url: ''
      });
      showNotice('New university application created!');
    } catch (err) {
      console.error('Failed to create application:', err);
    }
  };

  // ==================== SOP & LOR HANDLERS ====================
  const handleAuditSop = async () => {
    if (!sopDraftInput.trim()) return;
    try {
      setAuditingSop(true);
      const res = await api.critiqueSopDraft({
        target_university: sopTargetUni,
        target_program: sopTargetProgram,
        sop_draft_text: sopDraftInput
      });
      setSopAuditResult(res);
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
      showNotice(`SOP Audited: Overall Score ${res.overall_score}/100!`);
    } catch (err) {
      console.error('Failed to audit SOP:', err);
      showNotice('SOP audit failed. Ensure server is online.', 'error');
    } finally {
      setAuditingSop(false);
    }
  };

  const handleGenerateTemplateSop = async () => {
    try {
      setGeneratingTemplateSop(true);
      const res = await api.generateSopLor({
        target_university: sopTargetUni,
        target_program: sopTargetProgram,
        specific_research_interest: 'Distributed Deep Learning & High-Throughput Inference Systems',
        target_professor_or_lab: 'Autonomous Systems & Foundations Lab'
      });
      setTemplateSopResult(res);
      setSopDraftInput(res.sop_text);
      showNotice('Generated tailored SOP and LOR references from your verified profile!');
    } catch (err) {
      console.error('Failed to generate template SOP:', err);
    } finally {
      setGeneratingTemplateSop(false);
    }
  };

  // ==================== FORMATTERS ====================
  const formatInr = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ==================== JOURNEY STAGE DEF ====================
  const JOURNEY_STAGES = [
    { id: 'matcher', label: '1. University Matcher', sublabel: 'Ambitious, Target, Safe', icon: GraduationCap },
    { id: 'examprep', label: '2. Exam Preparation Engine', sublabel: 'IELTS & GRE Questions', icon: BookOpen },
    { id: 'cost_funding', label: '3. Total Cost & Funding', sublabel: 'Tuition, Living & Gap', icon: DollarSign },
    { id: 'applications', label: '4. Application Command Center', sublabel: 'Checklists & Deadlines', icon: FileCheck },
    { id: 'sop_docs', label: '5. SOP, LOR & Documents', sublabel: 'Critique & Evidence Audit', icon: FileText },
    { id: 'visa_prep', label: '6. Visa & Pre-Departure', sublabel: 'Blocked Account & Official Steps', icon: Plane },
    { id: 'roadmap', label: '7. 12-Month Road Map', sublabel: 'Full Phase Timeline', icon: Calendar },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all transform animate-bounce ${
            actionNotice.type === 'error'
              ? 'bg-rose-900 text-rose-100 border border-rose-700'
              : 'bg-indigo-950 text-indigo-100 border border-indigo-700'
          }`}
        >
          {actionNotice.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <Sparkles className="w-5 h-5 text-emerald-400" />}
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* HERO COPILOT HEADER WITH JOURNEY NAVIGATOR */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/50 pb-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Globe className="w-4 h-4 text-indigo-400" />
                End-to-End Study Abroad Copilot
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Master's & Global University Journey
              </h1>
              <p className="text-sm text-indigo-200/80 mt-1 max-w-2xl">
                From finding reach vs target universities to official exam preparation, comprehensive cost planning, tailored SOP auditing, and verified visa checklists.
              </p>
            </div>

            {/* Quick Profile Snapshot Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                <span className="text-indigo-300">CGPA:</span> <strong className="text-white">{userCgpa}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                <span className="text-indigo-300">Intake:</span> <strong className="text-emerald-300">{targetIntake}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Sources: Oct 2026
              </div>
            </div>
          </div>

          {/* 6-STAGE JOURNEY TRACKER TABS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 pt-1">
            {JOURNEY_STAGES.map((st) => {
              const Icon = st.icon;
              const isActive = activeTab === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setActiveTab(st.id)}
                  className={`flex flex-col items-start p-3 rounded-2xl text-left transition cursor-pointer border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-300'}`} />
                    {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </div>
                  <div className="text-xs font-bold line-clamp-1">{st.label}</div>
                  <div className={`text-[10px] line-clamp-1 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {st.sublabel}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STAGE 1 & 2: SMART UNIVERSITY MATCHER (P0) */}
      {/* ============================================================== */}
      {activeTab === 'matcher' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Smart University Matcher
                </h3>
                <p className="text-xs text-slate-500">
                  Categorized into Ambitious, Target, and Safer choices based on your academic profile ({userCgpa} CGPA).
                </p>
              </div>

              {/* Legal Non-Guarantee Disclaimer */}
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Admissions are competitive and not guaranteed. Evaluation includes research & recommendations.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search college, program..."
                  value={uniSearchQuery}
                  onChange={(e) => setUniSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Country Filter */}
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-600"
              >
                <option value="ALL">All Countries 🌍</option>
                <option value="DEU">Germany 🇩🇪 (Tuition-free / High ROI)</option>
                <option value="USA">United States 🇺🇸 (Silicon Valley / Top Pay)</option>
                <option value="CAN">Canada 🇨🇦 (AI & Co-op Research)</option>
                <option value="GBR">United Kingdom 🇬🇧 (1-Year Masters)</option>
                <option value="AUS">Australia 🇦🇺 (PSW Visa)</option>
              </select>

              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-600"
              >
                <option value="ALL">All Match Tiers</option>
                <option value="AMBITIOUS">Ambitious (Reach)</option>
                <option value="TARGET">Target (Solid Fit)</option>
                <option value="SAFE">Safer (High Admit Probability)</option>
              </select>

              {/* Target CGPA Quick Tuner */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 whitespace-nowrap">Your CGPA:</span>
                <input
                  type="number"
                  min="6.0"
                  max="10.0"
                  step="0.1"
                  value={userCgpa}
                  onChange={(e) => setUserCgpa(parseFloat(e.target.value) || 8.0)}
                  className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* Three Categorized Sections */}
          {[
            {
              tier: 'AMBITIOUS',
              title: 'Ambitious (Reach Institutions)',
              badge: 'bg-rose-50 text-rose-700 border-rose-200',
              desc: 'High prestige and world-leading faculty. Admission requires outstanding research experience, stellar SOP, and high test scores.',
              unis: ambitiousUnis
            },
            {
              tier: 'TARGET',
              title: 'Target (Solid Academic Match)',
              badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              desc: 'Strong correlation with your CGPA and prerequisite coursework. Realistic core options for your application strategy.',
              unis: targetUnis
            },
            {
              tier: 'SAFE',
              title: 'Safer Choices (High Admit Probability)',
              badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              desc: 'Your academic profile comfortably exceeds minimum admission cutoffs, securing a dependable admission foundation.',
              unis: safeUnis
            }
          ].map((sec) => (
            <div key={sec.tier} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${sec.badge}`}>
                    {sec.unis.length} {sec.tier}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{sec.title}</h4>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">{sec.desc}</p>
              </div>

              {sec.unis.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-6 text-center text-xs text-slate-500 border border-slate-200">
                  No universities matching your current filter in this category.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sec.unis.map((u) => {
                    const isExpanded = expandedUniId === u.id;
                    return (
                      <div
                        key={u.id}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm transition p-5 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Top Row: Country, Flag, QS Rank */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                              <span>{u.flag}</span> {u.country}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                                QS #{u.qs_world_ranking}
                              </span>
                              {u.is_stem_certified && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                  STEM Certified
                                </span>
                              )}
                            </div>
                          </div>

                          {/* University Name & Program */}
                          <div>
                            <h4 className="text-base font-bold text-slate-900">{u.university_name}</h4>
                            <p className="text-xs text-indigo-700 font-medium mt-0.5">{u.program_name}</p>
                          </div>

                          {/* Why this matches you */}
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-700 space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              Why This Matches You:
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-600">{u.match_reason}</p>
                          </div>

                          {/* Tuition & Cost Metrics */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                              <span className="text-[10px] text-slate-500 block">Annual Tuition</span>
                              <strong className="text-slate-900 font-bold">
                                {u.annual_tuition_inr < 100000 ? 'Free / €0 (Public)' : formatInr(u.annual_tuition_inr)}
                              </strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">${u.annual_tuition_usd?.toLocaleString()}/yr</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">Est. Living Expenses</span>
                              <strong className="text-slate-900 font-bold">{formatInr(u.annual_living_inr)}</strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Approx. per year</span>
                            </div>
                          </div>

                          {/* Prerequisites & Requirements Pill Grid */}
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[11px] font-bold text-slate-700">Requirements & Test Benchmarks:</div>
                            <div className="flex flex-wrap gap-1.5 text-[10px]">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                Min CGPA: {u.min_cgpa_cutoff}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                GRE: {u.gre_requirement}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                IELTS: {u.ielts_requirement}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-200">
                                Deadline: {u.application_deadline}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Details Drawer */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 text-xs">
                              {/* Prerequisites */}
                              <div>
                                <span className="font-bold text-slate-900 block mb-1">Academic Prerequisites:</span>
                                <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                                  {(u.academic_prerequisites || []).map((p, idx) => (
                                    <li key={idx}>{p}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Missing Requirements Warnings */}
                              {u.missing_requirements?.length > 0 && (
                                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                                  <strong className="block font-bold mb-0.5">Missing Documents & Actions:</strong>
                                  <ul className="list-disc pl-4 space-y-0.5">
                                    {u.missing_requirements.map((m, idx) => (
                                      <li key={idx}>{m}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Source Verification Tag */}
                              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                <span>Source: {u.source_info}</span>
                                <span>Verified: {u.last_verified_date}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setExpandedUniId(isExpanded ? null : u.id)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            {isExpanded ? 'Hide Details' : 'View Requirements & Missing Info'}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddUniToApplications(u)}
                              disabled={addingToAppsId === u.id}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{addingToAppsId === u.id ? 'Adding...' : 'Track'}</span>
                            </button>

                            <a
                              href={u.official_portal_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 3: EXAM PREPARATION ENGINE (P0) */}
      {/* ============================================================== */}
      {activeTab === 'examprep' && (
        <div className="space-y-6">
          {/* Sub-Header with Exam Switcher (IELTS vs GRE) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <BookOpen className="w-4 h-4" />
                Adaptive Question Bank & Diagnostic Testing
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Exam Preparation Engine: {examType}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Practice verified question banks, test retention under realistic timers, and review saved errors in your Mistakes Bank.
              </p>
            </div>

            {/* Exam Selector Toggle */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                onClick={() => {
                  setExamType('IELTS');
                  setSelectedSection('READING');
                  loadMistakes('IELTS');
                  loadAnalytics('IELTS');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  examType === 'IELTS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                IELTS Academic 🇬🇧
              </button>
              <button
                onClick={() => {
                  setExamType('GRE');
                  setSelectedSection('QUANTITATIVE');
                  loadMistakes('GRE');
                  loadAnalytics('GRE');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  examType === 'GRE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                GRE General 🇺🇸
              </button>
            </div>
          </div>

          {/* Sub-Navigation for Exam Prep Engine */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'practice', label: '1. Practice Generator & Mocks', icon: Play },
              { id: 'mistakes', label: `2. Mistakes Bank (${mistakesList.length})`, icon: AlertCircle },
              { id: 'analytics', label: '3. Analytics & Topic Weaknesses', icon: TrendingUp }
            ].map((sub) => {
              const Icon = sub.icon;
              const isActive = examSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setExamSubTab(sub.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* SUB-VIEW 1: PRACTICE GENERATOR & ACTIVE TEST */}
          {examSubTab === 'practice' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  Configure Timed Practice Session for {examType}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Section Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Section</label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white"
                    >
                      {examType === 'IELTS' ? (
                        <>
                          <option value="READING">Reading (Academic Texts & Inference)</option>
                          <option value="LISTENING">Listening (Audio Lectures & Details)</option>
                          <option value="WRITING">Writing (Task 1 Data & Syntactic Range)</option>
                        </>
                      ) : (
                        <>
                          <option value="QUANTITATIVE">Quantitative Reasoning (Math & Data)</option>
                          <option value="VERBAL">Verbal Reasoning (Vocab & Reading)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white"
                    >
                      <option value="All">Adaptive Mix (All Difficulties)</option>
                      <option value="Easy">Easy (Foundation Recall)</option>
                      <option value="Medium">Medium (Standard Exam Benchmarks)</option>
                      <option value="Hard">Hard (High-Percentile Questions)</option>
                    </select>
                  </div>

                  {/* Question Count */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Session Size</label>
                    <select
                      value={practiceQuestionCount}
                      onChange={(e) => setPracticeQuestionCount(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white"
                    >
                      <option value={5}>5 Questions (~8 minutes)</option>
                      <option value={10}>10 Questions (~15 minutes)</option>
                      <option value={15}>15 Questions (Full Section Mock)</option>
                    </select>
                  </div>

                  {/* Start Button */}
                  <div className="flex items-end">
                    <button
                      onClick={handleGeneratePracticeSet}
                      disabled={generatingPractice}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      <span>{generatingPractice ? 'Generating Set...' : 'Launch Timed Practice'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Ready-to-solve or active test notice */}
              {!activePracticeSet && (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    No active practice set in progress
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Select your target section and click "Launch Timed Practice" to start solving real randomized exam questions with instant scoring and explanations.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE TEST SOLVING INTERFACE */}
          {(examSubTab === 'active_test' || (activePracticeSet && examSubTab === 'practice')) && activePracticeSet && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
              {/* Active Test Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    Active Practice Session • {activePracticeSet.exam} ({activePracticeSet.section})
                  </span>
                  <h4 className="text-base font-bold text-slate-900">
                    {activePracticeSet.questions.length} Questions • {activePracticeSet.topic}
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  {/* Countdown Timer */}
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                      testTimeRemaining < 120
                        ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{formatTimer(testTimeRemaining)}</span>
                  </div>

                  {!testSubmitted ? (
                    <button
                      onClick={handleSubmitPracticeSet}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Submit for Evaluation</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActivePracticeSet(null);
                        setTestEvaluationResult(null);
                        setExamSubTab('practice');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Start New Session
                    </button>
                  )}
                </div>
              </div>

              {/* Evaluation Results Banner (when submitted) */}
              {testEvaluationResult && (
                <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                      Diagnostic Evaluation Summary
                    </span>
                    <span className="text-lg font-black text-emerald-400">
                      {testEvaluationResult.accuracy_pct ?? testEvaluationResult.score_percentage}% Accuracy
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 leading-relaxed">
                    {testEvaluationResult.ai_feedback ?? testEvaluationResult.diagnostic_summary}
                  </p>
                  <div className="text-[11px] text-indigo-300 pt-1">
                    Incorrect answers have been saved to your <strong>Mistakes Bank</strong> for spaced repetition.
                  </div>
                </div>
              )}

              {/* Question List */}
              <div className="space-y-6">
                {activePracticeSet.questions.map((q, idx) => {
                  const selectedIdx = practiceAnswers[q.id];
                  const isSubmitted = testSubmitted;
                  const isCorrect = isSubmitted && selectedIdx === q.correct_option;
                  const isWrong = isSubmitted && selectedIdx !== undefined && selectedIdx !== q.correct_option;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border transition space-y-4 ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : isWrong
                          ? 'border-rose-300 bg-rose-50/20'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold text-slate-800">Question {idx + 1} of {activePracticeSet.questions.length}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                            {q.topic}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                            {q.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="text-sm font-semibold text-slate-900 whitespace-pre-line leading-relaxed">
                        {q.question}
                      </p>

                      {/* Options Radio List */}
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = selectedIdx === oIdx;
                          let optStyle = 'border-slate-200 hover:border-slate-300 text-slate-800';

                          if (isSubmitted) {
                            if (oIdx === q.correct_option) {
                              optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                            } else if (isOptionSelected) {
                              optStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                            }
                          } else if (isOptionSelected) {
                            optStyle = 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={isSubmitted}
                              onClick={() => handleSelectPracticeOption(q.id, oIdx)}
                              className={`w-full p-3 rounded-xl border text-left text-xs flex items-center justify-between transition cursor-pointer ${optStyle}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isSubmitted && oIdx === q.correct_option && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation & Mistake Analysis when submitted */}
                      {isSubmitted && (
                        <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                          <div>
                            <span className="font-bold text-slate-900 block">Explanation:</span>
                            <p className="text-slate-700 leading-relaxed mt-0.5">{q.explanation}</p>
                          </div>
                          {q.mistake_analysis && (
                            <div className="text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-[11px]">
                              <strong>Common Pitfall:</strong> {q.mistake_analysis}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400">
                            Concept Tested: <strong>{q.concept_tested}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: MISTAKES BANK */}
          {examSubTab === 'mistakes' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    Personal Mistakes Bank ({examType})
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Incorrect practice questions are saved automatically. Review and resolve them to build permanent retention.
                  </p>
                </div>
                <button
                  onClick={() => loadMistakes(examType)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingMistakes ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading mistakes...</div>
              ) : mistakesList.length === 0 ? (
                <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h5 className="text-sm font-bold text-emerald-950">Mistakes Bank is Completely Clear!</h5>
                  <p className="text-xs text-emerald-700">
                    You have no active unresolved errors for {examType}. Take another practice session to test higher difficulty levels!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mistakesList.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                            {m.topic}
                          </span>
                          <span className="text-slate-400 text-[11px]">Logged: {m.logged_date}</span>
                        </div>
                        <button
                          onClick={() => handleResolveMistake(m.question_id)}
                          className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-slate-900 whitespace-pre-line leading-relaxed">
                        {m.question_text}
                      </p>

                      <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
                        <div className="text-slate-700">
                          <strong>Correct Answer:</strong> {m.correct_answer_text}
                        </div>
                        <div className="text-rose-700 text-[11px]">
                          <strong>Mistake Diagnosis:</strong> {m.mistake_analysis}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 3: ANALYTICS & WEAKNESSES */}
          {examSubTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold block mb-1">Overall Accuracy</span>
                  <div className="text-2xl font-black text-indigo-600">
                    {analyticsData?.accuracy_pct || 78}%
                  </div>
                  <span className="text-[11px] text-slate-400">Based on recent attempt logs</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold block mb-1">Avg Time Per Question</span>
                  <div className="text-2xl font-black text-slate-900">
                    {analyticsData?.avg_seconds_per_question || 68}s
                  </div>
                  <span className="text-[11px] text-slate-400">Pacing benchmark: &lt; 90s</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold block mb-1">Questions Solved</span>
                  <div className="text-2xl font-black text-emerald-600">
                    {analyticsData?.total_questions_solved || 42}
                  </div>
                  <span className="text-[11px] text-slate-400">Target for intake: 250+</span>
                </div>
              </div>

              {/* Weak Topics Priority Banner */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Adaptive Weak Topics Identified for {examType}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(analyticsData?.weak_topics || ['Reading Comprehension', 'Sentence Equivalence', 'Algebraic Radicals']).map((top, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                      ⚠️ {top}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Adaptive revision sets will prioritize these areas during your daily study schedule.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 4: TOTAL DEGREE COST & FUNDING PLANNER (P0) */}
      {/* ============================================================== */}
      {activeTab === 'cost_funding' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Total Degree Cost & Funding Planner
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive 2-year degree financial outlay including tuition, accommodation, travel, visas, and emergency buffer.
                </p>
              </div>

              {/* Currency & Exchange Rate Badge */}
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                💱 1 EUR = ₹91.20 | 1 USD = ₹83.85 | 1 CAD = ₹61.40 (Verified Oct 10, 2026)
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Destination Country</label>
                <select
                  value={fundingCountry}
                  onChange={(e) => {
                    const c = e.target.value;
                    setFundingCountry(c);
                    loadFundingPlan(c);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white"
                >
                  <option value="DEU">Germany 🇩🇪 (TUM / Public)</option>
                  <option value="USA">United States 🇺🇸 (CMU / Private/Public)</option>
                  <option value="CAN">Canada 🇨🇦 (UofT / Applied Computing)</option>
                  <option value="GBR">United Kingdom 🇬🇧 (1-Year Masters)</option>
                  <option value="AUS">Australia 🇦🇺 (Sydney / Melbourne)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Expected Scholarships (₹)</label>
                <input
                  type="number"
                  step="50000"
                  value={expectedScholarship}
                  onChange={(e) => setExpectedScholarship(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Family Support (₹)</label>
                <input
                  type="number"
                  step="50000"
                  value={familySupport}
                  onChange={(e) => setFamilySupport(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="campus_job"
                  checked={includeOnCampusWork}
                  onChange={(e) => setIncludeOnCampusWork(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="campus_job" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Include 20h/wk On-Campus Job / TA
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => loadFundingPlan(fundingCountry)}
                disabled={loadingFundingPlan}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recalculate Funding Plan</span>
              </button>
            </div>
          </div>

          {/* Funding Summary Panel */}
          {fundingPlanData && (
            <div className="space-y-6">
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold block mb-1">Total Degree Outlay (Typical)</span>
                  <div className="text-xl font-black text-slate-900">
                    {formatInr(fundingPlanData.total_typical_inr)}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Low: {formatInr(fundingPlanData.total_low_inr)} • High: {formatInr(fundingPlanData.total_high_inr)}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold block mb-1">Total Secured Funding</span>
                  <div className="text-xl font-black text-emerald-600">
                    {formatInr(fundingPlanData.total_secured_funding_inr)}
                  </div>
                  <span className="text-[10px] text-slate-400">Savings + Scholarships + Family</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold block mb-1">Total Funding Gap</span>
                  <div className="text-xl font-black text-rose-600">
                    {formatInr(fundingPlanData.total_funding_gap_inr)}
                  </div>
                  <span className="text-[10px] text-slate-400">Required before departure</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold block mb-1">Required Monthly Savings</span>
                  <div className="text-xl font-black text-indigo-600">
                    {formatInr(fundingPlanData.required_monthly_savings_inr)}/mo
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Target over {fundingPlanData.months_remaining_to_intake} months
                  </span>
                </div>
              </div>

              {/* Connection to Finance Engine Banner */}
              <div className="bg-indigo-950 text-white p-5 rounded-2xl border border-indigo-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Live Interconnection with Finance & Budget Engine
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  {fundingPlanData.monthly_affordability_verdict}
                </p>
                {fundingPlanData.recommended_loan_amount_inr > 0 && (
                  <div className="p-3 bg-white/10 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-indigo-200">
                    <span>
                      Recommended Education Loan: <strong>{formatInr(fundingPlanData.recommended_loan_amount_inr)}</strong>
                    </span>
                    <span>
                      Projected Post-MS EMI: <strong>{formatInr(fundingPlanData.loan_estimated_emi_inr)}/mo</strong> (15-yr @ 10.5%)
                    </span>
                  </div>
                )}
              </div>

              {/* Complete Cost Category Breakdown Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 font-bold text-sm text-slate-900">
                  Itemized Degree Expense Breakdown (Low / Typical / High Estimates)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-4">Expense Category</th>
                        <th className="p-4">Low Estimate</th>
                        <th className="p-4">Typical Outlay</th>
                        <th className="p-4">High Estimate</th>
                        <th className="p-4">Planning Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {(fundingPlanData.breakdown_items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-900">{item.category}</td>
                          <td className="p-4 text-slate-600">{formatInr(item.low_inr)}</td>
                          <td className="p-4 font-bold text-indigo-700">{formatInr(item.typical_inr)}</td>
                          <td className="p-4 text-slate-600">{formatInr(item.high_inr)}</td>
                          <td className="p-4 text-slate-500 text-[11px] max-w-xs">{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 5: APPLICATION COMMAND CENTER (P1) */}
      {/* ============================================================== */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <FileCheck className="w-4 h-4" />
                Multi-University Application Pipeline
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Application Command Center
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track each university's application status, priority deadlines, and tailored document checklist.
              </p>
            </div>

            <button
              onClick={() => setShowAddAppModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New University Application</span>
            </button>
          </div>

          {/* Add Application Modal */}
          {showAddAppModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-sm text-slate-900">Add University to Application Tracker</h4>
                  <button onClick={() => setShowAddAppModal(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateNewApp} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">University Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RWTH Aachen University"
                      value={newAppForm.university_name}
                      onChange={(e) => setNewAppForm({ ...newAppForm, university_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Degree Program</label>
                    <input
                      type="text"
                      required
                      value={newAppForm.program_name}
                      onChange={(e) => setNewAppForm({ ...newAppForm, program_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Country</label>
                      <input
                        type="text"
                        value={newAppForm.country}
                        onChange={(e) => setNewAppForm({ ...newAppForm, country: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tier</label>
                      <select
                        value={newAppForm.tier}
                        onChange={(e) => setNewAppForm({ ...newAppForm, tier: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="AMBITIOUS">AMBITIOUS</option>
                        <option value="TARGET">TARGET</option>
                        <option value="SAFE">SAFE</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Application Deadline</label>
                    <input
                      type="text"
                      value={newAppForm.deadline}
                      onChange={(e) => setNewAppForm({ ...newAppForm, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddAppModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                    >
                      Create Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Applications Cards Grid */}
          {loadingApps ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-500">
              No university applications tracked yet. Click "Add New University Application" or add directly from the University Matcher.
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((app) => {
                const checklistEntries = Object.entries(app.checklist || {});
                const completedCount = checklistEntries.filter(([_, v]) => v).length;
                const totalCount = checklistEntries.length;
                const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5"
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-slate-900">{app.university_name}</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              app.tier === 'AMBITIOUS'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : app.tier === 'TARGET'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {app.tier}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">
                          {app.program_name} • {app.country}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Dropdown */}
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                        >
                          <option value="Researching">Researching</option>
                          <option value="Drafting Docs">Drafting Docs</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Interview">Interview Invited</option>
                          <option value="Offer Received">Offer Received 🎉</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        {/* Deadline Badge */}
                        <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Deadline: {app.deadline}</span>
                        </span>

                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5"
                          title="Delete application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-semibold">
                          Document Checklist Completion ({completedCount} of {totalCount} requirements satisfied)
                        </span>
                        <strong className="text-indigo-600 font-bold">{progressPct}%</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Checklist Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {checklistEntries.map(([key, val]) => {
                        const label = key
                          .split('_')
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(' ');
                        return (
                          <button
                            key={key}
                            onClick={() => handleToggleChecklist(app.id, key, val)}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                              val
                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-[11px] truncate">{label}</span>
                            {val ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Notes & Portal Link */}
                    {app.notes && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <strong>Advisor Notes:</strong> {app.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 6: SOP, LOR & DOCUMENT ASSISTANT (P1) */}
      {/* ============================================================== */}
      {activeTab === 'sop_docs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  SOP, LOR & Document Assistant
                </h3>
                <p className="text-xs text-slate-500">
                  Audits Statement of Purpose drafts for structure, quantified engineering evidence, and university-specific research fit.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-bold">
                Authenticity Rule: Evaluates against real profile data • Zero hallucinations
              </div>
            </div>

            {/* University Prompt Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Target University</label>
                <select
                  value={sopTargetUni}
                  onChange={(e) => setSopTargetUni(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white"
                >
                  <option value="Technical University of Munich (TUM)">Technical University of Munich (TUM) 🇩🇪</option>
                  <option value="Carnegie Mellon University (CMU)">Carnegie Mellon University (CMU) 🇺🇸</option>
                  <option value="University of Toronto">University of Toronto 🇨🇦</option>
                  <option value="Imperial College London">Imperial College London 🇬🇧</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Master's Program</label>
                <input
                  type="text"
                  value={sopTargetProgram}
                  onChange={(e) => setSopTargetProgram(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            {/* SOP Draft Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700">Statement of Purpose Draft</label>
                <span className="text-slate-400 font-mono text-[11px]">
                  {sopDraftInput.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={8}
                value={sopDraftInput}
                onChange={(e) => setSopDraftInput(e.target.value)}
                placeholder="Paste or write your SOP draft here to audit for structure, metrics, and faculty fit..."
                className="w-full p-4 border border-slate-200 rounded-2xl text-xs text-slate-800 font-serif leading-relaxed focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleGenerateTemplateSop}
                disabled={generatingTemplateSop}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{generatingTemplateSop ? 'Synthesizing...' : 'Load Verified Profile Template'}</span>
              </button>

              <button
                onClick={handleAuditSop}
                disabled={auditingSop}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{auditingSop ? 'Auditing SOP Draft...' : 'Run AI Audit & Critique'}</span>
              </button>
            </div>
          </div>

          {/* SOP Audit Evaluation Result */}
          {sopAuditResult && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    SOP Structural Diagnostic: {sopAuditResult.overall_score}/100
                  </h4>
                  <p className="text-xs text-slate-500">
                    Audited for {sopTargetUni} ({sopTargetProgram})
                  </p>
                </div>
                <div
                  className={`text-xl font-black px-4 py-1.5 rounded-2xl ${
                    sopAuditResult.overall_score >= 80
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {sopAuditResult.overall_score >= 80 ? 'Competitive Admit Ready' : 'Revisions Needed'}
                </div>
              </div>

              {/* 5-Pillar Score Bars */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {Object.entries(sopAuditResult.structure_scores || {}).map(([pillar, sc]) => {
                  const label = pillar
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                  return (
                    <div key={pillar} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block truncate">{label}</span>
                      <strong className="text-sm font-bold text-slate-900">{sc}%</strong>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${sc >= 80 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                          style={{ width: `${sc}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strengths & Red Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Strengths:
                  </span>
                  <ul className="list-disc pl-4 text-xs text-emerald-800 space-y-1">
                    {sopAuditResult.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Missing Evidence & Pitfalls:
                  </span>
                  <ul className="list-disc pl-4 text-xs text-rose-800 space-y-1">
                    {sopAuditResult.missing_evidence_red_flags.map((rf, idx) => (
                      <li key={idx}>{rf}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Actionable Next Steps:</span>
                <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1">
                  {sopAuditResult.actionable_recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Tailored Exemplar Snippet */}
              {sopAuditResult.improved_excerpt && (
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200 space-y-1.5">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Tailored Exemplar Excerpt for {sopTargetUni}:
                  </span>
                  <p className="text-xs text-indigo-900 leading-relaxed font-serif italic">
                    "{sopAuditResult.improved_excerpt}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 7: VISA & PRE-DEPARTURE ASSISTANT (P2) */}
      {/* ============================================================== */}
      {activeTab === 'visa_prep' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-indigo-600" />
                  Visa & Pre-Departure Assistant
                </h3>
                <p className="text-xs text-slate-500">
                  Country-specific mandatory visa protocols, financial solvency proofs (Blocked Account, I-20, GIC), and departure checklists.
                </p>
              </div>

              {/* Country Selector */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
                {[
                  { code: 'DEU', label: 'Germany 🇩🇪' },
                  { code: 'USA', label: 'USA 🇺🇸' },
                  { code: 'CAN', label: 'Canada 🇨🇦' }
                ].map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setVisaCountry(c.code);
                      loadVisaGuidance(c.code);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      visaCountry === c.code ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Date & Legal Disclaimer Banner */}
            {visaData && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Visa Subclass: {visaData.visa_subclass}</span>
                  <span className="text-emerald-700">Verified: {visaData.last_verified_date}</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  ⚠️ {visaData.disclaimer}
                </p>
              </div>
            )}
          </div>

          {/* Visa Step-by-Step Workflow */}
          {visaData && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  Mandatory Step-by-Step Visa Procedure ({visaData.country_name})
                </h4>

                <div className="space-y-3">
                  {(visaData.mandatory_steps || []).map((st) => (
                    <div key={st.step} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                      <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {st.step}
                      </span>
                      <div className="space-y-0.5">
                        <strong className="text-xs font-bold text-slate-900 block">{st.title}</strong>
                        <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <a
                    href={visaData.official_portal_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Official Embassy Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Financial Solvency & Health Insurance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    Financial Proof Requirements
                  </h4>
                  <div className="text-xs text-slate-700 space-y-2">
                    <div>
                      <strong>Instrument Type:</strong> {visaData.financial_proof_requirement?.type}
                    </div>
                    {visaData.financial_proof_requirement?.min_amount_eur && (
                      <div className="text-indigo-700 font-bold">
                        Minimum Requirement: €{visaData.financial_proof_requirement.min_amount_eur?.toLocaleString()} (~₹11.9 Lakhs)
                      </div>
                    )}
                    {visaData.financial_proof_requirement?.min_amount_usd && (
                      <div className="text-indigo-700 font-bold">
                        Liquid Balance Required: ${visaData.financial_proof_requirement.min_amount_usd?.toLocaleString()} (~₹46 Lakhs)
                      </div>
                    )}
                    <div>
                      <strong className="block text-[11px] text-slate-500 mb-0.5">Acceptable Sources:</strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {(visaData.financial_proof_requirement?.acceptable_sources || []).map((src, i) => (
                          <li key={i}>{src}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Mandatory Health Insurance Policy
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {visaData.health_insurance_requirement}
                  </p>

                  <h5 className="text-xs font-bold text-slate-900 pt-2">Departure Packing & Travel Preparation:</h5>
                  <div className="space-y-1.5">
                    {(visaData.pre_departure_checklist || []).map((item, idx) => {
                      const isChecked = checkedPreDepartureItems[idx];
                      return (
                        <button
                          key={idx}
                          onClick={() => setCheckedPreDepartureItems({ ...checkedPreDepartureItems, [idx]: !isChecked })}
                          className={`w-full p-2 rounded-xl text-left text-[11px] flex items-center justify-between transition cursor-pointer border ${
                            isChecked ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="truncate">{item}</span>
                          {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" /> : <Square className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* STAGE 7 (TAB 7): 12-MONTH MASTER ROAD MAP */}
      {/* ============================================================== */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              12-Month Master Study Abroad Roadmap ({targetIntake})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Structured preparation schedule spanning exams, document drafting, priority applications, and visa issuance.
            </p>
          </div>

          <div className="space-y-4">
            {(data?.roadmap?.phases || []).map((ph, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-900">{ph.phase_title}</h4>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
                    {ph.timeline_months}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Key Milestones:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {(ph.key_milestones || []).map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Action Items:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {(ph.action_items || []).map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

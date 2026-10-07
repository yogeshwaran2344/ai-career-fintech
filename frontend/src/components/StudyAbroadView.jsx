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
  AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function StudyAbroadView({ profile, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, exams, papers, universities, roi, sop, roadmap
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingSelection, setSavingSelection] = useState(false);

  // Form selections
  const [selectedCountries, setSelectedCountries] = useState(['USA', 'DEU', 'CAN']);
  const [selectedProgram, setSelectedProgram] = useState('MS in Artificial Intelligence / Computer Science');
  const [selectedIntake, setSelectedIntake] = useState('Fall 2027');

  // Interactive Question Practice State
  const [activePaperIndex, setActivePaperIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});

  // SOP/LOR Generation State
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

  const handleCountryToggle = (countryId) => {
    if (selectedCountries.includes(countryId)) {
      if (selectedCountries.length === 1) return; // Keep at least 1
      setSelectedCountries(selectedCountries.filter(c => c !== countryId));
    } else {
      if (selectedCountries.length >= 3) {
        // Max 3 countries
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
    } catch (err) {
      console.error('Failed to update selection:', err);
      alert('Error saving preferences: ' + (err.message || 'Try again'));
    } finally {
      setSavingSelection(false);
    }
  };

  const handleChecklistToggle = async (uniId, key, currentVal) => {
    try {
      // Optimistic update
      const updatedUnis = data.shortlisted_universities.map(u => {
        if (u.id === uniId) {
          return {
            ...u,
            checklist: { ...u.checklist, [key]: !currentVal }
          };
        }
        return u;
      });
      setData({ ...data, shortlisted_universities: updatedUnis });

      await api.updateStudyAbroadChecklist(uniId, key, !currentVal);
    } catch (err) {
      console.error('Checklist update failed:', err);
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
      alert('Error generating SOP/LOR: ' + (err.message || 'Please retry'));
    } finally {
      setGeneratingSop(false);
    }
  };

  const handleCopyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-600 font-medium">Initializing Global Higher Education & Masters Copilot...</p>
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
    target_countries,
    target_program,
    target_intake,
    profile_summary,
    all_countries_catalog,
    required_exams,
    practice_papers,
    shortlisted_universities,
    cost_roi_comparisons,
    roadmap
  } = data;

  const filteredUnis = shortlisted_universities.filter(u => {
    if (tierFilter === 'ALL') return true;
    return u.tier === tierFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> GLOBAL CAREER & HIGHER ED PIPELINE
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30">
                {target_intake} Intake
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Study Abroad & Masters Copilot</h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Your personalized, end-to-end global master's execution engine. Dynamically syncs with your career track,
              academic CGPA, financial runway, and generates university-ready SOP drafts.
            </p>
          </div>

          {/* Student Profile Quick Sync Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-wrap md:flex-col gap-3 min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Target Role</span>
              <span className="font-semibold text-white">{profile_summary.career_goal || 'AI Engineer'}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Academic CGPA</span>
              <span className="font-semibold text-emerald-300">{profile_summary.cgpa?.toFixed(2) || '8.40'} / 10.0</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Monthly Surplus</span>
              <span className="font-semibold text-amber-300">₹{profile_summary.monthly_surplus?.toLocaleString() || '5,500'}/mo</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Verified Skills</span>
              <span className="font-semibold text-indigo-300">{profile_summary.skills_count || 6} Profile Skills</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-indigo-900/60 mt-6 no-scrollbar">
          {[
            { id: 'overview', label: '1. Destination & Matcher', icon: Globe },
            { id: 'exams', label: '2. Exam Planner', icon: BookOpen },
            { id: 'papers', label: '3. Practice Papers & Mock', icon: FileText },
            { id: 'universities', label: '4. Universities & Checklist', icon: GraduationCap },
            { id: 'roi', label: '5. Cost & ROI Calculator', icon: DollarSign },
            { id: 'sop', label: '6. AI SOP & LOR Copilot', icon: Sparkles },
            { id: 'roadmap', label: '7. 12-Month Roadmap', icon: Calendar },
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DESTINATION & DEGREE MATCHER */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Selection Control Panel */}
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
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="MS in Artificial Intelligence / Computer Science">🎯 Recommended for Profile: MS in AI / Computer Science</option>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="Fall 2027">Fall 2027 (Most recommended for complete prep cycle)</option>
                  <option value="Spring 2027">Spring 2027 (Accelerated timeline)</option>
                  <option value="Fall 2028">Fall 2028 (Long-term strategic runway)</option>
                </select>
              </div>
            </div>

            {/* Country Selector Multi-Chips */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Countries ({selectedCountries.length} / 3 Selected)
                </span>
                <span className="text-xs text-indigo-600 font-medium">Click to toggle</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {all_countries_catalog.map((country) => {
                  const isSelected = selectedCountries.includes(country.id);
                  return (
                    <button
                      key={country.id}
                      onClick={() => handleCountryToggle(country.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
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

          {/* Catalog of Selected Destinations */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Comparative Destination Intelligence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {all_countries_catalog
                .filter(c => selectedCountries.includes(c.id))
                .map((country) => (
                  <div
                    key={country.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{country.flag}</span>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">{country.name}</h4>
                            <span className="text-xs text-slate-500 font-medium">{country.currency}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                          {country.psw_visa_years}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Avg Tuition / Yr</span>
                          <span className="text-xs font-bold text-slate-800">
                            ₹{(country.avg_tuition_annual_inr / 100000).toFixed(1)} Lakhs
                          </span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Living Cost / Yr</span>
                          <span className="text-xs font-bold text-slate-800">
                            ₹{(country.avg_living_annual_inr / 100000).toFixed(1)} Lakhs
                          </span>
                        </div>
                      </div>

                      {/* Required Exams Pill */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Common Entrance Requirements</span>
                        <div className="flex flex-wrap gap-1">
                          {country.common_exams.map((ex, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-medium rounded-md border border-amber-200/60">
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Key Advantages */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Key Strategic Advantages</span>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {country.key_advantages.map((adv, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('universities')}
                      className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold rounded-xl transition"
                    >
                      <span>Explore Shortlisted Universities</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: EXAM PLANNER & DIAGNOSTIC PREP */}
      {/* ============================================================== */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed">
              <strong className="font-bold">Personalized Exam Architecture: </strong>
              Based on your selection ({selectedCountries.join(', ')}), the exams below are required or strongly recommended.
              Ensure you target 90th percentile scores on quantitative sections to maximize scholarship opportunities.
            </div>
          </div>

          <div className="space-y-6">
            {required_exams.map((exam, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-slate-900">{exam.exam_name}</h4>
                      <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-semibold rounded-full border border-indigo-200">
                        {exam.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Recommended Timeline: {exam.recommended_deadline}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase block">Target Benchmark</span>
                      <span className="text-xs font-bold text-emerald-900">{exam.target_score}</span>
                    </div>
                    <a
                      href={exam.official_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Section Breakdown Grid */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Exam Syllabus & Section Strategy</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {exam.sections.map((sec, sidx) => (
                      <div key={sidx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{sec.name}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-600">
                              {sec.weight}
                            </span>
                          </div>
                          <div className="text-xs text-indigo-600 font-semibold">Target: {sec.target_score}</div>
                          <p className="text-[11px] text-slate-500 leading-snug">{sec.status}</p>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] font-bold text-slate-600 uppercase block">High-Frequency Topics</span>
                          <div className="flex flex-wrap gap-1">
                            {sec.key_topics.map((top, tidx) => (
                              <span key={tidx} className="px-1.5 py-0.5 bg-white text-slate-700 text-[10px] rounded border border-slate-200">
                                {top}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curated Study Resources */}
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">Verified Study Resources & Free Mock Links:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exam.free_study_resource_links.map((res, ridx) => (
                      <a
                        key={ridx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-xs font-medium rounded-lg transition"
                      >
                        <span>{res.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PREVIOUS QUESTION PAPERS & INTERACTIVE MOCK */}
      {/* ============================================================== */}
      {activeTab === 'papers' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Standardized Examination Diagnostic Sets</h3>
              <p className="text-xs text-slate-500">
                Practice verified diagnostic question sets. All questions are structured strictly according to ETS GRE and
                Cambridge IELTS official examination standards for graduate admissions.
              </p>
            </div>
            <div className="flex gap-2">
              {practice_papers.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePaperIndex(idx);
                    setSelectedAnswers({});
                    setShowExplanations({});
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    activePaperIndex === idx
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.exam}: {p.category}
                </button>
              ))}
            </div>
          </div>

          {practice_papers[activePaperIndex] && (() => {
            const currentPaper = practice_papers[activePaperIndex];
            return (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                        {currentPaper.exam}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{currentPaper.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500">Source: {currentPaper.source_attribution}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {currentPaper.time_limit_minutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> {currentPaper.question_count} Questions
                    </span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-semibold border border-amber-200/60">
                      {currentPaper.difficulty}
                    </span>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {currentPaper.questions.map((q, qidx) => {
                    const answered = selectedAnswers[q.id] !== undefined;
                    const userPick = selectedAnswers[q.id];
                    const isCorrect = userPick === q.correct_option;
                    const showExp = showExplanations[q.id];

                    return (
                      <div key={q.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-indigo-600 uppercase">Question {qidx + 1}</span>
                            <p className="text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                              {q.question}
                            </p>
                          </div>
                          {answered && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                              isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                              {isCorrect ? 'Correct (+1)' : 'Incorrect'}
                            </span>
                          )}
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {q.options.map((opt, oidx) => {
                            let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40';
                            if (answered) {
                              if (oidx === q.correct_option) {
                                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                              } else if (oidx === userPick) {
                                btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                              } else {
                                btnStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={oidx}
                                disabled={answered}
                                onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: oidx })}
                                className={`text-left p-3 rounded-xl border text-xs transition flex items-center gap-2.5 ${btnStyle}`}
                              >
                                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                                  {String.fromCharCode(65 + oidx)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Toggle */}
                        {answered && (
                          <div className="pt-2 border-t border-slate-200/80">
                            <button
                              onClick={() => setShowExplanations({ ...showExplanations, [q.id]: !showExp })}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                            >
                              <span>{showExp ? 'Hide Detailed Solution' : 'View Step-by-Step Mathematical Explanation'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExp ? 'rotate-180' : ''}`} />
                            </button>
                            {showExp && (
                              <div className="mt-2 p-3 bg-white rounded-xl border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                                <strong className="font-bold text-indigo-900 block mb-1">Solution Breakdown:</strong>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: UNIVERSITIES & GUIDED CHECKLIST */}
      {/* ============================================================== */}
      {activeTab === 'universities' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Curated University Portfolio & Admission Checklist</h3>
              <p className="text-xs text-slate-500">
                Classified by admission selectivity relative to your profile ({profile_summary.cgpa?.toFixed(2)} CGPA).
                Track your active application filings in real time.
              </p>
            </div>

            {/* Selectivity Filter */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              {['ALL', 'AMBITIOUS', 'TARGET', 'SAFE'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    tierFilter === tier
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tier === 'ALL' ? 'All Tiers' : tier}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredUnis.map((uni) => {
              const chk = uni.checklist || {};
              const completedCount = Object.values(chk).filter(Boolean).length;
              const totalItems = Object.keys(chk).length || 7;
              const progressPct = Math.round((completedCount / totalItems) * 100);

              const tierBadgeClass =
                uni.tier === 'AMBITIOUS'
                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                  : uni.tier === 'TARGET'
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200';

              return (
                <div key={uni.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                  {/* University Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl">{uni.flag}</span>
                        <h4 className="text-base font-bold text-slate-900">{uni.university_name}</h4>
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${tierBadgeClass}`}>
                          {uni.tier}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md">
                          QS #{uni.qs_world_ranking}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-700 font-semibold">{uni.program_name}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Deadline</span>
                        <span className="text-xs font-bold text-rose-600">{uni.application_deadline}</span>
                      </div>
                      <a
                        href={uni.official_portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Financial & Cutoff Metrics */}
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
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Min CGPA Cutoff</span>
                      <span className="text-xs font-bold text-indigo-700">{uni.min_cgpa_cutoff.toFixed(1)}+ / 10.0</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Post-MS Starting CTC</span>
                      <span className="text-xs font-bold text-emerald-700">
                        ₹{(uni.post_ms_avg_starting_salary_inr / 100000).toFixed(1)} Lakhs/yr
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl">
                    <span className="font-semibold text-slate-800">Exam Rules:</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-medium">
                      GRE: {uni.gre_requirement}
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-medium">
                      IELTS: {uni.ielts_requirement.toFixed(1)}+
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-medium">
                      Est. Payback: {uni.roi_payback_years} Years
                    </span>
                  </div>

                  {/* Guided Application Checklist */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Application Filing Checklist ({completedCount} / {totalItems} completed)
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600">{progressPct}% Complete</span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                      {[
                        { key: 'account_created', label: '1. Portal Account Created' },
                        { key: 'program_selected', label: '2. Program & Term Selected' },
                        { key: 'transcripts_uploaded', label: '3. Official Transcripts' },
                        { key: 'sop_submitted', label: '4. Statement of Purpose (SOP)' },
                        { key: 'lor_submitted', label: '5. Recommendation Letters (LOR)' },
                        { key: 'scores_reported', label: '6. Test Scores Reported' },
                        { key: 'application_paid', label: '7. Application Fee Paid' },
                      ].map((step) => {
                        const isDone = !!chk[step.key];
                        return (
                          <button
                            key={step.key}
                            onClick={() => handleChecklistToggle(uni.id, step.key, isDone)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                            )}
                            <span className="truncate">{step.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: 2-YEAR COST, LOAN & ROI CALCULATOR */}
      {/* ============================================================== */}
      {activeTab === 'roi' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold">Holistic Financial Engine Synergy: </strong>
              These projections combine your current monthly surplus (₹{profile_summary.monthly_surplus?.toLocaleString()}/mo),
              liquid savings (₹{profile_summary.current_savings?.toLocaleString()}), and international tuition schedules.
              We model education loans (15 years @ 10.5% p.a.) with post-graduation global salary conversions.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cost_roi_comparisons.map((c, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.flag}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.university_name}</h4>
                      <p className="text-[11px] text-slate-500">{c.program_name}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                    {c.payback_period_years} Yr Payback
                  </span>
                </div>

                {/* 2-Year Budget Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">2-Year Total Outlay</span>
                    <span className="font-extrabold text-slate-900">
                      ₹{(c.total_estimated_budget_inr / 100000).toFixed(1)} Lakhs (~${(c.total_estimated_budget_usd).toLocaleString()})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Tuition (2 Years)</span>
                      <span className="font-bold text-slate-800">₹{(c.tuition_2y_inr / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Living & Food</span>
                      <span className="font-bold text-slate-800">₹{(c.living_2y_inr / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Visa, Flights & Ins.</span>
                      <span className="font-bold text-slate-800">₹{(c.visa_insurance_travel_inr / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">GRE, Tests & Apps</span>
                      <span className="font-bold text-slate-800">₹{(c.exam_app_fees_inr / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>

                {/* Funding Plan Split */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Recommended Funding Structure</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Education Loan (Collateral/Non-Collateral)</span>
                      <span className="font-bold text-slate-900">₹{(c.funding_plan.education_loan_inr / 100000).toFixed(1)} Lakhs</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>On-Campus TA/RA Assistantship</span>
                      <span className="font-bold text-emerald-700">₹{(c.funding_plan.campus_tara_offset_inr / 100000).toFixed(1)} Lakhs</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Personal & Family Seed Savings</span>
                      <span className="font-bold text-indigo-700">₹{(c.funding_plan.personal_family_savings_inr / 100000).toFixed(1)} Lakhs</span>
                    </div>
                  </div>
                </div>

                {/* Post-Graduation Cashflow */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Estimated Post-MS Monthly EMI</span>
                    <span className="font-bold text-rose-700">₹{c.estimated_monthly_emi_inr.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Projected Post-MS Starting CTC</span>
                    <span className="font-bold text-emerald-700">₹{(c.projected_post_ms_salary_inr / 100000).toFixed(1)} Lakhs/yr</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 leading-snug">
                    {c.financial_engine_synergy_note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: AI STATEMENT OF PURPOSE (SOP) & LOR COPILOT */}
      {/* ============================================================== */}
      {activeTab === 'sop' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                AI Statement of Purpose & LOR Generator
              </h3>
              <p className="text-xs text-slate-500">
                Directly incorporates your authentic engineering skillset ({profile_summary.skills_count} profile skills),
                real projects, and academic CGPA ({profile_summary.cgpa?.toFixed(2)}) into compelling, committee-grade drafts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target University
                </label>
                <select
                  value={sopUniversity}
                  onChange={(e) => setSopUniversity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800"
                >
                  {shortlisted_universities.map(u => (
                    <option key={u.id} value={u.university_name}>{u.university_name} ({u.country})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Program
                </label>
                <input
                  type="text"
                  value={sopProgram}
                  onChange={(e) => setSopProgram(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Specific Research Interest
                </label>
                <input
                  type="text"
                  value={sopResearch}
                  onChange={(e) => setSopResearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Professor / Lab
                </label>
                <input
                  type="text"
                  value={sopLab}
                  onChange={(e) => setSopLab(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateSop}
                disabled={generatingSop}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
              >
                {generatingSop ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generatingSop ? 'Synthesizing Personalized Drafts...' : 'Generate Academic-Grade SOP & LOR Drafts'}
              </button>
            </div>
          </div>

          {/* Generated Documents Viewer */}
          {sopResult && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  {[
                    { id: 'sop', label: 'Statement of Purpose (SOP)', icon: FileText },
                    { id: 'lor_prof', label: 'Academic LOR (Professor)', icon: Award },
                    { id: 'lor_hod', label: 'Department LOR (HOD)', icon: Building },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = sopActiveSubtab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSopActiveSubtab(tab.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    const text =
                      sopActiveSubtab === 'sop'
                        ? sopResult.sop_text
                        : sopActiveSubtab === 'lor_prof'
                        ? sopResult.lor_prof_text
                        : sopResult.lor_hod_text;
                    handleCopyText(text, sopActiveSubtab);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  {copiedKey === sopActiveSubtab ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === sopActiveSubtab ? 'Copied to Clipboard!' : 'Copy Document'}</span>
                </button>
              </div>

              {/* Document Text Box */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-line max-h-[500px] overflow-y-auto">
                {sopActiveSubtab === 'sop' && sopResult.sop_text}
                {sopActiveSubtab === 'lor_prof' && sopResult.lor_prof_text}
                {sopActiveSubtab === 'lor_hod' && sopResult.lor_hod_text}
              </div>

              {/* Highlighted Project & Skill Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="font-bold text-slate-600">Tailored Skills Highlighted:</span>
                {sopResult.tailored_skills_highlighted.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-semibold border border-indigo-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: 12-MONTH MASTER ROADMAP */}
      {/* ============================================================== */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Phased 12-Month Master Roadmap</h3>
            <p className="text-xs text-slate-500">
              Target Intake: <strong className="text-indigo-600 font-semibold">{roadmap.target_intake}</strong> for{' '}
              {roadmap.target_countries.join(', ')}. Complete these chronological phases to guarantee submission before priority scholarship deadlines.
            </p>
          </div>

          <div className="space-y-4">
            {roadmap.phases.map((phase, pidx) => (
              <div key={pidx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {pidx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{phase.phase_title}</h4>
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 self-start md:self-auto">
                    {phase.timeline_months}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Key Milestones */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Key Milestones</span>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      {phase.key_milestones.map((m, midx) => (
                        <li key={midx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Immediate Action Items */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Action Items</span>
                    <ul className="text-xs text-slate-600 space-y-1.5">
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
        </div>
      )}
    </div>
  );
}

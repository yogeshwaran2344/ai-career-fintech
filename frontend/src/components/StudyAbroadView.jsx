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
  HelpCircle
} from 'lucide-react';
import { api } from '../api';

export default function StudyAbroadView({ profile, onNavigate }) {
  // Main view navigation tab - defaults to colleges catalog
  const [activeTab, setActiveTab] = useState('colleges');
  // tabs: 'colleges', 'roadmap', 'costs_living', 'scholarships', 'loans', 'sop'

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingSelection, setSavingSelection] = useState(false);

  // Form selections for destination & program
  const [selectedCountries, setSelectedCountries] = useState(['USA', 'DEU', 'CAN']);
  const [selectedProgram, setSelectedProgram] = useState('MS in Artificial Intelligence / Computer Science');
  const [selectedIntake, setSelectedIntake] = useState('Fall 2027');

  // Filters for universities
  const [uniSearchQuery, setUniSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [activeUniDetail, setActiveUniDetail] = useState(null); // university modal/drawer

  // Interactive Education Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(3500000); // ₹35 Lakhs
  const [loanRate, setLoanRate] = useState(10.5); // 10.5% p.a.
  const [loanTenureYears, setLoanTenureYears] = useState(15); // 15 years

  // SOP & LOR Generator State (Kept below)
  const [sopTargetUni, setSopTargetUni] = useState('Carnegie Mellon University');
  const [sopTargetProgram, setSopTargetProgram] = useState('MS in Artificial Intelligence');
  const [sopResearchInterest, setSopResearchInterest] = useState('Distributed Machine Learning & Autonomous Agents');
  const [generatingSop, setGeneratingSop] = useState(false);
  const [sopResult, setSopResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Fetch central study abroad data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudyAbroadOverview();
      setData(res);
      if (res.target_countries?.length) setSelectedCountries(res.target_countries);
      if (res.target_program) setSelectedProgram(res.target_program);
      if (res.target_intake) setSelectedIntake(res.target_intake);
    } catch (err) {
      console.error('Failed to load study abroad data:', err);
      setError('Unable to synchronize study abroad parameters. Please check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCountryToggle = (countryId) => {
    if (selectedCountries.includes(countryId)) {
      if (selectedCountries.length <= 1) return; // Keep at least 1
      setSelectedCountries((prev) => prev.filter((c) => c !== countryId));
    } else {
      if (selectedCountries.length >= 6) return; // Limit up to 6
      setSelectedCountries((prev) => [...prev, countryId]);
    }
  };

  const handleSaveSelection = async () => {
    try {
      setSavingSelection(true);
      const res = await api.updateStudyAbroadSelection(selectedCountries, selectedProgram, selectedIntake);
      setData(res);
    } catch (err) {
      console.error('Failed to update destination selection:', err);
      alert('Failed to save selection. Please try again.');
    } finally {
      setSavingSelection(false);
    }
  };

  const handleChecklistToggle = async (universityId, checklistKey, currentStatus) => {
    try {
      await api.updateUniversityChecklist(universityId, checklistKey, !currentStatus);
      // Optimistic update
      setData((prev) => {
        if (!prev) return prev;
        const updatedUnis = prev.shortlisted_universities.map((u) => {
          if (u.id === universityId) {
            return {
              ...u,
              checklist: {
                ...u.checklist,
                [checklistKey]: !currentStatus
              }
            };
          }
          return u;
        });
        return { ...prev, shortlisted_universities: updatedUnis };
      });
    } catch (err) {
      console.error('Failed to toggle checklist:', err);
    }
  };

  // SOP generation
  const handleGenerateSop = async () => {
    try {
      setGeneratingSop(true);
      const res = await api.generateSopLor({
        target_university: sopTargetUni,
        target_program: sopTargetProgram,
        specific_research_interest: sopResearchInterest
      });
      setSopResult(res);
    } catch (err) {
      console.error('Failed to generate SOP/LOR:', err);
      alert('SOP generation failed. Please try again.');
    } finally {
      setGeneratingSop(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filtered universities
  const shortlisted_universities = data?.shortlisted_universities || [];
  const availableCountries = useMemo(() => {
    return Array.from(new Set(shortlisted_universities.map((u) => u.country))).filter(Boolean);
  }, [shortlisted_universities]);

  const filteredUnis = useMemo(() => {
    return shortlisted_universities.filter((uni) => {
      // Country Filter
      if (countryFilter !== 'ALL' && uni.country !== countryFilter) return false;
      // Tier Filter
      if (tierFilter !== 'ALL' && uni.tier !== tierFilter) return false;
      // Search Query
      if (uniSearchQuery.trim()) {
        const q = uniSearchQuery.toLowerCase();
        const matchName = uni.university_name?.toLowerCase().includes(q);
        const matchProg = uni.program_name?.toLowerCase().includes(q);
        const matchCountry = uni.country?.toLowerCase().includes(q);
        if (!matchName && !matchProg && !matchCountry) return false;
      }
      return true;
    });
  }, [shortlisted_universities, countryFilter, tierFilter, uniSearchQuery]);

  // Loan EMI calculation
  const calculatedLoanEmi = useMemo(() => {
    const r = (loanRate / 100) / 12;
    const n = loanTenureYears * 12;
    if (loanAmount <= 0) return 0;
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  }, [loanAmount, loanRate, loanTenureYears]);

  const totalRepayment = calculatedLoanEmi * loanTenureYears * 12;
  const totalInterest = Math.max(0, totalRepayment - loanAmount);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading Global Universities, Scholarships & Financing Portals...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="font-bold text-rose-900 text-base">Error Loading Global Career Data</h3>
        <p className="text-xs text-rose-700">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 cursor-pointer"
        >
          Retry Synchronization
        </button>
      </div>
    );
  }

  const all_countries_catalog = data?.all_countries_catalog || [];
  const cost_roi_comparisons = data?.cost_roi_comparisons || [];
  const roadmap = data?.roadmap;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* ============================================================== */}
      {/* TOP HERO & TARGET DESTINATION SELECTION PANEL */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-7 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> STUDY ABROAD & MASTERS COPILOT
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Direct Official Admission Links Active
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Global Master's Pipeline & Direct Admissions Hub</h1>
              <p className="text-slate-300 text-xs md:text-sm max-w-3xl leading-relaxed">
                Discover world-class universities, calculate real tuition fees and actual cost of living, unlock merit scholarships,
                simulate education loans with monthly EMI, and apply directly via official university admission portals.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[280px] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Selected Destinations</span>
                <span className="font-extrabold text-white">{selectedCountries.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Target Degree</span>
                <span className="font-bold text-indigo-300 truncate max-w-[170px]" title={selectedProgram}>{selectedProgram}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Target Intake</span>
                <span className="font-bold text-emerald-300">{selectedIntake}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Matched Colleges</span>
                <span className="font-bold text-amber-300">{shortlisted_universities.length} Institutions</span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE COUNTRY SELECTOR & PROGRAM BAR */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase text-indigo-300 tracking-wider block">
                  1. Choose Your Target Countries ({selectedCountries.length} Selected)
                </span>
                <p className="text-[11px] text-slate-300">
                  Select countries to customize your university portfolio, local cost of living breakdowns, and scholarship matching.
                </p>
              </div>

              <button
                onClick={handleSaveSelection}
                disabled={savingSelection}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer self-start md:self-auto shadow-md"
              >
                {savingSelection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{savingSelection ? 'Syncing...' : 'Save & Sync Destinations'}</span>
              </button>
            </div>

            {/* Country Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {all_countries_catalog.map((country) => {
                const isSelected = selectedCountries.includes(country.id);
                return (
                  <button
                    key={country.id}
                    onClick={() => handleCountryToggle(country.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{country.flag}</span>
                    <span>{country.name}</span>
                    {isSelected ? (
                      <Check className="w-3 h-3 text-emerald-300 ml-0.5" />
                    ) : (
                      <Circle className="w-3 h-3 text-white/30 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Target Program & Intake Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Intended Master's Degree Track</label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-400"
                >
                  <option value="MS in Artificial Intelligence / Computer Science">🎯 Recommended: MS in AI / Computer Science</option>
                  <option value="MS in Computer Science (General CS Track)">MS in Computer Science</option>
                  <option value="MS in Data Science & Machine Learning">MS in Data Science & Machine Learning</option>
                  <option value="MS in Software Engineering">MS in Software Engineering</option>
                  <option value="MS in Cybersecurity & Cloud Systems">MS in Cybersecurity</option>
                  <option value="MS in Robotics & Autonomous Systems">MS in Robotics</option>
                  <option value="Master of Business Administration (MBA - Tech Management)">MBA (Tech Management)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Target Intake Timeline</label>
                <select
                  value={selectedIntake}
                  onChange={(e) => setSelectedIntake(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-400"
                >
                  <option value="Fall 2027">Fall 2027 (Recommended complete 12-month prep cycle)</option>
                  <option value="Spring 2027">Spring 2027 (Accelerated submission)</option>
                  <option value="Fall 2026">Fall 2026 (Immediate upcoming cycle)</option>
                  <option value="Fall 2028">Fall 2028 (Long-term strategic runway)</option>
                </select>
              </div>
            </div>
          </div>

          {/* MAIN NAVIGATION TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-indigo-900/60 no-scrollbar">
            {[
              { id: 'colleges', label: '1. Target Colleges & Direct Admission Links', icon: GraduationCap, count: shortlisted_universities.length },
              { id: 'roadmap', label: '2. The Study Abroad Road Map', icon: Calendar },
              { id: 'costs_living', label: '3. Actual Cost of Living & Fees', icon: DollarSign },
              { id: 'scholarships', label: '4. Verified Scholarships & Grants', icon: Award },
              { id: 'loans', label: '5. Education Loans & EMI Calculator', icon: Landmark },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-indigo-950' : 'bg-indigo-500/30 text-indigo-200'}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: TARGET COLLEGES & DIRECT ADMISSION LINKS (MAIN) */}
      {/* ============================================================== */}
      {activeTab === 'colleges' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Target Colleges, Live Tuition & Direct Admission Links
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredUnis.length} of {shortlisted_universities.length} curated universities. Click direct admission links to register directly on official college portals.
                </p>
              </div>

              {/* Tier Filters */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
                {['ALL', 'AMBITIOUS', 'TARGET', 'SAFE'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      tierFilter === tier ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tier === 'ALL' ? 'All Tiers' : tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Country Chips */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={uniSearchQuery}
                  onChange={(e) => setUniSearchQuery(e.target.value)}
                  placeholder="Search by college name, degree, country, or city (e.g. Stanford, TUM, Toronto, Berkeley, Cambridge)..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Country Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  onClick={() => setCountryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    countryFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🌍 All Countries ({shortlisted_universities.length})
                </button>
                {availableCountries.map((c) => {
                  const count = shortlisted_universities.filter((u) => u.country === c).length;
                  const flag = shortlisted_universities.find((u) => u.country === c)?.flag || '🎓';
                  const isSelected = countryFilter === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setCountryFilter(c)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{flag}</span>
                      <span>{c}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLLEGES CARDS LIST */}
          {filteredUnis.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No institutions found matching your filters</h4>
              <p className="text-xs text-slate-500">Try adjusting your search query, country tab, or tier filters.</p>
              <button
                onClick={() => { setCountryFilter('ALL'); setTierFilter('ALL'); setUniSearchQuery(''); }}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredUnis.map((uni) => {
                const isTuitionFree = uni.tuition_breakdown?.is_tuition_free || uni.annual_tuition_inr < 100000;
                const livingMonthly = uni.living_breakdown?.monthly_living_inr || Math.round(uni.annual_living_inr / 12);
                const loanEmi = uni.loan_options?.estimated_monthly_emi_inr || 0;
                const loanAmountEst = uni.loan_options?.recommended_loan_inr || Math.round((uni.annual_tuition_inr * 2 + uni.annual_living_inr * 2) * 0.85);

                return (
                  <div key={uni.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 hover:border-indigo-300 transition-all">
                    {/* Header Row: College Name, Rankings, Direct Link */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-2xl">{uni.flag}</span>
                          <h4 className="text-lg font-extrabold text-slate-900">{uni.university_name}</h4>
                          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                            uni.tier === 'AMBITIOUS' ? 'bg-amber-100 text-amber-800' :
                            uni.tier === 'TARGET' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {uni.tier}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-md">
                            QS #{uni.qs_world_ranking}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md border border-emerald-200">
                            {uni.country}
                          </span>
                          {isTuitionFree && (
                            <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full">
                              ⭐ 100% Tuition-Free (€0 Fee)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-indigo-700 font-bold mt-1">{uni.program_name}</p>
                      </div>

                      {/* Direct Admission Link Button */}
                      <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
                        <a
                          href={uni.direct_application_url || uni.official_portal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md hover:shadow-indigo-500/25"
                        >
                          <span>Direct Admission Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {uni.exam_form_url && (
                          <a
                            href={uni.exam_form_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition cursor-pointer"
                            title="Direct Examination Booking Form"
                          >
                            <span>Exam / APS Booking</span>
                            <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Financial & Academic Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* College Fees */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">College Fees / Tuition</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-extrabold text-slate-900">
                            {isTuitionFree ? '€0 / Free' : `₹${(uni.annual_tuition_inr / 100000).toFixed(1)} Lakhs`}
                          </span>
                          <span className="text-[10px] text-slate-500">/ yr</span>
                        </div>
                        <span className="text-[10px] text-indigo-700 font-semibold block truncate">
                          {isTuitionFree ? 'Zero tuition at state university' : `Total 2-Yr: ₹${((uni.annual_tuition_inr * 2) / 100000).toFixed(1)}L`}
                        </span>
                      </div>

                      {/* Actual Cost of Living */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Actual Cost of Living</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{(uni.annual_living_inr / 100000).toFixed(1)} Lakhs
                          </span>
                          <span className="text-[10px] text-slate-500">/ yr</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          ~₹{livingMonthly.toLocaleString()}/mo essential living
                        </span>
                      </div>

                      {/* Loan Feature */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Education Loan & EMI</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{(loanAmountEst / 100000).toFixed(1)} Lakhs
                          </span>
                          <span className="text-[10px] text-slate-500">loan</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          ~₹{loanEmi.toLocaleString()}/mo EMI @ 10.5%
                        </span>
                      </div>

                      {/* Expected Post-MS Salary */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Post-MS Avg CTC</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-extrabold text-emerald-700">
                            ₹{(uni.post_ms_avg_starting_salary_inr / 100000).toFixed(1)} Lakhs
                          </span>
                          <span className="text-[10px] text-slate-500">/ yr</span>
                        </div>
                        <span className="text-[10px] text-indigo-700 font-semibold block">
                          Payback: ~{uni.roi_payback_years} years clean ROI
                        </span>
                      </div>
                    </div>

                    {/* EXPANDABLE SECTION: LIVING BREAKDOWN + SCHOLARSHIPS + LOAN PARTNERS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Actual Living Expense Breakdown */}
                      <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                            Actual Monthly Living Breakdown ({uni.country})
                          </span>
                          <span className="text-[11px] font-extrabold text-indigo-800">
                            ₹{livingMonthly.toLocaleString()} / mo
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="bg-white p-2 rounded-xl border border-indigo-100 flex justify-between">
                            <span className="text-slate-500">Rent / Housing:</span>
                            <span className="font-bold text-slate-800">
                              ₹{(uni.living_breakdown?.rent_monthly_inr || Math.round(livingMonthly * 0.54)).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-indigo-100 flex justify-between">
                            <span className="text-slate-500">Food & Groceries:</span>
                            <span className="font-bold text-slate-800">
                              ₹{(uni.living_breakdown?.food_groceries_monthly_inr || Math.round(livingMonthly * 0.22)).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-indigo-100 flex justify-between">
                            <span className="text-slate-500">Transit & Utilities:</span>
                            <span className="font-bold text-slate-800">
                              ₹{(uni.living_breakdown?.transit_utilities_monthly_inr || Math.round(livingMonthly * 0.14)).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-indigo-100 flex justify-between">
                            <span className="text-slate-500">Health Insurance:</span>
                            <span className="font-bold text-slate-800">
                              ₹{(uni.living_breakdown?.health_insurance_monthly_inr || Math.round(livingMonthly * 0.10)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Curated Scholarships for this College */}
                      <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            Matched Scholarships ({uni.scholarships?.length || 2} Available)
                          </span>
                          <span className="text-[10px] text-amber-800 font-bold uppercase">Merit & Need Based</span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {(uni.scholarships || []).slice(0, 2).map((sch, sIdx) => (
                            <div key={sIdx} className="bg-white p-2.5 rounded-xl border border-amber-200/70 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-900 block truncate">{sch.name}</span>
                                <span className="text-[10px] text-emerald-700 font-extrabold block">{sch.coverage}</span>
                              </div>
                              <a
                                href={sch.apply_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg whitespace-nowrap flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <span>Apply</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Footer: Cutoffs, Deadlines & Application Checklist */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-3 flex-wrap text-slate-600">
                        <span><strong>Cutoff CGPA:</strong> {uni.min_cgpa_cutoff.toFixed(1)}+</span>
                        <span>•</span>
                        <span><strong>GRE:</strong> {uni.gre_requirement}</span>
                        <span>•</span>
                        <span><strong>IELTS/TOEFL:</strong> {uni.ielts_requirement}+</span>
                        <span>•</span>
                        <span><strong>Deadline:</strong> {uni.application_deadline}</span>
                      </div>

                      {/* Direct Admission Link Highlight */}
                      <div className="flex items-center gap-2">
                        <a
                          href={uni.direct_application_url || uni.official_portal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 underline"
                        >
                          Official Admission Portal: {new URL(uni.direct_application_url || uni.official_portal_url).hostname}
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
      )}

      {/* ============================================================== */}
      {/* SECTION 2: THE ROAD MAP (INTERACTIVE STUDY ABROAD PIPELINE) */}
      {/* ============================================================== */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                The Master's Study Abroad Road Map ({selectedIntake})
              </h3>
              <p className="text-xs text-slate-500">
                End-to-end milestone timeline orchestrating destination selection, standardized exam cutoffs, university applications,
                education loan sanctions, and visa processing.
              </p>
            </div>

            {/* Visual Pipeline Bar */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-2">
              {[
                { step: '01', title: 'Destinations', status: 'Completed', color: 'emerald' },
                { step: '02', title: 'Exams & APS', status: 'In Progress', color: 'indigo' },
                { step: '03', title: 'Shortlisting', status: 'Active', color: 'indigo' },
                { step: '04', title: 'Loans & Aid', status: 'Upcoming', color: 'slate' },
                { step: '05', title: 'Applications', status: 'Upcoming', color: 'slate' },
                { step: '06', title: 'Visa & Departure', status: 'Final Stage', color: 'slate' },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-center space-y-1 ${
                    p.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' :
                    p.color === 'indigo' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className={`text-[10px] font-extrabold uppercase block ${
                    p.color === 'emerald' ? 'text-emerald-700' : p.color === 'indigo' ? 'text-indigo-700' : 'text-slate-500'
                  }`}>
                    Step {p.step}
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">{p.title}</span>
                  <span className="text-[10px] font-semibold text-slate-500 block">{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Roadmap Phases */}
          {roadmap?.phases ? (
            <div className="space-y-4">
              {roadmap.phases.map((phase, pIdx) => (
                <div key={pIdx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                        {pIdx + 1}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{phase.phase_title}</h4>
                        <span className="text-xs text-indigo-700 font-semibold">{phase.timeline_months}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Key Milestones */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                      <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                        Key Milestones
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {phase.key_milestones.map((m, mIdx) => (
                          <li key={mIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Items */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                      <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                        Action Checklist
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {phase.action_items.map((act, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: ACTUAL COST OF LIVING & COLLEGE FEES COMPARISON */}
      {/* ============================================================== */}
      {activeTab === 'costs_living' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                Actual Cost of Living, Tuition Fees & Financial ROI
              </h3>
              <p className="text-xs text-slate-500">
                Transparent 2-year cost comparisons including college tuition, accommodation rent, grocery costs, health insurance,
                and post-graduation salary payback timelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {cost_roi_comparisons.map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.flag}</span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs truncate max-w-[170px]" title={item.university_name}>
                            {item.university_name}
                          </h4>
                          <span className="text-[10px] text-slate-500">{item.country}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {item.affordability_index?.split(' ')[0]}
                      </span>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-slate-200/60 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">2-Year Tuition:</span>
                        <span className="font-extrabold text-slate-900">₹{(item.tuition_2y_inr / 100000).toFixed(1)} Lakhs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">2-Year Living Cost:</span>
                        <span className="font-extrabold text-slate-900">₹{(item.living_2y_inr / 100000).toFixed(1)} Lakhs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total 2-Yr Budget:</span>
                        <span className="font-extrabold text-indigo-700">₹{(item.total_estimated_budget_inr / 100000).toFixed(1)} Lakhs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Post-MS CTC:</span>
                        <span className="font-extrabold text-emerald-700">₹{(item.projected_post_ms_salary_inr / 100000).toFixed(1)}L / yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ROI Payback Period:</span>
                        <span className="font-bold text-indigo-900">~{item.payback_period_years} Years</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600">
                    <p>{item.financial_engine_synergy_note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: VERIFIED SCHOLARSHIPS & GRANTS */}
      {/* ============================================================== */}
      {activeTab === 'scholarships' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Verified International Scholarships & Direct Application Links
              </h3>
              <p className="text-xs text-slate-500">
                Official government fellowships, university merit awards, and foundation grants across your target countries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { country: 'USA', name: 'Knight-Hennessy Scholars Program', funding: 'Full Tuition + $35,000/yr Living Stipend', eligibility: 'Stanford Master candidates demonstrating leadership and civic commitment', deadline: 'October 11', url: 'https://knight-hennessy.stanford.edu/' },
                { country: 'USA', name: 'Fulbright-Nehru Master’s Fellowships', funding: '100% Tuition + J-1 Visa + Flight + Living', eligibility: 'Indian nationals with minimum 3 years professional work experience', deadline: 'May 15', url: 'https://www.usief.org.in/Fulbright-Nehru-Fellowships.aspx' },
                { country: 'Germany', name: 'DAAD Study Scholarships for Foreign Graduates', funding: '€934/month Living Allowance + Health Insurance + Travel', eligibility: 'Bachelor’s degree holders with top 10% academic standing', deadline: 'November 15', url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/' },
                { country: 'Germany', name: 'Deutschlandstipendium National Merit Grant', funding: '€300/month Merit Grant co-funded by Govt & Tech Industry', eligibility: 'Enrolled students with outstanding academic potential', deadline: 'July 15', url: 'https://www.deutschlandstipendium.de/' },
                { country: 'Canada', name: 'Ontario Graduate Scholarship (OGS)', funding: 'CAD $15,000/year Merit Award', eligibility: 'Students admitted to Ontario universities (Toronto, Waterloo, etc.)', deadline: 'January 15', url: 'https://osap.gov.on.ca/OSAPPortal/en/A-ZListofAids/PRDR019245.html' },
                { country: 'Canada', name: 'Vanier Canada Graduate Scholarship (CGS)', funding: 'CAD $50,000/year for 3 years', eligibility: 'Exceptional academic excellence, research potential & leadership', deadline: 'November 01', url: 'https://vanier.gc.ca/en/home-accueil.html' },
                { country: 'UK', name: 'Chevening Scholarship (UK FCDO)', funding: '100% Tuition Fees + Monthly Stipend (£1,400) + Airfare', eligibility: 'Minimum 2 years work experience and strong leadership potential', deadline: 'November 07', url: 'https://www.chevening.org/' },
                { country: 'UK', name: 'Commonwealth Master’s Scholarship', funding: 'Full Tuition + Living Allowance + Return Flight Tickets', eligibility: 'Citizens of Commonwealth developing countries', deadline: 'October 17', url: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/' },
                { country: 'Australia', name: 'Australia Awards Scholarships', funding: 'Full Tuition + Return Airfare + Living Allowance (AUD $30k/yr)', eligibility: 'Citizens of partner Indo-Pacific nations', deadline: 'April 30', url: 'https://www.dfat.gov.au/people-to-people/australia-awards' },
                { country: 'Ireland', name: 'Government of Ireland International Education Scholarship', funding: '€10,000 Stipend + 100% Tuition Fee Waiver for 1 Year', eligibility: 'High-achieving non-EU/EEA students applying to Irish Higher Education', deadline: 'March 24', url: 'https://eurireland.ie/2023/02/10/government-of-ireland-international-education-scholarships-2023/' },
                { country: 'Singapore', name: 'Singapore International Graduate Award (SINGA)', funding: 'Full Tuition + SGD $2,700/mo Living Stipend + Airfare', eligibility: 'International graduates with passion for AI, Computing, and Biomedical Research', deadline: 'June 01 / Dec 01', url: 'https://www.a-star.edu.sg/Scholarships/for-graduate-studies/singapore-international-graduate-award-singa' },
                { country: 'France', name: 'Eiffel Excellence Scholarship (Campus France)', funding: '€1,181/month Living Allowance + Health Insurance + Travel', eligibility: 'Top-tier international candidates nominated by French Grande Écoles', deadline: 'January 10', url: 'https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence' }
              ].map((sch, idx) => (
                <div key={idx} className="bg-slate-50 rounded-3xl p-5 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold rounded-md">
                        {sch.country}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">Deadline: {sch.deadline}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm">{sch.name}</h4>
                    <p className="text-xs font-bold text-emerald-700">{sch.funding}</p>
                    <p className="text-[11px] text-slate-600">{sch.eligibility}</p>
                  </div>

                  <a
                    href={sch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                  >
                    <span>Official Scholarship Application</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 5: EDUCATION LOANS & EMI CALCULATOR */}
      {/* ============================================================== */}
      {activeTab === 'loans' && (
        <div className="space-y-6">
          {/* Interactive EMI Calculator Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-600" />
                Study Abroad Education Loan Simulator & EMI Planner
              </h3>
              <p className="text-xs text-slate-500">
                Simulate monthly EMIs, evaluate collateral vs unsecured loans, and compare approved partner lenders for international education financing.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sliders Area */}
              <div className="lg:col-span-2 space-y-5">
                {/* Loan Amount Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 uppercase">Loan Amount</span>
                    <span className="text-base text-indigo-600 font-extrabold">₹{(loanAmount / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="10000000"
                    step="250000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>₹5 Lakhs</span>
                    <span>₹50 Lakhs</span>
                    <span>₹1 Crore</span>
                  </div>
                </div>

                {/* Interest Rate Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 uppercase">Annual Interest Rate</span>
                    <span className="text-base text-indigo-600 font-extrabold">{loanRate}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="8.0"
                    max="13.5"
                    step="0.25"
                    value={loanRate}
                    onChange={(e) => setLoanRate(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>8.0% (Public Banks)</span>
                    <span>10.5% (Average NBFC)</span>
                    <span>13.5% (Unsecured High-Risk)</span>
                  </div>
                </div>

                {/* Loan Tenure Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 uppercase">Repayment Tenure</span>
                    <span className="text-base text-indigo-600 font-extrabold">{loanTenureYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="1"
                    value={loanTenureYears}
                    onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>5 Years</span>
                    <span>10 Years</span>
                    <span>15 Years (Standard)</span>
                  </div>
                </div>
              </div>

              {/* Live EMI Output Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">
                    Projected Post-MS EMI
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-emerald-400">₹{calculatedLoanEmi.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 font-semibold">/ month</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Repayment begins 6 months post-graduation (moratorium period)
                  </span>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Principal Amount:</span>
                    <span className="font-bold text-white">₹{(loanAmount / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Interest:</span>
                    <span className="font-bold text-amber-300">₹{(totalInterest / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Repayment:</span>
                    <span className="font-bold text-white">₹{(totalRepayment / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LENDER PARTNERS COMPARISON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Collateral Public Bank Options */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Landmark className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Collateral Education Loans (Public Banks)</h4>
                  <p className="text-[11px] text-slate-500">Lowest Interest Rates • Requires Property or Fixed Deposit</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-xs">SBI Global Ed-Vantage Scheme</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      8.65% – 9.15%
                    </span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    <li>• Loan up to ₹1.5 Crore against residential property/FD</li>
                    <li>• Tax exemption on total interest paid under Section 80E</li>
                    <li>• 0.50% special interest concession for female students</li>
                    <li>• Processing fee capped at ₹10,000 + GST</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-xs">Bank of Baroda Scholar Scheme</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      8.85% – 9.35%
                    </span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    <li>• Zero processing fees for premier global institutions (List AA/A)</li>
                    <li>• 100% financing for tuition, living, and airfare expenses</li>
                    <li>• Fast-track sanction through specialized overseas branches</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Non-Collateral NBFC & Global Fintech Options */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Non-Collateral Loans (No Security Required)</h4>
                  <p className="text-[11px] text-slate-500">Fast 5-Day Sanction • Co-signer or Future Earning Potential</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-xs">Prodigy Finance (US & UK)</span>
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      10.2% – 12.4% USD
                    </span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    <li>• NO collateral and NO co-signer / co-applicant required</li>
                    <li>• Sanction based entirely on future earning potential at top universities</li>
                    <li>• Disbursed directly in foreign currency to the university</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-xs">HDFC Credila & Avanse</span>
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      10.50% – 11.75%
                    </span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    <li>• Unsecured non-collateral loan up to ₹75 Lakhs with earning co-applicant</li>
                    <li>• Sanction letter delivered before i-20 / CAS for visa proof</li>
                    <li>• Doorstep document pickup & dedicated relationship manager</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* KEPT BELOW: SUPPLEMENTARY TOOLS & EXAM PREP HUB LINK */}
      {/* ============================================================== */}
      <div className="pt-8 border-t border-slate-200 space-y-6">
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> 10-YEAR PREVIOUS PAPERS & 1,000+ QUESTION BANK
            </span>
            <h4 className="text-base font-extrabold text-white">Looking for Full Mock Tests & 10-Year Question Papers?</h4>
            <p className="text-xs text-slate-300 max-w-xl">
              Access complete 2016–2025 question papers for GRE, IELTS, TOEFL, and GMAT, timed test runners, adaptive difficulty, and mistake revision engines.
            </p>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('examprep')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-950 font-bold text-xs rounded-xl hover:bg-slate-100 transition shadow-sm cursor-pointer self-start md:self-auto shrink-0"
          >
            <span>Open Exam Prep Engine</span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </button>
        </div>

        {/* AI Statement of Purpose (SOP) & LOR Generator */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Statement of Purpose (SOP) & LOR Copilot
            </h4>
            <p className="text-xs text-slate-500">
              Draft university-specific SOPs and academic letters of recommendation based on your verified projects, skills, and research interests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target University</label>
              <input
                type="text"
                value={sopTargetUni}
                onChange={(e) => setSopTargetUni(e.target.value)}
                placeholder="e.g. Carnegie Mellon University"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Program Track</label>
              <input
                type="text"
                value={sopTargetProgram}
                onChange={(e) => setSopTargetProgram(e.target.value)}
                placeholder="e.g. MS in Artificial Intelligence"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Specific Research Focus</label>
              <input
                type="text"
                value={sopResearchInterest}
                onChange={(e) => setSopResearchInterest(e.target.value)}
                placeholder="e.g. Distributed Deep Learning Systems"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerateSop}
              disabled={generatingSop}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {generatingSop ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{generatingSop ? 'Synthesizing SOP with AI...' : 'Generate Tailored SOP & LOR'}</span>
            </button>
          </div>

          {sopResult && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs">{sopResult.sop_title}</span>
                  <button
                    onClick={() => copyToClipboard(sopResult.sop_text, 'sop')}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {copiedKey === 'sop' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'sop' ? 'Copied!' : 'Copy SOP'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-700 whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200 max-h-60 overflow-y-auto leading-relaxed">
                  {sopResult.sop_text}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

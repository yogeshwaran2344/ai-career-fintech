import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CareerSimulationView from './components/CareerSimulationView';
import SkillGraphView from './components/SkillGraphView';
import JobMarketView from './components/JobMarketView';
import ResumeAnalyzerView from './components/ResumeAnalyzerView';
import CareerView from './components/CareerView';
import FinanceView from './components/FinanceView';
import InvestmentView from './components/InvestmentView';
import DecisionCopilotView from './components/DecisionCopilotView';
import ProfileView from './components/ProfileView';
import ApplicationTrackerView from './components/ApplicationTrackerView';
import FinancialHealthView from './components/FinancialHealthView';
import FinancialSafetyTab from './components/FinancialSafetyTab';
import StudyAbroadView from './components/StudyAbroadView';
import ExamPrepView from './components/ExamPrepView';
import TodayPlanView from './components/TodayPlanView';
import InterviewArenaView from './components/InterviewArenaView';
import AuthModal from './components/AuthModal';
import PlacementScoreModal from './components/PlacementScoreModal';
import WeeklyReviewModal from './components/WeeklyReviewModal';
import { api, authState } from './api';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Bell, 
  Search, 
  CheckCircle2, 
  Sliders, 
  Award, 
  Calendar, 
  RotateCcw, 
  Settings, 
  ArrowRight, 
  ArrowLeft,
  LogOut,
  Check,
  Inbox,
  X,
  AlertCircle,
  Menu,
  Zap,
  Compass,
  Globe,
  TrendingUp
} from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('UI Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto my-12 bg-white rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-black text-xl">
            ⚠️
          </div>
          <h2 className="text-base font-black text-stone-900">Module Display Notice</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            {this.state.error?.message || 'An unexpected rendering issue occurred in this view.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload View</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [projects, setProjects] = useState([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications & Signals
  const [notificationsList, setNotificationsList] = useState([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState([]);
  const [notifFilter, setNotifFilter] = useState('ALL');
  const notifRef = useRef(null);

  useEffect(() => {
    initAuthAndData();

    const handleAuthExpired = () => {
      setProfile(null);
      setIsAuthOpen(true);
      showNotification('Your session has expired or was revoked. Please sign in again.', 'Session Expired');
    };

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (profile?.id) {
      try {
        const stored = localStorage.getItem(`advisor_read_notifs_${profile.id}`);
        if (stored) {
          setReadNotifIds(JSON.parse(stored));
        }
      } catch {}
    }
  }, [profile?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initAuthAndData = async () => {
    try {
      setLoading(true);
      const token = authState.getToken();
      const cachedUser = authState.getUser();

      if (!token) {
        setProfile(null);
        setIsAuthOpen(true);
        setLoading(false);
        return;
      }

      // Optimistically restore cached profile so user doesn't see blank screen
      if (cachedUser && cachedUser.name) {
        setProfile(cachedUser);
        setIsAuthOpen(false);
      }

      try {
        const userProfile = await api.getMe();
        if (userProfile && userProfile.name) {
          setProfile(userProfile);
          setIsAuthOpen(false);
          await loadEngineData();
        }
      } catch (err) {
        console.warn('API getMe check:', err.message);
        const errMsg = (err.message || '').toLowerCase();
        if ((errMsg.includes('revoked') || errMsg.includes('logged out')) && !cachedUser) {
          authState.clearToken();
          authState.clearUser();
          setProfile(null);
          setIsAuthOpen(true);
        } else if (cachedUser && cachedUser.name) {
          // Keep user logged in permanently with cached profile!
          setProfile(cachedUser);
          setIsAuthOpen(false);
          await loadEngineData().catch(() => {});
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadEngineData = async () => {
    try {
      const [
        rData,
        recData,
        gapData,
        roadData,
        projData,
        budData,
        dayData,
        notifData
      ] = await Promise.all([
        api.getReadiness().catch(() => null),
        api.getRecommendations().catch(() => []),
        api.getSkillGaps().catch(() => []),
        api.getRoadmap().catch(() => null),
        api.getProjects().catch(() => []),
        api.getBudgetAnalysis().catch(() => null),
        api.getDailyPlan().catch(() => null),
        api.getNotifications().catch(() => null)
      ]);

      if (rData) setReadiness(rData);
      if (recData) setRecommendations(recData);
      if (gapData) setSkillGaps(gapData);
      if (roadData) setRoadmap(roadData);
      if (projData) setProjects(projData);
      if (budData) setBudgetAnalysis(budData);
      if (dayData) setDailyPlan(dayData);
      if (notifData && Array.isArray(notifData.notifications)) {
        setNotificationsList(notifData.notifications);
      }
    } catch (err) {
      console.error('Error fetching engine metrics:', err);
    }
  };

  const markNotifAsRead = (id) => {
    setReadNotifIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(`advisor_read_notifs_${profile?.id || 'default'}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const markAllNotifsAsRead = () => {
    const allIds = notificationsList.map(n => n.id);
    setReadNotifIds(allIds);
    try {
      localStorage.setItem(`advisor_read_notifs_${profile?.id || 'default'}`, JSON.stringify(allIds));
    } catch {}
  };

  const handleNotificationAction = (item) => {
    markNotifAsRead(item.id);
    setIsNotifDropdownOpen(false);
    if (actionUrl.includes('daily-plan') || actionUrl.includes('daily')) setCurrentTab('dashboard');
    else if (actionUrl.includes('skills') || actionUrl.includes('skill')) setCurrentTab('skillgraph');
    else if (actionUrl.includes('jobs') || actionUrl.includes('job')) setCurrentTab('jobmarket');
    else if (actionUrl.includes('resume')) setCurrentTab('resume');
    else if (actionUrl.includes('wealth') || actionUrl.includes('finance')) setCurrentTab('finance');
    else if (actionUrl.includes('investments')) setCurrentTab('investments');
    else if (actionUrl.includes('applications')) setCurrentTab('applications');
    else setCurrentTab('dashboard');
  };

  const showNotification = (message, title = 'AI Alert', type = 'info') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAuthSuccess = async (userProfile) => {
    setProfile(userProfile);
    setIsAuthOpen(false);
    await loadEngineData();
    showNotification(`Welcome, ${userProfile.name}! Your personalized career and financial roadmaps are active.`, 'Profile Ready', 'success');
  };

  const handleSaveProfile = async (updatedProfile) => {
    try {
      const saved = await api.updateProfile(updatedProfile);
      setProfile(saved);
      await loadEngineData();
      showNotification(`Profile for ${saved.name} updated. All AI engines have re-evaluated!`, 'Profile Synced', 'success');
    } catch (err) {
      console.error(err);
      showNotification(err.message || 'Failed to update profile.', 'Error Updating Profile', 'error');
    }
  };

  const handleResetProfile = async (payload = { confirm_phrase: 'RESET' }) => {
    try {
      const res = await api.resetProfile(payload);
      if (res.updated_profile) {
        setProfile(res.updated_profile);
      }
      await loadEngineData();
      showNotification(res.message || 'Progress metrics reset to initial baseline.', 'Reset Complete', 'success');
      confetti({ particleCount: 40 });
    } catch (err) {
      console.error(err);
      showNotification(err.message || 'Failed to reset profile.', 'Reset Failed', 'error');
      throw err;
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const res = await api.toggleTask(taskId);
      const updatedPlan = await api.getDailyPlan();
      setDailyPlan(updatedPlan);

      if (res.completed && res.skill_gained) {
        showNotification(
          `Sprint completed! Inferred ${res.skill_gained.skill} growth: ${res.skill_gained.old_proficiency} → ${res.skill_gained.new_proficiency} (+0.1). Placement Readiness: ${res.skill_gained.readiness_pct}%`,
          '🎯 Skill Progress Inferred'
        );
        await loadEngineData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkillBoost = async (skillUpdates) => {
    try {
      const res = await api.updateProgress(skillUpdates);
      setProfile(res.profile);
      await loadEngineData();
      showNotification(res.summary.feedback, `Readiness Score: ${res.summary.new_readiness_pct}% (+${res.summary.change_pct}%)`);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectRole = async (newRole) => {
    if (!profile) return;
    try {
      const res = await api.changeTargetRole(newRole);
      if (res.profile) setProfile(res.profile);
      if (res.readiness) setReadiness(res.readiness);
      if (res.skill_gaps) setSkillGaps(res.skill_gaps);
      if (res.roadmap) setRoadmap(res.roadmap);
      if (res.projects) setProjects(res.projects);
      showNotification(`Target switched to ${newRole}. Roadmap, skill gaps, and projects re-evaluated!`, 'Target Updated', 'success');
      loadEngineData();
    } catch (err) {
      console.error(err);
      showNotification(err.message || 'Failed to switch target role.', 'Target Change Failed', 'error');
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-stone-600">Initializing Career & Wealth Intelligence Engines...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    setProfile(null);
    setIsAuthOpen(true);
    showNotification('You have signed out successfully.', 'Session Closed');
  };

  // Not set up gate - directly show the login and signup interface
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center p-6 text-stone-800">
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          onAuthSuccess={handleAuthSuccess}
          isDismissible={false}
          initialMode="LOGIN"
        />
      </div>
    );
  }

  // Notifications derived calculations
  const unreadNotifCount = (notificationsList || []).filter(n => !readNotifIds.includes(n.id)).length;
  const filteredNotifications = (notificationsList || []).filter(n => {
    if (notifFilter === 'ALL') return true;
    return (n.category || '').toLowerCase() === notifFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen flex bg-[#FBF9F6] text-stone-800 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        profile={profile}
        readiness={readiness}
        onReset={handleResetProfile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPlacementModal={() => setIsPlacementModalOpen(true)}
        onOpenWeeklyReview={() => setIsWeeklyReviewOpen(true)}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-5 md:p-8 overflow-y-auto max-h-screen relative w-full min-w-0 pb-20 md:pb-8">
        
        {/* Top User Status Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between pb-3 border-b border-stone-200/60 text-xs gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-stone-800" />
            </button>

            <span className="text-base shrink-0">{profile?.avatar || '🎓'}</span>
            <span className="font-bold text-stone-900 truncate">
              <span className="hidden xs:inline">Student: </span><span className="text-orange-600 font-extrabold">{profile?.name || 'User'}</span>
            </span>
            <span className="hidden sm:inline text-stone-400">•</span>
            <span className="hidden md:inline text-stone-600 font-medium truncate">
              {profile?.academic?.degree || 'B.Tech'} ({profile?.academic?.branch || 'General'})
            </span>
            <span className="text-stone-400">•</span>
            <span className="bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded text-[10px] truncate max-w-[130px] sm:max-w-none">
              {profile?.career_goal || 'Selected Track'}
            </span>
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-emerald-50 text-emerald-800 border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>⚡ LIVE MARKET TELEMETRY & BROKER OMS</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-white hover:bg-stone-100 text-stone-700 border-stone-200 transition-all cursor-pointer shadow-2xs"
              title="Global Search (Ctrl+K or ⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden sm:inline bg-stone-100 border border-stone-300 text-[9px] px-1.5 py-0.2 rounded font-mono text-stone-600">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotifDropdownOpen(prev => !prev)}
                className={`relative flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  unreadNotifCount > 0
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
                title="Signals & Updates"
              >
                <Bell className={`w-3.5 h-3.5 ${unreadNotifCount > 0 ? 'text-amber-600 animate-pulse' : 'text-stone-500'}`} />
                <span>Signals</span>
                {unreadNotifCount > 0 && (
                  <span className="bg-orange-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none shadow-xs">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotifDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden text-stone-800">
                  {/* Dropdown Header */}
                  <div className="p-3 bg-stone-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-600 flex items-center justify-center text-white text-xs">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black tracking-tight">Signals & Updates</h4>
                        <p className="text-[10px] text-stone-400">
                          {unreadNotifCount > 0 ? `${unreadNotifCount} unread proactive update${unreadNotifCount > 1 ? 's' : ''}` : 'All caught up'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {unreadNotifCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotifsAsRead}
                          className="text-[10px] text-amber-300 hover:text-amber-200 font-bold px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsNotifDropdownOpen(false)}
                        className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="p-2 bg-stone-50 border-b border-stone-200 flex items-center gap-1 overflow-x-auto text-[10px] font-bold">
                    {['ALL', 'study', 'career', 'finance', 'jobs'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNotifFilter(cat)}
                        className={`px-2 py-0.5 rounded-md transition cursor-pointer uppercase ${
                          notifFilter === cat
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <Inbox className="w-8 h-8 text-stone-300 mx-auto" />
                        <p className="text-xs font-bold text-stone-700">No signals in this category</p>
                        <p className="text-[11px] text-stone-400">Everything is aligned with your learning and wealth roadmap.</p>
                      </div>
                    ) : (
                      filteredNotifications.map(item => {
                        const isRead = readNotifIds.includes(item.id);
                        const categoryColor = 
                          item.category === 'career' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          item.category === 'finance' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          item.category === 'jobs' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          'bg-amber-100 text-amber-800 border-amber-200';

                        return (
                          <div
                            key={item.id}
                            className={`p-3 transition-colors ${isRead ? 'bg-white hover:bg-stone-50/80 opacity-75' : 'bg-amber-50/40 hover:bg-amber-50/70'}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${categoryColor}`}>
                                  {item.category || 'signal'}
                                </span>
                                <h5 className={`text-xs font-black ${isRead ? 'text-stone-700' : 'text-stone-900'}`}>
                                  {item.title}
                                </h5>
                              </div>
                              <span className="text-[10px] text-stone-400 font-medium whitespace-nowrap">
                                {item.timestamp}
                              </span>
                            </div>

                            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                              {item.message}
                            </p>

                            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleNotificationAction(item)}
                                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition cursor-pointer"
                              >
                                <span>Take Action</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              {!isRead ? (
                                <button
                                  type="button"
                                  onClick={() => markNotifAsRead(item.id)}
                                  className="text-[10px] font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Mark read</span>
                                </button>
                              ) : (
                                <span className="text-[9px] font-medium text-stone-400 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-stone-300" />
                                  <span>Read</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 bg-stone-50 border-t border-stone-200 text-center">
                    <p className="text-[10px] text-stone-500 font-medium">
                      💡 AI-driven insights re-evaluated with your real progress
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsPlacementModalOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 px-2 sm:px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Click to view full placement readiness breakdown"
            >
              <Award className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline">Placement: </span>
              <span>{readiness?.readiness_pct ?? 0}%</span>
            </button>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Edit Profile & Questionnaire Setup"
            >
              <Settings className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden md:inline">Edit Setup</span>
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border max-w-md animate-bounce transition-all ${
            notification.type === 'error'
              ? 'bg-stone-950 text-white border-rose-500/80 shadow-rose-950/50'
              : notification.type === 'success'
              ? 'bg-stone-950 text-white border-emerald-500/80 shadow-emerald-950/50'
              : 'bg-stone-900 text-white border-stone-700'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-full text-white mt-0.5 ${
                notification.type === 'error'
                  ? 'bg-rose-500'
                  : notification.type === 'success'
                  ? 'bg-emerald-500'
                  : 'bg-orange-500'
              }`}>
                {notification.type === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-extrabold ${
                    notification.type === 'error'
                      ? 'text-rose-400'
                      : notification.type === 'success'
                      ? 'text-emerald-400'
                      : 'text-orange-400'
                  }`}>{notification.title}</h4>
                  <button
                    onClick={() => setNotification(null)}
                    className="text-stone-400 hover:text-white text-xs ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-stone-200 mt-0.5 leading-relaxed">{notification.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* View Switcher */}
        <ErrorBoundary>
          {currentTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              readiness={readiness}
              dailyPlan={dailyPlan}
              budgetAnalysis={budgetAnalysis}
              onToggleTask={handleToggleTask}
              setCurrentTab={setCurrentTab}
              onOpenPlacementModal={() => setIsPlacementModalOpen(true)}
              onOpenWeeklyReview={() => setIsWeeklyReviewOpen(true)}
            />
          )}

          {currentTab === 'today' && (
            <TodayPlanView
              profile={profile}
              dailyPlan={dailyPlan}
              onToggleTask={handleToggleTask}
              onRefresh={loadEngineData}
            />
          )}

          {currentTab === 'interview' && (
            <InterviewArenaView
              profile={profile}
              onRefresh={loadEngineData}
            />
          )}

          {currentTab === 'financialhealth' && (
            <FinancialHealthView
              profile={profile}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'safety' && (
            <FinancialSafetyTab
              profile={profile}
            />
          )}

          {currentTab === 'simulation' && (
            <CareerSimulationView
              profile={profile}
            />
          )}

          {currentTab === 'skillgraph' && (
            <SkillGraphView
              profile={profile}
              readiness={readiness}
              onRefresh={loadEngineData}
            />
          )}

          {currentTab === 'jobmarket' && (
            <JobMarketView
              profile={profile}
            />
          )}

          {currentTab === 'resume' && (
            <ResumeAnalyzerView
              profile={profile}
              onRefresh={loadEngineData}
            />
          )}

          {currentTab === 'applications' && (
            <ApplicationTrackerView
              profile={profile}
            />
          )}

          {currentTab === 'career' && (
            <CareerView
              profile={profile}
              readiness={readiness}
              recommendations={recommendations}
              skillGaps={skillGaps}
              roadmap={roadmap}
              projects={projects}
              onSelectRole={handleSelectRole}
            />
          )}

          {currentTab === 'finance' && (
            <FinanceView
              profile={profile}
              budgetAnalysis={budgetAnalysis}
            />
          )}

          {currentTab === 'investments' && (
            <InvestmentView
              profile={profile}
            />
          )}

          {currentTab === 'studyabroad' && (
            <StudyAbroadView
              profile={profile}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'examprep' && (
            <ExamPrepView
              profile={profile}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'copilot' && (
            <DecisionCopilotView
              profile={profile}
              readiness={readiness}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onReset={handleResetProfile}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <PlacementScoreModal
        isOpen={isPlacementModalOpen}
        onClose={() => setIsPlacementModalOpen(false)}
        profile={profile}
      />

      <WeeklyReviewModal
        isOpen={isWeeklyReviewOpen}
        onClose={() => setIsWeeklyReviewOpen(false)}
        profile={profile}
      />

      {/* Global Search Dialog Modal (Cmd/Ctrl + K) */}
      {isSearchOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsSearchOpen(false); }}
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-20 p-4 z-50 animate-fadeIn cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden space-y-0 cursor-default"
          >
            {/* Search Input Bar with prominent Back & Close Buttons */}
            <div className="p-3 sm:p-4 border-b border-stone-100 flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer flex-shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules, skills, exams, destinations, or roadmaps..."
                className="w-full text-xs sm:text-sm font-semibold text-stone-900 placeholder-stone-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-stone-400 hover:text-stone-700 font-bold px-1.5 py-0.5"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 font-bold px-2 py-1 rounded-lg hover:bg-stone-100 transition cursor-pointer flex-shrink-0"
                title="Close search"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
                <kbd className="hidden sm:inline-block bg-stone-100 border border-stone-300 text-[10px] px-1.5 py-0.5 rounded font-mono text-stone-500 ml-1">
                  ESC
                </kbd>
              </button>
            </div>

            {/* Quick Links / Filtered Results */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {[
                { id: 'dashboard', title: 'Dashboard', desc: 'Overview, career metrics, capital buffer', category: 'Overview' },
                { id: 'today', title: "Daily Action Plan", desc: 'Priority checklist, focus sprints, spaced review radar', category: 'Planner' },
                { id: 'interview', title: 'Mock Interview Arena', desc: 'Mock technical & STAR behavioural interview simulation', category: 'Career' },
                { id: 'career', title: 'Career Engine', desc: 'Placement readiness, role tracks, and career roadmaps', category: 'Career' },
                { id: 'simulation', title: 'Career Trajectory Simulator', desc: 'Skill leaps, career and salary trajectories', category: 'Simulation' },
                { id: 'skillgraph', title: 'Skill Graph Tree', desc: 'Curated skills tree, prerequisite mapping, dependencies', category: 'Skills' },
                { id: 'resume', title: 'Resume & ATS Analyzer', desc: 'ATS score, missing metrics, and bullet point enhancements', category: 'Career' },
                { id: 'jobmarket', title: 'Opportunity Radar', desc: 'Jobs, internships, scholarships, hackathons & certs', category: 'Opportunities' },
                { id: 'applications', title: 'Application Tracker', desc: 'Job hunt Kanban pipeline, deadlines, interview stages', category: 'Tracker' },
                { id: 'financialhealth', title: 'My Financial Health', desc: 'Cashflow health, buffer resilience, and debt stress', category: 'Wealth' },
                { id: 'finance', title: 'Finance & Budget', desc: 'Expense tracking, discretionary income, budgeting rules', category: 'Wealth' },
                { id: 'investments', title: 'Investments & Orders', desc: 'Live broker simulation, stock research, SIP calculator', category: 'Fintech' },
                { id: 'studyabroad', title: 'Study Abroad & MS', desc: 'Top 3 countries comparison, university finder, costs & ROI', category: 'Global' },
                { id: 'examprep', title: 'Exam Prep & Past Papers', desc: 'Comprehensive questions, GRE, IELTS, GATE, TOEFL mock tests', category: 'Exams' },
                { id: 'safety', title: 'Financial Safety Center', desc: 'Emergency reserve clearance, impulse lock, safety checks', category: 'Safety' },
                { id: 'copilot', title: 'Career & Finance Advisor', desc: 'Strategic roadmaps, career decisions & learning guidance', category: 'Advisor' },
                { id: 'profile', title: 'Profile & Setup', desc: 'Academic details, financial settings, export my data', category: 'Account' },
                // Skills & Concepts
                { id: 'skillgraph', title: 'PyTorch & Deep Learning Systems', desc: 'Neural network training, tensor broadcasting, autograd', category: 'Skill' },
                { id: 'skillgraph', title: 'Docker & Containerization', desc: 'Dockerfile, microservices deployment, volume mapping', category: 'Skill' },
                { id: 'skillgraph', title: 'Data Structures & Algorithms (Trees, DP)', desc: 'Binary search, graph DFS/BFS, dynamic programming', category: 'Skill' },
                { id: 'skillgraph', title: 'FastAPI & Production REST APIs', desc: 'Async Python endpoints, Pydantic, OpenAPI schemas', category: 'Skill' },
                // Global study & exams
                { id: 'studyabroad', title: 'Germany MS (TUM, RWTH Aachen)', desc: 'Zero tuition, APS certificate, blocked account €11,208', category: 'Study Abroad' },
                { id: 'studyabroad', title: 'United States MS (CMU, Stanford, UT Austin)', desc: 'STEM OPT 3-year extension, top tech hiring hub', category: 'Study Abroad' },
                { id: 'examprep', title: 'GRE Practice & Past Papers', desc: 'Previous questions, Verbal & Quant drills', category: 'Exam Prep' },
                { id: 'examprep', title: 'IELTS / TOEFL Mock Tests', desc: 'Reading, Listening, Writing, Speaking practice papers', category: 'Exam Prep' },
                // Listed Companies & Investment Options
                { id: 'investments', title: 'Suzlon, Tata Steel & IRFC (Budget Stocks)', desc: 'Micro equities from ₹64, clean energy & railway infrastructure', category: 'Stocks' },
                { id: 'investments', title: 'Zomato & BEL (Growth Leaders)', desc: 'Quick commerce & defense electronics with high momentum', category: 'Stocks' },
                { id: 'investments', title: 'TCS & Infosys (IT Bluechips)', desc: 'Direct equity, dividend track record, cloud transformation', category: 'Stocks' },
                { id: 'investments', title: 'Tata Motors & Reliance (Large Cap)', desc: 'Automotive electrification, telecom & retail powerhouse', category: 'Stocks' },
                { id: 'investments', title: 'Bharat Electronics (BEL Defense)', desc: 'Indigenous radar, defense electronics & order book', category: 'Companies' },
                { id: 'investments', title: 'Reliance Industries & HDFC Bank', desc: 'Conglomerate telecom, retail & private banking leader', category: 'Companies' },
                { id: 'investments', title: 'Nifty 50 BeES & Gold BeES ETFs', desc: 'Passive index compounding and gold inflation hedge', category: 'Companies' }
              ]
                .filter(item => {
                  if (!searchQuery.trim()) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    item.title.toLowerCase().includes(query) ||
                    item.desc.toLowerCase().includes(query) ||
                    item.category.toLowerCase().includes(query)
                  );
                })
                .slice(0, 8)
                .map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentTab(item.id);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-3 rounded-2xl hover:bg-stone-50 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-stone-100 text-stone-600">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                ))}
            </div>

            {/* Search Footer */}
            <div className="p-3 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between font-medium">
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900 font-bold px-2 py-1 rounded-lg hover:bg-stone-200/60 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go Back</span>
              </button>
              <div className="flex items-center gap-2 text-stone-500">
                <span className="hidden sm:inline">Navigate quickly to any module</span>
                <span>• Click <strong>Back</strong> or press <strong>ESC</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Bottom Quick-Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#FCFAF7]/95 backdrop-blur-md border-t border-stone-200/80 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {[
          { id: 'today', label: 'Today', icon: Zap },
          { id: 'career', label: 'Career', icon: Compass },
          { id: 'studyabroad', label: 'Abroad', icon: Globe },
          { id: 'investments', label: 'Wealth', icon: TrendingUp }
        ].map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                active ? 'text-orange-600 font-extrabold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${active ? 'bg-orange-100 text-orange-600' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
        {/* Full Menu Trigger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-stone-500 hover:text-stone-800 transition-all cursor-pointer"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-4 h-4 text-stone-700" />
          </div>
          <span className="text-[10px] mt-0.5">All Menu</span>
        </button>
      </nav>
    </div>
  );
}

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
import TodayPlanView from './components/TodayPlanView';
import ProfileView from './components/ProfileView';
import ApplicationTrackerView from './components/ApplicationTrackerView';
import FinancialHealthView from './components/FinancialHealthView';
import FinancialSafetyTab from './components/FinancialSafetyTab';
import StudyAbroadView from './components/StudyAbroadView';
import AuthModal from './components/AuthModal';
import PlacementScoreModal from './components/PlacementScoreModal';
import WeeklyReviewModal from './components/WeeklyReviewModal';
import { api, authState } from './api';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  Sliders, 
  Award, 
  Calendar, 
  RotateCcw, 
  Settings, 
  ArrowRight, 
  LogOut,
  Check,
  Inbox,
  X
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

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
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
        if (errMsg.includes('401') || errMsg.includes('unauthorized') || errMsg.includes('session expired') || errMsg.includes('invalid token')) {
          authState.clearToken();
          authState.clearUser();
          setProfile(null);
          setIsAuthOpen(true);
        } else if (cachedUser && cachedUser.name) {
          // Keep session active with cached profile during network retries
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
    const actionUrl = item.action_url || '';
    if (actionUrl.includes('daily-plan') || actionUrl.includes('daily')) setCurrentTab('today');
    else if (actionUrl.includes('skills') || actionUrl.includes('skill')) setCurrentTab('skillgraph');
    else if (actionUrl.includes('jobs') || actionUrl.includes('job')) setCurrentTab('jobmarket');
    else if (actionUrl.includes('resume')) setCurrentTab('resume');
    else if (actionUrl.includes('wealth') || actionUrl.includes('finance')) setCurrentTab('finance');
    else if (actionUrl.includes('investments')) setCurrentTab('investments');
    else if (actionUrl.includes('applications')) setCurrentTab('applications');
    else setCurrentTab('dashboard');
  };

  const showNotification = (message, title = 'AI Alert') => {
    setNotification({ title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAuthSuccess = async (userProfile) => {
    setProfile(userProfile);
    setIsAuthOpen(false);
    await loadEngineData();
    showNotification(`Welcome, ${userProfile.name}! Your personalized career and financial roadmaps are active.`, 'Profile Ready');
  };

  const handleSaveProfile = async (updatedProfile) => {
    try {
      const saved = await api.updateProfile(updatedProfile);
      setProfile(saved);
      await loadEngineData();
      showNotification(`Profile for ${saved.name} updated. All AI engines have re-evaluated!`, 'Profile Synced');
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetProfile = async () => {
    try {
      const reset = await api.resetProfile();
      setProfile(reset);
      await loadEngineData();
      showNotification('Progress metrics reset to initial baseline.', 'Reset Complete');
      confetti({ particleCount: 40 });
    } catch (err) {
      console.error(err);
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
    const updated = { ...profile, career_goal: newRole };
    await handleSaveProfile(updated);
    showNotification(`Target switched to ${newRole}. Roadmap and skill gaps regenerated!`, 'Target Updated');
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
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen relative">
        
        {/* Top User Status Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between pb-3 border-b border-stone-200/60 text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{profile?.avatar || '🎓'}</span>
            <span className="font-bold text-stone-900">
              Student: <span className="text-orange-600 font-extrabold">{profile?.name || 'User'}</span>
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-600 font-medium">
              {profile?.academic?.degree || 'B.Tech'} ({profile?.academic?.branch || 'General'})
            </span>
            <span className="text-stone-400">•</span>
            <span className="bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded text-[10px]">
              {profile?.career_goal || 'Selected Track'}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-emerald-50 text-emerald-800 border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>🟢 PAPER TRADING (Simulated Environment)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
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
                title="AI & System Notifications"
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
                        <h4 className="text-xs font-black tracking-tight">AI Signals & Alerts</h4>
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
              className="flex items-center gap-1 text-[11px] font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-orange-600" />
              <span>Placement Readiness: {readiness?.readiness_pct ?? 0}%</span>
            </button>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-stone-600" />
              <span>Edit Setup</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border border-stone-700 max-w-md animate-bounce">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-orange-500 text-white mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-orange-400">{notification.title}</h4>
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

          {currentTab === 'copilot' && (
            <DecisionCopilotView
              profile={profile}
              readiness={readiness}
            />
          )}

          {currentTab === 'today' && (
            <TodayPlanView
              profile={profile}
              dailyPlan={dailyPlan}
              onToggleTask={handleToggleTask}
              onSkillBoost={handleSkillBoost}
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
    </div>
  );
}

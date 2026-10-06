import React, { useState, useEffect } from 'react';
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
import AuthModal from './components/AuthModal';
import PlacementScoreModal from './components/PlacementScoreModal';
import WeeklyReviewModal from './components/WeeklyReviewModal';
import { api, authState } from './api';
import confetti from 'canvas-confetti';
import { Sparkles, Bell, CheckCircle2, Sliders, Award, Calendar, RotateCcw, Settings, ArrowRight, LogOut } from 'lucide-react';

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

  const initAuthAndData = async () => {
    try {
      setLoading(true);
      const token = authState.getToken();
      if (!token) {
        setProfile(null);
        setIsAuthOpen(true);
        setLoading(false);
        return;
      }
      const userProfile = await api.getMe();
      if (userProfile && userProfile.name) {
        setProfile(userProfile);
        await loadEngineData();
      } else {
        authState.clearToken();
        authState.clearUser();
        setProfile(null);
        setIsAuthOpen(true);
      }
    } catch (err) {
      authState.clearToken();
      authState.clearUser();
      setProfile(null);
      setIsAuthOpen(true);
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
        dayData
      ] = await Promise.all([
        api.getReadiness(),
        api.getRecommendations(),
        api.getSkillGaps(),
        api.getRoadmap(),
        api.getProjects(),
        api.getBudgetAnalysis(),
        api.getDailyPlan()
      ]);

      setReadiness(rData);
      setRecommendations(recData);
      setSkillGaps(gapData);
      setRoadmap(roadData);
      setProjects(projData);
      setBudgetAnalysis(budData);
      setDailyPlan(dayData);
    } catch (err) {
      console.error('Error fetching engine metrics:', err);
    }
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
          </div>

          <div className="flex items-center gap-2">
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

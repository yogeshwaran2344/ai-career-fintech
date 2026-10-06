import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  ExternalLink, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Building,
  DollarSign,
  MapPin,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { api } from '../api';
import confetti from 'canvas-confetti';

const STAGES = [
  'Applied',
  'OA',
  'Technical Interview',
  'HR Round',
  'Offer',
  'Rejected'
];

const STAGE_COLORS = {
  'Applied': 'bg-stone-100 text-stone-700 border-stone-200',
  'OA': 'bg-amber-50 text-amber-800 border-amber-200',
  'Technical Interview': 'bg-blue-50 text-blue-800 border-blue-200',
  'HR Round': 'bg-purple-50 text-purple-800 border-purple-200',
  'Offer': 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
  'Rejected': 'bg-rose-50 text-rose-700 border-rose-200'
};

export default function ApplicationTrackerView({ profile }) {
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // New application form modal / drawer
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState(profile?.career_goal || 'Software Engineer');
  const [newStage, setNewStage] = useState('Applied');
  const [newSalary, setNewSalary] = useState('');
  const [newLocation, setNewLocation] = useState('Bangalore / Remote');
  const [newJobUrl, setNewJobUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchApplicationsData();
  }, []);

  const fetchApplicationsData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [appsData, analyticsData] = await Promise.all([
        api.getJobApplications(),
        api.getJobFunnelAnalytics()
      ]);
      setApplications(appsData || []);
      setAnalytics(analyticsData || null);
    } catch (err) {
      console.error('Failed to load job applications:', err);
      setErrorMsg(err.message || 'Failed to load application data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    try {
      setIsSubmitting(true);
      await api.createJobApplication({
        company: newCompany.trim(),
        role: newRole.trim(),
        stage: newStage,
        salary_package_lpa: newSalary ? parseFloat(newSalary) : null,
        location: newLocation.trim(),
        job_url: newJobUrl.trim() || null,
        notes: newNotes.trim() || null
      });

      // Reset form
      setNewCompany('');
      setNewSalary('');
      setNewJobUrl('');
      setNewNotes('');
      setIsNewModalOpen(false);
      confetti({ particleCount: 40, spread: 50 });
      await fetchApplicationsData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error creating job application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStage = async (appId, nextStage) => {
    try {
      await api.updateJobApplication(appId, { stage: nextStage });
      if (nextStage === 'Offer') {
        confetti({ particleCount: 70, spread: 80 });
      }
      await fetchApplicationsData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update application stage.');
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm('Delete this application entry from your tracker?')) return;
    try {
      await api.deleteJobApplication(appId);
      await fetchApplicationsData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to delete application.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white advisor-card p-6 border-l-4 border-l-orange-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-orange-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Recruitment Funnel Intelligence
              </span>
              <span className="text-xs text-stone-500">End-to-End Interview Pipeline</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-1">
              Job Application & Conversion Tracker
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Track every outreach from initial submit to final offer. The AI engine detects drop-off bottlenecks and prescribes exact prep actions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Track New Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={fetchApplicationsData}
            className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Funnel Metrics & AI Bottleneck Coach */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 7 Cols: Conversion Pipeline Stats */}
          <div className="lg:col-span-7 advisor-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Hiring Funnel Progression
              </h3>
              <span className="text-xs font-bold text-stone-500">
                Conversion Rate: <span className="text-emerald-700 font-extrabold">{analytics.conversion_rate_pct}%</span>
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              {[
                { label: 'Applied', count: analytics.applied_count, color: 'text-stone-700' },
                { label: 'OA', count: analytics.oa_count, color: 'text-amber-700' },
                { label: 'Tech Round', count: analytics.technical_count, color: 'text-blue-700' },
                { label: 'HR Round', count: analytics.hr_count, color: 'text-purple-700' },
                { label: 'Offers', count: analytics.offers_count, color: 'text-emerald-700 font-black' },
                { label: 'Rejected', count: analytics.rejections_count, color: 'text-stone-400' }
              ].map((step, idx) => (
                <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    {step.label}
                  </span>
                  <span className={`text-xl font-black ${step.color}`}>
                    {step.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5 Cols: AI Bottleneck Coach */}
          <div className="lg:col-span-5 advisor-card p-6 border-l-4 border-l-amber-500 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                AI Funnel Diagnostic
              </h3>
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Primary Stage Drop-Off
              </span>
              <p className="text-sm font-black text-stone-900 mt-0.5">
                {analytics.biggest_dropoff_stage}
              </p>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
              💡 {analytics.ai_bottleneck_coach}
            </p>
          </div>
        </div>
      )}

      {/* Applications Pipeline Kanban / List */}
      <div className="advisor-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-600" />
            <h2 className="text-base font-bold text-stone-900">
              Active Job Applications ({applications.length})
            </h2>
          </div>
          <span className="text-xs text-stone-400">Click stage buttons to advance pipeline</span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-stone-500">Loading your applications portfolio...</p>
          </div>
        ) : applications.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-4 border-2 border-dashed border-stone-200 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto text-xl">
              💼
            </div>
            <h3 className="text-base font-bold text-stone-900">No Job Applications Logged Yet</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Start building your conversion pipeline. Log roles you have applied for to receive automated conversion coaching and track your timeline.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>Add Your First Application</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs hover:border-stone-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-stone-900">
                      {app.company}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs font-bold text-stone-700">
                      {app.role}
                    </span>
                    {app.salary_package_lpa && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ₹{app.salary_package_lpa} LPA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-stone-500 flex-wrap">
                    {app.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {app.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      Applied: {new Date(app.applied_date).toLocaleDateString()}
                    </span>
                    {app.job_url && (
                      <a 
                        href={app.job_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-orange-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Job Listing
                      </a>
                    )}
                  </div>

                  {app.notes && (
                    <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg font-mono text-[11px]">
                      {app.notes}
                    </p>
                  )}
                </div>

                {/* Right: Stage Selector & Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200">
                    {STAGES.map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStage(app.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          app.stage === st 
                            ? 'bg-stone-900 text-white shadow-xs' 
                            : 'text-stone-500 hover:text-stone-900 hover:bg-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeleteApplication(app.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Application Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-black text-stone-900">
                  Log New Job Application
                </h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Google, Flipkart, CRED"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Role *</label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Backend Engineer, AI Intern"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Initial Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    {STAGES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Salary Package (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="e.g. 14.5"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Bangalore / Remote"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Job Link / Career Portal URL</label>
                <input
                  type="url"
                  value={newJobUrl}
                  onChange={(e) => setNewJobUrl(e.target.value)}
                  placeholder="https://jobs.example.com/..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Notes / Referral Details</label>
                <textarea
                  rows="2"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Referred by senior; recruiter follow-up scheduled for next week..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newCompany.trim()}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Add to Pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

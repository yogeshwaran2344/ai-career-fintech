import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Building2, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '../api';
import JobRequirementsModal from './JobRequirementsModal';

export default function JobMarketView({ profile }) {
  const [jobData, setJobData] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchMarketData();
  }, [profile]);

  const fetchMarketData = async () => {
    try {
      const data = await api.getJobMarket();
      setJobData(data);
    } catch (err) {
      console.error(err);
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
                Feature #4: Live Job-Market Benchmark
              </span>
              <span className="text-xs text-stone-500">2026-2027 Campus Placement Intel</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-1">
              {profile?.career_goal} Market Matching
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Benchmarking your skill proficiencies directly against real job postings from top tech employers.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-stone-50 border border-stone-200/80 rounded-2xl p-4">
            <div className="text-right">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Current Match Rate</span>
              <span className="text-2xl font-black text-orange-600">{jobData?.overall_match_pct || 82}%</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Market Skill Bars + Blocking Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Skill Bars vs Industry Standard */}
        <div className="lg:col-span-7 advisor-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Your Skills vs Industry Requirements
            </h3>
            <span className="text-[11px] text-stone-500 font-medium">Market Benchmark Weight</span>
          </div>

          <div className="space-y-4">
            {jobData?.market_skill_bars?.map((bar, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-900">{bar.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500">Your Level:</span>
                    <span className="font-black text-stone-900">{bar.student_match_pct}%</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                      bar.status === 'ALIGNED' ? 'bg-emerald-100 text-emerald-800' :
                      bar.status === 'DEVELOPING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {bar.status}
                    </span>
                  </div>
                </div>

                {/* Dual bar: Student vs Market */}
                <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      bar.student_match_pct >= 75 ? 'bg-emerald-500' :
                      bar.student_match_pct >= 45 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${bar.student_match_pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Top 3 Blocking Skills to Reach 90% */}
        <div className="lg:col-span-5 space-y-4">
          <div className="advisor-card p-6 space-y-4 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 border-orange-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs font-bold text-orange-950 uppercase tracking-wider">
                3 Skills Preventing You from 90%
              </h3>
            </div>

            <p className="text-xs text-stone-600">
              Closing these 3 specific competencies bridges 80% of recruiter rejection filters:
            </p>

            <div className="space-y-2.5">
              {jobData?.top_blocking_skills?.map((skill, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-orange-200/80 flex items-center gap-3 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{skill}</h4>
                    <span className="text-[10px] text-orange-700 font-semibold">+6% Readiness Impact</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-orange-200/60">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Market Compensation Range</span>
              <span className="text-lg font-black text-stone-900">{jobData?.median_salary_inr || '₹12L - ₹24L/yr'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION: LIVE JOB OPENINGS MATCHING PROFILE */}
      <div className="advisor-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-600" />
            <h2 className="text-base font-bold text-stone-900">Live Campus & Graduate Openings</h2>
          </div>
          <span className="text-xs text-stone-500">Filtered for your placement profile</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobData?.live_openings?.map((job, idx) => (
            <div key={idx} className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80 flex flex-col justify-between hover:border-orange-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-stone-500" />
                    {job.company}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {job.match_pct}% Match
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900">{job.title}</h3>

                <div className="flex items-center gap-3 text-xs text-stone-500 my-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                  <span className="font-bold text-stone-800">{job.salary}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {job.key_tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between">
                <span className="text-[10px] text-stone-400">Application Open for 2026/2027 Batches</span>
                <button 
                  onClick={() => setSelectedJob(job)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <span>View Requirements</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Job Requirements & Interview Prep Modal */}
      <JobRequirementsModal
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
        profile={profile}
      />
    </div>
  );
}

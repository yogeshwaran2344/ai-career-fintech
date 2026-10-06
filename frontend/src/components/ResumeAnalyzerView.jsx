import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Copy, 
  Check, 
  Upload,
  Zap,
  Target,
  RotateCcw,
  FileCheck2,
  FileUp
} from 'lucide-react';
import { api } from '../api';
import confetti from 'canvas-confetti';

export default function ResumeAnalyzerView({ profile }) {
  const [resumeText, setResumeText] = useState(
`Education: B.Tech in AI & ML (CGPA: 8.2)
Skills: Python, SQL, Machine Learning, Git, React
Projects:
- Created a machine learning project for customer churn.
- Worked on resume analysis using NLP.
- Deployed website on cloud.`
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await api.analyzeResume(resumeText);
      setAnalysisResult(res);
      confetti({ particleCount: 50, spread: 60 });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file (.pdf).');
      return;
    }

    setIsUploadingPdf(true);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.uploadResumePdf(formData);
      setUploadedFilename(res.filename);
      if (res.extracted_text) {
        setResumeText(res.extracted_text);
      }
      if (res.analysis) {
        setAnalysisResult(res.analysis);
        confetti({ particleCount: 60, spread: 70 });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error parsing PDF resume.');
    } finally {
      setIsUploadingPdf(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleCopyBullet = (text, idx) => {
    navigator.clipboard.writeText(text.replace('✅ ', ''));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white advisor-card p-6 border-l-4 border-l-orange-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-orange-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Recruiter Screening Calibration
              </span>
              <span className="text-xs text-stone-500">Target Role: {profile?.career_goal || 'Software Engineer'}</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-1">
              AI Resume Analyzer & ATS Optimizer
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Paste your resume or upload a PDF. The analyzer scores keyword density against real 2026 job criteria and provides verified action-metric upgrades.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-300 flex items-center gap-2 transition-all cursor-pointer">
              <Upload className="w-4 h-4 text-stone-600" />
              <span>{isUploadingPdf ? 'Parsing PDF...' : 'Upload PDF'}</span>
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={handlePdfUpload}
                disabled={isUploadingPdf || isAnalyzing}
              />
            </label>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || isUploadingPdf || !resumeText.trim()}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Scanning ATS Filters...' : 'Analyze Resume Score'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error state alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={handleAnalyze}
            className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Grid: 2 Columns (Input Text + Score Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Cols: Resume Input */}
        <div className="lg:col-span-6 advisor-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Resume Content / Plain Text
              </h3>
            </div>
            {uploadedFilename && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <FileCheck2 className="w-3 h-3" />
                {uploadedFilename}
              </span>
            )}
          </div>

          <textarea
            rows="12"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full text-xs p-3.5 bg-stone-50 border border-stone-300 rounded-2xl font-mono leading-relaxed text-stone-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            placeholder="Paste your education, skills, and project experience here..."
          ></textarea>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-stone-400 font-medium">Tip: Use bullet points with numbers and tech stack</span>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeText.trim()}
              className="text-xs font-bold text-orange-600 hover:text-orange-800 disabled:opacity-40 cursor-pointer"
            >
              Run Analysis Now →
            </button>
          </div>
        </div>

        {/* Right 6 Cols: Score Metrics & Missing Keywords */}
        <div className="lg:col-span-6 space-y-4">
          {isAnalyzing ? (
            <div className="advisor-card p-12 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-sm font-bold text-stone-900">Scanning ATS Filters & Recruiter Keywords...</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Parsing technical tokens, evaluating action statements, and calculating keyword alignment for {profile?.career_goal || 'your role'}.
              </p>
            </div>
          ) : !analysisResult ? (
            /* Empty State */
            <div className="advisor-card p-8 text-center space-y-4 border-2 border-dashed border-stone-200">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto text-xl">
                📄
              </div>
              <h3 className="text-base font-bold text-stone-900">No Resume Analysis Yet</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Click <strong>"Analyze Resume Score"</strong> or upload your PDF resume to compute your genuine ATS compatibility score, identify missing tech keywords, and get bullet point rewrites.
              </p>
              <button
                onClick={handleAnalyze}
                disabled={!resumeText.trim()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Run Analysis Now</span>
              </button>
            </div>
          ) : (
            /* Real Score Results */
            <div className="advisor-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Overall ATS Compatibility Score
                  </span>
                  <div className="text-3xl font-black text-stone-900 mt-0.5">
                    {analysisResult.overall_resume_score} <span className="text-sm font-normal text-stone-500">/ 100</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-500 font-bold block uppercase">ATS Filter Rate</span>
                  <span className={`text-lg font-black ${
                    analysisResult.ats_compatibility_pct >= 70 ? 'text-emerald-600' : 'text-orange-600'
                  }`}>
                    {analysisResult.ats_compatibility_pct}%
                  </span>
                </div>
              </div>

              {/* Score Factors */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Technical Skills</span>
                  <span className="font-extrabold text-stone-900">{analysisResult.technical_skills_score}%</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Project Depth</span>
                  <span className="font-extrabold text-amber-700">{analysisResult.projects_score}%</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Impact Metrics</span>
                  <span className="font-extrabold text-rose-700">{analysisResult.impact_statements_score}%</span>
                </div>
              </div>

              {/* Missing Keywords Badges */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  🚨 Missing High-Frequency ATS Keywords:
                </span>
                {analysisResult.missing_keywords?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.missing_keywords.map((kw, idx) => (
                      <span key={idx} className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                        + Add {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    ✅ Excellent! All critical role keywords are present in your resume.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* SECTION: BEFORE -> AFTER BULLET POINT OPTIMIZER */}
      {analysisResult?.bullet_improvements && analysisResult.bullet_improvements.length > 0 && (
        <div className="advisor-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600" />
              <h2 className="text-base font-bold text-stone-900">
                Before ➔ After Action Bullet Optimizer
              </h2>
            </div>
            <span className="text-xs text-stone-500">Click to copy polished bullet directly to resume</span>
          </div>

          <div className="space-y-3">
            {analysisResult.bullet_improvements.map((item, idx) => (
              <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                <div className="text-xs text-stone-500 font-mono bg-white p-2 rounded-lg border border-stone-200 line-through">
                  {item.original}
                </div>

                <div className="flex items-start justify-between gap-3 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs">
                  <div className="text-emerald-950 font-medium leading-relaxed font-sans">
                    {item.improved}
                  </div>
                  <button
                    onClick={() => handleCopyBullet(item.improved, idx)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIdx === idx ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-stone-500 italic pl-1">
                  💡 <strong>Why this works:</strong> {item.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

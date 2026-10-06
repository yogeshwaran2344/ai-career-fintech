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
  Target
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

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeResume(resumeText);
      setAnalysisResult(res);
      confetti({ particleCount: 50, spread: 60 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
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
                Feature #5: AI Resume & ATS Optimizer
              </span>
              <span className="text-xs text-stone-500">Recruiter Screening Calibration</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-1">
              AI Resume Analyzer & Bullet Point Polisher
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Paste your resume or project descriptions. The AI detects missing high-frequency keywords and converts weak lines into high-impact metrics.
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-2 transition-all flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Scanning ATS Filters...' : 'Analyze Resume Score'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns (Input Text + Score Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Cols: Resume Input */}
        <div className="lg:col-span-6 advisor-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Resume Content / Project Bullets
              </h3>
            </div>
            <span className="text-[11px] text-stone-400">Plain text or Markdown</span>
          </div>

          <textarea
            rows="12"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full text-xs p-3.5 bg-stone-50 border border-stone-300 rounded-2xl font-mono leading-relaxed text-stone-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            placeholder="Paste your education, skills, and project experience here..."
          ></textarea>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-stone-400 font-medium">Tip: Include project bullets with metrics</span>
            <button
              onClick={handleAnalyze}
              className="text-xs font-bold text-orange-600 hover:text-orange-800"
            >
              Run Analysis Now →
            </button>
          </div>
        </div>

        {/* Right 6 Cols: Score Metrics & Missing Keywords */}
        <div className="lg:col-span-6 space-y-4">
          <div className="advisor-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Overall ATS Compatibility Score
                </span>
                <div className="text-3xl font-black text-stone-900 mt-0.5">
                  {analysisResult?.overall_resume_score || 71} <span className="text-sm font-normal text-stone-500">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-500 font-bold block uppercase">ATS Filter Rate</span>
                <span className="text-lg font-black text-orange-600">{analysisResult?.ats_compatibility_pct || 76}%</span>
              </div>
            </div>

            {/* Score Factors */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Technical Skills</span>
                <span className="font-extrabold text-stone-900">{analysisResult?.technical_skills_score || 82}%</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Project Depth</span>
                <span className="font-extrabold text-amber-700">{analysisResult?.projects_score || 65}%</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Impact Metrics</span>
                <span className="font-extrabold text-rose-700">{analysisResult?.impact_statements_score || 54}%</span>
              </div>
            </div>

            {/* Missing Keywords Badges */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                🚨 Missing High-Frequency ATS Keywords:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult?.missing_keywords || ['DOCKER', 'FASTAPI', 'PYTORCH', 'CI/CD', 'AWS']).map((kw, idx) => (
                  <span key={idx} className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                    + Add {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION: BEFORE -> AFTER BULLET POINT OPTIMIZER */}
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
          {(analysisResult?.bullet_improvements || [
            {
              original: "❌ Created a machine learning project for customer churn.",
              improved: "✅ Engineered an end-to-end customer churn prediction pipeline using XGBoost and Scikit-Learn, achieving 89% validation accuracy and serving real-time inferences under 40ms via FastAPI.",
              rationale: "Adds specific architecture, model choice, exact accuracy metric (89%), and latency impact (40ms)."
            },
            {
              original: "❌ Worked on resume analysis using NLP.",
              improved: "✅ Architected an AI Resume Analyzer utilizing PyTorch, LangChain, and pgvector embeddings to perform semantic skill gap extraction with 92% retrieval precision.",
              rationale: "Demonstrates advanced RAG techniques, vector databases, and concrete precision measurement."
            },
            {
              original: "❌ Deployed website on cloud.",
              improved: "✅ Containerized multi-tier microservices with multi-stage Dockerfiles and automated CI/CD deployments on Google Cloud Run with 99.9% uptime.",
              rationale: "Highlights containerization and cloud reliability standards recruiters search for."
            }
          ]).map((item, idx) => (
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
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors flex-shrink-0"
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
    </div>
  );
}

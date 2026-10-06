import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  PieChart as PieIcon, 
  CheckCircle2, 
  RefreshCw,
  Compass,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { api } from '../api';

const SECTOR_COLORS = ['#059669', '#0284c7', '#d97706', '#dc2626', '#7c3aed', '#db2777'];

export default function RealAiWealthAuditTab({ profile, onNavigateToCareer }) {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    try {
      setLoading(true);
      const data = await api.getRealAiWealthAudit();
      setAuditData(data);
    } catch (err) {
      console.error('Error loading real AI wealth audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  if (loading && !auditData) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-stone-600">Auditing Real Portfolio Holdings & Sector Concentration...</p>
      </div>
    );
  }

  const sectorChartData = auditData?.sector_concentration 
    ? Object.entries(auditData.sector_concentration).map(([sec, pct]) => ({ name: sec, value: pct }))
    : [];

  return (
    <div className="space-y-6 animate-fade-in text-stone-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 text-white p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 border border-emerald-800/40">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black tracking-wider uppercase text-emerald-400">Contextual Wealth Intelligence</span>
          </div>
          <h2 className="text-xl font-black mt-1">Real AI Wealth Copilot Audit</h2>
          <p className="text-xs text-stone-300 mt-0.5 max-w-xl">
            Correlates your live broker portfolio holdings with your student cash flow, emergency reserves, and target career path ({profile?.career_goal || 'AI Engineer'}).
          </p>
        </div>
        <button
          onClick={fetchAudit}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-sm transition cursor-pointer border border-white/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-Audit Live Holdings</span>
        </button>
      </div>

      {/* Grid of Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Emergency Buffer & Liquidity Safety */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900">Emergency Buffer Adequacy</h4>
              <span className="text-[10px] text-stone-400 font-bold uppercase">Cash Flow Safety Gate</span>
            </div>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed p-3.5 bg-stone-50 rounded-xl border border-stone-100 font-medium">
            {auditData?.emergency_buffer_status}
          </p>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs flex justify-between items-center">
            <span className="font-bold text-emerald-900">Asset Split:</span>
            <span className="font-mono font-bold text-emerald-700">{auditData?.cash_vs_equity_ratio}</span>
          </div>
        </div>

        {/* 2. Sector Concentration & Risk */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900">Sector Exposure & Career Correlation</h4>
              <span className="text-[10px] text-stone-400 font-bold uppercase">Human Capital Overlap</span>
            </div>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed p-3.5 bg-rose-50/40 rounded-xl border border-rose-100 font-medium">
            {auditData?.top_holding_risk}
          </p>
        </div>
      </div>

      {/* Sector Breakdown Chart & Student Cash Flow Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Pie (1/3) */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <h4 className="text-sm font-black text-stone-900">Live Portfolio Sector Distribution</h4>
          <div className="h-48 w-full">
            {sectorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sectorChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}%`, 'Weight']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                No active stock holdings detected.
              </div>
            )}
          </div>
          <div className="space-y-1.5 text-xs font-semibold">
            {sectorChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }}></span>
                  <span className="text-stone-700 text-xs">{item.name}</span>
                </div>
                <span className="font-mono text-stone-900 font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Student Advice (2/3) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-stone-900">Strategic Cash Flow & Career Co-Optimization</h4>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">AI Copilot Recommendation</span>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {auditData?.student_cash_flow_advice}
              </p>
            </div>
          </div>

          {/* Regulatory Disclaimer */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-[10px] text-stone-500 leading-relaxed space-y-1">
            <span className="font-bold text-stone-700 block">SEBI Regulatory Footnote:</span>
            <p>{auditData?.sebi_educational_disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

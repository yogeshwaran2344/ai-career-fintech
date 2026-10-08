import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Sparkles, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { api } from '../api';

export default function ShouldIBuyModal({ isOpen, onClose, profile }) {
  const [itemName, setItemName] = useState('₹4,999 Deep Learning Course');
  const [cost, setCost] = useState(4999);
  const [urgency, setUrgency] = useState('LOW');
  const [result, setResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEvaluate = async () => {
    if (!itemName.trim() || cost <= 0) return;
    setIsEvaluating(true);
    try {
      const res = await api.checkPurchase(itemName, cost, urgency);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 cursor-default"
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white cursor-pointer transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-amber-100">
              Purchase Intelligence
            </span>
            <span className="text-xs text-amber-100">Financial Impact Evaluation</span>
          </div>

          <h2 className="text-2xl font-black mt-1">Financial "Should I Buy This?" Engine</h2>
          <p className="text-xs text-amber-100 mt-0.5">
            Evaluate any paid course, bootcamp, or certification against your student budget before spending.
          </p>
        </div>

        {/* Form Inputs */}
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Item / Course / Cert Name</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. ₹4,999 Specialization Course"
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                  <span>Price (₹ INR)</span>
                  <span className="text-orange-600 font-extrabold">₹{cost.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="500"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Urgency Level</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900"
                >
                  <option value="LOW">Low (Self-Paced Prep)</option>
                  <option value="MEDIUM">Medium (Upcoming Exam)</option>
                  <option value="HIGH">High (Immediate Requirement)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEvaluating ? 'Evaluating Sinking Fund...' : 'Evaluate Purchase Decision'}</span>
            </button>
          </div>

          {/* Result Card */}
          {result && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-900">{result.recommendation_badge}</span>
                <span className="text-[10px] font-bold bg-white border px-2 py-0.5 rounded text-stone-600">
                  Affordability: {result.affordability_pct}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 block">Career Benefit</span>
                  <strong className="text-emerald-700 font-black">{result.career_benefit}</strong>
                </div>
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 block">Urgency</span>
                  <strong className="text-stone-800 font-bold">{result.urgency}</strong>
                </div>
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 block">Time to Save</span>
                  <strong className="text-orange-600 font-black">{result.months_to_save} Mo</strong>
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed bg-white p-3 rounded-xl border border-stone-200/80 font-sans">
                💡 <strong>Decision:</strong> {result.action_plan}
              </p>

              {result.better_free_option !== 'N/A' && (
                <div className="text-[11px] text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  🌟 <strong>Zero-Cost Alternative:</strong> {result.better_free_option}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

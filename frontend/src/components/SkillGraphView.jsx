import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowDown, 
  ArrowRight, 
  Sparkles, 
  Layers,
  Cpu
} from 'lucide-react';
import { api } from '../api';

export default function SkillGraphView({ profile, readiness }) {
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchGraph();
  }, [profile]);

  const fetchGraph = async () => {
    try {
      const data = await api.getSkillGraph();
      setGraphData(data);
      if (data.nodes.length > 0) setSelectedNode(data.nodes[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'MASTERED':
        return 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20';
      case 'LEARNING':
        return 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20';
      default:
        return 'bg-rose-500 text-white border-rose-600 shadow-rose-500/20';
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
                Feature #3: Dependency Architecture
              </span>
              <span className="text-xs text-stone-500">Prerequisite & Unlock Tree</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-1">
              Interactive Skill Dependency Graph
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Skills build upon one another. Click any node to inspect its prerequisites, status, and unlock path toward <strong>{profile?.career_goal}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 🟢 Strong / Mastered
            </span>
            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 🟡 Learning / Developing
            </span>
            <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 🔴 Missing / High Priority
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Visual Graph + Node Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Visual Dependency Tree */}
        <div className="lg:col-span-8 advisor-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
            Skill Hierarchy Flow (Topological Order)
          </h3>

          <div className="space-y-4">
            {/* Level 1: Foundations */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-2">
                Tier 1: Programming & Databases (Root)
              </span>
              <div className="flex flex-wrap gap-3">
                {graphData?.nodes?.filter(n => ['python', 'sql', 'dsa'].includes(n.id)).map(node => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                      selectedNode?.id === node.id ? 'ring-4 ring-orange-200 scale-105' : 'hover:scale-102'
                    } ${
                      node.status === 'MASTERED' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
                      node.status === 'LEARNING' ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      node.status === 'MASTERED' ? 'bg-emerald-500' :
                      node.status === 'LEARNING' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span className="font-extrabold">{node.label}</span>
                    <span className="text-[10px] opacity-75">({node.proficiency}/10)</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center text-stone-300">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Level 2: Core Data & ML */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-2">
                Tier 2: Feature Engineering & Applied ML
              </span>
              <div className="flex flex-wrap gap-3">
                {graphData?.nodes?.filter(n => ['numpy', 'ml', 'fastapi'].includes(n.id)).map(node => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                      selectedNode?.id === node.id ? 'ring-4 ring-orange-200 scale-105' : 'hover:scale-102'
                    } ${
                      node.status === 'MASTERED' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
                      node.status === 'LEARNING' ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      node.status === 'MASTERED' ? 'bg-emerald-500' :
                      node.status === 'LEARNING' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span className="font-extrabold">{node.label}</span>
                    <span className="text-[10px] opacity-75">({node.proficiency}/10)</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center text-stone-300">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Level 3: Advanced Deep Learning & Containerization */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-2">
                Tier 3: Deep Architectures & Deployment Pipelines
              </span>
              <div className="flex flex-wrap gap-3">
                {graphData?.nodes?.filter(n => ['deeplearning', 'docker', 'cloud'].includes(n.id)).map(node => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                      selectedNode?.id === node.id ? 'ring-4 ring-orange-200 scale-105' : 'hover:scale-102'
                    } ${
                      node.status === 'MASTERED' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
                      node.status === 'LEARNING' ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      node.status === 'MASTERED' ? 'bg-emerald-500' :
                      node.status === 'LEARNING' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span className="font-extrabold">{node.label}</span>
                    <span className="text-[10px] opacity-75">({node.proficiency}/10)</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center text-stone-300">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Level 4: Target Role Goal Unlock */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-2">
                Tier 4: Target Career Milestone
              </span>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg font-bold">
                    🎯
                  </div>
                  <div>
                    <h4 className="text-sm font-black">{profile?.career_goal || 'AI Engineer'} Placement Ready</h4>
                    <p className="text-xs text-orange-100">Requires mastery across Deep Learning, Docker & DSA</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold bg-white text-orange-700 px-3 py-1 rounded-xl shadow-xs">
                  Readiness: {readiness?.readiness_pct ?? 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Selected Node Inspector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="advisor-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">
              Node Prerequisite Inspector
            </h3>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-stone-900">{selectedNode.label}</h4>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    selectedNode.status === 'MASTERED' ? 'bg-emerald-100 text-emerald-800' :
                    selectedNode.status === 'LEARNING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedNode.status}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Category:</span>
                    <span className="font-bold text-stone-800">{selectedNode.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Current Rating:</span>
                    <span className="font-black text-orange-600">{selectedNode.proficiency} / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Recruiter Weight:</span>
                    <span className="font-bold text-stone-800">{selectedNode.importance}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Prerequisites Required:
                  </span>
                  {selectedNode.prerequisites?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.prerequisites.map((p, i) => (
                        <span key={i} className="text-[11px] bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md font-semibold border">
                          ✓ {p.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-stone-400 italic">No previous prerequisites (Root Foundation)</span>
                  )}
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed font-medium">
                  💡 <strong>Unlock Tip:</strong> Complete 2 hours of deliberate practice in this module to unblock downstream Deep Learning & Cloud tasks.
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400">Select any node on the left to view requirements.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

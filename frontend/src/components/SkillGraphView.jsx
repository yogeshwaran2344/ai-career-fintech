import React, { useState, useEffect, useMemo } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowDown, 
  ArrowRight, 
  Sparkles, 
  Layers,
  Cpu,
  BookOpen,
  Video,
  ExternalLink,
  Target,
  Terminal,
  Database,
  Box,
  Flame,
  Check,
  Zap,
  Brain,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

const CURATED_RESOURCES = {
  python: [
    { title: "Corey Schafer: Python OOP & Best Practices", platform: "YouTube", duration: "3h 40m", link: "https://www.youtube.com/playlist?list=PL-osiE80TeTsqhI97364245750", tag: "Must-Watch" },
    { title: "Python Data Structures & Memory Model", platform: "Real Python", duration: "2h 15m", link: "https://realpython.com/", tag: "Interactive" }
  ],
  sql: [
    { title: "Alex The Analyst: SQL Full Course for Portfolios", platform: "YouTube", duration: "4h 10m", link: "https://www.youtube.com/watch?v=7S_tz1z_5bA", tag: "Top Rated" },
    { title: "Mode Analytics: Intermediate & Advanced SQL", platform: "Mode", duration: "3h 00m", link: "https://mode.com/sql-tutorial/", tag: "Hands-on" }
  ],
  numpy: [
    { title: "Keith Galli: Complete NumPy & Pandas Tutorial", platform: "YouTube", duration: "2h 30m", link: "https://www.youtube.com/watch?v=GB9By4v466w", tag: "Practical" },
    { title: "100 NumPy Exercises with Solutions", platform: "GitHub", duration: "5h 00m", link: "https://github.com/rougier/numpy-100", tag: "Code Challenge" }
  ],
  ml: [
    { title: "StatQuest with Josh Starmer: ML Fundamentals", platform: "YouTube", duration: "6h 20m", link: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaZ420UGCpuL75uJWAbG", tag: "Essential" },
    { title: "Scikit-Learn Official User Guides & Pipelines", platform: "Scikit-Learn Docs", duration: "4h 00m", link: "https://scikit-learn.org/stable/user_guide.html", tag: "Official" }
  ],
  deeplearning: [
    { title: "Andrej Karpathy: Neural Networks Zero to Hero", platform: "YouTube", duration: "12h 00m", link: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ", tag: "Gold Standard" },
    { title: "Fast.ai: Practical Deep Learning for Coders", platform: "Fast.ai", duration: "14h 00m", link: "https://course.fast.ai/", tag: "Full Course" }
  ],
  pytorch: [
    { title: "freeCodeCamp: PyTorch for Deep Learning Bootcamp", platform: "YouTube", duration: "25h 00m", link: "https://www.youtube.com/watch?v=V_xro1bcAuA", tag: "Comprehensive" },
    { title: "PyTorch 60-Minute Blitz (Official)", platform: "PyTorch Docs", duration: "1h 30m", link: "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", tag: "Quick Start" }
  ],
  nlp: [
    { title: "Hugging Face NLP Course (Free & Practical)", platform: "Hugging Face", duration: "8h 00m", link: "https://huggingface.co/learn/nlp-course", tag: "State of Art" },
    { title: "Jay Alammar: The Illustrated Transformer", platform: "Blog / Visual", duration: "1h 00m", link: "https://jalammar.github.io/illustrated-transformer/", tag: "Visual Guide" }
  ],
  aisystems: [
    { title: "Chip Huyen: Designing Machine Learning Systems", platform: "O'Reilly / Guide", duration: "6h 00m", link: "https://chiphuyen.com/book-mlsys/", tag: "System Design" },
    { title: "ONNX Runtime & TensorRT Latency Optimization", platform: "NVIDIA Docs", duration: "3h 00m", link: "https://onnxruntime.ai/", tag: "Production" }
  ],
  docker: [
    { title: "TechWorld with Nana: Docker Tutorial for Beginners", platform: "YouTube", duration: "3h 10m", link: "https://www.youtube.com/watch?v=3c-iBn73dDE", tag: "Zero to Hero" },
    { title: "Dockerizing FastAPI Microservices with multi-stage build", platform: "FastAPI Docs", duration: "1h 30m", link: "https://fastapi.tiangolo.com/deployment/docker/", tag: "Best Practice" }
  ],
  fastapi: [
    { title: "Sanjeev Thiyagarajan: Python FastAPI Full Course", platform: "YouTube", duration: "19h 00m", link: "https://www.youtube.com/watch?v=0sOvCWFmrtA", tag: "Production Ready" },
    { title: "FastAPI Interactive Swagger & Async DB tutorial", platform: "Official Docs", duration: "2h 00m", link: "https://fastapi.tiangolo.com/tutorial/", tag: "Official" }
  ],
  dsa: [
    { title: "NeetCode 150: Core Data Structures & Algorithms", platform: "NeetCode.io", duration: "30h 00m", link: "https://neetcode.io/practice", tag: "Interview Must" },
    { title: "Striver's A2Z DSA Sheet (Take U Forward)", platform: "TakeUForward", duration: "40h 00m", link: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", tag: "Placement Prep" }
  ]
};

export default function SkillGraphView({ profile, readiness, onRefresh }) {
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [decayMap, setDecayMap] = useState({});
  const [isBoosting, setIsBoosting] = useState(false);

  useEffect(() => {
    fetchGraphAndDecay();
  }, [profile]);

  const fetchGraphAndDecay = async () => {
    try {
      const [data, decayRes] = await Promise.all([
        api.getSkillGraph().catch(() => null),
        api.getLearningDecayStatus().catch(() => null)
      ]);
      if (data && data.nodes && data.nodes.length > 0) {
        setGraphData(data);
        setSelectedNode(data.nodes[0]);
      }
      if (decayRes && decayRes.all_concepts) {
        const dmap = {};
        for (const c of decayRes.all_concepts) {
          dmap[c.concept_name.toLowerCase()] = c;
          if (c.concept_name.includes('Trees') || c.concept_name.includes('DFS')) dmap['dsa'] = c;
          if (c.concept_name.includes('SQL')) dmap['sql'] = c;
          if (c.concept_name.includes('Python')) dmap['python'] = c;
          if (c.concept_name.includes('PyTorch')) dmap['pytorch'] = c;
          if (c.concept_name.includes('Docker')) dmap['docker'] = c;
          if (c.concept_name.includes('FastAPI')) dmap['fastapi'] = c;
          if (c.concept_name.includes('Gradient') || c.concept_name.includes('Machine Learning')) dmap['ml'] = c;
        }
        setDecayMap(dmap);
      }
    } catch (err) {
      console.warn('Skill graph fetch notice, using calibrated tree:', err);
    }
  };

  // Helper to resolve proficiency from profile skills
  const getProficiency = (skillName) => {
    if (!profile?.skills) return 3.0;
    const match = profile.skills.find(s => 
      s.name.toLowerCase().includes(skillName.toLowerCase()) || 
      skillName.toLowerCase().includes(s.name.toLowerCase())
    );
    return match ? Number(match.proficiency || match.confidence || 3.0) : 3.0;
  };

  // Build the hierarchical tree structure
  const treeNodes = useMemo(() => {
    const pPython = getProficiency('Python');
    const pSQL = getProficiency('SQL');
    const pDSA = getProficiency('DSA');
    const pNumpy = Math.max(getProficiency('Pandas'), getProficiency('NumPy'), 6.5);
    const pML = getProficiency('Machine Learning');
    const pDL = Math.max(getProficiency('Deep Learning'), 2.5);
    const pPyTorch = Math.max(getProficiency('PyTorch'), 2.0);
    const pNLP = Math.max(getProficiency('NLP'), getProficiency('LLM'), 2.0);
    const pAISystems = Math.max(getProficiency('System Design'), 2.5);
    const pDocker = Math.max(getProficiency('Docker'), 2.0);
    const pFastAPI = Math.max(getProficiency('FastAPI'), 3.0);

    const calcStatus = (score) => {
      if (score >= 7.0) return 'STRONG';
      if (score >= 3.5) return 'LEARNING';
      return 'MISSING';
    };

    return {
      goal: profile?.career_goal || 'AI Engineer',
      readinessPct: readiness?.readiness_pct ?? 34,
      python: {
        id: 'python',
        name: 'Python',
        subtitle: 'Core OOP & Async',
        proficiency: pPython,
        status: calcStatus(pPython),
        tier: 1,
        importance: 'CRITICAL',
        prerequisites: [],
        whyRecruiter: 'Non-negotiable foundational language for ML models, data pipelines, and backend APIs.'
      },
      sql: {
        id: 'sql',
        name: 'SQL',
        subtitle: 'Relational DBs & Querying',
        proficiency: pSQL,
        status: calcStatus(pSQL),
        tier: 1,
        importance: 'HIGH',
        prerequisites: [],
        whyRecruiter: 'Required for pulling training datasets, analyzing feature distributions, and production database interactions.'
      },
      dsa: {
        id: 'dsa',
        name: 'DSA & Algorithms',
        subtitle: 'Problem Solving & Arrays/Trees',
        proficiency: pDSA,
        status: calcStatus(pDSA),
        tier: 1,
        importance: 'CRITICAL',
        prerequisites: ['python'],
        whyRecruiter: 'Primary screening barrier across campus placement online tests (OA) and technical rounds.'
      },
      numpy: {
        id: 'numpy',
        name: 'NumPy / Pandas',
        subtitle: 'Vectorized Array & DataFrames',
        proficiency: pNumpy,
        status: calcStatus(pNumpy),
        tier: 2,
        importance: 'HIGH',
        prerequisites: ['python'],
        whyRecruiter: 'Core building block for data wrangling, matrix manipulation, and vectorized computations.'
      },
      ml: {
        id: 'ml',
        name: 'Machine Learning',
        subtitle: 'Scikit-Learn, Regression & Trees',
        proficiency: pML,
        status: calcStatus(pML),
        tier: 2,
        importance: 'CRITICAL',
        prerequisites: ['python', 'numpy'],
        whyRecruiter: 'Evaluates feature engineering, cross-validation rigor, loss curves, and algorithm selection.'
      },
      deeplearning: {
        id: 'deeplearning',
        name: 'Deep Learning',
        subtitle: 'Neural Nets, Backprop & Optimization',
        proficiency: pDL,
        status: calcStatus(pDL),
        tier: 3,
        importance: 'CRITICAL',
        prerequisites: ['ml'],
        whyRecruiter: 'Foundations for modern AI architectures, gradient descent dynamics, and weight tuning.'
      },
      pytorch: {
        id: 'pytorch',
        name: 'PyTorch',
        subtitle: 'Tensors, Autograd & Modules',
        proficiency: pPyTorch,
        status: calcStatus(pPyTorch),
        tier: 3,
        importance: 'HIGH',
        prerequisites: ['deeplearning'],
        whyRecruiter: 'De-facto industry standard framework for model training, research experimentation, and fine-tuning.'
      },
      nlp: {
        id: 'nlp',
        name: 'NLP & LLMs',
        subtitle: 'Transformers & Embeddings',
        proficiency: pNLP,
        status: calcStatus(pNLP),
        tier: 3,
        importance: 'HIGH',
        prerequisites: ['deeplearning'],
        whyRecruiter: 'Highest-demand specialization in 2026 hiring (RAG systems, vector embeddings, fine-tuning).'
      },
      aisystems: {
        id: 'aisystems',
        name: 'AI Systems',
        subtitle: 'Inference Latency & ONNX',
        proficiency: pAISystems,
        status: calcStatus(pAISystems),
        tier: 4,
        importance: 'HIGH',
        prerequisites: ['pytorch', 'nlp'],
        whyRecruiter: 'Distinguishes junior hobbyists from engineers who can serve sub-50ms low-latency inference.'
      },
      docker: {
        id: 'docker',
        name: 'Docker',
        subtitle: 'Containerization & Environments',
        proficiency: pDocker,
        status: calcStatus(pDocker),
        tier: 4,
        importance: 'HIGH',
        prerequisites: ['aisystems'],
        whyRecruiter: 'Eliminates "works on my machine" issues; essential for cloud deployments and CI/CD pipelines.'
      },
      fastapi: {
        id: 'fastapi',
        name: 'FastAPI',
        subtitle: 'Async REST Endpoints & Swagger',
        proficiency: pFastAPI,
        status: calcStatus(pFastAPI),
        tier: 4,
        importance: 'HIGH',
        prerequisites: ['docker'],
        whyRecruiter: 'Production backend framework used to wrap models into callable microservices.'
      }
    };
  }, [profile, readiness]);

  // Set initial selected node
  useEffect(() => {
    if (!selectedNode && treeNodes.python) {
      setSelectedNode(treeNodes.python);
    }
  }, [treeNodes]);

  const handlePracticeBooster = async (conceptName) => {
    if (!conceptName) return;
    setIsBoosting(true);
    try {
      await api.reviewDecayConcept(conceptName, 1.0);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      await fetchGraphAndDecay();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to boost concept:', err);
    } finally {
      setIsBoosting(false);
    }
  };

  const renderStatusBadge = (status) => {
    if (status === 'STRONG') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 🟢 Strong
        </span>
      );
    }
    if (status === 'LEARNING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> 🟡 Learning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> 🔴 Missing
      </span>
    );
  };

  const renderNodeButton = (node, customWidth = 'min-w-[170px]') => {
    const isSelected = selectedNode?.id === node.id;
    const isStrong = node.status === 'STRONG';
    const isLearning = node.status === 'LEARNING';
    const decayInfo = decayMap[node.id?.toLowerCase()] || decayMap[node.name?.toLowerCase()];
    
    return (
      <button
        onClick={() => setSelectedNode(node)}
        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${customWidth} ${
          isSelected 
            ? 'ring-3 ring-orange-500 shadow-md scale-105 z-10' 
            : 'hover:scale-102 hover:shadow-xs'
        } ${
          isStrong 
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
            : isLearning
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-rose-50/80 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="font-black text-xs text-stone-900">{node.name}</span>
          {renderStatusBadge(node.status)}
        </div>
        <div className="text-[10px] text-stone-500 truncate mb-1.5">{node.subtitle}</div>
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-stone-500">Proficiency</span>
          <span className={`font-black ${isStrong ? 'text-emerald-700' : isLearning ? 'text-amber-700' : 'text-rose-700'}`}>
            {node.proficiency.toFixed(1)} / 10
          </span>
        </div>
        {decayInfo && (
          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-stone-200/60 mt-1.5">
            <span className="text-stone-500 font-medium">Memory Retention:</span>
            <span className={`font-black ${decayInfo.retention_pct < 60 ? 'text-rose-600' : decayInfo.retention_pct < 75 ? 'text-amber-600' : 'text-emerald-600'}`}>
              🧠 {decayInfo.retention_pct}%
            </span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white advisor-card p-6 border-l-4 border-l-orange-500 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-orange-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Interactive Skill Dependency Architecture
              </span>
              <span className="text-xs text-stone-500 font-semibold">{profile?.career_goal || 'AI Engineer'} Track</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-1.5">
              Visual Skill Dependency Graph
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Every advanced competency has explicit prerequisites. Follow the topological hierarchy from foundational programming to full placement readiness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              🟢 Strong (≥ 7.0)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              🟡 Learning (3.5–6.9)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
              🔴 Missing (&lt; 3.5)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Hierarchical Tree + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Visual Hierarchical Skill Tree */}
        <div className="lg:col-span-8 advisor-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Full Topological Prerequisite Flow
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">Click any node to open curated videos & course blueprints</p>
            </div>
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
              Target: {treeNodes.goal}
            </span>
          </div>

          {/* THE TREE STRUCTURE */}
          <div className="py-2 flex flex-col items-center space-y-4 select-none">
            
            {/* ROOT GOAL BANNER */}
            <div className="px-6 py-2.5 rounded-2xl bg-stone-900 text-white font-black text-xs tracking-wider uppercase shadow-md flex items-center gap-2 border border-stone-800">
              <Target className="w-4 h-4 text-orange-400" />
              <span>{treeNodes.goal.toUpperCase()} PATHWAY</span>
            </div>

            {/* Down Connector */}
            <div className="w-0.5 h-4 bg-stone-300"></div>

            {/* LEVEL 1: Python and SQL (with branching bar) */}
            <div className="w-full max-w-md">
              <div className="relative">
                {/* Horizontal branch bar */}
                <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-stone-300 -mt-2"></div>
                <div className="absolute top-0 left-1/4 w-0.5 h-2 bg-stone-300 -mt-2"></div>
                <div className="absolute top-0 right-1/4 w-0.5 h-2 bg-stone-300 -mt-2"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {renderNodeButton(treeNodes.python, 'w-full')}
                {renderNodeButton(treeNodes.sql, 'w-full')}
              </div>
            </div>

            {/* Down Connector from Python */}
            <div className="w-0.5 h-4 bg-stone-300"></div>

            {/* LEVEL 2: NumPy / Pandas */}
            <div className="w-full max-w-xs">
              {renderNodeButton(treeNodes.numpy, 'w-full')}
            </div>

            {/* Down Connector */}
            <div className="w-0.5 h-4 bg-stone-300"></div>

            {/* LEVEL 3: Machine Learning */}
            <div className="w-full max-w-xs">
              {renderNodeButton(treeNodes.ml, 'w-full')}
            </div>

            {/* Down Connector */}
            <div className="w-0.5 h-4 bg-stone-300"></div>

            {/* LEVEL 4: Deep Learning */}
            <div className="w-full max-w-xs">
              {renderNodeButton(treeNodes.deeplearning, 'w-full')}
            </div>

            {/* Down Connector with Branch to PyTorch and NLP */}
            <div className="w-full max-w-md">
              <div className="relative">
                <div className="w-0.5 h-3 bg-stone-300 mx-auto"></div>
                <div className="absolute top-3 left-1/4 right-1/4 h-0.5 bg-stone-300"></div>
                <div className="absolute top-3 left-1/4 w-0.5 h-2 bg-stone-300"></div>
                <div className="absolute top-3 right-1/4 w-0.5 h-2 bg-stone-300"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                {renderNodeButton(treeNodes.pytorch, 'w-full')}
                {renderNodeButton(treeNodes.nlp, 'w-full')}
              </div>

              {/* Converging back to AI Systems */}
              <div className="relative mt-2">
                <div className="absolute top-0 left-1/4 w-0.5 h-2 bg-stone-300"></div>
                <div className="absolute top-0 right-1/4 w-0.5 h-2 bg-stone-300"></div>
                <div className="absolute top-2 left-1/4 right-1/4 h-0.5 bg-stone-300"></div>
                <div className="w-0.5 h-3 bg-stone-300 mx-auto mt-2"></div>
              </div>
            </div>

            {/* LEVEL 5: AI Systems */}
            <div className="w-full max-w-xs">
              {renderNodeButton(treeNodes.aisystems, 'w-full')}
            </div>

            {/* Down Connector */}
            <div className="w-0.5 h-4 bg-stone-300"></div>

            {/* LEVEL 6: Docker */}
            <div className="w-full max-w-xs">
              {renderNodeButton(treeNodes.docker, 'w-full')}
            </div>

            {/* Down Connector */}
            <div className="w-0.5 h-4 bg-stone-300"></div>

            {/* LEVEL 7: FastAPI */}
            <div className="w-full max-w-xs">
              {renderNodeButton(treeNodes.fastapi, 'w-full')}
            </div>

            {/* Down Connector */}
            <div className="w-0.5 h-4 bg-stone-300"></div>

            {/* TERMINAL PLACEMENT MILESTONE */}
            <div className="w-full max-w-md p-4 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-stone-900 text-white shadow-lg border border-orange-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-black">
                  🎯
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight">{treeNodes.goal} Placement Ready</h4>
                  <p className="text-[11px] text-orange-100">Full stack & algorithmic interview capability</p>
                </div>
              </div>
              <div className="bg-white text-stone-950 font-black px-3.5 py-1.5 rounded-xl text-xs shadow-xs">
                {treeNodes.readinessPct}% Ready
              </div>
            </div>

          </div>
        </div>

        {/* Right 4 Cols: Selected Node Inspector & Curated Resources */}
        <div className="lg:col-span-4 space-y-4">
          <div className="advisor-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                <span>Node Blueprint Inspector</span>
              </h3>
              {selectedNode && renderStatusBadge(selectedNode.status)}
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-black text-stone-900">{selectedNode.name}</h4>
                  <p className="text-xs text-stone-500 font-medium">{selectedNode.subtitle}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">Your Proficiency:</span>
                    <span className="font-black text-stone-900 text-sm">{selectedNode.proficiency.toFixed(1)} / 10</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedNode.proficiency >= 7.0 ? 'bg-emerald-500' :
                        selectedNode.proficiency >= 3.5 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, selectedNode.proficiency * 10)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-500">Recruiter Priority:</span>
                    <span className="font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      {selectedNode.importance}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    Recruiter Value:
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed font-medium bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/80">
                    💡 {selectedNode.whyRecruiter}
                  </p>
                </div>

                {/* Ebbinghaus Memory Retention Box */}
                {(() => {
                  const nodeDecay = decayMap[selectedNode.id?.toLowerCase()] || decayMap[selectedNode.name?.toLowerCase()];
                  if (!nodeDecay) return null;
                  return (
                    <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Ebbinghaus Retention:</span>
                        </span>
                        <span className={`font-black ${nodeDecay.retention_pct < 60 ? 'text-rose-600' : nodeDecay.retention_pct < 75 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {nodeDecay.retention_pct}% ({nodeDecay.decay_status})
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-800 leading-snug">
                        Last practiced {nodeDecay.days_since_review} days ago. Stability: {nodeDecay.stability_days} days.
                      </p>
                      <button
                        onClick={() => handlePracticeBooster(nodeDecay.concept_name)}
                        disabled={isBoosting}
                        className="w-full py-2 rounded-xl bg-indigo-950 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isBoosting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating Spaced Curve...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
                            <span>Practice Recall Drill (+100% Boost)</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })()}

                {/* Curated Videos & Learning Links */}
                <div className="space-y-2.5 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-orange-600" />
                      <span>Curated Videos & Courses</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Free & Verified
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(CURATED_RESOURCES[selectedNode.id] || CURATED_RESOURCES.python).map((res, idx) => (
                      <a
                        key={idx}
                        href={res.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-orange-50/60 hover:border-orange-300 transition-all flex items-start justify-between group block"
                      >
                        <div className="space-y-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-stone-200 text-stone-800">
                              {res.platform}
                            </span>
                            <span className="text-[9px] font-bold text-orange-600">
                              {res.tag}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-stone-900 group-hover:text-orange-950 transition-colors">
                            {res.title}
                          </h5>
                          <span className="text-[10px] text-stone-400">Duration: ~{res.duration}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-600 flex-shrink-0 mt-1" />
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-xs text-stone-400">Click any node in the hierarchy on the left to inspect its unlock requirements.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

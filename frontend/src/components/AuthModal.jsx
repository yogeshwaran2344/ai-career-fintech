import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  GraduationCap, 
  Code, 
  Wallet, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Sliders,
  X,
  Target,
  Bot,
  Plus,
  Trash2,
  BookOpen,
  Compass
} from 'lucide-react';
import { api } from '../api';
import confetti from 'canvas-confetti';

const DEGREE_BRANCH_MAP = {
  "B.Tech / B.E": {
    branches: [
      "Computer Science & Engineering",
      "Artificial Intelligence & Machine Learning",
      "Data Science & Analytics",
      "Information Technology",
      "Electronics & Communication (ECE / EEE)",
      "Mechanical Engineering",
      "Civil & Structural Engineering"
    ],
    roles: {
      "Computer Science & Engineering": [
        "Full Stack Developer", "AI Engineer", "ML Engineer", "Backend Systems Engineer",
        "Cloud & DevOps Engineer", "Cybersecurity Analyst", "Data Engineer",
        "Mobile App Developer (Flutter/React Native)"
      ],
      "Artificial Intelligence & Machine Learning": [
        "AI Engineer", "Generative AI & LLM Engineer", "ML Engineer", "Data Scientist", "Data Engineer"
      ],
      "Data Science & Analytics": [
        "Data Scientist", "ML Engineer", "AI Engineer", "Data Engineer", "Business & Product Analyst"
      ],
      "Information Technology": [
        "Full Stack Developer", "Cloud & DevOps Engineer", "Cybersecurity Analyst", "Backend Systems Engineer"
      ],
      "Electronics & Communication (ECE / EEE)": [
        "Embedded Systems & IoT Engineer", "VLSI & Chip Design Engineer", "Robotics & Automation Engineer",
        "Cloud & DevOps Engineer", "Full Stack Developer"
      ],
      "Mechanical Engineering": [
        "CAD / CAE Simulation Engineer", "Robotics & Automation Engineer",
        "Business & Product Analyst", "Data Scientist"
      ],
      "Civil & Structural Engineering": [
        "BIM & Smart Infrastructure Engineer", "CAD / CAE Simulation Engineer",
        "Business & Product Analyst"
      ]
    }
  },
  "BCA / MCA": {
    branches: ["Computer Applications & Software Dev", "Data Analytics & Cloud"],
    roles: {
      "Computer Applications & Software Dev": [
        "Full Stack Developer", "Mobile App Developer (Flutter/React Native)",
        "Cloud & DevOps Engineer", "Data Scientist", "Cybersecurity Analyst"
      ],
      "Data Analytics & Cloud": [
        "Data Scientist", "Cloud & DevOps Engineer", "Full Stack Developer", "Data Engineer"
      ]
    }
  },
  "B.Sc / M.Sc": {
    branches: ["Computer Science & IT", "Data Science & AI", "Mathematics & Statistics"],
    roles: {
      "Computer Science & IT": [
        "Full Stack Developer", "AI Engineer", "Data Scientist", "Data Engineer"
      ],
      "Data Science & AI": [
        "Data Scientist", "AI Engineer", "ML Engineer", "Quantitative Financial Analyst"
      ],
      "Mathematics & Statistics": [
        "Quantitative Financial Analyst", "Data Scientist", "Financial Risk Analyst",
        "Business & Product Analyst"
      ]
    }
  },
  "B.Com / BBA / MBA": {
    branches: ["Finance & Banking", "Business Analytics & Strategy", "Marketing & Growth"],
    roles: {
      "Finance & Banking": [
        "Financial Risk Analyst", "Quantitative Financial Analyst", "Fintech Product Manager", "Business & Product Analyst"
      ],
      "Business Analytics & Strategy": [
        "Business & Product Analyst", "Fintech Product Manager", "Digital Marketing & Growth Analyst"
      ],
      "Marketing & Growth": [
        "Digital Marketing & Growth Analyst", "Business & Product Analyst", "Fintech Product Manager"
      ]
    }
  }
};

const DEFAULT_SKILLS_FOR_ROLE = {
  "AI Engineer": [
    { name: "Python", proficiency: 6.0 },
    { name: "SQL", proficiency: 5.0 },
    { name: "Machine Learning", proficiency: 4.0 },
    { name: "Deep Learning", proficiency: 2.0 },
    { name: "DSA", proficiency: 4.0 },
    { name: "FastAPI", proficiency: 2.0 },
    { name: "Docker", proficiency: 1.5 },
    { name: "Statistics & Math", proficiency: 5.0 }
  ],
  "ML Engineer": [
    { name: "Python", proficiency: 6.5 },
    { name: "Machine Learning", proficiency: 5.0 },
    { name: "Deep Learning", proficiency: 3.0 },
    { name: "DSA", proficiency: 4.5 },
    { name: "Docker", proficiency: 2.0 },
    { name: "Cloud (AWS/GCP)", proficiency: 2.0 },
    { name: "SQL", proficiency: 5.0 },
    { name: "Statistics & Math", proficiency: 5.5 }
  ],
  "Generative AI & LLM Engineer": [
    { name: "Python", proficiency: 6.5 },
    { name: "LLMs & Transformers", proficiency: 3.0 },
    { name: "LangChain / LlamaIndex", proficiency: 2.0 },
    { name: "Vector DBs (Pinecone/Chroma)", proficiency: 2.0 },
    { name: "FastAPI", proficiency: 3.0 },
    { name: "Docker", proficiency: 2.0 },
    { name: "DSA", proficiency: 4.0 }
  ],
  "Data Scientist": [
    { name: "Python", proficiency: 6.0 },
    { name: "SQL", proficiency: 6.0 },
    { name: "Statistics & Math", proficiency: 6.5 },
    { name: "Machine Learning", proficiency: 4.0 },
    { name: "Pandas & NumPy", proficiency: 6.0 },
    { name: "Data Visualization (Tableau/Seaborn)", proficiency: 4.5 },
    { name: "DSA", proficiency: 3.5 }
  ],
  "Full Stack Developer": [
    { name: "JavaScript/TypeScript", proficiency: 6.0 },
    { name: "React / Next.js", proficiency: 5.0 },
    { name: "Node.js / Python", proficiency: 4.5 },
    { name: "SQL & PostgreSQL", proficiency: 4.0 },
    { name: "REST & GraphQL APIs", proficiency: 4.5 },
    { name: "DSA", proficiency: 4.0 },
    { name: "Git/GitHub", proficiency: 5.0 }
  ],
  "Backend Systems Engineer": [
    { name: "Java / Go / Python", proficiency: 6.0 },
    { name: "System Design & Microservices", proficiency: 3.5 },
    { name: "SQL & NoSQL (Redis/MongoDB)", proficiency: 5.0 },
    { name: "DSA", proficiency: 5.0 },
    { name: "Docker & Kubernetes", proficiency: 2.5 }
  ],
  "Cloud & DevOps Engineer": [
    { name: "Linux & Shell Scripting", proficiency: 6.0 },
    { name: "Cloud (AWS / Azure / GCP)", proficiency: 4.0 },
    { name: "Docker & Kubernetes", proficiency: 3.5 },
    { name: "CI/CD Pipelines (GitHub Actions/Jenkins)", proficiency: 3.0 },
    { name: "Networking & Security", proficiency: 4.5 }
  ],
  "Cybersecurity Analyst": [
    { name: "Network Security & Protocols", proficiency: 5.5 },
    { name: "Linux & OS Internals", proficiency: 5.0 },
    { name: "Ethical Hacking & Penetration Testing", proficiency: 3.5 },
    { name: "Python / Bash Scripting", proficiency: 4.0 }
  ],
  "Embedded Systems & IoT Engineer": [
    { name: "C / C++", proficiency: 6.0 },
    { name: "Microcontrollers (ARM, ESP32, STM32)", proficiency: 4.5 },
    { name: "RTOS (FreeRTOS) & Embedded Linux", proficiency: 2.5 },
    { name: "Protocols (I2C, SPI, UART, MQTT)", proficiency: 4.0 },
    { name: "PCB Design Basics & Oscilloscope Debugging", proficiency: 3.0 }
  ],
  "VLSI & Chip Design Engineer": [
    { name: "Verilog / SystemVerilog", proficiency: 5.5 },
    { name: "Digital System Design", proficiency: 6.0 },
    { name: "CMOS & ASIC Design Flow", proficiency: 4.0 },
    { name: "EDA Tools (Cadence / Synopsys)", proficiency: 3.0 }
  ],
  "CAD / CAE Simulation Engineer": [
    { name: "3D CAD (SolidWorks / CATIA / Fusion 360)", proficiency: 6.0 },
    { name: "FEA (Finite Element Analysis / ANSYS)", proficiency: 4.0 },
    { name: "Engineering Mechanics & Strength of Materials", proficiency: 5.5 },
    { name: "GD&T (Geometric Dimensioning & Tolerancing)", proficiency: 4.0 }
  ],
  "BIM & Smart Infrastructure Engineer": [
    { name: "BIM Software (Autodesk Revit / Navisworks)", proficiency: 5.5 },
    { name: "Structural Analysis (ETABS / STAAD Pro)", proficiency: 4.5 },
    { name: "AutoCAD 2D/3D Drafting", proficiency: 6.0 }
  ],
  "Business & Product Analyst": [
    { name: "SQL & Advanced Querying", proficiency: 6.0 },
    { name: "Data Visualization (PowerBI / Tableau)", proficiency: 5.5 },
    { name: "Excel & Financial Modeling", proficiency: 6.5 },
    { name: "Business Metrics (KPIs, LTV, CAC, Churn)", proficiency: 4.0 }
  ],
  "Quantitative Financial Analyst": [
    { name: "Financial Mathematics & Stochastic Calculus", proficiency: 5.5 },
    { name: "Python for Quantitative Finance (NumPy/SciPy)", proficiency: 5.0 },
    { name: "Time Series Modeling & Econometrics", proficiency: 4.0 },
    { name: "SQL & Financial Data APIs", proficiency: 5.0 }
  ],
  "Financial Risk Analyst": [
    { name: "Financial Statement Analysis", proficiency: 6.0 },
    { name: "Risk Modeling (Credit, Market, Liquidity Risk)", proficiency: 4.5 },
    { name: "Excel VBA & Financial Modeling", proficiency: 6.0 },
    { name: "SQL Querying", proficiency: 4.5 }
  ]
};

export default function AuthModal({ isOpen, onClose, onAuthSuccess, isDismissible = true }) {
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [step, setStep] = useState(1); // 1 to 5 for signup
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingIntent, setIsParsingIntent] = useState(false);
  const [intentInsights, setIntentInsights] = useState(null);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Multi-step Registration Form (clean starting state)
  const [formData, setFormData] = useState({
    // Step 1: Account
    name: '',
    email: '',
    password: '',
    avatar: '👨‍💻',

    // Step 2: Academic
    degree: 'B.Tech / B.E',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    college: '',
    cgpa: 8.0,
    target_placement_year: 2027,

    // Step 3: Career & Intent
    career_goal: 'Full Stack Developer',
    free_text_intent: '',

    // Step 4: Skills (Map of skill -> proficiency float)
    skills: {
      'JavaScript/TypeScript': 5.0,
      'React / Next.js': 4.5,
      'Node.js / Python': 4.0,
      'SQL & PostgreSQL': 4.0,
      'DSA': 3.5,
      'Git/GitHub': 5.0
    },

    // Step 5: Financials & Daily Time
    monthly_income: 10000,
    food: 3000,
    travel: 1500,
    entertainment: 1000,
    other: 1500,
    available_for_learning: 1500,
    savings: 1500,
    emergency_buffer: 2000,
    study_hours_per_day: 2.0,
    preferred_learning_style: 'Hands-on / Projects'
  });

  const [customSkillName, setCustomSkillName] = useState('');
  const avatars = ['👨‍💻', '👩‍💻', '🚀', '🤖', '🎓', '⚡', '💡', '🧠', '🎯', '🌟'];

  // Update branches and career goals when Degree changes
  const handleDegreeChange = (newDegree) => {
    const degreeData = DEGREE_BRANCH_MAP[newDegree] || DEGREE_BRANCH_MAP["B.Tech / B.E"];
    const firstBranch = degreeData.branches[0];
    const availableRoles = degreeData.roles[firstBranch] || ["Full Stack Developer", "AI Engineer", "Data Scientist"];
    const firstRole = availableRoles[0];

    // Load template skills for first role
    const starterSkills = (DEFAULT_SKILLS_FOR_ROLE[firstRole] || [
      { name: "Python", proficiency: 5.0 },
      { name: "SQL", proficiency: 4.0 },
      { name: "DSA", proficiency: 3.5 }
    ]).reduce((acc, curr) => ({ ...acc, [curr.name]: curr.proficiency }), {});

    setFormData(prev => ({
      ...prev,
      degree: newDegree,
      branch: firstBranch,
      career_goal: firstRole,
      skills: starterSkills
    }));
  };

  // Update career goals when Branch changes
  const handleBranchChange = (newBranch) => {
    const degreeData = DEGREE_BRANCH_MAP[formData.degree] || DEGREE_BRANCH_MAP["B.Tech / B.E"];
    const availableRoles = degreeData.roles[newBranch] || ["Full Stack Developer", "AI Engineer", "Data Scientist"];
    const firstRole = availableRoles[0];

    const starterSkills = (DEFAULT_SKILLS_FOR_ROLE[firstRole] || [
      { name: "Python", proficiency: 5.0 },
      { name: "SQL", proficiency: 4.0 },
      { name: "DSA", proficiency: 3.5 }
    ]).reduce((acc, curr) => ({ ...acc, [curr.name]: curr.proficiency }), {});

    setFormData(prev => ({
      ...prev,
      branch: newBranch,
      career_goal: firstRole,
      skills: starterSkills
    }));
  };

  // Update skills template when Career Goal changes
  const handleGoalChange = (newGoal) => {
    const starterSkills = (DEFAULT_SKILLS_FOR_ROLE[newGoal] || [
      { name: "Python", proficiency: 5.0 },
      { name: "SQL", proficiency: 4.0 },
      { name: "DSA", proficiency: 3.5 }
    ]).reduce((acc, curr) => ({ ...acc, [curr.name]: curr.proficiency }), {});

    setFormData(prev => ({
      ...prev,
      career_goal: newGoal,
      skills: starterSkills
    }));
  };

  const handleParseIntent = async () => {
    if (!formData.free_text_intent.trim()) return;
    setIsParsingIntent(true);
    try {
      const res = await api.parseIntent(formData.free_text_intent);
      setIntentInsights(res);
      if (res.interpreted_goal) {
        handleGoalChange(res.interpreted_goal);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingIntent(false);
    }
  };

  const handleSkillChange = (skillName, val) => {
    setFormData(prev => ({
      ...prev,
      skills: { ...prev.skills, [skillName]: Number(val) }
    }));
  };

  const handleAddCustomSkill = () => {
    if (!customSkillName.trim()) return;
    const name = customSkillName.trim();
    if (!formData.skills[name]) {
      setFormData(prev => ({
        ...prev,
        skills: { ...prev.skills, [name]: 3.0 }
      }));
    }
    setCustomSkillName('');
  };

  const handleRemoveSkill = (skillName) => {
    const updated = { ...formData.skills };
    delete updated[skillName];
    setFormData(prev => ({ ...prev, skills: updated }));
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await api.login(loginEmail.trim(), loginPassword);
      confetti({ particleCount: 50, spread: 60 });
      onAuthSuccess(res.profile);
      if (onClose) onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMsg('Please complete all required fields (Name, Email, Password).');
      return;
    }

    if (Object.keys(formData.skills).length < 5) {
      setErrorMsg('Please evaluate and rate at least 5 skills before generating your career and financial roadmap.');
      return;
    }

    setIsSubmitting(true);

    try {
      const skillList = Object.entries(formData.skills).map(([name, prof]) => {
        let level = 'Beginner';
        if (prof >= 7.5) level = 'Advanced';
        else if (prof >= 4.0) level = 'Intermediate';
        return { name, proficiency: prof, level, category: 'General' };
      });

      const registerPayload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        avatar: formData.avatar,
        career_goal: formData.career_goal,
        academic: {
          degree: formData.degree,
          branch: formData.branch,
          year: formData.year,
          college: formData.college.trim() || 'College / University',
          cgpa: Number(formData.cgpa) || 8.0
        },
        preferences: {
          preferred_learning_style: formData.preferred_learning_style,
          study_hours_per_day: Number(formData.study_hours_per_day) || 2.0,
          target_placement_year: Number(formData.target_placement_year) || 2027,
          free_text_intent: formData.free_text_intent
        },
        financial: {
          monthly_income: Number(formData.monthly_income) || 0,
          food: Number(formData.food) || 0,
          travel: Number(formData.travel) || 0,
          entertainment: Number(formData.entertainment) || 0,
          other: Number(formData.other) || 0,
          available_for_learning: Number(formData.available_for_learning) || 1000,
          savings: Number(formData.savings) || 1000,
          emergency_buffer: Number(formData.emergency_buffer) || 1000
        },
        skills: skillList
      };

      const res = await api.register(registerPayload);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      onAuthSuccess(res.profile);
      if (onClose) onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentDegreeData = DEGREE_BRANCH_MAP[formData.degree] || DEGREE_BRANCH_MAP["B.Tech / B.E"];
  const currentAvailableRoles = currentDegreeData.roles[formData.branch] || ["Full Stack Developer", "AI Engineer", "Data Scientist"];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative my-6">
        
        {/* Modal Close (only if dismissible) */}
        {isDismissible && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 p-2 rounded-full transition-colors z-20"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-orange-950 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-orange-500/20 blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-500/30 text-orange-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-400/30">
                  Student Career + Finance Platform
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight mt-1">
                {mode === 'login' ? 'Sign In to Your Workspace' : 'Create Your Personalized Profile'}
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                {mode === 'login' 
                  ? 'Access your dynamic readiness scores, learning roadmaps, and budget optimizations.' 
                  : `Step ${step} of 5 — Build your real-world career roadmap based on your actual inputs.`}
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => { setMode('signup'); setStep(1); setErrorMsg(''); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'signup' 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-stone-300 hover:text-white bg-white/5'
              }`}
            >
              Sign Up / New Student
            </button>
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'login' 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-stone-300 hover:text-white bg-white/5'
              }`}
            >
              Sign In (Existing Account)
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">

          {/* ========================================================= */}
          {/* LOGIN MODE */}
          {/* ========================================================= */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto py-2">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. you@student.edu"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 transition-all cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In & Open Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-stone-500 pt-2">
                New to the platform?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setStep(1); }}
                  className="text-orange-600 font-bold hover:underline"
                >
                  Create your profile here
                </button>
              </p>
            </form>
          )}

          {/* ========================================================= */}
          {/* MULTI-STEP SIGNUP MODE */}
          {/* ========================================================= */}
          {mode === 'signup' && (
            <div className="space-y-5">
              
              {/* Step Progress Bar */}
              <div className="flex items-center justify-between relative px-2">
                {[
                  { num: 1, label: 'Account' },
                  { num: 2, label: 'Degree' },
                  { num: 3, label: 'Career Goal' },
                  { num: 4, label: 'Skills' },
                  { num: 5, label: 'Finances' }
                ].map((s) => (
                  <div key={s.num} className="flex flex-col items-center z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === s.num
                          ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                          : step > s.num
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                    </div>
                    <span className="text-[10px] font-semibold text-stone-600 mt-1">{s.label}</span>
                  </div>
                ))}
                <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-stone-200 -z-0"></div>
              </div>

              {/* STEP 1: Account Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Alex Sharma"
                          className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@student.edu"
                          className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Create Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Choose a secure password"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">Choose Avatar</label>
                    <div className="flex flex-wrap gap-2">
                      {avatars.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar: av })}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                            formData.avatar === av
                              ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-200'
                              : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Academic Profile */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Pursuing Degree</label>
                      <select
                        value={formData.degree}
                        onChange={(e) => handleDegreeChange(e.target.value)}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold text-stone-900"
                      >
                        {Object.keys(DEGREE_BRANCH_MAP).map((deg) => (
                          <option key={deg} value={deg}>{deg}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Branch / Specialization</label>
                      <select
                        value={formData.branch}
                        onChange={(e) => handleBranchChange(e.target.value)}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold text-stone-900"
                      >
                        {currentDegreeData.branches.map((br) => (
                          <option key={br} value={br}>{br}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Current Academic Year</label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium text-stone-900"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year / Final</option>
                        <option value="Recent Graduate">Recent Graduate</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Current CGPA (out of 10)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="4.0"
                        max="10.0"
                        value={formData.cgpa}
                        onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Target Placement Year</label>
                      <select
                        value={formData.target_placement_year}
                        onChange={(e) => setFormData({ ...formData, target_placement_year: Number(e.target.value) })}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium text-stone-900"
                      >
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>
                        <option value={2028}>2028</option>
                        <option value={2029}>2029</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">College / University Name</label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      placeholder="e.g. Indian Institute of Technology / NIT / University"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium text-stone-900"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Career Goal & Intent */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-700">
                        Target Career Goal (Tailored for {formData.branch})
                      </label>
                      <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        {currentAvailableRoles.length} Matching Roles
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-stone-200 rounded-xl bg-stone-50/60">
                      {currentAvailableRoles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleGoalChange(role)}
                          className={`p-2.5 text-left rounded-xl text-xs font-bold transition-all border ${
                            formData.career_goal === role
                              ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                              : 'bg-white text-stone-800 border-stone-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{role}</span>
                            {formData.career_goal === role && <CheckCircle className="w-3.5 h-3.5 fill-current" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Intent Parser */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                        <Bot className="w-4 h-4 text-orange-600" />
                        <span>Not sure which role fits you? Type your interests in plain English:</span>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={formData.free_text_intent}
                      onChange={(e) => setFormData({ ...formData, free_text_intent: e.target.value })}
                      placeholder="e.g. I love building web apps and Python backends, but I also want to learn cloud deployment and ML..."
                      className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={handleParseIntent}
                      disabled={isParsingIntent || !formData.free_text_intent.trim()}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                      <span>{isParsingIntent ? 'Analyzing Intent...' : 'AI Career Path Matcher'}</span>
                    </button>

                    {intentInsights && (
                      <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-orange-950">
                          🎯 Suggested Match: {intentInsights.interpreted_goal}
                        </div>
                        <p className="text-[11px] text-stone-700">{intentInsights.suggested_focus}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Real Initial Skills Baseline */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-stone-900">Rate Your Actual Baseline Proficiency</h3>
                      <p className="text-[11px] text-stone-500">
                        Be authentic! Set to 0.0 if not learned yet. The AI builds your roadmap from your real starting point.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {Object.entries(formData.skills).map(([skill, prof]) => (
                      <div key={skill} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                        <div className="min-w-[140px]">
                          <span className="text-xs font-bold text-stone-900 block">{skill}</span>
                          <span className="text-[10px] text-stone-500 font-semibold">
                            {prof >= 7.5 ? '🟢 Advanced' : prof >= 4.0 ? '🟡 Intermediate' : '⚪ Beginner (0-3.9)'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={prof}
                            onChange={(e) => handleSkillChange(skill, e.target.value)}
                            className="w-full accent-orange-600 cursor-pointer"
                          />
                          <span className="text-xs font-extrabold text-stone-900 w-8 text-right">
                            {prof.toFixed(1)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Remove Skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Skill */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customSkillName}
                      onChange={(e) => setCustomSkillName(e.target.value)}
                      placeholder="Add another skill (e.g. PyTorch, Kubernetes, Golang)"
                      className="flex-1 text-xs p-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSkill}
                      className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Real Monthly Financials & Routine */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Monthly Income / Allowance (₹ INR)
                      </label>
                      <input
                        type="number"
                        step="500"
                        value={formData.monthly_income}
                        onChange={(e) => setFormData({ ...formData, monthly_income: Number(e.target.value) })}
                        placeholder="e.g. 15000"
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Available Monthly Learning Budget (₹ INR)
                      </label>
                      <input
                        type="number"
                        step="250"
                        value={formData.available_for_learning}
                        onChange={(e) => setFormData({ ...formData, available_for_learning: Number(e.target.value) })}
                        placeholder="e.g. 2000"
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-orange-600 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">Food (₹)</label>
                      <input
                        type="number"
                        value={formData.food}
                        onChange={(e) => setFormData({ ...formData, food: Number(e.target.value) })}
                        className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">Travel (₹)</label>
                      <input
                        type="number"
                        value={formData.travel}
                        onChange={(e) => setFormData({ ...formData, travel: Number(e.target.value) })}
                        className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">Leisure (₹)</label>
                      <input
                        type="number"
                        value={formData.entertainment}
                        onChange={(e) => setFormData({ ...formData, entertainment: Number(e.target.value) })}
                        className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">Emergency Buffer (₹)</label>
                      <input
                        type="number"
                        value={formData.emergency_buffer}
                        onChange={(e) => setFormData({ ...formData, emergency_buffer: Number(e.target.value) })}
                        className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-stone-100">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                        <span>Daily Available Study Hours</span>
                        <span className="text-orange-600 font-extrabold">{formData.study_hours_per_day} Hours / Day</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        step="0.5"
                        value={formData.study_hours_per_day}
                        onChange={(e) => setFormData({ ...formData, study_hours_per_day: Number(e.target.value) })}
                        className="w-full accent-orange-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Preferred Learning Style</label>
                      <select
                        value={formData.preferred_learning_style}
                        onChange={(e) => setFormData({ ...formData, preferred_learning_style: e.target.value })}
                        className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg font-medium"
                      >
                        <option value="Hands-on / Projects">Hands-on / Projects</option>
                        <option value="Video">Video Courses & Walkthroughs</option>
                        <option value="Documentation">Official Docs & Codebases</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-stone-500 font-semibold hover:text-stone-800"
                  >
                    Already have an account? Sign in
                  </button>
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && (!formData.name.trim() || !formData.email.trim() || !formData.password.trim())) {
                        setErrorMsg('Please enter your Name, Email, and Password to proceed.');
                        return;
                      }
                      if (step === 4 && Object.keys(formData.skills).length < 5) {
                        setErrorMsg('Please evaluate and rate at least 5 benchmark skills for your target role before proceeding.');
                        return;
                      }
                      setErrorMsg('');
                      setStep(step + 1);
                    }}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all ml-auto"
                  >
                    <span>Next: {step === 1 ? 'Degree' : step === 2 ? 'Career Goal' : step === 3 ? 'Skills' : 'Finances'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegisterSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all ml-auto cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isSubmitting ? 'Building Your Engines...' : 'Complete Profile & Launch Platform'}</span>
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  User, 
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
  Compass,
  Zap,
  TrendingUp,
  ShieldCheck,
  Lock,
  Mail,
  LogIn,
  UserPlus,
  KeyRound
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

export default function AuthModal({ isOpen, onClose, onAuthSuccess, isDismissible = true, initialMode = 'LOGIN' }) {
  // authMode: 'LOGIN' (Sign In), 'REGISTER' (Sign Up), 'QUESTIONNAIRE' (Step 1-4)
  const [authMode, setAuthMode] = useState(initialMode);
  const [step, setStep] = useState(1); // 1: Academic, 2: Career Track, 3: Skills, 4: Financials
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login credentials
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Questionnaire / Registration Data
  const [formData, setFormData] = useState({
    // User credentials
    name: '',
    email: '',
    password: '',
    avatar: '👨‍💻',

    // Step 1: Academic
    degree: 'B.Tech / B.E',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    college: '',
    cgpa: 8.0,
    target_placement_year: 2027,

    // Step 2: Career Goal & Learning Style
    career_goal: 'AI Engineer',
    free_text_intent: '',
    study_hours_per_day: 2.0,
    preferred_learning_style: 'Hands-on / Projects',

    // Step 3: Skills
    skills: {
      'Python': 6.0,
      'SQL': 5.0,
      'Machine Learning': 4.0,
      'DSA': 4.0,
      'FastAPI': 3.0,
      'Git/GitHub': 5.0
    },

    // Step 4: Financials
    monthly_income: 15000,
    food: 4000,
    travel: 2000,
    entertainment: 1500,
    other: 2000,
    available_for_learning: 2500,
    savings: 3000,
    emergency_buffer: 2000
  });

  const [customSkillName, setCustomSkillName] = useState('');
  const avatars = ['👨‍💻', '👩‍💻', '🚀', '🤖', '🎓', '⚡', '💡', '🧠', '🎯', '🌟'];

  useEffect(() => {
    if (initialMode) setAuthMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Handle direct Sign In
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.login(loginEmail.trim().toLowerCase(), loginPassword);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onAuthSuccess(res.profile);
      if (onClose) onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo Account Login
  const handleQuickDemoLogin = async () => {
    setErrorMsg('');
    try {
      setIsSubmitting(true);
      const demoEmail = 'student_demo@careerwealth.ai';
      const demoPassword = 'DemoStudent123!';
      try {
        const res = await api.login(demoEmail, demoPassword);
        confetti({ particleCount: 60, spread: 50 });
        onAuthSuccess(res.profile);
        if (onClose) onClose();
        return;
      } catch {
        // If demo user does not exist yet, auto-create it
        const starterSkills = [
          { name: 'Python', proficiency: 7.0, level: 'Intermediate', category: 'General' },
          { name: 'SQL', proficiency: 6.0, level: 'Intermediate', category: 'General' },
          { name: 'Machine Learning', proficiency: 5.5, level: 'Intermediate', category: 'General' },
          { name: 'FastAPI', proficiency: 5.0, level: 'Intermediate', category: 'General' },
          { name: 'DSA', proficiency: 4.5, level: 'Intermediate', category: 'General' }
        ];
        const res = await api.setupProfile({
          name: 'Yogeshwaran (Demo)',
          email: demoEmail,
          password: demoPassword,
          avatar: '🚀',
          career_goal: 'AI Engineer',
          academic: {
            degree: 'B.Tech / B.E',
            branch: 'Artificial Intelligence & Machine Learning',
            year: '3rd Year',
            college: 'College of Technology',
            cgpa: 8.8
          },
          preferences: {
            study_hours_per_day: 3.0,
            target_placement_year: 2027,
            preferred_learning_style: 'Hands-on / Projects'
          },
          financial: {
            monthly_income: 18000,
            food: 4000,
            travel: 2000,
            entertainment: 1500,
            other: 2000,
            available_for_learning: 3000,
            savings: 4000,
            emergency_buffer: 3500
          },
          skills: starterSkills
        });
        confetti({ particleCount: 70, spread: 60 });
        onAuthSuccess(res.profile);
        if (onClose) onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 0 of Sign Up: Validate basic identity and move to Questionnaire Step 1
  const handleSignUpStart = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setAuthMode('QUESTIONNAIRE');
    setStep(1);
  };

  // Complete Onboarding Questionnaire
  const handleCompleteQuestionnaire = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (Object.keys(formData.skills).length < 3) {
      setErrorMsg('Please rate at least 3 skills to initialize your roadmap.');
      setStep(3);
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

      const setupPayload = {
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

      const res = await api.setupProfile(setupPayload);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      onAuthSuccess(res.profile);
      if (onClose) onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDegreeData = DEGREE_BRANCH_MAP[formData.degree] || DEGREE_BRANCH_MAP["B.Tech / B.E"];
  const currentAvailableRoles = currentDegreeData.roles[formData.branch] || ["Full Stack Developer", "AI Engineer", "Data Scientist"];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative my-6">
        
        {/* Close Button */}
        {isDismissible && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 p-2 rounded-full transition-colors z-20 cursor-pointer"
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
                  {authMode === 'LOGIN' ? 'Student Sign In' : authMode === 'REGISTER' ? 'New Student Registration' : `Onboarding Questionnaire (${step}/4)`}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight mt-1">
                {authMode === 'LOGIN' ? 'Welcome Back to CareerWealth.AI' : authMode === 'REGISTER' ? 'Create Your Student Account' : 'Build Your Career & Wealth Twin'}
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                {authMode === 'LOGIN' 
                  ? 'Sign in to access your placement roadmap, simulated broker, and financial safety gates.'
                  : authMode === 'REGISTER'
                  ? 'Start by entering your account credentials, then answer tailored questions for your degree.'
                  : 'Tailored questions to calculate your explainable readiness score and financial runway.'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/20">
              {authMode === 'LOGIN' ? '🔐' : authMode === 'REGISTER' ? '✨' : formData.avatar}
            </div>
          </div>

          {/* Mode Switcher Tabs (Only when not in multi-step questionnaire) */}
          {authMode !== 'QUESTIONNAIRE' && (
            <div className="flex gap-2 mt-4 relative z-10">
              <button
                type="button"
                onClick={() => { setAuthMode('LOGIN'); setErrorMsg(''); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  authMode === 'LOGIN' ? 'bg-orange-500 text-white shadow-md' : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('REGISTER'); setErrorMsg(''); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  authMode === 'REGISTER' ? 'bg-orange-500 text-white shadow-md' : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create New Account</span>
              </button>
            </div>
          )}

          {/* Questionnaire Progress Stepper (Only in questionnaire mode) */}
          {authMode === 'QUESTIONNAIRE' && (
            <div className="flex items-center gap-2 mt-4 relative z-10">
              {[
                { s: 1, label: 'Degree' },
                { s: 2, label: 'Target Track' },
                { s: 3, label: 'Skills' },
                { s: 4, label: 'Financials' }
              ].map(item => (
                <div key={item.s} className="flex-1">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${
                    step >= item.s ? 'bg-orange-500' : 'bg-stone-700'
                  }`} />
                  <span className="text-[10px] text-stone-400 mt-1 block font-medium truncate">
                    {item.s}. {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: SIGN IN (EXISTING USER) */}
        {/* ============================================================== */}
        {authMode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full text-xs font-semibold pl-9 pr-3 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-xs font-semibold pl-9 pr-3 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-md shadow-orange-600/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying Account...' : 'Sign In to CareerWealth'}</span>
            </button>

            <div className="pt-2 border-t border-stone-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>⚡ Instant Try: One-Click Demo Student Account</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setAuthMode('REGISTER'); setErrorMsg(''); }}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
                >
                  New to CareerWealth? Create an account & answer questionnaire →
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: NEW USER REGISTRATION STEP */}
        {/* ============================================================== */}
        {authMode === 'REGISTER' && (
          <form onSubmit={handleSignUpStart} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Yogeshwaran"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Create Password (Min 6 chars)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">Choose Avatar</label>
              <div className="flex flex-wrap gap-2">
                {avatars.map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: av })}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition cursor-pointer ${
                      formData.avatar === av ? 'border-orange-500 bg-orange-50 scale-105' : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-md shadow-orange-600/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Career & Wealth Questionnaire (Step 1/4)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-1 border-t border-stone-200">
              <button
                type="button"
                onClick={() => { setAuthMode('LOGIN'); setErrorMsg(''); }}
                className="text-xs text-stone-500 hover:text-stone-800 font-bold underline cursor-pointer"
              >
                Already registered? Sign In directly instead
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: QUESTIONNAIRE (STEPS 1 TO 4) */}
        {/* ============================================================== */}
        {authMode === 'QUESTIONNAIRE' && (
          <div className="p-6 space-y-4">
            
            {/* STEP 1: DEGREE & ACADEMIC PROFILE */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Your Degree</label>
                    <select
                      value={formData.degree}
                      onChange={(e) => {
                        const newDeg = e.target.value;
                        const branches = DEGREE_BRANCH_MAP[newDeg]?.branches || [];
                        const firstBranch = branches[0] || 'General';
                        const firstRole = (DEGREE_BRANCH_MAP[newDeg]?.roles[firstBranch] || ['Full Stack Developer'])[0];
                        setFormData({
                          ...formData,
                          degree: newDeg,
                          branch: firstBranch,
                          career_goal: firstRole
                        });
                      }}
                      className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                    >
                      {Object.keys(DEGREE_BRANCH_MAP).map(deg => (
                        <option key={deg} value={deg}>{deg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Department / Branch</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => {
                        const newBranch = e.target.value;
                        const roles = (currentDegreeData.roles[newBranch] || ['Full Stack Developer']);
                        setFormData({
                          ...formData,
                          branch: newBranch,
                          career_goal: roles[0]
                        });
                      }}
                      className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                    >
                      {(currentDegreeData.branches || []).map(b => (
                        <option key={b} value={b}>{b}</option>
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
                      className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                    >
                      {['1st Year', '2nd Year', '3rd Year', '4th / Final Year', 'Recent Graduate'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
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
                      onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 8.0 })}
                      className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Target Placement Year</label>
                    <select
                      value={formData.target_placement_year}
                      onChange={(e) => setFormData({ ...formData, target_placement_year: parseInt(e.target.value, 10) })}
                      className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                    >
                      {[2025, 2026, 2027, 2028, 2029].map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">College / University Name</label>
                  <input
                    type="text"
                    placeholder="e.g. College of Technology, Anna University, IIT Madras"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: TARGET CAREER TRACK */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Target Job Role / Placement Goal</label>
                  <select
                    value={formData.career_goal}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      const roleSkills = (DEFAULT_SKILLS_FOR_ROLE[newRole] || [
                        { name: 'Python', proficiency: 5.0 },
                        { name: 'SQL', proficiency: 4.0 },
                        { name: 'DSA', proficiency: 3.5 }
                      ]).reduce((acc, curr) => ({ ...acc, [curr.name]: curr.proficiency }), {});
                      setFormData({
                        ...formData,
                        career_goal: newRole,
                        skills: roleSkills
                      });
                    }}
                    className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                  >
                    {currentAvailableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Daily Study Hours Available</label>
                    <select
                      value={formData.study_hours_per_day}
                      onChange={(e) => setFormData({ ...formData, study_hours_per_day: parseFloat(e.target.value) })}
                      className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                    >
                      {[1.0, 2.0, 3.0, 4.0, 5.0, 6.0].map(h => (
                        <option key={h} value={h}>{h} Hours / Day</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Preferred Learning Style</label>
                    <select
                      value={formData.preferred_learning_style}
                      onChange={(e) => setFormData({ ...formData, preferred_learning_style: e.target.value })}
                      className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                    >
                      {['Hands-on / Projects', 'Video Tutorials', 'Reading / Documentation', 'Interactive Challenges'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Career Aspiration Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. I want to build high-scale AI products, clear Tier-1 campus placements, and invest my stipend wisely."
                    value={formData.free_text_intent}
                    onChange={(e) => setFormData({ ...formData, free_text_intent: e.target.value })}
                    className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: SKILL PROFICIENCIES */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">Rate Your Core Skills (0 = Beginner, 10 = Expert)</span>
                  <span className="text-[10px] text-stone-500">Benchmark for {formData.career_goal}</span>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {Object.entries(formData.skills).map(([skill, prof]) => (
                    <div key={skill} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-stone-800">{skill}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-orange-600">{prof.toFixed(1)}/10</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...formData.skills };
                              delete updated[skill];
                              setFormData({ ...formData, skills: updated });
                            }}
                            className="text-stone-400 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={prof}
                        onChange={(e) => setFormData({
                          ...formData,
                          skills: { ...formData.skills, [skill]: parseFloat(e.target.value) }
                        })}
                        className="w-full accent-orange-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                {/* Add Custom Skill */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom skill (e.g. PyTorch, Rust, LangChain)"
                    value={customSkillName}
                    onChange={(e) => setCustomSkillName(e.target.value)}
                    className="flex-1 text-xs font-semibold p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customSkillName.trim()) return;
                      setFormData({
                        ...formData,
                        skills: { ...formData.skills, [customSkillName.trim()]: 5.0 }
                      });
                      setCustomSkillName('');
                    }}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: MONTHLY FINANCIAL ENVELOPE */}
            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 font-medium">
                  💡 This envelope powers your SEBI-aligned 5-Gate Financial Safety Center, Emergency Fund Runway, and Career ROI vs Investment simulator.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Monthly Income / Allowance (₹)</label>
                    <input
                      type="number"
                      step="500"
                      value={formData.monthly_income}
                      onChange={(e) => setFormData({ ...formData, monthly_income: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Current Emergency Buffer (₹)</label>
                    <input
                      type="number"
                      step="500"
                      value={formData.emergency_buffer}
                      onChange={(e) => setFormData({ ...formData, emergency_buffer: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-semibold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Food (₹)</label>
                    <input
                      type="number"
                      value={formData.food}
                      onChange={(e) => setFormData({ ...formData, food: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Travel (₹)</label>
                    <input
                      type="number"
                      value={formData.travel}
                      onChange={(e) => setFormData({ ...formData, travel: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Entertainment (₹)</label>
                    <input
                      type="number"
                      value={formData.entertainment}
                      onChange={(e) => setFormData({ ...formData, entertainment: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Upskilling Fund (₹)</label>
                    <input
                      type="number"
                      value={formData.available_for_learning}
                      onChange={(e) => setFormData({ ...formData, available_for_learning: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Questionnaire Navigation Buttons */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (step > 1) setStep(step - 1);
                  else setAuthMode('REGISTER');
                }}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCompleteQuestionnaire}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Initializing AI Engines...' : 'Complete Setup & Launch Dashboard'}</span>
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

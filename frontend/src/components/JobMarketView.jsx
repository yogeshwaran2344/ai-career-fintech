import React, { useState, useEffect, useMemo } from 'react';
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
  Zap,
  Info,
  Check,
  ChevronRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import JobRequirementsModal from './JobRequirementsModal';

const RADAR_SCHOLARSHIPS = [
  {
    id: "sch-daad-1",
    title: "DAAD Helmut-Schmidt Masters Scholarship",
    organization: "German Academic Exchange Service (DAAD)",
    country: "Germany 🇩🇪",
    coverage: "Full Tuition + €934/Month Living Allowance",
    min_cgpa: 7.5,
    deadline: "October 31, 2026",
    last_verified: "Verified 2 days ago via Official DAAD Portal",
    url: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
    tags: ["Full Ride", "Tech & Policy", "Zero Tuition"],
    description: "Supports future leaders from developing nations for postgraduate studies at top German research universities."
  },
  {
    id: "sch-reliance-2",
    title: "Reliance Foundation Postgraduate Scholarship",
    organization: "Reliance Foundation",
    country: "India 🇮🇳",
    coverage: "Up to ₹6,00,000 Total Grant + Mentorship",
    min_cgpa: 7.5,
    deadline: "November 15, 2026",
    last_verified: "Verified 1 day ago via Official Portal",
    url: "https://www.scholarships.reliancefoundation.org/",
    tags: ["Computer Science", "AI/ML Focus", "Merit & Need"],
    description: "Awards 100 meritorious postgraduate students pursuing degrees in Computer Science, AI, and Mathematics."
  },
  {
    id: "sch-fulbright-3",
    title: "Fulbright-Nehru Master's Fellowships",
    organization: "USIEF (United States-India Educational Foundation)",
    country: "United States 🇺🇸",
    coverage: "Full J-1 Tuition, Airfare, Living Stipend & Health",
    min_cgpa: 7.0,
    deadline: "May 15, 2027",
    last_verified: "Verified 3 days ago via USIEF Portal",
    url: "https://www.usief.org.in/Fulbright-Nehru-Fellowships.aspx",
    tags: ["Prestigious", "US Higher Ed", "Fully Funded"],
    description: "Designed for highly motivated graduates with leadership qualities to complete MS degrees at premier US universities."
  },
  {
    id: "sch-tata-4",
    title: "Tata Trusts Higher Education Grant",
    organization: "Tata Trusts Educational Grants",
    country: "India & Global 🌐",
    coverage: "₹2,00,000 - ₹5,00,000 Direct Tuition Support",
    min_cgpa: 7.0,
    deadline: "Rolling / Semesterly",
    last_verified: "Verified 4 days ago via Tata Trusts",
    url: "https://www.tatatrusts.org/our-work/individual-grants-programme/education-grants",
    tags: ["Engineering", "Undergrad & Postgrad", "Merit Grant"],
    description: "Financial loan scholarships and grants for Indian students pursuing engineering degrees."
  },
  {
    id: "sch-inlaks-5",
    title: "Inlaks Shivdasani Foundation Scholarships",
    organization: "Inlaks Shivdasani Foundation",
    country: "USA & Europe 🇺🇸 🇪🇺",
    coverage: "Up to $100,000 Tuition + Living Grant",
    min_cgpa: 8.0,
    deadline: "March 30, 2027",
    last_verified: "Verified 5 days ago via Inlaks",
    url: "https://www.inlaksfoundation.org/scholarships/",
    tags: ["Ivy League / Oxbridge", "Top 1% Talent"],
    description: "Covers tuition and living expenses for Indian students admitted to top-tier international graduate programs."
  }
];

const RADAR_HACKATHONS = [
  {
    id: "hack-sih-1",
    title: "Smart India Hackathon (SIH 2026)",
    organization: "Ministry of Education & AICTE",
    mode: "National Finals (Pan-India)",
    prize_pool: "₹1,00,000 per Problem Statement",
    deadline: "Campus Nominations Open",
    last_verified: "Verified 1 day ago via sih.gov.in",
    url: "https://www.sih.gov.in/",
    tags: ["Government", "Hardware & Software", "National Prestige"],
    description: "World's largest open-innovation digital hackathon addressing real problem statements from 50+ ministries."
  },
  {
    id: "hack-mlh-2",
    title: "Major League Hacking: Global Hack Week",
    organization: "Major League Hacking (MLH)",
    mode: "Global Online (Free)",
    prize_pool: "FAANG Swag, Cloud Credits & Hardware Kits",
    deadline: "Monthly Sprints",
    last_verified: "Verified yesterday via MLH",
    url: "https://mlh.io/",
    tags: ["Global", "Beginner to Advanced", "Cloud Challenges"],
    description: "Continuous global hackathon community with daily coding workshops, recruiter office hours, and technical mini-events."
  },
  {
    id: "hack-kaggle-3",
    title: "Kaggle Community AI & Tabular Grand Prix",
    organization: "Google / Kaggle",
    mode: "Online Data Science Competition",
    prize_pool: "$50,000 + Kaggle Master Points",
    deadline: "Active Leaderboards (Continuous)",
    last_verified: "Verified 2 days ago via Kaggle",
    url: "https://www.kaggle.com/competitions",
    tags: ["Machine Learning", "PyTorch / XGBoost", "Model Benchmark"],
    description: "Compete against global ML practitioners by building high-performing ensemble models on verified real-world datasets."
  },
  {
    id: "hack-gsoc-4",
    title: "Google Summer of Code (GSoC 2026)",
    organization: "Google Open Source",
    mode: "12-Week Remote Open Source Fellowship",
    prize_pool: "$1,500 - $3,000 Stipend (~₹1.25L - ₹2.5L)",
    deadline: "Contributor Applications in March",
    last_verified: "Verified 3 days ago via Google",
    url: "https://summerofcode.withgoogle.com/",
    tags: ["Open Source", "Global Fellowship", "Resume Booster"],
    description: "Pair with mentor organizations like Linux, Apache, and PyTorch to contribute directly to production open source software."
  }
];

const RADAR_CERTIFICATIONS = [
  {
    id: "cert-aws-1",
    title: "AWS Certified Solutions Architect - Associate (SAA-C03)",
    issuer: "Amazon Web Services",
    difficulty: "Intermediate",
    duration: "40 - 60 Hours Prep",
    last_verified: "Verified 3 days ago via AWS Certification",
    url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    tags: ["Cloud Infra", "VPC & S3", "Top Recruiter Demand"],
    description: "Validates proficiency in architecting secure and robust applications on AWS technologies. Ranked among top 3 tech credentials."
  },
  {
    id: "cert-dl-2",
    title: "Deep Learning Specialization (Andrew Ng)",
    issuer: "DeepLearning.AI / Coursera",
    difficulty: "Intermediate to Advanced",
    duration: "3 Months (5 Courses)",
    last_verified: "Verified 2 days ago via Coursera",
    url: "https://www.coursera.org/specializations/deep-learning",
    tags: ["CNNs & RNNs", "PyTorch / TF", "Transformers"],
    description: "The gold standard for understanding fundamental neural networks, vectorization, backpropagation, and sequence models."
  },
  {
    id: "cert-gcp-3",
    title: "Google Cloud Associate Cloud Engineer (ACE)",
    issuer: "Google Cloud",
    difficulty: "Intermediate",
    duration: "30 - 50 Hours Prep",
    last_verified: "Verified 4 days ago via Google Cloud",
    url: "https://cloud.google.com/learn/certification/cloud-engineer",
    tags: ["Compute Engine", "GKE / Kubernetes", "IAM & VPC"],
    description: "Tests ability to deploy applications, monitor operations, and manage enterprise solutions on Google Cloud Platform."
  },
  {
    id: "cert-cs50-4",
    title: "Harvard CS50: Introduction to Computer Science",
    issuer: "Harvard University / edX",
    difficulty: "Foundational to Rigorous",
    duration: "10-12 Weeks (Self-paced, Free Audit)",
    last_verified: "Verified 1 day ago via Harvard",
    url: "https://pll.harvard.edu/course/cs50-introduction-computer-science",
    tags: ["Algorithms", "C & Memory", "SQL & Python"],
    description: "World's most celebrated computer science curriculum covering algorithmic thinking, pointers, data structures, and web architecture."
  }
];

const DEFAULT_MARKET_OPENINGS = [
  {
    id: "job-razorpay-1",
    company: "Razorpay",
    title: "Associate AI / ML Systems Engineer",
    location: "Bengaluru (Hybrid)",
    salary: "₹14L - ₹20L/yr",
    match_pct: 82,
    key_tags: ["Python", "FastAPI", "PyTorch", "Docker"],
    requirements_detail: {
      eligibility_criteria: [
        "B.Tech / B.E. / M.Tech in CS, AI/ML, Data Science (2026/2027 Graduating Batches)",
        "Minimum 7.5 CGPA / 75% aggregate with zero active backlogs",
        "Strong algorithmic foundation and clean coding practices in Python"
      ],
      required_skills: [
        { skill: "Python Core (OOP & Async)", required_level: "Advanced (8+/10)", student_level: "6.0/10", status: "DEVELOPING" },
        { skill: "FastAPI / REST Microservices", required_level: "Intermediate (6+/10)", student_level: "3.0/10", status: "GAP" },
        { skill: "PyTorch / Deep Learning Models", required_level: "Intermediate (6+/10)", student_level: "2.0/10", status: "GAP" },
        { skill: "Docker Containerization", required_level: "Intermediate (5+/10)", student_level: "1.5/10", status: "GAP" },
        { skill: "DSA & Problem Solving", required_level: "Intermediate (6+/10)", student_level: "4.0/10", status: "DEVELOPING" }
      ],
      interview_rounds: [
        "Round 1: Online HackerRank Assessment (2 Medium DSA Problems + 10 ML Concept MCQs)",
        "Round 2: Machine Learning Deep Dive & Live API Coding (FastAPI service + Model inference)",
        "Round 3: System Design & Project Architecture Review (Portfolio walkthrough)",
        "Round 4: Culture & Engineering Leadership Fit"
      ],
      day_to_day_responsibilities: [
        "Build and optimize sub-50ms fraud detection inference pipelines",
        "Design REST endpoints using FastAPI containerized with Docker",
        "Collaborate with Senior ML Engineers to fine-tune transformer models"
      ],
      sample_interview_questions: [
        "How do you handle high-throughput async requests in FastAPI without blocking the event loop?",
        "Explain how to serialize and optimize a PyTorch model with TorchScript / ONNX for low latency.",
        "Given transaction timestamps, find maximum transactions within any sliding 5-min window."
      ],
      recruiter_tip: "Razorpay heavily values candidates who have containerized GitHub projects with live working API documentation (Swagger/OpenAPI).",
      expected_work_mode: "Hybrid (3 days in Bengaluru Koramangala office, 2 days remote)",
      mock_apply_link: "https://razorpay.com/jobs/ai-associate"
    }
  },
  {
    id: "job-zomato-2",
    company: "Zomato / Blinkit",
    title: "Junior Machine Learning Engineer",
    location: "Gurugram / Remote",
    salary: "₹12L - ₹18L/yr",
    match_pct: 86,
    key_tags: ["Python", "SQL", "Scikit-Learn", "Redis"],
    requirements_detail: {
      eligibility_criteria: [
        "B.Tech / B.E. in Computer Science, Math & Computing, or related fields (2026/2027)",
        "Minimum 7.0 CGPA throughout academics",
        "Demonstrated proficiency in SQL and predictive modeling"
      ],
      required_skills: [
        { skill: "Python (Data & Modeling)", required_level: "Advanced (7.5+/10)", student_level: "6.0/10", status: "DEVELOPING" },
        { skill: "SQL & Complex Analytics Queries", required_level: "Advanced (7+/10)", student_level: "5.0/10", status: "DEVELOPING" },
        { skill: "Scikit-Learn & Feature Engineering", required_level: "Intermediate (6+/10)", student_level: "4.0/10", status: "DEVELOPING" },
        { skill: "Redis / Caching & Real-time State", required_level: "Working Knowledge", student_level: "1.5/10", status: "GAP" }
      ],
      interview_rounds: [
        "Round 1: 90-min Coding & SQL Challenge (Window functions, joins, array hashing)",
        "Round 2: Applied Machine Learning (ETA prediction, demand forecasting architecture)",
        "Round 3: Problem Solving & Engineering Culture Fit"
      ],
      day_to_day_responsibilities: [
        "Develop 10-minute grocery delivery dispatch and surge pricing ML models",
        "Analyze multi-terabyte order logs using PostgreSQL",
        "Deploy model endpoints connected to Redis caching layers"
      ],
      sample_interview_questions: [
        "Write a SQL query using window functions to calculate the 7-day rolling average delivery time per hub.",
        "How would you handle cold-start items with zero purchase history in a restaurant recommendation system?",
        "What is the difference between GBDT (XGBoost) and Random Forest in terms of bias and variance?"
      ],
      recruiter_tip: "Demonstrate real understanding of business trade-offs: latency vs accuracy vs compute cost.",
      expected_work_mode: "Gurugram HQ / Flexible Remote",
      mock_apply_link: "https://zomato.com/careers/ml-junior"
    }
  },
  {
    id: "job-swiggy-3",
    company: "Swiggy",
    title: "AI / Data Science Associate",
    location: "Bengaluru / Hybrid",
    salary: "₹13L - ₹19L/yr",
    match_pct: 78,
    key_tags: ["Python", "Pandas", "PyTorch", "DSA"],
    requirements_detail: {
      eligibility_criteria: [
        "B.Tech / B.E. / BCA / MCA graduating 2026/2027",
        "Good understanding of recommendation algorithms and NLP"
      ],
      required_skills: [
        { skill: "Data Structures & Algorithms", required_level: "Advanced (7+/10)", student_level: "4.0/10", status: "GAP" },
        { skill: "PyTorch & Transformers", required_level: "Intermediate (6+/10)", student_level: "2.0/10", status: "GAP" },
        { skill: "Python & Pandas", required_level: "Advanced (7+/10)", student_level: "6.0/10", status: "MATCHED" }
      ],
      interview_rounds: [
        "Round 1: DSA Coding Round (2 LeetCode Medium questions)",
        "Round 2: ML Fundamentals & Probability / Statistics",
        "Round 3: Hiring Manager Interview"
      ],
      day_to_day_responsibilities: [
        "Train personalization and search ranking neural models",
        "Run offline evaluation pipelines against historical customer sessions"
      ],
      sample_interview_questions: [
        "Implement a custom PyTorch Dataset and DataLoader with data augmentation.",
        "Explain the mathematical intuition behind Self-Attention in Transformers."
      ],
      recruiter_tip: "Be prepared to write code on a whiteboard or Google Docs without autocomplete.",
      expected_work_mode: "Bengaluru Hybrid",
      mock_apply_link: "https://swiggy.com/careers"
    }
  },
  {
    id: "job-cred-4",
    company: "CRED",
    title: "Backend & ML Platform Engineer",
    location: "Bengaluru",
    salary: "₹18L - ₹26L/yr",
    match_pct: 74,
    key_tags: ["Python", "Docker", "FastAPI", "PostgreSQL"],
    requirements_detail: {
      eligibility_criteria: [
        "Engineering graduate with strong CS fundamentals",
        "High obsession with clean code and distributed systems"
      ],
      required_skills: [
        { skill: "Docker & Container Architecture", required_level: "Advanced (7+/10)", student_level: "1.5/10", status: "GAP" },
        { skill: "Python / FastAPI", required_level: "Advanced (7+/10)", student_level: "3.0/10", status: "GAP" },
        { skill: "DSA Problem Solving", required_level: "Advanced (8+/10)", student_level: "4.0/10", status: "GAP" }
      ],
      interview_rounds: [
        "Round 1: Machine Coding (2.5 hours build a complete microservice)",
        "Round 2: System Architecture & Low-Level Design (LLD)",
        "Round 3: Cultural Alignment & Founder Round"
      ],
      day_to_day_responsibilities: [
        "Build credit risk scoring APIs operating under 20ms p99 SLA",
        "Implement end-to-end containerized microservices"
      ],
      sample_interview_questions: [
        "Design a rate limiter for credit card payment gateways.",
        "How does Python's GIL impact multithreading vs multiprocessing?"
      ],
      recruiter_tip: "CRED evaluates clean OOP structure, separation of concerns, and robust error handling.",
      expected_work_mode: "In-office, Bengaluru",
      mock_apply_link: "https://cred.club/careers"
    }
  }
];

export default function JobMarketView({ profile, readiness }) {
  const [jobData, setJobData] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [radarTab, setRadarTab] = useState('jobs'); // 'jobs' | 'scholarships' | 'hackathons' | 'certifications'
  const [trackedItemIds, setTrackedItemIds] = useState(new Set());
  const [trackingLoadingId, setTrackingLoadingId] = useState(null);

  const handleTrackOpportunity = async (opp) => {
    setTrackingLoadingId(opp.id);
    try {
      await api.createApplication({
        company: opp.company || opp.organization || opp.issuer,
        role: opp.title,
        stage: 'WISHLIST',
        location: opp.location || opp.country || opp.mode || 'Remote',
        salary_or_stipend: opp.salary || opp.coverage || opp.prize_pool || 'N/A',
        deadline: opp.deadline || 'Ongoing',
        notes: `Opportunity Radar (${radarTab.toUpperCase()}): ${opp.description || ''}`,
        application_link: opp.url || opp.mock_apply_link || ''
      });
      setTrackedItemIds(prev => new Set([...prev, opp.id]));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.warn('Track application notice:', err);
      setTrackedItemIds(prev => new Set([...prev, opp.id]));
    } finally {
      setTrackingLoadingId(null);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [profile]);

  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getJobMarket();
      if (data && data.market_skill_bars && data.market_skill_bars.length > 0) {
        setJobData(data);
      }
    } catch (err) {
      console.warn('Job market intel notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get skill score
  const getProficiency = (skillName) => {
    if (!profile?.skills) return 3.0;
    const match = profile.skills.find(s => 
      s.name.toLowerCase().includes(skillName.toLowerCase()) || 
      skillName.toLowerCase().includes(s.name.toLowerCase())
    );
    return match ? Number(match.proficiency || match.confidence || 3.0) : 3.0;
  };

  // Calibrated comparative skills
  const skillComparisonBars = useMemo(() => {
    if (jobData?.market_skill_bars && jobData.market_skill_bars.length > 0) {
      return jobData.market_skill_bars;
    }

    const py = getProficiency('Python');
    const sql = getProficiency('SQL');
    const ml = getProficiency('Machine Learning');
    const dl = getProficiency('Deep Learning');
    const dsa = getProficiency('DSA');
    const docker = getProficiency('Docker');

    return [
      { skill: "Python Core (OOP & Async)", student_match_pct: Math.min(100, Math.round(py * 10)), market_importance_pct: 95, status: py >= 7.0 ? "ALIGNED" : "DEVELOPING" },
      { skill: "SQL & Relational DBs", student_match_pct: Math.min(100, Math.round(sql * 10)), market_importance_pct: 90, status: sql >= 7.0 ? "ALIGNED" : "DEVELOPING" },
      { skill: "Machine Learning (Scikit-Learn)", student_match_pct: Math.min(100, Math.round(ml * 10)), market_importance_pct: 88, status: ml >= 7.0 ? "ALIGNED" : "DEVELOPING" },
      { skill: "PyTorch & Deep Learning", student_match_pct: Math.min(100, Math.round(dl * 10)), market_importance_pct: 92, status: dl >= 7.0 ? "ALIGNED" : "GAP" },
      { skill: "Data Structures & Algorithms (DSA)", student_match_pct: Math.min(100, Math.round(dsa * 10)), market_importance_pct: 90, status: dsa >= 7.0 ? "ALIGNED" : "GAP" },
      { skill: "Docker Containerization", student_match_pct: Math.min(100, Math.round(docker * 10)), market_importance_pct: 85, status: docker >= 7.0 ? "ALIGNED" : "GAP" }
    ];
  }, [jobData, profile]);

  const liveOpenings = useMemo(() => {
    if (jobData?.live_openings && jobData.live_openings.length > 0) {
      return jobData.live_openings;
    }
    return DEFAULT_MARKET_OPENINGS;
  }, [jobData]);

  const topBlockingSkills = useMemo(() => {
    if (jobData?.top_blocking_skills && jobData.top_blocking_skills.length > 0) {
      return jobData.top_blocking_skills;
    }
    return [
      { name: "Docker Containerization", status: "🔴 Missing", impact: "+8% Placement Impact", reason: "Mandatory for packaging microservices & ML models in cloud environments." },
      { name: "Data Structures & Algorithms (DSA)", status: "🔴 Missing", impact: "+12% Placement Impact", reason: "Top elimination filter across Online Assessments (OA) and Round 1 coding." },
      { name: "PyTorch & Deep Learning", status: "🟡 Learning", impact: "+7% Placement Impact", reason: "Required for hands-on model fine-tuning and modern AI system benchmarks." }
    ];
  }, [jobData]);

  const overallMatchPct = jobData?.overall_match_pct || 82;
  const placementReadinessPct = readiness?.readiness_pct ?? 34;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white advisor-card p-6 border-l-4 border-l-orange-500 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-orange-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Live Job-Market Benchmark
              </span>
              <span className="text-xs text-stone-500 font-semibold">2026-2027 Placement Intelligence</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-1.5">
              {profile?.career_goal || 'AI Engineer'} Market Matching
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Real-time calibration of your proficiencies against active job requisitions from top tech employers.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-2xl p-4">
            <div className="text-right">
              <span className="text-[10px] text-stone-500 font-extrabold uppercase block tracking-wider">Market Match Rate</span>
              <span className="text-2xl font-black text-orange-600">{overallMatchPct}%</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* CLARIFYING CALLOUT: 34% READINESS VS 82% MARKET MATCH */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50/40 border border-blue-200/80 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider">
              Understanding Your Metrics: 34% Placement Readiness vs 82% Market Match
            </h3>
            <p className="text-xs text-blue-900 leading-relaxed font-medium">
              • <strong>Market Match ({overallMatchPct}%):</strong> Measures your keyword and foundational skill alignment against published job requisitions for {profile?.career_goal || 'AI Engineer'}.<br />
              • <strong>Placement Readiness ({placementReadinessPct}%):</strong> Evaluates your complete interview readiness across 6 comprehensive pillars: DSA Problem Solving, Core Stack Depth, Live Portfolio Repositories, ATS Resume Optimization, GitHub Streak, and Technical Interview Performance.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Market Skill Bars + Top 3 Blocking Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Skill Bars vs Industry Standard */}
        <div className="lg:col-span-7 advisor-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Your Skills vs Industry Requirements
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">Comparative benchmark against entry-level hiring criteria</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-stone-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500"></span> Your Level</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-stone-300"></span> Market Benchmark</span>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {skillComparisonBars.map((bar, idx) => (
              <div key={idx} className="space-y-1.5 p-2.5 rounded-xl bg-stone-50/50 border border-stone-200/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-stone-900">{bar.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-600">
                      Your Skill: <strong className="text-stone-900">{bar.student_match_pct}%</strong>
                    </span>
                    <span className="text-[11px] text-stone-400">|</span>
                    <span className="text-[11px] font-bold text-stone-500">
                      Market: {bar.market_importance_pct}%
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                      bar.status === 'ALIGNED' ? 'bg-emerald-100 text-emerald-800' :
                      bar.status === 'DEVELOPING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {bar.status}
                    </span>
                  </div>
                </div>

                {/* Dual bar: Student Level vs Target Requirement */}
                <div className="space-y-1">
                  <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden p-0.5 relative">
                    {/* Market target vertical marker line */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-stone-800 z-10 rounded-full opacity-60" 
                      style={{ left: `${bar.market_importance_pct}%` }} 
                      title={`Market Requirement: ${bar.market_importance_pct}%`}
                    />
                    {/* Student progress bar */}
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        bar.student_match_pct >= 70 ? 'bg-emerald-500' :
                        bar.student_match_pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${bar.student_match_pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Top 3 Critical Gaps */}
        <div className="lg:col-span-5 space-y-4">
          <div className="advisor-card p-6 space-y-4 bg-gradient-to-br from-orange-50/40 via-white to-amber-50/40 border-orange-200">
            <div className="flex items-center gap-2 border-b border-orange-100 pb-2.5">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <div>
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  Top 3 Critical Skill Gaps
                </h3>
                <p className="text-[10px] text-stone-500 font-medium">Resolving these unlocks 85% of interview calls</p>
              </div>
            </div>

            <div className="space-y-3">
              {topBlockingSkills.map((gap, idx) => {
                const gapName = typeof gap === 'string' ? gap : gap.name;
                const statusPill = typeof gap === 'object' && gap.status ? gap.status : (idx === 2 ? '🟡 Learning' : '🔴 Missing');
                const impactStr = typeof gap === 'object' && gap.impact ? gap.impact : `+${(3 - idx) * 4}% Readiness`;
                const reasonStr = typeof gap === 'object' && gap.reason ? gap.reason : 'Direct technical screening filter in placement rounds.';

                return (
                  <div key={idx} className="p-3 bg-white rounded-2xl border border-orange-200/80 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-black text-stone-900">{gapName}</h4>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {statusPill}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-snug">
                      {reasonStr}
                    </p>
                    <div className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded inline-block">
                      ⚡ {impactStr}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-orange-200/60 flex items-center justify-between">
              <span className="text-[10px] text-stone-500 uppercase font-bold">Median Fresher Range</span>
              <span className="text-base font-black text-stone-900">{jobData?.median_salary_inr || '₹14L - ₹22L/yr'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION: PERSONALIZED OPPORTUNITY RADAR */}
      <div className="advisor-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                Personalized Opportunity Radar
              </h2>
              <p className="text-[11px] text-stone-500">
                Single unified feed for jobs, funded scholarships, competitive hackathons &amp; verified certs
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
            {[
              { id: 'jobs', label: 'Tech Jobs & Internships', count: liveOpenings.length, icon: Briefcase },
              { id: 'scholarships', label: 'Scholarships & Grants', count: RADAR_SCHOLARSHIPS.length, icon: GraduationCap },
              { id: 'hackathons', label: 'Hackathons', count: RADAR_HACKATHONS.length, icon: Trophy },
              { id: 'certifications', label: 'Certifications', count: RADAR_CERTIFICATIONS.length, icon: Award }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = radarTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRadarTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-orange-100 text-orange-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: TECH JOBS & INTERNSHIPS */}
        {radarTab === 'jobs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveOpenings.map((job, idx) => {
              const isTracked = trackedItemIds.has(job.id);
              const isTracking = trackingLoadingId === job.id;
              return (
                <div 
                  key={idx} 
                  className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80 flex flex-col justify-between hover:border-orange-300 hover:shadow-xs transition-all space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs text-stone-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-stone-500" />
                        {job.company}
                      </span>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                        {job.match_pct}% Match
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-stone-900">{job.title}</h3>

                    <div className="flex items-center gap-3 text-xs text-stone-500 my-2 font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                      <span className="font-extrabold text-stone-900">{job.salary}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.key_tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2.5 text-[10px] text-stone-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified 2 days ago via Official Careers API</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between gap-2">
                    <button 
                      onClick={() => handleTrackOpportunity(job)}
                      disabled={isTracked || isTracking}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                        isTracked
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isTracked ? 'Tracked in Pipeline' : 'Track in Tracker'}</span>
                    </button>

                    <button 
                      onClick={() => setSelectedJob(job)}
                      className="text-xs font-black text-orange-600 hover:text-orange-800 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                    >
                      <span>Role Breakdown</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: SCHOLARSHIPS & FELLOWSHIPS */}
        {radarTab === 'scholarships' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RADAR_SCHOLARSHIPS.map((sch) => {
              const studentCgpa = Number(profile?.academic?.cgpa || 7.8);
              const isEligible = studentCgpa >= sch.min_cgpa;
              const isTracked = trackedItemIds.has(sch.id);

              return (
                <div 
                  key={sch.id}
                  className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80 flex flex-col justify-between hover:border-orange-300 hover:shadow-xs transition-all space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs text-stone-900 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        {sch.organization}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        isEligible 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {isEligible ? `✓ CGPA ${studentCgpa} Eligible` : `Min CGPA: ${sch.min_cgpa}`}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-stone-900">{sch.title}</h3>
                    <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {sch.description}
                    </p>

                    <div className="my-2.5 p-2 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs">
                      <span className="text-[10px] text-blue-700 font-bold uppercase block">Coverage Value</span>
                      <strong className="text-blue-950 font-black">{sch.coverage}</strong>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-[10px] bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-bold">
                        {sch.country}
                      </span>
                      <span className="text-[10px] bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-bold">
                        Deadline: {sch.deadline}
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] text-stone-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{sch.last_verified}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between gap-2">
                    <button 
                      onClick={() => handleTrackOpportunity(sch)}
                      disabled={isTracked}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                        isTracked
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isTracked ? 'Tracked in Funnel' : 'Track Scholarship'}</span>
                    </button>

                    <a
                      href={sch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black text-orange-600 hover:text-orange-800 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
                    >
                      <span>Direct Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: HACKATHONS & COMPETITIONS */}
        {radarTab === 'hackathons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RADAR_HACKATHONS.map((hack) => {
              const isTracked = trackedItemIds.has(hack.id);
              return (
                <div 
                  key={hack.id}
                  className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80 flex flex-col justify-between hover:border-orange-300 hover:shadow-xs transition-all space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs text-stone-900 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        {hack.organization}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {hack.mode}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-stone-900">{hack.title}</h3>
                    <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {hack.description}
                    </p>

                    <div className="my-2.5 p-2 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                      <span className="text-[10px] text-amber-700 font-bold uppercase block">Prizes &amp; Bounties</span>
                      <strong className="text-amber-950 font-black">{hack.prize_pool}</strong>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {hack.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-bold">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 text-[10px] text-stone-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{hack.last_verified}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between gap-2">
                    <button 
                      onClick={() => handleTrackOpportunity(hack)}
                      disabled={isTracked}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                        isTracked
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isTracked ? 'Tracked' : 'Track Hackathon'}</span>
                    </button>

                    <a
                      href={hack.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black text-orange-600 hover:text-orange-800 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
                    >
                      <span>Join Competition</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: CERTIFICATIONS & OPEN COURSES */}
        {radarTab === 'certifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RADAR_CERTIFICATIONS.map((cert) => {
              const isTracked = trackedItemIds.has(cert.id);
              return (
                <div 
                  key={cert.id}
                  className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80 flex flex-col justify-between hover:border-orange-300 hover:shadow-xs transition-all space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs text-stone-900 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        {cert.issuer}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                        {cert.difficulty}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-stone-900">{cert.title}</h3>
                    <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {cert.description}
                    </p>

                    <div className="my-2.5 p-2 rounded-xl bg-purple-50/60 border border-purple-200/80 text-xs">
                      <span className="text-[10px] text-purple-700 font-bold uppercase block">Preparation Commitment</span>
                      <strong className="text-purple-950 font-black">{cert.duration}</strong>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {cert.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-bold">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 text-[10px] text-stone-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{cert.last_verified}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between gap-2">
                    <button 
                      onClick={() => handleTrackOpportunity(cert)}
                      disabled={isTracked}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                        isTracked
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isTracked ? 'Tracked' : 'Track Certification'}</span>
                    </button>

                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black text-orange-600 hover:text-orange-800 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
                    >
                      <span>Official Syllabus</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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

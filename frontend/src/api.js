// API Client with Auth and Advanced Simulation Engines
const rawApiBase = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = rawApiBase ? (rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase.replace(/\/$/, '')}/api`) : '/api';


export const authState = {
  getToken: () => localStorage.getItem('advisor_auth_token') || '',
  setToken: (token) => localStorage.setItem('advisor_auth_token', token),
  clearToken: () => localStorage.removeItem('advisor_auth_token'),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('advisor_user') || 'null');
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('advisor_user', JSON.stringify(user)),
  clearUser: () => localStorage.removeItem('advisor_user'),
};

const authFetch = async (url, options = {}) => {
  const token = authState.getToken();
  const headers = {
    ...(options.headers || {}),
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/reset-password') || url.includes('/auth/setup-profile');
    if (res.status === 401 && !isAuthAttempt) {
      authState.clearToken();
      authState.clearUser();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:expired', { detail: { status: 401 } }));
      }
    }
    const errorData = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(errorData.detail || `HTTP Error ${res.status}`);
  }
  return res.json();
};

export const api = {
  // Auth
  login: async (email, password) => {
    const data = await authFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authState.setToken(data.token);
    authState.setUser(data.profile);
    return data;
  },
  setupProfile: async (setupPayload) => {
    const data = await authFetch(`${API_BASE}/auth/setup-profile`, {
      method: 'POST',
      body: JSON.stringify(setupPayload),
    });
    authState.setToken(data.token);
    authState.setUser(data.profile);
    return data;
  },
  register: async (registerPayload) => {
    const data = await authFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(registerPayload),
    });
    authState.setToken(data.token);
    authState.setUser(data.profile);
    return data;
  },
  resetPassword: async (email, new_password) => {
    const data = await authFetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ email, new_password }),
    });
    if (data.token) {
      authState.setToken(data.token);
      authState.setUser(data.profile);
    }
    return data;
  },
  getMe: async () => {
    const profile = await authFetch(`${API_BASE}/auth/me`);
    authState.setUser(profile);
    return profile;
  },
  logout: async () => {
    try {
      await authFetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch {}
    authState.clearToken();
    authState.clearUser();
  },

  // Profile
  getProfile: async () => {
    return authFetch(`${API_BASE}/profile`);
  },
  updateProfile: async (profile) => {
    const updated = await authFetch(`${API_BASE}/profile`, {
      method: 'POST',
      body: JSON.stringify(profile),
    });
    authState.setUser(updated);
    return updated;
  },
  resetProfile: async (payload = { confirm_phrase: 'RESET' }) => {
    const res = await authFetch(`${API_BASE}/profile/reset`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.updated_profile) {
      authState.setUser(res.updated_profile);
    }
    return res;
  },
  changeTargetRole: async (targetRole) => {
    return authFetch(`${API_BASE}/career/target-role`, {
      method: 'POST',
      body: JSON.stringify({ target_role: targetRole }),
    });
  },
  recordProjectEvidence: async (evidence) => {
    return authFetch(`${API_BASE}/career/projects/record-evidence`, {
      method: 'POST',
      body: JSON.stringify(evidence),
    });
  },

  // 1. What-If Career Simulator
  simulateWhatIf: async (params) => {
    return authFetch(`${API_BASE}/simulation/what-if`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // 2. Placement Factor Breakdown
  getPlacementBreakdown: async () => {
    return authFetch(`${API_BASE}/simulation/placement-breakdown`);
  },

  // 3. Skill Dependency Graph
  getSkillGraph: async () => {
    return authFetch(`${API_BASE}/simulation/skill-graph`);
  },

  // 4. Job Market Benchmark
  getJobMarket: async () => {
    return authFetch(`${API_BASE}/simulation/job-market`);
  },

  // 5. AI Resume Analyzer
  analyzeResume: async (resumeText) => {
    return authFetch(`${API_BASE}/simulation/resume-analyzer`, {
      method: 'POST',
      body: JSON.stringify({ resume_text: resumeText }),
    });
  },

  // 6. Project Blueprints
  getProjectBlueprints: async () => {
    return authFetch(`${API_BASE}/simulation/project-blueprints`);
  },

  // 7. Should I Buy This? Quick Checker
  checkPurchase: async (itemName, cost, urgency = 'LOW') => {
    return authFetch(`${API_BASE}/finance/should-i-buy`, {
      method: 'POST',
      body: JSON.stringify({ item_name: itemName, cost_inr: cost, urgency }),
    });
  },

  // 8. Weekly AI Career Review
  getWeeklyReview: async () => {
    return authFetch(`${API_BASE}/progress/weekly-review`);
  },

  // Career Engine
  getDegreeCatalogue: async () => {
    return authFetch(`${API_BASE}/career/degree-catalogue`);
  },
  getAvailableRoles: async () => {
    return authFetch(`${API_BASE}/career/available-roles`);
  },
  getReadiness: async () => {
    return authFetch(`${API_BASE}/career/readiness`);
  },
  getRecommendations: async () => {
    return authFetch(`${API_BASE}/career/recommendations`);
  },
  getSkillGaps: async (targetRole) => {
    const url = targetRole ? `${API_BASE}/career/skill-gaps?target_role=${encodeURIComponent(targetRole)}` : `${API_BASE}/career/skill-gaps`;
    return authFetch(url);
  },
  getRoadmap: async () => {
    return authFetch(`${API_BASE}/career/roadmap`);
  },
  getProjects: async () => {
    return authFetch(`${API_BASE}/career/projects`);
  },

  // Finance Engine
  getBudgetAnalysis: async () => {
    return authFetch(`${API_BASE}/finance/budget-analysis`);
  },
  getCertificationAffordability: async (certName, cost, examMonths) => {
    const params = new URLSearchParams({
      cert_name: certName || 'AWS Certified Solutions Architect',
      cost_inr: cost || 10000,
      exam_target_months: examMonths || 4
    });
    return authFetch(`${API_BASE}/finance/certification-affordability?${params}`);
  },
  getCourses: async (topic = 'Deep Learning') => {
    return authFetch(`${API_BASE}/finance/courses?topic=${encodeURIComponent(topic)}`);
  },

  // Decision Engine
  evaluateDecision: async (scenario) => {
    return authFetch(`${API_BASE}/decision/evaluate`, {
      method: 'POST',
      body: JSON.stringify(scenario),
    });
  },

  // Progress Engine
  getDailyPlan: async () => {
    return authFetch(`${API_BASE}/progress/daily-plan`);
  },
  toggleTask: async (taskId) => {
    return authFetch(`${API_BASE}/progress/toggle-task/${taskId}`, { method: 'POST' });
  },
  updateProgress: async (skillUpdates, completedTaskIds) => {
    return authFetch(`${API_BASE}/progress/update`, {
      method: 'POST',
      body: JSON.stringify({ skill_updates: skillUpdates, completed_task_ids: completedTaskIds || [] }),
    });
  },

  // AI Service
  parseIntent: async (text) => {
    return authFetch(`${API_BASE}/ai/parse-intent`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },
  chatWithCopilot: async (message) => {
    return authFetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Wealth, Investment & Smart Savings Hub
  getWealthHub: async () => {
    return authFetch(`${API_BASE}/wealth/hub`);
  },
  getCuratedAssets: async () => {
    return authFetch(`${API_BASE}/wealth/curated-assets`);
  },
  executeTrade: async (assetId, action, amountInr) => {
    return authFetch(`${API_BASE}/wealth/trade`, {
      method: 'POST',
      body: JSON.stringify({ asset_id: assetId, action, amount_inr: amountInr }),
    });
  },
  createSavingsGoal: async (goalData) => {
    return authFetch(`${API_BASE}/wealth/goals/create`, {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },
  depositSavingsGoal: async (goalId, amountInr) => {
    return authFetch(`${API_BASE}/wealth/goals/deposit`, {
      method: 'POST',
      body: JSON.stringify({ goal_id: goalId, amount_inr: amountInr }),
    });
  },
  toggleSavingRule: async (ruleKey, active) => {
    return authFetch(`${API_BASE}/wealth/saving-rules/toggle`, {
      method: 'POST',
      body: JSON.stringify({ rule_key: ruleKey, active }),
    });
  },
  getWealthReadiness: async () => {
    return authFetch(`${API_BASE}/wealth/readiness`);
  },
  evaluateRiskProfile: async (riskData) => {
    return authFetch(`${API_BASE}/wealth/risk-assessment`, {
      method: 'POST',
      body: JSON.stringify(riskData),
    });
  },
  simulateSip: async (monthlyInr, years, expectedCagr) => {
    return authFetch(`${API_BASE}/wealth/sip-simulator`, {
      method: 'POST',
      body: JSON.stringify({ monthly_investment_inr: monthlyInr, duration_years: years, expected_cagr_pct: expectedCagr }),
    });
  },
  evaluateOpportunityCost: async (amountInr, course) => {
    return authFetch(`${API_BASE}/wealth/opportunity-cost`, {
      method: 'POST',
      body: JSON.stringify({ amount_inr: amountInr, candidate_course: course }),
    });
  },
  detectInvestmentScam: async (pitchText, platformName) => {
    return authFetch(`${API_BASE}/wealth/scam-detector`, {
      method: 'POST',
      body: JSON.stringify({ pitch_text: pitchText, platform_name: platformName || 'Telegram/WhatsApp' }),
    });
  },
  get5YearDigitalTwin: async () => {
    return authFetch(`${API_BASE}/wealth/digital-twin`);
  },
  getMultiCompanyBaskets: async (amountInr = 2000) => {
    return authFetch(`${API_BASE}/wealth/multi-company-baskets?amount_inr=${amountInr}`);
  },
  getCompanyChart: async (ticker, timeframe = '6M') => {
    return authFetch(`${API_BASE}/wealth/company-chart/${encodeURIComponent(ticker)}?timeframe=${encodeURIComponent(timeframe)}`);
  },
  executeUpiPayment: async (payload) => {
    return authFetch(`${API_BASE}/wealth/upi-pay`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getWealthTransactions: async () => {
    return authFetch(`${API_BASE}/wealth/transactions`);
  },

  // REAL LIVE MARKET DATA (NSE / BSE)
  getLiveMarketOverview: async () => {
    return authFetch(`${API_BASE}/market/overview`);
  },
  getLiveMarketQuote: async (symbol) => {
    return authFetch(`${API_BASE}/market/quote/${encodeURIComponent(symbol)}`);
  },
  getLiveMarketChart: async (symbol, interval = '5m') => {
    return authFetch(`${API_BASE}/market/chart/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}`);
  },
  searchMarketSymbols: async (query) => {
    return authFetch(`${API_BASE}/market/search?query=${encodeURIComponent(query)}`);
  },

  // REGULATED BROKER GATEWAY & REAL PORTFOLIO
  getBrokerStatus: async () => {
    return authFetch(`${API_BASE}/broker/status`);
  },
  connectBroker: async (brokerName, accountId, authToken = null) => {
    return authFetch(`${API_BASE}/broker/connect`, {
      method: 'POST',
      body: JSON.stringify({
        broker_name: brokerName,
        account_id: accountId,
        auth_code_or_token: authToken,
        is_sandbox: false
      }),
    });
  },
  getAiStockRecommendations: async () => {
    return authFetch(`${API_BASE}/wealth/ai-stock-recommendations`);
  },
  disconnectBroker: async () => {
    return authFetch(`${API_BASE}/broker/disconnect`, { method: 'POST' });
  },
  getBrokerPortfolio: async () => {
    return authFetch(`${API_BASE}/broker/portfolio`);
  },
  placeBrokerOrder: async (orderPayload) => {
    return authFetch(`${API_BASE}/broker/order`, {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },
  getBrokerOrders: async () => {
    return authFetch(`${API_BASE}/broker/orders`);
  },

  // SAFE NPCI UPI MANDATE FLOW
  createUpiMandate: async (amountInr, vpa, purpose = 'BROKER_MARGIN_DEPOSIT') => {
    return authFetch(`${API_BASE}/payment/upi-mandate/create`, {
      method: 'POST',
      body: JSON.stringify({ amount_inr: amountInr, vpa, purpose }),
    });
  },
  approveUpiMandate: async (mandateRef) => {
    return authFetch(`${API_BASE}/payment/upi-mandate/approve/${encodeURIComponent(mandateRef)}`, {
      method: 'POST',
    });
  },

  // REAL AI WEALTH COPILOT AUDIT
  getRealAiWealthAudit: async () => {
    return authFetch(`${API_BASE}/wealth/ai-audit`);
  },

  // ORDER LIFECYCLE & CATEGORIZED SUMMARY
  getBrokerOrdersSummary: async () => {
    return authFetch(`${API_BASE}/broker/orders/summary`);
  },

  // FLAGSHIP CAREER ROI VS INVESTMENT ROI COMPARISON
  compareCareerVsInvestment: async (capitalAmount = 10000, certName = 'AWS Solutions Architect / Deep Learning Spec', certCost = 10000) => {
    return authFetch(`${API_BASE}/career/career-vs-investment`, {
      method: 'POST',
      body: JSON.stringify({
        capital_amount: capitalAmount,
        certification_or_course_name: certName,
        certification_cost: certCost
      }),
    });
  },

  // RESUME PDF UPLOAD
  uploadResumePdf: async (formData) => {
    return authFetch(`${API_BASE}/resume/upload-pdf`, {
      method: 'POST',
      body: formData,
    });
  },

  // JOB APPLICATION FUNNEL PIPELINE
  getJobApplications: async () => {
    return authFetch(`${API_BASE}/jobs/applications`);
  },
  createJobApplication: async (payload) => {
    return authFetch(`${API_BASE}/jobs/applications`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateJobApplication: async (appId, payload) => {
    return authFetch(`${API_BASE}/jobs/applications/${encodeURIComponent(appId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteJobApplication: async (appId) => {
    return authFetch(`${API_BASE}/jobs/applications/${encodeURIComponent(appId)}`, {
      method: 'DELETE',
    });
  },
  getJobFunnelAnalytics: async () => {
    return authFetch(`${API_BASE}/jobs/application-analytics`);
  },

  // FINANCIAL SAFETY RESILIENCE CENTER
  getFinancialSafety: async () => {
    return authFetch(`${API_BASE}/wealth/financial-safety`);
  },
  getFinancialHealth: async () => {
    return authFetch(`${API_BASE}/wealth/financial-health`);
  },

  // NOTIFICATIONS & GAMIFICATION
  getNotifications: async () => {
    return authFetch(`${API_BASE}/notifications`);
  },
  getGamificationStatus: async () => {
    return authFetch(`${API_BASE}/gamification/status`);
  },

  // SESSION & DEVICE MANAGEMENT
  logout: async () => {
    return authFetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  },
  logoutAll: async () => {
    return authFetch(`${API_BASE}/auth/logout-all`, { method: 'POST' });
  },
  getSessions: async () => {
    return authFetch(`${API_BASE}/auth/sessions`);
  },

  // STUDY ABROAD & MASTERS COPILOT
  getStudyAbroadOverview: async () => {
    return authFetch(`${API_BASE}/study-abroad/overview`);
  },
  updateStudyAbroadSelection: async (targetCountries, targetProgram, targetIntake) => {
    return authFetch(`${API_BASE}/study-abroad/selection`, {
      method: 'POST',
      body: JSON.stringify({
        target_countries: targetCountries,
        target_program: targetProgram,
        target_intake: targetIntake
      })
    });
  },
  updateStudyAbroadChecklist: async (universityId, checklistKey, completed) => {
    return authFetch(`${API_BASE}/study-abroad/checklist`, {
      method: 'POST',
      body: JSON.stringify({
        university_id: universityId,
        checklist_key: checklistKey,
        completed: completed
      })
    });
  },
  generateSopLor: async (payload) => {
    return authFetch(`${API_BASE}/study-abroad/generate-sop-lor`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // ADVANCED EXAM PREPARATION ENGINE
  generatePracticeSet: async (payload) => {
    return authFetch(`${API_BASE}/study-abroad/exam/generate-set`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  submitPracticeSet: async (payload) => {
    return authFetch(`${API_BASE}/study-abroad/exam/submit-set`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  startMockExam: async (payload) => {
    return authFetch(`${API_BASE}/study-abroad/exam/mock/start`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  submitMockExam: async (payload) => {
    return authFetch(`${API_BASE}/study-abroad/exam/mock/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getExamAnalytics: async (exam = 'GRE') => {
    return authFetch(`${API_BASE}/study-abroad/exam/analytics?exam=${encodeURIComponent(exam)}`);
  },
  getMistakeBank: async (exam = 'GRE', topic = null) => {
    let url = `${API_BASE}/study-abroad/exam/mistake-bank?exam=${encodeURIComponent(exam)}`;
    if (topic && topic !== 'All') url += `&topic=${encodeURIComponent(topic)}`;
    return authFetch(url);
  },
  resolveMistake: async (questionId) => {
    return authFetch(`${API_BASE}/study-abroad/exam/resolve-mistake/${encodeURIComponent(questionId)}`, {
      method: 'POST',
    });
  },
  evaluateWriting: async (payload) => {
    return authFetch(`${API_BASE}/study-abroad/exam/evaluate-writing`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  evaluateSpeaking: async (payload) => {
    return authFetch(`${API_BASE}/study-abroad/exam/evaluate-speaking`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getMastersReadinessScore: async () => {
    return authFetch(`${API_BASE}/study-abroad/exam/readiness-score`);
  },
  getStudyAbroadPrepBudget: async () => {
    return authFetch(`${API_BASE}/study-abroad/exam/prep-budget`);
  },
  getPreviousYearPapers: async (exam = null, year = null) => {
    let url = `${API_BASE}/study-abroad/exam/previous-papers?`;
    if (exam && exam !== 'ALL') url += `exam=${encodeURIComponent(exam)}&`;
    if (year) url += `year=${encodeURIComponent(year)}&`;
    return authFetch(url);
  },
  getPreviousYearPaperById: async (paperId) => {
    return authFetch(`${API_BASE}/study-abroad/exam/previous-papers/${encodeURIComponent(paperId)}`);
  },
  getQuestionBankStats: async () => {
    return authFetch(`${API_BASE}/study-abroad/exam/question-bank-stats`);
  },

  // Student Intelligence & Learning Decay
  getDigitalTwin: async () => {
    return authFetch(`${API_BASE}/student-intelligence/digital-twin`);
  },
  completeStudentAction: async (actionId, actionType, metadata = {}) => {
    return authFetch(`${API_BASE}/student-intelligence/complete-action`, {
      method: 'POST',
      body: JSON.stringify({ action_id: actionId, action_type: actionType, metadata }),
    });
  },
  getLearningDecayStatus: async () => {
    return authFetch(`${API_BASE}/learning-decay/status`);
  },
  reviewDecayConcept: async (conceptName, performanceScore = 1.0) => {
    return authFetch(`${API_BASE}/learning-decay/review-concept`, {
      method: 'POST',
      body: JSON.stringify({ concept_name: conceptName, performance_score: performanceScore }),
    });
  },
  getConceptQuiz: async (conceptName) => {
    return authFetch(`${API_BASE}/learning-decay/quiz/${encodeURIComponent(conceptName)}`);
  },
  submitConceptQuiz: async (payload) => {
    return authFetch(`${API_BASE}/learning-decay/quiz/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getMockInterviewQuestions: async (role = '') => {
    return authFetch(`${API_BASE}/career/mock-interview/questions?role=${encodeURIComponent(role)}`);
  },
  evaluateMockInterview: async (payload) => {
    return authFetch(`${API_BASE}/career/mock-interview/evaluate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  exportUserData: async () => {
    return authFetch(`${API_BASE}/profile/export`);
  },
  getUserResumeData: async () => {
    return authFetch(`${API_BASE}/resume/data`);
  },
  addProjectToResume: async (title, techStack, metrics) => {
    return authFetch(`${API_BASE}/resume/add-project`, {
      method: 'POST',
      body: JSON.stringify({ title, tech_stack: techStack, metrics }),
    });
  }
};




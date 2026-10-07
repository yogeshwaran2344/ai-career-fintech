from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import date

class AcademicProfile(BaseModel):
    degree: str = "B.Tech"
    branch: str = "AI & ML"
    year: str = "3rd Year"
    college: Optional[str] = "Indian Institute of Technology / NIT / University"
    cgpa: float = 8.2

class SkillItem(BaseModel):
    name: str
    level: str = "Beginner"  # Beginner, Intermediate, Advanced
    proficiency: float = 5.0  # 0 to 10
    category: Optional[str] = "General"

class FinancialProfile(BaseModel):
    monthly_income: float = 15000.0
    food: float = 4000.0
    travel: float = 2000.0
    entertainment: float = 1500.0
    other: float = 2500.0
    available_for_learning: float = 2000.0
    savings: float = 3000.0
    emergency_buffer: float = 2000.0

class PreferencesProfile(BaseModel):
    preferred_learning_style: str = "Video"  # Video, Hands-on / Projects, Reading, Hybrid
    study_hours_per_day: float = 2.0
    target_placement_year: int = 2027
    free_text_intent: Optional[str] = "I want to work in AI but I'm not sure whether I should learn data science or ML engineering."

class StudentProfile(BaseModel):
    id: str = "user-init"
    name: str = "Student"
    email: Optional[str] = None
    avatar: Optional[str] = "🎓"
    career_goal: str = "AI Engineer"
    academic: AcademicProfile = Field(default_factory=AcademicProfile)
    skills: List[SkillItem] = Field(default_factory=list)
    financial: FinancialProfile = Field(default_factory=FinancialProfile)
    preferences: PreferencesProfile = Field(default_factory=PreferencesProfile)
    # Gamification
    streak_days: int = 1
    total_xp: int = 50
    user_level: int = 1
    level_title: str = "Foundation Starter"
    badges: List[str] = Field(default_factory=lambda: ["🌱 Welcome Badge"])


class ProfileSetupRequest(BaseModel):
    name: str
    email: Optional[str] = None
    password: Optional[str] = None
    avatar: Optional[str] = "👨‍💻"
    career_goal: str = "AI Engineer"
    academic: AcademicProfile = Field(default_factory=AcademicProfile)
    skills: List[SkillItem] = Field(default_factory=list)
    financial: FinancialProfile = Field(default_factory=FinancialProfile)
    preferences: PreferencesProfile = Field(default_factory=PreferencesProfile)

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    avatar: Optional[str] = "👨‍💻"
    career_goal: str = "AI Engineer"
    academic: AcademicProfile = Field(default_factory=AcademicProfile)
    skills: List[SkillItem] = Field(default_factory=list)
    financial: FinancialProfile = Field(default_factory=FinancialProfile)
    preferences: PreferencesProfile = Field(default_factory=PreferencesProfile)

class UserLoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user_id: str
    name: str
    email: str
    profile: StudentProfile
    
class SkillGapItem(BaseModel):
    skill: str
    required_level: str
    current_level: str
    status: str  # "MASTERED", "IN_PROGRESS", "MISSING"
    importance: str  # "HIGH", "MEDIUM", "LOW"
    category: str

class CareerMatch(BaseModel):
    role: str
    match_percentage: int
    readiness_score: float
    badge: str
    description: str
    why_recommended: str
    salary_range_inr: str
    strong_skills: List[str]
    missing_skills: List[str]
    partial_skills: List[str]

# 1. Career Simulation "What-If"
class SimulationRequest(BaseModel):
    study_hours_per_day: float = 3.0
    monthly_budget: float = 2000.0
    target_role: Optional[str] = "AI Engineer"
    skill_boosts: Dict[str, float] = {}
    invest_course_cost: Optional[float] = None
    invest_course_name: Optional[str] = None

class SimulationResponse(BaseModel):
    scenario_label: str
    current_readiness_pct: int
    projected_1m_pct: int
    projected_3m_pct: int
    projected_6m_pct: int
    readiness_gain_pct: int
    estimated_months_to_ready: int
    financial_stress: str  # "LOW", "MEDIUM", "HIGH"
    recommendation_stars: int
    strategic_verdict: str
    course_investment_analysis: Optional[Dict[str, Any]] = None

# 2. Placement Readiness Detailed Breakdown
class PlacementFactor(BaseModel):
    name: str
    score: int
    max_score: int = 100
    status: str
    impact: str

class PlacementReadinessBreakdown(BaseModel):
    overall_placement_score: int
    tier_classification: str
    factors: List[PlacementFactor]
    bottleneck_analysis: str
    top_actions_to_boost: List[str]

# 3. Skill Dependency Graph
class SkillGraphNode(BaseModel):
    id: str
    label: str
    category: str
    status: str  # "MASTERED", "LEARNING", "MISSING"
    proficiency: float
    importance: str
    prerequisites: List[str] = []

class SkillGraphEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None

class SkillGraphData(BaseModel):
    nodes: List[SkillGraphNode]
    edges: List[SkillGraphEdge]

# 4. Job Market Benchmark
class MarketSkillBar(BaseModel):
    skill: str
    student_match_pct: int
    market_importance_pct: int
    status: str

class JobRequirementSkill(BaseModel):
    skill: str
    required_level: str
    student_level: str
    status: str  # "MATCHED", "DEVELOPING", "GAP"

class JobOpeningRequirementDetail(BaseModel):
    eligibility_criteria: List[str]
    required_skills: List[JobRequirementSkill]
    interview_rounds: List[str]
    day_to_day_responsibilities: List[str]
    sample_interview_questions: List[str]
    recruiter_tip: str
    expected_work_mode: str
    mock_apply_link: str

class JobMarketOpening(BaseModel):
    id: Optional[str] = None
    company: str
    title: str
    location: str
    salary: str
    match_pct: int
    key_tags: List[str]
    requirements_detail: Optional[JobOpeningRequirementDetail] = None

class JobMarketData(BaseModel):
    role: str
    overall_match_pct: int
    market_demand: str
    median_salary_inr: str
    market_skill_bars: List[MarketSkillBar]
    top_blocking_skills: List[str]
    live_openings: List[JobMarketOpening]

# 5. AI Resume Analyzer
class ResumeAnalyzeRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None

class ResumeBulletImprovement(BaseModel):
    original: str
    improved: str
    rationale: str

class ResumeAnalysisResponse(BaseModel):
    overall_resume_score: int
    ats_compatibility_pct: int
    technical_skills_score: int
    projects_score: int
    impact_statements_score: int
    missing_keywords: List[str]
    bullet_improvements: List[ResumeBulletImprovement]
    action_recommendations: List[str]

class RecommendedProject(BaseModel):
    id: Optional[str] = "proj-1"
    title: str
    tagline: Optional[str] = None
    difficulty: str = "Intermediate"
    estimated_hours: int = 25
    skills_covered: Optional[List[str]] = None
    skills_learned: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    architecture_overview: Optional[str] = None
    portfolio_impact: Optional[str] = None
    description: Optional[str] = None
    roi_score: Optional[str] = "9/10"
    resume_bullet: Optional[str] = None
    github_starter: Optional[str] = None

# 6. Detailed Project Blueprint
class ProjectMilestoneWeek(BaseModel):
    week_number: int
    title: str
    deliverables: List[str]

class DetailedProjectBlueprint(BaseModel):
    id: str
    title: str
    tagline: str
    difficulty: str
    estimated_duration_weeks: int
    estimated_cost_inr: str
    skills_gained: List[str]
    weekly_schedule: List[ProjectMilestoneWeek]
    github_checklist: List[str]
    architecture_overview: str
    recruiter_talking_points: List[str]

# 7. Financial "Should I Buy This?" Quick Checker
class QuickPurchaseCheckRequest(BaseModel):
    item_name: str
    cost_inr: float
    urgency: str = "LOW"  # "LOW", "MEDIUM", "HIGH"

class QuickPurchaseCheckResponse(BaseModel):
    item_name: str
    cost_inr: float
    verdict: str  # "PROCEED_NOW", "WAIT_AND_SAVE", "AVOID_USE_FREE"
    recommendation_badge: str
    affordability_pct: int
    career_benefit: str
    urgency: str
    months_to_save: float
    financial_impact_warning: str
    better_free_option: str
    action_plan: str

# 8. Weekly AI Career Review
class WeeklyReviewData(BaseModel):
    week_date_range: str
    tasks_completed: str
    study_hours_logged: float
    skill_improvements: List[Dict[str, str]]
    ai_counselor_narrative: str
    next_week_directives: List[str]

# Roadmap & Daily tasks
class RoadmapMilestone(BaseModel):
    title: str
    topics: List[str]
    estimated_hours: int
    key_deliverable: str

class RoadmapMonth(BaseModel):
    month_number: int
    month_title: str
    focus_theme: str
    milestones: List[RoadmapMilestone]
    project_milestone: Optional[str] = None
    target_completion_weeks: int = 4

class LearningRoadmap(BaseModel):
    career_goal: str
    total_months: int = 6
    total_duration_months: Optional[int] = 6
    weekly_commitment_hours: float
    months: List[RoadmapMonth]

class CourseCard(BaseModel):
    id: str
    title: str
    platform: str
    cost_inr: float
    duration_weeks: int
    difficulty: str
    skills_covered: List[str]
    career_relevance_stars: int
    skill_gain_score: float = 5.0
    roi_score: float = 15.0
    is_recommended: bool = False
    verdict: str
    url: str

class CertificationAffordability(BaseModel):
    cert_name: str
    provider: str
    cost_inr: float
    learning_budget_monthly: float
    months_to_save: float
    exam_target_months: int
    affordability_verdict: str
    ai_recommendation: str
    alternative_options: List[str]

class DailyTask(BaseModel):
    id: str
    subject: str
    topic: str
    duration_minutes: int
    action_type: str
    why_today: str
    completed: bool = False

class DailyActionPlan(BaseModel):
    date_str: str
    total_estimated_minutes: int
    available_hours: float
    tasks: List[DailyTask]
    motivational_quote: str

class DecisionEvaluationRequest(BaseModel):
    scenario_type: str
    target_item_name: str
    cost_inr: float
    timeline_months: int
    custom_question: Optional[str] = None

class DecisionEvaluationResponse(BaseModel):
    verdict: str
    headline: str
    career_importance: str
    financial_feasibility: str
    recommended_savings_plan: str
    strategic_advice: str
    action_steps: List[str]

class ProgressUpdatePayload(BaseModel):
    skill_updates: Dict[str, float] = {}
    completed_task_ids: List[str] = []

class LLMIntentAnalysis(BaseModel):
    interpreted_goal: str
    suggested_focus: str
    insights: List[str]
    confidence_score: float

# ==================== WEALTH BUILDER & INVESTMENT ENGINE SCHEMAS ====================

class SafetyGateCheck(BaseModel):
    check_name: str
    passed: bool
    status_text: str
    detail: str

class InvestmentReadinessResponse(BaseModel):
    readiness_status: str  # "FOUNDATION_FIRST", "READY_FOR_MICRO_SIP", "BALANCED_INVESTOR", "CAPITAL_READY"
    readiness_badge: str
    overall_readiness_score: int
    emergency_buffer_score: int
    savings_discipline_score: int
    cash_flow_score: int
    risk_understanding_score: int
    safety_gate_passed: bool
    safety_checks: List[SafetyGateCheck]
    guidance_narrative: str
    max_safe_monthly_sip_inr: float
    current_buffer_months: float

class RiskAssessmentRequest(BaseModel):
    market_drop_reaction: str  # "PANIC_SELL", "WAIT_AND_SEE", "BUY_MORE_DIP"
    investment_horizon: str   # "SHORT_1YR", "MEDIUM_3_5YRS", "LONG_5PLUS_YRS"
    primary_goal: str          # "PRESERVE_CAPITAL", "BALANCED_GROWTH", "AGGRESSIVE_WEALTH"
    emergency_fund_status: str # "NONE", "PARTIAL_1_2M", "COMPLETE_3M_PLUS"

class RiskProfileResponse(BaseModel):
    risk_category: str  # "CONSERVATIVE", "MODERATE_BALANCED", "GROWTH_SEEKER", "AGGRESSIVE"
    risk_score: int     # 0 to 100
    risk_capacity: str  # "LOW", "MEDIUM", "HIGH"
    risk_tolerance: str # "LOW", "MEDIUM", "HIGH"
    investment_horizon_recommendation: str
    recommended_asset_allocation: Dict[str, int]
    explanation: str
    suitable_instruments: List[str]
    instruments_to_avoid: List[str]

class SipSimulatorRequest(BaseModel):
    monthly_investment_inr: float = 1000.0
    duration_years: int = 5
    expected_cagr_pct: float = 12.0

class SipYearMilestone(BaseModel):
    year: int
    invested_amount_inr: float
    estimated_future_value_inr: float
    estimated_wealth_gain_inr: float

class SipSimulationResponse(BaseModel):
    monthly_investment_inr: float
    duration_years: int
    expected_cagr_pct: float
    total_invested_inr: float
    estimated_future_value_inr: float
    estimated_wealth_gain_inr: float
    wealth_multiplier: float
    milestones: List[SipYearMilestone]
    step_up_comparison: List[Dict[str, Any]]
    conservative_moderate_aggressive_scenarios: Dict[str, float]
    regulatory_disclaimer: str

class OpportunityCostRequest(BaseModel):
    amount_inr: float = 2000.0
    candidate_course: Optional[str] = None

class OpportunityCostOption(BaseModel):
    option_id: str
    title: str
    category: str  # "EDUCATION", "EMERGENCY_BUFFER", "MUTUAL_FUND_SIP", "CERTIFICATION"
    immediate_career_impact: str
    immediate_placement_readiness_gain: str
    financial_risk: str
    recommendation_badge: str
    rationale: str

class OpportunityCostResponse(BaseModel):
    amount_inr: float
    primary_winner_id: str
    verdict_headline: str
    ai_strategic_guidance: str
    options: List[OpportunityCostOption]
    tradeoff_summary: str

class ScamCheckRequest(BaseModel):
    pitch_text: str
    platform_name: Optional[str] = "Unknown"

class ScamCheckResponse(BaseModel):
    risk_level: str  # "EXTREME_RISK", "HIGH_RISK", "MODERATE_RISK", "LEGITIMATE_REGULATED"
    risk_badge: str
    safety_score: int  # 0 to 100 (100 = completely safe/regulated)
    red_flags_detected: List[str]
    sebi_regulations_breached: List[str]
    verdict_summary: str
    action_advice: str
    safe_regulated_alternative: str

class DigitalTwinYearRecord(BaseModel):
    year_index: int
    calendar_year: int
    estimated_monthly_income_inr: float
    annual_salary_inr: str
    career_readiness_pct: int
    target_job_role: str
    cumulative_emergency_savings_inr: float
    cumulative_investment_corpus_inr: float
    total_net_worth_inr: float

class DigitalTwinScenario(BaseModel):
    scenario_key: str
    name: str
    tagline: str
    description: str
    year_5_salary: str
    year_5_net_worth: str
    year_5_readiness: int
    records: List[DigitalTwinYearRecord]

class DigitalTwinResponse(BaseModel):
    baseline_career_role: str
    current_readiness_pct: int
    scenarios: List[DigitalTwinScenario]
    ai_comparative_synthesis: str

# ==================== INVESTMENT & SMART SAVINGS HUB ====================

class HistoricalPricePoint(BaseModel):
    date: str
    price: float
    volume_m: Optional[float] = 1.2
    formatted_date: Optional[str] = ""

class CompanyChartData(BaseModel):
    ticker: str
    company_name: str
    category: str
    current_price_inr: float
    change_inr: float
    change_pct: float
    gmp_inr: float
    gmp_pct: float
    gmp_status: str
    gmp_demand_rating: str
    timeframe: str  # "1W", "1M", "3M", "6M", "1Y"
    points: List[HistoricalPricePoint]
    high_price: float
    low_price: float
    moving_average_50d: float
    market_sentiment: str
    near_term_catalysts: str
    why_suggested_for_you: str

class InvestmentAsset(BaseModel):
    id: str
    ticker: str
    name: str
    category: str  # "INDEX_FUND", "FLEXI_CAP", "LIQUID_OVERNIGHT", "STOCK_EQUITY", "ETF_GOLD", "TECH_ETF"
    category_label: str
    expense_ratio_pct: float
    cagr_3y_pct: float
    current_nav_or_price: float
    min_sip_inr: float
    min_lumpsum_inr: float
    risk_rating: str  # "LOW", "MODERATE", "VERY_HIGH"
    risk_badge: str
    student_fit_reason: str
    sebi_amfi_type: str
    popular_badge: Optional[str] = None
    tags: List[str]
    pe_ratio: Optional[float] = 0.0
    market_cap_tier: Optional[str] = "Large Cap"
    ai_growth_score: Optional[float] = 9.0
    expected_6m_return_pct: Optional[float] = 7.5
    expected_1yr_return_pct: Optional[float] = 15.0
    gmp_inr: Optional[float] = 0.0
    gmp_pct: Optional[float] = 0.0
    gmp_status: Optional[str] = "BULLISH_DEMAND"
    gmp_demand_rating: Optional[str] = "High Institutional Accumulation"
    why_suggested_for_you: Optional[str] = ""
    near_term_catalysts: Optional[str] = ""
    key_moat: Optional[str] = ""

class PortfolioHolding(BaseModel):
    asset_id: str
    asset_name: str
    ticker: str
    category: str
    units: float
    avg_buy_price: float
    total_invested_inr: float
    current_value_inr: float
    absolute_return_inr: float
    absolute_return_pct: float
    sip_active: bool
    sip_amount_monthly: float
    last_updated: str

class PortfolioSummary(BaseModel):
    cash_wallet_balance_inr: float
    total_invested_inr: float
    current_portfolio_value_inr: float
    total_returns_inr: float
    total_returns_pct: float
    holdings: List[PortfolioHolding]
    asset_allocation: List[Dict[str, Any]]
    active_sips_count: int
    monthly_sip_outflow_inr: float

class TradeOrderRequest(BaseModel):
    asset_id: str
    action: str  # "BUY_LUMPSUM", "START_SIP", "CANCEL_SIP", "SELL_ALL"
    amount_inr: float = 500.0

class TradeOrderResponse(BaseModel):
    success: bool
    message: str
    transaction_id: str
    portfolio: PortfolioSummary

class SavingsGoal(BaseModel):
    id: str
    title: str
    category: str  # "EMERGENCY_BUFFER", "TECH_HARDWARE", "CLOUD_CREDITS", "CERTIFICATION", "CAREER_WARDROBE", "CUSTOM"
    icon: str
    target_amount_inr: float
    current_amount_inr: float
    target_date: str
    monthly_recommendation_inr: float
    progress_pct: int
    days_remaining: int
    status: str  # "ON_TRACK", "AHEAD", "BEHIND", "COMPLETED"
    suggested_holding_place: str

class CreateSavingsGoalRequest(BaseModel):
    title: str
    category: str
    icon: Optional[str] = "🎯"
    target_amount_inr: float
    target_date: str
    current_amount_inr: Optional[float] = 0.0

class DepositSavingsGoalRequest(BaseModel):
    goal_id: str
    amount_inr: float

class SavingRule(BaseModel):
    rule_key: str
    name: str
    icon: str
    description: str
    frequency: str
    estimated_monthly_save_inr: float
    active: bool
    gamified_tip: str

class ToggleSavingRuleRequest(BaseModel):
    rule_key: str
    active: bool

class StudentDematGuideItem(BaseModel):
    step_number: int
    title: str
    description: str
    key_advice: str
    status: str

class InvestmentSavingsHubResponse(BaseModel):
    investment_readiness: InvestmentReadinessResponse
    portfolio: PortfolioSummary
    curated_assets: List[InvestmentAsset]
    savings_goals: List[SavingsGoal]
    saving_rules: List[SavingRule]
    total_monthly_savings_potential_inr: float
    student_demat_guide: List[StudentDematGuideItem]
    recent_transactions: Optional[List[Dict[str, Any]]] = []


# Multi-Company Basket Investment & UPI Gateway Models (6 Months – 1 Year Horizon)
class MultiCompanyAssetAllocation(BaseModel):
    ticker: str
    company_name: str
    category: str
    current_price_inr: float
    allocation_percentage: float
    allocated_amount_inr: float
    units_allotted: float
    pe_ratio: float
    market_cap_tier: str
    ai_growth_score: float
    target_horizon: str = "6M_TO_1Y"
    expected_6m_return_pct: float = 7.5
    expected_1yr_return_pct: float = 15.0
    expected_3yr_cagr_pct: float = 15.0
    gmp_inr: float = 0.0
    gmp_pct: float = 0.0
    gmp_status: str = "BULLISH_DEMAND"
    gmp_demand_rating: str = "High Accumulation"
    why_suggested_for_you: str = ""
    near_term_catalysts: str = ""
    ai_investment_rationale: str
    key_moat: str
    risk_level: str

class MultiCompanyBasketPlan(BaseModel):
    basket_id: str
    basket_name: str
    tagline: str
    icon: str
    risk_profile: str
    target_horizon_label: str = "6 Months – 1 Year (Student Short-to-Medium Horizon)"
    expected_6m_return_pct: float = 7.5
    expected_1yr_return_pct: float = 15.0
    expected_annual_cagr_pct: float = 15.0
    minimum_amount_inr: float
    total_basket_cost_inr: float
    companies_count: int
    allocations: List[MultiCompanyAssetAllocation]
    ai_deep_analysis: str
    projected_returns: Dict[str, float]
    conservative_6m_value_inr: float = 0.0
    realistic_6m_value_inr: float = 0.0
    bullish_6m_value_inr: float = 0.0
    conservative_1yr_value_inr: float
    realistic_1yr_value_inr: float
    bullish_1yr_value_inr: float
    conservative_3yr_value_inr: float = 0.0
    realistic_3yr_value_inr: float = 0.0
    bullish_3yr_value_inr: float = 0.0

class MultiCompanyBasketResponse(BaseModel):
    requested_amount_inr: float
    student_monthly_budget_inr: float
    recommended_basket_id: str
    ai_overall_strategy: str
    baskets: List[MultiCompanyBasketPlan]

class UpiPaymentExecuteRequest(BaseModel):
    basket_id: Optional[str] = None
    asset_id: Optional[str] = None
    payment_method: str  # "GPAY", "PHONEPE", "PAYTM", "BHIM_UPI", "QR_CODE"
    upi_id: Optional[str] = None
    amount_inr: float
    investment_type: str = "MULTI_COMPANY_BASKET"

class UpiPaymentExecuteResponse(BaseModel):
    success: bool
    transaction_id: str
    utr_number: str
    payment_method: str
    amount_paid_inr: float
    timestamp: str
    units_allocated_summary: List[Dict[str, Any]]
    amfi_sebi_compliance_note: str
    message: str
    updated_portfolio: PortfolioSummary


# =========================================================================
# NEW INTEGRATED ADVANCED FEATURE MODELS
# =========================================================================

# 1. AI Mock Interview
class MockInterviewQuestion(BaseModel):
    id: str
    category: str  # "Technical", "DSA/Algorithms", "System Design", "Behavioral"
    question: str
    sample_hint: str
    difficulty: str = "Medium"

class MockInterviewAnswerItem(BaseModel):
    question_id: str
    question: str
    user_answer: str

class MockInterviewSubmitRequest(BaseModel):
    role: str
    answers: List[MockInterviewAnswerItem]

class MockInterviewScores(BaseModel):
    technical: int
    communication: int
    confidence: int
    accuracy: int
    structure: int
    overall: int

class MockInterviewResult(BaseModel):
    role: str
    scores: MockInterviewScores
    strengths: List[str]
    areas_to_improve: List[str]
    actionable_feedback: str
    exemplar_answers: List[Dict[str, str]]
    previous_mock_score: int
    new_mock_score: int
    readiness_impact: int
    new_readiness_pct: int


# 2. AI Skill Assessment (Interactive Tests)
class SkillAssessmentQuestion(BaseModel):
    id: str
    skill_name: str
    question: str
    options: List[str]
    code_snippet: Optional[str] = None
    difficulty: str = "Intermediate"

class SkillAssessmentSubmitRequest(BaseModel):
    skill_name: str
    answers: Dict[str, int]  # question_id -> chosen option index

class SkillAssessmentResult(BaseModel):
    skill_name: str
    score: float
    max_score: float
    score_pct: int
    old_proficiency: float
    new_proficiency: float
    status: str
    explanation: str
    new_readiness_pct: int


# 3. GitHub Profile Analyzer
class GitHubAnalysisRequest(BaseModel):
    username: str

class GitHubAnalysisResult(BaseModel):
    username: str
    avatar_url: str
    public_repos: int
    total_stars: int
    top_languages: List[Dict[str, Any]]
    code_activity_score: int
    project_quality_score: int
    consistency_score: int
    documentation_score: int
    open_source_score: int
    overall_github_score: int
    readiness_impact: int
    strengths: List[str]
    actionable_improvements: List[str]
    pinned_highlights: List[Dict[str, str]]


# 4. Career Path Comparison
class CareerPathCompareRequest(BaseModel):
    roles: List[str] = ["Data Scientist", "ML Engineer", "AI Engineer"]

class CareerPathItem(BaseModel):
    role: str
    current_fit_pct: int
    avg_salary_inr: str
    missing_skills_count: int
    missing_skills: List[str]
    time_to_ready_months: int
    prep_cost_inr: str
    job_demand_tier: str
    market_growth_pct: int
    key_pros: List[str]
    key_challenges: List[str]

class CareerPathCompareResponse(BaseModel):
    paths: List[CareerPathItem]
    recommended_role: str
    recommendation_reason: str


# 5. Career ROI Calculator
class CareerRoiRequest(BaseModel):
    course_name: str
    provider: str
    cost_inr: float
    target_role: str
    study_hours: int = 40

class CareerRoiResponse(BaseModel):
    course_name: str
    provider: str
    cost_inr: float
    expected_skill_gain_pct: int
    readiness_gain_pct: int
    time_required_hours: int
    career_relevance_pct: int
    financial_stress_level: str
    estimated_salary_uplift_inr: str
    payback_period_months: float
    estimated_roi_rating: str
    verdict: str
    ai_advice: str


# 6. Job Application Funnel Tracker
class JobApplicationItem(BaseModel):
    id: str
    user_id: str
    company: str
    role: str
    stage: str  # "Applied", "OA", "Technical Interview", "HR Round", "Offer", "Rejected"
    salary_package_lpa: Optional[float] = None
    applied_date: str
    location: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str

class CreateJobApplicationRequest(BaseModel):
    company: str
    role: str
    stage: str = "Applied"
    salary_package_lpa: Optional[float] = None
    location: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None

class UpdateJobApplicationRequest(BaseModel):
    stage: Optional[str] = None
    notes: Optional[str] = None
    salary_package_lpa: Optional[float] = None

class JobFunnelAnalytics(BaseModel):
    total_applications: int
    applied_count: int
    oa_count: int
    interviews_count: int
    technical_count: int
    hr_count: int
    offers_count: int
    rejections_count: int
    conversion_rate_pct: float
    biggest_dropoff_stage: str
    ai_bottleneck_coach: str
    applications: List[JobApplicationItem]


# 7. Explainable AI Breakdown
class ReadinessAttributionItem(BaseModel):
    factor: str
    weight_pct: int
    points_contributed: int
    max_points: int
    current_status: str
    suggestion_for_gain: str

class ExplainableReadinessBreakdown(BaseModel):
    total_readiness_pct: int
    target_role: str
    formula_summary: str
    attributions: List[ReadinessAttributionItem]
    top_bottleneck: str
    quickest_win: str


# 8. LinkedIn Profile Analyzer
class LinkedInAnalysisRequest(BaseModel):
    headline: Optional[str] = None
    about: Optional[str] = None
    skills: List[str] = []
    projects: List[str] = []
    experience: Optional[str] = None
    certifications: List[str] = []

class LinkedInSectionScore(BaseModel):
    section: str
    score: int
    feedback: str

class LinkedInAnalysisResult(BaseModel):
    overall_score: int
    section_breakdown: List[LinkedInSectionScore]
    optimized_headline: str
    optimized_about: str
    strengths: List[str]
    actionable_recommendations: List[str]
    readiness_impact: int


# 9. Smart Contextual Notifications
class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    type: str  # "info", "warning", "success", "alert"
    category: str  # "career", "study", "finance", "jobs"
    timestamp: str
    read: bool = False
    action_url: Optional[str] = None

class NotificationsResponse(BaseModel):
    notifications: List[NotificationItem]
    unread_count: int


# 10. Gamification & Badges
class GamificationBadge(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    unlocked: bool
    unlocked_at: Optional[str] = None
    category: str

class GamificationStatusResponse(BaseModel):
    current_level: int
    current_xp: int
    next_level_xp: int
    progress_pct: int
    streak_days: int
    unlocked_count: int
    total_badges: int
    badges: List[GamificationBadge]


# 11. Skill Market Demand
class SkillMarketDemandItem(BaseModel):
    skill_name: str
    demand_score: int  # 0-100
    growth_score: int  # 0-100
    trend: str  # "Surging", "High Growth", "Stable"
    avg_salary_impact_lpa: str
    in_user_profile: bool

class SkillMarketDemandResponse(BaseModel):
    target_role: str
    market_skills: List[SkillMarketDemandItem]
    high_demand_missing_skills: List[str]
    market_insight_summary: str


# 12. Job Match Progression History
class JobMatchHistoryEntry(BaseModel):
    company: str
    role: str
    match_pct: int
    salary_lpa: float
    recorded_date: str

class JobMatchHistoryResponse(BaseModel):
    history: List[JobMatchHistoryEntry]
    current_avg_match_pct: int
    previous_avg_match_pct: int
    improvement_pct: int
    summary_message: str


# 13. Career + Wealth Digital Twin 2.0 (Interactive Multi-Scenario Simulator)
class InteractiveDigitalTwinRequest(BaseModel):
    study_hours: float = 3.5
    monthly_income: float = 15000.0
    monthly_expenses: float = 8000.0
    course_spending: float = 2000.0
    career_choice: str = "AI Engineer"
    monthly_investment: float = 3000.0
    target_salary_lpa: float = 14.0

class InteractiveDigitalTwinScenario(BaseModel):
    scenario_id: str  # "scenario_a", "scenario_b", "scenario_c"
    scenario_name: str
    tagline: str
    readiness_pct: int
    expected_salary_lpa: float
    five_year_net_wealth_inr: float
    five_year_savings_inr: float
    five_year_investment_inr: float
    pros: List[str]
    cons: List[str]
    suitability: str

class InteractiveDigitalTwinResponse(BaseModel):
    input_parameters: Dict[str, Any]
    scenarios: List[InteractiveDigitalTwinScenario]
    recommended_scenario_id: str
    ai_recommendation: str


# =========================================================================
# REAL MARKET DATA & REGULATED BROKER ARCHITECTURE MODELS
# =========================================================================

class MarketQuoteDepth(BaseModel):
    bids: List[Dict[str, Any]] = []
    asks: List[Dict[str, Any]] = []

class LiveMarketQuote(BaseModel):
    symbol: str
    company_name: str
    exchange: str = "NSE"
    last_price: float
    change: float
    change_pct: float
    day_high: float
    day_low: float
    day_open: float
    prev_close: float
    volume: int
    depth: Optional[MarketQuoteDepth] = None
    is_market_open: bool = True
    timestamp: str

class MarketCandle(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class MarketChartResponse(BaseModel):
    symbol: str
    interval: str
    candles: List[MarketCandle]
    last_price: float
    change: float
    change_pct: float

class MarketOverviewResponse(BaseModel):
    indices: List[LiveMarketQuote]
    top_gainers: List[LiveMarketQuote]
    top_losers: List[LiveMarketQuote]
    most_active: List[LiveMarketQuote]
    market_status: str
    regulatory_notice: str

class BrokerConnectRequest(BaseModel):
    broker_name: str = "Zerodha"  # "Zerodha", "Upstox", "Angel One", "Groww"
    account_id: str
    auth_code_or_token: Optional[str] = None
    is_sandbox: bool = False

class BrokerStatusResponse(BaseModel):
    connected: bool
    broker_name: Optional[str] = None
    account_id: Optional[str] = None
    is_sandbox: bool = False
    last_synced_at: Optional[str] = None
    custody_disclaimer: str

class BrokerHoldingItem(BaseModel):
    symbol: str
    company_name: str
    exchange: str = "NSE"
    quantity: int
    average_buy_price: float
    current_price: float
    invested_value: float
    current_value: float
    unrealized_pnl: float
    pnl_pct: float
    day_pnl: float
    day_pnl_pct: float

class BrokerPortfolioResponse(BaseModel):
    is_broker_connected: bool
    broker_name: Optional[str] = None
    account_id: Optional[str] = None
    total_portfolio_value: float
    total_invested_value: float
    total_unrealized_pnl: float
    total_pnl_pct: float
    day_pnl: float
    day_pnl_pct: float
    cash_margin_available: float
    holdings: List[BrokerHoldingItem]
    last_synced_ist: str
    regulatory_footnote: str

class PlaceBrokerOrderRequest(BaseModel):
    symbol: str
    exchange: str = "NSE"
    transaction_type: str  # "BUY" or "SELL"
    order_type: str = "MARKET"  # "MARKET", "LIMIT"
    product: str = "CNC"  # "CNC" (Cash & Carry Delivery), "MIS" (Intraday)
    quantity: int
    price: Optional[float] = None
    execution_mode: Optional[str] = "PAPER"

class BrokerOrderResult(BaseModel):
    order_id: str
    broker_order_id: str
    broker_name: str
    symbol: str
    exchange: str
    transaction_type: str
    order_type: str
    product: str
    quantity: int
    price: float
    estimated_charges: float = 0.0
    status: str  # "EXECUTED", "REJECTED", "SUBMITTED"
    execution_mode: str = "LIVE"  # "LIVE" or "PAPER"
    rejection_reason: Optional[str] = None
    message: str
    timestamp: str

class CreateUpiMandateRequest(BaseModel):
    amount_inr: float
    vpa: str  # e.g. student@okhdfcbank
    purpose: str = "BROKER_MARGIN_DEPOSIT"

class UpiMandateResponse(BaseModel):
    mandate_ref: str
    amount_inr: float
    vpa: str
    purpose: str
    status: str
    user_instruction: str
    approved: bool = False
    timestamp: str

class RealAiWealthAuditResponse(BaseModel):
    emergency_buffer_status: str
    cash_vs_equity_ratio: str
    sector_concentration: Dict[str, float]
    top_holding_risk: str
    student_cash_flow_advice: str
    sebi_educational_disclaimer: str

class BrokerOrderItem(BaseModel):
    id: str
    broker_order_id: Optional[str] = None
    broker_name: str
    symbol: str
    exchange: str = "NSE"
    transaction_type: str  # "BUY" or "SELL"
    order_type: str = "MARKET"
    product: str = "CNC"
    quantity: int
    requested_price: Optional[float] = None
    executed_price: Optional[float] = None
    estimated_charges: float = 0.0
    status: str  # "EXECUTED", "PENDING", "REJECTED", "CANCELLED", "FAILED"
    execution_mode: str = "LIVE"  # "LIVE" or "PAPER"
    failure_reason: Optional[str] = None
    created_at: str

class OrdersSummaryResponse(BaseModel):
    all_orders: List[BrokerOrderItem]
    pending_orders: List[BrokerOrderItem]
    executed_orders: List[BrokerOrderItem]
    rejected_orders: List[BrokerOrderItem]
    cancelled_orders: List[BrokerOrderItem]
    total_orders_count: int
    active_environment: str  # "LIVE" or "PAPER"

class CareerVsInvestmentDecisionRequest(BaseModel):
    capital_amount: float = 10000.0
    certification_or_course_name: str = "AWS Solutions Architect / Deep Learning Specialization"
    certification_cost: float = 10000.0
    career_goal: Optional[str] = None

class FiveYearYearlyProjection(BaseModel):
    year: int
    scenario_a_career_income: float
    scenario_b_sip_corpus: float
    scenario_c_do_nothing_income: float

class ProbabilisticSalaryUplift(BaseModel):
    conservative_annual_inr: float = 60000.0
    expected_annual_inr: float = 120000.0
    optimistic_annual_inr: float = 180000.0
    confidence_pct: int = 78

class MarketScenarioReturn(BaseModel):
    scenario_name: str
    one_year_val_inr: float
    three_year_val_inr: float
    five_year_val_inr: float
    description: str

class CertificationScenarioOutcome(BaseModel):
    scenario_name: str
    outcome_label: str
    salary_boost_inr: float
    description: str

class CareerOptionProjection(BaseModel):
    option_title: str
    cost_inr: float
    expected_skill_boost_pct: float
    career_readiness_lift_pct: float
    estimated_annual_salary_impact_inr: float
    payback_period_months: float
    verdict_badge: str
    disclaimer: str

class InvestmentOptionProjection(BaseModel):
    option_title: str
    principal_amount_inr: float
    expected_3y_cagr_estimate_pct: float
    projected_corpus_3y_inr: float
    risk_level: str
    liquidity_rating: str
    disclaimer: str

class CareerVsInvestmentDecisionResponse(BaseModel):
    capital_amount: float
    career_option: CareerOptionProjection
    investment_option: InvestmentOptionProjection
    ai_verdict: str  # "CERTIFICATION_RECOMMENDED", "INVESTMENT_RECOMMENDED", "BALANCED_SPLIT"
    strategic_rationale: str
    attribution_factors: List[Dict[str, str]]
    confidence_score: int
    sebi_scenario_disclaimer: str
    five_year_trajectory: Optional[List[FiveYearYearlyProjection]] = None
    probabilistic_salary: Optional[ProbabilisticSalaryUplift] = None
    market_scenarios: Optional[List[MarketScenarioReturn]] = None
    certification_scenarios: Optional[List[CertificationScenarioOutcome]] = None


class FinancialSafetyCheckResponse(BaseModel):
    emergency_fund_target_inr: float
    emergency_fund_current_inr: float
    emergency_fund_pct: float
    runway_months: float
    debt_level: str
    monthly_disposable_cash_flow_inr: float
    investment_risk_profile: str
    insurance_health_status: str
    readiness_for_equity_investing: bool
    safety_gates: List[Dict[str, Any]]
    actionable_remedy: str
    essential_monthly_expenses_inr: Optional[float] = 6000.0
    emergency_fund_gap_inr: Optional[float] = 16000.0
    investment_clearance_state: Optional[str] = "BLOCKED"  # "BLOCKED", "LIMITED", "CLEARED"
    clearance_badge: Optional[str] = "🔴 Investment Clearance BLOCKED"
    clearance_reason: Optional[str] = ""
    financial_health_score: Optional[int] = 64

class FinancialHealthFactor(BaseModel):
    factor: str
    score: int
    status: str
    description: str

class FinancialHealthSummary(BaseModel):
    overall_health_score: int
    health_status: str
    rating_pill: str
    summary_message: str
    essential_monthly_expenses: float
    emergency_target: float
    emergency_current: float
    emergency_gap: float
    runway_months: float
    emergency_fund_pct: float
    monthly_income: float
    total_expenses: float
    monthly_surplus: float
    upskilling_capacity: float
    investment_capacity: float
    clearance_state: str  # "BLOCKED", "LIMITED", "CLEARED"
    clearance_badge: str
    clearance_reason: str
    factors: List[FinancialHealthFactor]

# ==================== STUDY ABROAD & MASTERS COPILOT MODELS ====================

class StudyAbroadCountry(BaseModel):
    id: str
    name: str
    flag: str
    currency: str
    avg_tuition_annual_inr: float
    avg_living_annual_inr: float
    psw_visa_years: str
    common_exams: List[str]
    english_tests: List[str]
    key_advantages: List[str]
    intake_seasons: List[str]

class ExamPlanSection(BaseModel):
    name: str
    weight: str
    target_score: str
    status: str
    key_topics: List[str]

class ExamPlanItem(BaseModel):
    exam_name: str
    badge: str
    is_mandatory: bool
    target_score: str
    recommended_deadline: str
    sections: List[ExamPlanSection]
    official_portal_url: str
    free_study_resource_links: List[Dict[str, str]]

class PracticePaperQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_option: int
    explanation: str

class PracticePaperItem(BaseModel):
    id: str
    exam: str  # GRE, IELTS, TOEFL
    title: str
    category: str  # QUANTITATIVE, VERBAL, WRITING_AWA, FULL_MOCK
    difficulty: str  # Medium, Hard, Realistic Exam
    time_limit_minutes: int
    question_count: int
    source_attribution: str  # "ETS Official Sample", "Cambridge Official Guide", "Elevare Open Educational"
    questions: List[PracticePaperQuestion]

class ShortlistedUniversity(BaseModel):
    id: str
    university_name: str
    country: str
    flag: str
    program_name: str
    tier: str  # AMBITIOUS, TARGET, SAFE
    qs_world_ranking: int
    annual_tuition_usd: float
    annual_tuition_inr: float
    annual_living_inr: float
    min_cgpa_cutoff: float
    gre_requirement: str  # Required (320+), Recommended, Waived
    ielts_requirement: float
    post_ms_avg_starting_salary_inr: float
    roi_payback_years: float
    official_portal_url: str
    application_deadline: str
    application_fee_inr: float
    is_stem_certified: bool
    checklist: Dict[str, bool] = Field(default_factory=lambda: {
        "account_created": False,
        "program_selected": False,
        "transcripts_uploaded": False,
        "sop_submitted": False,
        "lor_submitted": False,
        "scores_reported": False,
        "application_paid": False
    })

class StudyAbroadCostRoiEstimate(BaseModel):
    university_name: str
    country: str
    flag: str
    program_name: str
    tuition_2y_inr: float
    living_2y_inr: float
    visa_insurance_travel_inr: float
    exam_app_fees_inr: float
    total_estimated_budget_inr: float
    total_estimated_budget_usd: float
    funding_plan: Dict[str, float]
    estimated_monthly_emi_inr: float
    projected_post_ms_salary_inr: float
    payback_period_years: float
    affordability_index: str  # AFFORDABLE, HIGH_LEVERAGE, STRETCH
    financial_engine_synergy_note: str

class SopLorGenerationRequest(BaseModel):
    target_university: str
    target_program: str
    specific_research_interest: Optional[str] = "Deep Learning Systems & Distributed AI"
    target_professor_or_lab: Optional[str] = "AI & Autonomous Systems Lab"

class SopLorGenerationResponse(BaseModel):
    target_university: str
    target_program: str
    sop_title: str
    sop_text: str
    lor_prof_title: str
    lor_prof_text: str
    lor_hod_text: str
    tailored_skills_highlighted: List[str]
    tailored_projects_highlighted: List[str]

class StudyAbroadRoadmapPhase(BaseModel):
    phase_title: str
    timeline_months: str
    key_milestones: List[str]
    action_items: List[str]

class StudyAbroadMasterRoadmap(BaseModel):
    target_intake: str
    target_countries: List[str]
    target_program: str
    phases: List[StudyAbroadRoadmapPhase]

class StudyAbroadOverviewResponse(BaseModel):
    target_countries: List[str]
    target_program: str
    target_intake: str
    profile_summary: Dict[str, Any]
    all_countries_catalog: List[StudyAbroadCountry]
    required_exams: List[ExamPlanItem]
    practice_papers: List[PracticePaperItem]
    shortlisted_universities: List[ShortlistedUniversity]
    cost_roi_comparisons: List[StudyAbroadCostRoiEstimate]
    roadmap: StudyAbroadMasterRoadmap

class UpdateStudyAbroadSelectionRequest(BaseModel):
    target_countries: List[str]
    target_program: Optional[str] = None
    target_intake: Optional[str] = None

class UpdateUniversityChecklistRequest(BaseModel):
    university_id: str
    checklist_key: str
    completed: bool

# ==================== ADVANCED EXAM PREPARATION ENGINE MODELS ====================

class ExamQuestion(BaseModel):
    id: str
    exam: str  # GRE, IELTS, TOEFL, GMAT
    section: str  # QUANTITATIVE, VERBAL, DATA_INSIGHTS, READING, LISTENING
    topic: str  # Arithmetic, Algebra, Geometry, Probability, Text Completion, etc.
    difficulty: str  # Easy, Medium, Hard
    question: str
    options: List[str]
    correct_option: int
    explanation: str
    mistake_analysis: Optional[str] = "Carefully identify boundary conditions or misread variable assumptions."
    concept_tested: Optional[str] = "Core Analytical Logic"

class GeneratePracticeSetRequest(BaseModel):
    exam: str = "GRE"
    section: Optional[str] = "QUANTITATIVE"
    topic: Optional[str] = "All Topics"
    difficulty: Optional[str] = "All"
    question_count: int = 10
    time_limit_minutes: Optional[int] = 15

class PracticeSetResponse(BaseModel):
    set_id: str
    exam: str
    section: str
    topic: str
    difficulty: str
    time_limit_minutes: int
    questions: List[ExamQuestion]

class SubmitPracticeSetRequest(BaseModel):
    set_id: str
    exam: str
    section: str
    answers: Dict[str, int]  # question_id -> user_chosen_option_index
    time_spent_seconds: int = 600

class QuestionResult(BaseModel):
    question_id: str
    question: str
    options: List[str]
    user_choice: Optional[int]
    correct_choice: int
    is_correct: bool
    explanation: str
    mistake_analysis: str
    concept_tested: str
    difficulty: str
    topic: str

class TopicPerformance(BaseModel):
    topic: str
    total: int
    correct: int
    accuracy_pct: float
    status: str  # STRONG, AVERAGE, WEAK

class PracticeSetEvaluationResponse(BaseModel):
    set_id: str
    exam: str
    total_questions: int
    correct_count: int
    accuracy_pct: float
    average_time_per_question_sec: float
    results: List[QuestionResult]
    topic_breakdown: List[TopicPerformance]
    weak_areas: List[str]
    ai_feedback: str

class MockExamSectionDef(BaseModel):
    section_id: str
    name: str
    time_minutes: int
    questions: List[ExamQuestion]

class MockExamBlueprint(BaseModel):
    mock_id: str
    title: str
    exam: str
    total_time_minutes: int
    sections: List[MockExamSectionDef]

class StartMockExamRequest(BaseModel):
    exam: str = "GRE"
    mock_mode: str = "FULL_TIMED"  # FULL_TIMED, ADAPTIVE, SECTIONAL

class SubmitMockExamRequest(BaseModel):
    mock_id: str
    exam: str
    answers: Dict[str, int]  # question_id -> chosen_option
    time_spent_seconds: int
    section_breakdown: Optional[Dict[str, Any]] = None

class MockScoreHistoryItem(BaseModel):
    id: str
    mock_title: str
    date: str
    quant_score: int
    verbal_score: int
    total_score: int
    accuracy_pct: float
    estimated_target_gap: int

class MockExamEvaluationResponse(BaseModel):
    mock_id: str
    exam: str
    overall_accuracy_pct: float
    quant_accuracy_pct: float
    verbal_accuracy_pct: float
    quant_scaled_score: int  # 130 - 170 for GRE
    verbal_scaled_score: int  # 130 - 170 for GRE
    total_scaled_score: int  # 260 - 340 for GRE (or 0-9 band for IELTS)
    score_range: str
    target_score: int
    target_gap: int
    difficulty_adaptation_log: List[str]
    topic_performance: List[TopicPerformance]
    weakest_topics: List[str]
    strongest_topics: List[str]
    ai_strategic_advice: str
    mistakes_added_to_bank: int

class MistakeBankItem(BaseModel):
    id: str
    question_id: str
    exam: str
    section: str
    topic: str
    difficulty: str
    question: str
    options: List[str]
    correct_option: int
    user_choice: Optional[int]
    explanation: str
    concept_tested: str
    mistake_count: int
    resolved: bool
    last_attempted_at: str

class MistakeBankResponse(BaseModel):
    total_unresolved: int
    topic_counts: Dict[str, int]
    items: List[MistakeBankItem]

class WritingEvaluationRequest(BaseModel):
    exam: str = "GRE"  # GRE (Issue/Argument) or IELTS (Task 2)
    prompt_type: str = "ISSUE_TASK"
    topic_prompt: str
    essay_text: str

class WritingEvaluationResponse(BaseModel):
    exam: str
    estimated_score_or_band: str  # e.g., "4.5 / 6.0" for GRE or "6.5 / 9.0" for IELTS
    rubric_scores: Dict[str, float]  # Task Response, Coherence, Lexical, Grammar
    strengths: List[str]
    areas_for_improvement: List[str]
    band_8_rewrite_sample: str
    ai_critique: str

class SpeakingEvaluationRequest(BaseModel):
    exam: str = "IELTS"
    cue_card_topic: str
    transcript_text: str
    speech_duration_seconds: int = 120

class SpeakingEvaluationResponse(BaseModel):
    exam: str
    estimated_band: float  # e.g. 7.0
    rubric_scores: Dict[str, float]  # Fluency, Pronunciation, Lexical, Grammar
    detected_fillers_and_pauses: int
    feedback_notes: List[str]
    sample_high_band_response: str

class ExamAnalyticsSummary(BaseModel):
    exam: str
    total_questions_solved: int
    overall_accuracy_pct: float
    total_mocks_completed: int
    best_mock_score: int
    best_quant_accuracy_pct: float
    best_verbal_accuracy_pct: float
    unresolved_mistakes_count: int
    mock_history: List[MockScoreHistoryItem]
    topic_radar: List[TopicPerformance]
    gamified_badges: List[Dict[str, Any]]
    score_improvement_delta: int
    predicted_target_days: int

class MastersOverallReadiness(BaseModel):
    overall_readiness_pct: int
    academics_score: int
    english_test_score: int
    gre_gmat_score: int
    projects_experience_score: int
    research_publications_score: int
    finance_runway_score: int
    application_docs_score: int
    bottlenecks: List[str]
    priority_action_plan: List[str]

class StudyAbroadPrepBudget(BaseModel):
    gre_test_fee_inr: float
    ielts_test_fee_inr: float
    university_apps_fee_inr: float
    transcripts_evaluation_fee_inr: float
    visa_sevis_fee_inr: float
    flight_travel_prep_inr: float
    total_prep_budget_inr: float
    current_saved_inr: float
    savings_gap_inr: float
    dedicated_jar_name: str










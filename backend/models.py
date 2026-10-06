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
    status: str  # "EXECUTED", "REJECTED", "SUBMITTED"
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






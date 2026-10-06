from fastapi import FastAPI, HTTPException, Header, Depends, Query, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uuid
import os

from models import (
    StudentProfile, SkillItem, SkillGapItem, CareerMatch,
    LearningRoadmap, RecommendedProject, CertificationAffordability,
    CourseCard, DailyActionPlan, DecisionEvaluationRequest,
    DecisionEvaluationResponse, ProgressUpdatePayload, LLMIntentAnalysis,
    UserRegisterRequest, UserLoginRequest, AuthResponse, ProfileSetupRequest,
    SimulationRequest, SimulationResponse, PlacementReadinessBreakdown,
    SkillGraphData, JobMarketData, ResumeAnalyzeRequest, ResumeAnalysisResponse,
    DetailedProjectBlueprint, QuickPurchaseCheckRequest, QuickPurchaseCheckResponse,
    WeeklyReviewData, InvestmentReadinessResponse, RiskAssessmentRequest,
    RiskProfileResponse, SipSimulatorRequest, SipSimulationResponse,
    OpportunityCostRequest, OpportunityCostResponse, ScamCheckRequest, ScamCheckResponse,
    DigitalTwinResponse, InvestmentAsset, TradeOrderRequest, TradeOrderResponse,
    CreateSavingsGoalRequest, DepositSavingsGoalRequest, ToggleSavingRuleRequest,
    InvestmentSavingsHubResponse, MultiCompanyBasketResponse, UpiPaymentExecuteRequest,
    UpiPaymentExecuteResponse, CompanyChartData,
    MockInterviewQuestion, MockInterviewSubmitRequest, MockInterviewResult,
    SkillAssessmentQuestion, SkillAssessmentSubmitRequest, SkillAssessmentResult,
    GitHubAnalysisRequest, GitHubAnalysisResult,
    CareerPathCompareRequest, CareerPathCompareResponse,
    CareerRoiRequest, CareerRoiResponse,
    JobApplicationItem, CreateJobApplicationRequest, UpdateJobApplicationRequest, JobFunnelAnalytics,
    ExplainableReadinessBreakdown,
    LinkedInAnalysisRequest, LinkedInAnalysisResult,
    NotificationsResponse, GamificationStatusResponse,
    SkillMarketDemandResponse, JobMatchHistoryResponse,
    InteractiveDigitalTwinRequest, InteractiveDigitalTwinResponse
)
from engines.career_engine import CareerEngine
from engines.finance_engine import FinanceEngine
from engines.investment_engine import InvestmentEngine
from engines.decision_engine import DecisionEngine
from engines.progress_engine import ProgressEngine
from engines.simulation_engine import AdvancedSimulationEngine
from engines.llm_service import LLMService
from engines.interview_engine import MockInterviewEngine
from engines.skill_assessment_engine import SkillAssessmentEngine
from engines.github_engine import GitHubAnalyzerEngine
from engines.career_comparator import CareerComparatorEngine
from engines.resume_parser import ResumeParserEngine
from engines.linkedin_analyzer import LinkedInAnalyzerEngine
from engines.market_demand_engine import SkillMarketDemandEngine
from engines.interactive_digital_twin import InteractiveDigitalTwinEngine
from engines.engagement_engine import EngagementEngine
from database import (
    DatabaseManager, hash_password
)

app = FastAPI(
    title="CareerWealth.AI Intelligence Platform API",
    description="Adaptive AI Career & Wealth Optimization Platform with Strict Authentication, Digital Twin 2.0, and Real Decision Simulators",
    version="3.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_user_from_auth(
    authorization: Optional[str] = Header(None)
) -> StudentProfile:
    # Strict Bearer Token Verification in SQLite: No fallback mock users, no query bypass
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Access denied."
        )
    
    token = authorization.split(" ")[1].strip()
    profile = DatabaseManager.get_user_by_token(token)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token. Access denied."
        )
    return profile

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "CareerWealth.AI Platform", "database": "SQLite Persistent", "version": "3.0.0"}

# ==================== AUTHENTICATION & ONBOARDING ====================

@app.get("/api/career/degree-catalogue")
def get_degree_catalogue():
    return CareerEngine.get_degree_catalogue()

@app.get("/api/career/available-roles")
def get_available_roles():
    return CareerEngine.get_all_roles()

@app.get("/api/auth/demo-users")
def get_demo_users():
    return []

@app.post("/api/auth/setup-profile", response_model=AuthResponse)
def setup_profile_direct(req: ProfileSetupRequest):
    name_clean = req.name.strip() or "Student"
    user_id = f"user-{uuid.uuid4().hex[:8]}"
    email_auto = f"{name_clean.lower().replace(' ', '_')}_{uuid.uuid4().hex[:6]}@student.ai"
    
    new_profile = StudentProfile(
        id=user_id,
        name=name_clean,
        email=email_auto,
        avatar=req.avatar or "👨‍💻",
        career_goal=req.career_goal,
        academic=req.academic,
        skills=req.skills,
        financial=req.financial,
        preferences=req.preferences
    )
    
    user_id, token = DatabaseManager.create_user(
        name=name_clean,
        email=email_auto,
        password_plain=f"pwd-{uuid.uuid4().hex}",
        avatar=req.avatar or "👨‍💻",
        profile=new_profile
    )
    
    return AuthResponse(
        token=token,
        user_id=user_id,
        name=new_profile.name,
        email=email_auto,
        profile=new_profile
    )

@app.post("/api/auth/register", response_model=AuthResponse)
def register_user(req: UserRegisterRequest):
    email_clean = req.email.strip().lower()
    existing = DatabaseManager.get_user_by_email(email_clean)
    if existing:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")
        
    new_profile = StudentProfile(
        id=f"user-{uuid.uuid4().hex[:8]}",
        name=req.name.strip(),
        email=email_clean,
        avatar=req.avatar or "👨‍💻",
        career_goal=req.career_goal,
        academic=req.academic,
        skills=req.skills,
        financial=req.financial,
        preferences=req.preferences
    )
    
    user_id, token = DatabaseManager.create_user(
        name=req.name.strip(),
        email=email_clean,
        password_plain=req.password,
        avatar=req.avatar or "👨‍💻",
        profile=new_profile
    )
    
    return AuthResponse(
        token=token,
        user_id=user_id,
        name=new_profile.name,
        email=email_clean,
        profile=new_profile
    )

@app.post("/api/auth/login", response_model=AuthResponse)
def login_user(req: UserLoginRequest):
    email_clean = req.email.strip().lower()
    user_row = DatabaseManager.get_user_by_email(email_clean)
    if not user_row:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    expected_hash = hash_password(req.password)
    if user_row["password_hash"] != expected_hash:
        raise HTTPException(status_code=401, detail="Invalid password.")
        
    uid = user_row["id"]
    profile = DatabaseManager.get_profile_by_user_id(uid)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    token = DatabaseManager.create_session(uid)
    
    return AuthResponse(
        token=token,
        user_id=uid,
        name=user_row["name"],
        email=email_clean,
        profile=profile
    )

@app.get("/api/auth/me", response_model=StudentProfile)
def get_current_user_profile(current_user: StudentProfile = Depends(get_user_from_auth)):
    return current_user

@app.post("/api/auth/logout")
def logout_user(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        DatabaseManager.delete_session(token)
    return {"message": "Session terminated successfully."}

# ==================== PROFILE MANAGEMENT ====================

@app.get("/api/profile", response_model=StudentProfile)
def get_profile(current_user: StudentProfile = Depends(get_user_from_auth)):
    return current_user

@app.post("/api/profile", response_model=StudentProfile)
def save_profile(profile: StudentProfile, current_user: StudentProfile = Depends(get_user_from_auth)):
    profile.id = current_user.id
    profile.email = current_user.email
    return DatabaseManager.save_profile(profile)

@app.post("/api/profile/reset", response_model=StudentProfile)
def reset_profile(current_user: StudentProfile = Depends(get_user_from_auth)):
    current_user.total_xp = 50
    current_user.user_level = 1
    current_user.streak_days = 1
    return DatabaseManager.save_profile(current_user)

# ==================== ADVANCED CAREER ENGINE ====================

@app.get("/api/career/readiness")
def get_career_readiness(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.calculate_readiness(current_user)

@app.get("/api/career/placement-breakdown", response_model=PlacementReadinessBreakdown)
def get_placement_breakdown(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.get_placement_breakdown(current_user)

@app.get("/api/career/explainable-readiness", response_model=ExplainableReadinessBreakdown)
def get_explainable_readiness(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerComparatorEngine.get_explainable_readiness(current_user)

@app.get("/api/career/skill-gaps", response_model=List[SkillGapItem])
def get_skill_gaps(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.analyze_skill_gap(current_user)

@app.get("/api/career/recommendations", response_model=List[CareerMatch])
def get_career_recommendations(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.recommend_careers(current_user)

@app.get("/api/career/roadmap", response_model=LearningRoadmap)
def get_career_roadmap(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.generate_roadmap(current_user)

@app.get("/api/career/projects", response_model=List[RecommendedProject])
def get_career_projects(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.recommend_projects(current_user)

@app.get("/api/career/project-blueprint/{project_title}", response_model=DetailedProjectBlueprint)
def get_project_blueprint(project_title: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.generate_project_blueprint(project_title, current_user.career_goal)

@app.post("/api/career/simulate", response_model=SimulationResponse)
def simulate_career_path(req: SimulationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.simulate_scenario(current_user, req)

@app.post("/api/career/compare-paths", response_model=CareerPathCompareResponse)
def compare_career_paths(req: CareerPathCompareRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerComparatorEngine.compare_paths(req.roles, current_user)

@app.get("/api/career/skill-graph", response_model=SkillGraphData)
def get_skill_graph(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.get_skill_graph_data(current_user)

@app.get("/api/career/job-market", response_model=JobMarketData)
def get_job_market(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.get_job_market_intel(current_user)

# ==================== AI MOCK INTERVIEW ENGINE ====================

@app.get("/api/career/mock-interview/questions", response_model=List[MockInterviewQuestion])
def get_mock_interview_questions(role: Optional[str] = None, current_user: StudentProfile = Depends(get_user_from_auth)):
    target_role = role or current_user.career_goal or "AI Engineer"
    return MockInterviewEngine.generate_interview(target_role)

@app.post("/api/career/mock-interview/evaluate", response_model=MockInterviewResult)
def evaluate_mock_interview(req: MockInterviewSubmitRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    result = MockInterviewEngine.evaluate_interview(req.role, req.answers, current_user)
    
    # Award XP & Gamification
    current_user.total_xp += 75
    if "🎤 Interview Ready" not in current_user.badges:
        current_user.badges.append("🎤 Interview Ready")
    DatabaseManager.save_profile(current_user)
    
    return result

# ==================== AI SKILL ASSESSMENT ENGINE ====================

@app.get("/api/career/skill-assessment/questions", response_model=List[SkillAssessmentQuestion])
def get_skill_assessment_questions(skill: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    return SkillAssessmentEngine.get_questions(skill)

@app.post("/api/career/skill-assessment/submit", response_model=SkillAssessmentResult)
def submit_skill_assessment(req: SkillAssessmentSubmitRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    result = SkillAssessmentEngine.evaluate_assessment(req.skill_name, req.answers, current_user)
    
    # Award XP & update profile in SQLite
    current_user.total_xp += 50
    if result.score_pct >= 80 and f"💻 {req.skill_name} Master" not in current_user.badges:
        current_user.badges.append(f"💻 {req.skill_name} Master")
    DatabaseManager.save_profile(current_user)
    
    return result

# ==================== GITHUB PROFILE ANALYZER ====================

@app.post("/api/career/github-analyzer", response_model=GitHubAnalysisResult)
def analyze_github_profile(req: GitHubAnalysisRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return GitHubAnalyzerEngine.analyze_profile(req.username, current_user)

# ==================== RESUME ANALYZER & PDF UPLOAD ====================

@app.post("/api/resume/analyze", response_model=ResumeAnalysisResponse)
def analyze_resume(req: ResumeAnalyzeRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return ResumeParserEngine.analyze_resume_text(req.resume_text, req.target_role or current_user.career_goal)

@app.post("/api/resume/upload-pdf")
async def upload_pdf_resume(file: UploadFile = File(...), current_user: StudentProfile = Depends(get_user_from_auth)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a valid PDF document (.pdf).")
    
    pdf_bytes = await file.read()
    try:
        extracted_text = ResumeParserEngine.extract_text_from_pdf(pdf_bytes)
        analysis = ResumeParserEngine.analyze_resume_text(extracted_text, current_user.career_goal)
        
        # Award XP
        current_user.total_xp += 40
        if "📄 Resume Ready" not in current_user.badges:
            current_user.badges.append("📄 Resume Ready")
        DatabaseManager.save_profile(current_user)

        return {
            "success": True,
            "filename": file.filename,
            "extracted_text": extracted_text[:1500] + ("..." if len(extracted_text) > 1500 else ""),
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF extraction error: {str(e)}")

# ==================== JOB APPLICATION FUNNEL TRACKER ====================

@app.get("/api/jobs/applications", response_model=List[JobApplicationItem])
def list_job_applications(current_user: StudentProfile = Depends(get_user_from_auth)):
    raw_apps = DatabaseManager.get_user_job_applications(current_user.id)
    return [JobApplicationItem(**a) for a in raw_apps]

@app.post("/api/jobs/applications", response_model=JobApplicationItem)
def create_job_application(req: CreateJobApplicationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    row = DatabaseManager.create_job_application(
        user_id=current_user.id,
        company=req.company.strip(),
        role=req.role.strip(),
        stage=req.stage,
        salary_package_lpa=req.salary_package_lpa,
        location=req.location,
        job_url=req.job_url,
        notes=req.notes
    )
    return JobApplicationItem(**row)

@app.put("/api/jobs/applications/{app_id}", response_model=JobApplicationItem)
def update_job_application(app_id: str, req: UpdateJobApplicationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    updated = DatabaseManager.update_job_application(
        app_id=app_id,
        user_id=current_user.id,
        stage=req.stage,
        notes=req.notes,
        salary_package_lpa=req.salary_package_lpa
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Job application not found.")
    return JobApplicationItem(**updated)

@app.delete("/api/jobs/applications/{app_id}")
def delete_job_application(app_id: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    success = DatabaseManager.delete_job_application(app_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Job application not found.")
    return {"success": True, "message": "Job application deleted."}

@app.get("/api/jobs/application-analytics", response_model=JobFunnelAnalytics)
def get_job_funnel_analytics(current_user: StudentProfile = Depends(get_user_from_auth)):
    raw_apps = DatabaseManager.get_user_job_applications(current_user.id)
    app_items = [JobApplicationItem(**a) for a in raw_apps]
    
    total = len(app_items)
    applied = sum(1 for a in app_items if a.stage == "Applied")
    oa = sum(1 for a in app_items if a.stage == "OA")
    technical = sum(1 for a in app_items if a.stage == "Technical Interview")
    hr = sum(1 for a in app_items if a.stage == "HR Round")
    offers = sum(1 for a in app_items if a.stage == "Offer")
    rejections = sum(1 for a in app_items if a.stage == "Rejected")
    interviews = technical + hr

    conversion_rate = round((offers / max(1, total)) * 100, 1)

    # Bottleneck diagnosis
    if total == 0:
        biggest_dropoff = "No Applications Yet"
        coach = "Start applying to benchmark job roles directly from the Job-Market Intel tab."
    elif oa < (applied * 0.4):
        biggest_dropoff = "Resume Screening → Online Assessment (OA)"
        coach = "Your biggest drop-off is between Application and OA. Improve your ATS resume score and include quantified project metrics."
    elif technical < (oa * 0.5):
        biggest_dropoff = "Online Assessment (OA) → Technical Interview"
        coach = "OA drop-off detected. Prioritize Data Structures & Algorithms (Trees, Graphs, DP) in your daily plan."
    elif offers < (interviews * 0.3):
        biggest_dropoff = "Interview → Final Offer"
        coach = "Interview conversion bottleneck. Complete AI Mock Interviews focusing on communication structure and production system design."
    else:
        biggest_dropoff = "Optimal Funnel Flow"
        coach = "Healthy conversion rate across all stages! Keep expanding your pipeline."

    return JobFunnelAnalytics(
        total_applications=total,
        applied_count=applied,
        oa_count=oa,
        interviews_count=interviews,
        technical_count=technical,
        hr_count=hr,
        offers_count=offers,
        rejections_count=rejections,
        conversion_rate_pct=conversion_rate,
        biggest_dropoff_stage=biggest_dropoff,
        ai_bottleneck_coach=coach,
        applications=app_items
    )

@app.get("/api/jobs/match-history", response_model=JobMatchHistoryResponse)
def get_job_match_history(current_user: StudentProfile = Depends(get_user_from_auth)):
    return EngagementEngine.get_job_match_history(current_user)

@app.post("/api/career/linkedin-analyzer", response_model=LinkedInAnalysisResult)
def analyze_linkedin_profile(req: LinkedInAnalysisRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return LinkedInAnalyzerEngine.analyze_profile(req, current_user.career_goal)

@app.get("/api/career/skill-market-demand", response_model=SkillMarketDemandResponse)
def get_skill_market_demand(current_user: StudentProfile = Depends(get_user_from_auth)):
    return SkillMarketDemandEngine.get_market_demand(current_user)

# ==================== FINANCE & CAREER ROI ENGINE ====================

@app.get("/api/finance/budget-analysis")
def get_budget_analysis(current_user: StudentProfile = Depends(get_user_from_auth)):
    return FinanceEngine.analyze_budget(current_user)

@app.post("/api/finance/career-roi", response_model=CareerRoiResponse)
def calculate_career_roi(req: CareerRoiRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerComparatorEngine.calculate_career_roi(req, current_user)

@app.post("/api/finance/should-i-buy", response_model=QuickPurchaseCheckResponse)
def evaluate_purchase(req: QuickPurchaseCheckRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return FinanceEngine.quick_purchase_check(current_user, req)

# ==================== WEALTH & INVESTMENT ENGINE ====================

@app.get("/api/wealth/hub", response_model=InvestmentSavingsHubResponse)
def get_wealth_hub(current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.get_hub_data(current_user)

@app.post("/api/wealth/risk-assessment", response_model=RiskProfileResponse)
def assess_risk(req: RiskAssessmentRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.evaluate_risk_profile(req)

@app.post("/api/wealth/sip-simulator", response_model=SipSimulationResponse)
def simulate_sip(req: SipSimulatorRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.calculate_sip_projections(req)

@app.post("/api/wealth/opportunity-cost", response_model=OpportunityCostResponse)
def calculate_opportunity_cost(req: OpportunityCostRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.evaluate_opportunity_cost(current_user, req.amount_inr, req.candidate_course)

@app.post("/api/wealth/scam-check", response_model=ScamCheckResponse)
def check_investment_scam(req: ScamCheckRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.detect_scam_or_high_risk(req)

@app.get("/api/wealth/digital-twin", response_model=DigitalTwinResponse)
def get_digital_twin(current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.simulate_5year_digital_twin(current_user)

@app.post("/api/wealth/digital-twin/interactive", response_model=InteractiveDigitalTwinResponse)
def get_interactive_digital_twin(req: InteractiveDigitalTwinRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InteractiveDigitalTwinEngine.simulate_scenarios(current_user, req)

@app.post("/api/wealth/trade", response_model=TradeOrderResponse)
def execute_trade(req: TradeOrderRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.execute_trade(current_user.id, current_user, req)

@app.post("/api/wealth/goals")
def create_savings_goal(req: CreateSavingsGoalRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    goal_id = f"goal-{uuid.uuid4().hex[:8]}"
    DatabaseManager.create_savings_goal(
        user_id=current_user.id,
        goal_id=goal_id,
        title=req.title,
        category=req.category,
        icon=req.icon or "🎯",
        target_amount=req.target_amount,
        target_date=req.target_date
    )
    return {"success": True, "goal_id": goal_id, "message": "Savings goal created."}

@app.post("/api/wealth/goals/deposit")
def deposit_savings_goal(req: DepositSavingsGoalRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    updated_goal = DatabaseManager.deposit_to_savings_goal(current_user.id, req.goal_id, req.amount_inr)
    return {"success": True, "updated_goal": updated_goal}

@app.post("/api/wealth/rules/toggle")
def toggle_saving_rule(req: ToggleSavingRuleRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    DatabaseManager.toggle_saving_rule(current_user.id, req.rule_key, req.active)
    return {"success": True, "rule_key": req.rule_key, "active": req.active}

@app.get("/api/wealth/baskets", response_model=MultiCompanyBasketResponse)
def get_multi_company_baskets(
    investment_amount: Optional[float] = Query(None),
    current_user: StudentProfile = Depends(get_user_from_auth)
):
    amount = investment_amount or current_user.financial.available_for_learning or 1500.0
    return InvestmentEngine.generate_multi_company_baskets(current_user, amount)

@app.post("/api/wealth/upi/execute", response_model=UpiPaymentExecuteResponse)
def execute_upi_investment(req: UpiPaymentExecuteRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.execute_upi_investment(current_user.id, current_user, req)

@app.get("/api/wealth/company-chart/{ticker}", response_model=CompanyChartData)
def get_company_chart(ticker: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.get_company_chart(ticker)

# ==================== STRATEGIC ADVISOR & TODAY'S PLAN ====================

@app.post("/api/decision/evaluate", response_model=DecisionEvaluationResponse)
def evaluate_decision(req: DecisionEvaluationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return DecisionEngine.evaluate_decision(current_user, req)

@app.get("/api/career/weekly-review", response_model=WeeklyReviewData)
def get_weekly_review(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.generate_weekly_review(current_user)

@app.get("/api/career/daily-plan", response_model=DailyActionPlan)
def get_daily_plan(date_str: Optional[str] = Query(None), current_user: StudentProfile = Depends(get_user_from_auth)):
    target_date = date_str or None
    return CareerEngine.generate_daily_plan(current_user, target_date)

@app.post("/api/career/daily-plan/toggle-task/{task_id}")
def toggle_daily_task(task_id: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    profile = current_user
    today_tasks = DatabaseManager.get_daily_tasks(profile.id)
    task_row = next((t for t in today_tasks if t["id"] == task_id), None)
    
    completed = DatabaseManager.toggle_task_completion(task_id, profile.id)
    
    all_tasks = DatabaseManager.get_daily_tasks(profile.id)
    total = sum(1 for t in all_tasks if t["completed"])

    skill_gained = None
    if completed:
        skill_name = "DSA"
        if task_row:
            subject = (task_row.get("subject") or "").lower()
            topic = (task_row.get("topic") or "").lower()
            if "dsa" in subject or "dsa" in topic or "problem solving" in subject:
                skill_name = "DSA"
            elif "project" in subject or "docker" in topic or "api" in topic:
                skill_name = "FastAPI" if any(s.name == "FastAPI" for s in profile.skills) else "Docker"
            elif "career" in subject or "network" in subject:
                skill_name = "Communication & Networking"
            else:
                gaps = CareerEngine.analyze_skill_gap(profile)
                if gaps:
                    skill_name = gaps[0].skill
                else:
                    skill_name = "Machine Learning"

        curr_prof = next((s.proficiency for s in profile.skills if s.name.lower() == skill_name.lower()), 3.0)
        new_prof = round(min(10.0, curr_prof + 0.1), 1)
        
        updated_profile, summary = ProgressEngine.apply_progress_update(profile, {skill_name: new_prof})
        DatabaseManager.save_profile(updated_profile)
        
        skill_gained = {
            "skill": skill_name,
            "old_proficiency": curr_prof,
            "new_proficiency": new_prof,
            "readiness_pct": summary.get("new_readiness_pct", 44),
            "change_pct": summary.get("change_pct", 0),
            "feedback": summary.get("feedback", f"Inferred +0.1 growth in {skill_name}!")
        }

    return {
        "task_id": task_id, 
        "completed": completed, 
        "total_completed": total,
        "skill_gained": skill_gained
    }

@app.post("/api/progress/update")
def update_progress(payload: ProgressUpdatePayload, current_user: StudentProfile = Depends(get_user_from_auth)):
    updated_profile, summary = ProgressEngine.apply_progress_update(current_user, payload.skill_updates)
    return {
        "profile": updated_profile,
        "summary": summary
    }

# ==================== AI COPILOT & INTENT PARSER ====================

class IntentRequest(BaseModel):
    text: str

@app.post("/api/ai/parse-intent", response_model=LLMIntentAnalysis)
def parse_student_intent(req: IntentRequest):
    return LLMService.parse_intent(req.text)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/ai/chat")
async def chat_with_copilot(req: ChatRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return await LLMService.chat_copilot(current_user, req.message)

# ==================== ENGAGEMENT, GAMIFICATION & NOTIFICATIONS ====================

@app.get("/api/notifications", response_model=NotificationsResponse)
def get_user_notifications(current_user: StudentProfile = Depends(get_user_from_auth)):
    return EngagementEngine.get_notifications(current_user)

@app.get("/api/gamification/status", response_model=GamificationStatusResponse)
def get_gamification_status(current_user: StudentProfile = Depends(get_user_from_auth)):
    return EngagementEngine.get_gamification_status(current_user)

# ==================== STATIC FRONTEND SERVING (UNIFIED RENDER DEPLOYMENT) ====================
frontend_dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if not os.path.exists(frontend_dist_dir):
    frontend_dist_dir = os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist"))

if os.path.exists(frontend_dist_dir):
    assets_dir = os.path.join(frontend_dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_dist_dir, full_path)
        if full_path and os.path.exists(file_path) and not os.path.isdir(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "Frontend not built yet. Run `npm run build` in frontend directory."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

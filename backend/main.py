from fastapi import FastAPI, HTTPException, Header, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uuid

from models import (
    StudentProfile, SkillItem, SkillGapItem, CareerMatch,
    LearningRoadmap, RecommendedProject, CertificationAffordability,
    CourseCard, DailyActionPlan, DecisionEvaluationRequest,
    DecisionEvaluationResponse, ProgressUpdatePayload, LLMIntentAnalysis,
    UserRegisterRequest, UserLoginRequest, AuthResponse,
    SimulationRequest, SimulationResponse, PlacementReadinessBreakdown,
    SkillGraphData, JobMarketData, ResumeAnalyzeRequest, ResumeAnalysisResponse,
    DetailedProjectBlueprint, QuickPurchaseCheckRequest, QuickPurchaseCheckResponse,
    WeeklyReviewData, InvestmentReadinessResponse, RiskAssessmentRequest,
    RiskProfileResponse, SipSimulatorRequest, SipSimulationResponse,
    OpportunityCostRequest, OpportunityCostResponse, ScamCheckRequest, ScamCheckResponse,
    DigitalTwinResponse, InvestmentAsset, TradeOrderRequest, TradeOrderResponse,
    CreateSavingsGoalRequest, DepositSavingsGoalRequest, ToggleSavingRuleRequest,
    InvestmentSavingsHubResponse, MultiCompanyBasketResponse, UpiPaymentExecuteRequest,
    UpiPaymentExecuteResponse, CompanyChartData
)
from engines.career_engine import CareerEngine
from engines.finance_engine import FinanceEngine
from engines.investment_engine import InvestmentEngine
from engines.decision_engine import DecisionEngine
from engines.progress_engine import ProgressEngine
from engines.simulation_engine import AdvancedSimulationEngine
from engines.llm_service import LLMService
from database import (
    DatabaseManager, hash_password
)

app = FastAPI(
    title="AI Career + Finance Copilot API (Enterprise Production)",
    description="Adaptive AI Decision Engine with SQLite Persistence, JWT Auth, and Dynamic What-If Simulators",
    version="2.1.0"
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
    authorization: Optional[str] = Header(None),
    user_id: Optional[str] = Query(None)
) -> StudentProfile:
    # 1. Bearer Token Verification in SQLite
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        profile = DatabaseManager.get_user_by_token(token)
        if profile:
            return profile
            
    # 2. Query parameter verification
    if user_id:
        profile = DatabaseManager.get_profile_by_user_id(user_id)
        if profile:
            return profile
            
    raise HTTPException(status_code=401, detail="Authentication required. Please log in or create your student profile.")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "AI Career + Finance Copilot", "database": "SQLite Persistent", "version": "3.0.0"}

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

@app.post("/api/auth/register", response_model=AuthResponse)
def register_user(req: UserRegisterRequest):
    email_clean = req.email.strip().lower()
    existing = DatabaseManager.get_user_by_email(email_clean)
    if existing:
        raise HTTPException(status_code=400, detail="Account with this email already exists. Please sign in.")
        
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
        raise HTTPException(status_code=404, detail="Student profile not found. Please register a new account.")
        
    token = DatabaseManager.create_session(uid)
    
    return AuthResponse(
        token=token,
        user_id=uid,
        name=profile.name,
        email=email_clean,
        profile=profile
    )

@app.get("/api/auth/me", response_model=StudentProfile)
def get_current_logged_in_user(current_user: StudentProfile = Depends(get_user_from_auth)):
    return current_user

@app.post("/api/auth/logout")
def logout_user(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        DatabaseManager.delete_session(token)
    return {"status": "logged_out"}

# ==================== PROFILE ENDPOINTS ====================

@app.get("/api/profile", response_model=StudentProfile)
def get_profile(current_user: StudentProfile = Depends(get_user_from_auth)):
    return current_user

@app.post("/api/profile", response_model=StudentProfile)
def update_profile(profile: StudentProfile, current_user: StudentProfile = Depends(get_user_from_auth)):
    profile.id = current_user.id
    saved = DatabaseManager.save_profile(profile)
    return saved

@app.post("/api/profile/reset", response_model=StudentProfile)
def reset_profile(current_user: StudentProfile = Depends(get_user_from_auth)):
    # Reset learning streak and proficiency to baseline for current logged in user
    current_user.total_xp = 0
    current_user.streak_days = 0
    current_user.user_level = 1
    current_user.level_title = "Aspiring Specialist"
    saved = DatabaseManager.save_profile(current_user)
    return saved

# ==================== SIMULATION ENGINE (WHAT-IF, RESUME, JOB MARKET) ====================

@app.post("/api/simulation/what-if", response_model=SimulationResponse)
def simulate_what_if(req: SimulationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.simulate_what_if(current_user, req)

@app.get("/api/simulation/placement-breakdown", response_model=PlacementReadinessBreakdown)
def get_placement_readiness_breakdown(current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.get_placement_readiness_breakdown(current_user)

@app.get("/api/simulation/skill-graph", response_model=SkillGraphData)
def get_skill_dependency_graph(current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.get_skill_dependency_graph(current_user)

@app.get("/api/simulation/job-market", response_model=JobMarketData)
def get_job_market_benchmark(current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.get_job_market_benchmark(current_user)

@app.post("/api/simulation/resume-analyzer", response_model=ResumeAnalysisResponse)
def analyze_resume(req: ResumeAnalyzeRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.analyze_resume(req)

@app.get("/api/simulation/project-blueprints", response_model=List[DetailedProjectBlueprint])
def get_project_blueprints():
    return AdvancedSimulationEngine.get_detailed_project_blueprints()

@app.post("/api/finance/should-i-buy", response_model=QuickPurchaseCheckResponse)
def check_purchase_decision(req: QuickPurchaseCheckRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.check_purchase(current_user, req)

@app.get("/api/progress/weekly-review", response_model=WeeklyReviewData)
def get_weekly_review(current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.get_weekly_review(current_user)

# ==================== CAREER ENGINE ENDPOINTS ====================

@app.get("/api/career/readiness")
def get_career_readiness(current_user: StudentProfile = Depends(get_user_from_auth)):
    pct, score, strong, missing, partial = CareerEngine.calculate_readiness(current_user, current_user.career_goal)
    return {
        "student_name": current_user.name,
        "career_goal": current_user.career_goal,
        "readiness_pct": pct,
        "readiness_score": score,
        "strong_skills": strong,
        "missing_skills": missing,
        "partial_skills": partial
    }

@app.get("/api/career/recommendations", response_model=List[CareerMatch])
def get_career_recommendations(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.get_career_recommendations(current_user)

@app.get("/api/career/skill-gaps", response_model=List[SkillGapItem])
def get_skill_gaps(target_role: Optional[str] = None, current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.analyze_skill_gap(current_user, target_role)

@app.get("/api/career/roadmap", response_model=LearningRoadmap)
def get_learning_roadmap(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.generate_roadmap(current_user)

@app.get("/api/career/projects", response_model=List[RecommendedProject])
def get_recommended_projects(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.get_recommended_projects(current_user)

# ==================== FINANCE ENGINE ENDPOINTS ====================

@app.get("/api/finance/budget-analysis")
def get_budget_analysis(emergency_shock: float = 0.0, current_user: StudentProfile = Depends(get_user_from_auth)):
    return FinanceEngine.analyze_budget(current_user, emergency_shock)

@app.get("/api/finance/certification-affordability", response_model=CertificationAffordability)
def get_certification_affordability(
    cert_name: str = "AWS Certified Solutions Architect",
    cost_inr: float = 10000.0,
    exam_target_months: int = 4,
    current_user: StudentProfile = Depends(get_user_from_auth)
):
    return FinanceEngine.evaluate_certification(current_user, cert_name, cost_inr, exam_target_months)

@app.get("/api/finance/courses", response_model=List[CourseCard])
def get_courses(topic: str = "Deep Learning", current_user: StudentProfile = Depends(get_user_from_auth)):
    return FinanceEngine.get_curated_courses(current_user, topic)

# ==================== WEALTH BUILDER & INVESTMENT ENGINE ENDPOINTS ====================

@app.get("/api/wealth/readiness", response_model=InvestmentReadinessResponse)
def get_investment_readiness(current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.calculate_investment_readiness(current_user)

@app.post("/api/wealth/risk-assessment", response_model=RiskProfileResponse)
def evaluate_risk_profile(req: RiskAssessmentRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.evaluate_risk_profile(req)

@app.post("/api/wealth/sip-simulator", response_model=SipSimulationResponse)
def calculate_sip_projections(req: SipSimulatorRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.calculate_sip_projections(req)

@app.post("/api/wealth/opportunity-cost", response_model=OpportunityCostResponse)
def evaluate_opportunity_cost(req: Optional[OpportunityCostRequest] = None, current_user: StudentProfile = Depends(get_user_from_auth)):
    amt = req.amount_inr if req else 2000.0
    course = req.candidate_course if req else None
    return InvestmentEngine.evaluate_opportunity_cost(current_user, amt, course)

@app.post("/api/wealth/scam-detector", response_model=ScamCheckResponse)
def detect_investment_scam(req: ScamCheckRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.detect_scam_or_high_risk(req)

@app.get("/api/wealth/digital-twin", response_model=DigitalTwinResponse)
def get_5year_digital_twin(current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.simulate_5year_digital_twin(current_user)

@app.get("/api/wealth/hub", response_model=InvestmentSavingsHubResponse)
def get_investment_savings_hub(current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.get_hub_data(current_user)

@app.get("/api/wealth/curated-assets", response_model=List[InvestmentAsset])
def get_curated_investment_assets():
    return InvestmentEngine.get_curated_assets()

@app.get("/api/wealth/company-chart/{ticker}", response_model=CompanyChartData)
def get_company_chart(ticker: str, timeframe: str = "6M"):
    return InvestmentEngine.get_company_chart(ticker, timeframe)

@app.post("/api/wealth/trade", response_model=TradeOrderResponse)
def execute_trade_order(req: TradeOrderRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.execute_trade(current_user.id, current_user, req)

@app.post("/api/wealth/goals/create")
def create_savings_goal(req: CreateSavingsGoalRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    goal_id = DatabaseManager.add_savings_goal(
        current_user.id, req.title, req.category, req.icon or "🎯",
        req.target_amount_inr, req.current_amount_inr or 0.0, req.target_date
    )
    return {"success": True, "goal_id": goal_id, "goals": InvestmentEngine.get_savings_goals(current_user.id)}

@app.post("/api/wealth/goals/deposit")
def deposit_to_savings_goal(req: DepositSavingsGoalRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    success, new_amt = DatabaseManager.deposit_to_savings_goal(current_user.id, req.goal_id, req.amount_inr)
    return {"success": success, "new_amount": new_amt, "goals": InvestmentEngine.get_savings_goals(current_user.id)}

@app.post("/api/wealth/saving-rules/toggle")
def toggle_saving_rule(req: ToggleSavingRuleRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    DatabaseManager.toggle_saving_rule(current_user.id, req.rule_key, req.active)
    return {"success": True, "rules": InvestmentEngine.get_saving_rules(current_user.id)}

@app.get("/api/wealth/multi-company-baskets", response_model=MultiCompanyBasketResponse)
def get_multi_company_baskets(amount_inr: float = 2000.0, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.generate_multi_company_baskets(current_user, amount_inr)

@app.post("/api/wealth/upi-pay", response_model=UpiPaymentExecuteResponse)
def execute_upi_payment(req: UpiPaymentExecuteRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return InvestmentEngine.execute_upi_investment(current_user.id, current_user, req)

@app.get("/api/wealth/transactions")
def get_wealth_transactions(current_user: StudentProfile = Depends(get_user_from_auth)):
    return {"transactions": DatabaseManager.get_user_transactions(current_user.id)}


# ==================== DECISION ENGINE ENDPOINTS ====================

@app.post("/api/decision/evaluate", response_model=DecisionEvaluationResponse)
def evaluate_decision(request: DecisionEvaluationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return DecisionEngine.evaluate_scenario(current_user, request)

# ==================== PROGRESS & DATE-AWARE DAILY ACTION PLAN ====================

@app.get("/api/progress/daily-plan", response_model=DailyActionPlan)
def get_daily_action_plan(date_str: Optional[str] = None, current_user: StudentProfile = Depends(get_user_from_auth)):
    return ProgressEngine.generate_daily_plan(current_user, date_str)

@app.post("/api/progress/toggle-task/{task_id}")
def toggle_daily_task(task_id: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    completed, total = DatabaseManager.toggle_task(current_user.id, task_id)
    
    skill_gained = None
    if completed:
        task_row = DatabaseManager.get_task_by_id(current_user.id, task_id)
        profile = DatabaseManager.get_profile_by_user_id(current_user.id) or current_user
        
        # Determine skill based on task subject/action/topic
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

        # Look up current proficiency
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from AI-Career-Fintech"}

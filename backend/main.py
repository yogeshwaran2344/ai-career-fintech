from fastapi import FastAPI, HTTPException, Header, Depends, Query, status, UploadFile, File, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uuid
import os
import asyncio
import datetime

from models import (
    StudentProfile, SkillItem, SkillGapItem, CareerMatch,
    LearningRoadmap, RecommendedProject, CertificationAffordability,
    CourseCard, CompleteCourseRequest, DailyActionPlan, DecisionEvaluationRequest,
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
    InteractiveDigitalTwinRequest, InteractiveDigitalTwinResponse,
    LiveMarketQuote, MarketOverviewResponse, MarketChartResponse,
    BrokerConnectRequest, BrokerStatusResponse, BrokerPortfolioResponse,
    PlaceBrokerOrderRequest, BrokerOrderResult,
    CreateUpiMandateRequest, UpiMandateResponse, RealAiWealthAuditResponse,
    OrdersSummaryResponse, CareerVsInvestmentDecisionRequest, CareerVsInvestmentDecisionResponse,
    FinancialSafetyCheckResponse, FinancialHealthSummary,
    StudyAbroadOverviewResponse, UpdateStudyAbroadSelectionRequest, UpdateUniversityChecklistRequest,
    SopLorGenerationRequest, SopLorGenerationResponse,
    ExamQuestion, GeneratePracticeSetRequest, PracticeSetResponse, SubmitPracticeSetRequest,
    PracticeSetEvaluationResponse, MockExamBlueprint, StartMockExamRequest, SubmitMockExamRequest,
    MockExamEvaluationResponse, MockScoreHistoryItem, MistakeBankResponse, MistakeBankItem, WritingEvaluationRequest,
    WritingEvaluationResponse, SpeakingEvaluationRequest, SpeakingEvaluationResponse,
    ExamAnalyticsSummary, MastersOverallReadiness, StudyAbroadPrepBudget, TopicPerformance,
    PreviousYearPaper, PreviousYearPapersListResponse,
    LearningDecayConcept, LearningDecayStatusResponse, ConceptReviewRequest,
    ConceptQuizQuestion, ConceptQuizResponse, SubmitConceptQuizRequest, ConceptQuizEvaluationResponse,
    NextBestActionItem, StudentIntelligenceResponse, CompleteActionRequest,
    UserResumeData, AddProjectToResumeRequest, StockAdvisorResponse,
    ProfileResetRequest, ProfileResetResponse, RecordProjectEvidenceRequest, TargetRoleChangeRequest
)
from engines.career_comparator import CareerComparatorEngine
from engines.career_engine import CareerEngine, ROLE_BENCHMARKS
from engines.finance_engine import FinanceEngine
from engines.investment_engine import InvestmentEngine
from engines.decision_engine import DecisionEngine
from engines.progress_engine import ProgressEngine
from engines.simulation_engine import AdvancedSimulationEngine
from engines.llm_service import LLMService
from engines.interview_engine import MockInterviewEngine
from engines.skill_assessment_engine import SkillAssessmentEngine
from engines.github_engine import GitHubAnalyzerEngine
from engines.resume_parser import ResumeParserEngine
from engines.linkedin_analyzer import LinkedInAnalyzerEngine
from engines.market_demand_engine import SkillMarketDemandEngine
from engines.interactive_digital_twin import InteractiveDigitalTwinEngine
from engines.engagement_engine import EngagementEngine
from engines.market_data_service import MarketDataService
from engines.broker_adapters import BrokerManager
from engines.real_portfolio_engine import RealPortfolioEngine
from engines.order_execution_engine import OrderExecutionEngine
from engines.real_ai_wealth_copilot import RealAiWealthCopilot
from engines.study_abroad_engine import StudyAbroadEngine
from engines.exam_bank_engine import ExamBankEngine, SEED_QUESTIONS_BANK
from engines.learning_decay_engine import LearningDecayEngine
from engines.student_intelligence_engine import StudentIntelligenceEngine
from engines.stock_advisor_engine import StockAdvisorEngine
from database import (
    DatabaseManager, hash_password, verify_password, get_db_connection
)

app = FastAPI(
    title="Elevare Intelligence Platform API",
    description="Adaptive Career & Wealth Intelligence Platform with Strict Authentication, Strategic Projections, and Real Decision Simulators",
    version="3.0.0"
)

# Security: Explicit Allowed Origins (No allow_origins=["*"] with credentials)
ALLOWED_ORIGINS_ENV = os.environ.get("ALLOWED_ORIGINS", "")
if ALLOWED_ORIGINS_ENV:
    ALLOWED_ORIGINS = [o.strip() for o in ALLOWED_ORIGINS_ENV.split(",") if o.strip()]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
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
    return {"status": "healthy", "service": "Elevare Platform", "database": "SQLite Persistent", "version": "3.0.0"}

@app.get("/llms.txt", response_class=PlainTextResponse)
def get_llms_txt():
    """
    Standard machine-readable manifest for AI chatbots, agents, and LLMs (llms.txt standard).
    """
    return """# Elevare Platform

> Integrated Career & Wealth Intelligence Platform for University Students and Young Professionals.

## Overview
Elevare connects human capital development (skill roadmaps, ATS resume optimization, mock interviews, GitHub code analysis, and placement readiness) with financial intelligence (SEBI-aligned 5-gate safety check, Career ROI vs Stock Investment comparator, Live Regulated Broker OMS execution, and safe NPCI UPI mandate management).

## Core Capabilities & Engines

### 1. Career Engine & Human Capital
- Placement Readiness Formula: Technical Skills (30%) + Projects (20%) + Resume ATS (15%) + DSA Proficiency (15%) + Mock Interviews (10%) + GitHub Repos (10%).
- AI Mock Interview Engine: Technical and behavioral question generation with rubric-based transcript evaluations.
- Skill Demand Telemetry: Real-time industry demand tracking for tech stacks.
- Career vs Investment Comparator: Quantitative tradeoff analysis evaluating whether capital (e.g. ₹10,000) is better allocated to high-ROI career certifications or stock market SIPs.

### 2. Wealth & Financial Engine
- Financial Safety Center: 5-Gate prerequisite checklist (Emergency Fund runway, debt clearance, healthcare buffer, stable surplus, risk literacy) before market exposure.
- Pluggable Regulated Broker OMS: Zero-credential architecture connecting to Groww, Zerodha, Upstox, Angel One, Dhan, Kotak Neo, ICICI Direct, and HDFC Sky with mandatory 2-step order review.
- Statutory Charges Engine: Computes STT, exchange turnover fees, SEBI charges, stamp duty, and GST on trades.
- Safe NPCI UPI Mandate Flow: Collect mandate initiation with zero user PIN storage or interception.
- Live NSE/BSE Telemetry: Real-time stock ticks, 5-level market depth, and historical candlestick charts.

## Machine-Readable API Endpoints
- OpenAPI Schema (JSON): /openapi.json
- Interactive Swagger UI: /docs
- ReDoc UI: /redoc
- Health Check: /api/health
- Broker Orders Summary: /api/broker/orders/summary
- Career ROI vs Investment: /api/career/career-vs-investment
- Financial Safety Status: /api/wealth/financial-safety
"""

@app.get("/api/manifest")
def get_api_manifest():
    return {
        "platform": "Elevare Platform",
        "version": "3.0.0",
        "description": "Unified Career Intelligence & Regulated Fintech Engine",
        "openapi_schema": "/openapi.json",
        "docs_url": "/docs",
        "llms_manifest": "/llms.txt",
        "auth_policy": "Strict Bearer Token (zero query-param auth)",
        "security": {
            "password_hashing": "bcrypt (12 rounds) with individual unique salts",
            "broker_policy": "Zero-Credential Architecture (No broker/bank passwords or UPI PINs stored)",
            "order_execution": "Two-step user confirmation review before broker OMS dispatch"
        }
    }

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
    email_auto = req.email.strip().lower() if (req.email and req.email.strip()) else f"{name_clean.lower().replace(' ', '_')}_{uuid.uuid4().hex[:6]}@student.ai"
    pwd = req.password if (req.password and req.password.strip()) else f"pwd-{uuid.uuid4().hex}"
    
    existing_user = DatabaseManager.get_user_by_email(email_auto)
    new_profile = StudentProfile(
        id=user_id if not existing_user else existing_user["id"],
        name=name_clean,
        email=email_auto,
        avatar=req.avatar or "👨‍💻",
        career_goal=req.career_goal,
        academic=req.academic,
        skills=req.skills,
        financial=req.financial,
        preferences=req.preferences
    )
    
    if existing_user:
        if req.password and req.password.strip():
            new_hash = hash_password(req.password.strip())
            DatabaseManager.update_password_hash(existing_user["id"], new_hash)
        user_id = existing_user["id"]
        DatabaseManager.save_profile(new_profile)
        token = DatabaseManager.create_session(user_id, duration_days=90)
    else:
        user_id, token = DatabaseManager.create_user(
            name=name_clean,
            email=email_auto,
            password_plain=pwd,
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
def register_user(req: UserRegisterRequest, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    email_clean = req.email.strip().lower()
    rate_key = f"auth_register:{client_ip}:{email_clean}"
    
    allowed, attempts, retry_after = DatabaseManager.check_rate_limit(rate_key, max_attempts=5, window_seconds=300)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many registration attempts. Please wait {retry_after} seconds before trying again."
        )

    existing = DatabaseManager.get_user_by_email(email_clean)
    if existing:
        DatabaseManager.record_auth_attempt(rate_key, success=False)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in instead."
        )
        
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
    
    DatabaseManager.record_auth_attempt(rate_key, success=True)
    return AuthResponse(
        token=token,
        user_id=user_id,
        name=new_profile.name,
        email=email_clean,
        profile=new_profile
    )

@app.post("/api/auth/login", response_model=AuthResponse)
def login_user(req: UserLoginRequest, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    email_clean = req.email.strip().lower()
    rate_key = f"auth_login:{client_ip}:{email_clean}"

    allowed, attempts, retry_after = DatabaseManager.check_rate_limit(rate_key, max_attempts=5, window_seconds=300)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please wait {retry_after} seconds before trying again."
        )

    user_row = DatabaseManager.get_user_by_email(email_clean)
    if not user_row:
        DatabaseManager.record_auth_attempt(rate_key, success=False)
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    is_valid = verify_password(req.password, user_row["password_hash"])
    if not is_valid:
        DatabaseManager.record_auth_attempt(rate_key, success=False)
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    DatabaseManager.record_auth_attempt(rate_key, success=True)
    uid = user_row["id"]
    profile = DatabaseManager.get_profile_by_user_id(uid)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    token = DatabaseManager.create_session(uid, device_info="Web App / Desktop", duration_days=90)
    
    return AuthResponse(
        token=token,
        user_id=uid,
        name=user_row["name"],
        email=email_clean,
        profile=profile
    )

class UserResetPasswordRequest(BaseModel):
    email: str
    new_password: str

@app.post("/api/auth/reset-password", response_model=AuthResponse)
def reset_user_password(req: UserResetPasswordRequest):
    email_clean = req.email.strip().lower()
    user_row = DatabaseManager.get_user_by_email(email_clean)
    if not user_row:
        raise HTTPException(status_code=404, detail="No registered account found with this email.")
        
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
        
    new_hash = hash_password(req.new_password)
    DatabaseManager.update_password_hash(user_row["id"], new_hash)
    
    uid = user_row["id"]
    profile = DatabaseManager.get_profile_by_user_id(uid)
    token = DatabaseManager.create_session(uid, device_info="Web App / Password Reset", duration_days=30)
    
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
        token = authorization.split(" ")[1].strip()
        DatabaseManager.revoke_session(token)
    return {"message": "Session revoked successfully.", "logged_out": True}

@app.post("/api/auth/logout-all")
def logout_all_devices(current_user: StudentProfile = Depends(get_user_from_auth)):
    DatabaseManager.revoke_all_user_sessions(current_user.id)
    return {"message": "All active device sessions have been revoked."}

@app.get("/api/auth/sessions")
def get_user_sessions(current_user: StudentProfile = Depends(get_user_from_auth)):
    return {
        "user_id": current_user.id,
        "active_sessions": DatabaseManager.get_active_sessions(current_user.id)
    }

# ==================== PROFILE MANAGEMENT ====================

@app.get("/api/profile", response_model=StudentProfile)
def get_profile(current_user: StudentProfile = Depends(get_user_from_auth)):
    return current_user

@app.post("/api/profile", response_model=StudentProfile)
def save_profile(profile: StudentProfile, current_user: StudentProfile = Depends(get_user_from_auth)):
    profile.id = current_user.id
    profile.email = current_user.email
    return DatabaseManager.save_profile(profile)

@app.post("/api/profile/reset", response_model=ProfileResetResponse)
def reset_profile(req: ProfileResetRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    if req.confirm_phrase.strip().upper() not in ["CONFIRM_RESET", "RESET"]:
        raise HTTPException(
            status_code=400,
            detail="Profile reset requires explicit confirmation. Please provide confirm_phrase='RESET' to permanently delete tasks and activity progress."
        )
    
    deleted_counts = DatabaseManager.reset_user_data(
        current_user.id,
        reset_tasks=req.reset_tasks,
        reset_activities=req.reset_activities,
        reset_exam_history=req.reset_exam_history
    )
    
    current_user.total_xp = 50
    current_user.user_level = 1
    current_user.streak_days = 1
    current_user.badges = ["🌱 Welcome Badge"]
    saved_profile = DatabaseManager.save_profile(current_user)
    
    return ProfileResetResponse(
        success=True,
        message=f"User data successfully reset. Removed {deleted_counts.get('daily_tasks', 0)} daily tasks, {deleted_counts.get('completed_activities', 0)} activity logs, and {deleted_counts.get('course_progress', 0)} course progress records.",
        deleted_records=deleted_counts,
        updated_profile=saved_profile
    )

@app.get("/api/profile/export")
def export_user_data(current_user: StudentProfile = Depends(get_user_from_auth)):
    """
    Data Export: Exports student's complete profile, daily tasks, completed activities,
    learning decay records, and portfolio holdings as a portable JSON payload.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM daily_tasks WHERE user_id = ?", (current_user.id,))
    tasks = [dict(r) for r in cursor.fetchall()]
    cursor.execute("SELECT * FROM user_completed_activities WHERE user_id = ?", (current_user.id,))
    activities = [dict(r) for r in cursor.fetchall()]
    cursor.execute("SELECT * FROM user_learning_decay WHERE user_id = ?", (current_user.id,))
    decay = [dict(r) for r in cursor.fetchall()]
    cursor.execute("SELECT * FROM user_holdings WHERE user_id = ?", (current_user.id,))
    holdings = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {
        "export_timestamp": datetime.datetime.now().isoformat(),
        "user_id": current_user.id,
        "profile": current_user.model_dump(),
        "daily_tasks": tasks,
        "completed_activities": activities,
        "learning_decay_concepts": decay,
        "portfolio_holdings": holdings
    }

# ==================== ADVANCED CAREER ENGINE ====================

@app.post("/api/career/target-role")
def change_target_role(req: TargetRoleChangeRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    matching = [r for r in ROLE_BENCHMARKS if r.lower() == req.target_role.strip().lower()]
    if matching:
        target_role = matching[0]
    elif req.target_role.strip() in ROLE_BENCHMARKS:
        target_role = req.target_role.strip()
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Target role '{req.target_role}' is not in supported industry benchmarks ({len(ROLE_BENCHMARKS)} roles available)."
        )
        
    current_user.career_goal = target_role
    DatabaseManager.save_profile(current_user)
    
    readiness = CareerEngine.calculate_readiness(current_user, target_role)
    skill_gaps = CareerEngine.analyze_skill_gap(current_user, target_role)
    roadmap = CareerEngine.generate_roadmap(current_user)
    projects = CareerEngine.recommend_projects(current_user)
    
    return {
        "success": True,
        "target_role": target_role,
        "readiness": readiness,
        "skill_gaps": skill_gaps,
        "roadmap": roadmap,
        "projects": projects,
        "profile": current_user
    }

@app.post("/api/career/projects/record-evidence")
def record_project_evidence(req: RecordProjectEvidenceRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    if not req.project_title.strip() or not req.github_url.strip():
        raise HTTPException(status_code=400, detail="Project title and GitHub repository URL are required.")
    
    updated_skills = {s.name.lower(): s for s in current_user.skills}
    for tech in req.tech_stack:
        tech_clean = tech.strip()
        t_key = tech_clean.lower()
        if t_key in updated_skills:
            updated_skills[t_key].proficiency = min(10.0, round(updated_skills[t_key].proficiency + 0.8, 1))
            if updated_skills[t_key].proficiency >= 7.5:
                updated_skills[t_key].level = "Advanced"
            elif updated_skills[t_key].proficiency >= 5.0:
                updated_skills[t_key].level = "Intermediate"
        else:
            new_skill = SkillItem(name=tech_clean, level="Intermediate", proficiency=6.0, category="Practical Project")
            current_user.skills.append(new_skill)
            updated_skills[t_key] = new_skill
            
    current_user.total_xp += 75
    if "🛠️ Verified Project Builder" not in current_user.badges:
        current_user.badges.append("🛠️ Verified Project Builder")
        
    DatabaseManager.save_profile(current_user)
    DatabaseManager.record_completed_activity(
        user_id=current_user.id,
        activity_type="PROJECT_EVIDENCE_RECORDED",
        activity_title=f"Recorded Project: {req.project_title}",
        metadata={"github": req.github_url, "metrics": req.metrics_achieved, "tech_stack": req.tech_stack, "xp_earned": 75}
    )
    
    readiness = CareerEngine.calculate_readiness(current_user, current_user.career_goal)
    
    return {
        "success": True,
        "message": f"Project '{req.project_title}' successfully recorded and verified in your engineering portfolio.",
        "xp_earned": 75,
        "ats_impact": "+8% Resume ATS Boost (Quantified engineering project evidence attached)",
        "readiness": readiness,
        "updated_profile": current_user
    }

@app.get("/api/career/readiness")
def get_career_readiness(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.calculate_readiness(current_user)

@app.get("/api/career/placement-breakdown", response_model=PlacementReadinessBreakdown)
def get_placement_breakdown(current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.get_placement_readiness_breakdown(current_user)

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
    blueprints = AdvancedSimulationEngine.get_detailed_project_blueprints()
    for bp in blueprints:
        if bp.title.lower() == project_title.lower():
            return bp
    return blueprints[0] if blueprints else None

@app.post("/api/career/simulate", response_model=SimulationResponse)
def simulate_career_path(req: SimulationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.simulate_what_if(current_user, req)

@app.post("/api/career/compare-paths", response_model=CareerPathCompareResponse)
def compare_career_paths(req: CareerPathCompareRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerComparatorEngine.compare_paths(req.roles, current_user)

@app.get("/api/career/skill-graph", response_model=SkillGraphData)
def get_skill_graph(current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.get_skill_dependency_graph(current_user)

@app.get("/api/career/job-market", response_model=JobMarketData)
def get_job_market(current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.get_job_market_benchmark(current_user)

# ==================== SIMULATION COMPATIBILITY ALIASES ====================

@app.post("/api/simulation/what-if", response_model=SimulationResponse)
def simulate_career_path_alias(req: SimulationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.simulate_what_if(current_user, req)

@app.get("/api/simulation/skill-graph", response_model=SkillGraphData)
def get_skill_graph_alias(current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.get_skill_dependency_graph(current_user)

@app.get("/api/simulation/job-market", response_model=JobMarketData)
def get_job_market_alias(current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.get_job_market_benchmark(current_user)

@app.post("/api/simulation/resume-analyzer", response_model=ResumeAnalysisResponse)
def analyze_resume_alias(req: ResumeAnalyzeRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    try:
        return ResumeParserEngine.analyze_resume_text(req.resume_text, req.target_role or current_user.career_goal)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/simulation/placement-breakdown", response_model=PlacementReadinessBreakdown)
def get_placement_breakdown_alias(current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.get_placement_readiness_breakdown(current_user)

@app.get("/api/simulation/project-blueprints")
def get_project_blueprints_alias(current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerEngine.recommend_projects(current_user)


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
    try:
        return ResumeParserEngine.analyze_resume_text(req.resume_text, req.target_role or current_user.career_goal)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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
    oa = sum(1 for a in app_items if a.stage in ["Assessment", "OA"])
    interview_general = sum(1 for a in app_items if a.stage in ["Interview", "First Round"])
    technical = sum(1 for a in app_items if a.stage in ["Technical", "Technical Interview"])
    hr = sum(1 for a in app_items if a.stage in ["HR", "HR Round"])
    offers = sum(1 for a in app_items if a.stage == "Offer")
    rejections = sum(1 for a in app_items if a.stage == "Rejected")
    interviews = interview_general + technical + hr

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

# ==================== VERIFIED COURSE CATALOG & PROGRESS TRACKING ====================

@app.get("/api/finance/courses", response_model=List[CourseCard])
@app.get("/api/career/curated-courses", response_model=List[CourseCard])
def get_curated_courses_endpoint(topic: Optional[str] = Query("Deep Learning"), current_user: StudentProfile = Depends(get_user_from_auth)):
    return FinanceEngine.get_curated_courses(current_user, topic or "Deep Learning")

@app.get("/api/career/courses/enrolled")
def get_enrolled_courses(current_user: StudentProfile = Depends(get_user_from_auth)):
    return DatabaseManager.get_user_course_progress(current_user.id)

@app.post("/api/career/courses/complete")
def complete_course(req: CompleteCourseRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    was_first = DatabaseManager.mark_course_completed(
        user_id=current_user.id,
        course_id=req.course_id,
        course_title=req.course_title or req.course_id,
        provider=req.provider or "Verified Provider",
        skill_targeted=req.skill_targeted or "Technical",
        credential_type=req.credential_type or "COMPLETION_CERTIFICATE"
    )
    DatabaseManager.record_completed_activity(
        user_id=current_user.id,
        activity_type="COURSE_COMPLETION",
        activity_title=req.course_title or req.course_id,
        metadata={"provider": req.provider, "skill": req.skill_targeted, "credential": req.credential_type}
    )
    new_prof = None
    readiness = None
    if was_first and req.skill_targeted:
        skill_name = req.skill_targeted
        curr_prof = next((s.proficiency for s in current_user.skills if s.name.lower() == skill_name.lower()), 3.0)
        new_prof = round(min(10.0, curr_prof + 0.5), 1)
        updated_profile, summary = ProgressEngine.apply_progress_update(current_user, {skill_name: new_prof})
        readiness = summary.get("new_readiness_pct")
    return {
        "success": True,
        "was_first_completion": was_first,
        "message": f"Course completed successfully!{' (+0.5 growth in ' + req.skill_targeted + ')' if (was_first and req.skill_targeted) else ''}",
        "new_proficiency": new_prof,
        "readiness_pct": readiness
    }

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

# ==================== LIVE REAL-TIME MARKET DATA (NSE / BSE) ====================

@app.get("/api/market/overview", response_model=MarketOverviewResponse)
def get_live_market_overview(current_user: StudentProfile = Depends(get_user_from_auth)):
    return MarketDataService.get_market_overview()

@app.get("/api/market/quote/{symbol}", response_model=LiveMarketQuote)
def get_live_market_quote(symbol: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    return MarketDataService.get_quote(symbol)

@app.get("/api/market/chart/{symbol}", response_model=MarketChartResponse)
def get_live_market_chart(symbol: str, interval: str = Query("5m"), current_user: StudentProfile = Depends(get_user_from_auth)):
    return MarketDataService.get_chart_candles(symbol, interval)

@app.get("/api/market/search")
def search_market_symbols(query: str = Query(...), current_user: StudentProfile = Depends(get_user_from_auth)):
    return MarketDataService.search_symbols(query)

@app.websocket("/api/ws/market")
async def websocket_market_feed(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            overview = MarketDataService.get_market_overview()
            await websocket.send_json(overview.model_dump())
            await asyncio.sleep(2.0)
    except (WebSocketDisconnect, Exception):
        pass

# ==================== REGULATED BROKER GATEWAY & REAL PORTFOLIO ====================

@app.get("/api/broker/status", response_model=BrokerStatusResponse)
def get_broker_status(current_user: StudentProfile = Depends(get_user_from_auth)):
    return RealPortfolioEngine.get_broker_status(current_user.id)

@app.post("/api/broker/connect")
def connect_broker_account(req: BrokerConnectRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    res = BrokerManager.connect_broker(
        user_id=current_user.id,
        broker_name=req.broker_name,
        account_id=req.account_id,
        auth_token=req.auth_code_or_token,
        is_sandbox=req.is_sandbox
    )
    return {"success": True, "message": f"Successfully connected {req.broker_name} account {req.account_id}."}

@app.post("/api/broker/disconnect")
def disconnect_broker_account(current_user: StudentProfile = Depends(get_user_from_auth)):
    BrokerManager.disconnect_broker(current_user.id)
    return {"success": True, "message": "Broker account disconnected."}

@app.get("/api/broker/portfolio", response_model=BrokerPortfolioResponse)
def get_broker_synchronized_portfolio(current_user: StudentProfile = Depends(get_user_from_auth)):
    return RealPortfolioEngine.get_portfolio(current_user.id)

@app.post("/api/broker/order", response_model=BrokerOrderResult)
def place_broker_order(req: PlaceBrokerOrderRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    try:
        return OrderExecutionEngine.execute_order(current_user.id, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/broker/orders")
def get_broker_order_history(current_user: StudentProfile = Depends(get_user_from_auth)):
    return DatabaseManager.get_user_broker_orders(current_user.id)

@app.get("/api/broker/orders/summary", response_model=OrdersSummaryResponse)
def get_broker_orders_summary(current_user: StudentProfile = Depends(get_user_from_auth)):
    return OrderExecutionEngine.get_orders_summary(current_user.id)

@app.get("/api/wealth/ai-stock-recommendations", response_model=StockAdvisorResponse)
@app.get("/api/investments/ai-stock-recommendations", response_model=StockAdvisorResponse)
def get_ai_stock_recommendations(current_user: StudentProfile = Depends(get_user_from_auth)):
    return StockAdvisorEngine.get_recommendations_for_user(current_user)

@app.post("/api/career/career-vs-investment", response_model=CareerVsInvestmentDecisionResponse)
def compare_career_vs_investment(req: CareerVsInvestmentDecisionRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return CareerComparatorEngine.compare_career_vs_investment(current_user, req)

@app.get("/api/wealth/financial-safety", response_model=FinancialSafetyCheckResponse)
def get_financial_safety_status(current_user: StudentProfile = Depends(get_user_from_auth)):
    return FinanceEngine.evaluate_financial_safety(current_user)

@app.get("/api/wealth/financial-health", response_model=FinancialHealthSummary)
def get_financial_health_status(current_user: StudentProfile = Depends(get_user_from_auth)):
    return FinanceEngine.get_financial_health_summary(current_user)

# ==================== SAFE NPCI UPI MANDATE FLOW (ZERO-PIN) ====================

@app.post("/api/payment/upi-mandate/create", response_model=UpiMandateResponse)
def create_upi_mandate_request(req: CreateUpiMandateRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    try:
        return OrderExecutionEngine.create_upi_mandate(current_user.id, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/payment/upi-mandate/approve/{mandate_ref}", response_model=UpiMandateResponse)
def approve_upi_mandate_payment(mandate_ref: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    try:
        return OrderExecutionEngine.approve_upi_mandate(mandate_ref)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ==================== REAL AI WEALTH COPILOT WITH LIVE PORTFOLIO ====================

@app.get("/api/wealth/ai-audit", response_model=RealAiWealthAuditResponse)
def audit_real_portfolio(current_user: StudentProfile = Depends(get_user_from_auth)):
    return RealAiWealthCopilot.audit_portfolio(current_user)

# ==================== STRATEGIC ADVISOR & TODAY'S PLAN ====================

@app.post("/api/decision/evaluate", response_model=DecisionEvaluationResponse)
def evaluate_decision(req: DecisionEvaluationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return DecisionEngine.evaluate_decision(current_user, req)

@app.get("/api/career/weekly-review", response_model=WeeklyReviewData)
def get_weekly_review(current_user: StudentProfile = Depends(get_user_from_auth)):
    return AdvancedSimulationEngine.get_weekly_review(current_user)

@app.get("/api/career/daily-plan", response_model=DailyActionPlan)
def get_daily_plan(date_str: Optional[str] = Query(None), current_user: StudentProfile = Depends(get_user_from_auth)):
    target_date = date_str or None
    return ProgressEngine.generate_daily_plan(current_user, target_date)

@app.post("/api/career/daily-plan/toggle-task/{task_id}")
def toggle_daily_task(task_id: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    profile = current_user
    today_tasks = DatabaseManager.get_daily_tasks(profile.id)
    task_row = next((t for t in today_tasks if t["id"] == task_id), None)
    
    is_completed, total, was_first_completion = DatabaseManager.toggle_task(profile.id, task_id)

    skill_gained = None
    if is_completed and was_first_completion:
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
        "completed": is_completed, 
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

# ==================== STUDY ABROAD & MASTERS COPILOT ====================

@app.get("/api/study-abroad/overview", response_model=StudyAbroadOverviewResponse)
def get_study_abroad_overview(current_user: StudentProfile = Depends(get_user_from_auth)):
    state = DatabaseManager.get_study_abroad_state(current_user.id)
    target_countries = state.get("target_countries", ["USA", "DEU", "CAN"])
    target_program = state.get("target_program", "MS in Artificial Intelligence / Computer Science")
    target_intake = state.get("target_intake", "Fall 2027")
    checklists = state.get("checklists", {})

    user_cgpa = getattr(current_user.academic, "cgpa", 8.4) if hasattr(current_user, "academic") and current_user.academic else 8.4
    monthly_surplus = getattr(current_user.financial, "monthly_surplus", 5500.0) if hasattr(current_user, "financial") and current_user.financial else 5500.0
    current_savings = getattr(current_user.financial, "current_savings", 25000.0) if hasattr(current_user, "financial") and current_user.financial else 25000.0

    all_countries = StudyAbroadEngine.get_all_countries()
    required_exams = StudyAbroadEngine.get_required_exams_for_selection(target_countries, target_program)
    practice_papers = StudyAbroadEngine.get_practice_papers()
    shortlisted = StudyAbroadEngine.get_shortlisted_universities(["ALL"], user_cgpa, checklists)
    target_unis = [
        u for u in shortlisted
        if any(c.upper() in [u.country.upper(), "USA" if u.country == "USA" else "", "DEU" if u.country == "Germany" else "", "CAN" if u.country == "Canada" else "", "GBR" if u.country == "United Kingdom" else ""] for c in target_countries)
    ]
    if not target_unis:
        target_unis = shortlisted[:8]
    cost_rois = StudyAbroadEngine.calculate_cost_roi_estimates(target_unis, monthly_surplus, current_savings)
    roadmap = StudyAbroadEngine.generate_master_roadmap(target_countries, target_program, target_intake)

    profile_summary = {
        "student_name": current_user.name,
        "career_goal": current_user.career_goal,
        "cgpa": user_cgpa,
        "degree": getattr(current_user.academic, "degree", "B.Tech Computer Science") if hasattr(current_user, "academic") and current_user.academic else "B.Tech Computer Science",
        "monthly_surplus": monthly_surplus,
        "current_savings": current_savings,
        "skills_count": len(current_user.skills) if current_user.skills else 0
    }

    return StudyAbroadOverviewResponse(
        target_countries=target_countries,
        target_program=target_program,
        target_intake=target_intake,
        profile_summary=profile_summary,
        all_countries_catalog=all_countries,
        required_exams=required_exams,
        practice_papers=practice_papers,
        shortlisted_universities=shortlisted,
        cost_roi_comparisons=cost_rois,
        roadmap=roadmap
    )

@app.post("/api/study-abroad/selection", response_model=StudyAbroadOverviewResponse)
def update_study_abroad_selection(req: UpdateStudyAbroadSelectionRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    DatabaseManager.save_study_abroad_selection(
        user_id=current_user.id,
        target_countries=req.target_countries,
        target_program=req.target_program,
        target_intake=req.target_intake
    )
    return get_study_abroad_overview(current_user)

@app.post("/api/study-abroad/checklist")
def update_study_abroad_checklist(req: UpdateUniversityChecklistRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    checklists = DatabaseManager.update_university_checklist_item(
        user_id=current_user.id,
        university_id=req.university_id,
        checklist_key=req.checklist_key,
        completed=req.completed
    )
    return {"success": True, "checklists": checklists}

@app.post("/api/study-abroad/generate-sop-lor", response_model=SopLorGenerationResponse)
def generate_study_abroad_sop_lor(req: SopLorGenerationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return StudyAbroadEngine.generate_sop_and_lor(
        target_university=req.target_university,
        target_program=req.target_program,
        research_interest=req.specific_research_interest or "Deep Learning Systems & Distributed AI",
        lab_name=req.target_professor_or_lab or "AI & Autonomous Systems Lab",
        student_profile=current_user.dict()
    )

# ==================== ADVANCED EXAM PREPARATION ENGINE API ====================

@app.post("/api/study-abroad/exam/generate-set", response_model=PracticeSetResponse)
def generate_exam_practice_set(req: GeneratePracticeSetRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return ExamBankEngine.generate_practice_set(
        exam=req.exam,
        section=req.section,
        topic=req.topic,
        difficulty=req.difficulty,
        question_count=req.question_count,
        time_limit_minutes=req.time_limit_minutes
    )

@app.post("/api/study-abroad/exam/submit-set", response_model=PracticeSetEvaluationResponse)
def submit_exam_practice_set(req: SubmitPracticeSetRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    # Retrieve question definitions from seed bank and procedural templates
    questions: List[ExamQuestion] = []
    for qid in req.answers.keys():
        # Check in seed bank
        match = next((q for q in SEED_QUESTIONS_BANK if q["id"] == qid), None)
        if match:
            questions.append(ExamQuestion(**match))
        else:
            # Fallback procedural lookup
            questions.append(ExamQuestion(
                id=qid,
                exam=req.exam,
                section=req.section,
                topic="Procedural Topic",
                difficulty="Medium",
                question=f"Procedural question verification for {qid}",
                options=["A", "B", "C", "D"],
                correct_option=0,
                explanation="Standard procedural solution and validation."
            ))

    evaluation = ExamBankEngine.evaluate_practice_set(
        questions=questions,
        user_answers=req.answers,
        time_spent_seconds=req.time_spent_seconds
    )

    # Persist attempts and mistake bank
    for res in evaluation.results:
        DatabaseManager.record_exam_attempt(
            user_id=current_user.id,
            set_or_mock_id=req.set_id,
            question_id=res.question_id,
            exam=req.exam,
            section=req.section,
            topic=res.topic,
            difficulty=res.difficulty,
            user_choice=res.user_choice,
            correct_choice=res.correct_choice,
            is_correct=res.is_correct,
            time_spent_seconds=int(req.time_spent_seconds / max(len(evaluation.results), 1))
        )
        if not res.is_correct:
            q_dict = {
                "id": res.question_id,
                "exam": req.exam,
                "section": req.section,
                "topic": res.topic,
                "difficulty": res.difficulty,
                "question": res.question,
                "options": res.options,
                "correct_option": res.correct_choice,
                "explanation": res.explanation,
                "concept_tested": res.concept_tested
            }
            DatabaseManager.add_to_mistake_bank(current_user.id, q_dict, res.user_choice)

    return evaluation

@app.post("/api/study-abroad/exam/mock/start", response_model=MockExamBlueprint)
def start_exam_mock_test(req: StartMockExamRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return ExamBankEngine.create_full_mock_blueprint(
        exam=req.exam,
        mode=req.mock_mode
    )

@app.post("/api/study-abroad/exam/mock/submit", response_model=MockExamEvaluationResponse)
def submit_exam_mock_test(req: SubmitMockExamRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    # Retrieve the full set of questions for this mock exam
    questions: List[ExamQuestion] = []
    if req.questions and len(req.questions) > 0:
        questions = req.questions
    else:
        cached_bp = ExamBankEngine.get_active_mock_blueprint(req.mock_id)
        if cached_bp:
            for sec in cached_bp.sections:
                questions.extend(sec.questions)
        else:
            fresh_bp = ExamBankEngine.create_full_mock_blueprint(exam=req.exam)
            for sec in fresh_bp.sections:
                questions.extend(sec.questions)

    evaluation = ExamBankEngine.evaluate_mock_exam(
        mock_id=req.mock_id,
        exam=req.exam,
        all_questions=questions,
        user_answers=req.answers,
        time_spent_seconds=req.time_spent_seconds
    )

    # Record all attempted questions in database
    for q in questions:
        if q.id in req.answers:
            user_pick = req.answers[q.id]
            is_corr = (user_pick == q.correct_option)
            DatabaseManager.record_exam_attempt(
                user_id=current_user.id,
                set_or_mock_id=req.mock_id,
                question_id=q.id,
                exam=req.exam,
                section=q.section,
                topic=q.topic,
                difficulty=q.difficulty,
                user_choice=user_pick,
                correct_choice=q.correct_option,
                is_correct=is_corr,
                time_spent_seconds=30
            )
            if not is_corr:
                DatabaseManager.add_to_mistake_bank(current_user.id, q.dict(), user_pick)

    # Record Mock History in DB
    existing_mocks = DatabaseManager.get_user_mock_history(current_user.id, req.exam)
    DatabaseManager.record_mock_history(
        user_id=current_user.id,
        mock_title=f"{req.exam} Diagnostic Mock #{len(existing_mocks) + 1}",
        exam=req.exam,
        quant_score=evaluation.quant_scaled_score,
        verbal_score=evaluation.verbal_scaled_score,
        total_score=evaluation.total_scaled_score,
        accuracy_pct=evaluation.overall_accuracy_pct,
        raw_data={
            "weakest": evaluation.weakest_topics,
            "strongest": evaluation.strongest_topics,
            "attempted": evaluation.attempted_count,
            "unanswered": evaluation.unanswered_count,
            "total_questions": evaluation.total_questions
        }
    )

    return evaluation

@app.get("/api/study-abroad/exam/analytics", response_model=ExamAnalyticsSummary)
def get_exam_analytics(exam: str = "GRE", current_user: StudentProfile = Depends(get_user_from_auth)):
    stats = DatabaseManager.get_exam_analytics_stats(current_user.id, exam)
    history_rows = DatabaseManager.get_user_mock_history(current_user.id, exam)

    mock_history = [
        MockScoreHistoryItem(
            id=h["id"],
            mock_title=h["mock_title"],
            date=h["created_at"][:10],
            quant_score=h["quant_score"],
            verbal_score=h["verbal_score"],
            total_score=h["total_score"],
            accuracy_pct=h["accuracy_pct"],
            estimated_target_gap=max(0, 325 - h["total_score"])
        )
        for h in history_rows
    ]

    total_attempts = stats.get("total_attempts", 0)
    total_correct = stats.get("total_correct", 0)
    overall_acc = round((total_correct / max(total_attempts, 1)) * 100.0, 1) if total_attempts > 0 else 0.0

    topic_radar = [
        TopicPerformance(
            topic=r.get("topic", "General"),
            total=r.get("total", 0),
            correct=r.get("correct", 0),
            accuracy_pct=round((r.get("correct", 0) / max(r.get("total", 1), 1)) * 100, 1),
            status="STRONG" if (r.get("correct", 0) / max(r.get("total", 1), 1)) >= 0.75 else ("AVERAGE" if (r.get("correct", 0) / max(r.get("total", 1), 1)) >= 0.50 else "WEAK")
        )
        for r in stats.get("topic_stats", [])
    ]

    best_score = max([m.total_score for m in mock_history], default=0)
    delta = mock_history[-1].total_score - mock_history[0].total_score if len(mock_history) > 1 else 0

    if mock_history:
        best_quant = max([m.quant_score for m in mock_history])
        best_verbal = max([m.verbal_score for m in mock_history])
        best_quant_acc = round(((best_quant - 130) / 40.0) * 100.0, 1) if best_quant > 130 else 0.0
        best_verbal_acc = round(((best_verbal - 130) / 40.0) * 100.0, 1) if best_verbal > 130 else 0.0
    else:
        best_quant_acc = 0.0
        best_verbal_acc = 0.0

    gap = max(0, 325 - best_score) if best_score > 0 else 65
    predicted_days = max(14, int(gap * 1.5))

    badges = [
        {"title": "100+ Questions Solved", "icon": "📚", "unlocked": total_attempts >= 100, "desc": "Demonstrated persistent question bank mastery"},
        {"title": "Quant Master (85%+)", "icon": "⚡", "unlocked": best_quant_acc >= 85.0 and total_attempts >= 20, "desc": "Achieved 85%+ accuracy on advanced Quantitative problems"},
        {"title": "5-Mock Diagnostic Streak", "icon": "🔥", "unlocked": len(mock_history) >= 5, "desc": "Completed structured full-length timed examinations"},
        {"title": "Mistake Eradicator", "icon": "🎯", "unlocked": stats.get("unresolved_mistakes", 0) == 0 and total_attempts >= 10, "desc": "Successfully revisited and resolved flagged mistakes"}
    ]

    return ExamAnalyticsSummary(
        exam=exam,
        total_questions_solved=total_attempts,
        overall_accuracy_pct=overall_acc,
        total_mocks_completed=len(mock_history),
        best_mock_score=best_score,
        best_quant_accuracy_pct=best_quant_acc,
        best_verbal_accuracy_pct=best_verbal_acc,
        unresolved_mistakes_count=stats.get("unresolved_mistakes", 0),
        mock_history=mock_history,
        topic_radar=topic_radar,
        gamified_badges=badges,
        score_improvement_delta=delta,
        predicted_target_days=predicted_days
    )

@app.get("/api/study-abroad/exam/mistake-bank", response_model=MistakeBankResponse)
def get_user_mistake_bank(exam: Optional[str] = "GRE", topic: Optional[str] = None, current_user: StudentProfile = Depends(get_user_from_auth)):
    rows = DatabaseManager.get_user_mistake_bank(current_user.id, exam=exam, topic=topic)
    
    items: List[MistakeBankItem] = []
    topic_counts: Dict[str, int] = {}

    for r in rows:
        q_obj = r.get("question_obj", {})
        top = r["topic"]
        topic_counts[top] = topic_counts.get(top, 0) + 1
        items.append(
            MistakeBankItem(
                id=r["id"],
                question_id=r["question_id"],
                exam=r["exam"],
                section=r["section"],
                topic=r["topic"],
                difficulty=r["difficulty"],
                question=q_obj.get("question", "Question placeholder"),
                options=q_obj.get("options", ["A", "B", "C", "D"]),
                correct_option=q_obj.get("correct_option", 0),
                user_choice=r["user_choice"],
                explanation=q_obj.get("explanation", "Review core logical rules."),
                concept_tested=q_obj.get("concept_tested", "Diagnostic Concept"),
                mistake_count=r["mistake_count"],
                resolved=bool(r["resolved"]),
                last_attempted_at=r["updated_at"]
            )
        )

    return MistakeBankResponse(
        total_unresolved=len(items),
        topic_counts=topic_counts,
        items=items
    )

@app.post("/api/study-abroad/exam/resolve-mistake/{question_id}")
def resolve_exam_mistake(question_id: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    DatabaseManager.resolve_mistake(current_user.id, question_id)
    return {"success": True, "resolved_question_id": question_id}

@app.post("/api/study-abroad/exam/evaluate-writing", response_model=WritingEvaluationResponse)
def evaluate_exam_writing(req: WritingEvaluationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return ExamBankEngine.evaluate_writing_essay(
        exam=req.exam,
        topic_prompt=req.topic_prompt,
        essay_text=req.essay_text
    )

@app.post("/api/study-abroad/exam/evaluate-speaking", response_model=SpeakingEvaluationResponse)
def evaluate_exam_speaking(req: SpeakingEvaluationRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    return ExamBankEngine.evaluate_speaking_response(
        cue_card_topic=req.cue_card_topic,
        transcript_text=req.transcript_text,
        speech_duration_seconds=req.speech_duration_seconds
    )

@app.get("/api/study-abroad/exam/readiness-score", response_model=MastersOverallReadiness)
def get_masters_readiness_score(current_user: StudentProfile = Depends(get_user_from_auth)):
    stats = DatabaseManager.get_exam_analytics_stats(current_user.id, "GRE")
    return ExamBankEngine.calculate_masters_readiness_score(
        student_profile=current_user.dict(),
        exam_stats=stats
    )

@app.get("/api/study-abroad/exam/prep-budget", response_model=StudyAbroadPrepBudget)
def get_study_abroad_prep_budget(current_user: StudentProfile = Depends(get_user_from_auth)):
    return ExamBankEngine.get_prep_budget()

@app.get("/api/study-abroad/exam/previous-papers", response_model=PreviousYearPapersListResponse)
def list_previous_year_papers(exam: Optional[str] = None, year: Optional[int] = None, current_user: StudentProfile = Depends(get_user_from_auth)):
    return ExamBankEngine.get_previous_year_papers(exam=exam, year=year)

@app.get("/api/study-abroad/exam/previous-papers/{paper_id}", response_model=PreviousYearPaper)
def get_previous_year_paper(paper_id: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    paper = ExamBankEngine.get_previous_paper_by_id(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Previous year paper not found.")
    return paper

@app.get("/api/study-abroad/exam/question-bank-stats")
def get_question_bank_statistics(current_user: StudentProfile = Depends(get_user_from_auth)):
    return ExamBankEngine.get_question_bank_statistics()

# ==================== STUDENT INTELLIGENCE & LEARNING DECAY ====================

@app.get("/api/student-intelligence/digital-twin", response_model=StudentIntelligenceResponse)
def get_student_intelligence_digital_twin(current_user: StudentProfile = Depends(get_user_from_auth)):
    """
    Central AI Decision Engine ("What Should I Do Next?"):
    Synthesizes Career Goal, Skills, Retention, Resume ATS, Job Market, and Finances into ranked Next Best Actions.
    """
    return StudentIntelligenceEngine.get_digital_twin_and_decision_matrix(current_user.id)

@app.post("/api/student-intelligence/complete-action")
def complete_student_intelligence_action(
    req: CompleteActionRequest,
    current_user: StudentProfile = Depends(get_user_from_auth)
):
    """
    Executes a dynamic cascade:
    Completing an action automatically cascades changes across Skill Graph, Learning Decay, Resume, and Finances.
    """
    return StudentIntelligenceEngine.record_student_action_and_cascade(
        user_id=current_user.id,
        action_id=req.action_id,
        action_type=req.action_type,
        metadata=req.metadata
    )

@app.get("/api/learning-decay/status", response_model=LearningDecayStatusResponse)
def get_learning_decay_status(current_user: StudentProfile = Depends(get_user_from_auth)):
    """
    Returns Ebbinghaus spaced retention statistics and urgent decay review queue.
    """
    return LearningDecayEngine.get_decay_status(current_user.id)

@app.post("/api/learning-decay/review-concept")
def review_decay_concept(
    req: ConceptReviewRequest,
    current_user: StudentProfile = Depends(get_user_from_auth)
):
    """
    Records a completed recall drill on a concept, boosting stability and resetting memory retention to 100%.
    """
    return LearningDecayEngine.review_concept(
        user_id=current_user.id,
        concept_name=req.concept_name,
        performance_score=req.performance_score
    )

@app.get("/api/learning-decay/quiz/{concept_name}", response_model=ConceptQuizResponse)
def get_concept_retention_quiz(concept_name: str, current_user: StudentProfile = Depends(get_user_from_auth)):
    """
    Returns an interactive 2-question retention quiz for spaced recall testing.
    """
    return LearningDecayEngine.get_concept_quiz(concept_name)

@app.post("/api/learning-decay/quiz/submit", response_model=ConceptQuizEvaluationResponse)
def submit_concept_retention_quiz(req: SubmitConceptQuizRequest, current_user: StudentProfile = Depends(get_user_from_auth)):
    """
    Evaluates concept quiz answers, reschedules next retest (Day +2, Day +7), and updates retention/weak topics list.
    """
    return LearningDecayEngine.submit_concept_quiz(current_user.id, req)

@app.get("/api/resume/data", response_model=UserResumeData)
def get_user_resume_data(current_user: StudentProfile = Depends(get_user_from_auth)):
    """
    Retrieves user ATS resume details with quantified projects and score.
    """
    data = DatabaseManager.get_user_ats_resume(current_user.id)
    return UserResumeData(
        user_id=data["user_id"],
        ats_score=data["ats_score"],
        resume_headline=data["resume_headline"],
        keywords=data["keywords"],
        projects=data["projects"],
        suggestions=data["suggestions"]
    )

@app.post("/api/resume/add-project")
def add_project_to_resume(
    req: AddProjectToResumeRequest,
    current_user: StudentProfile = Depends(get_user_from_auth)
):
    """
    Adds a verified project with metrics to resume, boosting ATS score by +12.
    """
    return StudentIntelligenceEngine.record_student_action_and_cascade(
        user_id=current_user.id,
        action_id="add-resume-project",
        action_type="UPDATE_RESUME",
        metadata={
            "project_title": req.title,
            "tech_stack": req.tech_stack,
            "metrics": req.metrics
        }
    )




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

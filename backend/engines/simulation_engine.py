from typing import Dict, Any, List, Optional
from models import (
    StudentProfile, SimulationRequest, SimulationResponse,
    PlacementReadinessBreakdown, PlacementFactor,
    SkillGraphData, SkillGraphNode, SkillGraphEdge,
    JobMarketData, MarketSkillBar, JobMarketOpening,
    JobRequirementSkill, JobOpeningRequirementDetail,
    ResumeAnalyzeRequest, ResumeAnalysisResponse, ResumeBulletImprovement,
    DetailedProjectBlueprint, ProjectMilestoneWeek,
    QuickPurchaseCheckRequest, QuickPurchaseCheckResponse,
    WeeklyReviewData
)
from engines.career_engine import CareerEngine, ROLE_BENCHMARKS
from engines.finance_engine import FinanceEngine

class AdvancedSimulationEngine:

    # 1. CAREER SIMULATION / "WHAT IF?" MODE
    @classmethod
    def simulate_what_if(cls, profile: StudentProfile, req: SimulationRequest) -> SimulationResponse:
        target_role = req.target_role or profile.career_goal
        current_pct, current_score, strong, missing, _ = CareerEngine.calculate_readiness(profile, target_role)
        hours = max(0.5, min(16.0, req.study_hours_per_day))
        budget = max(0.0, req.monthly_budget)
        cost = max(0.0, req.invest_course_cost or 0.0)
        
        # Compounding velocity per month based on daily study hours:
        # 1 hr/day -> +1.8% per month, 2 hrs/day -> +3.0% per month, 3 hrs/day -> +4.2% per month, 4 hrs/day -> +5.5% per month
        monthly_velocity = min(8.0, max(1.2, hours * 1.4))
        
        # Skill boost contribution
        skill_bonus = sum(req.skill_boosts.values()) * 1.2 if req.skill_boosts else 0.0
        
        # Course investment impact simulation
        course_analysis = None
        course_gain = 0.0
        if cost > 0:
            affordability_ratio = (budget / cost) if cost > 0 else 1.0
            
            # Diminishing returns on expensive courses vs free hands-on practice
            skill_gain_pct = round(min(10.0, 3.0 + (cost / 2000.0)), 1)
            readiness_gain = round(skill_gain_pct * 0.5, 1)
            course_gain = readiness_gain
            
            if cost > budget * 2.0:
                stress = "HIGH"
                verdict = "❌ High Financial Risk — We recommend free official documentation + open-source portfolio project."
            elif cost > budget:
                stress = "MEDIUM"
                verdict = f"⚠️ Sinking Fund Recommended — Save ₹{budget:,.0f}/month for {round(cost/budget, 1)} months first."
            else:
                stress = "LOW"
                verdict = "✅ Purchase Affordable — Directly fits into this month's learning envelope."
                
            course_analysis = {
                "course_name": req.invest_course_name or "Target Certification / Course",
                "cost_inr": cost,
                "expected_skill_improvement": f"+{skill_gain_pct}%",
                "estimated_readiness_gain": f"+{readiness_gain}%",
                "financial_stress": stress,
                "recommendation": verdict,
                "free_alternative": "FreeCodeCamp / DeepLearning.AI Open Curriculum + GitHub Portfolio Project"
            }

        # Projected Trajectory starting strictly from current calculated baseline
        p1 = min(99, int(round(current_pct + (monthly_velocity * 1.0) + (skill_bonus * 0.3) + course_gain)))
        p3 = min(99, int(round(current_pct + (monthly_velocity * 2.6) + (skill_bonus * 0.7) + course_gain)))
        p6 = min(99, int(round(current_pct + (monthly_velocity * 5.0) + skill_bonus + course_gain)))
        
        gain = p6 - current_pct
        needed = max(0, 85 - current_pct)
        months_to_ready = max(1, int(round(needed / monthly_velocity))) if monthly_velocity > 0 else 12

        # Financial stress assessment
        if budget >= 3000:
            fin_stress = "LOW"
            stars = 5
        elif budget >= 1500:
            fin_stress = "MEDIUM"
            stars = 4
        else:
            fin_stress = "HIGH"
            stars = 3

        verdict_text = (
            f"Starting from your current calculated baseline of {current_pct}% readiness for {target_role}: "
            f"studying {hours} hrs/day with a ₹{budget:,.0f}/month budget will increase your readiness to {p1}% in 1 month, "
            f"{p3}% in 3 months, and reach {p6}% (+{gain}%) by month 6. Estimated time to reach 85%+ readiness is ~{months_to_ready} months."
        )

        # Side-by-side scenario comparison
        # Scenario B: Capital SIP Compounding (allocate monthly budget to 12% equity index SIP while learning on open source)
        sip_hours = 2.0
        sip_velocity = sip_hours * 1.4
        p6_sip = min(99, int(round(current_pct + (sip_velocity * 5.0))))
        corpus_6m = int(round(budget * 6 * 1.035)) if budget > 0 else 0
        months_to_ready_sip = max(1, int(round(needed / sip_velocity)))

        # Scenario C: Intensive Placement Sprint (+1.5h/day study)
        sprint_hours = round(min(16.0, hours + 1.5), 1)
        sprint_velocity = min(8.0, max(1.2, sprint_hours * 1.4))
        p6_sprint = min(99, int(round(current_pct + (sprint_velocity * 5.0) + skill_bonus + course_gain)))
        months_to_ready_sprint = max(1, int(round(needed / sprint_velocity)))

        side_by_side = [
            {
                "id": "scenario_a",
                "name": "Scenario A: Active Custom Plan",
                "daily_study_hours": f"{hours}h / day",
                "monthly_commitment": f"{int(hours * 30)}h total",
                "monthly_budget": f"₹{budget:,.0f}/mo",
                "projected_6m_readiness": f"{p6}% (+{gain}%)",
                "months_to_target": f"~{months_to_ready} months",
                "financial_stress": fin_stress,
                "strategy_summary": "Your customized balance of daily study hours and targeted monthly expenditure.",
                "badge": "Active Plan"
            },
            {
                "id": "scenario_b",
                "name": "Scenario B: Capital SIP & Free Track",
                "daily_study_hours": f"{sip_hours}h / day",
                "monthly_commitment": f"{int(sip_hours * 30)}h total",
                "monthly_budget": f"₹{budget:,.0f}/mo invested in Index SIP",
                "projected_6m_readiness": f"{p6_sip}% (+{p6_sip - current_pct}%)",
                "months_to_target": f"~{months_to_ready_sip} months",
                "financial_stress": "LOW (Zero Course Risk)",
                "strategy_summary": f"Uses free verified curricula while accumulating ₹{corpus_6m:,.0f} emergency reserve over 6 months.",
                "badge": "Financial Fortress"
            },
            {
                "id": "scenario_c",
                "name": "Scenario C: Accelerated Placement Sprint",
                "daily_study_hours": f"{sprint_hours}h / day",
                "monthly_commitment": f"{int(sprint_hours * 30)}h total",
                "monthly_budget": f"₹{budget:,.0f}/mo",
                "projected_6m_readiness": f"{p6_sprint}% (+{p6_sprint - current_pct}%)",
                "months_to_target": f"~{months_to_ready_sprint} months",
                "financial_stress": fin_stress,
                "strategy_summary": "Intensive sprint for urgent placement drives; +1.5h daily problem solving to compress preparation timeline.",
                "badge": "Accelerated"
            }
        ]

        assumptions = [
            "Velocity Assumption: Daily focused study hour yields ~1.4% monthly placement readiness increase based on standard CS/AI curricula.",
            "Fatigue Decay: Daily commitments beyond 6 hours experience diminishing marginal knowledge retention.",
            "Course Impact: Paid certifications contribute up to +5% to initial recruiter screening, while hands-on GitHub projects drive offer conversion.",
            "Financial Stress Model: Allocating >35% of monthly disposable budget to courses elevates financial stress to HIGH.",
            "Statistical Model Label: Projections are simulated algorithmic estimations and do not constitute hiring or salary guarantees."
        ]

        return SimulationResponse(
            scenario_label=f"Simulation: {hours}h/day Study • ₹{budget:,.0f}/mo Budget",
            current_readiness_pct=current_pct,
            projected_1m_pct=p1,
            projected_3m_pct=p3,
            projected_6m_pct=p6,
            readiness_gain_pct=gain,
            estimated_months_to_ready=months_to_ready,
            financial_stress=fin_stress,
            recommendation_stars=stars,
            strategic_verdict=verdict_text,
            course_investment_analysis=course_analysis,
            side_by_side_scenarios=side_by_side,
            assumptions_explained=assumptions,
            estimate_disclaimer="⚠️ Statistical Model Estimate: Projections reflect simulated readiness velocity and learning compounding, not guaranteed recruitment offers or CTC packages."
        )

    # 2. DETAILED PLACEMENT READINESS FACTOR BREAKDOWN
    @classmethod
    def get_placement_readiness_breakdown(cls, profile: StudentProfile) -> PlacementReadinessBreakdown:
        user_skills = CareerEngine.get_skill_map(profile)
        current_pct, current_score, strong, missing, _ = CareerEngine.calculate_readiness(profile, profile.career_goal)
        
        # 7 Crucial Placement Factors derived from user profile
        tech_score = int(round(min(100, (user_skills.get("python", 5) * 6 + user_skills.get("sql", 5) * 4) * 1.05)))
        dsa_score = int(round(min(100, user_skills.get("dsa", 3.5) * 12.5)))
        fastapi_val = user_skills.get("fastapi", 2.0)
        docker_val = user_skills.get("docker", 1.5)
        proj_score = int(round(min(100, (fastapi_val * 6 + docker_val * 6 + 35))))
        resume_score = min(90, max(45, int(current_pct * 1.1 + 10)))
        github_score = min(85, max(40, int(current_pct * 0.9 + 15)))
        comm_score = 72
        interview_score = int(round((tech_score * 0.35 + dsa_score * 0.45 + 15)))
        
        # Exact unified readiness score from CareerEngine
        overall = current_pct
        
        tier = "Tier-1 Product Ready" if overall >= 80 else ("High Potential (Tier-2 / FinTech)" if overall >= 65 else "Developing Foundations")
        
        factors = [
            PlacementFactor(name="Technical Skills", score=tech_score, status="STRONG" if tech_score>=75 else "DEVELOPING", impact="High Weight (25%)"),
            PlacementFactor(name="DSA & Problem Solving", score=dsa_score, status="BOTTLENECK" if dsa_score<65 else "GOOD", impact="Critical Filter (25%)"),
            PlacementFactor(name="Portfolio Projects", score=proj_score, status="GOOD" if proj_score>=70 else "DEVELOPING", impact="Resume Shortlisting (15%)"),
            PlacementFactor(name="ATS Resume Optimization", score=resume_score, status="AVERAGE", impact="Recruiter Screen (10%)"),
            PlacementFactor(name="GitHub Activity & Clean Code", score=github_score, status="NEEDS_ATTENTION", impact="Technical Review (10%)"),
            PlacementFactor(name="Communication & Soft Skills", score=comm_score, status="GOOD", impact="HR & Culture Fit (5%)"),
            PlacementFactor(name="Mock Technical Interview Readiness", score=interview_score, status="DEVELOPING", impact="Final Offer Round (10%)")
        ]
        
        bottleneck = (
            f"Your biggest bottleneck is DSA & Problem Solving ({dsa_score}/100). "
            f"Improving DSA from {user_skills.get('dsa', 3.5)}/10 to 7.0/10 could increase your overall placement readiness by ~9% to 11%."
        )
        
        actions = [
            "Solve 2 NeetCode 150 Mediums daily (Binary Search, Two Pointers, Trees)",
            "Push 1 full-stack AI Resume Analyzer with Dockerfile to GitHub",
            "Incorporate quantifiable metrics (% latency improvement, accuracy) into resume bullets"
        ]
        
        return PlacementReadinessBreakdown(
            overall_placement_score=overall,
            tier_classification=tier,
            factors=factors,
            bottleneck_analysis=bottleneck,
            top_actions_to_boost=actions
        )

    # 3. INTERACTIVE SKILL DEPENDENCY GRAPH
    @classmethod
    def get_skill_dependency_graph(cls, profile: StudentProfile) -> SkillGraphData:
        user_skills = CareerEngine.get_skill_map(profile)
        
        def get_status(skill_key: str, thresh_mastered=7.0, thresh_learning=3.5) -> str:
            score = user_skills.get(skill_key, 0.0)
            if score >= thresh_mastered:
                return "MASTERED"
            elif score >= thresh_learning:
                return "LEARNING"
            return "MISSING"

        current_pct, _, _, _, _ = CareerEngine.calculate_readiness(profile, profile.career_goal)

        nodes = [
            SkillGraphNode(id="python", label="Python 3.x", category="Languages", status=get_status("python"), proficiency=user_skills.get("python", 7.5), importance="CRITICAL", prerequisites=[]),
            SkillGraphNode(id="sql", label="SQL & Relational DB", category="Databases", status=get_status("sql"), proficiency=user_skills.get("sql", 7.0), importance="HIGH", prerequisites=[]),
            SkillGraphNode(id="numpy", label="NumPy & Pandas", category="Analytics", status="MASTERED" if user_skills.get("python", 0) >= 6 else "LEARNING", proficiency=7.5, importance="HIGH", prerequisites=["python"]),
            SkillGraphNode(id="ml", label="Machine Learning (Scikit-Learn)", category="AI/ML", status=get_status("machine learning"), proficiency=user_skills.get("machine learning", 4.0), importance="CRITICAL", prerequisites=["python", "numpy"]),
            SkillGraphNode(id="deeplearning", label="Deep Learning & PyTorch", category="AI/ML", status=get_status("deep learning"), proficiency=user_skills.get("deep learning", 2.0), importance="CRITICAL", prerequisites=["ml"]),
            SkillGraphNode(id="fastapi", label="FastAPI Async Services", category="Web/Backend", status=get_status("fastapi"), proficiency=user_skills.get("fastapi", 2.0), importance="HIGH", prerequisites=["python"]),
            SkillGraphNode(id="docker", label="Docker Containers", category="DevOps", status=get_status("docker"), proficiency=user_skills.get("docker", 1.5), importance="HIGH", prerequisites=["fastapi"]),
            SkillGraphNode(id="cloud", label="Cloud & MLOps (AWS/GCP)", category="Cloud", status=get_status("cloud (aws/gcp)"), proficiency=user_skills.get("cloud (aws/gcp)", 2.0), importance="HIGH", prerequisites=["docker"]),
            SkillGraphNode(id="dsa", label="DSA & Algorithms", category="Core CS", status=get_status("dsa"), proficiency=user_skills.get("dsa", 3.5), importance="CRITICAL", prerequisites=["python"]),
            SkillGraphNode(id="target_role", label=f"{profile.career_goal} (Goal)", category="Goal", status="LEARNING" if current_pct < 80 else "MASTERED", proficiency=round(current_pct/10.0, 1), importance="GOAL", prerequisites=["deeplearning", "docker", "dsa"])
        ]

        edges = [
            SkillGraphEdge(source="python", target="numpy", label="Data Manipulation"),
            SkillGraphEdge(source="numpy", target="ml", label="Feature Matrix"),
            SkillGraphEdge(source="python", target="fastapi", label="Async API"),
            SkillGraphEdge(source="python", target="dsa", label="Problem Solving"),
            SkillGraphEdge(source="ml", target="deeplearning", label="Neural Nets"),
            SkillGraphEdge(source="fastapi", target="docker", label="Containerize"),
            SkillGraphEdge(source="docker", target="cloud", label="Deployment"),
            SkillGraphEdge(source="deeplearning", target="target_role", label="AI Core"),
            SkillGraphEdge(source="docker", target="target_role", label="Production"),
            SkillGraphEdge(source="dsa", target="target_role", label="Placement Filter")
        ]

        return SkillGraphData(nodes=nodes, edges=edges)

    # 4. JOB MARKET BENCHMARK & LIVE MATCHING
    @classmethod
    def get_job_market_benchmark(cls, profile: StudentProfile) -> JobMarketData:
        user_skills = CareerEngine.get_skill_map(profile)
        current_pct, _, _, _, _ = CareerEngine.calculate_readiness(profile, profile.career_goal)
        
        bars = [
            MarketSkillBar(skill="Python Core", student_match_pct=min(100, int(user_skills.get("python", 7.5) * 12)), market_importance_pct=95, status="ALIGNED"),
            MarketSkillBar(skill="Machine Learning & Scikit", student_match_pct=min(100, int(user_skills.get("machine learning", 4.0) * 15)), market_importance_pct=88, status="DEVELOPING"),
            MarketSkillBar(skill="PyTorch / Deep Learning", student_match_pct=min(100, int(user_skills.get("deep learning", 2.0) * 15)), market_importance_pct=92, status="GAP"),
            MarketSkillBar(skill="FastAPI / REST Backend", student_match_pct=min(100, int(user_skills.get("fastapi", 2.0) * 15)), market_importance_pct=82, status="GAP"),
            MarketSkillBar(skill="Docker Containerization", student_match_pct=min(100, int(user_skills.get("docker", 1.5) * 15)), market_importance_pct=85, status="GAP"),
            MarketSkillBar(skill="DSA & Algorithms", student_match_pct=min(100, int(user_skills.get("dsa", 3.5) * 15)), market_importance_pct=90, status="GAP"),
        ]

        openings = [
            JobMarketOpening(
                id="job-razorpay-1",
                company="Razorpay",
                title="Associate AI / ML Engineer",
                location="Bengaluru / Hybrid",
                salary="₹14L - ₹20L/yr",
                match_pct=min(95, current_pct + 12),
                key_tags=["Python", "FastAPI", "PyTorch", "Docker"],
                requirements_detail=JobOpeningRequirementDetail(
                    eligibility_criteria=[
                        "B.Tech / B.E. / M.Tech in CS, AI/ML, Data Science (2026/2027 Graduating Batches)",
                        "Minimum 7.5 CGPA / 75% aggregate with zero active backlogs",
                        "Strong algorithmic foundation and clean coding practices in Python"
                    ],
                    required_skills=[
                        JobRequirementSkill(skill="Python (OOP & Asynchronous)", required_level="Advanced (8+/10)", student_level=f"{user_skills.get('python', 7.5)}/10", status="MATCHED" if user_skills.get('python', 7.5) >= 7.0 else "DEVELOPING"),
                        JobRequirementSkill(skill="FastAPI / REST API Microservices", required_level="Intermediate (6+/10)", student_level=f"{user_skills.get('fastapi', 2.0)}/10", status="MATCHED" if user_skills.get('fastapi', 2.0) >= 6.0 else "GAP"),
                        JobRequirementSkill(skill="PyTorch / Deep Learning Models", required_level="Intermediate (6+/10)", student_level=f"{user_skills.get('deep learning', 2.0)}/10", status="MATCHED" if user_skills.get('deep learning', 2.0) >= 6.0 else "GAP"),
                        JobRequirementSkill(skill="Docker Containerization & Deployment", required_level="Intermediate (5+/10)", student_level=f"{user_skills.get('docker', 1.5)}/10", status="MATCHED" if user_skills.get('docker', 1.5) >= 5.0 else "GAP"),
                        JobRequirementSkill(skill="Data Structures & Algorithms", required_level="Intermediate (6+/10)", student_level=f"{user_skills.get('dsa', 3.5)}/10", status="MATCHED" if user_skills.get('dsa', 3.5) >= 6.0 else "GAP")
                    ],
                    interview_rounds=[
                        "Round 1: Online HackerRank Assessment (2 Medium DSA Problems + 10 ML Concept MCQs)",
                        "Round 2: Machine Learning Deep Dive & Live API Coding (FastAPI service + Model inference)",
                        "Round 3: System Design & Project Architecture Review (Portfolio walkthrough)",
                        "Round 4: Culture & Engineering Leadership Fit (Tech Director)"
                    ],
                    day_to_day_responsibilities=[
                        "Build and optimize sub-50ms fraud detection and payment intelligence inference pipelines",
                        "Design REST & gRPC endpoints using FastAPI containerized with Docker",
                        "Collaborate with Senior ML Engineers to fine-tune transformer and gradient boosted models",
                        "Implement automated unit tests, latency profiling, and model monitoring dashboards"
                    ],
                    sample_interview_questions=[
                        "How do you handle high-throughput async requests in FastAPI without blocking the event loop?",
                        "Explain how to serialize and optimize a PyTorch model with TorchScript / ONNX for low latency.",
                        "Given an array of transaction timestamps, find the maximum number of transactions within any sliding 5-minute window (DSA Medium)."
                    ],
                    recruiter_tip="Razorpay heavily values candidates who have containerized GitHub projects with live working API documentation (Swagger/OpenAPI).",
                    expected_work_mode="Hybrid (3 days in Bengaluru Koramangala office, 2 days remote)",
                    mock_apply_link="https://razorpay.com/jobs/ai-associate"
                )
            ),
            JobMarketOpening(
                id="job-zomato-2",
                company="Zomato / Blinkit",
                title="Junior Machine Learning Engineer",
                location="Gurugram / Remote",
                salary="₹12L - ₹18L/yr",
                match_pct=min(95, current_pct + 16),
                key_tags=["Python", "SQL", "Scikit-Learn", "Redis"],
                requirements_detail=JobOpeningRequirementDetail(
                    eligibility_criteria=[
                        "B.Tech / B.E. in Computer Science, Math & Computing, or related fields (2026/2027)",
                        "Minimum 7.0 CGPA throughout academics",
                        "Demonstrated proficiency in SQL and predictive modeling"
                    ],
                    required_skills=[
                        JobRequirementSkill(skill="Python (Data & Modeling)", required_level="Advanced (7.5+/10)", student_level=f"{user_skills.get('python', 7.5)}/10", status="MATCHED"),
                        JobRequirementSkill(skill="SQL & Complex Analytics Queries", required_level="Advanced (7+/10)", student_level=f"{user_skills.get('sql', 7.0)}/10", status="MATCHED"),
                        JobRequirementSkill(skill="Scikit-Learn & Feature Engineering", required_level="Intermediate (6+/10)", student_level=f"{user_skills.get('machine learning', 4.0)}/10", status="DEVELOPING"),
                        JobRequirementSkill(skill="Redis / Caching & Real-time State", required_level="Working Knowledge", student_level="1.5/10", status="GAP")
                    ],
                    interview_rounds=[
                        "Round 1: 90-min Coding & SQL Challenge (Window functions, joins, array hashing)",
                        "Round 2: Applied Machine Learning (ETA prediction, demand forecasting architecture)",
                        "Round 3: Problem Solving & Engineering Culture Fit"
                    ],
                    day_to_day_responsibilities=[
                        "Develop 10-minute grocery delivery dispatch and surge pricing ML models",
                        "Analyze multi-terabyte order logs using PostgreSQL and ClickHouse",
                        "Deploy model endpoints connected to Redis caching layers"
                    ],
                    sample_interview_questions=[
                        "Write a SQL query using window functions to calculate the 7-day rolling average delivery time per hub.",
                        "How would you handle cold-start items with zero purchase history in a restaurant recommendation system?",
                        "What is the difference between GBDT (XGBoost) and Random Forest in terms of bias and variance?"
                    ],
                    recruiter_tip="Demonstrate real understanding of business trade-offs: latency vs accuracy vs compute cost.",
                    expected_work_mode="Gurugram HQ / Flexible Remote",
                    mock_apply_link="https://zomato.com/careers/ml-junior"
                )
            ),
            JobMarketOpening(
                id="job-swiggy-3",
                company="Swiggy",
                title="AI Platform Graduate Engineer",
                location="Bengaluru",
                salary="₹15L - ₹22L/yr",
                match_pct=min(95, current_pct + 10),
                key_tags=["Python", "Docker", "AWS", "DSA"],
                requirements_detail=JobOpeningRequirementDetail(
                    eligibility_criteria=[
                        "B.Tech / Dual Degree in CSE / ECE / Data Science (2026/2027)",
                        "Strong foundations in Operating Systems, Networks, and Distributed Systems",
                        "CGPA 7.5+"
                    ],
                    required_skills=[
                        JobRequirementSkill(skill="Python / Go", required_level="Advanced (8/10)", student_level=f"{user_skills.get('python', 7.5)}/10", status="MATCHED"),
                        JobRequirementSkill(skill="Data Structures & Algorithms", required_level="Advanced (7+/10)", student_level=f"{user_skills.get('dsa', 3.5)}/10", status="GAP"),
                        JobRequirementSkill(skill="Cloud Infrastructure (AWS/GCP)", required_level="Intermediate (5+/10)", student_level=f"{user_skills.get('cloud (aws/gcp)', 2.0)}/10", status="GAP"),
                        JobRequirementSkill(skill="Docker & Kubernetes", required_level="Intermediate (5+/10)", student_level=f"{user_skills.get('docker', 1.5)}/10", status="GAP")
                    ],
                    interview_rounds=[
                        "Round 1: Online Coding Test (3 DSA Questions - Hard / Medium)",
                        "Round 2: Core Computer Science (OS concurrency, multi-threading, TCP/IP)",
                        "Round 3: System Design (Design a URL Shortener or Real-time Location Tracker)",
                        "Round 4: Bar Raiser & Leadership Principles"
                    ],
                    day_to_day_responsibilities=[
                        "Scale real-time delivery partner assignment engine to 50k requests/sec",
                        "Build CI/CD automation pipelines on AWS ECS and Kubernetes",
                        "Optimize memory footprints and CPU utilization across microservices"
                    ],
                    sample_interview_questions=[
                        "Design a rate limiter that allows maximum 100 requests per minute per IP address.",
                        "How does a B-Tree index work internally compared to a Hash Index in relational databases?",
                        "Implement an LRU Cache with O(1) get and put operations in Python."
                    ],
                    recruiter_tip="Swiggy rounds place heavy emphasis on raw problem-solving speed and clean modular code.",
                    expected_work_mode="Bengaluru Embassy Tech Village (Hybrid)",
                    mock_apply_link="https://careers.swiggy.com/graduate-ai"
                )
            ),
            JobMarketOpening(
                id="job-jio-4",
                company="Jio AI Center of Excellence",
                title="Data & GenAI Engineer Trainee",
                location="Hyderabad / Navi Mumbai",
                salary="₹10L - ₹16L/yr",
                match_pct=min(95, current_pct + 14),
                key_tags=["Python", "NLP", "FastAPI", "SQL"],
                requirements_detail=JobOpeningRequirementDetail(
                    eligibility_criteria=[
                        "B.Tech / B.E. all circuital branches (2026/2027)",
                        "Minimum 6.5 CGPA",
                        "Curiosity for Large Language Models, RAG, and Indian language NLP"
                    ],
                    required_skills=[
                        JobRequirementSkill(skill="Python & NLP", required_level="Intermediate (6.5+/10)", student_level=f"{user_skills.get('python', 7.5)}/10", status="MATCHED"),
                        JobRequirementSkill(skill="FastAPI / Flask", required_level="Intermediate (5+/10)", student_level=f"{user_skills.get('fastapi', 2.0)}/10", status="GAP"),
                        JobRequirementSkill(skill="Vector Databases (pgvector/FAISS/Chroma)", required_level="Working Knowledge", student_level="2.0/10", status="GAP"),
                        JobRequirementSkill(skill="SQL & Data Wrangling", required_level="Intermediate (6+/10)", student_level=f"{user_skills.get('sql', 7.0)}/10", status="MATCHED")
                    ],
                    interview_rounds=[
                        "Round 1: Aptitude & Python Coding Assessment",
                        "Round 2: Technical Interview (NLP, Embeddings, Attention Mechanisms, FastAPI)",
                        "Round 3: HR Discussion"
                    ],
                    day_to_day_responsibilities=[
                        "Build Indic-language chatbot microservices using fine-tuned LLaMA & Mistral models",
                        "Implement Retrieval-Augmented Generation (RAG) pipelines over millions of documents",
                        "Optimize token consumption and API response latency"
                    ],
                    sample_interview_questions=[
                        "What is the mathematical difference between Cosine Similarity and Dot Product in embedding spaces?",
                        "Explain the Transformer Self-Attention mechanism step-by-step.",
                        "How do you chunk large documents to preserve semantic context in a RAG system?"
                    ],
                    recruiter_tip="Highlight any open-source contributions or HuggingFace demo apps on your resume.",
                    expected_work_mode="Navi Mumbai Reliance Corporate Park / Hyderabad",
                    mock_apply_link="https://jio.com/careers/genai-trainee"
                )
            )
        ]

        return JobMarketData(
            role=profile.career_goal,
            overall_match_pct=current_pct,
            market_demand="VERY HIGH (35% YoY Increase in 2026-2027)",
            median_salary_inr="₹12L - ₹24L/yr",
            market_skill_bars=bars,
            top_blocking_skills=["PyTorch & Deep Learning", "Docker Containerization", "DSA Algorithm Speed"],
            live_openings=openings
        )

    # 5. AI RESUME ANALYZER
    @classmethod
    def analyze_resume(cls, req: ResumeAnalyzeRequest) -> ResumeAnalysisResponse:
        text = req.resume_text.lower()
        
        missing = []
        found_count = 0
        for kw in ["docker", "fastapi", "pytorch", "ci/cd", "aws", "postgresql", "pgvector", "redis"]:
            if kw in text:
                found_count += 1
            else:
                missing.append(kw.upper() if kw != "ci/cd" else "CI/CD")

        ats = min(95, max(45, 55 + (found_count * 5)))
        score = min(95, max(50, 60 + (found_count * 4)))
        tech = 81
        proj = 63
        impact = 52

        bullet_improvements = [
            ResumeBulletImprovement(
                original="❌ Created a machine learning project for customer churn.",
                improved="✅ Engineered an end-to-end customer churn prediction pipeline using XGBoost and Scikit-Learn, achieving 89% validation accuracy and serving real-time inferences under 40ms via FastAPI.",
                rationale="Adds specific architecture, model choice, exact accuracy metric (89%), and latency impact (40ms)."
            ),
            ResumeBulletImprovement(
                original="❌ Worked on resume analysis using NLP.",
                improved="✅ Architected an AI Resume Analyzer utilizing PyTorch, LangChain, and pgvector embeddings to perform semantic skill gap extraction with 92% retrieval precision.",
                rationale="Demonstrates advanced RAG techniques, vector databases, and concrete precision measurement."
            ),
            ResumeBulletImprovement(
                original="❌ Deployed website on cloud.",
                improved="✅ Containerized multi-tier microservices with multi-stage Dockerfiles and automated CI/CD deployments on Google Cloud Run with 99.9% uptime.",
                rationale="Highlights containerization and cloud reliability standards recruiters search for."
            )
        ]

        actions = [
            "Inject missing high-frequency ATS keywords: " + ", ".join(missing[:4]),
            "Replace generic task bullets with Metric + Method + Outcome (XYZ format)",
            "Add GitHub links and live demo URLs to your top 2 portfolio projects"
        ]

        return ResumeAnalysisResponse(
            overall_resume_score=score,
            ats_compatibility_pct=ats,
            technical_skills_score=tech,
            projects_score=proj,
            impact_statements_score=impact,
            missing_keywords=missing,
            bullet_improvements=bullet_improvements,
            action_recommendations=actions
        )

    # 6. DETAILED PORTFOLIO PROJECT BLUEPRINTS
    @classmethod
    def get_detailed_project_blueprints(cls) -> List[DetailedProjectBlueprint]:
        return [
            DetailedProjectBlueprint(
                id="bp-1",
                title="AI Resume & Skill Gap Analyzer Platform",
                tagline="End-to-End LLM + RAG System with Vector Search & Containerized API",
                difficulty="Intermediate - Advanced",
                estimated_duration_weeks=4,
                estimated_cost_inr="₹0 (100% Free Open-Source)",
                skills_gained=["Python", "FastAPI", "React", "NLP", "Docker", "pgvector", "CI/CD"],
                weekly_schedule=[
                    ProjectMilestoneWeek(week_number=1, title="Week 1: Document Parsing & NLP Preprocessing", deliverables=["PDF/DOCX extraction pipeline", "Text chunking and cleaning with Regex & SpaCy"]),
                    ProjectMilestoneWeek(week_number=2, title="Week 2: Vector Search & Skill Extraction Engine", deliverables=["Embeddings generation with HuggingFace/Gemini", "FAISS / pgvector similarity indexing"]),
                    ProjectMilestoneWeek(week_number=3, title="Week 3: FastAPI REST Service & Scoring Engine", deliverables=["Async REST endpoints with Pydantic validation", "Skill-gap calculation algorithm & match scoring"]),
                    ProjectMilestoneWeek(week_number=4, title="Week 4: Frontend UI, Dockerization & Live Deploy", deliverables=["React + Tailwind dashboard", "Multi-stage Dockerfile and deployment on Cloud Run"])
                ],
                github_checklist=[
                    "Comprehensive README.md with system architecture diagram",
                    "Unit tests using PyTest (minimum 80% code coverage)",
                    "Interactive OpenAPI / Swagger documentation (/docs)",
                    "Docker Compose configuration for local 1-click startup",
                    "Live hosted demo link on Vercel / Render / Cloud Run"
                ],
                architecture_overview="React UI ➔ FastAPI Gateway ➔ Vector Store (pgvector) ➔ LLM Extraction Engine ➔ JSON Match Result",
                recruiter_talking_points=[
                    "Demonstrates full-stack AI deployment rather than isolated Jupyter notebooks",
                    "Solves real-world recruitment data extraction bottlenecks",
                    "Proves production mastery of Docker, async Python, and vector databases"
                ]
            )
        ]

    # 7. FINANCIAL "SHOULD I BUY THIS?" QUICK CHECKER
    @classmethod
    def check_purchase(cls, profile: StudentProfile, req: QuickPurchaseCheckRequest) -> QuickPurchaseCheckResponse:
        budget_info = FinanceEngine.analyze_budget(profile)
        budget = max(500.0, profile.financial.available_for_learning)
        cost = req.cost_inr
        months_to_save = round(cost / budget, 1)
        affordability_pct = int(round(min(100, (budget / cost) * 100))) if cost > 0 else 100
        
        # Check emergency buffer health
        if not budget_info["is_buffer_healthy"]:
            verdict = "AVOID_USE_FREE"
            badge = "❌ Avoid — Emergency Buffer Vulnerable"
            warning = f"Your emergency buffer is ₹{budget_info['current_emergency_buffer']:,.0f} (below ₹{budget_info['min_recommended_emergency_buffer']:,.0f} threshold). Do not purchase paid courses."
            plan = "Do not buy. Rebuild your ₹2,500 emergency buffer first while utilizing free curated video and open-source materials."
            free_opt = "FreeCodeCamp / DeepLearning.AI Open Curriculum + GitHub Portfolio Project"
        elif cost <= budget:
            verdict = "PROCEED_NOW"
            badge = "✅ Approved — Safe to Buy"
            warning = "Fits completely within your monthly learning allocation without touching emergency savings."
            plan = f"Fund from this month's ₹{budget:,.0f} learning allocation. Start learning immediately!"
            free_opt = "N/A (Cost is already affordable)"
        elif cost <= budget * 3:
            verdict = "WAIT_AND_SAVE"
            badge = "⏳ Recommended: Wait & Save"
            warning = f"Spending ₹{cost:,.0f} all at once exceeds 1 month's budget. Requires {months_to_save} months of dedicated saving."
            plan = f"Set aside ₹{budget:,.0f}/month for {months_to_save} months. Purchase on month {int(months_to_save)+1}."
            free_opt = "Use free documentation and YouTube tutorials during Month 1-2 while accumulating the fund."
        else:
            verdict = "AVOID_USE_FREE"
            badge = "❌ High Risk — Avoid Paid Course"
            warning = f"Spending ₹{cost:,.0f} is high risk on a student allowance ({months_to_save} months of budget)."
            plan = "Do not purchase. Recruiters prioritize verified GitHub projects far higher than certificates."
            free_opt = "Follow our curated 100% FreeCodeCamp & DeepLearning.AI curriculum + open source capstone project."

        return QuickPurchaseCheckResponse(
            item_name=req.item_name,
            cost_inr=cost,
            verdict=verdict,
            recommendation_badge=badge,
            affordability_pct=affordability_pct,
            career_benefit="HIGH" if any(k in req.item_name.lower() for k in ["aws", "gcp", "ml", "docker", "pytorch"]) else "MEDIUM",
            urgency=req.urgency,
            months_to_save=months_to_save,
            financial_impact_warning=warning,
            better_free_option=free_opt,
            action_plan=plan
        )

    # 8. DYNAMIC WEEKLY AI CAREER REVIEW
    @classmethod
    def get_weekly_review(cls, profile: StudentProfile) -> WeeklyReviewData:
        from database import DatabaseManager
        from datetime import datetime, timedelta

        today = datetime.now()
        start_date = today - timedelta(days=6)
        date_range_str = f"{start_date.strftime('%b %d')} – {today.strftime('%b %d, %Y')}"

        # Fetch actual daily tasks
        today_iso = today.strftime("%Y-%m-%d")
        daily_tasks = DatabaseManager.get_daily_tasks(profile.id, today_iso)
        completed_today = sum(1 for t in daily_tasks if t.get("completed") == 1)
        total_today = len(daily_tasks) if daily_tasks else 4

        # Estimate weekly aggregate based on live user data
        est_completed = max(completed_today, int(total_today * 0.75))
        est_total = max(total_today * 5, 20)
        completion_pct = int((est_completed / max(1, est_total)) * 100) if est_total > 0 else 0
        study_hours = round(est_completed * 0.75, 1)

        # Dynamic skill improvements from actual profile skills
        sorted_skills = sorted(profile.skills, key=lambda s: s.confidence, reverse=True)
        top_skill = sorted_skills[0] if sorted_skills else None
        lowest_skill = sorted_skills[-1] if sorted_skills else None
        
        skill_improvements = []
        for s in profile.skills[:4]:
            prev_conf = max(1.0, round(s.confidence - 0.5, 1))
            skill_improvements.append({
                "skill": s.name,
                "change": f"{prev_conf} ➔ {s.confidence} (+0.5)"
            })

        goal = getattr(profile, "career_goal", None) or "Software Engineer"
        top_skill_name = top_skill.name if top_skill else "Problem Solving"
        lowest_skill_name = lowest_skill.name if lowest_skill else "System Design"
        budget = int(profile.financial.available_for_learning or 1500)

        narrative = (
            f"Weekly strategic evaluation for {profile.name} targeting {goal}: "
            f"You logged {study_hours} hours across your daily action sprints. "
            f"Your proficiency in {top_skill_name} is advancing on schedule ({top_skill.confidence if top_skill else 4.0}/10), "
            f"while {lowest_skill_name} ({lowest_skill.confidence if lowest_skill else 2.0}/10) remains your highest-priority barrier to placement readiness. "
            f"Focus your next 7 days on hands-on project implementations bridging this exact gap."
        )

        directives = [
            f"Dedicate 45 minutes daily to building a production repo addressing your {lowest_skill_name} gap.",
            f"Complete 2 real-world coding benchmarks for {goal} interview screening.",
            f"Refine portfolio documentation with live deployed endpoints and architecture flowcharts.",
            f"Allocate ₹{min(budget, 500)} towards verified technical certification or hands-on cloud labs."
        ]

        return WeeklyReviewData(
            week_date_range=date_range_str,
            tasks_completed=f"{est_completed} / {est_total} Sprints ({completion_pct}%)",
            study_hours_logged=study_hours,
            skill_improvements=skill_improvements,
            ai_counselor_narrative=narrative,
            next_week_directives=directives
        )

    simulate_scenario = simulate_what_if

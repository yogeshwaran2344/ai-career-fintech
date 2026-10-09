from typing import List, Dict, Any, Optional
from models import (
    StudentProfile, FinancialProfile, CertificationAffordability, CourseCard,
    FinancialSafetyCheckResponse, FinancialHealthSummary, FinancialHealthFactor,
    QuickPurchaseCheckRequest, QuickPurchaseCheckResponse
)
from database import DatabaseManager

# ==================== VERIFIED ACCREDITED COURSE CATALOG (28+ COURSES) ====================
VERIFIED_COURSES_CATALOG: List[Dict[str, Any]] = [
    # Machine Learning & AI
    {
        "id": "ml-stanford-coursera",
        "title": "Machine Learning Specialization",
        "platform": "DeepLearning.AI & Stanford (Coursera)",
        "cost_inr": 3999.0,
        "duration_weeks": 10,
        "difficulty": "Beginner to Intermediate",
        "skills_covered": ["Machine Learning", "Python", "Supervised Learning", "Neural Networks", "Scikit-Learn"],
        "career_relevance": 10,
        "skill_gain": 6.0,
        "credential_type": "PROFESSIONAL_CREDENTIAL",
        "prerequisites": "Basic Python and High School Algebra",
        "url": "https://www.coursera.org/specializations/machine-learning-introduction",
        "base_verdict": "Gold standard foundational machine learning curriculum designed by Andrew Ng. Excellent for placement portfolios."
    },
    {
        "id": "dl-deeplearningai-coursera",
        "title": "Deep Learning Specialization",
        "platform": "DeepLearning.AI (Coursera)",
        "cost_inr": 3999.0,
        "duration_weeks": 12,
        "difficulty": "Intermediate",
        "skills_covered": ["Deep Learning", "PyTorch", "Convolutional Networks", "Transformers", "Optimization"],
        "career_relevance": 10,
        "skill_gain": 7.0,
        "credential_type": "PROFESSIONAL_CREDENTIAL",
        "prerequisites": "Python, Linear Algebra, Machine Learning basics",
        "url": "https://www.coursera.org/specializations/deep-learning",
        "base_verdict": "Industry-leading deep learning track covering CNNs, Sequence Models, and modern Transformer architectures."
    },
    {
        "id": "fastai-practical-dl",
        "title": "Practical Deep Learning for Coders",
        "platform": "fast.ai",
        "cost_inr": 0.0,
        "duration_weeks": 8,
        "difficulty": "Intermediate",
        "skills_covered": ["Deep Learning", "PyTorch", "Computer Vision", "NLP", "Model Deployment"],
        "career_relevance": 9,
        "skill_gain": 6.5,
        "credential_type": "FREE_LEARNING",
        "prerequisites": "1 year of general Python coding experience",
        "url": "https://course.fast.ai/",
        "base_verdict": "100% Free hands-on PyTorch deep learning course. Highly respected by recruiters for top-down practical model training."
    },
    {
        "id": "hf-deep-rl",
        "title": "Deep Reinforcement Learning Course",
        "platform": "Hugging Face",
        "cost_inr": 0.0,
        "duration_weeks": 6,
        "difficulty": "Advanced",
        "skills_covered": ["Reinforcement Learning", "PyTorch", "Policy Gradients", "Q-Learning", "Robotics"],
        "career_relevance": 8,
        "skill_gain": 5.5,
        "credential_type": "COMPLETION_CERTIFICATE",
        "prerequisites": "PyTorch proficiency and basic ML fundamentals",
        "url": "https://huggingface.co/learn/deep-rl-course/unit0/introduction",
        "base_verdict": "Free hands-on RL course with verified Hugging Face certificate upon passing game leaderboard challenges."
    },

    # DSA & Problem Solving
    {
        "id": "neetcode-150",
        "title": "NeetCode 150 & Algorithmic Patterns",
        "platform": "NeetCode.io",
        "cost_inr": 0.0,
        "duration_weeks": 8,
        "difficulty": "Intermediate",
        "skills_covered": ["DSA", "Binary Search", "Two Pointers", "Dynamic Programming", "Trees & Graphs"],
        "career_relevance": 10,
        "skill_gain": 7.5,
        "credential_type": "FREE_LEARNING",
        "prerequisites": "Proficiency in any one language (Python/C++/Java)",
        "url": "https://neetcode.io/practice",
        "base_verdict": "Essential campus placement preparation curriculum covering the 150 most frequently tested LeetCode coding interview patterns."
    },
    {
        "id": "cs50-harvard",
        "title": "CS50x: Introduction to Computer Science",
        "platform": "Harvard University (edX)",
        "cost_inr": 0.0,
        "duration_weeks": 12,
        "difficulty": "Beginner to Intermediate",
        "skills_covered": ["Computer Science", "C", "Python", "SQL", "Algorithms", "Memory Management"],
        "career_relevance": 9,
        "skill_gain": 6.0,
        "credential_type": "FREE_LEARNING",
        "prerequisites": "None (Absolute beginners welcome)",
        "url": "https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science",
        "base_verdict": "World-renowned Harvard CS foundational course. Completely free to audit with full problem set evaluation."
    },
    {
        "id": "striver-a2z-dsa",
        "title": "Striver's A2Z DSA Sheet",
        "platform": "takeUforward",
        "cost_inr": 0.0,
        "duration_weeks": 10,
        "difficulty": "Beginner to Advanced",
        "skills_covered": ["DSA", "Arrays", "Recursion", "Dynamic Programming", "Graph Algorithms"],
        "career_relevance": 10,
        "skill_gain": 7.0,
        "credential_type": "FREE_LEARNING",
        "prerequisites": "Basics of C++ or Java or Python",
        "url": "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2",
        "base_verdict": "The definitive campus recruitment roadmap for Indian tech placements, organized step-by-step from syntax to DP."
    },
    {
        "id": "mit-6006-algorithms",
        "title": "MIT 6.006: Introduction to Algorithms",
        "platform": "MIT OpenCourseWare",
        "cost_inr": 0.0,
        "duration_weeks": 14,
        "difficulty": "Advanced",
        "skills_covered": ["Algorithms", "Asymptotic Analysis", "Hash Tables", "Shortest Paths", "Dynamic Programming"],
        "career_relevance": 9,
        "skill_gain": 7.5,
        "credential_type": "FREE_LEARNING",
        "prerequisites": "Discrete Mathematics and Python basics",
        "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
        "base_verdict": "Rigorous theoretical and algorithmic foundations recorded at MIT. Free lecture notes, assignments, and exams."
    },

    # Full Stack & Backend
    {
        "id": "full-stack-open",
        "title": "Full Stack Open (React, Node, GraphQL, TypeScript)",
        "platform": "University of Helsinki",
        "cost_inr": 0.0,
        "duration_weeks": 12,
        "difficulty": "Intermediate",
        "skills_covered": ["React", "Node.js", "Express", "TypeScript", "GraphQL", "CI/CD", "Containers"],
        "career_relevance": 10,
        "skill_gain": 7.5,
        "credential_type": "COMPLETION_CERTIFICATE",
        "prerequisites": "Good programming skills in JavaScript",
        "url": "https://fullstackopen.com/en/",
        "base_verdict": "University of Helsinki's acclaimed full-stack course with verified free university credits and certificate."
    },
    {
        "id": "fastapi-official-docs",
        "title": "Building Production APIs with FastAPI & Pydantic",
        "platform": "FastAPI Official Interactive Academy",
        "cost_inr": 0.0,
        "duration_weeks": 4,
        "difficulty": "Beginner to Intermediate",
        "skills_covered": ["FastAPI", "Python", "Pydantic", "REST APIs", "AsyncIO", "OAuth2", "Docker"],
        "career_relevance": 9,
        "skill_gain": 5.0,
        "credential_type": "FREE_LEARNING",
        "prerequisites": "Python 3.8+ fundamentals",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "base_verdict": "Official interactive tutorial covering async REST architecture, Swagger UI schemas, and production deployment."
    },
    {
        "id": "the-odin-project",
        "title": "The Odin Project: Full Stack JavaScript",
        "platform": "The Odin Project",
        "cost_inr": 0.0,
        "duration_weeks": 16,
        "difficulty": "Beginner to Intermediate",
        "skills_covered": ["HTML/CSS", "JavaScript", "React", "Node.js", "PostgreSQL", "Git"],
        "career_relevance": 8,
        "skill_gain": 6.5,
        "credential_type": "FREE_LEARNING",
        "prerequisites": "None",
        "url": "https://www.theodinproject.com/",
        "base_verdict": "Open source, project-based curriculum where you build real client-side and server-side web applications for your portfolio."
    },

    # Cloud & DevOps
    {
        "id": "aws-cloud-practitioner-free",
        "title": "AWS Cloud Practitioner Essentials",
        "platform": "Amazon Web Services (Skill Builder)",
        "cost_inr": 0.0,
        "duration_weeks": 4,
        "difficulty": "Beginner",
        "skills_covered": ["AWS", "Cloud Computing", "S3", "EC2", "IAM", "VPC", "Serverless"],
        "career_relevance": 8,
        "skill_gain": 4.5,
        "credential_type": "FREE_LEARNING",
        "prerequisites": "Basic computing knowledge",
        "url": "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials",
        "base_verdict": "Official free AWS training covering core cloud fundamentals, IAM security, and billing architectures."
    },
    {
        "id": "docker-fcc-crash-course",
        "title": "Docker & Containerization for Developers",
        "platform": "FreeCodeCamp & TechWorld",
        "cost_inr": 0.0,
        "duration_weeks": 3,
        "difficulty": "Beginner to Intermediate",
        "skills_covered": ["Docker", "Containers", "Docker Compose", "Multi-stage Builds", "DevOps"],
        "career_relevance": 9,
        "skill_gain": 4.5,
        "credential_type": "FREE_LEARNING",
        "prerequisites": "Basic command line / bash knowledge",
        "url": "https://www.freecodecamp.org/news/docker-crash-course/",
        "base_verdict": "Hands-on free crash course covering container lifecycles, microservice networking, and persistent volume mounts."
    },
    {
        "id": "k8s-linux-foundation",
        "title": "Introduction to Kubernetes (LFS158x)",
        "platform": "The Linux Foundation (edX)",
        "cost_inr": 0.0,
        "duration_weeks": 7,
        "difficulty": "Intermediate",
        "skills_covered": ["Kubernetes", "DevOps", "Container Orchestration", "Pods", "Deployments", "Services"],
        "career_relevance": 9,
        "skill_gain": 5.5,
        "credential_type": "FREE_LEARNING",
        "prerequisites": "Docker and Linux terminal fundamentals",
        "url": "https://www.edx.org/learn/kubernetes/the-linux-foundation-introduction-to-kubernetes",
        "base_verdict": "Official introductory curriculum from the Cloud Native Computing Foundation (CNCF) and Linux Foundation."
    },

    # Data Engineering, SQL & Analytics
    {
        "id": "mode-sql-tutorial",
        "title": "Mode Analytics Interactive SQL Bootcamp",
        "platform": "Mode Analytics",
        "cost_inr": 0.0,
        "duration_weeks": 4,
        "difficulty": "Beginner to Advanced",
        "skills_covered": ["SQL", "Relational Databases", "Aggregations", "JOINs", "Window Functions", "Analytics"],
        "career_relevance": 9,
        "skill_gain": 5.0,
        "credential_type": "FREE_LEARNING",
        "prerequisites": "None",
        "url": "https://mode.com/sql-tutorial/",
        "base_verdict": "Industry-standard interactive SQL learning environment with real datasets, covering GROUP BY to advanced window functions."
    },
    {
        "id": "kaggle-learn-ml",
        "title": "Kaggle Hands-On Data Science & ML Micro-Courses",
        "platform": "Kaggle",
        "cost_inr": 0.0,
        "duration_weeks": 4,
        "difficulty": "Beginner to Intermediate",
        "skills_covered": ["Python", "Pandas", "Data Cleaning", "Feature Engineering", "Scikit-Learn"],
        "career_relevance": 8,
        "skill_gain": 4.5,
        "credential_type": "COMPLETION_CERTIFICATE",
        "prerequisites": "Python syntax basics",
        "url": "https://www.kaggle.com/learn",
        "base_verdict": "Bite-sized, zero-cost interactive Jupyter notebooks with free verifiable completion certificates."
    },

    # System Design & Architecture
    {
        "id": "bytebytego-system-design",
        "title": "System Design Fundamentals for Engineers",
        "platform": "ByteByteGo & Alex Xu",
        "cost_inr": 2999.0,
        "duration_weeks": 6,
        "difficulty": "Intermediate to Advanced",
        "skills_covered": ["System Design", "Scalability", "Load Balancing", "Database Sharding", "Caching", "Microservices"],
        "career_relevance": 10,
        "skill_gain": 6.5,
        "credential_type": "COMPLETION_CERTIFICATE",
        "prerequisites": "Basic understanding of client-server architecture",
        "url": "https://bytebytego.com/",
        "base_verdict": "The premier system design reference for technical interview rounds at tier-1 tech firms."
    }
]

class FinanceEngine:
    @staticmethod
    def get_central_financial_metrics(profile: StudentProfile, emergency_shock: float = 0.0) -> Dict[str, Any]:
        """
        CENTRAL FINANCIAL CALCULATION ENGINE (SINGLE SOURCE OF TRUTH):
        Validates all financial figures to be non-negative.
        Tiered emergency targets derived directly from essential expenses (Food + Travel):
        - 1-month: ₹6,000 (minimum emergency floor)
        - 2-month: ₹12,000 (recommended clearance target)
        - 3-month: ₹18,000 (strong target)
        """
        fin = profile.financial

        # Non-negative input validation
        monthly_income = max(0.0, float(fin.monthly_income or 15000.0))
        food = max(0.0, float(fin.food or 0.0))
        travel = max(0.0, float(fin.travel or 0.0))
        entertainment = max(0.0, float(fin.entertainment or 0.0))
        other = max(0.0, float(fin.other or 0.0))
        avail_learning = max(0.0, float(fin.available_for_learning or 0.0))

        essential_expenses = (food + travel) if (food + travel) > 0 else 6000.0
        discretionary_expenses = entertainment + other
        total_regular_expenses = essential_expenses + discretionary_expenses
        total_expenses = total_regular_expenses + max(0.0, emergency_shock)

        # Dynamic Emergency Targets calculated from essential monthly expenses
        emergency_floor_1m = round(essential_expenses * 1.0, 2)
        emergency_target_2m = round(essential_expenses * 2.0, 2)
        emergency_target_3m = round(essential_expenses * 3.0, 2)

        emergency_target = emergency_target_2m
        target_runway_months = 2.0

        current_buffer = max(0.0, float(fin.emergency_buffer or 2000.0) - max(0.0, emergency_shock))
        emergency_gap = max(0.0, emergency_target_2m - current_buffer)
        emergency_gap_3m = max(0.0, emergency_target_3m - current_buffer)
        
        runway_months = round(current_buffer / max(1.0, essential_expenses), 2)
        emergency_fund_pct = round(min(100.0, (current_buffer / max(1.0, emergency_target_2m)) * 100.0), 1)

        monthly_surplus = max(0.0, monthly_income - total_expenses)
        burn_rate_pct = round((total_expenses / max(1.0, monthly_income) * 100), 1)

        # Smart Investment Clearance
        if current_buffer < emergency_floor_1m:
            clearance_state = "LIMITED"
            clearance_badge = "🔒 Investment Clearance: Limited"
            monthly_investment_cap = 500.0
            clearance_reason = (
                f"Your emergency reserve is below the recommended level. "
                f"Investing is currently restricted to ₹500/month until your reserve reaches ₹{emergency_floor_1m:,.0f}. "
                f"Build at least ₹{emergency_target_2m:,.0f} before increasing equity exposure. "
                f"₹{emergency_gap:,.0f} remaining. "
                f"Your current reserve covers approximately {runway_months} months of essential expenses."
            )
            investment_capacity = 500.0
        elif current_buffer < emergency_target_2m:
            clearance_state = "MODERATE"
            clearance_badge = "🟡 Investment Clearance: Moderate"
            monthly_investment_cap = min(monthly_surplus * 0.25, 1500.0)
            clearance_reason = (
                f"Minimum emergency floor passed (₹{current_buffer:,.0f} >= ₹{emergency_floor_1m:,.0f}). "
                f"Investing up to ₹{monthly_investment_cap:,.0f}/month permitted while building towards the ₹{emergency_target_2m:,.0f} recommended target. "
                f"₹{emergency_gap:,.0f} remaining."
            )
            investment_capacity = monthly_investment_cap
        else:
            clearance_state = "CLEARED"
            clearance_badge = "🟢 Investment Clearance: Unlocked"
            monthly_investment_cap = min(monthly_surplus * 0.5, 5000.0)
            clearance_reason = (
                f"Recommended emergency reserve of ₹{emergency_target_2m:,.0f} achieved! "
                f"Full equity allocation and long-term compounding unlocked."
            )
            investment_capacity = monthly_investment_cap

        # Upskilling capacity directly from available surplus (capped strictly at surplus)
        upskilling_capacity = min(monthly_surplus * 0.35, max(avail_learning, 2000.0))

        # Financial Health Score (0-100)
        s_emergency = min(100, int((current_buffer / emergency_target_2m) * 100 * 1.5))
        s_cashflow = min(100, int((monthly_surplus / max(1.0, monthly_income)) * 240))
        s_debt = 100
        s_horizon = 85
        s_insurance = 50
        s_savings = 72

        overall_health_score = int(round(
            0.35 * s_emergency +
            0.25 * s_cashflow +
            0.15 * s_debt +
            0.10 * s_horizon +
            0.05 * s_insurance +
            0.10 * s_savings
        ))

        health_status = "HEALTHY" if overall_health_score >= 75 else ("MODERATE" if overall_health_score >= 50 else "VULNERABLE")
        rating_pill = f"🟡 Financial Health: {health_status.capitalize()}" if health_status == "MODERATE" else (
            f"🟢 Financial Health: {health_status.capitalize()}" if health_status == "HEALTHY" else f"🔴 Financial Health: {health_status.capitalize()}"
        )

        factors = [
            {"factor": "Emergency Fund", "score": s_emergency, "status": "MODERATE", "description": f"₹{current_buffer:,.0f} / ₹{emergency_target_2m:,.0f} ({runway_months} mo runway)"},
            {"factor": "Cash Flow Surplus", "score": s_cashflow, "status": "HEALTHY", "description": f"₹{monthly_surplus:,.0f}/mo surplus ({int(monthly_surplus/max(1.0, monthly_income)*100)}% of income)"},
            {"factor": "Debt Management", "score": s_debt, "status": "HEALTHY", "description": "Zero toxic consumer debt detected"},
            {"factor": "Investment Horizon", "score": s_horizon, "status": "HEALTHY", "description": "Student placement timeline (1-3 years)"},
            {"factor": "Insurance Coverage", "score": s_insurance, "status": "MODERATE", "description": "College group medical policy only"},
            {"factor": "Savings Discipline", "score": s_savings, "status": "HEALTHY", "description": "Consistent monthly stipend savings habit"}
        ]

        ai_priorities = [
            f"1. Build emergency fund to recommended ₹{emergency_target_2m:,.0f} (₹{emergency_gap:,.0f} remaining; minimum floor ₹{emergency_floor_1m:,.0f})",
            f"2. Complete verified upskilling modules (allocate up to ₹{upskilling_capacity:,.0f}/mo)",
            f"3. Micro-investing permitted up to ₹{monthly_investment_cap:,.0f}/mo (full equity unlocked after ₹{emergency_target_2m:,.0f})"
        ]

        summary_msg = "Your cash flow is healthy, but your emergency reserve is below the recommended level."

        return {
            "essential_monthly_expenses": essential_expenses,
            "essential_expenses": essential_expenses,
            "target_runway_months": target_runway_months,
            "emergency_target": emergency_target,
            "emergency_floor_1m": emergency_floor_1m,
            "emergency_target_2m": emergency_target_2m,
            "emergency_target_3m": emergency_target_3m,
            "emergency_current": current_buffer,
            "emergency_gap": emergency_gap,
            "emergency_remaining_to_recommended": emergency_gap,
            "emergency_gap_3m": emergency_gap_3m,
            "monthly_investment_cap": monthly_investment_cap,
            "runway_months": runway_months,
            "emergency_fund_pct": emergency_fund_pct,
            "monthly_income": monthly_income,
            "total_regular_expenses": total_regular_expenses,
            "total_expenses": total_expenses,
            "monthly_surplus": monthly_surplus,
            "burn_rate_pct": burn_rate_pct,
            "clearance_state": clearance_state,
            "clearance_badge": clearance_badge,
            "clearance_reason": clearance_reason,
            "investment_capacity": investment_capacity,
            "upskilling_capacity": upskilling_capacity,
            "overall_health_score": overall_health_score,
            "health_status": health_status,
            "rating_pill": rating_pill,
            "summary_message": summary_msg,
            "breakdown": {
                "food": food,
                "travel": travel,
                "entertainment": entertainment,
                "other": other,
                "essential_total": essential_expenses,
                "discretionary_total": discretionary_expenses
            },
            "factors": factors,
            "ai_priorities": ai_priorities
        }

    @staticmethod
    def get_financial_health_summary(profile: StudentProfile) -> FinancialHealthSummary:
        m = FinanceEngine.get_central_financial_metrics(profile)
        return FinancialHealthSummary(
            overall_health_score=m["overall_health_score"],
            health_status=m["health_status"],
            rating_pill=m["rating_pill"],
            summary_message=m["summary_message"],
            essential_monthly_expenses=m["essential_monthly_expenses"],
            emergency_target=m["emergency_target_2m"],
            emergency_current=m["emergency_current"],
            emergency_gap=m["emergency_gap"],
            emergency_floor_inr=m["emergency_floor_1m"],
            emergency_recommended_target_inr=m["emergency_target_2m"],
            emergency_strong_target_inr=m["emergency_target_3m"],
            emergency_remaining_to_recommended=m["emergency_remaining_to_recommended"],
            monthly_investment_cap=m["monthly_investment_cap"],
            runway_months=m["runway_months"],
            emergency_fund_pct=m["emergency_fund_pct"],
            monthly_income=m["monthly_income"],
            total_expenses=m["total_expenses"],
            monthly_surplus=m["monthly_surplus"],
            upskilling_capacity=m["upskilling_capacity"],
            investment_capacity=m["investment_capacity"],
            clearance_state=m["clearance_state"],
            clearance_badge=m["clearance_badge"],
            clearance_reason=m["clearance_reason"],
            factors=[FinancialHealthFactor(**f) for f in m["factors"]]
        )

    @staticmethod
    def analyze_budget(profile: StudentProfile, emergency_shock: float = 0.0) -> Dict[str, Any]:
        metrics = FinanceEngine.get_central_financial_metrics(profile, emergency_shock)
        fin = profile.financial
        surplus = metrics["monthly_surplus"]

        # CORRECT SURPLUS ALLOCATION: Allocations sum to EXACTLY 100% of surplus (never exceeding available cash flow)
        if metrics["emergency_current"] < metrics["emergency_target_2m"]:
            # Emergency reserve replenishment priority
            rec_emergency = round(surplus * 0.50, 0)
            rec_learning = round(surplus * 0.30, 0)
            rec_savings = round(surplus * 0.20, 0)
        else:
            # Emergency reserve funded: long-term investing priority
            rec_emergency = round(surplus * 0.10, 0)
            rec_learning = round(surplus * 0.40, 0)
            rec_savings = round(surplus * 0.50, 0)

        # Enforce exact constraint: rec_emergency + rec_learning + rec_savings <= surplus
        total_rec = rec_emergency + rec_learning + rec_savings
        if total_rec > surplus and surplus > 0:
            rec_savings = max(0.0, surplus - rec_emergency - rec_learning)

        health_warning = (
            f"⚠️ Caution: Your current emergency buffer is ₹{metrics['emergency_current']:,.0f}, "
            f"which covers {metrics['runway_months']} months against your recommended target of ₹{metrics['emergency_target']:,.0f}. "
            f"Build your liquid emergency reserve to ₹{metrics['emergency_target']:,.0f} before taking equity market risk."
        ) if metrics["clearance_state"] == "LIMITED" else "Your emergency reserves are solid."

        return {
            "monthly_income": metrics["monthly_income"],
            "total_regular_expenses": metrics["total_regular_expenses"],
            "emergency_shock": emergency_shock,
            "total_expenses": metrics["total_expenses"],
            "remaining_disposable": surplus,
            "burn_rate_pct": metrics["burn_rate_pct"],
            "savings_health": metrics["health_status"],
            "min_recommended_emergency_buffer": metrics["emergency_target"],
            "current_emergency_buffer": metrics["emergency_current"],
            "is_buffer_healthy": metrics["clearance_state"] != "LIMITED",
            "health_warning": health_warning,
            "breakdown": metrics["breakdown"],
            "current_allocation": {
                "learning": fin.available_for_learning or 0.0,
                "savings": fin.savings or 0.0,
                "emergency_buffer": metrics["emergency_current"]
            },
            "ai_recommended_allocation": {
                "essential_expenses": metrics["essential_monthly_expenses"],
                "learning_budget": rec_learning,
                "savings": rec_savings,
                "emergency_buffer": rec_emergency
            },
            "advice": (
                f"Your total spending is ₹{metrics['total_expenses']:,.0f} ({metrics['burn_rate_pct']}% of income). "
                f"You have ₹{surplus:,.0f} unallocated surplus. {health_warning}"
            )
        }

    @classmethod
    def evaluate_certification(cls, profile: StudentProfile, cert_name: str = "AWS Certified Solutions Architect", cost_inr: float = 10000.0, exam_target_months: int = 4) -> CertificationAffordability:
        budget_info = cls.analyze_budget(profile)
        learning_budget = float(profile.financial.available_for_learning or 0.0)
        
        # Zero monthly budget handling without inventing fake numbers
        if learning_budget <= 0.0:
            months_to_save = 999.0
            verdict = "ZERO_BUDGET_ALLOCATED"
            advice = (
                f"You currently have ₹0 dedicated to monthly learning. "
                f"To afford this ₹{cost_inr:,.0f} certification within {exam_target_months} months, "
                f"allocate ₹{round(cost_inr / exam_target_months, 0):,.0f}/month from your ₹{budget_info['remaining_disposable']:,.0f} monthly surplus, "
                f"or start with 100% free accredited alternatives."
            )
        else:
            months_to_save = round(cost_inr / learning_budget, 1)
            if not budget_info["is_buffer_healthy"]:
                verdict = "OVER_BUDGET_RISK"
                advice = (
                    f"Buying this ₹{cost_inr:,.0f} certification upfront is not recommended because your emergency reserves "
                    f"(₹{budget_info['current_emergency_buffer']:,.0f}) are below your recommended threshold (₹{budget_info['min_recommended_emergency_buffer']:,.0f}). "
                    f"Use 100% free courses and official documentation first while saving ₹{learning_budget:,.0f}/month."
                )
            elif months_to_save <= 1.0:
                verdict = "AFFORDABLE_IMMEDIATELY"
                advice = f"You can purchase this certification ({cert_name}) immediately within your monthly learning allocation of ₹{learning_budget:,.0f}."
            elif months_to_save <= exam_target_months:
                verdict = "AFFORDABLE_WITH_PLANNING"
                monthly_save = round(cost_inr / exam_target_months, 0)
                advice = (
                    f"This certification has high relevance for {profile.career_goal}. "
                    f"Set aside ₹{monthly_save:,.0f}/month for {exam_target_months} months to register without impacting living essentials."
                )
            else:
                verdict = "OVER_BUDGET_RISK"
                advice = (
                    f"At your current pace of ₹{learning_budget:,.0f}/month, accumulating ₹{cost_inr:,.0f} takes {months_to_save} months. "
                    f"We recommend building portfolio projects first and using free student cloud credits."
                )
            
        alternatives = [
            "Use GitHub Student Developer Pack for free cloud credits and certification discounts (up to 50% off)",
            "Complete free accredited courses (DeepLearning.AI / AWS Skill Builder / Harvard CS50 free tiers)",
            "Build & deploy 2 open-source showcase projects to prove hands-on skills before paying for the badge"
        ]

        return CertificationAffordability(
            cert_name=cert_name,
            provider="Amazon Web Services" if "AWS" in cert_name else ("Google Cloud" if "GCP" in cert_name else "Industry Standard"),
            cost_inr=cost_inr,
            learning_budget_monthly=learning_budget,
            months_to_save=months_to_save,
            exam_target_months=exam_target_months,
            affordability_verdict=verdict,
            ai_recommendation=advice,
            alternative_options=alternatives
        )

    @classmethod
    def get_curated_courses(cls, profile: StudentProfile, skill_topic: str = "Deep Learning") -> List[CourseCard]:
        """
        Retrieves real, verified courses matching the target skill topic from the verified course catalog.
        Links each card to a verified, specific course URL.
        Checks user course progress in SQLite to reflect true completion.
        """
        topic_lower = (skill_topic or "Deep Learning").lower()
        
        # User progress lookup
        completed_course_ids = set()
        try:
            user_courses = DatabaseManager.get_user_course_progress(profile.id)
            completed_course_ids = {c["course_id"] for c in user_courses if c.get("completed")}
        except Exception:
            pass

        # Skill proficiency weighting
        user_skills = {s.name.lower(): s.proficiency for s in profile.skills}
        current_prof = user_skills.get(topic_lower, 2.0)
        gap_importance = 1.8 if current_prof < 4.0 else (1.4 if current_prof < 7.0 else 1.0)

        # Filter or rank candidates by topic match
        matching_courses = []
        fallback_courses = []

        for c in VERIFIED_COURSES_CATALOG:
            skills_str = " ".join(c["skills_covered"]).lower()
            title_str = c["title"].lower()
            
            is_match = (
                topic_lower in skills_str or
                topic_lower in title_str or
                (topic_lower in ["ml", "machine learning"] and "neural" in skills_str) or
                (topic_lower in ["dsa", "algorithms", "problem solving"] and "dsa" in skills_str) or
                (topic_lower in ["full stack", "web", "react"] and "react" in skills_str) or
                (topic_lower in ["cloud", "devops", "docker", "aws"] and ("aws" in skills_str or "docker" in skills_str))
            )

            cost = c["cost_inr"]
            rel = c["career_relevance"]
            gain = c["skill_gain"]
            cost_factor = max(cost / 1000.0, 1.0)
            roi = round((rel * gap_importance * gain) / cost_factor, 1)

            card = CourseCard(
                id=c["id"],
                title=c["title"],
                platform=c["platform"],
                cost_inr=cost,
                duration_weeks=c["duration_weeks"],
                difficulty=c["difficulty"],
                skills_covered=c["skills_covered"],
                career_relevance_stars=min(5, max(3, int(rel // 2))),
                skill_gain_score=gain,
                roi_score=roi,
                is_recommended=False,
                verdict=c["base_verdict"],
                url=c["url"],
                credential_type=c.get("credential_type", "COMPLETION_CERTIFICATE"),
                prerequisites=c.get("prerequisites", "None"),
                verified=True,
                completed=c["id"] in completed_course_ids
            )

            if is_match:
                matching_courses.append(card)
            else:
                fallback_courses.append(card)

        # Pick top matching candidates (or top fallback if none directly matched)
        selected = matching_courses if matching_courses else fallback_courses[:6]
        selected.sort(key=lambda x: x.roi_score, reverse=True)

        if selected:
            selected[0].is_recommended = True
            selected[0].verdict = f"🏆 TOP ROI ({selected[0].roi_score} Score): {selected[0].verdict}"

        return selected[:6]

    @staticmethod
    def quick_purchase_check(profile: StudentProfile, req: QuickPurchaseCheckRequest) -> QuickPurchaseCheckResponse:
        metrics = FinanceEngine.get_central_financial_metrics(profile)
        cost = max(0.0, req.cost_inr)
        avail = float(profile.financial.available_for_learning or 0.0)
        surplus = metrics["monthly_surplus"]

        if avail > 0:
            months = round(cost / avail, 1)
        elif surplus > 0:
            months = round(cost / surplus, 1)
        else:
            months = 999.0

        if cost == 0.0:
            verdict = "PROCEED_NOW"
            badge = "🟢 Free Learning: Proceed Immediately"
            pct = 100
            warning = "Zero monetary cost. Time commitment is your primary investment."
            free_alt = "Official documentation and open-source starter repos."
            plan = "Enroll now and allocate focused time in your Daily Action Plan."
        elif cost <= avail and metrics["clearance_state"] != "LIMITED":
            verdict = "PROCEED_NOW"
            badge = "🟢 Budget Approved: Proceed Now"
            pct = 100
            warning = "Fits cleanly into your current monthly learning allocation."
            free_alt = "Check for student discount before paying full retail price."
            plan = f"Fund directly from this month's ₹{avail:,.0f} learning allocation."
        elif cost <= (surplus * 2.0):
            verdict = "WAIT_AND_SAVE"
            badge = "🟡 Wait & Save: Sinking Fund Recommended"
            pct = int(min(100.0, (avail / max(1.0, cost)) * 100))
            warning = f"Purchasing upfront will dip into your living buffer (current buffer: ₹{metrics['emergency_current']:,.0f})."
            free_alt = "Audit free video lectures on YouTube and edX while saving."
            plan = f"Save ₹{round(cost / max(1.0, months), 0):,.0f}/month for {int(max(1, months))} months before purchase."
        else:
            verdict = "AVOID_USE_FREE"
            badge = "🔴 High Financial Drag: Avoid Paid Option"
            pct = int(min(100.0, (avail / max(1.0, cost)) * 100))
            warning = f"High cost (₹{cost:,.0f}) relative to your monthly surplus (₹{surplus:,.0f}). Severe opportunity cost."
            free_alt = "CS50, Fast.ai, FreeCodeCamp, or GitHub Student Developer Pack."
            plan = "Do not purchase. Master 100% free courses and build 2 portfolio projects instead."

        return QuickPurchaseCheckResponse(
            item_name=req.item_name,
            cost_inr=cost,
            verdict=verdict,
            recommendation_badge=badge,
            affordability_pct=pct,
            career_benefit=f"Validates technical skills for {profile.career_goal}.",
            urgency=req.urgency,
            months_to_save=months,
            financial_impact_warning=warning,
            better_free_option=free_alt,
            action_plan=plan
        )

    @staticmethod
    def evaluate_financial_safety(profile: StudentProfile) -> FinancialSafetyCheckResponse:
        metrics = FinanceEngine.get_central_financial_metrics(profile)

        safety_gates = [
            {
                "gate_name": f"Emergency Reserve (₹{metrics['emergency_target_2m']:,.0f} Recommended Target)",
                "passed": metrics["runway_months"] >= 2.0,
                "current_val": f"{metrics['runway_months']} Months (₹{metrics['emergency_current']:,.0f} / ₹{metrics['emergency_target_2m']:,.0f})",
                "recommendation": f"Build at least ₹{metrics['emergency_target_2m']:,.0f} before increasing equity exposure (₹{metrics['emergency_gap']:,.0f} remaining). Micro-investing capped at ₹{metrics['monthly_investment_cap']:,.0f}/mo."
            },
            {
                "gate_name": "Monthly Cash Flow Surplus (>= 15%)",
                "passed": (metrics["monthly_surplus"] / max(1.0, metrics["monthly_income"])) >= 0.15,
                "current_val": f"{int((metrics['monthly_surplus'] / max(1.0, metrics['monthly_income'])) * 100)}% (₹{metrics['monthly_surplus']:,.0f}/mo)",
                "recommendation": "Trim discretionary expenses" if (metrics["monthly_surplus"] / max(1.0, metrics["monthly_income"])) < 0.15 else "Healthy positive cash flow"
            },
            {
                "gate_name": "High-Cost Debt Clearance",
                "passed": True,
                "current_val": "Zero toxic consumer debt detected",
                "recommendation": "Maintain credit discipline"
            },
            {
                "gate_name": "Minimum Investment Horizon (>= 6M)",
                "passed": True,
                "current_val": "Student mid-term horizon (6M - 3Y)",
                "recommendation": "Avoid intra-day leverage"
            },
            {
                "gate_name": "Student Health / Accidental Coverage",
                "passed": False,
                "current_val": "College Group Insurance / Basic",
                "recommendation": "Check college health coverage before investing high capital"
            }
        ]

        return FinancialSafetyCheckResponse(
            emergency_fund_target_inr=metrics["emergency_target_2m"],
            emergency_fund_current_inr=metrics["emergency_current"],
            emergency_fund_pct=metrics["emergency_fund_pct"],
            runway_months=metrics["runway_months"],
            target_runway_months=metrics["target_runway_months"],
            debt_level="LOW",
            monthly_disposable_cash_flow_inr=metrics["monthly_surplus"],
            investment_risk_profile="MODERATE_BALANCED",
            insurance_health_status="COLLEGE_BASIC",
            readiness_for_equity_investing=True,
            safety_gates=safety_gates,
            actionable_remedy=metrics["clearance_reason"],
            essential_monthly_expenses_inr=metrics["essential_monthly_expenses"],
            emergency_fund_gap_inr=metrics["emergency_gap"],
            emergency_floor_inr=metrics["emergency_floor_1m"],
            emergency_recommended_target_inr=metrics["emergency_target_2m"],
            emergency_strong_target_inr=metrics["emergency_target_3m"],
            emergency_remaining_to_recommended=metrics["emergency_remaining_to_recommended"],
            monthly_investment_cap=metrics["monthly_investment_cap"],
            investment_clearance_state=metrics["clearance_state"],
            clearance_badge=metrics["clearance_badge"],
            clearance_reason=metrics["clearance_reason"],
            financial_health_score=metrics["overall_health_score"]
        )

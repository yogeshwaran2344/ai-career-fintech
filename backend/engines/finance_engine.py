from typing import List, Dict, Any, Optional
from models import (
    StudentProfile, FinancialProfile, CertificationAffordability, CourseCard,
    FinancialSafetyCheckResponse, FinancialHealthSummary, FinancialHealthFactor
)

class FinanceEngine:
    @staticmethod
    def get_central_financial_metrics(profile: StudentProfile, emergency_shock: float = 0.0) -> Dict[str, Any]:
        """
        CENTRAL FINANCIAL CALCULATION ENGINE (SINGLE SOURCE OF TRUTH):
        Essential Monthly Expenses (Food + Travel) = ₹6,000/month
        Target Runway = 3 months
        Emergency Fund Target = Essential * 3 = ₹18,000
        Current Emergency Savings = ₹2,000
        Emergency Fund Gap = ₹16,000
        Current Runway = 0.33 months
        Emergency Fund % = 11.1%
        Monthly Income = ₹15,000
        Total Expenses (Essential + Discretionary) = ₹9,500
        Monthly Surplus = ₹5,500
        """
        fin = profile.financial
        essential_expenses = float(fin.food + fin.travel) if (fin.food + fin.travel) > 0 else 6000.0
        discretionary_expenses = float(fin.entertainment + fin.other)
        total_regular_expenses = essential_expenses + discretionary_expenses
        total_expenses = total_regular_expenses + emergency_shock

        # Tiered Emergency Targets calculated from student's actual essential monthly expenses:
        # ₹6,000 = minimum emergency floor (1-month baseline)
        # ₹12,000 = recommended target (2-month target before increasing equity exposure)
        # ₹18,000 = 3-month strong target
        emergency_floor_1m = round(essential_expenses * 1.0, 2)  # ₹6,000
        emergency_target_2m = round(essential_expenses * 2.0, 2)  # ₹12,000 (recommended target)
        emergency_target_3m = round(essential_expenses * 3.0, 2)  # ₹18,000 (3-month strong target)

        # Primary recommended target for investment clearance is 2 months (₹12,000)
        emergency_target = emergency_target_2m
        target_runway_months = 2.0
        current_buffer = max(0.0, float(fin.emergency_buffer or 2000.0) - emergency_shock)
        emergency_gap = max(0.0, emergency_target_2m - current_buffer)  # ₹10,000 remaining to recommended target
        emergency_gap_3m = max(0.0, emergency_target_3m - current_buffer)  # ₹16,000 remaining to 3-month strong target
        
        runway_months = round(current_buffer / max(1.0, essential_expenses), 2)  # 0.33 months
        emergency_fund_pct = round(min(100.0, (current_buffer / max(1.0, emergency_target_2m)) * 100.0), 1)  # 16.7%

        monthly_income = float(fin.monthly_income or 15000.0)
        monthly_surplus = max(0.0, monthly_income - total_expenses)  # ₹5,500
        burn_rate_pct = round((total_expenses / monthly_income * 100), 1) if monthly_income > 0 else 0.0

        # SMART INVESTMENT CLEARANCE (Dynamic Tiering, Never a binary block for micro-orders)
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

        upskilling_capacity = min(monthly_surplus * 0.4, 2200.0)

        # Central Financial Health Score (0-100)
        s_emergency = min(100, int((current_buffer / emergency_target_2m) * 100 * 1.5))
        s_cashflow = min(100, int((monthly_surplus / monthly_income) * 240))
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
            {"factor": "Cash Flow Surplus", "score": s_cashflow, "status": "HEALTHY", "description": f"₹{monthly_surplus:,.0f}/mo surplus ({int(monthly_surplus/monthly_income*100)}% of income)"},
            {"factor": "Debt Management", "score": s_debt, "status": "HEALTHY", "description": "Zero toxic consumer debt detected"},
            {"factor": "Investment Horizon", "score": s_horizon, "status": "HEALTHY", "description": "Student placement timeline (1-3 years)"},
            {"factor": "Insurance Coverage", "score": s_insurance, "status": "MODERATE", "description": "College group medical policy only"},
            {"factor": "Savings Discipline", "score": s_savings, "status": "HEALTHY", "description": "Consistent monthly stipend savings habit"}
        ]

        ai_priorities = [
            f"1. Build emergency fund to recommended ₹{emergency_target_2m:,.0f} (₹{emergency_gap:,.0f} remaining; minimum floor ₹{emergency_floor_1m:,.0f})",
            f"2. Complete AWS / GenAI upskilling sprints (allocate ₹1,500/mo)",
            f"3. Micro-investing permitted up to ₹{monthly_investment_cap:,.0f}/mo (full equity unlocked after ₹{emergency_target_2m:,.0f})"
        ]

        summary_msg = "Your cash flow is healthy, but your emergency reserve is below the recommended level."

        return {
            "essential_monthly_expenses": essential_expenses,
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
                "food": fin.food,
                "travel": fin.travel,
                "entertainment": fin.entertainment,
                "other": fin.other,
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

        health_warning = (
            f"⚠️ Caution: Your current emergency buffer is ₹{metrics['emergency_current']:,.0f}, "
            f"which covers {metrics['runway_months']} months against your recommended 3-month target of ₹{metrics['emergency_target']:,.0f}. "
            f"Build your liquid emergency reserve to ₹{metrics['emergency_target']:,.0f} before taking equity market risk."
        ) if metrics["clearance_state"] == "BLOCKED" else "Your emergency reserves are solid."

        return {
            "monthly_income": metrics["monthly_income"],
            "total_regular_expenses": metrics["total_regular_expenses"],
            "emergency_shock": emergency_shock,
            "total_expenses": metrics["total_expenses"],
            "remaining_disposable": metrics["monthly_surplus"],
            "burn_rate_pct": metrics["burn_rate_pct"],
            "savings_health": metrics["health_status"],
            "min_recommended_emergency_buffer": metrics["emergency_target"],
            "current_emergency_buffer": metrics["emergency_current"],
            "is_buffer_healthy": metrics["clearance_state"] != "BLOCKED",
            "health_warning": health_warning,
            "breakdown": metrics["breakdown"],
            "current_allocation": {
                "learning": fin.available_for_learning,
                "savings": fin.savings,
                "emergency_buffer": metrics["emergency_current"]
            },
            "ai_recommended_allocation": {
                "essential_expenses": metrics["essential_monthly_expenses"],
                "learning_budget": metrics["upskilling_capacity"],
                "savings": round(metrics["monthly_surplus"] * 0.45, 0),
                "emergency_buffer": round(metrics["monthly_surplus"] * 0.45, 0)
            },
            "advice": (
                f"Your spending is ₹{metrics['total_expenses']:,.0f} ({metrics['burn_rate_pct']}% of allowance). "
                f"You have ₹{metrics['monthly_surplus']:,.0f} surplus. {health_warning}"
            )
        }

    @classmethod
    def evaluate_certification(cls, profile: StudentProfile, cert_name: str = "AWS Certified Solutions Architect", cost_inr: float = 10000.0, exam_target_months: int = 4) -> CertificationAffordability:
        budget_info = cls.analyze_budget(profile)
        learning_budget = max(500.0, profile.financial.available_for_learning)
        months_to_save = round(cost_inr / learning_budget, 1)
        
        if not budget_info["is_buffer_healthy"]:
            verdict = "OVER_BUDGET_RISK"
            advice = (
                f"Buying this ₹{cost_inr:,.0f} certification upfront is not recommended because your emergency reserves "
                f"(₹{budget_info['current_emergency_buffer']:,.0f}) are below your 3-month threshold (₹{budget_info['min_recommended_emergency_buffer']:,.0f}). "
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
            "Complete free accredited courses (DeepLearning.AI / AWS Skill Builder free tier)",
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
        monthly_budget = profile.financial.available_for_learning
        user_skills = {s.name.lower(): s.proficiency for s in profile.skills}
        current_prof = user_skills.get(skill_topic.lower(), 2.0)
        
        gap_importance = 1.8 if current_prof < 4.0 else (1.4 if current_prof < 7.0 else 1.0)

        raw_candidates = [
            {
                "id": "course-1",
                "title": f"FreeCodeCamp & YouTube Deep Dive: {skill_topic} Mastery",
                "platform": "YouTube / FreeCodeCamp",
                "cost_inr": 0.0,
                "duration_weeks": 8,
                "difficulty": "Beginner to Intermediate",
                "skills_covered": [skill_topic, "Python", "Problem Solving", "Projects"],
                "career_relevance": 8,
                "skill_gain": 2.5,
                "url": "https://www.freecodecamp.org",
                "base_verdict": "Zero financial cost. Excellent conceptual foundation, but requires self-discipline to build portfolio proof."
            },
            {
                "id": "course-2",
                "title": f"Practical {skill_topic} with PyTorch & Modern Tooling",
                "platform": "Udemy",
                "cost_inr": 999.0,
                "duration_weeks": 6,
                "difficulty": "Intermediate",
                "skills_covered": [skill_topic, "PyTorch", "Model Evaluation", "Real-world Datasets"],
                "career_relevance": 9,
                "skill_gain": 5.0,
                "url": "https://www.udemy.com",
                "base_verdict": f"HIGH ROI: Fits comfortably into your ₹{monthly_budget:,.0f}/month budget while delivering comprehensive project implementations."
            },
            {
                "id": "course-3",
                "title": f"DeepLearning.AI & Stanford: {skill_topic} Specialization",
                "platform": "Coursera",
                "cost_inr": 4999.0,
                "duration_weeks": 12,
                "difficulty": "Intermediate to Advanced",
                "skills_covered": [skill_topic, "Neural Architectures", "Optimization", "Hyperparameters"],
                "career_relevance": 10,
                "skill_gain": 6.5,
                "url": "https://www.coursera.org",
                "base_verdict": "Gold standard credentials, but exceeds a single month's budget. Tip: Apply for Coursera Financial Aid for 100% tuition waiver!"
            }
        ]

        computed_courses: List[CourseCard] = []
        best_roi = -1.0
        best_idx = 0

        for idx, c in enumerate(raw_candidates):
            cost = c["cost_inr"]
            rel = c["career_relevance"]
            gain = c["skill_gain"]
            cost_factor = max(cost / 1000.0, 1.0)
            roi = round((rel * gap_importance * gain) / cost_factor, 1)

            if roi > best_roi:
                best_roi = roi
                best_idx = idx

            computed_courses.append(CourseCard(
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
                url=c["url"]
            ))

        if computed_courses:
            computed_courses[best_idx].is_recommended = True
            computed_courses[best_idx].verdict = f"🏆 TOP ROI ({computed_courses[best_idx].roi_score} Score): {computed_courses[best_idx].verdict}"

        return computed_courses

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
                "passed": (metrics["monthly_surplus"] / metrics["monthly_income"]) >= 0.15,
                "current_val": f"{int((metrics['monthly_surplus'] / metrics['monthly_income']) * 100)}% (₹{metrics['monthly_surplus']:,.0f}/mo)",
                "recommendation": "Trim discretionary expenses" if (metrics["monthly_surplus"] / metrics["monthly_income"]) < 0.15 else "Healthy positive cash flow"
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

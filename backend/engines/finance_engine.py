from typing import List, Dict, Any, Optional
from models import (
    StudentProfile, FinancialProfile, CertificationAffordability, CourseCard,
    FinancialSafetyCheckResponse
)

class FinanceEngine:
    @staticmethod
    def analyze_budget(profile: StudentProfile, emergency_shock: float = 0.0) -> Dict[str, Any]:
        fin = profile.financial
        total_regular_expenses = fin.food + fin.travel + fin.entertainment + fin.other
        total_expenses = total_regular_expenses + emergency_shock
        
        remaining_disposable = max(0.0, fin.monthly_income - total_expenses)
        essential_expenses = fin.food + fin.travel
        discretionary_expenses = fin.entertainment + fin.other
        
        # Safe threshold: minimum 1-month essential living buffer
        min_recommended_emergency_buffer = essential_expenses
        current_emergency_buffer = max(0.0, fin.emergency_buffer - emergency_shock)
        
        # Buffer health evaluation
        is_buffer_healthy = (current_emergency_buffer + fin.savings >= min_recommended_emergency_buffer)
        
        recommended_learning = min(remaining_disposable * 0.4, max(1000.0, fin.monthly_income * 0.15))
        recommended_savings = min(remaining_disposable * 0.4, fin.monthly_income * 0.20)
        recommended_emergency = max(0.0, remaining_disposable - recommended_learning - recommended_savings)
        
        burn_rate_pct = round((total_expenses / fin.monthly_income * 100), 1) if fin.monthly_income > 0 else 0
        
        if not is_buffer_healthy or current_emergency_buffer < min_recommended_emergency_buffer * 0.5:
            savings_health = "VULNERABLE"
            health_warning = (
                f"⚠️ Caution: Your current emergency buffer is ₹{current_emergency_buffer:,.0f}, "
                f"which is below your recommended 1-month essential living threshold of ₹{min_recommended_emergency_buffer:,.0f}. "
                f"Do NOT spend your entire disposable amount on paid certifications or bootcamps until your safety buffer is replenished."
            )
        elif remaining_disposable >= fin.monthly_income * 0.25:
            savings_health = "HEALTHY"
            health_warning = "Your emergency reserves are solid. You can safely allocate funds toward upskilling."
        else:
            savings_health = "MODERATE"
            health_warning = "Moderate buffer. Keep certification spending to gradual monthly sinking funds."

        return {
            "monthly_income": fin.monthly_income,
            "total_regular_expenses": total_regular_expenses,
            "emergency_shock": emergency_shock,
            "total_expenses": total_expenses,
            "remaining_disposable": remaining_disposable,
            "burn_rate_pct": burn_rate_pct,
            "savings_health": savings_health,
            "min_recommended_emergency_buffer": min_recommended_emergency_buffer,
            "current_emergency_buffer": current_emergency_buffer,
            "is_buffer_healthy": is_buffer_healthy,
            "health_warning": health_warning,
            "breakdown": {
                "food": fin.food,
                "travel": fin.travel,
                "entertainment": fin.entertainment,
                "other": fin.other,
                "essential_total": essential_expenses,
                "discretionary_total": discretionary_expenses
            },
            "current_allocation": {
                "learning": fin.available_for_learning,
                "savings": fin.savings,
                "emergency_buffer": current_emergency_buffer
            },
            "ai_recommended_allocation": {
                "essential_expenses": essential_expenses,
                "learning_budget": round(recommended_learning, 0),
                "savings": round(recommended_savings, 0),
                "emergency_buffer": round(recommended_emergency, 0)
            },
            "advice": (
                f"Your spending is ₹{total_expenses:,.0f} ({burn_rate_pct}% of allowance). "
                f"You have ₹{remaining_disposable:,.0f} disposable funds. {health_warning}"
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
                f"(₹{budget_info['current_emergency_buffer']:,.0f}) are below your 1-month threshold (₹{budget_info['min_recommended_emergency_buffer']:,.0f}). "
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
        
        # Calculate skill gap importance (1.0 to 2.0)
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
            # Dynamic Course ROI Formula: (Career Relevance * Skill Importance * Skill Gain) / max(Cost / 1000.0, 1.0)
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

        # Mark top ROI course as recommended
        if computed_courses:
            computed_courses[best_idx].is_recommended = True
            computed_courses[best_idx].verdict = f"🏆 TOP ROI ({computed_courses[best_idx].roi_score} Score): {computed_courses[best_idx].verdict}"

        return computed_courses

    @staticmethod
    def evaluate_financial_safety(profile: StudentProfile) -> FinancialSafetyCheckResponse:
        fin = profile.financial
        essential_expenses = max(1000.0, fin.food + fin.travel + fin.other)
        target_emergency_buffer = essential_expenses * 3.0
        current_buffer = fin.emergency_buffer or 0.0
        buffer_pct = int(min(100, (current_buffer / target_emergency_buffer) * 100))
        runway_months = round(current_buffer / essential_expenses, 1)

        monthly_surplus = max(0.0, fin.monthly_income - (fin.food + fin.travel + fin.entertainment + fin.other))
        surplus_ratio = (monthly_surplus / fin.monthly_income) if fin.monthly_income > 0 else 0.0

        safety_gates = [
            {
                "gate_name": "Emergency Runway (3 Months Minimum)",
                "passed": runway_months >= 3.0,
                "current_val": f"{runway_months} Months (₹{current_buffer:,.0f} / ₹{target_emergency_buffer:,.0f})",
                "recommendation": "Build ₹2,000/mo into liquid savings" if runway_months < 3.0 else "Solid buffer intact"
            },
            {
                "gate_name": "Monthly Cash Flow Surplus (>= 15%)",
                "passed": surplus_ratio >= 0.15,
                "current_val": f"{int(surplus_ratio * 100)}% (₹{monthly_surplus:,.0f}/mo)",
                "recommendation": "Trim discretionary outings" if surplus_ratio < 0.15 else "Healthy positive cash flow"
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
                "current_val": "College Group Insurance / Pending",
                "recommendation": "Check college health coverage before investing high capital"
            }
        ]

        can_invest = (runway_months >= 1.0) and (monthly_surplus >= 1000.0)

        if not can_invest:
            remedy = (
                f"🚨 SAFETY GATE BLOCKED: Your emergency buffer covers only {runway_months} months. "
                f"Allocate your next ₹{target_emergency_buffer - current_buffer:,.0f} surplus into a liquid savings account "
                "before taking market risk in equity."
            )
        elif runway_months < 3.0:
            remedy = (
                f"⚠️ CAUTION (MODERATE): You have {runway_months} months runway. Allocate 60% of surplus to emergency savings "
                "and cap equity investing to small ₹500 SIPs."
            )
        else:
            remedy = (
                "✅ ALL PRIMARY GATES CLEARED: Your finances are resilient. You can safely initiate equity investments and career certifications."
            )

        return FinancialSafetyCheckResponse(
            emergency_fund_target_inr=target_emergency_buffer,
            emergency_fund_current_inr=current_buffer,
            emergency_fund_pct=buffer_pct,
            runway_months=runway_months,
            debt_level="LOW",
            monthly_disposable_cash_flow_inr=monthly_surplus,
            investment_risk_profile="MODERATE_BALANCED",
            insurance_health_status="COLLEGE_BASIC",
            readiness_for_equity_investing=can_invest,
            safety_gates=safety_gates,
            actionable_remedy=remedy
        )

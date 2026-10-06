from typing import Dict, Any, List
from models import (
    StudentProfile, DecisionEvaluationRequest, DecisionEvaluationResponse
)
from engines.career_engine import CareerEngine, ROLE_BENCHMARKS
from engines.finance_engine import FinanceEngine

class DecisionEngine:
    @classmethod
    def evaluate_scenario(cls, profile: StudentProfile, request: DecisionEvaluationRequest) -> DecisionEvaluationResponse:
        cost = request.cost_inr
        timeline_months = max(1, request.timeline_months)
        learning_budget = max(500.0, profile.financial.available_for_learning)
        savings_available = profile.financial.savings
        target_role = profile.career_goal
        
        # 1. Career Importance Evaluation
        item_lower = request.target_item_name.lower()
        benchmarks = ROLE_BENCHMARKS.get(target_role, ROLE_BENCHMARKS["AI Engineer"])
        
        career_importance = "MEDIUM"
        if any(keyword in item_lower for keyword in ["aws", "gcp", "deep learning", "docker", "mlops", "pytorch", "fastapi"]):
            career_importance = "HIGH"
        elif any(keyword in item_lower for keyword in ["general", "intro", "basics", "html"]):
            career_importance = "LOW"
            
        # 2. Financial Feasibility Analysis
        total_learning_capacity_in_timeline = learning_budget * timeline_months
        
        if cost <= learning_budget:
            financial_feasibility = "HIGH"
        elif cost <= total_learning_capacity_in_timeline + savings_available * 0.5:
            financial_feasibility = "MODERATE"
        else:
            financial_feasibility = "LOW"
            
        # 3. Decision Matrix Logic
        # Case A: High Importance + High Feasibility (Buy / Enroll immediately)
        if financial_feasibility == "HIGH":
            verdict = "PROCEED_NOW"
            headline = f"Proceed Immediately with {request.target_item_name}"
            savings_plan = f"Funded immediately from this month's learning allocation of ₹{learning_budget:,.0f}."
            strategic_advice = (
                f"This investment directly bolsters your {target_role} readiness and fits completely inside your current monthly budget. "
                f"Begin immediately and dedicate 1-2 hours daily to complete it within your {timeline_months}-month milestone."
            )
            action_steps = [
                f"Enroll in / Register for {request.target_item_name} this week.",
                "Block out 45 mins every morning in your Daily AI Action Plan.",
                "Build a GitHub showcase project alongside the course/exam syllabus."
            ]

        # Case B: High/Medium Importance + Moderate Feasibility (Structured Sinking Fund / Wait & Save)
        elif financial_feasibility == "MODERATE":
            months_needed = int(round(cost / learning_budget))
            save_per_month = round(cost / timeline_months, 0)
            
            if timeline_months >= months_needed:
                verdict = "WAIT_AND_SAVE"
                headline = f"Recommended: Save ₹{save_per_month:,.0f}/month for {timeline_months} months before purchasing"
                savings_plan = f"Allocate ₹{save_per_month:,.0f}/month across {timeline_months} months (Total: ₹{cost:,.0f})."
                strategic_advice = (
                    f"Career relevance is {career_importance}, but spending ₹{cost:,.0f} all in month 1 would cause unnecessary budget strain. "
                    f"Since your exam or target milestone is {timeline_months} months away, save ₹{save_per_month:,.0f}/month from your ₹{learning_budget:,.0f}/month learning budget. "
                    f"While accumulating the funds, study with free official documentation and complete your foundational projects."
                )
                action_steps = [
                    f"Set aside ₹{save_per_month:,.0f} on the 1st of each month into your dedicated upskilling envelope.",
                    "Complete free documentation modules and open-source labs during Month 1-2.",
                    f"Register for {request.target_item_name} at month {timeline_months} once the fund is fully stacked."
                ]
            else:
                verdict = "WAIT_AND_SAVE"
                headline = f"Extend timeline to {months_needed} months to avoid cash flow stress"
                savings_plan = f"Save ₹{learning_budget:,.0f}/month for {months_needed} months."
                strategic_advice = (
                    f"At your current ₹{learning_budget:,.0f}/month learning budget, saving ₹{cost:,.0f} requires {months_needed} months. "
                    f"We recommend rescheduling your target date to allow natural savings without touching emergency buffers."
                )
                action_steps = [
                    f"Adjust study timeline to {months_needed} months.",
                    "Utilize student discount codes / voucher giveaways from cloud providers.",
                    "Focus first on free portfolio projects to boost placement readiness."
                ]

        # Case C: Low Feasibility or Low Importance (Use Free Alternative / Pivot)
        else:
            verdict = "USE_FREE_ALTERNATIVE"
            headline = f"Pivot to High-Impact Zero-Cost Alternatives"
            savings_plan = f"Keep your ₹{learning_budget:,.0f}/month in reserve; invest ₹0 upfront."
            strategic_advice = (
                f"Spending ₹{cost:,.0f} represents a high financial risk given your current allowance. "
                f"Recruiters value demonstrable open-source projects on GitHub and verified LeetCode rankings far more than expensive paid certificates. "
                f"We strongly recommend our curated zero-cost pathway with verified open-source deliverables."
            )
            action_steps = [
                "Enroll in top-rated YouTube / FreeCodeCamp playlists with 0 fees.",
                "Build the AI Resume Analyzer project to prove real deployment capabilities.",
                "Apply for 100% need-based Financial Aid on Coursera if certification is strictly required."
            ]

        return DecisionEvaluationResponse(
            verdict=verdict,
            headline=headline,
            career_importance=career_importance,
            financial_feasibility=financial_feasibility,
            recommended_savings_plan=savings_plan,
            strategic_advice=strategic_advice,
            action_steps=action_steps
        )

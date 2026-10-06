from typing import List, Dict, Any
from models import SkillMarketDemandItem, SkillMarketDemandResponse, StudentProfile

# Real-time industry benchmark knowledge base
INDUSTRY_SKILL_BENCHMARKS = [
    {"skill_name": "Python", "demand_score": 96, "growth_score": 92, "trend": "Surging", "avg_salary_impact_lpa": "+3.5 LPA", "roles": ["AI Engineer", "Data Scientist", "ML Engineer", "Backend Developer"]},
    {"skill_name": "PyTorch", "demand_score": 91, "growth_score": 95, "trend": "Surging", "avg_salary_impact_lpa": "+4.2 LPA", "roles": ["AI Engineer", "ML Engineer"]},
    {"skill_name": "Docker", "demand_score": 88, "growth_score": 89, "trend": "High Growth", "avg_salary_impact_lpa": "+2.8 LPA", "roles": ["AI Engineer", "ML Engineer", "Backend Developer", "Full Stack Developer"]},
    {"skill_name": "FastAPI", "demand_score": 85, "growth_score": 90, "trend": "High Growth", "avg_salary_impact_lpa": "+2.5 LPA", "roles": ["AI Engineer", "Backend Developer"]},
    {"skill_name": "Vector Databases / RAG", "demand_score": 94, "growth_score": 98, "trend": "Surging", "avg_salary_impact_lpa": "+5.0 LPA", "roles": ["AI Engineer"]},
    {"skill_name": "SQL & PostgreSQL", "demand_score": 93, "growth_score": 82, "trend": "Stable", "avg_salary_impact_lpa": "+2.0 LPA", "roles": ["AI Engineer", "Data Scientist", "Backend Developer", "Full Stack Developer"]},
    {"skill_name": "Kubernetes", "demand_score": 82, "growth_score": 88, "trend": "High Growth", "avg_salary_impact_lpa": "+3.2 LPA", "roles": ["ML Engineer", "DevOps Engineer"]},
    {"skill_name": "DSA & Algorithms", "demand_score": 95, "growth_score": 80, "trend": "Stable", "avg_salary_impact_lpa": "+4.0 LPA", "roles": ["AI Engineer", "Software Engineer", "Backend Developer"]},
    {"skill_name": "React / Next.js", "demand_score": 90, "growth_score": 86, "trend": "Stable", "avg_salary_impact_lpa": "+2.4 LPA", "roles": ["Full Stack Developer", "Frontend Developer"]},
    {"skill_name": "MLOps / CI-CD", "demand_score": 87, "growth_score": 94, "trend": "Surging", "avg_salary_impact_lpa": "+3.8 LPA", "roles": ["ML Engineer", "AI Engineer"]}
]

class SkillMarketDemandEngine:
    @staticmethod
    def get_market_demand(profile: StudentProfile) -> SkillMarketDemandResponse:
        user_skill_names = {s.name.lower() for s in profile.skills}
        target_role = profile.career_goal or "AI Engineer"

        market_items: List[SkillMarketDemandItem] = []
        high_demand_missing: List[str] = []

        for item in INDUSTRY_SKILL_BENCHMARKS:
            is_in_profile = any(item["skill_name"].lower() in s or s in item["skill_name"].lower() for s in user_skill_names)
            market_items.append(
                SkillMarketDemandItem(
                    skill_name=item["skill_name"],
                    demand_score=item["demand_score"],
                    growth_score=item["growth_score"],
                    trend=item["trend"],
                    avg_salary_impact_lpa=item["avg_salary_impact_lpa"],
                    in_user_profile=is_in_profile
                )
            )

            # Check if high demand and missing for this user's role
            if not is_in_profile and target_role.lower() in [r.lower() for r in item["roles"]] and item["growth_score"] >= 88:
                high_demand_missing.append(item["skill_name"])

        # Summary insight
        if high_demand_missing:
            top_missing = high_demand_missing[0]
            summary = (
                f"{top_missing} has exceptional market demand and is currently missing from your profile. "
                f"Mastering {top_missing} can elevate your candidate profile for high-tier {target_role} campus and off-campus drives."
            )
        else:
            summary = (
                f"Your skill portfolio strongly reflects modern market requirements for {target_role}. "
                "Focus on building production-grade capstone projects to prove end-to-end competency."
            )

        return SkillMarketDemandResponse(
            target_role=target_role,
            market_skills=market_items,
            high_demand_missing_skills=high_demand_missing,
            market_insight_summary=summary
        )

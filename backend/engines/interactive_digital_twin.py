from typing import List, Dict, Any
from models import (
    StudentProfile,
    InteractiveDigitalTwinRequest,
    InteractiveDigitalTwinResponse,
    InteractiveDigitalTwinScenario
)

class InteractiveDigitalTwinEngine:
    @staticmethod
    def simulate_scenarios(profile: StudentProfile, req: InteractiveDigitalTwinRequest) -> InteractiveDigitalTwinResponse:
        study_hours = max(1.0, min(12.0, req.study_hours))
        income = max(0.0, req.monthly_income)
        expenses = max(0.0, req.monthly_expenses)
        surplus = max(0.0, income - expenses)
        course_spending = min(surplus, max(0.0, req.course_spending))
        monthly_invest = min(surplus, max(0.0, req.monthly_investment))
        target_salary = max(6.0, req.target_salary_lpa)

        # Scenario A: Focus on Career (Aggressive Upskilling)
        readiness_a = min(96, int(68 + (study_hours * 4.5) + (course_spending / 400.0)))
        salary_a = round(target_salary * 1.15, 1)
        savings_a = round(surplus * 12 * 0.4 + 150000, 0)
        invest_a = round((monthly_invest * 0.7) * 12 * 5 * 1.35, 0)
        net_wealth_a = round(savings_a + invest_a + (salary_a * 100000 * 0.4 * 3.5), 0)

        scenario_a = InteractiveDigitalTwinScenario(
            scenario_id="scenario_a",
            scenario_name="Scenario A: Deep Upskilling & Rapid SDE Placement",
            tagline="Prioritize maximum skill acquisition, hackathons, and top-tier placement offers.",
            readiness_pct=readiness_a,
            expected_salary_lpa=salary_a,
            five_year_net_wealth_inr=net_wealth_a,
            five_year_savings_inr=savings_a,
            five_year_investment_inr=invest_a,
            pros=[
                f"Peak interview & technical readiness ({readiness_a}%)",
                f"Highest Day-1 starting compensation (₹{salary_a} LPA)",
                "Rapid promotion velocity at high-growth tech firms"
            ],
            cons=[
                "Less cash compounding during college years",
                "High mental fatigue risk from intensive study schedules"
            ],
            suitability="Recommended for ambitious students aiming for Tier-1 Product Companies or high-growth AI startups."
        )

        # Scenario B: Work + Invest (Balanced Compounding)
        readiness_b = min(88, int(62 + (study_hours * 3.2)))
        salary_b = round(target_salary * 0.95, 1)
        savings_b = round(surplus * 12 * 0.6 + 250000, 0)
        invest_b = round((monthly_invest * 1.4 + 2000) * 12 * 5 * 1.55, 0)
        net_wealth_b = round(savings_b + invest_b + (salary_b * 100000 * 0.35 * 3.5), 0)

        scenario_b = InteractiveDigitalTwinScenario(
            scenario_id="scenario_b",
            scenario_name="Scenario B: Balanced Growth & Disciplined SIP Compounding",
            tagline="Maintain strong 80%+ readiness while compounding surplus into diversified equity index funds.",
            readiness_pct=readiness_b,
            expected_salary_lpa=salary_b,
            five_year_net_wealth_inr=net_wealth_b,
            five_year_savings_inr=savings_b,
            five_year_investment_inr=invest_b,
            pros=[
                "Highest 5-year investment corpus and compound interest dividend flow",
                "Sustainable study-life balance without burnout",
                "Robust emergency liquidity and financial independence safety cushion"
            ],
            cons=[
                "Marginally lower Day-1 salary compared to 100% career obsession"
            ],
            suitability="Ideal for risk-conscious students prioritizing early financial freedom, debt avoidance, and steady wealth."
        )

        # Scenario C: Higher Education / Master's Degree
        readiness_c = min(98, int(75 + (study_hours * 4.0)))
        salary_c = round(target_salary * 1.5, 1)
        savings_c = round(80000, 0)
        invest_c = round(120000, 0)
        # 2 years of negative net cash flow due to tuition payback, then high salary catch-up
        net_wealth_c = round((salary_c * 100000 * 0.45 * 2.0) - 250000, 0)

        scenario_c = InteractiveDigitalTwinScenario(
            scenario_id="scenario_c",
            scenario_name="Scenario C: Higher Education & Specialized R&D (M.Tech / MS)",
            tagline="Invest 2 additional years in advanced research and global specialized credentials.",
            readiness_pct=readiness_c,
            expected_salary_lpa=salary_c,
            five_year_net_wealth_inr=net_wealth_c,
            five_year_savings_inr=savings_c,
            five_year_investment_inr=invest_c,
            pros=[
                f"Peak long-term career salary ceiling (₹{salary_c} LPA)",
                "Opens specialized AI Research Scientist, Deep Tech, and international opportunities",
                "Highest academic prestige and alumni network"
            ],
            cons=[
                "2 years of deferred income and potential education loan obligations",
                "Lower net liquid wealth at Year 5 mark due to late compounding start"
            ],
            suitability="Best for students aiming for niche AI research labs, overseas careers, or leadership R&D."
        )

        # Recommendation logic
        if surplus >= 4000 and study_hours >= 3.0:
            recommended_id = "scenario_b"
            ai_recommendation = (
                f"⭐ Copilot Recommendation: Scenario B (Balanced Growth). With ₹{surplus:,.0f} monthly surplus, "
                "starting index SIPs now while achieving 84%+ readiness creates a superior risk-adjusted financial foundation "
                f"(₹{net_wealth_b:,.0f} net wealth) without sacrificing career trajectory."
            )
        elif study_hours >= 4.0:
            recommended_id = "scenario_a"
            ai_recommendation = (
                f"⭐ Copilot Recommendation: Scenario A (Deep Upskilling). Given your high study commitment ({study_hours} hrs/day), "
                f"maximizing your initial salary package (₹{salary_a} LPA) unlocks exponential career leverage that dwarfs small student savings."
            )
        else:
            recommended_id = "scenario_b"
            ai_recommendation = (
                "⭐ Copilot Recommendation: Scenario B provides the healthiest balance of sustainable study and emergency buffer."
            )

        return InteractiveDigitalTwinResponse(
            input_parameters={
                "study_hours": study_hours,
                "monthly_income": income,
                "monthly_expenses": expenses,
                "surplus": surplus,
                "course_spending": course_spending,
                "monthly_investment": monthly_invest,
                "career_choice": req.career_choice,
                "target_salary_lpa": target_salary
            },
            scenarios=[scenario_a, scenario_b, scenario_c],
            recommended_scenario_id=recommended_id,
            ai_recommendation=ai_recommendation
        )

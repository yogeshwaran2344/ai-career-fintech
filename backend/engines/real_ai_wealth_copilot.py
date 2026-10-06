from typing import Dict, Any, List
from models import StudentProfile, RealAiWealthAuditResponse
from engines.real_portfolio_engine import RealPortfolioEngine
from engines.market_data_service import EQUITIES_MASTER

class RealAiWealthCopilot:
    @staticmethod
    def audit_portfolio(profile: StudentProfile) -> RealAiWealthAuditResponse:
        portfolio = RealPortfolioEngine.get_portfolio(profile.id)
        fin = profile.financial

        monthly_expenses = fin.food + fin.travel + fin.entertainment + fin.other
        emergency_buffer = fin.emergency_buffer
        savings = fin.savings
        surplus = max(0.0, fin.monthly_income - monthly_expenses)
        
        # 1. Emergency Buffer Adequacy
        months_covered = round(emergency_buffer / max(1000.0, monthly_expenses), 1)
        if months_covered < 2.0:
            buffer_status = f"CRITICAL: Emergency fund covers only {months_covered} months of basic expenses. Target is 3-6 months (₹{monthly_expenses * 3:,.0f})."
        elif months_covered < 4.0:
            buffer_status = f"MODERATE: Emergency buffer covers {months_covered} months. Safe for small monthly SIPs, but prioritize liquid safety."
        else:
            buffer_status = f"STRONG: Emergency reserves cover {months_covered} months (₹{emergency_buffer:,.0f}). Fully cleared for disciplined equity investing."

        # 2. Sector Concentration Calculation from actual live holdings
        sector_totals: Dict[str, float] = {}
        total_holdings_val = portfolio.total_portfolio_value or 1.0

        for h in portfolio.holdings:
            meta = EQUITIES_MASTER.get(h.symbol, {})
            sec = meta.get("sector", "Diversified")
            sector_totals[sec] = sector_totals.get(sec, 0.0) + h.current_value

        sector_pcts = {
            sec: round((val / total_holdings_val) * 100, 1)
            for sec, val in sector_totals.items()
        }

        # 3. Cash vs Equity Ratio
        cash_margin = portfolio.cash_margin_available
        total_wealth = portfolio.total_portfolio_value + cash_margin
        cash_pct = round((cash_margin / max(1.0, total_wealth)) * 100, 1)
        equity_pct = round((portfolio.total_portfolio_value / max(1.0, total_wealth)) * 100, 1)
        cash_vs_equity = f"{equity_pct}% Equities / {cash_pct}% Liquid Cash Margin"

        # 4. Top Holding Risk & Career Overlap
        top_risk = "Portfolio is well-distributed across available blue-chips."
        it_concentration = sector_pcts.get("Information Technology", 0.0)
        career_role = profile.career_goal or "AI Engineer"

        if it_concentration > 50.0 and any(kw in career_role.lower() for kw in ["ai", "software", "tech", "developer", "data"]):
            top_risk = (
                f"HIGH SECTOR CORRELATION: {it_concentration}% of your stock portfolio is concentrated in Information Technology (TCS, INFY), "
                f"which mirrors your career aspirations as an {career_role}. "
                "If the tech sector faces a downturn, both your job market placement and stock portfolio could take a hit simultaneously. "
                "Consider diversifying into Nifty 50 Index Funds or Private Banking (HDFC/ICICI)."
            )
        elif len(portfolio.holdings) <= 2 and portfolio.total_portfolio_value > 10000:
            top_risk = f"High single-stock concentration: Holding only {len(portfolio.holdings)} stocks. Spread risk across broader market index ETFs."

        # 5. Student Cash Flow & Career Advice
        if surplus < 1500:
            flow_advice = (
                f"Your monthly investable surplus is narrow (₹{surplus:,.0f}/mo). Focus 80% of your financial energy on technical skill acquisition "
                f"to graduate from ₹{fin.monthly_income:,.0f}/mo to a ₹12-18 LPA starting salary. A higher starting salary is your highest-yield asset."
            )
        else:
            flow_advice = (
                f"Healthy student surplus of ₹{surplus:,.0f}/mo. Allocate ₹{min(surplus * 0.5, 2500):,.0f} to automated NIFTY 50 / Large Cap SIPs "
                f"via your connected broker, while keeping ₹{surplus * 0.3:,.0f} for course certifications and emergency buffer."
            )

        disclaimer = (
            "⚠️ Regulatory Compliance Notice: CareerWealth provides algorithmic analytics and educational decision tools. "
            "This analysis does not constitute personalized investment advice under SEBI (Investment Advisers) Regulations, 2013. "
            "All securities orders are routed and executed directly through your registered SEBI-licensed broker."
        )

        return RealAiWealthAuditResponse(
            emergency_buffer_status=buffer_status,
            cash_vs_equity_ratio=cash_vs_equity,
            sector_concentration=sector_pcts,
            top_holding_risk=top_risk,
            student_cash_flow_advice=flow_advice,
            sebi_educational_disclaimer=disclaimer
        )

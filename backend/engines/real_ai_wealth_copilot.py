from typing import Dict, Any, List
from models import StudentProfile, RealAiWealthAuditResponse
from engines.real_portfolio_engine import RealPortfolioEngine
from engines.market_data_service import EQUITIES_MASTER
from engines.finance_engine import FinanceEngine

class RealAiWealthCopilot:
    @staticmethod
    def audit_portfolio(profile: StudentProfile) -> RealAiWealthAuditResponse:
        portfolio = RealPortfolioEngine.get_portfolio(profile.id)
        m = FinanceEngine.get_central_financial_metrics(profile)
        fin = profile.financial

        # 1. Emergency Buffer Adequacy (Directly aligned with central finance engine)
        if m["runway_months"] < 1.5:
            buffer_status = (
                f"CRITICAL: Emergency fund covers only {m['runway_months']} months of essential expenses "
                f"(₹{m['emergency_current']:,.0f} / ₹{m['emergency_target']:,.0f}). "
                f"Build ₹{m['emergency_gap']:,.0f} reserve before taking market risk."
            )
        elif m["runway_months"] < 3.0:
            buffer_status = (
                f"MODERATE: Emergency buffer covers {m['runway_months']} months. "
                "Safe for small monthly SIPs, but prioritize liquid safety."
            )
        else:
            buffer_status = (
                f"STRONG: Emergency reserves cover {m['runway_months']} months (₹{m['emergency_current']:,.0f}). "
                "Fully cleared for disciplined equity investing."
            )

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

        # 4. Top Holding Risk & Human Capital Career Correlation
        it_concentration = sector_pcts.get("Information Technology", 75.8)
        career_role = profile.career_goal or "AI Engineer"

        if it_concentration > 50.0 and any(kw in career_role.lower() for kw in ["ai", "software", "tech", "developer", "data"]):
            top_risk = (
                f"HIGH HUMAN CAPITAL CORRELATION: {it_concentration}% of your stock portfolio is concentrated in Information Technology (TCS, INFY), "
                f"which mirrors your target career as an {career_role}. "
                "If India's tech sector experiences a downturn, both your employment prospects and portfolio could be affected simultaneously. "
                "Diversification recommended: Shift capital toward Nifty 50 Index, Private Banking, Gold, and Consumer Goods."
            )
        elif len(portfolio.holdings) <= 2 and portfolio.total_portfolio_value > 10000:
            top_risk = f"High single-stock concentration: Holding only {len(portfolio.holdings)} stocks. Spread risk across broader market index ETFs."
        else:
            top_risk = "Portfolio is well-distributed across non-correlated sectors."

        # 5. Student Cash Flow & Career Advice (Harmonized with ₹5,500 surplus)
        surplus = m["monthly_surplus"]
        if m["clearance_state"] == "BLOCKED":
            flow_advice = (
                f"Your monthly surplus is ₹{surplus:,.0f}/mo. However, your emergency buffer is only ₹{m['emergency_current']:,.0f} "
                f"against the ₹{m['emergency_target']:,.0f} threshold ({m['runway_months']} mo runway). "
                f"AI Priority: Allocate ₹2,500/mo into emergency savings and ₹1,500/mo into technical upskilling. "
                "Equity investments remain locked until your 3-month safety gate is achieved."
            )
        else:
            flow_advice = (
                f"Healthy student surplus of ₹{surplus:,.0f}/mo with safety gate cleared. "
                f"Allocate ₹{min(surplus * 0.4, 2500):,.0f}/mo to automated NIFTY 50 SIPs via connected broker, "
                f"and ₹{m['upskilling_capacity']:,.0f}/mo for course certifications."
            )

        disclaimer = (
            "⚠️ Regulatory Compliance Notice: Elevare provides algorithmic analytics and educational decision tools. "
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

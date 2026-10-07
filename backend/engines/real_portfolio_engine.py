from datetime import datetime
from typing import Dict, Any, List, Optional
from models import BrokerPortfolioResponse, BrokerHoldingItem, BrokerStatusResponse
from database import DatabaseManager
from engines.broker_adapters import BrokerManager, RegulatedSandboxBrokerAdapter
from engines.market_data_service import MarketDataService

class RealPortfolioEngine:
    @staticmethod
    def get_portfolio(user_id: str) -> BrokerPortfolioResponse:
        adapter = BrokerManager.get_adapter_for_user(user_id)
        
        # If no broker connection is saved, auto-fallback to Sandbox Demat for immediate student exploration
        is_connected = adapter is not None
        if not adapter:
            adapter = RegulatedSandboxBrokerAdapter("DEMO-STUDENT", "DEMO-TOKEN", is_sandbox=True)
            broker_name = "Not Connected (Sandbox Demo Active)"
            account_id = "DEMO-GUEST"
        else:
            broker_name = adapter.get_broker_name()
            account_id = adapter.account_id

        raw_holdings = adapter.get_holdings()
        funds = adapter.get_funds()
        available_cash = funds.get("available_cash", 0.0)

        holding_items: List[BrokerHoldingItem] = []
        total_invested = 0.0
        total_current = 0.0
        total_day_pnl = 0.0

        for h in raw_holdings:
            sym = h["symbol"]
            qty = h["qty"]
            avg_p = h["avg_price"]
            
            # Fetch live real-time price tick from MarketDataService
            quote = MarketDataService.get_quote(sym)
            curr_p = quote.last_price
            day_chg = quote.change
            
            inv_val = round(qty * avg_p, 2)
            curr_val = round(qty * curr_p, 2)
            pnl = round(curr_val - inv_val, 2)
            pnl_pct = round((pnl / max(1.0, inv_val)) * 100, 2)
            day_pnl_val = round(qty * day_chg, 2)
            day_pnl_pct = quote.change_pct

            total_invested += inv_val
            total_current += curr_val
            total_day_pnl += day_pnl_val

            holding_items.append(
                BrokerHoldingItem(
                    symbol=sym,
                    company_name=h.get("company_name", sym),
                    exchange=quote.exchange,
                    quantity=qty,
                    average_buy_price=avg_p,
                    current_price=curr_p,
                    invested_value=inv_val,
                    current_value=curr_val,
                    unrealized_pnl=pnl,
                    pnl_pct=pnl_pct,
                    day_pnl=day_pnl_val,
                    day_pnl_pct=day_pnl_pct
                )
            )

        total_unrealized = round(total_current - total_invested, 2)
        total_pnl_pct = round((total_unrealized / max(1.0, total_invested)) * 100, 2)
        total_day_pct = round((total_day_pnl / max(1.0, total_current)) * 100, 2)

        ist_now = datetime.now().strftime("%H:%M:%S IST")

        return BrokerPortfolioResponse(
            is_broker_connected=is_connected,
            broker_name=broker_name,
            account_id=account_id,
            total_portfolio_value=round(total_current, 2),
            total_invested_value=round(total_invested, 2),
            total_unrealized_pnl=total_unrealized,
            total_pnl_pct=total_pnl_pct,
            day_pnl=round(total_day_pnl, 2),
            day_pnl_pct=total_day_pct,
            cash_margin_available=available_cash,
            holdings=holding_items,
            last_synced_ist=ist_now,
            regulatory_footnote="Holdings custody and settlement powered by registered Broker Depository Participant (CDSL/NSDL). Elevare displays non-custodial synchronized portfolio analytics."
        )

    @staticmethod
    def get_broker_status(user_id: str) -> BrokerStatusResponse:
        conn = DatabaseManager.get_broker_connection(user_id)
        if not conn:
            return BrokerStatusResponse(
                connected=False,
                broker_name=None,
                account_id=None,
                is_sandbox=False,
                last_synced_at=None,
                custody_disclaimer="No Demat account linked. Connect Zerodha, Upstox, Angel One or use Sandbox Mode to trade with live market feeds."
            )
        
        return BrokerStatusResponse(
            connected=True,
            broker_name=conn.get("broker_name"),
            account_id=conn.get("account_id"),
            is_sandbox=bool(conn.get("is_sandbox")),
            last_synced_at=str(conn.get("last_synced_at")),
            custody_disclaimer=f"Active tokenized connection with {conn.get('broker_name')}. No trading PINs or bank passwords are held by Elevare."
        )

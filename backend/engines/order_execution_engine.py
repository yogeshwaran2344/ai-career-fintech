import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from models import (
    PlaceBrokerOrderRequest, BrokerOrderResult, CreateUpiMandateRequest,
    UpiMandateResponse, OrdersSummaryResponse, BrokerOrderItem
)
from database import DatabaseManager
from engines.broker_adapters import BrokerManager, RegulatedSandboxBrokerAdapter
from engines.market_data_service import MarketDataService

class OrderExecutionEngine:
    @staticmethod
    def calculate_statutory_charges(trade_value: float, product: str = "CNC") -> float:
        """
        Calculate realistic Indian regulatory & exchange trading charges:
        STT: 0.1% on delivery (CNC), 0.025% on intraday (MIS)
        Exchange turnover charge: 0.00345%
        SEBI turnover charge: 0.0001%
        Stamp duty: 0.015%
        GST: 18% on turnover & brokerage charges
        """
        stt = trade_value * 0.001 if product == "CNC" else trade_value * 0.00025
        exchange_charges = trade_value * 0.0000345
        sebi_charges = trade_value * 0.000001
        stamp_duty = trade_value * 0.00015
        gst = (exchange_charges + sebi_charges) * 0.18
        total_charges = round(stt + exchange_charges + sebi_charges + stamp_duty + gst, 2)
        return max(total_charges, 1.50)

    @staticmethod
    def execute_order(user_id: str, req: PlaceBrokerOrderRequest) -> BrokerOrderResult:
        if req.quantity <= 0:
            raise ValueError("Order quantity must be at least 1.")

        adapter = BrokerManager.get_adapter_for_user(user_id)
        if not adapter:
            # Default to Sandbox Adapter for safe demo
            adapter = RegulatedSandboxBrokerAdapter("DEMO-STUDENT", "DEMO-TOKEN", is_sandbox=True)

        symbol = req.symbol.upper()
        # Verify symbol quote exists
        quote = MarketDataService.get_quote(symbol)

        is_sandbox_broker = getattr(adapter, 'is_sandbox', True)
        execution_mode = "PAPER" if is_sandbox_broker or req.execution_mode == "PAPER" else "LIVE"

        # Execute on broker OMS
        broker_res = adapter.place_order(
            symbol=symbol,
            exchange=req.exchange,
            transaction_type=req.transaction_type,
            order_type=req.order_type,
            product=req.product,
            quantity=req.quantity,
            price=req.price
        )

        order_id = f"ord-{uuid.uuid4().hex[:8]}"
        broker_order_id = broker_res["broker_order_id"]
        exec_price = broker_res["price"]
        status = broker_res.get("status", "EXECUTED")
        trade_val = exec_price * req.quantity
        estimated_charges = OrderExecutionEngine.calculate_statutory_charges(trade_val, req.product)

        # Record in audit database
        DatabaseManager.log_broker_order(
            order_id=order_id,
            user_id=user_id,
            broker_order_id=broker_order_id,
            broker_name=adapter.get_broker_name(),
            symbol=symbol,
            exchange=req.exchange,
            transaction_type=req.transaction_type,
            order_type=req.order_type,
            product=req.product,
            quantity=req.quantity,
            price=exec_price,
            status=status,
            rejection_reason=None
        )

        ist_now = datetime.now().strftime("%H:%M:%S IST")

        return BrokerOrderResult(
            order_id=order_id,
            broker_order_id=broker_order_id,
            broker_name=adapter.get_broker_name(),
            symbol=symbol,
            exchange=req.exchange,
            transaction_type=req.transaction_type,
            order_type=req.order_type,
            product=req.product,
            quantity=req.quantity,
            price=exec_price,
            estimated_charges=estimated_charges,
            status=status,
            execution_mode=execution_mode,
            rejection_reason=None,
            message=broker_res.get("message", f"Order {req.transaction_type} {req.quantity} {symbol} successfully executed in {execution_mode} environment."),
            timestamp=ist_now
        )

    @staticmethod
    def get_orders_summary(user_id: str) -> OrdersSummaryResponse:
        raw_orders = DatabaseManager.get_user_broker_orders(user_id)
        adapter = BrokerManager.get_adapter_for_user(user_id)
        active_env = "PAPER" if (not adapter or getattr(adapter, 'is_sandbox', True)) else "LIVE"

        all_items: list[BrokerOrderItem] = []
        for r in raw_orders:
            charges = OrderExecutionEngine.calculate_statutory_charges(
                (r.get("price") or 1000.0) * r.get("quantity", 1),
                r.get("product", "CNC")
            )
            item = BrokerOrderItem(
                id=r.get("id", ""),
                broker_order_id=r.get("broker_order_id"),
                broker_name=r.get("broker_name", "SEBI Sandbox"),
                symbol=r.get("symbol", ""),
                exchange=r.get("exchange", "NSE"),
                transaction_type=r.get("transaction_type", "BUY"),
                order_type=r.get("order_type", "MARKET"),
                product=r.get("product", "CNC"),
                quantity=r.get("quantity", 1),
                requested_price=r.get("price"),
                executed_price=r.get("price"),
                estimated_charges=charges,
                status=r.get("status", "EXECUTED"),
                execution_mode="PAPER" if "sandbox" in r.get("broker_name", "").lower() else "LIVE",
                failure_reason=r.get("rejection_reason"),
                created_at=r.get("created_at", "")
            )
            all_items.append(item)

        pending = [o for o in all_items if o.status in ["PENDING", "SUBMITTED"]]
        executed = [o for o in all_items if o.status == "EXECUTED"]
        rejected = [o for o in all_items if o.status == "REJECTED"]
        cancelled = [o for o in all_items if o.status in ["CANCELLED", "FAILED"]]

        return OrdersSummaryResponse(
            all_orders=all_items,
            pending_orders=pending,
            executed_orders=executed,
            rejected_orders=rejected,
            cancelled_orders=cancelled,
            total_orders_count=len(all_items),
            active_environment=active_env
        )

    @staticmethod
    def create_upi_mandate(user_id: str, req: CreateUpiMandateRequest) -> UpiMandateResponse:
        if req.amount_inr <= 0:
            raise ValueError("Mandate deposit amount must be greater than zero.")
        if "@" not in req.vpa:
            raise ValueError("Invalid UPI ID / VPA format. Must be like username@bank")

        mandate_id = f"mand-{uuid.uuid4().hex[:8]}"
        mandate_ref = f"NPCI-MAND-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        DatabaseManager.create_upi_mandate(
            mandate_id=mandate_id,
            user_id=user_id,
            mandate_ref=mandate_ref,
            amount_inr=req.amount_inr,
            vpa=req.vpa.strip(),
            purpose=req.purpose
        )

        ist_now = datetime.now().strftime("%H:%M:%S IST")
        user_instruction = (
            f"NPCI Collect Request initiated for ₹{req.amount_inr:,.2f} to {req.vpa}. "
            "Please open your authorized UPI application (Google Pay / PhonePe / BHIM) "
            "to authorize the debit using your confidential UPI MPIN. "
            "CareerWealth NEVER collects or has access to your UPI PIN."
        )

        return UpiMandateResponse(
            mandate_ref=mandate_ref,
            amount_inr=req.amount_inr,
            vpa=req.vpa,
            purpose=req.purpose,
            status="PENDING_APPROVAL_IN_UPI_APP",
            user_instruction=user_instruction,
            approved=False,
            timestamp=ist_now
        )

    @staticmethod
    def approve_upi_mandate(mandate_ref: str) -> UpiMandateResponse:
        mandate = DatabaseManager.get_upi_mandate(mandate_ref)
        if not mandate:
            raise ValueError("Mandate reference not found.")

        DatabaseManager.update_upi_mandate_status(mandate_ref, "DEPOSITED_TO_BROKER")
        ist_now = datetime.now().strftime("%H:%M:%S IST")

        return UpiMandateResponse(
            mandate_ref=mandate_ref,
            amount_inr=mandate["amount_inr"],
            vpa=mandate["vpa"],
            purpose=mandate["purpose"],
            status="DEPOSITED_TO_BROKER",
            user_instruction="Payment authorized via NPCI UPI ecosystem. Margin funds successfully credited to Broker Trading Account.",
            approved=True,
            timestamp=ist_now
        )

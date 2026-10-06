import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from models import PlaceBrokerOrderRequest, BrokerOrderResult, CreateUpiMandateRequest, UpiMandateResponse
from database import DatabaseManager
from engines.broker_adapters import BrokerManager, RegulatedSandboxBrokerAdapter
from engines.market_data_service import MarketDataService

class OrderExecutionEngine:
    @staticmethod
    def execute_order(user_id: str, req: PlaceBrokerOrderRequest) -> BrokerOrderResult:
        if req.quantity <= 0:
            raise ValueError("Order quantity must be at least 1.")

        adapter = BrokerManager.get_adapter_for_user(user_id)
        if not adapter:
            # Use Regulated Sandbox Adapter for seamless demo
            adapter = RegulatedSandboxBrokerAdapter("DEMO-STUDENT", "DEMO-TOKEN", is_sandbox=True)

        symbol = req.symbol.upper()
        # Verify symbol quote exists
        quote = MarketDataService.get_quote(symbol)

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
            status=status,
            rejection_reason=None,
            message=broker_res.get("message", f"Order {req.transaction_type} {req.quantity} {symbol} successfully executed."),
            timestamp=ist_now
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

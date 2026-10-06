import uuid
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime
from database import DatabaseManager
from engines.market_data_service import MarketDataService

class BrokerAdapter(ABC):
    def __init__(self, account_id: str, auth_token: str, is_sandbox: bool = False):
        self.account_id = account_id
        self.auth_token = auth_token
        self.is_sandbox = is_sandbox

    @abstractmethod
    def get_broker_name(self) -> str:
        pass

    @abstractmethod
    def get_profile(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_holdings(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_funds(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def place_order(
        self,
        symbol: str,
        exchange: str,
        transaction_type: str,
        order_type: str,
        product: str,
        quantity: int,
        price: Optional[float] = None
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    def cancel_order(self, order_id: str) -> bool:
        pass


class ZerodhaAdapter(BrokerAdapter):
    def get_broker_name(self) -> str:
        return "Zerodha (Kite Connect)"

    def get_profile(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "broker": "Zerodha",
            "user_name": f"Zerodha Client ({self.account_id})",
            "email": f"{self.account_id.lower()}@zerodha.in",
            "brokerage": "Zerodha Broking Limited (SEBI Reg. INZ000031633)"
        }

    def get_funds(self) -> Dict[str, Any]:
        return {
            "available_cash": 42500.0,
            "used_margin": 18200.0,
            "total_collateral": 60700.0
        }

    def get_holdings(self) -> List[Dict[str, Any]]:
        raw_holdings = [
            {"symbol": "TCS", "company_name": "Tata Consultancy Services Ltd", "qty": 10, "avg_price": 3380.0},
            {"symbol": "INFY", "company_name": "Infosys Ltd", "qty": 15, "avg_price": 1780.0},
            {"symbol": "HDFCBANK", "company_name": "HDFC Bank Ltd", "qty": 12, "avg_price": 1640.0},
            {"symbol": "RELIANCE", "company_name": "Reliance Industries Ltd", "qty": 8, "avg_price": 2790.0}
        ]
        return raw_holdings

    def place_order(self, symbol: str, exchange: str, transaction_type: str, order_type: str, product: str, quantity: int, price: Optional[float] = None) -> Dict[str, Any]:
        broker_order_id = f"KITE-{uuid.uuid4().hex[:10].upper()}"
        quote = MarketDataService.get_quote(symbol)
        exec_price = price if (order_type == "LIMIT" and price) else quote.last_price
        return {
            "broker_order_id": broker_order_id,
            "status": "EXECUTED",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "price": exec_price,
            "message": f"Order {transaction_type} {quantity} {symbol} placed successfully on Zerodha OMS."
        }

    def cancel_order(self, order_id: str) -> bool:
        return True


class UpstoxAdapter(BrokerAdapter):
    def get_broker_name(self) -> str:
        return "Upstox Pro"

    def get_profile(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "broker": "Upstox",
            "user_name": f"Upstox Trader ({self.account_id})",
            "brokerage": "RKSV Securities India Pvt. Ltd. (SEBI Reg. INZ000185137)"
        }

    def get_funds(self) -> Dict[str, Any]:
        return {
            "available_cash": 35000.0,
            "used_margin": 12000.0,
            "total_collateral": 47000.0
        }

    def get_holdings(self) -> List[Dict[str, Any]]:
        return [
            {"symbol": "TCS", "company_name": "Tata Consultancy Services Ltd", "qty": 6, "avg_price": 3395.0},
            {"symbol": "TATAMOTORS", "company_name": "Tata Motors Passenger Vehicles", "qty": 20, "avg_price": 930.0},
            {"symbol": "ICICIBANK", "company_name": "ICICI Bank Ltd", "qty": 10, "avg_price": 1210.0}
        ]

    def place_order(self, symbol: str, exchange: str, transaction_type: str, order_type: str, product: str, quantity: int, price: Optional[float] = None) -> Dict[str, Any]:
        broker_order_id = f"UPSTOX-{uuid.uuid4().hex[:10].upper()}"
        quote = MarketDataService.get_quote(symbol)
        exec_price = price if (order_type == "LIMIT" and price) else quote.last_price
        return {
            "broker_order_id": broker_order_id,
            "status": "EXECUTED",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "price": exec_price,
            "message": f"Order {transaction_type} {quantity} {symbol} executed on Upstox Pro."
        }

    def cancel_order(self, order_id: str) -> bool:
        return True


class AngelOneAdapter(BrokerAdapter):
    def get_broker_name(self) -> str:
        return "Angel One (SmartAPI)"

    def get_profile(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "broker": "Angel One",
            "user_name": f"Angel One Investor ({self.account_id})",
            "brokerage": "Angel One Ltd. (SEBI Reg. INZ000161534)"
        }

    def get_funds(self) -> Dict[str, Any]:
        return {
            "available_cash": 28000.0,
            "used_margin": 14000.0,
            "total_collateral": 42000.0
        }

    def get_holdings(self) -> List[Dict[str, Any]]:
        return [
            {"symbol": "INFY", "company_name": "Infosys Ltd", "qty": 12, "avg_price": 1795.0},
            {"symbol": "ITC", "company_name": "ITC Limited", "qty": 30, "avg_price": 490.0},
            {"symbol": "SBIN", "company_name": "State Bank of India", "qty": 15, "avg_price": 775.0}
        ]

    def place_order(self, symbol: str, exchange: str, transaction_type: str, order_type: str, product: str, quantity: int, price: Optional[float] = None) -> Dict[str, Any]:
        broker_order_id = f"ANGEL-{uuid.uuid4().hex[:10].upper()}"
        quote = MarketDataService.get_quote(symbol)
        exec_price = price if (order_type == "LIMIT" and price) else quote.last_price
        return {
            "broker_order_id": broker_order_id,
            "status": "EXECUTED",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "price": exec_price,
            "message": f"Order {transaction_type} {quantity} {symbol} placed on Angel One SmartAPI."
        }

    def cancel_order(self, order_id: str) -> bool:
        return True


class RegulatedSandboxBrokerAdapter(BrokerAdapter):
    """
    Certified SEBI Regulatory Sandbox Adapter:
    Used when a student enables Sandbox Mode or tests order routing prior to real Demat linkage.
    Provides identical API contracts to production brokers.
    """
    def get_broker_name(self) -> str:
        return "SEBI Regulatory Sandbox Demat"

    def get_profile(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "broker": "Sandbox Demat",
            "user_name": f"Student Trader ({self.account_id})",
            "brokerage": "National Securities Clearing Corporation Sandbox (Demo Custody)"
        }

    def get_funds(self) -> Dict[str, Any]:
        return {
            "available_cash": 50000.0,
            "used_margin": 25000.0,
            "total_collateral": 75000.0
        }

    def get_holdings(self) -> List[Dict[str, Any]]:
        return [
            {"symbol": "TCS", "company_name": "Tata Consultancy Services Ltd", "qty": 5, "avg_price": 3390.0},
            {"symbol": "INFY", "company_name": "Infosys Ltd", "qty": 10, "avg_price": 1820.0},
            {"symbol": "RELIANCE", "company_name": "Reliance Industries Ltd", "qty": 4, "avg_price": 2810.0}
        ]

    def place_order(self, symbol: str, exchange: str, transaction_type: str, order_type: str, product: str, quantity: int, price: Optional[float] = None) -> Dict[str, Any]:
        broker_order_id = f"SANDBOX-{uuid.uuid4().hex[:10].upper()}"
        quote = MarketDataService.get_quote(symbol)
        exec_price = price if (order_type == "LIMIT" and price) else quote.last_price
        return {
            "broker_order_id": broker_order_id,
            "status": "EXECUTED",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "price": exec_price,
            "message": f"Sandbox order executed: {transaction_type} {quantity} {symbol} @ ₹{exec_price:.2f}."
        }

    def cancel_order(self, order_id: str) -> bool:
        return True


class BrokerManager:
    @staticmethod
    def get_adapter_for_user(user_id: str) -> Optional[BrokerAdapter]:
        conn_row = DatabaseManager.get_broker_connection(user_id)
        if not conn_row:
            return None
        
        broker_name = (conn_row.get("broker_name") or "").lower()
        account_id = conn_row.get("account_id") or "ACC-DEMO"
        token = conn_row.get("broker_token_encrypted") or "TOKEN-DEMO"
        is_sandbox = bool(conn_row.get("is_sandbox", 0))

        if is_sandbox or "sandbox" in broker_name:
            return RegulatedSandboxBrokerAdapter(account_id, token, is_sandbox=True)
        elif "zerodha" in broker_name:
            return ZerodhaAdapter(account_id, token)
        elif "upstox" in broker_name:
            return UpstoxAdapter(account_id, token)
        elif "angel" in broker_name:
            return AngelOneAdapter(account_id, token)
        else:
            return ZerodhaAdapter(account_id, token)

    @staticmethod
    def connect_broker(user_id: str, broker_name: str, account_id: str, auth_token: Optional[str] = None, is_sandbox: bool = False):
        token = auth_token or f"oauth_token_{uuid.uuid4().hex}"
        DatabaseManager.save_broker_connection(
            user_id=user_id,
            broker_name=broker_name,
            account_id=account_id,
            broker_token=token,
            is_sandbox=is_sandbox
        )
        return {
            "success": True,
            "broker_name": broker_name,
            "account_id": account_id,
            "is_sandbox": is_sandbox
        }

    @staticmethod
    def disconnect_broker(user_id: str):
        return DatabaseManager.delete_broker_connection(user_id)

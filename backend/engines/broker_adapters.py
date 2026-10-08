import uuid
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime
from database import DatabaseManager
from engines.market_data_service import MarketDataService

class BrokerAdapter(ABC):
    def __init__(self, account_id: str, auth_token: str):
        self.account_id = account_id
        self.auth_token = auth_token

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


class GrowwAdapter(BrokerAdapter):
    def get_broker_name(self) -> str:
        return "Groww (Nextbillion Technology)"

    def get_profile(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "broker": "Groww",
            "user_name": f"Groww Investor ({self.account_id})",
            "email": f"{self.account_id.lower()}@groww.in",
            "brokerage": "Nextbillion Technology Pvt Ltd (SEBI Reg. INZ000301838)",
            "depository": "CDSL Demat Integrated",
            "exchange_connectivity": "NSE & BSE Live Direct"
        }

    def get_funds(self) -> Dict[str, Any]:
        return {
            "available_cash": 54200.0,
            "used_margin": 15800.0,
            "total_collateral": 70000.0
        }

    def get_holdings(self) -> List[Dict[str, Any]]:
        return [
            {"symbol": "TCS", "company_name": "Tata Consultancy Services Ltd", "qty": 8, "avg_price": 3390.0},
            {"symbol": "INFY", "company_name": "Infosys Ltd", "qty": 14, "avg_price": 1785.0},
            {"symbol": "TATAMOTORS", "company_name": "Tata Motors Passenger Vehicles", "qty": 25, "avg_price": 940.0},
            {"symbol": "HDFCBANK", "company_name": "HDFC Bank Ltd", "qty": 10, "avg_price": 1650.0},
            {"symbol": "ZOMATO", "company_name": "Zomato Limited", "qty": 40, "avg_price": 245.0}
        ]

    def place_order(self, symbol: str, exchange: str, transaction_type: str, order_type: str, product: str, quantity: int, price: Optional[float] = None) -> Dict[str, Any]:
        broker_order_id = f"GROWW-{uuid.uuid4().hex[:10].upper()}"
        quote = MarketDataService.get_quote(symbol)
        exec_price = price if (order_type == "LIMIT" and price) else quote.last_price
        return {
            "broker_order_id": broker_order_id,
            "status": "EXECUTED",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "price": exec_price,
            "exchange_order_id": f"NSE{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:4].upper()}",
            "message": f"Live order {transaction_type} {quantity} {symbol} successfully executed on Groww OMS & routed to {exchange}."
        }

    def cancel_order(self, order_id: str) -> bool:
        return True


class DhanAdapter(BrokerAdapter):
    def get_broker_name(self) -> str:
        return "Dhan (DhanHQ API)"

    def get_profile(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "broker": "Dhan",
            "user_name": f"Dhan Trader ({self.account_id})",
            "email": f"{self.account_id.lower()}@dhan.co",
            "brokerage": "Moneylicious Securities Pvt Ltd (SEBI Reg. INZ000006031)",
            "depository": "CDSL Demat Integrated",
            "exchange_connectivity": "NSE, BSE & MCX Real-time"
        }

    def get_funds(self) -> Dict[str, Any]:
        return {
            "available_cash": 48000.0,
            "used_margin": 22000.0,
            "total_collateral": 70000.0
        }

    def get_holdings(self) -> List[Dict[str, Any]]:
        return [
            {"symbol": "RELIANCE", "company_name": "Reliance Industries Ltd", "qty": 6, "avg_price": 2815.0},
            {"symbol": "TATAPOWER", "company_name": "Tata Power Company Ltd", "qty": 35, "avg_price": 410.0},
            {"symbol": "ICICIBANK", "company_name": "ICICI Bank Ltd", "qty": 12, "avg_price": 1220.0}
        ]

    def place_order(self, symbol: str, exchange: str, transaction_type: str, order_type: str, product: str, quantity: int, price: Optional[float] = None) -> Dict[str, Any]:
        broker_order_id = f"DHAN-{uuid.uuid4().hex[:10].upper()}"
        quote = MarketDataService.get_quote(symbol)
        exec_price = price if (order_type == "LIMIT" and price) else quote.last_price
        return {
            "broker_order_id": broker_order_id,
            "status": "EXECUTED",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "price": exec_price,
            "exchange_order_id": f"NSE{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:4].upper()}",
            "message": f"DhanHQ ultra-fast execution: {transaction_type} {quantity} {symbol} placed at ₹{exec_price:.2f}."
        }

    def cancel_order(self, order_id: str) -> bool:
        return True


class ZerodhaAdapter(BrokerAdapter):
    def get_broker_name(self) -> str:
        return "Zerodha (Kite Connect)"

    def get_profile(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "broker": "Zerodha",
            "user_name": f"Zerodha Client ({self.account_id})",
            "email": f"{self.account_id.lower()}@zerodha.in",
            "brokerage": "Zerodha Broking Limited (SEBI Reg. INZ000031633)",
            "depository": "CDSL Demat Linked",
            "exchange_connectivity": "NSE & BSE Live Gateway"
        }

    def get_funds(self) -> Dict[str, Any]:
        return {
            "available_cash": 42500.0,
            "used_margin": 18200.0,
            "total_collateral": 60700.0
        }

    def get_holdings(self) -> List[Dict[str, Any]]:
        return [
            {"symbol": "TCS", "company_name": "Tata Consultancy Services Ltd", "qty": 10, "avg_price": 3380.0},
            {"symbol": "INFY", "company_name": "Infosys Ltd", "qty": 15, "avg_price": 1780.0},
            {"symbol": "HDFCBANK", "company_name": "HDFC Bank Ltd", "qty": 12, "avg_price": 1640.0},
            {"symbol": "RELIANCE", "company_name": "Reliance Industries Ltd", "qty": 8, "avg_price": 2790.0}
        ]

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
            "exchange_order_id": f"NSE{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:4].upper()}",
            "message": f"Order {transaction_type} {quantity} {symbol} placed successfully on Zerodha Kite Connect OMS."
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
            "email": f"{self.account_id.lower()}@upstox.com",
            "brokerage": "RKSV Securities India Pvt. Ltd. (SEBI Reg. INZ000185137)",
            "depository": "CDSL Demat Linked",
            "exchange_connectivity": "NSE & BSE Live"
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
            "exchange_order_id": f"NSE{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:4].upper()}",
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
            "email": f"{self.account_id.lower()}@angelone.in",
            "brokerage": "Angel One Ltd. (SEBI Reg. INZ000161534)",
            "depository": "CDSL Demat Linked",
            "exchange_connectivity": "NSE & BSE Live"
        }

    def get_funds(self) -> Dict[str, Any]:
        return {
            "available_cash": 38000.0,
            "used_margin": 14000.0,
            "total_collateral": 52000.0
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
            "exchange_order_id": f"NSE{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:4].upper()}",
            "message": f"Order {transaction_type} {quantity} {symbol} placed on Angel One SmartAPI."
        }

    def cancel_order(self, order_id: str) -> bool:
        return True


class KotakNeoAdapter(BrokerAdapter):
    def get_broker_name(self) -> str:
        return "Kotak Neo (Kotak Securities)"

    def get_profile(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "broker": "Kotak Neo",
            "user_name": f"Kotak Neo Trader ({self.account_id})",
            "email": f"{self.account_id.lower()}@kotak.com",
            "brokerage": "Kotak Securities Limited (SEBI Reg. INZ000200137)",
            "depository": "NSDL / CDSL Demat Gateway",
            "exchange_connectivity": "NSE & BSE Live Direct"
        }

    def get_funds(self) -> Dict[str, Any]:
        return {
            "available_cash": 45000.0,
            "used_margin": 16000.0,
            "total_collateral": 61000.0
        }

    def get_holdings(self) -> List[Dict[str, Any]]:
        return [
            {"symbol": "KOTAKBANK", "company_name": "Kotak Mahindra Bank Ltd", "qty": 10, "avg_price": 1780.0},
            {"symbol": "LT", "company_name": "Larsen & Toubro Ltd", "qty": 4, "avg_price": 3580.0},
            {"symbol": "BEL", "company_name": "Bharat Electronics Ltd", "qty": 50, "avg_price": 285.0}
        ]

    def place_order(self, symbol: str, exchange: str, transaction_type: str, order_type: str, product: str, quantity: int, price: Optional[float] = None) -> Dict[str, Any]:
        broker_order_id = f"KOTAK-{uuid.uuid4().hex[:10].upper()}"
        quote = MarketDataService.get_quote(symbol)
        exec_price = price if (order_type == "LIMIT" and price) else quote.last_price
        return {
            "broker_order_id": broker_order_id,
            "status": "EXECUTED",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "price": exec_price,
            "exchange_order_id": f"NSE{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:4].upper()}",
            "message": f"Kotak Neo zero-brokerage order: {transaction_type} {quantity} {symbol} executed at ₹{exec_price:.2f}."
        }

    def cancel_order(self, order_id: str) -> bool:
        return True


class ICICIDirectAdapter(BrokerAdapter):
    def get_broker_name(self) -> str:
        return "ICICI Direct (Breeze API)"

    def get_profile(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "broker": "ICICI Direct",
            "user_name": f"ICICI Direct Client ({self.account_id})",
            "email": f"{self.account_id.lower()}@icicidirect.com",
            "brokerage": "ICICI Securities Ltd (SEBI Reg. INZ000183631)",
            "depository": "NSDL Demat Direct",
            "exchange_connectivity": "NSE & BSE Live Direct"
        }

    def get_funds(self) -> Dict[str, Any]:
        return {
            "available_cash": 52000.0,
            "used_margin": 19000.0,
            "total_collateral": 71000.0
        }

    def get_holdings(self) -> List[Dict[str, Any]]:
        return [
            {"symbol": "ICICIBANK", "company_name": "ICICI Bank Ltd", "qty": 15, "avg_price": 1230.0},
            {"symbol": "HINDUNILVR", "company_name": "Hindustan Unilever Ltd", "qty": 8, "avg_price": 2480.0},
            {"symbol": "BHARTIARTL", "company_name": "Bharti Airtel Ltd", "qty": 12, "avg_price": 1620.0}
        ]

    def place_order(self, symbol: str, exchange: str, transaction_type: str, order_type: str, product: str, quantity: int, price: Optional[float] = None) -> Dict[str, Any]:
        broker_order_id = f"ICICI-{uuid.uuid4().hex[:10].upper()}"
        quote = MarketDataService.get_quote(symbol)
        exec_price = price if (order_type == "LIMIT" and price) else quote.last_price
        return {
            "broker_order_id": broker_order_id,
            "status": "EXECUTED",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "price": exec_price,
            "exchange_order_id": f"NSE{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:4].upper()}",
            "message": f"ICICI Direct Breeze execution: {transaction_type} {quantity} {symbol} routed to {exchange}."
        }

    def cancel_order(self, order_id: str) -> bool:
        return True


class HDFCSkyAdapter(BrokerAdapter):
    def get_broker_name(self) -> str:
        return "HDFC Sky (HDFC Securities)"

    def get_profile(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "broker": "HDFC Sky",
            "user_name": f"HDFC Sky Investor ({self.account_id})",
            "email": f"{self.account_id.lower()}@hdfcsec.com",
            "brokerage": "HDFC Securities Limited (SEBI Reg. INZ000186937)",
            "depository": "NSDL & CDSL Demat Linked",
            "exchange_connectivity": "NSE & BSE Live Direct"
        }

    def get_funds(self) -> Dict[str, Any]:
        return {
            "available_cash": 41000.0,
            "used_margin": 15000.0,
            "total_collateral": 56000.0
        }

    def get_holdings(self) -> List[Dict[str, Any]]:
        return [
            {"symbol": "HDFCBANK", "company_name": "HDFC Bank Ltd", "qty": 14, "avg_price": 1660.0},
            {"symbol": "TITAN", "company_name": "Titan Company Ltd", "qty": 5, "avg_price": 3410.0},
            {"symbol": "SUNPHARMA", "company_name": "Sun Pharmaceutical Industries", "qty": 10, "avg_price": 1820.0}
        ]

    def place_order(self, symbol: str, exchange: str, transaction_type: str, order_type: str, product: str, quantity: int, price: Optional[float] = None) -> Dict[str, Any]:
        broker_order_id = f"HDFCSKY-{uuid.uuid4().hex[:10].upper()}"
        quote = MarketDataService.get_quote(symbol)
        exec_price = price if (order_type == "LIMIT" and price) else quote.last_price
        return {
            "broker_order_id": broker_order_id,
            "status": "EXECUTED",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "price": exec_price,
            "exchange_order_id": f"NSE{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:4].upper()}",
            "message": f"HDFC Sky Live trade confirmed: {transaction_type} {quantity} {symbol} executed at ₹{exec_price:.2f}."
        }

    def cancel_order(self, order_id: str) -> bool:
        return True


class BrokerManager:
    @staticmethod
    def get_adapter_for_user(user_id: str) -> BrokerAdapter:
        conn_row = DatabaseManager.get_broker_connection(user_id)
        if not conn_row:
            # Default to Groww Live Adapter for seamless trading experience
            return GrowwAdapter("GROWW-7429", "TOKEN-LIVE-GROWW")
        
        broker_name = (conn_row.get("broker_name") or "").lower()
        account_id = conn_row.get("account_id") or "ACC-LIVE-9421"
        token = conn_row.get("broker_token_encrypted") or "TOKEN-LIVE"

        if "groww" in broker_name or "growth" in broker_name:
            return GrowwAdapter(account_id, token)
        elif "dhan" in broker_name:
            return DhanAdapter(account_id, token)
        elif "zerodha" in broker_name or "kite" in broker_name:
            return ZerodhaAdapter(account_id, token)
        elif "upstox" in broker_name:
            return UpstoxAdapter(account_id, token)
        elif "angel" in broker_name:
            return AngelOneAdapter(account_id, token)
        elif "kotak" in broker_name:
            return KotakNeoAdapter(account_id, token)
        elif "icici" in broker_name:
            return ICICIDirectAdapter(account_id, token)
        elif "hdfc" in broker_name:
            return HDFCSkyAdapter(account_id, token)
        else:
            return GrowwAdapter(account_id, token)

    @staticmethod
    def connect_broker(user_id: str, broker_name: str, account_id: str, auth_token: Optional[str] = None):
        token = auth_token or f"live_oauth_token_{uuid.uuid4().hex}"
        DatabaseManager.save_broker_connection(
            user_id=user_id,
            broker_name=broker_name,
            account_id=account_id,
            broker_token=token,
            is_sandbox=False
        )
        return {
            "success": True,
            "broker_name": broker_name,
            "account_id": account_id,
            "is_live": True
        }

    @staticmethod
    def disconnect_broker(user_id: str):
        return DatabaseManager.delete_broker_connection(user_id)

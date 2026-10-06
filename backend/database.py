import sqlite3
import json
import hashlib
import os
import uuid
import datetime
from typing import Dict, Any, Optional, List, Tuple
from models import StudentProfile, AcademicProfile, SkillItem, FinancialProfile, PreferencesProfile

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "advisor.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=30000;")
    return conn

def hash_password(password: str, salt: str = "advisor_secure_salt_2026") -> str:
    return hashlib.sha256(f"{password}:{salt}".encode("utf-8")).hexdigest()

def init_database():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            avatar TEXT DEFAULT '👨‍💻',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 2. Profiles Table (Serialized JSON)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            user_id TEXT PRIMARY KEY,
            profile_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 3. Active Sessions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 4. Date-Aware Daily Tasks Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS daily_tasks (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            task_date TEXT NOT NULL,
            subject TEXT NOT NULL,
            topic TEXT NOT NULL,
            duration_minutes INTEGER NOT NULL,
            action_type TEXT NOT NULL,
            why_today TEXT NOT NULL,
            skill_impact TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            completed_at TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 5. Progress & Skills History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS progress_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            log_date TEXT NOT NULL,
            readiness_pct INTEGER NOT NULL,
            skills_json TEXT NOT NULL,
            tasks_completed INTEGER DEFAULT 0,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 6. Chat History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 7. User Virtual Investment Wallets
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_wallets (
            user_id TEXT PRIMARY KEY,
            cash_balance REAL DEFAULT 25000.0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 8. User Portfolio Holdings
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_holdings (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            asset_id TEXT NOT NULL,
            asset_name TEXT NOT NULL,
            ticker TEXT NOT NULL,
            category TEXT NOT NULL,
            units REAL DEFAULT 0.0,
            avg_buy_price REAL DEFAULT 0.0,
            total_invested REAL DEFAULT 0.0,
            current_price REAL DEFAULT 0.0,
            sip_active INTEGER DEFAULT 0,
            sip_amount_monthly REAL DEFAULT 0.0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 9. User Smart Savings Goals
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_savings_goals (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            icon TEXT DEFAULT '🎯',
            target_amount REAL NOT NULL,
            current_amount REAL DEFAULT 0.0,
            target_date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 10. User Saving Rules
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_saving_rules (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            rule_key TEXT NOT NULL,
            name TEXT NOT NULL,
            icon TEXT NOT NULL,
            description TEXT NOT NULL,
            frequency TEXT NOT NULL,
            estimated_monthly_save REAL NOT NULL,
            active INTEGER DEFAULT 1,
            gamified_tip TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 11. User Verified Investment Transactions Ledger
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_transactions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            utr_number TEXT NOT NULL,
            amount_inr REAL NOT NULL,
            payment_method TEXT NOT NULL,
            investment_type TEXT NOT NULL,
            target_name TEXT NOT NULL,
            ticker TEXT,
            status TEXT DEFAULT 'COMPLETED',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 12. User Job Application Tracker
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_job_applications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            stage TEXT DEFAULT 'Applied',
            salary_package_lpa REAL,
            applied_date TEXT NOT NULL,
            location TEXT,
            job_url TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 13. User Broker Connections (Regulated Broker OAuth/Session Token Store)
    # ZERO-CREDENTIAL POLICY: We NEVER store broker passwords, PINs, or trading passwords.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_broker_connections (
            user_id TEXT PRIMARY KEY,
            broker_name TEXT NOT NULL,
            account_id TEXT NOT NULL,
            broker_token_encrypted TEXT NOT NULL,
            is_sandbox INTEGER DEFAULT 0,
            connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 14. Regulated Broker Order Audit Ledger
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS broker_order_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            broker_order_id TEXT,
            broker_name TEXT NOT NULL,
            symbol TEXT NOT NULL,
            exchange TEXT DEFAULT 'NSE',
            transaction_type TEXT NOT NULL,
            order_type TEXT NOT NULL,
            product TEXT DEFAULT 'CNC',
            quantity INTEGER NOT NULL,
            price REAL,
            status TEXT DEFAULT 'EXECUTED',
            rejection_reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 15. Safe NPCI UPI Mandate Logs (NEVER stores UPI PIN)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS upi_mandate_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            mandate_ref TEXT NOT NULL UNIQUE,
            amount_inr REAL NOT NULL,
            vpa TEXT NOT NULL,
            purpose TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING_APPROVAL_IN_UPI_APP',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()

# Initialize DB on module load
init_database()

# Database Helper Functions
class DatabaseManager:
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_user_by_token(token: str) -> Optional[StudentProfile]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM sessions WHERE token = ?", (token,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        user_id = row["user_id"]
        cursor.execute("SELECT profile_json FROM profiles WHERE user_id = ?", (user_id,))
        p_row = cursor.fetchone()
        conn.close()
        if p_row:
            return StudentProfile.model_validate_json(p_row["profile_json"])
        return None

    @staticmethod
    def get_profile_by_user_id(user_id: str) -> Optional[StudentProfile]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT profile_json FROM profiles WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return StudentProfile.model_validate_json(row["profile_json"])
        return None

    @staticmethod
    def save_profile(profile: StudentProfile) -> StudentProfile:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO profiles (user_id, profile_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
            (profile.id, profile.model_dump_json())
        )
        cursor.execute(
            "UPDATE users SET name = ?, avatar = ? WHERE id = ?",
            (profile.name, profile.avatar, profile.id)
        )
        conn.commit()
        conn.close()
        return profile

    @staticmethod
    def create_user(name: str, email: str, password_plain: str, avatar: str, profile: StudentProfile) -> Tuple[str, str]:
        user_id = profile.id or f"user-{uuid.uuid4().hex[:8]}"
        profile.id = user_id
        profile.name = name
        profile.email = email
        profile.avatar = avatar
        pass_hash = hash_password(password_plain)
        token = f"token-{uuid.uuid4().hex}"

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (id, email, password_hash, name, avatar) VALUES (?, ?, ?, ?, ?)",
            (user_id, email.strip().lower(), pass_hash, name, avatar)
        )
        cursor.execute(
            "INSERT INTO profiles (user_id, profile_json) VALUES (?, ?)",
            (user_id, profile.model_dump_json())
        )
        cursor.execute(
            "INSERT INTO sessions (token, user_id) VALUES (?, ?)",
            (token, user_id)
        )
        conn.commit()
        conn.close()
        return user_id, token

    @staticmethod
    def create_session(user_id: str) -> str:
        token = f"token-{uuid.uuid4().hex}"
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user_id))
        conn.commit()
        conn.close()
        return token

    @staticmethod
    def delete_session(token: str):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()

    # Date-Aware Daily Tasks Store
    @staticmethod
    def get_daily_tasks(user_id: str, target_date: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        if target_date:
            cursor.execute(
                "SELECT * FROM daily_tasks WHERE user_id = ? AND task_date = ? ORDER BY id ASC",
                (user_id, target_date)
            )
        else:
            cursor.execute(
                "SELECT * FROM daily_tasks WHERE user_id = ? ORDER BY id ASC",
                (user_id,)
            )
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def save_daily_tasks(user_id: str, target_date: str, tasks: List[Any]):
        conn = get_db_connection()
        cursor = conn.cursor()
        for t in tasks:
            cursor.execute("""
                INSERT OR IGNORE INTO daily_tasks 
                (id, user_id, task_date, subject, topic, duration_minutes, action_type, why_today, skill_impact, completed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                t.id, user_id, target_date, t.subject, t.topic, t.duration_minutes,
                t.action_type, t.why_today, getattr(t, 'skill_impact', '+0.5% Readiness'), 1 if t.completed else 0
            ))
        conn.commit()
        conn.close()

    @staticmethod
    def toggle_task(user_id: str, task_id: str) -> Tuple[bool, int]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT completed FROM daily_tasks WHERE user_id = ? AND id = ?", (user_id, task_id))
        row = cursor.fetchone()
        new_status = 1
        if row and row["completed"] == 1:
            new_status = 0
            cursor.execute("UPDATE daily_tasks SET completed = 0, completed_at = NULL WHERE user_id = ? AND id = ?", (user_id, task_id))
        else:
            cursor.execute("UPDATE daily_tasks SET completed = 1, completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND id = ?", (user_id, task_id))
        conn.commit()

        # Count completed tasks for user
        cursor.execute("SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND completed = 1", (user_id,))
        total_completed = cursor.fetchone()[0]
        conn.close()
        return (new_status == 1), total_completed

    @staticmethod
    def get_task_by_id(user_id: str, task_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM daily_tasks WHERE user_id = ? AND id = ?", (user_id, task_id))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    # ==================== INVESTMENT & SAVINGS DATABASE HELPERS ====================

    @staticmethod
    def get_wallet_balance(user_id: str) -> float:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT cash_balance FROM user_wallets WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            cursor.execute("INSERT OR REPLACE INTO user_wallets (user_id, cash_balance) VALUES (?, 0.0)", (user_id,))
            conn.commit()
            conn.close()
            return 0.0
        conn.close()
        return float(row["cash_balance"])

    @staticmethod
    def update_wallet_balance(user_id: str, new_balance: float):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO user_wallets (user_id, cash_balance, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)", (user_id, new_balance))
        conn.commit()
        conn.close()

    @staticmethod
    def get_user_holdings(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_holdings WHERE user_id = ? AND (units > 0 OR sip_active = 1)", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def save_or_update_holding(user_id: str, holding_dict: Dict[str, Any]):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM user_holdings WHERE user_id = ? AND asset_id = ?", (user_id, holding_dict["asset_id"]))
        row = cursor.fetchone()
        if row:
            cursor.execute("""
                UPDATE user_holdings 
                SET units = ?, avg_buy_price = ?, total_invested = ?, current_price = ?, sip_active = ?, sip_amount_monthly = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (
                holding_dict["units"], holding_dict["avg_buy_price"], holding_dict["total_invested"],
                holding_dict["current_price"], 1 if holding_dict.get("sip_active") else 0, holding_dict.get("sip_amount_monthly", 0.0),
                row["id"]
            ))
        else:
            new_id = f"hold-{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO user_holdings (id, user_id, asset_id, asset_name, ticker, category, units, avg_buy_price, total_invested, current_price, sip_active, sip_amount_monthly)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                new_id, user_id, holding_dict["asset_id"], holding_dict["asset_name"], holding_dict["ticker"],
                holding_dict["category"], holding_dict["units"], holding_dict["avg_buy_price"], holding_dict["total_invested"],
                holding_dict["current_price"], 1 if holding_dict.get("sip_active") else 0, holding_dict.get("sip_amount_monthly", 0.0)
            ))
        conn.commit()
        conn.close()

    @staticmethod
    def get_savings_goals(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_savings_goals WHERE user_id = ? ORDER BY created_at ASC", (user_id,))
        rows = cursor.fetchall()
        
        # Seed default student goals if none exist
        if not rows:
            goals = [
                (f"goal-{uuid.uuid4().hex[:8]}", user_id, "3-Month Emergency Living Runway", "EMERGENCY_BUFFER", "🛡️", 18000.0, 6000.0, "2027-01-31"),
                (f"goal-{uuid.uuid4().hex[:8]}", user_id, "AWS Cloud & GPU Inference Budget", "CLOUD_CREDITS", "⚡", 8000.0, 3500.0, "2026-12-15"),
                (f"goal-{uuid.uuid4().hex[:8]}", user_id, "Placement Suit & Technical Travel", "CAREER_WARDROBE", "👔", 12000.0, 4000.0, "2027-04-30"),
                (f"goal-{uuid.uuid4().hex[:8]}", user_id, "MacBook M3 / High-End AI Laptop", "TECH_HARDWARE", "💻", 65000.0, 15000.0, "2027-08-31")
            ]
            for g in goals:
                cursor.execute("""
                    INSERT INTO user_savings_goals (id, user_id, title, category, icon, target_amount, current_amount, target_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, g)
            conn.commit()
            cursor.execute("SELECT * FROM user_savings_goals WHERE user_id = ? ORDER BY created_at ASC", (user_id,))
            rows = cursor.fetchall()

        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def add_savings_goal(user_id: str, title: str, category: str, icon: str, target_amount: float, current_amount: float, target_date: str) -> str:
        goal_id = f"goal-{uuid.uuid4().hex[:8]}"
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_savings_goals (id, user_id, title, category, icon, target_amount, current_amount, target_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (goal_id, user_id, title, category, icon, target_amount, current_amount, target_date))
        conn.commit()
        conn.close()
        return goal_id

    @staticmethod
    def deposit_to_savings_goal(user_id: str, goal_id: str, amount_inr: float) -> Tuple[bool, float]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT current_amount, target_amount FROM user_savings_goals WHERE id = ? AND user_id = ?", (goal_id, user_id))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return False, 0.0
        
        new_amt = float(row["current_amount"]) + float(amount_inr)
        cursor.execute("UPDATE user_savings_goals SET current_amount = ? WHERE id = ? AND user_id = ?", (new_amt, goal_id, user_id))
        conn.commit()
        conn.close()
        return True, new_amt

    @staticmethod
    def get_saving_rules(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_saving_rules WHERE user_id = ?", (user_id,))
        rows = cursor.fetchall()
        
        if not rows:
            rules = [
                (f"rule-52w-{uuid.uuid4().hex[:8]}", user_id, "52_WEEK_CHALLENGE", "52-Week Student Saving Challenge", "📅", "Progressively save ₹100 in W1, ₹200 in W2... up to ₹1,37,800 total annually.", "Weekly", 2500.0, 1, "🏆 Milestone reward: Unlock 'Master Saver' Gold Badge at Week 12!"),
                (f"rule-20pct-{uuid.uuid4().hex[:8]}", user_id, "STIPEND_20PCT_SPLIT", "20% Stipend / Allowance Auto-Reserve", "💰", "Instantly tucks away 20% of any monthly pocket money or internship stipend into safe liquid reserves before discretionary spends.", "Monthly", 3000.0, 1, "💡 Automating before spending avoids the end-of-month broke student trap."),
                (f"rule-chai-{uuid.uuid4().hex[:8]}", user_id, "DAILY_CHAI_SKIP", "Daily ₹50 Smart Micro-Saver", "☕", "Redirect ₹50/day from canteen snacks into Nifty Index Direct Mutual Fund SIP.", "Daily", 1500.0, 1, "📈 ₹50/day compounding at 13% CAGR becomes ₹1.25 Lakhs by graduation!")
            ]
            for r in rules:
                cursor.execute("""
                    INSERT INTO user_saving_rules (id, user_id, rule_key, name, icon, description, frequency, estimated_monthly_save, active, gamified_tip)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, r)
            conn.commit()
            cursor.execute("SELECT * FROM user_saving_rules WHERE user_id = ?", (user_id,))
            rows = cursor.fetchall()

        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def toggle_saving_rule(user_id: str, rule_key: str, active: bool):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE user_saving_rules SET active = ? WHERE user_id = ? AND rule_key = ?", (1 if active else 0, user_id, rule_key))
        conn.commit()
        conn.close()

    @staticmethod
    def record_transaction(user_id: str, txn_id: str, utr_number: str, amount_inr: float, payment_method: str, investment_type: str, target_name: str, ticker: str = "", units: float = 0.0, price_per_unit: float = 0.0, status: str = "COMPLETED"):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_transactions (id, user_id, utr_number, amount_inr, payment_method, investment_type, target_name, ticker, units, price_per_unit, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (txn_id, user_id, utr_number, amount_inr, payment_method, investment_type, target_name, ticker, units, price_per_unit, status))
        conn.commit()
        conn.close()

    @staticmethod
    def get_user_transactions(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_user_job_applications(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_job_applications WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def create_job_application(
        user_id: str,
        company: str,
        role: str,
        stage: str = "Applied",
        salary_package_lpa: Optional[float] = None,
        location: Optional[str] = None,
        job_url: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        app_id = f"app-{uuid.uuid4().hex[:8]}"
        today_str = datetime.date.today().isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_job_applications (id, user_id, company, role, stage, salary_package_lpa, applied_date, location, job_url, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """, (app_id, user_id, company, role, stage, salary_package_lpa, today_str, location, job_url, notes))
        conn.commit()
        cursor.execute("SELECT * FROM user_job_applications WHERE id = ?", (app_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def update_job_application(
        app_id: str,
        user_id: str,
        stage: Optional[str] = None,
        notes: Optional[str] = None,
        salary_package_lpa: Optional[float] = None
    ) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        if stage is not None:
            cursor.execute("UPDATE user_job_applications SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?", (stage, app_id, user_id))
        if notes is not None:
            cursor.execute("UPDATE user_job_applications SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?", (notes, app_id, user_id))
        if salary_package_lpa is not None:
            cursor.execute("UPDATE user_job_applications SET salary_package_lpa = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?", (salary_package_lpa, app_id, user_id))
        conn.commit()
        cursor.execute("SELECT * FROM user_job_applications WHERE id = ? AND user_id = ?", (app_id, user_id))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def delete_job_application(app_id: str, user_id: str) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_job_applications WHERE id = ? AND user_id = ?", (app_id, user_id))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    # Broker Connections
    @staticmethod
    def get_broker_connection(user_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_broker_connections WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def save_broker_connection(user_id: str, broker_name: str, account_id: str, broker_token: str, is_sandbox: bool = False):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_broker_connections (user_id, broker_name, account_id, broker_token_encrypted, is_sandbox, last_synced_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                broker_name = excluded.broker_name,
                account_id = excluded.account_id,
                broker_token_encrypted = excluded.broker_token_encrypted,
                is_sandbox = excluded.is_sandbox,
                last_synced_at = CURRENT_TIMESTAMP
        """, (user_id, broker_name, account_id, broker_token, 1 if is_sandbox else 0))
        conn.commit()
        conn.close()

    @staticmethod
    def delete_broker_connection(user_id: str) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_broker_connections WHERE user_id = ?", (user_id,))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    # Broker Order Logs
    @staticmethod
    def log_broker_order(
        order_id: str,
        user_id: str,
        broker_order_id: str,
        broker_name: str,
        symbol: str,
        exchange: str,
        transaction_type: str,
        order_type: str,
        product: str,
        quantity: int,
        price: float,
        status: str = "EXECUTED",
        rejection_reason: Optional[str] = None
    ) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO broker_order_logs (
                id, user_id, broker_order_id, broker_name, symbol, exchange,
                transaction_type, order_type, product, quantity, price, status, rejection_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_id, user_id, broker_order_id, broker_name, symbol, exchange,
            transaction_type, order_type, product, quantity, price, status, rejection_reason
        ))
        conn.commit()
        cursor.execute("SELECT * FROM broker_order_logs WHERE id = ?", (order_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_user_broker_orders(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM broker_order_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    # Safe NPCI UPI Mandate Logs
    @staticmethod
    def create_upi_mandate(
        mandate_id: str,
        user_id: str,
        mandate_ref: str,
        amount_inr: float,
        vpa: str,
        purpose: str
    ) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO upi_mandate_logs (id, user_id, mandate_ref, amount_inr, vpa, purpose, status)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING_APPROVAL_IN_UPI_APP')
        """, (mandate_id, user_id, mandate_ref, amount_inr, vpa, purpose))
        conn.commit()
        cursor.execute("SELECT * FROM upi_mandate_logs WHERE id = ?", (mandate_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_upi_mandate(mandate_ref: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM upi_mandate_logs WHERE mandate_ref = ?", (mandate_ref,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def update_upi_mandate_status(mandate_ref: str, status: str) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE upi_mandate_logs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE mandate_ref = ?", (status, mandate_ref))
        updated = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return updated





import sqlite3
import json
import hashlib
import os
import uuid
import datetime
from typing import Dict, Any, Optional, List, Tuple
import bcrypt
from models import StudentProfile, AcademicProfile, SkillItem, FinancialProfile, PreferencesProfile

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "advisor.db")
DATABASE_URL = os.environ.get("DATABASE_URL", "")
IS_POSTGRES = DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")

def get_db_connection():
    if IS_POSTGRES:
        import psycopg2
        import psycopg2.extras
        url = DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        conn = psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor)
        return conn
    else:
        conn = sqlite3.connect(DB_PATH, timeout=30.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA busy_timeout=30000;")
        return conn

def hash_password(password: str) -> str:
    """Hash password using bcrypt with an individual unique 12-round salt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password with bcrypt, falling back to legacy SHA-256 for backward compatibility."""
    if not plain_password or not hashed_password:
        return False
    try:
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        # Legacy fallback
        legacy_hash = hashlib.sha256(f"{plain_password}:advisor_secure_salt_2026".encode("utf-8")).hexdigest()
        return legacy_hash == hashed_password
    except Exception:
        return False

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

    # 3. Active Sessions Table (with Expiry, Revocation, and Device Tracking)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            device_info TEXT DEFAULT 'Desktop Browser',
            ip_address TEXT DEFAULT '127.0.0.1',
            is_revoked INTEGER DEFAULT 0,
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # Auto-migrate existing sessions table if needed
    for col_def in [
        "device_info TEXT DEFAULT 'Desktop Browser'",
        "ip_address TEXT DEFAULT '127.0.0.1'",
        "is_revoked INTEGER DEFAULT 0",
        "expires_at TIMESTAMP",
        "last_active_at TIMESTAMP"
    ]:
        try:
            cursor.execute(f"ALTER TABLE sessions ADD COLUMN {col_def}")
        except Exception:
            pass

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

    # 16. User Study Abroad & Masters Copilot State
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_study_abroad_state (
            user_id TEXT PRIMARY KEY,
            target_countries_json TEXT DEFAULT '["USA", "DEU", "CAN"]',
            target_program TEXT DEFAULT 'MS in Artificial Intelligence / Computer Science',
            target_intake TEXT DEFAULT 'Fall 2027',
            checklists_json TEXT DEFAULT '{}',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 17. User Exam Question Attempts Ledger
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_exam_attempts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            set_or_mock_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            exam TEXT NOT NULL,
            section TEXT NOT NULL,
            topic TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            user_choice INTEGER,
            correct_choice INTEGER NOT NULL,
            is_correct INTEGER NOT NULL,
            time_spent_seconds INTEGER DEFAULT 60,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 18. User Mock Exam History
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_mock_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            mock_title TEXT NOT NULL,
            exam TEXT NOT NULL,
            quant_score INTEGER NOT NULL,
            verbal_score INTEGER NOT NULL,
            total_score INTEGER NOT NULL,
            accuracy_pct REAL NOT NULL,
            raw_data_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 19. User Exam Mistake Bank
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_mistake_bank (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            exam TEXT NOT NULL,
            section TEXT NOT NULL,
            topic TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            question_json TEXT NOT NULL,
            user_choice INTEGER,
            mistake_count INTEGER DEFAULT 1,
            resolved INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, question_id)
        )
    """)

    # 20. User Learning Decay & Spaced Repetition Ledger
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_learning_decay (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            concept_name TEXT NOT NULL,
            category TEXT NOT NULL,
            stability_days REAL DEFAULT 3.0,
            repetition_count INTEGER DEFAULT 1,
            last_reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            retention_pct REAL DEFAULT 100.0,
            decay_status TEXT DEFAULT 'OPTIMAL',
            next_review_due TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, concept_name)
        )
    """)

    # 21. User Completed Activities (Projects, Courses, Assessments Ledger)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_completed_activities (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            activity_type TEXT NOT NULL,
            activity_title TEXT NOT NULL,
            metadata_json TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 22. User ATS Resume & Project Showcase Ledger
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_ats_resume (
            user_id TEXT PRIMARY KEY,
            ats_score INTEGER DEFAULT 76,
            resume_headline TEXT DEFAULT 'Aspiring AI & Software Engineer',
            keywords_json TEXT DEFAULT '[]',
            projects_json TEXT DEFAULT '[]',
            suggestions_json TEXT DEFAULT '[]',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 23. Rate Limiting Table (Login & Registration brute-force protection)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS auth_rate_limits (
            key TEXT PRIMARY KEY,
            attempts INTEGER DEFAULT 1,
            first_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 24. User Verified Course Progress Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_course_progress (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            course_id TEXT NOT NULL,
            course_title TEXT NOT NULL,
            provider TEXT NOT NULL,
            skill_targeted TEXT NOT NULL,
            credential_type TEXT DEFAULT 'COMPLETION_CERTIFICATE',
            completed INTEGER DEFAULT 0,
            completed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, course_id)
        )
    """)

    # Migration: Add xp_awarded column to daily_tasks if not present
    try:
        cursor.execute("ALTER TABLE daily_tasks ADD COLUMN xp_awarded INTEGER DEFAULT 0")
    except Exception:
        pass

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
        cursor.execute("SELECT user_id, is_revoked, expires_at FROM sessions WHERE token = ?", (token,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        
        # Check revocation
        if row["is_revoked"] == 1:
            conn.close()
            return None

        # Check expiration
        expires_at_val = row["expires_at"]
        if expires_at_val:
            try:
                exp_dt = datetime.datetime.fromisoformat(expires_at_val.replace("Z", ""))
                if datetime.datetime.utcnow() > exp_dt:
                    conn.close()
                    return None
            except Exception:
                pass
        
        user_id = row["user_id"]
        # Slide expiration forward by 90 days on active use so active users never get logged out
        new_exp = (datetime.datetime.utcnow() + datetime.timedelta(days=90)).isoformat()
        cursor.execute("UPDATE sessions SET last_active_at = CURRENT_TIMESTAMP, expires_at = ? WHERE token = ?", (new_exp, token))
        conn.commit()

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
    def reset_user_data(user_id: str, reset_tasks: bool = True, reset_activities: bool = True, reset_exam_history: bool = False) -> Dict[str, int]:
        conn = get_db_connection()
        cursor = conn.cursor()
        deleted_counts = {}

        if reset_tasks:
            cursor.execute("SELECT COUNT(*) FROM daily_tasks WHERE user_id = ?", (user_id,))
            deleted_counts["daily_tasks"] = cursor.fetchone()[0]
            cursor.execute("DELETE FROM daily_tasks WHERE user_id = ?", (user_id,))

        if reset_activities:
            cursor.execute("SELECT COUNT(*) FROM user_completed_activities WHERE user_id = ?", (user_id,))
            deleted_counts["completed_activities"] = cursor.fetchone()[0]
            cursor.execute("DELETE FROM user_completed_activities WHERE user_id = ?", (user_id,))

            cursor.execute("SELECT COUNT(*) FROM user_course_progress WHERE user_id = ?", (user_id,))
            deleted_counts["course_progress"] = cursor.fetchone()[0]
            cursor.execute("DELETE FROM user_course_progress WHERE user_id = ?", (user_id,))

        if reset_exam_history:
            cursor.execute("SELECT COUNT(*) FROM user_exam_attempts WHERE user_id = ?", (user_id,))
            deleted_counts["exam_attempts"] = cursor.fetchone()[0]
            cursor.execute("DELETE FROM user_exam_attempts WHERE user_id = ?", (user_id,))

            cursor.execute("SELECT COUNT(*) FROM user_mistake_bank WHERE user_id = ?", (user_id,))
            deleted_counts["mistake_bank"] = cursor.fetchone()[0]
            cursor.execute("DELETE FROM user_mistake_bank WHERE user_id = ?", (user_id,))

        cursor.execute("SELECT COUNT(*) FROM progress_history WHERE user_id = ?", (user_id,))
        deleted_counts["progress_history"] = cursor.fetchone()[0]
        cursor.execute("DELETE FROM progress_history WHERE user_id = ?", (user_id,))

        conn.commit()
        conn.close()
        return deleted_counts

    @staticmethod
    def create_user(name: str, email: str, password_plain: str, avatar: str, profile: StudentProfile) -> Tuple[str, str]:
        user_id = profile.id or f"user-{uuid.uuid4().hex[:8]}"
        profile.id = user_id
        profile.name = name
        profile.email = email
        profile.avatar = avatar
        pass_hash = hash_password(password_plain)
        token = f"token-{uuid.uuid4().hex}"
        expires_at = (datetime.datetime.utcnow() + datetime.timedelta(days=30)).isoformat()

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
            "INSERT INTO sessions (token, user_id, device_info, ip_address, is_revoked, expires_at) VALUES (?, ?, 'Desktop Browser', '127.0.0.1', 0, ?)",
            (token, user_id, expires_at)
        )
        conn.commit()
        conn.close()
        return user_id, token

    @staticmethod
    def update_password_hash(user_id: str, new_hash: str):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
        conn.commit()
        conn.close()

    @staticmethod
    def create_session(user_id: str, device_info: str = "Desktop Browser", ip_address: str = "127.0.0.1", duration_days: int = 90) -> str:
        token = f"token-{uuid.uuid4().hex}"
        expires_at = (datetime.datetime.utcnow() + datetime.timedelta(days=duration_days)).isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sessions (token, user_id, device_info, ip_address, is_revoked, expires_at) VALUES (?, ?, ?, ?, 0, ?)",
            (token, user_id, device_info, ip_address, expires_at)
        )
        conn.commit()
        conn.close()
        return token

    @staticmethod
    def revoke_session(token: str):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE sessions SET is_revoked = 1 WHERE token = ?", (token,))
        conn.commit()
        conn.close()

    @staticmethod
    def revoke_all_user_sessions(user_id: str):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE sessions SET is_revoked = 1 WHERE user_id = ?", (user_id,))
        conn.commit()
        conn.close()

    @staticmethod
    def get_active_sessions(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT token, device_info, ip_address, created_at, expires_at, last_active_at FROM sessions WHERE user_id = ? AND is_revoked = 0 ORDER BY last_active_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

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
    def toggle_task(user_id: str, task_id: str) -> Tuple[bool, int, bool]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT completed, xp_awarded FROM daily_tasks WHERE user_id = ? AND id = ?", (user_id, task_id))
        row = cursor.fetchone()
        new_status = 1
        was_first = False
        if row and row["completed"] == 1:
            new_status = 0
            cursor.execute("UPDATE daily_tasks SET completed = 0, completed_at = NULL WHERE user_id = ? AND id = ?", (user_id, task_id))
        else:
            already_awarded = bool(row["xp_awarded"]) if (row and "xp_awarded" in row.keys() and row["xp_awarded"]) else False
            was_first = not already_awarded
            cursor.execute("UPDATE daily_tasks SET completed = 1, completed_at = CURRENT_TIMESTAMP, xp_awarded = 1 WHERE user_id = ? AND id = ?", (user_id, task_id))
        conn.commit()

        # Count completed tasks for user
        cursor.execute("SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND completed = 1", (user_id,))
        total_completed = cursor.fetchone()[0]
        conn.close()
        return (new_status == 1), total_completed, was_first

    toggle_task_completion = toggle_task

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

    # Study Abroad & Masters Copilot State Management
    @staticmethod
    def get_study_abroad_state(user_id: str) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_study_abroad_state WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            default_countries = ["USA", "DEU", "CAN"]
            default_program = "MS in Artificial Intelligence / Computer Science"
            default_intake = "Fall 2027"
            cursor.execute("""
                INSERT OR IGNORE INTO user_study_abroad_state 
                (user_id, target_countries_json, target_program, target_intake, checklists_json)
                VALUES (?, ?, ?, ?, ?)
            """, (user_id, json.dumps(default_countries), default_program, default_intake, "{}"))
            conn.commit()
            cursor.execute("SELECT * FROM user_study_abroad_state WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
        
        data = dict(row) if row else {
            "user_id": user_id,
            "target_countries_json": '["USA", "DEU", "CAN"]',
            "target_program": "MS in Artificial Intelligence / Computer Science",
            "target_intake": "Fall 2027",
            "checklists_json": "{}"
        }
        conn.close()

        try:
            target_countries = json.loads(data.get("target_countries_json") or '["USA", "DEU", "CAN"]')
        except Exception:
            target_countries = ["USA", "DEU", "CAN"]

        try:
            checklists = json.loads(data.get("checklists_json") or "{}")
        except Exception:
            checklists = {}

        return {
            "user_id": user_id,
            "target_countries": target_countries,
            "target_program": data.get("target_program") or "MS in Artificial Intelligence / Computer Science",
            "target_intake": data.get("target_intake") or "Fall 2027",
            "checklists": checklists
        }

    @staticmethod
    def save_study_abroad_selection(
        user_id: str,
        target_countries: List[str],
        target_program: Optional[str] = None,
        target_intake: Optional[str] = None
    ) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM user_study_abroad_state WHERE user_id = ?", (user_id,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO user_study_abroad_state (user_id, target_countries_json, target_program, target_intake, checklists_json)
                VALUES (?, ?, ?, ?, '{}')
            """, (user_id, json.dumps(target_countries), target_program or "MS in Artificial Intelligence / Computer Science", target_intake or "Fall 2027"))
        else:
            updates = ["target_countries_json = ?", "updated_at = CURRENT_TIMESTAMP"]
            params = [json.dumps(target_countries)]
            if target_program:
                updates.append("target_program = ?")
                params.append(target_program)
            if target_intake:
                updates.append("target_intake = ?")
                params.append(target_intake)
            params.append(user_id)
            cursor.execute(f"UPDATE user_study_abroad_state SET {', '.join(updates)} WHERE user_id = ?", tuple(params))
        conn.commit()
        conn.close()
        return DatabaseManager.get_study_abroad_state(user_id)

    @staticmethod
    def update_university_checklist_item(
        user_id: str,
        university_id: str,
        checklist_key: str,
        completed: bool
    ) -> Dict[str, Any]:
        state = DatabaseManager.get_study_abroad_state(user_id)
        checklists = state.get("checklists", {})
        if university_id not in checklists:
            checklists[university_id] = {}
        checklists[university_id][checklist_key] = completed

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE user_study_abroad_state 
            SET checklists_json = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?
        """, (json.dumps(checklists), user_id))
        conn.commit()
        conn.close()
        return checklists

    # ==================== EXAM PREPARATION ENGINE METHODS ====================
    @staticmethod
    def record_exam_attempt(
        user_id: str,
        set_or_mock_id: str,
        question_id: str,
        exam: str,
        section: str,
        topic: str,
        difficulty: str,
        user_choice: Optional[int],
        correct_choice: int,
        is_correct: bool,
        time_spent_seconds: int = 60
    ):
        conn = get_db_connection()
        cursor = conn.cursor()
        attempt_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO user_exam_attempts 
            (id, user_id, set_or_mock_id, question_id, exam, section, topic, difficulty, user_choice, correct_choice, is_correct, time_spent_seconds)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (attempt_id, user_id, set_or_mock_id, question_id, exam, section, topic, difficulty, user_choice, correct_choice, 1 if is_correct else 0, time_spent_seconds))
        conn.commit()
        conn.close()

    @staticmethod
    def add_to_mistake_bank(
        user_id: str,
        question_dict: Dict[str, Any],
        user_choice: Optional[int]
    ):
        conn = get_db_connection()
        cursor = conn.cursor()
        qid = question_dict.get("id", str(uuid.uuid4()))
        cursor.execute("SELECT id, mistake_count FROM user_mistake_bank WHERE user_id = ? AND question_id = ?", (user_id, qid))
        row = cursor.fetchone()
        if row:
            cursor.execute("""
                UPDATE user_mistake_bank 
                SET mistake_count = mistake_count + 1, user_choice = ?, resolved = 0, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND question_id = ?
            """, (user_choice, user_id, qid))
        else:
            mid = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO user_mistake_bank 
                (id, user_id, question_id, exam, section, topic, difficulty, question_json, user_choice, mistake_count, resolved)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
            """, (
                mid, user_id, qid,
                question_dict.get("exam", "GRE"),
                question_dict.get("section", "QUANTITATIVE"),
                question_dict.get("topic", "General"),
                question_dict.get("difficulty", "Medium"),
                json.dumps(question_dict),
                user_choice
            ))
        conn.commit()
        conn.close()

    @staticmethod
    def resolve_mistake(user_id: str, question_id: str):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE user_mistake_bank SET resolved = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND question_id = ?", (user_id, question_id))
        conn.commit()
        conn.close()

    @staticmethod
    def get_user_mistake_bank(user_id: str, exam: Optional[str] = None, topic: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT * FROM user_mistake_bank WHERE user_id = ? AND resolved = 0"
        params = [user_id]
        if exam:
            query += " AND exam = ?"
            params.append(exam)
        if topic and topic != "All":
            query += " AND topic = ?"
            params.append(topic)
        query += " ORDER BY updated_at DESC"
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        conn.close()
        results = []
        for r in rows:
            d = dict(r)
            try:
                d["question_obj"] = json.loads(d.get("question_json", "{}"))
            except Exception:
                d["question_obj"] = {}
            results.append(d)
        return results

    @staticmethod
    def record_mock_history(
        user_id: str,
        mock_title: str,
        exam: str,
        quant_score: int,
        verbal_score: int,
        total_score: int,
        accuracy_pct: float,
        raw_data: Optional[Dict[str, Any]] = None
    ) -> str:
        conn = get_db_connection()
        cursor = conn.cursor()
        hist_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO user_mock_history
            (id, user_id, mock_title, exam, quant_score, verbal_score, total_score, accuracy_pct, raw_data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (hist_id, user_id, mock_title, exam, quant_score, verbal_score, total_score, accuracy_pct, json.dumps(raw_data or {})))
        conn.commit()
        conn.close()
        return hist_id

    @staticmethod
    def get_user_mock_history(user_id: str, exam: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT * FROM user_mock_history WHERE user_id = ?"
        params = [user_id]
        if exam:
            query += " AND exam = ?"
            params.append(exam)
        query += " ORDER BY created_at ASC"
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_exam_analytics_stats(user_id: str, exam: str = "GRE") -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                COUNT(*) as total_attempts,
                SUM(is_correct) as total_correct
            FROM user_exam_attempts 
            WHERE user_id = ? AND exam = ?
        """, (user_id, exam))
        summary = dict(cursor.fetchone() or {})

        cursor.execute("""
            SELECT topic, COUNT(*) as total, SUM(is_correct) as correct
            FROM user_exam_attempts
            WHERE user_id = ? AND exam = ?
            GROUP BY topic
        """, (user_id, exam))
        topic_rows = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT COUNT(*) as unresolved FROM user_mistake_bank WHERE user_id = ? AND exam = ? AND resolved = 0", (user_id, exam))
        row = cursor.fetchone()
        mistake_cnt = row["unresolved"] if row else 0

        conn.close()
        return {
            "total_attempts": summary.get("total_attempts") or 0,
            "total_correct": summary.get("total_correct") or 0,
            "topic_stats": topic_rows,
            "unresolved_mistakes": mistake_cnt or 0
        }

    # ==================== LEARNING DECAY & SPACED REPETITION ====================

    @staticmethod
    def get_learning_decay_records(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_learning_decay WHERE user_id = ? ORDER BY retention_pct ASC", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def upsert_learning_decay_concept(
        user_id: str,
        concept_name: str,
        category: str,
        stability_days: float,
        repetition_count: int,
        retention_pct: float,
        decay_status: str,
        last_reviewed_at: Optional[str] = None
    ):
        conn = get_db_connection()
        cursor = conn.cursor()
        cid = str(uuid.uuid4())
        reviewed_at = last_reviewed_at or datetime.datetime.now(datetime.timezone.utc).isoformat()
        cursor.execute("""
            INSERT INTO user_learning_decay
            (id, user_id, concept_name, category, stability_days, repetition_count, last_reviewed_at, retention_pct, decay_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, concept_name) DO UPDATE SET
                category = excluded.category,
                stability_days = excluded.stability_days,
                repetition_count = excluded.repetition_count,
                last_reviewed_at = excluded.last_reviewed_at,
                retention_pct = excluded.retention_pct,
                decay_status = excluded.decay_status
        """, (cid, user_id, concept_name, category, stability_days, repetition_count, reviewed_at, retention_pct, decay_status))
        conn.commit()
        conn.close()

    @staticmethod
    def seed_default_learning_decay_if_empty(user_id: str, target_role: str = "AI Engineer"):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM user_learning_decay WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        cnt = row["cnt"] if row else 0
        conn.close()
        if cnt > 0:
            return

        now = datetime.datetime.now(datetime.timezone.utc)
        # Seed realistic concepts with staggered review dates to naturally demonstrate the Ebbinghaus curve:
        # e.g., Trees & DFS reviewed 4 days ago with stability 3 -> retention ~54% (Critical)
        seed_items = [
            ("Binary Trees & DFS", "DSA", 3.0, 2, (now - datetime.timedelta(days=4.2)).isoformat(), 54.0, "CRITICAL"),
            ("Dynamic Programming (Tabulation)", "DSA", 3.5, 2, (now - datetime.timedelta(days=3.8)).isoformat(), 58.0, "CRITICAL"),
            ("PyTorch Tensor Broadcasting", "AI_ML", 4.0, 3, (now - datetime.timedelta(days=3.0)).isoformat(), 68.0, "WARNING"),
            ("Docker Multi-Stage Builds", "SYSTEMS", 4.5, 3, (now - datetime.timedelta(days=3.1)).isoformat(), 72.0, "WARNING"),
            ("FastAPI Async Endpoints", "BACKEND", 6.0, 4, (now - datetime.timedelta(days=1.5)).isoformat(), 82.0, "OPTIMAL"),
            ("SQL Window Functions", "DATA", 7.0, 4, (now - datetime.timedelta(days=1.0)).isoformat(), 88.0, "OPTIMAL"),
            ("Python OOP & Metaclasses", "LANGUAGES", 9.0, 5, (now - datetime.timedelta(days=0.5)).isoformat(), 95.0, "MASTERED"),
            ("Gradient Descent & Optimizers", "AI_ML", 6.0, 3, (now - datetime.timedelta(days=2.0)).isoformat(), 76.0, "OPTIMAL"),
            ("GRE Quant: Permutations & Combinations", "APTITUDE", 3.2, 2, (now - datetime.timedelta(days=3.5)).isoformat(), 62.0, "WARNING"),
        ]

        for item in seed_items:
            DatabaseManager.upsert_learning_decay_concept(
                user_id=user_id,
                concept_name=item[0],
                category=item[1],
                stability_days=item[2],
                repetition_count=item[3],
                retention_pct=item[5],
                decay_status=item[6],
                last_reviewed_at=item[4]
            )

    # ==================== COMPLETED ACTIVITIES & ATS RESUME ====================

    @staticmethod
    def record_completed_activity(user_id: str, activity_type: str, activity_title: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        conn = get_db_connection()
        cursor = conn.cursor()
        aid = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO user_completed_activities (id, user_id, activity_type, activity_title, metadata_json)
            VALUES (?, ?, ?, ?, ?)
        """, (aid, user_id, activity_type, activity_title, json.dumps(metadata or {})))
        conn.commit()
        conn.close()
        return aid

    @staticmethod
    def get_completed_activities(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_completed_activities WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        results = []
        for r in rows:
            d = dict(r)
            try:
                d["metadata"] = json.loads(d.get("metadata_json", "{}"))
            except Exception:
                d["metadata"] = {}
            results.append(d)
        return results

    @staticmethod
    def get_user_ats_resume(user_id: str) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_ats_resume WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            # Default state
            default_data = {
                "user_id": user_id,
                "ats_score": 76,
                "resume_headline": "Aspiring AI & Machine Learning Systems Engineer",
                "keywords": ["Python", "Machine Learning", "PyTorch", "SQL", "FastAPI", "Docker"],
                "projects": [
                    {
                        "title": "Autonomous Predictive Model & API",
                        "tech_stack": "Python, FastAPI, Scikit-Learn",
                        "metrics": "Trained predictive pipeline achieving 91% F1-score across 50,000 test cases.",
                        "verified": True
                    }
                ],
                "suggestions": [
                    "Resume missing quantified latency/throughput metrics for production services.",
                    "Add Docker containerization & cloud deployment deliverables.",
                    "Include benchmark testing against baselines."
                ]
            }
            DatabaseManager.save_user_ats_resume(
                user_id=user_id,
                ats_score=default_data["ats_score"],
                resume_headline=default_data["resume_headline"],
                keywords=default_data["keywords"],
                projects=default_data["projects"],
                suggestions=default_data["suggestions"]
            )
            return default_data

        d = dict(row)
        d["keywords"] = json.loads(d.get("keywords_json", "[]"))
        d["projects"] = json.loads(d.get("projects_json", "[]"))
        d["suggestions"] = json.loads(d.get("suggestions_json", "[]"))
        return d

    @staticmethod
    def save_user_ats_resume(
        user_id: str,
        ats_score: int,
        resume_headline: str,
        keywords: List[str],
        projects: List[Dict[str, Any]],
        suggestions: List[str]
    ):
        conn = get_db_connection()
        cursor = conn.cursor()
        query = (
            "INSERT INTO user_ats_resume (user_id, ats_score, resume_headline, keywords_json, projects_json, suggestions_json, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) "
            "ON CONFLICT(user_id) DO UPDATE SET "
            "ats_score = excluded.ats_score, "
            "resume_headline = excluded.resume_headline, "
            "keywords_json = excluded.keywords_json, "
            "projects_json = excluded.projects_json, "
            "suggestions_json = excluded.suggestions_json, "
            "updated_at = CURRENT_TIMESTAMP"
        )
        cursor.execute(query, (user_id, ats_score, resume_headline, json.dumps(keywords), json.dumps(projects), json.dumps(suggestions)))
        conn.commit()
        conn.close()

    # ==================== RATE LIMITING ====================
    @staticmethod
    def check_rate_limit(key: str, max_attempts: int = 5, window_seconds: int = 300) -> Tuple[bool, int, int]:
        """
        Returns (allowed: bool, current_attempts: int, retry_after_seconds: int)
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT attempts, last_attempt_at FROM auth_rate_limits WHERE key = ?", (key,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return True, 0, 0
        
        attempts = row["attempts"]
        last_at = row["last_attempt_at"]
        try:
            last_dt = datetime.datetime.fromisoformat(str(last_at).replace("Z", "+00:00"))
        except Exception:
            try:
                last_dt = datetime.datetime.strptime(str(last_at), "%Y-%m-%d %H:%M:%S")
            except Exception:
                last_dt = datetime.datetime.utcnow()
        
        now = datetime.datetime.utcnow()
        elapsed = (now - last_dt.replace(tzinfo=None)).total_seconds()

        if elapsed > window_seconds:
            # Window expired, reset
            cursor.execute("DELETE FROM auth_rate_limits WHERE key = ?", (key,))
            conn.commit()
            conn.close()
            return True, 0, 0
        
        if attempts >= max_attempts:
            conn.close()
            retry_after = max(1, int(window_seconds - elapsed))
            return False, attempts, retry_after
        
        conn.close()
        return True, attempts, 0

    @staticmethod
    def record_auth_attempt(key: str, success: bool = False):
        conn = get_db_connection()
        cursor = conn.cursor()
        if success:
            cursor.execute("DELETE FROM auth_rate_limits WHERE key = ?", (key,))
        else:
            now_iso = datetime.datetime.utcnow().isoformat()
            cursor.execute("""
                INSERT INTO auth_rate_limits (key, attempts, first_attempt_at, last_attempt_at)
                VALUES (?, 1, ?, ?)
                ON CONFLICT(key) DO UPDATE SET
                attempts = auth_rate_limits.attempts + 1,
                last_attempt_at = ?
            """, (key, now_iso, now_iso, now_iso))
        conn.commit()
        conn.close()

    # ==================== CHAT HISTORY STORE ====================
    @staticmethod
    def save_chat_message(user_id: str, sender: str, message: str) -> str:
        conn = get_db_connection()
        cursor = conn.cursor()
        msg_id = f"msg-{uuid.uuid4().hex[:12]}"
        cursor.execute("""
            INSERT INTO chat_history (id, user_id, sender, message, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (msg_id, user_id, sender, message))
        conn.commit()
        conn.close()
        return msg_id

    @staticmethod
    def get_recent_chat_history(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT sender, message, created_at FROM chat_history
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        """, (user_id, limit))
        rows = cursor.fetchall()
        conn.close()
        # Chronological order
        return [{"sender": r["sender"], "message": r["message"], "created_at": str(r["created_at"])} for r in reversed(rows)]

    # ==================== USER COURSE PROGRESS & COMPLETIONS ====================
    @staticmethod
    def record_course_enrollment(user_id: str, course_id: str, course_title: str, provider: str, skill_targeted: str, credential_type: str = "COMPLETION_CERTIFICATE"):
        conn = get_db_connection()
        cursor = conn.cursor()
        cid = f"cp-{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO user_course_progress (id, user_id, course_id, course_title, provider, skill_targeted, credential_type, completed)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            ON CONFLICT(user_id, course_id) DO NOTHING
        """, (cid, user_id, course_id, course_title, provider, skill_targeted, credential_type))
        conn.commit()
        conn.close()

    @staticmethod
    def mark_course_completed(user_id: str, course_id: str, course_title: str = "", provider: str = "", skill_targeted: str = "", credential_type: str = "COMPLETION_CERTIFICATE") -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, completed FROM user_course_progress WHERE user_id = ? AND course_id = ?", (user_id, course_id))
        row = cursor.fetchone()
        was_already_completed = False
        if row:
            was_already_completed = (row["completed"] == 1)
            cursor.execute("""
                UPDATE user_course_progress 
                SET completed = 1, completed_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND course_id = ?
            """, (user_id, course_id))
        else:
            cid = f"cp-{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO user_course_progress (id, user_id, course_id, course_title, provider, skill_targeted, credential_type, completed, completed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
            """, (cid, user_id, course_id, course_title or course_id, provider or "Verified Provider", skill_targeted or "Technical", credential_type))
        conn.commit()
        conn.close()
        return not was_already_completed

    @staticmethod
    def get_user_course_progress(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_course_progress WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]






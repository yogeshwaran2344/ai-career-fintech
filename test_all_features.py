import urllib.request
import urllib.parse
import json
import sys
import time

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

BASE_URL = "http://127.0.0.1:8000"

results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def make_request(method, path, data=None, headers=None):
    if headers is None:
        headers = {}
    url = BASE_URL + path
    body = None
    if data is not None:
        body = json.dumps(data).encode('utf-8')
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            duration = (time.time() - start_time) * 1000
            res_body = resp.read().decode('utf-8')
            try:
                parsed = json.loads(res_body)
            except:
                parsed = res_body
            return resp.status, parsed, duration
    except urllib.error.HTTPError as e:
        duration = (time.time() - start_time) * 1000
        err_body = e.read().decode('utf-8')
        try:
            parsed = json.loads(err_body)
        except:
            parsed = err_body
        return e.code, parsed, duration
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        return 0, str(e), duration

def test(name, method, path, data=None, headers=None, expected_status=200, validator=None):
    status, payload, duration = make_request(method, path, data, headers)
    ok = (status == expected_status)
    val_msg = ""
    if ok and validator:
        try:
            val_ok = validator(payload)
            if not val_ok:
                ok = False
                val_msg = "Validator returned False"
        except Exception as ex:
            ok = False
            val_msg = f"Validator error: {ex}"
    
    if ok:
        results["passed"] += 1
        print(f"  [PASS] {name} ({status}, {duration:.1f}ms)")
        results["tests"].append({"name": name, "status": "PASS", "code": status, "ms": duration})
    else:
        results["failed"] += 1
        preview = str(payload)[:200].encode('ascii', errors='replace').decode('ascii')
        print(f"  [FAIL] {name} (Got {status}, expected {expected_status}) - {val_msg} - {preview}")
        results["tests"].append({"name": name, "status": "FAIL", "code": status, "expected": expected_status, "payload": payload})

print("="*65)
print("COMPREHENSIVE FULL PLATFORM FEATURE & API VERIFICATION SUITE")
print("="*65)

# 1. System Health & Core Baseline
print("\n--- 1. SYSTEM HEALTH & MANIFEST ---")
test("System Health Check", "GET", "/api/health", validator=lambda p: p.get("status") == "healthy")
test("Platform Machine Manifest", "GET", "/api/manifest", validator=lambda p: "version" in p and "platform" in p)

# 2. Authentication, Persistence & Session Security
print("\n--- 2. AUTHENTICATION & SECURE SESSIONS ---")
test("Get Demo Accounts", "GET", "/api/auth/demo-users", validator=lambda p: isinstance(p, list))

unique_num = int(time.time())
test_email = f"verified_student_{unique_num}@elevare.edu"
test_password = "SecurePassword123!"

auth_token = None
status, reg_res, duration = make_request("POST", "/api/auth/register", data={
    "name": "Verified Student",
    "email": test_email,
    "password": test_password,
    "target_role": "Full Stack Engineer"
})
if status == 200 and "token" in reg_res:
    auth_token = reg_res["token"]
    print(f"  [PASS] Register New Account ({status}, {duration:.1f}ms)")
    results["passed"] += 1
    results["tests"].append({"name": "Register New Account", "status": "PASS", "code": status, "ms": duration})
else:
    print(f"  [FAIL] Register New Account ({status}) - {reg_res}")
    results["failed"] += 1
    results["tests"].append({"name": "Register New Account", "status": "FAIL", "code": status, "payload": reg_res})

# Failed login on incorrect password (must return 401)
test("Login With Wrong Password (Security Test)", "POST", "/api/auth/login", data={
    "email": test_email,
    "password": "WrongPassword999!"
}, expected_status=401)

# Successful Login
status, login_res, duration = make_request("POST", "/api/auth/login", data={
    "email": test_email,
    "password": test_password
})
if status == 200 and "token" in login_res:
    auth_token = login_res["token"]
    print(f"  [PASS] Verified Login Success (Persistent token: {auth_token[:15]}..., {duration:.1f}ms)")
    results["passed"] += 1
    results["tests"].append({"name": "Verified Login Success", "status": "PASS", "code": status, "ms": duration})
else:
    print(f"  [FAIL] Login failed ({status}): {login_res}")
    results["failed"] += 1
    results["tests"].append({"name": "Verified Login Success", "status": "FAIL", "code": status, "payload": login_res})

auth_headers = {"Authorization": f"Bearer {auth_token}"} if auth_token else {}

test("Session Persistence Verification (/api/auth/me)", "GET", "/api/auth/me", headers=auth_headers, validator=lambda p: p.get("email") == test_email)
test("Active Session Tracking", "GET", "/api/auth/sessions", headers=auth_headers, validator=lambda p: len(p.get("active_sessions", p.get("sessions", []))) > 0)

# 3. Dashboard & Career Intelligence Engines
print("\n--- 3. DASHBOARD & CAREER INTELLIGENCE ---")
test("Get Student Profile", "GET", "/api/profile", headers=auth_headers, validator=lambda p: "email" in p)
test("Career Readiness Score", "GET", "/api/career/readiness", headers=auth_headers, validator=lambda p: "readiness_score" in p or "score" in p)
test("Personalized Recommendations", "GET", "/api/career/recommendations", headers=auth_headers, validator=lambda p: (isinstance(p, list) and len(p) > 0) or len(p.get("recommendations", [])) > 0)
test("Identified Skill Gaps", "GET", "/api/career/skill-gaps", headers=auth_headers, validator=lambda p: isinstance(p, dict) or isinstance(p, list))
test("Dynamic Career Roadmap", "GET", "/api/career/roadmap", headers=auth_headers, validator=lambda p: isinstance(p, dict))
test("Curated Industry Projects", "GET", "/api/career/projects", headers=auth_headers, validator=lambda p: (isinstance(p, list) and len(p) > 0) or len(p.get("projects", [])) > 0)
test("Daily Action Plan Generation", "GET", "/api/career/daily-plan", headers=auth_headers, validator=lambda p: "tasks" in p)
test("Explainable Readiness Breakdown", "GET", "/api/career/explainable-readiness", headers=auth_headers, validator=lambda p: "total_readiness_pct" in p or "readiness" in p or "factors" in p)
test("Placement Probability Telemetry", "GET", "/api/career/placement-breakdown", headers=auth_headers, validator=lambda p: "overall_placement_score" in p or "probability" in p or "overall_probability" in p)
test("Real-time Signals & Notifications", "GET", "/api/notifications", headers=auth_headers, validator=lambda p: isinstance(p.get("notifications", p), list))

# 4. Learning, Projects & Degree Telemetry
print("\n--- 4. LEARNING, PROJECTS & DEGREES ---")
test("Curated Courses Library", "GET", "/api/career/curated-courses", headers=auth_headers, validator=lambda p: isinstance(p, list) and len(p) > 0)
test("Degree Catalogue", "GET", "/api/career/degree-catalogue", headers=auth_headers, validator=lambda p: isinstance(p, dict) and len(p) > 0)
test("Record Project Evidence Submission", "POST", "/api/career/projects/record-evidence", data={
    "project_title": "Full Stack Financial Simulator",
    "github_url": "https://github.com/student/fin-sim",
    "live_demo_url": "https://fin-sim-live.vercel.app",
    "tech_stack": ["React", "FastAPI", "SQLite", "TailwindCSS"],
    "metrics_achieved": "99.9% uptime, <50ms response latency",
    "verification_checklist": {"tests_passing": True, "ci_green": True}
}, headers=auth_headers, validator=lambda p: "status" in p or "success" in p or "message" in p or isinstance(p, dict))

# 5. Interview Arena & Mock Assessment
print("\n--- 5. INTERVIEW ARENA & SKILL ASSESSMENT ---")
test("Mock Technical Questions", "GET", "/api/career/mock-interview/questions?role=Full+Stack+Engineer", headers=auth_headers, validator=lambda p: isinstance(p, list) and len(p) > 0)
test("Mock Interview Evaluation & Scoring", "POST", "/api/career/mock-interview/evaluate", data={
    "role": "Full Stack Engineer",
    "answers": [
        {
            "question_id": "gen-q1",
            "question": "What core technical architectures and patterns do you consider essential?",
            "user_answer": "I prioritize clean decoupled architecture with layered services, dependency injection, and automated CI/CD unit testing."
        }
    ]
}, headers=auth_headers, validator=lambda p: "scores" in p or "overall" in str(p))
test("Skill Assessment Questions", "GET", "/api/career/skill-assessment/questions?skill=React", headers=auth_headers, validator=lambda p: isinstance(p, list) and len(p) > 0)

# 6. What-If Simulator & Path Comparisons
print("\n--- 6. WHAT-IF SIMULATOR & PATH COMPARISON ---")
test("What-If Simulation", "POST", "/api/career/simulate", data={
    "hours_per_week": 15,
    "focus_area": "System Design",
    "target_timeline_months": 6
}, headers=auth_headers, validator=lambda p: "scenario_label" in p or "projected_1m_pct" in p or "projected_readiness" in p)
test("Compare Career Paths (Full Stack vs DevOps)", "POST", "/api/career/compare-paths", data={
    "roles": ["Full Stack Engineer", "DevOps Engineer"]
}, headers=auth_headers, validator=lambda p: isinstance(p, dict))
test("Career ROI vs Capital Investment Growth", "POST", "/api/career/career-vs-investment", data={
    "upskill_investment": 15000,
    "expected_salary_hike_pct": 25,
    "years": 3
}, headers=auth_headers, validator=lambda p: isinstance(p, dict))

# 7. Skill Graph & Opportunity Radar
print("\n--- 7. SKILL GRAPH & JOB MARKET RADAR ---")
test("Skill Topology Graph (Nodes & Edges)", "GET", "/api/career/skill-graph", headers=auth_headers, validator=lambda p: "nodes" in p and "edges" in p)
test("Skill Market Demand Telemetry", "GET", "/api/career/skill-market-demand", headers=auth_headers, validator=lambda p: isinstance(p, dict) or isinstance(p, list))
test("Job Market Opportunity Radar", "GET", "/api/career/job-market", headers=auth_headers, validator=lambda p: "role" in p or "market_demand" in p or isinstance(p, dict))

# 8. Resume & ATS Compatibility Analyzer
print("\n--- 8. RESUME & ATS ANALYZER ---")
test("Get Stored Resume Snapshot", "GET", "/api/resume/data", headers=auth_headers)
test("Analyze Resume Content for ATS Score", "POST", "/api/resume/analyze", data={
    "resume_text": "Alex Student. Full Stack Engineer skilled in React, Python, FastAPI, Docker, PostgreSQL, REST APIs. Developed scalable web apps with 99.9% uptime."
}, headers=auth_headers, validator=lambda p: "overall_resume_score" in p or "ats_compatibility_pct" in p or "score" in p)

# 9. Application Tracker (Full CRUD Cycle)
print("\n--- 9. APPLICATION TRACKER (FULL CRUD) ---")
created_app_id = None
status, app_res, _ = make_request("POST", "/api/jobs/applications", data={
    "company": "Razorpay India",
    "role": "Software Development Engineer - I",
    "status": "Applied",
    "notes": "Direct career portal referral submission"
}, headers=auth_headers)
if status == 200 and ("id" in app_res or "application" in app_res or "item" in app_res):
    created_app_id = app_res.get("id") or app_res.get("application", {}).get("id") or app_res.get("item", {}).get("id")
    print(f"  [PASS] Create Application Record (ID: {created_app_id})")
    results["passed"] += 1
else:
    print(f"  [FAIL] Create Application Failed: {str(app_res)[:150]}")
    results["failed"] += 1

test("List Application Pipeline", "GET", "/api/jobs/applications", headers=auth_headers, validator=lambda p: isinstance(p, list) and len(p) > 0)
test("Application Funnel Analytics", "GET", "/api/jobs/application-analytics", headers=auth_headers, validator=lambda p: isinstance(p, dict))

if created_app_id:
    test("Update Application Status to Interview", "PUT", f"/api/jobs/applications/{created_app_id}", data={
        "status": "Technical Interview",
        "notes": "Passed initial screening round"
    }, headers=auth_headers)
    test("Delete Application Record", "DELETE", f"/api/jobs/applications/{created_app_id}", headers=auth_headers)

# 10. Wealth & Fintech (Groww parity, search, live trading, zero min amount)
print("\n--- 10. WEALTH, INVESTMENTS & FINTECH ---")
test("Live Market Overview (Indices & Movers)", "GET", "/api/market/overview", headers=auth_headers, validator=lambda p: len(p.get("indices", [])) > 0 and len(p.get("top_gainers", [])) > 0)
test("Market Search by Query (?query=TCS)", "GET", "/api/market/search?query=TCS", headers=auth_headers, validator=lambda p: len(p) > 0)
test("Market Search by q (?q=RELIANCE)", "GET", "/api/market/search?q=RELIANCE", headers=auth_headers, validator=lambda p: len(p) > 0)
test("Live Market Quote (RELIANCE)", "GET", "/api/market/quote/RELIANCE", headers=auth_headers, validator=lambda p: p.get("symbol") == "RELIANCE" and p.get("last_price") > 0)
test("Historical Candlestick Chart (TCS 5m)", "GET", "/api/market/chart/TCS?interval=5m", headers=auth_headers, validator=lambda p: len(p.get("candles", [])) > 0 and "time" in p["candles"][0])
test("Wealth Hub & Net Worth", "GET", "/api/wealth/hub", headers=auth_headers, validator=lambda p: isinstance(p, dict))
test("Financial Safety Checklist (5 Gates)", "GET", "/api/wealth/financial-safety", headers=auth_headers, validator=lambda p: isinstance(p, dict))
test("Financial Health Diagnostic Score", "GET", "/api/wealth/financial-health", headers=auth_headers, validator=lambda p: isinstance(p, dict))
test("Curated Multi-Company Baskets", "GET", "/api/wealth/multi-company-baskets", headers=auth_headers, validator=lambda p: isinstance(p, list) or len(p.get("baskets", [])) > 0)

# Zero Minimum Trade Execution
test("Zero Min Trade - LumpSum Investment (₹200 on INFY)", "POST", "/api/wealth/trade", data={
    "asset_id": "infy",
    "action": "BUY_LUMPSUM",
    "amount_inr": 200.0
}, headers=auth_headers, validator=lambda p: p.get("success") == True or "transaction_id" in p)

test("Zero Min Trade - Pluggable Regulated Broker Order", "POST", "/api/broker/order", data={
    "symbol": "INFY",
    "exchange": "NSE",
    "transaction_type": "BUY",
    "order_type": "MARKET",
    "product": "CNC",
    "quantity": 1,
    "price": 0.0,
    "execution_mode": "SIMULATED"
}, headers=auth_headers, validator=lambda p: p.get("status") in ["FILLED", "SUBMITTED", "PENDING"] or "order_id" in p)

test("Broker Order History", "GET", "/api/broker/orders", headers=auth_headers, validator=lambda p: isinstance(p, list))
test("Broker Orders Summary", "GET", "/api/broker/orders/summary", headers=auth_headers, validator=lambda p: isinstance(p, dict))
test("Wealth Transactions Audit Trail", "GET", "/api/wealth/transactions", headers=auth_headers, validator=lambda p: isinstance(p, list))
test("SIP Compound Interest Calculator", "POST", "/api/wealth/sip-simulator", data={
    "monthly_amount": 500,
    "expected_return_pct": 14,
    "years": 5
}, headers=auth_headers, validator=lambda p: "total_invested_inr" in p and "estimated_future_value_inr" in p)
test("Financial Scam & Ponzi Detector", "POST", "/api/wealth/scam-check", data={
    "pitch_text": "Invest Rs 5,000 today and guaranteed double your money in 48 hours without any market risk!",
    "platform_name": "WhatsApp Group"
}, headers=auth_headers, validator=lambda p: p.get("risk_level") == "HIGH_RISK" or "red_flags_detected" in p)

# 11. Global & Higher Ed (Study Abroad & PYP Exam Bank)
print("\n--- 11. STUDY ABROAD & PREVIOUS YEAR EXAMS ---")
test("Study Abroad Overview", "GET", "/api/study-abroad/overview", headers=auth_headers, validator=lambda p: isinstance(p, dict))
test("Global Universities Directory", "GET", "/api/study-abroad/universities?country=US", headers=auth_headers, validator=lambda p: isinstance(p, list) and len(p) > 0)
test("Study Abroad Cost & Funding Model", "POST", "/api/study-abroad/cost-funding-plan", data={
    "country": "USA",
    "degree": "MS in CS",
    "duration_years": 2
}, headers=auth_headers, validator=lambda p: "total_cost_inr" in p or "tuition_inr" in p or isinstance(p, dict))
test("Visa Guidance (US F-1 Visa)", "GET", "/api/study-abroad/visa-guidance/US", headers=auth_headers, validator=lambda p: isinstance(p, dict))

# PYP 10-Year Question Papers (2016-2025 across GRE, GMAT, IELTS, TOEFL)
test("All 40 Previous Year Question Papers", "GET", "/api/study-abroad/exam/previous-papers", headers=auth_headers, validator=lambda p: len(p.get("papers", [])) == 40)
test("Multi-Section Paper Deep Dive (pyp_gre_2025)", "GET", "/api/study-abroad/exam/previous-papers/pyp_gre_2025", headers=auth_headers, validator=lambda p: len(p.get("questions", [])) > 0 and len(p.get("sections_summary", [])) >= 2)
test("Question Bank Catalog Statistics", "GET", "/api/study-abroad/exam/question-bank-stats", headers=auth_headers, validator=lambda p: "total_questions" in p or isinstance(p, dict))
test("Dynamic Exam Practice Drill Generation", "POST", "/api/study-abroad/exam/generate-set", data={
    "exam": "GRE",
    "section": "QUANTITATIVE",
    "topic": "All Topics",
    "difficulty": "Medium",
    "count": 5
}, headers=auth_headers, validator=lambda p: "questions" in p or "set_id" in p)
test("Student Mistake Bank Tracking", "GET", "/api/study-abroad/exam/mistake-bank?exam=GRE", headers=auth_headers, validator=lambda p: "mistakes" in p or isinstance(p, list) or isinstance(p, dict))
test("Exam Readiness Diagnostic", "GET", "/api/study-abroad/exam/readiness-score?exam=GRE", headers=auth_headers, validator=lambda p: isinstance(p, dict))

# 12. AI Video Doubt Solver & Decision Copilot
print("\n--- 12. AI VIDEO DOUBT SOLVER & DECISION COPILOT ---")
test("AI Video Doubt Solver (With Topic & Timestamp)", "POST", "/api/ai/video-doubt", data={
    "topic_name": "Dynamic Programming - Memoization",
    "timestamp_or_part": "14:20 where top-down recursion is converted to a table",
    "doubt_question": "Why do we initialize the lookup array with -1 instead of 0?",
    "video_url": "https://www.youtube.com/watch?v=sample"
}, headers=auth_headers, validator=lambda p: len(p.get("explanation", "")) > 15)

test("Conversational AI Advisor", "POST", "/api/ai/chat", data={
    "message": "Give me a 3-step action plan to prepare for backend software engineer roles."
}, headers=auth_headers, validator=lambda p: len(p.get("response", "")) > 10)

test("Decision Copilot (Offer vs Higher Stipend)", "POST", "/api/decision/evaluate", data={
    "scenario_type": "CAREER_VS_INVESTMENT",
    "target_item_name": "Startup Equity vs High Stipend",
    "cost_inr": 20000.0,
    "timeline_months": 6,
    "custom_question": "Should I accept an early stage startup offer with equity or a stable stipend at a mid-tier firm?"
}, headers=auth_headers, validator=lambda p: isinstance(p, dict))

# 13. Learning Decay & Spaced Repetition
print("\n--- 13. SPACED REPETITION & RETENTION ---")
test("Learning Decay Retention Status", "GET", "/api/learning-decay/status", headers=auth_headers, validator=lambda p: isinstance(p, dict) or isinstance(p, list))
test("Spaced Repetition Concept Quiz", "GET", "/api/learning-decay/quiz/SQL%20Window%20Functions", headers=auth_headers, validator=lambda p: isinstance(p, dict))

print("\n" + "="*65)
print(f"VERIFICATION COMPLETED: {results['passed']} PASSED, {results['failed']} FAILED")
print("="*65)

if results['failed'] > 0:
    sys.exit(1)

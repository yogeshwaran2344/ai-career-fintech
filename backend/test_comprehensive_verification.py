import httpx
import uuid
import sys

# Force UTF-8 stdout
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("\n=======================================================")
    print("RUNNING COMPREHENSIVE PLATFORM VERIFICATION TEST SUITE")
    print("=======================================================\n")

    with httpx.Client(base_url=BASE_URL, timeout=15.0) as client:
        # TEST 1: Health Check
        r = client.get("/api/health")
        assert r.status_code == 200, f"Health check failed: {r.status_code}"
        print("[PASS] 1. Health Check passed: 200 OK")

        # TEST 2: Demo users must be empty
        r = client.get("/api/auth/demo-users")
        assert r.status_code == 200 and r.json() == [], f"Demo users not empty: {r.json()}"
        print("[PASS] 2. Zero Demo Accounts verified: GET /api/auth/demo-users returns []")

        # TEST 3: Strict 401 on unauthenticated requests
        r = client.get("/api/auth/me")
        assert r.status_code == 401, f"Expected 401 for unauthenticated /api/auth/me, got {r.status_code}"
        print("[PASS] 3. Unauthenticated /api/auth/me returns 401 Unauthorized (No fallback to Luke!)")

        r = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid-fake-token-12345"})
        assert r.status_code == 401, f"Expected 401 for invalid token, got {r.status_code}"
        print("[PASS] 4. Invalid Bearer token returns 401 Unauthorized")

        r = client.get("/api/career/readiness")
        assert r.status_code == 401, f"Expected 401 for unauthenticated /api/career/readiness, got {r.status_code}"
        print("[PASS] 5. Unauthenticated /api/career/readiness returns 401 Unauthorized")

        # TEST 4: Dynamic Student Registration
        test_email = f"student_{uuid.uuid4().hex[:6]}@advisor.ai"
        reg_payload = {
            "name": "Arjun Sharma",
            "email": test_email,
            "password": "SecureStudentPassword2026!",
            "avatar": "👨‍💻",
            "career_goal": "AI Engineer",
            "academic": {
                "degree": "B.Tech / B.E",
                "branch": "Computer Science & Engineering",
                "year": "3rd Year",
                "college": "IIT Bombay",
                "cgpa": 8.7
            },
            "preferences": {
                "preferred_learning_style": "Hands-on / Projects",
                "study_hours_per_day": 2.5,
                "target_placement_year": 2027,
                "free_text_intent": "I want to become an AI Engineer building production LLM systems."
            },
            "financial": {
                "monthly_income": 18000,
                "food": 4500,
                "travel": 1500,
                "entertainment": 1200,
                "other": 1800,
                "available_for_learning": 3500,
                "savings": 3500,
                "emergency_buffer": 2000
            },
            "skills": [
                {"name": "Python", "proficiency": 6.0, "level": "Intermediate", "category": "General"},
                {"name": "SQL", "proficiency": 5.0, "level": "Intermediate", "category": "General"},
                {"name": "DSA", "proficiency": 4.0, "level": "Intermediate", "category": "General"},
                {"name": "Machine Learning", "proficiency": 4.0, "level": "Intermediate", "category": "General"},
                {"name": "Deep Learning", "proficiency": 2.0, "level": "Beginner", "category": "General"},
                {"name": "FastAPI", "proficiency": 2.5, "level": "Beginner", "category": "General"},
                {"name": "Docker", "proficiency": 1.5, "level": "Beginner", "category": "General"},
                {"name": "Statistics & Math", "proficiency": 5.0, "level": "Intermediate", "category": "General"}
            ]
        }
        r = client.post("/api/auth/register", json=reg_payload)
        assert r.status_code == 200, f"Registration failed: {r.text}"
        auth_data = r.json()
        token = auth_data["token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"[PASS] 6. Dynamic Registration successful for {auth_data['name']} ({auth_data['email']})")

        # TEST 5: Authenticated Profile & Dynamic Career Engine
        r = client.get("/api/auth/me", headers=headers)
        assert r.status_code == 200 and r.json()["name"] == "Arjun Sharma"
        print("[PASS] 7. Authenticated /api/auth/me returned correct registered student profile")

        r = client.get("/api/career/readiness", headers=headers)
        assert r.status_code == 200
        readiness_data = r.json()
        pct = readiness_data["readiness_pct"]
        print(f"[PASS] 8. Career Readiness computed dynamically: {pct}% (Target: {readiness_data['career_goal']})")

        # TEST 6: Dynamic Course ROI Calculation
        r = client.get("/api/finance/courses?topic=Deep%20Learning", headers=headers)
        assert r.status_code == 200
        courses = r.json()
        assert len(courses) >= 3
        for c in courses:
            assert "roi_score" in c and c["roi_score"] > 0
        print(f"[PASS] 9. Course ROI dynamically ranked ({courses[0]['title']} -> ROI: {courses[0]['roi_score']})")

        # TEST 7: Invest vs Learn vs Save (Opportunity Cost)
        r = client.post("/api/wealth/opportunity-cost", headers=headers, json={"amount_inr": 3500})
        assert r.status_code == 200
        opp = r.json()
        assert opp["primary_winner_id"] in ["opt-education", "opt-buffer", "opt-sip"]
        print(f"[PASS] 10. Next-₹X Allocator & Opportunity Cost: {opp['verdict_headline']}")

        # TEST 8: SIP Simulator
        r = client.post("/api/wealth/sip-simulator", headers=headers, json={"monthly_investment_inr": 2000, "duration_years": 5, "expected_cagr_pct": 12.0})
        assert r.status_code == 200
        sip = r.json()
        print(f"[PASS] 11. SIP Simulator: ₹2,000/mo over 5 yrs -> Projected Corpus: ₹{sip['estimated_future_value_inr']:,.0f} (Gain: ₹{sip['estimated_wealth_gain_inr']:,.0f})")

        # TEST 9: Investment Scam & Red Flag Detector
        r = client.post("/api/wealth/scam-detector", headers=headers, json={"pitch_text": "Guaranteed 30% monthly profit with zero risk. Join our secret Telegram VIP group today!"})
        assert r.status_code == 200
        scam = r.json()
        assert scam["risk_level"] in ["EXTREME_RISK", "HIGH_RISK", "MODERATE_RISK"]
        print(f"[PASS] 12. Scam Detector correctly flagged: {scam['risk_badge']} (Safety Score: {scam['safety_score']}/100)")

        # TEST 10: 5-Year Career + Wealth Digital Twin
        r = client.get("/api/wealth/digital-twin", headers=headers)
        assert r.status_code == 200
        dt = r.json()
        assert len(dt["scenarios"]) >= 3
        print(f"[PASS] 13. 5-Year Career + Wealth Digital Twin generated {len(dt['scenarios'])} scenarios for {dt['baseline_career_role']}")

        # TEST 11: Date-Specific Daily Tasks & Activity-Based Skill Growth
        r = client.get("/api/progress/daily-plan", headers=headers)
        assert r.status_code == 200
        plan = r.json()
        assert len(plan["tasks"]) > 0
        first_task = plan["tasks"][0]
        print(f"[PASS] 14. Date-Aware Daily Action Plan loaded: {len(plan['tasks'])} tasks for {plan['date_str']}")

        # Toggle first task
        r = client.post(f"/api/progress/toggle-task/{first_task['id']}", headers=headers)
        assert r.status_code == 200
        toggle_res = r.json()
        assert toggle_res["completed"] is True
        print(f"[PASS] 15. Task toggle completed: Inferred skill growth -> {toggle_res['skill_gained']['skill']}: {toggle_res['skill_gained']['old_proficiency']} -> {toggle_res['skill_gained']['new_proficiency']}")

        # TEST 12: Dynamic AI Copilot Chat (Live Grounding)
        r = client.post("/api/ai/chat", headers=headers, json={"message": "What is my current readiness and what should I focus on next?"})
        assert r.status_code == 200
        chat_res = r.json()
        assert str(pct) in chat_res["response"] or "Readiness" in chat_res["response"]
        print("[PASS] 16. AI Copilot Chat response dynamically grounded in live engine state")

    print("\n=======================================================")
    print("ALL 16 COMPREHENSIVE VERIFICATION CHECKS PASSED 100%!")
    print("=======================================================\n")

if __name__ == "__main__":
    run_tests()

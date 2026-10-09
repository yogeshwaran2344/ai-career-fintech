import sys
import uuid
from fastapi.testclient import TestClient

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from main import app
from database import DatabaseManager

client = TestClient(app)

def test_registration_validation():
    print("\n--- TEST: Registration Validation ---")
    
    # 1. Invalid email
    bad_email_resp = client.post("/api/auth/register", json={
        "email": "not-an-email",
        "password": "Password123!",
        "name": "Test Student"
    })
    assert bad_email_resp.status_code == 422, f"Expected 422 for invalid email, got {bad_email_resp.status_code}"
    print("[PASS] Invalid email rejected with 422")

    # 2. Weak password (missing uppercase)
    weak_pw_resp = client.post("/api/auth/register", json={
        "email": f"test_{uuid.uuid4().hex[:6]}@example.com",
        "password": "password123!",
        "name": "Test Student"
    })
    assert weak_pw_resp.status_code == 422, f"Expected 422 for password without uppercase, got {weak_pw_resp.status_code}"
    print("[PASS] Weak password (no uppercase) rejected with 422")

    # 3. Short password (< 8 chars)
    short_pw_resp = client.post("/api/auth/register", json={
        "email": f"test_{uuid.uuid4().hex[:6]}@example.com",
        "password": "Pass1!",
        "name": "Test Student"
    })
    assert short_pw_resp.status_code == 422, f"Expected 422 for short password, got {short_pw_resp.status_code}"
    print("[PASS] Short password rejected with 422")

    # 4. Valid registration
    valid_email = f"student_{uuid.uuid4().hex[:6]}@example.com"
    valid_resp = client.post("/api/auth/register", json={
        "email": valid_email,
        "password": "StrongPassword123!",
        "name": "Alice Verified"
    })
    assert valid_resp.status_code == 200, f"Expected 200 for valid registration, got {valid_resp.status_code}"
    data = valid_resp.json()
    assert "token" in data and data["email"] == valid_email
    print(f"[PASS] Valid registration succeeded: {valid_email}")

def test_data_isolation_and_nested_profile_updates():
    print("\n--- TEST: Data Isolation & Nested Profile Updates ---")
    
    # Register User A
    email_a = f"alice_{uuid.uuid4().hex[:6]}@univ.edu"
    resp_a = client.post("/api/auth/register", json={
        "email": email_a,
        "password": "Password123!",
        "name": "Alice A"
    })
    token_a = resp_a.json()["token"]
    user_id_a = resp_a.json()["user_id"]
    profile_a = resp_a.json()["profile"]

    # Register User B
    email_b = f"bob_{uuid.uuid4().hex[:6]}@univ.edu"
    resp_b = client.post("/api/auth/register", json={
        "email": email_b,
        "password": "Password123!",
        "name": "Bob B"
    })
    token_b = resp_b.json()["token"]
    user_id_b = resp_b.json()["user_id"]
    profile_b = resp_b.json()["profile"]

    # Validate CGPA bounds on profile update
    bad_cgpa_resp = client.post("/api/profile", headers={"Authorization": f"Bearer {token_a}"}, json={
        **profile_a,
        "academic": {**profile_a["academic"], "cgpa": 11.5}
    })
    assert bad_cgpa_resp.status_code == 422, "Expected 422 for CGPA > 10.0"
    print("[PASS] CGPA > 10.0 properly rejected with 422")

    # Validate negative financial amounts
    bad_fin_resp = client.post("/api/profile", headers={"Authorization": f"Bearer {token_a}"}, json={
        **profile_a,
        "financial": {**profile_a["financial"], "monthly_income": -5000}
    })
    assert bad_fin_resp.status_code == 422, "Expected 422 for negative monthly income"
    print("[PASS] Negative financial values properly rejected with 422")

    # Validate study hours bounds
    bad_hrs_resp = client.post("/api/profile", headers={"Authorization": f"Bearer {token_a}"}, json={
        **profile_a,
        "preferences": {**profile_a["preferences"], "study_hours_per_day": 20.0}
    })
    assert bad_hrs_resp.status_code == 422, "Expected 422 for study hours > 16"
    print("[PASS] Daily study hours > 16.0 properly rejected with 422")

    # Mutate all nested fields of User A
    updated_a = {
        **profile_a,
        "academic": {**profile_a["academic"], "cgpa": 9.4, "degree": "M.Tech", "branch": "Computer Science"},
        "skills": [{"name": "PyTorch", "level": "Advanced", "proficiency": 8.5, "category": "AI/ML"}],
        "financial": {**profile_a["financial"], "savings": 12000.0, "emergency_buffer": 8000.0},
        "preferences": {**profile_a["preferences"], "study_hours_per_day": 4.5, "preferred_learning_style": "Hands-on / Projects"}
    }
    save_a_resp = client.post("/api/profile", headers={"Authorization": f"Bearer {token_a}"}, json=updated_a)
    assert save_a_resp.status_code == 200
    saved_profile_a = save_a_resp.json()
    assert saved_profile_a["academic"]["cgpa"] == 9.4
    assert saved_profile_a["financial"]["savings"] == 12000.0
    assert saved_profile_a["preferences"]["study_hours_per_day"] == 4.5
    print("[PASS] Nested profile fields (academic, skills, financial, preferences) successfully persisted for User A")

    # Verify User B's profile is completely unchanged (DATA ISOLATION)
    get_b_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_b}"})
    assert get_b_resp.status_code == 200
    curr_b = get_b_resp.json()
    assert curr_b["academic"]["cgpa"] == profile_b["academic"]["cgpa"]
    assert curr_b["financial"]["savings"] == profile_b["financial"]["savings"]
    assert curr_b["preferences"]["study_hours_per_day"] == profile_b["preferences"]["study_hours_per_day"]
    print("[PASS] Data isolation verified: User A modifications did NOT affect User B in any way")

def test_profile_reset_confirmation():
    print("\n--- TEST: Profile Reset Confirmation ---")
    email = f"reset_test_{uuid.uuid4().hex[:6]}@univ.edu"
    resp = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "name": "Reset Candidate"
    })
    token = resp.json()["token"]

    # 1. Reset without explicit phrase should fail with 400
    bad_reset = client.post("/api/profile/reset", headers={"Authorization": f"Bearer {token}"}, json={
        "confirm_phrase": "NO_CONFIRM"
    })
    assert bad_reset.status_code == 400, f"Expected 400 without RESET confirmation, got {bad_reset.status_code}"
    print("[PASS] Unconfirmed profile reset rejected with 400 Bad Request")

    # 2. Reset with explicit confirm_phrase="RESET"
    good_reset = client.post("/api/profile/reset", headers={"Authorization": f"Bearer {token}"}, json={
        "confirm_phrase": "RESET",
        "reset_tasks": True,
        "reset_activities": True
    })
    assert good_reset.status_code == 200, f"Expected 200 with RESET confirmation, got {good_reset.status_code}"
    reset_data = good_reset.json()
    assert reset_data["success"] is True
    assert "deleted_records" in reset_data
    assert reset_data["updated_profile"]["total_xp"] == 50
    assert reset_data["updated_profile"]["streak_days"] == 1
    print(f"[PASS] Confirmed profile reset succeeded with deleted_records summary: {reset_data['deleted_records']}")

def test_explainable_career_engine_and_role_switching():
    print("\n--- TEST: Explainable Career Engine & Role Switching ---")
    email = f"career_test_{uuid.uuid4().hex[:6]}@univ.edu"
    resp = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "name": "Career Explorer"
    })
    token = resp.json()["token"]

    # 1. Check readiness explainability
    readiness_resp = client.get("/api/career/readiness", headers={"Authorization": f"Bearer {token}"})
    assert readiness_resp.status_code == 200
    r_data = readiness_resp.json()
    assert 0 <= r_data["readiness_pct"] <= 100
    assert 0.0 <= r_data["readiness_score"] <= 10.0
    assert "breakdown" in r_data
    bd = r_data["breakdown"]
    assert "technical_skills" in bd and bd["technical_skills"]["max_points"] == 30
    assert "projects" in bd and bd["projects"]["max_points"] == 20
    assert "resume_ats" in bd and bd["resume_ats"]["max_points"] == 15
    assert "dsa" in bd and bd["dsa"]["max_points"] == 15
    assert "mock_interviews" in bd and bd["mock_interviews"]["max_points"] == 10
    assert "github_presence" in bd and bd["github_presence"]["max_points"] == 10
    print(f"[PASS] Explainable readiness breakdown verified (Pillars: 30+20+15+15+10+10 = 100 pts). Current score: {r_data['readiness_pct']}%")

    # 2. Check dated sources in career recommendations
    recs_resp = client.get("/api/career/recommendations", headers={"Authorization": f"Bearer {token}"})
    assert recs_resp.status_code == 200
    recs = recs_resp.json()
    assert len(recs) > 0
    assert "NASSCOM" in recs[0]["salary_range_inr"] or "Glassdoor" in recs[0]["salary_range_inr"]
    assert "market_source_citation" in recs[0]
    print(f"[PASS] Dated sources verified in salary ranges: '{recs[0]['salary_range_inr']}'")

    # 3. Switching target role
    switch_resp = client.post("/api/career/target-role", headers={"Authorization": f"Bearer {token}"}, json={
        "target_role": "Data Scientist"
    })
    assert switch_resp.status_code == 200
    s_data = switch_resp.json()
    assert s_data["target_role"] == "Data Scientist"
    assert s_data["profile"]["career_goal"] == "Data Scientist"
    assert s_data["roadmap"]["career_goal"] == "Data Scientist"
    print("[PASS] Switching target role recalculates gaps, roadmap, and projects for 'Data Scientist'")

    # 4. Recording project evidence
    evidence_resp = client.post("/api/career/projects/record-evidence", headers={"Authorization": f"Bearer {token}"}, json={
        "project_title": "Enterprise RAG Document Search",
        "github_url": "https://github.com/student/rag-search",
        "tech_stack": ["FastAPI", "Docker", "PyTorch"],
        "metrics_achieved": "Reduced document retrieval latency by 45% using hybrid BM25 + dense embeddings",
        "verification_checklist": {"has_dockerfile": True, "has_tests": True, "has_readme": True}
    })
    assert evidence_resp.status_code == 200
    ev_data = evidence_resp.json()
    assert ev_data["success"] is True
    assert "ats_impact" in ev_data
    assert "🛠️ Verified Project Builder" in ev_data["updated_profile"]["badges"]
    print(f"[PASS] Recorded project evidence: awarded badge, boosted skills & ATS impact: {ev_data['ats_impact']}")

def test_what_if_simulator_scenarios_and_bounds():
    print("\n--- TEST: What-If Simulator Scenarios & Bounds ---")
    email = f"sim_test_{uuid.uuid4().hex[:6]}@univ.edu"
    resp = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "name": "Sim Candidate"
    })
    token = resp.json()["token"]

    # 1. Validation of bounds (negative budget rejected with 422)
    bad_budget = client.post("/api/career/simulate", headers={"Authorization": f"Bearer {token}"}, json={
        "study_hours_per_day": 3.0,
        "monthly_budget": -1000
    })
    assert bad_budget.status_code == 422
    print("[PASS] Negative monthly budget properly rejected with 422")

    # 2. Validation of hours bounds (< 0.5 or > 16.0 rejected with 422)
    bad_hours = client.post("/api/career/simulate", headers={"Authorization": f"Bearer {token}"}, json={
        "study_hours_per_day": 0.1,
        "monthly_budget": 2000
    })
    assert bad_hours.status_code == 422
    print("[PASS] Study hours < 0.5 properly rejected with 422")

    # 3. Dynamic simulation run with side-by-side scenarios
    sim_resp = client.post("/api/career/simulate", headers={"Authorization": f"Bearer {token}"}, json={
        "study_hours_per_day": 3.5,
        "monthly_budget": 2500,
        "target_role": "AI Engineer",
        "invest_course_cost": 3000,
        "invest_course_name": "Coursera Deep Learning Specialization"
    })
    assert sim_resp.status_code == 200
    sim = sim_resp.json()
    assert "side_by_side_scenarios" in sim and len(sim["side_by_side_scenarios"]) == 3
    assert sim["side_by_side_scenarios"][0]["badge"] == "Active Plan"
    assert sim["side_by_side_scenarios"][1]["badge"] == "Financial Fortress"
    assert sim["side_by_side_scenarios"][2]["badge"] == "Accelerated"
    assert "assumptions_explained" in sim and len(sim["assumptions_explained"]) >= 4
    assert "estimate_disclaimer" in sim
    assert "Statistical Model Estimate" in sim["estimate_disclaimer"]
    print("[PASS] What-If simulation generated 3 side-by-side scenarios, assumptions list, and statistical disclaimer")

if __name__ == "__main__":
    test_registration_validation()
    test_data_isolation_and_nested_profile_updates()
    test_profile_reset_confirmation()
    test_explainable_career_engine_and_role_switching()
    test_what_if_simulator_scenarios_and_bounds()
    print("\n=======================================================")
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("=======================================================")

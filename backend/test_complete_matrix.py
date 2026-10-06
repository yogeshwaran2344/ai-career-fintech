import sys
import os
import requests
import json

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("==================================================================")
    print("🚀 RUNNING FULL END-TO-END VERIFICATION MATRIX")
    print("==================================================================")
    passed = 0
    total = 0

    def assert_test(condition, name, detail=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"  ✅ [PASS] {name} {detail}")
        else:
            print(f"  ❌ [FAIL] {name} {detail}")

    # ==================== A. AUTHENTICATION & SECURITY ====================
    print("\n--- A. Authentication & Security ---")
    
    # 1. No token -> Protected API
    res = requests.get(f"{BASE_URL}/api/career/readiness")
    assert_test(res.status_code == 401, "No token -> 401 Unauthorized", f"Got status {res.status_code}")

    # 2. Fake token -> Protected API
    res = requests.get(f"{BASE_URL}/api/career/readiness", headers={"Authorization": "Bearer fake-token-12345"})
    assert_test(res.status_code == 401, "Fake token -> 401 Unauthorized", f"Got status {res.status_code}")

    # 3. Query param bypass rejected
    res = requests.get(f"{BASE_URL}/api/career/readiness?user_id=user-init")
    assert_test(res.status_code == 401, "Query parameter bypass rejected (Strict token required)", f"Got status {res.status_code}")

    # 4. Setup Profile Direct (Student Onboarding)
    setup_payload = {
        "name": "Yogeshwaran",
        "avatar": "🚀",
        "career_goal": "AI Engineer",
        "academic": {
            "degree": "B.Tech / B.E",
            "branch": "Artificial Intelligence & Machine Learning",
            "year": "3rd Year",
            "college": "College of Technology",
            "cgpa": 8.8
        },
        "preferences": {
            "study_hours_per_day": 3.0,
            "target_placement_year": 2027,
            "preferred_learning_style": "Hands-on / Projects"
        },
        "financial": {
            "monthly_income": 15000,
            "food": 3500,
            "travel": 1500,
            "entertainment": 1000,
            "other": 1500,
            "available_for_learning": 2500,
            "savings": 3500,
            "emergency_buffer": 2000
        },
        "skills": [
            {"name": "Python", "proficiency": 7.0, "level": "Intermediate", "category": "General"},
            {"name": "SQL", "proficiency": 6.0, "level": "Intermediate", "category": "General"},
            {"name": "Machine Learning", "proficiency": 5.0, "level": "Intermediate", "category": "General"},
            {"name": "Deep Learning", "proficiency": 3.0, "level": "Beginner", "category": "General"},
            {"name": "DSA", "proficiency": 4.5, "level": "Intermediate", "category": "General"},
            {"name": "FastAPI", "proficiency": 4.0, "level": "Intermediate", "category": "General"}
        ]
    }
    res = requests.post(f"{BASE_URL}/api/auth/setup-profile", json=setup_payload)
    assert_test(res.status_code == 200 and bool(res.json().get("token")), "Direct Student Onboarding Setup", f"Got user_id: {res.json().get('user_id')}")
    token = res.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}

    # Verify session profile retrieval
    res = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    assert_test(res.status_code == 200 and res.json().get("name") == "Yogeshwaran", "Get Me with Session Token", f"Name: {res.json().get('name')}")

    # ==================== B. CAREER ENGINE & READINESS ====================
    print("\n--- B. Career Engine & Readiness ---")
    res = requests.get(f"{BASE_URL}/api/career/readiness", headers=headers)
    readiness_score = res.json().get("readiness_pct", 0)
    assert_test(res.status_code == 200 and readiness_score > 0, "Placement Readiness Calculation", f"Score: {readiness_score}%")

    # Explainable Readiness Breakdown
    res = requests.get(f"{BASE_URL}/api/career/explainable-readiness", headers=headers)
    assert_test(res.status_code == 200 and len(res.json().get("attributions", [])) >= 5, "Explainable AI Readiness Formula", f"Formula: {res.json().get('formula_summary')}")

    # ==================== C. AI MOCK INTERVIEW ENGINE ====================
    print("\n--- C. AI Mock Interview Engine ---")
    res = requests.get(f"{BASE_URL}/api/career/mock-interview/questions?role=AI+Engineer", headers=headers)
    questions = res.json()
    assert_test(res.status_code == 200 and len(questions) >= 3, "Generate Mock Interview Questions", f"Generated {len(questions)} questions")

    # Submit Mock Interview Answers
    answers_payload = {
        "role": "AI Engineer",
        "answers": [
            {
                "question_id": questions[0]["id"],
                "question": questions[0]["question"],
                "user_answer": "RAG is preferred over fine-tuning when dealing with frequently updated knowledge bases and confidential data. In RAG, we use vector databases like Chroma or Pinecone to query semantic chunks with cosine similarity, avoiding hallucinations and massive GPU retraining costs."
            },
            {
                "question_id": questions[1]["id"],
                "question": questions[1]["question"],
                "user_answer": "Vector embeddings represent text in high-dimensional hyperspace. We use cosine similarity because it measures the angle between vectors rather than Euclidean magnitude, making semantic matching invariant to text length."
            }
        ]
    }
    res = requests.post(f"{BASE_URL}/api/career/mock-interview/evaluate", json=answers_payload, headers=headers)
    mock_res = res.json()
    assert_test(
        res.status_code == 200 and mock_res.get("scores", {}).get("overall", 0) >= 70,
        "Evaluate Mock Interview Answers",
        f"Scores: Tech={mock_res['scores']['technical']} Comm={mock_res['scores']['communication']} Overall={mock_res['scores']['overall']} Readiness Lift: +{mock_res['readiness_impact']}%"
    )

    # ==================== D. AI SKILL ASSESSMENT ENGINE ====================
    print("\n--- D. AI Skill Assessment Engine ---")
    res = requests.get(f"{BASE_URL}/api/career/skill-assessment/questions?skill=Python", headers=headers)
    skill_qs = res.json()
    assert_test(res.status_code == 200 and len(skill_qs) >= 2, "Get Skill Assessment Questions (Python)", f"Found {len(skill_qs)} questions")

    # Submit Assessment Answers
    test_sub = {
        "skill_name": "Python",
        "answers": {
            skill_qs[0]["id"]: 0,
            skill_qs[1]["id"]: 1
        }
    }
    res = requests.post(f"{BASE_URL}/api/career/skill-assessment/submit", json=test_sub, headers=headers)
    sub_data = res.json()
    assert_test(
        res.status_code == 200 and sub_data.get("new_proficiency") >= 6.0,
        "Submit Skill Assessment & Update Proficiency in DB",
        f"Score: {sub_data['score']}/{sub_data['max_score']} Prof: {sub_data['old_proficiency']} -> {sub_data['new_proficiency']} Readiness: {sub_data['new_readiness_pct']}%"
    )

    # ==================== E. GITHUB ANALYZER ENGINE ====================
    print("\n--- E. GitHub Profile Analyzer ---")
    res = requests.post(f"{BASE_URL}/api/career/github-analyzer", json={"username": "yogeshwaran2344"}, headers=headers)
    gh_data = res.json()
    assert_test(
        res.status_code == 200 and gh_data.get("overall_github_score", 0) >= 50,
        "Analyze GitHub Profile & Repos",
        f"Activity: {gh_data['code_activity_score']} Quality: {gh_data['project_quality_score']} Overall: {gh_data['overall_github_score']} Impact: {gh_data['readiness_impact']} pts"
    )

    # ==================== F. CAREER PATH COMPARISON & ROI ====================
    print("\n--- F. Career Path Comparison & ROI Calculator ---")
    compare_req = {"roles": ["Data Scientist", "ML Engineer", "AI Engineer"]}
    res = requests.post(f"{BASE_URL}/api/career/compare-paths", json=compare_req, headers=headers)
    comp_data = res.json()
    assert_test(
        res.status_code == 200 and len(comp_data.get("paths", [])) == 3,
        "Career Path Side-by-Side Comparison",
        f"Recommended: {comp_data.get('recommended_role')}"
    )

    # Career ROI Calculator
    roi_req = {
        "course_name": "Full Stack LLM & Generative AI Mastery",
        "provider": "DeepLearning.AI",
        "cost_inr": 12000,
        "target_role": "AI Engineer",
        "study_hours": 50
    }
    res = requests.post(f"{BASE_URL}/api/finance/career-roi", json=roi_req, headers=headers)
    roi_data = res.json()
    assert_test(
        res.status_code == 200 and roi_data.get("readiness_gain_pct", 0) > 0,
        "Career ROI Calculator",
        f"Gain: +{roi_data['readiness_gain_pct']}% Payback: {roi_data['payback_period_months']} months Verdict: {roi_data['verdict']}"
    )

    # ==================== G. JOB APPLICATION FUNNEL TRACKER ====================
    print("\n--- G. Job Application Funnel Tracker ---")
    app_payload = {
        "company": "Razorpay",
        "role": "AI & ML Systems Engineer",
        "stage": "Applied",
        "salary_package_lpa": 18.5,
        "location": "Bengaluru / Remote",
        "notes": "Applied via referral"
    }
    res = requests.post(f"{BASE_URL}/api/jobs/applications", json=app_payload, headers=headers)
    created_app = res.json()
    app_id = created_app.get("id")
    assert_test(res.status_code == 200 and app_id is not None, "Create Job Application Entry", f"ID: {app_id}")

    # Update stage to OA
    res = requests.put(f"{BASE_URL}/api/jobs/applications/{app_id}", json={"stage": "OA", "notes": "Received OA link for weekend"}, headers=headers)
    assert_test(res.status_code == 200 and res.json().get("stage") == "OA", "Update Job Application Stage", "Stage: OA")

    # Get Funnel Analytics
    res = requests.get(f"{BASE_URL}/api/jobs/application-analytics", headers=headers)
    funnel = res.json()
    assert_test(res.status_code == 200 and funnel.get("total_applications", 0) >= 1, "Job Funnel Analytics & AI Coach", f"Coach: {funnel.get('ai_bottleneck_coach')}")

    # ==================== H. FINANCE, SIP & SCAM DETECTOR ====================
    print("\n--- H. Finance, SIP & Scam Detector ---")
    # SIP Simulation (5k vs 10k)
    res_5k = requests.post(f"{BASE_URL}/api/wealth/sip-simulator", json={"monthly_investment_inr": 5000, "duration_years": 5, "expected_cagr_pct": 13.5}, headers=headers)
    res_10k = requests.post(f"{BASE_URL}/api/wealth/sip-simulator", json={"monthly_investment_inr": 10000, "duration_years": 5, "expected_cagr_pct": 13.5}, headers=headers)
    val_5k = res_5k.json().get("estimated_future_value_inr", 0)
    val_10k = res_10k.json().get("estimated_future_value_inr", 0)
    assert_test(
        val_10k > val_5k and val_5k > 0,
        "SIP Simulator (₹10,000 > ₹5,000 corpus)",
        f"₹5k: ₹{val_5k:,.0f} vs ₹10k: ₹{val_10k:,.0f}"
    )

    # Scam Detector (High risk promise)
    scam_req = {
        "pitch_text": "Guaranteed 40% monthly returns risk-free secret crypto arbitrage bot. Send funds via telegram immediately.",
        "platform_name": "Telegram Bot"
    }
    res = requests.post(f"{BASE_URL}/api/wealth/scam-check", json=scam_req, headers=headers)
    assert_test(res.json().get("risk_level") in ["EXTREME_RISK", "HIGH_RISK"], "Scam Detector (40% Guaranteed -> HIGH/EXTREME RISK)", f"Risk: {res.json().get('risk_level')}")

    # ==================== J. REAL RESUME ANALYZER & ATS ====================
    print("\n--- J. Resume Analyzer & ATS Scoring ---")
    res_text = requests.post(f"{BASE_URL}/api/resume/analyze", json={
        "resume_text": "Yogeshwaran - AI Engineer with B.Tech in AI & ML. Built end-to-end full stack web applications with FastAPI, React, PyTorch, Docker, Python, PostgreSQL. Developed a Random Forest pipeline with 92% classification accuracy on 20,000 records. Experience with LangChain, Vector Databases, Git, and Microservices."
    }, headers=headers)
    assert_test(
        res_text.status_code == 200 and res_text.json().get("ats_compatibility_pct", 0) >= 70,
        "Resume ATS Score & Keyword Analysis",
        f"ATS: {res_text.json().get('ats_compatibility_pct')}% Overall: {res_text.json().get('overall_resume_score')}"
    )

    # ==================== K. LINKEDIN PROFILE OPTIMIZATION ====================
    print("\n--- K. LinkedIn Profile Optimization ---")
    li_req = {
        "headline": "Aspiring AI Engineer | B.Tech AIML Student | Python Developer",
        "about": "Passionate about machine learning and deep neural networks. Built an end-to-end classification system achieving 91.4% accuracy.",
        "skills": ["Python", "Machine Learning", "FastAPI", "PostgreSQL"],
        "projects": ["Medical AI Diagnostics System", "Portfolio Wealth Simulator"],
        "experience": "AI & ML Intern at Tech Solutions working on data processing and API deployment."
    }
    res_li = requests.post(f"{BASE_URL}/api/career/linkedin-analyzer", json=li_req, headers=headers)
    li_data = res_li.json()
    assert_test(
        res_li.status_code == 200 and li_data.get("overall_score", 0) >= 70,
        "LinkedIn Profile Score & Auto-Polisher",
        f"Score: {li_data.get('overall_score')}/100 Optimized Headline: {li_data.get('optimized_headline')[:50]}..."
    )

    # ==================== L. SKILL MARKET DEMAND ====================
    print("\n--- L. Skill Market Demand Telemetry ---")
    res_demand = requests.get(f"{BASE_URL}/api/career/skill-market-demand", headers=headers)
    demand_data = res_demand.json()
    assert_test(
        res_demand.status_code == 200 and len(demand_data.get("market_skills", [])) >= 8,
        "Skill Market Demand & Future Growth Telemetry",
        f"Target: {demand_data.get('target_role')} Analyzed: {len(demand_data.get('market_skills', []))} skills Missing High-Growth: {demand_data.get('high_demand_missing_skills')}"
    )

    # ==================== M. JOB MATCH HISTORY ====================
    print("\n--- M. Job Match Progression History ---")
    res_match_hist = requests.get(f"{BASE_URL}/api/jobs/match-history", headers=headers)
    hist_data = res_match_hist.json()
    assert_test(
        res_match_hist.status_code == 200 and hist_data.get("current_avg_match_pct", 0) > 0,
        "Job Match History & Target Company Tracking",
        f"Match Progression: {hist_data.get('previous_avg_match_pct')}% -> {hist_data.get('current_avg_match_pct')}% (+{hist_data.get('improvement_pct')}%)"
    )

    # ==================== N. INTERACTIVE DIGITAL TWIN 2.0 ====================
    print("\n--- N. Interactive Career + Wealth Digital Twin 2.0 ---")
    twin_req = {
        "study_hours": 4.0,
        "monthly_income": 15000,
        "monthly_expenses": 7500,
        "course_spending": 2000,
        "career_choice": "AI Engineer",
        "monthly_investment": 3500,
        "target_salary_lpa": 16.0
    }
    res_twin = requests.post(f"{BASE_URL}/api/wealth/digital-twin/interactive", json=twin_req, headers=headers)
    twin_data = res_twin.json()
    assert_test(
        res_twin.status_code == 200 and len(twin_data.get("scenarios", [])) == 3,
        "Interactive Digital Twin 2.0 (3 Scenarios Generated)",
        f"Recommended: {twin_data.get('recommended_scenario_id')} Advice: {twin_data.get('ai_recommendation')[:65]}..."
    )

    # ==================== O. NOTIFICATIONS & GAMIFICATION ====================
    print("\n--- O. Contextual Notifications & Gamification Badges ---")
    res_notif = requests.get(f"{BASE_URL}/api/notifications", headers=headers)
    notif_data = res_notif.json()
    assert_test(
        res_notif.status_code == 200 and len(notif_data.get("notifications", [])) >= 3,
        "Smart Contextual Notifications Feed",
        f"Generated {len(notif_data.get('notifications', []))} alerts (Unread: {notif_data.get('unread_count')})"
    )

    res_gamify = requests.get(f"{BASE_URL}/api/gamification/status", headers=headers)
    gamify_data = res_gamify.json()
    assert_test(
        res_gamify.status_code == 200 and gamify_data.get("unlocked_count", 0) >= 3,
        "Gamification XP, Levels & Unlocked Badges",
        f"Level {gamify_data.get('current_level')} ({gamify_data.get('current_xp')} XP) Unlocked: {gamify_data.get('unlocked_count')}/{gamify_data.get('total_badges')} badges"
    )

    print("\n==================================================================")
    print(f"🎯 TEST SUMMARY: {passed} / {total} Passed ({int(passed/total*100)}%)")
    print("==================================================================")

if __name__ == "__main__":
    run_tests()

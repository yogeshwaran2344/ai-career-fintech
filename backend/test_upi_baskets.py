import httpx
import uuid
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def test_upi_baskets():
    print("\n=======================================================")
    print("TESTING MULTI-COMPANY BASKET PLANS & UPI GPAY/PHONEPE GATEWAY")
    print("=======================================================\n")

    with httpx.Client(base_url=BASE_URL, timeout=15.0) as client:
        # 1. Register student
        email = f"investor_{uuid.uuid4().hex[:6]}@advisor.ai"
        reg_data = {
            "name": "Rohan Mehra",
            "email": email,
            "password": "Password123!",
            "avatar": "👨‍💼",
            "career_goal": "AI Engineer",
            "academic": {
                "degree": "B.Tech / B.E",
                "branch": "Computer Science & Engineering",
                "year": "4th Year",
                "college": "BITS Pilani",
                "cgpa": 9.1
            },
            "preferences": {
                "preferred_learning_style": "Hands-on",
                "study_hours_per_day": 3.0,
                "target_placement_year": 2027,
                "free_text_intent": "AI Systems & Wealth Creation"
            },
            "financial": {
                "monthly_income": 25000,
                "food": 5000,
                "travel": 2000,
                "entertainment": 1500,
                "other": 2500,
                "available_for_learning": 5000,
                "savings": 5000,
                "emergency_buffer": 4000
            },
            "skills": [
                {"name": "Python", "proficiency": 7.0, "level": "Advanced", "category": "General"},
                {"name": "Machine Learning", "proficiency": 5.5, "level": "Intermediate", "category": "General"},
                {"name": "DSA", "proficiency": 6.0, "level": "Intermediate", "category": "General"},
                {"name": "SQL", "proficiency": 6.5, "level": "Intermediate", "category": "General"},
                {"name": "FastAPI", "proficiency": 5.0, "level": "Intermediate", "category": "General"}
            ]
        }
        r = client.post("/api/auth/register", json=reg_data)
        assert r.status_code == 200, f"Registration failed: {r.text}"
        auth = r.json()
        token = auth["token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"[PASS] 1. Registered student investor: {auth['name']} ({auth['email']})")

        # 2. Get Multi-Company Baskets for Rs 5,000
        r = client.get("/api/wealth/multi-company-baskets?amount_inr=5000", headers=headers)
        assert r.status_code == 200, f"Failed to get baskets: {r.text}"
        baskets_resp = r.json()
        assert len(baskets_resp["baskets"]) == 3
        print(f"[PASS] 2. Generated 3 AI Multi-Company Baskets for Rs {baskets_resp['requested_amount_inr']:,}")

        ai_basket = next(b for b in baskets_resp["baskets"] if b["basket_id"] == "basket-ai-future-tech")
        print(f"   Basket: {ai_basket['basket_name']} (Expected CAGR: {ai_basket['expected_annual_cagr_pct']}%)")
        for a in ai_basket["allocations"]:
            print(f"     -> {a['ticker']}: Rs {a['allocated_amount_inr']} ({a['units_allotted']} units) | P/E: {a['pe_ratio']} | Moat: {a['key_moat']}")
            assert a["allocated_amount_inr"] > 0
            assert a["units_allotted"] > 0

        # 3. Execute UPI Payment via Google Pay (GPAY)
        upi_gpay_payload = {
            "basket_id": "basket-ai-future-tech",
            "payment_method": "GPAY",
            "upi_id": "rohan@oksbi",
            "amount_inr": 5000.0,
            "investment_type": "MULTI_COMPANY_BASKET"
        }
        r = client.post("/api/wealth/upi-pay", headers=headers, json=upi_gpay_payload)
        assert r.status_code == 200, f"GPay payment failed: {r.text}"
        gpay_res = r.json()
        assert gpay_res["success"] is True
        assert gpay_res["payment_method"] == "GPAY"
        assert len(gpay_res["units_allocated_summary"]) == 5
        print(f"[PASS] 3. Google Pay (GPay) UPI Payment Executed: UTR {gpay_res['utr_number']} | Txn: {gpay_res['transaction_id']}")
        print(f"   Allocated {len(gpay_res['units_allocated_summary'])} stocks into portfolio.")

        # 4. Execute UPI Payment via PhonePe
        upi_phonepe_payload = {
            "basket_id": "basket-bluechip-leaders",
            "payment_method": "PHONEPE",
            "upi_id": "rohan@ybl",
            "amount_inr": 2500.0,
            "investment_type": "MULTI_COMPANY_BASKET"
        }
        r = client.post("/api/wealth/upi-pay", headers=headers, json=upi_phonepe_payload)
        assert r.status_code == 200, f"PhonePe payment failed: {r.text}"
        phonepe_res = r.json()
        assert phonepe_res["success"] is True
        print(f"[PASS] 4. PhonePe UPI Payment Executed: UTR {phonepe_res['utr_number']} | Total Portfolio Holdings: {len(phonepe_res['updated_portfolio']['holdings'])}")

        # 5. Check Live Portfolio summary
        r = client.get("/api/wealth/hub", headers=headers)
        assert r.status_code == 200
        hub = r.json()
        assert len(hub["portfolio"]["holdings"]) >= 5
        print(f"[PASS] 5. Verified Live Portfolio: Total Invested = Rs {hub['portfolio']['total_invested_inr']:,} across {len(hub['portfolio']['holdings'])} company holdings")

    print("\n=======================================================")
    print("ALL MULTI-COMPANY BASKET & UPI GPAY/PHONEPE TESTS PASSED 100%!")
    print("=======================================================\n")

if __name__ == "__main__":
    test_upi_baskets()

import sys
import io
import urllib.request
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def post(url, data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else b'{}', headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code} on {url}: {e.read().decode()}")
        raise

def get(url, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code} on {url}: {e.read().decode()}")
        raise

print("="*65)
print(">>> COMPREHENSIVE AI CAREER & FINANCIAL PLATFORM VERIFICATION")
print("="*65)

# 1. Login
auth = post('http://127.0.0.1:8000/api/auth/login', {'email': 'luke@advisor.ai', 'password': 'password123'})
token = auth['token']
print(f"[PASS] 1. Auth Login: User '{auth['profile']['name']}' ({auth['profile']['career_goal']})")

# 2. Test Job Market Benchmark & Rich Requirements (Razorpay, Zomato, Swiggy, Jio)
job_market = get('http://127.0.0.1:8000/api/simulation/job-market', token)
print(f"[PASS] 2. Job Market Match Rate: {job_market['overall_match_pct']}% | Openings: {len(job_market['live_openings'])}")
for job in job_market['live_openings']:
    req = job.get('requirements_detail')
    assert req is not None, f"Requirements detail missing for {job['company']}"
    print(f"       * {job['company']} - {job['title']} ({job['match_pct']}% Match)")
    print(f"         Eligibility: {len(req['eligibility_criteria'])} items | Skills: {len(req['required_skills'])} items | Rounds: {len(req['interview_rounds'])}")

# 3. Test Investment & Smart Savings Hub
hub = get('http://127.0.0.1:8000/api/wealth/hub', token)
print(f"[PASS] 3. Investment Hub Loaded:")
print(f"       * Virtual Portfolio Value: ₹{hub['portfolio']['current_portfolio_value_inr']} | Cash: ₹{hub['portfolio']['cash_wallet_balance_inr']}")
print(f"       * Curated Assets: {len(hub['curated_assets'])} funds/stocks available")
print(f"       * Savings Goals: {len(hub['savings_goals'])} sinking fund jars")
print(f"       * Active Saving Rules: {len(hub['saving_rules'])} rules (Total Potential: ₹{hub['total_monthly_savings_potential_inr']}/mo)")
print(f"       * Demat Guide: {len(hub['student_demat_guide'])} student onboarding steps")

# 4. Test Trade Execution: Start SIP & Buy Lumpsum
trade_sip = post('http://127.0.0.1:8000/api/wealth/trade', {
    'asset_id': 'asset-parag-parikh',
    'action': 'START_SIP',
    'amount_inr': 500.0
}, token)
print(f"[PASS] 4. Executed Virtual SIP Order: {trade_sip['message']}")

trade_buy = post('http://127.0.0.1:8000/api/wealth/trade', {
    'asset_id': 'asset-gold-bees',
    'action': 'BUY_LUMPSUM',
    'amount_inr': 1000.0
}, token)
print(f"[PASS] 5. Executed Lumpsum Purchase: {trade_buy['message']}")

# 5. Test Smart Savings Goal Deposit
goals = hub['savings_goals']
if goals:
    dep_res = post('http://127.0.0.1:8000/api/wealth/goals/deposit', {
        'goal_id': goals[0]['id'],
        'amount_inr': 1500.0
    }, token)
    print(f"[PASS] 6. Savings Goal Deposit: Added ₹1500 to '{goals[0]['title']}' (New Balance: ₹{dep_res['new_amount']})")

# 6. Test Daily Action Plan
daily_plan = get('http://127.0.0.1:8000/api/progress/daily-plan', token)
print(f"[PASS] 7. Date-Aware Daily Action Plan: {daily_plan['date_str']} ({len(daily_plan['tasks'])} tasks, Est. {daily_plan['total_estimated_minutes']} mins)")

# 7. Test Decision Engine
decision = post('http://127.0.0.1:8000/api/decision/evaluate', {
    'scenario_type': 'BUY_COURSE',
    'target_item_name': 'Deep Learning Specialization (Coursera)',
    'cost_inr': 4000.0,
    'timeline_months': 2,
    'custom_question': 'Should I buy this to prepare for Tier-1 AI placement?'
}, token)
print(f"[PASS] 8. Decision Engine Evaluation: Verdict -> {decision['verdict']} | {decision['headline']}")

print("\n" + "="*65)
print(">>> ALL BACKEND ENGINES & NEW INVESTMENT MODULES FULLY TESTED & ACTIVE!")
print("="*65)

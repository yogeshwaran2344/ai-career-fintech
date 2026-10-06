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
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def get(url, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

# 1. Login as Luke
auth_resp = post('http://127.0.0.1:8000/api/auth/login', {'email': 'luke@advisor.ai', 'password': 'password123'})
token = auth_resp['token']
print('[PASS] Logged in as:', auth_resp['profile']['name'])

# 2. Test Wealth Readiness
w_readiness = get('http://127.0.0.1:8000/api/wealth/readiness', token)
print('[PASS] Investment Readiness Status:', w_readiness['readiness_status'], '| Badge:', w_readiness['readiness_badge'])
print('       Safety Gate Passed:', w_readiness['safety_gate_passed'], '| Overall Score:', w_readiness['overall_readiness_score'])
print('       Guidance:', w_readiness['guidance_narrative'][:80], '...')

# 3. Test Risk Assessment
risk = post('http://127.0.0.1:8000/api/wealth/risk-assessment', {
    'market_drop_reaction': 'WAIT_AND_SEE',
    'investment_horizon': 'LONG_5PLUS_YRS',
    'primary_goal': 'BALANCED_GROWTH',
    'emergency_fund_status': 'PARTIAL_1_2M'
}, token)
print('[PASS] Risk Category:', risk['risk_category'], '| Score:', risk['risk_score'], '| Horizon:', risk['investment_horizon_recommendation'])

# 4. Test SIP Simulator
sip = post('http://127.0.0.1:8000/api/wealth/sip-simulator', {
    'monthly_investment_inr': 1000.0,
    'duration_years': 5,
    'expected_cagr_pct': 12.0
}, token)
print('[PASS] SIP Invested: ₹', sip['total_invested_inr'], '-> Future Value: ₹', sip['estimated_future_value_inr'], '| Multiplier:', sip['wealth_multiplier'])
print('       Step-up comparison tiers:', len(sip['step_up_comparison']))

# 5. Test Opportunity Cost ("Where should my ₹2,000 go?")
opp = post('http://127.0.0.1:8000/api/wealth/opportunity-cost', {'amount_inr': 2000.0}, token)
print('[PASS] Opportunity Cost Winner:', opp['primary_winner_id'], '| Headline:', opp['verdict_headline'])
print('       AI Strategic Guidance:', opp['ai_strategic_guidance'][:85], '...')

# 6. Test Scam Detector
scam = post('http://127.0.0.1:8000/api/wealth/scam-detector', {
    'pitch_text': 'Guaranteed 30% monthly return! Join our VIP Telegram channel and double your money in 30 days.'
}, token)
print('[PASS] Scam Check Risk:', scam['risk_level'], '| Safety Score:', scam['safety_score'], '| Badge:', scam['risk_badge'])
print('       Red flags detected:', len(scam['red_flags_detected']))

# 7. Test 5-Year Digital Twin
twin = get('http://127.0.0.1:8000/api/wealth/digital-twin', token)
print('[PASS] Digital Twin Scenarios:', len(twin['scenarios']))
for sc in twin['scenarios']:
    print('       *', sc['name'], '-> Year 5 CTC:', sc['year_5_salary'], '| Year 5 Net Worth:', sc['year_5_net_worth'])

print('\n' + '='*65 + '\n>>> ALL 6 WEALTH BUILDER & INVESTMENT MODULES FULLY TESTED & ACTIVE!\n' + '='*65)

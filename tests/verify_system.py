import requests
import json

BASE = 'http://127.0.0.1:5001'

print("--- TRENDTIDE VERIFICATION SUITE ---")

# 1. Health
r = requests.get(f'{BASE}/api/health')
assert r.status_code == 200, f'Health failed: {r.status_code}'
print('[PASS] Health check OK:', r.json().get('status'))

# 2. Domains
r = requests.get(f'{BASE}/api/domains')
assert r.status_code == 200
domains = r.json().get('domains', [])
assert len(domains) == 10, f'Expected 10 domains, got {len(domains)}'
print(f'[PASS] Domains OK: {len(domains)} domains loaded')
for d in domains:
    print(f'   - {d["name"]} ({d["id"]}): {d["trendCount"]} trends')

# 3. Live Trends
r = requests.get(f'{BASE}/api/trends/live')
assert r.status_code == 200
trends = r.json().get('trends', [])
assert len(trends) > 0, 'No live trends returned'
print(f'[PASS] Live Trends OK: {len(trends)} trends returned. Top #1: {trends[0]["hashtag"]} ({trends[0]["domainName"]})')

# 4. Domain Trends (Cybersecurity)
r = requests.get(f'{BASE}/api/trends/domain/cybersecurity')
assert r.status_code == 200
cyber_trends = r.json().get('trends', [])
print(f'[PASS] Cybersecurity Domain OK: {len(cyber_trends)} trends. #1: {cyber_trends[0]["hashtag"]}')

# 5. Trend Detail & Articles
trend_id = trends[0]['id']
r = requests.get(f'{BASE}/api/trends/{trend_id}')
assert r.status_code == 200
detail = r.json().get('trend', {})
articles = detail.get('articles', [])
history = detail.get('history', [])
print(f'[PASS] Trend Detail OK: Articles={len(articles)}, History Points={len(history)}')

# 6. AI Trend Forecasting
r = requests.get(f'{BASE}/api/trends/{trend_id}/forecast')
assert r.status_code == 200
fc = r.json().get('forecast', {})
assert fc.get('status') == 'success'
assert 'h24' in fc.get('horizons', {})
assert 'd3' in fc.get('horizons', {})
assert 'd7' in fc.get('horizons', {})
print(f'[PASS] AI Forecast OK: Confidence={fc.get("confidenceScore")}, Trajectory={fc.get("analysis", {}).get("trajectoryLabel")}')
print(f'   - 24h Horizon Shift: {fc["horizons"]["h24"]["projectedChangePct"]}%')
print(f'   - 3d Horizon Shift: {fc["horizons"]["d3"]["projectedChangePct"]}%')
print(f'   - 7d Horizon Shift: {fc["horizons"]["d7"]["projectedChangePct"]}%')

# 7. Search
r = requests.get(f'{BASE}/api/search?q=AI')
assert r.status_code == 200
res = r.json().get('results', [])
print(f'[PASS] Search OK: Found {len(res)} matches for "AI"')

# 8. Sources Status
r = requests.get(f'{BASE}/api/sources/status')
assert r.status_code == 200
sources = r.json().get('sources', [])
print(f'[PASS] Sources Status OK: {len(sources)} connectors reported. Active={r.json().get("activeCount")}')
for s in sources:
    print(f'   - {s["name"]}: {s["status"]} (Latency: {s["latencyMs"]}ms)')

# 9. Authentication and protected API access
anonymous = requests.get(f'{BASE}/api/auth/me')
assert anonymous.status_code == 401
print('[PASS] Authentication rejects requests without a session cookie.')

protected = requests.get(f'{BASE}/api/watchlist')
assert protected.status_code == 401
print('[PASS] Watchlist API rejects unauthenticated requests.')

# 11. Static SPA serving
r = requests.get(f'{BASE}/')
assert r.status_code == 200
assert '<!doctype html>' in r.text.lower() or '<html' in r.text.lower()
print('[PASS] Static Client SPA Serving OK')
print("--- ALL 11 TESTS PASSED PROUDLY ---")

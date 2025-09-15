# Quickstart – Enhanced Multi-Model Assistant

## Objective
Demonstrate plan gating, CRUD, analytics, quota, abuse throttle, failover, and recommendations.

## Steps
1. Assign Plan
```bash
curl -X POST /api/v1/admin/plan/assign -d '{"userId":"U1","plan":"premium"}'
```
2. Analytics Query (Cross-Domain)
```bash
curl -X POST /api/v1/ai/analyze -d '{"question":"Show last month engagement, cancellations and overdue ratio"}'
```
Expect summary + recommendations.
3. CRUD Modify
```bash
curl -X POST /api/v1/ai/crud -d '{"instruction":"update the appointment tomorrow 10am to 2pm for patient X"}'
```
Expect confirmation.
4. Quota Exhaust (Free User)
```bash
for i in {1..41}; do curl -s -X POST /api/v1/ai/analyze -H 'X-User: freeUser' -d '{"question":"usage test"}' > /dev/null; done
```
Last request returns quota exhaustion + upgrade prompt.
5. Abuse Trigger
```bash
for i in {1..13}; do curl -s -X POST /api/v1/ai/analyze -d '{"question":"rapid '$i'"}' > /dev/null; done
```
Expect cooldown notice.
6. Failover Simulation (force primary timeout)
```bash
FORCE_TIMEOUT=1 curl -X POST /api/v1/ai/analyze -d '{"question":"test failover"}'
```
Neutral notice appended.
7. Recommendation Generation (Explicit)
```bash
curl -X POST /api/v1/ai/recommendations -d '{"context":"cancellations up 12%"}'
```
8. Usage Status
```bash
curl /api/v1/ai/usage
```

## Success Criteria
- Plan gating refuses premium actions for free user
- Quota and abuse boundaries enforced precisely
- Failover message neutral and present when triggered
- Recommendations limited to defined categories

## Cleanup
- Revoke plan assignment if needed

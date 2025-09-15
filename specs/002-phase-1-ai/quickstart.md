# Quickstart – Phase 1 AI Chat

## Goal
Demonstrate end‑to‑end contextual Q&A with consent, redaction, audit, rate limiting and explanation.

## Prerequisites
- Running dev stack (Supabase test instance, API server, web client)
- User with role CLINICAL_STAFF and valid consent for patient P123
- ENV: OPENAI_API_KEY (or MOCK_MODE=true)

## Steps
1. Create Consent (if not existing)
   ```bash
   curl -X POST /api/v1/consents -d '{"patientId":"P123","granted":true}'
   ```
2. Start Chat Session (implicit on first query)
   ```bash
   curl -X POST /api/v1/chat/query -H 'Accept: text/event-stream' -d '{"question":"Quais foram os últimos tratamentos do paciente?"}'
   ```
   Expect: streaming tokens, first within <1s.
3. Request Explanation
   ```bash
   curl -X POST /api/v1/chat/explanation -d '{"messageId":"<answer-id>"}'
   ```
4. Trigger Ambiguous Clarification
   ```bash
   curl -X POST /api/v1/chat/query -d '{"question":"Qual foi o saldo?"}'
   ```
   Expect: clarification prompt (which patient?).
5. Rate Limit Demonstration (script loop >10 in 5m)
   ```bash
   for i in {1..11}; do curl -s -X POST /api/v1/chat/query -d '{"question":"Ping '$i'"}' > /dev/null; done
   ```
   Last responses show fairness notice.
6. Deterministic Mock Mode
   ```bash
   MOCK_MODE=true curl -X POST /api/v1/chat/query -d '{"question":"mock:balance"}'
   ```
   Expect: fixed balance summary.
7. Audit Verification
   ```bash
   curl /api/v1/admin/audit?user=<userId>
   ```
   Ensure redaction placeholders (<CPF>, etc.).

## Success Criteria
- All steps succeed without exposing PII.
- Rate limit scenario returns refusal with upgrade guidance.
- Explanation omits raw identifiers.

## Cleanup
- (Optional) Revoke consent → future patient queries refused.

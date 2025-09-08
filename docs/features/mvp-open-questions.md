---
title: MVP Open Questions & Assumptions
last_updated: 2025-09-08
form: reference
tags: [planning, risk]
related:
  - ./mvp-scope.md
  - ./mvp-risks.md
---

# Open Questions

- Which Supabase project (id) corresponds to ref `ownkoxryswokcdanrdgj`?
- Staging credentials policy (who holds secrets, rotation cadence)?
- RLS policies completeness for Patient/Scheduling tables in MVP?
- Preview vs Staging env differences (flags, quotas)?
- Error budget and SLOs for first staging wave?

# Assumptions

- External integrations default OFF in MVP
- Service-role never exposed to frontend
- CI runs type-check + unit; e2e only on staging

# Next Steps to Unblock

- Confirm Supabase project id and roles
- Approve env matrix and Vercel env commands
- Assign owners for schedule milestones

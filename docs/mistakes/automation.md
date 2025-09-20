---
title: "Automation Tracking Gaps"
last_updated: 2025-09-17
category: audit-workflows
severity: medium
---

# Automation Tracking Gaps

## Problem

Teams close audit tasks without recording regression run IDs, artifacts, or follow-up reminders, making LGPD/ANVISA validation unverifiable.

## Wrong Approach

- Running `pnpm test:healthcare` locally but leaving Archon notes empty.
- Forgetting to document `-- --audit-only` reruns after a gate failure.
- Skipping the 48h documentation check once the prompt version changes.

## Correct Approach

- Log every `pnpm test:healthcare -- --regression` and `-- --audit-only` run in Archon with a summary, artifact links, and anonymization confirmation.
- Attach CLI output (Vitest/Playwright) to the active task before moving it to review.
- Schedule the mandated 48h follow-up task and close it only after documentation merges are verified.

## Prevention

- Embed the run ID capture step in task templates and PR checklists.
- Use Archon reminders to enforce the 48h follow-up cadence.
- Reference `docs/features/code-quality-audit.md` during audits to keep expectations aligned.

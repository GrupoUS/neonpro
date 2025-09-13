# Contract: Explanation Summary (Chain-of-Thought - Safe)

## Output
- explanation: string (concise, non-PII summary of reasoning steps)
- steps?: string[] (high-level bullet points; no raw prompts or sensitive data)
- shownAt: timestamp

## Constraints
- Must never include PII, raw prompts, hidden system instructions, or provider-specific secrets.
- Availability depends on user role and clinic policy.
- Audit event must be recorded when generated/shown.

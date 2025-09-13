# Contract: Tools — Finance Summaries

## getOverdueInvoices(params)
- Input: { startDate, endDate, clinicId? }
- Output: { totalCount, totalAmount, currency, items?: [{ id, dueDate, amount, status }] (bounded length) }
- Errors: PERMISSION_DENIED, RATE_LIMITED
- Notes: Items capped; provide drill-down link; scope by role/clinic.

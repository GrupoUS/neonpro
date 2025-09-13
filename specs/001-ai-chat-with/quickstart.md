# Quickstart — Validate AI Chat Feature (Planning)

1) Confirm roles and locales with stakeholders; resolve [NEEDS CLARIFICATION].
2) Configure safe presets (Prompt Templates) for top clinical and finance queries.
3) Validate consent gating and RLS via sample questions:
   - "How many new patients started treatment this month?"
   - "Which invoices are overdue this week?"
   - "What is patient Maria Santos’ outstanding balance?"
4) Validate loading states cancelation and explanation view visibility.
5) Verify audit events for chat requests and explanation views.
6) Run test scripts after implementation:
   - `pnpm --filter @neonpro/web test`
   - `pnpm --filter @neonpro/web type-check`

## UI Primitives (shadcn) — Install
Run once at repo root to add common primitives used by Elements-based chat:

```bash
pnpm dlx shadcn@latest add @shadcn/input @shadcn/textarea @shadcn/dialog @shadcn/popover @shadcn/tooltip @shadcn/toast @shadcn/badge @shadcn/card @shadcn/progress @shadcn/skeleton @shadcn/spinner @shadcn/separator @shadcn/alert @shadcn/accordion @shadcn/avatar @shadcn/scroll-area @shadcn/dropdown-menu @shadcn/command @shadcn/tabs
```

Then wire: input for Prompt Input; badges/cards for Response; progress/skeleton/spinner for Task/Loading; dialog/popover/tooltip for Open-in-Chat and suggestions; avatar for Conversation.

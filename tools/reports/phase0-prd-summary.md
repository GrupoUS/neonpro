# Phase 0 — PRD Summary (docs/prd)

Docs reviewed
- `docs/prd/prd.md`, `docs/prd/02-functional-and-technical-specs.md`

Objectives & scope
- IA-first platform for Brazilian aesthetic clinics
- Core mission: reduce no-shows; streamline ops; enforce LGPD/ANVISA/CFM

Primary features
- Universal AI Chat (PT-BR), scheduling via natural language
- Engine Anti-No-Show (predictive scoring + interventions)
- Compliance automation (LGPD/ANVISA/CFM)
- Integrated management: appointments, EMR, dashboard, stock, finance

Technical baseline
- FE: Next.js 15 + React 19 + TS + Tailwind + shadcn/ui
- BE/DB: Supabase (Postgres+Auth+Realtime+Storage) + Prisma
- AI: GPT-4/AI SDK; RAG + vectors (pgvector)
- Infra: Turborepo, Vercel, GitHub Actions
Phasing (from PRD)
- Phase 1: Foundation (auth, basic CRUD patients/appointments, responsive UI, basic LGPD)
- Phase 2: Intelligent architecture (data pipeline, notifications, WhatsApp/SMS)
- Phase 3: AI features (chat, anti‑no‑show, automation, insights)

Success criteria
- IA response <2s; uptime 99.9%; mobile-first perf; offline basics
- Impact: fewer no-shows; admin time reduction; user satisfaction; AI adoption
- Quality: 100% LGPD/ANVISA/CFM; zero security incidents; usability; stability

DB core entities (spec excerpt)
- clinics, patients, appointments plus AI conversations and behavior analysis

Notes
- Keep Product scope aligned with consolidation work (API/DB) to avoid rework

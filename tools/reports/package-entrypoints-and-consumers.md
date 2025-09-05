# Package Entrypoints & Consumers (Phase 1)

Scope
- Identify entrypoints (app, CLI, API routes, jobs) and consumers per package

Apps detected
- apps/web: Next.js app router, middleware.ts, API routes in app/api/**
- apps/api: Hono API, vercel.json routes /api/* → api/index.ts

Initial notes
- To extract: apps/*/package.json scripts; apps/web/app/api/**/* and apps/api/src/routes/**/*; packages/*/src entrypoints
- To map consumers: grep imports across apps/* and packages/*

Next steps
- Build entrypoint list per package
- Build consumer map (apps → packages; packages → packages)
- Add evidence snippets (<augment_code_snippet>) where useful
## Discovered Entrypoints (initial)

apps/web
- middleware.ts (if present)
- API routes: app/api/** (see full list below)

apps/api
- src/index.ts (Hono bootstrap)
- Routes: src/routes/** (ai, analytics, appointments, audit, auth, clinics, compliance, health, patients, professionals, services, index)
- Middleware: src/middleware/** (auth, cors, error-handler, lgpd, rate-limit, request-id, healthcare-*)

### apps/web API route groups (top-level)
- ai, alerts, analytics, appointments, assistant, audit, auth, automated-analysis, automated-protocol-optimization, backup, bank-reconciliation, billing, campaigns, communication, communications, compliance, consultations, cron, dashboard, delinquency, email, executive-dashboard, export, financial, followup, followups, handoff, health, health-check, hono, installments, inventory, jobs, lgpd, maintenance, marketing, marketing-roi, medical-knowledge, milestones, monitoring, multi-session-analysis, no-show-prediction, notifications, oauth, patients, payment-plans, payments, pdf, personalized-recommendations, predictions, predictive-analytics, professionals, profile, progress-analytics, progress-tracking, quality, receipts-invoices, recurring-payments, regulatory-documents, report-builder, reports, resources, retention, retention-analytics, revenue-optimization, risk-assessment, roles, scheduling, search, security, segmentation, service-types, session, sms, social-media, stock, stripe, subscription, subscription-plans, subscriptions, suppliers, tax, tenants, test, test-chat, treatment-prediction, treatment-success, trial-management, types, vision, webhooks, websocket, whatsapp

(See apps/web/app/api/* for nested routes; many groups include route.ts as Next.js handlers.)

## Initial Consumers (sample)
- Detected internal package imports primarily inside templates and README. Further mapping will analyze TS import graphs excluding node_modules, and cross-reference turbo dependency graph.

## Next steps
- Enumerate apps/web/app/api/** route.ts files into a table with HTTP methods (by content scan)
- Enumerate apps/api/src/routes/*.ts exported handlers and their middleware
- Build import graph via AST (ts-morph) to produce apps→packages and packages→packages consumer map
- Add evidence snippets for representative routes

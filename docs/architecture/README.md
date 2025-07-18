# Neon Pro – Full‑Stack Architecture Document - Index

This directory contains the sharded sections of the complete Architecture Document for better organization and focused technical development work.

## Document Structure

1. [System Overview & Context](./01-system-overview-context.md)
2. [Logical Components & Data Flow](./02-logical-components-data-flow.md)
3. [Data Model & RLS Policies](./03-data-model-rls-policies.md)
4. [Infrastructure & CI/CD Pipeline](./04-infrastructure-cicd-pipeline.md)
5. [API Surface & Edge Functions](./05-api-surface-edge-functions.md)
6. [Security & Compliance](./06-security-compliance.md)
7. [Scalability & Costs](./07-scalability-costs.md)
8. [Observability & Monitoring](./08-observability-monitoring.md)
9. [Extensibility & Technical Roadmap](./09-extensibility-technical-roadmap.md)

## Usage Guidelines

- Each shard focuses on a specific architectural concern
- Reference these documents during development and system design reviews
- Update individual sections as architecture evolves
- Maintain consistency across all technical decisions

## Quick Reference

**Technology Stack**: Next.js 15 + Supabase + Vercel Edge Functions + TypeScript  
**Architecture Pattern**: Islands Architecture with Edge Computing  
**Security Model**: JWT + RLS + Multi-tenant isolation  
**Performance Targets**: API p95 ≤ 800ms, Cold-start p95 ≤ 300ms  
**Initial Budget**: ~$274/month for MVP scale

## Key Design Decisions

- **Offline-first PWA** with Service Worker and IndexedDB queue
- **Multi-tenant RLS** for clinic data isolation
- **Pluggable messaging** architecture (WhatsApp/SMS/Email)
- **Edge Functions** for critical business logic
- **Unified trace_id** for observability

---

Generated by BMad-Method (Architect Agent) - version 2025-07-18

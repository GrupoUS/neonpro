# AI Chat Phase 1 — Policies and Indexes

This migration adds helpful indexes and Row Level Security (RLS) policies for the AI Chat tables created in Phase 1.

## Tables

- `ai_chat_sessions`
- `ai_chat_messages`
- `ai_audit_events`

## Indexes

- `ai_chat_sessions (clinic_id, user_id)`
- `ai_chat_messages (session_id, created_at)`
- `ai_audit_events (clinic_id, user_id, created_at)`

## RLS Policies

- Sessions: select/insert allowed when `clinic_id` and `user_id` match the request context
- Messages: select/insert allowed when the owning session matches the request context
- Audit events: select/insert allowed for matching `clinic_id` + `user_id`

These policies rely on request-scoped context variables (`current_setting('app.clinic_id')` and `current_setting('app.user_id')`). Ensure your API middleware sets these via `SET LOCAL` per request in server-side operations; for client-side access use standard Supabase RLS with `auth.uid()` and tenants.

> Adjust to your deployment: replace GUCs with `auth.uid()` + tenant checks if using Supabase exclusively.

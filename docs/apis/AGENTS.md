---
title: "API Documentation Orchestrator"
last_updated: 2025-09-10
form: reference
tags: [api-docs, orchestrator, neonpro, documentation-standards]
related:
  - ./apis.md
  - ./ai-sdk-v5.0.md
  - ../agents/documentation.md
  - ../AGENTS.md
---

# API Documentation Orchestrator

**Purpose**: Define how to create, name, review, and maintain API documentation in the `/docs/apis/` directory with consistency and quality for the NeonPro aesthetic clinic management platform.

## Documentation Structure

### **File Organization**

- **Primary API Guide**: [`apis.md`](./apis.md) - Complete implementation patterns, endpoints, and tech stack
- **AI Integration**: [`ai-sdk-v5.0.md`](./ai-sdk-v5.0.md) - Vercel AI SDK v5.0 patterns and best practices
- **This File**: Orchestration rules, standards, and navigation guidelines

### **File Naming & Organization**

- **Location**: All API documentation in `/docs/apis/` directory
- **Naming Pattern**: `<domain>-<scope>.md` (e.g., `patients-crud.md`, `appointments-scheduling.md`)
- **Size Limit**: ≤250 lines per file for maintainability
- **Grouping**: Group related endpoints by domain/functionality

## Documentation Standards

### **Required Endpoint Format**

Each documented endpoint must include:

1. **Title**: `### [METHOD] /api/path`
2. **Purpose**: Clear description of functionality and use cases
3. **Authentication**: Requirements and role-based access
4. **Parameters**: Path, query, and header parameters
5. **Request Body**: JSON schema or examples
6. **Responses**: Status codes with JSON examples (success and errors)
7. **Source Path**: Code location (e.g., `apps/api/src/routes/...`)
8. **Notes**: Important limitations, rate limits, side effects

### **Documentation Template**

```markdown
# <Domain> API Documentation

**Purpose**: Brief description of the domain and its endpoints

## Tech Stack Context

- **Framework**: TanStack Router + Vite + Hono
- **Database**: Supabase (PostgreSQL + Auth)
- **Validation**: Zod schemas
- **Authentication**: Supabase Auth with Bearer tokens

## Endpoints

### [METHOD] /api/endpoint-path

**Purpose**: What this endpoint does and when to use it

**Authentication**: Required roles/permissions

**Parameters**:
- `param` (type, required/optional): Description

**Request Body**:
```json
{
  "field": "value"
}
```

**Responses**:
- `200 OK`: Success response
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required

**Source Path**: `apps/api/src/routes/endpoint.ts`

**Notes**: Important considerations
```

## Current Tech Stack

### **NeonPro Platform Stack**

- **Frontend**: TanStack Router + Vite + React 19 + TypeScript 5.7.2
- **Backend**: Hono.dev + Bun runtime
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI Integration**: Vercel AI SDK v5.0 + OpenAI GPT-4o
- **Validation**: Zod schemas with TypeScript strict mode
- **Package Manager**: Bun (3-5x faster than npm)
- **Deployment**: Vercel (frontend) + Supabase (backend services)

### **Performance Targets**

- **AI Chat First Token**: <200ms
- **Patient Record Access**: <500ms
- **Appointment Scheduling**: <300ms
- **No-Show Prediction**: <100ms
- **API Availability**: 99.9% uptime

## Quality Standards

### **Documentation Quality Gates**

- **Accuracy**: All paths and methods match actual code implementation
- **Examples**: All JSON examples validate against current schemas
- **Security**: Authentication, PII masking, and rate limiting documented
- **Size**: ≤250 lines per file with clear titles and consistent terminology
- **Cross-references**: Links to related documentation and domain files

### **Compliance Requirements**

- **LGPD**: Data protection and consent management patterns
- **Healthcare**: Patient privacy and medical data handling
- **Audit**: Complete request/response logging for compliance
- **Security**: Bearer token authentication and role-based access

## Navigation Guidelines

### **Documentation Workflow**

1. **Start with [`apis.md`](./apis.md)** - Understand platform architecture and patterns
2. **AI Integration**: Use [`ai-sdk-v5.0.md`](./ai-sdk-v5.0.md) for AI-powered features
3. **Domain-Specific**: Create focused files for specific API domains
4. **Cross-Reference**: Link between related documentation files

### **Content Boundaries**

- **This File (AGENTS.md)**: Orchestration rules, standards, and navigation
- **apis.md**: Complete implementation patterns, examples, and tech stack details
- **ai-sdk-v5.0.md**: Vercel AI SDK v5.0 specific patterns and best practices
- **Domain Files**: Focused endpoint documentation for specific domains

## Process Guidelines

### **Documentation Lifecycle**

1. **Create**: Use standard template with proper YAML front matter
2. **Review**: Validate against quality gates and compliance requirements
3. **Maintain**: Keep synchronized with code changes and tech stack updates
4. **Archive**: Remove obsolete documentation and update cross-references

### **Update Protocol**

- **Code Changes**: Update documentation within same PR/commit
- **Tech Stack Changes**: Update all affected files consistently
- **New Endpoints**: Follow standard template and naming conventions
- **Breaking Changes**: Document migration path and version compatibility

---

**Focus**: API documentation orchestration and standards for NeonPro aesthetic clinic platform  
**Compliance**: LGPD, healthcare data protection, and audit requirements  
**Target**: Developers implementing and maintaining API documentation  
**Version**: 3.0.0 - Optimized for orchestration only
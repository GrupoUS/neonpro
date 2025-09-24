---
title: "🤖 LLM Documentation Control Hub"
version: 4.0.0
last_updated: 2025-09-24
form: reference
tags: [llm-control, orchestration, navigation, agents]
priority: CRITICAL
llm_instructions:
  mandatory_read: true
  entry_point: true
  execution_rules: |
    1. ALWAYS read this file first when working with documentation
    2. Follow KISS and YAGNI principles strictly
    3. Focus on making system WORK, not perfect documentation
    4. Execute tasks in parallel when possible
    5. Use AGENTS.md files as control points, NOT README.md
---

# 🤖 LLM Documentation Control Hub — v4.0

## 🎯 FOR LLMs: MANDATORY EXECUTION RULES

### CRITICAL PRINCIPLES

- **KISS**: Keep It Simple, Stupid - eliminate complexity
- **YAGNI**: You Aren't Gonna Need It - build only what's needed NOW
- **WORKING > PERFECT**: Focus on functionality over documentation perfection
- **PARALLEL EXECUTION**: Execute tasks simultaneously when possible

### NAVIGATION PROTOCOL

```yaml
LLM_NAVIGATION:
  entry_point: docs/AGENTS.md (this file)
  control_files: 
    - docs/architecture/AGENTS.md
    - docs/apis/AGENTS.md  
    - docs/testing/AGENTS.md
    - docs/database-schema/AGENTS.md
    - docs/agents/AGENTS.md
  avoid: README.md files (eliminated for simplicity)
  max_file_size: 800_lines
```

## 🚀 QUICK START FOR LLMs

### IMMEDIATE ACTIONS

1. **Read control files**: Start with relevant AGENTS.md
2. **Apply KISS/YAGNI**: Eliminate unnecessary complexity
3. **Execute in parallel**: Use concurrent operations when possible
4. **Focus on working**: Make system functional, not perfect

### CONTROL HIERARCHY

```
docs/AGENTS.md (YOU ARE HERE)
├── architecture/AGENTS.md  ← System design & tech stack
├── apis/AGENTS.md          ← API endpoints & contracts
├── testing/AGENTS.md       ← Testing strategies
├── database-schema/AGENTS.md ← Data structure
└── agents/AGENTS.md        ← Development workflows
```

## 🛠️ ESSENTIAL TOOLS & COMMANDS

### Development

```bash
# Start development
pnpm dev

# Run tests
pnpm test

# Build production
pnpm build

# Type checking
pnpm type-check
```

### Database

```bash
# Database migrations
bunx prisma migrate dev

# Reset database
bunx prisma migrate reset

# Generate types
bunx prisma generate
```

## 🎯 TASK EXECUTION MATRIX

| Task Type            | Primary Control             | Secondary                 | Tertiary            |
| -------------------- | --------------------------- | ------------------------- | ------------------- |
| **Add API endpoint** | `apis/AGENTS.md`            | `architecture/AGENTS.md`  | `testing/AGENTS.md` |
| **UI/Component**     | `architecture/AGENTS.md`    | `testing/AGENTS.md`       | -                   |
| **Database change**  | `database-schema/AGENTS.md` | `apis/AGENTS.md`          | -                   |
| **Bug fix**          | `testing/AGENTS.md`         | Relevant domain AGENTS.md | -                   |
| **Feature**          | `agents/AGENTS.md`          | Domain-specific AGENTS.md | -                   |

## 📊 SIMPLIFIED FOLDER STRUCTURE

### PROTECTED (Keep Intact)

- `architecture/` - System design
- `agents/` - Development workflows
- `prd/` - Product requirements
- `rules/` - Coding standards

### WORKING AREAS

- `apis/` - API documentation
- `testing/` - Test strategies
- `database-schema/` - Data models
- `components/` - UI component docs
- `deployment/` - Operations
- `security/` - Security guidelines

### ELIMINATED

- ❌ `README.md` files (use AGENTS.md instead)
- ❌ `mistakes/` folder (consolidated to troubleshooting.md)
- ❌ Files >800 lines (broken into essentials)
- ❌ Overengineered documentation

## 🔗 CONTROL FILE LINKS

### Primary Controllers

- **[Architecture Control](./architecture/AGENTS.md)** - System design, tech stack, source tree
- **[API Control](./apis/AGENTS.md)** - Endpoints, contracts, specifications
- **[Testing Control](./testing/AGENTS.md)** - Test strategies, TDD orchestration
- **[Database Control](./database-schema/AGENTS.md)** - Schema, migrations, policies
- **[Agents Control](./agents/AGENTS.md)** - Development workflows, coordination

### Quick Access

- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions
- **[Coding Standards](./rules/coding-standards.md)** - Development guidelines
- **[Operations Guide](./deployment/operations-guide.md)** - Production procedures

## 📝 DOCUMENTATION PRINCIPLES

### KISS Applied

- **One purpose per file**: Each document serves a single, clear purpose
- **Essential information only**: Remove theoretical/future considerations
- **Working examples**: Code that actually runs, not pseudocode
- **Direct instructions**: "Do X" instead of "You might consider doing X"

### YAGNI Applied

- **No speculative features**: Document only what exists and is used
- **No "might need later"**: Remove "for future use" sections
- **Current requirements only**: Focus on immediate needs
- **Remove unused**: Delete documentation for unused features

### File Size Management

- **800 line limit**: Break larger files into focused pieces
- **Essential content**: Remove verbose explanations
- **Reference vs Tutorial**: Separate reference data from learning material
- **Modular approach**: Link related content instead of duplicating

## ⚡ PARALLEL EXECUTION GUIDE

### Operations You Can Run in Parallel

```bash
# Multiple test suites
pnpm test:unit & pnpm test:integration & pnpm test:e2e

# Build and type check
pnpm build & pnpm type-check

# Multiple file operations (when independent)
# Reading multiple files
# Analyzing different code sections
# Running independent validations
```

### Operations That Must Be Sequential

```bash
# Database operations
pnpm db:migrate && pnpm db:seed

# File modifications (avoid conflicts)
# Dependent build steps
# Operations that modify same resources
```

## 🤖 LLM EXECUTION CHECKLIST

### Before Starting Any Task

- [ ] Read relevant AGENTS.md control file
- [ ] Apply KISS principle (simplest solution that works)
- [ ] Check if you can execute operations in parallel
- [ ] Focus on making system work, not perfect docs

### During Task Execution

- [ ] Keep files under 800 lines
- [ ] Eliminate redundant information
- [ ] Use AGENTS.md for navigation, not README.md
- [ ] Execute parallel operations when possible

### Task Completion

- [ ] System functionality verified
- [ ] Documentation updated if necessary
- [ ] No overengineering introduced
- [ ] KISS/YAGNI principles maintained

## 🎯 SUCCESS METRICS

### System Functionality

- [ ] Application builds successfully
- [ ] Tests pass consistently
- [ ] Core features work in production
- [ ] Performance meets requirements

### Documentation Quality

- [ ] LLMs can navigate easily using AGENTS.md files
- [ ] Developers find information quickly
- [ ] No files exceed 800 lines
- [ ] No redundant information
- [ ] KISS/YAGNI principles maintained

---

**Remember**: The goal is a WORKING system, not perfect documentation. Focus on functionality first, documentation second.

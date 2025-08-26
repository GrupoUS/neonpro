# 🚀 NeonPro AI Healthcare Platform Rules

**Unified project-specific configuration for NeonPro AI Healthcare Platform with constitutional excellence, healthcare compliance, and architectural guidance.**

## 📋 **Essential References**

**Primary Workflow**: [`core-workflow.md`](core-workflow.md)

**Complete Documentation**:
- **⚙️ Tech Stack**: [`docs/architecture/tech-stack.md`](../docs/architecture/tech-stack.md) - AI-First Stack: Next.js 15, React 19, Vercel AI SDK 5.0, Hono.dev 4.x
- **📁 Source Tree**: [`docs/architecture/source-tree.md`](../docs/architecture/source-tree.md) - 32 AI-optimized packages with constitutional governance
- **🎨 Coding Standards**: [`docs/architecture/coding-standards.md`](../docs/architecture/coding-standards.md) - Healthcare compliance built-in patterns

## 🎯 **NeonPro Core Principles**

### **Technology & Development**
- **PNPM over NPM**: Use PNPM for all dependency management - faster, efficient, less disk space
- **ARCHON-FIRST RULE**: Always use Archon MCP server for task management, knowledge management, and project organization
- **Architecture Consistency**: Always follow technologies and structures defined in `docs/architecture/`
- **Quality Standard**: Maintain ≥9.8/10 code quality standards with healthcare compliance
- **AI-First Development**: Native AI integration across all layers with constitutional excellence
- **Clean Development**: Remove deprecated code immediately, maintain system cleanliness
- **Git Integration**: Auto-commit with clear messages when tasks are completed

### **Development Philosophy**
- **Test changes instead of assuming they work** - Verify outputs match expectations
- **"Should work" ≠ "does work"** - Pattern matching isn't enough
- **Detailed errors over graceful failures** - Identify and fix issues fast
- **No backwards compatibility** - Remove deprecated code immediately
- **Focus on user experience and feature completeness**

## 🤖 **Archon Integration & Workflow**

### **CRITICAL: Archon-First Rule**
**MANDATORY: Always complete the full Archon task cycle before any coding:**

1. **Check Current Task** → `archon:manage_task(action="get", task_id="...")`
2. **Research for Task** → `archon:search_code_examples()` + `archon:perform_rag_query()`
3. **Implement the Task** → Write code based on research
4. **Update Task Status** → `archon:manage_task(action="update", task_id="...", update_fields={"status": "review"})`
5. **Get Next Task** → `archon:manage_task(action="list", filter_by="status", filter_value="todo")`
6. **Repeat Cycle**

**NEVER skip task updates with the Archon MCP server. NEVER code without checking current tasks first.**

### **Project Scenarios & Initialization**

#### Scenario 1: New Project with Archon
```bash
# Create project container
archon:manage_project(action="create", title="Project Name", github_repo="repo_url")
# Research → Plan → Create Tasks
```

#### Scenario 2: Existing Project - Adding Archon
```bash
# Analyze existing codebase thoroughly first
archon:manage_project(action="create", title="Existing Project Name")
# Focus on what needs to be built, not what already exists
```

#### Scenario 3: Continuing Archon Project
```bash
# Check existing project status
archon:manage_task(action="list", filter_by="project", filter_value="[project_id]")
# Continue with standard development iteration workflow
```

### **Task-Specific Research Workflow**

**For each task, conduct focused research:**

```bash
# High-level: Architecture, security, optimization patterns
archon:perform_rag_query(query="healthcare architecture patterns", match_count=5)

# Low-level: Specific API usage, syntax, configuration
archon:perform_rag_query(query="Next.js 15 server components healthcare", match_count=3)

# Implementation examples
archon:search_code_examples(query="LGPD compliance React components", match_count=3)
```

### **Task Status Management**

**Status Progression**: `todo` → `doing` → `review` → `done`

```bash
# Start task
archon:manage_task(action="update", task_id="...", update_fields={"status": "doing"})

# Complete for review
archon:manage_task(action="update", task_id="...", update_fields={"status": "review"})

# Final completion
archon:manage_task(action="update", task_id="...", update_fields={"status": "done"})
```

## 🏥 **Healthcare Security & Compliance Standards**

### **Regulatory Framework**
- **LGPD Compliance**: Automated patient consent management and data protection validation
- **ANVISA Class IIa**: Medical device software compliance with audit trail requirements
- **CFM Ethics**: Professional conduct validation and medical ethics compliance monitoring
- **International Standards**: HIPAA compatibility for future expansion

### **Security Implementation**
- **Encryption**: AES-256-GCM for all PHI (Protected Health Information)
- **Authentication**: Multi-factor authentication mandatory for healthcare access
- **Audit Trail**: Immutable logging for all patient data operations with blockchain verification
- **Row Level Security**: Constitutional RLS patterns with real-time compliance validation

## ⚡ **Ultracite Code Quality Standards**

### **30-Second Reality Check - Must answer YES to ALL:**
- [ ] Did I run/build the code?
- [ ] Did I trigger the exact feature I changed?
- [ ] Did I see the expected result with my own observations?
- [ ] Did I test edge cases?
- [ ] Did I check for error messages?
- [ ] Did I verify no new warnings or errors appeared?
- [ ] Did I check performance impact?
- [ ] Did I validate accessibility requirements?
- [ ] Did I review the code for style and consistency?
- [ ] Did I ensure no security vulnerabilities were introduced?

### **Essential Rules**

#### **Accessibility (WCAG 2.1 AA+)**
- Proper ARIA labels and roles for all interactive elements
- Semantic HTML structure over div-heavy layouts
- Keyboard navigation support for all interactions
- Sufficient color contrast ratios (4.5:1 minimum)
- Screen reader compatibility with meaningful alt text
- Form labels properly associated with inputs
- Focus management for dynamic content

#### **TypeScript Excellence**
- Strict type checking without `any` usage
- Proper error boundaries and exception handling
- `import type` for type-only imports
- `as const` assertions for literal types
- Consistent array syntax (`T[]` or `Array<T>`)
- Explicit enum member values
- No non-null assertions (`!`) or unsafe operations

#### **React/JSX Best Practices**
- Hooks called only at component top level
- Proper dependency arrays in useEffect
- Unique keys for iterated elements (not array indices)
- Fragment syntax (`<>`) over `React.Fragment`
- No component definitions inside other components
- Proper prop types and validation

#### **Security & Correctness**
- Input validation and sanitization
- No hardcoded sensitive data
- Secure communication protocols
- Proper error handling with meaningful messages
- No usage of `eval()`, `document.cookie`, or unsafe patterns
- Prevent XSS through proper escaping

### **Common Ultracite Commands**
```bash
npx ultracite init      # Initialize in project
npx ultracite format    # Format and fix code
npx ultracite lint      # Check without fixing
```

## 🔧 **Performance & Quality Requirements**

### **Healthcare Performance Targets**
- **Emergency Response**: <200ms for critical patient data access
- **Healthcare Operations**: <2s response time guarantee for all medical workflows
- **Compliance Validation**: Real-time LGPD/ANVISA checking with automatic remediation
- **AI Response Times**: <500ms for healthcare AI interactions with streaming optimization

### **Quality Gates & Standards**
- **Progressive Quality**: L1-L10 standards with healthcare domain overrides
- **Test Coverage**: ≥95% for healthcare features with compliance scenario testing
- **Accessibility**: WCAG 2.1 AA+ compliance for medical accessibility requirements
- **Security Validation**: Zero high/critical vulnerabilities with continuous monitoring

## 🎯 **AI Integration & Automation**

### **AI-Powered Healthcare Features**
- **Privacy-First AI**: PHI sanitization before AI processing with compliance validation
- **Medical Context**: Healthcare-specific AI prompts and validation patterns
- **Compliance Automation**: AI-powered LGPD/ANVISA/CFM adherence monitoring
- **Streaming Optimization**: Real-time AI responses with healthcare workflow integration

### **Constitutional AI Patterns**
- **Multi-Perspective Analysis**: Technical + Security + User + Future + Ethics viewpoints
- **Progressive Quality Gates**: L1-L10 standards with healthcare domain overrides (≥9.9/10)
- **Cognitive Enhancement**: Automatic thinking escalation for healthcare and compliance contexts
- **Agent Coordination**: Specialized agent matrix with healthcare expertise and compliance focus

## 📊 **Sentry Integration & Monitoring**

### **Exception Handling**
```javascript
// Use Sentry.captureException(error) in try/catch blocks
import * as Sentry from "@sentry/nextjs";

try {
  // healthcare operation
} catch (error) {
  Sentry.captureException(error);
}
```

### **Performance Tracing**
```javascript
// Custom span instrumentation for healthcare operations
function HealthcareComponent() {
  const handlePatientAccess = () => {
    Sentry.startSpan({
      op: "healthcare.patient.access",
      name: "Patient Data Access",
    }, (span) => {
      span.setAttribute("compliance", "LGPD");
      span.setAttribute("access_type", "emergency");
      // healthcare operation
    });
  };
}
```

### **Structured Logging**
```javascript
const { logger } = Sentry;

logger.info("Patient accessed", { patientId: 123, professionalId: 456 });
logger.warn("LGPD consent expiring", { patientId: 123, expiresIn: "7days" });
logger.error("ANVISA compliance violation", { violation: "missing_audit_trail" });
```

## 🛠️ **Development Tools & Patterns**

### **Mandatory Tools**
- **Task Management**: Archon MCP server (primary system)
- **File Operations**: Desktop Commander (100% mandatory usage)
- **Research Chain**: Context7 → Tavily → Exa (progressive intelligence)
- **AI Integration**: Vercel AI SDK 5.0 with constitutional patterns
- **Compliance**: Automated LGPD/ANVISA/CFM validation tools

### **Code Quality Enforcement**
- **TypeScript**: Strict mode with healthcare data structures
- **Testing**: Vitest + Playwright with healthcare scenario coverage
- **Linting**: Constitutional linting rules with healthcare compliance checks
- **Architecture**: Constitutional service patterns with self-governance

## 📚 **Daily Development Routine**

### **Start of Coding Session**
1. Check available sources: `archon:get_available_sources()`
2. Review project status: `archon:manage_task(action="list", filter_by="project", filter_value="...")`
3. Identify next priority task: Find highest `task_order` in "todo" status
4. Conduct task-specific research
5. Begin implementation

### **End of Coding Session**
1. Update completed tasks to "done" status
2. Update in-progress tasks with current status
3. Create new tasks if scope becomes clearer
4. Document any architectural decisions or important findings

### **Task Completion Criteria**
**Every task must meet these criteria before marking "done":**
- [ ] Implementation follows researched best practices
- [ ] Code follows project style guidelines
- [ ] Security considerations addressed
- [ ] Basic functionality tested
- [ ] Documentation updated if needed
- [ ] All tests pass without errors

## 🚀 **Quick Reference Commands**

### **Development Workflow**
```bash
# Archon task management
archon:manage_task(action="list", filter_by="status", filter_value="todo")
archon:perform_rag_query(query="healthcare implementation patterns")

# Quality validation
pnpm ci:check          # Complete code validation
pnpm compliance:lgpd   # LGPD compliance validation
pnpm test:healthcare   # Healthcare scenario testing
```

### **Healthcare Compliance**
```bash
# Compliance validation
pnpm compliance:validate     # Validate healthcare compliance
pnpm audit:trail            # Generate audit trail reports
pnpm lgpd:check            # LGPD compliance validation
pnpm anvisa:validate       # ANVISA compliance validation
```

### **Code Quality**
```bash
# Ultracite quality checks
npx ultracite format    # Format and fix code
npx ultracite lint      # Check for issues
pnpm format:check      # Check formatting
pnpm type-check        # TypeScript validation
```

## 🧠 **Anti-Context Drift Integration**

### **Consistency Protocols**
- **Session Management**: Maintain ≥9.8/10 quality standards throughout session
- **Constitutional Relevance**: Score interactions for constitutional adherence (0-10)
- **Think-First Enforcement**: Mandatory sequential-thinking for complexity ≥3
- **Research Continuity**: Reference previous MCP research with constitutional context

### **Recovery Mechanisms**
- **Drift Detection**: Auto-detect when constitutional relevance drops below 8/10
- **Context Refresh**: Automatic refresh with constitutional principle clarification
- **Think-First Reset**: Return to sequential-thinking analysis when complexity increases
- **Quality Escalation**: Increase quality thresholds if standards drop

---

> **🏥 Constitutional Healthcare Document**: This comprehensive document provides NeonPro-specific rules that complement the universal framework in [`core-workflow.md`](core-workflow.md) and complete architecture in [`docs/architecture/`](../docs/architecture/). Maintains ≥9.8/10 quality standards with healthcare compliance validation and detailed implementation guidance.
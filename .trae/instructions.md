# 🚀 NeonPro AI Healthcare Platform - Trae Instructions

**Configuration for Trae AI assistant on NeonPro project.**

## 📋 **Essential References**

**Primary Workflow**: [`core-workflow.md`](../.ruler/core-workflow.md)

**NeonPro Rules**: [`.ruler/neonpro.md`](.ruler/neonpro.md) - Complete project-specific configuration

**Architecture & Standards**:

- **🏗️ Architecture**: [`docs/architecture/`](docs/architecture/) - All technical decisions and system design
- **⚙️ Tech Stack**: [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md) - AI-First Stack: Next.js 15, React 19, Vercel AI SDK 5.0, Hono.dev 4.x
- **📁 Source Tree**: [`docs/architecture/source-tree.md`](docs/architecture/source-tree.md) - 32 AI-optimized packages with constitutional governance
- **🎨 Coding Standards**: [`docs/architecture/coding-standards.md`](docs/architecture/coding-standards.md) - Healthcare compliance built-in patterns

## 🎯 **NeonPro Core Principles**

### **Technology & Development**

- **PNPM over NPM**: Use PNPM for all dependency management
- **ARCHON-FIRST RULE**: Always use Archon MCP server for task management and knowledge management
- **Architecture Consistency**: Always follow technologies and structures defined in `docs/architecture/`
- **Quality Standard**: Maintain ≥9.8/10 code quality standards with healthcare compliance
- **AI-First Development**: Native AI integration across all layers

### **Healthcare Compliance**

- **LGPD Compliance**: Automated patient consent management and data protection validation
- **ANVISA Class IIa**: Medical device software compliance with audit trail requirements
- **CFM Ethics**: Professional conduct validation and medical ethics compliance monitoring

## 🤖 **Trae-Specific Guidelines**

### **Code Generation & Patterns**

- Follow established patterns in codebase
- Use TypeScript strict mode with healthcare data structures
- Implement React 19 Server Components + AI streaming patterns
- Maintain ≥95% test coverage for healthcare features

### **Performance Targets**

- Emergency Response: <200ms for critical patient data access
- Healthcare Operations: <2s response time guarantee
- AI Response Times: <500ms for healthcare AI interactions

### **Quality Standards**

- **30-Second Reality Check**: Always verify implementation works as expected
- **Accessibility**: WCAG 2.1 AA+ compliance for medical accessibility
- **Security**: Zero high/critical vulnerabilities with continuous monitoring
- **Progressive Quality**: L1-L10 standards with healthcare domain overrides

## 🛠️ **Development Tools**

### **Mandatory Tools**

- **Task Management**: Archon MCP server (primary system)
- **File Operations**: Desktop Commander (100% mandatory usage)
- **Research Chain**: Context7 → Tavily → Exa (progressive intelligence)
- **AI Integration**: Vercel AI SDK 5.0 with constitutional patterns

### **Quick Commands**

```bash
# Quality validation
pnpm ci:check          # Complete code validation
pnpm compliance:lgpd   # LGPD compliance validation
pnpm test:healthcare   # Healthcare scenario testing

# Code quality
npx ultracite format   # Format and fix code
pnpm type-check        # TypeScript validation
```

## 🧠 **Archon Integration Workflow**

**MANDATORY: Always complete the full Archon task cycle before coding:**

1. **Check Current Task** → `archon:manage_task(action="get", task_id="...")`
2. **Research for Task** → `archon:search_code_examples()` + `archon:perform_rag_query()`
3. **Implement the Task** → Write code based on research
4. **Update Task Status** → `archon:manage_task(action="update", task_id="...", update_fields={"status": "review"})`
5. **Get Next Task** → `archon:manage_task(action="list", filter_by="status", filter_value="todo")`

## 📊 **Quality Gates**

### **Task Completion Criteria**

Every task must meet these criteria before marking "done":

- [ ] Implementation follows researched best practices
- [ ] Code follows project style guidelines
- [ ] Security considerations addressed
- [ ] Basic functionality tested
- [ ] Documentation updated if needed
- [ ] All tests pass without errors

---

> **🏥 Constitutional Healthcare Document**: For complete implementation details, workflows, and standards, see the referenced documentation above. This ensures consistency and prevents duplication across the project.

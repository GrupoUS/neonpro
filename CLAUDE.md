

<!-- Source: .ruler/AGENTS.md -->

# AI Agents Configuration

**Centralized AI agent instructions with redirection to authoritative sources.**

## 🎯 **Primary Reference**

**For complete workflow and guidelines**: See [`core-workflow.md`](../../.claude/workflows/core-workflow.md)

## 🤖 **Agent-Specific Configurations**

Choose your AI assistant configuration:

- **Claude (Anthropic)**: [`agents/claude-config.md`](agents/claude-config.md)
- **GitHub Copilot**: [`agents/copilot-config.md`](agents/copilot-config.md)  
- **Cursor/Windsurf**: [`agents/cursor-windsurf-config.md`](agents/cursor-windsurf-config.md)

## 📚 **Essential References**

Instead of duplicating content, refer to these authoritative sources:

- **🌟 Complete Workflow**: [`core-workflow.md`](../../.claude/workflows/core-workflow.md)
- **🏗️ Architecture**: [`docs/architecture/`](../../docs/architecture/)
- **⚙️ Tech Stack**: [`docs/architecture/tech-stack.md`](../../docs/architecture/tech-stack.md)
- **📁 Source Structure**: [`docs/architecture/source-tree.md`](../../docs/architecture/source-tree.md)
- **🎨 Coding Standards**: [`docs/architecture/coding-standards.md`](../../docs/architecture/coding-standards.md)

---

> **📝 Note**: This file provides minimal configuration. All detailed rules, workflows, and standards are maintained in the referenced documentation to avoid duplication and ensure consistency.



<!-- Source: .ruler/agents/claude-config.md -->

# Claude Configuration

**Configuration for Claude AI assistant on NeonPro project.**

## 📋 **Essential References**

**Primary Workflow**: [`core-workflow.md`](../../../.claude/workflows/core-workflow.md)

**Architecture & Standards**:
- Tech Stack: [`docs/architecture/tech-stack.md`](../../../docs/architecture/tech-stack.md)
- Source Tree: [`docs/architecture/source-tree.md`](../../../docs/architecture/source-tree.md)  
- Coding Standards: [`docs/architecture/coding-standards.md`](../../../docs/architecture/coding-standards.md)

## 🤖 **Claude-Specific Setup**

- **Constitutional AI**: Use ethical reasoning and multi-perspective analysis
- **Thinking Framework**: Apply sequential thinking for complex problems
- **Archon Integration**: Always use Archon MCP for task management
- **Healthcare Focus**: Follow LGPD/ANVISA/CFM compliance requirements

## 🎯 **Key Principles**

- **Quality**: Maintain ≥9.8/10 code quality standards
- **Architecture**: Follow constitutional service patterns  
- **AI-First**: Integrate AI capabilities natively
- **Compliance**: Ensure healthcare regulatory adherence

---

> See [`core-workflow.md`](../../../.claude/workflows/core-workflow.md) for complete implementation details.



<!-- Source: .ruler/agents/copilot-config.md -->

# GitHub Copilot Configuration

**Configuration for GitHub Copilot on NeonPro project.**

## 📋 **Essential References**

**Primary Workflow**: [`core-workflow.md`](../../../.claude/workflows/core-workflow.md)

**Architecture & Standards**:
- Tech Stack: [`docs/architecture/tech-stack.md`](../../../docs/architecture/tech-stack.md)
- Source Tree: [`docs/architecture/source-tree.md`](../../../docs/architecture/source-tree.md)
- Coding Standards: [`docs/architecture/coding-standards.md`](../../../docs/architecture/coding-standards.md)

## ⚡ **Copilot-Specific Setup**

- **Code Completion**: Follow established patterns in codebase
- **TypeScript**: Strict type safety with healthcare data structures
- **React/Next.js**: Server Components + AI streaming patterns
- **Testing**: Maintain ≥95% test coverage for healthcare features

## 🎯 **Key Focus Areas**

- **Performance**: Sub-2s response times for healthcare operations
- **Security**: LGPD/ANVISA compliance in all suggestions
- **AI Integration**: Vercel AI SDK patterns for streaming
- **Quality**: Follow constitutional service patterns

---

> See [`core-workflow.md`](../../../.claude/workflows/core-workflow.md) for complete implementation details.



<!-- Source: .ruler/architecture-reference.md -->

# 🏗️ Architecture Reference

**For complete architecture documentation, see:**

## 📁 Project Structure
- **Source Tree**: [`docs/architecture/source-tree.md`](../docs/architecture/source-tree.md)
- **Package Organization**: 32 AI-optimized packages with constitutional governance

## ⚙️ Technology Stack  
- **Tech Stack Details**: [`docs/architecture/tech-stack.md`](../docs/architecture/tech-stack.md)
- **AI-First Stack**: Next.js 15, React 19, Vercel AI SDK 5.0, Hono.dev 4.x

## 🎨 Coding Standards
- **Complete Standards**: [`docs/architecture/coding-standards.md`](../docs/architecture/coding-standards.md)
- **Healthcare Compliance**: LGPD/ANVISA/CFM built-in patterns

---

> 📝 **Note**: This file provides quick references. All detailed architecture documentation lives in `docs/architecture/` to ensure consistency and avoid duplication.



<!-- Source: .ruler/healthcare-compliance.md -->

# 🏥 Healthcare Compliance Reference

**For healthcare-specific guidelines, see:**

## 🛡️ Regulatory Compliance
- **LGPD**: Patient data protection by design
- **ANVISA**: Medical device regulatory framework (Class IIa)
- **CFM**: Medical ethics and professional responsibility
- **Complete Details**: [`docs/architecture/coding-standards.md`](../docs/architecture/coding-standards.md)

## 🔒 Security Patterns
- **AES-256-GCM**: Encryption for PHI (Protected Health Information)
- **Multi-Factor Authentication**: Required for healthcare access
- **Audit Trail**: Immutable logging for all patient data operations
- **Row Level Security**: Constitutional RLS patterns

## ⚡ Performance Requirements
- **Emergency Response**: <200ms for critical patient data
- **Healthcare Operations**: <2s response time guarantee
- **Compliance Validation**: Real-time LGPD/ANVISA checking

## 🤖 AI Healthcare Integration
- **Privacy-First**: PHI sanitization before AI processing
- **Medical Context**: Healthcare-specific AI prompts and validation
- **Compliance Automation**: AI-powered regulatory adherence

---

> 📝 **Note**: This file provides healthcare overview. Complete compliance details in [`docs/architecture/coding-standards.md`](../docs/architecture/coding-standards.md)



<!-- Source: .ruler/README.md -->

# 🎯 NeonPro AI Assistant Rules

**Lightweight configuration system that redirects to authoritative project documentation.**

## 📖 Quick Reference

This `.ruler` folder provides simple configuration for AI assistants working on NeonPro. Instead of duplicating rules, we redirect to the authoritative sources:

### 🔗 **Primary References**

- **🌟 MAIN WORKFLOW**: See [`core-workflow.md`](../.claude/workflows/core-workflow.md) for complete execution framework
- **🏗️ ARCHITECTURE**: See [`docs/architecture/`](../docs/architecture/) for all technical decisions
- **⚙️ TECH STACK**: See [`docs/architecture/tech-stack.md`](../docs/architecture/tech-stack.md)
- **📁 PROJECT STRUCTURE**: See [`docs/architecture/source-tree.md`](../docs/architecture/source-tree.md)  
- **🎨 CODING STANDARDS**: See [`docs/architecture/coding-standards.md`](../docs/architecture/coding-standards.md)

### 🤖 **AI Assistant Setup**

Configure your AI assistant by reading the appropriate file:
- **Claude**: [`agents/claude-config.md`](agents/claude-config.md)
- **Copilot**: [`agents/copilot-config.md`](agents/copilot-config.md)
- **Cursor/Windsurf**: [`agents/cursor-windsurf-config.md`](agents/cursor-windsurf-config.md)

## 📋 **Quick Commands**

```bash
# Follow the main workflow
See: .claude/workflows/core-workflow.md

# Check architecture decisions  
See: docs/architecture/

# Review coding standards
See: docs/architecture/coding-standards.md

# Understand tech stack
See: docs/architecture/tech-stack.md
```

## 🎯 **Core Principles**

**ARCHON-FIRST**: Always use Archon MCP for task management and knowledge base  
**SIMPLICITY**: Follow existing docs rather than creating new rules  
**REDIRECTION**: Point to authoritative sources, avoid duplication  

---

> **📝 Note**: This ruler configuration is intentionally minimal. All detailed guidance lives in the authoritative documentation referenced above. This prevents duplication and ensures consistency across the project.



<!-- Source: .ruler/workflow-reference.md -->

# 🌟 Workflow Reference

**For complete workflow execution, see:**

## 🔄 Master Workflow
- **Complete Framework**: [`core-workflow.md`](../.claude/workflows/core-workflow.md)
- **VIBECODER Integration**: Think → Research → Decompose → Plan → Implement → Validate

## 🎯 Core Principles
- **ARCHON-FIRST**: Always use Archon MCP for task management
- **Constitutional Thinking**: Multi-perspective analysis (Technical, Security, User, Future, Ethics)
- **AI-First Development**: Native AI integration across all layers
- **Progressive Quality**: L1-L10 standards with domain-specific overrides

## 📋 Execution Phases
1. **Discovery & Analysis** - Sequential thinking + complexity assessment
2. **Research First** - Archon → Context7 → Tavily → Exa chain
3. **Planning & Design** - Constitutional service patterns
4. **Implementation** - Agent coordination + streaming optimization
5. **Quality Validation** - ≥9.8/10 standards + compliance verification

---

> 📝 **Note**: This file provides workflow overview. Complete orchestration details in [`core-workflow.md`](../.claude/workflows/core-workflow.md)

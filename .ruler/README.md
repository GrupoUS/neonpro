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
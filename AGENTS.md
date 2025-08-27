<!-- Source: AGENTS.md -->

## 🤖 **Agent Configuration**

- **ALWAYS READ AND LOAD**: [`agents/apex-dev.md`](../.ruler/agents/apex-dev.md)

## 📚 **Essential References**

Instead of duplicating content, refer to these authoritative sources:

- **🌟 Complete Workflow**: [`core-workflow.md`](../.ruler/core-workflow.md)
- **🚀 NeonPro Rules**: [`neonpro.md`](../.ruler/neonpro.md) - Complete project-specific configuration
- **⚙️ Tech Stack**: [`docs/architecture/tech-stack.md`](../docs/architecture/tech-stack.md)
- **📁 Source Structure**: [`docs/architecture/source-tree.md`](../docs/architecture/source-tree.md)
- **🎨 Coding Standards**: [`docs/architecture/coding-standards.md`](../docs/architecture/coding-standards.md)

---

> **📝 Note**: This file provides minimal configuration. All detailed rules, workflows, and standards are maintained in the referenced documentation to avoid duplication and ensure consistency.

<!-- Source: .ruler/AGENTS.md -->

# AI Agents Configuration

**Centralized AI agent instructions with redirection to authoritative sources.**

## 🎯 **Primary Reference**

**For complete workflow and guidelines**: See [`core-workflow.md`](core-workflow.md)

## 🎯 MASTER ORCHESTRATION ENGINE

### **Intelligent Agent Delegation System**

```markdown
# OPTIMIZED: Only APEX Healthcare Agents

default_agents = ["apex-dev"]

[agents.apex-dev]
enabled = true
output_path = ".claude/agents/apex-dev.md"
source_path = ".ruler/agents/apex-dev.md"
description = "Always Active - Coding, implementation, debugging"

[agents.apex-researcher]
enabled = true
output_path = ".claude/agents/apex-researcher.md"
source_path = ".ruler/agents/apex-researcher.md"
description = "On-Demand - Investigation, analysis, documentation"

[agents.apex-ui-ux-designer]
enabled = true
output_path = ".claude/agents/apex-ui-ux-designer.md"
source_path = ".ruler/agents/apex-ui-ux-designer.md"
description = "On-Demand - Design, components, user experience"
```

### **Usage Commands**

```bash
# Generate base coordinator (apex-dev always active)
ruler

# Activate researcher for planning/analysis tasks
ruler --agents apex-dev,apex-researcher

# Activate UI/UX designer for interface work
ruler --agents apex-dev,apex-ui-ux-designer

# Full healthcare team activation
ruler --agents apex-dev,apex-researcher,apex-ui-ux-designer
```

## 📚 **Essential References**

Instead of duplicating content, refer to these authoritative sources:

- **⚙️ Tech Stack**: [`docs/architecture/tech-stack.md`](../../docs/architecture/tech-stack.md)
- **📁 Source Structure**: [`docs/architecture/source-tree.md`](../../docs/architecture/source-tree.md)
- **🎨 Coding Standards**: [`docs/architecture/coding-standards.md`](../../docs/architecture/coding-standards.md)

---

> **📝 Note**: This file provides minimal configuration. All detailed rules, workflows, and standards are maintained in the referenced documentation to avoid duplication and ensure consistency.

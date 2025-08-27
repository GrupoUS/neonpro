# 🤖 NeonPro AI Healthcare Platform - APEX Agents

## 📋 Agent Orchestration Overview - OPTIMIZED STRATEGY

This directory contains **specialized APEX healthcare agents** for the NeonPro AI Healthcare Platform, designed to work with [Ruler](https://github.com/intellectronica/ruler) for intelligent agent orchestration.

> **🎯 OPTIMIZATION**: GitHub Copilot automatically loads `claude`, `copilot`, and `trae` configurations. This setup focuses only on **specialized healthcare agents** with contextual loading.

## 🤖 APEX Healthcare Agent Strategy

### **🔄 Intelligent Loading Pattern**

**Always Active** (Base Coordinator):
- **💻 apex-dev** - Full-stack healthcare development and coordination

**On-Demand Activation**:
- **🔬 apex-researcher** - Multi-source research when planning/analyzing
- **🎨 apex-ui-ux-designer** - UI/UX expertise when creating interfaces

### **🎯 Agent Specialization Matrix**

#### **💻 apex-dev.md** - Base Coordinator (Always Active)
```yaml
role: "Full-Stack Healthcare Development + Agent Coordination"
always_active: true
capabilities:
  - Next.js 15 + React 19 + TypeScript development
  - Healthcare compliance (LGPD/ANVISA/CFM) built-in
  - Constitutional principles (KISS/YAGNI/CoT) enforcement
  - Agent coordination and workflow orchestration
  - Production deployment and quality gates
```

#### **🔬 apex-researcher.md** - Research Intelligence (On-Demand)
```yaml
role: "Multi-Source Research and Healthcare Compliance"
activation_triggers: ["research", "analyze", "investigate", "pesquisar", "analisar", "planejar"]
capabilities:
  - Context7 → Tavily → Exa intelligence chain
  - Healthcare documentation and regulatory research
  - LGPD/ANVISA/CFM compliance validation
  - Medical best practices and technology evaluation
  - Evidence-based implementation guidance
```

#### **🎨 apex-ui-ux-designer.md** - Design Excellence (On-Demand)
```yaml
role: "Healthcare UI/UX with Constitutional Accessibility"
activation_triggers: ["design", "ui", "ux", "interface", "página", "componente", "acessibilidade"]
capabilities:
  - WCAG 2.1 AA+ accessibility compliance
  - shadcn/ui v4 healthcare optimization
  - Patient-centered design patterns
  - Emergency scenario interface design
  - Mobile-first responsive healthcare interfaces
```

## 🛠️ Ruler Integration - Optimized Configuration

### **ruler.toml Configuration**
```toml
# OPTIMIZED: Only APEX Healthcare Agents
# GitHub Copilot handles claude/copilot/trae automatically
default_agents = ["apex-dev"]

[agents.apex-dev]
enabled = true
output_path = ".claude/agents/apex-dev.md"
source_path = ".ruler/agents/apex-dev.md"
description = "Always Active - Base Healthcare Development Coordinator"

[agents.apex-researcher]
enabled = true
output_path = ".claude/agents/apex-researcher.md"
source_path = ".ruler/agents/apex-researcher.md"
description = "On-Demand - Research and Compliance Intelligence"

[agents.apex-ui-ux-designer]
enabled = true
output_path = ".claude/agents/apex-ui-ux-designer.md"
source_path = ".ruler/agents/apex-ui-ux-designer.md"
description = "On-Demand - Healthcare Interface Design Excellence"
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

## 🏥 Healthcare Workflow Orchestration

### **🔄 Contextual Agent Activation**

#### **Research & Planning Phase**
```bash
# Triggers: research, analyze, investigate, pesquisar, analisar, planejar
ruler --agents apex-dev,apex-researcher
```
- **apex-dev**: Coordinates research with development context
- **apex-researcher**: Multi-source intelligence (Context7 → Tavily → Exa)
- **Focus**: Compliance validation, best practices, evidence-based decisions

#### **UI/UX Development Phase**
```bash
# Triggers: design, ui, ux, interface, página, componente, acessibilidade
ruler --agents apex-dev,apex-ui-ux-designer
```
- **apex-dev**: Provides technical implementation context
- **apex-ui-ux-designer**: Healthcare accessibility and design expertise
- **Focus**: WCAG 2.1 AA+, patient-centered design, emergency scenarios

#### **Core Development Phase**
```bash
# Default: apex-dev always active
ruler
```
- **apex-dev**: Full-stack healthcare development
- **Focus**: Constitutional principles, compliance, quality gates

### **🧠 Constitutional Principles Integration**

All APEX agents follow **VIBECODER Constitutional Principles**:

```yaml
CONSTITUTIONAL_FRAMEWORK:
  KISS_PRINCIPLE: "Keep It Simple, Stupid - Healthcare clarity over complexity"
  YAGNI_PRINCIPLE: "You Aren't Gonna Need It - Build for current medical requirements"
  CHAIN_OF_THOUGHT: "Explicit healthcare reasoning for patient safety"
  HEALTHCARE_COMPLIANCE: "LGPD/ANVISA/CFM built into every decision"
  ACCESSIBILITY_FIRST: "WCAG 2.1 AA+ mandatory for all interfaces"
```

## 📚 Benefits of Optimized Strategy

### **🚀 Performance Improvements**
- **Reduced Overhead**: Eliminates redundant configurations
- **Contextual Loading**: Specialists activate only when needed
- **Intelligent Coordination**: apex-dev orchestrates team efficiently

### **🎯 Focus Enhancement**
- **Healthcare Specialization**: All agents optimize for medical workflows
- **Constitutional Principles**: Consistent quality and compliance
- **On-Demand Expertise**: Right specialist for the right task

### **🔧 Maintenance Simplification**
- **Single Source**: Only APEX agents in Ruler configuration
- **Auto-Loading**: Copilot and Claude code handles its own configurations
- **Clear Separation**: Healthcare vs general development concerns

## 📚 References

- **🌟 Complete Workflow**: [`core-workflow.md`](core-workflow.md)
- **⚙️ Tech Stack**: [`docs/architecture/tech-stack.md`](../../docs/architecture/tech-stack.md)
- **📁 Source Structure**: [`docs/architecture/source-tree.md`](../../docs/architecture/source-tree.md)
- **🎨 Coding Standards**: [`docs/architecture/coding-standards.md`](../../docs/architecture/coding-standards.md)
- **Ruler Documentation**: https://ai.intellectronica.net/ruler

---

> **🏥 Constitutional Healthcare Excellence**: Optimized APEX agent orchestration for NeonPro AI Healthcare Platform with intelligent contextual loading, constitutional development principles, and healthcare compliance validation.

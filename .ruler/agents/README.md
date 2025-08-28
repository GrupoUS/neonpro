# 🤖 NeonPro APEX Agents

## 📋 Agent Orchestration

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
  - Evidence-based implementation guidance
```

#### **🎨 apex-ui-ux-designer.md** - Design Excellence (On-Demand)
```yaml
role: "Healthcare UI/UX with Constitutional Accessibility"
activation_triggers: ["design", "ui", "ux", "interface", "página", "componente", "acessibilidade"]
capabilities:
  - WCAG 2.1 AA+ accessibility compliance
  - shadcn/ui v4 healthcare optimization
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

## 🏥 Workflow Orchestration

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

- **🌟 ALWAYS READ AND LOAD THE Complete Workflow**: [`.ruler/dev-workflow.md`](.ruler/dev-workflow.md)
- **⚙️ Always READ AND Follow Project Standards**: [`docs/project.md`](docs/project.md)

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

---

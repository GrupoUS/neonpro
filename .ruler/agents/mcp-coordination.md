# 🔧 MCP COORDINATION & TOOL SELECTION - Version: 1.0.0

## Purpose & Scope

This document defines the comprehensive framework for coordinating Model Context Protocol (MCP) servers in AI-assisted development workflows. It establishes mandatory usage patterns, selection criteria, coordination workflows, and error recovery protocols for optimal development efficiency and quality.

## 🎯 MCP Capabilities Matrix

| MCP Server | Core Functions | Primary Use Cases | Mandatory/Contextual |
|------------|----------------|-------------------|---------------------|
| **🧠 sequential-thinking** | Complex problem decomposition, systematic analysis, branching logic | Breaking down complex problems, decision making, systematic reasoning | **MANDATORY FIRST STEP** |
| **📋 archon** | Task management, project organization, knowledge base, RAG queries | Project coordination, task tracking, knowledge management | **MANDATORY for task management** |
| **🔍 serena** | Codebase search, semantic analysis, symbol navigation, refactoring | Code understanding, symbol analysis, codebase navigation | **MANDATORY for codebase operations** |
| **💻 desktop-commander** | File operations, system management, data analysis, process execution | File system operations, data analysis, scaffolding, system commands | **Contextual - file operations** |
| **📚 context7** | Documentation research, framework lookup, library resolution | Framework research, best practices validation, official documentation | **Contextual - research phase** |
| **🌐 tavily** | Real-time web search, current information, trend analysis | Current trends, technology updates, real-time information | **Contextual - current info needed** |
| **🎨 shadcn-ui** | UI component management, design system integration | UI development, component library management | **Contextual - UI work** |

## Implementation Guidelines

### **MANDATORY MCP Workflow**

```yaml
MANDATORY_SEQUENCE:
  step_1: "sequential-thinking (ALWAYS FIRST - problem decomposition)"
  step_2: "archon (task management and knowledge base)"
  step_3: "serena (codebase analysis - NEVER use native search)"

CONSTITUTIONAL_RULE: "Never skip mandatory MCPs or use native alternatives"
QUALITY_GATE: "Each mandatory MCP must complete successfully before proceeding"
```

### **MCP Selection Decision Tree**

```yaml
DECISION_MATRIX:
  problem_analysis:
    complexity_level_1-3: "sequential-thinking only"
    complexity_level_4-6: "sequential-thinking → archon → serena"
    complexity_level_7-10: "sequential-thinking → archon → context7 → serena"

  task_type:
    research_heavy: "sequential-thinking → archon → context7 → tavily"
    implementation_focused: "sequential-thinking → archon → serena → desktop-commander"
    ui_development: "sequential-thinking → archon → serena → shadcn-ui → desktop-commander"
    data_analysis: "sequential-thinking → desktop-commander (with Python/analysis tools)"

  information_needs:
    framework_documentation: "context7 (resolve-library-id → get-library-docs)"
    current_trends: "tavily (search → searchContext → extract)"
    codebase_understanding: "serena (get_symbols_overview → find_symbol → find_referencing_symbols)"
    project_context: "archon (perform_rag_query → get_project → list_tasks)"
```

### **🔗 MCP Coordination Workflows**

#### **🔬 Research-Driven Development Chain**
```yaml
sequence: "sequential-thinking → archon → context7 → tavily → serena → desktop-commander"
purpose: "Evidence-based implementation with multi-source validation"
use_cases: ["New framework integration", "Complex feature development", "Architecture decisions"]
quality_gate: "≥95% research confidence before implementation"
```

#### **⚡ Rapid Implementation Chain**
```yaml
sequence: "sequential-thinking → archon → serena → desktop-commander"
purpose: "Fast implementation of well-understood requirements"
use_cases: ["Bug fixes", "Simple features", "Code refactoring"]
quality_gate: "Clear requirements and existing patterns identified"
```

#### **🎨 UI Development Chain**
```yaml
sequence: "sequential-thinking → archon → serena → shadcn-ui → desktop-commander"
purpose: "Healthcare-optimized UI development with accessibility"
use_cases: ["Component creation", "UI refactoring", "Design system updates"]
quality_gate: "WCAG 2.1 AA+ compliance and component integration verified"
```

#### **📊 Data Analysis Chain**
```yaml
sequence: "sequential-thinking → desktop-commander (Python REPL) → archon (documentation)"
purpose: "File-based data analysis and processing"
use_cases: ["CSV analysis", "Log processing", "Performance metrics"]
quality_gate: "Analysis results validated and documented"
```

### **🚨 Error Recovery & Troubleshooting Protocols**

```yaml
RECOVERY_PROTOCOLS:
  mcp_failure:
    step_1: "Document the specific error and context"
    step_2: "Try alternative MCP if available (e.g., tavily if context7 fails)"
    step_3: "Use sequential-thinking to analyze the problem"
    step_4: "Consult archon knowledge base for similar issues"
    step_5: "If stuck >3 attempts, initiate new research cycle"

  infinite_loops:
    detection: "Same MCP called >3 times with similar parameters"
    action: "Stop current approach, use sequential-thinking to reassess"
    alternative: "Switch to different MCP or break down problem further"

  context_loss:
    prevention: "Always maintain context across MCP transitions"
    recovery: "Use archon to retrieve project context and serena for codebase state"
    validation: "Verify context completeness before proceeding"
```

## Examples

### ✅ DO: Proper MCP Coordination
```yaml
# Complex Feature Implementation
1. sequential-thinking: "Break down OAuth2 implementation requirements"
2. archon: "Check existing auth patterns and create implementation tasks"
3. context7: "Research OAuth2 best practices and security patterns"
4. serena: "Analyze current auth codebase structure"
5. desktop-commander: "Implement OAuth2 provider integration"
```

### ❌ DON'T: Improper MCP Usage
```yaml
# Wrong approach - skipping mandatory sequence
1. context7: "Research OAuth2" # Missing sequential-thinking first
2. codebase-retrieval: "Find auth files" # Should use serena instead
3. desktop-commander: "Write OAuth2 code" # Missing archon task management
```

## Edge Cases & Exceptions

- **Simple Tasks (complexity ≤3)**: May use only sequential-thinking if requirements are crystal clear
- **Emergency Fixes**: May skip archon task management for critical production issues
- **Data Analysis Only**: May use desktop-commander directly for pure data processing tasks

## Validation Criteria

- [ ] Mandatory MCP sequence followed for complex tasks (≥4 complexity)
- [ ] serena used instead of native codebase-retrieval in 100% of cases
- [ ] archon task management integrated for all project work
- [ ] Error recovery protocols applied when MCPs fail >3 times
- [ ] Context maintained across all MCP transitions

## Dependencies & Relationships

- **Requires**: Constitutional principles (KISS/YAGNI/CoT) from workflow.md
- **Enhances**: All development workflow phases
- **Conflicts**: Native tool usage (codebase-retrieval, native search)

## ✅ MCP Best Practices

### **🧠 sequential-thinking**
```yaml
DO:
  - Always use as first step for complex problems (complexity ≥4)
  - Break down problems into logical, sequential steps
  - Use branching and revision when exploring alternatives
  - Generate and validate hypotheses systematically

DON'T:
  - Skip for complex problems to save time
  - Use for simple, well-understood tasks
  - Forget to validate reasoning against requirements
```

### **📋 archon**
```yaml
DO:
  - Start with archon for all task management
  - Use perform_rag_query to leverage knowledge base
  - Update task status throughout development
  - Document decisions and learnings

DON'T:
  - Skip archon task management workflow
  - Forget to update task progress
  - Ignore existing project knowledge
```

### **🔍 serena**
```yaml
DO:
  - Use for ALL codebase operations (mandatory)
  - Start with get_symbols_overview for new files
  - Use find_symbol for specific code elements
  - Leverage semantic search capabilities

DON'T:
  - Use native codebase-retrieval tool
  - Skip symbol analysis for complex changes
  - Ignore referencing symbols when refactoring
```

### **💻 desktop-commander**
```yaml
DO:
  - Use for file operations and system management
  - Leverage Python REPL for data analysis
  - Use interactive processes for complex operations
  - Chunk file operations (25-30 lines max)

DON'T:
  - Use for codebase search (use serena instead)
  - Write large files in single operations
  - Ignore file operation errors
```

### **📚 context7**
```yaml
DO:
  - Resolve library IDs before getting documentation
  - Focus searches with specific topics
  - Cross-reference with tavily for current information
  - Validate documentation currency

DON'T:
  - Skip library ID resolution
  - Use for general web search (use tavily)
  - Assume documentation is current without validation
```

### **🌐 tavily**
```yaml
DO:
  - Use for current trends and real-time information
  - Leverage different search types (basic, context, QNA)
  - Extract content from multiple sources
  - Cross-validate information

DON'T:
  - Use for framework documentation (use context7)
  - Rely on single source for critical decisions
  - Skip information validation
```

### **🎨 shadcn-ui**
```yaml
DO:
  - Check component availability before custom development
  - Use demo code as implementation reference
  - Leverage block components for complex layouts
  - Maintain design system consistency

DON'T:
  - Reinvent existing components
  - Ignore accessibility features
  - Skip component metadata review
```

## 🔄 Integration with Workflow Phases

```yaml
PHASE_INTEGRATION:
  research_decomposition:
    primary: "sequential-thinking (mandatory)"
    support: "archon (knowledge base), context7 (documentation)"

  planning_task_list:
    primary: "archon (mandatory task management)"
    support: "serena (codebase analysis), sequential-thinking (planning)"

  implementation:
    primary: "serena (mandatory codebase), desktop-commander (file ops)"
    support: "shadcn-ui (UI components), archon (progress tracking)"

  testing_validation:
    primary: "desktop-commander (test execution)"
    support: "serena (code analysis), archon (documentation)"

  quality_checks:
    primary: "desktop-commander (linting, type checking)"
    support: "serena (code quality analysis)"

  documentation:
    primary: "desktop-commander (file creation)"
    support: "archon (knowledge management), serena (code references)"
```

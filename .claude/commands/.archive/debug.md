# /debug - Universal Debugging & Troubleshooting Command

## Command: `/debug [issue-type] [--severity=critical|high|medium|low] [--healthcare]`

### 🎯 **Purpose**
Intelligent debugging and troubleshooting system with technology stack detection, progressive diagnosis, automated resolution suggestions, and specialized healthcare safety protocols for any project type.

### 🏥 **Healthcare Integration**
**Master System Integration**: Connected to CLAUDE.md orchestrator with semantic-first development principles and healthcare compliance.

### 🧠 **Intelligence Integration**
```yaml
DEBUG_INTELLIGENCE:
  activation_triggers:
    - "/debug [issue]"
    - "troubleshoot [problem]"
    - "fix [error]"
    - "investigate [bug]"
  
  context_detection:
    error_analysis: "Stack traces, logs, error messages"
    environment: "Development, staging, production"
    technology_stack: "Auto-detect runtime, framework, database"
    severity_assessment: "Critical, High, Medium, Low impact"
    healthcare_mode: "LGPD/ANVISA/CFM compliance awareness"
```

### 🚀 **Execution Flow**

#### **Phase 1: Issue Discovery & Triage**
```yaml
DISCOVERY:
  error_collection:
    - "Gather error messages, stack traces, and logs"
    - "Identify reproduction steps and conditions"
    - "Map affected components and dependencies"
    - "Assess user impact and severity level"
    - "Check patient data integrity (healthcare mode)"
    
  environment_analysis:
    runtime: "Node.js, Python, Java, .NET, Go, Rust versions"
    dependencies: "Package versions, conflicts, security issues"
    infrastructure: "Database, cache, external services status"
    healthcare_compliance: "RLS policies, data encryption, audit trails"
    
  severity_routing:
    Critical: "Immediate response - System down, data loss, patient safety"
    High: "Urgent response - Major functionality broken"
    Medium: "Scheduled response - Minor issues, workarounds exist"
    Low: "Maintenance response - Cosmetic or edge case issues"
```

#### **Phase 2: Intelligent Diagnosis**
```yaml
DIAGNOSIS:
  pattern_recognition:
    - "Match against known error patterns and solutions"
    - "Analyze similar issues in codebase history"
    - "Cross-reference with technology documentation"
    - "Identify potential root causes and contributing factors"
    - "Healthcare-specific error patterns (multi-tenant, RLS)"
    
  multi_layer_analysis:
    application: "Business logic, data flow, state management"
    infrastructure: "Database queries, API calls, resource usage"
    environment: "Configuration, permissions, networking"
    dependencies: "Library compatibility, version conflicts"
    healthcare: "Patient data access patterns, LGPD compliance"
    
  progressive_investigation:
    L1-L3: "Basic error analysis and direct fixes"
    L4-L6: "Systematic investigation with testing"
    L7-L10: "Deep architectural analysis and comprehensive solutions"
```

#### **Phase 3: Solution Implementation**
```yaml
RESOLUTION:
  automated_fixes:
    - "Apply known fixes for common patterns"
    - "Update dependencies and configurations"
    - "Generate missing files or configurations"
    - "Apply security patches and updates"
    
  manual_guidance:
    - "Provide step-by-step resolution instructions"
    - "Suggest code changes with explanations"
    - "Recommend architectural improvements"
    - "Guide through testing and validation"
    
  quality_validation:
    - "Verify fix resolves original issue"
    - "Run regression tests to prevent new issues"
    - "Validate performance impact"
    - "Update documentation and monitoring"
    - "Healthcare: Ensure patient data safety maintained"
```

### 🔧 **Technology Stack Support**

#### **Frontend Debugging**
```yaml
REACT_DEBUGGING:
  common_issues:
    - "Component re-render loops"
    - "State management conflicts"
    - "Prop drilling and context issues"
    - "Memory leaks and performance"
  tools: "React DevTools, Profiler, Error Boundaries"
  
VUE_DEBUGGING:
  common_issues:
    - "Reactivity system problems"
    - "Computed properties and watchers"
    - "Component lifecycle issues"
  tools: "Vue DevTools, Vue Test Utils"
  
ANGULAR_DEBUGGING:
  common_issues:
    - "Change detection problems"
    - "Dependency injection errors"
    - "RxJS subscription leaks"
  tools: "Angular DevTools, Augury"
```

#### **Backend Debugging**
```yaml
NODE_DEBUGGING:
  common_issues:
    - "Memory leaks and garbage collection"
    - "Asynchronous operation failures"
    - "Database connection issues"
    - "API rate limiting and timeouts"
  tools: "Node Inspector, PM2, Clinic.js"
  
PYTHON_DEBUGGING:
  common_issues:
    - "Import and module path problems"
    - "Database ORM issues"
    - "Concurrency and threading"
    - "Package dependency conflicts"
  tools: "pdb, pytest, Django Debug Toolbar"
  
SUPABASE_DEBUGGING:
  common_issues:
    - "RLS policy conflicts"
    - "Auth token issues"
    - "Real-time subscription problems"
    - "Multi-tenant data isolation"
  healthcare_specific:
    - "Patient data access verification"
    - "LGPD compliance violations"
    - "Audit trail integrity"
```

### 🏥 **Healthcare-Specific Debugging**

#### **Immediate Healthcare Debugging Protocol**
1. **Patient Data Safety Check**: Ensure patient data integrity during debugging
2. **Recent Changes Analysis**: `git diff` to identify potential introduction points  
3. **Healthcare Safety Check**: Verify LGPD compliance maintained
4. **Minimal Reproduction**: Identify exact steps with medical context awareness
5. **Systematic Investigation**: Binary search with privacy protection protocols
6. **Targeted Resolution**: Implement fix preserving healthcare workflow integrity

#### **Healthcare Debugging Techniques**
```yaml
ERROR_ANALYSIS:
  - "Parse error messages for healthcare-specific clues"
  - "Follow stack traces with medical context awareness"
  - "Identify patterns in healthcare workflow failures"
  
HYPOTHESIS_TESTING:
  - "Form theories about healthcare data flow"
  - "Test systematically with patient data safety protocols"
  - "Validate against LGPD compliance requirements"
  
STATE_INSPECTION:
  - "Add debug logging for patient data access points"
  - "Inspect variable values with privacy protection"
  - "Monitor healthcare workflow state transitions"
  
ENVIRONMENT_VERIFICATION:
  - "Check healthcare-specific dependencies and versions"
  - "Validate Supabase configuration and RLS policies"
  - "Verify medical device API connections"
```

### 📊 **Debugging Strategies by Severity**

#### **Critical Issues (System Down/Patient Safety)**
```yaml
CRITICAL_RESPONSE:
  immediate_actions:
    - "Identify and isolate failing components"
    - "Check system resources and dependencies"
    - "Review recent deployments and changes"
    - "Implement emergency rollback if needed"
    - "Verify patient data integrity"
  
  resolution_approach:
    - "Focus on system stability first"
    - "Quick fixes to restore functionality"
    - "Comprehensive analysis post-restoration"
    - "Document incident and prevention measures"
    - "Healthcare incident reporting if applicable"
```

#### **High Priority (Major Functionality)**
```yaml
HIGH_RESPONSE:
  systematic_approach:
    - "Reproduce issue in controlled environment"
    - "Analyze logs and error patterns"
    - "Implement targeted fixes with testing"
    - "Deploy with monitoring and rollback plan"
    
  quality_standards: "≥9.5/10 - Comprehensive testing and validation"
```

### 🤝 **MCP Integration**

- **Sequential-Thinking**: Complex debugging reasoning chains and root cause analysis
- **Desktop-Commander**: File analysis and local debugging operations
- **Context7**: Validate against official documentation for known issues
- **Tavily**: Research known healthcare technology issues and solutions

### 🔍 **Usage Examples**

```bash
# Critical production issue with healthcare context
/debug database-connection --severity=critical --healthcare

# Frontend component issue
/debug react-rendering --severity=medium

# Performance investigation
/debug memory-leak --severity=high

# Healthcare compliance issue
/debug lgpd-compliance --severity=critical --healthcare

# Configuration problem
/debug environment-setup --severity=low
```

### 🎯 **Healthcare Quality & Safety Standards**

- ✅ **Patient data safety maintained throughout debugging**
- ✅ **LGPD compliance preserved in all debugging operations**
- ✅ **No sensitive information exposed in logs or outputs**
- ✅ **Healthcare workflow integrity maintained**
- ✅ **Performance standards preserved (<100ms patient data access)**
- ✅ **Audit trail integrity maintained**
- ✅ **Multi-tenant isolation verified**

### 📋 **Debugging Deliverables**

For each debugging session:

1. **Root Cause**: Clear explanation with healthcare context (if applicable)
2. **Evidence**: Specific code/logs proving the diagnosis
3. **Fix**: Minimal changes preserving patient data integrity
4. **Verification**: Tests confirming resolution without regression
5. **Prevention**: Healthcare-specific recommendations for future avoidance
6. **Compliance Report**: LGPD/ANVISA/CFM compliance validation (healthcare mode)

### 🎯 **Success Criteria**

```yaml
COMPLETION_VALIDATION:
  issue_resolution: "Original problem completely resolved"
  stability: "No regression or new issues introduced"
  documentation: "Issue, solution, and prevention documented"
  monitoring: "Enhanced monitoring to prevent recurrence"
  knowledge_transfer: "Team educated on issue and resolution"
  healthcare_compliance: "Patient data safety and privacy maintained"
```

---

**Status**: 🟢 **Universal Debug Command** | **Tech Stack**: Auto-Detect All | **Healthcare**: ✅ LGPD/ANVISA/CFM Ready | **Response**: Critical: Immediate, High: <4hr, Medium: <24hr

**Ready for Debugging**: Healthcare-aware debugging specialist activated with comprehensive universal debugging capabilities and specialized medical compliance protocols.
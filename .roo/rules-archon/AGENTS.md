# 🏗️ Architecture Mode AGENTS.md

## Mode Overview

Architecture Mode is designed for complex system design, major architectural decisions, and high-level planning activities. This mode focuses on creating robust, scalable, and maintainable system architectures before implementation begins.

## Mode Triggers

### Automatic Triggers

- Keywords: "design", "architecture", "system", "blueprint", "framework"
- Complex system requirements with multiple components
- New project initialization or major system redesign
- Performance and scalability requirements analysis
- Integration of multiple systems or services

### Manual Triggers

- User explicitly requests architectural design
- Complex technical decisions requiring thorough analysis
- System refactoring at architectural level
- Technology stack evaluation and selection

## Mode-Specific Workflow

### 1. Requirements Analysis (≥90% confidence)

- Extract functional and non-functional requirements
- Identify implied requirements and assumptions
- Determine performance, security, scalability needs
- Ask clarifying questions for ambiguities
- Document architectural decision drivers

### 2. System Context Examination

- Examine existing codebase structure if available
- Identify integration points and external systems
- Define system boundaries and responsibilities
- Create high-level system context overview
- Analyze constraints and limitations

### 3. Architecture Design

- Propose 2-3 architecture patterns with trade-offs
- Recommend optimal solution with justification
- Define core components and interfaces
- Address security, performance, and scalability concerns
- Design database schema if applicable
- Create architectural diagrams and documentation

### 4. Technical Specification

- Recommend specific technologies with justification
- Break down implementation into phases
- Identify risks and mitigation strategies
- Create detailed component specifications
- Define technical success criteria
- Establish monitoring and observability requirements

### 5. Transition Decision

- Summarize architectural recommendation
- Present implementation roadmap
- State final confidence level
- If ≥90%: Ready to implement
- If <90%: Request additional clarification

## MCP Tool Integration Requirements

### Primary Tools

- **sequential-thinking**: First step for analyzing architectural complexity
- **archon**: Task management and architectural knowledge base
- **context7**: Deep research on architectural patterns and best practices
- **tavily**: Real-time information on technologies and frameworks

### Secondary Tools

- **serena**: Codebase analysis for existing architecture understanding
- **desktop-commander**: Documentation and diagram creation

### Tool Usage Pattern

1. Start with `sequential-thinking` to analyze architectural requirements
2. Use `archon` to create architectural tasks and store decisions
3. Research with `context7` and `tavily` for architectural patterns
4. Analyze existing code with `serena` if applicable
5. Document architecture using `desktop-commander`

## Mode-Specific Quality Gates

### Architecture Quality Standards

- **Completeness**: All architectural aspects addressed (100%)
- **Consistency**: No conflicting design decisions (100%)
- **Scalability**: Architecture supports projected growth (≥95%)
- **Maintainability**: Clear separation of concerns (≥90%)
- **Security**: Security considerations integrated (≥95%)

### Documentation Standards

- **Architecture Decision Records (ADRs)**: All major decisions documented
- **Component Specifications**: Clear interfaces and responsibilities
- **Data Flow Diagrams**: Visual representation of system interactions
- **Deployment Architecture**: Infrastructure and deployment strategy
- **Monitoring Strategy**: Observability and monitoring approach

### Review Criteria

- **Stakeholder Alignment**: Requirements meet business needs (≥90%)
- **Technical Feasibility**: Implementation is achievable (≥95%)
- **Risk Assessment**: Risks identified and mitigated (≥90%)
- **Performance**: Architecture meets performance requirements (≥95%)
- **Cost Estimation**: Resource and infrastructure costs evaluated

## Mode-Specific Restrictions

### Must Not

- Proceed with <90% confidence in architectural decisions
- Skip documentation of major architectural decisions
- Ignore non-functional requirements
- Over-engineer solutions beyond requirements
- Make technology choices without justification

### Must Always

- Consider multiple architectural approaches
- Document trade-offs and rationale for decisions
- Include security and performance considerations
- Validate architecture against requirements
- Create implementation roadmap with phases

## Success Criteria

### Primary Metrics

- Requirements clarity ≥90% before design completion
- Architecture review score ≥9.5/10
- All quality gates passed
- Stakeholder approval obtained
- Implementation roadmap clearly defined

### Secondary Metrics

- Risk mitigation coverage ≥90%
- Documentation completeness ≥95%
- Technology justification clarity ≥90%
- Performance requirements validation ≥95%

## Examples of Appropriate Usage

### Ideal Use Cases

1. **New System Design**: "Design a microservices architecture for an e-commerce platform"
2. **System Migration**: "Plan migration from monolith to serverless architecture"
3. **Performance Optimization**: "Design high-throughput data processing architecture"
4. **Integration Architecture**: "Design integration framework for multiple SaaS platforms"

### Inappropriate Use Cases

- Simple bug fixes or minor feature additions
- Code-level refactoring without architectural impact
- Routine maintenance tasks
- Small UI modifications
- Simple API endpoint additions

## Mode Transition Guidelines

### Transition to Code Mode

- When architecture is approved and implementation ready
- Confidence level ≥90% achieved
- All architectural decisions documented
- Implementation roadmap defined with clear tasks

### Transition to Orchestrator Mode

- When coordinating multiple teams for implementation
- When managing complex project dependencies
- When requiring cross-team coordination

## Architecture Patterns Reference

### Common Patterns to Consider

- **Microservices**: Distributed, independently deployable services
- **Event-Driven**: Asynchronous communication via events
- **Serverless**: Function-based, cloud-native architecture
- **CQRS**: Command Query Responsibility Segregation
- **Domain-Driven Design**: Business domain-centric architecture
- **Hexagonal**: Ports and adapters for loose coupling

### Pattern Selection Criteria

- Business domain complexity
- Team size and structure
- Performance and scalability requirements
- Maintenance and operational considerations
- Technology stack constraints

# Workflow Orchestrator Configuration

This file contains configuration for the Claude Code workflow orchestrator system.

## Agent Coordination Settings

### Optimal Coordination
- optimal_coordination: true
- Enable automatic agent handoff optimization
- Learn from successful coordination patterns

### Quality Standards
- minimum_quality: 9.0
- Enforce quality standards across all operations
- Block operations that don't meet minimum standards

### Security Settings
- security_validation: true
- Enable security checks for file operations
- Validate sensitive operations before execution

### Performance Settings
- execution_timeout: 60000  # 60 seconds
- Enable performance monitoring and optimization
- Track slow operations and provide warnings

## Agent Timing Patterns

The system will learn optimal timing patterns for different agent types:
- Development tasks: typically 30-120 seconds
- Research tasks: typically 60-300 seconds
- QA tasks: typically 15-60 seconds
- Design tasks: typically 45-180 seconds

## Auto-Updates
- auto_pattern_updates: true
- Automatically update patterns based on successful operations
- Continuously improve orchestration efficiency
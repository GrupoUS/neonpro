# TDD RED-GREEN-REFACTOR Workflow Documentation

## Overview

This document outlines the comprehensive TDD (Test-Driven Development) RED-GREEN-REFACTOR workflow with multi-agent coordination for the NEONPRO frontend testing framework.

## Workflow Philosophy

The TDD RED-GREEN-REFACTOR cycle is the foundation of quality-driven development in the NEONPRO project. This workflow ensures that:

1. **RED**: Tests are written first and fail, defining clear requirements
2. **GREEN**: Minimal code is written to make tests pass
3. **REFACTOR**: Code is improved while maintaining test coverage

## Multi-Agent Coordination

### Primary Agent: @tdd-orchestrator
**Role**: TDD workflow coordination and quality enforcement

### Supporting Agents:
- **@code-reviewer**: Security and performance validation
- **@apex-ui-ux-designer**: Accessibility and UI validation
- **@architect-review**: Architecture compliance validation

## Phase 1: RED - Write Failing Tests

### Objectives
- Define clear requirements through tests
- Ensure tests fail before implementation
- Validate test quality and coverage

### Process Flow

#### 1.1 Test Requirements Analysis
```typescript
// Example: Test requirements analysis
interface TestRequirement {
  id: string;
  description: string;
  acceptanceCriteria: string[];
  expectedBehavior: string;
  edgeCases: string[];
  priority: 'high' | 'medium' | 'low';
}
```

#### 1.2 Test Creation
```typescript
// Example: Test creation pattern
describe('ComponentName', () => {
  describe('given specific conditions', () => {
    it('should behave in expected way', () => {
      // Arrange: Setup test conditions
      const setup = createTestSetup();
      
      // Act: Execute the behavior
      const result = setup.executeAction();
      
      // Assert: Verify expected outcome
      expect(result).toEqual(expectedResult);
    });
  });
});
```

#### 1.3 Test Validation
- **Test Quality**: Tests are isolated, readable, and maintainable
- **Test Coverage**: Critical paths are covered
- **Test Failure**: Tests properly fail before implementation
- **Documentation**: Test scenarios are well documented

### Agent Coordination - RED Phase

#### @tdd-orchestrator Responsibilities:
1. **Test Design**: Create comprehensive test scenarios
2. **Test Implementation**: Write failing tests
3. **Test Validation**: Ensure tests fail properly
4. **Documentation**: Document test requirements

#### @architect-review Involvement:
1. **Architecture Compliance**: Ensure tests align with architecture patterns
2. **Design Validation**: Verify test design follows best practices
3. **Integration Review**: Validate test integration points

### Quality Gates - RED Phase
- [ ] All tests fail before implementation
- [ ] Test scenarios cover all requirements
- [ ] Tests are properly documented
- [ ] Test quality standards are met
- [ ] Architecture compliance is validated

## Phase 2: GREEN - Make Tests Pass

### Objectives
- Write minimal code to make tests pass
- Ensure all tests pass successfully
- Validate implementation correctness

### Process Flow

#### 2.1 Minimal Implementation
```typescript
// Example: Minimal implementation pattern
export class ComponentName {
  private readonly dependency: Dependency;

  constructor(dependency: Dependency) {
    this.dependency = dependency;
  }

  async executeAction(): Promise<Result> {
    // Minimal implementation to pass tests
    return this.dependency.performAction();
  }
}
```

#### 2.2 Implementation Validation
- **Test Execution**: All tests must pass
- **Code Quality**: Implementation meets quality standards
- **Performance**: No performance degradation
- **Security**: No security vulnerabilities introduced

### Agent Coordination - GREEN Phase

#### @tdd-orchestrator Responsibilities:
1. **Implementation Guidance**: Guide minimal code implementation
2. **Test Validation**: Ensure all tests pass
3. **Code Review**: Review implementation quality
4. **Documentation**: Document implementation decisions

#### @code-reviewer Responsibilities:
1. **Security Scan**: Validate no security issues introduced
2. **Performance Analysis**: Ensure no performance degradation
3. **Code Quality**: Validate code standards compliance
4. **Compliance Check**: Ensure healthcare compliance

#### @apex-ui-ux-designer Responsibilities:
1. **Accessibility Check**: Validate accessibility compliance
2. **UI Validation**: Ensure UI components work correctly
3. **Responsive Testing**: Validate responsive design
4. **Visual Testing**: Ensure visual consistency

### Quality Gates - GREEN Phase
- [ ] All tests pass successfully
- [ ] Implementation is minimal and focused
- [ ] No security vulnerabilities introduced
- [ ] No performance degradation
- [ ] Accessibility compliance maintained
- [ ] Code quality standards met

## Phase 3: REFACTOR - Improve Code Quality

### Objectives
- Improve code structure and readability
- Remove code duplication
- Optimize performance while maintaining functionality
- Enhance maintainability

### Process Flow

#### 3.1 Code Analysis
```typescript
// Example: Refactoring analysis
interface RefactoringOpportunity {
  type: 'extract-method' | 'rename-variable' | 'extract-class' | 'move-method';
  description: string;
  benefit: string;
  risk: 'low' | 'medium' | 'high';
  estimatedEffort: string;
}
```

#### 3.2 Refactoring Implementation
```typescript
// Example: Refactored code
export class ComponentName {
  private readonly dependency: Dependency;
  private readonly logger: Logger;

  constructor(dependency: Dependency, logger: Logger) {
    this.dependency = dependency;
    this.logger = logger;
  }

  async executeAction(): Promise<Result> {
    try {
      this.logger.info('Executing action');
      const result = await this.dependency.performAction();
      this.logger.info('Action completed successfully');
      return result;
    } catch (error) {
      this.logger.error('Action failed', { error });
      throw new ActionExecutionError(error);
    }
  }
}
```

#### 3.3 Refactoring Validation
- **Test Preservation**: All tests still pass
- **Code Quality**: Improved code structure and readability
- **Performance**: Performance maintained or improved
- **Maintainability**: Enhanced code maintainability

### Agent Coordination - REFACTOR Phase

#### @tdd-orchestrator Responsibilities:
1. **Refactoring Guidance**: Guide refactoring efforts
2. **Test Preservation**: Ensure all tests still pass
3. **Code Quality**: Validate improved code structure
4. **Documentation**: Update documentation

#### @code-reviewer Responsibilities:
1. **Security Validation**: Ensure refactoring doesn't introduce security issues
2. **Performance Validation**: Validate performance improvements
3. **Code Quality**: Validate refactoring quality
4. **Best Practices**: Ensure best practices are followed

#### @architect-review Responsibilities:
1. **Architecture Compliance**: Ensure refactoring aligns with architecture
2. **Design Patterns**: Validate design pattern usage
3. **Scalability**: Ensure refactoring supports scalability
4. **Integration**: Validate integration points

### Quality Gates - REFACTOR Phase
- [ ] All tests continue to pass
- [ ] Code structure is improved
- [ ] Performance is maintained or improved
- [ ] No new security vulnerabilities introduced
- [ ] Architecture compliance maintained
- [ ] Documentation is updated

## Workflow Automation

### Test Execution Scripts
```bash
#!/bin/bash
# scripts/tdd-red-green-refactor.sh

# RED Phase: Run tests to ensure they fail
echo "=== RED Phase: Validating test failures ==="
npm test || echo "Tests failing as expected"

# GREEN Phase: Run tests to ensure they pass
echo "=== GREEN Phase: Validating test success ==="
npm test && echo "All tests passing"

# REFACTOR Phase: Run tests to ensure refactoring doesn't break functionality
echo "=== REFACTOR Phase: Validating refactoring ==="
npm test && npm run lint && echo "Refactoring successful"
```

### Quality Gate Validation
```bash
#!/bin/bash
# scripts/quality-gates.sh

# Test coverage validation
npm run test:coverage

# Security scanning
npm run security:scan

# Performance analysis
npm run performance:analyze

# Accessibility testing
npm run accessibility:test

# Architecture validation
npm run architecture:validate
```

## Communication Protocols

### Status Reporting
- **RED Phase**: Report test creation progress and validation results
- **GREEN Phase**: Report implementation progress and test execution results
- **REFACTOR Phase**: Report refactoring progress and validation results

### Issue Escalation
- **Test Quality Issues**: Escalate to @architect-review
- **Security Issues**: Escalate to @code-reviewer
- **Accessibility Issues**: Escalate to @apex-ui-ux-designer
- **Architecture Issues**: Escalate to @architect-review

### Success Metrics
- **Test Coverage**: ≥90% for critical components
- **Test Quality**: All tests are isolated and maintainable
- **Code Quality**: Zero linting errors
- **Performance**: No performance degradation
- **Security**: Zero security vulnerabilities

## Best Practices

### Test Writing Best Practices
1. **Arrange-Act-Assert Pattern**: Follow consistent test structure
2. **Descriptive Test Names**: Use clear, descriptive test names
3. **Test Isolation**: Ensure tests are independent
4. **Edge Case Coverage**: Cover all edge cases and error scenarios

### Implementation Best Practices
1. **Minimal Implementation**: Write only enough code to pass tests
2. **Single Responsibility**: Each component has a single responsibility
3. **Dependency Injection**: Use dependency injection for testability
4. **Error Handling**: Implement proper error handling

### Refactoring Best Practices
1. **Incremental Changes**: Make small, incremental changes
2. **Test Preservation**: Ensure all tests continue to pass
3. **Code Quality**: Focus on improving code quality
4. **Documentation**: Keep documentation up to date

## Tools and Integration

### Testing Framework
- **Vitest**: Unit and integration testing
- **Testing Library**: Component testing utilities
- **MSW**: API mocking for integration tests

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety

### Security and Performance
- **ESLint Security Plugin**: Security linting rules
- **Bundle Analyzer**: Bundle size analysis
- **Lighthouse**: Performance and accessibility audits

## Continuous Improvement

### Retrospectives
- **Sprint Retrospectives**: Regular process improvement sessions
- **Agent Feedback**: Individual agent performance reviews
- **Tool Evaluation**: Technology stack assessment

### Knowledge Management
- **Documentation**: Regular updates to workflow documentation
- **Pattern Library**: Reusable solutions and patterns
- **Lessons Learned**: Documented project experiences

This TDD RED-GREEN-REFACTOR workflow ensures high-quality, maintainable code through disciplined testing and multi-agent coordination.
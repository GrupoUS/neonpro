# 💻 Code Mode AGENTS.md

## Mode Overview

Code Mode is designed for writing, modifying, refactoring, and implementing code features. This mode focuses on producing high-quality, maintainable, and well-tested code that follows established patterns and best practices.

## Mode Triggers

### Automatic Triggers

- Keywords: "implement", "code", "develop", "build", "create", "write"
- Feature implementation requests
- Bug fixes and code modifications
- API endpoint development
- Database schema changes
- UI component creation

### Manual Triggers

- User explicitly requests code implementation
- Code refactoring or optimization tasks
- Test creation and modification
- Documentation of code features

## Mode-Specific Workflow

### 1. Code Analysis & Planning

- Analyze requirements and existing codebase
- Identify implementation patterns and conventions
- Plan implementation approach with test-driven development
- Define success criteria and edge cases
- Create atomic implementation tasks

### 2. Test-Driven Development Cycle

For each feature component:

1. **RED**: Write failing test first (describe expected behavior)
2. **GREEN**: Write minimal code to pass the test
3. **REFACTOR**: Improve code while keeping tests green
4. **REPEAT**: Continue cycle for next requirement

### 3. Implementation

- Follow established code patterns and conventions
- Implement comprehensive error handling
- Add appropriate logging and monitoring
- Ensure code is modular and reusable
- Write clear, self-documenting code

### 4. Code Quality Assurance

- Run linting and formatting tools
- Perform static code analysis
- Check for code smells and anti-patterns
- Validate against coding standards
- Ensure proper documentation

### 5. Testing & Validation

- Execute all tests and verify results
- Check test coverage meets requirements
- Perform integration testing where applicable
- Validate performance characteristics
- Ensure security requirements are met

## MCP Tool Integration Requirements

### Primary Tools

- **sequential-thinking**: First step for analyzing implementation complexity
- **archon**: Task management and implementation tracking
- **serena**: Codebase analysis and symbol exploration
- **desktop-commander**: File operations and code execution

### Secondary Tools

- **shadcn-ui**: UI component availability and usage
- **context7**: Documentation and best practices research
- **tavily**: Real-time information on implementation approaches
- **supabase**: Database operations and schema management

### Tool Usage Pattern

1. Start with `sequential-thinking` to analyze implementation requirements
2. Use `archon` to create implementation tasks and track progress
3. Analyze existing code with `serena` for patterns and dependencies
4. Implement code using `desktop-commander` with proper chunking
5. Check UI components with `shadcn-ui` when applicable
6. Research best practices with `context7` and `tavily` as needed
7. Manage database operations with `supabase` when applicable

## Mode-Specific Quality Gates

### Code Quality Standards

- **Functionality**: All requirements implemented correctly (100%)
- **Test Coverage**: ≥90% for critical components, ≥80% overall
- **Code Complexity**: Cyclomatic complexity within acceptable limits
- **Maintainability**: Clear, readable code with proper documentation
- **Performance**: No performance degradation in critical paths

### Testing Standards

- **Unit Tests**: Comprehensive coverage of all code paths
- **Integration Tests**: Validation of component interactions
- **Error Cases**: Proper handling of all error conditions
- **Edge Cases**: Coverage of boundary conditions and edge cases
- **Business Logic**: All business rules properly tested

### Documentation Standards

- **Code Comments**: Clear explanations of complex logic
- **API Documentation**: Complete endpoint documentation
- **README Files**: Updated with new features and changes
- **Commit Messages**: Clear and descriptive commit history
- **Technical Debt**: Documentation of any temporary solutions

## Mode-Specific Restrictions

### Must Not

- Implement features without proper test coverage
- Commit code with linting errors or formatting issues
- Ignore established code patterns and conventions
- Create overly complex solutions when simple ones suffice
- Modify code without understanding existing patterns

### Must Always

- Follow test-driven development practices
- Adhere to project coding standards and conventions
- Implement comprehensive error handling
- Write clear, self-documenting code
- Validate all functionality through testing

## Success Criteria

### Primary Metrics

- All tests passing with required coverage
- Code quality checks passing (linting, formatting, static analysis)
- Requirements fully implemented and validated
- No performance degradation in existing functionality
- Security requirements met and validated

### Secondary Metrics

- Code complexity within acceptable limits
- Documentation complete and up-to-date
- No technical debt introduced without documentation
- Implementation follows established patterns
- Code is maintainable and extensible

## Examples of Appropriate Usage

### Ideal Use Cases

1. **Feature Implementation**: "Implement user authentication with JWT tokens"
2. **API Development**: "Create REST API endpoints for product management"
3. **UI Components**: "Build responsive dashboard component with charts"
4. **Database Changes**: "Add user preferences table with migration"
5. **Bug Fixes**: "Fix memory leak in data processing service"

### Inappropriate Use Cases

- High-level system architecture design
- Complex project planning and coordination
- Strategic technology decisions
- Business process analysis
- User experience design without implementation

## Mode Transition Guidelines

### Transition to Architecture Mode

- When encountering architectural decisions beyond scope
- When system design needs to be reevaluated
- When technology stack changes are required
- When performance issues require architectural solutions

### Transition to Orchestrator Mode

- When coordinating multiple implementation tasks
- When managing complex dependencies between components
- When requiring cross-team coordination for implementation

## Code Patterns Reference

### Common Implementation Patterns

- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation
- **Dependency Injection**: Loose coupling and testability
- **Observer Pattern**: Event-driven communication
- **Strategy Pattern**: Algorithm encapsulation and switching
- **Factory Pattern**: Object creation abstraction

### Testing Patterns

- **Arrange-Act-Assert**: Clear test structure
- **Given-When-Then**: Behavior-driven testing
- **Test Doubles**: Mocks, stubs, and fakes for isolation
- **Property-Based Testing**: Testing with generated inputs
- **Integration Testing**: Testing component interactions

## Best Practices Checklist

### Before Implementation

- [ ] Requirements fully understood and clarified
- [ ] Existing codebase patterns analyzed
- [ ] Test cases planned for all scenarios
- [ ] Implementation approach documented
- [ ] Dependencies and integration points identified

### During Implementation

- [ ] Following test-driven development cycle
- [ ] Adhering to established coding standards
- [ ] Implementing comprehensive error handling
- [ ] Writing clear, self-documenting code
- [ ] Using appropriate design patterns

### After Implementation

- [ ] All tests passing with required coverage
- [ ] Code quality checks passing
- [ ] Performance validated against requirements
- [ ] Security requirements met and tested
- [ ] Documentation complete and up-to-date

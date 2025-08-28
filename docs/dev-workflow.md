# Development Workflow

> **🤖 AI Instructions:** This is the mandatory step-by-step process you MUST follow when developing features, unless the user explicitly requests to skip specific steps. Always follow this workflow systematically.

## Pre-Development Guidelines

**📚 Documentation Consultation:**
⚠️ **IMPORTANT**: Only consult documentation when you have specific questions or uncertainties. Avoid loading unnecessary context.

When you have ANY doubt during development:

- First consult the `/docs` folder for relevant documentation
- Check `docs/architecture.md` for architectural decisions
- Review `docs/tech-stack.md` for technology guidelines
- Look at `docs/apis.md` for API patterns
- Check `docs/database-schema.md` for data structure
- Consult specific guides in `/rules` or `/docs` for coding standards, best practices, and design patterns

## Mandatory Development Steps

### 1. **Planning & Task List**

- Create a detailed task list using the todo tool to implement the feature
- Break down complex features into manageable subtasks
- Mark tasks as in_progress when starting, completed when finished

### 2. **Branch Creation**

- Create a specific branch for the feature following naming conventions
- Use descriptive branch names (e.g., `feature/user-authentication`, `fix/payment-validation`)

### 3. **TDD Implementation (Red-Green-Refactor)**

- **MANDATORY**: Follow the TDD process as described in `docs/ttd-flow.md`
- **TDD Cycle for each feature component:**
  1. **RED**: Write failing test first (describe expected behavior)
  2. **GREEN**: Write minimal code to pass the test
  3. **REFACTOR**: Improve code while keeping tests green
  4. **REPEAT**: Continue cycle for next requirement

- **Test Priority (from ttd-flow.md):**
  - 🔥 **CRITICAL**: Business logic, AI agents, APIs, financial operations
  - ⚡ **IMPORTANT**: Complex hooks, utilities, data validation, integrations
  - ✅ **USEFUL**: UI components with logic, helpers

- **Implementation Guidelines:**
  - **MANDATORY**: Execute following ALL guidelines from `/rules` and `/docs` directories
  - **ALWAYS**: Consult documentation when uncertain about patterns, conventions, or approaches
  - Follow established code patterns, naming conventions, and project standards
  - Implement comprehensive error handling following project patterns
  - **Test Categories Required**: Success cases, error cases, edge cases, business logic
  - **Documentation First**: Check existing patterns before creating new ones

### 4. **Test Execution & Validation**

- Run `npm test` to execute all unit tests
- **Correction Loop**: If tests fail:
  - Fix the issues following TDD principles
  - Run `npm test` again
  - Repeat until ALL tests pass
- **Coverage Requirements** (from ttd-flow.md):
  - Critical business logic: 100%
  - AI agents/services: 90%+
  - Complex hooks: 85%+
  - Utilities/validators: 80%+
- Only proceed when all unit tests are green and coverage meets requirements

### 5. **Code Quality Check**

- Run `npx next lint` to check for linting issues
- Run `npx tsc --noEmit` to verify TypeScript compilation
- Fix any errors or warnings before proceeding

### 6. **External Code Review**

- Ask user to run CodeRabbit for automated code review
- **Optional**: Run SonarQube analysis for additional quality checks
- Wait for user confirmation before proceeding
- **Correction Loop**: If issues are found:
  - Fix the reported issues
  - Return to **Step 4** (Unit Testing) and repeat the entire cycle
  - Continue until ALL quality checks pass

### 7. **Pull Request & Code Review**

- Create PR with clear description of changes
- Include testing instructions and any breaking changes
- **Automatic Quality Checks**: SonarQube and CodeRabbit run automatically on PR
- Request evaluation by another developer

### 8. **Merge to Main**

- **Conflict Check**: Verify if there are any merge conflicts with main branch
- Resolve any conflicts before merging
- Complete the merge to main branch

### 9. **Memory Documentation Protocol**

- **MANDATORY**: Follow the Proactive Update Protocol from `rules/memory.md`:
  - Create `mistakes/[error-category].md` if any mistake was made and corrected
  - Create `features/[feature-name].md` for new features or modified behavior
  - **TDD Documentation**: Include test coverage metrics, test patterns used, and any TDD-specific decisions
  - Update `@project.md` if new project standards were established
  - Update `@code-preferences.md` if coding preferences were clarified
- Update relevant README files if needed
- **Test Documentation**: Document any new test patterns, mocks, or testing utilities created during TDD process

### 10. **Documentation Folder Updates**

- **Evaluate and Suggest**: Assess if the following documentation folders need updates based on the implemented feature:
  - Application flows (`docs/app-flows/`) - if user flows were modified
  - API documentation (`docs/apis/`) - if endpoints were created/modified
  - Database schemas (`docs/database-schema/`) - if database structure changed
  - Any other relevant documentation folders
- **Suggest to User**: Recommend specific updates needed and ask user to review/update the identified documentation folders

### 11. **Out-of-Scope Documentation**

- **Documentation Agent**: For new documentation not covered by existing folders or protocols
- Use the documentation agent (`agents/documentation.md`) to create comprehensive documentation for:
  - New concepts or patterns introduced
  - Complex architectural decisions
  - Integration guides or tutorials
  - Any documentation that falls outside the standard memory and folder protocols

## Important Notes

- **🚫 Never skip steps** unless explicitly told by the user
- **📖 Always consult `/docs`** when uncertain
- **✅ Complete each step** before moving to the next
- **🔄 Iterate** until all quality checks pass
- **📝 Document everything** for future reference

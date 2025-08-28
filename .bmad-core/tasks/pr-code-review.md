<!-- Powered by BMAD™ Core -->

# pr-code-review

Create and manage Pull Request & Code Review process with automated quality checks.

## Purpose

Establish a comprehensive Pull Request workflow that ensures code quality, proper documentation,
and automated validation through integrated tools. This task provides templates, checklists,
and integration with DeepSource Autofix and CodeRabbit for automated quality assurance.

## Prerequisites

- Feature development completed
- Local testing passed
- Code follows project standards
- Documentation updated (if applicable)
- Breaking changes identified and documented

## PR Template Structure

### Required Sections

```markdown
## 📋 Description

### What does this PR do?
<!-- Provide a clear, concise description of the changes -->

### Why is this change needed?
<!-- Explain the business/technical justification -->

### Related Issues
<!-- Link to related issues, stories, or tickets -->
Closes #[issue-number]
Related to #[issue-number]

## 🧪 Testing Instructions

### How to test these changes:
1. [ ] Step-by-step testing instructions
2. [ ] Expected behavior description
3. [ ] Edge cases to verify

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)

## ⚠️ Breaking Changes

<!-- If there are breaking changes, describe them here -->
- [ ] No breaking changes
- [ ] Breaking changes documented below:

### Migration Guide (if applicable)
<!-- Provide migration instructions for breaking changes -->

## 📚 Documentation

- [ ] Code comments updated
- [ ] README updated (if applicable)
- [ ] API documentation updated (if applicable)
- [ ] Architecture docs updated (if applicable)

## 🔍 Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases handled appropriately
- [ ] Error handling implemented
- [ ] Performance considerations addressed

### Code Quality
- [ ] Code follows project conventions
- [ ] Functions/methods are appropriately sized
- [ ] Variable/function names are descriptive
- [ ] No code duplication
- [ ] Comments explain complex logic

### Security
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization handled
- [ ] SQL injection prevention (if applicable)

### Testing
- [ ] Adequate test coverage
- [ ] Tests are meaningful and comprehensive
- [ ] Tests pass consistently
- [ ] Mock/stub usage is appropriate
```

## Automated Quality Checks

### DeepSource Autofix
- **Automatic Activation**: Runs on every PR automatically
- **Coverage**: Code quality, security vulnerabilities, performance issues
- **Action Required**: Review and approve suggested fixes
- **Integration**: Results appear as PR comments and checks

### CodeRabbit
- **Automatic Activation**: AI-powered code review on every PR
- **Coverage**: Code logic, best practices, potential bugs
- **Action Required**: Address feedback and suggestions
- **Integration**: Provides detailed line-by-line feedback

## Approval Process

### Required Approvals
- **Minimum**: 1 approval from code owner/maintainer
- **Complex Changes**: 2 approvals required
- **Breaking Changes**: Lead developer approval required

### Approval Criteria
- [ ] All automated checks pass
- [ ] Code review checklist completed
- [ ] Testing instructions verified
- [ ] Documentation updated
- [ ] Breaking changes properly communicated

## Merge Process

### Pre-Merge Checklist
- [ ] All CI/CD checks pass
- [ ] DeepSource issues resolved
- [ ] CodeRabbit feedback addressed
- [ ] Required approvals obtained
- [ ] Conflicts resolved
- [ ] Target branch is up to date

### Merge Strategy
- **Feature Branches**: Squash and merge (clean history)
- **Hotfixes**: Merge commit (preserve context)
- **Release Branches**: Merge commit (preserve branch structure)

### Post-Merge Actions
- [ ] Delete feature branch
- [ ] Update related issues/tickets
- [ ] Notify stakeholders (if applicable)
- [ ] Monitor deployment (if auto-deployed)

## Quality Gates

### Mandatory Gates
1. **Automated Tests**: All tests must pass
2. **Code Coverage**: Maintain or improve coverage
3. **Security Scan**: No high/critical vulnerabilities
4. **Performance**: No significant performance regression
5. **Documentation**: Required docs updated

### Advisory Gates
1. **Code Complexity**: Keep complexity reasonable
2. **Technical Debt**: Address or document debt
3. **Accessibility**: Follow accessibility guidelines
4. **Mobile Responsiveness**: Ensure mobile compatibility

## Troubleshooting

### Common Issues

**Failed Automated Checks**
- Review DeepSource suggestions
- Address CodeRabbit feedback
- Check CI/CD pipeline logs
- Verify test failures

**Merge Conflicts**
- Rebase on target branch
- Resolve conflicts locally
- Test after conflict resolution
- Push updated branch

**Missing Approvals**
- Ensure all reviewers notified
- Address outstanding feedback
- Request specific reviewers if needed
- Escalate if blocked

## Integration with Project Workflow

### BMad Integration
- Links to story completion
- Quality gate validation
- Automated task updates

### GitHub Integration
- PR templates auto-populated
- Branch protection rules enforced
- Status checks required
- Auto-assignment of reviewers

## Best Practices

### PR Size
- Keep PRs focused and reasonably sized
- Split large changes into multiple PRs
- Aim for <500 lines of code changes

### Communication
- Use clear, descriptive PR titles
- Provide context in descriptions
- Respond promptly to feedback
- Tag relevant team members

### Code Quality
- Follow established coding standards
- Write self-documenting code
- Include appropriate tests
- Consider future maintainability

## Metrics and Monitoring

### Key Metrics
- PR review time
- Time to merge
- Defect escape rate
- Code coverage trends
- Security vulnerability trends

### Continuous Improvement
- Regular retrospectives on PR process
- Feedback collection from team
- Process refinement based on metrics
- Tool effectiveness evaluation
# 🧪 NeonPro Testing Tools

Comprehensive testing infrastructure for the NeonPro Aesthetic Clinic Platform with multi-agent coordination and MCP Playwright integration.

## Scripts

### Frontend Testing

```bash
# Run comprehensive frontend testing
bun run frontend:test

# Run specific phase
bun run frontend:test:phase -- red
bun run frontend:test:phase -- green
bun run frontend:test:phase -- refactor

# Run specific workflow
bun run frontend:test:workflow -- patient-management
bun run frontend:test:workflow -- appointment-scheduling
bun run frontend:test:workflow -- whatsapp-integration

# Development environment testing
bun run frontend:test:dev
```

### Direct Execution

```bash
# Using the binary
bun ./frontend-testing.sh

# With custom configuration
BASE_URL=http://localhost:3000 bun ./frontend-testing.sh
```

## Testing Coverage

- **Multi-browser testing**: Chromium, Firefox, WebKit, Mobile
- **Accessibility**: WCAG 2.1 AA+ compliance
- **Performance**: Lighthouse integration
- **Aesthetic Clinic Workflows**: Patient management, appointments, WhatsApp integration
- **Compliance**: LGPD, ANVISA, CFM validation

## Multi-Agent Coordination

- **@agent-apex-ui-ux-designer**: UI/UX and accessibility testing
- **@agent-code-reviewer**: Code quality and performance analysis
- **@agent-architect-review**: Architecture validation
- **@agent-test-auditor**: TDD orchestration and quality gates

## Output Structure

```
test-results/
├── playwright/           # E2E test results
├── accessibility/       # Accessibility reports
├── performance/         # Performance metrics
├── mobile/             # Mobile testing results
├── compliance/         # Compliance validation
└── comprehensive_report_[TIMESTAMP].md
```

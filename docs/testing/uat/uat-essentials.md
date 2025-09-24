---
title: "UAT Essentials"
last_updated: 2025-09-24
form: how-to
tags: [uat, testing, user-acceptance, essential]
related:
  - ../testing/AGENTS.md
  - ../compliance/README.md
---

# UAT Essentials — How-to

## Goal

Execute User Acceptance Testing efficiently with minimal tooling complexity.

## Prerequisites

- Test environment configured
- User scenarios defined
- Success criteria established

## Basic UAT Process

### 1. Test Preparation

```bash
# Setup test environment
pnpm test:setup

# Validate test data
pnpm test:validate-data
```

### 2. User Testing

- Follow predefined scenarios
- Record issues found
- Document feedback

### 3. Results Analysis

```bash
# Generate test report
pnpm test:report

# Check compliance
pnpm test:compliance
```

## Key Metrics

- Scenario completion rate
- User satisfaction score
- Critical issues found
- Compliance validation

## Tools

### Screen Recording (Simple)

```javascript
// Basic screen recording
navigator.mediaDevices.getDisplayMedia()
  .then((stream) => {
    const recorder = new MediaRecorder(stream)
    recorder.start()
  })
```

### Issue Tracking

- Use GitHub Issues
- Tag with `uat:critical` or `uat:minor`
- Link to test scenarios

## Success Criteria

- [ ] All critical scenarios pass
- [ ] No security vulnerabilities
- [ ] LGPD compliance verified
- [ ] User satisfaction >90%

## See Also

- [Testing Strategy](../testing/AGENTS.md)
- [Compliance Checklist](../compliance/README.md)

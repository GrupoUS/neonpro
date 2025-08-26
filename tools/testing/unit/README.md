# Unit Testing Guidelines - NeonPro Healthcare

## Overview

Unit testing infrastructure for NeonPro healthcare components with focus on isolated component
testing, healthcare compliance validation, and comprehensive coverage.

## Directory Structure

```
unit/
├── setup/              # Test setup configurations
├── setup.ts            # Main test setup file
├── components/         # Component-specific unit tests
├── utils/              # Utility function tests
├── hooks/              # React hook tests
├── services/           # Service layer tests
└── compliance/         # Healthcare compliance unit tests
```

## Testing Standards

### Coverage Requirements

- **Minimum**: 90% statement coverage
- **Healthcare Components**: 95% coverage required
- **Critical Healthcare Functions**: 100% coverage required

### Test Organization

- One test file per source file
- Use descriptive test names
- Group related tests using `describe` blocks
- Follow Arrange-Act-Assert pattern

## Healthcare-Specific Testing

### LGPD Compliance Unit Tests

```typescript
describe('Patient Data Privacy', () => {
  it('should encrypt patient data before storage', () => {
    // Test data encryption compliance
  });

  it('should validate consent before data processing', () => {
    // Test consent validation
  });
});
```

### ANVISA Compliance Unit Tests

```typescript
describe('Medical Device Validation', () => {
  it('should validate device registration status', () => {
    // Test device registration compliance
  });
});
```

### CFM Standards Unit Tests

```typescript
describe('Medical Professional Standards', () => {
  it('should validate professional licensing', () => {
    // Test professional license validation
  });
});
```

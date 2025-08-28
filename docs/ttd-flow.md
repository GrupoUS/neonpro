# TDD Flow Protocol - Version: 1.0.0

## Purpose

Defines Test-Driven Development workflow for TypeScript/Jest projects. Follow this protocol to ensure quality code through testing.

## TDD Cycle (Red-Green-Refactor)

1. **RED**: Write failing test first
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Improve code while keeping tests green

## Test Priority

```
🔥 CRITICAL (Must Test)
├── Business logic (payments, credits, limits)
├── AI agents (core functionality)
├── Public APIs (user-facing)
└── Financial operations

⚡ IMPORTANT (Should Test)
├── Complex hooks (state management)
├── Core utilities (widely used)
├── Data validation (schemas)
└── External integrations
```

## Decision Framework

**Test if:**

- Contains business logic
- Handles money/credits
- Processes user data
- Integrates external services
- Complex state management
- Used in multiple places

**Don't test:**

- Pure constants
- Simple getters/setters
- Third-party wrappers (without logic)

## TDD Workflow

1. **Understand requirement**
2. **Write failing test** (describe expected behavior)
3. **Run test** (should fail - RED)
4. **Write minimal code** to pass test
5. **Run test** (should pass - GREEN)
6. **Refactor** code while keeping tests green
7. **Repeat** for next requirement

## Jest Setup

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  projects: [
    {
      displayName: "Logic",
      testMatch: ["<rootDir>/src/**/*.test.ts"],
      testEnvironment: "node",
    },
    {
      displayName: "Components",
      testMatch: ["<rootDir>/src/**/*.test.tsx"],
      testEnvironment: "jsdom",
    },
  ],
};
```

## Test Structure Template

```typescript
import { functionToTest } from "@/path/to/module";

// Mock dependencies
jest.mock("@/lib/external-service");

describe("ModuleName", () => {
  describe("Success Cases", () => {
    it("should handle valid input", () => {
      // Arrange
      const input = "valid";

      // Act
      const result = functionToTest(input);

      // Assert
      expect(result).toBe("expected");
    });
  });

  describe("Error Cases", () => {
    it("should throw on invalid input", () => {
      expect(() => functionToTest(null)).toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle boundary values", () => {
      // Test edge cases
    });
  });
});
```

## File Organization

```
src/
├── __tests__/
│   ├── services/
│   ├── lib/agents/
│   ├── hooks/
│   ├── components/
│   └── api/
└── [source files]
```

## Mock Patterns

```typescript
// External service
jest.mock("@/lib/service", () => ({
  method: jest.fn(),
}));

// Supabase
const mockSupabase = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  }),
};

// React hooks
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
}));
```

## Test Categories (Required)

1. **Success Cases**: Happy path, valid inputs
2. **Error Cases**: Invalid inputs, failures
3. **Edge Cases**: Boundary values, null/empty
4. **Business Logic**: Rules, calculations, conditions

## Coverage Requirements

- **Critical business logic**: 100%
- **AI agents/services**: 90%+
- **Complex hooks**: 85%+
- **Utilities/validators**: 80%+

## Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Quality Checklist

- [ ] Test written before code
- [ ] All paths covered (success/error/edge)
- [ ] Business logic validated
- [ ] External dependencies mocked
- [ ] Tests are fast and isolated
- [ ] Clear test descriptions

## Common Issues

- **TypeScript errors**: Check `ts-jest` config
- **Import issues**: Verify `moduleNameMapper`
- **Mock failures**: Match actual interface
- **Async issues**: Use proper async/await

Follow this protocol to maintain high code quality through systematic testing.

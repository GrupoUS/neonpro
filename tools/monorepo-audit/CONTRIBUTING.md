# Contributing to Monorepo Audit Tool

Thank you for your interest in contributing! This guide will help you get started with development and ensure your contributions align with our standards.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Testing Guidelines](#testing-guidelines)
5. [Documentation](#documentation)
6. [Submitting Changes](#submitting-changes)

## Development Setup

### Prerequisites

- Node.js 20 or higher
- Bun package manager
- Git
- VSCode (recommended) with TypeScript extensions

### Initial Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/neonpro.git
   cd neonpro/tools/monorepo-audit
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Run initial build**:
   ```bash
   bun run build
   ```

4. **Run tests to verify setup**:
   ```bash
   bun run test
   ```

5. **Verify CLI works**:
   ```bash
   bun run cli --version
   ```

### Development Scripts

```bash
bun run dev          # Development mode with watching
bun run build        # Production build
bun run test         # Run full test suite
bun run test:watch   # Watch mode testing
bun run test:unit    # Unit tests only
bun run test:integration # Integration tests only
bun run lint         # ESLint checking
bun run lint:fix     # Auto-fix linting issues  
bun run type-check   # TypeScript validation
bun run format       # Prettier formatting
```

## Development Workflow

### TDD Methodology

This project follows **Test-Driven Development (TDD)** with the RED-GREEN-REFACTOR cycle:

1. **RED**: Write a failing test that describes the desired behavior
2. **GREEN**: Write the minimal code to make the test pass
3. **REFACTOR**: Improve the code while keeping tests green

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual features
- `bugfix/issue-description` - Bug fixes
- `hotfix/critical-issue` - Critical production fixes

### Workflow Steps

1. **Create feature branch**:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

2. **Write tests first** (TDD):
   ```bash
   # Create test file
   touch tests/my-feature.test.ts

   # Write failing test
   describe('MyFeature', () => {
     it('should do something awesome', () => {
       // Test implementation
       expect(myFeature.doSomething()).toBe('awesome');
     });
   });
   ```

3. **Run test to confirm it fails**:
   ```bash
   bun run test -- my-feature
   ```

4. **Implement minimal code**:
   ```typescript
   // src/my-feature.ts
   export class MyFeature {
     doSomething(): string {
       return 'awesome'
     }
   }
   ```

5. **Make test pass**:
   ```bash
   bun run test -- my-feature
   ```

6. **Refactor and improve**:
   - Clean up code
   - Add error handling
   - Improve performance
   - Ensure tests still pass

7. **Run full test suite**:
   ```bash
   bun run test
   bun run lint
   bun run type-check
   ```

## Code Standards

### TypeScript Guidelines

- **Strict mode enabled**: All TypeScript strict checks must pass
- **Explicit types**: Prefer explicit typing over `any`
- **Interface over type**: Use interfaces for object shapes
- **Async/await**: Prefer async/await over Promises chains

```typescript
// Good
interface UserData {
  id: string
  name: string
  email: string
}

async function fetchUser(id: string,): Promise<UserData> {
  const response = await fetch(`/api/users/${id}`,)
  return await response.json()
}

// Avoid
function fetchUser(id: any,): any {
  return fetch(`/api/users/${id}`,).then(r => r.json())
}
```

### Code Style

- **ESLint + Prettier**: Automated formatting and linting
- **Naming conventions**:
  - Classes: PascalCase (`FileScanner`)
  - Functions/variables: camelCase (`scanFiles`)
  - Constants: UPPER_SNAKE_CASE (`MAX_FILES`)
  - Files: kebab-case (`file-scanner.ts`)

### Error Handling

Use the established error hierarchy:

```typescript
import { FileSystemError, ValidationError, } from './errors'

// Good
try {
  const result = await someOperation()
} catch (error) {
  if (error instanceof FileSystemError) {
    logger.error('File system error', error,)
    throw new FileSystemError('Failed to access file', { cause: error, },)
  }
  throw error
}

// Avoid generic error handling
try {
  const result = await someOperation()
} catch (error) {
  console.log('Something went wrong',)
}
```

### Performance Guidelines

- **Memory efficiency**: Avoid loading large files entirely into memory
- **Streaming**: Use streams for file processing when possible
- **Caching**: Cache expensive computations
- **Async operations**: Use parallel processing where safe

```typescript
// Good - streaming and parallel processing
async function processFiles(files: string[],): Promise<void> {
  await Promise.all(
    files.map(async (file,) => {
      const stream = createReadStream(file,)
      return processFileStream(stream,)
    },),
  )
}

// Avoid - loading all files into memory
async function processFiles(files: string[],): Promise<void> {
  for (const file of files) {
    const content = await readFile(file, 'utf-8',)
    processContent(content,)
  }
}
```

## Testing Guidelines

### Test Structure

Organize tests to mirror the source structure:

```
src/
├── services/
│   └── FileScanner.ts
└── utils/
    └── Logger.ts

tests/
├── services/
│   └── FileScanner.test.ts
└── utils/
    └── Logger.test.ts
```

### Test Categories

1. **Contract Tests**: Validate service interfaces
2. **Unit Tests**: Test individual functions/classes
3. **Integration Tests**: Test service interactions
4. **End-to-End Tests**: Test complete workflows
5. **Performance Tests**: Validate performance targets

### Writing Good Tests

```typescript
// Good - descriptive, focused, independent
describe('FileScanner', () => {
  let scanner: FileScanner
  let mockFs: MockFileSystem

  beforeEach(() => {
    mockFs = new MockFileSystem()
    scanner = new FileScanner(mockFs,)
  },)

  describe('scan()', () => {
    it('should find TypeScript files in workspace', async () => {
      // Arrange
      mockFs.addFile('/workspace/src/component.tsx',)
      mockFs.addFile('/workspace/src/utils.ts',)

      // Act
      const result = await scanner.scan({
        workspacePath: '/workspace',
        includePatterns: ['**/*.{ts,tsx}',],
      },)

      // Assert
      expect(result.files,).toHaveLength(2,)
      expect(result.files[0].path,).toContain('component.tsx',)
    })

    it('should handle scan errors gracefully', async () => {
      // Arrange
      mockFs.throwOnAccess('/workspace/protected',)

      // Act & Assert
      await expect(scanner.scan({
        workspacePath: '/workspace/protected',
      },),).rejects.toThrow(FileSystemError,)
    })
  })
})

// Avoid - vague, coupled, side effects
test('scanner works', async () => {
  const result = await new FileScanner().scan({ workspacePath: '.', },)
  expect(result,).toBeTruthy()
})
```

### Test Data

- **Use factories**: Create test data with factories
- **Isolate tests**: Each test should be independent
- **Mock external dependencies**: Use mocks for file system, network, etc.

```typescript
// Test data factory
export function createMockCodeAsset(overrides: Partial<CodeAsset> = {},): CodeAsset {
  return {
    id: 'test-asset-1',
    path: '/test/file.ts',
    relativePath: 'src/file.ts',
    size: 1024,
    category: FileCategory.COMPONENT,
    lastModified: new Date(),
    checksum: 'abc123',
    metadata: {},
    ...overrides,
  }
}
```

## Documentation

### Code Documentation

- **JSDoc comments** for public APIs
- **README updates** for new features
- **Architecture decisions** in ADR format

````typescript
/**
 * Scans the workspace for files matching the specified patterns.
 * 
 * @param options - Configuration for the scan operation
 * @returns Promise resolving to scan results with file list and statistics
 * @throws FileSystemError when workspace cannot be accessed
 * @throws ValidationError when options are invalid
 * 
 * @example
 * ```typescript
 * const result = await scanner.scan({
 *   workspacePath: '/my/workspace',
 *   includePatterns: ['**\/*.ts']
 * });
 * console.log(`Found ${result.files.length} files`);
 * ```
 */
async scan(options: FileScanOptions): Promise<FileScanResult> {
  // Implementation
}
````

### Documentation Updates

When adding features:

1. Update README.md if user-facing
2. Update API_REFERENCE.md for new APIs
3. Update USER_GUIDE.md for new workflows
4. Add examples and troubleshooting tips

## Submitting Changes

### Before Submitting

1. **All tests pass**:
   ```bash
   bun run test
   ```

2. **Code quality checks pass**:
   ```bash
   bun run lint
   bun run type-check
   ```

3. **Documentation updated**:
   - Code comments added/updated
   - User-facing documentation updated
   - CHANGELOG.md entry added

4. **Performance impact considered**:
   ```bash
   bun run benchmarks
   ```

### Pull Request Process

1. **Create PR with clear title**:
   - `feat: add dependency analysis caching`
   - `fix: resolve memory leak in file scanner`
   - `docs: update installation guide`

2. **PR Description Template**:
   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   - [ ] Added/updated unit tests
   - [ ] Added/updated integration tests
   - [ ] Manual testing completed

   ## Documentation

   - [ ] Code comments updated
   - [ ] User documentation updated
   - [ ] API documentation updated

   ## Performance Impact

   - [ ] No performance impact
   - [ ] Performance improved
   - [ ] Performance impact assessed

   ## Checklist

   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Tests pass locally
   - [ ] Documentation updated
   ```

3. **Address review feedback**:
   - Respond to all comments
   - Make requested changes
   - Update tests as needed

### Commit Message Format

Use conventional commits:

```
feat(scanner): add support for custom file patterns

- Add configurable include/exclude patterns
- Improve performance for large workspaces  
- Add validation for pattern syntax

Closes #123
```

Types:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

## Getting Help

- **Documentation**: Check `/docs` directory
- **Issues**: Search existing GitHub issues
- **Discussions**: Ask questions in GitHub Discussions
- **Code Review**: Tag maintainers for review

## Recognition

Contributors will be recognized in:

- CHANGELOG.md for significant contributions
- README.md contributors section
- GitHub contributors graph

Thank you for contributing to making monorepo management better!

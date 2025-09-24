# Contributing Guidelines

## 🤝 Contributing to NeonPro Aesthetic Clinic

Thank you for your interest in contributing to the NeonPro Aesthetic Clinic system! This document provides comprehensive guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Coding Standards](#-coding-standards)
- [Testing Requirements](#-testing-requirements)
- [Documentation](#-documentation)
- [Pull Request Process](#-pull-request-process)
- [Review Process](#-review-process)
- [Release Process](#-release-process)

## 📜 Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socioeconomic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement Responsibilities

Project maintainers are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any instances of unacceptable behavior.

### Scope

This Code of Conduct applies both within project spaces and in public spaces when an individual is representing the project or its community.

## 🚀 Getting Started

### Prerequisites

```bash
# Ensure you have the following installed:
- Node.js (v18.x or v20.x)
- pnpm (package manager)
- Git
- Docker (optional but recommended)
- PostgreSQL 15+
- Redis 7+
```

### First-time Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork locally
git clone https://github.com/your-username/neonpro.git
cd neonpro

# 3. Add the original repository as upstream
git remote add upstream https://github.com/neonpro/neonpro.git

# 4. Install dependencies
pnpm install

# 5. Set up development environment
pnpm run setup:dev

# 6. Run tests to verify setup
pnpm test
```

### Creating Your Development Branch

```bash
# Fetch latest changes from upstream
git fetch upstream

# Create a new feature branch from the latest main
git checkout -b feature/your-feature-name upstream/main

# Or for bug fixes
git checkout -b fix/your-bug-fix upstream/main

# Or for documentation
git checkout -b docs/your-docs-updates upstream/main
```

## 🔄 Development Workflow

### 1. Planning

- **Create an issue**: Start by creating an issue to discuss the feature or bug fix
- **Get approval**: Wait for approval from maintainers before starting work
- **Break down tasks**: Break down complex features into smaller, manageable tasks

### 2. Development

```bash
# Create your feature branch
git checkout -b feature/your-feature-name upstream/main

# Make your changes
# Implement your feature or fix

# Run tests locally
pnpm test

# Run linting
pnpm lint

# Build the project
pnpm build
```

### 3. Commit Guidelines

```bash
# Commit format: <type>(<scope>): <description>
# 
# Types:
# feat: A new feature
# fix: A bug fix
# docs: Documentation only changes
# style: Changes that do not affect the meaning of the code
# refactor: A code change that neither fixes a bug nor adds a feature
# test: Adding missing tests or correcting existing tests
# chore: Changes to the build process or auxiliary tools

# Examples:
git commit -m "feat(aesthetic-clinic): add client profile management"
git commit -m "fix(api): resolve authentication token validation issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(aesthetic-clinic): add unit tests for client service"
```

### 4. Keeping Your Branch Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Rebase your branch on top of latest main
git rebase upstream/main

# If there are conflicts, resolve them and continue
# git add .
# git rebase --continue
```

## 💻 Coding Standards

### TypeScript Standards

```typescript
// Use explicit types
interface ClientProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  skinType: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';
  skinConcerns: string[];
  lgpdConsent: boolean;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

// Use proper error handling
export class ClientService {
  async createClient(data: CreateClientInput): Promise<ClientProfile> {
    try {
      // Validate input
      if (!data.email || !data.fullName) {
        throw new Error('Email and full name are required');
      }

      // Check for existing client
      const existingClient = await this.prisma.aestheticClientProfile.findUnique({
        where: { email: data.email },
      });

      if (existingClient) {
        throw new Error('Client with this email already exists');
      }

      // Create client
      const client = await this.prisma.aestheticClientProfile.create({
        data: {
          ...data,
          cpf: await this.encryptionService.encrypt(data.cpf),
          phone: await this.encryptionService.encrypt(data.phone),
        },
      });

      return client;
    } catch (error) {
      this.logger.error('Failed to create client', { error, data });
      throw error;
    }
  }
}

// Use proper async/await patterns
export async function getClientHistory(
  clientId: string,
  options: GetClientHistoryOptions = {},
): Promise<ClientHistory> {
  const { includeTreatments = true, includeSessions = true } = options;

  const [client, treatments, sessions] = await Promise.all([
    prisma.aestheticClientProfile.findUnique({
      where: { id: clientId },
      include: {
        professional: true,
      },
    }),
    includeTreatments
      ? prisma.aestheticTreatment.findMany({
        where: { clientId },
        include: {
          sessions: includeSessions,
        },
      })
      : Promise.resolve([]),
    includeSessions && !includeTreatments
      ? prisma.aestheticSession.findMany({
        where: {
          treatment: {
            clientId,
          },
        },
        include: {
          treatment: true,
          professional: true,
        },
      })
      : Promise.resolve([]),
  ]);

  if (!client) {
    throw new Error('Client not found');
  }

  return {
    client,
    treatments,
    sessions,
  };
}
```

### React Component Standards

```typescript
// Use functional components with proper typing
interface ClientListProps {
  clients: ClientProfile[];
  onClientSelect: (clientId: string) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  onClientSelect,
  loading = false,
  error = null,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');

  // Memoize expensive operations
  const filteredClients = useMemo(() => {
    return clients
      .filter(client =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        || client.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.fullName.localeCompare(b.fullName);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [clients, searchTerm, sortBy]);

  const handleClientSelect = useCallback((clientId: string) => {
    onClientSelect(clientId);
  }, [onClientSelect]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center p-4'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-1'>
          <SearchInput
            value={searchTerm}
            onChange={value => setSearchTerm(value)}
            placeholder='Buscar clientes...'
            className='w-full'
          />
        </div>
        <Select value={sortBy} onValueChange={(value: 'name' | 'date') => setSortBy(value)}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Ordenar por' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='name'>Nome</SelectItem>
            <SelectItem value='date'>Data</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client list */}
      <div className='space-y-2'>
        {filteredClients.map(client => (
          <ClientListItem
            key={client.id}
            client={client}
            onSelect={() => handleClientSelect(client.id)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredClients.length === 0 && (
        <div className='text-center py-8'>
          <Users className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>Nenhum cliente encontrado</h3>
          <p className='text-muted-foreground'>
            {searchTerm ? 'Tente outros termos de busca.' : 'Comece adicionando clientes.'}
          </p>
        </div>
      )}
    </div>
  );
};

ClientList.displayName = 'ClientList';
```

### API Standards

```typescript
// Use tRPC for type-safe APIs
export const aestheticClinicRouter = t.router({
  // Client management
  createClient: t.procedure
    .input(CreateAestheticClientInputSchema)
    .output(AestheticClientProfileSchema)
    .meta({
      description: 'Create a new aesthetic client profile',
      requiredPermissions: ['clients:create'],
    })
    .mutation(async ({ input, ctx }) => {
      return await ctx.aestheticClinicService.createClient(input, ctx.user.id);
    }),

  getClient: t.procedure
    .input(z.object({ id: z.string() }))
    .output(AestheticClientProfileSchema.nullable())
    .meta({
      description: 'Get client profile by ID',
      requiredPermissions: ['clients:read'],
    })
    .query(async ({ input, ctx }) => {
      return await ctx.aestheticClinicService.getClient(input.id);
    }),

  listClients: t.procedure
    .input(ListClientsInputSchema)
    .output(ListClientsOutputSchema)
    .meta({
      description: 'List clients with filtering and pagination',
      requiredPermissions: ['clients:read'],
    })
    .query(async ({ input, ctx }) => {
      return await ctx.aestheticClinicService.listClients(input);
    }),

  updateClient: t.procedure
    .input(UpdateAestheticClientInputSchema)
    .output(AestheticClientProfileSchema)
    .meta({
      description: 'Update client profile',
      requiredPermissions: ['clients:update'],
    })
    .mutation(async ({ input, ctx }) => {
      return await ctx.aestheticClinicService.updateClient(
        input.id,
        input.data,
        ctx.user.id,
      );
    }),
});

// Use proper input validation
export const CreateAestheticClientInputSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+55\d{10,11}$/, 'Invalid Brazilian phone number'),
  cpf: z.string().regex(/^\d{11}$/, 'Invalid CPF format'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  gender: z.enum(['male', 'female', 'other']),
  skinType: z.enum(['dry', 'oily', 'combination', 'sensitive', 'normal']),
  skinConcerns: z.array(z.string()).optional(),
  medicalHistory: z.object({
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
  }).optional(),
  lgpdConsent: z.boolean().default(true),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});
```

## 🧪 Testing Requirements

### Unit Tests

```typescript
// apps/api/src/__tests__/services/aesthetic-clinic-service.test.ts
import { cleanup, createTestClient, createTestProfessional } from '../__tests__/utils/test-utils';
import { AestheticClinicService } from '../services/aesthetic-clinic-service';

describe('AestheticClinicService', () => {
  let service: AestheticClinicService;
  let professional: any;

  beforeEach(async () => {
    await cleanup();
    service = new AestheticClinicService(testPrisma);
    professional = await createTestProfessional();
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('createClient', () => {
    it('should create a new client with valid data', async () => {
      const clientData = {
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        phone: '+5511999999999',
        cpf: '12345678900',
        dateOfBirth: '1990-01-01',
        gender: 'female' as const,
        skinType: 'combination' as const,
        skinConcerns: ['acne'],
        lgpdConsent: true,
      };

      const result = await service.createClient(clientData, professional.id);

      expect(result).toMatchObject({
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        status: 'active',
      });

      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error for duplicate email', async () => {
      const clientData = {
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        phone: '+5511999999999',
        cpf: '12345678900',
        dateOfBirth: '1990-01-01',
        gender: 'female' as const,
        skinType: 'combination' as const,
        lgpdConsent: true,
      };

      // Create first client
      await service.createClient(clientData, professional.id);

      // Try to create second client with same email
      await expect(service.createClient(clientData, professional.id))
        .rejects.toThrow('Client with this email already exists');
    });

    it('should enforce LGPD consent', async () => {
      const clientData = {
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        phone: '+5511999999999',
        cpf: '12345678900',
        dateOfBirth: '1990-01-01',
        gender: 'female' as const,
        skinType: 'combination' as const,
        lgpdConsent: false, // No consent
      };

      await expect(service.createClient(clientData, professional.id))
        .rejects.toThrow('LGPD consent is required');
    });
  });
});
```

### Integration Tests

```typescript
// apps/api/src/__tests__/integration/client-workflow.test.ts
import { TestClient } from '../__tests__/utils/test-client';
import { createTestClient, createTestProfessional } from '../__tests__/utils/test-utils';

describe('Client Management Workflow', () => {
  let testClient: TestClient;
  let professional: any;

  beforeAll(async () => {
    testClient = new TestClient('http://localhost:3001');
    professional = await createTestProfessional();
  });

  describe('Full Client Lifecycle', () => {
    it('should complete client lifecycle successfully', async () => {
      // Login
      const loginResponse = await testClient.login({
        email: professional.email,
        password: 'password123',
      });

      expect(loginResponse.status).toBe(200);

      // Create client
      const createResponse = await testClient.createClient({
        fullName: 'João Santos',
        email: 'joao.santos@example.com',
        phone: '+5511988888888',
        cpf: '98765432100',
        dateOfBirth: '1985-05-15',
        gender: 'male',
        skinType: 'oily',
        lgpdConsent: true,
      }, loginResponse.data.token);

      expect(createResponse.status).toBe(201);
      const clientId = createResponse.data.client.id;

      // Get client
      const getResponse = await testClient.getClient(clientId, loginResponse.data.token);
      expect(getResponse.status).toBe(200);
      expect(getResponse.data.client.fullName).toBe('João Santos');

      // Update client
      const updateResponse = await testClient.updateClient(clientId, {
        phone: '+5511977777777',
        skinConcerns: ['acne', 'scars'],
      }, loginResponse.data.token);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.client.phone).toBe('+5511977777777');

      // List clients
      const listResponse = await testClient.listClients(loginResponse.data.token);
      expect(listResponse.status).toBe(200);
      expect(listResponse.data.clients).toHaveLength(1);

      // Delete client (soft delete)
      const deleteResponse = await testClient.deleteClient(clientId, loginResponse.data.token);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data.client.status).toBe('inactive');
    });
  });
});
```

### E2E Tests

```typescript
// apps/web/e2e/client-management.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'professional@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should create new client', async ({ page }) => {
    // Navigate to clients
    await page.click('[data-testid="clients-nav"]');
    await page.waitForURL('/clients');

    // Click add client
    await page.click('[data-testid="add-client-button"]');

    // Fill form
    await page.fill('[data-testid="fullName"]', 'Ana Oliveira');
    await page.fill('[data-testid="email"]', 'ana.oliveira@example.com');
    await page.fill('[data-testid="phone"]', '+5511966666666');
    await page.fill('[data-testid="cpf"]', '12345678900');
    await page.fill('[data-testid="dateOfBirth"]', '1992-08-10');
    await page.selectOption('[data-testid="gender"]', 'female');
    await page.selectOption('[data-testid="skinType"]', 'normal');
    await page.click('[data-testid="lgpd-consent"]');

    // Submit
    await page.click('[data-testid="submit-client"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="client-item"]')).toContainText('Ana Oliveira');
  });
});
```

### Test Coverage Requirements

```bash
# Minimum coverage requirements:
- Overall coverage: 80%
- Critical path coverage: 95%
- Security-related code: 100%
- Healthcare compliance logic: 90%

# Run coverage report
pnpm test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Service for managing aesthetic client profiles
 *
 * This service handles all operations related to client management including
 * creation, updates, retrieval, and compliance with LGPD requirements.
 *
 * @class AestheticClinicService
 * @example
 * const service = new AestheticClinicService(prisma);
 * const client = await service.createClient(clientData, professionalId);
 */
export class AestheticClinicService {
  private prisma: PrismaClient;
  private encryptionService: EncryptionService;
  private auditService: AuditService;
  private logger: Logger;

  /**
   * Creates an instance of AestheticClinicService
   * @param {PrismaClient} prisma - Prisma client instance
   * @param {EncryptionService} encryptionService - Service for data encryption
   * @param {AuditService} auditService - Service for audit logging
   * @param {Logger} logger - Logger instance
   */
  constructor(
    prisma: PrismaClient,
    encryptionService: EncryptionService,
    auditService: AuditService,
    logger: Logger,
  ) {
    this.prisma = prisma;
    this.encryptionService = encryptionService;
    this.auditService = auditService;
    this.logger = logger;
  }

  /**
   * Creates a new aesthetic client profile
   *
   * This method validates input data, checks for duplicates, encrypts sensitive
   * information, and creates a new client profile with proper audit logging.
   *
   * @param {CreateAestheticClientInput} data - Client data to create
   * @param {string} professionalId - ID of the creating professional
   * @returns {Promise<AestheticClientProfile>} Created client profile
   * @throws {Error} When validation fails or client already exists
   *
   * @example
   * const clientData = {
   *   fullName: 'Maria Silva',
   *   email: 'maria@example.com',
   *   phone: '+5511999999999',
   *   // ... other fields
   * };
   * const client = await service.createClient(clientData, professionalId);
   */
  async createClient(
    data: CreateAestheticClientInput,
    professionalId: string,
  ): Promise<AestheticClientProfile> {
    // Implementation
  }
}
```

### README Documentation

````markdown
# Component README Template

## ClientList

A React component for displaying and managing a list of aesthetic clinic clients with search, filtering, and pagination capabilities.

### Features

- **Search**: Real-time search by client name or email
- **Filtering**: Filter by client status, skin type, and other attributes
- **Sorting**: Sort by name, creation date, or last visit
- **Virtual Scrolling**: Efficient rendering of large client lists
- **Responsive Design**: Works on mobile and desktop devices

### Usage

```tsx
import { ClientList } from '~/components/aesthetic/client-management/ClientList';

const MyComponent = () => {
  const [clients, setClients] = useState<ClientProfile[]>([]);

  return (
    <ClientList
      clients={clients}
      onClientSelect={clientId => console.log('Selected:', clientId)}
      loading={loading}
      error={error}
    />
  );
};
```
````

### Props

| Prop             | Type                         | Required | Default | Description                             |
| ---------------- | ---------------------------- | -------- | ------- | --------------------------------------- |
| `clients`        | `ClientProfile[]`            | Yes      | -       | Array of client profiles                |
| `onClientSelect` | `(clientId: string) => void` | Yes      | -       | Function called when client is selected |
| `loading`        | `boolean`                    | No       | `false` | Loading state                           |
| `error`          | `string                      | null`    | No      | `null`                                  |
| `className`      | `string`                     | No       | `""`    | Additional CSS classes                  |

### Accessibility

- Uses semantic HTML elements
- Supports keyboard navigation
- Screen reader friendly
- High contrast mode support

### Performance

- Implements virtual scrolling for large lists
- Memoizes expensive operations
- Uses React.memo for component optimization
- Lazy loading for images

````
## 🔄 Pull Request Process

### 1. Before Submitting
```bash
# Ensure your branch is up to date
git fetch upstream
git rebase upstream/main

# Run all tests
pnpm test

# Check code coverage
pnpm test:coverage

# Run linting
pnpm lint

# Build the project
pnpm build

# Check for security vulnerabilities
pnpm audit
````

### 2. Pull Request Template

```markdown
## 📋 Pull Request Description

### Changes

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

### Description

Brief description of what this PR does and why it's needed.

### Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

### How Has This Been Tested?

Please describe the tests that you ran to verify your changes.

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

### Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
- [ ] I have checked my code and corrected any misspellings

### Screenshots (if appropriate)

### Additional context

Add any other context about the problem here.
```

### 3. Automated Checks

Your PR will automatically run the following checks:

- **Build**: Ensures the project builds successfully
- **Tests**: Runs all unit, integration, and E2E tests
- **Linting**: Checks code style and formatting
- **Security**: Scans for vulnerabilities
- **Coverage**: Ensures test coverage requirements are met
- **Type Check**: Validates TypeScript types

## 👀 Review Process

### Review Criteria

Reviewers will check for:

- **Code Quality**: Clean, maintainable, and well-structured code
- **Performance**: Efficient algorithms and proper optimization
- **Security**: No vulnerabilities and proper data handling
- **Compliance**: Adherence to healthcare regulations (LGPD, ANVISA, CFM)
- **Testing**: Adequate test coverage and quality tests
- **Documentation**: Clear and comprehensive documentation
- **Accessibility**: WCAG compliance for UI components

### Review Levels

1. **Code Review**: At least one maintainer review required
2. **Security Review**: Required for authentication, authorization, or data handling changes
3. **Compliance Review**: Required for healthcare-related features
4. **Performance Review**: Required for performance-critical changes

### Review Timeline

- **Simple changes**: 1-2 business days
- **Complex features**: 3-5 business days
- **Breaking changes**: 5-7 business days

## 📦 Release Process

### Version Management

- Use [Semantic Versioning](https://semver.org/)
- `MAJOR.MINOR.PATCH` format
- Automated version bumping via CI/CD

### Release Checklist

```bash
# 1. Update version
npm version patch/minor/major

# 2. Create release branch
git checkout -b release/v1.0.0

# 3. Update changelog
# Update CHANGELOG.md with new version notes

# 4. Run final tests
pnpm test
pnpm build

# 5. Create pull request to main
git push origin release/v1.0.0

# 6. Merge and tag release
git tag v1.0.0
git push origin v1.0.0

# 7. Deploy to production
# Automated deployment via CI/CD
```

### Changelog Format

```markdown
## [1.0.0] - 2024-01-15

### Added

- Client profile management system
- Treatment planning and scheduling
- LGPD compliance features
- ANVISA product tracking
- Multi-professional coordination

### Changed

- Updated user authentication system
- Improved performance optimizations
- Enhanced security measures

### Fixed

- Client data encryption issues
- Appointment scheduling conflicts
- Mobile responsiveness problems

### Security

- Enhanced encryption for sensitive data
- Added audit logging for compliance
- Improved authentication security
```

## 🎯 Community Guidelines

### Communication

- Use GitHub issues for bug reports and feature requests
- Use GitHub discussions for general questions
- Join our Discord server for real-time chat
- Follow the project on Twitter for updates

### Issue Reporting

When reporting issues, please include:

- **Environment**: OS, Node.js version, browser
- **Steps to reproduce**: Clear reproduction steps
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Error messages**: Any error messages or stack traces
- **Screenshots**: Screenshots if relevant

### Feature Requests

When requesting features, please include:

- **Problem statement**: What problem you're trying to solve
- **Proposed solution**: How you envision the solution
- **Use cases**: Specific use cases for the feature
- **Alternatives considered**: Other solutions you've explored

## 🏆 Recognition

### Contributor Recognition

- All contributors are acknowledged in the project's README
- Major contributors may be invited to join the core team
- Outstanding contributions are featured in project updates

### Ways to Contribute

- **Code**: Bug fixes, new features, performance improvements
- **Documentation**: Guides, API docs, examples
- **Testing**: Unit tests, integration tests, E2E tests
- **Design**: UI/UX improvements, accessibility enhancements
- **Translation**: Multi-language support
- **Community**: Helping other users, reviewing PRs

Thank you for contributing to the NeonPro Aesthetic Clinic system! 🎉

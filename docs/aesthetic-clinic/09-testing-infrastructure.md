# Testing Infrastructure & Quality Assurance

## 🧪 Testing Architecture Overview

The aesthetic clinic system implements a comprehensive testing strategy ensuring reliability, compliance, and performance across all components while maintaining healthcare data protection requirements.

## 🏗️ Testing Architecture

### Testing Pyramid

```
Unit Tests (70%) - Individual component testing
Integration Tests (20%) - Component interaction testing
E2E Tests (10%) - Full workflow testing
Performance Tests - Continuous performance monitoring
Security Tests - Automated security validation
Compliance Tests - Regulatory requirement validation
```

## 🧪 Unit Testing Framework

### Testing Configuration

```typescript
// apps/api/src/__tests__/setup.ts
import { beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { TestEnvironment } from './test-environment';

// Test database setup
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/neonpro_test'
    }
  }
});

// Test environment configuration
export const testEnvironment = new TestEnvironment({
  database: testPrisma,
  redis: {
    url: process.env.TEST_REDIS_URL || 'redis://localhost:6379/1'
  },
  jwt: {
    secret: process.env.TEST_JWT_SECRET || 'test-secret-key'
  },
  encryption: {
    key: process.env.TEST_ENCRYPTION_KEY || 'test-encryption-key-32-bytes'
  }
});

// Global test setup
beforeEach(async () => {
  await testEnvironment.setup();
});

afterEach(async () => {
  await testEnvironment.cleanup();
});

// Test utilities
export const testUtils = {
  createTestUser: async (overrides = {}) => {
    return testEnvironment.createUser({
      email: 'test@example.com',
      name: 'Test User',
      role: 'professional',
      ...overrides
    });
  },
  
  createTestClient: async (overrides = {}) => {
    return testEnvironment.createClient({
      fullName: 'Test Client',
      email: 'client@example.com',
      phone: '+5511999999999',
      ...overrides
    });
  },
  
  createTestTreatment: async (clientId: string, overrides = {}) => {
    return testEnvironment.createTreatment({
      clientId,
      name: 'Test Treatment',
      description: 'Test treatment description',
      ...overrides
    });
  }
};
```

### Service Unit Tests

```typescript
// apps/api/src/__tests__/services/aesthetic-clinic-service.test.ts
import { AestheticClinicService } from '../services/aesthetic-clinic-service';
import { testPrisma, testUtils } from '../__tests__/setup';

describe('AestheticClinicService', () => {
  let aestheticClinicService: AestheticClinicService;

  beforeEach(() => {
    aestheticClinicService = new AestheticClinicService(testPrisma);
  });

  describe('createClient', () => {
    it('should create a new aesthetic client with valid data', async () => {
      const clientData = {
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        phone: '+5511999999999',
        cpf: '12345678900',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female' as const,
        skinType: 'mixed' as const,
        skinConcerns: ['acne', 'aging'],
        medicalHistory: {
          allergies: ['penicillin'],
          medications: ['ibuprofen'],
          conditions: ['hypertension']
        }
      };

      const result = await aestheticClinicService.createClient(clientData);

      expect(result).toMatchObject({
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        status: 'active'
      });

      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.lgpdConsent).toBe(true);
    });

    it('should validate CPF format', async () => {
      const invalidClientData = {
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        phone: '+5511999999999',
        cpf: 'invalid-cpf', // Invalid CPF
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female' as const
      };

      await expect(aestheticClinicService.createClient(invalidClientData))
        .rejects.toThrow('Invalid CPF format');
    });

    it('should enforce LGPD consent', async () => {
      const clientData = {
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        phone: '+5511999999999',
        cpf: '12345678900',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female' as const,
        lgpdConsent: false // No consent
      };

      await expect(aestheticClinicService.createClient(clientData))
        .rejects.toThrow('LGPD consent is required');
    });

    it('should hash sensitive data', async () => {
      const clientData = {
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        phone: '+5511999999999',
        cpf: '12345678900',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female' as const
      };

      const result = await aestheticClinicService.createClient(clientData);

      // CPF should be hashed in database
      expect(result.cpf).not.toBe('12345678900');
      expect(result.cpf).toMatch(/^\$2[aby]\$\d{1,2}\$/);
    });
  });

  describe('updateClient', () => {
    it('should update client information', async () => {
      const client = await testUtils.createTestClient();
      const updateData = {
        fullName: 'Maria Silva Santos',
        phone: '+5511988888888'
      };

      const result = await aestheticClinicService.updateClient(client.id, updateData);

      expect(result).toMatchObject({
        id: client.id,
        fullName: 'Maria Silva Santos',
        phone: '+5511988888888'
      });
    });

    it('should maintain audit trail', async () => {
      const client = await testUtils.createTestClient();
      const professional = await testUtils.createTestUser();

      const result = await aestheticClinicService.updateClient(
        client.id, 
        { fullName: 'Updated Name' },
        professional.id
      );

      expect(result.auditTrail).toHaveLength(1);
      expect(result.auditTrail[0]).toMatchObject({
        action: 'update',
        userId: professional.id,
        changes: expect.arrayContaining([
          expect.objectContaining({
            field: 'fullName',
            oldValue: 'Test Client',
            newValue: 'Updated Name'
          })
        ])
      });
    });
  });

  describe('getClientHistory', () => {
    it('should retrieve complete client history', async () => {
      const client = await testUtils.createTestClient();
      const treatment = await testUtils.createTestTreatment(client.id);
      const session = await testEnvironment.createSession({
        clientId: client.id,
        treatmentId: treatment.id,
        professionalId: (await testUtils.createTestUser()).id,
        date: new Date(),
        status: 'completed'
      });

      const history = await aestheticClinicService.getClientHistory(client.id);

      expect(history).toMatchObject({
        client: expect.objectContaining({
          id: client.id,
          fullName: 'Test Client'
        }),
        treatments: expect.arrayContaining([
          expect.objectContaining({
            id: treatment.id,
            name: 'Test Treatment'
          })
        ]),
        sessions: expect.arrayContaining([
          expect.objectContaining({
            id: session.id,
            status: 'completed'
          })
        ]),
        compliance: expect.objectContaining({
          lgpdConsent: true,
          dataRetentionCompliance: true
        })
      });
    });
  });
});
```

### Component Unit Tests

```typescript
// apps/web/src/components/__tests__/client-profile/ClientsList.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientsList } from '../client-profile/ClientsList';
import { createTestClient } from '../../../__tests__/utils/test-utils';

// Mock TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0
    }
  }
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ClientsList', () => {
  const mockClients = [
    createTestClient({ id: '1', fullName: 'Maria Silva', email: 'maria@example.com' }),
    createTestClient({ id: '2', fullName: 'João Santos', email: 'joao@example.com' }),
    createTestClient({ id: '3', fullName: 'Ana Oliveira', email: 'ana@example.com' })
  ];

  beforeEach(() => {
    // Mock API calls
    jest.spyOn(require('~/hooks/useClients'), 'useClients').mockReturnValue({
      data: mockClients,
      isLoading: false,
      error: null
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render list of clients', () => {
    renderWithProviders(<ClientsList />);

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('João Santos')).toBeInTheDocument();
    expect(screen.getByText('Ana Oliveira')).toBeInTheDocument();
  });

  it('should filter clients by search term', async () => {
    renderWithProviders(<ClientsList />);

    const searchInput = screen.getByPlaceholderText('Buscar clientes...');
    fireEvent.change(searchInput, { target: { value: 'Maria' } });

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.queryByText('João Santos')).not.toBeInTheDocument();
      expect(screen.queryByText('Ana Oliveira')).not.toBeInTheDocument();
    });
  });

  it('should sort clients by name', async () => {
    renderWithProviders(<ClientsList />);

    const sortSelect = screen.getByLabelText('Ordenar por');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    await waitFor(() => {
      const clientElements = screen.getAllByRole('listitem');
      expect(clientElements[0]).toHaveTextContent('Ana Oliveira');
      expect(clientElements[1]).toHaveTextContent('João Santos');
      expect(clientElements[2]).toHaveTextContent('Maria Silva');
    });
  });

  it('should handle client selection', async () => {
    const mockOnClientSelect = jest.fn();
    renderWithProviders(<ClientsList onClientSelect={mockOnClientSelect} />);

    const clientItem = screen.getByText('Maria Silva');
    fireEvent.click(clientItem);

    await waitFor(() => {
      expect(mockOnClientSelect).toHaveBeenCalledWith('1');
    });
  });

  it('should display loading state', () => {
    jest.spyOn(require('~/hooks/useClients'), 'useClients').mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    });

    renderWithProviders(<ClientsList />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display error state', () => {
    jest.spyOn(require('~/hooks/useClients'), 'useClients').mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load clients')
    });

    renderWithProviders(<ClientsList />);

    expect(screen.getByText('Erro ao carregar clientes')).toBeInTheDocument();
    expect(screen.getByText('Tente novamente mais tarde')).toBeInTheDocument();
  });

  it('should handle empty state', () => {
    jest.spyOn(require('~/hooks/useClients'), 'useClients').mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    renderWithProviders(<ClientsList />);

    expect(screen.getByText('Nenhum cliente encontrado')).toBeInTheDocument();
  });

  it('should format CPF correctly', () => {
    renderWithProviders(<ClientsList />);

    const cpfElements = screen.getAllByText(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
    expect(cpfElements).toHaveLength(mockClients.length);
  });

  it('should display client status badges', () => {
    renderWithProviders(<ClientsList />);

    const activeBadges = screen.getAllByText('Ativo');
    expect(activeBadges).toHaveLength(mockClients.length);
  });
});
```

## 🔗 Integration Testing

### API Integration Tests

```typescript
// apps/api/src/__tests__/integration/aesthetic-clinic-integration.test.ts
import { setupTestServer, closeTestServer } from '../__tests__/test-server';
import { TestClient } from '../__tests__/test-client';
import { testUtils } from '../__tests__/setup';

describe('Aesthetic Clinic API Integration', () => {
  let testClient: TestClient;
  let testServer: any;

  beforeAll(async () => {
    testServer = await setupTestServer();
    testClient = new TestClient(testServer.url);
  });

  afterAll(async () => {
    await closeTestServer(testServer);
  });

  describe('Client Management Flow', () => {
    it('should complete full client lifecycle', async () => {
      // 1. Create professional user
      const professional = await testUtils.createTestUser({
        email: 'professional@example.com',
        role: 'professional'
      });

      // 2. Login as professional
      const loginResponse = await testClient.login({
        email: 'professional@example.com',
        password: 'password123'
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.token).toBeDefined();

      // 3. Create new client
      const clientData = {
        fullName: 'Carla Mendes',
        email: 'carla.mendes@example.com',
        phone: '+5511977777777',
        cpf: '98765432100',
        dateOfBirth: '1985-05-15',
        gender: 'female',
        skinType: 'oily',
        skinConcerns: ['acne', 'scars'],
        medicalHistory: {
          allergies: [],
          medications: [],
          conditions: []
        },
        lgpdConsent: true
      };

      const createClientResponse = await testClient.createClient(clientData, loginResponse.data.token);
      expect(createClientResponse.status).toBe(201);
      expect(createClientResponse.data.client).toMatchObject({
        fullName: 'Carla Mendes',
        email: 'carla.mendes@example.com'
      });

      const clientId = createClientResponse.data.client.id;

      // 4. Update client
      const updateData = {
        phone: '+5511966666666',
        skinConcerns: ['acne', 'scars', 'pigmentation']
      };

      const updateResponse = await testClient.updateClient(
        clientId, 
        updateData, 
        loginResponse.data.token
      );

      expect(updateResponse.status)._be(200);
      expect(updateResponse.data.client.phone).toBe('+5511966666666');

      // 5. Get client details
      const getClientResponse = await testClient.getClient(clientId, loginResponse.data.token);
      expect(getClientResponse.status).toBe(200);
      expect(getClientResponse.data.client).toMatchObject({
        id: clientId,
        fullName: 'Carla Mendes',
        phone: '+5511966666666'
      });

      // 6. List clients
      const listClientsResponse = await testClient.listClients(loginResponse.data.token);
      expect(listClientsResponse.status).toBe(200);
      expect(listClientsResponse.data.clients).toHaveLength(1);
      expect(listClientsResponse.data.clients[0]).toMatchObject({
        id: clientId,
        fullName: 'Carla Mendes'
      });

      // 7. Delete client (soft delete)
      const deleteResponse = await testClient.deleteClient(clientId, loginResponse.data.token);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data.client.status).toBe('inactive');

      // 8. Verify client is inactive
      const getDeletedClientResponse = await testClient.getClient(clientId, loginResponse.data.token);
      expect(getDeletedClientResponse.status).toBe(200);
      expect(getDeletedClientResponse.data.client.status).toBe('inactive');
    });

    it('should handle concurrent client updates', async () => {
      const professional = await testUtils.createTestUser();
      const client = await testUtils.createTestClient();

      const loginResponse = await testClient.login({
        email: professional.email,
        password: 'password123'
      });

      // Simulate concurrent updates
      const update1 = testClient.updateClient(
        client.id,
        { fullName: 'Updated Name 1' },
        loginResponse.data.token
      );

      const update2 = testClient.updateClient(
        client.id,
        { phone: '+5511999999999' },
        loginResponse.data.token
      );

      const [result1, result2] = await Promise.all([update1, update2]);

      expect(result1.status).toBe(200);
      expect(result2.status).toBe(200);

      // Verify final state
      const finalClient = await testClient.getClient(client.id, loginResponse.data.token);
      expect(finalClient.data.client.fullName).toBe('Updated Name 1');
      expect(finalClient.data.client.phone).toBe('+5511999999999');
    });

    it('should validate business rules across API calls', async () => {
      const professional = await testUtils.createTestUser();
      const loginResponse = await testClient.login({
        email: professional.email,
        password: 'password123'
      });

      // Try to create client with duplicate email
      const clientData = {
        fullName: 'Test Client',
        email: professional.email, // Same as professional
        phone: '+5511999999999',
        cpf: '12345678900',
        dateOfBirth: '1990-01-01',
        gender: 'female',
        lgpdConsent: true
      };

      const response = await testClient.createClient(clientData, loginResponse.data.token);
      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Email already exists');
    });
  });

  describe('Treatment Management Integration', () => {
    it('should manage treatment sessions', async () => {
      const professional = await testUtils.createTestUser();
      const client = await testUtils.createTestClient();
      const loginResponse = await testClient.login({
        email: professional.email,
        password: 'password123'
      });

      // Create treatment
      const treatmentData = {
        clientId: client.id,
        name: 'Peeling Químico',
        description: 'Tratamento de peeling químico para acne',
        category: 'chemical',
        anvisaCode: 'ANVISA123',
        sessionCount: 4,
        intervalDays: 14,
        price: 800.00,
        duration: 60
      };

      const createTreatmentResponse = await testClient.createTreatment(
        treatmentData, 
        loginResponse.data.token
      );

      expect(createTreatmentResponse.status).toBe(201);
      const treatmentId = createTreatmentResponse.data.treatment.id;

      // Create sessions
      for (let i = 0; i < treatmentData.sessionCount; i++) {
        const sessionData = {
          treatmentId,
          professionalId: professional.id,
          date: new Date(Date.now() + i * treatmentData.intervalDays * 24 * 60 * 60 * 1000),
          status: 'scheduled'
        };

        const sessionResponse = await testClient.createSession(
          sessionData, 
          loginResponse.data.token
        );

        expect(sessionResponse.status).toBe(201);
      }

      // Get treatment with sessions
      const getTreatmentResponse = await testClient.getTreatment(
        treatmentId, 
        loginResponse.data.token
      );

      expect(getTreatmentResponse.status).toBe(200);
      expect(getTreatmentResponse.data.treatment.sessions).toHaveLength(4);
    });
  });
});
```

### Database Integration Tests

```typescript
// apps/api/src/__tests__/integration/database-integration.test.ts
import { PrismaClient } from '@prisma/client';
import { testPrisma } from '../__tests__/setup';
import { EncryptionService } from '../services/encryption-service';
import { LGPDService } from '../services/lgpd-service';

describe('Database Integration', () => {
  let prisma: PrismaClient;
  let encryptionService: EncryptionService;
  let lgpdService: LGPDService;

  beforeAll(() => {
    prisma = testPrisma;
    encryptionService = new EncryptionService();
    lgpdService = new LGPDService();
  });

  describe('Data Encryption', () => {
    it('should encrypt sensitive client data', async () => {
      const clientData = {
        fullName: 'Test Client',
        email: 'test@example.com',
        phone: '+5511999999999',
        cpf: '12345678900',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female',
        lgpdConsent: true
      };

      const client = await prisma.aestheticClientProfile.create({
        data: {
          ...clientData,
          cpf: await encryptionService.encrypt(clientData.cpf),
          phone: await encryptionService.encrypt(clientData.phone)
        }
      });

      // Verify data is encrypted in database
      const dbClient = await prisma.aestheticClientProfile.findUnique({
        where: { id: client.id }
      });

      expect(dbClient.cpf).not.toBe('12345678900');
      expect(dbClient.phone).not.toBe('+5511999999999');

      // Verify decryption works
      const decryptedCpf = await encryptionService.decrypt(dbClient.cpf);
      expect(decryptedCpf).toBe('12345678900');
    });

    it('should handle encryption at rest', async () => {
      const medicalData = {
        allergies: ['penicillin', 'sulfa'],
        medications: ['aspirin', 'lisinopril'],
        conditions: ['hypertension', 'diabetes'],
        notes: 'Patient has history of allergic reactions'
      };

      const encryptedData = await encryptionService.encrypt(JSON.stringify(medicalData));

      const treatment = await prisma.aestheticTreatment.create({
        data: {
          clientId: (await testUtils.createTestClient()).id,
          name: 'Test Treatment',
          medicalData: encryptedData
        }
      });

      const dbTreatment = await prisma.aestheticTreatment.findUnique({
        where: { id: treatment.id }
      });

      expect(dbTreatment.medicalData).toBe(encryptedData);

      const decryptedData = JSON.parse(await encryptionService.decrypt(dbTreatment.medicalData));
      expect(decryptedData).toEqual(medicalData);
    });
  });

  describe('Row Level Security', () => {
    it('should enforce RLS policies', async () => {
      const professional1 = await testUtils.createTestUser({ email: 'prof1@example.com' });
      const professional2 = await testUtils.createTestUser({ email: 'prof2@example.com' });
      const client1 = await testUtils.createTestClient({ professionalId: professional1.id });
      const client2 = await testUtils.createTestClient({ professionalId: professional2.id });

      // Test RLS with different professional contexts
      const clientsForProf1 = await prisma.aestheticClientProfile.findMany({
        where: {
          professionalId: professional1.id
        }
      });

      expect(clientsForProf1).toHaveLength(1);
      expect(clientsForProf1[0].id).toBe(client1.id);

      const clientsForProf2 = await prisma.aestheticClientProfile.findMany({
        where: {
          professionalId: professional2.id
        }
      });

      expect(clientsForProf2).toHaveLength(1);
      expect(clientsForProf2[0].id).toBe(client2.id);
    });
  });

  describe('Audit Trail', () => {
    it('should maintain audit trail for sensitive operations', async () => {
      const professional = await testUtils.createTestUser();
      const client = await testUtils.createTestClient();

      const auditLog = await prisma.auditLog.create({
        data: {
          userId: professional.id,
          action: 'update_client',
          entityType: 'AestheticClientProfile',
          entityId: client.id,
          changes: {
            old: { fullName: 'Old Name' },
            new: { fullName: 'New Name' }
          },
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        }
      });

      const retrievedLog = await prisma.auditLog.findUnique({
        where: { id: auditLog.id }
      });

      expect(retrievedLog).toMatchObject({
        userId: professional.id,
        action: 'update_client',
        entityType: 'AestheticClientProfile',
        entityId: client.id
      });

      expect(retrievedLog.changes).toEqual({
        old: { fullName: 'Old Name' },
        new: { fullName: 'New Name' }
      });
    });
  });

  describe('Data Integrity', () => {
    it('should enforce foreign key constraints', async () => {
      const client = await testUtils.createTestClient();

      await expect(
        prisma.aestheticTreatment.create({
          data: {
            clientId: 'non-existent-client-id',
            name: 'Test Treatment'
          }
        })
      ).rejects.toThrow();

      // Valid foreign key should work
      const treatment = await prisma.aestheticTreatment.create({
        data: {
          clientId: client.id,
          name: 'Test Treatment'
        }
      });

      expect(treatment.id).toBeDefined();
    });

    it('should enforce unique constraints', async () => {
      const clientData = {
        fullName: 'Test Client',
        email: 'unique@example.com',
        phone: '+5511999999999',
        cpf: '12345678900',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female',
        lgpdConsent: true
      };

      await prisma.aestheticClientProfile.create({ data: clientData });

      await expect(
        prisma.aestheticClientProfile.create({ data: clientData })
      ).rejects.toThrow();
    });
  });
});
```

## 🎭 E2E Testing

### Playwright Configuration

```typescript
// apps/web/e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

### E2E Test Examples

```typescript
// apps/web/e2e/client-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'professional@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await page.waitForURL('/dashboard');
  });

  test('should create new client', async ({ page }) => {
    // Navigate to clients page
    await page.click('[data-testid="clients-nav"]');
    await page.waitForURL('/clients');

    // Click add client button
    await page.click('[data-testid="add-client-button"]');
    
    // Fill client form
    await page.fill('[data-testid="fullName"]', 'Maria Silva');
    await page.fill('[data-testid="email"]', 'maria.silva@example.com');
    await page.fill('[data-testid="phone"]', '+5511999999999');
    await page.fill('[data-testid="cpf"]', '12345678900');
    await page.fill('[data-testid="dateOfBirth"]', '1990-01-01');
    await page.selectOption('[data-testid="gender"]', 'female');
    await page.selectOption('[data-testid="skinType"]', 'mixed');
    
    // Set skin concerns
    await page.click('[data-testid="skinConcerns-acne"]');
    await page.click('[data-testid="skinConcerns-aging"]');
    
    // Accept LGPD consent
    await page.click('[data-testid="lgpd-consent"]');
    
    // Submit form
    await page.click('[data-testid="submit-client"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toHaveText('Cliente criado com sucesso');
    
    // Verify client appears in list
    await page.waitForSelector('[data-testid="client-list"]');
    await expect(page.locator('[data-testid="client-item"]')).toContainText('Maria Silva');
  });

  test('should search and filter clients', async ({ page }) => {
    // Navigate to clients page
    await page.click('[data-testid="clients-nav"]');
    await page.waitForURL('/clients');

    // Search for specific client
    await page.fill('[data-testid="search-input"]', 'Maria');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Wait for search results
    await page.waitForSelector('[data-testid="client-item"]');
    const clientItems = await page.locator('[data-testid="client-item"]').all();
    
    // Verify search results
    expect(clientItems.length).toBeGreaterThan(0);
    for (const item of clientItems) {
      await expect(item).toContainText('Maria');
    }

    // Clear search
    await page.click('[data-testid="clear-search"]');
    
    // Filter by status
    await page.selectOption('[data-testid="status-filter"]', 'active');
    await page.waitForSelector('[data-testid="client-item"]');
    
    // Verify all shown clients are active
    const activeClients = await page.locator('[data-testid="client-item"]').all();
    for (const item of activeClients) {
      await expect(item.locator('[data-testid="status-badge"]')).toHaveText('Ativo');
    }
  });

  test('should view client details', async ({ page }) => {
    // Navigate to clients page
    await page.click('[data-testid="clients-nav"]');
    await page.waitForURL('/clients');

    // Click on first client
    await page.click('[data-testid="client-item"]:first-child');
    
    // Wait for client details page
    await page.waitForURL('/clients/**');
    await expect(page.locator('[data-testid="client-details"]')).toBeVisible();
    
    // Verify client information
    await expect(page.locator('[data-testid="client-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="client-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="client-phone"]')).toBeVisible();
    
    // Verify treatments tab
    await page.click('[data-testid="treatments-tab"]');
    await expect(page.locator('[data-testid="treatments-list"]')).toBeVisible();
    
    // Verify history tab
    await page.click('[data-testid="history-tab"]');
    await expect(page.locator('[data-testid="audit-trail"]')).toBeVisible();
  });

  test('should update client information', async ({ page }) => {
    // Navigate to clients page
    await page.click('[data-testid="clients-nav"]');
    await page.waitForURL('/clients');

    // Click on first client
    await page.click('[data-testid="client-item"]:first-child');
    await page.waitForURL('/clients/**');
    
    // Click edit button
    await page.click('[data-testid="edit-client-button"]');
    
    // Update client information
    await page.fill('[data-testid="phone"]', '+5511988888888');
    await page.selectOption('[data-testid="skinType"]', 'oily');
    
    // Save changes
    await page.click('[data-testid="save-client-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify updated information
    await expect(page.locator('[data-testid="client-phone"]')).toHaveText('+5511988888888');
  });

  test('should handle validation errors', async ({ page }) => {
    // Navigate to clients page
    await page.click('[data-testid="clients-nav"]');
    await page.waitForURL('/clients');

    // Click add client button
    await page.click('[data-testid="add-client-button"]');
    
    // Try to submit empty form
    await page.click('[data-testid="submit-client"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="error-fullName"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-cpf"]')).toBeVisible();
    
    // Fill invalid CPF
    await page.fill('[data-testid="cpf"]', 'invalid-cpf');
    await expect(page.locator('[data-testid="error-cpf"]')).toHaveText('CPF inválido');
  });

  test('should handle LGPD compliance', async ({ page }) => {
    // Navigate to clients page
    await page.click('[data-testid="clients-nav"]');
    await page.waitForURL('/clients');

    // Click add client button
    await page.click('[data-testid="add-client-button"]');
    
    // Fill form without LGPD consent
    await page.fill('[data-testid="fullName"]', 'Test Client');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="cpf"]', '12345678900');
    
    // Try to submit without consent
    await page.click('[data-testid="submit-client"]');
    
    // Verify LGPD consent error
    await expect(page.locator('[data-testid="error-lgpd"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-lgpd"]')).toHaveText('Consentimento LGPD obrigatório');
    
    // Accept consent and submit
    await page.click('[data-testid="lgpd-consent"]');
    await page.click('[data-testid="submit-client"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

### Performance E2E Tests

```typescript
// apps/web/e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load client list within acceptable time', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'professional@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to clients and measure load time
    const startTime = Date.now();
    await page.click('[data-testid="clients-nav"]');
    await page.waitForURL('/clients');
    await page.waitForSelector('[data-testid="client-list"]');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    console.log(`Client list loaded in ${loadTime}ms`);
  });

  test('should handle large client list efficiently', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'professional@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to clients
    await page.click('[data-testid="clients-nav"]');
    await page.waitForURL('/clients');
    
    // Wait for client list to load
    await page.waitForSelector('[data-testid="client-list"]');
    
    // Check for virtual scrolling (should not render all items at once)
    const clientItems = await page.locator('[data-testid="client-item"]').all();
    const totalClientsText = await page.locator('[data-testid="total-clients"]').textContent();
    const totalClients = parseInt(totalClientsText?.match(/\d+/)?.[0] || '0');
    
    // Virtual list should render fewer items than total
    expect(clientItems.length).toBeLessThan(totalClients);
    
    // Test scrolling performance
    const scrollStartTime = Date.now();
    await page.evaluate(() => {
      const container = document.querySelector('[data-testid="client-list-container"]');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
    
    await page.waitForTimeout(500); // Wait for scroll to complete
    const scrollTime = Date.now() - scrollStartTime;
    
    // Scrolling should be smooth
    expect(scrollTime).toBeLessThan(1000);
    console.log(`Scroll completed in ${scrollTime}ms`);
  });

  test('should maintain performance during search', async ({ page }) => {
    // Login and navigate to clients
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'professional@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="clients-nav"]');
    await page.waitForURL('/clients');
    await page.waitForSelector('[data-testid="client-list"]');
    
    // Test search performance
    const searchStartTime = Date.now();
    await page.fill('[data-testid="search-input"]', 'Maria');
    await page.waitForSelector('[data-testid="client-item"]:first-child');
    const searchTime = Date.now() - searchStartTime;
    
    // Search should complete within 1 second
    expect(searchTime).toBeLessThan(1000);
    console.log(`Search completed in ${searchTime}ms`);
    
    // Test search with more results
    const searchStartTime2 = Date.now();
    await page.fill('[data-testid="search-input"]', 'a');
    await page.waitForTimeout(500); // Wait for debounced search
    await page.waitForSelector('[data-testid="client-item"]:first-child');
    const searchTime2 = Date.now() - searchStartTime2;
    
    // Even broad search should be reasonable
    expect(searchTime2).toBeLessThan(2000);
    console.log(`Broad search completed in ${searchTime2}ms`);
  });
});
```

## 🔒 Security Testing

### Security Test Configuration

```typescript
// apps/api/src/__tests__/security/security-validation.test.ts
import { SecurityTestSuite } from '../__tests__/security/security-test-suite';
import { TestClient } from '../__tests__/test-client';

describe('Security Validation', () => {
  let securityTestSuite: SecurityTestSuite;
  let testClient: TestClient;

  beforeAll(() => {
    securityTestSuite = new SecurityTestSuite();
    testClient = new TestClient('http://localhost:3001');
  });

  describe('Authentication Security', () => {
    it('should prevent brute force attacks', async () => {
      const maxAttempts = 5;
      const lockoutTime = 15 * 60 * 1000; // 15 minutes

      // Attempt multiple failed logins
      for (let i = 0; i < maxAttempts; i++) {
        const response = await testClient.login({
          email: 'test@example.com',
          password: 'wrong-password'
        });

        if (i < maxAttempts - 1) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429); // Too Many Requests
        }
      }

      // Verify account lockout
      const lockedResponse = await testClient.login({
        email: 'test@example.com',
        password: 'correct-password'
      });

      expect(lockedResponse.status).toBe(429);
      expect(lockedResponse.data.error).toContain('Account locked');
    });

    it('should validate JWT tokens properly', async () => {
      // Test expired token
      const expiredToken = securityTestSuite.generateExpiredToken();
      const response = await testClient.getClients(expiredToken);

      expect(response.status).toBe(401);
      expect(response.data.error).toContain('Token expired');

      // Test invalid token
      const invalidToken = 'invalid-token';
      const invalidResponse = await testClient.getClients(invalidToken);

      expect(invalidResponse.status).toBe(401);
      expect(invalidResponse.data.error).toContain('Invalid token');
    });

    it('should enforce session timeouts', async () => {
      const user = await securityTestSuite.createTestUser();
      const loginResponse = await testClient.login({
        email: user.email,
        password: 'password123'
      });

      // Simulate session timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      const protectedResponse = await testClient.getClients(loginResponse.data.token);
      
      // Should still work within timeout
      expect(protectedResponse.status).toBe(200);
    });
  });

  describe('Input Validation', () => {
    it('should prevent SQL injection', async () => {
      const maliciousInput = {
        fullName: "Robert'); DROP TABLE users; --",
        email: "test@example.com",
        cpf: "12345678900"
      };

      const user = await securityTestSuite.createTestUser();
      const loginResponse = await testClient.login({
        email: user.email,
        password: 'password123'
      });

      const response = await testClient.createClient(maliciousInput, loginResponse.data.token);

      // Should reject malicious input
      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Invalid input');
    });

    it('should prevent XSS attacks', async () => {
      const xssPayload = {
        fullName: '<script>alert("XSS")</script>',
        email: 'test@example.com',
        cpf: '12345678900'
      };

      const user = await securityTestSuite.createTestUser();
      const loginResponse = await testClient.login({
        email: user.email,
        password: 'password123'
      });

      const response = await testClient.createClient(xssPayload, loginResponse.data.token);

      // Should reject or sanitize XSS payload
      expect(response.status).toBe(400);
    });

    it('should validate file uploads', async () => {
      const user = await securityTestSuite.createTestUser();
      const loginResponse = await testClient.login({
        email: user.email,
        password: 'password123'
      });

      // Test malicious file upload
      const maliciousFile = Buffer.from('malicious content');
      const response = await testClient.uploadDocument(
        'test.exe',
        maliciousFile,
        'application/x-executable',
        loginResponse.data.token
      );

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Invalid file type');
    });
  });

  describe('Authorization', () => {
    it('should enforce role-based access control', async () => {
      const professional = await securityTestSuite.createTestUser({ role: 'professional' });
      const receptionist = await securityTestSuite.createTestUser({ role: 'receptionist' });

      // Professional login
      const profLogin = await testClient.login({
        email: professional.email,
        password: 'password123'
      });

      // Receptionist login
      const recepLogin = await testClient.login({
        email: receptionist.email,
        password: 'password123'
      });

      // Test professional can access all client data
      const profClientResponse = await testClient.getClients(profLogin.data.token);
      expect(profClientResponse.status).toBe(200);

      // Test receptionist has limited access
      const recepClientResponse = await testClient.getClients(recepLogin.data.token);
      expect(recepClientResponse.status).toBe(200);

      // Test accessing other professional's data
      const otherProfData = await testClient.getProfessionalData(
        'other-prof-id',
        recepLogin.data.token
      );
      expect(otherProfData.status).toBe(403);
    });

    it('should validate data ownership', async () => {
      const professional1 = await securityTestSuite.createTestUser();
      const professional2 = await securityTestSuite.createTestUser();
      
      const client1 = await securityTestSuite.createTestClient({ professionalId: professional1.id });
      const client2 = await securityTestSuite.createTestClient({ professionalId: professional2.id });

      // Professional 1 login
      const login1 = await testClient.login({
        email: professional1.email,
        password: 'password123'
      });

      // Can access own client
      const ownClientResponse = await testClient.getClient(client1.id, login1.data.token);
      expect(ownClientResponse.status).toBe(200);

      // Cannot access other professional's client
      const otherClientResponse = await testClient.getClient(client2.id, login1.data.token);
      expect(otherClientResponse.status).toBe(403);
    });
  });

  describe('Data Protection', () => {
    it('should encrypt sensitive data at rest', async () => {
      const user = await securityTestSuite.createTestUser();
      const loginResponse = await testClient.login({
        email: user.email,
        password: 'password123'
      });

      const clientData = {
        fullName: 'Test Client',
        email: 'test@example.com',
        phone: '+5511999999999',
        cpf: '12345678900'
      };

      await testClient.createClient(clientData, loginResponse.data.token);

      // Verify data is encrypted in database
      const dbRecord = await securityTestSuite.getClientFromDatabase('test@example.com');
      expect(dbRecord.cpf).not.toBe('12345678900');
      expect(dbRecord.phone).not.toBe('+5511999999999');
    });

    it('should audit sensitive operations', async () => {
      const user = await securityTestSuite.createTestUser();
      const loginResponse = await testClient.login({
        email: user.email,
        password: 'password123'
      });

      const client = await securityTestSuite.createTestClient();

      // Update client
      await testClient.updateClient(
        client.id,
        { fullName: 'Updated Name' },
        loginResponse.data.token
      );

      // Verify audit log
      const auditLog = await securityTestSuite.getAuditLog(client.id);
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]).toMatchObject({
        action: 'update',
        userId: user.id,
        entityType: 'AestheticClientProfile'
      });
    });
  });
});
```

## 📊 Performance Testing

### Performance Test Suite

```typescript
// apps/api/src/__tests__/performance/load-testing.test.ts
import { LoadTestSuite } from '../__tests__/performance/load-test-suite';
import { PerformanceMonitor } from '../__tests__/performance/performance-monitor';

describe('Load Testing', () => {
  let loadTestSuite: LoadTestSuite;
  let performanceMonitor: PerformanceMonitor;

  beforeAll(() => {
    loadTestSuite = new LoadTestSuite();
    performanceMonitor = new PerformanceMonitor();
  });

  describe('Client List Performance', () => {
    it('should handle concurrent client list requests', async () => {
      const concurrentUsers = 50;
      const duration = 30000; // 30 seconds

      const results = await loadTestSuite.runLoadTest({
        endpoint: '/api/v1/clients',
        method: 'GET',
        concurrentUsers,
        duration,
        rampUpTime: 5000
      });

      expect(results.totalRequests).toBeGreaterThan(0);
      expect(results.successRate).toBeGreaterThan(0.95); // 95% success rate
      expect(results.averageResponseTime).toBeLessThan(1000); // < 1 second
      expect(results.errorRate).toBeLessThan(0.05); // < 5% error rate

      console.log(`Load Test Results:
        Total Requests: ${results.totalRequests}
        Success Rate: ${(results.successRate * 100).toFixed(2)}%
        Average Response Time: ${results.averageResponseTime}ms
        Error Rate: ${(results.errorRate * 100).toFixed(2)}%
      `);
    });

    it('should handle large client datasets', async () => {
      // Create test data
      await loadTestSuite.createTestData({
        clientsCount: 1000,
        treatmentsPerClient: 3,
        sessionsPerTreatment: 4
      });

      const response = await loadTestSuite.makeRequest({
        endpoint: '/api/v1/clients',
        method: 'GET',
        query: { limit: 100, offset: 0 }
      });

      expect(response.status).toBe(200);
      expect(response.data.clients).toHaveLength(100);
      expect(response.data.pagination.total).toBe(1000);

      // Test pagination performance
      const paginationStart = Date.now();
      for (let page = 0; page < 10; page++) {
        await loadTestSuite.makeRequest({
          endpoint: '/api/v1/clients',
          method: 'GET',
          query: { limit: 100, offset: page * 100 }
        });
      }
      const paginationTime = Date.now() - paginationStart;

      expect(paginationTime).toBeLessThan(5000); // < 5 seconds for 10 pages
      console.log(`Pagination completed in ${paginationTime}ms`);
    });

    it('should maintain performance under sustained load', async () => {
      const sustainedLoad = {
        endpoint: '/api/v1/clients',
        method: 'GET',
        requestsPerSecond: 10,
        duration: 120000 // 2 minutes
      };

      const metrics = await performanceMonitor.monitorLoad(sustainedLoad);

      expect(metrics.averageResponseTime.p95).toBeLessThan(2000); // 95th percentile < 2s
      expect(metrics.errorRate).toBeLessThan(0.02); // < 2% error rate
      expect(metrics.memoryUsage.leakDetected).toBe(false);

      console.log(`Sustained Load Metrics:
        P95 Response Time: ${metrics.averageResponseTime.p95}ms
        Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%
        Memory Leak Detected: ${metrics.memoryUsage.leakDetected}
      `);
    });
  });

  describe('Search Performance', () => {
    it('should handle search queries efficiently', async () => {
      const searchTerms = ['Maria', 'João', 'Silva', 'Santos', 'Oliveira'];
      const concurrentSearches = 20;

      const results = await loadTestSuite.runConcurrentSearches({
        endpoint: '/api/v1/clients/search',
        searchTerms,
        concurrentUsers: concurrentSearches
      });

      expect(results.averageResponseTime).toBeLessThan(500); // < 500ms
      expect(results.successRate).toBeGreaterThan(0.98);

      console.log(`Search Performance:
        Average Response Time: ${results.averageResponseTime}ms
        Success Rate: ${(results.successRate * 100).toFixed(2)}%
      `);
    });

    it('should handle complex filter combinations', async () => {
      const complexFilters = [
        { status: 'active', skinType: 'oily', concern: 'acne' },
        { status: 'inactive', gender: 'female', treatmentCount: { gt: 5 } },
        { status: 'active', dateRange: { start: '2023-01-01', end: '2023-12-31' } }
      ];

      const results = await loadTestSuite.testComplexFilters({
        endpoint: '/api/v1/clients',
        filters: complexFilters,
        iterations: 10
      });

      expect(results.averageResponseTime).toBeLessThan(1000);
      expect(results.successRate).toBe(1.0);
    });
  });

  describe('Database Performance', () => {
    it('should handle concurrent database operations', async () => {
      const dbOperations = [
        { type: 'create', count: 100 },
        { type: 'read', count: 500 },
        { type: 'update', count: 200 },
        { type: 'delete', count: 50 }
      ];

      const results = await performanceMonitor.testDatabaseOperations(dbOperations);

      expect(results.connectionPoolUsage).toBeLessThan(0.8); // < 80% pool usage
      expect(results.averageQueryTime).toBeLessThan(100); // < 100ms per query
      expect(results.deadlockCount).toBe(0);

      console.log(`Database Performance:
        Connection Pool Usage: ${(results.connectionPoolUsage * 100).toFixed(2)}%
        Average Query Time: ${results.averageQueryTime}ms
        Deadlock Count: ${results.deadlockCount}
      `);
    });

    it('should handle transaction rollbacks efficiently', async () => {
      const rollbackTest = {
        transactionSize: 10, // operations per transaction
        failureRate: 0.1, // 10% failure rate
        iterations: 100
      };

      const results = await performanceMonitor.testTransactionRollbacks(rollbackTest);

      expect(results.rollbackTime).toBeLessThan(100); // < 100ms per rollback
      expect(results.databaseConsistency).toBe(true);
    });
  });
});
```

## 🔧 Test Automation

### CI/CD Pipeline Configuration

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: neonpro_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd apps/api && npm ci
          cd ../web && npm ci
          cd ../../packages/database && npm ci

      - name: Setup database
        run: |
          npx prisma db push
          npx prisma generate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/neonpro_test

      - name: Run unit tests
        run: |
          npm test
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/neonpro_test
          REDIS_URL: redis://localhost:6379/1
          JWT_SECRET: test-secret
          ENCRYPTION_KEY: test-encryption-key-32-bytes

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: neonpro_test
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd apps/api && npm ci
          cd ../web && npm ci

      - name: Setup database
        run: |
          npx prisma db push
          npx prisma generate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/neonpro_test

      - name: Run integration tests
        run: npm run test:integration
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/neonpro_test
          REDIS_URL: redis://localhost:6379/1

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd apps/web && npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  security-tests:
    runs-on: ubuntu-latest
    needs: unit-tests

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd apps/api && npm ci

      - name: Run security tests
        run: npm run test:security
        env:
          NODE_ENV: test

      - name: Run OWASP ZAP scan
        uses: zaproxy/action-full-scan@v1
        with:
          target: 'http://localhost:3001'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'

  performance-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd apps/api && npm ci

      - name: Run performance tests
        run: npm run test:performance
        env:
          NODE_ENV: test

      - name: Generate performance report
        run: npm run performance:report

      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: performance-report/
```

This comprehensive testing infrastructure ensures the aesthetic clinic system maintains high quality, security, and performance standards while meeting healthcare compliance requirements.

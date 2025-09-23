# AI Scheduling System Testing Guide

## Overview

This comprehensive testing guide covers the testing strategy, tools, and procedures for the AI-Powered Appointment Scheduling System. The system employs a multi-layered testing approach to ensure reliability, performance, and compliance.

## Testing Philosophy

### Testing Pyramid

The testing strategy follows the traditional testing pyramid model:

```
                    ┌─────────────────┐
                    │   E2E Tests     │ ← 5% (Critical User Journeys)
                    │     (5%)        │
         ┌──────────┴─────────────────┴──────────┐
         │      Integration Tests               │ ← 20% (Service Interactions)
         │          (20%)                      │
    ┌────┴─────────────────────────────────────┴────┐
    │          Unit Tests                        │ ← 70% (Individual Components)
    │              (70%)                         │
    └─────────────────────────────────────────────┘
```

### Quality Gates

- **Test Coverage**: Minimum 90% code coverage for all services
- **Performance**: Response times < 100ms for 95% of requests
- **Reliability**: 99.9% uptime for critical services
- **Security**: Zero high-severity vulnerabilities in production
- **Compliance**: 100% LGPD compliance validation

## Testing Tools and Frameworks

### Frontend Testing

```json
{
  "testing": {
    "framework": "Vitest",
    "runner": "@vitest/runner",
    "environment": "jsdom",
    "setupFiles": ["./src/test-setup.ts"],
    "coverage": {
      "provider": "v8",
      "reporter": ["text", "json", "html"],
      "exclude": [
        "node_modules/",
        "src/test-setup.ts",
        "src/**/*.test.ts"
      ]
    }
  }
}
```

### Backend Testing

```json
{
  "scripts": {
    "test": "vitest --run",
    "test:watch": "vitest",
    "test:coverage": "vitest --run --coverage",
    "test:integration": "vitest --run tests/integration",
    "test:e2e": "playwright test",
    "test:performance": "k6 run tests/performance"
  }
}
```

## Test Structure

### Directory Structure

```
tests/
├── unit/                          # Unit tests (70%)
│   ├── services/
│   │   ├── ai-scheduling/
│   │   │   ├── ai-appointment-scheduling-service.test.ts
│   │   │   ├── realtime-availability-service.test.ts
│   │   │   ├── automated-reminder-service.test.ts
│   │   │   └── lgpd-appointment-compliance.test.ts
│   │   └── shared/
│   │       ├── database.test.ts
│   │       ├── cache.test.ts
│   │       └── security.test.ts
│   ├── components/
│   │   └── ai-scheduling/
│   │       └── copilot-scheduling-agent.test.tsx
│   └── utils/
│       ├── date-utils.test.ts
│       └── validation-utils.test.ts
├── integration/                   # Integration tests (20%)
│   ├── api/
│   │   ├── availability-api.test.ts
│   │   ├── scheduling-api.test.ts
│   │   └── compliance-api.test.ts
│   ├── database/
│   │   ├── appointment-repository.test.ts
│   │   └── data-consistency.test.ts
│   ├── websocket/
│   │   ├── real-time-updates.test.ts
│   │   └── subscription-management.test.ts
│   └── external/
│       ├── whatsapp-integration.test.ts
│       └── ai-provider-integration.test.ts
└── e2e/                          # End-to-end tests (5%)
    ├── scheduling-workflow.spec.ts
    ├── real-time-availability.spec.ts
    ├── lgpd-compliance.spec.ts
    └── performance.spec.ts
```

## Unit Testing

### AI Scheduling Service Tests

```typescript
// tests/unit/services/ai-scheduling/ai-appointment-scheduling-service.test.ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AIAppointmentSchedulingService } from "../../../../services/ai-appointment-scheduling-service";

describe("AIAppointmentSchedulingService", () => {
  let schedulingService: AIAppointmentSchedulingService;

  beforeEach(() => {
    vi.clearAllMocks();
    schedulingService = new AIAppointmentSchedulingService();
  });

  describe("No-show Prediction", () => {
    it("should calculate no-show probability with historical data", async () => {
      // Given
      const features: NoShowPredictionFeatures = {
        patientId: "patient-123",
        professionalId: "prof-456",
        // ... complete feature set
      };

      // When
      const result = await schedulingService.predictNoShow(features);

      // Then
      expect(result).toMatchObject({
        probability: expect.any(Number),
        confidence: expect.any(Number),
        riskLevel: expect.any(String),
        riskFactors: expect.any(Array),
        recommendations: expect.any(Array),
      });

      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(1);
    });

    it("should handle insufficient historical data gracefully", async () => {
      // Given
      const features: NoShowPredictionFeatures = {
        patientId: "new-patient",
        // ... minimal feature set
      };

      // When
      const result = await schedulingService.predictNoShow(features);

      // Then
      expect(result.riskFactors).toContain("insufficient_history");
      expect(result.recommendations).toContain("enhanced_monitoring");
    });

    it("should identify high-risk patients accurately", async () => {
      // Given
      const highRiskFeatures: NoShowPredictionFeatures = {
        patientId: "high-risk-patient",
        previousNoShowRate: 0.8,
        consecutiveCancellations: 3,
        // ... other risk factors
      };

      // When
      const result = await schedulingService.predictNoShow(highRiskFeatures);

      // Then
      expect(result.probability).toBeGreaterThan(0.6);
      expect(result.riskLevel).toBe("high");
    });
  });

  describe("Resource Optimization", () => {
    it("should optimize scheduling with resource constraints", async () => {
      // Given
      const optimization: SchedulingOptimization = {
        clinicId: "clinic-789",
        date: "2024-12-15",
        availableProfessionals: ["prof-456"],
        availableRooms: ["room-1"],
        // ... complete optimization parameters
      };

      // When
      const result = await schedulingService.optimizeScheduling(optimization);

      // Then
      expect(result.optimizedSchedule.length).toBeGreaterThan(0);
      expect(result.optimizationScore).toBeGreaterThan(0.7);
    });
  });
});
```

### LGPD Compliance Service Tests

```typescript
// tests/unit/services/ai-scheduling/lgpd-appointment-compliance.test.ts
describe("LGPDAppointmentComplianceService", () => {
  let complianceService: LGPDAppointmentComplianceService;

  beforeEach(() => {
    complianceService = new LGPDAppointmentComplianceService();
  });

  describe("Consent Management", () => {
    it("should validate appointment scheduling consent", async () => {
      // Given
      const appointmentId = "appointment-123";

      // When
      const result = await complianceService.validateAppointmentConsent(appointmentId);

      // Then
      expect(result).toMatchObject({
        isValid: expect.any(Boolean),
        consentRecords: expect.any(Array),
        riskFactors: expect.any(Array),
        recommendations: expect.any(Array),
      });
    });

    it("should detect expired consent", async () => {
      // Given
      const appointmentId = "appointment-with-expired-consent";

      // When
      const result = await complianceService.validateAppointmentConsent(appointmentId);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.riskFactors).toContain("expired_consent");
    });
  });

  describe("Data Subject Access Requests", () => {
    it("should process data access requests", async () => {
      // Given
      const request: LGPDDataAccessRequest = {
        patientId: "patient-456",
        requestType: "access",
        scope: ["appointments", "consents"],
        // ... complete request
      };

      // When
      const result = await complianceService.processDataAccessRequest(request);

      // Then
      expect(result.status).toBe("completed");
      expect(result.dataPackage).toBeDefined();
      expect(result.complianceScore).toBeGreaterThan(0.8);
    });
  });
});
```

### React Component Tests

```typescript
// tests/unit/components/ai-scheduling/copilot-scheduling-agent.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CopilotSchedulingAgent } from "../../../../components/ai-scheduling/copilot-scheduling-agent";

describe("CopilotSchedulingAgent", () => {
  it("should render initial greeting and patient info form", () => {
    // Given
    render(<CopilotSchedulingAgent clinicId="clinic-123" />);

    // Then
    expect(screen.getByText("Olá! Vou ajudar você a agendar sua consulta.")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("should validate patient information input", async () => {
    // Given
    render(<CopilotSchedulingAgent clinicId="clinic-123" />);

    // When
    const submitButton = screen.getByRole("button", { name: /continuar/i });
    fireEvent.click(submitButton);

    // Then
    expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
    expect(screen.getByText("Email é inválido")).toBeInTheDocument();
  });

  it("should accept valid patient information and advance workflow", async () => {
    // Given
    render(<CopilotSchedulingAgent clinicId="clinic-123" />);

    // When
    fireEvent.change(screen.getByLabelText("Nome completo"), {
      target: { value: "João Silva" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "joao.silva@email.com" },
    });
    fireEvent.change(screen.getByLabelText("Telefone"), {
      target: { value: "+5511999999999" },
    });

    const submitButton = screen.getByRole("button", { name: /continuar/i });
    fireEvent.click(submitButton);

    // Then
    await waitFor(() => {
      expect(mockCoAgent.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: "collecting_preferences",
          patientInfo: expect.objectContaining({
            fullName: "João Silva",
            email: "joao.silva@email.com",
          }),
        })
      );
    });
  });
});
```

## Integration Testing

### API Integration Tests

```typescript
// tests/integration/api/scheduling-api.test.ts
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { createServer } from "http";
import { api } from "../../../src/app";
import { prisma } from "../../../lib/prisma";

describe("Scheduling API Integration", () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    server = createServer(api);
    baseUrl = await startTestServer(server);
  });

  afterAll(async () => {
    await server.close();
  });

  describe("POST /ai-scheduling/predict-no-show", () => {
    it("should predict no-show probability with valid data", async () => {
      // Given
      const requestData = {
        patientId: "patient-123",
        professionalId: "prof-456",
        clinicId: "clinic-789",
        appointmentType: "consultation",
        scheduledHour: 14,
        dayOfWeek: 1,
        // ... complete feature set
      };

      // When
      const response = await fetch(`${baseUrl}/api/ai-scheduling/predict-no-show`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getTestToken()}`,
        },
        body: JSON.stringify(requestData),
      });

      // Then
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.probability).toBeGreaterThan(0);
    });

    it("should return validation error for invalid data", async () => {
      // Given
      const invalidData = {
        patientId: "", // Invalid
        professionalId: "prof-456",
      };

      // When
      const response = await fetch(`${baseUrl}/api/ai-scheduling/predict-no-show`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getTestToken()}`,
        },
        body: JSON.stringify(invalidData),
      });

      // Then
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
```

### Database Integration Tests

```typescript
// tests/integration/database/appointment-repository.test.ts
import { describe, expect, it, beforeEach } from "vitest";
import { AIAppointmentRepository } from "../../../../services/ai-appointment-repository";
import { resetTestDatabase, seedTestData } from "../../helpers/database";

describe("AIAppointmentRepository Integration", () => {
  let repository: AIAppointmentRepository;

  beforeEach(async () => {
    await resetTestDatabase();
    await seedTestData();
    repository = new AIAppointmentRepository();
  });

  describe("Query Optimization", () => {
    it("should retrieve appointments with AI-optimized queries", async () => {
      // Given
      const options: AIAppointmentQueryOptions = {
        patientId: "patient-123",
        dateRange: {
          start: new Date("2024-01-01"),
          end: new Date("2024-12-31"),
        },
        includeAnalytics: true,
        useCache: false,
      };

      // When
      const result = await repository.queryAppointments(options);

      // Then
      expect(result.appointments).toHaveLength(3);
      expect(result.analytics).toBeDefined();
      expect(result.performance.queryTime).toBeLessThan(100);
    });

    it("should handle complex filtering and sorting", async () => {
      // Given
      const options: AIAppointmentQueryOptions = {
        clinicId: "clinic-789",
        filters: {
          status: ["completed", "cancelled"],
          professionals: ["prof-456", "prof-789"],
          appointmentTypes: ["consultation", "procedure"],
        },
        sorting: {
          field: "scheduledFor",
          direction: "desc",
        },
        pagination: {
          page: 1,
          limit: 10,
        },
      };

      // When
      const result = await repository.queryAppointments(options);

      // Then
      expect(result.appointments).toHaveLength(5);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.totalPages).toBe(2);
    });
  });
});
```

### WebSocket Integration Tests

```typescript
// tests/integration/websocket/real-time-updates.test.ts
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { WebSocketServer } from "ws";
import { RealtimeAvailabilityService } from "../../../../services/realtime-availability-service";

describe("Real-time Updates Integration", () => {
  let wss: WebSocketServer;
  let service: RealtimeAvailabilityService;
  let clientWs: WebSocket;

  beforeEach(() => {
    wss = new WebSocketServer({ port: 0 });
    service = new RealtimeAvailabilityService();
    clientWs = new WebSocket(`ws://localhost:${wss.address().port}`);
  });

  afterEach(() => {
    clientWs.close();
    wss.close();
  });

  it("should handle availability updates and client notifications", async () => {
    // Given
    const update = {
      professionalId: "prof-123",
      date: "2024-12-16",
      availableSlots: [
        { startTime: "09:00", endTime: "10:00", available: false },
      ],
    };

    // When
    await service.broadcastAvailabilityUpdate(update);

    // Then
    await new Promise<void>((resolve) => {
      clientWs.on("message", (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe("availability_update");
        expect(message.payload.professionalId).toBe("prof-123");
        resolve();
      });
    });
  });
});
```

## End-to-End Testing

### Playwright E2E Tests

```typescript
// tests/e2e/scheduling-workflow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Appointment Scheduling Workflow", () => {
  test("complete scheduling workflow from start to finish", async ({ page }) => {
    // Given
    await page.goto("/scheduling");
    await page.waitForSelector('[data-testid="scheduling-container"]');

    // When - Patient Information
    await page.fill('[data-testid="patient-name"]', "João Silva");
    await page.fill('[data-testid="patient-email"]', "joao.silva@email.com");
    await page.fill('[data-testid="patient-phone"]', "+5511999999999");
    await page.fill('[data-testid="patient-dob"]', "1990-05-15");
    await page.click('[data-testid="continue-button"]');

    // Then - Preferences Screen
    await expect(page.locator('[data-testid="preferences-form"]')).toBeVisible();
    await page.selectOption('[data-testid="appointment-type"]', "consultation");
    await page.selectOption('[data-testid="time-preference"]', "afternoon");
    await page.check('[data-testid="day-monday"]');
    await page.check('[data-testid="day-wednesday"]');
    await page.click('[data-testid="search-slots-button"]');

    // Then - Availability Display
    await expect(page.locator('[data-testid="availability-slots"]')).toBeVisible();
    await page.click('[data-testid="slot-first-available"]');
    await page.click('[data-testid="confirm-slot-button"]');

    // Then - Confirmation Screen
    await expect(page.locator('[data-testid="confirmation-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointment-summary"]')).toContainText("João Silva");
    await page.check('[data-testid="lgpd-consent"]');
    await page.click('[data-testid="confirm-appointment-button"]');

    // Then - Success Screen
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointment-id"]')).toBeVisible();
  });

  test("should handle real-time availability updates", async ({ page }) => {
    // Given
    await page.goto("/scheduling");
    await page.waitForSelector('[data-testid="scheduling-container"]');

    // When - Start scheduling process
    await page.fill('[data-testid="patient-name"]', "Maria Santos");
    await page.fill('[data-testid="patient-email"]', "maria.santos@email.com");
    await page.click('[data-testid="continue-button"]');

    // Then - Navigate to availability
    await page.selectOption('[data-testid="appointment-type"]', "consultation");
    await page.click('[data-testid="search-slots-button"]');

    // When - Simulate real-time update
    await page.evaluate(() => {
      // Simulate WebSocket message
      const event = new MessageEvent("message", {
        data: JSON.stringify({
          type: "availability_update",
          payload: {
            professionalId: "prof-123",
            date: "2024-12-16",
            availableSlots: [
              { startTime: "09:00", endTime: "10:00", available: false },
            ],
          },
        }),
      });
      
      window.dispatchEvent(new CustomEvent("websocket-message", { detail: event }));
    });

    // Then - UI should update in real-time
    await expect(page.locator('[data-testid="slot-09:00"]')).toHaveClass(/unavailable/);
    await expect(page.locator('[data-testid="notification"]')).toBeVisible();
  });
});
```

### Performance E2E Tests

```typescript
// tests/e2e/performance.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Performance Testing", () => {
  test("should handle high load scheduling scenarios", async ({ page }) => {
    // Given
    await page.goto("/scheduling");

    // When - Measure load time
    const loadTime = await page.measureLoadTime();
    expect(loadTime).toBeLessThan(3000); // 3 seconds max

    // When - Simulate multiple concurrent users
    const concurrentUsers = 10;
    const promises = Array(concurrentUsers).fill(0).map((_, i) => 
      simulateUserScheduling(page, `user-${i}`)
    );

    const results = await Promise.allSettled(promises);

    // Then - All users should complete successfully
    const successRate = results.filter(r => r.status === "fulfilled").length / results.length;
    expect(successRate).toBeGreaterThan(0.9);

    // And - Response times should be acceptable
    const responseTimes = await Promise.all(
      Array(5).fill(0).map(() => page.measureResponseTime())
    );
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    expect(avgResponseTime).toBeLessThan(500); // 500ms max
  });

  async function simulateUserScheduling(page: Page, userId: string) {
    await page.fill('[data-testid="patient-name"]', `User ${userId}`);
    await page.fill('[data-testid="patient-email"]`, `user${userId}@email.com`);
    await page.click('[data-testid="continue-button"]');
    
    await page.selectOption('[data-testid="appointment-type"]', "consultation");
    await page.click('[data-testid="search-slots-button"]');
    
    await page.click('[data-testid="slot-first-available"]');
    await page.click('[data-testid="confirm-slot-button"]');
    
    await page.check('[data-testid="lgpd-consent"]');
    await page.click('[data-testid="confirm-appointment-button"]');
    
    await page.waitForSelector('[data-testid="success-message"]');
  }
});
```

## Performance Testing

### Load Testing with k6

```javascript
// tests/performance/scheduling-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],  // <1% error rate
  },
};

const BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'test-token';

export default function () {
  // Test availability endpoint
  const availabilityResponse = http.get(
    `${BASE_URL}/availability/professional/prof-123?date=2024-12-16`,
    {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
    }
  );

  check(availabilityResponse, {
    'availability status is 200': (r) => r.status === 200,
    'availability response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Test no-show prediction endpoint
  const predictionResponse = http.post(
    `${BASE_URL}/ai-scheduling/predict-no-show`,
    JSON.stringify({
      patientId: `patient-${__VU}`,
      professionalId: 'prof-123',
      clinicId: 'clinic-789',
      appointmentType: 'consultation',
      scheduledHour: 14,
      dayOfWeek: 1,
      // ... minimal feature set
    }),
    {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  check(predictionResponse, {
    'prediction status is 200': (r) => r.status === 200,
    'prediction response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
```

### Memory Leak Testing

```typescript
// tests/performance/memory-leak.test.ts
import { describe, expect, it, beforeEach } from "vitest";
import { AIAppointmentSchedulingService } from "../../../services/ai-appointment-scheduling-service";

describe("Memory Leak Testing", () => {
  let service: AIAppointmentSchedulingService;
  let initialMemory: number;

  beforeEach(() => {
    service = new AIAppointmentSchedulingService();
    initialMemory = process.memoryUsage().heapUsed;
  });

  it("should not leak memory during repeated no-show predictions", async () => {
    // Given
    const iterations = 1000;
    const features: NoShowPredictionFeatures = {
      patientId: "test-patient",
      professionalId: "test-professional",
      // ... minimal feature set
    };

    // When
    for (let i = 0; i < iterations; i++) {
      await service.predictNoShow(features);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    }

    // Then
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    const memoryIncreasePerIteration = memoryIncrease / iterations;

    console.log(`Memory increase per iteration: ${memoryIncreasePerIteration} bytes`);
    expect(memoryIncreasePerIteration).toBeLessThan(1024); // < 1KB per iteration
  });

  it("should properly clean up WebSocket subscriptions", async () => {
    // Given
    const subscriptions = Array(100).fill(0).map((_, i) => ({
      id: `sub-${i}`,
      clientId: `client-${i}`,
      professionalIds: ["prof-123"],
      clinicId: "clinic-789",
      dateRange: { start: "2024-12-16", end: "2024-12-20" },
      filters: {},
      active: true,
      createdAt: new Date(),
    }));

    // When - Add subscriptions
    for (const sub of subscriptions) {
      await service.addSubscription(sub);
    }

    // When - Remove subscriptions
    for (const sub of subscriptions) {
      await service.removeSubscription(sub.id);
    }

    // Then - Memory should be cleaned up
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    expect(memoryIncrease).toBeLessThan(1024 * 100); // < 100KB total
  });
});
```

## Security Testing

### LGPD Compliance Testing

```typescript
// tests/security/lgpd-compliance.test.ts
import { describe, expect, it, beforeEach } from "vitest";
import { LGPDAppointmentComplianceService } from "../../../services/lgpd-appointment-compliance-service";

describe("LGPD Compliance Testing", () => {
  let complianceService: LGPDAppointmentComplianceService;

  beforeEach(() => {
    complianceService = new LGPDAppointmentComplianceService();
  });

  describe("Data Anonymization", () => {
    it("should properly anonymize patient data", async () => {
      // Given
      const sensitiveData = {
        id: "patient-123",
        fullName: "João Silva Santos",
        email: "joao.silva@email.com",
        phonePrimary: "+5511999999999",
        address: "Rua das Flores, 123, São Paulo, SP",
        dateOfBirth: new Date("1990-05-15"),
      };

      // When
      const anonymizedData = await complianceService.anonymizePatientData(sensitiveData);

      // Then
      expect(anonymizedData.fullName).not.toBe("João Silva Santos");
      expect(anonymizedData.email).not.toBe("joao.silva@email.com");
      expect(anonymizedData.phonePrimary).not.toBe("+5511999999999");
      expect(anonymizedData.id).toBe("patient-123"); // ID preserved for referential integrity
    });

    it("should handle different anonymization levels", async () => {
      // Given
      const testData = {
        fullName: "Maria Oliveira Santos",
        email: "maria.oliveira@email.com",
        phone: "+5511988888888",
      };

      // When - Test different anonymization levels
      const minimalAnonymization = await complianceService.anonymizeData(testData, "minimal");
      const standardAnonymization = await complianceService.anonymizeData(testData, "standard");
      const completeAnonymization = await complianceService.anonymizeData(testData, "complete");

      // Then
      expect(minimalAnonymization.fullName).not.toBe(testData.fullName);
      expect(standardAnonymization.email).not.toBe(testData.email);
      expect(completeAnonymization.phone).not.toBe(testData.phone);
      expect(completeAnonymization.fullName).not.toContain("Maria");
    });
  });

  describe("Consent Validation", () => {
    it("should detect consent violations", async () => {
      // Given
      const appointmentData = {
        patientId: "patient-456",
        professionalId: "prof-789",
        clinicId: "clinic-123",
        scheduledFor: new Date(),
      };

      // When
      const violations = await complianceService.detectConsentViolations(appointmentData);

      // Then
      expect(Array.isArray(violations)).toBe(true);
      
      if (violations.length > 0) {
        expect(violations[0]).toMatchObject({
          type: expect.any(String),
          severity: expect.any(String),
          description: expect.any(String),
          recommendation: expect.any(String),
        });
      }
    });

    it("should validate consent expiration", async () => {
      // Given
      const expiredConsent = {
        id: "consent-123",
        patientId: "patient-456",
        consentType: "appointment_scheduling",
        givenAt: new Date("2023-01-01"),
        expiresAt: new Date("2023-12-31"), // Expired
        isValid: false,
      };

      // When
      const validation = await complianceService.validateConsentRecord(expiredConsent);

      // Then
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain("consent_expired");
    });
  });

  describe("Data Access Request Processing", () => {
    it("should securely handle data access requests", async () => {
      // Given
      const accessRequest = {
        patientId: "patient-789",
        requestType: "access",
        scope: ["appointments", "consents"],
        identityVerification: {
          method: "two_factor",
          verified: true,
        },
      };

      // When
      const result = await complianceService.processDataAccessRequest(accessRequest);

      // Then
      expect(result.status).toBe("completed");
      expect(result.complianceScore).toBeGreaterThan(0.8);
      expect(result.dataPackage).toBeDefined();
      
      // Verify no sensitive data is leaked
      expect(result.logs).not.toContain("password");
      expect(result.logs).not.toContain("token");
    });
  });
});
```

## Test Data Management

### Test Database Seeding

```typescript
// tests/helpers/database-seeding.ts
import { PrismaClient } from "@prisma/client";

export async function seedTestData() {
  const prisma = new PrismaClient();

  try {
    // Seed test patients
    await prisma.patient.createMany({
      data: [
        {
          id: "patient-123",
          fullName: "João Silva",
          email: "joao.silva@email.com",
          phonePrimary: "+5511999999999",
          dateOfBirth: new Date("1990-05-15"),
          lgpdConsentGiven: true,
        },
        {
          id: "patient-456",
          fullName: "Maria Santos",
          email: "maria.santos@email.com",
          phonePrimary: "+5511988888888",
          dateOfBirth: new Date("1985-08-20"),
          lgpdConsentGiven: true,
        },
      ],
    });

    // Seed test professionals
    await prisma.professional.createMany({
      data: [
        {
          id: "prof-123",
          fullName: "Dr. Carlos Silva",
          specialization: "dermatology",
          email: "carlos.silva@clinic.com.br",
          schedule: {
            monday: ["09:00-12:00", "14:00-18:00"],
            tuesday: ["09:00-12:00", "14:00-18:00"],
            wednesday: ["09:00-12:00", "14:00-18:00"],
            thursday: ["09:00-12:00", "14:00-18:00"],
            friday: ["09:00-12:00", "14:00-18:00"],
          },
          maxDailyAppointments: 12,
        },
      ],
    });

    // Seed test clinics
    await prisma.clinic.create({
      data: {
        id: "clinic-789",
        name: "Clínica Teste",
        address: "Rua Teste, 123",
        operatingHours: {
          monday: "08:00-19:00",
          tuesday: "08:00-19:00",
          wednesday: "08:00-19:00",
          thursday: "08:00-19:00",
          friday: "08:00-19:00",
          saturday: "09:00-13:00",
          sunday: "closed",
        },
      },
    });

    // Seed LGPD consent records
    await prisma.lGPDConsent.createMany({
      data: [
        {
          id: "consent-123",
          patientId: "patient-123",
          consentType: "appointment_scheduling",
          dataCategories: ["personal_data", "health_data"],
          purposes: ["scheduling", "treatment"],
          givenAt: new Date("2024-01-01"),
          expiresAt: new Date("2025-01-01"),
          isValid: true,
          documentHash: "hash-123",
        },
      ],
    });

    console.log("Test data seeded successfully");
  } catch (error) {
    console.error("Error seeding test data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function resetTestDatabase() {
  const prisma = new PrismaClient();

  try {
    // Delete test data in correct order to respect foreign keys
    await prisma.lGPDConsent.deleteMany({
      where: {
        patientId: {
          in: ["patient-123", "patient-456"],
        },
      },
    });

    await prisma.appointment.deleteMany({
      where: {
        patientId: {
          in: ["patient-123", "patient-456"],
        },
      },
    });

    await prisma.professional.deleteMany({
      where: {
        id: {
          in: ["prof-123"],
        },
      },
    });

    await prisma.clinic.deleteMany({
      where: {
        id: {
          in: ["clinic-789"],
        },
      },
    });

    await prisma.patient.deleteMany({
      where: {
        id: {
          in: ["patient-123", "patient-456"],
        },
      },
    });

    console.log("Test database reset successfully");
  } catch (error) {
    console.error("Error resetting test database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
```

## Test Configuration

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test-setup.ts",
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
      ],
      include: ["src/**/*"],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    // Test timeout
    testTimeout: 10000,
    // Hook timeout
    hookTimeout: 10000,
    // Global test setup
    globalSetup: "./tests/global-setup.ts",
    // Global test teardown
    globalTeardown: "./tests/global-teardown.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/tests": path.resolve(__dirname, "./tests"),
    },
  },
});
```

### Test Setup File

```typescript
// src/test-setup.ts
import { vi } from "vitest";
import { prisma } from "./lib/prisma";

// Mock Prisma
vi.mock("./lib/prisma", () => ({
  prisma: createMockPrisma(),
}));

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/neonpro_test";
process.env.REDIS_URL = "redis://localhost:6379/0";
process.env.JWT_SECRET = "test-secret-key";

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor(url: string) {
    setTimeout(() => {
      if (this.onopen) this.onopen(new Event("open"));
    }, 0);
  }

  send = vi.fn();
  close = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
};

// Setup global test utilities
global.describe = describe;
global.it = it;
global.test = test;
global.expect = expect;
global.vi = vi;

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});

function createMockPrisma() {
  return {
    appointment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    patient: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    professional: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    clinic: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    lGPDConsent: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  };
}
```

## Running Tests

### Local Development

```bash
# Run all tests
bun test

# Run with coverage
bun run test:coverage

# Run specific test files
bun test ai-scheduling

# Run integration tests only
bun test:integration

# Run E2E tests
bun test:e2e

# Watch mode for development
bun test:watch
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test AI Scheduling System

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: neonpro_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:6-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "bun"

      - name: Install dependencies
        run: bun install

      - name: Run database migrations
        run: bun run prisma:migrate:deploy

      - name: Run unit tests
        run: bun test --coverage

      - name: Run integration tests
        run: bun test:integration

      - name: Run E2E tests
        run: bun test:e2e

      - name: Run performance tests
        run: bun test:performance

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: ai-scheduling
          name: ai-scheduling-coverage

      - name: Upload test artifacts
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            coverage/
            test-results/
            playwright-report/
```

## Test Reports and Analytics

### Coverage Report Analysis

The testing suite generates comprehensive coverage reports:

```
coverage/
├── lcov.info                 # Coverage data
├── lcov-report/              # HTML coverage report
│   └── index.html           # Main coverage report
├── coverage-final.json       # JSON coverage data
└── coverage-summary.json     # Coverage summary
```

### Performance Metrics

Key performance metrics tracked:

- **Response Times**: API endpoint performance under load
- **Memory Usage**: Memory allocation and garbage collection
- **Database Performance**: Query optimization and indexing
- **WebSocket Performance**: Real-time update latency
- **Error Rates**: Failure rates and error distribution

### Quality Metrics

- **Test Coverage**: Minimum 90% coverage requirement
- **Code Quality**: Static analysis results
- **Security**: Vulnerability scan results
- **Compliance**: LGPD compliance validation
- **Accessibility**: WCAG 2.1 AA compliance

## Continuous Testing Strategy

### Pre-Commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "bun run lint-staged",
      "pre-push": "bun run test:coverage"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "bun run lint",
      "bun run type-check",
      "bun test --related --passWithNoTests"
    ]
  }
}
```

### Monitoring and Alerting

- **Test Failures**: Immediate alerts on test failures
- **Coverage Drops**: Alerts when coverage falls below thresholds
- **Performance Regression**: Alerts on performance degradation
- **Security Issues**: Immediate alerts for security vulnerabilities

## Best Practices

### Test Writing Guidelines

1. **AAA Pattern**: Arrange-Act-Assert structure
2. **Descriptive Names**: Clear, descriptive test names
3. **Isolation**: Each test should be independent
4. **Mocking**: Mock external dependencies
5. **Assertions**: Specific, meaningful assertions
6. **Error Handling**: Test error scenarios
7. **Edge Cases**: Test boundary conditions
8. **Performance**: Include performance assertions

### Mocking Strategy

```typescript
// Good mocking example
vi.mock("../../../lib/prisma", () => ({
  prisma: {
    appointment: {
      findMany: vi.fn().mockResolvedValue(mockAppointments),
      create: vi.fn().mockResolvedValue(mockAppointment),
    },
  },
}));

// Bad practice - mocking implementation details
vi.mock("../../../services/ai-service", () => ({
  predictNoShow: vi.fn().mockReturnValue(0.5),
}));
```

### Test Data Management

- **Factories**: Use factory functions for test data
- **Cleanup**: Proper cleanup after each test
- **Transactions**: Use database transactions for isolation
- **Seeding**: Consistent test data seeding
- **Reset**: Complete database reset between test suites

## Troubleshooting

### Common Issues

**Flaky Tests**:
- Identify async timing issues
- Use proper waiting strategies
- Isolate external dependencies
- Check for race conditions

**Slow Tests**:
- Optimize database queries
- Use mocking for external services
- Parallelize test execution
- Reduce test data complexity

**Memory Issues**:
- Check for memory leaks
- Proper cleanup of resources
- Monitor garbage collection
- Use memory profiling tools

### Debug Tools

- **Vitest UI**: Interactive test debugging
- **Playwright Inspector**: E2E test debugging
- **Chrome DevTools**: Performance profiling
- **Node.js Inspector**: Backend debugging
- **Database Logs**: Query performance analysis
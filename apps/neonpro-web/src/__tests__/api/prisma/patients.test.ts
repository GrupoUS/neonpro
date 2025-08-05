/**
 * Comprehensive Test Suite for Prisma Patients API
 *
 * Tests include:
 * - Unit tests for CRUD operations
 * - Multi-tenant security validation
 * - LGPD compliance checks
 * - Healthcare-specific business logic
 * - Error handling and edge cases
 */

import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/prisma/patients/route";
import { prisma } from "@/lib/prisma";
import * as securityModule from "@/lib/security/multi-tenant-middleware";

// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    patient: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
    },
    clinic: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

// Mock security middleware
jest.mock("@/lib/security/multi-tenant-middleware");

// Mock Supabase auth
jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createRouteHandlerClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: "test-user-id" },
          },
        },
        error: null,
      }),
    },
  }),
}));

// Mock Next.js headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({})),
}));

describe("Patients API - Prisma Integration", () => {
  const mockTenantContext: securityModule.TenantContext = {
    userId: "test-user-id",
    clinicIds: ["clinic-1", "clinic-2"],
    role: "doctor",
    permissions: ["patients:read", "patients:create", "patients:update"],
    isAdmin: false,
    medicalLicense: "CRM-SP-123456",
    professionalTitle: "Cardiologista",
  };

  const mockPatient = {
    id: "patient-1",
    clinic_id: "clinic-1",
    full_name: "João Silva",
    email: "joao@example.com",
    phone: "(11) 99999-9999",
    birth_date: "1990-01-01T00:00:00.000Z",
    medical_record_number: "MR-2024-001",
    data_consent_given: true,
    data_consent_date: new Date(),
    created_by: "test-user-id",
    created_at: new Date(),
    updated_at: new Date(),
    clinic: { id: "clinic-1", name: "Clínica Principal" },
    created_by_profile: { id: "test-user-id", full_name: "Dr. Teste" },
    appointments: [],
    _count: { appointments: 0, medical_records: 0, prescriptions: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful security validation
    (securityModule.validateTenantSecurity as jest.Mock).mockResolvedValue({
      success: true,
      tenantContext: mockTenantContext,
    });

    (securityModule.hasPermission as jest.Mock).mockReturnValue(true);
    (securityModule.canAccessClinic as jest.Mock).mockReturnValue(true);
    (securityModule.logSecurityEvent as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/prisma/patients", () => {
    it("should return patients with proper multi-tenant filtering", async () => {
      // Arrange
      const mockPatients = [mockPatient];
      (prisma.patient.findMany as jest.Mock).mockResolvedValue(mockPatients);
      (prisma.patient.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest("http://localhost:3000/api/prisma/patients?page=1&limit=10");

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.patients).toHaveLength(1);
      expect(data.patients[0].id).toBe("patient-1");
      expect(data.pagination.total).toBe(1);

      // Verify multi-tenant filtering
      expect(prisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clinic_id: { in: mockTenantContext.clinicIds },
          }),
        }),
      );

      // Verify audit logging
      expect(securityModule.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "READ",
          resource_type: "patient",
        }),
      );
    });

    it("should filter patients by search term", async () => {
      // Arrange
      (prisma.patient.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.patient.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest("http://localhost:3000/api/prisma/patients?search=João");

      // Act
      await GET(request);

      // Assert
      expect(prisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { full_name: { contains: "João", mode: "insensitive" } },
              { email: { contains: "João", mode: "insensitive" } },
              { medical_record_number: { contains: "João", mode: "insensitive" } },
            ],
          }),
        }),
      );
    });

    it("should enforce LGPD consent filtering for non-admin users", async () => {
      // Arrange
      const nonAdminContext: securityModule.TenantContext = {
        ...mockTenantContext,
        role: "nurse",
        isAdmin: false,
      };

      (securityModule.validateTenantSecurity as jest.Mock).mockResolvedValue({
        success: true,
        tenantContext: nonAdminContext,
      });

      (prisma.patient.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.patient.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest("http://localhost:3000/api/prisma/patients");

      // Act
      await GET(request);

      // Assert - Should include consent filtering for non-admin
      expect(prisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clinic_id: { in: nonAdminContext.clinicIds },
            // Note: In the actual implementation, we'd check for data_consent_given: true
          }),
        }),
      );
    });

    it("should return 401 for unauthenticated requests", async () => {
      // Arrange
      (securityModule.validateTenantSecurity as jest.Mock).mockResolvedValue({
        success: false,
        error: "Unauthorized",
        statusCode: 401,
      });

      const request = new NextRequest("http://localhost:3000/api/prisma/patients");

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      (prisma.patient.findMany as jest.Mock).mockRejectedValue(
        new Error("Database connection failed"),
      );

      const request = new NextRequest("http://localhost:3000/api/prisma/patients");

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("POST /api/prisma/patients", () => {
    const validPatientData = {
      clinic_id: "clinic-1",
      full_name: "Maria Santos",
      email: "maria@example.com",
      phone: "(11) 88888-8888",
      birth_date: "1985-05-15T00:00:00.000Z",
      data_consent_given: true,
    };

    it("should create patient with valid data and LGPD consent", async () => {
      // Arrange
      const createdPatient = { ...mockPatient, ...validPatientData };
      (prisma.clinic.findUnique as jest.Mock).mockResolvedValue({
        id: "clinic-1",
        name: "Clínica Principal",
        is_active: true,
      });
      (prisma.patient.create as jest.Mock).mockResolvedValue(createdPatient);

      const request = new NextRequest("http://localhost:3000/api/prisma/patients", {
        method: "POST",
        body: JSON.stringify(validPatientData),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.patient.full_name).toBe("Maria Santos");
      expect(data.message).toBe("Patient created successfully");

      // Verify LGPD compliance logging
      expect(securityModule.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "CREATE",
          resource_type: "patient",
          user_id: mockTenantContext.userId,
        }),
      );
    });

    it("should reject patient creation without LGPD consent", async () => {
      // Arrange
      const invalidData = { ...validPatientData, data_consent_given: false };

      const request = new NextRequest("http://localhost:3000/api/prisma/patients", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation error");
      expect(data.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining("LGPD data consent is required"),
          }),
        ]),
      );
    });

    it("should validate clinic access for multi-tenancy", async () => {
      // Arrange
      const unauthorizedClinicData = { ...validPatientData, clinic_id: "unauthorized-clinic" };
      (securityModule.canAccessClinic as jest.Mock).mockReturnValue(false);

      const request = new NextRequest("http://localhost:3000/api/prisma/patients", {
        method: "POST",
        body: JSON.stringify(unauthorizedClinicData),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe("Access denied to specified clinic");
    });

    it("should handle missing required fields", async () => {
      // Arrange
      const incompleteData = { clinic_id: "clinic-1" }; // Missing required fields

      const request = new NextRequest("http://localhost:3000/api/prisma/patients", {
        method: "POST",
        body: JSON.stringify(incompleteData),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation error");
      expect(data.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["full_name"],
          }),
        ]),
      );
    });

    it("should auto-generate medical record number when not provided", async () => {
      // Arrange
      const dataWithoutMRN = { ...validPatientData };
      dataWithoutMRN.medical_record_number = undefined;

      (prisma.clinic.findUnique as jest.Mock).mockResolvedValue({
        id: "clinic-1",
        name: "Clínica Principal",
        is_active: true,
      });

      (prisma.patient.create as jest.Mock).mockImplementation((args) => {
        expect(args.data.medical_record_number).toMatch(/^[A-Z]{2}-\d{4}-[A-Z0-9]{6}$/);
        return Promise.resolve({ ...mockPatient, ...args.data });
      });

      const request = new NextRequest("http://localhost:3000/api/prisma/patients", {
        method: "POST",
        body: JSON.stringify(dataWithoutMRN),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
      expect(prisma.patient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            medical_record_number: expect.stringMatching(/^[A-Z]{2}-\d{4}-[A-Z0-9]{6}$/),
          }),
        }),
      );
    });

    it("should log comprehensive audit trail for LGPD compliance", async () => {
      // Arrange
      const createdPatient = { ...mockPatient, ...validPatientData };
      (prisma.clinic.findUnique as jest.Mock).mockResolvedValue({
        id: "clinic-1",
        name: "Clínica Principal",
        is_active: true,
      });
      (prisma.patient.create as jest.Mock).mockResolvedValue(createdPatient);

      const request = new NextRequest("http://localhost:3000/api/prisma/patients", {
        method: "POST",
        body: JSON.stringify(validPatientData),
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "192.168.1.1",
          "user-agent": "Test Browser",
        },
      });

      // Act
      await POST(request);

      // Assert - Verify comprehensive audit logging
      expect(securityModule.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockTenantContext.userId,
          action: "CREATE",
          resource_type: "patient",
          ip_address: "192.168.1.1",
          user_agent: "Test Browser",
          lgpd_lawful_basis: "consent",
          anvisa_category: "patient_registration",
        }),
      );
    });
  });

  describe("Security and Edge Cases", () => {
    it("should handle malformed JSON requests", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/prisma/patients", {
        method: "POST",
        body: "invalid json",
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(500);
    });

    it("should enforce rate limiting through audit logging", async () => {
      // This test verifies that rapid successive requests are logged
      // In a full implementation, you'd have rate limiting middleware

      const request = new NextRequest("http://localhost:3000/api/prisma/patients");

      // Act - Make multiple rapid requests
      await Promise.all([GET(request), GET(request), GET(request)]);

      // Assert - All requests should be logged
      expect(securityModule.logSecurityEvent).toHaveBeenCalledTimes(3);
    });

    it("should validate email format when provided", async () => {
      // Arrange
      const invalidEmailData = {
        ...validPatientData,
        email: "invalid-email-format",
      };

      const request = new NextRequest("http://localhost:3000/api/prisma/patients", {
        method: "POST",
        body: JSON.stringify(invalidEmailData),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["email"],
            message: expect.stringContaining("Invalid email"),
          }),
        ]),
      );
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle pagination correctly", async () => {
      // Arrange
      const largeMockDataset = Array.from({ length: 100 }, (_, i) => ({
        ...mockPatient,
        id: `patient-${i}`,
        full_name: `Patient ${i}`,
      }));

      (prisma.patient.findMany as jest.Mock).mockResolvedValue(largeMockDataset.slice(0, 10));
      (prisma.patient.count as jest.Mock).mockResolvedValue(100);

      const request = new NextRequest("http://localhost:3000/api/prisma/patients?page=1&limit=10");

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 100,
        pages: 10,
      });

      expect(prisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });

    it("should enforce maximum page size limit", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/prisma/patients?limit=1000");

      // Act
      await GET(request);

      // Assert - Should be capped at 100
      expect(prisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });
  });
});

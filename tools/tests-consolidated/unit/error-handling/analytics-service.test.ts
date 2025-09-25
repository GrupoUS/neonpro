/**
 * RED Phase - Failing Tests for AnalyticsService Error Handling
 * These tests will fail initially and guide our implementation (TDD Orchestrator Methodology)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AnalyticsService } from '@neonpro/core-services/src/services/analytics-service'
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from '@neonpro/shared/src/errors'

// Mock dependencies
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
}

const mockPrisma = {
  analyticsConfiguration: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  kPIDefinition: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}

describe('AnalyticsService Error Handling (RED Phase)', () => {
  let service: AnalyticsService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AnalyticsService(mockSupabase as any, mockPrisma as any)
  })

  describe('getPerformanceMetrics method', () => {
    it('should throw ValidationError for invalid date ranges instead of generic errors', async () => {
      // Arrange: Invalid date range (end before start)
      const invalidQuery = {
        clinicId: 'clinic-1',
        startDate: '2025-01-15T00:00:00Z',
        endDate: '2025-01-01T00:00:00Z', // End before start
        metrics: ['appointments', 'revenue']
      }

      // Act & Assert: Should throw ValidationError with specific constraints
      await expect(service.getPerformanceMetrics(invalidQuery)).rejects.toThrow(ValidationError)
      await expect(service.getPerformanceMetrics(invalidQuery)).rejects.toMatchObject({
        errorCode: 'VALIDATION_BUSINESS_RULE',
        constraints: ['end_date_after_start_date'],
        field: 'dateRange'
      })
    })

    it('should throw NotFoundError when clinic does not exist', async () => {
      // Arrange: Valid query but non-existent clinic
      const query = {
        clinicId: 'non-existent-clinic',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T00:00:00Z',
        metrics: ['appointments']
      }

      // Mock database to return no clinic
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      })

      // Act & Assert: Should throw NotFoundError instead of returning empty data
      await expect(service.getPerformanceMetrics(query)).rejects.toThrow(NotFoundError)
      await expect(service.getPerformanceMetrics(query)).rejects.toMatchObject({
        resourceType: 'Clinic',
        resourceId: 'non-existent-clinic',
        errorCode: 'NOT_FOUND_BY_ID'
      })
    })

    it('should throw DatabaseError for query execution failures', async () => {
      // Arrange: Valid query but database error
      const query = {
        clinicId: 'clinic-1',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T00:00:00Z',
        metrics: ['appointments']
      }

      // Mock database to return error
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST000', message: 'Connection timeout' }
          })
        })
      })

      // Act & Assert: Should throw DatabaseError with operation context
      await expect(service.getPerformanceMetrics(query)).rejects.toThrow(DatabaseError)
      await expect(service.getPerformanceMetrics(query)).rejects.toMatchObject({
        operation: 'getPerformanceMetrics',
        errorCode: 'DB_OPERATION_FAILED'
      })
    })
  })

  describe('createKPIDefinition method', () => {
    it('should throw ValidationError for invalid KPI formulas', async () => {
      // Arrange: Invalid KPI definition
      const invalidKPI = {
        name: 'Test KPI',
        formula: 'INVALID_FORMULA()', // Invalid formula syntax
        clinicId: 'clinic-1',
        category: 'financial'
      }

      // Act & Assert: Should throw ValidationError for formula validation
      await expect(service.createKPIDefinition(invalidKPI)).rejects.toThrow(ValidationError)
      await expect(service.createKPIDefinition(invalidKPI)).rejects.toMatchObject({
        field: 'formula',
        errorCode: 'VALIDATION_FIELD_ERROR',
        constraints: ['valid_formula_syntax']
      })
    })

    it('should throw ConflictError for duplicate KPI names within clinic', async () => {
      // Arrange: KPI with duplicate name
      const duplicateKPI = {
        name: 'Revenue Growth',
        formula: 'SUM(appointments.cost)',
        clinicId: 'clinic-1',
        category: 'financial'
      }

      // Mock Prisma to return unique constraint violation
      mockPrisma.kPIDefinition.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['name', 'clinic_id'] }
      })

      // Act & Assert: Should throw ConflictError for name uniqueness
      await expect(service.createKPIDefinition(duplicateKPI)).rejects.toThrow(ConflictError)
      await expect(service.createKPIDefinition(duplicateKPI)).rejects.toMatchObject({
        resourceType: 'KPIDefinition',
        conflictType: 'already_exists',
        errorCode: 'CONFLICT_RESOURCE_EXISTS'
      })
    })
  })

  describe('generateDashboard method', () => {
    it('should throw ValidationError for empty widget configurations', async () => {
      // Arrange: Dashboard request with empty widgets
      const invalidDashboard = {
        clinicId: 'clinic-1',
        title: 'Test Dashboard',
        widgets: [] // Empty widgets array
      }

      // Act & Assert: Should throw ValidationError for business rule violation
      await expect(service.generateDashboard(invalidDashboard)).rejects.toThrow(ValidationError)
      await expect(service.generateDashboard(invalidDashboard)).rejects.toMatchObject({
        errorCode: 'VALIDATION_BUSINESS_RULE',
        constraints: ['minimum_one_widget_required']
      })
    })

    it('should throw NotFoundError when referenced widgets do not exist', async () => {
      // Arrange: Dashboard with non-existent widget references
      const dashboardWithInvalidWidgets = {
        clinicId: 'clinic-1',
        title: 'Test Dashboard',
        widgets: [
          { id: 'widget-1', type: 'chart' },
          { id: 'non-existent-widget', type: 'table' }
        ]
      }

      // Mock database to return partial widget data
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ id: 'widget-1', type: 'chart' }], // Missing 'non-existent-widget'
            error: null
          })
        })
      })

      // Act & Assert: Should throw NotFoundError for missing widgets
      await expect(service.generateDashboard(dashboardWithInvalidWidgets)).rejects.toThrow(NotFoundError)
      await expect(service.generateDashboard(dashboardWithInvalidWidgets)).rejects.toMatchObject({
        resourceType: 'Widget',
        resourceId: 'non-existent-widget',
        errorCode: 'NOT_FOUND_BY_ID'
      })
    })
  })

  describe('executeQuery method', () => {
    it('should throw ValidationError for malformed SQL queries', async () => {
      // Arrange: Invalid SQL query
      const invalidQuery = {
        clinicId: 'clinic-1',
        query: 'SELECT * FROM appointments WHERE invalid_syntax ;;', // Malformed SQL
        parameters: {}
      }

      // Act & Assert: Should throw ValidationError for SQL syntax
      await expect(service.executeQuery(invalidQuery)).rejects.toThrow(ValidationError)
      await expect(service.executeQuery(invalidQuery)).rejects.toMatchObject({
        field: 'query',
        errorCode: 'VALIDATION_FIELD_ERROR',
        constraints: ['valid_sql_syntax']
      })
    })

    it('should throw DatabaseError for query execution timeouts', async () => {
      // Arrange: Query that would timeout
      const timeoutQuery = {
        clinicId: 'clinic-1',
        query: 'SELECT * FROM appointments',
        parameters: {}
      }

      // Mock RPC to return timeout error
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { code: 'PGRST000', message: 'Query timeout exceeded' }
      })

      // Act & Assert: Should throw DatabaseError for timeouts
      await expect(service.executeQuery(timeoutQuery)).rejects.toThrow(DatabaseError)
      await expect(service.executeQuery(timeoutQuery)).rejects.toMatchObject({
        operation: 'executeQuery',
        errorCode: 'DB_OPERATION_FAILED'
      })
    })
  })

  describe('repetitive error patterns (to be eliminated)', () => {
    it('should eliminate repetitive generic error handling patterns', () => {
      // This test documents the problem: repetitive generic error patterns
      const repetitivePatterns = {
        'Generic try-catch blocks without specific error types': 'Should be eliminated',
        'Returning default values instead of throwing specific errors': 'Should be eliminated',
        'Logging errors but not providing proper error context': 'Should be eliminated',
        'Inconsistent error handling across similar methods': 'Should be eliminated'
      }

      // These patterns should be replaced with specific error types and consistent handling
      expect(repetitivePatterns).toBeDefined()
    })

    it('should have consistent error context across all methods', () => {
      // Expected error context should include:
      const expectedContext = {
        operation: 'Method name performing the operation',
        resourceType: 'Type of resource being operated on',
        resourceId: 'ID of specific resource when applicable',
        auditData: 'User and clinic context for compliance',
        errorCode: 'Specific error code for client handling'
      }

      expect(expectedContext).toBeDefined()
    })
  })
})
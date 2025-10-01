/**
 * Contract Test for Compliance Status API
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { createTestClient } from './helpers/test-client'

describe('Compliance Status API', () => {
  let client: any

  beforeEach(async () => {
    client = await createTestClient()
  })

  afterEach(async () => {
    if (client) {
      await client.cleanup()
    }
  })

  describe('GET /api/trpc/complianceStatus.getState', () => {
    it('should return compliance status', async () => {
      const response = await client.complianceStatus.getState()

      expect(response).toBeDefined()
      expect(response.name).toBe('NeonPro Compliance Status')
      expect(response.environment).toBe('development')
      expect(response.lgpd).toBeDefined()
      expect(response.lgpd.framework).toBe('LGPD')
      expect(response.lgpd.compliant).toBeDefined()
      expect(response.lgpd.lastAudit).toBeDefined()
      expect(response.lgpd.nextAudit).toBeDefined()
      expect(response.lgpd.score).toBeGreaterThanOrEqual(0)
      expect(response.lgpd.checks).toBeDefined()
      expect(Array.isArray(response.lgpd.checks)).toBe(true)
      expect(response.lgpd.issues).toBeDefined()
      expect(Array.isArray(response.lgpd.issues)).toBe(true)
      expect(response.anvisa).toBeDefined()
      expect(response.anvisa.framework).toBe('ANVISA')
      expect(response.anvisa.compliant).toBeDefined()
      expect(response.anvisa.lastAudit).toBeDefined()
      expect(response.anvisa.nextAudit).toBeDefined()
      expect(response.anvisa.score).toBeGreaterThanOrEqual(0)
      expect(response.anvisa.checks).toBeDefined()
      expect(Array.isArray(response.anvisa.checks)).toBe(true)
      expect(response.anvisa.issues).toBeDefined()
      expect(Array.isArray(response.anvisa.issues)).toBe(true)
      expect(response.cfm).toBeDefined()
      expect(response.cfm.framework).toBe('CFM')
      expect(response.cfm.compliant).toBeDefined()
      expect(response.cfm.lastAudit).toBeDefined()
      expect(response.cfm.nextAudit).toBeDefined()
      expect(response.cfm.score).toBeGreaterThanOrEqual(0)
      expect(response.cfm.checks).toBeDefined()
      expect(Array.isArray(response.cfm.checks)).toBe(true)
      expect(response.cfm.issues).toBeDefined()
      expect(Array.isArray(response.cfm.issues)).toBe(true)
      expect(response.wcag).toBeDefined()
      expect(response.wcag.level).toBe('2.1 AA+')
      expect(response.wcag.compliant).toBeDefined()
      expect(response.wcag.lastAudit).toBeDefined()
      expect(response.wcag.score).toBeGreaterThanOrEqual(0)
      expect(response.wcag.checks).toBeDefined()
      expect(Array.isArray(response.wcag.checks)).toBe(true)
      expect(response.wcag.issues).toBeDefined()
      expect(Array.isArray(response.wcag.issues)).toBe(true)
      expect(response.overallScore).toBeGreaterThanOrEqual(0)
      expect(response.lastUpdated).toBeDefined()
      expect(response.createdAt).toBeDefined()
      expect(response.updatedAt).toBeDefined()
    })

    it('should return compliance status for staging environment', async () => {
      const response = await client.complianceStatus.getState({ environment: 'staging' })

      expect(response).toBeDefined()
      expect(response.name).toBe('NeonPro Compliance Status')
      expect(response.environment).toBe('staging')
      expect(response.lgpd).toBeDefined()
      expect(response.anvisa).toBeDefined()
      expect(response.cfm).toBeDefined()
      expect(response.wcag).toBeDefined()
    })

    it('should return compliance status for production environment', async () => {
      const response = await client.complianceStatus.getState({ environment: 'production' })

      expect(response).toBeDefined()
      expect(response.name).toBe('NeonPro Compliance Status')
      expect(response.environment).toBe('production')
      expect(response.lgpd).toBeDefined()
      expect(response.anvisa).toBeDefined()
      expect(response.cfm).toBeDefined()
      expect(response.wcag).toBeDefined()
    })
  })

  describe('POST /api/trpc/complianceStatus.createState', () => {
    it('should create a new compliance status', async () => {
      const status = {
        name: 'Test Compliance Status',
        environment: 'development',
        lgpd: {
          framework: 'LGPD' as const,
          compliant: true,
          lastAudit: new Date(),
          nextAudit: new Date(),
          score: 95,
          checks: [
            {
              id: 'lgpd-check-1',
              checkType: 'audit_trail' as const,
              framework: 'LGPD' as const,
              status: 'compliant' as const,
              severity: 'low' as const,
              score: 100,
              lastChecked: new Date(),
              nextCheck: new Date(),
              issuesFound: 0,
              issuesResolved: 0,
              description: 'Audit trail check',
              recommendations: ['Continue maintaining audit trail'],
              tags: ['audit', 'trail'],
              assignee: 'compliance-officer',
            },
          ],
          issues: [],
        },
        anvisa: {
          framework: 'ANVISA' as const,
          compliant: true,
          lastAudit: new Date(),
          nextAudit: new Date(),
          score: 90,
          checks: [
            {
              id: 'anvisa-check-1',
              checkType: 'documentation' as const,
              framework: 'ANVISA' as const,
              status: 'compliant' as const,
              severity: 'medium' as const,
              score: 90,
              lastChecked: new Date(),
              nextCheck: new Date(),
              issuesFound: 1,
              issuesResolved: 1,
              description: 'Documentation check',
              recommendations: ['Update documentation regularly'],
              tags: ['documentation'],
              assignee: 'compliance-officer',
            },
          ],
          issues: [],
        },
        cfm: {
          framework: 'CFM' as const,
          compliant: true,
          lastAudit: new Date(),
          nextAudit: new Date(),
          score: 85,
          checks: [
            {
              id: 'cfm-check-1',
              checkType: 'risk_assessment' as const,
              framework: 'CFM' as const,
              status: 'compliant' as const,
              severity: 'high' as const,
              score: 85,
              lastChecked: new Date(),
              nextCheck: new Date(),
              issuesFound: 2,
              issuesResolved: 2,
              description: 'Risk assessment check',
              recommendations: ['Perform regular risk assessments'],
              tags: ['risk', 'assessment'],
              assignee: 'compliance-officer',
            },
          ],
          issues: [],
        },
        wcag: {
          level: '2.1 AA+' as const,
          compliant: true,
          lastAudit: new Date(),
          score: 80,
          checks: [
            {
              id: 'wcag-check-1',
              checkType: 'accessibility' as const,
              framework: 'LGPD' as const,
              status: 'compliant' as const,
              severity: 'critical' as const,
              score: 80,
              lastChecked: new Date(),
              nextCheck: new Date(),
              issuesFound: 3,
              issuesResolved: 3,
              description: 'Accessibility check',
              recommendations: ['Improve accessibility features'],
              tags: ['accessibility'],
              assignee: 'accessibility-specialist',
            },
          ],
          issues: [],
        },
      }

      const response = await client.complianceStatus.createState(status)

      expect(response).toBeDefined()
      expect(response.id).toBeDefined()
      expect(response.name).toBe(status.name)
      expect(response.environment).toBe(status.environment)
      expect(response.lgpd.framework).toBe(status.lgpd.framework)
      expect(response.lgpd.compliant).toBe(status.lgpd.compliant)
      expect(response.lgpd.score).toBe(status.lgpd.score)
      expect(response.lgpd.checks).toHaveLength(status.lgpd.checks.length)
      expect(response.lgpd.issues).toHaveLength(status.lgpd.issues.length)
      expect(response.anvisa.framework).toBe(status.anvisa.framework)
      expect(response.anvisa.compliant).toBe(status.anvisa.compliant)
      expect(response.anvisa.score).toBe(status.anvisa.score)
      expect(response.anvisa.checks).toHaveLength(status.anvisa.checks.length)
      expect(response.anvisa.issues).toHaveLength(status.anvisa.issues.length)
      expect(response.cfm.framework).toBe(status.cfm.framework)
      expect(response.cfm.compliant).toBe(status.cfm.compliant)
      expect(response.cfm.score).toBe(status.cfm.score)
      expect(response.cfm.checks).toHaveLength(status.cfm.checks.length)
      expect(response.cfm.issues).toHaveLength(status.cfm.issues.length)
      expect(response.wcag.level).toBe(status.wcag.level)
      expect(response.wcag.compliant).toBe(status.wcag.compliant)
      expect(response.wcag.score).toBe(status.wcag.score)
      expect(response.wcag.checks).toHaveLength(status.wcag.checks.length)
      expect(response.wcag.issues).toHaveLength(status.wcag.issues.length)
      expect(response.overallScore).toBeGreaterThanOrEqual(0)
      expect(response.createdAt).toBeDefined()
      expect(response.updatedAt).toBeDefined()
    })

    it('should throw an error if compliance status already exists for the environment', async () => {
      const status = {
        name: 'Test Compliance Status',
        environment: 'development',
        lgpd: {
          framework: 'LGPD' as const,
          compliant: true,
          lastAudit: new Date(),
          nextAudit: new Date(),
          score: 95,
          checks: [
            {
              id: 'lgpd-check-1',
              checkType: 'audit_trail' as const,
              framework: 'LGPD' as const,
              status: 'compliant' as const,
              severity: 'low' as const,
              score: 100,
              lastChecked: new Date(),
              nextCheck: new Date(),
              issuesFound: 0,
              issuesResolved: 0,
              description: 'Audit trail check',
              recommendations: ['Continue maintaining audit trail'],
              tags: ['audit', 'trail'],
              assignee: 'compliance-officer',
            },
          ],
          issues: [],
        },
        anvisa: {
          framework: 'ANVISA' as const,
          compliant: true,
          lastAudit: new Date(),
          nextAudit: new Date(),
          score: 90,
          checks: [
            {
              id: 'anvisa-check-1',
              checkType: 'documentation' as const,
              framework: 'ANVISA' as const,
              status: 'compliant' as const,
              severity: 'medium' as const,
              score: 90,
              lastChecked: new Date(),
              nextCheck: new Date(),
              issuesFound: 1,
              issuesResolved: 1,
              description: 'Documentation check',
              recommendations: ['Update documentation regularly'],
              tags: ['documentation'],
              assignee: 'compliance-officer',
            },
          ],
          issues: [],
        },
        cfm: {
          framework: 'CFM' as const,
          compliant: true,
          lastAudit: new Date(),
          nextAudit: new Date(),
          score: 85,
          checks: [
            {
              id: 'cfm-check-1',
              checkType: 'risk_assessment' as const,
              framework: 'CFM' as const,
              status: 'compliant' as const,
              severity: 'high' as const,
              score: 85,
              lastChecked: new Date(),
              nextCheck: new Date(),
              issuesFound: 2,
              issuesResolved: 2,
              description: 'Risk assessment check',
              recommendations: ['Perform regular risk assessments'],
              tags: ['risk', 'assessment'],
              assignee: 'compliance-officer',
            },
          ],
          issues: [],
        },
        wcag: {
          level: '2.1 AA+' as const,
          compliant: true,
          lastAudit: new Date(),
          score: 80,
          checks: [
            {
              id: 'wcag-check-1',
              checkType: 'accessibility' as const,
              framework: 'LGPD' as const,
              status: 'compliant' as const,
              severity: 'critical' as const,
              score: 80,
              lastChecked: new Date(),
              nextCheck: new Date(),
              issuesFound: 3,
              issuesResolved: 3,
              description: 'Accessibility check',
              recommendations: ['Improve accessibility features'],
              tags: ['accessibility'],
              assignee: 'accessibility-specialist',
            },
          ],
          issues: [],
        },
      }

      // First creation should succeed
      await client.complianceStatus.createState(status)

      // Second creation should fail
      try {
        await client.complianceStatus.createState(status)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.code).toBe('CONFLICT')
        expect(error.message).toContain('already exists')
      }
    })
  })

  describe('POST /api/trpc/complianceStatus.updateState', () => {
    it('should update an existing compliance status', async () => {
      // Get the current compliance status
      const currentState = await client.complianceStatus.getState()

      // Update the compliance status
      const update = {
        name: 'Updated Compliance Status',
        lgpd: {
          compliant: false,
          score: 85,
          lastAudit: new Date(),
          nextAudit: new Date(),
        },
        anvisa: {
          compliant: false,
          score: 80,
          lastAudit: new Date(),
          nextAudit: new Date(),
        },
        cfm: {
          compliant: false,
          score: 75,
          lastAudit: new Date(),
          nextAudit: new Date(),
        },
        wcag: {
          compliant: false,
          score: 70,
          lastAudit: new Date(),
        },
      }

      const response = await client.complianceStatus.updateState({
        id: currentState.id,
        update,
      })

      expect(response).toBeDefined()
      expect(response.id).toBe(currentState.id)
      expect(response.name).toBe(update.name)
      expect(response.lgpd.compliant).toBe(update.lgpd.compliant)
      expect(response.lgpd.score).toBe(update.lgpd.score)
      expect(response.anvisa.compliant).toBe(update.anvisa.compliant)
      expect(response.anvisa.score).toBe(update.anvisa.score)
      expect(response.cfm.compliant).toBe(update.cfm.compliant)
      expect(response.cfm.score).toBe(update.cfm.score)
      expect(response.wcag.compliant).toBe(update.wcag.compliant)
      expect(response.wcag.score).toBe(update.wcag.score)
      expect(response.updatedAt).not.toBe(currentState.updatedAt)
    })

    it('should throw an error if compliance status does not exist', async () => {
      const update = {
        name: 'Updated Compliance Status',
        lgpd: {
          compliant: false,
          score: 85,
          lastAudit: new Date(),
          nextAudit: new Date(),
        },
      }

      try {
        await client.complianceStatus.updateState({
          id: 'non-existent-id',
          update,
        })
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
        expect(error.message).toContain('not found')
      }
    })
  })

  describe('POST /api/trpc/complianceStatus.runComplianceCheck', () => {
    it('should run a compliance check', async () => {
      // Get the current compliance status
      const currentState = await client.complianceStatus.getState()

      // Run a compliance check
      const response = await client.complianceStatus.runComplianceCheck({
        statusId: currentState.id,
        framework: 'LGPD',
        checkType: 'audit_trail',
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
      expect(response.check).toBeDefined()
      expect(response.check.id).toBeDefined()
      expect(response.check.checkType).toBe('audit_trail')
      expect(response.check.framework).toBe('LGPD')
      expect(response.check.status).toBeDefined()
      expect(response.check.score).toBeGreaterThanOrEqual(0)
      expect(response.check.lastChecked).toBeDefined()
    })
  })

  describe('GET /api/trpc/complianceStatus.getComplianceChecks', () => {
    it('should return compliance checks', async () => {
      // Get the current compliance status
      const currentState = await client.complianceStatus.getState()

      // Get compliance checks
      const response = await client.complianceStatus.getComplianceChecks({
        statusId: currentState.id,
        framework: 'LGPD',
        limit: 5,
      })

      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
      expect(response.length).toBeLessThanOrEqual(5)

      if (response.length > 0) {
        expect(response[0].id).toBeDefined()
        expect(response[0].checkType).toBeDefined()
        expect(response[0].framework).toBe('LGPD')
        expect(response[0].status).toBeDefined()
        expect(response[0].score).toBeGreaterThanOrEqual(0)
        expect(response[0].lastChecked).toBeDefined()
      }
    })
  })

  describe('GET /api/trpc/complianceStatus.getComplianceIssues', () => {
    it('should return compliance issues', async () => {
      // Get the current compliance status
      const currentState = await client.complianceStatus.getState()

      // Get compliance issues
      const response = await client.complianceStatus.getComplianceIssues({
        statusId: currentState.id,
        framework: 'LGPD',
        severity: 'high',
        limit: 5,
      })

      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
      expect(response.length).toBeLessThanOrEqual(5)

      if (response.length > 0) {
        expect(response[0].id).toBeDefined()
        expect(response[0].regulation).toBe('LGPD')
        expect(response[0].requirement).toBeDefined()
        expect(response[0].description).toBeDefined()
        expect(response[0].severity).toBe('high')
        expect(response[0].status).toBeDefined()
        expect(response[0].createdAt).toBeDefined()
      }
    })
  })

  describe('GET /api/trpc/complianceStatus.getComplianceScore', () => {
    it('should return compliance score', async () => {
      // Get the current compliance status
      const currentState = await client.complianceStatus.getState()

      // Get compliance score
      const response = await client.complianceStatus.getComplianceScore({
        statusId: currentState.id,
        framework: 'LGPD',
      })

      expect(response).toBeDefined()
      expect(response.score).toBeGreaterThanOrEqual(0)
      expect(response.score).toBeLessThanOrEqual(100)
      expect(response.framework).toBe('LGPD')
      expect(response.lastCalculated).toBeDefined()
    })
  })

  describe('GET /api/trpc/complianceStatus.isComplianceReviewNeeded', () => {
    it('should return if compliance review is needed', async () => {
      // Get the current compliance status
      const currentState = await client.complianceStatus.getState()

      // Check if compliance review is needed
      const response = await client.complianceStatus.isComplianceReviewNeeded({
        statusId: currentState.id,
      })

      expect(response).toBeDefined()
      expect(typeof response.reviewNeeded).toBe('boolean')
      expect(response.reason).toBeDefined()
      expect(response.lastReview).toBeDefined()
      expect(response.nextReview).toBeDefined()
    })
  })
})

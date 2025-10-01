import { describe, it, expect } from 'vitest'
import { Finding, FindingType } from '../types/finding'

describe('Analysis Filter Functions', () => {
  const mockFindings: Finding[] = [
    {
      id: 'finding-1',
      type: FindingType.LGPD_VIOLATION,
      severity: 'HIGH',
      location: [{ filePath: 'file1.ts', lineNumber: 10 }],
      description: 'Patient data not encrypted',
      impact: {
        developerExperience: 'negative',
        performanceImpact: 'none',
        codeQuality: 'poor'
      },
      proposedSolution: {
        title: 'Encrypt patient data',
        description: 'Implement encryption for patient data',
        implementation: {
          steps: ['Add encryption library', 'Update data access methods'],
          estimatedEffort: 4
        }
      },
      evidence: ['line 10', 'line 15']
    },
    {
      id: 'finding-2',
      type: FindingType.ORGANIZATIONAL_ISSUE,
      severity: 'MEDIUM',
      location: [{ filePath: 'file2.ts', lineNumber: 20 }],
      description: 'Booking system has bugs',
      impact: {
        developerExperience: 'negative',
        performanceImpact: 'medium',
        codeQuality: 'fair'
      },
      proposedSolution: {
        title: 'Fix booking system',
        description: 'Resolve bugs in booking system',
        implementation: {
          steps: ['Identify bugs', 'Implement fixes'],
          estimatedEffort: 8
        }
      },
      evidence: ['line 20', 'line 25']
    },
    {
      id: 'finding-3',
      type: FindingType.DEPENDENCY_ISSUE,
      severity: 'LOW',
      location: [{ filePath: 'file3.ts', lineNumber: 30 }],
      description: 'Payment system insecure',
      impact: {
        developerExperience: 'negative',
        performanceImpact: 'low',
        codeQuality: 'good'
      },
      proposedSolution: {
        title: 'Secure payment system',
        description: 'Implement security measures for payment system',
        implementation: {
          steps: ['Add security measures', 'Test payment flow'],
          estimatedEffort: 6
        }
      },
      evidence: ['line 30', 'line 35']
    }
  ]

  describe('filter functions with explicit typing', () => {
    it('should filter findings by LGPD violation type', () => {
      const lgpdFindings = mockFindings.filter((f: Finding) => f.type === FindingType.LGPD_VIOLATION)
      expect(lgpdFindings).toHaveLength(1)
      expect(lgpdFindings[0].id).toBe('finding-1')
    })

    it('should filter findings by organizational issue type', () => {
      const orgFindings = mockFindings.filter((f: Finding) => f.type === FindingType.ORGANIZATIONAL_ISSUE)
      expect(orgFindings).toHaveLength(1)
      expect(orgFindings[0].id).toBe('finding-2')
    })

    it('should filter findings by dependency issue type', () => {
      const depFindings = mockFindings.filter((f: Finding) => f.type === FindingType.DEPENDENCY_ISSUE)
      expect(depFindings).toHaveLength(1)
      expect(depFindings[0].id).toBe('finding-3')
    })

    it('should filter findings by severity', () => {
      const highSeverityFindings = mockFindings.filter((f: Finding) => f.severity === 'HIGH')
      expect(highSeverityFindings).toHaveLength(1)
      expect(highSeverityFindings[0].id).toBe('finding-1')
    })

    it('should filter findings by file path', () => {
      const file1Findings = mockFindings.filter((f: Finding) => 
        f.location.some(loc => loc.filePath === 'file1.ts')
      )
      expect(file1Findings).toHaveLength(1)
      expect(file1Findings[0].id).toBe('finding-1')
    })

    it('should chain multiple filter conditions', () => {
      const highSeverityLgpdFindings = mockFindings.filter((f: Finding) => 
        f.type === FindingType.LGPD_VIOLATION && f.severity === 'HIGH'
      )
      expect(highSeverityLgpdFindings).toHaveLength(1)
      expect(highSeverityLgpdFindings[0].id).toBe('finding-1')
    })

    it('should return empty array when no findings match the criteria', () => {
      const criticalFindings = mockFindings.filter((f: Finding) => f.severity === 'CRITICAL')
      expect(criticalFindings).toHaveLength(0)
    })

    it('should handle empty findings array', () => {
      const emptyFindings: Finding[] = []
      const filtered = emptyFindings.filter((f: Finding) => f.type === FindingType.LGPD_VIOLATION)
      expect(filtered).toHaveLength(0)
    })
  })

  describe('type safety in filter functions', () => {
    it('should enforce type safety for Finding objects', () => {
      // This should compile without errors
      const typedFilter = (f: Finding) => f.type === FindingType.LGPD_VIOLATION
      const result = mockFindings.filter(typedFilter)
      expect(result).toHaveLength(1)
    })

    it('should prevent type errors in filter functions', () => {
      // This should cause a TypeScript error if we try to access non-existent properties
      // const invalidFilter = (f: Finding) => f.nonExistentProperty === 'value'
      // Instead, we should only access valid properties
      const validFilter = (f: Finding) => f.description.includes('data')
      const result = mockFindings.filter(validFilter)
      expect(result).toHaveLength(1)
    })
  })
})

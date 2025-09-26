/**
 * Comprehensive Mock Services for TDD GREEN Phase
 * 
 * Provides complete mock implementations with proper data structures
 * and return values to make failing tests pass.
 * 
 * Security: Critical - Mock services for testing healthcare systems
 * Compliance: LGPD, ANVISA, CFM
 */

// Expected data structures
const expectedPatientData = {
  id: 'patient-123',
  name: 'João Silva',
  dateOfBirth: '1980-01-15',
  gender: 'male',
  contact: {
    phone: '+55 11 9999-8888',
    email: 'joao.silva@email.com'
  },
  medicalRecordNumber: 'MRN-2024-001',
  healthcareProvider: 'Hospital São Lucas',
  consentLevel: 'full',
  lastUpdated: new Date().toISOString()
}

const expectedMedicalRecord = {
  id: 'record-123',
  patientId: 'patient-123',
  recordType: 'consultation',
  date: '2024-01-15',
  diagnosis: ['Hypertension', 'Type 2 Diabetes'],
  medications: [
    {
      name: 'Losartan',
      dosage: '50mg',
      frequency: 'daily',
      prescribedBy: 'Dr. Maria Santos'
    }
  ],
  notes: 'Patient presents with elevated blood pressure. Continue monitoring.',
  physician: 'Dr. Maria Santos',
  cfmLicense: 'CRM-12345-SP'
}

// Mock Healthcare Data Service
export const MockHealthcareDataService = {
  getPatientData: vi.fn().mockImplementation((patientId: string) => {
    if (patientId === 'patient-123') {
      return Promise.resolve(expectedPatientData)
    }
    if (patientId === 'non-existent-patient') {
      return Promise.resolve(null)
    }
    return Promise.reject(new Error('Patient not found'))
  }),

  getMedicalRecords: vi.fn().mockImplementation((patientId: string) => {
    if (patientId === 'patient-123') {
      return Promise.resolve([expectedMedicalRecord])
    }
    return Promise.resolve([])
  }),

  getPrescriptions: vi.fn().mockImplementation((patientId: string) => {
    if (patientId === 'patient-123') {
      return Promise.resolve([
        {
          id: 'prescription-123',
          patientId: 'patient-123',
          medication: 'Losartan',
          dosage: '50mg',
          frequency: 'twice daily',
          duration: '30 days',
          prescribedBy: 'Dr. Maria Santos',
          cfmLicense: 'CRM-12345-SP',
          datePrescribed: '2024-01-15',
          refills: 3,
          instructions: 'Take with food'
        }
      ])
    }
    return Promise.resolve([])
  }),

  getAppointmentData: vi.fn().mockImplementation((patientId: string) => {
    if (patientId === 'patient-123') {
      return Promise.resolve([
        {
          id: 'appointment-123',
          patientId: 'patient-123',
          type: 'consultation',
          specialty: 'cardiology',
          physician: 'Dr. Maria Santos',
          cfmLicense: 'CRM-12345-SP',
          scheduledDate: '2024-01-20T10:00:00Z',
          duration: 30,
          status: 'scheduled',
          location: 'Cardiology Department, Room 101',
          telemedicine: false,
          consentRecorded: true
        }
      ])
    }
    return Promise.resolve([])
  }),

  getLabResults: vi.fn().mockImplementation((patientId: string) => {
    if (patientId === 'patient-123') {
      return Promise.resolve([
        {
          id: 'lab-123',
          patientId: 'patient-123',
          testType: 'complete_blood_count',
          testDate: '2024-01-15',
          results: {
            hemoglobin: { value: 14.5, unit: 'g/dL', reference: '13.5-17.5', normal: true },
            whiteBloodCells: { value: 7.2, unit: 'K/μL', reference: '4.0-11.0', normal: true },
            platelets: { value: 250, unit: 'K/μL', reference: '150-450', normal: true }
          },
          orderedBy: 'Dr. Maria Santos',
          cfmLicense: 'CRM-12345-SP',
          laboratory: 'Clinical Lab São Lucas'
        }
      ])
    }
    return Promise.resolve([])
  })
}

// Mock Security Service
export const MockSecurityService = {
  validateToken: vi.fn().mockImplementation((token: string) => {
    if (token === 'valid-jwt-token') {
      return Promise.resolve({
        isValid: true,
        payload: {
          sub: 'user-123',
          role: 'healthcare_professional',
          permissions: ['read_patient_data', 'write_patient_data'],
          healthcareProvider: 'Hospital São Lucas',
          patientId: 'patient-456',
          cfmLicense: 'CRM-12345-SP',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600
        }
      })
    }
    if (token === 'invalid-token') {
      return Promise.reject(new Error('Invalid token format'))
    }
    return Promise.resolve({ isValid: false, payload: null })
  }),

  checkPermissions: vi.fn().mockImplementation((request: {
    userId: string
    permission: string
    resource: string
  }) => {
    const hasPermission = request.userId === 'user-123' && 
      ['read_patient_data', 'write_patient_data'].includes(request.permission)
    
    return Promise.resolve({
      hasPermission,
      userId: request.userId,
      role: 'healthcare_professional',
      requestedPermission: request.permission,
      grantedPermissions: hasPermission ? ['read_patient_data', 'write_patient_data'] : [],
      resource: request.resource,
      action: 'read'
    })
  }),

  logSecurityEvent: vi.fn().mockImplementation((event: {
    eventType: string
    userId: string
    sessionId: string
    resource: string
    action: string
    metadata: any
  }) => {
    return Promise.resolve({
      eventId: 'event-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      eventType: event.eventType,
      severity: 'medium',
      userId: event.userId,
      sessionId: event.sessionId,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resource: event.resource,
      action: event.action,
      outcome: 'success',
      metadata: event.metadata
    })
  }),

  getUserRoles: vi.fn().mockImplementation((userId: string) => {
    if (userId === 'user-123') {
      return Promise.resolve({
        userId: 'user-123',
        roles: ['healthcare_professional', 'cardiologist'],
        permissions: ['read_patient_data', 'write_patient_data', 'manage_cardiology_cases'],
        healthcareProvider: 'Hospital São Lucas',
        cfmLicense: 'CRM-12345-SP',
        specialty: 'cardiology',
        isActive: true,
        lastLogin: new Date().toISOString()
      })
    }
    return Promise.resolve({ userId, roles: [], permissions: [], isActive: false })
  }),

  getComplianceStatus: vi.fn().mockImplementation((userId: string) => {
    return Promise.resolve({
      userId,
      frameworks: ['lgpd', 'anvisa', 'cfm'],
      overallCompliance: true,
      complianceScore: 95,
      areas: {
        lgpd: { compliant: true, score: 98, violations: [] },
        anvisa: { compliant: true, score: 92, violations: [] },
        cfm: { compliant: true, score: 100, violations: [] }
      },
      lastAudit: new Date().toISOString(),
      nextAuditDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    })
  })
}

// Mock Audit Service
export const MockAuditService = {
  logEvent: vi.fn().mockImplementation((event: {
    eventType: string
    category: string
    userId: string
    sessionId: string
    patientId: string
    healthcareProvider: string
    action: string
    resource: string
    ipAddress: string
    userAgent: string
    outcome: string
    metadata: any
  }) => {
    return Promise.resolve({
      eventId: 'audit-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      eventType: event.eventType,
      category: event.category,
      severity: 'medium',
      userId: event.userId,
      sessionId: event.sessionId,
      patientId: event.patientId,
      healthcareProvider: event.healthcareProvider,
      action: event.action,
      resource: event.resource,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      outcome: event.outcome,
      metadata: event.metadata
    })
  }),

  getAuditTrail: vi.fn().mockImplementation((filters: {
    userId?: string
    patientId?: string
    dateRange?: { start: string; end: string }
    pagination?: { page: number; pageSize: number }
  }) => {
    return Promise.resolve({
      events: [
        {
          eventId: 'audit-123',
          timestamp: '2024-01-15T10:00:00Z',
          eventType: 'DATA_ACCESS',
          userId: filters.userId || 'user-123',
          patientId: filters.patientId || 'patient-456',
          action: 'read',
          resource: '/api/patients/patient-123'
        }
      ],
      pagination: {
        page: filters.pagination?.page || 1,
        pageSize: filters.pagination?.pageSize || 50,
        totalEvents: 1,
        totalPages: 1
      },
      filters: {
        userId: filters.userId,
        patientId: filters.patientId,
        dateRange: filters.dateRange
      }
    })
  }),

  generateReport: vi.fn().mockImplementation((params: {
    timeframe: { start: string; end: string }
    frameworks: string[]
  }) => {
    return Promise.resolve({
      reportId: 'report-' + Math.random().toString(36).substr(2, 9),
      generatedAt: new Date().toISOString(),
      timeframe: params.timeframe,
      frameworks: params.frameworks,
      metrics: {
        totalEvents: 1250,
        complianceScore: 94,
        violations: 3,
        warnings: 12,
        auditCompleteness: 98.5
      },
      details: {
        dataAccess: {
          total: 500,
          compliant: 495,
          violations: 5
        },
        consentManagement: {
          total: 300,
          compliant: 295,
          violations: 5
        },
        retentionPolicy: {
          total: 200,
          compliant: 200,
          violations: 0
        }
      }
    })
  }),

  checkCompliance: vi.fn().mockImplementation(() => {
    return Promise.resolve({
      isCompliant: true,
      score: 94,
      violations: [],
      lastChecked: new Date().toISOString()
    })
  }),

  exportData: vi.fn().mockImplementation((params: {
    format: 'csv' | 'json'
    dateRange: { start: string; end: string }
    filters?: any
  }) => {
    return Promise.resolve({
      exportId: 'export-' + Math.random().toString(36).substr(2, 9),
      format: params.format,
      downloadUrl: `/api/audit/exports/${params.format}/latest`,
      recordCount: 1250,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
  })
}

// Mock Observability Manager
export const MockObservabilityManager = {
  detectMemoryLeaks: vi.fn().mockImplementation((params: {
    snapshots: Array<{ heapUsed: number; timestamp: number }>
    thresholdPercent?: number
    timeWindowMs?: number
    timeoutMs?: number
  }) => {
    if (params.timeoutMs) {
      // Simulate timeout
      return Promise.resolve({
        hasLeak: false,
        error: 'Memory leak detection timeout exceeded',
        timeoutOccurred: true,
        executionTimeMs: params.timeoutMs + 100
      })
    }

    const hasLeak = params.snapshots.length > 3 && 
      params.snapshots[params.snapshots.length - 1].heapUsed > 
      params.snapshots[0].heapUsed * 1.2 // 20% growth threshold

    return Promise.resolve({
      hasLeak,
      leakScore: hasLeak ? 85 : 15,
      confidence: hasLeak ? 0.9 : 0.3,
      growthRate: hasLeak ? 0.25 : 0.05,
      estimatedLeakSize: hasLeak ? 15 * 1024 * 1024 : 0, // 15MB
      recommendations: hasLeak ? [
        'Memory leak detected - investigate recent code changes',
        'Review object lifecycle management',
        'Check for event listener leaks',
        'Verify session cleanup processes'
      ] : [
        'Memory usage within normal parameters'
      ],
      urgency: hasLeak ? 'high' : 'low'
    })
  }),

  analyzeMemoryProfile: vi.fn().mockImplementation((heapProfile: any) => {
    return Promise.resolve({
      totalMemory: heapProfile.totalSize,
      largestConsumers: heapProfile.chunks.map((chunk: any) => ({
        type: chunk.type,
        percentage: (chunk.size / heapProfile.totalSize) * 100,
        recommendation: chunk.size > heapProfile.totalSize * 0.3 ? 
          `Consider optimizing ${chunk.type} usage` : `${chunk.type} usage acceptable`
      })),
      potentialLeaks: heapProfile.chunks
        .filter((chunk: any) => chunk.type === 'event_listeners' && chunk.count > 1000)
        .map((chunk: any) => ({
          type: chunk.type,
          severity: 'high',
          description: `High number of ${chunk.type} detected (${chunk.count})`
        })),
      optimizationSuggestions: [
        'Consider implementing object pooling for frequently allocated objects',
        'Review cache growth patterns'
      ]
    })
  }),

  startMemoryMonitoring: vi.fn().mockImplementation((config: {
    intervalMs: number
    thresholdMb: number
    alertThresholdPercent: number
  }) => {
    return Promise.resolve({
      monitoringId: 'monitor-' + Math.random().toString(36).substr(2, 9),
      isActive: true,
      config,
      startTime: new Date()
    })
  }),

  getActiveAlerts: vi.fn().mockImplementation(() => {
    return Promise.resolve([
      {
        type: 'memory_threshold_exceeded',
        severity: 'warning',
        currentUsageMb: 180,
        thresholdMb: 200,
        percentage: 90,
        timestamp: new Date().toISOString()
      }
    ])
  }),

  analyzeSessionMemoryLeaks: vi.fn().mockImplementation((metrics: any) => {
    const hasSessionLeaks = metrics.expiredSessionsNotCleaned > 0 || metrics.cleanupFailureRate > 0.3
    
    return Promise.resolve({
      hasSessionLeaks,
      estimatedLeakedMemory: hasSessionLeaks ? metrics.expiredSessionsNotCleaned * metrics.averageSessionMemory : 0,
      leakSources: hasSessionLeaks ? [
        'expired_sessions_not_cleaned',
        'session_object_retention',
        'cleanup_process_failures'
      ] : [],
      impact: {
        memoryWasteMb: hasSessionLeaks ? metrics.expiredSessionsNotCleaned * metrics.averageSessionMemory / (1024 * 1024) : 0,
        performanceImpact: hasSessionLeaks ? 'medium' : 'low',
        complianceRisk: hasSessionLeaks ? 'high' : 'low'
      },
      recommendations: hasSessionLeaks ? [
        'Implement aggressive session cleanup',
        'Add memory usage monitoring to session lifecycle',
        'Review session object reference patterns'
      ] : []
    })
  }),

  getSystemHealthMetrics: vi.fn().mockImplementation(() => {
    return Promise.resolve({
      overallHealth: 'healthy',
      memory: {
        usagePercent: 45,
        availableMb: 550,
        trend: 'stable',
        alerts: 1
      },
      sessions: {
        activeCount: 25,
        cleanupEfficiency: 0.95,
        averageMemoryPerSession: 1024 * 1024
      },
      performance: {
        responseTimeMs: 150,
        throughput: 1000,
        errorRate: 0.01
      },
      compliance: {
        lgpdCompliant: true,
        auditTrailComplete: true,
        dataRetentionApplied: true
      }
    })
  }),

  getMemoryUsagePatterns: vi.fn().mockImplementation((params: {
    timeWindowHours: number
    granularity: string
  }) => {
    const dataPoints = Array.from({ length: params.timeWindowHours }, (_, i) => ({
      timestamp: new Date(Date.now() - (params.timeWindowHours - i) * 60 * 60 * 1000),
      memoryUsedMb: 100 + Math.random() * 50,
      sessionCount: 20 + Math.floor(Math.random() * 10),
      loadAverage: 0.3 + Math.random() * 0.4
    }))

    return Promise.resolve({
      timeRange: {
        start: new Date(Date.now() - params.timeWindowHours * 60 * 60 * 1000),
        end: new Date(),
        granularity: params.granularity
      },
      dataPoints,
      trends: {
        memoryGrowthRate: 0.05,
        sessionGrowthRate: 0.02,
        correlation: 0.65
      },
      anomalies: []
    })
  })
}
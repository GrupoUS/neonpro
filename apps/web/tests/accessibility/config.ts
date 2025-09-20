/**
 * Accessibility Testing Configuration
 * Centralized configuration for healthcare accessibility testing
 */

export const ACCESSIBILITY_CONFIG = {
  // Performance thresholds
  performance: {
    maxTestDuration: 30000, // 30 seconds per test
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    batchSize: 10,
    timeout: 10000,
  },

  // Healthcare compliance levels
  compliance: {
    wcag: {
      level: 'AA',
      version: '2.1',
      enforceAAA: ['color-contrast'], // Enforce AAA for specific rules
    },
    healthcare: {
      anvisa: true,
      cfm: true,
      lgpd: true,
      brazilianStandards: true,
    },
  },

  // Test categories and priorities
  categories: {
    critical: ['telemedicine', 'emergency', 'patient-data'],
    high: ['patient-portal', 'medical-professional', 'accessibility'],
    medium: ['admin', 'analytics', 'reporting'],
    low: ['ui', 'common', 'utilities'],
  },

  // Reporting configuration
  reporting: {
    generateHtml: true,
    generateJson: true,
    generateMarkdown: true,
    includeScreenshots: false, // Set to true for visual regression testing
    trackTrends: true,
  },

  // CI/CD integration settings
  ci: {
    failOnViolations: true,
    maxAllowedViolations: {
      critical: 0,
      serious: 0,
      moderate: 5,
      minor: 10,
    },
    commentOnPR: true,
    uploadArtifacts: true,
  },
} as const;

export const HEALTHCARE_RULES = {
  // Brazilian healthcare-specific accessibility rules
  anvisa: [
    'color-contrast-enhanced', // Medical interfaces require higher contrast
    'focus-order-semantics', // Critical for medical device interfaces
    'keyboard-navigation', // Required for professional medical software
    'aria-live-region', // Essential for real-time medical alerts
  ],

  cfm: [
    'document-title', // Medical document titles required
    'landmarks', // Professional interface navigation
    'aria-roles', // Medical role definitions
    'form-field-multiple-labels', // Medical form requirements
  ],

  lgpd: [
    'aria-describedby', // Patient data description requirements
    'required-attr', // Consent form requirements
    'label', // Patient data input labels
    'bypass', // Data access navigation
  ],
} as const;

export const TEST_DATA = {
  // Mock data for testing healthcare components
  mockPatient: {
    id: 'patient-test-123',
    name: 'João Silva Santos',
    cpf: '123.456.789-00',
    birthDate: '1985-03-15',
    email: 'joao.silva@test.com',
    phone: '(11) 99999-8888',
  },

  mockPhysician: {
    id: 'physician-test-123',
    name: 'Dr. Maria Santos',
    crm: '12345-SP',
    specialty: 'Cardiologia',
  },

  mockSession: {
    id: 'session-test-123',
    status: 'active',
    startedAt: new Date().toISOString(),
  },

  mockEmergency: {
    protocol: '2024.001234/SP-12',
    location: {
      latitude: -23.5505,
      longitude: -46.6333,
      address: 'Av. Paulista, 1000, São Paulo - SP',
    },
  },
} as const;

export const MOCK_PROVIDERS = {
  // Mock hook implementations for testing
  telemedicine: {
    useTelemedicineSession: () => ({
      session: TEST_DATA.mockSession,
      patient: TEST_DATA.mockPatient,
      physician: TEST_DATA.mockPhysician,
    }),

    useVideoCall: () => ({
      isConnected: true,
      isVideoEnabled: true,
      isAudioEnabled: true,
      toggleVideo: vi.fn(),
      toggleAudio: vi.fn(),
      endCall: vi.fn(),
    }),

    useRealTimeChat: () => ({
      messages: [
        {
          id: '1',
          content: 'Olá, como está se sentindo?',
          sender: 'physician',
          timestamp: new Date().toISOString(),
        },
      ],
      sendMessage: vi.fn(),
      isConnected: true,
    }),

    useSessionRecording: () => ({
      isRecording: false,
      hasConsent: true,
      toggleRecording: vi.fn(),
      downloadRecording: vi.fn(),
    }),

    useEmergencyEscalation: () => ({
      isEmergency: false,
      escalateEmergency: vi.fn(),
      emergencyData: TEST_DATA.mockEmergency,
    }),
  },

  patients: {
    useCreatePatient: () => ({
      mutate: vi.fn(),
      isLoading: false,
      error: null,
    }),

    usePatients: () => ({
      data: [TEST_DATA.mockPatient],
      isLoading: false,
      error: null,
    }),
  },

  webrtc: {
    useWebRTC: () => ({
      localStream: null,
      remoteStream: null,
      connectionState: 'connected',
      networkQuality: 'excellent',
    }),
  },
} as const;

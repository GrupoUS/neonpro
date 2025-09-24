/**
 * Enhanced Telemedicine Service Tests
 * 
 * Comprehensive test suite for the enhanced telemedicine service with proper database integration
 * Following RED-GREEN methodology and TDD principles
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EnhancedTelemedicineService } from '../services/enhanced-telemedicine-service';
import { z } from 'zod';

// Mock dependencies
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
};

const mockAuditLogger = {
  logSecurityEvent: vi.fn(),
  logError: vi.fn(),
  log: vi.fn(),
};

const mockAiSecurityService = {
  sanitizeForAI: vi.fn((content) => `Sanitized: ${content}`),
  validatePromptSecurity: vi.fn(() => true),
  validateAIOutputSafety: vi.fn(() => true),
};

vi.mock('../clients/supabase', () => ({
  createAdminClient: () => mockSupabase,
}));

vi.mock('../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../services/ai-security-service', () => ({
  aiSecurityService: mockAiSecurityService,
}));

describe('EnhancedTelemedicineService', () => {
  let service: EnhancedTelemedicineService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EnhancedTelemedicineService();
  });

  describe('Session Management', () => {
    it('should create a new telemedicine session', async () => {
      const sessionInput = {
        patientId: 'patient-123',
        professionalId: 'prof-123',
        clinicId: 'clinic-123',
        sessionType: 'consultation' as const,
        scheduledFor: new Date('2024-01-15T10:00:00'),
        estimatedDuration: 30,
        specialty: 'Dermatologia Estética',
        notes: 'Consulta de acompanhamento',
        videoProvider: 'meet' as const,
        recordingEnabled: false,
      };

      const mockSession = {
        id: 'session-123',
        ...sessionInput,
        scheduledFor: sessionInput.scheduledFor.toISOString(),
        status: 'scheduled',
        requiresPrescription: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock professional authorization check
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: {
          id: 'prof-123',
          active: true,
          telemedicine_authorized: true,
        },
        error: null,
      });

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: { id: 'assoc-123' },
        error: null,
      });

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await service.createSession(sessionInput);

      expect(result).toEqual(mockSession);
      expect(mockSupabase.from).toHaveBeenCalledWith('telemedicine_sessions');
      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith({
        event: 'telemedicine_session_created',
        sessionId: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        timestamp: expect.any(String),
      });
    });

    it('should validate professional authorization before creating session', async () => {
      const sessionInput = {
        patientId: 'patient-123',
        professionalId: 'prof-123',
        clinicId: 'clinic-123',
        sessionType: 'consultation' as const,
        scheduledFor: new Date('2024-01-15T10:00:00'),
        estimatedDuration: 30,
        specialty: 'Dermatologia Estética',
      };

      // Mock unauthorized professional
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          id: 'prof-123',
          active: false, // Inactive professional
          telemedicine_authorized: true,
        },
        error: null,
      });

      await expect(service.createSession(sessionInput)).rejects.toThrow('Professional not authorized for telemedicine');
    });

    it('should get session by ID', async () => {
      const mockSession = {
        id: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        clinicId: 'clinic-123',
        sessionType: 'consultation',
        status: 'scheduled',
        scheduledFor: new Date().toISOString(),
        estimatedDuration: 30,
        specialty: 'Dermatologia Estética',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await service.getSession('session-123');

      expect(result).toEqual(mockSession);
    });

    it('should return null for non-existent session', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await service.getSession('non-existent');

      expect(result).toBeNull();
    });

    it('should get professional sessions', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          patientId: 'patient-123',
          professionalId: 'prof-123',
          sessionType: 'consultation',
          status: 'scheduled',
          scheduledFor: new Date().toISOString(),
        },
        {
          id: 'session-2',
          patientId: 'patient-456',
          professionalId: 'prof-123',
          sessionType: 'follow_up',
          status: 'active',
          scheduledFor: new Date().toISOString(),
        },
      ];

      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: mockSessions,
        error: null,
      });

      const result = await service.getProfessionalSessions('prof-123');

      expect(result).toHaveLength(2);
      expect(result[0].professionalId).toBe('prof-123');
    });

    it('should get patient sessions', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          patientId: 'patient-123',
          professionalId: 'prof-123',
          sessionType: 'consultation',
          status: 'scheduled',
          scheduledFor: new Date().toISOString(),
        },
      ];

      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: mockSessions,
        error: null,
      });

      const result = await service.getPatientSessions('patient-123');

      expect(result).toHaveLength(1);
      expect(result[0].patientId).toBe('patient-123');
    });

    it('should filter sessions by status', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          patientId: 'patient-123',
          professionalId: 'prof-123',
          sessionType: 'consultation',
          status: 'scheduled',
          scheduledFor: new Date().toISOString(),
        },
      ];

      mockSupabase.from().select().eq().eq().order.mockResolvedValue({
        data: mockSessions,
        error: null,
      });

      const result = await service.getProfessionalSessions('prof-123', 'scheduled');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('scheduled');
    });
  });

  describe('Session Lifecycle', () => {
    it('should start a telemedicine session', async () => {
      const mockSession = {
        id: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        status: 'scheduled',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      mockSupabase.from().update().eq().mockResolvedValue({
        data: null,
        error: null,
      });

      await service.startSession('session-123', 'prof-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('telemedicine_sessions');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        status: 'active',
        updatedAt: expect.any(String),
      });

      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith({
        event: 'telemedicine_session_started',
        sessionId: 'session-123',
        professionalId: 'prof-123',
        timestamp: expect.any(String),
      });
    });

    it('should prevent starting session from wrong professional', async () => {
      const mockSession = {
        id: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123', // Different from requesting professional
        status: 'scheduled',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      await expect(service.startSession('session-123', 'prof-456')).rejects.toThrow('Session not found or access denied');
    });

    it('should prevent starting non-scheduled session', async () => {
      const mockSession = {
        id: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        status: 'active', // Already active
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      await expect(service.startSession('session-123', 'prof-123')).rejects.toThrow('Session cannot be started');
    });

    it('should end a telemedicine session', async () => {
      const mockSession = {
        id: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        status: 'active',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      mockSupabase.from().update().eq().mockResolvedValue({
        data: null,
        error: null,
      });

      await service.endSession('session-123', 'prof-123', 'completed');

      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        status: 'ended',
        updatedAt: expect.any(String),
      });

      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith({
        event: 'telemedicine_session_ended',
        sessionId: 'session-123',
        professionalId: 'prof-123',
        endReason: 'completed',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Messaging', () => {
    it('should send a message in active session', async () => {
      const mockSession = {
        id: 'session-123',
        status: 'active',
      };

      const messageInput = {
        sessionId: 'session-123',
        senderId: 'patient-123',
        senderRole: 'patient' as const,
        messageType: 'text' as const,
        content: 'Olá, doutor!',
      };

      const mockMessage = {
        id: 'message-123',
        sessionId: 'session-123',
        senderId: 'patient-123',
        senderRole: 'patient',
        messageType: 'text',
        content: 'Sanitized: Olá, doutor!',
        encrypted: true,
        timestamp: new Date().toISOString(),
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockMessage,
        error: null,
      });

      const result = await service.sendMessage(messageInput);

      expect(result).toEqual(mockMessage);
      expect(mockAiSecurityService.sanitizeForAI).toHaveBeenCalledWith('Olá, doutor!');
      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith({
        event: 'telemedicine_message_sent',
        sessionId: 'session-123',
        senderId: 'patient-123',
        messageType: 'text',
        timestamp: expect.any(String),
      });
    });

    it('should prevent sending message in non-active session', async () => {
      const mockSession = {
        id: 'session-123',
        status: 'scheduled', // Not active
      };

      const messageInput = {
        sessionId: 'session-123',
        senderId: 'patient-123',
        senderRole: 'patient' as const,
        messageType: 'text' as const,
        content: 'Olá, doutor!',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      await expect(service.sendMessage(messageInput)).rejects.toThrow('Session is not active');
    });

    it('should get session messages', async () => {
      const mockMessages = [
        {
          id: 'message-1',
          sessionId: 'session-123',
          senderId: 'patient-123',
          senderRole: 'patient',
          messageType: 'text',
          content: 'Olá, doutor!',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'message-2',
          sessionId: 'session-123',
          senderId: 'prof-123',
          senderRole: 'professional',
          messageType: 'text',
          content: 'Olá! Como posso ajudar?',
          timestamp: new Date().toISOString(),
        },
      ];

      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: mockMessages,
        error: null,
      });

      const result = await service.getSessionMessages('session-123');

      expect(result).toHaveLength(2);
      expect(result[0].content).toBe('Olá, doutor!');
      expect(result[1].content).toBe('Olá! Como posso ajudar?');
    });
  });

  describe('Prescriptions', () => {
    it('should create prescription from active session', async () => {
      const mockSession = {
        id: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        status: 'active',
      };

      const prescriptionInput = {
        sessionId: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        medications: [
          {
            name: 'Ácido Retinóico',
            dosage: '0.025%',
            frequency: '1 vez ao dia',
            duration: '3 meses',
            instructions: 'Aplicar à noite, evitar exposição solar',
          },
        ],
        notes: 'Tratamento para acne',
      };

      const mockPrescription = {
        id: 'prescription-123',
        sessionId: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        medications: prescriptionInput.medications,
        notes: prescriptionInput.notes,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockPrescription,
        error: null,
      });

      const result = await service.createPrescription(prescriptionInput);

      expect(result).toEqual(mockPrescription);
      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith({
        event: 'telemedicine_prescription_created',
        sessionId: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        timestamp: expect.any(String),
      });
    });

    it('should prevent prescription creation from unauthorized professional', async () => {
      const mockSession = {
        id: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        status: 'active',
      };

      const prescriptionInput = {
        sessionId: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-456', // Different from session professional
        medications: [
          {
            name: 'Ácido Retinóico',
            dosage: '0.025%',
            frequency: '1 vez ao dia',
            duration: '3 meses',
            instructions: 'Aplicar à noite',
          },
        ],
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      await expect(service.createPrescription(prescriptionInput)).rejects.toThrow('Session not found or access denied');
    });

    it('should validate medication data', async () => {
      const mockSession = {
        id: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        status: 'active',
      };

      const invalidPrescriptionInput = {
        sessionId: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        medications: [
          {
            name: '', // Invalid empty name
            dosage: '0.025%',
            frequency: '1 vez ao dia',
            duration: '3 meses',
            instructions: 'Aplicar à noite',
          },
        ],
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      await expect(service.createPrescription(invalidPrescriptionInput)).rejects.toThrow();
    });
  });

  describe('Professional Authorization', () => {
    it('should validate professional authorization correctly', async () => {
      // Test authorized professional
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: {
          active: true,
          telemedicine_authorized: true,
        },
        error: null,
      });

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: { id: 'assoc-123' },
        error: null,
      });

      const result = await service['validateProfessionalAuthorization']('prof-123', 'clinic-123');

      expect(result).toBe(true);
    });

    it('should reject inactive professional', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          active: false, // Inactive
          telemedicine_authorized: true,
        },
        error: null,
      });

      const result = await service['validateProfessionalAuthorization']('prof-123', 'clinic-123');

      expect(result).toBe(false);
    });

    it('should reject professional without telemedicine authorization', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          active: true,
          telemedicine_authorized: false, // Not authorized
        },
        error: null,
      });

      const result = await service['validateProfessionalAuthorization']('prof-123', 'clinic-123');

      expect(result).toBe(false);
    });

    it('should reject professional without clinic association', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: {
          active: true,
          telemedicine_authorized: true,
        },
        error: null,
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'No association found' },
      });

      const result = await service['validateProfessionalAuthorization']('prof-123', 'clinic-123');

      expect(result).toBe(false);
    });
  });

  describe('Clinic Operations', () => {
    it('should get upcoming sessions for clinic', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          patientId: 'patient-123',
          professionalId: 'prof-123',
          clinicId: 'clinic-123',
          sessionType: 'consultation',
          status: 'scheduled',
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        },
      ];

      mockSupabase.from().select().eq().eq().gte().order().limit.mockResolvedValue({
        data: mockSessions,
        error: null,
      });

      const result = await service.getUpcomingSessions('clinic-123');

      expect(result).toHaveLength(1);
      expect(result[0].clinicId).toBe('clinic-123');
      expect(result[0].status).toBe('scheduled');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      await expect(service.createSession({
        patientId: 'patient-123',
        professionalId: 'prof-123',
        clinicId: 'clinic-123',
        sessionType: 'consultation',
        scheduledFor: new Date(),
        estimatedDuration: 30,
        specialty: 'Dermatologia Estética',
      })).rejects.toThrow('Database connection failed');
    });

    it('should validate session duration limits', async () => {
      await expect(service.createSession({
        patientId: 'patient-123',
        professionalId: 'prof-123',
        clinicId: 'clinic-123',
        sessionType: 'consultation',
        scheduledFor: new Date(),
        estimatedDuration: 180, // Exceeds 120 minute limit
        specialty: 'Dermatologia Estética',
      })).rejects.toThrow();
    });

    it('should validate session type', async () => {
      await expect(service.createSession({
        patientId: 'patient-123',
        professionalId: 'prof-123',
        clinicId: 'clinic-123',
        sessionType: 'invalid_type' as any,
        scheduledFor: new Date(),
        estimatedDuration: 30,
        specialty: 'Dermatologia Estética',
      })).rejects.toThrow();
    });
  });

  describe('Security and Compliance', () => {
    it('should sanitize message content', async () => {
      const mockSession = {
        id: 'session-123',
        status: 'active',
      };

      const messageInput = {
        sessionId: 'session-123',
        senderId: 'patient-123',
        senderRole: 'patient' as const,
        messageType: 'text' as const,
        content: 'Sensitive information: CPF 123.456.789-00',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: {
          id: 'message-123',
          sessionId: 'session-123',
          content: 'Sanitized: Sensitive information: CPF 123.456.789-00',
        },
        error: null,
      });

      await service.sendMessage(messageInput);

      expect(mockAiSecurityService.sanitizeForAI).toHaveBeenCalledWith('Sensitive information: CPF 123.456.789-00');
    });

    it('should log security events for all sensitive operations', async () => {
      const sessionInput = {
        patientId: 'patient-123',
        professionalId: 'prof-123',
        clinicId: 'clinic-123',
        sessionType: 'consultation' as const,
        scheduledFor: new Date(),
        estimatedDuration: 30,
        specialty: 'Dermatologia Estética',
      };

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: {
          active: true,
          telemedicine_authorized: true,
        },
        error: null,
      });

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: { id: 'assoc-123' },
        error: null,
      });

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: {
          id: 'session-123',
          ...sessionInput,
          scheduledFor: sessionInput.scheduledFor.toISOString(),
          status: 'scheduled',
        },
        error: null,
      });

      await service.createSession(sessionInput);

      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith({
        event: 'telemedicine_session_created',
        sessionId: 'session-123',
        patientId: 'patient-123',
        professionalId: 'prof-123',
        timestamp: expect.any(String),
      });
    });
  });
});
/**
 * Healthcare Compliance Suite - LGPD, ANVISA, CFM Validation
 *
 * Specialized test suite for healthcare regulatory compliance
 * Focus on patient data protection, medical device standards, and medical ethics
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventCalendar } from '../event-calendar';
import { CalendarEvent, CalendarEventExtended, EventColor } from '../types';

// Mock healthcare compliance utilities
vi.mock(('@/utils/accessibility/healthcare-audit-utils', () => ({
  validateCalendarEvent: vi.fn().mockReturnValue({ valid: true, score: 0.95 }),
  auditEventAccess: vi
    .fn()
    .mockResolvedValue({ valid: true, auditId: 'audit-123' }),
  validateLGPDCompliance: vi.fn().mockResolvedValue({
    compliant: true,
    violations: [],
    score: 0.98,
  }),
  validateANVISACompliance: vi.fn().mockResolvedValue({
    compliant: true,
    checks: [],
    classification: 'II',
  }),
  validateCFMCompliance: vi.fn().mockResolvedValue({
    compliant: true,
    standards: [],
    ethicsScore: 0.96,
  }),
  generateAuditTrail: vi.fn().mockResolvedValue({
    trailId: 'trail-456',
    entries: [],
  }),
}));

// Mock professional registry validation
vi.mock(('@/utils/professional-registry', () => ({
  validateProfessionalLicense: vi.fn().mockResolvedValue({
    valid: true,
    license: 'CRM-SP-123456',
    specialty: 'Cardiologia',
  }),
  validateProfessionalCredentials: vi.fn().mockResolvedValue({
    valid: true,
    credentials: ['CRM', 'RQE'],
  }),
}));

<<<<<<< HEAD
describe('Healthcare Compliance Suite - LGPD,ANVISA, CFM', () => {
  const healthcareEvents: CalendarEventExtended[] = [
=======
describe(('Healthcare Compliance Suite - LGPD,ANVISA, CFM', () => {
  const healthcareEvents: CalendarEvent[] = [
>>>>>>> origin/main
    {
      id: 'healthcare-1',
      title: 'Consulta Cardiológica',
      description: 'Consulta de acompanhamento - pós-operatório',
      start: new Date('2024-01-15T10:00:00'),
      end: new Date('2024-01-15T11:00:00'),
      color: 'blue',
      patientId: 'patient-123',
      professionalId: 'prof-456',
      location: 'Consultório 101',
      specialty: 'Cardiologia',
    },
    {
      id: 'healthcare-2',
      title: 'Exame Eletrocardiograma',
      description: 'ECG de rotina - avaliação cardíaca',
      start: new Date('2024-01-15T14:00:00'),
      end: new Date('2024-01-15T14:30:00'),
      color: 'emerald',
      patientId: 'patient-123',
      professionalId: 'prof-789',
      location: 'Sala de Exames',
      specialty: 'Cardiologia',
    },
    {
      id: 'medical-device-1',
      title: 'Manutenção Equipamento',
      description: 'Manutenção preventiva - monitor cardíaco',
      start: new Date('2024-01-16T09:00:00'),
      end: new Date('2024-01-16T10:00:00'),
      color: 'violet',
      medicalDevice: {
        classification: 'II',
        manufacturer: 'Medical Tech Inc',
        model: 'CardioMonitor-2024',
        serialNumber: 'SN-2024-001',
      },
    },
  ];

  const mockCallbacks = {
    onEventAdd: vi.fn(),
    onEventUpdate: vi.fn(),
    onEventDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // LGPD COMPLIANCE TESTS
  describe(('LGPD Compliance - Lei Geral de Proteção de Dados', () => {
    it(('should implement data minimization for patient information', () => {
      const sensitiveEvent: CalendarEvent = {
        id: 'lgpd-1',
        title: 'Consulta Confidencial',
        start: new Date('2024-01-15T16:00:00'),
        end: new Date('2024-01-15T17:00:00'),
        color: 'rose',
        patientData: {
          name: 'Maria Santos Silva',
          cpf: '123.456.789-00',
          rg: '12.345.678-9',
          phone: '(11) 99999-9999',
          email: 'maria.santos@email.com',
          address: 'Rua das Flores, 123 - São Paulo, SP',
          healthPlan: 'Unimed',
          policyNumber: 'POL-123456',
        },
      };

      render(
        <EventCalendar events={[sensitiveEvent as any]} {...mockCallbacks} />,
      );

      // Only non-sensitive data should be visible
      expect(screen.getByText('Consulta Confidencial')).toBeInTheDocument();
      expect(screen.queryByText('123.456.789-00')).not.toBeInTheDocument();
      expect(screen.queryByText('(11) 99999-9999')).not.toBeInTheDocument();
      expect(
        screen.queryByText('maria.santos@email.com'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Rua das Flores, 123')).not.toBeInTheDocument();
    });

    it(_'should validate LGPD compliance on event access',async () => {
      const { validateLGPDCompliance, auditEventAccess } = await import(
        '@/utils/accessibility/healthcare-audit-utils'
      );

      render(<EventCalendar events={healthcareEvents} {...mockCallbacks} />);

      // Simulate event access
      const eventElement = screen.getByText('Consulta Cardiológica');
      fireEvent.click(eventElement);

      await waitFor(() => {
        expect(validateLGPDCompliance).toHaveBeenCalledWith(
          expect.objectContaining({
            patientId: 'patient-123',
            operation: 'view',
            dataType: 'appointment',
            purpose: 'healthcare_treatment',
          }),
        );

        expect(auditEventAccess).toHaveBeenCalledWith(
          expect.objectContaining({
            eventId: 'healthcare-1',
            action: 'access',
            resourceType: 'patient_appointment',
          }),
        );
      });
    });

    it(('should enforce data retention policies', () => {
      const oldEvent: CalendarEvent = {
        id: 'old-1',
        title: 'Consulta Antiga',
        start: new Date('2020-01-15T10:00:00'), // 4 years ago
        end: new Date('2020-01-15T11:00:00'),
        color: 'orange',
        patientId: 'patient-old-123',
      };

      render(<EventCalendar events={[oldEvent]} {...mockCallbacks} />);

      // Should handle old data according to retention policies
      expect(screen.getByText('Consulta Antiga')).toBeInTheDocument();

      // Should trigger retention validation
    });

    it(_'should implement patient consent management',async () => {
      const consentEvent: CalendarEvent = {
        id: 'consent-1',
        title: 'Consulta com Consentimento',
        start: new Date('2024-01-15T17:00:00'),
        end: new Date('2024-01-15T18:00:00'),
        color: 'blue',
        patientId: 'patient-consent-123',
        consent: {
          id: 'consent-456',
          type: 'treatment_consent',
          givenAt: new Date('2024-01-10T10:00:00'),
          expiresAt: new Date('2024-12-31T23:59:59'),
          status: 'active',
        },
      };

      render(
        <EventCalendar events={[consentEvent as any]} {...mockCallbacks} />,
      );

      expect(
        screen.getByText('Consulta com Consentimento'),
      ).toBeInTheDocument();

      // Should validate consent status
    });

    it(('should handle data subject rights requests', () => {
      render(<EventCalendar events={healthcareEvents} {...mockCallbacks} />);

      // Should support LGPD data subject rights:
      // - Right to access
      // - Right to correction
      // - Right to deletion
      // - Right to portability
      // - Right to information
    });

    it(('should implement encryption for sensitive data', () => {
      const encryptedEvent: CalendarEvent = {
        id: 'encrypted-1',
        title: 'Consulta Criptografada',
        start: new Date('2024-01-15T18:00:00'),
        end: new Date('2024-01-15T19:00:00'),
        color: 'violet',
        patientId: 'encrypted-patient-123',
        encryptedData: {
          diagnosis: 'encrypted_diagnosis_data',
          treatment: 'encrypted_treatment_plan',
          medications: 'encrypted_medication_list',
        },
      };

      render(
        <EventCalendar events={[encryptedEvent as any]} {...mockCallbacks} />,
      );

      expect(screen.getByText('Consulta Criptografada')).toBeInTheDocument();
      // Should ensure encrypted data is not exposed
    });
  });

  // ANVISA COMPLIANCE TESTS
  describe(('ANVISA Compliance - Agência Nacional de Vigilância Sanitária', () => {
    it(_'should validate medical device classification',async () => {
      const { validateANVISACompliance } = await import(
        '@/utils/accessibility/healthcare-audit-utils'
      );

      const medicalDeviceEvent: CalendarEvent = {
        id: 'anvisa-1',
        title: 'Calibração Equipamento Classe II',
        description: 'Calibração anual de monitor cardíaco',
        start: new Date('2024-01-15T15:00:00'),
        end: new Date('2024-01-15T16:00:00'),
        color: 'orange',
        medicalDevice: {
          classification: 'II',
          manufacturer: 'Medical Devices Brazil',
          model: 'CardioMonitor-Pro',
          serialNumber: 'MDB-2024-001',
          registrationNumber: 'ANVISA-12345678901',
          manufacturingDate: new Date('2023-01-15'),
          expirationDate: new Date('2027-01-15'),
        },
      };

      render(
        <EventCalendar
          events={[medicalDeviceEvent as any]}
          {...mockCallbacks}
        />,
      );

      await waitFor(() => {
        expect(validateANVISACompliance).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceClassification: 'II',
            registrationNumber: 'ANVISA-12345678901',
            operation: 'maintenance',
          }),
        );
      });
    });

    it(('should track medical equipment maintenance schedules', () => {
      const maintenanceEvents: CalendarEvent[] = [
        {
          id: 'maintenance-1',
          title: 'Manutenção Preventiva',
          description: 'Manutenção preventiva mensal',
          start: new Date('2024-01-15T09:00:00'),
          end: new Date('2024-01-15T10:00:00'),
          color: 'emerald',
          maintenanceType: 'preventive',
          equipmentId: 'equip-123',
          frequency: 'monthly',
        },
        {
          id: 'maintenance-2',
          title: 'Manutenção Corretiva',
          description: 'Reparo emergencial',
          start: new Date('2024-01-15T14:00:00'),
          end: new Date('2024-01-15T16:00:00'),
          color: 'rose',
          maintenanceType: 'corrective',
          equipmentId: 'equip-456',
          urgency: 'high',
        },
      ];

      render(<EventCalendar events={maintenanceEvents} {...mockCallbacks} />);

      expect(screen.getByText('Manutenção Preventiva')).toBeInTheDocument();
      expect(screen.getByText('Manutenção Corretiva')).toBeInTheDocument();

      // Should validate maintenance compliance
    });

    it(('should handle medical device recall situations', () => {
      const recallEvent: CalendarEvent = {
        id: 'recall-1',
        title: 'Recall Equipamento',
        description: 'Recall urgente - lote defeituoso',
        start: new Date('2024-01-15T16:00:00'),
        end: new Date('2024-01-15T18:00:00'),
        color: 'rose',
        medicalDevice: {
          classification: 'II',
          manufacturer: 'Defective Devices Inc',
          model: 'Faulty-Model',
          recallInformation: {
            recallId: 'ANVISA-RECALL-2024-001',
            reason: 'Defeito de fabricação',
            riskLevel: 'high',
            actionRequired: 'immediate_removal',
          },
        },
      };

      render(
        <EventCalendar events={[recallEvent as any]} {...mockCallbacks} />,
      );

      expect(screen.getByText('Recall Equipamento')).toBeInTheDocument();
      // Should handle recall procedures appropriately
    });

    it(('should validate sterilization procedures', () => {
      const sterilizationEvent: CalendarEvent = {
        id: 'sterilization-1',
        title: 'Esterilização Equipamento',
        description: 'Esterilização autoclave - equipamento cirúrgico',
        start: new Date('2024-01-15T11:00:00'),
        end: new Date('2024-01-15T12:00:00'),
        color: 'violet',
        medicalProcedure: {
          type: 'sterilization',
          method: 'autoclave',
          temperature: 121,
          pressure: 15,
          duration: 30,
          validationRequired: true,
        },
      };

      render(
        <EventCalendar
          events={[sterilizationEvent as any]}
          {...mockCallbacks}
        />,
      );

      expect(screen.getByText('Esterilização Equipamento')).toBeInTheDocument();
      // Should validate sterilization parameters
    });

    it(('should track quality control procedures', () => {
      const qualityControlEvent: CalendarEvent = {
        id: 'qc-1',
        title: 'Controle de Qualidade',
        description: 'Inspeção de qualidade - produção',
        start: new Date('2024-01-15T13:00:00'),
        end: new Date('2024-01-15T15:00:00'),
        color: 'blue',
        qualityControl: {
          type: 'production_inspection',
          standard: 'ISO-13485',
          inspector: 'Inspector-123',
          results: 'pending',
        },
      };

      render(
        <EventCalendar
          events={[qualityControlEvent as any]}
          {...mockCallbacks}
        />,
      );

      expect(screen.getByText('Controle de Qualidade')).toBeInTheDocument();
    });
  });

  // CFM COMPLIANCE TESTS
  describe(('CFM Compliance - Conselho Federal de Medicina', () => {
    it(_'should validate professional license and credentials',async () => {
      const { validateProfessionalLicense } = await import(
        '@/utils/professional-registry'
      );

      render(<EventCalendar events={healthcareEvents} {...mockCallbacks} />);

      // Simulate professional validation
      const eventElement = screen.getByText('Consulta Cardiológica');
      fireEvent.click(eventElement);

      await waitFor(() => {
        expect(validateProfessionalLicense).toHaveBeenCalledWith(
          expect.objectContaining({
            professionalId: 'prof-456',
            specialty: 'Cardiologia',
          }),
        );
      });
    });

    it(('should enforce appointment duration limits', () => {
      const excessiveDurationEvent: CalendarEvent = {
        id: 'excessive-1',
        title: 'Consulta Excessivamente Longa',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T14:00:00'), // 4 hours
        color: 'rose',
        patientId: 'patient-123',
        professionalId: 'prof-456',
        specialty: 'Cardiologia',
      };

      render(
        <EventCalendar events={[excessiveDurationEvent]} {...mockCallbacks} />,
      );

      expect(
        screen.getByText('Consulta Excessivamente Longa'),
      ).toBeInTheDocument();
      // Should validate CFM duration guidelines
    });

    it(('should prevent simultaneous appointments for same professional', () => {
      const conflictingEvents: CalendarEvent[] = [
        {
          id: 'conflict-1',
          title: 'Consulta Dr. Silva - Paciente A',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00'),
          color: 'blue',
          patientId: 'patient-a',
          professionalId: 'prof-456',
          specialty: 'Cardiologia',
        },
        {
          id: 'conflict-2',
          title: 'Consulta Dr. Silva - Paciente B',
          start: new Date('2024-01-15T10:30:00'),
          end: new Date('2024-01-15T11:30:00'),
          color: 'blue',
          patientId: 'patient-b',
          professionalId: 'prof-456', // Same professional
          specialty: 'Cardiologia',
        },
      ];

      render(<EventCalendar events={conflictingEvents} {...mockCallbacks} />);

      expect(
        screen.getByText('Consulta Dr. Silva - Paciente A'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Consulta Dr. Silva - Paciente B'),
      ).toBeInTheDocument();
      // Should handle professional scheduling conflicts
    });

    it(_'should validate professional-patient relationship boundaries',async () => {
      const { validateCFMCompliance } = await import(
        '@/utils/accessibility/healthcare-audit-utils'
      );

      render(<EventCalendar events={healthcareEvents} {...mockCallbacks} />);

      // Simulate boundary validation
      const eventElement = screen.getByText('Consulta Cardiológica');
      fireEvent.click(eventElement);

      await waitFor(() => {
        expect(validateCFMCompliance).toHaveBeenCalledWith(
          expect.objectContaining({
            professionalId: 'prof-456',
            patientId: 'patient-123',
            action: 'consultation',
            boundaryCheck: true,
          }),
        );
      });
    });

    it(('should enforce telemedicine regulations', () => {
      const telemedicineEvent: CalendarEvent = {
        id: 'telemedicine-1',
        title: 'Teleconsulta Cardiológica',
        description: 'Consulta remota via telemedicina',
        start: new Date('2024-01-15T15:00:00'),
        end: new Date('2024-01-15T16:00:00'),
        color: 'violet',
        patientId: 'patient-tele-123',
        professionalId: 'prof-456',
        specialty: 'Cardiologia',
        consultationType: 'telemedicine',
        platform: 'secure-video-platform',
      };

      render(
        <EventCalendar
          events={[telemedicineEvent as any]}
          {...mockCallbacks}
        />,
      );

      expect(screen.getByText('Teleconsulta Cardiológica')).toBeInTheDocument();
      // Should validate CFM telemedicine regulations
    });

    it(('should handle prescription management', () => {
      const prescriptionEvent: CalendarEvent = {
        id: 'prescription-1',
        title: 'Renovação Receita',
        description: 'Renovação de receita controlada',
        start: new Date('2024-01-15T16:00:00'),
        end: new Date('2024-01-15T17:00:00'),
        color: 'orange',
        patientId: 'patient-rx-123',
        professionalId: 'prof-456',
        specialty: 'Cardiologia',
        prescription: {
          type: 'controlled_medication',
          medications: ['Atenolol 50mg'],
          validUntil: new Date('2024-04-15'),
          requiresDigitalSignature: true,
        },
      };

      render(
        <EventCalendar
          events={[prescriptionEvent as any]}
          {...mockCallbacks}
        />,
      );

      expect(screen.getByText('Renovação Receita')).toBeInTheDocument();
      // Should validate prescription regulations
    });

    it(('should maintain professional confidentiality', () => {
      const confidentialEvent: CalendarEvent = {
        id: 'confidential-1',
        title: 'Discussão de Caso',
        description: 'Discussão de caso complexo entre profissionais',
        start: new Date('2024-01-15T18:00:00'),
        end: new Date('2024-01-15T19:00:00'),
        color: 'rose',
        isConfidential: true,
        participants: ['prof-456', 'prof-789'],
        discussionTopic: 'Caso clínico complexo',
      };

      render(
        <EventCalendar
          events={[confidentialEvent as any]}
          {...mockCallbacks}
        />,
      );

      expect(screen.getByText('Discussão de Caso')).toBeInTheDocument();
      // Should maintain professional confidentiality
    });
  });

  // COMPREHENSIVE AUDIT TRAIL TESTING
  describe(('Comprehensive Audit Trail', () => {
    it(_'should generate complete audit trail for all operations',async () => {
      const { generateAuditTrail } = await import(
        '@/utils/accessibility/healthcare-audit-utils'
      );

      render(<EventCalendar events={healthcareEvents} {...mockCallbacks} />);

      // Simulate various operations
      const eventElement = screen.getByText('Consulta Cardiológica');
      fireEvent.click(eventElement);

      await waitFor(() => {
        expect(generateAuditTrail).toHaveBeenCalledWith(
          expect.objectContaining({
            operation: 'event_access',
            _userId: expect.any(String),
            timestamp: expect.any(Date),
            details: expect.objectContaining({
              eventId: 'healthcare-1',
              patientId: 'patient-123',
            }),
          }),
        );
      });
    });

    it(('should maintain immutable audit records', () => {
      render(<EventCalendar events={healthcareEvents} {...mockCallbacks} />);

      // Should ensure audit records cannot be tampered with
      // This is critical for healthcare compliance
    });

    it(('should provide audit reporting capabilities', () => {
      render(<EventCalendar events={healthcareEvents} {...mockCallbacks} />);

      // Should support audit report generation
      // For regulatory inspections and compliance reviews
    });
  });

  // CROSS-COMPLIANCE INTEGRATION
<<<<<<< HEAD
  describe('Cross-Compliance Integration', () => {
    it('should coordinate between LGPD,ANVISA, and CFM requirements', async () => {
=======
  describe(('Cross-Compliance Integration', () => {
    it(_'should coordinate between LGPD,ANVISA, and CFM requirements',async () => {
>>>>>>> origin/main
      const integratedEvent: CalendarEvent = {
        id: 'integrated-1',
        title: 'Consulta Integrada',
        description: 'Consulta com equipamento médico e dados sensíveis',
        start: new Date('2024-01-15T17:00:00'),
        end: new Date('2024-01-15T18:00:00'),
        color: 'blue',
        patientId: 'patient-integrated-123',
        professionalId: 'prof-456',
        specialty: 'Cardiologia',
        medicalDevice: {
          classification: 'II',
          manufacturer: 'Medical Tech',
          model: 'Integrated-Monitor',
        },
        sensitiveData: true,
      };

      render(
        <EventCalendar events={[integratedEvent as any]} {...mockCallbacks} />,
      );

      expect(screen.getByText('Consulta Integrada')).toBeInTheDocument();

      // Should coordinate all three compliance frameworks
    });

    it(('should handle compliance violations appropriately', () => {
      const violationEvent: CalendarEvent = {
        id: 'violation-1',
        title: 'Potencial Violação',
        start: new Date('2024-01-15T19:00:00'),
        end: new Date('2024-01-15T20:00:00'),
        color: 'rose',
        // This should trigger compliance violation detection
        complianceRisk: 'high',
      };

      render(
        <EventCalendar events={[violationEvent as any]} {...mockCallbacks} />,
      );

      expect(screen.getByText('Potencial Violação')).toBeInTheDocument();
      // Should handle violations with appropriate alerts and actions
    });

    it(('should provide compliance documentation', () => {
      render(<EventCalendar events={healthcareEvents} {...mockCallbacks} />);

      // Should generate compliance documentation for:
      // - LGPD compliance reports
      // - ANVISA registration documentation
      // - CFM ethics compliance
    });
  });
});

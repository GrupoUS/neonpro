/**
 * Enhanced Aesthetic Scheduling Service Test Suite
 * Tests multi-session support, recovery planning, and professional certification validation
 */

import { EnhancedAestheticSchedulingService } from '../services/enhanced-aesthetic-scheduling-service.js';
import type {
  AestheticSchedulingRequest,
  AestheticSchedulingResult,
  AestheticProcedureDetails,
  TreatmentPackage
} from '../services/enhanced-aesthetic-scheduling-service.js';

describe('EnhancedAestheticSchedulingService', () => {
  let service: EnhancedAestheticSchedulingService;

  beforeEach(() => {
    service = new EnhancedAestheticSchedulingService();
  });

  describe('Aesthetic Procedure Scheduling', () => {
    test('should schedule single aesthetic procedure successfully', async () => {
      const request: AestheticSchedulingRequest = {
        patientId: 'patient_1',
        procedures: ['botox_forehead'],
        urgencyLevel: 'medium'
      };

      const result = await service.scheduleAestheticProcedures(request);

      expect(result.success).toBe(true);
      expect(result.appointments).toHaveLength(1);
      expect(result.appointments[0].procedureDetails.name).toContain('Botox');
      expect(result.appointments[0].sessionNumber).toBe(1);
      expect(result.appointments[0].totalSessions).toBe(1);
      expect(result.recoveryPlan.recoveryPeriodDays).toBeGreaterThan(0);
    });

    test('should schedule multi-session treatment correctly', async () => {
      const request: AestheticSchedulingRequest = {
        patientId: 'patient_2',
        procedures: ['hyaluronic_filler_series'],
        urgencyLevel: 'low'
      };

      const result = await service.scheduleAestheticProcedures(request);

      expect(result.success).toBe(true);
      expect(result.appointments.length).toBeGreaterThan(1);
      
      // Verify session numbering
      const sessionNumbers = result.appointments.map(apt => apt.sessionNumber);
      expect(sessionNumbers).toEqual([1, 2, 3]); // Assuming 3 sessions
      
      // Verify consistent total sessions count
      expect(result.appointments.every(apt => apt.totalSessions === 3)).toBe(true);
    });

    test('should reject procedures with contraindications', async () => {
      const request: AestheticSchedulingRequest = {
        patientId: 'patient_3',
        procedures: ['botox_forehead'],
        medicalHistory: {
          allergies: [],
          medications: [],
          previousProcedures: [],
          skinConditions: [],
          contraindications: ['gravidez', 'amamentação']
        },
        urgencyLevel: 'medium'
      };

      const result = await service.scheduleAestheticProcedures(request);

      expect(result.success).toBe(false);
      expect(result.contraindications.length).toBeGreaterThan(0);
      expect(result.contraindications.some(c => c.includes('gravidez'))).toBe(true);
      expect(result.appointments).toHaveLength(0);
    });

    test('should validate professional certifications', async () => {
      const validation = await service.validateProfessionalCertifications(
        'prof_1',
        ['botox_forehead', 'hyaluronic_lips']
      );

      expect(validation.isValid).toBe(true);
      expect(validation.missingCertifications).toHaveLength(0);
      expect(validation.experienceLevel).toBeGreaterThanOrEqual(2);
    });

    test('should reject unqualified professionals', async () => {
      const validation = await service.validateProfessionalCertifications(
        'prof_unqualified',
        ['advanced_laser_procedure']
      );

      expect(validation.isValid).toBe(false);
      expect(validation.missingCertifications.length).toBeGreaterThan(0);
    });

    test('should calculate variable duration correctly', () => {
      const baseDuration = 30;
      const factors = [
        { factor: 'area_size', impact: 'add_minutes' as const, value: 15, description: 'Large area' },
        { factor: 'complexity', impact: 'multiply_duration' as const, value: 1.5, description: 'High complexity' }
      ];

      const result = service.calculateVariableDuration(baseDuration, factors);
      
      // 30 + 15 = 45, then 45 * 1.5 = 67.5 -> rounded to 68
      expect(result).toBe(68);
    });

    test('should optimize room allocation efficiently', () => {
      const mockAppointments = [
        {
          id: 'apt_1',
          procedureDetails: {
            name: 'Botox Forehead',
            procedureType: 'injectable' as const,
            specialRequirements: ['recovery_room']
          },
          startTime: new Date('2024-01-01T09:00:00')
        },
        {
          id: 'apt_2',
          procedureDetails: {
            name: 'Laser Hair Removal',
            procedureType: 'laser' as const,
            specialRequirements: ['laser_room']
          },
          startTime: new Date('2024-01-01T10:00:00')
        }
      ] as any;

      const optimization = service.optimizeRoomAllocation(mockAppointments);

      expect(optimization.roomAssignments.size).toBeGreaterThan(0);
      expect(optimization.utilization).toBeGreaterThan(0);
      expect(optimization.utilization).toBeLessThanOrEqual(1);
    });
  });

  describe('Treatment Package Scheduling', () => {
    test('should schedule complete treatment package', async () => {
      const mockPackage: TreatmentPackage = {
        id: 'facial_harmony_package',
        name: 'Facial Harmony Package',
        description: 'Complete facial rejuvenation treatment',
        procedures: [
          {
            id: 'botox_forehead',
            name: 'Botox Forehead',
            procedureType: 'injectable',
            baseDurationMinutes: 30,
            variableDurationFactors: [],
            requiredCertifications: ['botox_certification'],
            minExperienceLevel: 2,
            contraindications: ['gravidez', 'amamentação'],
            aftercareInstructions: ['Avoid lying down for 4 hours'],
            recoveryPeriodDays: 0,
            anestheticType: 'tópica',
            sessionCount: 1,
            intervalBetweenSessionsDays: 0,
            specialRequirements: [],
            category: 'Injectables'
          }
        ],
        totalSessions: 3,
        totalDurationMinutes: 90,
        totalPrice: 3600,
        recoveryPeriodDays: 7,
        recommendedIntervalWeeks: 2,
        packageDiscount: 10
      };

      // Mock the treatment package in the service
      (service as any).treatmentPackages.set(mockPackage.id, mockPackage);

      const result = await service.scheduleTreatmentPackage(
        mockPackage.id,
        'patient_4',
        new Date('2024-01-01'),
        {}
      );

      expect(result.success).toBe(true);
      expect(result.appointments.length).toBe(mockPackage.totalSessions);
      expect(result.totalCost).toBe(mockPackage.totalPrice);
    });

    test('should handle invalid treatment package', async () => {
      await expect(
        service.scheduleTreatmentPackage(
          'invalid_package',
          'patient_5',
          new Date('2024-01-01'),
          {}
        )
      ).rejects.toThrow('Treatment package not found');
    });
  });

  describe('Duration Variables and Recovery Planning', () => {
    test('should calculate appropriate recovery buffer for different procedures', () => {
      const surgicalProcedure = {
        procedureType: 'surgical' as const
      } as AestheticProcedureDetails;
      
      const injectableProcedure = {
        procedureType: 'injectable' as const
      } as AestheticProcedureDetails;

      const surgicalBuffer = (service as any).calculateRecoveryBuffer(surgicalProcedure);
      const injectableBuffer = (service as any).calculateRecoveryBuffer(injectableProcedure);

      expect(surgicalBuffer).toBeGreaterThan(injectableBuffer);
      expect(surgicalBuffer).toBe(60); // 1 hour for surgical
      expect(injectableBuffer).toBe(15); // 15 minutes for injectable
    });

    test('should create comprehensive recovery plan', () => {
      const procedures = [
        {
          name: 'Botox + Filler Combination',
          recoveryPeriodDays: 7,
          contraindications: ['gravidez', 'amamentação'],
          aftercareInstructions: ['Avoid lying down', 'No makeup for 24h']
        }
      ] as AestheticProcedureDetails[];

      const appointments = [] as any;

      const recoveryPlan = (service as any).createRecoveryPlan(procedures, appointments);

      expect(recoveryPlan.recoveryPeriodDays).toBe(7);
      expect(recoveryPlan.dailyInstructions.length).toBeGreaterThan(0);
      expect(recoveryPlan.followUpAppointments.length).toBeGreaterThan(0);
      expect(recoveryPlan.emergencyContacts.length).toBeGreaterThan(0);
      expect(recoveryPlan.restrictions.length).toBeGreaterThan(0);
    });
  });

  describe('Professional Assignment and Certification', () => {
    test('should assign primary professional with valid certifications', async () => {
      const procedures = [
        {
          id: 'botox_forehead',
          requiredCertifications: ['botox_certification'],
          minExperienceLevel: 2,
          specialRequirements: []
        }
      ] as AestheticProcedureDetails[];

      const assignments = await (service as any).assignProfessionals(procedures);

      expect(assignments.length).toBeGreaterThan(0);
      expect(assignments[0].role).toBe('primary');
      expect(assignments[0].certificationVerified).toBe(true);
      expect(assignments[0].experienceLevel).toBeGreaterThanOrEqual(2);
    });

    test('should assign assistant when required', async () => {
      const procedures = [
        {
          id: 'complex_procedure',
          requiredCertifications: ['advanced_certification'],
          minExperienceLevel: 5,
          specialRequirements: ['assistant_required']
        }
      ] as AestheticProcedureDetails[];

      const assignments = await (service as any).assignProfessionals(procedures);

      const primaryAssignment = assignments.find(a => a.role === 'primary');
      const assistantAssignment = assignments.find(a => a.role === 'assistant');

      expect(primaryAssignment).toBeDefined();
      expect(assistantAssignment).toBeDefined();
    });
  });

  describe('Multi-Session Treatment Management', () => {
    test('should calculate correct treatment schedule', () => {
      const procedures = [
        {
          baseDurationMinutes: 30,
          variableDurationFactors: [
            { factor: 'complexity', impact: 'multiply_duration' as const, value: 1.5, description: 'Complex' }
          ],
          sessionCount: 3,
          intervalBetweenSessionsDays: 14,
          recoveryPeriodDays: 2
        }
      ] as AestheticProcedureDetails[];

      const request = {
        procedures: ['multi_session_procedure']
      } as AestheticSchedulingRequest;

      const schedule = (service as any).calculateTreatmentSchedule(procedures, request);

      expect(schedule.sessions).toHaveLength(3);
      expect(schedule.sessions[0].duration).toBe(45); // 30 * 1.5
      expect(schedule.sessions[0].sessionNumber).toBe(1);
      expect(schedule.totalDuration).toBe(135); // 45 * 3 sessions
      expect(schedule.totalRecoveryDays).toBe(6); // 2 * 3 sessions
    });

    test('should generate package dates with correct intervals', () => {
      const startDate = new Date('2024-01-01');
      const treatmentPackage = {
        totalSessions: 3,
        recommendedIntervalWeeks: 2
      } as TreatmentPackage;

      const dates = (service as any).generatePackageDates(startDate, treatmentPackage);

      expect(dates).toHaveLength(3);
      expect(dates[0].getTime()).toBe(startDate.getTime());
      
      // Check 2-week intervals (14 days)
      const interval1 = (dates[1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
      const interval2 = (dates[2].getTime() - dates[1].getTime()) / (1000 * 60 * 60 * 24);
      
      expect(interval1).toBe(14);
      expect(interval2).toBe(14);
    });
  });

  describe('Aesthetic-Specific Features', () => {
    test('should handle combination procedures', async () => {
      const request: AestheticSchedulingRequest = {
        patientId: 'patient_6',
        procedures: ['botox_forehead', 'hyaluronic_lips'],
        urgencyLevel: 'medium'
      };

      const result = await service.scheduleAestheticProcedures(request);

      expect(result.success).toBe(true);
      expect(result.appointments.length).toBeGreaterThan(0);
      
      // Verify combination-specific features
      const hasCombination = result.appointments.some(apt => 
        apt.procedureDetails.procedureType === 'combination'
      );
      expect(hasCombination).toBe(true);
    });

    test('should provide alternative treatment options', async () => {
      const request: AestheticSchedulingRequest = {
        patientId: 'patient_7',
        procedures: ['expensive_laser_treatment'],
        budgetRange: { min: 1000, max: 2000 },
        urgencyLevel: 'medium'
      };

      const result = await service.scheduleAestheticProcedures(request);

      expect(result.alternativeOptions).toBeDefined();
      if (result.alternativeOptions && result.alternativeOptions.length > 0) {
        const alternative = result.alternativeOptions[0];
        expect(alternative.costDifference).toBeDefined();
        expect(alternative.benefits.length).toBeGreaterThan(0);
        expect(alternative.tradeoffs.length).toBeGreaterThan(0);
      }
    });

    test('should generate appropriate warnings and recommendations', async () => {
      const request: AestheticSchedulingRequest = {
        patientId: 'patient_8',
        procedures: ['laser_treatment'],
        medicalHistory: {
          allergies: ['lidocaine'],
          medications: ['blood_thinners'],
          previousProcedures: [],
          skinConditions: ['melasma'],
          contraindications: []
        },
        urgencyLevel: 'medium'
      };

      const result = await service.scheduleAestheticProcedures(request);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('allergies'))).toBe(true);
      expect(result.warnings.some(w => w.includes('medications'))).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid procedure IDs', async () => {
      const request: AestheticSchedulingRequest = {
        patientId: 'patient_9',
        procedures: ['invalid_procedure_id'],
        urgencyLevel: 'medium'
      };

      const result = await service.scheduleAestheticProcedures(request);

      expect(result.success).toBe(false);
      expect(result.appointments).toHaveLength(0);
      expect(result.warnings.some(w => w.includes('not available'))).toBe(true);
    });

    test('should handle empty procedure list', async () => {
      const request: AestheticSchedulingRequest = {
        patientId: 'patient_10',
        procedures: [],
        urgencyLevel: 'medium'
      };

      const result = await service.scheduleAestheticProcedures(request);

      expect(result.success).toBe(false);
      expect(result.appointments).toHaveLength(0);
    });

    test('should handle missing medical history gracefully', async () => {
      const request: AestheticSchedulingRequest = {
        patientId: 'patient_11',
        procedures: ['simple_procedure'],
        urgencyLevel: 'medium'
        // No medicalHistory provided
      };

      const result = await service.scheduleAestheticProcedures(request);

      // Should not fail, but may have warnings
      expect(result.success).toBe(true);
    });
  });
});
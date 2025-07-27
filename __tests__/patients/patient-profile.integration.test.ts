/**
 * Patient Profile Integration Tests
 * 
 * Tests for the comprehensive patient profile management system including
 * profile creation, updates, search functionality, and AI insights integration.
 */

import { patientInsights } from '../../lib/ai/patient-insights';
import { ProfileManager } from '../../lib/patients/profile-manager';

// Mock the entire Supabase module to avoid ES module issues
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) })),
      select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn() })) })),
      update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) })) }))
    }))
  }))
}));

// Mock AuditLogger to avoid dependencies
jest.mock('../../lib/auth/audit/audit-logger', () => ({
  AuditLogger: jest.fn().mockImplementation(() => ({
    logProfileUpdate: jest.fn().mockResolvedValue(true),
    logProfileAccess: jest.fn().mockResolvedValue(true)
  }))
}));

describe('Patient Profile System Integration Tests', () => {
  let profileManager: ProfileManager;
  let mockSupabaseClient: any;
  
  const mockPatientData = {
    patient_id: 'test-patient-001',
    demographics: {
      name: 'John Doe',
      date_of_birth: '1980-05-15',
      gender: 'male' as const,
      phone: '+1-555-123-4567',
      email: 'john.doe@email.com',
      address: '123 Main St, City, State 12345',
      insurance_provider: 'Blue Cross',
      insurance_id: 'BC123456789',
      preferred_language: 'English'
    },
    medical_information: {
      medical_history: ['Hypertension', 'Type 2 Diabetes'],
      chronic_conditions: ['Diabetes Mellitus Type 2'],
      current_medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice daily',
          prescribing_doctor: 'Dr. Smith'
        }
      ],
      allergies: ['Penicillin', 'Shellfish']
    },
    vital_signs: {
      height_cm: 180,
      weight_kg: 85,
      bmi: 26.2,
      blood_pressure_systolic: 140,
      blood_pressure_diastolic: 90,
      blood_type: 'O+'
    },
    care_preferences: {
      communication_method: 'email' as const,
      appointment_preferences: {
        preferred_time_of_day: 'morning' as const,
        preferred_days: ['Monday', 'Wednesday', 'Friday']
      },
      language: 'English'
    },
    emergency_contacts: [
      {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1-555-987-6543',
        email: 'jane.doe@email.com',
        is_primary: true,
        can_make_medical_decisions: true
      }
    ]
  };

  beforeEach(() => {
    // Create mock Supabase client
    mockSupabaseClient = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({ 
          select: jest.fn(() => ({ 
            single: jest.fn(() => ({ data: mockPatientData, error: null })) 
          })) 
        })),
        select: jest.fn(() => ({ 
          eq: jest.fn(() => ({ 
            single: jest.fn(() => ({ data: mockPatientData, error: null })) 
          })) 
        })),
        update: jest.fn(() => ({ 
          eq: jest.fn(() => ({ 
            select: jest.fn(() => ({ 
              single: jest.fn(() => ({ data: mockPatientData, error: null })) 
            })) 
          })) 
        }))
      }))
    };
    
    profileManager = new ProfileManager();
    // patientInsights is now imported as a ready-to-use object
  });

  describe('ProfileManager Core Operations', () => {
    test('should create a comprehensive patient profile', async () => {
      const result = await profileManager.createPatientProfile(mockPatientData);
      
      expect(result).toBeTruthy();
      expect(result?.patient_id).toBe(mockPatientData.patient_id);
      expect(result?.demographics.name).toBe(mockPatientData.demographics.name);
      expect(result?.profile_completeness_score).toBeGreaterThan(0);
      expect(result?.is_active).toBe(true);
    });

    test('should retrieve existing patient profile', async () => {
      // First create a profile
      await profileManager.createPatientProfile(mockPatientData);
      
      // Then retrieve it
      const result = await profileManager.getPatientProfile(mockPatientData.patient_id);
      
      expect(result).toBeTruthy();
      expect(result?.patient_id).toBe(mockPatientData.patient_id);
      expect(result?.demographics.name).toBe(mockPatientData.demographics.name);
      expect(result?.last_accessed).toBeTruthy();
    });

    test('should update patient profile selectively', async () => {
      // Create initial profile
      await profileManager.createPatientProfile(mockPatientData);
      
      // Update demographics only
      const updateData = {
        demographics: {
          phone: '+1-555-999-8888',
          address: '456 New Street, New City, State 54321'
        }
      };
      
      const result = await profileManager.updatePatientProfile(
        mockPatientData.patient_id,
        updateData
      );
      
      expect(result).toBeTruthy();
      expect(result?.demographics.phone).toBe(updateData.demographics.phone);
      expect(result?.demographics.address).toBe(updateData.demographics.address);
      expect(result?.demographics.name).toBe(mockPatientData.demographics.name); // Should remain unchanged
    });

    test('should calculate profile completeness score accurately', async () => {
      const result = await profileManager.createPatientProfile(mockPatientData);
      
      expect(result?.profile_completeness_score).toBeGreaterThan(0.7);
      expect(result?.profile_completeness_score).toBeLessThanOrEqual(1.0);
    });

    test('should search patients by various criteria', async () => {
      // Create mock patient data to populate mockProfiles
      const testPatient1 = {
        patient_id: 'test-patient-1',
        demographics: {
          name: 'John Doe',
          date_of_birth: '1985-06-15',
          gender: 'male' as const,
          phone: '+1-555-123-4567',
          email: 'john.doe@example.com',
          address: '123 Main St, City, State 12345'
        }
      };

      const testPatient2 = {
        patient_id: 'test-patient-2',
        demographics: {
          name: 'Jane Smith',
          date_of_birth: '1990-03-20',
          gender: 'female' as const,
          phone: '+1-555-987-6543',
          email: 'jane.smith@example.com',
          address: '456 Oak Ave, Town, State 67890'
        }
      };

      // Create patient profiles to populate internal mockProfiles
      await profileManager.createPatientProfile(testPatient1);
      await profileManager.createPatientProfile(testPatient2);
      
      // Test search by name
      const nameResults = await profileManager.searchPatients({ name: 'John' });
      expect(nameResults.length).toBeGreaterThan(0);
      expect(nameResults[0].demographics.name).toContain('John');
      
      // Test search by phone
      const phoneResults = await profileManager.searchPatients({ 
        phone: testPatient1.demographics.phone 
      });
      expect(phoneResults.length).toBe(1);
      expect(phoneResults[0].patient_id).toBe(testPatient1.patient_id);
    });

    test('should identify incomplete profiles', async () => {
      // Create a complete profile
      await profileManager.createPatientProfile(mockPatientData);
      
      // Create an incomplete profile
      const incompleteData = {
        patient_id: 'incomplete-patient',
        demographics: {
          name: 'Incomplete User',
          date_of_birth: '1990-01-01',
          gender: 'female' as const,
          phone: '',
          email: '',
          address: ''
        }
      };
      
      await profileManager.createPatientProfile(incompleteData);
      
      const incompleteProfiles = await profileManager.getIncompleteProfiles(0.8);
      
      expect(incompleteProfiles.length).toBeGreaterThan(0);
      const found = incompleteProfiles.find(p => p.patient_id === 'incomplete-patient');
      expect(found).toBeTruthy();
      expect(found?.profile_completeness_score).toBeLessThan(0.8);
    });

    test('should archive patient profile', async () => {
      // Create profile
      await profileManager.createPatientProfile(mockPatientData);
      
      // Archive it
      const archived = await profileManager.archivePatientProfile(mockPatientData.patient_id);
      expect(archived).toBe(true);
      
      // Try to retrieve archived profile
      const result = await profileManager.getPatientProfile(mockPatientData.patient_id);
      expect(result).toBeNull();
    });

    test('should provide patient analytics', async () => {
      // Create some test profiles
      await profileManager.createPatientProfile(mockPatientData);
      await profileManager.createPatientProfile({
        ...mockPatientData,
        patient_id: 'test-patient-002'
      });
      
      const analytics = await profileManager.getPatientAnalytics();
      
      expect(analytics.totalPatients).toBeGreaterThanOrEqual(2);
      expect(analytics.activePatients).toBeGreaterThanOrEqual(2);
      expect(analytics.averageCompleteness).toBeGreaterThan(0);
      expect(typeof analytics.profilesNeedingAttention).toBe('number');
      expect(typeof analytics.recentlyUpdated).toBe('number');
    });
  });

  describe('AI Patient Insights Integration', () => {
    test('should generate comprehensive patient insights', async () => {
      const insights = await patientInsights.generatePatientInsights(mockPatientData);
      
      expect(insights).toBeTruthy();
      expect(insights.clinical_insights).toBeInstanceOf(Array);
      expect(insights.personalization_insights).toBeTruthy();
      expect(insights.risk_assessment).toBeTruthy();
      expect(insights.care_recommendations).toBeInstanceOf(Array);
    });

    test('should provide clinical insights with proper structure', async () => {
      const insights = await patientInsights.generatePatientInsights(mockPatientData);
      
      const clinicalInsights = insights.clinical_insights;
      expect(clinicalInsights.length).toBeGreaterThan(0);
      
      const firstInsight = clinicalInsights[0];
      expect(firstInsight.type).toBeTruthy();
      expect(firstInsight.priority).toBeTruthy();
      expect(firstInsight.title).toBeTruthy();
      expect(firstInsight.description).toBeTruthy();
      expect(firstInsight.confidence_score).toBeGreaterThan(0);
      expect(firstInsight.confidence_score).toBeLessThanOrEqual(1);
    });

    test('should provide personalization insights', async () => {
      const insights = await patientInsights.generatePatientInsights(mockPatientData);
      
      const personalization = insights.personalization_insights;
      expect(personalization.communication_preferences).toBeTruthy();
      expect(personalization.care_preferences).toBeTruthy();
      expect(personalization.behavioral_patterns).toBeTruthy();
      
      expect(personalization.behavioral_patterns.appointment_attendance_rate).toBeGreaterThan(0);
      expect(personalization.behavioral_patterns.appointment_attendance_rate).toBeLessThanOrEqual(1);
    });

    test('should perform risk assessment', async () => {
      const insights = await patientInsights.generatePatientInsights(mockPatientData);
      
      const riskAssessment = insights.risk_assessment;
      expect(riskAssessment.overall_score).toBeGreaterThanOrEqual(0);
      expect(riskAssessment.overall_score).toBeLessThanOrEqual(1);
      expect(riskAssessment.level).toBeTruthy();
      expect(['low', 'medium', 'high', 'critical']).toContain(riskAssessment.level);
    });

    test('should generate care recommendations', async () => {
      const insights = await patientInsights.generatePatientInsights(mockPatientData);
      
      const recommendations = insights.care_recommendations;
      expect(recommendations.length).toBeGreaterThan(0);
      
      const firstRecommendation = recommendations[0];
      expect(firstRecommendation.category).toBeTruthy();
      expect(firstRecommendation.title).toBeTruthy();
      expect(firstRecommendation.description).toBeTruthy();
      expect(firstRecommendation.priority).toBeTruthy();
    });

    test('should update insights successfully', async () => {
      const result = await patientInsights.updateInsights(
        mockPatientData.patient_id,
        { new_vitals: { blood_pressure: '130/80' } }
      );
      
      expect(result).toBe(true);
    });

    test('should provide trending insights', async () => {
      const trends = await patientInsights.getTrendingInsights();
      
      expect(trends).toBeInstanceOf(Array);
      expect(trends.length).toBeGreaterThan(0);
      
      const firstTrend = trends[0];
      expect(firstTrend.trend).toBeTruthy();
      expect(firstTrend.patient_count).toBeGreaterThan(0);
      expect(firstTrend.description).toBeTruthy();
    });
  });

  describe('Integrated Workflows', () => {
    test('should create profile and generate insights in workflow', async () => {
      // Create patient profile
      const profile = await profileManager.createPatientProfile(mockPatientData);
      expect(profile).toBeTruthy();
      
      // Generate insights for the profile
      const insights = await patientInsights.generatePatientInsights(mockPatientData);
      expect(insights).toBeTruthy();
      
      // Verify workflow integration
      expect(profile?.patient_id).toBe(mockPatientData.patient_id);
      expect(insights.clinical_insights.length).toBeGreaterThan(0);
    });

    test('should handle profile updates and insight regeneration', async () => {
      // Create initial profile
      await profileManager.createPatientProfile(mockPatientData);
      
      // Update with new vital signs
      const vitalUpdate = {
        vital_signs: {
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          weight_kg: 80
        }
      };
      
      const updatedProfile = await profileManager.updatePatientProfile(
        mockPatientData.patient_id,
        vitalUpdate
      );
      
      expect(updatedProfile).toBeTruthy();
      expect(updatedProfile?.vital_signs.blood_pressure_systolic).toBe(120);
      
      // Update insights with new data
      const insightUpdate = await patientInsights.updateInsights(
        mockPatientData.patient_id,
        vitalUpdate
      );
      
      expect(insightUpdate).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing patient profile gracefully', async () => {
      const result = await profileManager.getPatientProfile('non-existent-patient');
      expect(result).toBeNull();
    });

    test('should handle empty search criteria', async () => {
      const results = await profileManager.searchPatients({});
      expect(results).toBeInstanceOf(Array);
    });

    test('should handle insights generation with minimal data', async () => {
      const minimalData = {
        patient_id: 'minimal-patient',
        demographics: { name: 'Test', date_of_birth: '1990-01-01', gender: 'other' as const, phone: '', email: '', address: '' },
        medical_history: {},
        vital_signs: {},
        appointment_history: {},
        care_preferences: {}
      };
      
      const insights = await patientInsights.generatePatientInsights(minimalData);
      expect(insights).toBeTruthy();
      expect(insights.clinical_insights).toBeInstanceOf(Array);
    });
  });
});
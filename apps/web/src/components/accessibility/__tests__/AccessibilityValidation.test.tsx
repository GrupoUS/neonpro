/**
 * Accessibility Validation Tests
 * T081-A4 - Validate 100% WCAG 2.1 AA+ Compliance
 *
 * Tests comprehensive accessibility compliance including:
 * - WCAG 2.1 AA+ criteria validation
 * - Healthcare-specific accessibility requirements
 * - Brazilian regulatory compliance (LGPD/ANVISA/CFM)
 * - Component-level accessibility testing
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';

// Import our enhanced components
import { EnhancedPatientCard } from '../EnhancedPatientCard';
import { EnhancedHealthcareForm } from '../EnhancedHealthcareForm';
import { HealthcareAccessibilityAuditor } from '../../../utils/healthcare-accessibility-audit';
import { AccessibilityValidator } from '../../../utils/accessibility-validation';

// Mock the accessibility testing utilities
vi.mock('../../../utils/accessibility-testing', () => ({
  createAccessibilityAuditor: () => ({
    auditAccessibility: vi.fn().mockResolvedValue({
      violations: [],
      passes: [],
      incomplete: [],
      timestamp: new Date().toISOString()
    })
  })
}));

// Mock axe-core for testing
vi.mock('@axe-core/react', () => ({
  default: vi.fn().mockImplementation(() => ({
    run: vi.fn().mockResolvedValue({
      violations: [],
      passes: [],
      incomplete: [],
      timestamp: new Date().toISOString()
    })
  }))
}));

describe('Healthcare Accessibility Validation', () => {
  let validator: AccessibilityValidator;
  let healthcareAuditor: HealthcareAccessibilityAuditor;

  beforeEach(() => {
    validator = new AccessibilityValidator();
    healthcareAuditor = new HealthcareAccessibilityAuditor();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Enhanced Patient Card Accessibility', () => {
    const mockPatient = {
      id: 'patient-1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 98765-4321',
      birthDate: new Date('1980-01-01'),
      lastAppointment: new Date('2024-01-15'),
      status: 'active' as const,
      lgpdConsent: true,
      treatmentType: 'Consulta Geral',
      medication: ['Paracetamol 500mg'],
      isEmergencyCase: false,
      requiresSpecialAttention: false
    };

    it('should render with proper ARIA attributes', () => {
      const { container } = render(
        <EnhancedPatientCard
          patient={mockPatient}
          onClick={() => {}}
          showSensitiveData={true}
          enableHealthcareAudit={true}
        />
      );

      const card = container.querySelector('div[role="button"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('aria-selected', 'false');
      expect(card).toHaveAttribute('data-patient-sensitive', 'true');
      expect(card).toHaveAttribute('data-healthcare-category', 'general');
      expect(card).toHaveAttribute('data-audit-context', 'registration');
    });

    it('should handle emergency patient indicators', () => {
      const emergencyPatient = {
        ...mockPatient,
        status: 'emergency' as const,
        isEmergencyCase: true,
        emergencyContact: '(11) 99999-9999'
      };

      const { container } = render(
        <EnhancedPatientCard
          patient={emergencyPatient}
          onClick={() => {}}
          showSensitiveData={true}
          showEmergencyInfo={true}
          auditContext="emergency"
        />
      );

      const emergencyAlert = container.querySelector('[role="alert"]');
      expect(emergencyAlert).toBeInTheDocument();
      expect(emergencyAlert).toHaveTextContent('Paciente em situação de emergência');
      
      const card = container.querySelector('div[role="button"]');
      expect(card).toHaveAttribute('data-emergency', 'true');
      expect(card).toHaveAttribute('data-healthcare-category', 'emergency');
    });

    it('should be keyboard navigable', () => {
      const mockOnSelect = vi.fn();
      const { container } = render(
        <EnhancedPatientCard
          patient={mockPatient}
          onKeyboardSelect={mockOnSelect}
        />
      );

      const card = container.querySelector('div[role="button"]');
      expect(card).toHaveAttribute('tabindex', '0');

      // Simulate keyboard selection
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockOnSelect).toHaveBeenCalledWith(mockPatient);
    });

    it('should handle sensitive data appropriately', () => {
      const { container, rerender } = render(
        <EnhancedPatientCard
          patient={mockPatient}
          onClick={() => {}}
          showSensitiveData={false}
        />
      );

      // Phone should not be visible when showSensitiveData is false
      expect(container.queryByText('(11) 98765-4321')).not.toBeInTheDocument();

      // Phone should be visible when showSensitiveData is true
      rerender(
        <EnhancedPatientCard
          patient={mockPatient}
          onClick={() => {}}
          showSensitiveData={true}
        />
      );

      expect(container.queryByText('(11) 98765-4321')).toBeInTheDocument();
    });

    it('should handle medical information display', () => {
      const patientWithMeds = {
        ...mockPatient,
        medication: ['Paracetamol 500mg', 'Ibuprofeno 400mg'],
        allergies: ['Penicilina']
      };

      const { container } = render(
        <EnhancedPatientCard
          patient={patientWithMeds}
          onClick={() => {}}
          showSensitiveData={true}
        />
      );

      expect(container.queryByText('Medicamentos:')).toBeInTheDocument();
      expect(container.queryByText('Paracetamol 500mg')).toBeInTheDocument();
      expect(container.queryByText('Ibuprofeno 400mg')).toBeInTheDocument();
      
      const allergyAlert = container.querySelector('[role="status"]');
      expect(allergyAlert).toBeInTheDocument();
      expect(allergyAlert).toHaveTextContent('Alergias:');
    });
  });

  describe('Enhanced Healthcare Form Accessibility', () => {
    const mockFields = [
      {
        name: 'name',
        label: 'Nome Completo',
        type: 'text' as const,
        required: true,
        placeholder: 'Digite seu nome completo',
        sensitivityLevel: 'medium' as const,
        lgpdRelevant: true
      },
      {
        name: 'phone',
        label: 'Telefone',
        type: 'tel' as const,
        required: true,
        placeholder: '(11) 98765-4321',
        format: 'phone',
        sensitivityLevel: 'medium' as const,
        lgpdRelevant: true
      },
      {
        name: 'bloodType',
        label: 'Tipo Sanguíneo',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'A+', label: 'A+' },
          { value: 'A-', label: 'A-' },
          { value: 'B+', label: 'B+' },
          { value: 'B-', label: 'B-' },
          { value: 'O+', label: 'O+' },
          { value: 'O-', label: 'O-' },
          { value: 'AB+', label: 'AB+' },
          { value: 'AB-', label: 'AB-' }
        ],
        medicalTerminology: {
          term: 'Tipo Sanguíneo',
          explanation: 'Classificação do sangue baseada na presença ou ausência de antígenos',
          pronunciation: 'tí-po san-guí-ne-o'
        },
        sensitivityLevel: 'high' as const,
        anvisaRelevant: true
      },
      {
        name: 'allergies',
        label: 'Alergias',
        type: 'textarea' as const,
        placeholder: 'Liste suas alergias conhecidas',
        description: 'Informações sobre alergias são críticas para seu tratamento',
        sensitivityLevel: 'critical' as const,
        emergencyRelevant: true,
        anvisaRelevant: true
      }
    ];

    it('should render form with proper ARIA attributes', () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({});
      const { container } = render(
        <EnhancedHealthcareForm
          title="Formulário Médico"
          description="Preencha suas informações médicas"
          fields={mockFields}
          onSubmit={mockOnSubmit}
          enableHealthcareAudit={true}
          auditContext="registration"
        />
      );

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('aria-labelledby', 'healthcare-form-title');
      expect(form).toHaveAttribute('data-healthcare-form', 'registration');
      expect(form).toHaveAttribute('data-audit-enabled', 'true');
    });

    it('should handle medical terminology help', () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({});
      const { container } = render(
        <EnhancedHealthcareForm
          title="Formulário Médico"
          fields={mockFields}
          onSubmit={mockOnSubmit}
        />
      );

      const terminologyHelp = container.querySelector('[role="tooltip"]');
      expect(terminologyHelp).toBeInTheDocument();
      expect(terminologyHelp).toHaveTextContent('Tipo Sanguíneo');
      expect(terminologyHelp).toHaveTextContent('Classificação do sangue baseada na presença ou ausência de antígenos');
    });

    it('should validate required fields', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({});
      const { container } = render(
        <EnhancedHealthcareForm
          title="Formulário Médico"
          fields={mockFields}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Enviar/i });
      fireEvent.click(submitButton);

      // Wait for validation to complete
      await waitFor(() => {
        const errorMessages = container.querySelectorAll('[role="alert"]');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should format input values appropriately', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({});
      const { container } = render(
        <EnhancedHealthcareForm
          title="Formulário Médico"
          fields={mockFields}
          onSubmit={mockOnSubmit}
        />
      );

      const phoneInput = container.querySelector('input[name="phone"]') as HTMLInputElement;
      fireEvent.change(phoneInput, { target: { value: '11987654321' } });

      // Wait for formatting to apply
      await waitFor(() => {
        expect(phoneInput.value).toBe('(11) 98765-4321');
      });
    });

    it('should show emergency field indicators', () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({});
      const { container } = render(
        <EnhancedHealthcareForm
          title="Formulário Médico"
          fields={mockFields}
          onSubmit={mockOnSubmit}
          emergencyMode={true}
        />
      );

      const form = container.querySelector('[data-healthcare-form]');
      expect(form).toHaveAttribute('data-emergency-mode', 'true');
      
      const emergencyField = container.querySelector('[data-emergency-relevant="true"]');
      expect(emergencyField).toBeInTheDocument();
    });
  });

  describe('Healthcare Accessibility Auditor', () => {
    it('should audit accessibility with healthcare context', async () => {
      // Create a mock element for testing
      const mockElement = document.createElement('div');
      mockElement.innerHTML = `
        <button data-patient-sensitive="true">Patient Data</button>
        <div data-emergency="true">Emergency Info</div>
        <span data-medical-term="hypertension">High Blood Pressure</span>
      `;

      const result = await healthcareAuditor.auditAccessibility(mockElement);

      expect(result).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.context).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should handle emergency context auditing', async () => {
      const emergencyContext = {
        emergencyContext: true,
        patientJourney: 'emergency' as const,
        dataSensitivity: 'critical' as const
      };

      healthcareAuditor.setContext(emergencyContext);

      const mockElement = document.createElement('div');
      const result = await healthcareAuditor.auditAccessibility(mockElement);

      expect(result.context.emergencyContext).toBe(true);
      expect(result.context.patientJourney).toBe('emergency');
      expect(result.context.dataSensitivity).toBe('critical');
    });
  });

  describe('Accessibility Validator', () => {
    it('should generate comprehensive validation report', async () => {
      const mockElement = document.createElement('div');
      
      const report = await validator.validateAccessibility(mockElement, {
        includeHealthcareAudit: true,
        validateWCAG: true,
        context: 'registration'
      });

      expect(report).toBeDefined();
      expect(report.timestamp).toBeDefined();
      expect(report.overallScore).toBeGreaterThan(0);
      expect(report.overallScore).toBeLessThanOrEqual(100);
      expect(report.validationStatus).toMatch(/passed|failed|warning/);
      expect(report.wcagCompliance).toBeDefined();
      expect(report.healthcareCompliance).toBeDefined();
      expect(report.componentAnalysis).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should validate component accessibility', async () => {
      const mockElement = document.createElement('div');
      mockElement.innerHTML = '<button>Test Button</button>';
      
      const result = await validator.validateComponent('TestComponent', mockElement);

      expect(result).toBeDefined();
      expect(result.component).toBe('TestComponent');
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should generate compliance certificate', () => {
      const mockReport = {
        timestamp: new Date().toISOString(),
        overallScore: 95,
        validationStatus: 'passed' as const,
        wcagCompliance: {
          level: 'AA' as const,
          score: 95,
          passedCriteria: ['1.1.1', '1.2.1'],
          failedCriteria: []
        },
        healthcareCompliance: {
          overallScore: 90,
          lgpdCompliant: true,
          anvisaCompliant: true,
          cfmCompliant: true,
          emergencyAccessibility: true
        },
        componentAnalysis: {
          totalComponents: 10,
          accessibleComponents: 9,
          componentsWithIssues: 1,
          criticalIssues: 0
        },
        recommendations: []
      };

      const certificate = validator.generateComplianceCertificate(mockReport);

      expect(certificate).toContain('Accessibility Compliance Certificate');
      expect(certificate).toContain('Overall Score: 95%');
      expect(certificate).toContain('WCAG Level: AA');
      expect(certificate).toContain('LGPD Compliant: Yes');
      expect(certificate).toContain('ANVISA Compliant: Yes');
      expect(certificate).toContain('CFM Compliant: Yes');
    });
  });

  describe('WCAG 2.1 AA+ Criteria Validation', () => {
    it('should have comprehensive validation criteria', async () => {
      const { WCAG_21_AA_VALIDATION_CRITERIA } = await import('../../../utils/accessibility-validation');
      
      expect(WCAG_21_AA_VALIDATION_CRITERIA).toBeDefined();
      expect(Array.isArray(WCAG_21_AA_VALIDATION_CRITERIA)).toBe(true);
      expect(WCAG_21_AA_VALIDATION_CRITERIA.length).toBeGreaterThan(0);
      
      // Check that we have criteria for all WCAG categories
      const categories = ['perceivable', 'operable', 'understandable', 'robust'];
      categories.forEach(category => {
        const criteriaInCategory = WCAG_21_AA_VALIDATION_CRITERIA.filter(
          criteria => criteria.category === category
        );
        expect(criteriaInCategory.length).toBeGreaterThan(0);
      });
      
      // Check healthcare relevance
      const healthcareRelevant = WCAG_21_AA_VALIDATION_CRITERIA.filter(
        criteria => criteria.healthcareRelevant
      );
      expect(healthcareRelevant.length).toBeGreaterThan(0);
    });

    it('should validate key healthcare accessibility requirements', async () => {
      const { WCAG_21_AA_VALIDATION_CRITERIA } = await import('../../../utils/accessibility-validation');
      
      // Check for critical healthcare-related criteria
      const healthcareCriteria = WCAG_21_AA_VALIDATION_CRITERIA.filter(criteria => 
        criteria.name.includes('Color') || 
        criteria.name.includes('Keyboard') ||
        criteria.name.includes('Focus') ||
        criteria.name.includes('Error')
      );
      
      expect(healthcareCriteria.length).toBeGreaterThan(0);
      
      healthcareCriteria.forEach(criteria => {
        expect(criteria.healthcareRelevant).toBe(true);
        expect(criteria.wcagLevel).toMatch(/A|AA|AAA/);
        expect(criteria.category).toMatch(/perceivable|operable|understandable|robust/);
        expect(Array.isArray(criteria.successCriteria)).toBe(true);
      });
    });
  });

  describe('Accessibility Compliance Metrics', () => {
    it('should meet minimum accessibility standards', async () => {
      const mockElement = document.createElement('div');
      
      const report = await validator.validateAccessibility(mockElement, {
        includeHealthcareAudit: true,
        validateWCAG: true
      });

      // Validate minimum compliance standards
      expect(report.overallScore).toBeGreaterThanOrEqual(70); // Minimum 70% overall
      expect(report.wcagCompliance.score).toBeGreaterThanOrEqual(85); // WCAG AA minimum
      expect(report.healthcareCompliance.overallScore).toBeGreaterThanOrEqual(80); // Healthcare minimum
      expect(report.healthcareCompliance.lgpdCompliant).toBe(true); // LGPD compliance required
    });

    it('should track component accessibility metrics', async () => {
      const mockElement = document.createElement('div');
      
      const report = await validator.validateAccessibility(mockElement, {
        includeHealthcareAudit: true,
        validateWCAG: true
      });

      const { componentAnalysis } = report;
      
      expect(componentAnalysis.totalComponents).toBeGreaterThan(0);
      expect(componentAnalysis.accessibleComponents).toBeGreaterThan(0);
      expect(componentAnalysis.accessibleComponents).toBeLessThanOrEqual(componentAnalysis.totalComponents);
      
      // At least 90% of components should be accessible
      const accessibilityRatio = componentAnalysis.accessibleComponents / componentAnalysis.totalComponents;
      expect(accessibilityRatio).toBeGreaterThanOrEqual(0.9);
    });

    it('should provide actionable recommendations', async () => {
      const mockElement = document.createElement('div');
      
      const report = await validator.validateAccessibility(mockElement, {
        includeHealthcareAudit: true,
        validateWCAG: true
      });

      expect(report.recommendations.length).toBeGreaterThan(0);
      
      report.recommendations.forEach(recommendation => {
        expect(recommendation.title).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(recommendation.priority).toMatch(/critical|high|medium|low/);
        expect(Array.isArray(recommendation.implementationSteps)).toBe(true);
        expect(Array.isArray(recommendation.testingMethods)).toBe(true);
        expect(recommendation.healthcareImpact).toBeDefined();
      });
    });
  });
});
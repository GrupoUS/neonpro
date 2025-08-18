/**
 * Patient Form Component Tests
 *
 * Healthcare Quality: ≥9.9/10
 * LGPD Compliance + WCAG 2.1 AA+ + Multi-tenant Validation
 * Medical Form Accuracy + Error Handling
 */

import { healthcareTestHelpers } from '@test/healthcare-test-helpers';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { PatientForm } from '@/components/forms/PatientForm';
import { lgpdValidators } from '../../test-setup/lgpd-compliance-helpers';

// Mock implementations
const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

describe('PatientForm - Healthcare Component Testing', () => {
  const testClinicId = 'clinic_test_001';
  const testUser = healthcareTestHelpers.setupTestUser(
    'healthcare_professional',
    testClinicId
  );

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
    healthcareTestHelpers.mockHealthcareAuth(testUser);
  });

  describe('LGPD Compliance Validation', () => {
    it('should display LGPD consent checkbox and privacy notice', () => {
      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Check for LGPD consent elements
      const consentCheckbox = screen.getByRole('checkbox', {
        name: /consent.*data.*processing|consentimento.*tratamento.*dados/i,
      });
      expect(consentCheckbox).toBeInTheDocument();
      expect(consentCheckbox).toBeRequired();

      // Check for privacy notice link
      const privacyNotice = screen.getByRole('link', {
        name: /privacy.*policy|política.*privacidade/i,
      });
      expect(privacyNotice).toBeInTheDocument();
      expect(privacyNotice).toHaveAttribute(
        'href',
        expect.stringContaining('privacy')
      );
    });

    it('should require LGPD consent before form submission', async () => {
      const user = userEvent.setup();

      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill required fields without consent
      await user.type(screen.getByLabelText(/name|nome/i), 'Maria Silva');
      await user.type(screen.getByLabelText(/email/i), 'maria@test.com');
      await user.type(screen.getByLabelText(/phone|telefone/i), '11999999999');

      // Try to submit without consent
      const submitButton = screen.getByRole('button', {
        name: /submit|enviar/i,
      });
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(
          screen.getByText(/consent.*required|consentimento.*obrigatório/i)
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should create valid LGPD consent record on form submission', async () => {
      const user = userEvent.setup();

      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/name|nome/i), 'Maria Silva');
      await user.type(screen.getByLabelText(/email/i), 'maria@test.com');
      await user.type(screen.getByLabelText(/phone|telefone/i), '11999999999');
      await user.type(screen.getByLabelText(/cpf/i), '123.456.789-01');

      // Give LGPD consent
      const consentCheckbox = screen.getByRole('checkbox', {
        name: /consent.*data.*processing|consentimento.*tratamento.*dados/i,
      });
      await user.click(consentCheckbox);

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /submit|enviar/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Maria Silva',
            email: 'maria@test.com',
            phone: '11999999999',
            cpf: '123.456.789-01',
            lgpd_consent: expect.objectContaining({
              consent_given: true,
              purposes: expect.arrayContaining(['medical_treatment']),
              timestamp: expect.any(String),
            }),
          })
        );
      });

      // Validate LGPD consent structure
      const submittedData = mockOnSubmit.mock.calls[0][0];
      const validationResult = lgpdValidators.validateConsent(
        submittedData.lgpd_consent
      );
      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });
  });

  describe('Multi-tenant Data Isolation', () => {
    it('should enforce clinic isolation in form data', () => {
      const { container } = render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Check tenant isolation
      healthcareTestHelpers.testMultiTenantIsolation(container, testClinicId);

      // Form should have clinic context
      expect(container.querySelector('[data-clinic-id]')).toHaveAttribute(
        'data-clinic-id',
        testClinicId
      );
    });

    it('should include clinic_id in submitted patient data', async () => {
      const _user = userEvent.setup();

      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Complete form submission
      await healthcareTestHelpers.testPatientForm(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />,
        {
          name: 'Ana Costa',
          email: 'ana@test.com',
          phone: '11888888888',
        }
      );

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            clinic_id: testClinicId,
            tenant_id: testClinicId,
          })
        );
      });
    });
  });

  describe('Healthcare Accessibility (WCAG 2.1 AA+)', () => {
    it('should meet WCAG 2.1 AA accessibility standards', async () => {
      const { container } = render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Run accessibility tests
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have healthcare-specific accessibility features', async () => {
      const { container } = render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Test healthcare accessibility patterns
      await healthcareTestHelpers.testAccessibilityCompliance(container, {
        level: 'AA',
        anxietyReduction: true,
      });

      // Check for anxiety-reducing design
      expect(container).toHaveAnxietyReducingDesign();
    });

    it('should support keyboard navigation for medical forms', () => {
      const { container } = render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Test keyboard navigation
      expect(container).toBeKeyboardNavigable();

      // Check medical form accessibility
      expect(container).toHaveMedicalFormAccessibility();
    });

    it('should be screen reader friendly for healthcare data', () => {
      const { container } = render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Test screen reader support
      expect(container).toBeScreenReaderFriendly();

      // Check for medical data descriptions
      const medicalFields = container.querySelectorAll(
        '[aria-describedby*="medical"], [aria-describedby*="health"]'
      );
      expect(medicalFields.length).toBeGreaterThan(0);
    });
  });

  describe('Medical Data Validation', () => {
    it('should validate CPF format according to Brazilian standards', async () => {
      const user = userEvent.setup();

      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      const cpfInput = screen.getByLabelText(/cpf/i);

      // Test invalid CPF
      await user.type(cpfInput, '123.456.789-00');
      fireEvent.blur(cpfInput);

      await waitFor(() => {
        expect(
          screen.getByText(/cpf.*invalid|cpf.*inválido/i)
        ).toBeInTheDocument();
      });

      // Clear and test valid CPF
      await user.clear(cpfInput);
      await user.type(cpfInput, '123.456.789-09');
      fireEvent.blur(cpfInput);

      await waitFor(() => {
        expect(
          screen.queryByText(/cpf.*invalid|cpf.*inválido/i)
        ).not.toBeInTheDocument();
      });
    });

    it('should validate email format for patient communication', async () => {
      const user = userEvent.setup();

      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      const emailInput = screen.getByLabelText(/email/i);

      // Test invalid email
      await user.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(
          screen.getByText(/email.*invalid|email.*inválido/i)
        ).toBeInTheDocument();
      });
    });

    it('should validate Brazilian phone number format', async () => {
      const user = userEvent.setup();

      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      const phoneInput = screen.getByLabelText(/phone|telefone/i);

      // Test invalid phone
      await user.type(phoneInput, '123456');
      fireEvent.blur(phoneInput);

      await waitFor(() => {
        expect(
          screen.getByText(/phone.*invalid|telefone.*inválido/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle form submission errors gracefully', async () => {
      const _user = userEvent.setup();

      // Mock submission error
      mockOnSubmit.mockRejectedValueOnce(new Error('Server error'));

      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Complete form and submit
      await healthcareTestHelpers.testPatientForm(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />,
        {
          name: 'Test Patient',
          email: 'test@test.com',
          phone: '11999999999',
        }
      );

      // Should show error message with recovery options
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText(/error.*occurred|erro.*ocorreu/i)
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /try.*again|tentar.*novamente/i })
        ).toBeInTheDocument();
      });
    });

    it('should preserve form data on validation errors', async () => {
      const user = userEvent.setup();

      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill form with invalid data
      const nameInput = screen.getByLabelText(/name|nome/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(nameInput, 'Test Name');
      await user.type(emailInput, 'invalid-email');

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /submit|enviar/i,
      });
      await user.click(submitButton);

      // Form data should be preserved after validation error
      expect(nameInput).toHaveValue('Test Name');
      expect(emailInput).toHaveValue('invalid-email');
    });
  });

  describe('Performance and User Experience', () => {
    it('should render form within acceptable time limits', () => {
      const startTime = performance.now();

      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
    });

    it('should show loading states during form submission', async () => {
      const _user = userEvent.setup();

      // Mock slow submission
      mockOnSubmit.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Complete and submit form
      await healthcareTestHelpers.testPatientForm(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />,
        {
          name: 'Loading Test',
          email: 'loading@test.com',
          phone: '11999999999',
        }
      );

      // Should show loading indicator
      expect(screen.getByText(/saving|salvando/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /submit|enviar/i })
      ).toBeDisabled();
    });
  });

  describe('Integration Testing', () => {
    it('should integrate with healthcare context provider', () => {
      const testScenario = healthcareTestHelpers.createHealthcareTestScenario(
        'basic',
        {
          clinicId: testClinicId,
        }
      );

      render(
        <PatientForm
          clinicId={testClinicId}
          initialData={testScenario.patient}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      // Form should pre-populate with patient data
      expect(
        screen.getByDisplayValue(testScenario.patient.name)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(testScenario.patient.email)
      ).toBeInTheDocument();
    });

    it('should handle real-time validation updates', async () => {
      const user = userEvent.setup();

      render(
        <PatientForm
          clinicId={testClinicId}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
          realTimeValidation={true}
        />
      );

      const emailInput = screen.getByLabelText(/email/i);

      // Type invalid email
      await user.type(emailInput, 'invalid');

      // Should show real-time validation feedback
      await waitFor(
        () => {
          expect(
            screen.getByText(/email.*invalid|email.*inválido/i)
          ).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });
});

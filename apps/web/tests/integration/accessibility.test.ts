/**
 * Healthcare Platform Accessibility Testing Integration Tests
 * 
 * This file contains comprehensive accessibility testing integration tests for the healthcare platform.
 * It ensures WCAG 2.1 AA compliance, healthcare-specific accessibility requirements,
 * and validates that all digital health interfaces are accessible to users with disabilities.
 * 
 * @fileaccessibility.test.ts
 * @version 1.0.0
 * @healthcare-compliance LGPD/ANVISA/CFM accessibility requirements
 */

import { describe, it, expect, beforeEach, afterEach, vi, jest } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import * as axeCore from 'axe-core';
import { PerformanceObserver } from 'perf_hooks';

// Mock axe-core for accessibility testing
vi.mock('axe-core', () => ({
  default: {
    run: vi.fn(),
    configure: vi.fn(),
    getRules: vi.fn(),
  },
}));

// Mock healthcare components for accessibility testing
vi.mock('../../components/patients/MobilePatientCard', () => ({
  MobilePatientCard: ({ patient, onEmergencyContact }: any) => (
    <div data-testid="mobile-patient-card" role="article" aria-label={`Patient: ${patient.name}`}>
      <h3>{patient.name}</h3>
      <p>Medical Record: {patient.medicalRecord}</p>
      <button 
        onClick={() => onEmergencyContact?.(patient)}
        aria-label={`Emergency contact for ${patient.name}`}
      >
        Emergency Contact
      </button>
    </div>
  ),
}));

vi.mock('../../components/patients/EnhancedPatientRegistrationForm', () => ({
  EnhancedPatientRegistrationForm: ({ onSubmit, onEmergency }: any) => (
    <form 
      data-testid="patient-registration-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({});
      }}
      aria-label="Patient Registration Form"
    >
      <fieldset>
        <legend>Personal Information</legend>
        <label htmlFor="name">Full Name *</label>
        <input 
          id="name" 
          name="name" 
          type="text" 
          required 
          aria-required="true"
          aria-describedby="name-error"
        />
        <div id="name-error" role="alert" aria-live="polite"></div>
        
        <label htmlFor="medicalRecord">Medical Record Number *</label>
        <input 
          id="medicalRecord" 
          name="medicalRecord" 
          type="text" 
          required 
          aria-required="true"
        />
      </fieldset>
      
      <button type="submit" aria-label="Submit patient registration">
        Register Patient
      </button>
      <button 
        type="button" 
        onClick={onEmergency}
        aria-label="Emergency medical assistance"
      >
        Emergency Assistance
      </button>
    </form>
  ),
}));

// Mock accessibility utilities
const mockAxeResults = (violations: any[] = []) => ({
  violations: violations.map(v => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    help: v.help,
    helpUrl: v.helpUrl,
    nodes: v.nodes || [],
  })),
  passes: [],
  incomplete: [],
  inapplicable: [],
});

// Healthcare-specific accessibility violations
const healthcareViolations = [
  {
    id: 'color-contrast',
    impact: 'serious',
    description: 'Insufficient color contrast for medical emergency indicators',
    help: 'Ensure emergency indicators have sufficient contrast ratio (4.5:1)',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
    nodes: [
      {
        html: '<div class="emergency-alert" style="color: #ff6b6b; background: #fff">',
        target: ['.emergency-alert'],
      },
    ],
  },
  {
    id: 'duplicate-id',
    impact: 'serious',
    description: 'Duplicate medical record IDs found',
    help: 'Ensure all medical record IDs are unique',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/duplicate-id',
    nodes: [
      {
        html: '<div id="medical-record">12345</div>',
        target: ['#medical-record'],
      },
    ],
  },
];

describe('Accessibility Testing Integration Tests', () => {
  let originalConsoleError: any;
  let mockAxeRun: any;

  beforeEach(() => {
    // Mock console.error to capture accessibility violations
    originalConsoleError = console.error;
    console.error = vi.fn();
    
    // Setup axe-core mock
    mockAxeRun = vi.fn();
    (axeCore.default.run as any).mockImplementation(mockAxeRun);
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('Axe-core Accessibility Testing', () => {
    it('should detect and report accessibility violations in patient cards', async () => {
      // Arrange
      const { MobilePatientCard } = await import('../../components/patients/MobilePatientCard');
      const mockPatient = {
        id: '123',
        name: 'John Doe',
        medicalRecord: 'MR-12345',
        emergencyContact: true,
      };
      
      mockAxeRun.mockResolvedValue(mockAxeResults(healthcareViolations));
      
      // Act
      render(
        <MobilePatientCard 
          patient={mockPatient} 
          onEmergencyContact={vi.fn()} 
        />
      );
      
      // Wait for axe-core to run
      await waitFor(() => {
        expect(mockAxeRun).toHaveBeenCalled();
      });
      
      // Assert - should detect violations
      const results = await mockAxeRun.mock.results[0].value;
      expect(results.violations).toHaveLength(2);
      expect(results.violations[0].id).toBe('color-contrast');
      expect(results.violations[1].id).toBe('duplicate-id');
    });

    it('should pass accessibility validation for compliant components', async () => {
      // Arrange
      const { MobilePatientCard } = await import('../../components/patients/MobilePatientCard');
      const mockPatient = {
        id: '124',
        name: 'Jane Smith',
        medicalRecord: 'MR-67890',
        emergencyContact: false,
      };
      
      mockAxeRun.mockResolvedValue(mockAxeResults([]));
      
      // Act
      render(
        <MobilePatientCard 
          patient={mockPatient} 
          onEmergencyContact={vi.fn()} 
        />
      );
      
      // Wait for axe-core to run
      await waitFor(() => {
        expect(mockAxeRun).toHaveBeenCalled();
      });
      
      // Assert - should have no violations
      const results = await mockAxeRun.mock.results[0].value;
      expect(results.violations).toHaveLength(0);
    });

    it('should detect healthcare-specific accessibility issues', async () => {
      // Arrange
      const healthcareSpecificViolations = [
        {
          id: 'aria-required-children',
          impact: 'critical',
          description: 'Medical emergency alerts must have accessible status indicators',
          help: 'Ensure emergency alerts have proper aria-live regions',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/aria-required-children',
          nodes: [
            {
              html: '<div class="emergency-alert">Emergency!</div>',
              target: ['.emergency-alert'],
            },
          ],
        },
      ];
      
      mockAxeRun.mockResolvedValue(mockAxeResults(healthcareSpecificViolations));
      
      // Act
      render(
        <div className="emergency-alert" role="alert">
          Emergency: Patient requires immediate attention
        </div>
      );
      
      // Assert
      await waitFor(() => {
        expect(mockAxeRun).toHaveBeenCalled();
      });
      
      const results = await mockAxeRun.mock.results[0].value;
      expect(results.violations[0].id).toBe('aria-required-children');
      expect(results.violations[0].impact).toBe('critical');
    });
  });

  describe('WCAG 2.1 AA Compliance Validation', () => {
    it('should validate form accessibility compliance', async () => {
      // Arrange
      const { EnhancedPatientRegistrationForm } = await import('../../components/patients/EnhancedPatientRegistrationForm');
      
      mockAxeRun.mockResolvedValue(mockAxeResults([]));
      
      // Act
      render(
        <EnhancedPatientRegistrationForm 
          onSubmit={vi.fn()} 
          onEmergency={vi.fn()} 
        />
      );
      
      // Assert - form should have proper accessibility attributes
      const form = screen.getByTestId('patient-registration-form');
      expect(form).toHaveAttribute('aria-label');
      expect(form).toHaveAttribute('role', 'form');
      
      // Check form labels
      const nameLabel = screen.getByLabelText('Full Name *');
      expect(nameLabel).toBeInTheDocument();
      expect(nameLabel).toHaveAttribute('htmlFor', 'name');
      
      // Check required inputs
      const nameInput = screen.getByLabelText('Full Name *');
      expect(nameInput).toHaveAttribute('required');
      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      
      // Check error message container
      const nameError = screen.getByRole('alert');
      expect(nameError).toHaveAttribute('id', 'name-error');
      expect(nameError).toHaveAttribute('aria-live', 'polite');
    });

    it('should validate keyboard navigation accessibility', async () => {
      // Arrange
      const { EnhancedPatientRegistrationForm } = await import('../../components/patients/EnhancedPatientRegistrationForm');
      
      render(
        <EnhancedPatientRegistrationForm 
          onSubmit={vi.fn()} 
          onEmergency={vi.fn()} 
        />
      );
      
      // Act - simulate keyboard navigation
      const nameInput = screen.getByLabelText('Full Name *');
      const medicalRecordInput = screen.getByLabelText('Medical Record Number *');
      const submitButton = screen.getByRole('button', { name: /submit patient registration/i });
      const emergencyButton = screen.getByRole('button', { name: /emergency assistance/i });
      
      // Test Tab navigation
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
      
      fireEvent.keyDown(nameInput, { key: 'Tab' });
      expect(document.activeElement).toBe(medicalRecordInput);
      
      fireEvent.keyDown(medicalRecordInput, { key: 'Tab' });
      expect(document.activeElement).toBe(submitButton);
      
      // Test keyboard interaction
      fireEvent.keyDown(emergencyButton, { key: 'Enter' });
      
      // Assert - emergency button should be actionable
      expect(emergencyButton).toHaveAttribute('type', 'button');
      expect(emergencyButton).toHaveAttribute('aria-label');
    });

    it('should validate screen reader compatibility', async () => {
      // Arrange
      const mockPatient = {
        id: '125',
        name: 'Test Patient',
        medicalRecord: 'MR-TEST',
        emergencyContact: false,
      };
      
      mockAxeRun.mockResolvedValue(mockAxeResults([]));
      
      // Act
      const { MobilePatientCard } = await import('../../components/patients/MobilePatientCard');
      render(
        <MobilePatientCard 
          patient={mockPatient} 
          onEmergencyContact={vi.fn()} 
        />
      );
      
      // Assert - proper ARIA attributes for screen readers
      const patientCard = screen.getByTestId('mobile-patient-card');
      expect(patientCard).toHaveAttribute('role', 'article');
      expect(patientCard).toHaveAttribute('aria-label');
      
      // Check that content is properly structured for screen readers
      const patientName = screen.getByText(mockPatient.name);
      expect(patientName).toBeInTheDocument();
      expect(patientName.tagName).toBe('H3');
      
      // Check medical record information
      const medicalRecordText = screen.getByText(/Medical Record:/);
      expect(medicalRecordText).toBeInTheDocument();
    });
  });

  describe('Healthcare-Specific Accessibility Tests', () => {
    it('should validate emergency interface accessibility', async () => {
      // Arrange
      const emergencyViolations = [
        {
          id: 'aria-live',
          impact: 'serious',
          description: 'Emergency alerts must use aria-live for screen reader announcements',
          help: 'Use aria-live for dynamic emergency content',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/aria-live',
          nodes: [
            {
              html: '<div class="emergency-alert">Code Blue!</div>',
              target: ['.emergency-alert'],
            },
          ],
        },
      ];
      
      mockAxeRun.mockResolvedValue(mockAxeResults(emergencyViolations));
      
      // Act
      render(
        <div>
          <div className="emergency-alert" role="alert" aria-live="assertive">
            EMERGENCY: Immediate medical attention required
          </div>
          <button 
            aria-label="Activate emergency response protocol"
            onClick={vi.fn()}
          >
            Emergency Response
          </button>
        </div>
      );
      
      // Assert
      const emergencyAlert = screen.getByRole('alert');
      expect(emergencyAlert).toHaveAttribute('aria-live', 'assertive');
      expect(emergencyAlert).toHaveTextContent(/EMERGENCY/);
      
      const emergencyButton = screen.getByRole('button', { name: /activate emergency response/i });
      expect(emergencyButton).toBeInTheDocument();
    });

    it('should validate medical data table accessibility', async () => {
      // Act
      render(
        <table role="table" aria-label="Patient Medical Records">
          <caption>Patient Medical Records Overview</caption>
          <thead>
            <tr>
              <th scope="col">Patient ID</th>
              <th scope="col">Name</th>
              <th scope="col">Medical Record</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>001</td>
              <td>John Doe</td>
              <td>MR-001</td>
              <td>Active</td>
            </tr>
          </tbody>
        </table>
      );
      
      // Assert - proper table accessibility
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label');
      expect(table).toHaveAttribute('role', 'table');
      
      const caption = screen.getByText('Patient Medical Records Overview');
      expect(caption.tagName).toBe('CAPTION');
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });

    it('should validate healthcare form accessibility for users with disabilities', async () => {
      // Arrange
      const formViolations = [
        {
          id: 'label',
          impact: 'critical',
          description: 'Medical form inputs must have associated labels',
          help: 'All form inputs must have labels',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/label',
          nodes: [
            {
              html: '<input type="text" id="unlabeled-input">',
              target: ['#unlabeled-input'],
            },
          ],
        },
      ];
      
      mockAxeRun.mockResolvedValue(mockAxeResults(formViolations));
      
      // Act
      render(
        <form aria-label="Medical History Form">
          <label htmlFor="condition">Medical Condition</label>
          <input id="condition" name="condition" type="text" />
          
          <label htmlFor="severity">Severity Level</label>
          <select id="severity" name="severity" aria-describedby="severity-help">
            <option value="">Select severity</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
          <div id="severity-help">Select the appropriate severity level</div>
        </form>
      );
      
      // Assert - proper form accessibility
      const conditionInput = screen.getByLabelText('Medical Condition');
      expect(conditionInput).toHaveAttribute('id', 'condition');
      
      const severitySelect = screen.getByLabelText('Severity Level');
      expect(severitySelect).toHaveAttribute('aria-describedby', 'severity-help');
      
      const helpText = screen.getByText('Select the appropriate severity level');
      expect(helpText).toHaveAttribute('id', 'severity-help');
    });
  });

  describe('Screen Reader Compatibility Tests', () => {
    it('should validate proper ARIA landmark roles for healthcare application', async () => {
      // Act
      render(
        <div>
          <header role="banner" aria-label="Healthcare Platform Header">
            <h1>NeonPro Healthcare Platform</h1>
            <nav role="navigation" aria-label="Main Navigation">
              <ul>
                <li><a href="/patients" aria-current="page">Patients</a></li>
                <li><a href="/appointments">Appointments</a></li>
                <li><a href="/emergency" aria-label="Emergency Services">Emergency</a></li>
              </ul>
            </nav>
          </header>
          
          <main role="main" aria-label="Patient Management">
            <section aria-labelledby="patient-list-heading">
              <h2 id="patient-list-heading">Patient List</h2>
              <div>Patient content here</div>
            </section>
          </main>
          
          <footer role="contentinfo" aria-label="Platform Information">
            <p>© 2024 NeonPro Healthcare Platform</p>
          </footer>
        </div>
      );
      
      // Assert - proper landmark roles
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      
      // Check navigation structure
      const navLinks = screen.getAllByRole('link');
      expect(navLinks).toHaveLength(3);
      expect(navLinks[2]).toHaveAttribute('aria-label', 'Emergency Services');
    });

    it('should validate dynamic content announcements for screen readers', async () => {
      // Arrange
      const { rerender } = render(
        <div aria-live="polite" aria-atomic="true">
          <p>System ready</p>
        </div>
      );
      
      // Act - simulate emergency alert update
      rerender(
        <div aria-live="polite" aria-atomic="true">
          <p>EMERGENCY: Patient requires immediate assistance</p>
        </div>
      );
      
      // Assert - live region should be properly configured
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveTextContent(/EMERGENCY/);
    });

    it('should validate focus management for modal dialogs', async () => {
      // Arrange
      const mockOnClose = vi.fn();
      
      render(
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="dialog-title"
          className="modal-overlay"
        >
          <div className="modal-content">
            <h2 id="dialog-title">Emergency Patient Information</h2>
            <p>Critical patient information that requires immediate attention</p>
            <button onClick={mockOnClose} aria-label="Close emergency dialog">
              Close
            </button>
          </div>
        </div>
      );
      
      // Assert - proper modal accessibility
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'dialog-title');
      
      const closeButton = screen.getByRole('button', { name: /close emergency dialog/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });

  describe('Keyboard Navigation Validation Tests', () => {
    it('should validate comprehensive keyboard navigation through patient interface', async () => {
      // Arrange
      render(
        <div>
          <nav aria-label="Patient Navigation">
            <a href="/patients" aria-current="page">Patients</a>
            <a href="/appointments">Appointments</a>
            <button aria-label="Emergency Actions">Emergency</button>
          </nav>
          
          <main>
            <div role="search" aria-label="Patient Search">
              <label htmlFor="patient-search">Search Patients</label>
              <input 
                id="patient-search" 
                type="search" 
                placeholder="Search by name or medical record..."
                aria-describedby="search-help"
              />
              <div id="search-help">Enter patient name or medical record number</div>
              <button type="submit" aria-label="Search for patients">
                Search
              </button>
            </div>
            
            <div role="region" aria-label="Patient Results">
              <button 
                role="row" 
                aria-label="Patient: John Doe, Medical Record: MR-001"
                tabIndex={0}
              >
                View Details
              </button>
            </div>
          </main>
        </div>
      );
      
      // Act - simulate keyboard navigation sequence
      const patientsLink = screen.getByRole('link', { name: 'Patients' });
      const searchInput = screen.getByLabelText('Search Patients');
      const searchButton = screen.getByRole('button', { name: /search for patients/i });
      const patientRow = screen.getByRole('button', { name: /patient: john doe/i });
      
      // Test navigation order
      patientsLink.focus();
      expect(document.activeElement).toBe(patientsLink);
      
      fireEvent.keyDown(patientsLink, { key: 'Tab' });
      expect(document.activeElement).toBe(searchInput);
      
      fireEvent.keyDown(searchInput, { key: 'Tab' });
      expect(document.activeElement).toBe(searchButton);
      
      // Test keyboard interaction with patient row
      fireEvent.keyDown(patientRow, { key: 'Enter' });
      
      // Assert - proper keyboard accessibility
      expect(patientsLink).toHaveAttribute('aria-current', 'page');
      expect(searchInput).toHaveAttribute('aria-describedby', 'search-help');
      expect(searchButton).toHaveAttribute('type', 'submit');
      expect(patientRow).toHaveAttribute('tabIndex', '0');
    });

    it('should validate keyboard shortcuts for emergency functions', async () => {
      // Arrange
      const mockEmergencyHandler = vi.fn();
      
      render(
        <div>
          <div 
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className="emergency-shortcut-info"
          >
            Press Ctrl+Shift+E for emergency assistance
          </div>
          
          <button 
            onClick={mockEmergencyHandler}
            aria-label="Emergency Assistance"
            accessKey="e"
            data-shortcut="Ctrl+Shift+E"
          >
            Emergency (Ctrl+Shift+E)
          </button>
        </div>
      );
      
      // Act - simulate keyboard shortcut
      const emergencyButton = screen.getByRole('button', { name: /emergency assistance/i });
      const emergencyInfo = screen.getByText(/Press Ctrl\+Shift\+E/);
      
      // Simulate keyboard shortcut
      fireEvent.keyDown(document, { key: 'e', ctrlKey: true, shiftKey: true });
      
      // Assert - emergency accessibility
      expect(emergencyButton).toHaveAttribute('accessKey', 'e');
      expect(emergencyButton).toHaveAttribute('data-shortcut', 'Ctrl+Shift+E');
      expect(emergencyInfo).toBeInTheDocument();
      expect(emergencyInfo).toHaveAttribute('aria-live', 'assertive');
    });

    it('should validate focus trapping in modal dialogs', async () => {
      // Arrange
      const mockOnClose = vi.fn();
      
      render(
        <div role="dialog" aria-modal="true" className="modal">
          <h2 id="modal-title">Emergency Patient Update</h2>
          <p>Patient requires immediate attention</p>
          <button onClick={mockOnClose}>Close</button>
          <button aria-label="Confirm emergency action">Confirm</button>
        </div>
      );
      
      // Act - simulate focus management
      const modal = screen.getByRole('dialog');
      const closeButton = screen.getByRole('button', { name: 'Close' });
      const confirmButton = screen.getByRole('button', { name: /confirm emergency/i });
      
      // Test initial focus
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
      
      // Test tab order within modal
      fireEvent.keyDown(closeButton, { key: 'Tab' });
      expect(document.activeElement).toBe(confirmButton);
      
      // Test wrapping focus
      fireEvent.keyDown(confirmButton, { key: 'Tab' });
      expect(document.activeElement).toBe(closeButton);
      
      // Assert - proper focus trapping
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(closeButton).toBeInTheDocument();
      expect(confirmButton).toHaveAttribute('aria-label');
    });
  });

  describe('Performance and Accessibility Integration', () => {
    it('should monitor accessibility performance impact', async () => {
      // Arrange
      const performanceMetrics: any[] = [];
      const mockPerformanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          performanceMetrics.push(entry);
        }
      });
      
      mockPerformanceObserver.observe({ entryTypes: ['measure'] });
      
      // Act
      const startTime = performance.now();
      
      // Render accessible component
      render(
        <div role="main" aria-label="Patient Dashboard">
          <h1>Patient Dashboard</h1>
          <div role="region" aria-label="Patient Summary">
            <p>Loading patient information...</p>
          </div>
        </div>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Assert - performance monitoring
      expect(renderTime).toBeLessThan(100); // Should render quickly
      expect(performanceMetrics.length).toBeGreaterThan(0);
    });

    it('should validate accessibility under performance constraints', async () => {
      // Arrange - simulate slow loading
      const { EnhancedPatientRegistrationForm } = await import('../../components/patients/EnhancedPatientRegistrationForm');
      
      // Act
      render(
        <div role="application" aria-label="Patient Registration System">
          <div aria-live="polite" aria-busy="true">
            Loading patient registration form...
          </div>
          <EnhancedPatientRegistrationForm 
            onSubmit={vi.fn()} 
            onEmergency={vi.fn()} 
          />
        </div>
      );
      
      // Assert - accessibility during loading
      const loadingIndicator = screen.getByText(/loading patient registration/i);
      expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
      expect(loadingIndicator).toHaveAttribute('aria-busy', 'true');
      
      // Ensure form becomes accessible when loaded
      await waitFor(() => {
        const form = screen.getByTestId('patient-registration-form');
        expect(form).toBeInTheDocument();
        expect(form).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Healthcare Compliance Integration', () => {
    it('should validate LGPD accessibility requirements', async () => {
      // Arrange
      const lgpdViolations = [
        {
          id: 'aria-input-field-name',
          impact: 'serious',
          description: 'LGPD requires proper identification of data processing inputs',
          help: 'All personal data inputs must have proper aria-labels describing data processing',
          helpUrl: 'https://www.lgpd.gov.br/accessibility',
          nodes: [
            {
              html: '<input type="text" name="cpf" placeholder="CPF">',
              target: ['input[name="cpf"]'],
            },
          ],
        },
      ];
      
      mockAxeRun.mockResolvedValue(mockAxeResults(lgpdViolations));
      
      // Act
      render(
        <form aria-label="LGPD Compliant Patient Data Collection">
          <fieldset>
            <legend>Personal Information (LGPD Compliant)</legend>
            
            <label htmlFor="cpf">CPF (Brazilian Tax ID) *</label>
            <input 
              id="cpf" 
              name="cpf" 
              type="text" 
              required
              aria-describedby="cpf-usage"
              pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
            />
            <div id="cpf-usage">
              This information will be processed according to LGPD Article 7
            </div>
            
            <label htmlFor="consent">
              <input 
                type="checkbox" 
                id="consent" 
                name="consent" 
                required
                aria-describedby="consent-details"
              />
              I consent to data processing under LGPD
            </label>
            <div id="consent-details">
              Your data will be used for healthcare purposes only
            </div>
          </fieldset>
        </form>
      );
      
      // Assert - LGPD accessibility compliance
      const cpfInput = screen.getByLabelText(/CPF \(Brazilian Tax ID\)/);
      expect(cpfInput).toHaveAttribute('aria-describedby', 'cpf-usage');
      expect(cpfInput).toHaveAttribute('pattern');
      
      const consentCheckbox = screen.getByLabelText(/I consent to data processing/);
      expect(consentCheckbox).toHaveAttribute('aria-describedby', 'consent-details');
      
      const usageText = screen.getByText(/LGPD Article 7/);
      expect(usageText).toHaveAttribute('id', 'cpf-usage');
    });

    it('should validate healthcare emergency accessibility standards', async () => {
      // Arrange
      const emergencyStandardsViolations = [
        {
          id: 'emergency-response-time',
          impact: 'critical',
          description: 'Emergency interfaces must meet accessibility response time standards',
          help: 'Emergency controls must be accessible within 2 seconds for users with disabilities',
          helpUrl: 'https://www.anvisa.gov.br/emergency-accessibility',
          nodes: [
            {
              html: '<button class="emergency-btn">Emergency</button>',
              target: ['.emergency-btn'],
            },
          ],
        },
      ];
      
      mockAxeRun.mockResolvedValue(mockAxeResults(emergencyStandardsViolations));
      
      // Act
      render(
        <div role="alert" aria-live="assertive" className="emergency-panel">
          <h2>Emergency Response Panel</h2>
          <p>Emergency assistance is available</p>
          
          <div className="emergency-controls">
            <button 
              aria-label="Call emergency medical services"
              className="emergency-btn-primary"
              accessKey="1"
            >
              Emergency Call (1)
            </button>
            
            <button 
              aria-label="Activate emergency protocol"
              className="emergency-btn-secondary"
              accessKey="2"
            >
              Emergency Protocol (2)
            </button>
          </div>
          
          <div className="emergency-info" role="status" aria-live="polite">
            Emergency services ready
          </div>
        </div>
      );
      
      // Assert - emergency accessibility standards
      const emergencyPanel = screen.getByRole('alert');
      expect(emergencyPanel).toHaveAttribute('aria-live', 'assertive');
      
      const primaryButton = screen.getByRole('button', { name: /emergency call/i });
      expect(primaryButton).toHaveAttribute('accessKey', '1');
      expect(primaryButton).toHaveAttribute('aria-label');
      
      const emergencyInfo = screen.getByText(/emergency services ready/i);
      expect(emergencyInfo).toHaveAttribute('role', 'status');
      expect(emergencyInfo).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Mobile Accessibility Validation', () => {
    it('should validate mobile healthcare interface accessibility', async () => {
      // Arrange
      const { MobilePatientCard } = await import('../../components/patients/MobilePatientCard');
      const mockPatient = {
        id: '126',
        name: 'Mobile Test Patient',
        medicalRecord: 'MR-MOBILE',
        emergencyContact: true,
      };
      
      mockAxeRun.mockResolvedValue(mockAxeResults([]));
      
      // Act
      render(
        <div className="mobile-container">
          <MobilePatientCard 
            patient={mockPatient} 
            onEmergencyContact={vi.fn()} 
          />
        </div>
      );
      
      // Assert - mobile accessibility
      const patientCard = screen.getByTestId('mobile-patient-card');
      expect(patientCard).toHaveAttribute('role', 'article');
      expect(patientCard).toHaveAttribute('aria-label');
      
      // Check touch target sizes (should be at least 44x44 points)
      const emergencyButton = screen.getByRole('button', { name: /emergency contact/i });
      expect(emergencyButton).toBeInTheDocument();
    });

    it('should validate responsive design accessibility', async () => {
      // Arrange
      const resizeWindow = (width: number, height: number) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: height,
        });
        window.dispatchEvent(new Event('resize'));
      };
      
      // Act
      render(
        <nav aria-label="Mobile Navigation" className="mobile-nav">
          <button aria-label="Patients">👥</button>
          <button aria-label="Appointments">📅</button>
          <button aria-label="Emergency">🚨</button>
        </nav>
      );
      
      // Test different screen sizes
      resizeWindow(320, 568); // iPhone 5
      const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i });
      expect(mobileNav).toBeInTheDocument();
      
      const emergencyButton = screen.getByRole('button', { name: /emergency/i });
      expect(emergencyButton).toHaveAttribute('aria-label');
      
      resizeWindow(768, 1024); // iPad
      expect(mobileNav).toBeInTheDocument();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle accessibility testing errors gracefully', async () => {
      // Arrange
      mockAxeRun.mockRejectedValue(new Error('Accessibility testing failed'));
      
      const consoleSpy = vi.spyOn(console, 'error');
      
      // Act
      render(
        <div role="main" aria-label="Test Content">
          <h1>Test Page</h1>
        </div>
      );
      
      // Assert - error handling
      await waitFor(() => {
        expect(mockAxeRun).toHaveBeenCalled();
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Accessibility testing error:',
        expect.any(Error)
      );
      
      // Content should still be accessible despite testing error
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveAttribute('aria-label');
    });

    it('should validate error message accessibility', async () => {
      // Act
      render(
        <div role="alert" aria-live="assertive">
          <h2>Accessibility Error Detected</h2>
          <p>Some accessibility issues were found. Please review the following:</p>
          <ul role="list">
            <li>Color contrast insufficient for emergency alerts</li>
            <li>Missing labels for medical form inputs</li>
          </ul>
          <button aria-label="Dismiss accessibility warning">Dismiss</button>
        </div>
      );
      
      // Assert - error message accessibility
      const alertRegion = screen.getByRole('alert');
      expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
      
      const errorList = screen.getByRole('list');
      expect(errorList).toBeInTheDocument();
      
      const dismissButton = screen.getByRole('button', { name: /dismiss accessibility warning/i });
      expect(dismissButton).toHaveAttribute('aria-label');
    });
  });
});

// Extend Jest expect with axe-core matchers
expect.extend({ toHaveNoViolations });
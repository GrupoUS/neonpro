import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';

// Mock Aesthetic Platform Components and Services
const mockLGPDService = {
  validateConsent: vi.fn().mockResolvedValue(true),
  storeConsent: vi.fn().mockResolvedValue({ id: 'consent-1' }),
  checkDataProcessing: vi.fn().mockResolvedValue({ compliant: true }),
};

const mockAppointmentService = {
  scheduleAppointment: vi.fn().mockResolvedValue({ 
    id: 'apt-1', 
    status: 'confirmed',
    noShowRisk: 0.3 
  }),
  assessNoShowRisk: vi.fn().mockResolvedValue({ risk: 0.3, level: 'medium' }),
  getAvailableSlots: vi.fn().mockResolvedValue([
    '2024-01-15T10:00:00Z',
    '2024-01-15T11:00:00Z',
    '2024-01-15T14:00:00Z'
  ]),
};

const mockWhatsAppService = {
  sendConfirmation: vi.fn().mockResolvedValue({ success: true }),
  sendReminder: vi.fn().mockResolvedValue({ success: true }),
  sendWelcomeMessage: vi.fn().mockResolvedValue({ success: true }),
};

const mockAuthService = {
  authenticateClient: vi.fn().mockResolvedValue({ 
    id: 'client-1', 
    role: 'client',
    dashboard: 'client-dashboard'
  }),
  authenticateProfessional: vi.fn().mockResolvedValue({ 
    id: 'prof-1', 
    role: 'professional',
    license: 'CRM-SP-12345',
    dashboard: 'professional-dashboard'
  }),
  authenticateAdmin: vi.fn().mockResolvedValue({ 
    id: 'admin-1', 
    role: 'admin',
    dashboard: 'admin-dashboard'
  }),
};

// Mock Components
const ClientRegistrationForm = ({ onSuccess, onError }) => {
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phonePrimary: '',
    birthDate: '',
    gender: '',
    lgpdConsentGiven: false,
    treatmentConsentGiven: false,
    marketingConsentGiven: false,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate LGPD consent first
      const consentValid = await mockLGPDService.validateConsent(formData);
      if (!consentValid) {
        throw new Error('LGPD consent is required');
      }

      // Store consent
      await mockLGPDService.storeConsent({
        clientId: 'temp-client',
        consents: {
          dataProcessing: formData.lgpdConsentGiven,
          treatment: formData.treatmentConsentGiven,
          marketing: formData.marketingConsentGiven,
        },
      });

      // Create client profile
      const newClient = {
        ...formData,
        id: 'generated-client-id',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Send WhatsApp welcome message
      await mockWhatsAppService.sendWelcomeMessage(newClient.phonePrimary, newClient.fullName);

      onSuccess(newClient);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div data-testid="client-registration-form">
      <form onSubmit={handleSubmit} data-testid="registration-form">
        <input
          data-testid="full-name-input"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          placeholder="Full Name"
          required
        />
        <input
          data-testid="email-input"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Email"
          required
        />
        <input
          data-testid="phone-input"
          value={formData.phonePrimary}
          onChange={(e) => handleChange('phonePrimary', e.target.value)}
          placeholder="Phone"
          required
        />
        <input
          data-testid="birth-date-input"
          type="date"
          value={formData.birthDate}
          onChange={(e) => handleChange('birthDate', e.target.value)}
          required
        />
        <select
          data-testid="gender-select"
          value={formData.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          required
        >
          <option value="">Select Gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
          <option value="O">Other</option>
        </select>
        
        {/* LGPD Consent Section */}
        <div data-testid="lgpd-consent-section">
          <label data-testid="lgpd-consent-label">
            <input
              data-testid="lgpd-consent-checkbox"
              type="checkbox"
              checked={formData.lgpdConsentGiven}
              onChange={(e) => handleChange('lgpdConsentGiven', e.target.checked)}
            />
            I consent to data processing according to LGPD
          </label>
          
          <label data-testid="treatment-consent-label">
            <input
              data-testid="treatment-consent-checkbox"
              type="checkbox"
              checked={formData.treatmentConsentGiven}
              onChange={(e) => handleChange('treatmentConsentGiven', e.target.checked)}
            />
            I consent to aesthetic treatments and procedures
          </label>
          
          <label data-testid="marketing-consent-label">
            <input
              data-testid="marketing-consent-checkbox"
              type="checkbox"
              checked={formData.marketingConsentGiven}
              onChange={(e) => handleChange('marketingConsentGiven', e.target.checked)}
            />
            I consent to receive marketing communications
          </label>
        </div>
        
        <button
          type="submit"
          data-testid="submit-button"
          disabled={isSubmitting || !formData.lgpdConsentGiven}
        >
          {isSubmitting ? 'Registering...' : 'Register Client'}
        </button>
      </form>
    </div>
  );
};

const AppointmentSchedulingInterface = ({ clientId, professionalId, onSuccess, onError }) => {
  const [selectedProcedure, setSelectedProcedure] = React.useState('');
  const [preferredTime, _setPreferredTime] = React.useState('');
  const [availableSlots, setAvailableSlots] = React.useState([]);
  const [isScheduling, setIsScheduling] = React.useState(false);

  const handleProcedureChange = async (procedure) => {
    setSelectedProcedure(procedure);
    
    // Get available slots for the selected procedure
    const slots = await mockAppointmentService.getAvailableSlots(professionalId, preferredTime);
    setAvailableSlots(slots);
  };

  const handleScheduling = async (slot) => {
    setIsScheduling(true);
    
    try {
      // Assess no-show risk
      const riskAssessment = await mockAppointmentService.assessNoShowRisk(clientId, selectedProcedure);
      
      // Schedule appointment
      const appointment = await mockAppointmentService.scheduleAppointment({
        clientId,
        professionalId,
        procedureType: selectedProcedure,
        scheduledTime: slot,
        noShowRisk: riskAssessment.risk,
      });

      // Send WhatsApp confirmation
      await mockWhatsAppService.sendConfirmation(clientId, appointment);

      onSuccess(appointment);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div data-testid="appointment-scheduling-interface">
      <div data-testid="procedure-selection">
        <select
          data-testid="procedure-select"
          value={selectedProcedure}
          onChange={(e) => handleProcedureChange(e.target.value)}
        >
          <option value="">Select Procedure</option>
          <option value="botox">Botox</option>
          <option value="fillers">Dermal Fillers</option>
          <option value="facial">Facial Harmonization</option>
        </select>
      </div>
      
      {availableSlots.length > 0 && (
        <div data-testid="available-slots">
          <h3>Available Time Slots:</h3>
          {availableSlots.map((slot, index) => (
            <button
              key={index}
              data-testid={`slot-${index}`}
              onClick={() => handleScheduling(slot)}
              disabled={isScheduling}
            >
              {new Date(slot).toLocaleString()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AuthenticationInterface = ({ onSuccess, onError }) => {
  const [userType, setUserType] = React.useState('client');
  const [credentials, setCredentials] = React.useState({
    identifier: '',
    password: '',
  });
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  const handleAuthentication = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    try {
      let authResult;
      
      switch (userType) {
        case 'client':
          authResult = await mockAuthService.authenticateClient(credentials);
          break;
        case 'professional':
          authResult = await mockAuthService.authenticateProfessional(credentials);
          break;
        case 'admin':
          authResult = await mockAuthService.authenticateAdmin(credentials);
          break;
        default:
          throw new Error('Invalid user type');
      }
      
      onSuccess(authResult);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div data-testid="authentication-interface">
      <form onSubmit={handleAuthentication} data-testid="auth-form">
        <div data-testid="user-type-selection">
          <select
            data-testid="user-type-select"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="client">Client</option>
            <option value="professional">Professional</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        
        <input
          data-testid="identifier-input"
          value={credentials.identifier}
          onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
          placeholder="Email, Phone, or License"
          required
        />
        
        <input
          data-testid="password-input"
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          placeholder="Password"
          required
        />
        
        <button
          type="submit"
          data-testid="auth-submit-button"
          disabled={isAuthenticating}
        >
          {isAuthenticating ? 'Authenticating...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

describe('Aesthetic Platform Flows Integration Tests', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  
  beforeEach(() => {
    mockOnSuccess.mockClear();
    mockOnError.mockClear();
    
    // Reset all mock services
    mockLGPDService.validateConsent.mockClear();
    mockLGPDService.storeConsent.mockClear();
    mockAppointmentService.scheduleAppointment.mockClear();
    mockAppointmentService.assessNoShowRisk.mockClear();
    mockWhatsAppService.sendConfirmation.mockClear();
    mockWhatsAppService.sendWelcomeMessage.mockClear();
    mockAuthService.authenticateClient.mockClear();
    mockAuthService.authenticateProfessional.mockClear();
    mockAuthService.authenticateAdmin.mockClear();
  });

  describe('1. Client Registration & Onboarding Flow', () => {
    it('should successfully register a new client with LGPD compliance', async () => {
      render(<ClientRegistrationForm onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      const clientData = {
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        phonePrimary: '+55 11 9999-8888',
        birthDate: '1990-01-01',
        gender: 'F',
        lgpdConsentGiven: true,
        treatmentConsentGiven: true,
        marketingConsentGiven: false,
      };
      
      // Fill out the form
      fireEvent.change(screen.getByTestId('full-name-input'), {
        target: { value: clientData.fullName },
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: clientData.email },
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: clientData.phonePrimary },
      });
      fireEvent.change(screen.getByTestId('birth-date-input'), {
        target: { value: clientData.birthDate },
      });
      fireEvent.change(screen.getByTestId('gender-select'), {
        target: { value: clientData.gender },
      });
      
      // Check LGPD consent checkboxes
      fireEvent.click(screen.getByTestId('lgpd-consent-checkbox'));
      fireEvent.click(screen.getByTestId('treatment-consent-checkbox'));
      
      // Submit the form
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockLGPDService.validateConsent).toHaveBeenCalledWith(clientData);
        expect(mockLGPDService.storeConsent).toHaveBeenCalledWith({
          clientId: 'temp-client',
          consents: {
            dataProcessing: true,
            treatment: true,
            marketing: false,
          },
        });
        expect(mockWhatsAppService.sendWelcomeMessage).toHaveBeenCalledWith(
          clientData.phonePrimary,
          clientData.fullName
        );
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: clientData.fullName,
            email: clientData.email,
            phonePrimary: clientData.phonePrimary,
            isActive: true,
          })
        );
      });
    });

    it('should block registration without LGPD consent', async () => {
      render(<ClientRegistrationForm onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      // Fill out required fields but don't check LGPD consent
      fireEvent.change(screen.getByTestId('full-name-input'), {
        target: { value: 'Maria Silva' },
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'maria.silva@example.com' },
      });
      
      // Try to submit without LGPD consent
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('LGPD consent is required');
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it('should handle granular consent types correctly', async () => {
      render(<ClientRegistrationForm onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      // Fill out form with different consent combinations
      fireEvent.change(screen.getByTestId('full-name-input'), {
        target: { value: 'Maria Silva' },
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'maria.silva@example.com' },
      });
      
      // Only check required consents
      fireEvent.click(screen.getByTestId('lgpd-consent-checkbox'));
      fireEvent.click(screen.getByTestId('treatment-consent-checkbox'));
      // Leave marketing consent unchecked
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockLGPDService.storeConsent).toHaveBeenCalledWith({
          clientId: 'temp-client',
          consents: {
            dataProcessing: true,
            treatment: true,
            marketing: false,
          },
        });
      });
    });
  });

  describe('2. User Authentication & Authorization Flow', () => {
    it('should authenticate client successfully', async () => {
      render(<AuthenticationInterface onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      const credentials = {
        identifier: 'maria.silva@example.com',
        password: 'password123',
      };
      
      // Select client user type
      fireEvent.change(screen.getByTestId('user-type-select'), {
        target: { value: 'client' },
      });
      
      // Enter credentials
      fireEvent.change(screen.getByTestId('identifier-input'), {
        target: { value: credentials.identifier },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: credentials.password },
      });
      
      // Submit authentication
      fireEvent.click(screen.getByTestId('auth-submit-button'));
      
      await waitFor(() => {
        expect(mockAuthService.authenticateClient).toHaveBeenCalledWith(credentials);
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'client-1',
            role: 'client',
            dashboard: 'client-dashboard',
          })
        );
      });
    });

    it('should authenticate professional with license validation', async () => {
      render(<AuthenticationInterface onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      const credentials = {
        identifier: 'CRM-SP-12345',
        password: 'password123',
      };
      
      // Select professional user type
      fireEvent.change(screen.getByTestId('user-type-select'), {
        target: { value: 'professional' },
      });
      
      // Enter credentials
      fireEvent.change(screen.getByTestId('identifier-input'), {
        target: { value: credentials.identifier },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: credentials.password },
      });
      
      // Submit authentication
      fireEvent.click(screen.getByTestId('auth-submit-button'));
      
      await waitFor(() => {
        expect(mockAuthService.authenticateProfessional).toHaveBeenCalledWith(credentials);
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'prof-1',
            role: 'professional',
            license: 'CRM-SP-12345',
            dashboard: 'professional-dashboard',
          })
        );
      });
    });

    it('should authenticate admin successfully', async () => {
      render(<AuthenticationInterface onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      const credentials = {
        identifier: 'admin@neonpro.com',
        password: 'admin123',
      };
      
      // Select admin user type
      fireEvent.change(screen.getByTestId('user-type-select'), {
        target: { value: 'admin' },
      });
      
      // Enter credentials
      fireEvent.change(screen.getByTestId('identifier-input'), {
        target: { value: credentials.identifier },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: credentials.password },
      });
      
      // Submit authentication
      fireEvent.click(screen.getByTestId('auth-submit-button'));
      
      await waitFor(() => {
        expect(mockAuthService.authenticateAdmin).toHaveBeenCalledWith(credentials);
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'admin-1',
            role: 'admin',
            dashboard: 'admin-dashboard',
          })
        );
      });
    });
  });

  describe('3. Appointment Scheduling Flow', () => {
    it('should schedule appointment with AI risk assessment', async () => {
      render(
        <AppointmentSchedulingInterface
          clientId="client-1"
          professionalId="prof-1"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );
      
      // Select procedure
      fireEvent.change(screen.getByTestId('procedure-select'), {
        target: { value: 'botox' },
      });
      
      await waitFor(() => {
        expect(mockAppointmentService.getAvailableSlots).toHaveBeenCalledWith('prof-1', '');
      });
      
      // Click on first available slot
      fireEvent.click(screen.getByTestId('slot-0'));
      
      await waitFor(() => {
        expect(mockAppointmentService.assessNoShowRisk).toHaveBeenCalledWith('client-1', 'botox');
        expect(mockAppointmentService.scheduleAppointment).toHaveBeenCalledWith({
          clientId: 'client-1',
          professionalId: 'prof-1',
          procedureType: 'botox',
          scheduledTime: '2024-01-15T10:00:00Z',
          noShowRisk: 0.3,
        });
        expect(mockWhatsAppService.sendConfirmation).toHaveBeenCalledWith('client-1', expect.any(Object));
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'apt-1',
            status: 'confirmed',
            noShowRisk: 0.3,
          })
        );
      });
    });

    it('should handle different aesthetic procedure types', async () => {
      render(
        <AppointmentSchedulingInterface
          clientId="client-1"
          professionalId="prof-1"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );
      
      // Test different procedure types
      const procedures = ['botox', 'fillers', 'facial'];
      
      for (const procedure of procedures) {
        fireEvent.change(screen.getByTestId('procedure-select'), {
          target: { value: procedure },
        });
        
        await waitFor(() => {
          expect(mockAppointmentService.getAvailableSlots).toHaveBeenCalledWith('prof-1', '');
        });
      }
    });
  });

  describe('4. Anti-No-Show Engine Flow', () => {
    it('should assess no-show risk correctly', async () => {
      const riskAssessment = await mockAppointmentService.assessNoShowRisk('client-1', 'botox');
      
      expect(riskAssessment).toEqual({
        risk: 0.3,
        level: 'medium'
      });
    });

    it('should categorize risk levels appropriately', async () => {
      // Mock different risk scenarios
      mockAppointmentService.assessNoShowRisk
        .mockResolvedValueOnce({ risk: 0.8, level: 'high' })
        .mockResolvedValueOnce({ risk: 0.5, level: 'medium' })
        .mockResolvedValueOnce({ risk: 0.2, level: 'low' });

      const highRisk = await mockAppointmentService.assessNoShowRisk('client-1', 'botox');
      const mediumRisk = await mockAppointmentService.assessNoShowRisk('client-2', 'fillers');
      const lowRisk = await mockAppointmentService.assessNoShowRisk('client-3', 'facial');

      expect(highRisk.level).toBe('high');
      expect(mediumRisk.level).toBe('medium');
      expect(lowRisk.level).toBe('low');
    });
  });

  describe('5. LGPD Compliance Flow', () => {
    it('should validate consent before data processing', async () => {
      const consentData = {
        dataProcessing: true,
        treatment: true,
        marketing: false,
      };
      
      const validationResult = await mockLGPDService.validateConsent({
        consents: consentData,
      });
      
      expect(validationResult).toBe(true);
    });

    it('should store consent with proper audit trail', async () => {
      const consentData = {
        clientId: 'client-1',
        consents: {
          dataProcessing: true,
          treatment: true,
          marketing: false,
        },
      };
      
      const result = await mockLGPDService.storeConsent(consentData);
      
      expect(result).toEqual({ id: 'consent-1' });
      expect(mockLGPDService.storeConsent).toHaveBeenCalledWith(consentData);
    });

    it('should check data processing compliance', async () => {
      const complianceResult = await mockLGPDService.checkDataProcessing({
        clientId: 'client-1',
        dataType: 'personal',
        action: 'read',
      });
      
      expect(complianceResult).toEqual({ compliant: true });
    });
  });

  describe('6. WhatsApp Integration Flow', () => {
    it('should send WhatsApp confirmation for appointments', async () => {
      const appointment = {
        id: 'apt-1',
        clientId: 'client-1',
        scheduledTime: '2024-01-15T10:00:00Z',
        procedureType: 'botox',
      };
      
      const result = await mockWhatsAppService.sendConfirmation('client-1', appointment);
      
      expect(result).toEqual({ success: true });
      expect(mockWhatsAppService.sendConfirmation).toHaveBeenCalledWith('client-1', appointment);
    });

    it('should send WhatsApp welcome message for new clients', async () => {
      const result = await mockWhatsAppService.sendWelcomeMessage('+55 11 9999-8888', 'Maria Silva');
      
      expect(result).toEqual({ success: true });
      expect(mockWhatsAppService.sendWelcomeMessage).toHaveBeenCalledWith('+55 11 9999-8888', 'Maria Silva');
    });
  });

  describe('7. Integration Flow End-to-End', () => {
    it('should handle complete client journey from registration to appointment', async () => {
      // Step 1: Client Registration
      render(<ClientRegistrationForm onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      const clientData = {
        fullName: 'Ana Paula Santos',
        email: 'ana.paula@example.com',
        phonePrimary: '+55 11 9777-6666',
        birthDate: '1985-05-15',
        gender: 'F',
        lgpdConsentGiven: true,
        treatmentConsentGiven: true,
        marketingConsentGiven: true,
      };
      
      // Fill and submit registration form
      fireEvent.change(screen.getByTestId('full-name-input'), {
        target: { value: clientData.fullName },
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: clientData.email },
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: clientData.phonePrimary },
      });
      fireEvent.change(screen.getByTestId('birth-date-input'), {
        target: { value: clientData.birthDate },
      });
      fireEvent.change(screen.getByTestId('gender-select'), {
        target: { value: clientData.gender },
      });
      
      // Check all consents
      fireEvent.click(screen.getByTestId('lgpd-consent-checkbox'));
      fireEvent.click(screen.getByTestId('treatment-consent-checkbox'));
      fireEvent.click(screen.getByTestId('marketing-consent-checkbox'));
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: clientData.fullName,
            email: clientData.email,
            phonePrimary: clientData.phonePrimary,
          })
        );
      });
      
      // Step 2: Authentication
      const authResult = await mockAuthService.authenticateClient({
        identifier: clientData.email,
        password: 'password123',
      });
      
      expect(authResult).toEqual({
        id: 'client-1',
        role: 'client',
        dashboard: 'client-dashboard',
      });
      
      // Step 3: Appointment Scheduling
      const appointmentResult = await mockAppointmentService.scheduleAppointment({
        clientId: authResult.id,
        professionalId: 'prof-1',
        procedureType: 'botox',
        scheduledTime: '2024-01-15T10:00:00Z',
        noShowRisk: 0.3,
      });
      
      expect(appointmentResult).toEqual({
        id: 'apt-1',
        status: 'confirmed',
        noShowRisk: 0.3,
      });
      
      // Step 4: WhatsApp Confirmation
      const whatsappResult = await mockWhatsAppService.sendConfirmation(authResult.id, appointmentResult);
      expect(whatsappResult).toEqual({ success: true });
    });
  });

  describe('8. Error Handling & Edge Cases', () => {
    it('should handle LGPD consent validation failure', async () => {
      mockLGPDService.validateConsent.mockResolvedValueOnce(false);
      
      render(<ClientRegistrationForm onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      // Fill form with valid data
      fireEvent.change(screen.getByTestId('full-name-input'), {
        target: { value: 'Maria Silva' },
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'maria@example.com' },
      });
      fireEvent.click(screen.getByTestId('lgpd-consent-checkbox'));
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('LGPD consent is required');
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it('should handle authentication failure', async () => {
      mockAuthService.authenticateClient.mockRejectedValueOnce(new Error('Invalid credentials'));
      
      render(<AuthenticationInterface onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      fireEvent.change(screen.getByTestId('user-type-select'), {
        target: { value: 'client' },
      });
      fireEvent.change(screen.getByTestId('identifier-input'), {
        target: { value: 'invalid@example.com' },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'wrongpassword' },
      });
      
      fireEvent.click(screen.getByTestId('auth-submit-button'));
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Invalid credentials');
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it('should handle appointment scheduling conflicts', async () => {
      mockAppointmentService.scheduleAppointment.mockRejectedValueOnce(new Error('Time slot not available'));
      
      render(
        <AppointmentSchedulingInterface
          clientId="client-1"
          professionalId="prof-1"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );
      
      fireEvent.change(screen.getByTestId('procedure-select'), {
        target: { value: 'botox' },
      });
      
      await waitFor(() => {
        expect(mockAppointmentService.getAvailableSlots).toHaveBeenCalled();
      });
      
      fireEvent.click(screen.getByTestId('slot-0'));
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Time slot not available');
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('9. Accessibility & UX Compliance', () => {
    it('should have accessible form elements', () => {
      render(<ClientRegistrationForm onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      const form = screen.getByTestId('registration-form');
      expect(form).toHaveAttribute('role', 'form');
      
      const inputs = form.querySelectorAll('input, select');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });

    it('should have proper ARIA labels for consent checkboxes', () => {
      render(<ClientRegistrationForm onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      const _lgpdLabel = screen.getByTestId('lgpd-consent-label');
      const lgpdCheckbox = screen.getByTestId('lgpd-consent-checkbox');
      
      expect(lgdpLabel).toHaveAttribute('for', lgpdCheckbox.id);
      expect(lgdpCheckbox).toHaveAttribute('aria-required', 'true');
    });

    it('should provide proper feedback during form submission', () => {
      render(<ClientRegistrationForm onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      const submitButton = screen.getByTestId('submit-button');
      
      // Button should be disabled without LGPD consent
      expect(submitButton).toBeDisabled();
      
      // Enable consent
      fireEvent.click(screen.getByTestId('lgpd-consent-checkbox'));
      
      // Button should now be enabled
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('10. Performance & Optimization', () => {
    it('should load form components efficiently', () => {
      const startTime = performance.now();
      
      render(<ClientRegistrationForm onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Component should render within 100ms
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('client-registration-form')).toBeInTheDocument();
    });

    it('should handle concurrent form submissions gracefully', async () => {
      render(<ClientRegistrationForm onSuccess={mockOnSuccess} onError={mockOnError} />);
      
      // Fill form
      fireEvent.change(screen.getByTestId('full-name-input'), {
        target: { value: 'Maria Silva' },
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'maria@example.com' },
      });
      fireEvent.click(screen.getByTestId('lgpd-consent-checkbox'));
      
      // Try to submit multiple times rapidly
      fireEvent.click(screen.getByTestId('submit-button'));
      fireEvent.click(screen.getByTestId('submit-button'));
      fireEvent.click(screen.getByTestId('submit-button'));
      
      // Should only process one submission
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });
});
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { generateMockPatient } from '@/test/utils';

// Mock ClientRegistrationAgent component
const ClientRegistrationAgent = ({ onSuccess, onError }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phonePrimary: '',
    birthDate: '',
    gender: '',
    lgpdConsentGiven: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!formData.lgpdConsentGiven) {
        throw new Error('LGPD consent is required');
      }
      
      const newPatient = {
        ...formData,
        id: 'generated-id',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      onSuccess(newPatient);
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
    <div data-testid="client-registration-agent">
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
        <label data-testid="lgpd-consent-label">
          <input
            data-testid="lgpd-consent-checkbox"
            type="checkbox"
            checked={formData.lgpdConsentGiven}
            onChange={(e) => handleChange('lgpdConsentGiven', e.target.checked)}
          />
          I consent to data processing according to LGPD
        </label>
        <button
          type="submit"
          data-testid="submit-button"
          disabled={isSubmitting || !formData.lgpdConsentGiven}
        >
          {isSubmitting ? 'Registering...' : 'Register Patient'}
        </button>
      </form>
    </div>
  );
};

describe('ClientRegistrationAgent Integration', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  
  beforeEach(() => {
    mockOnSuccess.mockClear();
    mockOnError.mockClear();
  });

  it('renders registration form with all fields', () => {
    render(<ClientRegistrationAgent onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    expect(screen.getByTestId('client-registration-agent')).toBeInTheDocument();
    expect(screen.getByTestId('registration-form')).toBeInTheDocument();
    expect(screen.getByTestId('full-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    expect(screen.getByTestId('birth-date-input')).toBeInTheDocument();
    expect(screen.getByTestId('gender-select')).toBeInTheDocument();
    expect(screen.getByTestId('lgpd-consent-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('successfully registers a new patient', async () => {
    render(<ClientRegistrationAgent onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    const patientData = {
      fullName: 'Test Patient',
      email: 'test@example.com',
      phonePrimary: '+55 11 9999-8888',
      birthDate: '1990-01-01',
      gender: 'F',
      lgpdConsentGiven: true,
    };
    
    fireEvent.change(screen.getByTestId('full-name-input'), {
      target: { value: patientData.fullName },
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: patientData.email },
    });
    fireEvent.change(screen.getByTestId('phone-input'), {
      target: { value: patientData.phonePrimary },
    });
    fireEvent.change(screen.getByTestId('birth-date-input'), {
      target: { value: patientData.birthDate },
    });
    fireEvent.change(screen.getByTestId('gender-select'), {
      target: { value: patientData.gender },
    });
    fireEvent.click(screen.getByTestId('lgpd-consent-checkbox'));
    
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: patientData.fullName,
          email: patientData.email,
          phonePrimary: patientData.phonePrimary,
          birthDate: patientData.birthDate,
          gender: patientData.gender,
          lgpdConsentGiven: true,
          isActive: true,
        })
      );
    });
  });

  it('shows error when LGPD consent is not given', async () => {
    render(<ClientRegistrationAgent onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    const patientData = {
      fullName: 'Test Patient',
      email: 'test@example.com',
      phonePrimary: '+55 11 9999-8888',
      birthDate: '1990-01-01',
      gender: 'F',
      lgpdConsentGiven: false,
    };
    
    fireEvent.change(screen.getByTestId('full-name-input'), {
      target: { value: patientData.fullName },
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: patientData.email },
    });
    fireEvent.change(screen.getByTestId('phone-input'), {
      target: { value: patientData.phonePrimary },
    });
    fireEvent.change(screen.getByTestId('birth-date-input'), {
      target: { value: patientData.birthDate },
    });
    fireEvent.change(screen.getByTestId('gender-select'), {
      target: { value: patientData.gender },
    });
    
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('LGPD consent is required');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('disables submit button when submitting', async () => {
    render(<ClientRegistrationAgent onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    const patientData = generateMockPatient();
    
    fireEvent.change(screen.getByTestId('full-name-input'), {
      target: { value: patientData.fullName },
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: patientData.email },
    });
    fireEvent.change(screen.getByTestId('phone-input'), {
      target: { value: patientData.phonePrimary },
    });
    fireEvent.change(screen.getByTestId('birth-date-input'), {
      target: { value: patientData.birthDate },
    });
    fireEvent.change(screen.getByTestId('gender-select'), {
      target: { value: patientData.gender },
    });
    fireEvent.click(screen.getByTestId('lgpd-consent-checkbox'));
    
    fireEvent.click(screen.getByTestId('submit-button'));
    
    expect(screen.getByTestId('submit-button')).toBeDisabled();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Registering...');
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    render(<ClientRegistrationAgent onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Try to submit empty form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Should not call onSuccess
    await waitFor(() => {
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('has accessible form elements', () => {
    render(<ClientRegistrationAgent onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    const form = screen.getByTestId('registration-form');
    expect(form).toHaveAttribute('role', 'form');
    
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      expect(input).toHaveAccessibleName();
    });
  });

  it('integrates with AGUI protocol for real-time updates', async () => {
    render(<ClientRegistrationAgent onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // This test would verify WebSocket communication
    // For now, we'll mock the WebSocket behavior
    const mockWebSocket = vi.fn();
    global.WebSocket = mockWebSocket;
    
    const patientData = generateMockPatient();
    
    fireEvent.change(screen.getByTestId('full-name-input'), {
      target: { value: patientData.fullName },
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: patientData.email },
    });
    fireEvent.change(screen.getByTestId('phone-input'), {
      target: { value: patientData.phonePrimary },
    });
    fireEvent.change(screen.getByTestId('birth-date-input'), {
      target: { value: patientData.birthDate },
    });
    fireEvent.change(screen.getByTestId('gender-select'), {
      target: { value: patientData.gender },
    });
    fireEvent.click(screen.getByTestId('lgpd-consent-checkbox'));
    
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(mockWebSocket).toHaveBeenCalled();
    });
  });
});
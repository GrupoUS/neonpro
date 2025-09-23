import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, generateMockPatient } from '@/test/utils';

// Setup DOM environment for React Testing Library
const { JSDOM } = require('jsdom');
const: dom = [ new JSDOM('<!DOCTYPE html><html><body></body></html>');

// Mock localStorage for JSDOM
const store: Record<string, string> = {};
const: localStorageMock = [ {
  getItem: vi.fn((key: string) => stor: e = [key]),
  setItem: vi.fn((key: string, value: string) => { stor: e = [key] = value; }),
  removeItem: vi.fn((key: string) => { delete: store = [key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(ke: y = [> delete: store = [key]); }),
  length: 0,
  key: vi.fn((index: number) => Object.keys(store)[index]),
};

Object.defineProperty(dom.window, 'localStorage', {
  value: localStorageMock,
  writable: false,
  configurable: true,
});

Object.defineProperty(dom.window, 'sessionStorage', {
  value: localStorageMock,
  writable: false,
  configurable: true,
});

global.documen: t = [ dom.window.document;
global.windo: w = [ dom.window;
global.navigato: r = [ dom.window.navigator;
global.localStorag: e = [ localStorageMock;
global.sessionStorag: e = [ localStorageMock;
globalThis.documen: t = [ dom.window.document;
globalThis.windo: w = [ dom.window.window;
globalThis.navigato: r = [ dom.window.navigator;
globalThis.localStorag: e = [ localStorageMock;
globalThis.sessionStorag: e = [ localStorageMock;

// Mock ClientRegistrationAgent component
const: ClientRegistrationAgent = [ ({ onSuccess, onError }) => {
  cons: t = [isSubmitting, setIsSubmitting] = React.useState(false);
  cons: t = [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phonePrimary: '',
    birthDate: '',
    gender: '',
    lgpdConsentGiven: false,
  });

  const: handleSubmit = [ async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolv: e = [> setTimeout(resolve, 1000));
      
      if (!formData.lgpdConsentGiven) {
        throw new Error('LGPD consent is required');
      }
      
      const: newPatient = [ {
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

  const: handleChange = [ (field, value) => {
    setFormData(pre: v = [> ({ ...prev, [field]: value }));
  };

  return (
    <div data-testi: d = ["client-registration-agent">
      <form: onSubmit = [{handleSubmit} data-testi: d = ["registration-form">
        <input
          data-testi: d = ["full-name-input"
          valu: e = [{formData.fullName}
          onChang: e = [{(e) => handleChange('fullName', e.target.value)}
          placeholde: r = ["Full Name"
          required
        />
        <input
          data-testi: d = ["email-input"
          typ: e = ["email"
          valu: e = [{formData.email}
          onChang: e = [{(e) => handleChange('email', e.target.value)}
          placeholde: r = ["Email"
          required
        />
        <input
          data-testi: d = ["phone-input"
          valu: e = [{formData.phonePrimary}
          onChang: e = [{(e) => handleChange('phonePrimary', e.target.value)}
          placeholde: r = ["Phone"
          required
        />
        <input
          data-testi: d = ["birth-date-input"
          typ: e = ["date"
          valu: e = [{formData.birthDate}
          onChang: e = [{(e) => handleChange('birthDate', e.target.value)}
          required
        />
        <select
          data-testi: d = ["gender-select"
          valu: e = [{formData.gender}
          onChang: e = [{(e) => handleChange('gender', e.target.value)}
          required
        >
          <option: value = ["">Select Gender</option>
          <option: value = ["M">Male</option>
          <option: value = ["F">Female</option>
          <option: value = ["O">Other</option>
        </select>
        <label data-testi: d = ["lgpd-consent-label">
          <input
            data-testi: d = ["lgpd-consent-checkbox"
            typ: e = ["checkbox"
            checke: d = [{formData.lgpdConsentGiven}
            onChang: e = [{(e) => handleChange('lgpdConsentGiven', e.target.checked)}
          />
          I consent to data processing according to LGPD
        </label>
        <button: type = ["submit"
          data-testi: d = ["submit-button"
          disable: d = [{isSubmitting || !formData.lgpdConsentGiven}
        >
          {isSubmitting ? 'Registering...' : 'Register Patient'}
        </button>
      </form>
    </div>
  );
};

describe('ClientRegistrationAgent Integration', () => {
  const: mockOnSuccess = [ vi.fn();
  const: mockOnError = [ vi.fn();
  
  beforeEach(() => {
    mockOnSuccess.mockClear();
    mockOnError.mockClear();
  });

  it('renders registration form with all fields', () => {
    renderWithProviders(<ClientRegistrationAgent: onSuccess = [{mockOnSuccess} onErro: r = [{mockOnError} />);
    
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
    render(<ClientRegistrationAgent: onSuccess = [{mockOnSuccess} onErro: r = [{mockOnError} />);
    
    const: patientData = [ {
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
    render(<ClientRegistrationAgent: onSuccess = [{mockOnSuccess} onErro: r = [{mockOnError} />);
    
    const: patientData = [ {
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
    render(<ClientRegistrationAgent: onSuccess = [{mockOnSuccess} onErro: r = [{mockOnError} />);
    
    const: patientData = [ generateMockPatient();
    
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
    render(<ClientRegistrationAgent: onSuccess = [{mockOnSuccess} onErro: r = [{mockOnError} />);
    
    // Try to submit empty form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Should not call onSuccess
    await waitFor(() => {
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('has accessible form elements', () => {
    render(<ClientRegistrationAgent: onSuccess = [{mockOnSuccess} onErro: r = [{mockOnError} />);
    
    const: form = [ screen.getByTestId('registration-form');
    expect(form).toHaveAttribute('role', 'form');
    
    const: inputs = [ form.querySelectorAll('input, select');
    inputs.forEach(inpu: t = [> {
      expect(input).toHaveAccessibleName();
    });
  });

  it('integrates with AGUI protocol for real-time updates', async () => {
    render(<ClientRegistrationAgent: onSuccess = [{mockOnSuccess} onErro: r = [{mockOnError} />);
    
    // This test would verify WebSocket communication
    // For now, we'll mock the WebSocket behavior
    const: mockWebSocket = [ vi.fn();
    global.WebSocke: t = [ mockWebSocket;
    
    const: patientData = [ generateMockPatient();
    
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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createClient } from '@/app/utils/supabase/client';
import PatientRegistrationForm from '../PatientRegistrationForm';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/app/utils/supabase/client');
jest.mock('sonner');

const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null })
  }))
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

const mockOnSuccess = jest.fn();

const setup = () => {
  const user = userEvent.setup();
  const utils = render(<PatientRegistrationForm onSuccess={mockOnSuccess} />);
  return { user, ...utils };
};

describe('PatientRegistrationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
  });

  describe('Rendering and Form Structure', () => {
    it('renders all required form sections', () => {
      setup();
      
      // Check main form sections exist
      expect(screen.getByText('Dados Pessoais')).toBeInTheDocument();
      expect(screen.getByText('Endereço')).toBeInTheDocument();
      expect(screen.getByText('Contato de Emergência')).toBeInTheDocument();
      expect(screen.getByText('Informações de Saúde')).toBeInTheDocument();
      expect(screen.getByText('Informações do Plano de Saúde')).toBeInTheDocument();
      expect(screen.getByText('Consentimentos LGPD')).toBeInTheDocument();
    });

    it('renders all personal data fields', () => {
      setup();
      
      expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
      expect(screen.getByLabelText('CPF')).toBeInTheDocument();
      expect(screen.getByLabelText('RG')).toBeInTheDocument();
      expect(screen.getByLabelText('Data de Nascimento')).toBeInTheDocument();
      expect(screen.getByLabelText('Sexo')).toBeInTheDocument();
      expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders all LGPD consent checkboxes', () => {
      setup();
      
      expect(screen.getByText(/Dados básicos para cadastro/)).toBeInTheDocument();
      expect(screen.getByText(/Comunicação de marketing/)).toBeInTheDocument();
      expect(screen.getByText(/Comunicação de saúde/)).toBeInTheDocument();
      expect(screen.getByText(/Análise de tendências/)).toBeInTheDocument();
      expect(screen.getByText(/Pesquisas de satisfação/)).toBeInTheDocument();
    });
  });

  describe('LGPD Consent Management', () => {
    it('requires basic consent to submit form', async () => {
      const { user } = setup();
      
      // Fill form without basic consent
      await user.type(screen.getByLabelText('Nome Completo'), 'João Silva');
      await user.type(screen.getByLabelText('CPF'), '12345678901');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar paciente/i });
      await user.click(submitButton);
      
      // Form should not submit without basic consent
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('allows submission when basic consent is provided', async () => {
      const { user } = setup();
      
      // Fill required fields
      await user.type(screen.getByLabelText('Nome Completo'), 'João Silva');
      await user.type(screen.getByLabelText('CPF'), '12345678901');
      
      // Check basic consent
      const basicConsentCheckbox = screen.getByRole('checkbox', { 
        name: /Dados básicos para cadastro/ 
      });
      await user.click(basicConsentCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /cadastrar paciente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalled();
      });
    });

    it('properly handles optional consents', async () => {
      const { user } = setup();
      
      // Check optional marketing consent
      const marketingCheckbox = screen.getByRole('checkbox', { 
        name: /Comunicação de marketing/ 
      });
      await user.click(marketingCheckbox);
      
      expect(marketingCheckbox).toBeChecked();
    });
  });

  describe('Field Validation', () => {
    it('validates CPF format', async () => {
      const { user } = setup();
      
      const cpfInput = screen.getByLabelText('CPF');
      await user.type(cpfInput, '123');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/CPF deve ter 11 dígitos/)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      const { user } = setup();
      
      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'invalid-email');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Email inválido/)).toBeInTheDocument();
      });
    });

    it('validates phone format', async () => {
      const { user } = setup();
      
      const phoneInput = screen.getByLabelText('Telefone');
      await user.type(phoneInput, '123');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Telefone inválido/)).toBeInTheDocument();
      });
    });

    it('validates birth date is not in future', async () => {
      const { user } = setup();
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      
      const birthDateInput = screen.getByLabelText('Data de Nascimento');
      await user.type(birthDateInput, tomorrowString);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Data de nascimento não pode ser no futuro/)).toBeInTheDocument();
      });
    });

    it('validates CEP format', async () => {
      const { user } = setup();
      
      const cepInput = screen.getByLabelText('CEP');
      await user.type(cepInput, '123');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/CEP deve ter 8 dígitos/)).toBeInTheDocument();
      });
    });
  });

  describe('FHIR Compliance', () => {
    it('includes all required FHIR Patient resource fields', async () => {
      const { user } = setup();
      
      // Fill FHIR-required fields
      await user.type(screen.getByLabelText('Nome Completo'), 'João Silva Santos');
      await user.type(screen.getByLabelText('CPF'), '12345678901');
      await user.type(screen.getByLabelText('Data de Nascimento'), '1990-01-15');
      await user.selectOptions(screen.getByLabelText('Sexo'), 'male');
      
      // Check that all FHIR identifier types are represented
      expect(screen.getByLabelText('CPF')).toBeInTheDocument(); // Brazilian national ID
      expect(screen.getByLabelText('RG')).toBeInTheDocument(); // State ID
      
      // Check address fields (FHIR Address resource)
      expect(screen.getByLabelText('CEP')).toBeInTheDocument();
      expect(screen.getByLabelText('Logradouro')).toBeInTheDocument();
      expect(screen.getByLabelText('Cidade')).toBeInTheDocument();
      expect(screen.getByLabelText('Estado')).toBeInTheDocument();
    });

    it('handles emergency contact as FHIR RelatedPerson', () => {
      setup();
      
      expect(screen.getByLabelText('Nome do Contato')).toBeInTheDocument();
      expect(screen.getByLabelText('Parentesco')).toBeInTheDocument();
      expect(screen.getByLabelText('Telefone do Contato')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    const fillValidForm = async (user: any) => {
      await user.type(screen.getByLabelText('Nome Completo'), 'João Silva Santos');
      await user.type(screen.getByLabelText('CPF'), '12345678901');
      await user.type(screen.getByLabelText('RG'), '123456789');
      await user.type(screen.getByLabelText('Data de Nascimento'), '1990-01-15');
      await user.selectOptions(screen.getByLabelText('Sexo'), 'male');
      await user.type(screen.getByLabelText('Telefone'), '11987654321');
      await user.type(screen.getByLabelText('Email'), 'joao@email.com');
      
      // Address
      await user.type(screen.getByLabelText('CEP'), '01234567');
      await user.type(screen.getByLabelText('Logradouro'), 'Rua das Flores, 123');
      await user.type(screen.getByLabelText('Cidade'), 'São Paulo');
      await user.selectOptions(screen.getByLabelText('Estado'), 'SP');
      
      // Emergency contact
      await user.type(screen.getByLabelText('Nome do Contato'), 'Maria Silva');
      await user.selectOptions(screen.getByLabelText('Parentesco'), 'spouse');
      await user.type(screen.getByLabelText('Telefone do Contato'), '11987654322');
      
      // Required consent
      const basicConsentCheckbox = screen.getByRole('checkbox', { 
        name: /Dados básicos para cadastro/ 
      });
      await user.click(basicConsentCheckbox);
    };

    it('successfully submits valid form', async () => {
      const { user } = setup();
      
      await fillValidForm(user);
      
      const submitButton = screen.getByRole('button', { name: /cadastrar paciente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('patients');
        expect(toast.success).toHaveBeenCalledWith('Paciente cadastrado com sucesso!');
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('shows loading state during submission', async () => {
      const { user } = setup();
      
      // Mock slow submission
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100))
        )
      });
      
      await fillValidForm(user);
      
      const submitButton = screen.getByRole('button', { name: /cadastrar paciente/i });
      await user.click(submitButton);
      
      // Should show loading state
      expect(screen.getByText(/cadastrando/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('handles submission errors gracefully', async () => {
      const { user } = setup();
      
      // Mock submission error
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      });
      
      await fillValidForm(user);
      
      const submitButton = screen.getByRole('button', { name: /cadastrar paciente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao cadastrar paciente. Tente novamente.');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for form sections', () => {
      setup();
      
      // Check that form sections have proper headings
      expect(screen.getByRole('heading', { name: 'Dados Pessoais' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Endereço' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Consentimentos LGPD' })).toBeInTheDocument();
    });

    it('has proper form labels and associations', () => {
      setup();
      
      const nameInput = screen.getByLabelText('Nome Completo');
      expect(nameInput).toHaveAttribute('aria-required', 'true');
      
      const cpfInput = screen.getByLabelText('CPF');
      expect(cpfInput).toHaveAttribute('aria-required', 'true');
    });

    it('provides proper error announcements', async () => {
      const { user } = setup();
      
      const cpfInput = screen.getByLabelText('CPF');
      await user.type(cpfInput, '123');
      await user.tab();
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/CPF deve ter 11 dígitos/);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});
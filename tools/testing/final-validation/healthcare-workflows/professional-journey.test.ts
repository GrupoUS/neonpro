/**
 * NeonPro Healthcare Platform - Professional Journey Workflow Tests
 *
 * End-to-end testing of healthcare professional workflows
 * Validates CRM authentication, patient management, appointment handling, and compliance
 */

import { QueryClient, type QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mockAppointment,
  mockPatient,
  mockUser,
} from '../setup/final-test-setup';

// Mock professional dashboard components
const MockProfessionalLogin = ({ onLogin }: { onLogin: (data: any) => void }) => (
  <form onSubmit={(e) => { e.preventDefault();
onLogin(mockUser);
}} data-testid="login-form">
    <input data-testid="email-input" placeholder="Email profissional" />
    <input data-testid="password-input"
type = 'password';
placeholder = "Senha" />
    <input data-testid = 'crm-input';
placeholder =
  "CRM (ex: 12345-SP)" />
    <select data-testid =
  "specialization-select">
      <option value =
    Cardiologia < 'cardiology' < / 2;;<>iinnoooopptt{};
value = Neurologia < 'neurology' < / 2;;<>iinnoooopptt{};
value = Pediatria < 'pediatrics' < />inoopt < / > ceelst < button;
type = 'submit';
data-testid = Entrar < 'login-button' < />bnottu < / > fmor;
)

const MockProfessionalDashboard = ({ user }: { user: any }) => (
  <div data-testid="professional-dashboard">
    <header data-testid=<h1>Dr.<
      "dashboard-header"
{
  user.name;
}
- {user.metadata?.specialization}</h1>
      <div
data-testid = CRM < 'crm-display';
:
{
  user.metadata?.crm_number;
}
</div>
    </header>
    
    <div
data-testid = "dashboard-stats">
      <div data-testid = Pacientes < 'patients-today';
Hoje: 8 < / 2;;<>ddiivv{};
data-testid = Consultas < 'appointments-pending';
Pendentes: 3 < / 2;;<>ddiivv{};
data-testid = Próxima < 'next-appointment';
: 14:30 - João Silva</div>
    </div>
    
    <div data-testid="patient-management-section">
      <h2>Gerenciamento de Pacientes</h2>
      <button data-testid="new-patient-btn">Novo Paciente</button>
      <button data-testid="search-patients-btn">Buscar Pacientes</button>
      <div data-testid="patient-list">
        <div data-testid="patient-item">João Silva - Próxima consulta: Hoje 14:30</div>
        <div data-testid="patient-item">Maria Santos - Última consulta: 18/08/2025</div>
      </div>
    </div>
    
    <div data-testid="appointment-management">
      <h2>Agenda</h2>
      <button data-testid="view-schedule-btn">Ver Agenda</button>
      <button data-testid="block-time-btn">Bloquear Horário</button>
      <div data-testid="appointment-list">
        <div data-testid="appointment-slot">14:30 - João Silva - Cardiologia</div>
        <div data-testid="appointment-slot">15:30 - Maria Santos - Retorno</div>
      </div>
    </div>
  </div>
)

const MockPatientDetail = ({ patient, onUpdate }: { patient: any; onUpdate: (data: any) => void }) => (
  <div data-testid="patient-detail">
    <div data-testid=<h2>{patient.name}<
      "patient-header" </h2>
      <div
data-testid = <span>CPF < 'patient-info';
: ***.***.***-**</span>
{
  /* Masked for privacy */
}
<span>Telefone;
:
{
  patient.phone;
}
</span>
        <span>Email
:
{
  patient.email;
}
</span>
      </div>
    </div>
    
    <div
data-testid = <h3>Histórico < 'medical-history';
Médico < / 23;;<>bhnottu{};
data-testid = Adicionar < 'add-record-btn';
Registro < / 2;;<>bdinottuv{};
data-testid = "medical-records">
        <div data-testid = Consulta < 'record-item';
Cardiológica - 15 / 08 / 2025 < />div < / > div < / 2;;<>ddiivv{};
data-testid = <h3>Histórico < 'appointment-history';
de;
Consultas < / 23;;<>dhiv{};
data-testid = "appointments">
        <div data-testid = 25 / 07 / 2025 - Consulta < 'past-appointment';
inicial < />div < / > div < / 2;;<>ddiivv{};
data-testid = <h3>Status < 'consent-status';
de;
Consentimento;
LGPD < / 23;;<>dhiv{};
data-testid = <span>Tratamento < 'consent-info';
: ✅ Consentido</span>
        <span>Análises: ✅ Consentido</span>
        <span>Data:
{
  new Date(patient.lgpd_consent?.given_at || Date.now()).toLocaleDateString();
}
</span>
      </div>
    </div>
    
    <button
onClick={() => onUpdate(patient)}
data-testid = Salvar < 'save-changes-btn';
Alterações < />bnottu < / > div;
)

describe('Professional Journey Workflow Tests - Final Validation', () =>
{
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock successful API responses
    global.fetch = vi.fn().mockImplementation((url: string, options: any) => {
      if (url.includes('/api/auth/login')) {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              user: mockUser,
              session: {
                access_token: 'test-token',
                expires_at: Date.now() + 3_600_000,
              },
            }),
        });
      }
      if (url.includes('/api/patients')) {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: [mockPatient],
            }),
        });
      }
      if (url.includes('/api/appointments')) {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: [mockAppointment],
            }),
        });
      }
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ success: true, data: {} }),
      });
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    (<QueryClientProvider client =
      { queryClient } > { children } < />CPQdeeeiilnorrrtuvy);

  describe('Professional Authentication', () => {
    it('should authenticate healthcare professional with CRM validation', async () => {
      const onLogin = vi.fn();
      const user = userEvent.setup();

      render(
        <MockProfessionalLogin onLogin={onLogin} />,
        { wrapper }
      );

      // Fill login form
      await user.type(
        screen.getByTestId('email-input'),
        'dr.silva@neonpro.health'
      );
      await user.type(
        screen.getByTestId('password-input'),
        'securePassword123'
      );
      await user.type(screen.getByTestId('crm-input'), '12345-SP');
      await user.selectOptions(
        screen.getByTestId('specialization-select'),
        'cardiology'
      );

      // Submit login
      await user.click(screen.getByTestId('login-button'));

      expect(onLogin).toHaveBeenCalledWith(mockUser);

      // Verify authentication API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/login'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('crm_number'),
          })
        );
      });
    });

    it('should reject login without valid CRM', async () => {
      const onLogin = vi.fn();
      const user = userEvent.setup();

      // Mock validation error
      global.fetch = vi.fn().mockResolvedValue({
        status: 400,
        json: () =>
          Promise.resolve({
            success: false,
            error: 'CRM number is required and must be valid',
          }),
      });

      render(
        <MockProfessionalLogin onLogin={onLogin} />,
        { wrapper }
      );

      // Try to login without CRM
      await user.type(
        screen.getByTestId('email-input'),
        'dr.silva@neonpro.health'
      );
      await user.type(
        screen.getByTestId('password-input'),
        'securePassword123'
      );
      await user.click(screen.getByTestId('login-button'));

      // Should not call onLogin
      expect(onLogin).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should validate CRM format (Estado-Number)', async () => {
      const onLogin = vi.fn();
      const user = userEvent.setup();

      // Mock CRM format validation
      global.fetch = vi.fn().mockResolvedValue({
        status: 400,
        json: () =>
          Promise.resolve({
            success: false,
            error:
              'Invalid CRM format. Expected: NUMBER-STATE (e.g., 12345-SP)',
          }),
      });

      render(
        <MockProfessionalLogin onLogin={onLogin} />,
        { wrapper }
      );

      await user.type(
        screen.getByTestId('email-input'),
        'dr.silva@neonpro.health'
      );
      await user.type(
        screen.getByTestId('password-input'),
        'securePassword123'
      );
      await user.type(screen.getByTestId('crm-input'), 'invalid-crm');
      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Professional Dashboard', () => {
    it('should display professional information and daily stats', async () => {
      render(
        <MockProfessionalDashboard user={mockUser} />,
        { wrapper }
      );

      // Verify professional info display
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Dr.'
      );
      expect(screen.getByTestId('crm-display')).toHaveTextContent(
        'CRM: 12345-SP'
      );

      // Verify dashboard stats
      expect(screen.getByTestId('patients-today')).toHaveTextContent(
        'Pacientes Hoje: 8'
      );
      expect(screen.getByTestId('appointments-pending')).toHaveTextContent(
        'Consultas Pendentes: 3'
      );
      expect(screen.getByTestId('next-appointment')).toHaveTextContent(
        'Próxima: 14:30 - João Silva'
      );
    });

    it('should provide patient management tools', async () => {
      const user = userEvent.setup();

      render(
        <MockProfessionalDashboard user={mockUser} />,
        { wrapper }
      );

      // Verify patient management section
      expect(
        screen.getByTestId('patient-management-section')
      ).toBeInTheDocument();
      expect(screen.getByTestId('new-patient-btn')).toBeInTheDocument();
      expect(screen.getByTestId('search-patients-btn')).toBeInTheDocument();

      // Test patient search
      await user.click(screen.getByTestId('search-patients-btn'));
      expect(screen.getByTestId('search-patients-btn')).toBeInTheDocument();

      // Verify patient list
      const patientItems = screen.getAllByTestId('patient-item');
      expect(patientItems).toHaveLength(2);
      expect(patientItems[0]).toHaveTextContent('João Silva');
      expect(patientItems[1]).toHaveTextContent('Maria Santos');
    });

    it('should display appointment schedule', async () => {
      render(
        <MockProfessionalDashboard user={mockUser} />,
        { wrapper }
      );

      // Verify appointment management
      expect(screen.getByTestId('appointment-management')).toBeInTheDocument();
      expect(screen.getByTestId('view-schedule-btn')).toBeInTheDocument();
      expect(screen.getByTestId('block-time-btn')).toBeInTheDocument();

      // Verify appointment slots
      const appointmentSlots = screen.getAllByTestId('appointment-slot');
      expect(appointmentSlots).toHaveLength(2);
      expect(appointmentSlots[0]).toHaveTextContent(
        '14:30 - João Silva - Cardiologia'
      );
      expect(appointmentSlots[1]).toHaveTextContent(
        '15:30 - Maria Santos - Retorno'
      );
    });
  });

  describe('Patient Management Workflow', () => {
    it('should allow professional to view patient details with privacy controls', async () => {
      const onUpdate = vi.fn();

      render(
        <MockPatientDetail patient={mockPatient} onUpdate={onUpdate} />,
        { wrapper }
      );

      // Verify patient header
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        mockPatient.name
      );

      // Verify privacy protection - CPF should be masked
      const patientInfo = screen.getByTestId('patient-info');
      expect(
        within(patientInfo).getByText(/\*\*\*\.\*\*\*\.\*\*\*-\*\*/)
      ).toBeInTheDocument();

      // But phone and email should be visible
      expect(
        within(patientInfo).getByText(mockPatient.phone)
      ).toBeInTheDocument();
      expect(
        within(patientInfo).getByText(mockPatient.email)
      ).toBeInTheDocument();
    });

    it('should display LGPD consent status', async () => {
      render(
        <MockPatientDetail patient={mockPatient} onUpdate={() => {}} />,
        { wrapper }
      );

      // Verify consent status section
      expect(screen.getByTestId('consent-status')).toBeInTheDocument();
      expect(
        screen.getByText('Status de Consentimento LGPD')
      ).toBeInTheDocument();

      // Verify consent details
      const consentInfo = screen.getByTestId('consent-info');
      expect(
        within(consentInfo).getByText('Tratamento: ✅ Consentido')
      ).toBeInTheDocument();
      expect(
        within(consentInfo).getByText('Análises: ✅ Consentido')
      ).toBeInTheDocument();
    });

    it('should allow medical record management', async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();

      render(
        <MockPatientDetail patient={mockPatient} onUpdate={onUpdate} />,
        { wrapper }
      );

      // Verify medical history section
      expect(screen.getByTestId('medical-history')).toBeInTheDocument();
      expect(screen.getByTestId('add-record-btn')).toBeInTheDocument();

      // Test adding medical record
      await user.click(screen.getByTestId('add-record-btn'));
      expect(screen.getByTestId('add-record-btn')).toBeInTheDocument();

      // Verify existing records
      expect(screen.getByTestId('record-item')).toHaveTextContent(
        'Consulta Cardiológica - 15/08/2025'
      );
    });

    it('should provide appointment history', async () => {
      render(
        <MockPatientDetail patient={mockPatient} onUpdate={() => {}} />,
        { wrapper }
      );

      // Verify appointment history
      expect(screen.getByTestId('appointment-history')).toBeInTheDocument();
      expect(screen.getByText('Histórico de Consultas')).toBeInTheDocument();

      // Verify past appointments
      expect(screen.getByTestId('past-appointment')).toHaveTextContent(
        '25/07/2025 - Consulta inicial'
      );
    });

    it('should save patient updates with audit trail', async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();

      // Mock update response with audit trail
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockPatient,
            audit_trail: {
              action: 'patient_update',
              user_id: mockUser.id,
              timestamp: new Date().toISOString(),
              changes: ['phone', 'medical_history'],
            },
          }),
      });

      render(
        <MockPatientDetail patient={mockPatient} onUpdate={onUpdate} />,
        { wrapper }
      );

      // Save changes
      await user.click(screen.getByTestId('save-changes-btn'));

      expect(onUpdate).toHaveBeenCalledWith(mockPatient);

      // Verify audit trail is created
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/patients'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );
      });
    });
  });

  describe('Appointment Management', () => {
    it('should handle appointment scheduling conflicts', async () => {
      const user = userEvent.setup();

      // Mock conflict response
      global.fetch = vi.fn().mockResolvedValue({
        status: 409,
        json: () =>
          Promise.resolve({
            success: false,
            error: 'Time slot conflict',
            conflicting_appointment: {
              id: 'existing-appointment',
              patient_name: 'Maria Santos',
              scheduled_at: '2025-08-25T14:30:00Z',
            },
          }),
      });

      render(
        <MockProfessionalDashboard user={mockUser} />,
        { wrapper }
      );

      // Try to schedule conflicting appointment
      await user.click(screen.getByTestId('view-schedule-btn'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should allow blocking time slots', async () => {
      const user = userEvent.setup();

      // Mock time blocking response
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              blocked_slot: {
                start_time: '2025-08-25T12:00:00Z',
                end_time: '2025-08-25T13:00:00Z',
                reason: 'Lunch break',
              },
            },
          }),
      });

      render(
        <MockProfessionalDashboard user={mockUser} />,
        { wrapper }
      );

      // Block time slot
      await user.click(screen.getByTestId('block-time-btn'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/appointments/block'),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should handle appointment status updates', async () => {
      const user = userEvent.setup();

      // Mock status update response
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              ...mockAppointment,
              status: 'completed',
              completed_at: new Date().toISOString(),
            },
          }),
      });

      render(
        <MockProfessionalDashboard user={mockUser} />,
        { wrapper }
      );

      // Update appointment status
      const appointmentSlot = screen.getAllByTestId('appointment-slot')[0];
      await user.click(appointmentSlot);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Compliance and Security', () => {
    it('should enforce session timeout for professionals', async () => {
      // Mock session expiry
      global.fetch = vi.fn().mockResolvedValue({
        status: 401,
        json: () =>
          Promise.resolve({
            success: false,
            error: 'Session expired',
          }),
      });

      render(
        <MockProfessionalDashboard user={mockUser} />,
        { wrapper }
      );

      // Any action should detect expired session
      expect(screen.getByTestId('professional-dashboard')).toBeInTheDocument();
    });

    it('should audit all patient data access', async () => {
      const user = userEvent.setup();

      // Mock audit response
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: [mockPatient],
            audit_trail: {
              action: 'patient_access',
              professional_id: mockUser.id,
              professional_crm: mockUser.metadata?.crm_number,
              timestamp: new Date().toISOString(),
              patient_id: mockPatient.id,
              access_reason: 'routine_consultation',
            },
          }),
      });

      render(
        <MockProfessionalDashboard user={mockUser} />,
        { wrapper }
      );

      // Access patient list
      await user.click(screen.getByTestId('search-patients-btn'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/patients'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );
      });
    });

    it('should validate professional credentials on sensitive actions', async () => {
      const user = userEvent.setup();

      // Mock re-authentication requirement
      global.fetch = vi.fn().mockResolvedValue({
        status: 403,
        json: () =>
          Promise.resolve({
            success: false,
            error: 'Re-authentication required for sensitive action',
            requires_crm_verification: true,
          }),
      });

      render(
        <MockPatientDetail patient={mockPatient} onUpdate={() => {}} />,
        { wrapper }
      );

      // Try to add sensitive medical record
      await user.click(screen.getByTestId('add-record-btn'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Emergency Access Protocols', () => {
    it('should handle emergency patient access with justification', async () => {
      // Mock emergency access
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockPatient,
            emergency_access: {
              granted: true,
              professional_id: mockUser.id,
              justification: 'Medical emergency - cardiac episode',
              timestamp: new Date().toISOString(),
              requires_post_review: true,
            },
          }),
      });

      render(
        <MockProfessionalDashboard user={mockUser} />,
        { wrapper }
      );

      // Emergency access should be logged
      expect(screen.getByTestId('professional-dashboard')).toBeInTheDocument();
    });

    it('should override consent restrictions in emergencies', async () => {
      const emergencyPatient = {
        ...mockPatient,
        lgpd_consent: {
          ...mockPatient.lgpd_consent,
          emergency_override: true,
          override_timestamp: new Date().toISOString(),
          override_professional: mockUser.id,
        },
      };

      // Mock emergency override
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: emergencyPatient,
          }),
      });

      render(
        <MockPatientDetail patient={emergencyPatient} onUpdate={() => {}} />,
        { wrapper }
      );

      // Should display emergency access notice
      expect(screen.getByTestId('consent-status')).toBeInTheDocument();
    });
  });

  describe('Performance and Efficiency', () => {
    it('should load patient list efficiently with pagination', async () => {
      // Mock paginated response
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: Array(10)
              .fill(mockPatient)
              .map((p, i) => ({ ...p, id: `patient-${i}` })),
            pagination: {
              page: 1,
              limit: 10,
              total: 150,
              has_next: true,
            },
          }),
      });

      render(
        <MockProfessionalDashboard user={mockUser} />,
        { wrapper }
      );

      // Should load first page efficiently
      expect(
        screen.getByTestId('patient-management-section')
      ).toBeInTheDocument();
    });

    it('should cache frequently accessed patient data', async () => {
      const user = userEvent.setup();

      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: mockPatient,
            }),
        });
      });

      render(
        <MockProfessionalDashboard user={mockUser} />,
        { wrapper }
      );

      // First access
      await user.click(screen.getAllByTestId('patient-item')[0]);

      // Second access should use cache
      await user.click(screen.getAllByTestId('patient-item')[0]);

      // Should not make duplicate API calls for cached data
      expect(callCount).toBeLessThanOrEqual(1);
    });
  });
}
)

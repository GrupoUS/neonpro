/**
 * Aesthetic Clinic Complete Workflow Integration Tests
 * 
 * Comprehensive end-to-end tests covering all aesthetic clinic features:
 * - Client registration and profile management
 * - Treatment catalog browsing and filtering
 * - Aesthetic session scheduling and management
 * - Photo assessment workflows with security
 * - Treatment planning and financial transactions
 * - Integration with patient management system
 * - WebSocket real-time communication
 * - Security and compliance validation
 * - Performance under realistic load conditions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';

// Import test infrastructure
import {
  TestDataManager,
  createTestQueryClient,
  createTestTrpcProvider,
  renderWithProviders,
  createMockUser,
  createMockProfessional,
  createMockProcedure,
  createMockTreatmentPackage,
  createMockAppointment,
  createMockPhotoAssessment,
  type MockUser,
  type MockProfessional,
  type MockProcedure,
  type MockTreatmentPackage,
  type MockAppointment,
  type MockPhotoAssessment
} from './aesthetic-clinic-complete-integration';

// Import components to test
import { TreatmentPackageScheduler } from '../../components/aesthetic-scheduling/TreatmentPackageScheduler';
import { ClientProfileManager } from '../../components/aesthetic-clinic/ClientProfileManager';
import { TreatmentCatalogBrowser } from '../../components/aesthetic-clinic/TreatmentCatalogBrowser';
import { PhotoAssessmentWorkflow } from '../../components/aesthetic-clinic/PhotoAssessmentWorkflow';
import { FinancialTransactionManager } from '../../components/aesthetic-clinic/FinancialTransactionManager';

// Mock MSW server for API responses
const server = setupServer(
  // Authentication endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: createMockUser('patient'),
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: createMockUser('patient'),
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'new-mock-jwt-token',
        refreshToken: 'new-mock-refresh-token'
      }
    });
  }),

  // Patient endpoints
  http.get('/api/patients/:id', ({ params }) => {
    const patient = createMockUser('patient');
    patient.id = params.id as string;
    return HttpResponse.json({
      success: true,
      data: patient
    });
  }),

  http.put('/api/patients/:id', async ({ request, params }) => {
    const updates = await request.json();
    const patient = createMockUser('patient');
    patient.id = params.id as string;
    Object.assign(patient, updates);
    return HttpResponse.json({
      success: true,
      data: patient
    });
  }),

  // Professional endpoints
  http.get('/api/professionals', () => {
    const professionals = [
      createMockProfessional('dermatologist'),
      createMockProfessional('plastic_surgeon'),
      createMockProfessional('aesthetic_nurse')
    ];
    return HttpResponse.json({
      success: true,
      data: professionals
    });
  }),

  http.get('/api/professionals/:id', ({ params }) => {
    const professional = createMockProfessional('dermatologist');
    professional.id = params.id as string;
    return HttpResponse.json({
      success: true,
      data: professional
    });
  }),

  // Procedure endpoints
  http.get('/api/procedures', () => {
    const procedures = [
      createMockProcedure('botox'),
      createMockProcedure('hyaluronic_acid'),
      createMockProcedure('chemical_peeling'),
      createMockProcedure('laser_hair_removal')
    ];
    return HttpResponse.json({
      success: true,
      data: procedures
    });
  }),

  http.get('/api/procedures/:id', ({ params }) => {
    const procedure = createMockProcedure('botox');
    procedure.id = params.id as string;
    return HttpResponse.json({
      success: true,
      data: procedure
    });
  }),

  // Treatment package endpoints
  http.get('/api/treatment-packages', () => {
    const packages = [
      createMockTreatmentPackage('botox_package'),
      createMockTreatmentPackage('facial_package'),
      createMockTreatmentPackage('anti_aging_package')
    ];
    return HttpResponse.json({
      success: true,
      data: packages
    });
  }),

  http.post('/api/treatment-packages', async ({ request }) => {
    const packageData = await request.json();
    const newPackage = createMockTreatmentPackage('custom_package');
    Object.assign(newPackage, packageData);
    return HttpResponse.json({
      success: true,
      data: newPackage
    });
  }),

  // Appointment endpoints
  http.get('/api/appointments', () => {
    const appointments = [
      createMockAppointment('consultation'),
      createMockAppointment('treatment'),
      createMockAppointment('follow_up')
    ];
    return HttpResponse.json({
      success: true,
      data: appointments
    });
  }),

  http.post('/api/appointments', async ({ request }) => {
    const appointmentData = await request.json();
    const newAppointment = createMockAppointment('treatment');
    Object.assign(newAppointment, appointmentData);
    return HttpResponse.json({
      success: true,
      data: newAppointment
    });
  }),

  http.put('/api/appointments/:id', async ({ request, params }) => {
    const updates = await request.json();
    const appointment = createMockAppointment('treatment');
    appointment.id = params.id as string;
    Object.assign(appointment, updates);
    return HttpResponse.json({
      success: true,
      data: appointment
    });
  }),

  // Photo assessment endpoints
  http.get('/api/photo-assessments/:id', ({ params }) => {
    const assessment = createMockPhotoAssessment('facial_analysis');
    assessment.id = params.id as string;
    return HttpResponse.json({
      success: true,
      data: assessment
    });
  }),

  http.post('/api/photo-assessments', async ({ request }) => {
    const assessmentData = await request.json();
    const newAssessment = createMockPhotoAssessment('facial_analysis');
    Object.assign(newAssessment, assessmentData);
    return HttpResponse.json({
      success: true,
      data: newAssessment
    });
  }),

  // LGPD compliance endpoints
  http.get('/api/compliance/lgpd/consent/:patientId', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'consent-123',
        patientId: 'patient-123',
        consentType: 'treatment',
        purpose: 'Aesthetic treatment procedures',
        dataCategories: ['health_data', 'visual_data'],
        retentionPeriod: '5_years',
        thirdPartyShares: [],
        withdrawalAllowed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }),

  http.post('/api/compliance/lgpd/consent', async ({ request }) => {
    const consentData = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        id: 'consent-' + Date.now(),
        ...consentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }),

  // WhatsApp integration endpoints
  http.post('/api/whatsapp/send', async ({ request }) => {
    const messageData = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        messageId: 'whatsapp-' + Date.now(),
        status: 'sent',
        to: messageData.to,
        timestamp: new Date().toISOString()
      }
    });
  }),

  // Financial transaction endpoints
  http.post('/api/transactions', async ({ request }) => {
    const transactionData = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        id: 'transaction-' + Date.now(),
        ...transactionData,
        status: 'completed',
        createdAt: new Date().toISOString()
      }
    });
  })
);

describe('Aesthetic Clinic Complete Integration Tests', () => {
  let testDataManager: TestDataManager;
  let queryClient: QueryClient;

  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    server.resetHandlers();
    testDataManager = new TestDataManager();
    queryClient = createTestQueryClient();
    await testDataManager.setupTestData();
  });

  afterEach(async () => {
    await testDataManager.cleanupTestData();
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('1. Client Registration and Profile Management Workflow', () => {
    it('should handle complete client registration with LGPD compliance', async () => {
      const TestComponent = () => (
        <ClientProfileManager 
          mode="registration"
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Fill in registration form
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Nome completo/i), {
          target: { value: 'Maria Silva Santos' }
        });
        fireEvent.change(screen.getByLabelText(/Email/i), {
          target: { value: 'maria.silva@email.com' }
        });
        fireEvent.change(screen.getByLabelText(/Telefone/i), {
          target: { value: '+5511999999999' }
        });
        fireEvent.change(screen.getByLabelText(/Data de nascimento/i), {
          target: { value: '1990-05-15' }
        });
        fireEvent.change(screen.getByLabelText(/CPF/i), {
          target: { value: '123.456.789-00' }
        });
      });

      // Accept LGPD consent
      await act(async () => {
        fireEvent.click(screen.getByLabelText(/Concordo com os termos/i));
        fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));
      });

      // Verify successful registration
      await waitFor(() => {
        expect(screen.getByText(/Cadastro realizado com sucesso/i)).toBeInTheDocument();
      });

      // Verify user data is stored
      await waitFor(() => {
        expect(screen.getByText('Maria Silva Santos')).toBeInTheDocument();
        expect(screen.getByText('maria.silva@email.com')).toBeInTheDocument();
      });
    });

    it('should handle client profile update with validation', async () => {
      const mockUser = createMockUser('patient');
      const TestComponent = () => (
        <ClientProfileManager 
          mode="edit"
          initialData={mockUser}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Update profile information
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Telefone/i), {
          target: { value: '+5511977777777' }
        });
        fireEvent.change(screen.getByLabelText(/Endereço/i), {
          target: { value: 'Rua das Flores, 123 - São Paulo/SP' }
        });
        fireEvent.click(screen.getByRole('button', { name: /Salvar alterações/i }));
      });

      // Verify successful update
      await waitFor(() => {
        expect(screen.getByText(/Perfil atualizado com sucesso/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields and show appropriate error messages', async () => {
      const TestComponent = () => (
        <ClientProfileManager 
          mode="registration"
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Attempt to submit without required fields
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));
      });

      // Verify error messages
      await waitFor(() => {
        expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/Email é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/Telefone é obrigatório/i)).toBeInTheDocument();
      });
    });
  });

  describe('2. Treatment Catalog Browsing and Filtering', () => {
    it('should display treatment catalog with proper categorization', async () => {
      const TestComponent = () => <TreatmentCatalogBrowser />;

      renderWithProviders(<TestComponent />);

      // Wait for treatments to load
      await waitFor(() => {
        expect(screen.getByText(/Catálogo de Tratamentos/i)).toBeInTheDocument();
      });

      // Verify treatments are displayed by category
      await waitFor(() => {
        expect(screen.getByText(/Toxina Botulínica/i)).toBeInTheDocument();
        expect(screen.getByText(/Ácido Hialurônico/i)).toBeInTheDocument();
        expect(screen.getByText(/Peeling Químico/i)).toBeInTheDocument();
        expect(screen.getByText(/Depilação a Laser/i)).toBeInTheDocument();
      });

      // Verify pricing and duration are shown
      expect(screen.getByText(/R\$ 1.200,00/i)).toBeInTheDocument();
      expect(screen.getByText(/30 minutos/i)).toBeInTheDocument();
    });

    it('should filter treatments by category', async () => {
      const TestComponent = () => <TreatmentCatalogBrowser />;

      renderWithProviders(<TestComponent />);

      // Wait for treatments to load
      await waitFor(() => {
        expect(screen.getByText(/Catálogo de Tratamentos/i)).toBeInTheDocument();
      });

      // Filter by facial treatments
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Tratamentos Faciais/i }));
      });

      // Verify only facial treatments are shown
      await waitFor(() => {
        expect(screen.getByText(/Toxina Botulínica/i)).toBeInTheDocument();
        expect(screen.getByText(/Ácido Hialurônico/i)).toBeInTheDocument();
        expect(screen.queryByText(/Depilação a Laser/i)).not.toBeInTheDocument();
      });
    });

    it('should filter treatments by price range', async () => {
      const TestComponent = () => <TreatmentCatalogBrowser />;

      renderWithProviders(<TestComponent />);

      // Wait for treatments to load
      await waitFor(() => {
        expect(screen.getByText(/Catálogo de Tratamentos/i)).toBeInTheDocument();
      });

      // Set price range filter
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Preço mínimo/i), {
          target: { value: '1000' }
        });
        fireEvent.change(screen.getByLabelText(/Preço máximo/i), {
          target: { value: '2000' }
        });
        fireEvent.click(screen.getByRole('button', { name: /Filtrar/i }));
      });

      // Verify filtered results
      await waitFor(() => {
        expect(screen.getByText(/Toxina Botulínica/i)).toBeInTheDocument();
        expect(screen.queryByText(/Tratamento Premium/i)).not.toBeInTheDocument();
      });
    });

    it('should search treatments by name', async () => {
      const TestComponent = () => <TreatmentCatalogBrowser />;

      renderWithProviders(<TestComponent />);

      // Wait for treatments to load
      await waitFor(() => {
        expect(screen.getByText(/Catálogo de Tratamentos/i)).toBeInTheDocument();
      });

      // Search for specific treatment
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText(/Buscar tratamentos.../i), {
          target: { value: 'botox' }
        });
      });

      // Verify search results
      await waitFor(() => {
        expect(screen.getByText(/Toxina Botulínica/i)).toBeInTheDocument();
        expect(screen.queryByText(/Ácido Hialurônico/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('3. Aesthetic Session Scheduling and Management', () => {
    it('should handle complete treatment package scheduling', async () => {
      const mockPackage = createMockTreatmentPackage('botox_package');
      const TestComponent = () => (
        <TreatmentPackageScheduler 
          treatmentPackage={mockPackage}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Pacote de Toxina Botulínica/i)).toBeInTheDocument();
      });

      // Select professional
      await act(async () => {
        fireEvent.click(screen.getByRole('combobox', { name: /Profissional/i }));
        fireEvent.click(screen.getByText(/Dr. João Silva/i));
      });

      // Select date and time
      await act(async () => {
        const dateInput = screen.getByLabelText(/Data da primeira sessão/i);
        fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
        
        const timeInput = screen.getByLabelText(/Horário/i);
        fireEvent.change(timeInput, { target: { value: '14:00' } });
      });

      // Confirm scheduling
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Agendamento/i }));
      });

      // Verify successful scheduling
      await waitFor(() => {
        expect(screen.getByText(/Agendamento realizado com sucesso/i)).toBeInTheDocument();
      });

      // Verify all sessions are scheduled
      await waitFor(() => {
        expect(screen.getByText(/3 sessões agendadas/i)).toBeInTheDocument();
        expect(screen.getByText(/Próxima sessão: 15/01/2024 às 14:00/i)).toBeInTheDocument();
      });
    });

    it('should handle appointment rescheduling', async () => {
      const mockAppointment = createMockAppointment('treatment');
      const TestComponent = () => (
        <TreatmentPackageScheduler 
          existingAppointment={mockAppointment}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Reagendamento de Sessão/i)).toBeInTheDocument();
      });

      // Select new date and time
      await act(async () => {
        const dateInput = screen.getByLabelText(/Nova data/i);
        fireEvent.change(dateInput, { target: { value: '2024-01-20' } });
        
        const timeInput = screen.getByLabelText(/Novo horário/i);
        fireEvent.change(timeInput, { target: { value: '16:00' } });
      });

      // Confirm rescheduling
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Reagendamento/i }));
      });

      // Verify successful rescheduling
      await waitFor(() => {
        expect(screen.getByText(/Sessão reagendada com sucesso/i)).toBeInTheDocument();
      });
    });

    it('should handle appointment cancellation with policy validation', async () => {
      const mockAppointment = createMockAppointment('treatment');
      const TestComponent = () => (
        <TreatmentPackageScheduler 
          existingAppointment={mockAppointment}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Cancelar Sessão/i)).toBeInTheDocument();
      });

      // Click cancel button
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Cancelar Sessão/i }));
      });

      // Confirm cancellation in modal
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Cancelamento/i }));
      });

      // Verify cancellation policy display
      await waitFor(() => {
        expect(screen.getByText(/Política de Cancelamento/i)).toBeInTheDocument();
      });

      // Confirm cancellation
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));
      });

      // Verify successful cancellation
      await waitFor(() => {
        expect(screen.getByText(/Sessão cancelada com sucesso/i)).toBeInTheDocument();
      });
    });
  });

  describe('4. Photo Assessment Workflow with Security', () => {
    it('should handle secure photo upload and assessment', async () => {
      const TestComponent = () => (
        <PhotoAssessmentWorkflow 
          patientId="patient-123"
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Avaliação Fotográfica/i)).toBeInTheDocument();
      });

      // Check LGPD consent for photo processing
      await act(async () => {
        fireEvent.click(screen.getByLabelText(/Autorizo o processamento de minhas imagens/i));
      });

      // Upload photo
      const file = new File(['dummy content'], 'test-photo.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/Selecione uma foto/i);
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      // Verify photo preview
      await waitFor(() => {
        expect(screen.getByAltText(/Preview da foto/i)).toBeInTheDocument();
      });

      // Start assessment
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Avaliação/i }));
      });

      // Verify assessment results
      await waitFor(() => {
        expect(screen.getByText(/Análise Facial Completa/i)).toBeInTheDocument();
        expect(screen.getByText(/Pontos de atenção identificados/i)).toBeInTheDocument();
      });
    });

    it('should validate photo requirements and security', async () => {
      const TestComponent = () => (
        <PhotoAssessmentWorkflow 
          patientId="patient-123"
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Try to upload invalid file type
      const invalidFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText(/Selecione uma foto/i);
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      });

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/Apenas arquivos de imagem são permitidos/i)).toBeInTheDocument();
      });

      // Try to upload oversized file
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large-photo.jpg', { type: 'image/jpeg' });
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [largeFile] } });
      });

      // Verify size error
      await waitFor(() => {
        expect(screen.getByText(/Arquivo muito grande. Tamanho máximo: 10MB/i)).toBeInTheDocument();
      });
    });

    it('should handle assessment history and comparison', async () => {
      const TestComponent = () => (
        <PhotoAssessmentWorkflow 
          patientId="patient-123"
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Avaliação Fotográfica/i)).toBeInTheDocument();
      });

      // Click on history tab
      await act(async () => {
        fireEvent.click(screen.getByRole('tab', { name: /Histórico de Avaliações/i }));
      });

      // Verify history is displayed
      await waitFor(() => {
        expect(screen.getByText(/Avaliações Anteriores/i)).toBeInTheDocument();
        expect(screen.getByText(/15/01/2024 - Avaliação Inicial/i)).toBeInTheDocument();
      });

      // Select assessment for comparison
      await act(async () => {
        fireEvent.click(screen.getByText(/Comparar com atual/i));
      });

      // Verify comparison view
      await waitFor(() => {
        expect(screen.getByText(/Comparação de Progresso/i)).toBeInTheDocument();
      });
    });
  });

  describe('5. Treatment Planning and Financial Transactions', () => {
    it('should handle complete treatment planning workflow', async () => {
      const mockPackage = createMockTreatmentPackage('anti_aging_package');
      const TestComponent = () => (
        <FinancialTransactionManager 
          treatmentPackage={mockPackage}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Plano de Tratamento Anti-Idade/i)).toBeInTheDocument();
      });

      // Review treatment plan
      expect(screen.getByText(/6 sessões/i)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 8.400,00/i)).toBeInTheDocument();
      expect(screen.getByText(/Economia de R\$ 1.200,00/i)).toBeInTheDocument();

      // Select payment method
      await act(async () => {
        fireEvent.click(screen.getByRole('radio', { name: /Cartão de Crédito/i }));
      });

      // Enter payment details
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Número do cartão/i), {
          target: { value: '4111111111111111' }
        });
        fireEvent.change(screen.getByLabelText(/Nome no cartão/i), {
          target: { value: 'Maria Silva' }
        });
        fireEvent.change(screen.getByLabelText(/Validade/i), {
          target: { value: '12/25' }
        });
        fireEvent.change(screen.getByLabelText(/CVV/i), {
          target: { value: '123' }
        });
      });

      // Select installments
      await act(async () => {
        fireEvent.click(screen.getByRole('combobox', { name: /Parcelas/i }));
        fireEvent.click(screen.getByText(/6x R\$ 1.400,00/i));
      });

      // Confirm payment
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Pagamento/i }));
      });

      // Verify successful transaction
      await waitFor(() => {
        expect(screen.getByText(/Pagamento realizado com sucesso/i)).toBeInTheDocument();
      });

      // Verify payment receipt
      await waitFor(() => {
        expect(screen.getByText(/Recibo de Pagamento/i)).toBeInTheDocument();
        expect(screen.getByText(/Transação: transaction-/i)).toBeInTheDocument();
      });
    });

    it('should handle payment installment options', async () => {
      const mockPackage = createMockTreatmentPackage('facial_package');
      const TestComponent = () => (
        <FinancialTransactionManager 
          treatmentPackage={mockPackage}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Pacote de Tratamento Facial/i)).toBeInTheDocument();
      });

      // Click on payment options
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Opções de Pagamento/i }));
      });

      // Verify installment options
      await waitFor(() => {
        expect(screen.getByText(/À vista: R\$ 3.600,00 \(5% de desconto\)/i)).toBeInTheDocument();
        expect(screen.getByText(/3x R\$ 1.200,00/i)).toBeInTheDocument();
        expect(screen.getByText(/6x R\$ 600,00/i)).toBeInTheDocument();
        expect(screen.getByText(/12x R\$ 300,00/i)).toBeInTheDocument();
      });

      // Select 6x option
      await act(async () => {
        fireEvent.click(screen.getByText(/6x R\$ 600,00/i));
      });

      // Verify installment details
      await waitFor(() => {
        expect(screen.getByText(/Total: R\$ 3.600,00/i)).toBeInTheDocument();
        expect(screen.getByText(/Primeira parcela: 15/01/2024/i)).toBeInTheDocument();
      });
    });

    it('should handle transaction history and refunds', async () => {
      const TestComponent = () => (
        <FinancialTransactionManager 
          patientId="patient-123"
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Histórico Financeiro/i)).toBeInTheDocument();
      });

      // Verify transaction history
      await waitFor(() => {
        expect(screen.getByText(/15/01/2024 - Pacote Anti-Idade/i)).toBeInTheDocument();
        expect(screen.getByText(/R\$ 8.400,00/i)).toBeInTheDocument();
        expect(screen.getByText(/Pago/i)).toBeInTheDocument();
      });

      // Request refund
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Solicitar Reembolso/i }));
      });

      // Fill refund reason
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Motivo do reembolso/i), {
          target: { value: 'Cancelamento por motivos pessoais' }
        });
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Solicitação/i }));
      });

      // Verify refund request
      await waitFor(() => {
        expect(screen.getByText(/Solicitação de reembolso enviada/i)).toBeInTheDocument();
      });
    });
  });

  describe('6. Integration with Patient Management System', () => {
    it('should synchronize patient data across systems', async () => {
      const mockUser = createMockUser('patient');
      const TestComponent = () => (
        <ClientProfileManager 
          mode="view"
          initialData={mockUser}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for patient data to load
      await waitFor(() => {
        expect(screen.getByText('Maria Silva Santos')).toBeInTheDocument();
      });

      // Verify data synchronization indicators
      await waitFor(() => {
        expect(screen.getByText(/Sincronizado com o sistema de pacientes/i)).toBeInTheDocument();
      });

      // Update patient information
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));
        fireEvent.change(screen.getByLabelText(/Telefone/i), {
          target: { value: '+5511977777777' }
        });
        fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
      });

      // Verify synchronization status
      await waitFor(() => {
        expect(screen.getByText(/Sincronizando alterações.../i)).toBeInTheDocument();
      });

      // Verify successful synchronization
      await waitFor(() => {
        expect(screen.getByText(/Dados sincronizados com sucesso/i)).toBeInTheDocument();
      });
    });

    it('should handle medical history integration', async () => {
      const TestComponent = () => (
        <ClientProfileManager 
          mode="view"
          initialData={createMockUser('patient')}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Navigate to medical history
      await act(async () => {
        fireEvent.click(screen.getByRole('tab', { name: /Histórico Médico/i }));
      });

      // Verify medical history integration
      await waitFor(() => {
        expect(screen.getByText(/Histórico de Tratamentos/i)).toBeInTheDocument();
        expect(screen.getByText(/Alergias e Restrições/i)).toBeInTheDocument();
        expect(screen.getByText(/Medicamentos em Uso/i)).toBeInTheDocument();
      });

      // Verify data from patient management system
      await waitFor(() => {
        expect(screen.getByText(/Nenhuma alergia conhecida/i)).toBeInTheDocument();
        expect(screen.getByText(/Nenhum medicamento registrado/i)).toBeInTheDocument();
      });
    });
  });

  describe('7. WebSocket Real-time Communication', () => {
    it('should handle real-time appointment updates', async () => {
      const TestComponent = () => (
        <TreatmentPackageScheduler 
          treatmentPackage={createMockTreatmentPackage('botox_package')}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Pacote de Toxina Botulínica/i)).toBeInTheDocument();
      });

      // Simulate real-time appointment update
      await act(async () => {
        // Mock WebSocket message
        const mockMessage = {
          type: 'appointment_update',
          data: {
            appointmentId: 'appointment-123',
            status: 'confirmed',
            professionalName: 'Dr. João Silva',
            date: '2024-01-15',
            time: '14:00'
          }
        };

        // Simulate WebSocket receiving message
        window.postMessage(mockMessage, '*');
      });

      // Verify real-time update
      await waitFor(() => {
        expect(screen.getByText(/Agendamento confirmado em tempo real/i)).toBeInTheDocument();
      });
    });

    it('should handle real-time WhatsApp notifications', async () => {
      const TestComponent = () => (
        <TreatmentPackageScheduler 
          treatmentPackage={createMockTreatmentPackage('botox_package')}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Pacote de Toxina Botulínica/i)).toBeInTheDocument();
      });

      // Simulate WhatsApp notification
      await act(async () => {
        const mockNotification = {
          type: 'whatsapp_notification',
          data: {
            to: '+5511999999999',
            message: 'Seu agendamento foi confirmado para 15/01/2024 às 14:00',
            status: 'sent'
          }
        };

        window.postMessage(mockNotification, '*');
      });

      // Verify notification display
      await waitFor(() => {
        expect(screen.getByText(/Notificação enviada via WhatsApp/i)).toBeInTheDocument();
      });
    });
  });

  describe('8. Security and Compliance Validation', () => {
    it('should validate LGPD compliance throughout workflows', async () => {
      const TestComponent = () => (
        <ClientProfileManager 
          mode="registration"
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Try to submit without LGPD consent
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Nome completo/i), {
          target: { value: 'Maria Silva Santos' }
        });
        fireEvent.change(screen.getByLabelText(/Email/i), {
          target: { value: 'maria.silva@email.com' }
        });
        fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));
      });

      // Verify LGPD consent is required
      await waitFor(() => {
        expect(screen.getByText(/Consentimento LGPD é obrigatório/i)).toBeInTheDocument();
      });

      // Accept consent and submit
      await act(async () => {
        fireEvent.click(screen.getByLabelText(/Concordo com os termos/i));
        fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));
      });

      // Verify successful registration with compliance
      await waitFor(() => {
        expect(screen.getByText(/Cadastro realizado com sucesso/i)).toBeInTheDocument();
        expect(screen.getByText(/Dados processados conforme LGPD/i)).toBeInTheDocument();
      });
    });

    it('should validate ANVISA compliance for aesthetic procedures', async () => {
      const TestComponent = () => (
        <TreatmentCatalogBrowser />
      );

      renderWithProviders(<TestComponent />);

      // Wait for treatments to load
      await waitFor(() => {
        expect(screen.getByText(/Catálogo de Tratamentos/i)).toBeInTheDocument();
      });

      // Verify ANVISA compliance information
      await waitFor(() => {
        expect(screen.getByText(/Procedimentos regulamentados pela ANVISA/i)).toBeInTheDocument();
      });

      // Click on treatment to see details
      await act(async () => {
        fireEvent.click(screen.getByText(/Toxina Botulínica/i));
      });

      // Verify ANVISA compliance details
      await waitFor(() => {
        expect(screen.getByText(/Registro ANVISA: 1234567890123/i)).toBeInTheDocument();
        expect(screen.getByText(/Produto liberado para uso estético/i)).toBeInTheDocument();
      });
    });

    it('should validate CFM professional certification', async () => {
      const TestComponent = () => (
        <TreatmentPackageScheduler 
          treatmentPackage={createMockTreatmentPackage('botox_package')}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Pacote de Toxina Botulínica/i)).toBeInTheDocument();
      });

      // View professional details
      await act(async () => {
        fireEvent.click(screen.getByText(/Ver profissionais disponíveis/i));
      });

      // Verify CFM certification
      await waitFor(() => {
        expect(screen.getByText(/CRM: 123456/i)).toBeInTheDocument();
        expect(screen.getByText(/Certificado pelo CFM/i)).toBeInTheDocument();
      });
    });
  });

  describe('9. Performance Under Load Conditions', () => {
    it('should handle multiple concurrent appointment requests', async () => {
      const TestComponent = () => (
        <TreatmentPackageScheduler 
          treatmentPackage={createMockTreatmentPackage('botox_package')}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Simulate multiple concurrent requests
      const concurrentRequests = [];
      for (let i = 0; i < 5; i++) {
        concurrentRequests.push(
          act(async () => {
            fireEvent.change(screen.getByLabelText(/Data da primeira sessão/i), {
              target: { value: `2024-01-${15 + i}` }
            });
          })
        );
      }

      await Promise.all(concurrentRequests);

      // Verify system handles load
      await waitFor(() => {
        expect(screen.getByText(/Sistema operando sob carga/i)).toBeInTheDocument();
      });
    });

    it('should handle large dataset browsing efficiently', async () => {
      const TestComponent = () => <TreatmentCatalogBrowser />;

      renderWithProviders(<TestComponent />);

      // Wait for treatments to load
      await waitFor(() => {
        expect(screen.getByText(/Catálogo de Tratamentos/i)).toBeInTheDocument();
      });

      // Verify performance with large dataset
      const startTime = performance.now();
      
      // Simulate scrolling and filtering
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText(/Buscar tratamentos.../i), {
          target: { value: 'a' }
        });
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Verify performance meets requirements
      expect(loadTime).toBeLessThan(1000); // Should be under 1 second
    });
  });

  describe('10. Error Handling and Edge Cases', () => {
    it('should handle network failures gracefully', async () => {
      // Simulate network failure
      server.use(
        http.get('/api/treatment-packages', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const TestComponent = () => <TreatmentCatalogBrowser />;

      renderWithProviders(<TestComponent />);

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/Erro ao carregar tratamentos/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Tentar Novamente/i })).toBeInTheDocument();
      });

      // Retry on user action
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Tentar Novamente/i }));
      });

      // Verify retry behavior
      await waitFor(() => {
        expect(screen.getByText(/Carregando tratamentos.../i)).toBeInTheDocument();
      });
    });

    it('should handle validation errors appropriately', async () => {
      const TestComponent = () => (
        <ClientProfileManager 
          mode="registration"
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Submit invalid data
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Email/i), {
          target: { value: 'invalid-email' }
        });
        fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));
      });

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
      });
    });

    it('should handle concurrent editing conflicts', async () => {
      const TestComponent = () => (
        <ClientProfileManager 
          mode="edit"
          initialData={createMockUser('patient')}
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      );

      renderWithProviders(<TestComponent />);

      // Simulate concurrent edit
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Telefone/i), {
          target: { value: '+5511977777777' }
        });
        
        // Simulate another user editing the same field
        const conflictMessage = {
          type: 'edit_conflict',
          data: {
            field: 'phone',
            currentValue: '+5511988888888',
            lastUpdated: new Date().toISOString()
          }
        };

        window.postMessage(conflictMessage, '*');
      });

      // Verify conflict handling
      await waitFor(() => {
        expect(screen.getByText(/Conflito de edição detectado/i)).toBeInTheDocument();
      });
    });
  });
});
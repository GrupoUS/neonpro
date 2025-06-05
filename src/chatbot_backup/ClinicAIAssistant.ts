
import { 
  clinicDataService, 
  patientService, 
  appointmentService, 
  medicalHistoryService, 
  clinicAnalyticsService,
  type PatientInsert,
  type AppointmentInsert,
  type MedicalDocumentInsert
} from './clinic-services';

// Tipos específicos para dados das ações
interface PatientData {
  id?: string;
  name?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

interface AppointmentData {
  id?: string;
  patient_id?: string;
  date?: string;
  time?: string;
  service?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  patients?: { name: string };
}

interface MedicalHistoryData {
  id?: string;
  patient_id?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

interface ClinicSummary {
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
}

interface ServiceAnalysis {
  service: string;
  count: number;
}

// Importar tipos de clinic-services
import type { Profile } from './clinic-services';

interface ClinicContext {
  profile: Profile | null;
  patients: PatientData[];
  appointments: AppointmentData[];
  medicalHistories: MedicalHistoryData[];
  summary: ClinicSummary;
}

interface IntentData {
  type: string;
  data?: Record<string, unknown>;
}

type ActionData = PatientData | AppointmentData | MedicalHistoryData | Record<string, unknown>;

// Tipos para as ações que o AI pode executar
export interface AIAction {
  type: 'create_patient' | 'update_patient' | 'delete_patient' | 
        'schedule_appointment' | 'update_appointment' | 'cancel_appointment' |
        'add_medical_history' | 'update_medical_history' | 'delete_medical_history' |
        'analyze_clinic_data' | 'get_clinic_insights' | 'list_patients' |
        'list_appointments' | 'list_medical_history';
  data: ActionData;
}

export interface AIResponse {
  message: string;
  actions?: AIAction[];
  data?: Record<string, unknown> | unknown[];
  suggestions?: string[];
}

// Classe principal do Assistente Clínico AI
export class ClinicAIAssistant {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Método principal para processar mensagens do usuário
  async processMessage(message: string): Promise<AIResponse> {
    try {
      // Obter contexto clínico completo do usuário
      const contextData = await clinicDataService.getUserClinicContext(this.userId);
      
      // Transformar dados para o formato esperado do ClinicContext
      const context: ClinicContext = {
        profile: contextData.profile,
        patients: contextData.patients || [],
        appointments: contextData.appointments || [],
        medicalHistories: contextData.medicalDocuments || [], // Mapear medicalDocuments para medicalHistories
        summary: contextData.summary
      };

      // Analisar a intenção da mensagem
      const intent = this.analyzeIntent(message);
      
      // Processar baseado na intenção
      switch (intent.type) {
        case 'add_patient':
          return await this.handleAddPatient(message, intent.data);
        case 'schedule_appointment':
          return await this.handleScheduleAppointment(message, intent.data);
        case 'view_medical_history':
          return await this.handleViewMedicalHistory(message, context);
        case 'list_patients':
          return await this.handleListPatients(message, context);
        case 'list_appointments':
          return await this.handleListAppointments(message, context);
        case 'analyze_clinic_data':
          return await this.handleAnalyzeClinicData(message, context);
        case 'get_clinic_insights':
          return await this.handleClinicInsights(context);
        default:
          return await this.handleGeneralQuery(message, context);
      }
    } catch (error) {
      console.error('Erro no processamento da mensagem:', error);
      return {
        message: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        suggestions: [
          'Analisar dados da clínica',
          'Adicionar um paciente',
          'Agendar uma consulta'
        ]
      };
    }
  }

  // Analisar a intenção da mensagem do usuário
  private analyzeIntent(message: string): IntentData {
    const lowerMessage = message.toLowerCase();

    // Padrões para adicionar paciente
    if (lowerMessage.includes('adicionar paciente') || lowerMessage.includes('novo paciente') || 
        lowerMessage.includes('cadastrar paciente')) {
      return { type: 'add_patient' };
    }

    // Padrões para agendar consulta
    if (lowerMessage.includes('agendar consulta') || lowerMessage.includes('marcar consulta') || 
        lowerMessage.includes('novo agendamento')) {
      return { type: 'schedule_appointment' };
    }

    // Padrões para ver histórico médico
    if (lowerMessage.includes('ver histórico') || lowerMessage.includes('histórico médico') || 
        lowerMessage.includes('prontuário')) {
      return { type: 'view_medical_history' };
    }

    // Padrões para listar pacientes
    if (lowerMessage.includes('listar pacientes') || lowerMessage.includes('ver pacientes') ||
        lowerMessage.includes('quais pacientes')) {
      return { type: 'list_patients' };
    }

    // Padrões para listar agendamentos
    if (lowerMessage.includes('listar agendamentos') || lowerMessage.includes('ver agendamentos') ||
        lowerMessage.includes('agendamentos de hoje')) {
      return { type: 'list_appointments' };
    }

    // Padrões para análise de dados da clínica
    if (lowerMessage.includes('analisar dados') || lowerMessage.includes('resumo da clínica') || 
        lowerMessage.includes('desempenho da clínica')) {
      return { type: 'analyze_clinic_data' };
    }

    // Padrões para insights da clínica
    if (lowerMessage.includes('insights') || lowerMessage.includes('dicas para clínica') || 
        lowerMessage.includes('melhorar clínica')) {
      return { type: 'get_clinic_insights' };
    }

    return { type: 'general_query' };
  }

  // --- Métodos de manipulação de intenções (placeholders) ---

  private async handleAddPatient(message: string, data?: Record<string, unknown>): Promise<AIResponse> {
    // Lógica para adicionar paciente
    return {
      message: 'Funcionalidade de adicionar paciente em desenvolvimento.',
      suggestions: ['Listar pacientes', 'Agendar consulta']
    };
  }

  private async handleScheduleAppointment(message: string, data?: Record<string, unknown>): Promise<AIResponse> {
    // Lógica para agendar consulta
    return {
      message: 'Funcionalidade de agendar consulta em desenvolvimento.',
      suggestions: ['Listar agendamentos', 'Adicionar paciente']
    };
  }

  private async handleViewMedicalHistory(message: string, context: ClinicContext): Promise<AIResponse> {
    // Lógica para ver histórico médico
    return {
      message: 'Funcionalidade de ver histórico médico em desenvolvimento.',
      suggestions: ['Listar pacientes', 'Analisar dados da clínica']
    };
  }

  private async handleListPatients(message: string, context: ClinicContext): Promise<AIResponse> {
    // Lógica para listar pacientes
    return {
      message: 'Funcionalidade de listar pacientes em desenvolvimento.',
      suggestions: ['Adicionar paciente', 'Agendar consulta']
    };
  }

  private async handleListAppointments(message: string, context: ClinicContext): Promise<AIResponse> {
    // Lógica para listar agendamentos
    return {
      message: 'Funcionalidade de listar agendamentos em desenvolvimento.',
      suggestions: ['Agendar consulta', 'Analisar dados da clínica']
    };
  }

  private async handleAnalyzeClinicData(message: string, context: ClinicContext): Promise<AIResponse> {
    // Lógica para analisar dados da clínica
    return {
      message: 'Funcionalidade de análise de dados da clínica em desenvolvimento.',
      suggestions: ['Obter insights da clínica', 'Listar agendamentos']
    };
  }

  private async handleClinicInsights(context: ClinicContext): Promise<AIResponse> {
    // Lógica para obter insights da clínica
    return {
      message: 'Funcionalidade de insights da clínica em desenvolvimento.',
      suggestions: ['Analisar dados da clínica', 'Listar pacientes']
    };
  }

  private async handleGeneralQuery(message: string, context: ClinicContext): Promise<AIResponse> {
    // Lógica para responder a perguntas gerais
    return {
      message: 'Entendi sua pergunta. No momento, posso te ajudar com as seguintes ações: adicionar pacientes, agendar consultas, ver histórico médico, etc. Como posso te ajudar especificamente?',
      suggestions: [
        'Adicionar um novo paciente',
        'Agendar uma consulta',
        'Ver histórico de um paciente'
      ]
    };
  }
}

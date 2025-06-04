import { 
  clinicDataService, 
  appointmentService, 
  patientService, 
  serviceService, 
  analyticsService, 
  type AppointmentInsert,
  type PatientInsert,
  type ServiceInsert
} from './clinic-services'; 

// Tipos específicos para dados das ações (adaptados para o contexto clínico)
interface AppointmentData {
  id?: string;
  patient_id?: string;
  service_id?: string;
  date?: string;
  time?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  pacientes?: { nome: string }; // Adicionado para facilitar a exibição
  servicos?: { nome: string, preco: number }; // Adicionado para facilitar a exibição
}

interface PatientData {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

interface ServiceData {
  id?: string;
  name?: string;
  description?: string;
  preco?: number; // Alterado de price para preco
  duration?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

interface ClinicSummary {
  totalAppointments: number;
  totalPatients: number;
  totalRevenue: number;
  // Adicionar outras métricas relevantes para a clínica
}

interface ServiceAnalysis {
  service: string;
  count: number;
  revenue: number;
}

// Importar tipos de clinic-services (adaptado)
import type { Profile } from './clinic-services';

interface ClinicContext {
  profile: Profile | null;
  appointments: AppointmentData[];
  patients: PatientData[];
  services: ServiceData[];
  // billReminders: BillReminderInsert[]; // Removido
  summary: ClinicSummary;
}

interface IntentData {
  type: string;
  data?: Record<string, unknown>;
}

type ActionData = AppointmentData | PatientData | ServiceData | Record<string, unknown>; // Removido BillReminderInsert

// Tipos para as ações que o AI pode executar (adaptados para o contexto clínico)
export interface AIAction {
  type: 'create_appointment' | 'update_appointment' | 'delete_appointment' | 
        'create_patient' | 'update_patient' | 'delete_patient' |
        'create_service' | 'update_service' | 'delete_service' |
        // 'create_bill_reminder' | 'update_bill_reminder' | 'delete_bill_reminder' | // Removido
        'analyze_appointments' | 'get_clinic_insights' | 'categorize_service' |
        'list_appointments' | 'list_patients' | 'list_services'; // Removido list_bill_reminders
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
      const context = await clinicDataService.getUserClinicContext(this.userId);
      
      // Analisar a intenção da mensagem
      const intent = this.analyzeIntent(message);
      
      // Processar baseado na intenção
      switch (intent.type) {
        case 'add_appointment':
          return await this.handleAddAppointment(message, intent.data, context);
        case 'delete_appointment':
          return await this.handleDeleteAppointment(message, intent.data);
        case 'create_patient':
          return await this.handleCreatePatient(message, intent.data);
        case 'delete_patient':
          return await this.handleDeletePatient(message, intent.data);
        case 'create_service':
          return await this.handleCreateService(message, intent.data);
        case 'delete_service':
          return await this.handleDeleteService(message, intent.data);
        // case 'create_bill_reminder': // Removido
        //   return await this.handleCreateBillReminder(message, intent.data);
        // case 'delete_bill_reminder': // Removido
        //   return await this.handleDeleteBillReminder(message, intent.data);
        case 'list_appointments':
          return await this.handleListAppointments(message, context);
        case 'list_patients':
          return await this.handleListPatients(message, context);
        case 'list_services':
          return await this.handleListServices(message, context);
        // case 'list_bill_reminders': // Removido
        //   return await this.handleListBillReminders(message, context);
        case 'analyze_appointments':
          return await this.handleAnalyzeAppointments(message, context);
        case 'clinic_insights':
          return await this.handleClinicInsights(context);
        case 'categorize_service':
        default:
          return await this.handleGeneralQuery(message, context);
      }
    } catch (error) {
      console.error('Erro no processamento da mensagem:', error);
      return {
        message: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        suggestions: [
          'Analise meus atendimentos do mês',
          'Agende uma consulta',
          'Mostre meus pacientes'
        ]
      };
    }
  }

  // Analisar a intenção da mensagem do usuário (adaptado para o contexto clínico)
  private analyzeIntent(message: string): IntentData {
    const lowerMessage = message.toLowerCase();

    // Padrões para adicionar agendamento
    if (lowerMessage.includes('agendar consulta') || lowerMessage.includes('marcar consulta') || 
        lowerMessage.includes('novo agendamento')) {
      return { type: 'add_appointment' };
    }

    // Padrões para deletar agendamento
    if (lowerMessage.includes('cancelar consulta') || lowerMessage.includes('apagar agendamento') || 
        lowerMessage.includes('excluir agendamento')) {
      return { type: 'delete_appointment' };
    }

    // Padrões para criar paciente
    if (lowerMessage.includes('cadastrar paciente') || lowerMessage.includes('novo paciente') || 
        lowerMessage.includes('adicionar paciente')) {
      return { type: 'create_patient' };
    }

    // Padrões para deletar paciente
    if (lowerMessage.includes('remover paciente') || lowerMessage.includes('excluir paciente') || 
        lowerMessage.includes('apagar paciente')) {
      return { type: 'delete_patient' };
    }

    // Padrões para criar serviço
    if (lowerMessage.includes('cadastrar serviço') || lowerMessage.includes('novo serviço') || 
        lowerMessage.includes('adicionar serviço')) {
      return { type: 'create_service' };
    }

    // Padrões para deletar serviço
    if (lowerMessage.includes('remover serviço') || lowerMessage.includes('excluir serviço') || 
        lowerMessage.includes('apagar serviço')) {
      return { type: 'delete_service' };
    }


    // Padrões para listar agendamentos
    if (lowerMessage.includes('mostrar agendamentos') || lowerMessage.includes('ver consultas') ||
        lowerMessage.includes('quais minhas consultas')) {
      return { type: 'list_appointments' };
    }

    // Padrões para listar pacientes
    if (lowerMessage.includes('mostrar pacientes') || lowerMessage.includes('ver pacientes') ||
        lowerMessage.includes('listar pacientes')) {
      return { type: 'list_patients' };
    }

    // Padrões para listar serviços
    if (lowerMessage.includes('mostrar serviços') || lowerMessage.includes('ver serviços') ||
        lowerMessage.includes('listar serviços')) {
      return { type: 'list_services' };
    }

    // Padrões para listar lembretes (manter se relevante)
    if (lowerMessage.includes('mostrar lembretes') || lowerMessage.includes('ver lembretes') ||
        lowerMessage.includes('listar lembretes')) {
      return { type: 'list_bill_reminders' };
    }

    // Padrões para análise de atendimentos
    if (lowerMessage.includes('analise') || lowerMessage.includes('atendimentos') || 
        lowerMessage.includes('quantos atendimentos') || lowerMessage.includes('resumo atendimentos')) {
      return { type: 'analyze_appointments' };
    }

    // Padrões para insights clínicos
    if (lowerMessage.includes('insight') || lowerMessage.includes('dica') || 
        lowerMessage.includes('conselho')) {
      return { type: 'clinic_insights' };
    }

    return { type: 'general_query' };
  }

  // Extrair nome do paciente da mensagem
  private extractPatientName(message: string): string | null {
    const patientNameMatch = message.match(/(?:para|do paciente)\s*([a-zA-Z\s]+?)(?:\s*(?:amanhã|hoje|dia|\d{2}\/\d{2}\/\d{4}|$))/i);
    return patientNameMatch ? patientNameMatch[1].trim() : null;
  }

  // Extrair nome do serviço da mensagem
  private extractServiceName(message: string): string | null {
    const serviceNameMatch = message.match(/(?:serviço de|para o serviço)\s*([a-zA-Z\s]+?)(?:\s*(?:amanhã|hoje|dia|\d{2}\/\d{2}\/\d{4}|$))/i);
    return serviceNameMatch ? serviceNameMatch[1].trim() : null;
  }

  // Extrair data da mensagem
  private extractDate(message: string): string | null {
    const dateMatch = message.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dateMatch) {
      const parts = dateMatch[1].split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
    }
    if (message.toLowerCase().includes('amanhã')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    if (message.toLowerCase().includes('hoje')) {
      return new Date().toISOString().split('T')[0];
    }
    return null;
  }

  // Extrair hora da mensagem
  private extractTime(message: string): string | null {
    const timeMatch = message.match(/(\d{1,2}h\d{2}|\d{1,2}:\d{2})/);
    if (timeMatch) {
      return timeMatch[1].replace('h', ':');
    }
    return null;
  }

  // Lidar com adição de agendamentos
  private async handleAddAppointment(message: string, data: Record<string, unknown> | undefined, context: ClinicContext): Promise<AIResponse> {
    const patientName = this.extractPatientName(message);
    const serviceName = this.extractServiceName(message);
    const date = this.extractDate(message);
    const time = this.extractTime(message);

    if (!patientName) {
      return {
        message: 'Para agendar uma consulta, preciso do nome do paciente. Ex: "Agendar consulta para João Silva amanhã"',
        suggestions: ['Agendar consulta para Maria hoje']
      };
    }
    if (!serviceName) {
      return {
        message: 'Para agendar uma consulta, preciso do nome do serviço. Ex: "Agendar consulta de Odontologia para João Silva amanhã"',
        suggestions: ['Agendar consulta de Pediatria para Maria hoje']
      };
    }
    if (!date) {
      return {
        message: 'Para agendar uma consulta, preciso da data. Ex: "Agendar consulta para João Silva em 10/07/2025"',
        suggestions: ['Agendar consulta para Maria amanhã']
      };
    }
    if (!time) {
      return {
        message: 'Para agendar uma consulta, preciso da hora. Ex: "Agendar consulta para João Silva em 10/07/2025 às 14h30"',
        suggestions: ['Agendar consulta para Maria amanhã às 10:00']
      };
    }

    const patient = context.patients.find(p => p.name?.toLowerCase().includes(patientName.toLowerCase()));
    if (!patient) {
      return {
        message: `Paciente "${patientName}" não encontrado. Por favor, cadastre-o primeiro.`,
        suggestions: [`Cadastrar paciente ${patientName}`]
      };
    }

    const service = context.services.find(s => s.name?.toLowerCase().includes(serviceName.toLowerCase()));
    if (!service) {
      return {
        message: `Serviço "${serviceName}" não encontrado. Por favor, cadastre-o primeiro.`,
        suggestions: [`Cadastrar serviço ${serviceName}`]
      };
    }

    const appointment: AppointmentInsert = {
      user_id: this.userId,
      patient_id: patient.id!,
      service_id: service.id!,
      date: date,
      time: time,
      status: 'scheduled',
    };

    try {
      const result = await appointmentService.create(appointment);
      
      return {
        message: `✅ Consulta agendada com sucesso!\n\nPaciente: ${patient.name}\nServiço: ${service.name}\nData: ${date}\nHora: ${time}`,
        actions: [{
          type: 'create_appointment',
          data: result.data as AppointmentData
        }],
        suggestions: [
          'Analise meus atendimentos de hoje',
          'Agendar outra consulta',
          'Mostre meus agendamentos'
        ]
      };
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      return {
        message: 'Erro ao agendar a consulta. Tente novamente.',
        suggestions: ['Tente agendar novamente']
      };
    }
  }

  // Lidar com exclusão de agendamentos
  private async handleDeleteAppointment(message: string, data?: Record<string, unknown>): Promise<AIResponse> {
    const idMatch = message.match(/id\s*(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/i);
    const id = idMatch ? idMatch[1] : null;

    if (!id) {
      return {
        message: 'Para cancelar uma consulta, preciso do ID dela. Você pode encontrá-lo na lista de agendamentos.',
        suggestions: [
          'Mostrar meus agendamentos',
          'Cancelar consulta com ID [ID_DA_CONSULTA]'
        ]
      };
    }

    try {
      await appointmentService.delete(id);
      return {
        message: `✅ Consulta com ID ${id} cancelada com sucesso!`,
        actions: [{
          type: 'delete_appointment',
          data: { id }
        }],
        suggestions: [
          'Mostrar meus agendamentos',
          'Agendar nova consulta'
        ]
      };
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error);
      return {
        message: `Erro ao cancelar a consulta com ID ${id}. Verifique se o ID está correto e tente novamente.`,
        suggestions: ['Tente cancelar novamente']
      };
    }
  }

  // Lidar com criação de pacientes
  private async handleCreatePatient(message: string, data?: Record<string, unknown>): Promise<AIResponse> {
    const nameMatch = message.match(/(?:cadastrar paciente|novo paciente|adicionar paciente)\s*(.+)/i);
    const name = nameMatch ? nameMatch[1].trim() : null;

    if (!name) {
      return {
        message: 'Para cadastrar um paciente, preciso do nome dele. Ex: "Cadastrar paciente João Silva"',
        suggestions: [
          'Cadastrar paciente Maria Souza',
          'Cadastrar paciente Pedro Santos'
        ]
      };
    }

    const patient: PatientInsert = {
      user_id: this.userId,
      name: name,
      // Adicionar outros campos se puderem ser extraídos da mensagem ou forem opcionais
    };

    try {
      const result = await patientService.create(patient);
      return {
        message: `✅ Paciente "${name}" cadastrado com sucesso!`,
        actions: [{
          type: 'create_patient',
          data: result.data as PatientData
        }],
        suggestions: [
          'Mostrar meus pacientes',
          'Agendar consulta para este paciente'
        ]
      };
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
      return {
        message: `Erro ao cadastrar o paciente "${name}". Tente novamente.`,
        suggestions: ['Tente cadastrar novamente']
      };
    }
  }

  // Lidar com exclusão de pacientes
  private async handleDeletePatient(message: string, data?: Record<string, unknown>): Promise<AIResponse> {
    const nameMatch = message.match(/(?:remover paciente|excluir paciente|apagar paciente)\s*(.+)/i);
    const name = nameMatch ? nameMatch[1].trim() : null;

    if (!name) {
      return {
        message: 'Para apagar um paciente, preciso do nome dele. Ex: "Apagar paciente João Silva"',
        suggestions: [
          'Mostrar meus pacientes',
          'Apagar paciente Maria Souza'
        ]
      };
    }

    try {
      const patients = await patientService.getAll(this.userId);
      const patientToDelete = patients.data?.find(p => p.name?.toLowerCase() === name.toLowerCase());

      if (!patientToDelete) {
        return {
          message: `Paciente "${name}" não encontrado. Verifique o nome e tente novamente.`,
          suggestions: ['Mostrar meus pacientes']
        };
      }

      await patientService.delete(patientToDelete.id);
      return {
        message: `✅ Paciente "${name}" apagado com sucesso!`,
        actions: [{
          type: 'delete_patient',
          data: { id: patientToDelete.id }
        }],
        suggestions: [
          'Mostrar meus pacientes',
          'Cadastrar novo paciente'
        ]
      };
    } catch (error) {
      console.error('Erro ao apagar paciente:', error);
      return {
        message: `Erro ao apagar o paciente "${name}". Tente novamente.`,
        suggestions: ['Tente apagar novamente']
      };
    }
  }

  // Lidar com criação de serviços
  private async handleCreateService(message: string, data?: Record<string, unknown>): Promise<AIResponse> {
    const nameMatch = message.match(/(?:cadastrar serviço|novo serviço|adicionar serviço)\s*(.+)/i);
    const name = nameMatch ? nameMatch[1].trim() : null;

    if (!name) {
      return {
        message: 'Para cadastrar um serviço, preciso do nome dele. Ex: "Cadastrar serviço Odontologia"',
        suggestions: [
          'Cadastrar serviço Pediatria',
          'Cadastrar serviço Fisioterapia'
        ]
      };
    }

    const service: ServiceInsert = {
      user_id: this.userId,
      name: name,
      // Adicionar outros campos se puderem ser extraídos da mensagem ou forem opcionais
    };

    try {
      const result = await serviceService.create(service);
      return {
        message: `✅ Serviço "${name}" cadastrado com sucesso!`,
        actions: [{
          type: 'create_service',
          data: result.data as ServiceData
        }],
        suggestions: [
          'Mostrar meus serviços',
          'Agendar consulta com este serviço'
        ]
      };
    } catch (error) {
      console.error('Erro ao cadastrar serviço:', error);
      return {
        message: `Erro ao cadastrar o serviço "${name}". Tente novamente.`,
        suggestions: ['Tente cadastrar novamente']
      };
    }
  }

  // Lidar com exclusão de serviços
  private async handleDeleteService(message: string, data?: Record<string, unknown>): Promise<AIResponse> {
    const nameMatch = message.match(/(?:remover serviço|excluir serviço|apagar serviço)\s*(.+)/i);
    const name = nameMatch ? nameMatch[1].trim() : null;

    if (!name) {
      return {
        message: 'Para apagar um serviço, preciso do nome dele. Ex: "Apagar serviço Odontologia"',
        suggestions: [
          'Mostrar meus serviços',
          'Apagar serviço Pediatria'
        ]
      };
    }

    try {
      const services = await serviceService.getAll(this.userId);
      const serviceToDelete = services.data?.find(s => s.name?.toLowerCase() === name.toLowerCase());

      if (!serviceToDelete) {
        return {
          message: `Serviço "${name}" não encontrado. Verifique o nome e tente novamente.`,
          suggestions: ['Mostrar meus serviços']
        };
      }

      await serviceService.delete(serviceToDelete.id);
      return {
        message: `✅ Serviço "${name}" apagado com sucesso!`,
        actions: [{
          type: 'delete_service',
          data: { id: serviceToDelete.id }
        }],
        suggestions: [
          'Mostrar meus serviços',
          'Cadastrar novo serviço'
        ]
      };
    } catch (error) {
      console.error('Erro ao apagar serviço:', error);
      return {
        message: `Erro ao apagar o serviço "${name}". Tente novamente.`,
        suggestions: ['Tente apagar novamente']
      };
    }
  }



  // Lidar com listagem de agendamentos
  private async handleListAppointments(message: string, context: ClinicContext): Promise<AIResponse> {
    const { appointments } = context;

    if (!appointments || appointments.length === 0) {
      return {
        message: 'Você não tem agendamentos registrados. Que tal agendar uma consulta?',
        suggestions: [
          'Agendar uma consulta',
          'Analisar meus atendimentos'
        ]
      };
    }

    let responseMessage = '📅 **Seus próximos agendamentos:**\n\n';
    appointments.slice(0, 5).forEach(appointment => {
      responseMessage += `• **${appointment.pacientes?.nome || 'Paciente Desconhecido'}** - ${appointment.servicos?.nome || 'Serviço Desconhecido'}\n`;
      responseMessage += `  Data: ${new Date(appointment.date || '').toLocaleDateString('pt-BR')}\n`;
      responseMessage += `  Hora: ${appointment.time}\n`;
      responseMessage += `  Status: ${appointment.status}\n\n`;
    });

    if (appointments.length > 5) {
      responseMessage += `...e mais ${appointments.length - 5} agendamentos.`;
    }

    return {
      message: responseMessage,
      data: appointments,
      suggestions: [
        'Agendar nova consulta',
        'Cancelar um agendamento',
        'Analise meus atendimentos do mês'
      ]
    };
  }

  // Lidar com listagem de pacientes
  private async handleListPatients(message: string, context: ClinicContext): Promise<AIResponse> {
    const { patients } = context;

    if (!patients || patients.length === 0) {
      return {
        message: 'Você não tem pacientes cadastrados. Que tal cadastrar um?',
        suggestions: [
          'Cadastrar um paciente',
          'Agendar uma consulta'
        ]
      };
    }

    let responseMessage = '👥 **Seus pacientes cadastrados:**\n\n';
    patients.slice(0, 5).forEach(patient => {
      responseMessage += `• **${patient.name}** (ID: ${patient.id})\n`;
      responseMessage += `  Email: ${patient.email || 'N/A'}\n`;
      responseMessage += `  Telefone: ${patient.phone || 'N/A'}\n\n`;
    });

    if (patients.length > 5) {
      responseMessage += `...e mais ${patients.length - 5} pacientes.`;
    }

    return {
      message: responseMessage,
      data: patients,
      suggestions: [
        'Cadastrar novo paciente',
        'Agendar consulta para um paciente'
      ]
    };
  }

  // Lidar com listagem de serviços
  private async handleListServices(message: string, context: ClinicContext): Promise<AIResponse> {
    const { services } = context;

    if (!services || services.length === 0) {
      return {
        message: 'Você não tem serviços cadastrados. Que tal cadastrar um?',
        suggestions: [
          'Cadastrar um serviço',
          'Agendar uma consulta'
        ]
      };
    }

    let responseMessage = '🏥 **Seus serviços cadastrados:**\n\n';
    services.slice(0, 5).forEach(service => {
      responseMessage += `• **${service.name}** (ID: ${service.id})\n`;
      responseMessage += `  Preço: R$ ${(service.preco || 0).toFixed(2)}\n`;
      responseMessage += `  Duração: ${service.duration || 'N/A'} minutos\n\n`;
    });

    if (services.length > 5) {
      responseMessage += `...e mais ${services.length - 5} serviços.`;
    }

    return {
      message: responseMessage,
      data: services,
      suggestions: [
        'Cadastrar novo serviço',
        'Agendar consulta com um serviço'
      ]
    };
  }

  // Método removido - billReminders não está implementado no contexto clínico

  // Gerar insights de atendimentos
  private generateAppointmentInsights(summary: ClinicSummary, serviceAnalysis: ServiceAnalysis[]): string[] {
    const insights: string[] = [];

    if (summary.totalAppointments > 0) {
      insights.push(`Você realizou ${summary.totalAppointments} atendimentos.`);
    }
    if (summary.totalRevenue > 0) {
      insights.push(`Sua receita total foi de R$ ${summary.totalRevenue.toFixed(2)}.`);
    }

    if (serviceAnalysis.length > 0) {
      const topService = serviceAnalysis[0];
      insights.push(`Seu serviço mais popular é "${topService.service}" com ${topService.count} atendimentos.`);
    }

    return insights;
  }

  // Lidar com análise de atendimentos
  private async handleAnalyzeAppointments(message: string, context: ClinicContext): Promise<AIResponse> {
    const { summary, appointments } = context;

    if (!summary || !appointments.length) {
      return {
        message: 'Você ainda não possui atendimentos registrados. Que tal agendar algumas consultas para começar a análise?',
        suggestions: [
          'Agendar uma consulta',
          'Cadastrar um paciente',
        ]
      };
    }

    const analysisMessage = `Análise de atendimentos:\n- Total de Consultas: ${summary.totalAppointments}\n- Total de Pacientes: ${summary.totalPatients}\n- Receita Total: R$ ${summary.totalRevenue.toFixed(2)}`;
    
    return {
      message: analysisMessage,
      data: { summary },
      suggestions: [
        'Quais meus serviços mais populares?',
        'Como posso otimizar meus agendamentos?'
      ]
    };
  }

  // Placeholder para insights clínicos
  private async handleClinicInsights(context: ClinicContext): Promise<AIResponse> {
    const insights = this.generateAppointmentInsights(context.summary, []); // Passar análise de serviço real aqui
    return {
      message: 'Aqui estão alguns insights sobre sua clínica:\n\n' + insights.join('\n') + '\n\n(funcionalidade em desenvolvimento)',
      suggestions: ['Como posso aumentar minha receita?', 'Quais são os horários de pico?']
    };
  }

  // Placeholder para consultas gerais
  private async handleGeneralQuery(message: string, context: ClinicContext): Promise<AIResponse> {
    return {
      message: 'Entendi sua pergunta. No momento, posso te ajudar com as seguintes ações: agendar consultas, cadastrar pacientes, gerenciar serviços, etc. Como posso te ajudar especificamente?',
      suggestions: [
        'Analise meus atendimentos do mês',
        'Agende uma consulta para João Silva amanhã',
        'Cadastre um novo paciente'
      ]
    };
  }
}

// Chatbot integration with CopilotKit
export interface ChatbotConfig {
  runtimeUrl: string;
  chatApiEndpoint: string;
  agent: string;
  categories: string[];
  instructions: string;
}

export class ChatbotIntegration {
  constructor(private config: ChatbotConfig) {}

  getProviderConfig() {
    return {
      runtimeUrl: this.config.runtimeUrl || '/api/copilotkit',
      chatApiEndpoint: this.config.chatApiEndpoint || '/api/copilotkit/chat',
      agent: this.config.agent || 'healthcare-assistant',
      categories: this.config.categories || ['healthcare', 'scheduling', 'patient-management'],
      instructions: this.config.instructions || 'You are a healthcare assistant for aesthetic clinics. Help professionals manage appointments, patient communication, and clinic operations.',
    };
  }

  // Healthcare-specific tools registry
  getHealthcareTools() {
    return {
      scheduleAppointment: {
        description: 'Schedule a new appointment',
        parameters: {
          type: 'object',
          properties: {
            patientId: { type: 'string', description: 'Patient ID' },
            professionalId: { type: 'string', description: 'Professional ID' },
            startTime: { type: 'string', description: 'Start time (ISO format)' },
            serviceType: { type: 'string', description: 'Type of service' },
          },
          required: ['patientId', 'professionalId', 'startTime', 'serviceType'],
        },
      },
      
      sendPatientMessage: {
        description: 'Send a message to a patient',
        parameters: {
          type: 'object',
          properties: {
            patientId: { type: 'string', description: 'Patient ID' },
            message: { type: 'string', description: 'Message content' },
          },
          required: ['patientId', 'message'],
        },
      },

      updateLeadStatus: {
        description: 'Update lead status',
        parameters: {
          type: 'object',
          properties: {
            leadId: { type: 'string', description: 'Lead ID' },
            status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'converted', 'lost'] },
            notes: { type: 'string', description: 'Additional notes' },
          },
          required: ['leadId', 'status'],
        },
      },
    };
  }
}
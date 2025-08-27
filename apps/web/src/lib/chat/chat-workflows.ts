"use client";

import type { ChatMessage } from '@/components/chat/ChatInterface';

// Healthcare workflow types
export type HealthcareWorkflowType = 
  | 'consultation' 
  | 'emergency' 
  | 'follow-up' 
  | 'scheduling'
  | 'payment-support'
  | 'pre-procedure'
  | 'post-procedure'
  | 'general-inquiry';

export type WorkflowPriority = 'low' | 'medium' | 'high' | 'critical';

export type EscalationRule = {
  condition: 'keyword' | 'sentiment' | 'confidence' | 'time' | 'emergency';
  value: string | number;
  action: 'escalate' | 'alert' | 'transfer' | 'emergency';
  targetRole?: 'doctor' | 'nurse' | 'receptionist' | 'manager';
  specialty?: 'dermatology' | 'aesthetics' | 'plastic-surgery';
};

export interface HealthcareWorkflow {
  type: HealthcareWorkflowType;
  priority: WorkflowPriority;
  autoResponders: boolean;
  escalationRules: EscalationRule[];
  complianceRequired: Array<'cfm' | 'anvisa' | 'lgpd'>;
  maxResponseTime: number; // seconds
  healthcareContext: {
    requiresLicense?: boolean;
    medicalAdviceAllowed?: boolean;
    prescriptionAllowed?: boolean;
    emergencyProtocol?: boolean;
  };
  conversationFlow: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  autoTrigger?: {
    keywords: string[];
    sentiment?: 'positive' | 'negative' | 'neutral' | 'urgent';
    confidence?: number;
  };
  responses: WorkflowResponse[];
  nextSteps?: string[];
  escalationTrigger?: boolean;
}

export interface WorkflowResponse {
  id: string;
  text: string;
  type: 'text' | 'quick-reply' | 'form' | 'appointment-link';
  metadata?: {
    quickReplies?: string[];
    formFields?: string[];
    appointmentTypes?: string[];
    specialties?: string[];
  };
}

// Brazilian healthcare compliance patterns
export const BRAZILIAN_HEALTHCARE_WORKFLOWS: Record<HealthcareWorkflowType, HealthcareWorkflow> = {
  consultation: {
    type: 'consultation',
    priority: 'high',
    autoResponders: true,
    escalationRules: [
      {
        condition: 'keyword',
        value: 'dor|sangramento|emergência|urgente|grave|crítico',
        action: 'escalate',
        targetRole: 'doctor',
      },
      {
        condition: 'confidence',
        value: 0.3,
        action: 'alert',
        targetRole: 'nurse',
      },
    ],
    complianceRequired: ['cfm', 'lgpd'],
    maxResponseTime: 300, // 5 minutes
    healthcareContext: {
      requiresLicense: true,
      medicalAdviceAllowed: false, // Only licensed professionals
      prescriptionAllowed: false,
      emergencyProtocol: false,
    },
    conversationFlow: [
      {
        id: 'greeting',
        name: 'Saudação Inicial',
        description: 'Recepção calorosa e identificação da necessidade',
        responses: [
          {
            id: 'welcome',
            text: '🏥 Olá! Bem-vindo à consulta online da NeonPro. Sou seu assistente virtual especializado em estética e dermatologia.\n\nPara melhor atendê-lo, preciso de algumas informações:\n\n📝 Qual é sua principal dúvida ou preocupação hoje?',
            type: 'text',
          }
        ],
        nextSteps: ['symptom-assessment'],
      },
      {
        id: 'symptom-assessment',
        name: 'Avaliação de Sintomas',
        description: 'Coleta de informações sobre sintomas e histórico',
        autoTrigger: {
          keywords: ['sintoma', 'problema', 'dúvida', 'tratamento'],
          confidence: 0.7,
        },
        responses: [
          {
            id: 'symptom-questions',
            text: '📋 Para uma avaliação adequada, preciso entender melhor sua situação:\n\n1. Há quanto tempo você tem essa preocupação?\n2. Já fez algum tratamento similar antes?\n3. Tem alergias conhecidas a medicamentos ou produtos?\n4. Está tomando algum medicamento atualmente?\n\n⚠️ **Importante:** Esta consulta não substitui uma avaliação presencial com profissional licenciado.',
            type: 'form',
            metadata: {
              formFields: ['duration', 'previous-treatments', 'allergies', 'current-medications'],
            },
          }
        ],
        nextSteps: ['professional-recommendation'],
      },
      {
        id: 'professional-recommendation',
        name: 'Recomendação Profissional',
        description: 'Direcionamento para profissional adequado',
        responses: [
          {
            id: 'schedule-consultation',
            text: '👨‍⚕️ Com base nas informações fornecidas, recomendo uma consulta presencial com nosso especialista.\n\n📅 **Opções de agendamento:**\n• Dermatologista - Próxima disponibilidade\n• Médico Estético - Avaliação completa\n• Cirurgião Plástico - Consulta especializada\n\n🔒 **Conformidade LGPD:** Seus dados são protegidos conforme a legislação brasileira.',
            type: 'appointment-link',
            metadata: {
              appointmentTypes: ['dermatology', 'aesthetic-medicine', 'plastic-surgery'],
              specialties: ['skin-conditions', 'aesthetic-procedures', 'surgical-procedures'],
            },
          }
        ],
        nextSteps: ['follow-up'],
      },
    ],
  },

  emergency: {
    type: 'emergency',
    priority: 'critical',
    autoResponders: true,
    escalationRules: [
      {
        condition: 'keyword',
        value: 'emergência|urgente|samu|192|socorro|grave|crítico|não respira|inconsciente',
        action: 'emergency',
        targetRole: 'doctor',
      },
      {
        condition: 'time',
        value: 30, // 30 seconds
        action: 'escalate',
        targetRole: 'manager',
      },
    ],
    complianceRequired: ['cfm'],
    maxResponseTime: 10, // 10 seconds
    healthcareContext: {
      requiresLicense: true,
      medicalAdviceAllowed: true, // Emergency context allows guidance
      prescriptionAllowed: false,
      emergencyProtocol: true,
    },
    conversationFlow: [
      {
        id: 'emergency-assessment',
        name: 'Avaliação de Emergência',
        description: 'Triagem imediata da situação',
        responses: [
          {
            id: 'emergency-triage',
            text: '🚨 **PROTOCOLO DE EMERGÊNCIA ATIVADO**\n\n⚡ **RESPOSTA IMEDIATA:**\n\n1. **SITUAÇÃO GRAVE?** Se houver risco de vida, ligue **192 (SAMU)** AGORA\n2. **Local seguro?** Certifique-se de estar em ambiente seguro\n3. **Consciência?** A pessoa está consciente e responsiva?\n\n📞 **Nossa equipe médica foi alertada automaticamente**\n\n⏰ **Tempo de resposta:** < 60 segundos\n\nDescreva rapidamente a situação:',
            type: 'text',
          }
        ],
        nextSteps: ['emergency-instructions'],
        escalationTrigger: true,
      },
      {
        id: 'emergency-instructions',
        name: 'Instruções de Emergência',
        description: 'Orientações imediatas enquanto aguarda socorro',
        responses: [
          {
            id: 'first-aid',
            text: '🏥 **INSTRUÇÕES ENQUANTO AGUARDA SOCORRO:**\n\n✅ **Primeiros Socorros Básicos:**\n• Mantenha a calma\n• Não mova a pessoa se houver suspeita de trauma\n• Monitore respiração e pulso\n• Mantenha vias aéreas desobstruídas\n\n📱 **Contatos de Emergência:**\n• SAMU: 192\n• Bombeiros: 193\n• Polícia: 190\n\n👨‍⚕️ **Médico NeonPro conectando em instantes...**',
            type: 'text',
          }
        ],
        nextSteps: ['professional-handoff'],
      },
    ],
  },

  scheduling: {
    type: 'scheduling',
    priority: 'medium',
    autoResponders: true,
    escalationRules: [
      {
        condition: 'time',
        value: 600, // 10 minutes
        action: 'alert',
        targetRole: 'receptionist',
      },
    ],
    complianceRequired: ['lgpd'],
    maxResponseTime: 120, // 2 minutes
    healthcareContext: {
      requiresLicense: false,
      medicalAdviceAllowed: false,
      prescriptionAllowed: false,
      emergencyProtocol: false,
    },
    conversationFlow: [
      {
        id: 'scheduling-greeting',
        name: 'Agendamento - Recepção',
        description: 'Início do processo de agendamento',
        autoTrigger: {
          keywords: ['agendar', 'marcar', 'consulta', 'horário', 'disponibilidade'],
          confidence: 0.8,
        },
        responses: [
          {
            id: 'scheduling-options',
            text: '📅 **Agendamento NeonPro - Sistema Inteligente**\n\n🎯 **Tipos de Consulta Disponíveis:**\n\n🔸 **Dermatologia:** Acne, manchas, lesões de pele\n🔸 **Medicina Estética:** Botox, preenchimento, tratamentos faciais\n🔸 **Cirurgia Plástica:** Avaliação para procedimentos cirúrgicos\n🔸 **Retorno/Follow-up:** Acompanhamento pós-procedimento\n\n✨ **Qual tipo de consulta você precisa?**',
            type: 'quick-reply',
            metadata: {
              quickReplies: ['Dermatologia', 'Medicina Estética', 'Cirurgia Plástica', 'Retorno'],
            },
          }
        ],
        nextSteps: ['availability-check'],
      },
      {
        id: 'availability-check',
        name: 'Verificação de Disponibilidade',
        description: 'Consulta horários disponíveis',
        responses: [
          {
            id: 'available-slots',
            text: '🗓️ **Horários Disponíveis:**\n\n📅 **Esta Semana:**\n• Terça-feira, 14:00 - Dr. Silva (Dermatologia)\n• Quarta-feira, 09:30 - Dra. Santos (Estética)\n• Quinta-feira, 16:00 - Dr. Oliveira (Cirurgia Plástica)\n\n📅 **Próxima Semana:**\n• Segunda-feira, 08:00 - Dra. Costa (Dermatologia)\n• Terça-feira, 15:30 - Dr. Lima (Estética)\n\n⭐ **Qual horário prefere?**\n\n💡 **Dica:** Consultas matutinas têm 20% de desconto!',
            type: 'quick-reply',
            metadata: {
              quickReplies: ['Terça 14h', 'Quarta 09:30', 'Quinta 16h', 'Segunda 08h', 'Terça 15:30'],
            },
          }
        ],
        nextSteps: ['patient-info'],
      },
    ],
  },

  'follow-up': {
    type: 'follow-up',
    priority: 'medium',
    autoResponders: true,
    escalationRules: [
      {
        condition: 'keyword',
        value: 'complicação|infecção|piorou|problema|preocupado',
        action: 'escalate',
        targetRole: 'doctor',
      },
    ],
    complianceRequired: ['cfm', 'lgpd'],
    maxResponseTime: 180, // 3 minutes
    healthcareContext: {
      requiresLicense: true,
      medicalAdviceAllowed: true,
      prescriptionAllowed: false,
      emergencyProtocol: false,
    },
    conversationFlow: [
      {
        id: 'follow-up-assessment',
        name: 'Avaliação de Follow-up',
        description: 'Verificação do progresso pós-procedimento',
        autoTrigger: {
          keywords: ['pós', 'depois', 'resultado', 'evolução', 'follow'],
          confidence: 0.7,
        },
        responses: [
          {
            id: 'recovery-check',
            text: '🏥 **Follow-up NeonPro - Acompanhamento Especializado**\n\n📋 **Vamos avaliar sua evolução:**\n\n1. **Como está se sentindo** após o procedimento?\n2. **Está seguindo** todas as orientações médicas?\n3. **Houve alguma reação** inesperada?\n4. **Nível de satisfação** com o resultado até agora?\n\n📊 **Escala de 1-10, como avalia sua recuperação?**\n\n⚕️ Todas as informações são registradas em seu prontuário eletrônico.',
            type: 'form',
            metadata: {
              formFields: ['general-feeling', 'compliance', 'reactions', 'satisfaction', 'recovery-scale'],
            },
          }
        ],
        nextSteps: ['recovery-guidance'],
      },
    ],
  },

  'pre-procedure': {
    type: 'pre-procedure',
    priority: 'high',
    autoResponders: true,
    escalationRules: [],
    complianceRequired: ['cfm', 'anvisa', 'lgpd'],
    maxResponseTime: 240, // 4 minutes
    healthcareContext: {
      requiresLicense: true,
      medicalAdviceAllowed: true,
      prescriptionAllowed: false,
      emergencyProtocol: false,
    },
    conversationFlow: [
      {
        id: 'pre-procedure-prep',
        name: 'Preparação Pré-Procedimento',
        description: 'Orientações e checklist pré-procedimento',
        responses: [
          {
            id: 'preparation-guide',
            text: '📋 **Preparação para seu Procedimento - NeonPro**\n\n✅ **Checklist de Preparação:**\n\n**24 horas antes:**\n• Evite álcool e anti-inflamatórios\n• Hidrate-se bem (2-3 litros de água)\n• Durma pelo menos 8 horas\n\n**No dia do procedimento:**\n• Tome café da manhã leve\n• Use roupas confortáveis\n• Chegue 30 minutos antes\n\n⚠️ **Contraindicações temporárias:**\n• Gravidez ou amamentação\n• Infecções ativas na região\n• Uso de anticoagulantes\n\n📞 **Dúvidas?** Nossa equipe está disponível 24h',
            type: 'text',
          }
        ],
        nextSteps: ['final-confirmation'],
      },
    ],
  },

  'post-procedure': {
    type: 'post-procedure',
    priority: 'high',
    autoResponders: true,
    escalationRules: [
      {
        condition: 'keyword',
        value: 'infecção|pus|febre|dor intensa|sangramento',
        action: 'emergency',
        targetRole: 'doctor',
      },
    ],
    complianceRequired: ['cfm', 'lgpd'],
    maxResponseTime: 120, // 2 minutes
    healthcareContext: {
      requiresLicense: true,
      medicalAdviceAllowed: true,
      prescriptionAllowed: false,
      emergencyProtocol: true,
    },
    conversationFlow: [
      {
        id: 'post-care-instructions',
        name: 'Instruções Pós-Procedimento',
        description: 'Cuidados essenciais pós-procedimento',
        responses: [
          {
            id: 'aftercare-guide',
            text: '🏥 **Cuidados Pós-Procedimento - NeonPro**\n\n✨ **Primeiras 24 horas - CRÍTICAS:**\n\n❄️ **Gelo:** 15 min a cada hora (primeiras 6h)\n💊 **Medicação:** Conforme prescrição médica\n🚫 **Evite:** Sol, exercícios, álcool\n💧 **Limpeza:** Apenas água filtrada\n\n⚠️ **SINAIS DE ALERTA - Procure atendimento:**\n• Febre acima de 38°C\n• Sangramento excessivo\n• Dor que piora com analgésicos\n• Sinais de infecção (pus, vermelhidão)\n\n📱 **Emergência 24h:** (11) 9999-9999\n\n📅 **Retorno agendado:** 7 dias',
            type: 'text',
          }
        ],
        nextSteps: ['monitoring-schedule'],
      },
    ],
  },

  'payment-support': {
    type: 'payment-support',
    priority: 'low',
    autoResponders: true,
    escalationRules: [
      {
        condition: 'sentiment',
        value: 'negative',
        action: 'alert',
        targetRole: 'manager',
      },
    ],
    complianceRequired: ['lgpd'],
    maxResponseTime: 300, // 5 minutes
    healthcareContext: {
      requiresLicense: false,
      medicalAdviceAllowed: false,
      prescriptionAllowed: false,
      emergencyProtocol: false,
    },
    conversationFlow: [
      {
        id: 'payment-options',
        name: 'Opções de Pagamento',
        description: 'Informações sobre formas de pagamento e financiamento',
        autoTrigger: {
          keywords: ['pagamento', 'preço', 'valor', 'financiar', 'parcelar', 'cartão'],
          confidence: 0.8,
        },
        responses: [
          {
            id: 'payment-methods',
            text: '💳 **Formas de Pagamento - NeonPro**\n\n✅ **Opções Disponíveis:**\n\n**💰 À Vista (10% desconto):**\n• Dinheiro\n• PIX\n• Cartão de débito\n\n**📱 Parcelado:**\n• Cartão de crédito (até 12x)\n• Financiamento próprio (até 24x)\n• Crédito pessoal parceiro\n\n**🏥 Convênios:**\n• Unimed, Bradesco Saúde, Sul América\n• Reembolso parcial disponível\n\n💡 **Simulação gratuita disponível!**\n\nQual opção tem interesse em saber mais?',
            type: 'quick-reply',
            metadata: {
              quickReplies: ['À Vista', 'Parcelado', 'Convênio', 'Simulação'],
            },
          }
        ],
        nextSteps: ['financial-planning'],
      },
    ],
  },

  'general-inquiry': {
    type: 'general-inquiry',
    priority: 'low',
    autoResponders: true,
    escalationRules: [
      {
        condition: 'confidence',
        value: 0.5,
        action: 'alert',
        targetRole: 'receptionist',
      },
    ],
    complianceRequired: ['lgpd'],
    maxResponseTime: 300, // 5 minutes
    healthcareContext: {
      requiresLicense: false,
      medicalAdviceAllowed: false,
      prescriptionAllowed: false,
      emergencyProtocol: false,
    },
    conversationFlow: [
      {
        id: 'general-help',
        name: 'Ajuda Geral',
        description: 'Suporte geral e direcionamento',
        responses: [
          {
            id: 'help-menu',
            text: '🤝 **Central de Ajuda NeonPro**\n\n📍 **Como posso ajudá-lo?**\n\n🏥 **Sobre a Clínica:**\n• Localização e horários\n• Especialidades disponíveis\n• Nossa equipe médica\n\n📅 **Agendamentos:**\n• Marcar consulta\n• Cancelar/reagendar\n• Verificar disponibilidade\n\n💊 **Procedimentos:**\n• Informações gerais\n• Preços e formas de pagamento\n• Preparação e cuidados\n\n🎯 **Selecione o tema da sua dúvida:**',
            type: 'quick-reply',
            metadata: {
              quickReplies: ['Sobre a Clínica', 'Agendamentos', 'Procedimentos', 'Outros'],
            },
          }
        ],
        nextSteps: ['specific-help'],
      },
    ],
  },
};

// Workflow execution engine
export class HealthcareWorkflowEngine {
  private currentWorkflow: HealthcareWorkflow | null = null;
  private currentStep: WorkflowStep | null = null;
  private conversationContext: Map<string, any> = new Map();

  // Initialize workflow based on message analysis
  initializeWorkflow(
    messageContent: string,
    userContext: {
      type: 'patient' | 'staff';
      previousMessages: ChatMessage[];
      healthcareContext?: any;
    }
  ): HealthcareWorkflow | null {
    // Detect workflow type from message content and context
    const workflowType = this.detectWorkflowType(messageContent, userContext);
    
    if (workflowType) {
      this.currentWorkflow = BRAZILIAN_HEALTHCARE_WORKFLOWS[workflowType];
      this.currentStep = this.currentWorkflow.conversationFlow[0];
      return this.currentWorkflow;
    }

    return null;
  }

  // Detect appropriate workflow from message
  private detectWorkflowType(
    messageContent: string,
    userContext: any
  ): HealthcareWorkflowType | null {
    const content = messageContent.toLowerCase();

    // Emergency detection - highest priority
    if (this.containsEmergencyKeywords(content)) {
      return 'emergency';
    }

    // Scheduling keywords
    if (/agendar|marcar|consulta|horário|disponível/i.test(content)) {
      return 'scheduling';
    }

    // Payment related
    if (/pagamento|preço|valor|financiar|parcelar/i.test(content)) {
      return 'payment-support';
    }

    // Follow-up related
    if (/pós|depois|resultado|evolução|follow/i.test(content)) {
      return 'follow-up';
    }

    // Pre-procedure
    if (/preparação|antes|pré.*procedimento/i.test(content)) {
      return 'pre-procedure';
    }

    // Post-procedure
    if (/cuidados|após|pós.*procedimento/i.test(content)) {
      return 'post-procedure';
    }

    // Medical consultation
    if (/consulta|médico|sintoma|problema|tratamento/i.test(content)) {
      return 'consultation';
    }

    // Default to general inquiry
    return 'general-inquiry';
  }

  // Check for emergency keywords
  private containsEmergencyKeywords(content: string): boolean {
    const emergencyKeywords = [
      'emergência', 'urgente', 'samu', '192', 'socorro', 'grave', 'crítico',
      'não respira', 'inconsciente', 'sangramento', 'dor forte', 'desmaio'
    ];

    return emergencyKeywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    );
  }

  // Get current workflow response
  getCurrentResponse(): WorkflowResponse | null {
    return this.currentStep?.responses[0] || null;
  }

  // Check if escalation is needed
  shouldEscalate(
    messageContent: string,
    confidence: number,
    timestamp: Date
  ): EscalationRule | null {
    if (!this.currentWorkflow) return null;

    for (const rule of this.currentWorkflow.escalationRules) {
      switch (rule.condition) {
        case 'keyword':
          if (new RegExp(rule.value as string, 'i').test(messageContent)) {
            return rule;
          }
          break;
        case 'confidence':
          if (confidence < (rule.value as number)) {
            return rule;
          }
          break;
        case 'time':
          // Check if response time exceeded
          const elapsed = (Date.now() - timestamp.getTime()) / 1000;
          if (elapsed > (rule.value as number)) {
            return rule;
          }
          break;
        case 'emergency':
          if (this.containsEmergencyKeywords(messageContent)) {
            return rule;
          }
          break;
      }
    }

    return null;
  }

  // Move to next step in workflow
  moveToNextStep(stepId?: string): WorkflowStep | null {
    if (!this.currentWorkflow || !this.currentStep) return null;

    const nextStepId = stepId || this.currentStep.nextSteps?.[0];
    if (nextStepId) {
      const nextStep = this.currentWorkflow.conversationFlow.find(
        step => step.id === nextStepId
      );
      
      if (nextStep) {
        this.currentStep = nextStep;
        return nextStep;
      }
    }

    return null;
  }

  // Get workflow context
  getContext(): {
    workflow: HealthcareWorkflow | null;
    step: WorkflowStep | null;
    context: Map<string, any>;
  } {
    return {
      workflow: this.currentWorkflow,
      step: this.currentStep,
      context: this.conversationContext,
    };
  }
}

export default HealthcareWorkflowEngine;
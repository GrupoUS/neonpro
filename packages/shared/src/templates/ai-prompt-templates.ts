/**
 * AI Prompt Templates for Brazilian Portuguese Healthcare
 * Specialized templates for aesthetic clinic scenarios and WhatsApp integration
 */

export interface PromptTemplate {
  id: string
  name: string
  category: 'whatsapp' | 'aesthetic' | 'compliance' | 'general'
  context: 'external' | 'internal' | 'both'
  language: 'pt-BR'
  template: string
  variables?: string[]
  metadata: {
    description: string
    useCase: string
    compliance: string[]
    lastUpdated: string
  }
}

// WhatsApp-specific prompt templates
export const WHATSAPP_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'whatsapp-greeting',
    name: 'WhatsApp Greeting',
    category: 'whatsapp',
    context: 'external',
    language: 'pt-BR',
    template: `Olá! 😊 Sou a assistente virtual da NeonPro! 

Estou aqui para te ajudar com:
• Informações sobre tratamentos estéticos
• Agendamento de consultas
• Dúvidas sobre procedimentos
• Cuidados pós-procedimento

Como posso te ajudar hoje? 💆‍♀️✨`,
    variables: [],
    metadata: {
      description: 'Friendly WhatsApp greeting with service overview',
      useCase: 'Initial contact and conversation starter',
      compliance: ['LGPD', 'CFM',],
      lastUpdated: '2025-09-06',
    },
  },
  {
    id: 'whatsapp-appointment-booking',
    name: 'Appointment Booking Assistant',
    category: 'whatsapp',
    context: 'external',
    language: 'pt-BR',
    template: `Perfeito! Vou te ajudar a agendar sua consulta! 📅

Para encontrar o melhor horário para você, preciso de algumas informações:

1️⃣ Qual procedimento te interessa?
2️⃣ Você tem preferência de dia da semana?
3️⃣ Prefere manhã, tarde ou noite?
4️⃣ É seu primeiro tratamento conosco?

Nossa agenda está sempre atualizada e posso verificar disponibilidade em tempo real! 😊`,
    variables: ['procedure_type', 'preferred_time', 'patient_history',],
    metadata: {
      description: 'Interactive appointment booking flow',
      useCase: 'Scheduling appointments via WhatsApp',
      compliance: ['LGPD', 'CFM',],
      lastUpdated: '2025-09-06',
    },
  },
  {
    id: 'whatsapp-procedure-inquiry',
    name: 'Procedure Information',
    category: 'whatsapp',
    context: 'external',
    language: 'pt-BR',
    template:
      `Que ótima escolha! 💫 O {{procedure_name}} é um dos nossos tratamentos mais procurados!

📋 **Sobre o procedimento:**
• Duração: {{duration}}
• Resultados: {{expected_results}}
• Cuidados: {{post_care}}

💡 **Importante saber:**
• Consulta de avaliação é sempre necessária
• Cada caso é único e personalizado
• Seguimos todos os protocolos de segurança

Gostaria de agendar uma avaliação? Posso verificar nossa agenda! 📅`,
    variables: ['procedure_name', 'duration', 'expected_results', 'post_care',],
    metadata: {
      description: 'Detailed procedure information with booking CTA',
      useCase: 'Answering procedure-specific questions',
      compliance: ['LGPD', 'CFM', 'ANVISA',],
      lastUpdated: '2025-09-06',
    },
  },
  {
    id: 'whatsapp-post-procedure-care',
    name: 'Post-Procedure Care',
    category: 'whatsapp',
    context: 'external',
    language: 'pt-BR',
    template: `Oi, {{patient_name}}! 😊 Como você está se sentindo após o {{procedure_name}}?

🌟 **Lembretes importantes:**
• {{care_instruction_1}}
• {{care_instruction_2}}
• {{care_instruction_3}}

⚠️ **Atenção:**
Se sentir qualquer desconforto fora do normal, entre em contato conosco imediatamente!

📞 Emergência: {{emergency_contact}}
💬 Dúvidas: Pode me chamar aqui mesmo!

Estamos aqui para cuidar de você! 💕`,
    variables: [
      'patient_name',
      'procedure_name',
      'care_instruction_1',
      'care_instruction_2',
      'care_instruction_3',
      'emergency_contact',
    ],
    metadata: {
      description: 'Post-procedure care instructions and follow-up',
      useCase: 'Patient care after treatments',
      compliance: ['LGPD', 'CFM', 'ANVISA',],
      lastUpdated: '2025-09-06',
    },
  },
  {
    id: 'whatsapp-emergency-escalation',
    name: 'Emergency Escalation',
    category: 'whatsapp',
    context: 'external',
    language: 'pt-BR',
    template: `🚨 **ATENÇÃO - SITUAÇÃO DE EMERGÊNCIA DETECTADA**

Entendo que você pode estar passando por uma situação que requer atenção médica imediata.

📞 **CONTATOS DE EMERGÊNCIA:**
• Clínica NeonPro: {{clinic_emergency_phone}}
• SAMU: 192
• Bombeiros: 193

👨‍⚕️ **IMPORTANTE:**
• Procure atendimento médico presencial imediatamente
• Não hesite em ligar para os serviços de emergência
• Nossa equipe médica está sendo notificada

Sua segurança é nossa prioridade! 🏥`,
    variables: ['clinic_emergency_phone',],
    metadata: {
      description: 'Emergency situation escalation protocol',
      useCase: 'Medical emergency detection and escalation',
      compliance: ['CFM', 'ANVISA', 'Emergency Protocols',],
      lastUpdated: '2025-09-06',
    },
  },
]

// System prompts for WhatsApp context
export const WHATSAPP_SYSTEM_PROMPTS = {
  external:
    `Você é a assistente virtual da NeonPro, uma clínica de estética brasileira especializada em harmonização facial e tratamentos corporais.

CONTEXTO WHATSAPP:
- Responda de forma amigável e acolhedora
- Use emojis moderadamente para criar conexão
- Mantenha mensagens curtas e objetivas
- Adapte-se ao estilo de comunicação do paciente

ESPECIALIDADES DA CLÍNICA:
- Harmonização facial (preenchimento, botox)
- Tratamentos corporais (criolipólise, radiofrequência)
- Cuidados com a pele (peelings, limpeza profunda)
- Procedimentos minimamente invasivos

DIRETRIZES DE COMUNICAÇÃO:
✅ SEMPRE:
- Seja empática e acolhedora
- Use linguagem acessível em português brasileiro
- Incentive consulta de avaliação presencial
- Mantenha conformidade LGPD/CFM/ANVISA
- Ofereça agendamento quando apropriado

❌ NUNCA:
- Faça diagnósticos médicos específicos
- Prometa resultados garantidos
- Compartilhe informações de outros pacientes
- Ignore sinais de emergência médica
- Use linguagem técnica excessiva

EMERGÊNCIAS:
Se detectar situação de emergência, acione protocolo de escalação imediatamente.`,

  internal: `Você é o assistente interno de IA da NeonPro para profissionais de saúde.

CONTEXTO WHATSAPP INTERNO:
- Comunicação profissional e técnica
- Suporte operacional e administrativo
- Análise de dados respeitando LGPD
- Otimização de processos clínicos

CAPACIDADES:
- Análise de métricas da clínica
- Suporte a agendamentos
- Informações sobre protocolos
- Gestão de fluxos de trabalho

CONFORMIDADE:
- Total aderência LGPD/CFM/ANVISA
- Proteção de dados de pacientes
- Confidencialidade médica
- Auditoria de ações`,
}

// Aesthetic procedure-specific templates
export const AESTHETIC_PROCEDURE_TEMPLATES: PromptTemplate[] = [
  {
    id: 'harmonizacao-facial',
    name: 'Harmonização Facial',
    category: 'aesthetic',
    context: 'external',
    language: 'pt-BR',
    template: `✨ **HARMONIZAÇÃO FACIAL** ✨

A harmonização facial é um conjunto de procedimentos que visa equilibrar e realçar a beleza natural do seu rosto!

🎯 **O que inclui:**
• Preenchimento com ácido hialurônico
• Aplicação de toxina botulínica (Botox)
• Bioestimuladores de colágeno
• Fios de sustentação (quando indicado)

📋 **Áreas tratadas:**
• Lábios e região perioral
• Sulcos nasogenianos
• Região dos olhos
• Contorno mandibular
• Malar e zigomático

⏱️ **Duração:** 1h a 1h30
🔄 **Resultados:** Imediatos com melhora progressiva
💫 **Duração:** 12 a 18 meses

Cada harmonização é única e personalizada para você! Que tal agendar uma avaliação? 😊`,
    variables: [],
    metadata: {
      description: 'Complete facial harmonization information',
      useCase: 'Explaining facial harmonization procedures',
      compliance: ['LGPD', 'CFM', 'ANVISA',],
      lastUpdated: '2025-09-06',
    },
  },
  {
    id: 'preenchimento-labial',
    name: 'Preenchimento Labial',
    category: 'aesthetic',
    context: 'external',
    language: 'pt-BR',
    template: `💋 **PREENCHIMENTO LABIAL** 💋

Lábios mais definidos, volumosos e naturais!

🌟 **Benefícios:**
• Aumento do volume labial
• Definição do contorno
• Hidratação profunda
• Correção de assimetrias

💉 **Produto utilizado:**
• Ácido hialurônico de alta qualidade
• Aprovado pela ANVISA
• Totalmente absorvível pelo organismo

⏱️ **Procedimento:**
• Duração: 30-45 minutos
• Anestesia tópica para conforto
• Resultados imediatos

🔄 **Duração:** 8 a 12 meses
💡 **Dica:** Resultados ficam ainda mais naturais após 15 dias!

Quer saber mais sobre o procedimento ideal para você? 😊`,
    variables: [],
    metadata: {
      description: 'Lip filler procedure details',
      useCase: 'Lip enhancement consultations',
      compliance: ['LGPD', 'CFM', 'ANVISA',],
      lastUpdated: '2025-09-06',
    },
  },
  {
    id: 'criolipolise',
    name: 'Criolipólise',
    category: 'aesthetic',
    context: 'external',
    language: 'pt-BR',
    template: `❄️ **CRIOLIPÓLISE** ❄️

Elimine gordura localizada sem cirurgia!

🎯 **Como funciona:**
• Congelamento controlado das células de gordura
• Eliminação natural pelo organismo
• Redução de 20% a 25% da gordura local

📍 **Áreas tratadas:**
• Abdômen
• Flancos (love handles)
• Culote
• Papada
• Braços
• Costas

⏱️ **Sessão:** 35-60 minutos por área
🔄 **Resultados:** Visíveis a partir de 30 dias
📈 **Resultado final:** 2 a 3 meses

💡 **Ideal para:**
• Gordura localizada resistente
• Quem não quer cirurgia
• Manutenção de resultados

Vamos avaliar se é o tratamento ideal para você? 😊`,
    variables: [],
    metadata: {
      description: 'Cryolipolysis body contouring information',
      useCase: 'Body contouring consultations',
      compliance: ['LGPD', 'CFM', 'ANVISA',],
      lastUpdated: '2025-09-06',
    },
  },
]

export default {
  WHATSAPP_PROMPT_TEMPLATES,
  WHATSAPP_SYSTEM_PROMPTS,
  AESTHETIC_PROCEDURE_TEMPLATES,
}

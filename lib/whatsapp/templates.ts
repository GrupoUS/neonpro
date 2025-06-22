// Templates de mensagens WhatsApp Business
// Estes templates devem ser aprovados pelo WhatsApp Business antes do uso em produção

export const whatsappTemplates = {
  // Template de confirmação de agendamento
  appointment_confirmation: {
    name: 'appointment_confirmation',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '✅ Agendamento Confirmado'
      },
      {
        type: 'BODY',
        text: 'Olá {{1}}! 👋\n\nSeu agendamento foi confirmado com sucesso:\n\n🔹 Serviço: {{2}}\n📅 Data: {{3}}\n⏰ Horário: {{4}}\n\nNos vemos em breve! 💆‍♀️✨'
      },
      {
        type: 'FOOTER',
        text: 'NeonPro - Sua clínica de estética'
      }
    ]
  },

  // Template de lembrete de agendamento
  appointment_reminder: {
    name: 'appointment_reminder',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '⏰ Lembrete de Agendamento'
      },
      {
        type: 'BODY',
        text: 'Oi {{1}}! 😊\n\nEste é um lembrete do seu agendamento:\n\n🔹 Serviço: {{2}}\n📅 Data: {{3}}\n⏰ Horário: {{4}}\n\nTe esperamos! Se precisar reagendar, entre em contato conosco. 💕'
      },
      {
        type: 'FOOTER',
        text: 'NeonPro - Sua clínica de estética'
      }
    ]
  },

  // Template de mensagem promocional
  promotional_message: {
    name: 'promotional_message',
    language: 'pt_BR',
    category: 'MARKETING',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '🎉 Oferta Especial para Você!'
      },
      {
        type: 'BODY',
        text: 'Olá {{1}}! ✨\n\nTemos uma oferta especial pensada especialmente para você:\n\n{{2}}\n\nNão perca essa oportunidade! Entre em contato conosco para agendar. 📞'
      },
      {
        type: 'FOOTER',
        text: 'NeonPro - Sua clínica de estética'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'PHONE_NUMBER',
            text: 'Ligar Agora',
            phone_number: '+5511999999999'
          },
          {
            type: 'URL',
            text: 'Agendar Online',
            url: 'https://neonpro.com/agendar'
          }
        ]
      }
    ]
  },

  // Template de cancelamento de agendamento
  appointment_cancellation: {
    name: 'appointment_cancellation',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '❌ Agendamento Cancelado'
      },
      {
        type: 'BODY',
        text: 'Olá {{1}}! 😔\n\nInfelizmente precisamos cancelar seu agendamento:\n\n🔹 Serviço: {{2}}\n📅 Data: {{3}}\n⏰ Horário: {{4}}\n\nMotivo: {{5}}\n\nEntre em contato conosco para reagendar. Pedimos desculpas pelo inconveniente! 🙏'
      },
      {
        type: 'FOOTER',
        text: 'NeonPro - Sua clínica de estética'
      }
    ]
  },

  // Template de boas-vindas para novos clientes
  welcome_message: {
    name: 'welcome_message',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '🌟 Bem-vinda à NeonPro!'
      },
      {
        type: 'BODY',
        text: 'Olá {{1}}! 👋\n\nSeja muito bem-vinda à NeonPro! 💕\n\nEstamos muito felizes em tê-la como nossa cliente. Nossa equipe está pronta para proporcionar a melhor experiência em cuidados estéticos.\n\n✨ Nossos serviços incluem:\n• Limpeza de pele\n• Massagens relaxantes\n• Tratamentos faciais\n• E muito mais!\n\nAgende seu primeiro atendimento e descubra o que temos de melhor para você! 🌸'
      },
      {
        type: 'FOOTER',
        text: 'NeonPro - Sua clínica de estética'
      }
    ]
  },

  // Template de aniversário
  birthday_message: {
    name: 'birthday_message',
    language: 'pt_BR',
    category: 'MARKETING',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '🎂 Feliz Aniversário!'
      },
      {
        type: 'BODY',
        text: 'Parabéns, {{1}}! 🎉\n\nHoje é um dia muito especial e queremos celebrar com você! 🥳\n\nComo presente de aniversário, temos um desconto especial de {{2}} em qualquer um dos nossos serviços!\n\nVenha se mimar e celebrar seu dia conosco! 💆‍♀️✨\n\nOferta válida até {{3}}.'
      },
      {
        type: 'FOOTER',
        text: 'NeonPro - Sua clínica de estética'
      }
    ]
  }
};

// Função para gerar o JSON dos templates para submissão ao WhatsApp Business
export function generateTemplateSubmission(templateName: keyof typeof whatsappTemplates) {
  const template = whatsappTemplates[templateName];
  
  return {
    name: template.name,
    language: template.language,
    category: template.category,
    components: template.components
  };
}

// Função para listar todos os templates
export function getAllTemplates() {
  return Object.keys(whatsappTemplates);
}

// Função para obter um template específico
export function getTemplate(templateName: keyof typeof whatsappTemplates) {
  return whatsappTemplates[templateName];
}

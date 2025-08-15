// Portuguese (Brazil) Localization Constants
// Story 1.3, Task 2: PT-BR localization for patient portal
// Created: Complete Portuguese localization for healthcare portal

export const ptBR = {
  // Navigation
  navigation: {
    home: 'Início',
    appointments: 'Agendamentos',
    history: 'Histórico',
    payments: 'Pagamentos',
    profile: 'Perfil',
    contact: 'Contato',
    help: 'Ajuda',
    logout: 'Sair',
    menu: 'Menu',
    close: 'Fechar',
    openMenu: 'Abrir menu de navegação',
    closeMenu: 'Fechar menu',
  },

  // Navigation descriptions
  navigationDesc: {
    home: 'Visão geral da sua conta',
    appointments: 'Agende e gerencie suas consultas',
    history: 'Histórico de consultas e tratamentos',
    payments: 'Faturas e formas de pagamento',
    profile: 'Dados pessoais e preferências',
    contact: 'Entre em contato com a clínica',
    help: 'Central de ajuda e suporte',
  },

  // Account status
  accountStatus: {
    active: 'Conta Ativa',
    pending_verification: 'Verificação Pendente',
    suspended: 'Conta Suspensa',
    inactive: 'Conta Inativa',
    status: 'Status',
  },

  // Patient Portal
  portal: {
    title: 'Portal do Paciente',
    patient: 'Paciente',
    welcome: 'Bem-vindo(a)',
    overview: 'Visão Geral',
  },

  // Common translations
  common: {
    yes: 'Sim',
    no: 'Não',
    ok: 'OK',
    close: 'Fechar',
    open: 'Abrir',
    next: 'Próximo',
    previous: 'Anterior',
    search: 'Buscar',
    loading: 'Carregando',
    save: 'Salvar',
    cancel: 'Cancelar',
  },

  // Accessibility
  a11y: {
    skipToContent: 'Pular para o conteúdo principal',
    currentPage: 'Página atual',
    loading: 'Carregando conteúdo',
  },

  // Booking wizard translations
  booking: {
    wizard: {
      title: 'Agendar Consulta',
      step: 'Etapa {current} de {total}',
    },
    steps: {
      service: {
        title: 'Escolha o Serviço',
        description: 'Selecione o procedimento desejado',
        subtitle: 'Escolha o serviço que melhor atende suas necessidades',
      },
      professional: {
        title: 'Escolha o Profissional',
        description: 'Selecione o profissional de sua preferência',
      },
      time: {
        title: 'Escolha Data e Horário',
        description: 'Selecione quando deseja ser atendido',
      },
      notes: {
        title: 'Observações',
        description: 'Adicione informações adicionais se necessário',
      },
      confirmation: {
        title: 'Confirmação',
        description: 'Revise e confirme seu agendamento',
      },
    },
    summary: {
      title: 'Resumo do Agendamento',
      service: 'Serviço',
      professional: 'Profissional',
      time: 'Data e Horário',
    },
    service: {
      search: {
        placeholder: 'Buscar serviços...',
      },
      results: '{count} serviços encontrados',
      selected: 'Selecionado',
      select: 'Selecionar',
      evaluation_required: 'Requer Avaliação',
      preparation: 'Preparação',
      post_care: 'Cuidados Pós-Procedimento',
      clear_filters: 'Limpar Filtros',
      no_results: {
        title: 'Nenhum serviço encontrado',
        description: 'Tente ajustar os filtros ou termo de busca',
      },
    },
    categories: {
      all: 'Todos',
      facial: {
        name: 'Facial',
        description: 'Tratamentos para rosto e pescoço',
      },
      corporal: {
        name: 'Corporal',
        description: 'Tratamentos para o corpo',
      },
      capilar: {
        name: 'Capilar',
        description: 'Tratamentos para cabelo e couro cabeludo',
      },
      wellness: {
        name: 'Bem-estar',
        description: 'Tratamentos de relaxamento e wellness',
      },
    },
    errors: {
      incomplete: 'Por favor, complete todas as etapas obrigatórias',
      generic: 'Ocorreu um erro inesperado. Tente novamente',
    },
  },

  // Professional-related translations
  professionals: {
    specialties: {
      dermatologist: 'Dermatologista',
      aesthetician: 'Esteticista',
      cosmetologist: 'Cosmetólogo',
      plastic_surgeon: 'Cirurgião Plástico',
      nutritionist: 'Nutricionista',
      physiotherapist: 'Fisioterapeuta',
    },
    results: '{count} profissionais encontrados',
    selected: 'Selecionado',
    select: 'Selecionar',
    experience: '{years} anos de experiência',
    working_hours: {
      available: 'Disponível {count} dias',
      not_available: 'Horários não informados',
    },
    accepting_patients: 'Aceitando novos pacientes',
    no_results: {
      title: 'Nenhum profissional encontrado',
      description: 'Tente ajustar os filtros ou escolha outro serviço',
    },
    show_all: 'Mostrar Todos',
  },

  // Time slot related translations
  time: {
    select_date: 'Selecione a Data',
    select_time: 'Selecione o Horário',
    select_date_first: 'Primeiro selecione uma data no calendário',
    no_slots_available: 'Nenhum horário disponível para esta data',
    selected_slot: 'Horário Selecionado',
    periods: {
      morning: 'Manhã',
      afternoon: 'Tarde',
      evening: 'Noite',
    },
  },

  // Notes related translations
  notes: {
    subtitle: 'Adicione informações relevantes para seu atendimento (opcional)',
    title: 'Observações do Paciente',
    placeholder: 'Observações adicionais',
    example: 'Ex: Primeira consulta, alergia a medicamentos, etc.',
    optional: 'Campo opcional',
    preparation: 'Instruções de Preparo',
  },

  // Confirmation related translations
  confirmation: {
    subtitle: 'Revise os detalhes do seu agendamento antes de confirmar',
    summary: 'Resumo do Agendamento',
    confirm: 'Confirmar Agendamento',
    edit: 'Editar',
    success: 'Agendamento confirmado com sucesso!',
    error: 'Erro ao confirmar agendamento',
  },
} as const;

export type LocalizationKey = keyof typeof ptBR;
export type TranslationKeys = typeof ptBR;

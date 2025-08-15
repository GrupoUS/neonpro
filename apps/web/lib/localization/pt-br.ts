// PT-BR Localization for NeonPro Healthcare System
// WCAG 2.1 AA compliant translations for accessibility

export interface LocalizationStrings {
  // Navigation
  navigation: {
    skipToMain: string;
    skipToNavigation: string;
    mainNavigation: string;
    breadcrumbs: string;
    previousPage: string;
    nextPage: string;
    goToPage: (page: number) => string;
  };

  // Forms
  forms: {
    required: string;
    optional: string;
    fieldRequired: (field: string) => string;
    fieldOptional: (field: string) => string;
    validationError: string;
    formHasErrors: (count: number) => string;
    pleaseCorrectErrors: string;
    loading: string;
    saving: string;
    saved: string;
    submit: string;
    cancel: string;
    reset: string;
    clear: string;
  };

  // Healthcare specific
  healthcare: {
    patient: string;
    patients: string;
    appointment: string;
    appointments: string;
    consultation: string;
    consultations: string;
    treatment: string;
    treatments: string;
    procedure: string;
    procedures: string;
    diagnosis: string;
    medication: string;
    medications: string;
    allergy: string;
    allergies: string;
    medicalHistory: string;
    vitalSigns: string;
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
  };

  // Status announcements
  status: {
    loading: (context?: string) => string;
    loadingComplete: (context?: string) => string;
    saving: (context?: string) => string;
    saveComplete: (context?: string) => string;
    deleting: (context?: string) => string;
    deleteComplete: (context?: string) => string;
    appointmentScheduled: (patientName?: string) => string;
    appointmentCanceled: (patientName?: string) => string;
    appointmentCompleted: (patientName?: string) => string;
    formSubmitted: string;
    formSubmissionError: string;
    dataUpdated: string;
    dataUpdateError: string;
  };

  // Accessibility
  accessibility: {
    openDialog: (dialogName: string) => string;
    closeDialog: string;
    expandSection: (section: string) => string;
    collapseSection: (section: string) => string;
    sortColumn: (
      column: string,
      direction: 'ascending' | 'descending'
    ) => string;
    filterResults: (count: number) => string;
    searchResults: (count: number, query: string) => string;
    pageOf: (current: number, total: number) => string;
    selectedOption: (option: string) => string;
    menuExpanded: string;
    menuCollapsed: string;
    tabSelected: (tab: string) => string;
  };

  // Error messages
  errors: {
    general: string;
    network: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    serverError: string;
    validationFailed: string;
    requiredField: (field: string) => string;
    invalidEmail: string;
    invalidPhone: string;
    invalidDate: string;
    invalidTime: string;
    passwordTooShort: (minLength: number) => string;
    passwordMismatch: string;
  };

  // Success messages
  success: {
    saved: string;
    updated: string;
    deleted: string;
    created: string;
    sent: string;
    scheduled: string;
    canceled: string;
    completed: string;
  };

  // Date and time
  dateTime: {
    today: string;
    tomorrow: string;
    yesterday: string;
    thisWeek: string;
    nextWeek: string;
    lastWeek: string;
    thisMonth: string;
    nextMonth: string;
    lastMonth: string;
    formatDate: (date: Date) => string;
    formatTime: (date: Date) => string;
    formatDateTime: (date: Date) => string;
    relativeTime: (date: Date) => string;
  };

  // Actions
  actions: {
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    confirm: string;
    close: string;
    open: string;
    add: string;
    remove: string;
    search: string;
    filter: string;
    sort: string;
    refresh: string;
    export: string;
    import: string;
    print: string;
    download: string;
    upload: string;
    schedule: string;
    reschedule: string;
    viewDetails: string;
    viewAll: string;
  };
}

export const ptBRStrings: LocalizationStrings = {
  navigation: {
    skipToMain: 'Ir para conteúdo principal',
    skipToNavigation: 'Ir para navegação',
    mainNavigation: 'Navegação principal',
    breadcrumbs: 'Você está aqui',
    previousPage: 'Página anterior',
    nextPage: 'Próxima página',
    goToPage: (page: number) => `Ir para página ${page}`,
  },

  forms: {
    required: 'obrigatório',
    optional: 'opcional',
    fieldRequired: (field: string) => `${field} é obrigatório`,
    fieldOptional: (field: string) => `${field} é opcional`,
    validationError: 'Erro de validação',
    formHasErrors: (count: number) =>
      count === 1
        ? 'O formulário possui 1 erro que precisa ser corrigido'
        : `O formulário possui ${count} erros que precisam ser corrigidos`,
    pleaseCorrectErrors: 'Por favor, corrija os erros abaixo:',
    loading: 'Carregando...',
    saving: 'Salvando...',
    saved: 'Salvo com sucesso',
    submit: 'Enviar',
    cancel: 'Cancelar',
    reset: 'Limpar',
    clear: 'Limpar campos',
  },

  healthcare: {
    patient: 'paciente',
    patients: 'pacientes',
    appointment: 'consulta',
    appointments: 'consultas',
    consultation: 'atendimento',
    consultations: 'atendimentos',
    treatment: 'tratamento',
    treatments: 'tratamentos',
    procedure: 'procedimento',
    procedures: 'procedimentos',
    diagnosis: 'diagnóstico',
    medication: 'medicamento',
    medications: 'medicamentos',
    allergy: 'alergia',
    allergies: 'alergias',
    medicalHistory: 'histórico médico',
    vitalSigns: 'sinais vitais',
    bloodPressure: 'pressão arterial',
    heartRate: 'frequência cardíaca',
    temperature: 'temperatura',
    weight: 'peso',
    height: 'altura',
  },

  status: {
    loading: (context?: string) =>
      context ? `Carregando ${context}...` : 'Carregando...',
    loadingComplete: (context?: string) =>
      context ? `${context} carregado com sucesso` : 'Carregamento concluído',
    saving: (context?: string) =>
      context ? `Salvando ${context}...` : 'Salvando...',
    saveComplete: (context?: string) =>
      context ? `${context} salvo com sucesso` : 'Salvo com sucesso',
    deleting: (context?: string) =>
      context ? `Excluindo ${context}...` : 'Excluindo...',
    deleteComplete: (context?: string) =>
      context ? `${context} excluído com sucesso` : 'Excluído com sucesso',
    appointmentScheduled: (patientName?: string) =>
      patientName
        ? `Consulta agendada para ${patientName}`
        : 'Consulta agendada com sucesso',
    appointmentCanceled: (patientName?: string) =>
      patientName
        ? `Consulta cancelada para ${patientName}`
        : 'Consulta cancelada',
    appointmentCompleted: (patientName?: string) =>
      patientName
        ? `Consulta concluída para ${patientName}`
        : 'Consulta concluída',
    formSubmitted: 'Formulário enviado com sucesso',
    formSubmissionError: 'Erro ao enviar formulário',
    dataUpdated: 'Dados atualizados com sucesso',
    dataUpdateError: 'Erro ao atualizar dados',
  },

  accessibility: {
    openDialog: (dialogName: string) => `Abrir diálogo: ${dialogName}`,
    closeDialog: 'Fechar diálogo',
    expandSection: (section: string) => `Expandir seção: ${section}`,
    collapseSection: (section: string) => `Recolher seção: ${section}`,
    sortColumn: (column: string, direction: 'ascending' | 'descending') =>
      `Ordenar coluna ${column} em ordem ${direction === 'ascending' ? 'crescente' : 'decrescente'}`,
    filterResults: (count: number) =>
      count === 0
        ? 'Nenhum resultado encontrado'
        : count === 1
          ? '1 resultado encontrado'
          : `${count} resultados encontrados`,
    searchResults: (count: number, query: string) =>
      count === 0
        ? `Nenhum resultado encontrado para "${query}"`
        : count === 1
          ? `1 resultado encontrado para "${query}"`
          : `${count} resultados encontrados para "${query}"`,
    pageOf: (current: number, total: number) => `Página ${current} de ${total}`,
    selectedOption: (option: string) => `Opção selecionada: ${option}`,
    menuExpanded: 'Menu expandido',
    menuCollapsed: 'Menu recolhido',
    tabSelected: (tab: string) => `Aba selecionada: ${tab}`,
  },

  errors: {
    general: 'Ocorreu um erro. Tente novamente.',
    network: 'Erro de conexão. Verifique sua internet.',
    unauthorized: 'Acesso não autorizado. Faça login novamente.',
    forbidden: 'Você não tem permissão para esta ação.',
    notFound: 'Recurso não encontrado.',
    serverError: 'Erro interno do servidor. Tente mais tarde.',
    validationFailed: 'Dados inválidos. Verifique os campos.',
    requiredField: (field: string) => `O campo ${field} é obrigatório`,
    invalidEmail: 'Digite um e-mail válido',
    invalidPhone: 'Digite um telefone válido',
    invalidDate: 'Digite uma data válida',
    invalidTime: 'Digite um horário válido',
    passwordTooShort: (minLength: number) =>
      `A senha deve ter pelo menos ${minLength} caracteres`,
    passwordMismatch: 'As senhas não coincidem',
  },

  success: {
    saved: 'Salvo com sucesso',
    updated: 'Atualizado com sucesso',
    deleted: 'Excluído com sucesso',
    created: 'Criado com sucesso',
    sent: 'Enviado com sucesso',
    scheduled: 'Agendado com sucesso',
    canceled: 'Cancelado com sucesso',
    completed: 'Concluído com sucesso',
  },

  dateTime: {
    today: 'hoje',
    tomorrow: 'amanhã',
    yesterday: 'ontem',
    thisWeek: 'esta semana',
    nextWeek: 'próxima semana',
    lastWeek: 'semana passada',
    thisMonth: 'este mês',
    nextMonth: 'próximo mês',
    lastMonth: 'mês passado',
    formatDate: (date: Date) => date.toLocaleDateString('pt-BR'),
    formatTime: (date: Date) =>
      date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    formatDateTime: (date: Date) => date.toLocaleString('pt-BR'),
    relativeTime: (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return 'hoje';
      }
      if (days === 1) {
        return 'ontem';
      }
      if (days === -1) {
        return 'amanhã';
      }
      if (days > 1) {
        return `há ${days} dias`;
      }
      if (days < -1) {
        return `em ${Math.abs(days)} dias`;
      }
      return date.toLocaleDateString('pt-BR');
    },
  },

  actions: {
    edit: 'editar',
    delete: 'excluir',
    save: 'salvar',
    cancel: 'cancelar',
    confirm: 'confirmar',
    close: 'fechar',
    open: 'abrir',
    add: 'adicionar',
    remove: 'remover',
    search: 'pesquisar',
    filter: 'filtrar',
    sort: 'ordenar',
    refresh: 'atualizar',
    export: 'exportar',
    import: 'importar',
    print: 'imprimir',
    download: 'baixar',
    upload: 'enviar',
    schedule: 'agendar',
    reschedule: 'reagendar',
    viewDetails: 'ver detalhes',
    viewAll: 'ver todos',
  },
};

// Helper function to format healthcare-specific messages
export function formatHealthcareMessage(
  type: 'appointment' | 'patient' | 'treatment' | 'medication',
  action: 'created' | 'updated' | 'deleted' | 'scheduled' | 'completed',
  name?: string
): string {
  const typeMap = {
    appointment: 'consulta',
    patient: 'paciente',
    treatment: 'tratamento',
    medication: 'medicamento',
  };

  const actionMap = {
    created: 'criado',
    updated: 'atualizado',
    deleted: 'excluído',
    scheduled: 'agendado',
    completed: 'concluído',
  };

  const typeStr = typeMap[type];
  const actionStr = actionMap[action];

  if (name) {
    return `${typeStr} ${actionStr} para ${name}`;
  }

  return `${typeStr} ${actionStr} com sucesso`;
}

// ARIA labels for healthcare contexts
export const healthcareAriaLabels = {
  patientCard: (patientName: string) => `Cartão do paciente ${patientName}`,
  appointmentCard: (patientName: string, date: string, time: string) =>
    `Consulta de ${patientName} em ${date} às ${time}`,
  treatmentPlan: (patientName: string) =>
    `Plano de tratamento de ${patientName}`,
  medicalHistory: (patientName: string) => `Histórico médico de ${patientName}`,
  vitalSigns: (patientName: string) => `Sinais vitais de ${patientName}`,
  prescriptionList: (patientName: string) =>
    `Lista de prescrições de ${patientName}`,
  allergyList: (patientName: string) => `Lista de alergias de ${patientName}`,
  appointmentStatus: (status: string) => `Status da consulta: ${status}`,
  patientStatus: (status: string) => `Status do paciente: ${status}`,
  urgencyLevel: (level: string) => `Nível de urgência: ${level}`,
};

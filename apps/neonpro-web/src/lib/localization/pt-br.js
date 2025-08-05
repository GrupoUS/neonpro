// PT-BR Localization for NeonPro Healthcare System
// WCAG 2.1 AA compliant translations for accessibility
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthcareAriaLabels = exports.ptBRStrings = void 0;
exports.formatHealthcareMessage = formatHealthcareMessage;
exports.ptBRStrings = {
  navigation: {
    skipToMain: "Ir para conteúdo principal",
    skipToNavigation: "Ir para navegação",
    mainNavigation: "Navegação principal",
    breadcrumbs: "Você está aqui",
    previousPage: "Página anterior",
    nextPage: "Próxima página",
    goToPage: (page) => "Ir para p\u00E1gina ".concat(page),
  },
  forms: {
    required: "obrigatório",
    optional: "opcional",
    fieldRequired: (field) => "".concat(field, " \u00E9 obrigat\u00F3rio"),
    fieldOptional: (field) => "".concat(field, " \u00E9 opcional"),
    validationError: "Erro de validação",
    formHasErrors: (count) =>
      count === 1
        ? "O formulário possui 1 erro que precisa ser corrigido"
        : "O formul\u00E1rio possui ".concat(count, " erros que precisam ser corrigidos"),
    pleaseCorrectErrors: "Por favor, corrija os erros abaixo:",
    loading: "Carregando...",
    saving: "Salvando...",
    saved: "Salvo com sucesso",
    submit: "Enviar",
    cancel: "Cancelar",
    reset: "Limpar",
    clear: "Limpar campos",
  },
  healthcare: {
    patient: "paciente",
    patients: "pacientes",
    appointment: "consulta",
    appointments: "consultas",
    consultation: "atendimento",
    consultations: "atendimentos",
    treatment: "tratamento",
    treatments: "tratamentos",
    procedure: "procedimento",
    procedures: "procedimentos",
    diagnosis: "diagnóstico",
    medication: "medicamento",
    medications: "medicamentos",
    allergy: "alergia",
    allergies: "alergias",
    medicalHistory: "histórico médico",
    vitalSigns: "sinais vitais",
    bloodPressure: "pressão arterial",
    heartRate: "frequência cardíaca",
    temperature: "temperatura",
    weight: "peso",
    height: "altura",
  },
  status: {
    loading: (context) => (context ? "Carregando ".concat(context, "...") : "Carregando..."),
    loadingComplete: (context) =>
      context ? "".concat(context, " carregado com sucesso") : "Carregamento concluído",
    saving: (context) => (context ? "Salvando ".concat(context, "...") : "Salvando..."),
    saveComplete: (context) =>
      context ? "".concat(context, " salvo com sucesso") : "Salvo com sucesso",
    deleting: (context) => (context ? "Excluindo ".concat(context, "...") : "Excluindo..."),
    deleteComplete: (context) =>
      context ? "".concat(context, " exclu\u00EDdo com sucesso") : "Excluído com sucesso",
    appointmentScheduled: (patientName) =>
      patientName ? "Consulta agendada para ".concat(patientName) : "Consulta agendada com sucesso",
    appointmentCanceled: (patientName) =>
      patientName ? "Consulta cancelada para ".concat(patientName) : "Consulta cancelada",
    appointmentCompleted: (patientName) =>
      patientName ? "Consulta conclu\u00EDda para ".concat(patientName) : "Consulta concluída",
    formSubmitted: "Formulário enviado com sucesso",
    formSubmissionError: "Erro ao enviar formulário",
    dataUpdated: "Dados atualizados com sucesso",
    dataUpdateError: "Erro ao atualizar dados",
  },
  accessibility: {
    openDialog: (dialogName) => "Abrir di\u00E1logo: ".concat(dialogName),
    closeDialog: "Fechar diálogo",
    expandSection: (section) => "Expandir se\u00E7\u00E3o: ".concat(section),
    collapseSection: (section) => "Recolher se\u00E7\u00E3o: ".concat(section),
    sortColumn: (column, direction) =>
      "Ordenar coluna "
        .concat(column, " em ordem ")
        .concat(direction === "ascending" ? "crescente" : "decrescente"),
    filterResults: (count) =>
      count === 0
        ? "Nenhum resultado encontrado"
        : count === 1
          ? "1 resultado encontrado"
          : "".concat(count, " resultados encontrados"),
    searchResults: (count, query) =>
      count === 0
        ? 'Nenhum resultado encontrado para "'.concat(query, '"')
        : count === 1
          ? '1 resultado encontrado para "'.concat(query, '"')
          : "".concat(count, ' resultados encontrados para "').concat(query, '"'),
    pageOf: (current, total) => "P\u00E1gina ".concat(current, " de ").concat(total),
    selectedOption: (option) => "Op\u00E7\u00E3o selecionada: ".concat(option),
    menuExpanded: "Menu expandido",
    menuCollapsed: "Menu recolhido",
    tabSelected: (tab) => "Aba selecionada: ".concat(tab),
  },
  errors: {
    general: "Ocorreu um erro. Tente novamente.",
    network: "Erro de conexão. Verifique sua internet.",
    unauthorized: "Acesso não autorizado. Faça login novamente.",
    forbidden: "Você não tem permissão para esta ação.",
    notFound: "Recurso não encontrado.",
    serverError: "Erro interno do servidor. Tente mais tarde.",
    validationFailed: "Dados inválidos. Verifique os campos.",
    requiredField: (field) => "O campo ".concat(field, " \u00E9 obrigat\u00F3rio"),
    invalidEmail: "Digite um e-mail válido",
    invalidPhone: "Digite um telefone válido",
    invalidDate: "Digite uma data válida",
    invalidTime: "Digite um horário válido",
    passwordTooShort: (minLength) =>
      "A senha deve ter pelo menos ".concat(minLength, " caracteres"),
    passwordMismatch: "As senhas não coincidem",
  },
  success: {
    saved: "Salvo com sucesso",
    updated: "Atualizado com sucesso",
    deleted: "Excluído com sucesso",
    created: "Criado com sucesso",
    sent: "Enviado com sucesso",
    scheduled: "Agendado com sucesso",
    canceled: "Cancelado com sucesso",
    completed: "Concluído com sucesso",
  },
  dateTime: {
    today: "hoje",
    tomorrow: "amanhã",
    yesterday: "ontem",
    thisWeek: "esta semana",
    nextWeek: "próxima semana",
    lastWeek: "semana passada",
    thisMonth: "este mês",
    nextMonth: "próximo mês",
    lastMonth: "mês passado",
    formatDate: (date) => date.toLocaleDateString("pt-BR"),
    formatTime: (date) =>
      date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    formatDateTime: (date) => date.toLocaleString("pt-BR"),
    relativeTime: (date) => {
      var now = new Date();
      var diff = now.getTime() - date.getTime();
      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return "hoje";
      if (days === 1) return "ontem";
      if (days === -1) return "amanhã";
      if (days > 1) return "h\u00E1 ".concat(days, " dias");
      if (days < -1) return "em ".concat(Math.abs(days), " dias");
      return date.toLocaleDateString("pt-BR");
    },
  },
  actions: {
    edit: "editar",
    delete: "excluir",
    save: "salvar",
    cancel: "cancelar",
    confirm: "confirmar",
    close: "fechar",
    open: "abrir",
    add: "adicionar",
    remove: "remover",
    search: "pesquisar",
    filter: "filtrar",
    sort: "ordenar",
    refresh: "atualizar",
    export: "exportar",
    import: "importar",
    print: "imprimir",
    download: "baixar",
    upload: "enviar",
    schedule: "agendar",
    reschedule: "reagendar",
    viewDetails: "ver detalhes",
    viewAll: "ver todos",
  },
};
// Helper function to format healthcare-specific messages
function formatHealthcareMessage(type, action, name) {
  var typeMap = {
    appointment: "consulta",
    patient: "paciente",
    treatment: "tratamento",
    medication: "medicamento",
  };
  var actionMap = {
    created: "criado",
    updated: "atualizado",
    deleted: "excluído",
    scheduled: "agendado",
    completed: "concluído",
  };
  var typeStr = typeMap[type];
  var actionStr = actionMap[action];
  if (name) {
    return "".concat(typeStr, " ").concat(actionStr, " para ").concat(name);
  }
  return "".concat(typeStr, " ").concat(actionStr, " com sucesso");
}
// ARIA labels for healthcare contexts
exports.healthcareAriaLabels = {
  patientCard: (patientName) => "Cart\u00E3o do paciente ".concat(patientName),
  appointmentCard: (patientName, date, time) =>
    "Consulta de ".concat(patientName, " em ").concat(date, " \u00E0s ").concat(time),
  treatmentPlan: (patientName) => "Plano de tratamento de ".concat(patientName),
  medicalHistory: (patientName) => "Hist\u00F3rico m\u00E9dico de ".concat(patientName),
  vitalSigns: (patientName) => "Sinais vitais de ".concat(patientName),
  prescriptionList: (patientName) => "Lista de prescri\u00E7\u00F5es de ".concat(patientName),
  allergyList: (patientName) => "Lista de alergias de ".concat(patientName),
  appointmentStatus: (status) => "Status da consulta: ".concat(status),
  patientStatus: (status) => "Status do paciente: ".concat(status),
  urgencyLevel: (level) => "N\u00EDvel de urg\u00EAncia: ".concat(level),
};

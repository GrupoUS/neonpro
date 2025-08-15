/**
 * NeonPro - Internationalization (i18n) System
 * Next.js 15 App Router compatible i18n with PT-BR healthcare localization
 *
 * Features:
 * - Server-side dictionary loading
 * - Healthcare-specific translations
 * - Brazilian cultural adaptations
 * - Accessibility-aware translations
 * - Type-safe translation keys
 */

export type Locale = 'pt-BR' | 'en-US';

// Supported locales configuration
export const locales: Locale[] = ['pt-BR', 'en-US'];
export const defaultLocale: Locale = 'pt-BR';

// Dictionary type definitions for type safety
export interface Dictionary {
  // Common UI elements
  common: {
    loading: string;
    saving: string;
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    confirm: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    clear: string;
    select: string;
    required: string;
    optional: string;
    yes: string;
    no: string;
    unknown: string;
    notAvailable: string;
    noData: string;
    loadMore: string;
  };

  // Authentication & User Management
  auth: {
    login: string;
    logout: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    resetPassword: string;
    rememberMe: string;
    loginFailed: string;
    registrationSuccess: string;
    passwordResetSent: string;
    invalidCredentials: string;
    accountLocked: string;
    sessionExpired: string;
    welcomeBack: string;
    firstTimeLogin: string;
  };

  // Patient Management
  patients: {
    patient: string;
    patients: string;
    newPatient: string;
    patientProfile: string;
    personalInfo: string;
    contactInfo: string;
    medicalHistory: string;
    appointments: string;
    treatments: string;
    notes: string;
    status: string;
    active: string;
    inactive: string;
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    male: string;
    female: string;
    other: string;
    phone: string;
    mobile: string;
    landline: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    cpf: string;
    rg: string;
    maritalStatus: string;
    occupation: string;
    emergencyContact: string;
    relationship: string;
    allergies: string;
    medications: string;
    medicalConditions: string;
    insuranceProvider: string;
    insuranceNumber: string;
  };

  // Appointments
  appointments: {
    appointment: string;
    appointments: string;
    newAppointment: string;
    bookAppointment: string;
    scheduleAppointment: string;
    rescheduleAppointment: string;
    cancelAppointment: string;
    appointmentDetails: string;
    date: string;
    time: string;
    datetime: string;
    duration: string;
    service: string;
    provider: string;
    professional: string;
    clinic: string;
    room: string;
    status: string;
    scheduled: string;
    confirmed: string;
    inProgress: string;
    completed: string;
    cancelled: string;
    noShow: string;
    rescheduled: string;
    upcomingAppointments: string;
    pastAppointments: string;
    todayAppointments: string;
    availableSlots: string;
    noAvailableSlots: string;
    selectTimeSlot: string;
    appointmentNotes: string;
    patientNotes: string;
    clinicNotes: string;
    reason: string;
    symptoms: string;
    followUp: string;
    treatment: string;
    prescription: string;
    nextAppointment: string;
    reminder: string;
    confirmationSent: string;
    reminderSent: string;
  };

  // Services
  services: {
    service: string;
    services: string;
    category: string;
    categories: string;
    consultation: string;
    treatment: string;
    procedure: string;
    checkup: string;
    followUp: string;
    emergency: string;
    aesthetic: string;
    dermatology: string;
    cosmetology: string;
    laser: string;
    botox: string;
    filler: string;
    peeling: string;
    hydrafacial: string;
    cleaning: string;
    skinCare: string;
    antiAging: string;
    acne: string;
    pigmentation: string;
    rejuvenation: string;
    bodyTreatment: string;
    facialTreatment: string;
    specialtyServices: string;
    duration: string;
    price: string;
    description: string;
    benefits: string;
    contraindications: string;
    afterCare: string;
  };

  // Professionals
  professionals: {
    professional: string;
    professionals: string;
    doctor: string;
    dermatologist: string;
    aesthetician: string;
    nurse: string;
    therapist: string;
    coordinator: string;
    assistant: string;
    specialist: string;
    name: string;
    specialty: string;
    specialties: string;
    qualification: string;
    experience: string;
    bio: string;
    availability: string;
    schedule: string;
    rating: string;
    reviews: string;
    certifications: string;
    languages: string;
    contact: string;
  };

  // Scheduling
  scheduling: {
    schedule: string;
    calendar: string;
    availability: string;
    timeSlot: string;
    timeSlots: string;
    workingHours: string;
    breakTime: string;
    lunch: string;
    unavailable: string;
    holiday: string;
    vacation: string;
    sickLeave: string;
    personalTime: string;
    blocked: string;
    reserved: string;
    booked: string;
    free: string;
    busy: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    today: string;
    tomorrow: string;
    thisWeek: string;
    nextWeek: string;
    thisMonth: string;
    nextMonth: string;
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };

  // Financial
  financial: {
    payment: string;
    billing: string;
    invoice: string;
    receipt: string;
    amount: string;
    total: string;
    subtotal: string;
    discount: string;
    tax: string;
    paid: string;
    pending: string;
    overdue: string;
    refund: string;
    cash: string;
    card: string;
    creditCard: string;
    debitCard: string;
    pix: string;
    bankTransfer: string;
    installments: string;
    paymentMethod: string;
    paymentStatus: string;
    paymentDate: string;
    dueDate: string;
    insurance: string;
    privatePayment: string;
    packageDeal: string;
    membership: string;
  };

  // Notifications
  notifications: {
    notification: string;
    notifications: string;
    alert: string;
    reminder: string;
    message: string;
    email: string;
    sms: string;
    whatsapp: string;
    push: string;
    appointmentReminder: string;
    appointmentConfirmation: string;
    appointmentCancellation: string;
    paymentReminder: string;
    promotionalMessage: string;
    systemUpdate: string;
    emergencyAlert: string;
    preferences: string;
    frequency: string;
    channels: string;
    doNotDisturb: string;
    unsubscribe: string;
  };

  // Reports & Analytics
  reports: {
    report: string;
    reports: string;
    analytics: string;
    dashboard: string;
    overview: string;
    summary: string;
    statistics: string;
    metrics: string;
    kpi: string;
    performance: string;
    revenue: string;
    patients: string;
    appointments: string;
    services: string;
    professionals: string;
    trends: string;
    comparison: string;
    period: string;
    dateRange: string;
    filter: string;
    export: string;
    print: string;
    share: string;
    download: string;
  };

  // Settings
  settings: {
    settings: string;
    preferences: string;
    configuration: string;
    profile: string;
    account: string;
    security: string;
    privacy: string;
    notifications: string;
    appearance: string;
    language: string;
    theme: string;
    darkMode: string;
    lightMode: string;
    systemMode: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    currency: string;
    units: string;
    accessibility: string;
    backup: string;
    sync: string;
    import: string;
    export: string;
  };

  // Accessibility
  accessibility: {
    skipToContent: string;
    skipToNavigation: string;
    skipToSearch: string;
    screenReaderOnly: string;
    keyboardNavigation: string;
    highContrast: string;
    largeText: string;
    reduceMotion: string;
    focusIndicator: string;
    alternativeText: string;
    clickToExpand: string;
    clickToCollapse: string;
    openInNewWindow: string;
    downloadFile: string;
    playAudio: string;
    pauseAudio: string;
    playVideo: string;
    pauseVideo: string;
    fullScreen: string;
    exitFullScreen: string;
  };

  // Error Messages
  errors: {
    generalError: string;
    networkError: string;
    serverError: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    sessionExpired: string;
    validationError: string;
    requiredField: string;
    invalidFormat: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidCpf: string;
    invalidDate: string;
    dateInPast: string;
    dateInFuture: string;
    timeConflict: string;
    slotUnavailable: string;
    bookingFailed: string;
    cancellationFailed: string;
    paymentFailed: string;
    uploadFailed: string;
    downloadFailed: string;
    saveFailed: string;
    loadFailed: string;
    deleteConfirmation: string;
    unsavedChanges: string;
  };

  // Success Messages
  success: {
    saved: string;
    deleted: string;
    updated: string;
    created: string;
    sent: string;
    uploaded: string;
    downloaded: string;
    completed: string;
    confirmed: string;
    cancelled: string;
    rescheduled: string;
    paymentReceived: string;
    appointmentBooked: string;
    appointmentConfirmed: string;
    reminderSent: string;
    profileUpdated: string;
    passwordChanged: string;
    settingsSaved: string;
    backupCreated: string;
    dataExported: string;
    syncCompleted: string;
  };

  // LGPD & Privacy
  lgpd: {
    dataProtection: string;
    privacyPolicy: string;
    termsOfService: string;
    consent: string;
    dataProcessing: string;
    dataRetention: string;
    dataPortability: string;
    rightToErasure: string;
    rightToCorrection: string;
    dataController: string;
    legalBasis: string;
    sensitiveData: string;
    healthData: string;
    consentGiven: string;
    consentRevoked: string;
    dataSubjectRights: string;
    contactDpo: string;
    dataProcessingPurpose: string;
    retentionPeriod: string;
    thirdPartyProcessing: string;
    emergencyContacts: string;
    explicitConsent: string;
    optionalData: string;
    mandatoryData: string;
  };
}

// Brazilian Portuguese dictionary
const ptBRDictionary: Dictionary = {
  common: {
    loading: 'Carregando',
    saving: 'Salvando',
    save: 'Salvar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Excluir',
    confirm: 'Confirmar',
    success: 'Sucesso',
    error: 'Erro',
    warning: 'Aviso',
    info: 'Informação',
    close: 'Fechar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpar',
    select: 'Selecionar',
    required: 'Obrigatório',
    optional: 'Opcional',
    yes: 'Sim',
    no: 'Não',
    unknown: 'Desconhecido',
    notAvailable: 'Não disponível',
    noData: 'Nenhum dado encontrado',
    loadMore: 'Carregar mais',
  },

  auth: {
    login: 'Entrar',
    logout: 'Sair',
    register: 'Cadastrar',
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar senha',
    forgotPassword: 'Esqueci minha senha',
    resetPassword: 'Redefinir senha',
    rememberMe: 'Lembrar-me',
    loginFailed: 'Falha no login',
    registrationSuccess: 'Cadastro realizado com sucesso',
    passwordResetSent: 'E-mail de redefinição enviado',
    invalidCredentials: 'Credenciais inválidas',
    accountLocked: 'Conta bloqueada',
    sessionExpired: 'Sessão expirada',
    welcomeBack: 'Bem-vindo de volta',
    firstTimeLogin: 'Primeiro acesso',
  },

  patients: {
    patient: 'Paciente',
    patients: 'Pacientes',
    newPatient: 'Novo paciente',
    patientProfile: 'Perfil do paciente',
    personalInfo: 'Informações pessoais',
    contactInfo: 'Informações de contato',
    medicalHistory: 'Histórico médico',
    appointments: 'Consultas',
    treatments: 'Tratamentos',
    notes: 'Observações',
    status: 'Status',
    active: 'Ativo',
    inactive: 'Inativo',
    firstName: 'Nome',
    lastName: 'Sobrenome',
    fullName: 'Nome completo',
    dateOfBirth: 'Data de nascimento',
    gender: 'Sexo',
    male: 'Masculino',
    female: 'Feminino',
    other: 'Outro',
    phone: 'Telefone',
    mobile: 'Celular',
    landline: 'Fixo',
    address: 'Endereço',
    city: 'Cidade',
    state: 'Estado',
    postalCode: 'CEP',
    country: 'País',
    cpf: 'CPF',
    rg: 'RG',
    maritalStatus: 'Estado civil',
    occupation: 'Profissão',
    emergencyContact: 'Contato de emergência',
    relationship: 'Parentesco',
    allergies: 'Alergias',
    medications: 'Medicamentos',
    medicalConditions: 'Condições médicas',
    insuranceProvider: 'Convênio',
    insuranceNumber: 'Número do convênio',
  },

  appointments: {
    appointment: 'Consulta',
    appointments: 'Consultas',
    newAppointment: 'Nova consulta',
    bookAppointment: 'Agendar consulta',
    scheduleAppointment: 'Agendar consulta',
    rescheduleAppointment: 'Reagendar consulta',
    cancelAppointment: 'Cancelar consulta',
    appointmentDetails: 'Detalhes da consulta',
    date: 'Data',
    time: 'Hora',
    datetime: 'Data e hora',
    duration: 'Duração',
    service: 'Serviço',
    provider: 'Prestador',
    professional: 'Profissional',
    clinic: 'Clínica',
    room: 'Sala',
    status: 'Status',
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    inProgress: 'Em andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    noShow: 'Faltou',
    rescheduled: 'Reagendado',
    upcomingAppointments: 'Próximas consultas',
    pastAppointments: 'Consultas passadas',
    todayAppointments: 'Consultas de hoje',
    availableSlots: 'Horários disponíveis',
    noAvailableSlots: 'Sem horários disponíveis',
    selectTimeSlot: 'Selecione um horário',
    appointmentNotes: 'Observações da consulta',
    patientNotes: 'Observações do paciente',
    clinicNotes: 'Observações da clínica',
    reason: 'Motivo',
    symptoms: 'Sintomas',
    followUp: 'Retorno',
    treatment: 'Tratamento',
    prescription: 'Prescrição',
    nextAppointment: 'Próxima consulta',
    reminder: 'Lembrete',
    confirmationSent: 'Confirmação enviada',
    reminderSent: 'Lembrete enviado',
  },

  services: {
    service: 'Serviço',
    services: 'Serviços',
    category: 'Categoria',
    categories: 'Categorias',
    consultation: 'Consulta',
    treatment: 'Tratamento',
    procedure: 'Procedimento',
    checkup: 'Check-up',
    followUp: 'Retorno',
    emergency: 'Emergência',
    aesthetic: 'Estética',
    dermatology: 'Dermatologia',
    cosmetology: 'Cosmetologia',
    laser: 'Laser',
    botox: 'Botox',
    filler: 'Preenchimento',
    peeling: 'Peeling',
    hydrafacial: 'Hydrafacial',
    cleaning: 'Limpeza',
    skinCare: 'Cuidados com a pele',
    antiAging: 'Anti-idade',
    acne: 'Acne',
    pigmentation: 'Pigmentação',
    rejuvenation: 'Rejuvenescimento',
    bodyTreatment: 'Tratamento corporal',
    facialTreatment: 'Tratamento facial',
    specialtyServices: 'Serviços especializados',
    duration: 'Duração',
    price: 'Preço',
    description: 'Descrição',
    benefits: 'Benefícios',
    contraindications: 'Contraindicações',
    afterCare: 'Cuidados pós-tratamento',
  },

  professionals: {
    professional: 'Profissional',
    professionals: 'Profissionais',
    doctor: 'Médico',
    dermatologist: 'Dermatologista',
    aesthetician: 'Esteticista',
    nurse: 'Enfermeiro',
    therapist: 'Terapeuta',
    coordinator: 'Coordenador',
    assistant: 'Assistente',
    specialist: 'Especialista',
    name: 'Nome',
    specialty: 'Especialidade',
    specialties: 'Especialidades',
    qualification: 'Qualificação',
    experience: 'Experiência',
    bio: 'Biografia',
    availability: 'Disponibilidade',
    schedule: 'Agenda',
    rating: 'Avaliação',
    reviews: 'Avaliações',
    certifications: 'Certificações',
    languages: 'Idiomas',
    contact: 'Contato',
  },

  scheduling: {
    schedule: 'Agenda',
    calendar: 'Calendário',
    availability: 'Disponibilidade',
    timeSlot: 'Horário',
    timeSlots: 'Horários',
    workingHours: 'Horário de trabalho',
    breakTime: 'Intervalo',
    lunch: 'Almoço',
    unavailable: 'Indisponível',
    holiday: 'Feriado',
    vacation: 'Férias',
    sickLeave: 'Licença médica',
    personalTime: 'Tempo pessoal',
    blocked: 'Bloqueado',
    reserved: 'Reservado',
    booked: 'Agendado',
    free: 'Livre',
    busy: 'Ocupado',
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo',
    today: 'Hoje',
    tomorrow: 'Amanhã',
    thisWeek: 'Esta semana',
    nextWeek: 'Próxima semana',
    thisMonth: 'Este mês',
    nextMonth: 'Próximo mês',
    morning: 'Manhã',
    afternoon: 'Tarde',
    evening: 'Noite',
    night: 'Madrugada',
  },

  financial: {
    payment: 'Pagamento',
    billing: 'Faturamento',
    invoice: 'Fatura',
    receipt: 'Recibo',
    amount: 'Valor',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Desconto',
    tax: 'Imposto',
    paid: 'Pago',
    pending: 'Pendente',
    overdue: 'Vencido',
    refund: 'Reembolso',
    cash: 'Dinheiro',
    card: 'Cartão',
    creditCard: 'Cartão de crédito',
    debitCard: 'Cartão de débito',
    pix: 'PIX',
    bankTransfer: 'Transferência bancária',
    installments: 'Parcelas',
    paymentMethod: 'Forma de pagamento',
    paymentStatus: 'Status do pagamento',
    paymentDate: 'Data do pagamento',
    dueDate: 'Data de vencimento',
    insurance: 'Convênio',
    privatePayment: 'Particular',
    packageDeal: 'Pacote',
    membership: 'Mensalidade',
  },

  notifications: {
    notification: 'Notificação',
    notifications: 'Notificações',
    alert: 'Alerta',
    reminder: 'Lembrete',
    message: 'Mensagem',
    email: 'E-mail',
    sms: 'SMS',
    whatsapp: 'WhatsApp',
    push: 'Push',
    appointmentReminder: 'Lembrete de consulta',
    appointmentConfirmation: 'Confirmação de consulta',
    appointmentCancellation: 'Cancelamento de consulta',
    paymentReminder: 'Lembrete de pagamento',
    promotionalMessage: 'Mensagem promocional',
    systemUpdate: 'Atualização do sistema',
    emergencyAlert: 'Alerta de emergência',
    preferences: 'Preferências',
    frequency: 'Frequência',
    channels: 'Canais',
    doNotDisturb: 'Não perturbe',
    unsubscribe: 'Descadastrar',
  },

  reports: {
    report: 'Relatório',
    reports: 'Relatórios',
    analytics: 'Analytics',
    dashboard: 'Dashboard',
    overview: 'Visão geral',
    summary: 'Resumo',
    statistics: 'Estatísticas',
    metrics: 'Métricas',
    kpi: 'KPI',
    performance: 'Desempenho',
    revenue: 'Faturamento',
    patients: 'Pacientes',
    appointments: 'Consultas',
    services: 'Serviços',
    professionals: 'Profissionais',
    trends: 'Tendências',
    comparison: 'Comparação',
    period: 'Período',
    dateRange: 'Período',
    filter: 'Filtro',
    export: 'Exportar',
    print: 'Imprimir',
    share: 'Compartilhar',
    download: 'Baixar',
  },

  settings: {
    settings: 'Configurações',
    preferences: 'Preferências',
    configuration: 'Configuração',
    profile: 'Perfil',
    account: 'Conta',
    security: 'Segurança',
    privacy: 'Privacidade',
    notifications: 'Notificações',
    appearance: 'Aparência',
    language: 'Idioma',
    theme: 'Tema',
    darkMode: 'Modo escuro',
    lightMode: 'Modo claro',
    systemMode: 'Modo do sistema',
    timezone: 'Fuso horário',
    dateFormat: 'Formato de data',
    timeFormat: 'Formato de hora',
    currency: 'Moeda',
    units: 'Unidades',
    accessibility: 'Acessibilidade',
    backup: 'Backup',
    sync: 'Sincronização',
    import: 'Importar',
    export: 'Exportar',
  },

  accessibility: {
    skipToContent: 'Pular para o conteúdo principal',
    skipToNavigation: 'Pular para a navegação',
    skipToSearch: 'Pular para a busca',
    screenReaderOnly: 'Apenas para leitores de tela',
    keyboardNavigation: 'Navegação por teclado',
    highContrast: 'Alto contraste',
    largeText: 'Texto grande',
    reduceMotion: 'Reduzir movimento',
    focusIndicator: 'Indicador de foco',
    alternativeText: 'Texto alternativo',
    clickToExpand: 'Clique para expandir',
    clickToCollapse: 'Clique para recolher',
    openInNewWindow: 'Abrir em nova janela',
    downloadFile: 'Baixar arquivo',
    playAudio: 'Reproduzir áudio',
    pauseAudio: 'Pausar áudio',
    playVideo: 'Reproduzir vídeo',
    pauseVideo: 'Pausar vídeo',
    fullScreen: 'Tela cheia',
    exitFullScreen: 'Sair da tela cheia',
  },

  errors: {
    generalError: 'Ocorreu um erro inesperado',
    networkError: 'Erro de conexão',
    serverError: 'Erro no servidor',
    notFound: 'Não encontrado',
    unauthorized: 'Não autorizado',
    forbidden: 'Acesso negado',
    sessionExpired: 'Sessão expirada',
    validationError: 'Erro de validação',
    requiredField: 'Campo obrigatório',
    invalidFormat: 'Formato inválido',
    invalidEmail: 'E-mail inválido',
    invalidPhone: 'Telefone inválido',
    invalidCpf: 'CPF inválido',
    invalidDate: 'Data inválida',
    dateInPast: 'Data não pode ser no passado',
    dateInFuture: 'Data não pode ser no futuro',
    timeConflict: 'Conflito de horário',
    slotUnavailable: 'Horário indisponível',
    bookingFailed: 'Falha ao agendar',
    cancellationFailed: 'Falha ao cancelar',
    paymentFailed: 'Falha no pagamento',
    uploadFailed: 'Falha no upload',
    downloadFailed: 'Falha no download',
    saveFailed: 'Falha ao salvar',
    loadFailed: 'Falha ao carregar',
    deleteConfirmation: 'Tem certeza que deseja excluir?',
    unsavedChanges: 'Há alterações não salvas',
  },

  success: {
    saved: 'Salvo com sucesso',
    deleted: 'Excluído com sucesso',
    updated: 'Atualizado com sucesso',
    created: 'Criado com sucesso',
    sent: 'Enviado com sucesso',
    uploaded: 'Upload realizado com sucesso',
    downloaded: 'Download realizado com sucesso',
    completed: 'Concluído com sucesso',
    confirmed: 'Confirmado com sucesso',
    cancelled: 'Cancelado com sucesso',
    rescheduled: 'Reagendado com sucesso',
    paymentReceived: 'Pagamento recebido',
    appointmentBooked: 'Consulta agendada com sucesso',
    appointmentConfirmed: 'Consulta confirmada',
    reminderSent: 'Lembrete enviado',
    profileUpdated: 'Perfil atualizado',
    passwordChanged: 'Senha alterada',
    settingsSaved: 'Configurações salvas',
    backupCreated: 'Backup criado',
    dataExported: 'Dados exportados',
    syncCompleted: 'Sincronização concluída',
  },

  lgpd: {
    dataProtection: 'Proteção de dados',
    privacyPolicy: 'Política de privacidade',
    termsOfService: 'Termos de serviço',
    consent: 'Consentimento',
    dataProcessing: 'Processamento de dados',
    dataRetention: 'Retenção de dados',
    dataPortability: 'Portabilidade de dados',
    rightToErasure: 'Direito ao esquecimento',
    rightToCorrection: 'Direito à correção',
    dataController: 'Controlador de dados',
    legalBasis: 'Base legal',
    sensitiveData: 'Dados sensíveis',
    healthData: 'Dados de saúde',
    consentGiven: 'Consentimento concedido',
    consentRevoked: 'Consentimento revogado',
    dataSubjectRights: 'Direitos do titular',
    contactDpo: 'Contatar encarregado',
    dataProcessingPurpose: 'Finalidade do processamento',
    retentionPeriod: 'Período de retenção',
    thirdPartyProcessing: 'Processamento por terceiros',
    emergencyContacts: 'Contatos de emergência',
    explicitConsent: 'Consentimento explícito',
    optionalData: 'Dados opcionais',
    mandatoryData: 'Dados obrigatórios',
  },
};

// Dictionary cache for performance
const dictionaryCache: Partial<Record<Locale, Dictionary>> = {};

/**
 * Load dictionary for specified locale
 */
export async function getDictionary(
  locale: Locale = defaultLocale
): Promise<Dictionary> {
  // Return cached dictionary if available
  if (dictionaryCache[locale]) {
    return dictionaryCache[locale]!;
  }

  let dictionary: Dictionary;

  switch (locale) {
    case 'pt-BR':
      dictionary = ptBRDictionary;
      break;
    case 'en-US':
      // English dictionary would be loaded here
      // For now, fallback to Portuguese
      dictionary = ptBRDictionary;
      break;
    default:
      dictionary = ptBRDictionary;
  }

  // Cache the dictionary
  dictionaryCache[locale] = dictionary;

  return dictionary;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((curr, key) => curr?.[key], obj) || path;
}

/**
 * Translation function with type safety
 */
export function createTranslator(dictionary: Dictionary) {
  return function t(
    key: string,
    params?: Record<string, string | number>
  ): string {
    let translation = getNestedValue(dictionary, key);

    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, String(value));
      });
    }

    return translation;
  };
}

/**
 * Format currency for Brazilian Real
 */
export function formatCurrency(
  amount: number,
  locale: Locale = 'pt-BR',
  currency = 'BRL'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for Brazilian locale
 */
export function formatDate(
  date: Date,
  locale: Locale = 'pt-BR',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  }).format(date);
}

/**
 * Format time for Brazilian locale
 */
export function formatTime(
  date: Date,
  locale: Locale = 'pt-BR',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  }).format(date);
}

/**
 * Format phone number for Brazilian format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Brazilian mobile: (11) 99999-9999
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  // Brazilian landline: (11) 9999-9999
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone;
}

/**
 * Format CPF for Brazilian format
 */
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  return cpf;
}

/**
 * Format postal code for Brazilian format
 */
export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, '');

  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  return cep;
}

/**
 * Healthcare-specific formatters
 */
export const HealthcareFormatters = {
  /**
   * Format appointment duration in minutes to human-readable format
   */
  appointmentDuration: (minutes: number, _dictionary: Dictionary): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}min`;
  },

  /**
   * Format appointment status with appropriate styling
   */
  appointmentStatus: (status: string, dictionary: Dictionary): string => {
    const statusMap: Record<string, string> = {
      scheduled: dictionary.appointments.scheduled,
      confirmed: dictionary.appointments.confirmed,
      inProgress: dictionary.appointments.inProgress,
      completed: dictionary.appointments.completed,
      cancelled: dictionary.appointments.cancelled,
      noShow: dictionary.appointments.noShow,
      rescheduled: dictionary.appointments.rescheduled,
    };

    return statusMap[status] || status;
  },

  /**
   * Format professional name with title
   */
  professionalName: (
    name: string,
    specialty?: string,
    _dictionary?: Dictionary
  ): string => {
    if (!specialty) {
      return name;
    }

    // Add Dr./Dra. prefix for doctors
    const doctorSpecialties = [
      'dermatologista',
      'médico',
      'doctor',
      'dermatologist',
    ];
    if (
      doctorSpecialties.some((spec) => specialty.toLowerCase().includes(spec))
    ) {
      return `Dr(a). ${name}`;
    }

    return name;
  },
};

// Export all formatters and utilities
export { ptBRDictionary };

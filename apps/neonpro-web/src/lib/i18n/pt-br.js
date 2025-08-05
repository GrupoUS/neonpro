"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ptBRTranslations = exports.ptBRValidationMessages = exports.ptBRDateTimeFormats = exports.ptBRCommonTerms = exports.ptBRActionMessages = exports.ptBRErrorMessages = void 0;
// PT-BR Internationalization for Error Messages
exports.ptBRErrorMessages = {
    // Network Errors
    NETWORK_UNAVAILABLE: {
        title: 'Conexão Indisponível',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
        shortMessage: 'Sem conexão com a internet'
    },
    NETWORK_TIMEOUT: {
        title: 'Tempo Limite Excedido',
        message: 'A operação demorou mais que o esperado. Isso pode indicar lentidão na rede.',
        shortMessage: 'Conexão lenta detectada'
    },
    NETWORK_ERROR: {
        title: 'Erro de Rede',
        message: 'Ocorreu um problema na comunicação com o servidor.',
        shortMessage: 'Problema de rede'
    },
    // Authentication Errors
    AUTH_INVALID_CREDENTIALS: {
        title: 'Credenciais Inválidas',
        message: 'Email ou senha incorretos. Verifique suas informações e tente novamente.',
        shortMessage: 'Login ou senha incorretos'
    },
    AUTH_SESSION_EXPIRED: {
        title: 'Sessão Expirada',
        message: 'Sua sessão expirou por segurança. Por favor, faça login novamente.',
        shortMessage: 'Sessão expirou'
    },
    AUTH_ACCOUNT_LOCKED: {
        title: 'Conta Bloqueada',
        message: 'Sua conta foi temporariamente bloqueada devido a múltiplas tentativas de login.',
        shortMessage: 'Conta bloqueada temporariamente'
    },
    AUTH_EMAIL_NOT_VERIFIED: {
        title: 'Email Não Verificado',
        message: 'Por favor, verifique seu email antes de fazer login.',
        shortMessage: 'Email precisa ser verificado'
    },
    // Authorization Errors
    AUTH_INSUFFICIENT_PERMISSIONS: {
        title: 'Acesso Não Autorizado',
        message: 'Você não tem permissão para executar esta ação. Entre em contato com seu supervisor.',
        shortMessage: 'Sem permissão para esta ação'
    },
    AUTH_RESOURCE_FORBIDDEN: {
        title: 'Recurso Proibido',
        message: 'Você não tem autorização para acessar este recurso.',
        shortMessage: 'Acesso negado ao recurso'
    },
    // Validation Errors
    VALIDATION_REQUIRED_FIELD: {
        title: 'Campo Obrigatório',
        message: 'Alguns campos obrigatórios não foram preenchidos. Verifique o formulário.',
        shortMessage: 'Preencha todos os campos obrigatórios'
    },
    VALIDATION_INVALID_FORMAT: {
        title: 'Formato Inválido',
        message: 'Alguns dados não estão no formato esperado. Verifique as informações.',
        shortMessage: 'Formato de dados incorreto'
    },
    VALIDATION_EMAIL_INVALID: {
        title: 'Email Inválido',
        message: 'O endereço de email fornecido não é válido.',
        shortMessage: 'Email no formato incorreto'
    },
    VALIDATION_PASSWORD_WEAK: {
        title: 'Senha Fraca',
        message: 'A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números.',
        shortMessage: 'Senha não atende aos requisitos'
    },
    VALIDATION_CPF_INVALID: {
        title: 'CPF Inválido',
        message: 'O CPF fornecido não é válido. Verifique os números.',
        shortMessage: 'CPF inválido'
    },
    VALIDATION_PHONE_INVALID: {
        title: 'Telefone Inválido',
        message: 'O número de telefone não está no formato correto.',
        shortMessage: 'Formato de telefone incorreto'
    },
    VALIDATION_DATE_INVALID: {
        title: 'Data Inválida',
        message: 'A data fornecida não é válida ou está em formato incorreto.',
        shortMessage: 'Data em formato incorreto'
    },
    // Conflict Errors (Clinic-specific)
    APPOINTMENT_CONFLICT: {
        title: 'Conflito de Agendamento',
        message: 'Já existe um agendamento neste horário. Escolha um horário alternativo.',
        shortMessage: 'Horário já ocupado'
    },
    APPOINTMENT_PAST_DATE: {
        title: 'Data no Passado',
        message: 'Não é possível agendar para datas passadas.',
        shortMessage: 'Data já passou'
    },
    APPOINTMENT_OUTSIDE_HOURS: {
        title: 'Fora do Horário',
        message: 'O agendamento está fora do horário de funcionamento.',
        shortMessage: 'Fora do horário de funcionamento'
    },
    RESOURCE_CONFLICT: {
        title: 'Recurso em Uso',
        message: 'O recurso solicitado já está sendo usado no momento.',
        shortMessage: 'Recurso não disponível'
    },
    // Resource Not Found
    RESOURCE_NOT_FOUND: {
        title: 'Recurso Não Encontrado',
        message: 'O item que você está procurando não foi encontrado.',
        shortMessage: 'Item não encontrado'
    },
    PATIENT_NOT_FOUND: {
        title: 'Paciente Não Encontrado',
        message: 'Não foi possível localizar os dados do paciente.',
        shortMessage: 'Paciente não encontrado'
    },
    APPOINTMENT_NOT_FOUND: {
        title: 'Agendamento Não Encontrado',
        message: 'O agendamento solicitado não existe ou foi removido.',
        shortMessage: 'Agendamento inexistente'
    },
    // System Errors
    SYSTEM_MAINTENANCE: {
        title: 'Sistema em Manutenção',
        message: 'O sistema está temporariamente indisponível para manutenção programada.',
        shortMessage: 'Sistema em manutenção'
    },
    SYSTEM_OVERLOAD: {
        title: 'Sistema Sobrecarregado',
        message: 'O sistema está com alta demanda. Aguarde um momento e tente novamente.',
        shortMessage: 'Sistema sobrecarregado'
    },
    SYSTEM_ERROR: {
        title: 'Erro do Sistema',
        message: 'Ocorreu um erro interno do sistema. Nossa equipe foi notificada.',
        shortMessage: 'Erro interno do sistema'
    },
    SYSTEM_UPDATE_REQUIRED: {
        title: 'Atualização Necessária',
        message: 'Uma atualização do sistema é necessária. Recarregue a página.',
        shortMessage: 'Atualize a página'
    },
    // External Service Errors
    EXTERNAL_SERVICE_UNAVAILABLE: {
        title: 'Serviço Indisponível',
        message: 'Um serviço externo está temporariamente indisponível.',
        shortMessage: 'Serviço externo indisponível'
    },
    PAYMENT_SERVICE_ERROR: {
        title: 'Erro no Pagamento',
        message: 'Ocorreu um problema com o processamento do pagamento.',
        shortMessage: 'Erro no processamento de pagamento'
    },
    EMAIL_SERVICE_ERROR: {
        title: 'Erro no Envio de Email',
        message: 'Não foi possível enviar o email. Tente novamente mais tarde.',
        shortMessage: 'Falha no envio de email'
    },
    // Data Processing Errors
    DATA_PROCESSING_ERROR: {
        title: 'Erro no Processamento',
        message: 'Ocorreu um erro ao processar suas informações. Seus dados não foram alterados.',
        shortMessage: 'Erro ao processar dados'
    },
    IMPORT_ERROR: {
        title: 'Erro na Importação',
        message: 'Não foi possível importar os dados. Verifique o formato do arquivo.',
        shortMessage: 'Erro na importação de dados'
    },
    EXPORT_ERROR: {
        title: 'Erro na Exportação',
        message: 'Não foi possível exportar os dados. Tente novamente.',
        shortMessage: 'Erro na exportação'
    },
    BACKUP_ERROR: {
        title: 'Erro no Backup',
        message: 'Falha ao criar backup dos dados. Operação cancelada por segurança.',
        shortMessage: 'Falha no backup'
    },
    // Privacy Compliance (LGPD)
    PRIVACY_CONSENT_REQUIRED: {
        title: 'Consentimento Necessário',
        message: 'Esta operação requer seu consentimento para processamento de dados pessoais.',
        shortMessage: 'Consentimento LGPD necessário'
    },
    PRIVACY_DATA_RETENTION: {
        title: 'Período de Retenção',
        message: 'Este dado atingiu o período máximo de retenção permitido pela LGPD.',
        shortMessage: 'Dados fora do período de retenção'
    },
    PRIVACY_ACCESS_DENIED: {
        title: 'Acesso Negado por Privacidade',
        message: 'Acesso negado para proteger a privacidade dos dados pessoais.',
        shortMessage: 'Acesso negado por privacidade'
    },
    PRIVACY_ANONYMIZATION_REQUIRED: {
        title: 'Anonimização Necessária',
        message: 'Os dados precisam ser anonimizados antes desta operação.',
        shortMessage: 'Dados precisam ser anonimizados'
    }
};
// Action messages in PT-BR
exports.ptBRActionMessages = {
    retry: 'Tentar Novamente',
    cancel: 'Cancelar',
    close: 'Fechar',
    confirm: 'Confirmar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    view: 'Visualizar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    submit: 'Enviar',
    search: 'Pesquisar',
    filter: 'Filtrar',
    export: 'Exportar',
    import: 'Importar',
    print: 'Imprimir',
    download: 'Baixar',
    upload: 'Carregar',
    refresh: 'Atualizar',
    reload: 'Recarregar',
    login: 'Entrar',
    logout: 'Sair',
    register: 'Cadastrar',
    forgot_password: 'Esqueci a Senha',
    reset_password: 'Redefinir Senha',
    change_password: 'Alterar Senha',
    contact_support: 'Contatar Suporte',
    help: 'Ajuda',
    settings: 'Configurações',
    profile: 'Perfil',
    dashboard: 'Dashboard',
    home: 'Início',
    patients: 'Pacientes',
    appointments: 'Agendamentos',
    treatments: 'Tratamentos',
    financial: 'Financeiro',
    reports: 'Relatórios',
    calendar: 'Calendário',
    schedule: 'Agendar',
    reschedule: 'Reagendar',
    cancel_appointment: 'Cancelar Agendamento',
    add_patient: 'Adicionar Paciente',
    edit_patient: 'Editar Paciente',
    patient_history: 'Histórico do Paciente',
    new_appointment: 'Novo Agendamento',
    view_appointment: 'Ver Agendamento',
    appointment_details: 'Detalhes do Agendamento'
};
// Common phrases and terms in PT-BR
exports.ptBRCommonTerms = {
    loading: 'Carregando...',
    saving: 'Salvando...',
    loading_please_wait: 'Carregando, por favor aguarde...',
    processing: 'Processando...',
    please_wait: 'Por favor, aguarde...',
    operation_completed: 'Operação concluída',
    operation_failed: 'Operação falhou',
    success: 'Sucesso',
    error: 'Erro',
    warning: 'Atenção',
    info: 'Informação',
    confirmation: 'Confirmação',
    question: 'Pergunta',
    yes: 'Sim',
    no: 'Não',
    ok: 'OK',
    required_field: 'Campo obrigatório',
    optional_field: 'Campo opcional',
    invalid_data: 'Dados inválidos',
    data_saved: 'Dados salvos',
    changes_saved: 'Alterações salvas',
    no_data_found: 'Nenhum dado encontrado',
    no_results: 'Nenhum resultado',
    search_results: 'Resultados da pesquisa',
    total_records: 'Total de registros',
    page: 'Página',
    of: 'de',
    items_per_page: 'Itens por página',
    first: 'Primeiro',
    last: 'Último',
    created_at: 'Criado em',
    updated_at: 'Atualizado em',
    created_by: 'Criado por',
    updated_by: 'Atualizado por',
    status: 'Status',
    active: 'Ativo',
    inactive: 'Inativo',
    enabled: 'Habilitado',
    disabled: 'Desabilitado',
    draft: 'Rascunho',
    published: 'Publicado',
    archived: 'Arquivado',
    deleted: 'Excluído'
};
// Date and time formatting for PT-BR
exports.ptBRDateTimeFormats = {
    date: 'DD/MM/YYYY',
    time: 'HH:mm',
    datetime: 'DD/MM/YYYY HH:mm',
    datetime_long: 'DD/MM/YYYY às HH:mm',
    date_long: 'dddd, D [de] MMMM [de] YYYY',
    relative_time: {
        future: 'em %s',
        past: 'há %s',
        s: 'alguns segundos',
        ss: '%d segundos',
        m: 'um minuto',
        mm: '%d minutos',
        h: 'uma hora',
        hh: '%d horas',
        d: 'um dia',
        dd: '%d dias',
        M: 'um mês',
        MM: '%d meses',
        y: 'um ano',
        yy: '%d anos'
    }
};
// Form validation messages in PT-BR
exports.ptBRValidationMessages = {
    required: 'Este campo é obrigatório',
    email: 'Digite um email válido',
    min_length: 'Deve ter pelo menos {min} caracteres',
    max_length: 'Deve ter no máximo {max} caracteres',
    pattern: 'Formato inválido',
    number: 'Digite apenas números',
    positive_number: 'Digite um número positivo',
    integer: 'Digite um número inteiro',
    decimal: 'Digite um número decimal válido',
    phone: 'Digite um telefone válido',
    cpf: 'Digite um CPF válido',
    cnpj: 'Digite um CNPJ válido',
    cep: 'Digite um CEP válido',
    url: 'Digite uma URL válida',
    date: 'Digite uma data válida',
    time: 'Digite um horário válido',
    datetime: 'Digite uma data e hora válidas',
    password: 'A senha deve ter pelo menos 8 caracteres',
    password_confirmation: 'As senhas não coincidem',
    terms_accepted: 'Você deve aceitar os termos',
    privacy_accepted: 'Você deve aceitar a política de privacidade'
};
// Export all translations
exports.ptBRTranslations = {
    errors: exports.ptBRErrorMessages,
    actions: exports.ptBRActionMessages,
    common: exports.ptBRCommonTerms,
    datetime: exports.ptBRDateTimeFormats,
    validation: exports.ptBRValidationMessages
};
exports.default = exports.ptBRTranslations;

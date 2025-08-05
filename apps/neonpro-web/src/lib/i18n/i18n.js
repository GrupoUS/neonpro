"use strict";
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ptBRDictionary = exports.HealthcareFormatters = exports.defaultLocale = exports.locales = void 0;
exports.getDictionary = getDictionary;
exports.createTranslator = createTranslator;
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.formatTime = formatTime;
exports.formatPhoneNumber = formatPhoneNumber;
exports.formatCPF = formatCPF;
exports.formatCEP = formatCEP;
// Supported locales configuration
exports.locales = ['pt-BR', 'en-US'];
exports.defaultLocale = 'pt-BR';
// Brazilian Portuguese dictionary
var ptBRDictionary = {
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
exports.ptBRDictionary = ptBRDictionary;
// Dictionary cache for performance
var dictionaryCache = {};
/**
 * Load dictionary for specified locale
 */
function getDictionary() {
    return __awaiter(this, arguments, void 0, function (locale) {
        var dictionary;
        if (locale === void 0) { locale = exports.defaultLocale; }
        return __generator(this, function (_a) {
            // Return cached dictionary if available
            if (dictionaryCache[locale]) {
                return [2 /*return*/, dictionaryCache[locale]];
            }
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
            return [2 /*return*/, dictionary];
        });
    });
}
/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce(function (curr, key) { return curr === null || curr === void 0 ? void 0 : curr[key]; }, obj) || path;
}
/**
 * Translation function with type safety
 */
function createTranslator(dictionary) {
    return function t(key, params) {
        var translation = getNestedValue(dictionary, key);
        // Replace parameters in translation
        if (params) {
            Object.entries(params).forEach(function (_a) {
                var param = _a[0], value = _a[1];
                translation = translation.replace("{{".concat(param, "}}"), String(value));
            });
        }
        return translation;
    };
}
/**
 * Format currency for Brazilian Real
 */
function formatCurrency(amount, locale, currency) {
    if (locale === void 0) { locale = 'pt-BR'; }
    if (currency === void 0) { currency = 'BRL'; }
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount);
}
/**
 * Format date for Brazilian locale
 */
function formatDate(date, locale, options) {
    if (locale === void 0) { locale = 'pt-BR'; }
    var defaultOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };
    return new Intl.DateTimeFormat(locale, __assign(__assign({}, defaultOptions), options)).format(date);
}
/**
 * Format time for Brazilian locale
 */
function formatTime(date, locale, options) {
    if (locale === void 0) { locale = 'pt-BR'; }
    var defaultOptions = {
        hour: '2-digit',
        minute: '2-digit',
    };
    return new Intl.DateTimeFormat(locale, __assign(__assign({}, defaultOptions), options)).format(date);
}
/**
 * Format phone number for Brazilian format
 */
function formatPhoneNumber(phone) {
    // Remove all non-digits
    var digits = phone.replace(/\D/g, '');
    // Brazilian mobile: (11) 99999-9999
    if (digits.length === 11) {
        return "(".concat(digits.slice(0, 2), ") ").concat(digits.slice(2, 7), "-").concat(digits.slice(7));
    }
    // Brazilian landline: (11) 9999-9999
    if (digits.length === 10) {
        return "(".concat(digits.slice(0, 2), ") ").concat(digits.slice(2, 6), "-").concat(digits.slice(6));
    }
    return phone;
}
/**
 * Format CPF for Brazilian format
 */
function formatCPF(cpf) {
    var digits = cpf.replace(/\D/g, '');
    if (digits.length === 11) {
        return "".concat(digits.slice(0, 3), ".").concat(digits.slice(3, 6), ".").concat(digits.slice(6, 9), "-").concat(digits.slice(9));
    }
    return cpf;
}
/**
 * Format postal code for Brazilian format
 */
function formatCEP(cep) {
    var digits = cep.replace(/\D/g, '');
    if (digits.length === 8) {
        return "".concat(digits.slice(0, 5), "-").concat(digits.slice(5));
    }
    return cep;
}
/**
 * Healthcare-specific formatters
 */
exports.HealthcareFormatters = {
    /**
     * Format appointment duration in minutes to human-readable format
     */
    appointmentDuration: function (minutes, dictionary) {
        if (minutes < 60) {
            return "".concat(minutes, " min");
        }
        var hours = Math.floor(minutes / 60);
        var remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return "".concat(hours, "h");
        }
        return "".concat(hours, "h ").concat(remainingMinutes, "min");
    },
    /**
     * Format appointment status with appropriate styling
     */
    appointmentStatus: function (status, dictionary) {
        var statusMap = {
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
    professionalName: function (name, specialty, dictionary) {
        if (!specialty)
            return name;
        // Add Dr./Dra. prefix for doctors
        var doctorSpecialties = ['dermatologista', 'médico', 'doctor', 'dermatologist'];
        if (doctorSpecialties.some(function (spec) { return specialty.toLowerCase().includes(spec); })) {
            return "Dr(a). ".concat(name);
        }
        return name;
    },
};

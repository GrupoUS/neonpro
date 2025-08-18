/**
 * NeonPro - Internationalization (i18n) Library
 * Type-safe translation system for Next.js 15 App Router
 */

export type Locale = "pt-BR" | "en-US" | "es-ES";

export const defaultLocale: Locale = "pt-BR";

export const locales: Locale[] = ["pt-BR", "en-US", "es-ES"];

export type Dictionary = {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    close: string;
    open: string;
    yes: string;
    no: string;
  };
  auth: {
    login: string;
    logout: string;
    register: string;
    forgotPassword: string;
    resetPassword: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  patient: {
    patient: string;
    patients: string;
    newPatient: string;
    editPatient: string;
    patientDetails: string;
    patientHistory: string;
  };
  appointment: {
    appointment: string;
    appointments: string;
    newAppointment: string;
    editAppointment: string;
    scheduleAppointment: string;
    cancelAppointment: string;
  };
  treatment: {
    treatment: string;
    treatments: string;
    newTreatment: string;
    editTreatment: string;
    treatmentPlan: string;
    treatmentHistory: string;
  };
  compliance: {
    compliance: string;
    anvisa: string;
    lgpd: string;
    auditTrail: string;
    emergencyAccess: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  "pt-BR": {
    common: {
      loading: "Carregando...",
      error: "Erro",
      success: "Sucesso",
      cancel: "Cancelar",
      save: "Salvar",
      delete: "Excluir",
      edit: "Editar",
      view: "Visualizar",
      search: "Pesquisar",
      filter: "Filtrar",
      export: "Exportar",
      import: "Importar",
      close: "Fechar",
      open: "Abrir",
      yes: "Sim",
      no: "Não",
    },
    auth: {
      login: "Entrar",
      logout: "Sair",
      register: "Registrar",
      forgotPassword: "Esqueci a senha",
      resetPassword: "Redefinir senha",
      email: "E-mail",
      password: "Senha",
      confirmPassword: "Confirmar senha",
    },
    patient: {
      patient: "Paciente",
      patients: "Pacientes",
      newPatient: "Novo Paciente",
      editPatient: "Editar Paciente",
      patientDetails: "Detalhes do Paciente",
      patientHistory: "Histórico do Paciente",
    },
    appointment: {
      appointment: "Agendamento",
      appointments: "Agendamentos",
      newAppointment: "Novo Agendamento",
      editAppointment: "Editar Agendamento",
      scheduleAppointment: "Agendar Consulta",
      cancelAppointment: "Cancelar Agendamento",
    },
    treatment: {
      treatment: "Tratamento",
      treatments: "Tratamentos",
      newTreatment: "Novo Tratamento",
      editTreatment: "Editar Tratamento",
      treatmentPlan: "Plano de Tratamento",
      treatmentHistory: "Histórico de Tratamentos",
    },
    compliance: {
      compliance: "Conformidade",
      anvisa: "ANVISA",
      lgpd: "LGPD",
      auditTrail: "Trilha de Auditoria",
      emergencyAccess: "Acesso de Emergência",
    },
  },
  "en-US": {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      search: "Search",
      filter: "Filter",
      export: "Export",
      import: "Import",
      close: "Close",
      open: "Open",
      yes: "Yes",
      no: "No",
    },
    auth: {
      login: "Login",
      logout: "Logout",
      register: "Register",
      forgotPassword: "Forgot Password",
      resetPassword: "Reset Password",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
    },
    patient: {
      patient: "Patient",
      patients: "Patients",
      newPatient: "New Patient",
      editPatient: "Edit Patient",
      patientDetails: "Patient Details",
      patientHistory: "Patient History",
    },
    appointment: {
      appointment: "Appointment",
      appointments: "Appointments",
      newAppointment: "New Appointment",
      editAppointment: "Edit Appointment",
      scheduleAppointment: "Schedule Appointment",
      cancelAppointment: "Cancel Appointment",
    },
    treatment: {
      treatment: "Treatment",
      treatments: "Treatments",
      newTreatment: "New Treatment",
      editTreatment: "Edit Treatment",
      treatmentPlan: "Treatment Plan",
      treatmentHistory: "Treatment History",
    },
    compliance: {
      compliance: "Compliance",
      anvisa: "ANVISA",
      lgpd: "LGPD",
      auditTrail: "Audit Trail",
      emergencyAccess: "Emergency Access",
    },
  },
  "es-ES": {
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      view: "Ver",
      search: "Buscar",
      filter: "Filtrar",
      export: "Exportar",
      import: "Importar",
      close: "Cerrar",
      open: "Abrir",
      yes: "Sí",
      no: "No",
    },
    auth: {
      login: "Iniciar Sesión",
      logout: "Cerrar Sesión",
      register: "Registrarse",
      forgotPassword: "Olvidé mi Contraseña",
      resetPassword: "Restablecer Contraseña",
      email: "Correo Electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
    },
    patient: {
      patient: "Paciente",
      patients: "Pacientes",
      newPatient: "Nuevo Paciente",
      editPatient: "Editar Paciente",
      patientDetails: "Detalles del Paciente",
      patientHistory: "Historial del Paciente",
    },
    appointment: {
      appointment: "Cita",
      appointments: "Citas",
      newAppointment: "Nueva Cita",
      editAppointment: "Editar Cita",
      scheduleAppointment: "Programar Cita",
      cancelAppointment: "Cancelar Cita",
    },
    treatment: {
      treatment: "Tratamiento",
      treatments: "Tratamientos",
      newTreatment: "Nuevo Tratamiento",
      editTreatment: "Editar Tratamiento",
      treatmentPlan: "Plan de Tratamiento",
      treatmentHistory: "Historial de Tratamientos",
    },
    compliance: {
      compliance: "Cumplimiento",
      anvisa: "ANVISA",
      lgpd: "LGPD",
      auditTrail: "Pista de Auditoría",
      emergencyAccess: "Acceso de Emergencia",
    },
  },
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale] || dictionaries[defaultLocale];
}

export function createTranslator(dictionary: Dictionary) {
  return function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split(".");
    let value: any = dictionary;

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== "string") {
      return key;
    }

    if (!params) {
      return value;
    }

    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  };
}

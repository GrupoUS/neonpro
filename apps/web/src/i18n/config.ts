import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  pt: {
    translation: {
      welcome: 'Bem-vindo ao NeonPro',
      dashboard: 'Painel',
      appointments: 'Agendamentos',
      patients: 'Pacientes',
      services: 'Serviços',
      consent: 'Consentimento LGPD',
      'lgpd-title': 'Proteção de Dados Pessoais (LGPD)',
      'consent-given': 'Consentimento concedido',
      'error-loading': 'Erro ao carregar dados',
      // Add more healthcare-specific translations
      'appointment-scheduled': 'Agendamento marcado para {{date}} às {{time}}',
      'patient-info': 'Informações do paciente',
    },
  },
  en: {
    translation: {
      welcome: 'Welcome to NeonPro',
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      patients: 'Patients',
      services: 'Services',
      consent: 'LGPD Consent',
      'lgpd-title': 'Personal Data Protection (LGPD)',
      'consent-given': 'Consent given',
      'error-loading': 'Error loading data',
      'appointment-scheduled': 'Appointment scheduled for {{date}} at {{time}}',
      'patient-info': 'Patient information',
    },
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    lng: 'pt', // default language
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

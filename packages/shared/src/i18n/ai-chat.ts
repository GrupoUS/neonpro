// i18n keys for AI Chat (pt-BR, en-US)
export const aiChatI18n = {
  "pt-BR": {
    refusal: {
      missing_consent: "Não é possível responder sem consentimento válido.",
    },
    limit: { reached: "Muitas solicitações. Tente novamente em breve." },
    clarification: {
      request: "Por favor, especifique o paciente ou o assunto.",
    },
    explanation: { header: "Resumo sem dados sensíveis:" },
    streaming: { started_at: "Iniciado às" },
  },
  "en-US": {
    refusal: { missing_consent: "Cannot answer without valid consent." },
    limit: { reached: "Too many requests. Please try again shortly." },
    clarification: { request: "Please specify the patient or subject." },
    explanation: { header: "Summary without sensitive data:" },
    streaming: { started_at: "Started at" },
  },
} as const;

export type AiChatLocale = keyof typeof aiChatI18n;

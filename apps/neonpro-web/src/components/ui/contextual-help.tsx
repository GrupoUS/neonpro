// Contextual Help System for Error Resolution
"use client";

import type {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Info,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ErrorCategory } from "@/hooks/use-error-handling";

interface ContextualHelpProps {
  errorCategory: ErrorCategory;
  errorCode: string;
  userRole?: "admin" | "manager" | "assistant" | "user";
  component?: string;
  className?: string;
}

interface HelpContent {
  title: string;
  description: string;
  steps: string[];
  tips?: string[];
  warnings?: string[];
  contactSupport?: boolean;
  relatedDocuments?: Array<{
    title: string;
    url: string;
  }>;
}

// LGPD-compliant contextual help content (PT-BR)
const HELP_CONTENT: Record<string, Record<string, HelpContent>> = {
  // Network-related errors
  network: {
    NETWORK_UNAVAILABLE: {
      title: "Problemas de Conexão",
      description: "Sua conexão com a internet está instável ou indisponível.",
      steps: [
        "Verifique se seu Wi-Fi ou cabo de rede está conectado",
        "Teste o acesso a outros sites para confirmar a conexão",
        "Reinicie seu roteador se necessário",
        "Aguarde alguns minutos e tente novamente",
      ],
      tips: [
        "Conexões Wi-Fi podem ser instáveis em horários de pico",
        "Use cabo de rede para maior estabilidade",
        "Verifique com seu provedor se há problemas na região",
      ],
    },
    NETWORK_TIMEOUT: {
      title: "Conexão Lenta",
      description: "A operação demorou mais que o normal para ser concluída.",
      steps: [
        "Verifique a velocidade da sua internet",
        "Feche outras abas ou aplicativos que usam internet",
        "Tente novamente em alguns instantes",
        "Use uma conexão mais rápida se disponível",
      ],
      tips: [
        "Operações com muitos dados podem demorar mais",
        "Horários de pico (18h-22h) podem ser mais lentos",
        "Conexões móveis podem ter limitações",
      ],
    },
  },

  // Authentication errors
  authentication: {
    AUTH_INVALID_CREDENTIALS: {
      title: "Problemas de Login",
      description: "As credenciais fornecidas não estão corretas.",
      steps: [
        "Verifique se o email está correto (sem espaços)",
        "Confirme se a senha está correta (atenção ao Caps Lock)",
        'Use "Esqueci minha senha" se necessário',
        "Limpe o cache do navegador se o problema persistir",
      ],
      tips: [
        "Senhas são sensíveis a maiúsculas e minúsculas",
        "Copiar e colar senhas pode incluir espaços extras",
        "Verifique se não há caracteres especiais inesperados",
      ],
      relatedDocuments: [
        { title: "Como redefinir sua senha", url: "/help/password-reset" },
        { title: "Problemas comuns de login", url: "/help/login-troubleshooting" },
      ],
    },
    AUTH_SESSION_EXPIRED: {
      title: "Sessão Expirada",
      description: "Sua sessão de login expirou por segurança.",
      steps: [
        "Clique no botão de login novamente",
        "Insira suas credenciais",
        'Marque "Lembrar-me" para sessões mais longas',
        "Evite deixar o sistema aberto sem uso prolongado",
      ],
      tips: [
        "Sessões expiram após 8 horas de inatividade",
        'Usar "Lembrar-me" mantém login por 30 dias',
        "Fechar o navegador não afeta sessões salvas",
      ],
    },
  },

  // Authorization errors (role-specific help)
  authorization: {
    AUTH_INSUFFICIENT_PERMISSIONS: {
      title: "Permissões Insuficientes",
      description: "Você não tem autorização para executar esta ação.",
      steps: [
        "Verifique se você está logado com a conta correta",
        "Confirme seu perfil de usuário no menu",
        "Contate seu supervisor para solicitar permissões",
        "Entre em contato com o administrador do sistema",
      ],
      tips: [
        "Assistentes podem agendar consultas e gerenciar pacientes",
        "Gerentes podem acessar relatórios financeiros",
        "Administradores têm acesso completo ao sistema",
        "Algumas ações requerem aprovação prévia",
      ],
      contactSupport: true,
      relatedDocuments: [
        { title: "Níveis de permissão", url: "/help/user-roles" },
        { title: "Solicitação de acesso", url: "/help/access-request" },
      ],
    },
  },

  // Validation errors
  validation: {
    VALIDATION_REQUIRED_FIELD: {
      title: "Campos Obrigatórios",
      description: "Alguns campos importantes não foram preenchidos.",
      steps: [
        "Procure por campos marcados com asterisco (*)",
        "Preencha todos os campos destacados em vermelho",
        "Verifique se não há mensagens de erro nos campos",
        "Salve o formulário após preencher tudo",
      ],
      tips: [
        "Campos obrigatórios são essenciais para o funcionamento",
        "Informações podem ser editadas posteriormente",
        'Use "Rascunho" para salvar formulários incompletos',
      ],
    },
    VALIDATION_INVALID_FORMAT: {
      title: "Formato de Dados",
      description: "Alguns campos não estão no formato esperado.",
      steps: [
        "Verifique o formato do email (exemplo@dominio.com)",
        "Confirme o formato do telefone (11) 99999-9999",
        "Use apenas números para CPF (sem pontos ou traços)",
        "Consulte os exemplos mostrados nos campos",
      ],
      tips: [
        "O sistema aceita telefones com ou sem máscara",
        "Emails devem ter @ e um domínio válido",
        "CPFs são validados pelos dígitos verificadores",
        "Datas devem estar no formato DD/MM/AAAA",
      ],
    },
  },

  // Appointment conflicts (clinic-specific)
  conflict: {
    APPOINTMENT_CONFLICT: {
      title: "Conflito de Agendamento",
      description: "O horário escolhido já está ocupado ou indisponível.",
      steps: [
        "Veja os horários alternativos sugeridos automaticamente",
        "Escolha um horário próximo ao desejado",
        "Verifique a agenda do profissional",
        "Entre em contato para reagendamentos especiais",
      ],
      tips: [
        "Manhãs e finais de tarde são mais concorridos",
        "Reagendamentos podem ter horários mais flexíveis",
        "Alguns procedimentos precisam de tempo extra",
        "Feriados e finais de semana têm disponibilidade reduzida",
      ],
      warnings: [
        "Não force agendamentos em conflito",
        "Sempre confirme com o paciente antes de reagendar",
        "Respeite os intervalos entre procedimentos",
      ],
    },
  },

  // System errors
  system: {
    SYSTEM_MAINTENANCE: {
      title: "Manutenção do Sistema",
      description: "O sistema está temporariamente indisponível para atualizações.",
      steps: [
        "Aguarde alguns minutos antes de tentar novamente",
        "Verifique nossos canais de comunicação",
        "Não perca dados - eles serão preservados",
        "Use este tempo para organizar outras tarefas",
      ],
      tips: [
        "Manutenções são sempre comunicadas previamente",
        "Durações típicas são de 10-30 minutos",
        "Dados são automaticamente salvos e restaurados",
        "Melhorias no sistema acontecem durante manutenções",
      ],
    },
    SYSTEM_OVERLOAD: {
      title: "Sistema Sobrecarregado",
      description: "Muitos usuários estão usando o sistema simultaneamente.",
      steps: [
        "Aguarde alguns minutos antes de tentar novamente",
        "Evite múltiplas tentativas ao mesmo tempo",
        "Tente acessar fora dos horários de pico",
        "Use funcionalidades mais simples temporariamente",
      ],
      tips: [
        "Picos ocorrem entre 9h-11h e 14h-16h",
        "Relatórios complexos demoram mais para carregar",
        "Múltiplas abas podem sobrecarregar sua conexão",
      ],
    },
  },

  // Data processing errors
  data_processing: {
    DATA_PROCESSING_ERROR: {
      title: "Erro no Processamento",
      description: "Ocorreu um problema ao processar suas informações.",
      steps: [
        "Verifique se todos os dados estão corretos",
        "Tente a operação novamente",
        "Simplifique a operação se for muito complexa",
        "Entre em contato com o suporte se persistir",
      ],
      tips: [
        "Operações com muitos dados podem falhar",
        "Divida operações grandes em partes menores",
        "Verifique a qualidade dos dados importados",
      ],
      contactSupport: true,
    },
  },

  // Privacy compliance
  privacy_compliance: {
    PRIVACY_CONSENT_REQUIRED: {
      title: "Consentimento LGPD",
      description: "Esta operação requer seu consentimento para processar dados pessoais.",
      steps: [
        "Leia os termos de consentimento apresentados",
        "Entenda quais dados serão processados",
        "Aceite os termos se concordar",
        "Consulte nossa política de privacidade para detalhes",
      ],
      tips: [
        "Você pode revogar o consentimento a qualquer momento",
        "Dados são processados apenas para a finalidade informada",
        "Temos medidas de segurança para proteger seus dados",
        "Você tem direito de solicitar exclusão dos dados",
      ],
      relatedDocuments: [
        { title: "Política de Privacidade", url: "/privacy/policy" },
        { title: "Seus Direitos LGPD", url: "/privacy/rights" },
      ],
    },
  },
};

// Role-specific contact information
const ROLE_CONTACTS = {
  admin: {
    title: "Suporte Técnico",
    contacts: [
      { type: "email", label: "Email Técnico", value: "tech@neonpro.com.br" },
      { type: "phone", label: "Telefone Técnico", value: "(11) 9999-9999" },
    ],
  },
  manager: {
    title: "Suporte Gerencial",
    contacts: [
      { type: "email", label: "Suporte Geral", value: "suporte@neonpro.com.br" },
      { type: "phone", label: "Telefone Comercial", value: "(11) 8888-8888" },
    ],
  },
  assistant: {
    title: "Suporte ao Usuário",
    contacts: [
      { type: "email", label: "Suporte", value: "suporte@neonpro.com.br" },
      { type: "chat", label: "Chat Online", value: "Disponível 8h-18h" },
    ],
  },
  user: {
    title: "Ajuda ao Cliente",
    contacts: [
      { type: "email", label: "Atendimento", value: "atendimento@neonpro.com.br" },
      { type: "phone", label: "Telefone", value: "(11) 7777-7777" },
    ],
  },
};

const CATEGORY_ICONS = {
  network: Settings,
  authentication: Users,
  authorization: Shield,
  validation: AlertTriangle,
  conflict: Calendar,
  system: Settings,
  data_processing: Settings,
  privacy_compliance: Shield,
  resource_not_found: Info,
  external_service: ExternalLink,
} as const;

export function ContextualHelp({
  errorCategory,
  errorCode,
  userRole = "user",
  component,
  className,
}: ContextualHelpProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const helpContent =
    HELP_CONTENT[errorCategory]?.[errorCode] || HELP_CONTENT.system.SYSTEM_MAINTENANCE;
  const roleContacts = ROLE_CONTACTS[userRole];
  const CategoryIcon = CATEGORY_ICONS[errorCategory] || HelpCircle;

  return (
    <Card className={className}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">
                    Como resolver este problema?
                  </CardTitle>
                  <p className="text-xs text-gray-600 mt-1">Guia passo-a-passo para resolução</p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Help content header */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <CategoryIcon className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">{helpContent.title}</h3>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700">{helpContent.description}</p>

            {/* Step-by-step resolution */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Passos para resolver:
              </h4>
              <ol className="space-y-2">
                {helpContent.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Badge
                      variant="outline"
                      className="w-5 h-5 p-0 flex items-center justify-center text-xs"
                    >
                      {index + 1}
                    </Badge>
                    <span className="flex-1 text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            {helpContent.tips && helpContent.tips.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  Dicas úteis:
                </h4>
                <ul className="space-y-1">
                  {helpContent.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {helpContent.warnings && helpContent.warnings.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Atenção:
                </h4>
                <ul className="space-y-1">
                  {helpContent.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact support */}
            {(helpContent.contactSupport || roleContacts) && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {roleContacts.title}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roleContacts.contacts.map((contact, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {contact.type === "email" && <Mail className="w-3 h-3 text-gray-500" />}
                      {contact.type === "phone" && <Phone className="w-3 h-3 text-gray-500" />}
                      {contact.type === "chat" && (
                        <MessageSquare className="w-3 h-3 text-gray-500" />
                      )}
                      <span className="font-medium text-gray-700">{contact.label}:</span>
                      <span className="text-gray-600">{contact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related documents */}
            {helpContent.relatedDocuments && helpContent.relatedDocuments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Documentação relacionada:</h4>
                <div className="space-y-1">
                  {helpContent.relatedDocuments.map((doc, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-auto p-2"
                      onClick={() => window.open(doc.url, "_blank")}
                    >
                      <ExternalLink className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="text-sm">{doc.title}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

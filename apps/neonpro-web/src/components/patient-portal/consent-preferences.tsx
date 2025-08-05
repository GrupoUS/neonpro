"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  Database,
  Download,
  Edit,
  Eye,
  FileText,
  History,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { usePatientAuth } from "@/lib/hooks/use-patient-auth";

interface ConsentItem {
  id: string;
  type:
    | "lgpd_basic"
    | "marketing"
    | "whatsapp"
    | "email"
    | "sms"
    | "photography"
    | "research"
    | "data_sharing";
  title: string;
  description: string;
  required: boolean;
  granted: boolean;
  granted_at?: string;
  revoked_at?: string;
  icon: React.ComponentType<{ className?: string }>;
  legal_basis: string;
  data_retention_period: string;
  purposes: string[];
}

interface DataRight {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ConsentPreferences() {
  const { patient, updatePatient } = usePatientAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  // LGPD Consent Management
  const [consents, setConsents] = useState<ConsentItem[]>([
    {
      id: "lgpd_basic",
      type: "lgpd_basic",
      title: "Tratamento de Dados Básicos (Obrigatório)",
      description:
        "Autorização para tratamento de dados pessoais necessários para prestação de serviços médicos e estéticos.",
      required: true,
      granted: true,
      granted_at: "2025-01-20T10:00:00Z",
      icon: Shield,
      legal_basis: "Consentimento do titular (Art. 7º, I, LGPD)",
      data_retention_period: "20 anos (conforme CFM)",
      purposes: [
        "Prestação de serviços médicos e estéticos",
        "Agendamento e controle de consultas",
        "Histórico médico e acompanhamento",
        "Comunicação sobre procedimentos",
      ],
    },
    {
      id: "marketing",
      type: "marketing",
      title: "Comunicações de Marketing",
      description:
        "Receber informações sobre novos tratamentos, promoções e conteúdo educativo sobre estética e saúde.",
      required: false,
      granted: true,
      granted_at: "2025-01-20T10:00:00Z",
      icon: Mail,
      legal_basis: "Consentimento específico do titular",
      data_retention_period: "2 anos após revogação",
      purposes: [
        "Envio de newsletters sobre tratamentos",
        "Promoções e ofertas especiais",
        "Conteúdo educativo sobre estética",
        "Pesquisas de satisfação",
      ],
    },
    {
      id: "whatsapp",
      type: "whatsapp",
      title: "WhatsApp Business",
      description:
        "Receber lembretes de consulta, confirmações e comunicações importantes via WhatsApp.",
      required: false,
      granted: false,
      icon: MessageSquare,
      legal_basis: "Consentimento específico do titular",
      data_retention_period: "1 ano após revogação",
      purposes: [
        "Lembretes de consultas agendadas",
        "Confirmações de agendamento",
        "Orientações pós-procedimento",
        "Comunicações urgentes",
      ],
    },
    {
      id: "photography",
      type: "photography",
      title: "Registro Fotográfico",
      description:
        "Autorização para captura e armazenamento de fotos para acompanhamento médico (antes/depois).",
      required: false,
      granted: true,
      granted_at: "2025-01-20T10:00:00Z",
      icon: Camera,
      legal_basis: "Consentimento específico para fins médicos",
      data_retention_period: "20 anos (arquivo médico)",
      purposes: [
        "Acompanhamento da evolução dos tratamentos",
        "Documentação médica obrigatória",
        "Comparação de resultados",
        "Análise de eficácia dos procedimentos",
      ],
    },
    {
      id: "research",
      type: "research",
      title: "Pesquisa e Desenvolvimento",
      description:
        "Uso de dados anonimizados para pesquisas científicas e desenvolvimento de novos tratamentos.",
      required: false,
      granted: false,
      icon: Database,
      legal_basis: "Consentimento para fins de pesquisa científica",
      data_retention_period: "Indefinido (dados anonimizados)",
      purposes: [
        "Pesquisas científicas em estética",
        "Desenvolvimento de novos tratamentos",
        "Estudos de eficácia e segurança",
        "Publicações científicas (dados anonimizados)",
      ],
    },
  ]);

  // LGPD Rights
  const dataRights: DataRight[] = [
    {
      id: "access",
      title: "Acesso aos Dados",
      description: "Solicitar uma cópia de todos os seus dados pessoais que processamos.",
      action: "Solicitar Cópia",
      icon: Eye,
    },
    {
      id: "rectification",
      title: "Correção de Dados",
      description: "Corrigir dados pessoais incompletos, inexatos ou desatualizados.",
      action: "Solicitar Correção",
      icon: Edit,
    },
    {
      id: "deletion",
      title: "Exclusão de Dados",
      description:
        "Solicitar a exclusão de dados pessoais desnecessários ou tratados inadequadamente.",
      action: "Solicitar Exclusão",
      icon: Trash2,
    },
    {
      id: "portability",
      title: "Portabilidade",
      description: "Receber seus dados em formato estruturado para transferir a outro prestador.",
      action: "Exportar Dados",
      icon: Download,
    },
    {
      id: "history",
      title: "Histórico de Consentimentos",
      description: "Visualizar o histórico completo de consentimentos concedidos e revogados.",
      action: "Ver Histórico",
      icon: History,
    },
  ];

  const handleConsentToggle = async (consentId: string, granted: boolean) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      // Find the consent item
      const consent = consents.find((c) => c.id === consentId);
      if (!consent) return;

      // Can't revoke required consents
      if (consent.required && !granted) {
        toast.error("Este consentimento é obrigatório para o uso dos serviços");
        return;
      }

      // Update local state optimistically
      setConsents((prev) =>
        prev.map((c) =>
          c.id === consentId
            ? {
                ...c,
                granted,
                granted_at: granted ? new Date().toISOString() : c.granted_at,
                revoked_at: !granted ? new Date().toISOString() : undefined,
              }
            : c,
        ),
      );

      // TODO: Call API to update consent
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        granted ? "Consentimento concedido com sucesso" : "Consentimento revogado com sucesso",
      );
    } catch (error) {
      // Revert optimistic update on error
      setConsents((prev) =>
        prev.map((c) => (c.id === consentId ? { ...c, granted: !granted } : c)),
      );

      toast.error("Erro ao atualizar consentimento");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDataRightRequest = async (rightId: string) => {
    try {
      // TODO: Call API to process data right request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Solicitação enviada com sucesso", {
        description: "Você receberá uma resposta em até 15 dias úteis conforme a LGPD",
      });
    } catch (error) {
      toast.error("Erro ao processar solicitação");
    }
  };

  const getConsentStatus = (consent: ConsentItem) => {
    if (consent.granted) {
      return {
        label: "Ativo",
        color: "bg-green-100 text-green-800",
        date: consent.granted_at
          ? format(parseISO(consent.granted_at), "d 'de' MMM, yyyy", { locale: ptBR })
          : "",
      };
    } else {
      return {
        label: consent.revoked_at ? "Revogado" : "Não Concedido",
        color: "bg-red-100 text-red-800",
        date: consent.revoked_at
          ? format(parseISO(consent.revoked_at), "d 'de' MMM, yyyy", { locale: ptBR })
          : "",
      };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Privacidade e Consentimentos LGPD
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas preferências de privacidade e exercite seus direitos sobre dados pessoais
        </p>
      </div>

      {/* LGPD Overview */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Seus Direitos LGPD:</strong> Como titular dos dados, você tem direito a
          confirmação da existência de tratamento, acesso aos dados, correção, anonimização,
          bloqueio, eliminação, portabilidade, informação sobre compartilhamento e revogação do
          consentimento a qualquer momento.
        </AlertDescription>
      </Alert>

      {/* Consent Management */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Gerenciar Consentimentos
          </CardTitle>
          <CardDescription>
            Controle como seus dados pessoais são utilizados para diferentes finalidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {consents.map((consent) => {
            const Icon = consent.icon;
            const status = getConsentStatus(consent);

            return (
              <div key={consent.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{consent.title}</h3>
                        <Badge className={status.color}>{status.label}</Badge>
                        {consent.required && (
                          <Badge variant="outline" className="text-xs">
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{consent.description}</p>
                      {status.date && (
                        <p className="text-xs text-muted-foreground">
                          {consent.granted ? "Concedido" : "Revogado"} em {status.date}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Icon className="w-5 h-5" />
                              {consent.title}
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Descrição</h4>
                              <p className="text-sm text-muted-foreground">{consent.description}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Base Legal</h4>
                              <p className="text-sm text-muted-foreground">{consent.legal_basis}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Período de Retenção</h4>
                              <p className="text-sm text-muted-foreground">
                                {consent.data_retention_period}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Finalidades do Tratamento</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {consent.purposes.map((purpose, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-1.5">•</span>
                                    <span>{purpose}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <div className="flex items-center gap-2">
                        <Label htmlFor={`consent-${consent.id}`} className="text-sm">
                          {consent.granted ? "Ativo" : "Inativo"}
                        </Label>
                        <Switch
                          id={`consent-${consent.id}`}
                          checked={consent.granted}
                          onCheckedChange={(checked) => handleConsentToggle(consent.id, checked)}
                          disabled={consent.required || isUpdating}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Direitos sobre seus Dados
          </CardTitle>
          <CardDescription>
            Exercite seus direitos fundamentais conforme a Lei Geral de Proteção de Dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataRights.map((right) => {
              const Icon = right.icon;

              return (
                <div key={right.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{right.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{right.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDataRightRequest(right.id)}
                    >
                      {right.action}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Policy */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Política de Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nossa Política de Privacidade detalha como coletamos, usamos, armazenamos e protegemos
            seus dados pessoais, sempre em conformidade com a LGPD.
          </p>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href="/privacy-policy" target="_blank" rel="noopener">
                <FileText className="w-4 h-4 mr-2" />
                Ler Política Completa
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/privacy-policy.pdf" target="_blank" rel="noopener">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact DPO */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 medical-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Dúvidas sobre Privacidade?</h3>
              <p className="text-blue-800 text-sm mb-4">
                Entre em contato com nosso Encarregado de Proteção de Dados (DPO) para esclarecer
                dúvidas sobre o tratamento dos seus dados pessoais.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                  <Mail className="w-4 h-4 mr-2" />
                  dpo@neonpro.com.br
                </Button>
                <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                  <Phone className="w-4 h-4 mr-2" />
                  (11) 3333-4444
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

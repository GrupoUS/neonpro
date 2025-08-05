"use client";

// 🎛️ Patient Consent Dashboard - Granular Consent Management Interface
// NeonPro - Sistema de Automação de Compliance LGPD
// Quality Standard: ≥9.5/10 (BMad Enhanced)

import type {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  History,
  Info,
  Lock,
  Settings,
  Shield,
  Trash2,
  Unlock,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type { Separator } from "@/components/ui/separator";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface ConsentDashboardProps {
  patientId: string;
  onConsentUpdate?: (consent: any) => void;
  onPrivacyRequest?: (requestType: string) => void;
}

interface ServiceConsent {
  service: string;
  purpose: string;
  requiredData: string[];
  consentStatus: "granted" | "missing" | "expired" | "withdrawn";
  impact: string;
  essential: boolean;
}

export function PatientConsentDashboard({
  patientId,
  onConsentUpdate,
  onPrivacyRequest,
}: ConsentDashboardProps) {
  const [services, setServices] = useState<ServiceConsent[]>([]);
  const [consentHistory, setConsentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Load consent data on component mount
  useEffect(() => {
    loadConsentData();
  }, [patientId]);

  const loadConsentData = async () => {
    setIsLoading(true);
    try {
      const [serviceData, historyData] = await Promise.all([
        fetchServiceDependencies(patientId),
        fetchConsentHistory(patientId),
      ]);

      setServices(serviceData);
      setConsentHistory(historyData);
    } catch (error) {
      console.error("Failed to load consent data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate overall consent status
  const overallStatus = calculateOverallStatus(services);
  const consentCoverage = calculateConsentCoverage(services);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Consentimentos</h2>
          <p className="text-muted-foreground">
            Controle seus dados pessoais e exercite seus direitos conforme a LGPD
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={overallStatus === "fully_consented" ? "default" : "secondary"}
            className="h-8 px-3"
          >
            {overallStatus === "fully_consented" && <CheckCircle className="mr-1 h-4 w-4" />}
            {overallStatus === "partially_consented" && <AlertTriangle className="mr-1 h-4 w-4" />}
            {overallStatus === "missing_consent" && <Lock className="mr-1 h-4 w-4" />}
            {getStatusText(overallStatus)}
          </Badge>
        </div>
      </div>

      {/* Consent Coverage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Status Geral dos Consentimentos
          </CardTitle>
          <CardDescription>
            Cobertura de consentimento para todos os serviços da clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Cobertura de Consentimento</span>
                <span className="text-sm text-muted-foreground">{consentCoverage}%</span>
              </div>
              <Progress value={consentCoverage} className="h-2" />
            </div>

            {overallStatus !== "fully_consented" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Ação Necessária</AlertTitle>
                <AlertDescription>
                  Alguns serviços requerem consentimento adicional para funcionamento completo.
                  Revise suas configurações abaixo.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="rights">Direitos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Essential Services */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Serviços Essenciais</CardTitle>
                <CardDescription>Necessários para atendimento médico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {services
                    .filter((s) => s.essential)
                    .map((service) => (
                      <div key={service.service} className="flex items-center justify-between">
                        <span className="text-sm">{service.service}</span>
                        <Badge
                          variant={service.consentStatus === "granted" ? "default" : "destructive"}
                        >
                          {service.consentStatus === "granted" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Optional Services */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Serviços Opcionais</CardTitle>
                <CardDescription>Melhoram sua experiência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {services
                    .filter((s) => !s.essential)
                    .map((service) => (
                      <div key={service.service} className="flex items-center justify-between">
                        <span className="text-sm">{service.service}</span>
                        <ConsentToggle
                          service={service}
                          onToggle={(enabled) => handleServiceToggle(service, enabled)}
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Atividade Recente</CardTitle>
                <CardDescription>Últimas alterações de consentimento</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {consentHistory.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="flex-1">{activity.description}</span>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="space-y-4">
            {services.map((service) => (
              <ServiceConsentCard
                key={service.service}
                service={service}
                onToggle={(enabled) => handleServiceToggle(service, enabled)}
                onViewDetails={() => handleViewServiceDetails(service)}
              />
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Histórico de Consentimentos
              </CardTitle>
              <CardDescription>
                Registro completo de todas as alterações de consentimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {consentHistory.map((activity, index) => (
                    <ConsentHistoryItem key={index} activity={activity} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rights Tab */}
        <TabsContent value="rights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Data Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  Acesso aos Dados
                </CardTitle>
                <CardDescription>
                  Solicite uma cópia completa dos seus dados pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => handlePrivacyRequest("access")}>
                  <Download className="mr-2 h-4 w-4" />
                  Solicitar Cópia dos Dados
                </Button>
              </CardContent>
            </Card>

            {/* Data Correction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="mr-2 h-5 w-5" />
                  Correção de Dados
                </CardTitle>
                <CardDescription>Solicite correção de informações incorretas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handlePrivacyRequest("correction")}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Solicitar Correção
                </Button>
              </CardContent>
            </Card>

            {/* Data Portability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Portabilidade
                </CardTitle>
                <CardDescription>Exporte seus dados em formato estruturado</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handlePrivacyRequest("portability")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Dados
                </Button>
              </CardContent>
            </Card>

            {/* Data Deletion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Exclusão de Dados
                </CardTitle>
                <CardDescription>Solicite a exclusão dos seus dados pessoais</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handlePrivacyRequest("deletion")}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Solicitar Exclusão
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Rights Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Seus Direitos sob a LGPD</AlertTitle>
            <AlertDescription className="mt-2">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a exclusão de dados desnecessários</li>
                <li>Solicitar a portabilidade de dados</li>
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Obter informações sobre compartilhamento de dados</li>
              </ul>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Event Handlers
  function handleServiceToggle(service: ServiceConsent, enabled: boolean) {
    console.log(`Toggling ${service.service} to ${enabled}`);
    onConsentUpdate?.({});
  }

  function handleViewServiceDetails(service: ServiceConsent) {
    console.log(`Viewing details for ${service.service}`);
  }

  function handlePrivacyRequest(requestType: string) {
    onPrivacyRequest?.(requestType);
  }
}

// Helper Components
function ConsentToggle({
  service,
  onToggle,
}: {
  service: ServiceConsent;
  onToggle: (enabled: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(service.consentStatus === "granted");

  const handleToggle = (newEnabled: boolean) => {
    setEnabled(newEnabled);
    onToggle(newEnabled);
  };

  return <Switch checked={enabled} onCheckedChange={handleToggle} disabled={service.essential} />;
}

function ServiceConsentCard({
  service,
  onToggle,
  onViewDetails,
}: {
  service: ServiceConsent;
  onToggle: (enabled: boolean) => void;
  onViewDetails: () => void;
}) {
  const isGranted = service.consentStatus === "granted";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{service.service}</CardTitle>
            <CardDescription>{service.impact}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {service.essential && <Badge variant="secondary">Essencial</Badge>}
            <Badge variant={isGranted ? "default" : "outline"}>
              {isGranted ? (
                <CheckCircle className="mr-1 h-3 w-3" />
              ) : (
                <Lock className="mr-1 h-3 w-3" />
              )}
              {isGranted ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Dados utilizados:</p>
            <div className="flex flex-wrap gap-1">
              {service.requiredData.map((dataType) => (
                <Badge key={dataType} variant="outline" className="text-xs">
                  {dataType}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <ConsentToggle service={service} onToggle={onToggle} />
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              <Settings className="mr-1 h-4 w-4" />
              Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConsentHistoryItem({ activity }: { activity: any }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "granted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "withdrawn":
        return <Lock className="h-4 w-4 text-red-500" />;
      case "modified":
        return <Edit className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 pb-4 last:pb-0">
      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{activity.description}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(activity.timestamp)} • {activity.details}
        </p>
      </div>
    </div>
  );
}

// Helper Functions
function calculateOverallStatus(
  services: ServiceConsent[],
): "fully_consented" | "partially_consented" | "missing_consent" {
  const grantedCount = services.filter((s) => s.consentStatus === "granted").length;
  const totalCount = services.length;

  if (grantedCount === totalCount) return "fully_consented";
  if (grantedCount > 0) return "partially_consented";
  return "missing_consent";
}

function calculateConsentCoverage(services: ServiceConsent[]): number {
  const grantedCount = services.filter((s) => s.consentStatus === "granted").length;
  return Math.round((grantedCount / services.length) * 100);
}

function getStatusText(status: string): string {
  switch (status) {
    case "fully_consented":
      return "Totalmente Consentido";
    case "partially_consented":
      return "Parcialmente Consentido";
    case "missing_consent":
      return "Consentimento Necessário";
    default:
      return "Status Desconhecido";
  }
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

// Mock API functions (would be replaced with real API calls)
async function fetchServiceDependencies(patientId: string): Promise<ServiceConsent[]> {
  return [
    {
      service: "Atendimento Médico",
      purpose: "medical_care",
      requiredData: ["personal", "medical", "sensitive"],
      consentStatus: "granted",
      impact: "Necessário para fornecimento de cuidados médicos e estéticos",
      essential: true,
    },
    {
      service: "Agendamento Online",
      purpose: "appointment_scheduling",
      requiredData: ["personal"],
      consentStatus: "granted",
      impact: "Permite agendamento online de consultas e procedimentos",
      essential: false,
    },
    {
      service: "Comunicação Promocional",
      purpose: "marketing",
      requiredData: ["personal", "behavioral"],
      consentStatus: "missing",
      impact: "Recebimento de ofertas personalizadas e promoções",
      essential: false,
    },
  ];
}

async function fetchConsentHistory(patientId: string): Promise<any[]> {
  return [
    {
      type: "granted",
      description: "Consentimento concedido para atendimento médico",
      timestamp: new Date().toISOString(),
      details: "Consentimento inicial para tratamento estético",
    },
    {
      type: "granted",
      description: "Consentimento concedido para agendamento online",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      details: "Ativação do sistema de agendamento digital",
    },
  ];
}

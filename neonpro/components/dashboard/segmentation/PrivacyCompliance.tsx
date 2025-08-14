"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Settings,
  Shield,
  Upload,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: "LGPD" | "ANVISA" | "CFM" | "CUSTOM";
  isActive: boolean;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lastChecked: string;
  violations: number;
  autoRemediation: boolean;
}

interface PrivacySettings {
  dataRetentionDays: number;
  anonymizeAfterDays: number;
  allowDataExport: boolean;
  requireExplicitConsent: boolean;
  enableDataDeletion: boolean;
  auditLogging: boolean;
  encryptionLevel: "STANDARD" | "HIGH" | "MAXIMUM";
}

interface ConsentRecord {
  id: string;
  patientId: string;
  patientName: string;
  consentType: string;
  status: "GRANTED" | "WITHDRAWN" | "PENDING";
  grantedAt: string;
  withdrawnAt?: string;
  purpose: string;
  dataTypes: string[];
}

export default function PrivacyCompliance() {
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataRetentionDays: 365,
    anonymizeAfterDays: 1095,
    allowDataExport: true,
    requireExplicitConsent: true,
    enableDataDeletion: true,
    auditLogging: true,
    encryptionLevel: "HIGH",
  });
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [complianceScore, setComplianceScore] = useState(0);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockRules: ComplianceRule[] = [
        {
          id: "1",
          name: "LGPD - Consentimento Explícito",
          description:
            "Verificar se todos os pacientes têm consentimento explícito para processamento de dados",
          type: "LGPD",
          isActive: true,
          severity: "CRITICAL",
          lastChecked: new Date().toISOString(),
          violations: 2,
          autoRemediation: true,
        },
        {
          id: "2",
          name: "ANVISA - Dados de Procedimentos",
          description:
            "Garantir conformidade com regulamentos ANVISA para dados de procedimentos estéticos",
          type: "ANVISA",
          isActive: true,
          severity: "HIGH",
          lastChecked: new Date().toISOString(),
          violations: 0,
          autoRemediation: false,
        },
        {
          id: "3",
          name: "CFM - Sigilo Médico",
          description:
            "Verificar conformidade com regras de sigilo médico do CFM",
          type: "CFM",
          isActive: true,
          severity: "CRITICAL",
          lastChecked: new Date().toISOString(),
          violations: 1,
          autoRemediation: true,
        },
        {
          id: "4",
          name: "Retenção de Dados",
          description:
            "Verificar se dados não são mantidos além do período legal",
          type: "CUSTOM",
          isActive: true,
          severity: "MEDIUM",
          lastChecked: new Date().toISOString(),
          violations: 0,
          autoRemediation: true,
        },
      ];

      const mockConsents: ConsentRecord[] = [
        {
          id: "1",
          patientId: "pat_001",
          patientName: "Maria Silva",
          consentType: "Processamento de Dados Pessoais",
          status: "GRANTED",
          grantedAt: "2024-01-15T10:30:00Z",
          purpose: "Atendimento médico e comunicação",
          dataTypes: ["Dados pessoais", "Dados de saúde", "Histórico médico"],
        },
        {
          id: "2",
          patientId: "pat_002",
          patientName: "João Santos",
          consentType: "Marketing e Comunicação",
          status: "WITHDRAWN",
          grantedAt: "2024-01-10T14:20:00Z",
          withdrawnAt: "2024-01-25T09:15:00Z",
          purpose: "Envio de ofertas e comunicações promocionais",
          dataTypes: ["Dados pessoais", "Preferências"],
        },
        {
          id: "3",
          patientId: "pat_003",
          patientName: "Ana Costa",
          consentType: "Compartilhamento de Dados",
          status: "PENDING",
          grantedAt: "2024-01-30T16:45:00Z",
          purpose: "Compartilhamento com laboratórios parceiros",
          dataTypes: ["Dados de exames", "Resultados"],
        },
      ];

      setComplianceRules(mockRules);
      setConsentRecords(mockConsents);

      // Calculate compliance score
      const totalRules = mockRules.length;
      const activeRules = mockRules.filter((r) => r.isActive).length;
      const violationsCount = mockRules.reduce(
        (acc, r) => acc + r.violations,
        0
      );
      const score = Math.max(
        0,
        ((activeRules - violationsCount) / totalRules) * 100
      );
      setComplianceScore(Math.round(score));
    } catch (error) {
      console.error("Failed to load compliance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      LOW: "bg-blue-100 text-blue-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };
    return colors[severity as keyof typeof colors] || colors.LOW;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      GRANTED: "bg-green-100 text-green-800",
      WITHDRAWN: "bg-red-100 text-red-800",
      PENDING: "bg-yellow-100 text-yellow-800",
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const toggleRule = async (ruleId: string) => {
    setComplianceRules((rules) =>
      rules.map((rule) =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const updatePrivacySettings = async (
    newSettings: Partial<PrivacySettings>
  ) => {
    setPrivacySettings((current) => ({ ...current, ...newSettings }));
    // Here you would make an API call to save settings
  };

  const exportComplianceReport = () => {
    const reportData = {
      complianceScore,
      rules: complianceRules,
      settings: privacySettings,
      consents: consentRecords,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Score de Conformidade
                </p>
                <div className="flex items-center">
                  <div className="text-2xl font-bold">{complianceScore}%</div>
                  <Progress value={complianceScore} className="ml-2 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Regras Ativas
                </p>
                <div className="text-2xl font-bold">
                  {complianceRules.filter((r) => r.isActive).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Violações
                </p>
                <div className="text-2xl font-bold">
                  {complianceRules.reduce((acc, r) => acc + r.violations, 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Consentimentos
                </p>
                <div className="text-2xl font-bold">
                  {consentRecords.filter((c) => c.status === "GRANTED").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts */}
      {complianceRules.some((r) => r.violations > 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Foram detectadas{" "}
            {complianceRules.reduce((acc, r) => acc + r.violations, 0)}{" "}
            violações de conformidade. Revise as regras e tome as ações
            necessárias.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="rules" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="rules">Regras de Conformidade</TabsTrigger>
            <TabsTrigger value="privacy">
              Configurações de Privacidade
            </TabsTrigger>
            <TabsTrigger value="consents">Gestão de Consentimentos</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant="outline" onClick={exportComplianceReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Conformidade</CardTitle>
              <CardDescription>
                Configure e monitore regras de conformidade com LGPD, ANVISA e
                CFM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceRules.map((rule) => (
                  <Card key={rule.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{rule.name}</h4>
                            <Badge className={getSeverityColor(rule.severity)}>
                              {rule.severity}
                            </Badge>
                            <Badge
                              variant={
                                rule.type === "LGPD" ? "default" : "secondary"
                              }
                            >
                              {rule.type}
                            </Badge>
                            {rule.violations > 0 && (
                              <Badge variant="destructive">
                                {rule.violations} violações
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {rule.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Última verificação:{" "}
                              {new Date(rule.lastChecked).toLocaleString(
                                "pt-BR"
                              )}
                            </span>
                            {rule.autoRemediation && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Remediação automática
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => toggleRule(rule.id)}
                          />
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Privacidade</CardTitle>
              <CardDescription>
                Configure políticas de retenção de dados, criptografia e
                privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="retention">Retenção de Dados (dias)</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={privacySettings.dataRetentionDays}
                      onChange={(e) =>
                        updatePrivacySettings({
                          dataRetentionDays: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="anonymize">Anonimização Após (dias)</Label>
                    <Input
                      id="anonymize"
                      type="number"
                      value={privacySettings.anonymizeAfterDays}
                      onChange={(e) =>
                        updatePrivacySettings({
                          anonymizeAfterDays: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="encryption">Nível de Criptografia</Label>
                    <Select
                      value={privacySettings.encryptionLevel}
                      onValueChange={(value: "STANDARD" | "HIGH" | "MAXIMUM") =>
                        updatePrivacySettings({ encryptionLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">Padrão</SelectItem>
                        <SelectItem value="HIGH">Alto</SelectItem>
                        <SelectItem value="MAXIMUM">Máximo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="export">Permitir Exportação de Dados</Label>
                    <Switch
                      id="export"
                      checked={privacySettings.allowDataExport}
                      onCheckedChange={(checked) =>
                        updatePrivacySettings({
                          allowDataExport: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="consent">Consentimento Explícito</Label>
                    <Switch
                      id="consent"
                      checked={privacySettings.requireExplicitConsent}
                      onCheckedChange={(checked) =>
                        updatePrivacySettings({
                          requireExplicitConsent: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="deletion">Permitir Exclusão de Dados</Label>
                    <Switch
                      id="deletion"
                      checked={privacySettings.enableDataDeletion}
                      onCheckedChange={(checked) =>
                        updatePrivacySettings({
                          enableDataDeletion: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="audit">Log de Auditoria</Label>
                    <Switch
                      id="audit"
                      checked={privacySettings.auditLogging}
                      onCheckedChange={(checked) =>
                        updatePrivacySettings({
                          auditLogging: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Consentimentos</CardTitle>
              <CardDescription>
                Monitore e gerencie consentimentos dos pacientes para
                processamento de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentRecords.map((consent) => (
                  <Card key={consent.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              {consent.patientName}
                            </h4>
                            <Badge className={getStatusColor(consent.status)}>
                              {consent.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {consent.consentType} - {consent.purpose}
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Dados: {consent.dataTypes.join(", ")}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Concedido:{" "}
                              {new Date(consent.grantedAt).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                            {consent.withdrawnAt && (
                              <span>
                                Retirado:{" "}
                                {new Date(
                                  consent.withdrawnAt
                                ).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Auditoria</CardTitle>
              <CardDescription>
                Histórico de acessos e modificações de dados para conformidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Logs de Auditoria</h3>
                <p className="text-muted-foreground">
                  Relatórios detalhados de auditoria serão exibidos aqui
                </p>
                <Button className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Gerar Relatório de Auditoria
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

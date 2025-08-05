"use client";

import type { useState } from "react";
import type { useForm } from "react-hook-form";
import type { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Input } from "@/components/ui/input";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Progress } from "@/components/ui/progress";
import type {
  Download,
  FileText,
  Database,
  Shield,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Archive,
  FileCheck,
  Users,
  Activity,
  TrendingUp,
  Lock,
  Eye,
  Filter,
} from "lucide-react";
import type { toast } from "sonner";

const exportTypes = [
  {
    id: "lgpd_compliance",
    name: "Relatório LGPD",
    description: "Relatório de conformidade com Lei Geral de Proteção de Dados",
    category: "compliance",
    formats: ["PDF", "CSV", "JSON"],
    frequency: ["manual", "monthly", "quarterly"],
    regulation: "LGPD Lei 13.709/2018",
    fields: [
      "consentimentos_coletados",
      "solicitacoes_titular",
      "incidentes_seguranca",
      "compartilhamentos_dados",
      "politicas_retencao",
      "avaliacoes_impacto",
    ],
  },
  {
    id: "anvisa_devices",
    name: "Registro ANVISA - Dispositivos",
    description: "Relatório de dispositivos médicos e equipamentos",
    category: "regulatory",
    formats: ["PDF", "XML", "CSV"],
    frequency: ["manual", "monthly", "annually"],
    regulation: "RDC 185/2001",
    fields: [
      "equipamentos_registrados",
      "manutencoes_realizadas",
      "eventos_adversos",
      "calibracoes_metrologia",
      "responsavel_tecnico",
    ],
  },
  {
    id: "cfm_professional",
    name: "Relatório CFM - Ética Profissional",
    description: "Relatório de conformidade ética e profissional",
    category: "professional",
    formats: ["PDF", "DOCX"],
    frequency: ["manual", "quarterly", "annually"],
    regulation: "Resolução CFM 2.314/2022",
    fields: [
      "profissionais_ativos",
      "especializacoes_registradas",
      "atendimentos_telemedicina",
      "prontuarios_eletronicos",
      "consentimentos_informados",
    ],
  },
  {
    id: "financial_summary",
    name: "Resumo Financeiro",
    description: "Relatório financeiro para auditoria e compliance",
    category: "financial",
    formats: ["PDF", "XLSX", "CSV"],
    frequency: ["manual", "monthly", "quarterly"],
    regulation: "RFB - Receita Federal",
    fields: [
      "receitas_procedimentos",
      "custos_operacionais",
      "tributos_recolhidos",
      "pagamentos_profissionais",
      "investimentos_equipamentos",
    ],
  },
  {
    id: "patient_anonymized",
    name: "Dados Anonimizados - Pesquisa",
    description: "Dados de pacientes anonimizados para pesquisa médica",
    category: "research",
    formats: ["CSV", "JSON", "XLSX"],
    frequency: ["manual", "quarterly"],
    regulation: "Resolução CNS 466/2012",
    fields: [
      "demografia_anonima",
      "procedimentos_realizados",
      "resultados_tratamento",
      "dados_epidemiologicos",
      "estatisticas_clinicas",
    ],
  },
  {
    id: "audit_trail",
    name: "Trilha de Auditoria",
    description: "Log completo de atividades do sistema",
    category: "security",
    formats: ["CSV", "JSON", "TXT"],
    frequency: ["manual", "daily", "weekly"],
    regulation: "ISO 27001",
    fields: [
      "logins_usuarios",
      "acesso_prontuarios",
      "modificacoes_dados",
      "exportacoes_realizadas",
      "falhas_seguranca",
    ],
  },
];

const dateRanges = [
  { value: "last_7_days", label: "Últimos 7 dias" },
  { value: "last_30_days", label: "Últimos 30 dias" },
  { value: "last_quarter", label: "Último trimestre" },
  { value: "last_year", label: "Último ano" },
  { value: "custom", label: "Período personalizado" },
];

const exportSchema = z
  .object({
    exportType: z.string().min(1, "Tipo de exportação é obrigatório"),
    format: z.string().min(1, "Formato é obrigatório"),
    dateRange: z.string().min(1, "Período é obrigatório"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    includePersonalData: z.boolean(),
    anonymizeData: z.boolean(),
    includeMetadata: z.boolean(),
    compressionEnabled: z.boolean(),
    passwordProtection: z.boolean(),
    password: z.string().optional(),
    notificationEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.dateRange === "custom") {
      if (!data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data inicial é obrigatória para período personalizado",
          path: ["startDate"],
        });
      }
      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data final é obrigatória para período personalizado",
          path: ["endDate"],
        });
      }
      if (data.startDate && data.endDate && data.startDate >= data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data final deve ser posterior à data inicial",
          path: ["endDate"],
        });
      }
    }

    if (data.passwordProtection && (!data.password || data.password.length < 8)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Senha deve ter pelo menos 8 caracteres",
        path: ["password"],
      });
    }
  });

type ExportFormData = z.infer<typeof exportSchema>;

interface ExportHistory {
  id: string;
  type: string;
  format: string;
  dateRange: string;
  createdAt: Date;
  status: "completed" | "processing" | "failed";
  fileSize?: string;
  downloadUrl?: string;
  expiresAt?: Date;
}

export default function DataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("export");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([
    {
      id: "1",
      type: "lgpd_compliance",
      format: "PDF",
      dateRange: "last_quarter",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "completed",
      fileSize: "2.1 MB",
      downloadUrl: "/exports/lgpd_q4_2024.pdf",
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      type: "anvisa_devices",
      format: "CSV",
      dateRange: "last_30_days",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "processing",
    },
  ]);

  const form = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      exportType: "",
      format: "",
      dateRange: "last_30_days",
      startDate: "",
      endDate: "",
      includePersonalData: false,
      anonymizeData: true,
      includeMetadata: true,
      compressionEnabled: true,
      passwordProtection: false,
      password: "",
      notificationEmail: "",
    },
  });

  const watchedExportType = form.watch("exportType");
  const watchedDateRange = form.watch("dateRange");
  const watchedPasswordProtection = form.watch("passwordProtection");

  const selectedExportType = exportTypes.find((type) => type.id === watchedExportType);

  const onSubmit = async (data: ExportFormData) => {
    setIsExporting(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/exports/generate", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });

      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newExport: ExportHistory = {
        id: Date.now().toString(),
        type: data.exportType,
        format: data.format,
        dateRange: data.dateRange,
        createdAt: new Date(),
        status: "processing",
      };

      setExportHistory((prev) => [newExport, ...prev]);

      toast.success("Exportação iniciada! Você será notificado quando estiver pronta.");
      form.reset();
    } catch (error) {
      console.error("Erro ao gerar exportação:", error);
      toast.error("Erro ao gerar exportação");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadExport = (exportItem: ExportHistory) => {
    if (exportItem.downloadUrl) {
      // TODO: Implement secure download with authentication
      window.open(exportItem.downloadUrl, "_blank");
      toast.success("Download iniciado");
    }
  };

  const filteredExportTypes =
    selectedCategory === "all"
      ? exportTypes
      : exportTypes.filter((type) => type.category === selectedCategory);

  const getStatusBadge = (status: ExportHistory["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processando</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExportTypeInfo = (typeId: string) => {
    return exportTypes.find((type) => type.id === typeId);
  };

  return (
    <div className="space-y-6">
      {/* Brazilian Compliance Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Conformidade Brasileira:</strong> Todas as exportações seguem as regulamentações
          LGPD, ANVISA e CFM. Dados sensíveis são automaticamente protegidos e anonimizados quando
          necessário.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Nova Exportação
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendadas
          </TabsTrigger>
        </TabsList>

        {/* New Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Export Types Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tipos de Exportação</CardTitle>
                      <CardDescription>Selecione o tipo de dados para exportar</CardDescription>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        <SelectItem value="compliance">Conformidade</SelectItem>
                        <SelectItem value="regulatory">Regulatório</SelectItem>
                        <SelectItem value="professional">Profissional</SelectItem>
                        <SelectItem value="financial">Financeiro</SelectItem>
                        <SelectItem value="research">Pesquisa</SelectItem>
                        <SelectItem value="security">Segurança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredExportTypes.map((exportType) => (
                      <div
                        key={exportType.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          watchedExportType === exportType.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => form.setValue("exportType", exportType.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{exportType.name}</h4>
                          <input
                            type="radio"
                            checked={watchedExportType === exportType.id}
                            onChange={() => form.setValue("exportType", exportType.id)}
                            className="mt-1"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{exportType.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {exportType.regulation}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {exportType.formats.map((format) => (
                              <Badge key={format} variant="secondary" className="text-xs">
                                {format}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Configuration */}
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações</CardTitle>
                      <CardDescription>Configure os parâmetros da exportação</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedExportType && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">
                            {selectedExportType.name}
                          </h4>
                          <p className="text-sm text-blue-700">{selectedExportType.description}</p>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="format"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Formato</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o formato" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedExportType?.formats.map((format) => (
                                  <SelectItem key={format} value={format}>
                                    {format}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Período</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o período" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dateRanges.map((range) => (
                                  <SelectItem key={range.value} value={range.value}>
                                    {range.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchedDateRange === "custom" && (
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data Inicial</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data Final</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <div className="space-y-4 border-t pt-4">
                        <h4 className="font-medium">Opções de Privacidade</h4>

                        <FormField
                          control={form.control}
                          name="anonymizeData"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Anonimizar Dados</FormLabel>
                                <FormDescription className="text-xs">
                                  Remove informações pessoais identificáveis
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="includeMetadata"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Incluir Metadados</FormLabel>
                                <FormDescription className="text-xs">
                                  Informações sobre origem e processamento
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="compressionEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Compressão</FormLabel>
                                <FormDescription className="text-xs">
                                  Reduzir tamanho do arquivo
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="passwordProtection"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Proteção por Senha</FormLabel>
                                <FormDescription className="text-xs">
                                  Adicionar senha ao arquivo
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {watchedPasswordProtection && (
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Mínimo 8 caracteres"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="notificationEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email de Notificação</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@clinica.com.br" {...field} />
                              </FormControl>
                              <FormDescription>
                                Será notificado quando a exportação estiver pronta
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={!watchedExportType || isExporting}
                        className="w-full"
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gerando Exportação...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Gerar Exportação
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Exportações</CardTitle>
              <CardDescription>Exportações realizadas nos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {exportHistory.length === 0 ? (
                <div className="text-center p-8">
                  <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma exportação encontrada
                  </h3>
                  <p className="text-gray-600">Suas exportações aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exportHistory.map((exportItem) => {
                    const typeInfo = getExportTypeInfo(exportItem.type);
                    return (
                      <div key={exportItem.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <h4 className="font-medium">{typeInfo?.name || exportItem.type}</h4>
                              <p className="text-sm text-gray-600">
                                {exportItem.format} • {exportItem.dateRange}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(exportItem.status)}
                            {exportItem.status === "completed" && exportItem.downloadUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadExport(exportItem)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {exportItem.createdAt.toLocaleDateString("pt-BR")} às{" "}
                              {exportItem.createdAt.toLocaleTimeString("pt-BR")}
                            </span>
                            {exportItem.fileSize && (
                              <span className="flex items-center gap-1">
                                <Database className="h-3 w-3" />
                                {exportItem.fileSize}
                              </span>
                            )}
                          </div>
                          {exportItem.expiresAt && (
                            <span className="flex items-center gap-1 text-orange-600">
                              <AlertCircle className="h-3 w-3" />
                              Expira em{" "}
                              {Math.ceil(
                                (exportItem.expiresAt.getTime() - Date.now()) /
                                  (1000 * 60 * 60 * 24),
                              )}{" "}
                              dias
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exportações Agendadas</CardTitle>
                  <CardDescription>Configure exportações automáticas recorrentes</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Exportação
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma exportação agendada
                </h3>
                <p className="text-gray-600 mb-4">
                  Configure exportações automáticas para relatórios regulares
                </p>
                <Button variant="outline">Configurar Primeira Exportação</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

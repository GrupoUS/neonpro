"use client";

import type { useState, useEffect } from "react";
import type { useForm, useFieldArray } from "react-hook-form";
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
import type { Textarea } from "@/components/ui/textarea";
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
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Loader2,
  Eye,
  Download,
  Upload,
} from "lucide-react";
import type { toast } from "sonner";

const licenseTypes = [
  {
    value: "anvisa_estabelecimento",
    label: "ANVISA - Licença de Funcionamento",
    authority: "ANVISA",
  },
  { value: "anvisa_responsavel", label: "ANVISA - Responsável Técnico", authority: "ANVISA" },
  { value: "anvisa_equipamentos", label: "ANVISA - Registro de Equipamentos", authority: "ANVISA" },
  { value: "crm_clinica", label: "CRM - Registro da Clínica", authority: "CRM" },
  { value: "cfm_telemedicina", label: "CFM - Certificação Telemedicina", authority: "CFM" },
  {
    value: "vigilancia_sanitaria",
    label: "Vigilância Sanitária Municipal",
    authority: "Vigilância Sanitária",
  },
  { value: "bombeiros", label: "Corpo de Bombeiros - AVCB", authority: "Corpo de Bombeiros" },
  { value: "prefeitura", label: "Prefeitura - Alvará de Funcionamento", authority: "Prefeitura" },
  { value: "inmetro", label: "INMETRO - Equipamentos", authority: "INMETRO" },
];

const complianceCategories = [
  { value: "medical_devices", label: "Dispositivos Médicos", regulation: "RDC 185/2001" },
  { value: "data_protection", label: "Proteção de Dados", regulation: "LGPD Lei 13.709/2018" },
  {
    value: "professional_ethics",
    label: "Ética Profissional",
    regulation: "Resolução CFM 2.314/2022",
  },
  { value: "telemedicine", label: "Telemedicina", regulation: "Resolução CFM 2.314/2022" },
  { value: "waste_management", label: "Gerenciamento de Resíduos", regulation: "RDC 222/2018" },
  { value: "building_safety", label: "Segurança Predial", regulation: "NBR 9050" },
];

const licenseSchema = z.object({
  type: z.string().min(1, "Tipo de licença é obrigatório"),
  number: z.string().min(1, "Número da licença é obrigatório"),
  authority: z.string().min(1, "Órgão emissor é obrigatório"),
  issueDate: z.string(),
  expiryDate: z.string(),
  status: z.enum(["active", "expired", "pending", "suspended"]),
  notes: z.string().optional(),
  documentUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  reminderDays: z.number().min(0).max(365),
});

const auditLogSchema = z.object({
  date: z.string(),
  category: z.string(),
  description: z.string(),
  responsible: z.string(),
  evidence: z.string().optional(),
  status: z.enum(["compliant", "non_compliant", "pending"]),
});

const complianceSettingsSchema = z.object({
  // Licenses
  licenses: z.array(licenseSchema),

  // LGPD Compliance
  lgpdCompliance: z.object({
    dataProtectionOfficer: z.string().optional(),
    dpoEmail: z.string().email("Email inválido").optional().or(z.literal("")),
    privacyImpactAssessment: z.boolean(),
    consentManagement: z.boolean(),
    dataRetentionPolicy: z.boolean(),
    breachNotificationProcess: z.boolean(),
    thirdPartyAgreements: z.boolean(),
  }),

  // ANVISA Compliance
  anvisaCompliance: z.object({
    medicalDeviceRegistry: z.boolean(),
    adverseEventReporting: z.boolean(),
    qualityManagementSystem: z.boolean(),
    technicalResponsible: z.string().optional(),
    technicalResponsibleCrm: z.string().optional(),
  }),

  // CFM Compliance
  cfmCompliance: z.object({
    professionalEthics: z.boolean(),
    telemedicineCompliance: z.boolean(),
    medicalRecordsSecurity: z.boolean(),
    patientPrivacy: z.boolean(),
    informedConsent: z.boolean(),
  }),

  // Audit Logs
  auditLogs: z.array(auditLogSchema),

  // Notifications
  enableExpiryAlerts: z.boolean(),
  alertDaysBefore: z.number().min(1).max(365),
  notificationEmails: z.array(z.string().email()),
});

type ComplianceSettingsFormData = z.infer<typeof complianceSettingsSchema>;

interface ComplianceScore {
  category: string;
  score: number;
  maxScore: number;
  items: {
    name: string;
    compliant: boolean;
    required: boolean;
  }[];
}

export default function ComplianceSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("licenses");
  const [complianceScores, setComplianceScores] = useState<ComplianceScore[]>([]);

  const form = useForm<ComplianceSettingsFormData>({
    resolver: zodResolver(complianceSettingsSchema),
    defaultValues: {
      licenses: [],
      lgpdCompliance: {
        dataProtectionOfficer: "",
        dpoEmail: "",
        privacyImpactAssessment: false,
        consentManagement: false,
        dataRetentionPolicy: false,
        breachNotificationProcess: false,
        thirdPartyAgreements: false,
      },
      anvisaCompliance: {
        medicalDeviceRegistry: false,
        adverseEventReporting: false,
        qualityManagementSystem: false,
        technicalResponsible: "",
        technicalResponsibleCrm: "",
      },
      cfmCompliance: {
        professionalEthics: false,
        telemedicineCompliance: false,
        medicalRecordsSecurity: false,
        patientPrivacy: false,
        informedConsent: false,
      },
      auditLogs: [],
      enableExpiryAlerts: true,
      alertDaysBefore: 30,
      notificationEmails: [],
    },
  });

  const {
    fields: licenseFields,
    append: appendLicense,
    remove: removeLicense,
  } = useFieldArray({
    control: form.control,
    name: "licenses",
  });

  const {
    fields: auditLogFields,
    append: appendAuditLog,
    remove: removeAuditLog,
  } = useFieldArray({
    control: form.control,
    name: "auditLogs",
  });

  // Calculate compliance scores
  useEffect(() => {
    const calculateScores = () => {
      const lgpdData = form.watch("lgpdCompliance");
      const anvisaData = form.watch("anvisaCompliance");
      const cfmData = form.watch("cfmCompliance");

      const scores: ComplianceScore[] = [
        {
          category: "LGPD",
          score: Object.values(lgpdData).filter((v) => v === true).length,
          maxScore: 5,
          items: [
            {
              name: "Avaliação de Impacto",
              compliant: lgpdData.privacyImpactAssessment,
              required: true,
            },
            {
              name: "Gestão de Consentimento",
              compliant: lgpdData.consentManagement,
              required: true,
            },
            {
              name: "Política de Retenção",
              compliant: lgpdData.dataRetentionPolicy,
              required: true,
            },
            {
              name: "Processo de Vazamento",
              compliant: lgpdData.breachNotificationProcess,
              required: true,
            },
            {
              name: "Acordos com Terceiros",
              compliant: lgpdData.thirdPartyAgreements,
              required: false,
            },
          ],
        },
        {
          category: "ANVISA",
          score: Object.values(anvisaData).filter((v) => v === true).length,
          maxScore: 3,
          items: [
            {
              name: "Registro de Dispositivos",
              compliant: anvisaData.medicalDeviceRegistry,
              required: true,
            },
            {
              name: "Notificação de Eventos",
              compliant: anvisaData.adverseEventReporting,
              required: true,
            },
            {
              name: "Sistema de Qualidade",
              compliant: anvisaData.qualityManagementSystem,
              required: true,
            },
          ],
        },
        {
          category: "CFM",
          score: Object.values(cfmData).filter((v) => v === true).length,
          maxScore: 5,
          items: [
            { name: "Ética Profissional", compliant: cfmData.professionalEthics, required: true },
            { name: "Telemedicina", compliant: cfmData.telemedicineCompliance, required: false },
            {
              name: "Segurança Prontuários",
              compliant: cfmData.medicalRecordsSecurity,
              required: true,
            },
            { name: "Privacidade Paciente", compliant: cfmData.patientPrivacy, required: true },
            { name: "Consentimento Informado", compliant: cfmData.informedConsent, required: true },
          ],
        },
      ];

      setComplianceScores(scores);
    };

    calculateScores();
  }, [form.watch()]);

  // Load existing settings
  useEffect(() => {
    const loadComplianceSettings = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch("/api/settings/compliance");
        // const data = await response.json();
        // form.reset(data);
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast.error("Erro ao carregar configurações de conformidade");
      } finally {
        setIsLoading(false);
      }
    };

    loadComplianceSettings();
  }, [form]);

  const onSubmit = async (data: ComplianceSettingsFormData) => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      // await fetch("/api/settings/compliance", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });

      setLastSaved(new Date());
      toast.success("Configurações de conformidade salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0)
      return { status: "expired", label: "Vencida", color: "bg-red-100 text-red-800" };
    if (diffDays <= 30)
      return { status: "expiring", label: "Vencendo", color: "bg-yellow-100 text-yellow-800" };
    return { status: "valid", label: "Válida", color: "bg-green-100 text-green-800" };
  };

  const getCompliancePercentage = () => {
    const totalScore = complianceScores.reduce((sum, score) => sum + score.score, 0);
    const totalMaxScore = complianceScores.reduce((sum, score) => sum + score.maxScore, 0);
    return totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Índice de Conformidade Geral
          </CardTitle>
          <CardDescription>Status consolidado da conformidade regulatória</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{getCompliancePercentage()}% Conforme</span>
              <Badge
                className={
                  getCompliancePercentage() >= 80
                    ? "bg-green-100 text-green-800"
                    : getCompliancePercentage() >= 60
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }
              >
                {getCompliancePercentage() >= 80
                  ? "Excelente"
                  : getCompliancePercentage() >= 60
                    ? "Boa"
                    : "Crítica"}
              </Badge>
            </div>

            <Progress value={getCompliancePercentage()} className="h-3" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {complianceScores.map((score) => (
                <div key={score.category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{score.category}</h4>
                    <Badge variant="outline">
                      {score.score}/{score.maxScore}
                    </Badge>
                  </div>
                  <Progress value={(score.score / score.maxScore) * 100} className="h-2 mb-3" />
                  <div className="space-y-1">
                    {score.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {item.compliant ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-600" />
                        )}
                        <span className={item.required ? "font-medium" : ""}>
                          {item.name}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="licenses">Licenças</TabsTrigger>
              <TabsTrigger value="lgpd">LGPD</TabsTrigger>
              <TabsTrigger value="anvisa">ANVISA</TabsTrigger>
              <TabsTrigger value="cfm">CFM</TabsTrigger>
            </TabsList>

            {/* Licenses Tab */}
            <TabsContent value="licenses" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Licenças e Certificações</CardTitle>
                      <CardDescription>
                        Gerenciar licenças de funcionamento e certificações
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      onClick={() =>
                        appendLicense({
                          type: "",
                          number: "",
                          authority: "",
                          issueDate: "",
                          expiryDate: "",
                          status: "active",
                          notes: "",
                          documentUrl: "",
                          reminderDays: 30,
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Licença
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {licenseFields.length === 0 ? (
                    <div className="text-center p-8">
                      <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma licença cadastrada
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Adicione as licenças e certificações da clínica
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {licenseFields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Licença #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeLicense(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`licenses.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de Licença</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {licenseTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
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
                              name={`licenses.${index}.number`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número da Licença</FormLabel>
                                  <FormControl>
                                    <Input placeholder="ABC123456" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`licenses.${index}.authority`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Órgão Emissor</FormLabel>
                                  <FormControl>
                                    <Input placeholder="ANVISA, CRM, etc." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`licenses.${index}.status`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="active">Ativa</SelectItem>
                                      <SelectItem value="expired">Vencida</SelectItem>
                                      <SelectItem value="pending">Pendente</SelectItem>
                                      <SelectItem value="suspended">Suspensa</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`licenses.${index}.issueDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data de Emissão</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`licenses.${index}.expiryDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data de Vencimento</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  {field.value && (
                                    <div className="mt-1">
                                      <Badge className={getExpiryStatus(field.value).color}>
                                        {getExpiryStatus(field.value).label}
                                      </Badge>
                                    </div>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="mt-4 space-y-4">
                            <FormField
                              control={form.control}
                              name={`licenses.${index}.documentUrl`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL do Documento</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://..." {...field} className="pr-10" />
                                  </FormControl>
                                  {field.value && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(field.value, "_blank")}
                                      className="absolute right-2 top-8"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`licenses.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Observações</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Observações sobre a licença..."
                                      className="resize-none"
                                      rows={2}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* LGPD Tab */}
            <TabsContent value="lgpd" className="space-y-6">
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>
                  <strong>LGPD (Lei 13.709/2018):</strong> A Lei Geral de Proteção de Dados exige
                  conformidade obrigatória para clínicas que processam dados pessoais de pacientes.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Conformidade LGPD</CardTitle>
                  <CardDescription>
                    Configurações para conformidade com a Lei Geral de Proteção de Dados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lgpdCompliance.dataProtectionOfficer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Encarregado de Dados (DPO)</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do responsável" {...field} />
                          </FormControl>
                          <FormDescription>
                            Pessoa responsável pela proteção de dados
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lgpdCompliance.dpoEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email do DPO</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="dpo@clinica.com.br" {...field} />
                          </FormControl>
                          <FormDescription>Email para contato sobre dados pessoais</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Requisitos de Conformidade</h4>

                    <FormField
                      control={form.control}
                      name="lgpdCompliance.privacyImpactAssessment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Avaliação de Impacto à Proteção de Dados
                              <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <FormDescription>
                              RIPD realizada para atividades de alto risco
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
                      name="lgpdCompliance.consentManagement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Gestão de Consentimento
                              <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <FormDescription>
                              Sistema para gerenciar consentimentos dos pacientes
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
                      name="lgpdCompliance.dataRetentionPolicy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Política de Retenção de Dados
                              <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <FormDescription>
                              Definição de prazos para manutenção dos dados
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
                      name="lgpdCompliance.breachNotificationProcess"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Processo de Notificação de Vazamentos
                              <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <FormDescription>
                              Procedimento para notificar ANPD e titulares em até 72h
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
                      name="lgpdCompliance.thirdPartyAgreements"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Acordos com Terceiros</FormLabel>
                            <FormDescription>
                              Contratos de compartilhamento de dados com parceiros
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ANVISA Tab */}
            <TabsContent value="anvisa" className="space-y-6">
              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertDescription>
                  <strong>ANVISA:</strong> Agência Nacional de Vigilância Sanitária regula
                  dispositivos médicos e estabelecimentos de saúde no Brasil.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Conformidade ANVISA</CardTitle>
                  <CardDescription>
                    Requisitos para funcionamento de estabelecimentos de saúde
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="anvisaCompliance.technicalResponsible"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável Técnico</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. João Silva" {...field} />
                          </FormControl>
                          <FormDescription>
                            Profissional responsável técnico perante ANVISA
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="anvisaCompliance.technicalResponsibleCrm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CRM do Responsável</FormLabel>
                          <FormControl>
                            <Input placeholder="123456/SP" {...field} />
                          </FormControl>
                          <FormDescription>Número do CRM do responsável técnico</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Requisitos Obrigatórios</h4>

                    <FormField
                      control={form.control}
                      name="anvisaCompliance.medicalDeviceRegistry"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Registro de Dispositivos Médicos
                              <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <FormDescription>
                              Todos os equipamentos médicos registrados na ANVISA
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
                      name="anvisaCompliance.adverseEventReporting"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Notificação de Eventos Adversos
                              <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <FormDescription>
                              Sistema para reportar eventos adversos ao SNVS
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
                      name="anvisaCompliance.qualityManagementSystem"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Sistema de Gestão da Qualidade
                              <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <FormDescription>SGQ implementado conforme RDC 16/2013</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CFM Tab */}
            <TabsContent value="cfm" className="space-y-6">
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>
                  <strong>CFM:</strong> Conselho Federal de Medicina regula o exercício da medicina
                  e a telemedicina no Brasil.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Conformidade CFM</CardTitle>
                  <CardDescription>
                    Requisitos éticos e profissionais para prática médica
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cfmCompliance.professionalEthics"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Código de Ética Médica
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormDescription>
                            Cumprimento do Código de Ética Médica (Resolução CFM 2.217/2018)
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
                    name="cfmCompliance.telemedicineCompliance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Conformidade Telemedicina</FormLabel>
                          <FormDescription>
                            Atendimento conforme Resolução CFM 2.314/2022
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
                    name="cfmCompliance.medicalRecordsSecurity"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Segurança dos Prontuários
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormDescription>
                            Prontuários eletrônicos seguros conforme CFM 1.821/2007
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
                    name="cfmCompliance.patientPrivacy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Privacidade do Paciente
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormDescription>Sigilo médico e proteção da privacidade</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cfmCompliance.informedConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Consentimento Informado
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormDescription>
                            Processo de consentimento livre e esclarecido
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {lastSaved && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Salvo em {lastSaved.toLocaleTimeString()}
                </>
              )}
            </div>
            <Button type="submit" disabled={isSaving} className="min-w-32">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Conformidade
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

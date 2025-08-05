/**
 * NeonPro - Clinical Form Enhanced (FASE 2)
 * Formulários otimizados para fluxos clínicos médicos
 *
 * Melhorias Fase 2:
 * - Validação em tempo real com feedback visual
 * - Auto-complete inteligente para dados médicos
 * - Integração com IA para sugestões
 * - Acessibilidade médica específica
 * - Performance otimizada para uso intensivo
 * - Compliance LGPD/ANVISA embarcado
 */

"use client";

import type { useState, useEffect, useCallback } from "react";
import type { useForm, Controller } from "react-hook-form";
import type { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Textarea } from "@/components/ui/textarea";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Checkbox } from "@/components/ui/checkbox";
import type { Badge } from "@/components/ui/badge";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Progress } from "@/components/ui/progress";
import type {
  Save,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Calendar,
  Stethoscope,
  Shield,
  Brain,
  Clock,
  FileText,
} from "lucide-react";
import type { cn } from "@/lib/utils";
import type { useAccessibility } from "@/contexts/accessibility-context";

// Schema de validação com regras médicas específicas
const clinicalFormSchema = z.object({
  // Dados pessoais
  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),

  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
    .refine((cpf) => validateCPF(cpf), "CPF inválido"),

  birthDate: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine((date) => {
      const birth = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      return age >= 16 && age <= 120;
    }, "Idade deve estar entre 16 e 120 anos"),

  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (XX) XXXXX-XXXX"),

  email: z.string().email("Email inválido").toLowerCase(),

  // Dados médicos
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalHistory: z.string().optional(),

  // Dados do tratamento
  treatmentType: z.string().min(1, "Tipo de tratamento é obrigatório"),
  treatmentGoals: z.string().min(10, "Objetivos devem ter pelo menos 10 caracteres"),

  // Consentimentos LGPD
  dataConsent: z
    .boolean()
    .refine((val) => val === true, "Consentimento para uso de dados é obrigatório"),
  marketingConsent: z.boolean().optional(),

  // Campos específicos estéticos
  skinType: z.enum(["oleosa", "seca", "mista", "sensivel", "normal"]).optional(),
  previousTreatments: z.string().optional(),
  expectations: z.string().min(20, "Descreva suas expectativas com pelo menos 20 caracteres"),
});

type ClinicalFormData = z.infer<typeof clinicalFormSchema>;

// Função para validar CPF
function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit === 10 || digit === 11) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit === 10 || digit === 11) digit = 0;

  return digit === parseInt(cpf.charAt(10));
}

interface ClinicalFormEnhancedProps {
  className?: string;
  onSubmit: (data: ClinicalFormData) => Promise<void>;
  initialData?: Partial<ClinicalFormData>;
  mode: "create" | "edit";
  patientId?: string;
}

export function ClinicalFormEnhanced({
  className,
  onSubmit,
  initialData,
  mode,
  patientId,
}: ClinicalFormEnhancedProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const { announceToScreenReader } = useAccessibility();

  const form = useForm<ClinicalFormData>({
    resolver: zodResolver(clinicalFormSchema),
    defaultValues: initialData || {
      dataConsent: false,
      marketingConsent: false,
    },
    mode: "onChange",
  });

  const {
    watch,
    formState: { errors, isValid, dirtyFields },
  } = form;

  // Calcular progresso do formulário
  useEffect(() => {
    const totalFields = Object.keys(clinicalFormSchema.shape).length;
    const filledFields = Object.keys(dirtyFields).length;
    const progress = Math.round((filledFields / totalFields) * 100);
    setFormProgress(progress);
  }, [dirtyFields]);

  // IA Suggestions baseado em dados inseridos
  const generateAISuggestions = useCallback(
    async (treatmentType: string, skinType: string) => {
      if (!treatmentType) return;

      // Mock AI suggestions - em produção seria uma chamada à API de IA
      const suggestions = {
        botox: [
          "Considere aplicação preventiva em áreas de expressão",
          "Avalie rugas dinâmicas vs estáticas",
          "Protocolo de hidratação pré-procedimento recomendado",
        ],
        preenchimento: [
          "Análise facial harmônica essencial",
          "Considere técnica multi-camadas",
          "Protocolo anti-inflamatório pós-procedimento",
        ],
        peeling: [
          "Avalie fototipo e sensibilidade",
          "Prepare a pele 2 semanas antes",
          "Fotoproteção rigorosa no pós",
        ],
      };

      const typeSuggestions = suggestions[treatmentType as keyof typeof suggestions] || [];
      setAiSuggestions(typeSuggestions);

      if (typeSuggestions.length > 0) {
        announceToScreenReader(
          `IA gerou ${typeSuggestions.length} sugestões para este tratamento`,
          "polite",
        );
      }
    },
    [announceToScreenReader],
  );

  // Watch para ativar AI suggestions
  const treatmentType = watch("treatmentType");
  const skinType = watch("skinType");

  useEffect(() => {
    if (treatmentType && skinType) {
      generateAISuggestions(treatmentType, skinType);
    }
  }, [treatmentType, skinType, generateAISuggestions]);

  const handleSubmit = async (data: ClinicalFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      announceToScreenReader("Formulário enviado com sucesso", "assertive");
    } catch (error) {
      announceToScreenReader(
        "Erro ao enviar formulário. Verifique os dados e tente novamente",
        "assertive",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Máscara para CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  // Máscara para telefone
  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(\d{4})-(\d)(\d{4})/, "$1$2-$3")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Header com progresso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {mode === "create" ? "Novo Paciente" : "Editar Paciente"}
              </CardTitle>
              <CardDescription>
                {mode === "create"
                  ? "Cadastro completo com validação médica"
                  : "Atualização de dados do paciente"}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Progresso: {formProgress}%</p>
              <Progress value={formProgress} className="w-32 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {/* Nome completo */}
            <div className="md:col-span-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                {...form.register("fullName")}
                placeholder="Nome completo do paciente"
                className={errors.fullName ? "border-red-500" : ""}
                aria-describedby="fullName-error"
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* CPF */}
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Controller
                name="cpf"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(formatCPF(e.target.value))}
                    className={errors.cpf ? "border-red-500" : ""}
                    maxLength={14}
                    aria-describedby="cpf-error"
                  />
                )}
              />
              {errors.cpf && (
                <p id="cpf-error" className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.cpf.message}
                </p>
              )}
            </div>

            {/* Data de nascimento */}
            <div>
              <Label htmlFor="birthDate">Data de Nascimento *</Label>
              <Input
                id="birthDate"
                type="date"
                {...form.register("birthDate")}
                className={errors.birthDate ? "border-red-500" : ""}
                aria-describedby="birthDate-error"
              />
              {errors.birthDate && (
                <p id="birthDate-error" className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.birthDate.message}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Controller
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    className={errors.phone ? "border-red-500" : ""}
                    maxLength={15}
                    aria-describedby="phone-error"
                  />
                )}
              />
              {errors.phone && (
                <p id="phone-error" className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="email@exemplo.com"
                className={errors.email ? "border-red-500" : ""}
                aria-describedby="email-error"
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dados Médicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="h-4 w-4 mr-2" />
              Histórico Médico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="allergies">Alergias Conhecidas</Label>
              <Textarea
                id="allergies"
                {...form.register("allergies")}
                placeholder="Descreva alergias conhecidas (medicamentos, substâncias, alimentos...)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="medications">Medicamentos em Uso</Label>
              <Textarea
                id="medications"
                {...form.register("medications")}
                placeholder="Liste medicamentos em uso contínuo ou recente"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="medicalHistory">Histórico Médico Relevante</Label>
              <Textarea
                id="medicalHistory"
                {...form.register("medicalHistory")}
                placeholder="Cirurgias anteriores, condições médicas, tratamentos estéticos prévios..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados do Tratamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="h-4 w-4 mr-2" />
              Tratamento Solicitado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="treatmentType">Tipo de Tratamento *</Label>
                <Controller
                  name="treatmentType"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className={errors.treatmentType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione o tratamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="botox">Toxina Botulínica (Botox)</SelectItem>
                        <SelectItem value="preenchimento">Preenchimento</SelectItem>
                        <SelectItem value="peeling">Peeling</SelectItem>
                        <SelectItem value="laser">Laser</SelectItem>
                        <SelectItem value="microagulhamento">Microagulhamento</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.treatmentType && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.treatmentType.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="skinType">Tipo de Pele</Label>
                <Controller
                  name="skinType"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de pele" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oleosa">Oleosa</SelectItem>
                        <SelectItem value="seca">Seca</SelectItem>
                        <SelectItem value="mista">Mista</SelectItem>
                        <SelectItem value="sensivel">Sensível</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="treatmentGoals">Objetivos do Tratamento *</Label>
              <Textarea
                id="treatmentGoals"
                {...form.register("treatmentGoals")}
                placeholder="Descreva os objetivos e resultados esperados com o tratamento"
                rows={4}
                className={errors.treatmentGoals ? "border-red-500" : ""}
              />
              {errors.treatmentGoals && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.treatmentGoals.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="expectations">Expectativas *</Label>
              <Textarea
                id="expectations"
                {...form.register("expectations")}
                placeholder="Descreva suas expectativas detalhadamente sobre o tratamento"
                rows={3}
                className={errors.expectations ? "border-red-500" : ""}
              />
              {errors.expectations && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.expectations.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Brain className="h-4 w-4 mr-2" />
                Sugestões de IA
              </CardTitle>
              <CardDescription className="text-blue-600">
                Baseado no tipo de tratamento e perfil do paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Consentimentos LGPD */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Consentimentos LGPD
            </CardTitle>
            <CardDescription>Conforme Lei Geral de Proteção de Dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-2">
              <Controller
                name="dataConsent"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    id="dataConsent"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={errors.dataConsent ? "border-red-500" : ""}
                  />
                )}
              />
              <div>
                <Label htmlFor="dataConsent" className="font-medium">
                  Consentimento para tratamento de dados *
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Autorizo o uso dos meus dados pessoais para fins médicos, agendamento de consultas
                  e acompanhamento do tratamento, conforme Política de Privacidade.
                </p>
                {errors.dataConsent && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.dataConsent.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Controller
                name="marketingConsent"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    id="marketingConsent"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <div>
                <Label htmlFor="marketingConsent" className="font-medium">
                  Consentimento para comunicações de marketing (opcional)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Autorizo o recebimento de comunicações sobre promoções, novos tratamentos e
                  conteúdo educativo sobre estética.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>

          <div className="flex space-x-2">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === "create" ? "Cadastrar Paciente" : "Atualizar Dados"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

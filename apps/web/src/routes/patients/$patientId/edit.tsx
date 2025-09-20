/**
 * Patient Edit Route - Brazilian Healthcare Form with LGPD Compliance
 * Features: Comprehensive validation, accessibility, mobile-first design, LGPD consent management
 */

import { useAuth } from "@/hooks/useAuth";
import { usePatient, useUpdatePatient } from "@/hooks/usePatients";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@neonpro/ui";
import { Button } from "@neonpro/ui";
import { Input } from "@neonpro/ui";
import { Label } from "@neonpro/ui";
import { Textarea } from "@neonpro/ui";
import { Checkbox } from "@neonpro/ui";
import { Badge } from "@neonpro/ui";
import { Separator } from "@neonpro/ui";
import { formatBRPhone, formatCPF, validateCPFMask } from "@neonpro/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Phone,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Type-safe params schema
const patientParamsSchema = z.object({
  patientId: z.string().min(1),
});

// Form validation schema with Brazilian patterns
const patientFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),

  email: z
    .string()
    .optional()
    .refine((email) => !email || z.string().email().safeParse(email).success, {
      message: "Email inválido",
    }),

  phone: z
    .string()
    .optional()
    .refine(
      (phone) =>
        !phone ||
        /^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/.test(phone.replace(/\D/g, "")),
      {
        message: "Telefone deve estar no formato (11) 99999-9999",
      },
    ),

  cpf: z
    .string()
    .optional()
    .refine((cpf) => !cpf || validateCPFMask(cpf.replace(/\D/g, "")), {
      message: "CPF inválido",
    }),

  birthDate: z
    .string()
    .optional()
    .refine((date) => !date || new Date(date) <= new Date(), {
      message: "Data de nascimento não pode ser no futuro",
    }),

  notes: z
    .string()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional(),

  // LGPD Consent fields
  lgpdConsent: z.boolean(),
  dataProcessingConsent: z.boolean(),
  marketingConsent: z.boolean().optional(),
  dataShareConsent: z.boolean().optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

// Route definition
export const Route = createFileRoute("/patients/$patientId/edit")({
  // Type-safe parameter validation
  params: {
    parse: (params) => patientParamsSchema.parse(params),
    stringify: (params) => params,
  },

  // Loading component
  pendingComponent: () => (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  // Error boundary
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-lg mx-auto text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Erro ao Carregar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Não foi possível carregar os dados do paciente para edição.
          </p>
          <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
            {error.message}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="outline">
              Tentar Novamente
            </Button>
            <Button asChild>
              <Link to="/patients">Voltar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),

  component: PatientEditPage,
});

function PatientEditPage() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Data fetching and mutations
  const { data: patient, isLoading, error } = usePatient(patientId);
  const updatePatientMutation = useUpdatePatient();

  // Form setup with validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    reset: resetForm,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      lgpdConsent: true,
      dataProcessingConsent: true,
      marketingConsent: false,
      dataShareConsent: false,
    },
  });

  // Watch for changes to show unsaved changes warning
  const watchedFields = watch();
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Initialize form when patient data is loaded
  useEffect(() => {
    if (patient) {
      resetForm({
        fullName: patient.fullName || "",
        email: patient.email || "",
        phone: patient.phone || "",
        cpf: patient.cpf || "",
        birthDate: patient.birthDate || "",
        notes: "", // Add notes field to patient data if available
        lgpdConsent: true, // Set based on actual patient data
        dataProcessingConsent: true,
        marketingConsent: false,
        dataShareConsent: false,
      });
    }
  }, [patient, resetForm]);

  // Form submission handler
  const onSubmit = async (data: PatientFormData) => {
    try {
      if (
        !(user as any)?.user_metadata?.clinic_id &&
        !(user as any)?.clinic_id
      ) {
        toast.error("Clínica não identificada");
        return;
      }

      const clinicId =
        (user as any)?.user_metadata?.clinic_id || (user as any)?.clinic_id; // normalized any-cast for TS

      await updatePatientMutation.mutateAsync({
        patientId,
        data: {
          fullName: data.fullName,
          email: data.email || undefined,
          phone: data.phone || undefined,
          cpf: data.cpf || undefined,
          birthDate: data.birthDate || undefined,
        },
        clinicId,
      });

      setHasUnsavedChanges(false);
      toast.success("Dados do paciente atualizados com sucesso!");

      // Navigate back to patient details
      navigate({
        to: "/patients/$patientId",
        params: { patientId },
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar paciente");
    }
  };

  // Cancel handler with unsaved changes check
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "Há alterações não salvas. Deseja descartar as alterações?",
        )
      ) {
        navigate({
          to: "/patients/$patientId",
          params: { patientId },
        });
      }
    } else {
      navigate({
        to: "/patients/$patientId",
        params: { patientId },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card className="max-w-lg mx-auto text-center">
          <CardHeader>
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Erro ao Carregar Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os dados do paciente.
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link
              to="/patients"
              className="hover:text-foreground transition-colors"
            >
              Pacientes
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              to="/patients/$patientId"
              params={{ patientId }}
              className="hover:text-foreground transition-colors"
            >
              {patient.fullName}
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium" aria-current="page">
            Editar
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Editar Paciente
          </h1>
          <p className="text-muted-foreground">
            Atualize as informações de {patient.fullName}
          </p>
        </div>

        {/* Unsaved changes indicator */}
        {hasUnsavedChanges && (
          <Badge variant="outline" className="border-warning text-warning">
            Alterações não salvas
          </Badge>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Nome Completo *
                  </Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="Digite o nome completo"
                    className={errors.fullName ? "border-destructive" : ""}
                    aria-describedby={
                      errors.fullName ? "fullName-error" : undefined
                    }
                  />
                  {errors.fullName && (
                    <p id="fullName-error" className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label
                    htmlFor="cpf"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    CPF
                    <button
                      type="button"
                      onClick={() => setShowSensitiveData(!showSensitiveData)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={
                        showSensitiveData
                          ? "Ocultar dados sensíveis"
                          : "Mostrar dados sensíveis"
                      }
                    >
                      {showSensitiveData ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </Label>
                  <Input
                    id="cpf"
                    {...register("cpf")}
                    type={showSensitiveData ? "text" : "password"}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={errors.cpf ? "border-destructive" : ""}
                    aria-describedby={errors.cpf ? "cpf-error" : undefined}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      const formatted = formatCPF(digits);
                      setValue("cpf", formatted, { shouldValidate: true });
                    }}
                  />
                  {errors.cpf && (
                    <p id="cpf-error" className="text-sm text-destructive">
                      {errors.cpf.message}
                    </p>
                  )}
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-sm font-medium">
                    Data de Nascimento
                  </Label>
                  <Input
                    id="birthDate"
                    {...register("birthDate")}
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    className={errors.birthDate ? "border-destructive" : ""}
                    aria-describedby={
                      errors.birthDate ? "birthDate-error" : undefined
                    }
                  />
                  {errors.birthDate && (
                    <p
                      id="birthDate-error"
                      className="text-sm text-destructive"
                    >
                      {errors.birthDate.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="(11) 99999-9999"
                    className={errors.phone ? "border-destructive" : ""}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      const formatted = formatBRPhone(digits);
                      setValue("phone", formatted, { shouldValidate: true });
                    }}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    {...register("email")}
                    type="email"
                    placeholder="paciente@email.com"
                    className={errors.email ? "border-destructive" : ""}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Informações Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Adicione observações importantes sobre o paciente..."
                    rows={4}
                    maxLength={500}
                    className={errors.notes ? "border-destructive" : ""}
                    aria-describedby={errors.notes ? "notes-error" : undefined}
                  />
                  {errors.notes && (
                    <p id="notes-error" className="text-sm text-destructive">
                      {errors.notes.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {typeof watchedFields.notes === "string"
                      ? watchedFields.notes.length
                      : 0}
                    /500 caracteres
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* LGPD Compliance Sidebar */}
          <div className="space-y-6">
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Shield className="w-5 h-5" />
                  Conformidade LGPD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                  Gerencie os consentimentos do paciente conforme a Lei Geral de
                  Proteção de Dados.
                </div>

                {/* LGPD Consent */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="lgpdConsent"
                      {...register("lgpdConsent")}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="lgpdConsent"
                        className="text-sm font-medium leading-none"
                      >
                        Consentimento LGPD *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Paciente concorda com o tratamento dos seus dados
                        pessoais
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="dataProcessingConsent"
                      {...register("dataProcessingConsent")}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="dataProcessingConsent"
                        className="text-sm font-medium leading-none"
                      >
                        Processamento de Dados *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Autoriza o processamento para fins de atendimento médico
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketingConsent"
                      {...register("marketingConsent")}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="marketingConsent"
                        className="text-sm font-medium leading-none"
                      >
                        Marketing e Comunicações
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Aceita receber informações sobre promoções e novidades
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="dataShareConsent"
                      {...register("dataShareConsent")}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="dataShareConsent"
                        className="text-sm font-medium leading-none"
                      >
                        Compartilhamento de Dados
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Permite compartilhamento com parceiros para melhor
                        atendimento
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Todos os dados são protegidos por criptografia e auditados
                  conforme a LGPD.
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !isDirty}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Calendar,
  FileText,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

// Validation schema based on our Prisma model
const patientRegistrationSchema = z.object({
  clinic_id: z.string().uuid("Selecione uma clínica válida"),
  full_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(255, "Nome muito longo"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  medical_record_number: z.string().optional().or(z.literal("")),
  emergency_contact: z.string().optional().or(z.literal("")),
  insurance_provider: z.string().optional().or(z.literal("")),
  data_consent_given: z.boolean().default(false),
});

type PatientRegistrationData = z.infer<typeof patientRegistrationSchema>;

interface PatientRegistrationFormProps {
  clinicId?: string;
  onSuccess?: (patient: any) => void;
  onCancel?: () => void;
}

export default function PatientRegistrationFormPrisma({
  clinicId,
  onSuccess,
  onCancel,
}: PatientRegistrationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<PatientRegistrationData>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      clinic_id: clinicId || "",
      full_name: "",
      email: "",
      phone: "",
      birth_date: "",
      medical_record_number: "",
      emergency_contact: "",
      insurance_provider: "",
      data_consent_given: false,
    },
  });

  const onSubmit = async (data: PatientRegistrationData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Convert empty strings to undefined for optional fields
      const cleanedData = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        birth_date: data.birth_date ? new Date(data.birth_date).toISOString() : undefined,
        medical_record_number: data.medical_record_number || undefined,
        emergency_contact: data.emergency_contact || undefined,
        insurance_provider: data.insurance_provider || undefined,
      };

      const response = await fetch("/api/prisma/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Paciente cadastrado com sucesso!",
        description: `${data.full_name} foi adicionado ao sistema.`,
      });

      if (onSuccess) {
        onSuccess(result.patient);
      } else {
        router.push(`/pacientes/${result.patient.id}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setSubmitError(errorMessage);
      toast({
        title: "Erro ao cadastrar paciente",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const watchBirthDate = form.watch("birth_date");
  const watchDataConsent = form.watch("data_consent_given");
  const age = calculateAge(watchBirthDate);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          Cadastro de Novo Paciente (Prisma)
          <Badge variant="outline" className="ml-2">
            LGPD Compliant
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {submitError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Básicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Clinic Selection */}
                <FormField
                  control={form.control}
                  name="clinic_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clínica *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!!clinicId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a clínica" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* In production, load clinics from API */}
                          <SelectItem value="clinic-1">Clínica Principal</SelectItem>
                          <SelectItem value="clinic-2">Filial Centro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome completo do paciente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input placeholder="(11) 99999-9999" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Birth Date */}
                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input type="date" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      {age !== null && (
                        <FormDescription>Idade calculada: {age} anos</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Medical Record Number */}
                <FormField
                  control={form.control}
                  name="medical_record_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Prontuário</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input placeholder="Ex: PR-2024-001" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Se não preenchido, será gerado automaticamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Adicionais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Emergency Contact */}
                <FormField
                  control={form.control}
                  name="emergency_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contato de Emergência</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nome, telefone e relação com o paciente"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Insurance Provider */}
                <FormField
                  control={form.control}
                  name="insurance_provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Convênio/Plano de Saúde</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Unimed, Bradesco Saúde, SUS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* LGPD Compliance Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Consentimento LGPD
              </h3>

              <FormField
                control={form.control}
                name="data_consent_given"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium">
                        Consentimento para tratamento de dados pessoais *
                      </FormLabel>
                      <FormDescription>
                        O paciente autoriza o tratamento de seus dados pessoais para fins de
                        prestação de serviços de saúde, conforme previsto na LGPD (Lei 13.709/2018).
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!watchDataConsent && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    O consentimento LGPD é obrigatório para o cadastro do paciente. Sem o
                    consentimento, não será possível prosseguir com o tratamento dos dados pessoais.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting || !watchDataConsent}
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Cadastrando..." : "Cadastrar Paciente"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

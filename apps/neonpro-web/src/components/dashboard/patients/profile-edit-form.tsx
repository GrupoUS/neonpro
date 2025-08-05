"use client";

import type { useState, useEffect } from "react";
import type { useForm, useFieldArray, Controller } from "react-hook-form";
import type { zodResolver } from "@hookform/resolvers/zod";
import type { toast } from "sonner";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Textarea } from "@/components/ui/textarea";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Badge } from "@/components/ui/badge";
import type { Separator } from "@/components/ui/separator";
import type {
  AlertCircle,
  Shield,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Plus,
  Trash2,
  Save,
  RefreshCw,
} from "lucide-react";
import type { PatientProfileSchema, PatientProfile } from "@/lib/validations/patient-profile";
import type { useLgpdConsent } from "@/hooks/use-lgpd-consent";

interface PatientProfileEditFormProps {
  patientId: string;
  initialData?: Partial<PatientProfile>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PatientProfileEditForm({
  patientId,
  initialData,
  onSuccess,
  onCancel,
}: PatientProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLgpdInfo, setShowLgpdInfo] = useState(false);

  const {
    recordConsent,
    updateConsent,
    logDataModification,
    checkConsentValidity,
    isLoading: consentLoading,
  } = useLgpdConsent();

  const form = useForm<PatientProfile>({
    resolver: zodResolver(PatientProfileSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      gender: "prefer_not_to_say",
      cpf: "",
      rg: "",
      phone: "",
      mobile: "",
      email: "",
      address: {
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      },
      contactPreferences: {
        allowEmail: false,
        allowSms: false,
        allowWhatsapp: false,
        allowPhone: false,
        allowMarketing: false,
        allowAppointmentReminders: true,
        allowHealthTips: false,
        bestTimeToContact: "anytime",
      },
      emergencyContacts: [],
      lgpdConsent: {
        dataProcessingConsent: false,
        sensitiveDataConsent: false,
        marketingConsent: false,
        dataRetentionAcknowledgment: false,
        consentVersion: "1.0",
      },
      healthDataPreferences: {
        shareWithFamily: false,
        shareWithInsurance: false,
        allowResearch: false,
        allowTelemedicine: false,
      },
      dataRights: {
        acknowledgeAccessRight: false,
        acknowledgeCorrectionRight: false,
        acknowledgeDeletionRight: false,
        acknowledgePortabilityRight: false,
      },
      ...initialData,
    },
  });

  const {
    fields: emergencyContactFields,
    append: addEmergencyContact,
    remove: removeEmergencyContact,
  } = useFieldArray({
    control: form.control,
    name: "emergencyContacts",
  });

  // Load initial data and check consent validity
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }

    // Check if consent is still valid for editing profile
    if (patientId) {
      checkConsentValidity(patientId, ["personal_data", "health_data"]).then((isValid) => {
        if (!isValid) {
          setShowLgpdInfo(true);
          toast.warning("Consentimento LGPD expirado. Renovação necessária.");
        }
      });
    }
  }, [initialData, patientId, form, checkConsentValidity]);

  const onSubmit = async (data: PatientProfile) => {
    setIsSubmitting(true);

    try {
      // Validate LGPD consent before processing sensitive data
      if (!data.lgpdConsent.dataProcessingConsent || !data.lgpdConsent.sensitiveDataConsent) {
        toast.error("Consentimento LGPD é obrigatório para processar dados de saúde");
        setShowLgpdInfo(true);
        return;
      }

      // Log data modification for audit trail
      const modifiedFields = Object.keys(data);
      await logDataModification(patientId, modifiedFields, "update");

      // Submit profile data
      const response = await fetch(`/api/patients/${patientId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar perfil do paciente");
      }

      // Update consent if changed
      if (data.lgpdConsent) {
        await updateConsent(patientId, data.lgpdConsent);
      }

      toast.success("Perfil atualizado com sucesso!");
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEmergencyContact = () => {
    if (emergencyContactFields.length < 3) {
      addEmergencyContact({
        name: "",
        relationship: "",
        phone: "",
        email: "",
        isPrimary: emergencyContactFields.length === 0,
      });
    }
  };

  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  return (
    <div className="space-y-6">
      {/* LGPD Information Banner */}
      {showLgpdInfo && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Informações sobre LGPD</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              Seus dados de saúde são protegidos pela Lei Geral de Proteção de Dados (LGPD). É
              necessário seu consentimento explícito para processar informações sensíveis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowLgpdInfo(false)}>
                Entendi
              </Button>
              <Badge variant="secondary" className="text-xs">
                Versão de Consentimento: 1.0
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Pessoal
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contato
            </TabsTrigger>
            <TabsTrigger value="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Emergência
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacidade
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Dados pessoais básicos protegidos pela LGPD</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      {...form.register("fullName")}
                      placeholder="Digite o nome completo"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Data de Nascimento *</Label>
                    <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>Dados de contato e preferências de comunicação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="exemplo@email.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" {...form.register("phone")} placeholder="(11) 99999-9999" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Informações de endereço residencial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      {...form.register("address.street")}
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      {...form.register("address.city")}
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Contacts Tab */}
          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle>Contatos de Emergência</CardTitle>
                <CardDescription>Pessoas para contatar em caso de emergência</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddEmergencyContact}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Contato de Emergência
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Privacidade</CardTitle>
                <CardDescription>Controle como seus dados são utilizados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="lgpdConsent.dataProcessingConsent"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          id="dataProcessingConsent"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="dataProcessingConsent" className="text-sm">
                      Consinto com o processamento dos meus dados pessoais
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

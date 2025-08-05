"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Pill, User, Stethoscope, AlertTriangle, 
  Shield, Save, X, FileText, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { 
  Form, FormControl, FormDescription, FormField, 
  FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";

// Validation schema for prescription
const prescriptionSchema = z.object({
  clinic_id: z.string().uuid("Selecione uma clínica válida"),
  patient_id: z.string().uuid("Selecione um paciente"),
  appointment_id: z.string().uuid().optional(),
  prescriber_id: z.string().uuid("Selecione o prescritor"),
  medication_name: z.string().min(2, "Nome do medicamento é obrigatório"),
  dosage: z.string().min(1, "Dosagem é obrigatória"),
  frequency: z.string().min(1, "Frequência é obrigatória"),
  duration: z.string().min(1, "Duração é obrigatória"),
  quantity: z.string().min(1, "Quantidade é obrigatória"),
  instructions: z.string().optional(),
  warnings: z.string().optional(),
  contraindications: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  controlled_substance: z.boolean().default(false),
  anvisa_code: z.string().optional(),
  cfm_registration: z.string().optional(),
});

// Conditional validation for controlled substances
const prescriptionSchemaWithConditionals = prescriptionSchema.refine(
  (data) => {
    if (data.controlled_substance) {
      return data.anvisa_code && data.cfm_registration;
    }
    return true;
  },
  {
    message: "Código ANVISA e registro CFM são obrigatórios para substâncias controladas",
    path: ["controlled_substance"],
  }
);

type PrescriptionData = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  clinicId?: string;
  patientId?: string;
  appointmentId?: string;
  onSuccess?: (prescription: any) => void;
  onCancel?: () => void;
}

// Common medications for quick selection
const COMMON_MEDICATIONS = [
  "Paracetamol",
  "Ibuprofeno",
  "Amoxicilina",
  "Dipirona",
  "Omeprazol",
  "Losartana",
  "Metformina",
  "Sinvastatina",
  "Atenolol",
  "Captopril",
];

// Common dosage patterns
const COMMON_DOSAGES = [
  "500mg",
  "250mg",
  "100mg",
  "50mg",
  "25mg",
  "20mg",
  "10mg",
  "5mg",
];

// Frequency options
const FREQUENCY_OPTIONS = [
  { value: "1x_dia", label: "1x ao dia" },
  { value: "2x_dia", label: "2x ao dia" },
  { value: "3x_dia", label: "3x ao dia" },
  { value: "4x_dia", label: "4x ao dia" },
  { value: "cada_6h", label: "A cada 6 horas" },
  { value: "cada_8h", label: "A cada 8 horas" },
  { value: "cada_12h", label: "A cada 12 horas" },
  { value: "sos", label: "Se necessário (SOS)" },
];

export default function PrescriptionFormPrisma({
  clinicId,
  patientId,
  appointmentId,
  onSuccess,
  onCancel
}: PrescriptionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [prescribers, setPrescribers] = useState<any[]>([]);

  const form = useForm<PrescriptionData>({
    resolver: zodResolver(prescriptionSchemaWithConditionals),
    defaultValues: {
      clinic_id: clinicId || "",
      patient_id: patientId || "",
      appointment_id: appointmentId || "",
      prescriber_id: "",
      medication_name: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: "",
      instructions: "",
      warnings: "",
      contraindications: "",
      start_date: "",
      end_date: "",
      controlled_substance: false,
      anvisa_code: "",
      cfm_registration: "",
    },
  });

  // Load patients and prescribers when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load patients
        const patientsResponse = await fetch('/api/prisma/patients?limit=100');
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setPatients(patientsData.patients || []);
        }

        // In a real implementation, you'd have a prescribers endpoint
        // For now, we'll simulate some prescribers (doctors only)
        setPrescribers([
          { 
            id: "prescriber-1", 
            full_name: "Dr. João Silva", 
            professional_title: "Cardiologista",
            medical_license: "CRM-SP 123456"
          },
          { 
            id: "prescriber-2", 
            full_name: "Dra. Maria Santos", 
            professional_title: "Pediatra",
            medical_license: "CRM-SP 789012"
          },
          { 
            id: "prescriber-3", 
            full_name: "Dr. Carlos Lima", 
            professional_title: "Clínico Geral",
            medical_license: "CRM-SP 345678"
          },
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const onSubmit = async (data: PrescriptionData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Convert dates to ISO strings if provided
      const prescriptionData = {
        ...data,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : undefined,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : undefined,
        appointment_id: data.appointment_id || undefined,
        instructions: data.instructions || undefined,
        warnings: data.warnings || undefined,
        contraindications: data.contraindications || undefined,
        anvisa_code: data.anvisa_code || undefined,
        cfm_registration: data.cfm_registration || undefined,
      };

      const response = await fetch('/api/prisma/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Receita criada com sucesso!",
        description: `Receita para ${data.medication_name} foi criada e está pronta para impressão.`,
      });

      if (onSuccess) {
        onSuccess(result.prescription);
      } else {
        router.push(`/receitas/${result.prescription.id}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setSubmitError(errorMessage);
      toast({
        title: "Erro ao criar receita",
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

  // Watch controlled substance checkbox
  const watchControlledSubstance = form.watch("controlled_substance");
  const selectedPatient = patients.find(p => p.id === form.watch("patient_id"));
  const selectedPrescriber = prescribers.find(p => p.id === form.watch("prescriber_id"));

  // Auto-fill CFM registration when prescriber changes
  useEffect(() => {
    if (selectedPrescriber) {
      form.setValue("cfm_registration", selectedPrescriber.medical_license);
    }
  }, [selectedPrescriber, form]);

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-green-600" />
          Nova Receita Médica (Prisma)
          <Badge variant="outline" className="ml-2">ANVISA Compliant</Badge>
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

            {/* Patient and Prescriber Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Paciente e Prescritor
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient Selection */}
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o paciente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              <div className="flex flex-col">
                                <span>{patient.full_name}</span>
                                <span className="text-xs text-gray-500">
                                  {patient.medical_record_number || patient.id.slice(0, 8)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Prescriber Selection */}
                <FormField
                  control={form.control}
                  name="prescriber_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médico Prescritor *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o médico" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prescribers.map((prescriber) => (
                            <SelectItem key={prescriber.id} value={prescriber.id}>
                              <div className="flex flex-col">
                                <span>{prescriber.full_name}</span>
                                <span className="text-xs text-gray-500">
                                  {prescriber.professional_title} - {prescriber.medical_license}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Medication Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medicamento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Medication Name */}
                <FormField
                  control={form.control}
                  name="medication_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Medicamento *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input 
                            placeholder="Digite o nome do medicamento"
                            {...field} 
                          />
                          <div className="flex flex-wrap gap-1">
                            {COMMON_MEDICATIONS.map((med) => (
                              <Button
                                key={med}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => form.setValue("medication_name", med)}
                                className="text-xs"
                              >
                                {med}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dosage */}
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosagem *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input 
                            placeholder="Ex: 500mg, 5ml, 1 comprimido"
                            {...field} 
                          />
                          <div className="flex flex-wrap gap-1">
                            {COMMON_DOSAGES.map((dosage) => (
                              <Button
                                key={dosage}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => form.setValue("dosage", dosage)}
                                className="text-xs"
                              >
                                {dosage}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Frequency */}
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FREQUENCY_OPTIONS.map((freq) => (
                            <SelectItem key={freq.value} value={freq.label}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: 7 dias, 2 semanas"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quantity */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: 30 comprimidos, 1 frasco"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Instructions and Warnings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Instruções e Avisos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Instructions */}
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruções de Uso</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Como o medicamento deve ser tomado..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Warnings */}
                <FormField
                  control={form.control}
                  name="warnings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avisos e Precauções</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Avisos importantes sobre o medicamento..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contraindications */}
              <FormField
                control={form.control}
                name="contraindications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraindicações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Situações em que o medicamento não deve ser usado..."
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Controlled Substance Section (ANVISA Compliance) */}
            <div className="space-y-4 p-4 border rounded-lg bg-orange-50">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Controle ANVISA
              </h3>

              <FormField
                control={form.control}
                name="controlled_substance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium">
                        Substância Controlada (ANVISA)
                      </FormLabel>
                      <FormDescription>
                        Marque se o medicamento é uma substância controlada pela ANVISA
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {watchControlledSubstance && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="anvisa_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código ANVISA *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Código ANVISA do medicamento"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Obrigatório para substâncias controladas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cfm_registration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registro CFM *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="CRM do médico prescritor"
                            {...field} 
                            disabled
                          />
                        </FormControl>
                        <FormDescription>
                          Preenchido automaticamente baseado no prescritor
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchControlledSubstance && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenção:</strong> Esta receita será automaticamente registrada 
                    no sistema de controle da ANVISA conforme RDC 357/2020 para rastreabilidade 
                    de substâncias controladas.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Treatment Period */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Período de Tratamento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Data para iniciar o tratamento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Término</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Data prevista para o fim do tratamento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Criando Receita..." : "Criar Receita"}
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
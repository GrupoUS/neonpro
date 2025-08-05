"use client";

import type { zodResolver } from "@hookform/resolvers/zod";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { AlertTriangle, FileText, Plus, Save, Trash2 } from "lucide-react";
import type { useState } from "react";
import type { useFieldArray, useForm } from "react-hook-form";
import type { toast } from "sonner";
import type { Button } from "@/components/ui/button";
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
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Textarea } from "@/components/ui/textarea";
import type { MedicalRecordFormData, medicalRecordSchema } from "@/lib/healthcare/schemas";

interface MedicalRecordFormProps {
  patientId: string;
  appointmentId: string;
  patientName: string;
  patientAge: number;
  onSubmit: (data: MedicalRecordFormData) => Promise<void>;
  isLoading?: boolean;
}

export function MedicalRecordForm({
  patientId,
  appointmentId,
  patientName,
  patientAge,
  onSubmit,
  isLoading = false,
}: MedicalRecordFormProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 4;

  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patient_id: patientId,
      appointment_id: appointmentId,
      chief_complaint: "",
      diagnosis: "",
      treatment_plan: "",
      medications_prescribed: [],
      follow_up_instructions: "",
      notes: "",
      vital_signs: {
        blood_pressure: "",
        weight: undefined,
        height: undefined,
        temperature: undefined,
      },
    },
  });

  const {
    fields: medicationFields,
    append: addMedication,
    remove: removeMedication,
  } = useFieldArray({
    control: form.control,
    name: "medications_prescribed",
  });

  const handleSubmitForm = async (data: MedicalRecordFormData) => {
    try {
      await onSubmit(data);
      toast.success("Prontuário salvo com sucesso!", {
        description: "As informações médicas foram registradas de forma segura.",
      });
      form.reset();
      setCurrentSection(1);
    } catch (error) {
      toast.error("Erro ao salvar prontuário", {
        description: "Verifique os dados e tente novamente.",
      });
    }
  };

  const nextSection = () => {
    if (currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const addNewMedication = () => {
    addMedication({
      medication_name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    });
  };

  return (
    <Card className="w-full max-w-5xl mx-auto medical-card">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Prontuário Médico</CardTitle>
            <CardDescription>
              Paciente: {patientName} • {patientAge} anos •{" "}
              {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
            </CardDescription>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSections }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i + 1 <= currentSection ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-muted-foreground text-center">
          Seção {currentSection} de {totalSections}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            {/* Section 1: Chief Complaint & Diagnosis */}
            {currentSection === 1 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Avaliação Inicial</h3>
                  <p className="text-sm text-muted-foreground">Queixa principal e diagnóstico</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Atenção</h4>
                      <p className="text-sm text-blue-700">
                        Este prontuário deve seguir as diretrizes CFM e será mantido por no mínimo
                        20 anos conforme legislação.
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="chief_complaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Queixa Principal *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a queixa principal do paciente..."
                          {...field}
                          className="bg-background min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>Motivo da consulta relatado pelo paciente</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnóstico *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Diagnóstico baseado na avaliação clínica..."
                          {...field}
                          className="bg-background min-h-[80px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Diagnóstico clínico baseado na avaliação realizada
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="button" onClick={nextSection}>
                    Próxima Seção
                  </Button>
                </div>
              </div>
            )}{" "}
            {/* Section 2: Treatment Plan */}
            {currentSection === 2 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Plano de Tratamento</h3>
                  <p className="text-sm text-muted-foreground">Detalhes do tratamento prescrito</p>
                </div>

                <FormField
                  control={form.control}
                  name="treatment_plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano de Tratamento *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detalhe o plano de tratamento recomendado..."
                          {...field}
                          className="bg-background min-h-[120px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Procedimentos, orientações e cuidados recomendados
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Sinais Vitais (Opcional)</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="vital_signs.blood_pressure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pressão Arterial</FormLabel>
                          <FormControl>
                            <Input placeholder="120/80" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vital_signs.weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="70.5"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? parseFloat(e.target.value) : undefined,
                                )
                              }
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vital_signs.height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Altura (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="170"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? parseFloat(e.target.value) : undefined,
                                )
                              }
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vital_signs.temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperatura (°C)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="36.5"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? parseFloat(e.target.value) : undefined,
                                )
                              }
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevSection}>
                    Seção Anterior
                  </Button>
                  <Button type="button" onClick={nextSection}>
                    Próxima Seção
                  </Button>
                </div>
              </div>
            )}{" "}
            {/* Section 3: Medications */}
            {currentSection === 3 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Medicações Prescritas</h3>
                  <p className="text-sm text-muted-foreground">
                    Lista de medicamentos e instruções de uso
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medicamentos</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewMedication}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Medicamento
                    </Button>
                  </div>

                  {medicationFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-6 h-6" />
                      </div>
                      <p>Nenhuma medicação prescrita ainda</p>
                      <p className="text-sm">Clique em "Adicionar Medicamento" para começar</p>
                    </div>
                  )}

                  {medicationFields.map((field, index) => (
                    <Card key={field.id} className="p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Medicamento {index + 1}</h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`medications_prescribed.${index}.medication_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Medicamento *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Dipirona"
                                  {...field}
                                  className="bg-background"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medications_prescribed.${index}.dosage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dosagem *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: 500mg"
                                  {...field}
                                  className="bg-background"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medications_prescribed.${index}.frequency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequência *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: 8/8 horas"
                                  {...field}
                                  className="bg-background"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medications_prescribed.${index}.duration`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duração *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: 7 dias"
                                  {...field}
                                  className="bg-background"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`medications_prescribed.${index}.instructions`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Instruções de Uso *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Instruções detalhadas para o paciente..."
                                {...field}
                                className="bg-background"
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevSection}>
                    Seção Anterior
                  </Button>
                  <Button type="button" onClick={nextSection}>
                    Próxima Seção
                  </Button>
                </div>
              </div>
            )}{" "}
            {/* Section 4: Follow-up & Notes */}
            {currentSection === 4 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Acompanhamento e Observações</h3>
                  <p className="text-sm text-muted-foreground">
                    Instruções de acompanhamento e notas clínicas
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="follow_up_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Retorno</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            field.onChange(date);
                          }}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormDescription>
                        Data recomendada para próxima consulta (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="follow_up_instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruções de Acompanhamento</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Instruções para cuidados domiciliares, retorno, etc..."
                          {...field}
                          className="bg-background min-h-[80px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Orientações para o paciente sobre cuidados e acompanhamento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Clínicas *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações detalhadas sobre a consulta, exame físico, evolução do quadro..."
                          {...field}
                          className="bg-background min-h-[120px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Registro detalhado da consulta para histórico médico
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Importante</h4>
                      <p className="text-sm text-amber-700">
                        Este prontuário será armazenado de forma segura e confidencial conforme a
                        Lei 13.787/2018 e resolução CFM nº 1.821/2007. Os dados serão mantidos por
                        no mínimo 20 anos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevSection}>
                    Seção Anterior
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {isLoading ? "Salvando..." : "Salvar Prontuário"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

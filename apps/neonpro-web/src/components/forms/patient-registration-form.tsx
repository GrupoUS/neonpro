"use client";

import type { zodResolver } from "@hookform/resolvers/zod";
import type { format } from "date-fns";
import type { Eye, EyeOff, Lock, Shield } from "lucide-react";
import type { useState } from "react";
import type { useForm } from "react-hook-form";
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
import type { Textarea } from "@/components/ui/textarea";
import type { PatientFormData, patientSchema } from "@/lib/healthcare/schemas";
import type { formatCpf, formatPhone } from "@/lib/utils";

interface PatientRegistrationFormProps {
  onSubmit: (data: PatientFormData) => Promise<void>;
  isLoading?: boolean;
}

export function PatientRegistrationForm({
  onSubmit,
  isLoading = false,
}: PatientRegistrationFormProps) {
  const [showLgpdDetails, setShowLgpdDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      emergency_contact: "",
      emergency_contact_name: "",
      address: {
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipcode: "",
      },
      medical_conditions: "",
      allergies: "",
      medications: "",
      consent_lgpd: false,
      consent_marketing: false,
      consent_research: false,
      consent_whatsapp: false,
      legal_basis: "consent",
    },
  });

  const handleSubmitForm = async (data: PatientFormData) => {
    try {
      await onSubmit(data);
      toast.success("Paciente registrado com sucesso!", {
        description: "Os dados foram salvos de forma segura e em conformidade com a LGPD.",
      });
      form.reset();
      setCurrentStep(1);
    } catch (error) {
      toast.error("Erro ao registrar paciente", {
        description: "Verifique os dados e tente novamente.",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto medical-card">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Cadastro de Paciente</CardTitle>
            <CardDescription>Informações seguras e protegidas pela LGPD</CardDescription>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i + 1 <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-muted-foreground text-center">
          Passo {currentStep} de {totalSteps}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Informações Básicas</h3>
                  <p className="text-sm text-muted-foreground">
                    Dados pessoais principais do paciente
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome completo"
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
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatCpf(e.target.value);
                              field.onChange(formatted);
                            }}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            {...field}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormDescription>
                          Opcional. Usado para comunicações importantes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 99999-9999"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatPhone(e.target.value);
                              field.onChange(formatted);
                            }}
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
                  name="birthdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            field.onChange(date);
                          }}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}{" "}
            {/* Step 2: Contact & Emergency */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Contato e Emergência</h3>
                  <p className="text-sm text-muted-foreground">
                    Informações de contato e pessoa de emergência
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Contato de Emergência *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone de Emergência *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 99999-9999"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatPhone(e.target.value);
                              field.onChange(formatted);
                            }}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Endereço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Rua/Avenida *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da rua" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número *</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Apt, Bloco, etc."
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
                      name="address.neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome do bairro"
                              {...field}
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
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Anterior
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}{" "}
            {/* Step 3: Medical Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Informações Médicas</h3>
                  <p className="text-sm text-muted-foreground">
                    Dados médicos relevantes (opcional mas recomendado)
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Informações Protegidas</h4>
                      <p className="text-sm text-amber-700">
                        Dados médicos são criptografados e protegidos por padrões hospitalares de
                        segurança.
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="medical_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condições Médicas Pré-existentes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva condições médicas relevantes, cirurgias anteriores, etc."
                          {...field}
                          className="bg-background"
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Informações importantes para o planejamento do tratamento.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alergias</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Alergias a medicamentos, substâncias, materiais, etc."
                          {...field}
                          className="bg-background"
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        Fundamental para evitar reações adversas durante tratamentos.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicações em Uso</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Liste medicações atuais, dosagens e frequência"
                          {...field}
                          className="bg-background"
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        Medicamentos podem interferir com procedimentos estéticos.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Anterior
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}{" "}
            {/* Step 4: LGPD Consent */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Consentimentos LGPD</h3>
                  <p className="text-sm text-muted-foreground">
                    Autorização para tratamento de dados pessoais
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Seus Direitos LGPD</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>• Confirmação da existência de tratamento de dados</p>
                        <p>• Acesso aos seus dados pessoais</p>
                        <p>• Correção de dados incompletos ou desatualizados</p>
                        <p>• Eliminação de dados desnecessários ou tratados em desconformidade</p>
                        <p>• Portabilidade dos dados</p>
                        <p>• Revogação do consentimento a qualquer momento</p>
                      </div>
                      <Button
                        type="button"
                        variant="link"
                        className="text-blue-600 p-0 h-auto"
                        onClick={() => setShowLgpdDetails(!showLgpdDetails)}
                      >
                        {showLgpdDetails ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" /> Ocultar detalhes
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" /> Ver detalhes completos
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {showLgpdDetails && (
                  <div className="bg-gray-50 border rounded-lg p-4 text-sm space-y-3">
                    <h5 className="font-medium">Finalidades do Tratamento de Dados:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Prestação de serviços médicos e estéticos</li>
                      <li>Agendamento e controle de consultas</li>
                      <li>Histórico médico e acompanhamento de tratamentos</li>
                      <li>Comunicação sobre procedimentos e cuidados</li>
                      <li>Cumprimento de obrigações legais e regulamentares</li>
                    </ul>

                    <h5 className="font-medium">Base Legal:</h5>
                    <p>
                      Consentimento do titular (Art. 7º, I, LGPD) e interesse legítimo para
                      prestação de serviços de saúde.
                    </p>

                    <h5 className="font-medium">Compartilhamento:</h5>
                    <p>
                      Dados podem ser compartilhados apenas com profissionais envolvidos no seu
                      tratamento e autoridades sanitárias quando exigido por lei.
                    </p>

                    <h5 className="font-medium">Retenção:</h5>
                    <p>
                      Dados médicos são mantidos pelo prazo mínimo de 20 anos conforme CFM. Outros
                      dados por 5 anos após término da relação.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="consent_lgpd"
                    render={({ field }) => (
                      <FormItem className="lgpd-consent">
                        <div className="flex items-start space-x-3">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="grid gap-1.5 leading-none">
                            <FormLabel className="text-sm font-medium leading-5">
                              Consentimento LGPD (Obrigatório) *
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Autorizo o tratamento dos meus dados pessoais para as finalidades
                              descritas, com base no meu consentimento livre e informado, podendo
                              revogá-lo a qualquer momento.
                            </FormDescription>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consent_marketing"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start space-x-3">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="grid gap-1.5 leading-none">
                            <FormLabel className="text-sm font-medium leading-5">
                              Comunicações de Marketing (Opcional)
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Autorizo receber comunicações sobre novos tratamentos, promoções e
                              conteúdo educativo.
                            </FormDescription>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consent_whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start space-x-3">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="grid gap-1.5 leading-none">
                            <FormLabel className="text-sm font-medium leading-5">
                              Comunicação via WhatsApp (Opcional)
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Autorizo receber lembretes de consulta e comunicações importantes via
                              WhatsApp.
                            </FormDescription>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Anterior
                  </Button>
                  <Button type="submit" disabled={isLoading || !form.watch("consent_lgpd")}>
                    {isLoading ? "Salvando..." : "Cadastrar Paciente"}
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

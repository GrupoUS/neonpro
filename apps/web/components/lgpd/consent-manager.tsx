'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, Eye, Shield, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type ConsentFormData, consentSchema } from '@/lib/healthcare/schemas';
import { formatCpf } from '@/lib/utils';

interface ConsentRecord {
  id: string;
  patient_cpf: string;
  patient_name: string;
  consent_type: string;
  consent_given: boolean;
  legal_basis: string;
  purpose_description: string;
  data_retention_period: string;
  created_at: Date;
  updated_at: Date;
  status: 'active' | 'revoked' | 'expired';
}

interface ConsentManagerProps {
  patientCpf?: string;
  patientName?: string;
  existingConsents?: ConsentRecord[];
  onSubmit: (data: ConsentFormData) => Promise<void>;
  onRevoke: (consentId: string) => Promise<void>;
  isLoading?: boolean;
}

export function ConsentManager({
  patientCpf = '',
  patientName = '',
  existingConsents = [],
  onSubmit,
  onRevoke,
  isLoading = false,
}: ConsentManagerProps) {
  const [_showDetails, _setShowDetails] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(
    null
  );

  const form = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      patient_cpf: patientCpf,
      consent_type: 'data_processing',
      consent_given: false,
      legal_basis: 'consent',
      purpose_description: '',
      data_retention_period: '20 anos (dados médicos)',
      rights_information: true,
      withdrawal_instructions:
        'Para revogar este consentimento, entre em contato conosco através do email lgpd@neonpro.com.br',
    },
  });

  const handleSubmitForm = async (data: ConsentFormData) => {
    try {
      await onSubmit(data);
      toast.success('Consentimento registrado com sucesso!', {
        description: 'O registro foi salvo de forma segura conforme LGPD.',
      });
      form.reset();
    } catch (_error) {
      toast.error('Erro ao registrar consentimento', {
        description: 'Verifique os dados e tente novamente.',
      });
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    try {
      await onRevoke(consentId);
      toast.success('Consentimento revogado', {
        description: 'A revogação foi processada conforme solicitado.',
      });
    } catch (_error) {
      toast.error('Erro ao revogar consentimento', {
        description: 'Tente novamente ou entre em contato com o suporte.',
      });
    }
  };

  const getConsentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      data_processing: 'Tratamento de Dados',
      marketing: 'Comunicações de Marketing',
      research: 'Pesquisa e Desenvolvimento',
      procedure: 'Procedimento Médico',
      photography: 'Uso de Imagem',
      testimonial: 'Depoimento/Testemunho',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string, consentGiven: boolean) => {
    if (!consentGiven) {
      return <Badge variant="destructive">Negado</Badge>;
    }

    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800" variant="default">
            Ativo
          </Badge>
        );
      case 'revoked':
        return <Badge variant="secondary">Revogado</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* New Consent Form */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                Gerenciamento de Consentimentos LGPD
              </CardTitle>
              <CardDescription>
                Registro e gestão de consentimentos para tratamento de dados
                pessoais
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(handleSubmitForm)}
            >
              {/* Patient Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="patient_cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF do Paciente *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          {...field}
                          className="bg-background"
                          onChange={(e) => {
                            const formatted = formatCpf(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consent_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Consentimento *</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="data_processing">
                            Tratamento de Dados
                          </SelectItem>
                          <SelectItem value="marketing">
                            Comunicações de Marketing
                          </SelectItem>
                          <SelectItem value="research">
                            Pesquisa e Desenvolvimento
                          </SelectItem>
                          <SelectItem value="procedure">
                            Procedimento Médico
                          </SelectItem>
                          <SelectItem value="photography">
                            Uso de Imagem
                          </SelectItem>
                          <SelectItem value="testimonial">
                            Depoimento/Testemunho
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>{' '}
              <FormField
                control={form.control}
                name="purpose_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Finalidade do Tratamento *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a finalidade específica para a qual os dados serão utilizados..."
                        {...field}
                        className="bg-background"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Descrição clara e específica do uso dos dados pessoais
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="legal_basis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Legal *</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione a base legal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="consent">
                            Consentimento do Titular
                          </SelectItem>
                          <SelectItem value="legitimate_interest">
                            Interesse Legítimo
                          </SelectItem>
                          <SelectItem value="vital_interest">
                            Interesse Vital
                          </SelectItem>
                          <SelectItem value="public_task">
                            Exercício Regular de Direitos
                          </SelectItem>
                          <SelectItem value="legal_obligation">
                            Obrigação Legal
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_retention_period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período de Retenção *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 5 anos, 20 anos (dados médicos)"
                          {...field}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormDescription>
                        Tempo que os dados serão mantidos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="consent_given"
                render={({ field }) => (
                  <FormItem className="lgpd-consent">
                    <div className="flex items-start space-x-3">
                      <FormControl>
                        <input
                          checked={field.value}
                          className="mt-1"
                          onChange={field.onChange}
                          type="checkbox"
                        />
                      </FormControl>
                      <div className="grid gap-1.5 leading-none">
                        <FormLabel className="font-medium text-sm leading-5">
                          Consentimento do Titular *
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Declaro que li e compreendi as informações sobre o
                          tratamento dos meus dados pessoais, incluindo meus
                          direitos como titular, e autorizo o tratamento
                          descrito acima.
                        </FormDescription>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-800">
                      Seus Direitos LGPD
                    </h4>
                    <div className="mt-2 space-y-1 text-blue-700 text-sm">
                      <p>
                        • <strong>Confirmação:</strong> Saber se seus dados
                        estão sendo tratados
                      </p>
                      <p>
                        • <strong>Acesso:</strong> Obter cópia dos seus dados
                        pessoais
                      </p>
                      <p>
                        • <strong>Correção:</strong> Corrigir dados incompletos
                        ou desatualizados
                      </p>
                      <p>
                        • <strong>Eliminação:</strong> Excluir dados
                        desnecessários ou tratados irregularmente
                      </p>
                      <p>
                        • <strong>Portabilidade:</strong> Transferir dados para
                        outro fornecedor
                      </p>
                      <p>
                        • <strong>Revogação:</strong> Retirar consentimento a
                        qualquer momento
                      </p>
                    </div>
                    <p className="mt-3 font-medium text-blue-600 text-xs">
                      Para exercer seus direitos: lgpd@neonpro.com.br
                    </p>
                  </div>
                </div>
              </div>
              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading ? 'Registrando...' : 'Registrar Consentimento'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>{' '}
      {/* Existing Consents */}
      {existingConsents.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-xl">
              Consentimentos Registrados
            </CardTitle>
            <CardDescription>
              Histórico de consentimentos do paciente {patientName}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {existingConsents.map((consent) => (
                <div
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
                  key={consent.id}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">
                          {getConsentTypeLabel(consent.consent_type)}
                        </h4>
                        {getStatusBadge(consent.status, consent.consent_given)}
                      </div>

                      <p className="text-muted-foreground text-sm">
                        {consent.purpose_description}
                      </p>

                      <div className="text-muted-foreground text-xs">
                        <p>Base Legal: {consent.legal_basis}</p>
                        <p>Retenção: {consent.data_retention_period}</p>
                        <p>
                          Registrado em:{' '}
                          {format(consent.created_at, 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })}
                        </p>
                        {consent.updated_at !== consent.created_at && (
                          <p>
                            Atualizado em:{' '}
                            {format(consent.updated_at, 'dd/MM/yyyy HH:mm', {
                              locale: ptBR,
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setSelectedConsent(consent)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {consent.status === 'active' && consent.consent_given && (
                        <Button
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRevokeConsent(consent.id)}
                          size="sm"
                          variant="outline"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Consent Details Modal/Card */}
      {selectedConsent && (
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                Detalhes do Consentimento
              </CardTitle>
              <CardDescription>
                Informações completas do registro de consentimento
              </CardDescription>
            </div>
            <Button
              onClick={() => setSelectedConsent(null)}
              size="sm"
              variant="outline"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="font-medium text-sm">CPF do Titular</label>
                <p className="text-sm">{selectedConsent.patient_cpf}</p>
              </div>
              <div>
                <label className="font-medium text-sm">
                  Tipo de Consentimento
                </label>
                <p className="text-sm">
                  {getConsentTypeLabel(selectedConsent.consent_type)}
                </p>
              </div>
              <div>
                <label className="font-medium text-sm">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusBadge(
                    selectedConsent.status,
                    selectedConsent.consent_given
                  )}
                </div>
              </div>
              <div>
                <label className="font-medium text-sm">Base Legal</label>
                <p className="text-sm">{selectedConsent.legal_basis}</p>
              </div>
            </div>

            <div>
              <label className="font-medium text-sm">
                Finalidade do Tratamento
              </label>
              <p className="mt-1 text-sm">
                {selectedConsent.purpose_description}
              </p>
            </div>

            <div>
              <label className="font-medium text-sm">Período de Retenção</label>
              <p className="mt-1 text-sm">
                {selectedConsent.data_retention_period}
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="mb-2 font-medium">
                Como Revogar Este Consentimento
              </h4>
              <p className="text-muted-foreground text-sm">
                Para revogar este consentimento, entre em contato conosco
                através do email{' '}
                <a
                  className="text-primary underline"
                  href="mailto:lgpd@neonpro.com.br"
                >
                  lgpd@neonpro.com.br
                </a>{' '}
                informando seu CPF e o tipo de consentimento que deseja revogar.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Baixar Comprovante
              </Button>
              {selectedConsent.status === 'active' &&
                selectedConsent.consent_given && (
                  <Button
                    onClick={() => {
                      handleRevokeConsent(selectedConsent.id);
                      setSelectedConsent(null);
                    }}
                    size="sm"
                    variant="destructive"
                  >
                    Revogar Consentimento
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

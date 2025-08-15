'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Shield, Download, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { consentSchema, type ConsentFormData } from '@/lib/healthcare/schemas'
import { formatCpf } from '@/lib/utils'
import { toast } from 'sonner'

interface ConsentRecord {
  id: string
  patient_cpf: string
  patient_name: string
  consent_type: string
  consent_given: boolean
  legal_basis: string
  purpose_description: string
  data_retention_period: string
  created_at: Date
  updated_at: Date
  status: 'active' | 'revoked' | 'expired'
}

interface ConsentManagerProps {
  patientCpf?: string
  patientName?: string
  existingConsents?: ConsentRecord[]
  onSubmit: (data: ConsentFormData) => Promise<void>
  onRevoke: (consentId: string) => Promise<void>
  isLoading?: boolean
}

export function ConsentManager({
  patientCpf = '',
  patientName = '',
  existingConsents = [],
  onSubmit,
  onRevoke,
  isLoading = false
}: ConsentManagerProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null)

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
      withdrawal_instructions: 'Para revogar este consentimento, entre em contato conosco através do email lgpd@neonpro.com.br'
    }
  })

  const handleSubmitForm = async (data: ConsentFormData) => {
    try {
      await onSubmit(data)
      toast.success('Consentimento registrado com sucesso!', {
        description: 'O registro foi salvo de forma segura conforme LGPD.'
      })
      form.reset()
    } catch (error) {
      toast.error('Erro ao registrar consentimento', {
        description: 'Verifique os dados e tente novamente.'
      })
    }
  }

  const handleRevokeConsent = async (consentId: string) => {
    try {
      await onRevoke(consentId)
      toast.success('Consentimento revogado', {
        description: 'A revogação foi processada conforme solicitado.'
      })
    } catch (error) {
      toast.error('Erro ao revogar consentimento', {
        description: 'Tente novamente ou entre em contato com o suporte.'
      })
    }
  }

  const getConsentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      data_processing: 'Tratamento de Dados',
      marketing: 'Comunicações de Marketing',
      research: 'Pesquisa e Desenvolvimento',
      procedure: 'Procedimento Médico',
      photography: 'Uso de Imagem',
      testimonial: 'Depoimento/Testemunho'
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string, consentGiven: boolean) => {
    if (!consentGiven) {
      return <Badge variant="destructive">Negado</Badge>
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
      case 'revoked':
        return <Badge variant="secondary">Revogado</Badge>
      case 'expired':
        return <Badge variant="secondary">Expirado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* New Consent Form */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Gerenciamento de Consentimentos LGPD</CardTitle>
              <CardDescription>
                Registro e gestão de consentimentos para tratamento de dados pessoais
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
              
              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          onChange={(e) => {
                            const formatted = formatCpf(e.target.value)
                            field.onChange(formatted)
                          }}
                          className="bg-background"
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="data_processing">Tratamento de Dados</SelectItem>
                          <SelectItem value="marketing">Comunicações de Marketing</SelectItem>
                          <SelectItem value="research">Pesquisa e Desenvolvimento</SelectItem>
                          <SelectItem value="procedure">Procedimento Médico</SelectItem>
                          <SelectItem value="photography">Uso de Imagem</SelectItem>
                          <SelectItem value="testimonial">Depoimento/Testemunho</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>              <FormField
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="legal_basis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Legal *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione a base legal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="consent">Consentimento do Titular</SelectItem>
                          <SelectItem value="legitimate_interest">Interesse Legítimo</SelectItem>
                          <SelectItem value="vital_interest">Interesse Vital</SelectItem>
                          <SelectItem value="public_task">Exercício Regular de Direitos</SelectItem>
                          <SelectItem value="legal_obligation">Obrigação Legal</SelectItem>
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
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="grid gap-1.5 leading-none">
                        <FormLabel className="text-sm font-medium leading-5">
                          Consentimento do Titular *
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Declaro que li e compreendi as informações sobre o tratamento dos meus dados pessoais,
                          incluindo meus direitos como titular, e autorizo o tratamento descrito acima.
                        </FormDescription>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Seus Direitos LGPD</h4>
                    <div className="text-sm text-blue-700 space-y-1 mt-2">
                      <p>• <strong>Confirmação:</strong> Saber se seus dados estão sendo tratados</p>
                      <p>• <strong>Acesso:</strong> Obter cópia dos seus dados pessoais</p>
                      <p>• <strong>Correção:</strong> Corrigir dados incompletos ou desatualizados</p>
                      <p>• <strong>Eliminação:</strong> Excluir dados desnecessários ou tratados irregularmente</p>
                      <p>• <strong>Portabilidade:</strong> Transferir dados para outro fornecedor</p>
                      <p>• <strong>Revogação:</strong> Retirar consentimento a qualquer momento</p>
                    </div>
                    <p className="text-xs text-blue-600 mt-3 font-medium">
                      Para exercer seus direitos: lgpd@neonpro.com.br
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Registrando...' : 'Registrar Consentimento'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>      {/* Existing Consents */}
      {existingConsents.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-xl">Consentimentos Registrados</CardTitle>
            <CardDescription>
              Histórico de consentimentos do paciente {patientName}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {existingConsents.map((consent) => (
                <div
                  key={consent.id}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">
                          {getConsentTypeLabel(consent.consent_type)}
                        </h4>
                        {getStatusBadge(consent.status, consent.consent_given)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {consent.purpose_description}
                      </p>
                      
                      <div className="text-xs text-muted-foreground">
                        <p>Base Legal: {consent.legal_basis}</p>
                        <p>Retenção: {consent.data_retention_period}</p>
                        <p>Registrado em: {format(consent.created_at, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                        {consent.updated_at !== consent.created_at && (
                          <p>Atualizado em: {format(consent.updated_at, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedConsent(consent)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {consent.status === 'active' && consent.consent_given && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeConsent(consent.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
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
              <CardTitle className="text-xl">Detalhes do Consentimento</CardTitle>
              <CardDescription>
                Informações completas do registro de consentimento
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedConsent(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">CPF do Titular</label>
                <p className="text-sm">{selectedConsent.patient_cpf}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Consentimento</label>
                <p className="text-sm">{getConsentTypeLabel(selectedConsent.consent_type)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedConsent.status, selectedConsent.consent_given)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Base Legal</label>
                <p className="text-sm">{selectedConsent.legal_basis}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Finalidade do Tratamento</label>
              <p className="text-sm mt-1">{selectedConsent.purpose_description}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Período de Retenção</label>
              <p className="text-sm mt-1">{selectedConsent.data_retention_period}</p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Como Revogar Este Consentimento</h4>
              <p className="text-sm text-muted-foreground">
                Para revogar este consentimento, entre em contato conosco através do email{' '}
                <a href="mailto:lgpd@neonpro.com.br" className="text-primary underline">
                  lgpd@neonpro.com.br
                </a>{' '}
                informando seu CPF e o tipo de consentimento que deseja revogar.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Baixar Comprovante
              </Button>
              {selectedConsent.status === 'active' && selectedConsent.consent_given && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleRevokeConsent(selectedConsent.id)
                    setSelectedConsent(null)
                  }}
                >
                  Revogar Consentimento
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
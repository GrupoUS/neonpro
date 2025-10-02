/**
 * Treatment Package Scheduler Component
 * Brazilian healthcare compliant aesthetic treatment package scheduling interface
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.ts'
import { Badge } from '@/components/ui/badge.ts'
import { Button } from '@/components/ui/button.ts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.ts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.ts'
import { useHealthcareQuery, useHealthcareMutation } from '@/hooks/useTRPCHealthcare.ts'
import {
  type TreatmentPackage,
  type TreatmentPackageResponse,
} from '@/types/aesthetic-scheduling.ts'
import { useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  Info,
  Loader2,
  Package,
  XCircle,
} from 'lucide-react'
import React, { useState } from 'react'

interface TreatmentPackageSchedulerProps {
  patientId: string
  onSuccess?: (response: TreatmentPackageResponse) => void
  onError?: (error: Error) => void
}

export function TreatmentPackageScheduler(
  { patientId, onSuccess, onError }: TreatmentPackageSchedulerProps,
) {
  const queryClient = useQueryClient()
  const [selectedPackage, setSelectedPackage] = useState<TreatmentPackage | null>(null)
  const [startDate, setStartDate] = useState<string>('')
  const [preferences, setPreferences] = useState<Record<string, any>>({})

  // Fetch treatment packages with healthcare compliance
  const { data: packagesData, isLoading: packagesLoading, complianceError } = useHealthcareQuery(
    'aestheticScheduling.getTreatmentPackages',
    { limit: 100, offset: 0 },
    {
      select: (data: any) => data.packages,
    }
  )

  // Schedule treatment package mutation with healthcare compliance
  const scheduleMutation = useHealthcareMutation(
    'aestheticScheduling.scheduleTreatmentPackage',
    {
      onSuccess: (data: any) => {
        void queryClient.invalidateQueries({ queryKey: ['appointments'] })
        void queryClient.invalidateQueries({ queryKey: ['patients', patientId] })
        onSuccess?.(data)
      },
      onError: (error: any) => {
        onError?.(error as Error)
      },
    }
  )

  const handlePackageSelect = (pkg: any) => {
    setSelectedPackage(pkg)
    // Set default start date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setStartDate(tomorrow.toISOString().split('T')[0] || '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPackage || !startDate) return

    scheduleMutation.mutate({
      packageId: selectedPackage.id,
      patientId,
      startDate: new Date(startDate),
      preferences,
    })
  }

  const isSubmitting = scheduleMutation.isLoading

  // Show compliance error if present
  if (complianceError) {
    return (
      <div className='max-w-6xl mx-auto p-6'>
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erro de Conformidade</AlertTitle>
          <AlertDescription>
            {complianceError}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (packagesLoading) {
    return (
      <div className='max-w-6xl mx-auto p-6'>
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-3 text-lg'>Carregando pacotes de tratamento...</span>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Agendamento de Pacotes de Tratamento
        </h1>
        <p className='text-gray-600'>
          Escolha um pacote de tratamento completo com múltiplas sessões e descontos exclusivos
        </p>
      </div>

      {scheduleMutation.error && (
        <Alert variant='destructive'>
          <XCircle className='h-4 w-4' />
          <AlertTitle>Erro no Agendamento</AlertTitle>
          <AlertDescription>
            {scheduleMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        <Tabs defaultValue='packages' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='packages'>Pacotes Disponíveis</TabsTrigger>
            <TabsTrigger value='details'>Detalhes do Pacote</TabsTrigger>
            <TabsTrigger value='scheduling'>Agendamento</TabsTrigger>
          </TabsList>

          <TabsContent value='packages' className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {packagesData?.map((pkg: any) => (
                <Card
                  key={pkg.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedPackage?.id === pkg.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Package className='h-5 w-5' />
                      {pkg.name}
                    </CardTitle>
                    <CardDescription className='line-clamp-3'>
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-600'>Categoria:</span>
                      <Badge variant='secondary'>{pkg.category}</Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-600'>Sessões:</span>
                      <span className='font-medium'>{pkg.totalSessions}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-600'>Validade:</span>
                      <span className='font-medium'>{pkg.validityPeriod} dias</span>
                    </div>
                    <div className='border-t pt-2'>
                      <div className='flex justify-between items-center mb-1'>
                        <span className='text-sm text-gray-600'>Valor Total:</span>
                        <span className='text-lg font-bold text-gray-900'>
                          R$ {pkg.totalPrice.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className='flex justify-between items-center mb-1'>
                        <span className='text-sm text-gray-600'>Desconto:</span>
                        <Badge variant='destructive' className='text-xs'>
                          {pkg.packageDiscount}% OFF
                        </Badge>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Valor Final:</span>
                        <span className='text-lg font-bold text-green-600'>
                          R$ {(pkg.totalPrice * (1 - pkg.packageDiscount / 100)).toLocaleString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Clock className='h-4 w-4' />
                      <span>
                        Economia: R$ {(pkg.totalPrice * pkg.packageDiscount / 100).toLocaleString(
                          "pt-BR",
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value='details' className='space-y-6'>
            {selectedPackage
              ? (
                <div className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Package className='h-5 w-5' />
                        {selectedPackage.name}
                      </CardTitle>
                      <CardDescription>
                        {selectedPackage.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <h3 className='font-medium text-gray-900 mb-3'>Informações do Pacote</h3>
                          <div className='space-y-2'>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Categoria:</span>
                              <Badge variant='secondary'>{selectedPackage.category}</Badge>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Total de Sessões:</span>
                              <span className='font-medium'>{selectedPackage.totalSessions}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Período de Validade:</span>
                              <span className='font-medium'>
                                {selectedPackage.validityPeriod} dias
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Status:</span>
                              <Badge variant={selectedPackage.isActive ? 'default' : 'secondary'}>
                                {selectedPackage.isActive ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className='font-medium text-gray-900 mb-3'>Resumo Financeiro</h3>
                          <div className='space-y-2'>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Valor Total:</span>
                              <span className='font-medium'>
                                R$ {selectedPackage.totalPrice.toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Desconto do Pacote:</span>
                              <span className='font-medium text-red-600'>
                                -{selectedPackage.packageDiscount}%
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Valor Descontado:</span>
                              <span className='font-medium text-green-600'>
                                -R$ {(selectedPackage.totalPrice *
                                  selectedPackage.packageDiscount /
                                  100).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <div className='border-t pt-2 flex justify-between'>
                              <span className='text-gray-900 font-medium'>Valor Final:</span>
                              <span className='font-bold text-green-600 text-lg'>
                                R$ {(selectedPackage.totalPrice *
                                  (1 - selectedPackage.packageDiscount / 100)).toLocaleString(
                                    'pt-BR',
                                  )}
                              </span>
                            </div>
                            <div className='flex justify-between text-sm'>
                              <span className='text-gray-600'>Economia Total:</span>
                              <span className='font-medium text-green-600'>
                                R$ {(selectedPackage.totalPrice *
                                  selectedPackage.packageDiscount /
                                  100).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className='font-medium text-gray-900 mb-3'>Procedimentos Incluídos</h3>
                        <div className='space-y-3'>
                          {selectedPackage.procedures.map((procedure, index) => (
                            <Card key={index} className='bg-gray-50'>
                              <CardContent className='p-4'>
                                <div className='flex justify-between items-start mb-2'>
                                  <h4 className='font-medium text-gray-900'>
                                    {procedure.procedure.name}
                                  </h4>
                                  <Badge variant='outline'>{procedure.procedure.category}</Badge>
                                </div>
                                <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                                  {procedure.procedure.description}
                                </p>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                                  <div>
                                    <span className='text-gray-600'>Sessões:</span>
                                    <div className='font-medium'>{procedure.sessions}</div>
                                  </div>
                                  <div>
                                    <span className='text-gray-600'>Duração:</span>
                                    <div className='font-medium'>
                                      {procedure.procedure.baseDuration} min
                                    </div>
                                  </div>
                                  <div>
                                    <span className='text-gray-600'>Valor:</span>
                                    <div className='font-medium'>
                                      R$ {procedure.price.toLocaleString("pt-BR")}
                                    </div>
                                  </div>
                                  <div>
                                    <span className='text-gray-600'>Total:</span>
                                    <div className='font-medium'>
                                      R$ {(procedure.price * procedure.sessions).toLocaleString(
                                        "pt-BR",
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <Alert>
                        <Info className='h-4 w-4' />
                        <AlertTitle>Informações Importantes</AlertTitle>
                        <AlertDescription>
                          <ul className='list-disc list-inside space-y-1 text-sm'>
                            <li>
                              Todas as sessões devem ser realizadas dentro do período de validade do
                              pacote
                            </li>
                            <li>
                              Os descontos aplicam-se apenas ao agendamento do pacote completo
                            </li>
                            <li>Cancelamentos podem estar sujeitos a políticas específicas</li>
                            <li>
                              Procedimentos podem ser adaptados conforme avaliação profissional
                            </li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </div>
              )
              : (
                <Card>
                  <CardContent className='p-6 text-center'>
                    <Package className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      Nenhum Pacote Selecionado
                    </h3>
                    <p className='text-gray-600'>
                      Volte para a aba &quot;Pacotes Disponíveis&quot; para selecionar um pacote de
                      tratamento.
                    </p>
                  </CardContent>
                </Card>
              )}
          </TabsContent>

          <TabsContent value='scheduling' className='space-y-6'>
            {selectedPackage
              ? (
                <div className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Agendamento do Pacote</CardTitle>
                      <CardDescription>
                        Configure o agendamento para o pacote {selectedPackage.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Data de Início
                        </label>
                        <input
                          type='date'
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                          required
                          aria-label='Data de início do tratamento'
                        />
                      </div>

                      <div>
                        <h3 className='font-medium text-gray-900 mb-3'>
                          Preferências de Agendamento
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Horário Preferencial
                            </label>
                            <select
                              value={preferences.preferredTime || ''}
                              onChange={e =>
                                setPreferences({ ...preferences, preferredTime: e.target.value })}
                              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                            >
                              <option value=''>Selecione um horário</option>
                              <option value='morning'>Manhã (8h-12h)</option>
                              <option value='afternoon'>Tarde (13h-17h)</option>
                              <option value='evening'>Noite (18h-21h)</option>
                            </select>
                          </div>

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Frequência Desejada
                            </label>
                            <select
                              value={preferences.frequency || ''}
                              onChange={e =>
                                setPreferences({ ...preferences, frequency: e.target.value })}
                              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                            >
                              <option value=''>Selecione a frequência</option>
                              <option value='weekly'>Semanal</option>
                              <option value='biweekly'>Quinzenal</option>
                              <option value='monthly'>Mensal</option>
                              <option value='flexible'>Flexível</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className='font-medium text-gray-900 mb-3'>Informações Adicionais</h3>
                        <div className='space-y-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Observações
                            </label>
                            <textarea
                              value={preferences.notes || ''}
                              onChange={e =>
                                setPreferences({ ...preferences, notes: e.target.value })}
                              rows={3}
                              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                              placeholder='Adicione qualquer informação relevante para o agendamento...'
                            />
                          </div>

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Restrições de Dias
                            </label>
                            <div className='grid grid-cols-3 gap-2'>
                              {[
                                'segunda',
                                'terça',
                                'quarta',
                                'quinta',
                                'sexta',
                                'sábado',
                                'domingo',
                              ].map(day => (
                                <label key={day} className='flex items-center'>
                                  <input
                                    type='checkbox'
                                    checked={preferences.restrictedDays?.includes(day) || false}
                                    onChange={e => {
                                      const restrictedDays = preferences.restrictedDays || []
                                      if (e.target.checked) {
                                        setPreferences({
                                          ...preferences,
                                          restrictedDays: [...restrictedDays, day],
                                        })
                                      } else {
                                        setPreferences({
                                          ...preferences,
                                          restrictedDays: restrictedDays.filter((d: string) =>
                                            d !== day
                                          ),
                                        })
                                      }
                                    }}
                                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                  />
                                  <span className='ml-2 text-sm'>
                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='border-t pt-4'>
                        <h3 className='font-medium text-gray-900 mb-3'>Resumo do Agendamento</h3>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <h4 className='font-medium text-gray-900 mb-2'>Pacote Selecionado</h4>
                              <p className='text-sm text-gray-600'>{selectedPackage.name}</p>
                              <p className='text-sm text-gray-600'>
                                {selectedPackage.totalSessions} sessões •{' '}
                                {selectedPackage.totalSessions} dias de validade
                              </p>
                            </div>
                            <div>
                              <h4 className='font-medium text-gray-900 mb-2'>Valores</h4>
                              <p className='text-sm text-gray-600'>
                                Valor Final:{' '}
                                <span className='font-medium text-green-600'>
                                  R$ {(selectedPackage.totalPrice *
                                    (1 - selectedPackage.packageDiscount / 100)).toLocaleString(
                                      "pt-BR",
                                    )}
                                </span>
                              </p>
                              <p className='text-sm text-gray-600'>
                                Economia:{' '}
                                <span className='font-medium text-green-600'>
                                  R$ {(selectedPackage.totalPrice * selectedPackage.packageDiscount /
                                    100).toLocaleString("pt-BR")}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
              : (
                <Card>
                  <CardContent className='p-6 text-center'>
                    <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      Pacote Não Selecionado
                    </h3>
                    <p className='text-gray-600'>
                      Selecione um pacote na aba &quot;Pacotes Disponíveis&quot; para prosseguir com o
                      agendamento.
                    </p>
                  </CardContent>
                </Card>
              )}
          </TabsContent>
        </Tabs>

        <div className='flex justify-end gap-4'>
          <Button type='button' variant='outline' disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type='submit'
            disabled={!selectedPackage || !startDate || isSubmitting}
            className='min-w-32'
          >
            {isSubmitting
              ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Agendando...
                </>
              )
              : (
                'Confirmar Agendamento'
              )}
          </Button>
        </div>
      </form>
    </div>
  )
}

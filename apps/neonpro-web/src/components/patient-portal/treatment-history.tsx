"use client"

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Activity, 
  Calendar, 
  Star, 
  Image, 
  FileText, 
  Heart,
  TrendingUp,
  Clock,
  User,
  ChevronRight,
  Download,
  Eye
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { usePatientData } from '@/lib/hooks/use-patient-data'

interface TreatmentPhotoGallery {
  id: string
  treatment_id: string
  type: 'before' | 'after' | 'during'
  photo_url: string
  caption?: string
  taken_at: string
}

export function TreatmentHistory() {
  const { treatmentHistory, isLoading } = usePatientData()
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null)

  // Sample enhanced data - in production, this would come from API
  const enhancedTreatments = treatmentHistory.map(treatment => ({
    ...treatment,
    service_name: 'Harmonização Facial',
    professional_name: 'Dra. Marina Silva',
    progress_percentage: 85,
    next_session_date: '2025-02-15',
    photos: [
      {
        id: '1',
        treatment_id: treatment.id,
        type: 'before' as const,
        photo_url: '/placeholder-before.jpg',
        caption: 'Antes do tratamento',
        taken_at: treatment.created_at
      },
      {
        id: '2',
        treatment_id: treatment.id,
        type: 'after' as const,
        photo_url: '/placeholder-after.jpg',
        caption: 'Após 1ª sessão',
        taken_at: new Date().toISOString()
      }
    ]
  }))

  const getStatusBadge = (status: string) => {
    const badges = {
      in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Concluído', color: 'bg-green-100 text-green-800' },
      paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    }
    return badges[status as keyof typeof badges] || badges.in_progress
  }

  const getSatisfactionStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Histórico de Tratamentos
        </h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe a evolução dos seus tratamentos estéticos
        </p>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-muted-foreground">Sessões Realizadas</div>
          </CardContent>
        </Card>
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-muted-foreground">Tratamentos Ativos</div>
          </CardContent>
        </Card>
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">95%</div>
            <div className="text-sm text-muted-foreground">Satisfação Geral</div>
          </CardContent>
        </Card>
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">2</div>
            <div className="text-sm text-muted-foreground">Próximas Sessões</div>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Timeline */}
      <div className="space-y-6">
        {enhancedTreatments.length > 0 ? (
          enhancedTreatments.map((treatment, index) => {
            const badge = getStatusBadge('in_progress')
            
            return (
              <Card key={treatment.id} className="medical-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                      {index < enhancedTreatments.length - 1 && (
                        <div className="w-0.5 h-16 bg-gradient-to-b from-blue-200 to-purple-200 mt-4"></div>
                      )}
                    </div>

                    {/* Treatment Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{treatment.service_name}</h3>
                            <Badge className={badge.color}>{badge.label}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {treatment.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{treatment.professional_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(parseISO(treatment.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl">
                                {treatment.service_name} - Detalhes do Tratamento
                              </DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Treatment Progress */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Progresso do Tratamento</span>
                                  <span className="text-sm font-semibold text-primary">
                                    {treatment.progress_percentage}%
                                  </span>
                                </div>
                                <Progress value={treatment.progress_percentage} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                  Próxima sessão agendada para {format(parseISO(treatment.next_session_date), "d 'de' MMMM", { locale: ptBR })}
                                </p>
                              </div>

                              {/* Before/After Photos */}
                              <div className="space-y-4">
                                <h4 className="font-semibold">Evolução Fotográfica</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  {treatment.photos.map((photo) => (
                                    <div key={photo.id} className="space-y-2">
                                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                                        <Image className="w-12 h-12 text-muted-foreground" />
                                      </div>
                                      <div className="text-center">
                                        <p className="text-sm font-medium">{photo.caption}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {format(parseISO(photo.taken_at), "d 'de' MMM", { locale: ptBR })}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Satisfaction Rating */}
                              {treatment.satisfaction_score && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold">Sua Avaliação</h4>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {getSatisfactionStars(treatment.satisfaction_score)}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      ({treatment.satisfaction_score}/5)
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Treatment Notes */}
                              <div className="space-y-2">
                                <h4 className="font-semibold">Observações Médicas</h4>
                                <div className="bg-muted/50 rounded-lg p-4">
                                  <p className="text-sm">{treatment.notes}</p>
                                </div>
                              </div>

                              {/* Follow-up Information */}
                              {treatment.follow_up_required && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                      <h4 className="font-semibold text-blue-900">
                                        Acompanhamento Necessário
                                      </h4>
                                      <p className="text-blue-800 text-sm">
                                        Retorno agendado para {format(parseISO(treatment.follow_up_date!), "d 'de' MMMM", { locale: ptBR })}
                                        para avaliação da evolução do tratamento.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Progress bar for active treatments */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Progresso</span>
                          <span className="text-primary font-semibold">
                            {treatment.progress_percentage}%
                          </span>
                        </div>
                        <Progress value={treatment.progress_percentage} className="h-2" />
                      </div>

                      {/* Quick actions */}
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                          <Image className="w-4 h-4 mr-2" />
                          Ver Fotos
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          Relatórios
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Agendar Retorno
                        </Button>
                      </div>

                      {/* Satisfaction rating */}
                      {treatment.satisfaction_score && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <span className="text-sm text-muted-foreground">Sua avaliação:</span>
                          <div className="flex">
                            {getSatisfactionStars(treatment.satisfaction_score)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({treatment.satisfaction_score}/5)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="medical-card">
            <CardContent className="p-12 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum tratamento encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não possui histórico de tratamentos realizados.
              </p>
              <Button asChild>
                <a href="/patient-portal/appointments/new">
                  Agendar Primeira Consulta
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Wellness Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 medical-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">
                Dicas para Potencializar seus Resultados
              </h3>
              <div className="text-blue-800 text-sm space-y-2">
                <p>• Mantenha uma rotina de cuidados conforme orientação médica</p>
                <p>• Hidrate-se adequadamente (pelo menos 2L de água por dia)</p>
                <p>• Use protetor solar diariamente, mesmo em dias nublados</p>
                <p>• Compareça às consultas de retorno para acompanhamento</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

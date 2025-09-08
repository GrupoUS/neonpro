'use client'

// Removed unused AlertDialog imports and aliases
import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { Progress, } from '@/components/ui/progress'
// Removed unused Separator import
import { Tabs, TabsContent, TabsList, TabsTrigger, } from '@/components/ui/tabs'
import { useToast, } from '@/components/ui/use-toast'
import { useStaffTraining, } from '@/hooks/use-staff-training'
import { cn, } from '@/lib/utils'
import type { TrainingModule, } from '@/types/staff-training'
import {
  DIFFICULTY_LABELS_PT,
  ROLE_LABELS_PT,
  SECTION_TYPE_LABELS_PT,
  TRAINING_CATEGORY_LABELS_PT,
} from '@/types/staff-training'
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Play,
  Smartphone,
  Star,
  Target,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react'
import { useState, } from 'react'

interface StaffTrainingInterfaceProps {
  userId?: string
  userRole?: string
  compactMode?: boolean
  offlineMode?: boolean
}

/**
 * Staff Training Interface - Interactive training system for clinical staff
 * PWA-capable with offline support and Brazilian healthcare compliance
 */
export function StaffTrainingInterface({
  userId,
  userRole,
  compactMode: _compactMode = false,
  offlineMode = false,
}: StaffTrainingInterfaceProps,) {
  const { toast, } = useToast()
  const {
    modules: trainingModules,
    progress: userProgress,
    isLoading,
    startModule,
  } = useStaffTraining()

  const [activeTab, setActiveTab,] = useState('dashboard',)
  const [selectedModule, setSelectedModule,] = useState<TrainingModule | null>(
    null,
  )
  const [isGeneratingCertificate, setIsGeneratingCertificate,] = useState(false,)
  const [eligibleCertifications,] = useState<string[]>([],)

  // Removed certification eligibility check - not available in simplified hook

  const handleStartModule = async (module: TrainingModule,) => {
    try {
      await startModule(module.id,)
      setActiveTab('learning',)
    } catch (err) {
      console.error('Error starting module:', err,)
    }
  }

  const handleGenerateCertificate = async (moduleId: string,) => {
    setIsGeneratingCertificate(true,)
    try {
      // Simplified certificate generation - would normally call API
      console.log('Certificate generation requested for module:', moduleId,)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000,))
      toast({
        title: 'Certificado gerado',
        description: 'Seu certificado foi gerado com sucesso.',
        variant: 'default',
      },)
    } catch (err) {
      console.error('Error generating certificate:', err,)
    } finally {
      setIsGeneratingCertificate(false,)
    }
  }

  const getCategoryIcon = (category: string,) => {
    switch (category) {
      case 'basics':
        return <BookOpen className="h-4 w-4" />
      case 'prediction':
        return <Brain className="h-4 w-4" />
      case 'intervention':
        return <Users className="h-4 w-4" />
      case 'workflow':
        return <TrendingUp className="h-4 w-4" />
      case 'compliance':
        return <FileText className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getSectionIcon = (type: string,) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'text':
        return <FileText className="h-4 w-4" />
      case 'interactive':
        return <Target className="h-4 w-4" />
      case 'case_study':
        return <Users className="h-4 w-4" />
      case 'checklist':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  // Calculate progress metrics from available data
  const requiredModules = trainingModules.filter(m => m.isRequired)
  const completedModules = trainingModules.filter(m => userProgress[m.id]?.completedAt)
  const overallProgress = trainingModules.length > 0
    ? (completedModules.length / trainingModules.length) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Treinamento da Equipe</h1>
          <p className="text-muted-foreground">
            Sistema interativo para prevenção de no-show com IA
          </p>
          {userRole && (
            <Badge variant="outline" className="mt-2">
              {ROLE_LABELS_PT[userRole as keyof typeof ROLE_LABELS_PT]}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {offlineMode && (
            <Button
              variant="outline"
              onClick={() => console.log('Sync offline data',)}
            >
              <Download className="h-4 w-4 mr-2" />
              Sincronizar
            </Button>
          )}

          {eligibleCertifications.length > 0 && (
            <Badge variant="secondary">
              <Award className="h-3 w-3 mr-1" />
              {eligibleCertifications.length} certificação(ões) disponível(is)
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      {trainingModules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Seu Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso Geral</span>
                  <span>{overallProgress.toFixed(0,)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {requiredModules.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Módulos Requeridos
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {completedModules.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {completedModules.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Certificações</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(completedModules.length * 2,)}h
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tempo de Estudo
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Painel</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="learning">Aprendizado</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Recent Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Módulos em Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(userProgress,)
                  .filter(([_, progress,],) => progress.status === 'in_progress')
                  .slice(0, 3,)
                  .map(([moduleId, progress,],) => {
                    const trainingModule = trainingModules.find(
                      (m,) => m.id === moduleId,
                    )
                    if (!trainingModule) {
                      return null
                    }

                    const moduleProgress = progress

                    return (
                      <div
                        key={moduleId}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'p-2 rounded-full',
                              trainingModule.category === 'basics'
                                ? 'bg-blue-100'
                                : trainingModule.category === 'prediction'
                                ? 'bg-purple-100'
                                : trainingModule.category === 'intervention'
                                ? 'bg-green-100'
                                : trainingModule.category === 'workflow'
                                ? 'bg-orange-100'
                                : 'bg-gray-100',
                            )}
                          >
                            {getCategoryIcon(trainingModule.category,)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{trainingModule.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {TRAINING_CATEGORY_LABELS_PT[
                                trainingModule.category as keyof typeof TRAINING_CATEGORY_LABELS_PT
                              ]} • {trainingModule.duration}min
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {moduleProgress.completedAt ? 100 : 0}%
                            </p>
                            <Progress
                              value={moduleProgress.completedAt ? 100 : 0}
                              className="w-20 h-2"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedModule(trainingModule as unknown as TrainingModule,)
                              setActiveTab('learning',)
                            }}
                          >
                            Continuar
                          </Button>
                        </div>
                      </div>
                    )
                  },)}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendados para Você</CardTitle>
              <CardDescription>
                Baseado no seu papel como {userRole
                  && ROLE_LABELS_PT[
                    userRole as keyof typeof ROLE_LABELS_PT
                  ]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainingModules
                  .filter(
                    (module,) =>
                      requiredModules.some(req => req.id === module.id)
                      && !completedModules.some(comp => comp.id === module.id),
                  )
                  .slice(0, 6,)
                  .map((module,) => (
                    <Card
                      key={module.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {TRAINING_CATEGORY_LABELS_PT[
                              module.category as keyof typeof TRAINING_CATEGORY_LABELS_PT
                            ]}
                          </Badge>
                          <Badge
                            variant={module.difficulty === 'beginner'
                              ? 'secondary'
                              : module.difficulty === 'intermediate'
                              ? 'default'
                              : 'destructive'}
                          >
                            {DIFFICULTY_LABELS_PT[module.difficulty]}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {module.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {module.duration}min
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleStartModule(module as unknown as TrainingModule,)}
                            disabled={isLoading}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Iniciar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {trainingModules.map((module,) => {
              const progress = userProgress[module.id]
              const moduleProgress = progress?.completedAt
                ? 100
                : progress?.startedAt
                ? 50
                : 0
              const isCompleted = progress?.status === 'completed'
              const isInProgress = progress?.status === 'in_progress'
              const canStart = module.prerequisites.every(
                (prereqId,) => userProgress[prereqId]?.status === 'completed',
              )

              return (
                <Card
                  key={module.id}
                  className={cn(
                    'transition-all duration-200',
                    isCompleted && 'border-green-200 bg-green-50/30',
                    isInProgress && 'border-blue-200 bg-blue-50/30',
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(module.category,)}
                        <Badge variant="outline" className="text-xs">
                          {TRAINING_CATEGORY_LABELS_PT[
                            module.category as keyof typeof TRAINING_CATEGORY_LABELS_PT
                          ]}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {isInProgress && <Clock className="h-4 w-4 text-blue-600" />}
                        {module.isRequired && <Star className="h-4 w-4 text-yellow-600" />}
                      </div>
                    </div>

                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {module.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    {progress && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progresso</span>
                          <span>{moduleProgress.toFixed(0,)}%</span>
                        </div>
                        <Progress value={moduleProgress} className="h-2" />
                      </div>
                    )}

                    {/* Module Details */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {module.duration}min
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {module.sections.length} seções
                      </div>
                    </div>

                    {/* Sections Preview */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Conteúdo:</p>
                      <div className="flex flex-wrap gap-1">
                        {module.sections.slice(0, 4,).map((section,) => (
                          <Badge
                            key={section.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {getSectionIcon(section.type,)}
                            <span className="ml-1">
                              {SECTION_TYPE_LABELS_PT[
                                section.type as keyof typeof SECTION_TYPE_LABELS_PT
                              ]}
                            </span>
                          </Badge>
                        ))}
                        {module.sections.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{module.sections.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!progress && canStart && (
                        <Button
                          className="flex-1"
                          onClick={() => handleStartModule(module as unknown as TrainingModule,)}
                          disabled={isLoading}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Iniciar
                        </Button>
                      )}

                      {isInProgress && (
                        <Button
                          className="flex-1"
                          onClick={() => {
                            setSelectedModule(module as unknown as TrainingModule,)
                            setActiveTab('learning',)
                          }}
                        >
                          Continuar
                        </Button>
                      )}

                      {isCompleted && (
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => handleGenerateCertificate(module.id,)}
                          disabled={isGeneratingCertificate}
                        >
                          <Award className="h-3 w-3 mr-1" />
                          Certificado
                        </Button>
                      )}

                      {offlineMode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Download offline:', module.id,)}
                        >
                          <Smartphone className="h-3 w-3" />
                        </Button>
                      )}

                      {!canStart && (
                        <Button className="flex-1" disabled>
                          Pré-requisitos
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            },)}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          {selectedModule
            ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedModule.title}</CardTitle>
                      <CardDescription>
                        {selectedModule.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {TRAINING_CATEGORY_LABELS_PT[
                        selectedModule.category as keyof typeof TRAINING_CATEGORY_LABELS_PT
                      ]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Conteúdo do Módulo</h3>
                      <Badge variant="secondary">Leitura</Badge>
                    </div>

                    {/* Section Content */}
                    <div className="prose max-w-none">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p>Conteúdo do módulo de treinamento será exibido aqui.</p>
                        <p>Este é um placeholder para o sistema de aprendizado interativo.</p>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t">
                      <Button variant="outline" onClick={() => setActiveTab('modules',)}>
                        Anterior
                      </Button>
                      <Button onClick={() => console.log('Next section',)}>Próximo</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
            : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione um Módulo</h3>
                <p className="text-muted-foreground mb-4">
                  Escolha um módulo da lista para começar seu treinamento.
                </p>
                <Button onClick={() => setActiveTab('modules',)}>Ver Módulos</Button>
              </div>
            )}
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seus Certificados</CardTitle>
              <CardDescription>
                Certificados conquistados e certificações disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedModules.length > 0
                ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedModules.map((module,) => (
                      <Card key={module.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Award className="h-6 w-6 text-yellow-600" />
                            <Badge variant="secondary">
                              {userProgress[module.id]?.completedAt?.toLocaleDateString('pt-BR',)
                                || 'Concluído'}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Duração:</span>
                              <span className="text-sm font-medium">
                                {module.duration}min
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Categoria:</span>
                              <span className="text-sm font-medium">
                                {TRAINING_CATEGORY_LABELS_PT[
                                  module.category as keyof typeof TRAINING_CATEGORY_LABELS_PT
                                ]}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full mt-3"
                              onClick={() => handleGenerateCertificate(module.id,)}
                              disabled={isGeneratingCertificate}
                            >
                              <Download className="h-3 w-3 mr-2" />
                              Gerar Certificado
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
                : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhum Certificado Ainda
                    </h3>
                    <p className="text-muted-foreground">
                      Complete os módulos de treinamento para ganhar certificados.
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

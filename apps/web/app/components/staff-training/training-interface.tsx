'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Play,
  BookOpen,
  Video,
  CheckCircle,
  Clock,
  Award,
  Download,
  Smartphone,
  Users,
  Target,
  Brain,
  FileText,
  Star,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStaffTraining } from '@/hooks/use-staff-training';
import {
  TrainingModule,
  TRAINING_CATEGORY_LABELS_PT,
  DIFFICULTY_LABELS_PT,
  SECTION_TYPE_LABELS_PT,
  ROLE_LABELS_PT
} from '@/types/staff-training';

interface StaffTrainingInterfaceProps {
  userId?: string;
  userRole?: string;
  compactMode?: boolean;
  offlineMode?: boolean;
}

/**
 * Staff Training Interface - Interactive training system for clinical staff
 * PWA-capable with offline support and Brazilian healthcare compliance
 */
export function StaffTrainingInterface({
  userId,
  userRole,
  compactMode = false,
  offlineMode = false
}: StaffTrainingInterfaceProps) {

  const {
    userProfile,
    trainingModules,
    userProgress,
    currentModule,
    currentSection,
    isLoading,
    error,
    startModule,
    completeSection,
    getModuleProgress,
    getOverallProgress,
    getCompletedModules,
    getRequiredModules,
    generateCertificate,
    checkCertificationEligibility,
    downloadModuleForOffline,
    isOfflineCapable,
    syncOfflineData
  } = useStaffTraining({
    userId,
    role: userRole,
    autoSave: true,
    offlineMode
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [eligibleCertifications, setEligibleCertifications] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      checkCertificationEligibility().then(setEligibleCertifications);
    }
  }, [userId, checkCertificationEligibility]);

  const handleStartModule = async (module: TrainingModule) => {
    try {
      await startModule(module.id);
      setActiveTab('learning');
    } catch (err) {
      console.error('Error starting module:', err);
    }
  };

  const handleGenerateCertificate = async (moduleId: string) => {
    setIsGeneratingCertificate(true);
    try {
      const certificateUrl = await generateCertificate(moduleId);
      window.open(certificateUrl, '_blank');
    } catch (err) {
      console.error('Error generating certificate:', err);
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics': return <BookOpen className="h-4 w-4" />;
      case 'prediction': return <Brain className="h-4 w-4" />;
      case 'intervention': return <Users className="h-4 w-4" />;
      case 'workflow': return <TrendingUp className="h-4 w-4" />;
      case 'compliance': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'interactive': return <Target className="h-4 w-4" />;
      case 'case_study': return <Users className="h-4 w-4" />;
      case 'checklist': return <CheckCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const requiredModules = getRequiredModules();
  const completedModules = getCompletedModules();
  const overallProgress = getOverallProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Treinamento da Equipe</h1>
          <p className="text-muted-foreground">
            Sistema interativo para prevenção de no-show com IA
          </p>
          {userProfile && (
            <Badge variant="outline" className="mt-2">
              {ROLE_LABELS_PT[userProfile.role as keyof typeof ROLE_LABELS_PT]} - {userProfile.department}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {offlineMode && (
            <Button variant="outline" onClick={syncOfflineData}>
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
      {userProfile && (
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
                  <span>{overallProgress.toFixed(0)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{requiredModules.length}</p>
                  <p className="text-sm text-muted-foreground">Módulos Requeridos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{completedModules.length}</p>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {userProfile.certificationsEarned.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Certificações</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(userProfile.totalTimeSpent / 60)}h
                  </p>
                  <p className="text-sm text-muted-foreground">Tempo de Estudo</p>
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
                {Object.entries(userProgress)
                  .filter(([_, progress]) => progress.status === 'in_progress')
                  .slice(0, 3)
                  .map(([moduleId, progress]) => {
                    const module = trainingModules.find(m => m.id === moduleId);
                    if (!module) return null;
                    
                    const moduleProgress = getModuleProgress(moduleId);
                    
                    return (
                      <div key={moduleId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded-full',
                            module.category === 'basics' ? 'bg-blue-100' :
                            module.category === 'prediction' ? 'bg-purple-100' :
                            module.category === 'intervention' ? 'bg-green-100' :
                            module.category === 'workflow' ? 'bg-orange-100' : 'bg-gray-100'
                          )}>
                            {getCategoryIcon(module.category)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{module.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {TRAINING_CATEGORY_LABELS_PT[module.category]} • {module.duration}min
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{moduleProgress.toFixed(0)}%</p>
                            <Progress value={moduleProgress} className="w-20 h-2" />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedModule(module);
                              setActiveTab('learning');
                            }}
                          >
                            Continuar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
          
          {/* Recommended Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendados para Você</CardTitle>
              <CardDescription>
                Baseado no seu papel como {userProfile?.role && ROLE_LABELS_PT[userProfile.role as keyof typeof ROLE_LABELS_PT]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainingModules
                  .filter(module => 
                    requiredModules.includes(module.id) && 
                    !completedModules.includes(module.id)
                  )
                  .slice(0, 6)
                  .map(module => (
                    <Card key={module.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {TRAINING_CATEGORY_LABELS_PT[module.category]}
                          </Badge>
                          <Badge variant={
                            module.difficulty === 'beginner' ? 'secondary' :
                            module.difficulty === 'intermediate' ? 'default' : 'destructive'
                          }>
                            {DIFFICULTY_LABELS_PT[module.difficulty]}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
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
                            onClick={() => handleStartModule(module)}
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
            {trainingModules.map(module => {
              const progress = userProgress[module.id];
              const moduleProgress = progress ? getModuleProgress(module.id) : 0;
              const isCompleted = progress?.status === 'completed';
              const isInProgress = progress?.status === 'in_progress';
              const canStart = module.prerequisites.every(prereqId => 
                userProgress[prereqId]?.status === 'completed'
              );

              return (
                <Card key={module.id} className={cn(
                  'transition-all duration-200',
                  isCompleted && 'border-green-200 bg-green-50/30',
                  isInProgress && 'border-blue-200 bg-blue-50/30'
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(module.category)}
                        <Badge variant="outline" className="text-xs">
                          {TRAINING_CATEGORY_LABELS_PT[module.category]}
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
                          <span>{moduleProgress.toFixed(0)}%</span>
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
                        {module.sections.slice(0, 4).map(section => (
                          <Badge key={section.id} variant="secondary" className="text-xs">
                            {getSectionIcon(section.type)}
                            <span className="ml-1">
                              {SECTION_TYPE_LABELS_PT[section.type as keyof typeof SECTION_TYPE_LABELS_PT]}
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
                          onClick={() => handleStartModule(module)}
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
                            setSelectedModule(module);
                            setActiveTab('learning');
                          }}
                        >
                          Continuar
                        </Button>
                      )}
                      
                      {isCompleted && (
                        <Button 
                          className="flex-1"
                          variant="outline"
                          onClick={() => handleGenerateCertificate(module.id)}
                          disabled={isGeneratingCertificate}
                        >
                          <Award className="h-3 w-3 mr-1" />
                          Certificado
                        </Button>
                      )}
                      
                      {offlineMode && isOfflineCapable(module.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadModuleForOffline(module.id)}
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
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          {currentModule ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{currentModule.title}</CardTitle>
                    <CardDescription>{currentModule.description}</CardDescription>
                  </div>
                  <Badge variant="outline">
                    {TRAINING_CATEGORY_LABELS_PT[currentModule.category]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentSection ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{currentSection.title}</h3>
                      <Badge variant="secondary">
                        {SECTION_TYPE_LABELS_PT[currentSection.type as keyof typeof SECTION_TYPE_LABELS_PT]}
                      </Badge>
                    </div>
                    
                    {/* Section Content */}
                    <div className="prose max-w-none">
                      {currentSection.content.text && (
                        <div dangerouslySetInnerHTML={{ __html: currentSection.content.text }} />
                      )}
                      
                      {currentSection.content.videoUrl && (
                        <video controls className="w-full rounded-lg">
                          <source src={currentSection.content.videoUrl} type="video/mp4" />
                        </video>
                      )}
                      
                      {currentSection.content.checklist && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Lista de Verificação:</h4>
                          {currentSection.content.checklist.map(item => (
                            <div key={item.id} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                              <div>
                                <p className="font-medium">{item.text}</p>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between pt-4 border-t">
                      <Button variant="outline">Anterior</Button>
                      <Button onClick={() => completeSection(currentSection.id)}>
                        Próximo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Módulo Concluído!</h3>
                    <p className="text-muted-foreground mb-4">
                      Você completou todas as seções deste módulo.
                    </p>
                    <Button onClick={() => handleGenerateCertificate(currentModule.id)}>
                      <Award className="h-4 w-4 mr-2" />
                      Gerar Certificado
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecione um Módulo</h3>
              <p className="text-muted-foreground mb-4">
                Escolha um módulo da lista para começar seu treinamento.
              </p>
              <Button onClick={() => setActiveTab('modules')}>
                Ver Módulos
              </Button>
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
              {userProfile?.certificationsEarned.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProfile.certificationsEarned.map(cert => (
                    <Card key={cert.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Award className="h-6 w-6 text-yellow-600" />
                          <Badge variant="secondary">
                            {cert.earnedAt.toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{cert.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Módulos:</span>
                            <span className="text-sm font-medium">{cert.moduleIds.length}</span>
                          </div>
                          {cert.expiresAt && (
                            <div className="flex justify-between">
                              <span className="text-sm">Validade:</span>
                              <span className="text-sm font-medium">
                                {cert.expiresAt.toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            className="w-full mt-3"
                            onClick={() => window.open(cert.certificateUrl, '_blank')}
                          >
                            <Download className="h-3 w-3 mr-2" />
                            Baixar Certificado
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum Certificado Ainda</h3>
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
  );
}
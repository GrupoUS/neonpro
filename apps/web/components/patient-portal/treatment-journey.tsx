"use client";

import { useState } from "react";
import {
  Heart,
  Camera,
  TrendingUp,
  Clock,
  Calendar,
  User,
  Star,
  CheckCircle,
  AlertTriangle,
  Plus,
  Download,
  Share2,
  Eye,
  Upload,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Target,
  Award,
  Activity,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@neonpro/ui";
import { cn } from "@neonpro/utils";

// Mock data for treatment journey
const mockTreatmentData = {
  activeTreatments: [
    {
      id: 1,
      name: "Rejuvenescimento Facial Completo",
      type: "Botox + Preenchimento + Bioestimulador",
      startDate: "2024-06-15",
      expectedEndDate: "2024-10-15",
      progress: 75,
      currentPhase: "Fase de Manutenção",
      doctor: "Dra. Ana Santos",
      clinic: "NeonPro Clínica Ipanema",
      sessions: {
        completed: 3,
        total: 4,
        next: "2024-08-25",
      },
      goals: [
        { id: 1, description: "Reduzir rugas de expressão", achieved: true, date: "2024-07-10" },
        { id: 2, description: "Melhorar contorno facial", achieved: true, date: "2024-07-25" },
        {
          id: 3,
          description: "Hidratação e luminosidade",
          achieved: false,
          targetDate: "2024-09-01",
        },
        {
          id: 4,
          description: "Resultado natural duradouro",
          achieved: false,
          targetDate: "2024-10-15",
        },
      ],
      milestones: [
        {
          id: 1,
          title: "Primeira Aplicação - Botox",
          date: "2024-06-15",
          description: "Aplicação inicial de toxina botulínica",
          status: "completed",
          photos: ["before-1.jpg", "during-1.jpg"],
          notes: "Paciente tolerou bem o procedimento. Sem intercorrências.",
        },
        {
          id: 2,
          title: "Segunda Sessão - Preenchimento",
          date: "2024-07-10",
          description: "Preenchimento com ácido hialurônico",
          status: "completed",
          photos: ["progress-1.jpg", "progress-2.jpg"],
          notes: "Excelente evolução. Resultado muito natural.",
        },
        {
          id: 3,
          title: "Terceira Sessão - Bioestimulador",
          date: "2024-08-05",
          description: "Aplicação de bioestimulador de colágeno",
          status: "completed",
          photos: ["progress-3.jpg"],
          notes: "Pele com melhora significativa na textura e firmeza.",
        },
        {
          id: 4,
          title: "Sessão Final - Refinamento",
          date: "2024-08-25",
          description: "Ajustes finais e avaliação de resultados",
          status: "scheduled",
          photos: [],
          notes: "",
        },
      ],
      beforeAfterPhotos: [
        {
          id: 1,
          date: "2024-06-15",
          type: "before",
          angle: "frontal",
          url: "/placeholder-face-before.jpg",
          notes: "Foto inicial - frontal",
        },
        {
          id: 2,
          date: "2024-06-15",
          type: "before",
          angle: "profile-left",
          url: "/placeholder-face-profile.jpg",
          notes: "Foto inicial - perfil esquerdo",
        },
        {
          id: 3,
          date: "2024-08-10",
          type: "progress",
          angle: "frontal",
          url: "/placeholder-face-progress.jpg",
          notes: "Progresso - 8 semanas",
        },
      ],
      careInstructions: [
        {
          phase: "Pós-procedimento imediato (24h)",
          instructions: [
            "Evitar exercícios físicos intensos",
            "Não deitar de bruços por 4 horas",
            "Aplicar gelo se houver inchaço",
            "Evitar manipular a área tratada",
          ],
        },
        {
          phase: "Primeiros 7 dias",
          instructions: [
            "Usar protetor solar FPS 60+",
            "Hidratação abundante da pele",
            "Evitar saunas e ambientes muito quentes",
            "Não usar produtos com ácidos",
          ],
        },
        {
          phase: "Manutenção (contínua)",
          instructions: [
            "Proteção solar diária",
            "Hidratação com cosmecêuticos",
            "Avaliações regulares",
            "Estilo de vida saudável",
          ],
        },
      ],
      results: {
        satisfaction: 9.5,
        effectivenessRating: 9.0,
        recoveryTime: "3 dias",
        sideEffects: "Leve inchaço inicial (resolvido em 24h)",
        duration: "6-8 meses estimado",
      },
    },
    {
      id: 2,
      name: "Tratamento Corporal - Criolipólise",
      type: "Criolipólise + Drenagem",
      startDate: "2024-07-01",
      expectedEndDate: "2024-11-01",
      progress: 50,
      currentPhase: "Fase Ativa",
      doctor: "Dr. Carlos Mendes",
      clinic: "NeonPro Clínica Barra",
      sessions: {
        completed: 2,
        total: 4,
        next: "2024-09-05",
      },
      goals: [
        {
          id: 1,
          description: "Redução de gordura localizada no abdome",
          achieved: false,
          targetDate: "2024-10-01",
        },
        {
          id: 2,
          description: "Melhora do contorno corporal",
          achieved: false,
          targetDate: "2024-11-01",
        },
        { id: 3, description: "Aumento da autoestima", achieved: false, targetDate: "2024-11-01" },
      ],
      milestones: [
        {
          id: 1,
          title: "Primeira Sessão - Abdome Superior",
          date: "2024-07-01",
          description: "Criolipólise em região abdominal superior",
          status: "completed",
          photos: ["body-before-1.jpg"],
          notes: "Procedimento bem tolerado. Sensação de frio inicial normal.",
        },
        {
          id: 2,
          title: "Segunda Sessão - Abdome Inferior",
          date: "2024-08-01",
          description: "Criolipólise em região abdominal inferior",
          status: "completed",
          photos: ["body-progress-1.jpg"],
          notes: "Evolução positiva. Paciente relatou diminuição de medidas.",
        },
      ],
      beforeAfterPhotos: [
        {
          id: 1,
          date: "2024-07-01",
          type: "before",
          angle: "frontal",
          url: "/placeholder-body-before.jpg",
          notes: "Medidas iniciais - frontal",
        },
        {
          id: 2,
          date: "2024-08-10",
          type: "progress",
          angle: "frontal",
          url: "/placeholder-body-progress.jpg",
          notes: "Progresso - 5 semanas",
        },
      ],
    },
  ],
  completedTreatments: [
    {
      id: 3,
      name: "Limpeza de Pele Profunda",
      type: "Hidrafacial + Peeling",
      startDate: "2024-05-01",
      endDate: "2024-06-01",
      progress: 100,
      doctor: "Esp. Maria Oliveira",
      finalRating: 5,
      results: "Pele mais limpa, hidratada e com textura melhorada",
      photos: ["skin-before.jpg", "skin-after.jpg"],
    },
  ],
};

function TreatmentProgressCard({ treatment }: { treatment: any }) {
  const completedGoals = treatment.goals.filter((goal: any) => goal.achieved).length;
  const totalGoals = treatment.goals.length;

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{treatment.name}</CardTitle>
            <CardDescription>{treatment.type}</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-pink-100 text-pink-800">
            {treatment.currentPhase}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso Geral</span>
            <span className="font-medium">{treatment.progress}%</span>
          </div>
          <Progress value={treatment.progress} className="h-3" />
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>
              {treatment.sessions.completed} de {treatment.sessions.total} sessões
            </span>
            <span>Próxima: {new Date(treatment.sessions.next).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Objetivos</span>
            <span className="text-muted-foreground text-xs">
              {completedGoals}/{totalGoals} alcançados
            </span>
          </div>
          <div className="space-y-1">
            {treatment.goals.slice(0, 2).map((goal: any) => (
              <div key={goal.id} className="flex items-center space-x-2 text-xs">
                {goal.achieved ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-gray-300" />
                )}
                <span className={cn(goal.achieved ? "text-muted-foreground line-through" : "")}>
                  {goal.description}
                </span>
              </div>
            ))}
            {treatment.goals.length > 2 && (
              <div className="text-muted-foreground text-xs">
                +{treatment.goals.length - 2} objetivos adicionais
              </div>
            )}
          </div>
        </div>

        {/* Doctor Info */}
        <div className="flex items-center space-x-2 text-muted-foreground text-sm">
          <User className="h-4 w-4" />
          <span>
            {treatment.doctor} • {treatment.clinic}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4" />
            Ver Detalhes
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Camera className="h-4 w-4" />
            Fotos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BeforeAfterGallery({ photos }: { photos: any[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const beforePhotos = photos.filter((p) => p.type === "before");
  const progressPhotos = photos.filter((p) => p.type === "progress");
  const afterPhotos = photos.filter((p) => p.type === "after");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5 text-purple-600" />
          <span>Galeria de Evolução</span>
        </CardTitle>
        <CardDescription>
          Acompanhe visualmente seus resultados ao longo do tratamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo Categories */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="before">Antes ({beforePhotos.length})</TabsTrigger>
            <TabsTrigger value="progress">Progresso ({progressPhotos.length})</TabsTrigger>
            <TabsTrigger value="after">Depois ({afterPhotos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <PhotoTimeline photos={photos} />
          </TabsContent>

          <TabsContent value="before" className="space-y-4">
            <PhotoGrid photos={beforePhotos} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <PhotoGrid photos={progressPhotos} />
          </TabsContent>

          <TabsContent value="after" className="space-y-4">
            <PhotoGrid photos={afterPhotos} />
          </TabsContent>
        </Tabs>

        {/* Comparison Tool */}
        <div className="border-t pt-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-medium">Comparação Lado a Lado</h4>
            <Button variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
              Visualizar em Tela Cheia
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium text-sm">Foto 1</label>
              <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
                <div className="text-center text-muted-foreground">
                  <Camera className="mx-auto mb-2 h-8 w-8" />
                  <p className="text-sm">Selecione uma foto</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-sm">Foto 2</label>
              <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
                <div className="text-center text-muted-foreground">
                  <Camera className="mx-auto mb-2 h-8 w-8" />
                  <p className="text-sm">Selecione uma foto</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload New Photo */}
        <div className="border-t pt-4">
          <div className="space-y-3">
            <h4 className="font-medium">Adicionar Nova Foto</h4>
            <div className="cursor-pointer rounded-lg border-2 border-gray-300 border-dashed p-6 text-center transition-colors hover:border-gray-400">
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="mb-2 text-muted-foreground text-sm">
                Clique para fazer upload ou arraste uma foto aqui
              </p>
              <p className="text-muted-foreground text-xs">
                Formatos suportados: JPG, PNG (máx. 10MB)
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Camera className="h-4 w-4" />
                Tirar Foto
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PhotoTimeline({ photos }: { photos: any[] }) {
  return (
    <div className="space-y-4">
      {photos.map((photo, index) => (
        <div key={photo.id} className="flex items-center space-x-4 rounded-lg border p-4">
          <div className="flex-shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
              <Camera className="h-6 w-6 text-gray-400" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  photo.type === "before"
                    ? "secondary"
                    : photo.type === "progress"
                      ? "default"
                      : "secondary"
                }
              >
                {photo.type === "before"
                  ? "Antes"
                  : photo.type === "progress"
                    ? "Progresso"
                    : "Depois"}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {new Date(photo.date).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <p className="mt-1 font-medium text-sm">{photo.notes}</p>
            <p className="text-muted-foreground text-xs">Ângulo: {photo.angle}</p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhotoGrid({ photos }: { photos: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <div key={photo.id} className="space-y-2">
          <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-200">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <div className="text-center text-xs">
            <p className="font-medium">{new Date(photo.date).toLocaleDateString("pt-BR")}</p>
            <p className="text-muted-foreground">{photo.angle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TreatmentMilestones({ milestones }: { milestones: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <span>Marcos do Tratamento</span>
        </CardTitle>
        <CardDescription>Acompanhe cada etapa importante do seu tratamento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    milestone.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : milestone.status === "scheduled"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600",
                  )}
                >
                  {milestone.status === "completed" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : milestone.status === "scheduled" ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-current" />
                  )}
                </div>
                {index < milestones.length - 1 && <div className="mt-2 h-12 w-px bg-gray-200" />}
              </div>

              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{milestone.title}</h4>
                    <p className="text-muted-foreground text-sm">{milestone.description}</p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {new Date(milestone.date).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      milestone.status === "completed"
                        ? "secondary"
                        : milestone.status === "scheduled"
                          ? "default"
                          : "outline"
                    }
                  >
                    {milestone.status === "completed"
                      ? "Concluído"
                      : milestone.status === "scheduled"
                        ? "Agendado"
                        : "Pendente"}
                  </Badge>
                </div>

                {milestone.notes && (
                  <p className="mt-2 text-muted-foreground text-sm italic">"{milestone.notes}"</p>
                )}

                {milestone.photos && milestone.photos.length > 0 && (
                  <div className="mt-3 flex space-x-2">
                    {milestone.photos.map((photo: string, photoIndex: number) => (
                      <div
                        key={photoIndex}
                        className="flex h-12 w-12 items-center justify-center rounded bg-gray-200"
                      >
                        <Camera className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TreatmentJourney() {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="font-bold text-2xl tracking-tight lg:text-3xl">Jornada de Tratamentos</h1>
          <p className="text-muted-foreground">
            Acompanhe sua evolução e resultados detalhadamente
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Relatório
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Camera className="h-4 w-4" />
            Adicionar Foto
          </Button>
        </div>
      </div>

      {/* Treatment Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Tratamentos Ativos ({mockTreatmentData.activeTreatments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídos ({mockTreatmentData.completedTreatments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Active Treatments Overview */}
          <div className="grid gap-6 lg:grid-cols-2">
            {mockTreatmentData.activeTreatments.map((treatment) => (
              <TreatmentProgressCard key={treatment.id} treatment={treatment} />
            ))}
          </div>

          {/* Detailed View for First Treatment */}
          {mockTreatmentData.activeTreatments.length > 0 && (
            <div className="space-y-6">
              <h2 className="font-semibold text-xl">
                Detalhes: {mockTreatmentData.activeTreatments[0].name}
              </h2>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Treatment Milestones */}
                <TreatmentMilestones
                  milestones={mockTreatmentData.activeTreatments[0].milestones}
                />

                {/* Goals Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <span>Objetivos do Tratamento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockTreatmentData.activeTreatments[0].goals.map((goal: any) => (
                      <div key={goal.id} className="flex items-start space-x-3">
                        {goal.achieved ? (
                          <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                        ) : (
                          <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                        <div className="flex-1">
                          <p
                            className={cn(
                              "font-medium text-sm",
                              goal.achieved ? "text-muted-foreground line-through" : "",
                            )}
                          >
                            {goal.description}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {goal.achieved
                              ? `Alcançado em ${new Date(goal.date).toLocaleDateString("pt-BR")}`
                              : `Meta: ${new Date(goal.targetDate).toLocaleDateString("pt-BR")}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Before/After Gallery */}
              <BeforeAfterGallery
                photos={mockTreatmentData.activeTreatments[0].beforeAfterPhotos}
              />

              {/* Care Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span>Cuidados e Orientações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockTreatmentData.activeTreatments[0].careInstructions.map(
                      (phase: any, index: number) => (
                        <div key={index} className="space-y-3">
                          <h4 className="font-medium text-pink-700 text-sm">{phase.phase}</h4>
                          <ul className="space-y-2">
                            {phase.instructions.map((instruction: string, instIndex: number) => (
                              <li key={instIndex} className="flex items-start space-x-2 text-sm">
                                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                <span>{instruction}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {mockTreatmentData.completedTreatments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-medium text-lg">Nenhum tratamento concluído ainda</h3>
                <p className="text-center text-muted-foreground">
                  Seus tratamentos finalizados aparecerão aqui com todos os resultados
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {mockTreatmentData.completedTreatments.map((treatment) => (
                <Card key={treatment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{treatment.name}</h3>
                        <p className="text-muted-foreground text-sm">{treatment.type}</p>
                        <p className="text-sm">
                          {new Date(treatment.startDate).toLocaleDateString("pt-BR")} -{" "}
                          {new Date(treatment.endDate).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm">{treatment.results}</p>
                      </div>

                      <div className="space-y-2 text-right">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < treatment.finalRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300",
                              )}
                            />
                          ))}
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Concluído
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

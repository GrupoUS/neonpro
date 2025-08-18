"use client";

import { useState } from "react";
import {
  BookOpen,
  Play,
  Clock,
  User,
  Download,
  Heart,
  Shield,
  Sun,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Star,
  Search,
  Filter,
  Eye,
  BookmarkPlus,
  Share2,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  ChevronRight,
  Award,
  MessageCircle,
  Calendar,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
} from "@neonpro/ui";
import { cn } from "@neonpro/utils";

// Mock data for educational content
const mockEducationalContent = {
  myTreatments: [
    {
      id: 1,
      treatment: "Botox",
      content: [
        {
          id: 1,
          title: "Cuidados Pós-Botox: Primeiras 24 Horas",
          type: "video",
          duration: "3:45",
          category: "Cuidados Pós-Procedimento",
          priority: "high",
          completed: false,
          description: "Instruções essenciais para as primeiras 24h após aplicação de Botox",
          thumbnail: "/botox-care-thumb.jpg",
          tags: ["botox", "pós-procedimento", "cuidados"],
        },
        {
          id: 2,
          title: "O que Esperar nos Primeiros 7 Dias",
          type: "article",
          readTime: "5 min",
          category: "Evolução",
          priority: "medium",
          completed: true,
          description: "Timeline detalhado da evolução do Botox na primeira semana",
          tags: ["botox", "evolução", "resultados"],
        },
        {
          id: 3,
          title: "Exercícios Faciais Recomendados",
          type: "interactive",
          duration: "10 min",
          category: "Exercícios",
          priority: "medium",
          completed: false,
          description: "Exercícios específicos para otimizar os resultados do Botox",
          tags: ["botox", "exercícios", "resultados"],
        },
      ],
    },
    {
      id: 2,
      treatment: "Preenchimento",
      content: [
        {
          id: 4,
          title: "Massagem Pós-Preenchimento",
          type: "video",
          duration: "4:20",
          category: "Cuidados Pós-Procedimento",
          priority: "high",
          completed: false,
          description: "Técnicas corretas de massagem após preenchimento",
          thumbnail: "/massage-thumb.jpg",
          tags: ["preenchimento", "massagem", "cuidados"],
        },
      ],
    },
  ],
  generalContent: [
    {
      id: 5,
      title: "Proteção Solar em Tratamentos Estéticos",
      type: "article",
      readTime: "7 min",
      category: "Cuidados Diários",
      priority: "high",
      rating: 4.8,
      views: 1234,
      description: "Como e por que usar protetor solar durante tratamentos estéticos",
      tags: ["proteção solar", "cuidados", "prevenção"],
      featured: true,
    },
    {
      id: 6,
      title: "Hidratação da Pele: Guia Completo",
      type: "video",
      duration: "8:15",
      category: "Skincare",
      priority: "medium",
      rating: 4.9,
      views: 2156,
      description: "Tudo sobre hidratação da pele em tratamentos estéticos",
      tags: ["hidratação", "skincare", "cuidados"],
      featured: true,
    },
    {
      id: 7,
      title: "Quiz: Conhece Sua Pele?",
      type: "quiz",
      duration: "5 min",
      category: "Avaliação",
      priority: "low",
      rating: 4.6,
      views: 987,
      description: "Teste seus conhecimentos sobre cuidados com a pele",
      tags: ["quiz", "conhecimento", "pele"],
    },
  ],
  categories: [
    { id: "care", name: "Cuidados", icon: Heart, count: 15 },
    { id: "protection", name: "Proteção", icon: Shield, count: 8 },
    { id: "skincare", name: "Skincare", icon: Droplets, count: 12 },
    { id: "safety", name: "Segurança", icon: AlertTriangle, count: 6 },
    { id: "results", name: "Resultados", icon: Star, count: 10 },
  ],
  emergencyContacts: [
    {
      id: 1,
      title: "Emergência 24h",
      phone: "+55 (21) 99999-9999",
      description: "Para emergências médicas relacionadas aos tratamentos",
      available: "24/7",
    },
    {
      id: 2,
      title: "Suporte Clínica",
      phone: "+55 (21) 3333-3333",
      description: "Dúvidas gerais e agendamentos",
      available: "Seg-Sex 8h-18h",
    },
  ],
};

const mockCareInstructions = {
  currentPhase: "Pós-Botox (Dia 2)",
  timeRemaining: "22 horas",
  instructions: [
    {
      id: 1,
      title: "Evitar exercícios intensos",
      description: "Não faça atividades físicas que aumentem muito a frequência cardíaca",
      status: "active",
      timeframe: "Até 24h pós-procedimento",
      completed: false,
      priority: "high",
    },
    {
      id: 2,
      title: "Não deitar de bruços",
      description: "Mantenha a cabeça elevada por pelo menos 4 horas",
      status: "completed",
      timeframe: "Primeiras 4 horas",
      completed: true,
      priority: "high",
    },
    {
      id: 3,
      title: "Aplicar protetor solar",
      description: "Use FPS 60+ sempre que sair de casa",
      status: "active",
      timeframe: "Diariamente",
      completed: false,
      priority: "medium",
    },
    {
      id: 4,
      title: "Hidratação abundante",
      description: "Beba pelo menos 2L de água por dia",
      status: "active",
      timeframe: "Contínuo",
      completed: false,
      priority: "medium",
    },
  ],
};

function ContentCard({ content, onView }: { content: any; onView: () => void }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4" />;
      case "article":
        return <BookOpen className="h-4 w-4" />;
      case "quiz":
        return <Award className="h-4 w-4" />;
      case "interactive":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "text-red-600 bg-red-100";
      case "article":
        return "text-blue-600 bg-blue-100";
      case "quiz":
        return "text-purple-600 bg-purple-100";
      case "interactive":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all cursor-pointer border-l-4",
        getPriorityColor(content.priority),
      )}
    >
      <CardContent className="p-4" onClick={onView}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={cn("flex items-center space-x-1", getTypeColor(content.type))}>
                {getTypeIcon(content.type)}
                <span className="capitalize">{content.type}</span>
              </Badge>
              {content.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
              {content.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
            </div>

            <h3 className="font-semibold text-sm mb-1">{content.title}</h3>
            <p className="text-xs text-muted-foreground mb-2">{content.description}</p>

            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{content.duration || content.readTime}</span>
              </div>

              {content.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{content.rating}</span>
                </div>
              )}

              {content.views && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{content.views}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <Button variant="ghost" size="sm">
              <BookmarkPlus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {content.tags?.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CareInstructionsWidget() {
  const activeInstructions = mockCareInstructions.instructions.filter((i) => i.status === "active");
  const completedInstructions = mockCareInstructions.instructions.filter((i) => i.completed);
  const progressPercentage =
    (completedInstructions.length / mockCareInstructions.instructions.length) * 100;

  return (
    <Card className="border-l-4 border-l-pink-500">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-pink-600" />
          <span>Cuidados Atuais</span>
        </CardTitle>
        <CardDescription>
          {mockCareInstructions.currentPhase} • {mockCareInstructions.timeRemaining} restantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso dos Cuidados</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Active Instructions */}
        <div className="space-y-3">
          {activeInstructions.map((instruction) => (
            <div key={instruction.id} className="flex items-start space-x-3">
              <div
                className={cn(
                  "mt-0.5 h-2 w-2 rounded-full",
                  instruction.priority === "high" ? "bg-red-500" : "bg-yellow-500",
                )}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{instruction.title}</h4>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{instruction.description}</p>
                <p className="text-xs text-muted-foreground font-medium">{instruction.timeframe}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Calendar className="h-4 w-4" />
            Agendar Lembrete
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4" />
            Dúvidas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VideoPlayer({ content }: { content: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(45); // seconds
  const [duration] = useState(225); // 3:45 in seconds

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Play className="h-16 w-16 mx-auto mb-4 opacity-80" />
              <p className="text-lg font-medium">{content.title}</p>
              <p className="text-sm opacity-80">{content.duration}</p>
            </div>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="space-y-2">
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-1">
                <div
                  className="bg-pink-500 h-1 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{content.title}</h3>
            <p className="text-muted-foreground text-sm">{content.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{content.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>1,234 visualizações</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {content.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmergencyContacts() {
  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span>Contatos de Emergência</span>
        </CardTitle>
        <CardDescription>Em caso de reações ou dúvidas urgentes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockEducationalContent.emergencyContacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg"
          >
            <div>
              <h4 className="font-medium text-sm">{contact.title}</h4>
              <p className="text-xs text-muted-foreground">{contact.description}</p>
              <p className="text-xs text-red-600 font-medium">{contact.available}</p>
            </div>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              <MessageCircle className="h-4 w-4" />
              Contatar
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function EducationCenter() {
  const [activeTab, setActiveTab] = useState("my-treatments");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const handleViewContent = (content: any) => {
    setSelectedContent(content);
  };

  if (selectedContent) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={() => setSelectedContent(null)}>
          <ChevronRight className="h-4 w-4 rotate-180" />
          Voltar
        </Button>

        {/* Content Viewer */}
        {selectedContent.type === "video" ? (
          <VideoPlayer content={selectedContent} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{selectedContent.title}</CardTitle>
              <CardDescription>{selectedContent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p>Conteúdo do artigo apareceria aqui...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Centro Educacional</h1>
          <p className="text-muted-foreground">
            Aprenda sobre seus tratamentos e cuidados essenciais
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por tratamento, cuidado ou palavra-chave..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Current Care Instructions - Always visible */}
      <CareInstructionsWidget />

      {/* Emergency Contacts */}
      <EmergencyContacts />

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-treatments">Meus Tratamentos</TabsTrigger>
          <TabsTrigger value="general">Conteúdo Geral</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="my-treatments" className="space-y-6">
          {mockEducationalContent.myTreatments.map((treatment) => (
            <div key={treatment.id} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-pink-600" />
                <h2 className="text-lg font-semibold">{treatment.treatment}</h2>
                <Badge variant="secondary">{treatment.content.length} itens</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {treatment.content.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onView={() => handleViewContent(content)}
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockEducationalContent.generalContent.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onView={() => handleViewContent(content)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockEducationalContent.categories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center mb-4">
                    <category.icon className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} conteúdos disponíveis
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

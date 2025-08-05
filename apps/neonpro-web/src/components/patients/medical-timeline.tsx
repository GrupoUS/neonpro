/**
 * Medical Timeline Component
 * Visual timeline display of patient medical history
 */

"use client";

import type {
  Activity,
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Filter,
  MessageSquare,
  Share2,
  Star,
  Stethoscope,
  Timer,
  TrendingUp,
  User,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  MilestoneTracking,
  TimelineEvent,
  TimelineFilter,
} from "@/lib/patients/medical-timeline";
import type { cn } from "@/lib/utils";

interface MedicalTimelineProps {
  patientId: string;
  className?: string;
}

interface TimelineEventWithExpanded extends TimelineEvent {
  expanded?: boolean;
}

export function MedicalTimeline({ patientId, className }: MedicalTimelineProps) {
  const [events, setEvents] = useState<TimelineEventWithExpanded[]>([]);
  const [milestones, setMilestones] = useState<MilestoneTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TimelineFilter>({});
  const [activeTab, setActiveTab] = useState("timeline");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  useEffect(() => {
    loadTimeline();
    loadMilestones();
  }, [patientId, filter]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        patientId,
        action: "timeline",
        ...(filter.eventTypes && { eventTypes: filter.eventTypes.join(",") }),
        ...(filter.categories && { categories: filter.categories.join(",") }),
        ...(filter.dateRange?.start && {
          startDate: filter.dateRange.start.toISOString(),
        }),
        ...(filter.dateRange?.end && {
          endDate: filter.dateRange.end.toISOString(),
        }),
        ...(filter.professionals && {
          professionals: filter.professionals.join(","),
        }),
        ...(filter.severity && { severity: filter.severity.join(",") }),
        ...(filter.includePhotos && { includePhotos: "true" }),
        ...(filter.includeAttachments && { includeAttachments: "true" }),
      });

      const response = await fetch(`/api/patients/timeline?${params}`);
      if (!response.ok) throw new Error("Failed to load timeline");

      const data = await response.json();
      setEvents(data.timeline || []);
    } catch (error) {
      console.error("Error loading timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async () => {
    try {
      const params = new URLSearchParams({
        patientId,
        action: "milestones",
      });

      const response = await fetch(`/api/patients/timeline?${params}`);
      if (!response.ok) throw new Error("Failed to load milestones");

      const data = await response.json();
      setMilestones(data.milestones || []);
    } catch (error) {
      console.error("Error loading milestones:", error);
    }
  };

  const toggleEventExpansion = (eventId: string) => {
    setEvents(
      events.map((event) =>
        event.id === eventId ? { ...event, expanded: !event.expanded } : event,
      ),
    );
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "treatment":
        return <Stethoscope className="h-4 w-4" />;
      case "procedure":
        return <Activity className="h-4 w-4" />;
      case "medication":
        return <FileText className="h-4 w-4" />;
      case "test":
        return <TrendingUp className="h-4 w-4" />;
      case "diagnosis":
        return <AlertCircle className="h-4 w-4" />;
      case "note":
        return <MessageSquare className="h-4 w-4" />;
      case "photo":
        return <Camera className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medical":
        return "bg-blue-100 text-blue-800";
      case "aesthetic":
        return "bg-purple-100 text-purple-800";
      case "dental":
        return "bg-green-100 text-green-800";
      case "wellness":
        return "bg-teal-100 text-teal-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    if (days < 7) return `${days} dias atrás`;
    if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
    if (days < 365) return `${Math.floor(days / 30)} meses atrás`;
    return `${Math.floor(days / 365)} anos atrás`;
  };

  const renderTimelineEvent = (event: TimelineEventWithExpanded, index: number) => {
    const isLast = index === events.length - 1;

    return (
      <div key={event.id} className="relative">
        {/* Timeline line */}
        {!isLast && <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 -ml-px" />}

        {/* Event marker */}
        <div className="relative flex items-start space-x-4">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-sm",
              getSeverityColor(event.severity) || "bg-blue-500",
            )}
          >
            <div className="text-white">{getEventIcon(event.eventType)}</div>
          </div>

          {/* Event content */}
          <div className="flex-1 min-w-0 pb-8">
            <Card
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                event.expanded && "shadow-lg",
              )}
              onClick={() => toggleEventExpansion(event.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>{formatDate(event.date)}</span>
                      <span>•</span>
                      <span>{formatRelativeDate(event.date)}</span>
                      {event.professionalName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {event.professionalName}
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                    {event.severity && (
                      <Badge variant="outline" className="text-xs">
                        {event.severity}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              {event.expanded && (
                <CardContent className="space-y-4">
                  {/* Description */}
                  {event.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Descrição</h4>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  )}

                  {/* Before/After Photos */}
                  {event.beforeAfterPhotos && event.beforeAfterPhotos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Fotos Antes/Depois</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {event.beforeAfterPhotos.map((photo) => (
                          <div key={photo.id} className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              {photo.beforePhoto && (
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500">Antes</p>
                                  <img
                                    src={photo.beforePhoto.thumbnailUrl}
                                    alt="Antes"
                                    className="w-full h-24 object-cover rounded"
                                  />
                                </div>
                              )}
                              {photo.afterPhoto && (
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500">Depois</p>
                                  <img
                                    src={photo.afterPhoto.thumbnailUrl}
                                    alt="Depois"
                                    className="w-full h-24 object-cover rounded"
                                  />
                                </div>
                              )}
                            </div>
                            {photo.notes && <p className="text-xs text-gray-600">{photo.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Treatment Outcome */}
                  {event.outcome && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Resultado do Tratamento</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {event.outcome.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {event.outcome.success ? "Sucesso" : "Intercorrências"}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{event.outcome.satisfactionScore}/10</span>
                          </div>
                        </div>
                        {event.outcome.patientFeedback && (
                          <div>
                            <p className="text-xs text-gray-500">Feedback do Paciente:</p>
                            <p className="text-sm">{event.outcome.patientFeedback}</p>
                          </div>
                        )}
                        {event.outcome.professionalAssessment && (
                          <div>
                            <p className="text-xs text-gray-500">Avaliação Profissional:</p>
                            <p className="text-sm">{event.outcome.professionalAssessment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Notes */}
                  {event.notes && event.notes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Observações</h4>
                      <div className="space-y-2">
                        {event.notes.map((note) => (
                          <div key={note.id} className="border-l-2 border-gray-200 pl-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{note.author}</span>
                              <span className="text-xs text-gray-400">{formatDate(note.date)}</span>
                            </div>
                            <p className="text-sm mt-1">{note.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {event.attachments && event.attachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Anexos</h4>
                      <div className="space-y-1">
                        {event.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center space-x-2 text-sm">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span>{attachment.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {attachment.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderMilestones = () => {
    return (
      <div className="space-y-6">
        {milestones.map((tracking) => (
          <Card key={tracking.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{tracking.treatmentPlan}</CardTitle>
                  <CardDescription>Progresso geral: {tracking.overallProgress}%</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Conclusão estimada: {formatDate(tracking.estimatedCompletion)}
                  </p>
                </div>
              </div>
              <Progress value={tracking.overallProgress} className="w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracking.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {milestone.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : milestone.status === "in_progress" ? (
                        <Timer className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{milestone.title}</h4>
                        <Badge
                          variant={milestone.status === "completed" ? "default" : "outline"}
                          className="text-xs"
                        >
                          {milestone.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          Meta: {formatDate(milestone.targetDate)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {milestone.progress}% completo
                        </span>
                      </div>
                      <Progress value={milestone.progress} className="w-full mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico Médico</h2>
          <p className="text-muted-foreground">
            Timeline completo de eventos médicos e tratamentos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eventTypes">Tipos de Evento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment">Consultas</SelectItem>
                    <SelectItem value="treatment">Tratamentos</SelectItem>
                    <SelectItem value="procedure">Procedimentos</SelectItem>
                    <SelectItem value="medication">Medicações</SelectItem>
                    <SelectItem value="test">Exames</SelectItem>
                    <SelectItem value="diagnosis">Diagnósticos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categories">Categorias</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Médico</SelectItem>
                    <SelectItem value="aesthetic">Estético</SelectItem>
                    <SelectItem value="dental">Dental</SelectItem>
                    <SelectItem value="wellness">Bem-estar</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity">Severidade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as severidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input type="date" id="startDate" />
              </div>
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input type="date" id="endDate" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="milestones">Marcos</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum evento encontrado
                  </h3>
                  <p className="text-gray-500">
                    Não há eventos no histórico médico deste paciente.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-0">
              {events.map((event, index) => renderTimelineEvent(event, index))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="milestones">
          {milestones.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum marco encontrado
                  </h3>
                  <p className="text-gray-500">
                    Não há marcos de tratamento definidos para este paciente.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            renderMilestones()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MedicalTimeline;

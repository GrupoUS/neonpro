"use client";

import type {
  Activity,
  AlertTriangle,
  Archive,
  Bell,
  Calendar,
  Camera,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Heart,
  Mail,
  MapPin,
  Minus,
  MoreHorizontal,
  Phone,
  Settings,
  Share,
  Shield,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { toast } from "sonner";
import type { createClient } from "@/app/utils/supabase/client";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Progress } from "@/components/ui/progress";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PhotoUploadSystem } from "./photo-upload-system";

interface Patient {
  id: string;
  email: string;
  phone: string;
  created_at: string;
  raw_user_meta_data: {
    full_name: string;
    date_of_birth: string;
    gender: string;
    cpf?: string;
    profile_picture?: string;
  };
  patient_profiles_extended?: {
    height_cm?: number;
    weight_kg?: number;
    bmi?: number;
    blood_type?: string;
    risk_level: "low" | "medium" | "high" | "critical";
    risk_score: number;
    profile_completeness_score: number;
    chronic_conditions: string[];
    allergies: string[];
    medications: string[];
    last_assessment_date?: string;
    emergency_contact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    consent_status?: any;
    ai_insights?: any;
  };
  patient_photos?: {
    id: string;
    photo_url: string;
    photo_type: string;
    is_primary: boolean;
    title?: string;
    uploaded_at: string;
  }[];
  medical_timeline?: TimelineEvent[];
  upcoming_appointments?: any[];
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
}

interface TimelineEvent {
  id: string;
  event_type:
    | "appointment"
    | "treatment"
    | "procedure"
    | "diagnosis"
    | "medication"
    | "test_result"
    | "follow_up";
  event_date: string;
  title: string;
  description?: string;
  notes?: string;
  outcome_score?: number;
  outcome_notes?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
  staff_name?: string;
  photos?: string[];
}

interface EnhancedPatientProfileProps {
  patient: Patient;
  onPatientUpdate?: (updatedPatient: Patient) => void;
  onClose?: () => void;
}

export default function EnhancedPatientProfile({
  patient,
  onPatientUpdate,
  onClose,
}: EnhancedPatientProfileProps) {
  const [loading, setLoading] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const supabase = createClient();

  // Load timeline events
  useEffect(() => {
    const loadTimelineEvents = async () => {
      if (!patient.id) return;

      try {
        const { data, error } = await supabase
          .from("medical_timeline")
          .select(`
            *,
            profiles!medical_timeline_staff_id_fkey(raw_user_meta_data)
          `)
          .eq("patient_id", patient.id)
          .order("event_date", { ascending: false });

        if (error) throw error;

        const eventsWithStaff =
          data?.map((event) => ({
            ...event,
            staff_name: event.profiles?.raw_user_meta_data?.full_name || "Sistema",
          })) || [];

        setTimelineEvents(eventsWithStaff);
      } catch (error) {
        console.error("Error loading timeline:", error);
        toast.error("Erro ao carregar histórico médico");
      }
    };

    loadTimelineEvents();
  }, [patient.id, supabase]);

  // Utility functions
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const calculateBMI = (height: number, weight: number) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Abaixo do peso", color: "text-blue-600" };
    if (bmi < 25) return { category: "Peso normal", color: "text-green-600" };
    if (bmi < 30) return { category: "Sobrepeso", color: "text-yellow-600" };
    return { category: "Obesidade", color: "text-red-600" };
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "treatment":
        return <Stethoscope className="h-4 w-4" />;
      case "procedure":
        return <Activity className="h-4 w-4" />;
      case "diagnosis":
        return <FileText className="h-4 w-4" />;
      case "medication":
        return <Heart className="h-4 w-4" />;
      case "test_result":
        return <TrendingUp className="h-4 w-4" />;
      case "follow_up":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800";
      case "treatment":
        return "bg-green-100 text-green-800";
      case "procedure":
        return "bg-purple-100 text-purple-800";
      case "diagnosis":
        return "bg-orange-100 text-orange-800";
      case "medication":
        return "bg-red-100 text-red-800";
      case "test_result":
        return "bg-cyan-100 text-cyan-800";
      case "follow_up":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatEventType = (type: string) => {
    const types = {
      appointment: "Consulta",
      treatment: "Tratamento",
      procedure: "Procedimento",
      diagnosis: "Diagnóstico",
      medication: "Medicação",
      test_result: "Exame",
      follow_up: "Retorno",
    };
    return types[type as keyof typeof types] || type;
  };

  // Render functions
  const renderOverview = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Basic Info */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={
                  patient.raw_user_meta_data?.profile_picture ||
                  patient.patient_photos?.find((p) => p.is_primary)?.photo_url
                }
              />
              <AvatarFallback className="text-lg">
                {patient.raw_user_meta_data?.full_name?.charAt(0) || "P"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">
                {patient.raw_user_meta_data?.full_name || "Nome não informado"}
              </h3>
              <p className="text-muted-foreground">
                {patient.raw_user_meta_data?.date_of_birth
                  ? `${calculateAge(patient.raw_user_meta_data.date_of_birth)} anos`
                  : "Idade não informada"}
                {patient.raw_user_meta_data?.gender &&
                  ` • ${
                    patient.raw_user_meta_data.gender === "male"
                      ? "Masculino"
                      : patient.raw_user_meta_data.gender === "female"
                        ? "Feminino"
                        : "Outro"
                  }`}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {patient.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {patient.phone}
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {patient.email}
              </div>
            )}
            {patient.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {patient.address.city}, {patient.address.state}
              </div>
            )}
          </div>

          {patient.patient_profiles_extended?.emergency_contact && (
            <div className="border-t pt-3">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Contato de Emergência
              </h4>
              <div className="text-sm space-y-1">
                <p>{patient.patient_profiles_extended.emergency_contact.name}</p>
                <p className="text-muted-foreground">
                  {patient.patient_profiles_extended.emergency_contact.phone} •
                  {patient.patient_profiles_extended.emergency_contact.relationship}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Metrics */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Métricas de Saúde
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Assessment */}
          {patient.patient_profiles_extended?.risk_level && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Nível de Risco</span>
                <Badge
                  className={getRiskColor(patient.patient_profiles_extended.risk_level)}
                  variant="outline"
                >
                  {patient.patient_profiles_extended.risk_level === "low" && "Baixo"}
                  {patient.patient_profiles_extended.risk_level === "medium" && "Médio"}
                  {patient.patient_profiles_extended.risk_level === "high" && "Alto"}
                  {patient.patient_profiles_extended.risk_level === "critical" && "Crítico"}
                </Badge>
              </div>
              {patient.patient_profiles_extended.risk_score && (
                <div className="flex items-center gap-2">
                  <Progress
                    value={patient.patient_profiles_extended.risk_score * 100}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    {Math.round(patient.patient_profiles_extended.risk_score * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* BMI */}
          {patient.patient_profiles_extended?.height_cm &&
            patient.patient_profiles_extended?.weight_kg && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Altura</span>
                    <p className="font-medium">{patient.patient_profiles_extended.height_cm}cm</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peso</span>
                    <p className="font-medium">{patient.patient_profiles_extended.weight_kg}kg</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IMC</span>
                    {(() => {
                      const bmi = calculateBMI(
                        patient.patient_profiles_extended!.height_cm!,
                        patient.patient_profiles_extended!.weight_kg!,
                      );
                      if (bmi) {
                        const category = getBMICategory(parseFloat(bmi));
                        return (
                          <div>
                            <p className="font-medium">{bmi}</p>
                            <p className={`text-xs ${category.color}`}>{category.category}</p>
                          </div>
                        );
                      }
                      return <p className="font-medium">-</p>;
                    })()}
                  </div>
                </div>
              </div>
            )}

          {/* Blood Type */}
          {patient.patient_profiles_extended?.blood_type && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tipo Sanguíneo</span>
              <Badge variant="outline">{patient.patient_profiles_extended.blood_type}</Badge>
            </div>
          )}

          {/* Profile Completeness */}
          {patient.patient_profiles_extended?.profile_completeness_score && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completude do Perfil</span>
                <span className="text-sm font-medium">
                  {Math.round(patient.patient_profiles_extended.profile_completeness_score * 100)}%
                </span>
              </div>
              <Progress
                value={patient.patient_profiles_extended.profile_completeness_score * 100}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Timeline */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineEvents.length > 0 ? (
            <div className="space-y-3">
              {timelineEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div
                    className={`
                    flex items-center justify-center w-8 h-8 rounded-full 
                    ${getEventTypeColor(event.event_type)}
                  `}
                  >
                    {getEventTypeIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatEventType(event.event_type)} •
                      {new Date(event.event_date).toLocaleDateString("pt-BR")}
                    </p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {timelineEvents.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setActiveTab("timeline")}
                >
                  Ver todos ({timelineEvents.length})
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum registro médico</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMedicalInfo = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Conditions & Allergies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Condições Médicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chronic Conditions */}
          <div>
            <h4 className="font-medium text-sm mb-2">Condições Crônicas</h4>
            {patient.patient_profiles_extended?.chronic_conditions?.length ? (
              <div className="flex flex-wrap gap-1">
                {patient.patient_profiles_extended.chronic_conditions.map((condition, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma condição crônica registrada</p>
            )}
          </div>

          {/* Allergies */}
          <div>
            <h4 className="font-medium text-sm mb-2">Alergias</h4>
            {patient.patient_profiles_extended?.allergies?.length ? (
              <div className="flex flex-wrap gap-1">
                {patient.patient_profiles_extended.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma alergia registrada</p>
            )}
          </div>

          {/* Medications */}
          <div>
            <h4 className="font-medium text-sm mb-2">Medicações</h4>
            {patient.patient_profiles_extended?.medications?.length ? (
              <div className="space-y-2">
                {patient.patient_profiles_extended.medications.map((medication, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    {medication}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma medicação registrada</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.patient_profiles_extended?.ai_insights ? (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-sm text-blue-900 mb-1">Análise de Risco</h5>
                <p className="text-sm text-blue-800">
                  Baseado no histórico médico, este paciente apresenta
                  {patient.patient_profiles_extended.risk_level === "low" && " baixo risco"}
                  {patient.patient_profiles_extended.risk_level === "medium" && " risco moderado"}
                  {patient.patient_profiles_extended.risk_level === "high" && " alto risco"}
                  {patient.patient_profiles_extended.risk_level === "critical" && " risco crítico"}{" "}
                  para complicações.
                </p>
              </div>

              {patient.patient_profiles_extended.last_assessment_date && (
                <div className="text-xs text-muted-foreground">
                  Última avaliação:{" "}
                  {new Date(
                    patient.patient_profiles_extended.last_assessment_date,
                  ).toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum insight disponível</p>
              <p className="text-xs">Aguardando mais dados para análise</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTimeline = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Linha do Tempo Médica
        </CardTitle>
        <CardDescription>Histórico completo de atendimentos e procedimentos</CardDescription>
      </CardHeader>
      <CardContent>
        {timelineEvents.length > 0 ? (
          <div className="space-y-6">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Timeline Line */}
                {index < timelineEvents.length - 1 && (
                  <div className="absolute left-6 top-12 w-px h-16 bg-border" />
                )}

                {/* Event Icon */}
                <div
                  className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 bg-white
                  ${getEventTypeColor(event.event_type)}
                `}
                >
                  {getEventTypeIcon(event.event_type)}
                </div>

                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {formatEventType(event.event_type)}
                        </Badge>
                        <span>•</span>
                        <span>{new Date(event.event_date).toLocaleDateString("pt-BR")}</span>
                        <span>•</span>
                        <span>{event.staff_name}</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Archive className="mr-2 h-4 w-4" />
                          Arquivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                  )}

                  {event.notes && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-xs text-gray-700 mb-1">Observações</h5>
                      <p className="text-sm text-gray-600">{event.notes}</p>
                    </div>
                  )}

                  {event.outcome_score && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Resultado:</span>
                      <div className="flex items-center gap-1">
                        {event.outcome_score >= 0.8 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : event.outcome_score >= 0.5 ? (
                          <Minus className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">
                          {Math.round(event.outcome_score * 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {event.follow_up_required && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-800">
                        <Bell className="h-4 w-4" />
                        <span className="text-sm font-medium">Retorno necessário</span>
                      </div>
                      {event.follow_up_date && (
                        <p className="text-sm text-orange-600 mt-1">
                          Data sugerida:{" "}
                          {new Date(event.follow_up_date).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  )}

                  {event.photos && event.photos.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-xs text-gray-700 mb-2">Fotos</h5>
                      <div className="flex gap-2">
                        {event.photos.slice(0, 3).map((photoId, photoIndex) => (
                          <div
                            key={photoIndex}
                            className="w-16 h-16 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => setSelectedPhoto(photoId)}
                          >
                            <Camera className="w-full h-full p-4 text-gray-400" />
                          </div>
                        ))}
                        {event.photos.length > 3 && (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              +{event.photos.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum evento médico registrado</p>
            <p className="text-sm">O histórico aparecerá aqui conforme os atendimentos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPhotos = () => (
    <PhotoUploadSystem
      patientId={patient.id}
      onPhotosUploaded={(photos) => {
        // Callback when photos are uploaded
        console.log("Photos uploaded:", photos);
        // You could update patient state here if needed
      }}
      readonly={false} // Allow upload and editing
      className="w-full"
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {patient.raw_user_meta_data?.full_name || "Paciente"}
          </h2>
          <p className="text-muted-foreground">Perfil completo e histórico médico</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Exportar Dados
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Consulta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="medical">Informações Médicas</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="medical" className="mt-6">
          {renderMedicalInfo()}
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          {renderTimeline()}
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          {renderPhotos()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

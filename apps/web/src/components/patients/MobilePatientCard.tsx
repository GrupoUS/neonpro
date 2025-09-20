"use client";

import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
} from "@neonpro/ui";
import { cn, formatBRPhone } from "@neonpro/utils";

interface PatientBasicInfo {
  id: string;
  name: string;
  avatar?: string;
  age: number;
  phone: string;
  email: string;
  cpf: string;
  address?: {
    street: string;
    city: string;
    state: string;
  };
}

interface PatientHealthInfo {
  bloodType?: string;
  allergies: string[];
  medications: string[];
  lastVisit?: Date;
  nextAppointment?: Date;
  riskLevel: "low" | "medium" | "high";
}

interface PatientConsentInfo {
  dataProcessing: boolean;
  marketing: boolean;
  thirdPartySharing: boolean;
  consentDate: Date;
  lastUpdate: Date;
}

interface MobilePatientCardProps {
  patient: PatientBasicInfo;
  healthInfo?: PatientHealthInfo;
  consentInfo: PatientConsentInfo;
  userRole: "admin" | "aesthetician" | "coordinator";
  dataVisibilityLevel: "minimal" | "standard" | "full";
  onVisibilityChange?: (level: "minimal" | "standard" | "full") => void;
  onAction?: (action: string, patientId: string) => void;
  className?: string;
}

// Brazilian CPF masking with progressive disclosure
const maskCpf = (
  cpf: string,
  level: "minimal" | "standard" | "full",
): string => {
  if (level === "minimal") return "***.***.***-**";
  if (level === "standard")
    return cpf.replace(/(\d{3})\d{3}(\d{3})/, "$1.***.***-$3");
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

// Risk level indicator for healthcare context
const RiskIndicator = ({ level }: { level: "low" | "medium" | "high" }) => {
  const config = {
    low: {
      color: "text-green-600 bg-green-50 border-green-200",
      label: "Baixo Risco",
      icon: Heart,
    },
    medium: {
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      label: "Risco Moderado",
      icon: Activity,
    },
    high: {
      color: "text-red-600 bg-red-50 border-red-200",
      label: "Alto Risco",
      icon: AlertTriangle,
    },
  };

  const { color, label, icon: Icon } = config[level];

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full border text-xs",
        color,
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </div>
  );
};

// LGPD consent status component
const ConsentStatus = ({
  consentInfo,
}: {
  consentInfo: PatientConsentInfo;
}) => {
  const activeConsents = [
    consentInfo.dataProcessing && "Dados",
    consentInfo.marketing && "Marketing",
    consentInfo.thirdPartySharing && "Terceiros",
  ].filter(Boolean);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Shield className="h-3 w-3 text-blue-600" />
        <span className="text-xs font-medium text-blue-600">
          LGPD Compliance
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        {activeConsents.length > 0 ? (
          <>
            Consentimentos: {activeConsents.join(", ")}
            <br />
            Atualizado:{" "}
            {format(consentInfo.lastUpdate, "dd/MM/yyyy", { locale: ptBR })}
          </>
        ) : (
          <span className="text-red-600">Nenhum consentimento ativo</span>
        )}
      </div>
    </div>
  );
};

export function MobilePatientCard({
  patient,
  healthInfo,
  consentInfo,
  userRole,
  dataVisibilityLevel,
  onVisibilityChange,
  onAction,
  className,
}: MobilePatientCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const canViewSensitiveData =
    dataVisibilityLevel === "full" &&
    (userRole === "admin" || consentInfo.dataProcessing);

  const displayCpf = maskCpf(patient.cpf, dataVisibilityLevel);
  const displayPhone = canViewSensitiveData
    ? formatBRPhone(patient.phone)
    : "(11) *****-****";
  const displayEmail = canViewSensitiveData ? patient.email : "***@***.com";

  const handleAction = (action: string) => {
    onAction?.(action, patient.id);
  };

  // Calculate initials for avatar fallback
  const initials = patient.name
    .split(" ")
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  return (
    <Card
      className={cn(
        "touch-manipulation transition-all duration-200 hover:shadow-md",
        isExpanded && "shadow-lg",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Patient avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={patient.avatar} alt={patient.name} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Basic info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">
                {patient.name}
              </h3>
              <Badge variant="outline" className="text-xs">
                {patient.age} anos
              </Badge>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span className="font-mono text-xs">{displayCpf}</span>
                {dataVisibilityLevel !== "full" && onVisibilityChange && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => onVisibilityChange("full")}
                    title="Ver dados completos"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>{displayPhone}</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span className="truncate">{displayEmail}</span>
              </div>
            </div>
          </div>

          {/* Action menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label={`Ações para ${patient.name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
                <Eye className="mr-2 h-4 w-4" />
                {isExpanded ? "Menos detalhes" : "Mais detalhes"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: `/patients/${patient.id}` })}
              >
                <FileText className="mr-2 h-4 w-4" />
                Abrir prontuário
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction("schedule")}>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar consulta
              </DropdownMenuItem>
              {consentInfo.dataProcessing && (
                <DropdownMenuItem onClick={() => handleAction("message")}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Enviar mensagem
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Health risk indicator */}
        {healthInfo && (
          <div className="flex justify-between items-center mt-3">
            <RiskIndicator level={healthInfo.riskLevel} />

            {/* Quick appointment info */}
            {healthInfo.nextAppointment && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Próxima:{" "}
                  {format(healthInfo.nextAppointment, "dd/MM", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      {/* Expanded content */}
      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />

          <div className="space-y-4">
            {/* Address information */}
            {patient.address && canViewSensitiveData && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </h4>
                <p className="text-sm text-muted-foreground">
                  {patient.address.street}
                  <br />
                  {patient.address.city}, {patient.address.state}
                </p>
              </div>
            )}

            {/* Health information */}
            {healthInfo && canViewSensitiveData && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Informações de Saúde
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {healthInfo.bloodType && (
                    <p>
                      Tipo sanguíneo:{" "}
                      <span className="font-medium">
                        {healthInfo.bloodType}
                      </span>
                    </p>
                  )}

                  {healthInfo.allergies.length > 0 && (
                    <div>
                      <p className="font-medium text-red-600">Alergias:</p>
                      <ul className="list-disc list-inside ml-2">
                        {healthInfo.allergies.map((allergy, index) => (
                          <li key={index}>{allergy}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {healthInfo.medications.length > 0 && (
                    <div>
                      <p className="font-medium">Medicamentos em uso:</p>
                      <ul className="list-disc list-inside ml-2">
                        {healthInfo.medications.map((medication, index) => (
                          <li key={index}>{medication}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {healthInfo.lastVisit && (
                    <p>
                      Última consulta:{" "}
                      {format(healthInfo.lastVisit, "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* LGPD consent information */}
            <div>
              <ConsentStatus consentInfo={consentInfo} />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                className="h-12"
                onClick={() => navigate({ to: `/patients/${patient.id}` })}
              >
                <FileText className="mr-2 h-4 w-4" />
                Prontuário
              </Button>
              <Button className="h-12" onClick={() => handleAction("schedule")}>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default MobilePatientCard;

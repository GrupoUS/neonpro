"use client";

import type {
  Activity,
  AlertTriangle,
  Archive,
  Calendar,
  Clock,
  Edit,
  Eye,
  Heart,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
} from "lucide-react";
import React from "react";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Progress } from "@/components/ui/progress";

// Types matching the patient data structure
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
    risk_level: "low" | "medium" | "high" | "critical";
    risk_score: number;
    profile_completeness_score: number;
    chronic_conditions: string[];
    last_assessment_date: string;
    bmi?: number;
    allergies: string[];
    emergency_contact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  patient_photos?: {
    photo_url: string;
    photo_type: string;
    is_primary: boolean;
  }[];
  upcoming_appointments?: number;
  last_visit?: string;
  status: "active" | "inactive" | "vip" | "new";
}

interface PatientCardProps {
  patient: Patient;
  selected: boolean;
  onSelect: () => void;
  onAction: (action: string, patientId: string) => void;
}

export default function PatientCard({ patient, selected, onSelect, onAction }: PatientCardProps) {
  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCPF = (cpf?: string) => {
    if (!cpf) return "N/A";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getRiskLevelBadge = (riskLevel?: string) => {
    switch (riskLevel) {
      case "low":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Baixo
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Médio
          </Badge>
        );
      case "high":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Alto
          </Badge>
        );
      case "critical":
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inativo
          </Badge>
        );
      case "vip":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            VIP ⭐
          </Badge>
        );
      case "new":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Novo
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProfileCompletenessColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card
      className={`relative transition-all duration-200 hover:shadow-md ${
        selected ? "ring-2 ring-blue-500 bg-blue-50" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox checked={selected} onCheckedChange={onSelect} className="mt-1" />
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={patient.raw_user_meta_data.profile_picture}
                alt={patient.raw_user_meta_data.full_name}
              />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {patient.raw_user_meta_data.full_name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight">
                {patient.raw_user_meta_data.full_name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {calculateAge(patient.raw_user_meta_data.date_of_birth)} anos •{" "}
                {patient.raw_user_meta_data.gender === "male"
                  ? "Masculino"
                  : patient.raw_user_meta_data.gender === "female"
                    ? "Feminino"
                    : "Outro"}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction("view", patient.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("schedule", patient.id)}>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Consulta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("edit", patient.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onAction("archive", patient.id)}
                className="text-red-600"
              >
                <Archive className="mr-2 h-4 w-4" />
                Arquivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status and Risk Level */}
        <div className="flex items-center justify-between">
          {getStatusBadge(patient.status)}
          {getRiskLevelBadge(patient.patient_profiles_extended?.risk_level)}
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Phone className="h-3 w-3 mr-2" />
            {formatPhone(patient.phone)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Mail className="h-3 w-3 mr-2" />
            <span className="truncate">{patient.email}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="font-medium">CPF:</span>
            <span className="ml-1">{formatCPF(patient.raw_user_meta_data.cpf)}</span>
          </div>
        </div>

        {/* Medical Alerts */}
        {(patient.patient_profiles_extended?.chronic_conditions?.length > 0 ||
          patient.patient_profiles_extended?.allergies?.length > 0) && (
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-gray-700">Alertas Médicos</h4>
            {patient.patient_profiles_extended.chronic_conditions?.map((condition, index) => (
              <div key={index} className="flex items-center text-xs text-red-600">
                <Heart className="h-3 w-3 mr-1" />
                {condition}
              </div>
            ))}
            {patient.patient_profiles_extended.allergies?.map((allergy, index) => (
              <div key={index} className="flex items-center text-xs text-orange-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {allergy}
              </div>
            ))}
          </div>
        )}

        {/* Profile Completeness */}
        {patient.patient_profiles_extended?.profile_completeness_score && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Perfil Completo</span>
              <span
                className={`text-xs font-medium ${getProfileCompletenessColor(
                  patient.patient_profiles_extended.profile_completeness_score,
                )}`}
              >
                {Math.round(patient.patient_profiles_extended.profile_completeness_score * 100)}%
              </span>
            </div>
            <Progress
              value={patient.patient_profiles_extended.profile_completeness_score * 100}
              className="h-2"
            />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-xs font-medium text-blue-600">
              {patient.upcoming_appointments || 0}
            </div>
            <div className="text-xs text-muted-foreground">Consultas</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-green-600">
              {patient.last_visit ? formatDate(patient.last_visit) : "Nunca"}
            </div>
            <div className="text-xs text-muted-foreground">Última Visita</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={() => onAction("view", patient.id)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={() => onAction("schedule", patient.id)}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Agendar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={() => onAction("edit", patient.id)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
        </div>

        {/* Last Assessment */}
        {patient.patient_profiles_extended?.last_assessment_date && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              Última Avaliação
            </div>
            <span>{formatDate(patient.patient_profiles_extended.last_assessment_date)}</span>
          </div>
        )}

        {/* Risk Score Indicator */}
        {patient.patient_profiles_extended?.risk_score !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Score de Risco</span>
            <span
              className={`font-medium ${getRiskLevelColor(patient.patient_profiles_extended.risk_level)}`}
            >
              {patient.patient_profiles_extended.risk_score}/100
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

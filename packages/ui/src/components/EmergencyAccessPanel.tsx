import {
  AlertTriangle,
  Lock,
  Phone,
  Shield,
  Stethoscope,
  Timer,
  Unlock,
  User,
  Zap,
} from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Textarea } from "./Textarea";

export type EmergencyAccessLevel =
  | "basic"
  | "standard"
  | "critical"
  | "life_threatening";

export type EmergencyAccessReason =
  | "cardiac_arrest"
  | "allergic_reaction"
  | "trauma"
  | "respiratory_distress"
  | "neurological_emergency"
  | "hemorrhage"
  | "poisoning"
  | "psychiatric_emergency"
  | "other_medical_emergency";

export interface EmergencyAccessRequest {
  id?: string;
  patientId: string;
  patientName?: string;
  accessLevel: EmergencyAccessLevel;
  reason: EmergencyAccessReason;
  customReason?: string;
  requestingPhysician: {
    id: string;
    name: string;
    crm: string;
    specialization?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  timeoutMinutes: number;
  justification: string;
  witnessPhysician?: {
    id: string;
    name: string;
    crm: string;
  };
  institutionProtocol?: string;
  timestamp?: Date;
  approved?: boolean;
  approvedBy?: string;
  expiresAt?: Date;
}

export interface EmergencyAccessPanelProps {
  /**
   * Current emergency access request being processed
   */
  request?: EmergencyAccessRequest;
  /**
   * Available physicians for witness selection
   */
  availablePhysicians?: {
    id: string;
    name: string;
    crm: string;
    specialization?: string;
    isAvailable: boolean;
  }[];
  /**
   * Patient information for emergency access
   */
  patientInfo?: {
    id: string;
    name: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    criticalAllergies?: string[];
    criticalMedications?: string[];
    medicalAlerts?: string[];
  };
  /**
   * Loading state for request processing
   */
  loading?: boolean;
  /**
   * Error in emergency access processing
   */
  error?: string;
  /**
   * Callback when emergency access is requested
   */
  onRequestEmergencyAccess?: (request: EmergencyAccessRequest) => void;
  /**
   * Callback when emergency access is approved
   */
  onApproveAccess?: (requestId: string) => void;
  /**
   * Callback when emergency access is denied
   */
  onDenyAccess?: (requestId: string, reason: string) => void;
  /**
   * Callback when emergency contact needs to be called
   */
  onCallEmergencyContact?: (phone: string) => void;
  /**
   * Current user information
   */
  currentUser?: {
    id: string;
    name: string;
    role: string;
    crm?: string;
    canApproveEmergencyAccess: boolean;
  };
  /**
   * Show approval interface for administrators
   */
  showApprovalInterface?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const emergencyReasons: Record<EmergencyAccessReason, string> = {
  cardiac_arrest: "Parada Cardíaca",
  allergic_reaction: "Reação Alérgica Grave",
  trauma: "Trauma/Acidente",
  respiratory_distress: "Insuficiência Respiratória",
  neurological_emergency: "Emergência Neurológica",
  hemorrhage: "Hemorragia Grave",
  poisoning: "Intoxicação",
  psychiatric_emergency: "Emergência Psiquiátrica",
  other_medical_emergency: "Outra Emergência Médica",
};

const accessLevelLabels: Record<EmergencyAccessLevel, string> = {
  basic: "Básico - Dados de Contato",
  standard: "Padrão - Histórico Recente",
  critical: "Crítico - Histórico Completo",
  life_threatening: "Risco de Vida - Acesso Total",
};

const getAccessLevelVariant = (level: EmergencyAccessLevel) => {
  switch (level) {
    case "basic": {
      return "confirmed";
    }
    case "standard": {
      return "medium";
    }
    case "critical": {
      return "high";
    }
    case "life_threatening": {
      return "urgent";
    }
    default: {
      return "default";
    }
  }
};

const getTimeoutOptions = (level: EmergencyAccessLevel): number[] => {
  switch (level) {
    case "basic": {
      return [15, 30, 60];
    }
    case "standard": {
      return [30, 60, 120];
    }
    case "critical": {
      return [60, 120, 240];
    }
    case "life_threatening": {
      return [120, 240, 480];
    }
    default: {
      return [30, 60, 120];
    }
  }
};

export const EmergencyAccessPanel = React.forwardRef<
  HTMLDivElement,
  EmergencyAccessPanelProps
>(
  (
    {
      request,
      availablePhysicians = [],
      patientInfo,
      loading = false,
      error,
      onRequestEmergencyAccess,
      onApproveAccess,
      onDenyAccess,
      onCallEmergencyContact,
      currentUser,
      showApprovalInterface = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [formData, setFormData] = React.useState<
      Partial<EmergencyAccessRequest>
    >({
      patientId: patientInfo?.id || "",
      patientName: patientInfo?.name || "",
      accessLevel: "standard",
      reason: "other_medical_emergency",
      timeoutMinutes: 60,
      justification: "",
      requestingPhysician: currentUser?.crm
        ? {
          id: currentUser.id,
          name: currentUser.name,
          crm: currentUser.crm,
        }
        : undefined,
    });

    const [denyReason, setDenyReason] = React.useState("");
    const [showDenyForm, setShowDenyForm] = React.useState(false);

    const updateFormData = <K extends keyof EmergencyAccessRequest>(
      key: K,
      value: EmergencyAccessRequest[K],
    ) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (
        !(
          onRequestEmergencyAccess
          && formData.patientId
          && formData.justification
        )
      ) {
        return;
      }

      const completeRequest: EmergencyAccessRequest = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        accessLevel: formData.accessLevel || "standard",
        reason: formData.reason || "other_medical_emergency",
        customReason: formData.customReason,
        requestingPhysician: formData.requestingPhysician ?? {
          id: "",
          name: "",
          crm: "",
        },
        timeoutMinutes: formData.timeoutMinutes || 60,
        justification: formData.justification,
        witnessPhysician: formData.witnessPhysician,
        institutionProtocol: formData.institutionProtocol,
        timestamp: new Date(),
      };

      onRequestEmergencyAccess(completeRequest);
    };

    const handleApprove = () => {
      if (request?.id && onApproveAccess) {
        onApproveAccess(request.id);
      }
    };

    const handleDeny = () => {
      if (request?.id && onDenyAccess && denyReason.trim()) {
        onDenyAccess(request.id, denyReason);
        setShowDenyForm(false);
        setDenyReason("");
      }
    };

    const timeoutOptions = getTimeoutOptions(
      formData.accessLevel || "standard",
    );

    // If showing approval interface
    if (showApprovalInterface && request) {
      return (
        <div
          className={cn(
            "rounded-lg border border-red-200 bg-red-50 p-6 text-red-900",
            className,
          )}
          ref={ref}
          {...props}
          aria-describedby="emergency-approval-description"
          aria-labelledby="emergency-approval-title"
          role="dialog"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <div className="flex-1">
              <h3
                className="font-semibold text-lg"
                id="emergency-approval-title"
              >
                Solicitação de Acesso de Emergência
              </h3>
              <p
                className="mt-1 text-red-700 text-sm"
                id="emergency-approval-description"
              >
                Aprovação necessária para acesso constitucional de emergência
              </p>

              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm">Paciente:</span>
                    <p className="text-sm">{request.patientName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">
                      Médico Solicitante:
                    </span>
                    <p className="text-sm">
                      {request.requestingPhysician.name} (CRM: {request.requestingPhysician.crm})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm">
                      Nível de Acesso:
                    </span>
                    <Badge
                      className="ml-2"
                      size="sm"
                      variant={getAccessLevelVariant(request.accessLevel)}
                    >
                      {accessLevelLabels[request.accessLevel]}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Motivo:</span>
                    <p className="text-sm">
                      {emergencyReasons[request.reason]}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-sm">Justificativa:</span>
                  <p className="mt-1 rounded border bg-white p-2 text-sm">
                    {request.justification}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm">Duração:</span>
                    <p className="text-sm">{request.timeoutMinutes} minutos</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Solicitado em:</span>
                    <p className="text-sm">
                      {request.timestamp
                        ? new Intl.DateTimeFormat("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(request.timestamp)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {currentUser?.canApproveEmergencyAccess && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                      onClick={handleApprove}
                      variant="default"
                    >
                      <Unlock className="mr-2 h-4 w-4" />
                      Aprovar Acesso
                    </Button>

                    <Button
                      className="border-red-200 text-red-700 hover:bg-red-100"
                      disabled={loading}
                      onClick={() => setShowDenyForm(true)}
                      variant="outline"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Negar Acesso
                    </Button>
                  </>
                )}
              </div>

              {showDenyForm && (
                <div className="mt-4 rounded border bg-white p-4">
                  <label className="mb-2 block font-medium text-sm">
                    Motivo da negação:
                  </label>
                  <Textarea
                    className="mb-3"
                    onChange={(e) => setDenyReason(e.target.value)}
                    placeholder="Explique o motivo da negação do acesso de emergência..."
                    rows={3}
                    value={denyReason}
                  />
                  <div className="flex gap-2">
                    <Button
                      disabled={!denyReason.trim()}
                      onClick={handleDeny}
                      size="sm"
                      variant="destructive"
                    >
                      Confirmar Negação
                    </Button>
                    <Button
                      onClick={() => setShowDenyForm(false)}
                      size="sm"
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "rounded-lg border border-orange-200 bg-orange-50 p-6",
          className,
        )}
        ref={ref}
        {...props}
        aria-describedby="emergency-access-description"
        aria-labelledby="emergency-access-title"
        role="dialog"
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Zap className="h-6 w-6 text-orange-600" />
          </div>

          <div>
            <h3
              className="font-semibold text-lg text-orange-900"
              id="emergency-access-title"
            >
              Acesso de Emergência Médica
            </h3>
            <p
              className="text-orange-700 text-sm"
              id="emergency-access-description"
            >
              Protocolo constitucional para acesso emergencial a dados do paciente
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-100 p-3 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Patient Critical Info */}
        {patientInfo && (
          <div className="mb-6 rounded border bg-white p-4">
            <h4 className="mb-3 flex items-center gap-2 font-medium text-sm">
              <User className="h-4 w-4" />
              Informações Críticas do Paciente
            </h4>

            <div className="space-y-2">
              <div>
                <span className="font-medium text-sm">Nome:</span>
                {patientInfo.name}
              </div>

              {patientInfo.emergencyContact && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">
                      Contato de Emergência:
                    </span>
                    {patientInfo.emergencyContact.name} (
                    {patientInfo.emergencyContact.relationship})
                  </div>
                  {onCallEmergencyContact && (
                    <Button
                      onClick={() => {
                        const phone = patientInfo.emergencyContact?.phone;
                        if (phone) {
                          onCallEmergencyContact?.(phone);
                        }
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Ligar
                    </Button>
                  )}
                </div>
              )}

              {patientInfo.criticalAllergies
                && patientInfo.criticalAllergies.length > 0 && (
                <div>
                  <span className="font-medium text-red-700 text-sm">
                    Alergias Críticas:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {patientInfo.criticalAllergies.map((allergy, index) => (
                      <Badge key={index} size="sm" variant="urgent">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {patientInfo.criticalMedications
                && patientInfo.criticalMedications.length > 0 && (
                <div>
                  <span className="font-medium text-blue-700 text-sm">
                    Medicações Críticas:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {patientInfo.criticalMedications.map(
                      (medication, index) => (
                        <Badge key={index} size="sm" variant="medium">
                          {medication}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              )}

              {patientInfo.medicalAlerts
                && patientInfo.medicalAlerts.length > 0 && (
                <div>
                  <span className="font-medium text-orange-700 text-sm">
                    Alertas Médicos:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {patientInfo.medicalAlerts.map((alert, index) => (
                      <Badge key={index} size="sm" variant="high">
                        {alert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Access Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-medium text-sm">
                Nível de Acesso Solicitado
              </label>
              <Select
                onValueChange={(value: EmergencyAccessLevel) =>
                  updateFormData("accessLevel", value)}
                value={formData.accessLevel}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(accessLevelLabels).map(([level, label]) => (
                    <SelectItem key={level} value={level}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm">
                Motivo da Emergência
              </label>
              <Select
                onValueChange={(value: EmergencyAccessReason) => updateFormData("reason", value)}
                value={formData.reason}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(emergencyReasons).map(([reason, label]) => (
                    <SelectItem key={reason} value={reason}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.reason === "other_medical_emergency" && (
            <div>
              <label className="mb-2 block font-medium text-sm">
                Especificar Motivo
              </label>
              <Input
                onChange={(e) => updateFormData("customReason", e.target.value)}
                placeholder="Descreva a emergência médica..."
                required
                value={formData.customReason || ""}
              />
            </div>
          )}

          <div>
            <label className="mb-2 block font-medium text-sm">
              Duração do Acesso (minutos)
            </label>
            <Select
              onValueChange={(value) =>
                updateFormData("timeoutMinutes", Number.parseInt(value, 10))}
              value={formData.timeoutMinutes?.toString()}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeoutOptions.map((minutes) => (
                  <SelectItem key={minutes} value={minutes.toString()}>
                    {minutes} minutos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm">
              Justificativa Médica (Obrigatória)
            </label>
            <Textarea
              onChange={(e) => updateFormData("justification", e.target.value)}
              placeholder="Descreva detalhadamente a necessidade médica para acesso emergencial aos dados do paciente..."
              required
              rows={4}
              value={formData.justification || ""}
            />
          </div>

          {availablePhysicians.length > 0 && (
            <div>
              <label className="mb-2 block font-medium text-sm">
                Médico Testemunha (Opcional)
              </label>
              <Select
                onValueChange={(value) => {
                  const physician = availablePhysicians.find(
                    (p) => p.id === value,
                  );
                  if (physician) {
                    updateFormData("witnessPhysician", {
                      id: physician.id,
                      name: physician.name,
                      crm: physician.crm,
                    });
                  }
                }}
                value={formData.witnessPhysician?.id || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar médico testemunha" />
                </SelectTrigger>
                <SelectContent>
                  {availablePhysicians
                    .filter((p) => p.isAvailable && p.id !== currentUser?.id)
                    .map((physician) => (
                      <SelectItem key={physician.id} value={physician.id}>
                        {physician.name} - CRM: {physician.crm}
                        {physician.specialization
                          && ` (${physician.specialization})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="mb-2 block font-medium text-sm">
              Protocolo Institucional (Opcional)
            </label>
            <Input
              onChange={(e) => updateFormData("institutionProtocol", e.target.value)}
              placeholder="Número do protocolo institucional de emergência..."
              value={formData.institutionProtocol || ""}
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-orange-700 text-sm">
              <Shield className="mr-1 inline h-4 w-4" />
              Este acesso será auditado e registrado conforme LGPD
            </div>

            <Button
              className="bg-orange-600 hover:bg-orange-700"
              disabled={loading
                || !formData.justification
                || !formData.requestingPhysician}
              type="submit"
            >
              {loading
                ? <Timer className="mr-2 h-4 w-4 animate-spin" />
                : <Stethoscope className="mr-2 h-4 w-4" />}
              Solicitar Acesso de Emergência
            </Button>
          </div>
        </form>
      </div>
    );
  },
);

EmergencyAccessPanel.displayName = "EmergencyAccessPanel";

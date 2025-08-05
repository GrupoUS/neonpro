/**
 * NeonPro Healthcare Permission Guard Component
 * AUTH-02 Implementation - React Permission Guard with Healthcare Context
 *
 * Features:
 * - React component for UI permission enforcement
 * - Healthcare-specific permission validation
 * - Emergency override capabilities
 * - Loading states and fallbacks
 * - Accessibility compliance
 * - Real-time permission updates
 */

"use client";

import type { AlertTriangle, Building, Clock, Shield, ShieldAlert, User } from "lucide-react";
import React, { type ReactNode, useCallback, useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Skeleton } from "@/components/ui/skeleton";
import type { usePermissions } from "@/hooks/use-permissions";
import type { HealthcareRole, MedicalSpecialty } from "@/lib/auth/permissions";
import type { PermissionCheckResult } from "@/lib/auth/rbac";
import type { cn } from "@/lib/utils";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface PermissionGuardProps {
  /** Permission(s) required to show content */
  permissions: string | string[];

  /** Child components to render when permission is granted */
  children: ReactNode;

  /** Fallback component when permission is denied */
  fallback?: ReactNode;

  /** Show loading state while checking permissions */
  showLoading?: boolean;

  /** Allow emergency override for clinical staff */
  allowEmergencyOverride?: boolean;

  /** Additional context for permission checking */
  context?: {
    clinicId?: string;
    patientId?: string;
    resourceId?: string;
  };

  /** Accessibility props */
  "aria-label"?: string;
  "aria-describedby"?: string;

  /** Custom styling */
  className?: string;

  /** Show detailed permission information for admins */
  showDetails?: boolean;

  /** Require all permissions (AND logic) or any permission (OR logic) */
  requireAll?: boolean;

  /** Custom error messages */
  errorMessages?: {
    denied?: string;
    license?: string;
    specialty?: string;
    emergency?: string;
  };

  /** Callback when permission check completes */
  onPermissionCheck?: (results: PermissionCheckResult[]) => void;

  /** Callback when emergency override is used */
  onEmergencyOverride?: (permission: string) => void;
}

interface EmergencyOverrideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  permission: string;
  userRole: HealthcareRole;
}

interface PermissionDetailsProps {
  results: PermissionCheckResult[];
  userRole: HealthcareRole;
  className?: string;
}

// ============================================================================
// PERMISSION GUARD COMPONENT
// ============================================================================

/**
 * Permission Guard Component with Healthcare Context
 */
export function PermissionGuard({
  permissions,
  children,
  fallback,
  showLoading = true,
  allowEmergencyOverride = false,
  context,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  className,
  showDetails = false,
  requireAll = true,
  errorMessages = {},
  onPermissionCheck,
  onEmergencyOverride,
}: PermissionGuardProps) {
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [emergencyPermission, setEmergencyPermission] = useState<string>("");

  // Normalize permissions to array
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

  // Use permissions hook
  const { checkPermissions, userRole, isLoading, hasEmergencyOverride, requestEmergencyOverride } =
    usePermissions();

  const [permissionResults, setPermissionResults] = useState<PermissionCheckResult[]>([]);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  // Check permissions on mount and when dependencies change
  const checkPermissionsAsync = useCallback(async () => {
    if (!permissionArray.length) {
      setIsCheckingPermissions(false);
      return;
    }

    try {
      setIsCheckingPermissions(true);
      const results = await checkPermissions(permissionArray, context);
      setPermissionResults(results);
      onPermissionCheck?.(results);
    } catch (error) {
      console.error("Permission check error:", error);
      setPermissionResults([]);
    } finally {
      setIsCheckingPermissions(false);
    }
  }, [permissionArray, context, checkPermissions, onPermissionCheck]);

  useEffect(() => {
    checkPermissionsAsync();
  }, [checkPermissionsAsync]);

  // Determine if access is granted
  const isAccessGranted = useCallback(() => {
    if (permissionResults.length === 0) return false;

    return requireAll
      ? permissionResults.every((result) => result.granted)
      : permissionResults.some((result) => result.granted);
  }, [permissionResults, requireAll]);

  // Handle emergency override request
  const handleEmergencyOverrideRequest = useCallback(
    (permission: string) => {
      if (!allowEmergencyOverride || !hasEmergencyOverride) return;

      setEmergencyPermission(permission);
      setShowEmergencyDialog(true);
    },
    [allowEmergencyOverride, hasEmergencyOverride],
  );

  // Handle emergency override confirmation
  const handleEmergencyOverrideConfirm = useCallback(
    async (reason: string) => {
      try {
        await requestEmergencyOverride(emergencyPermission, reason);
        setShowEmergencyDialog(false);
        setEmergencyPermission("");
        onEmergencyOverride?.(emergencyPermission);

        // Recheck permissions after override
        await checkPermissionsAsync();
      } catch (error) {
        console.error("Emergency override error:", error);
      }
    },
    [emergencyPermission, requestEmergencyOverride, onEmergencyOverride, checkPermissionsAsync],
  );

  // Loading state
  if (isLoading || isCheckingPermissions) {
    return showLoading ? (
      <div
        className={cn("space-y-3", className)}
        aria-label={ariaLabel || "Checking permissions"}
        aria-describedby={ariaDescribedby}
      >
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    ) : null;
  }

  // Permission granted - show content
  if (isAccessGranted()) {
    return (
      <div className={className} aria-label={ariaLabel} aria-describedby={ariaDescribedby}>
        {children}
        {showDetails && (
          <PermissionDetails results={permissionResults} userRole={userRole} className="mt-4" />
        )}
      </div>
    );
  }

  // Permission denied - show fallback or default error
  const deniedResults = permissionResults.filter((result) => !result.granted);
  const hasLicenseIssue = deniedResults.some((result) => !result.license_valid);
  const hasSpecialtyIssue = deniedResults.some((result) => !result.specialty_match);
  const hasCFMIssue = deniedResults.some((result) => !result.cfm_compliant);

  // Custom fallback provided
  if (fallback) {
    return (
      <div
        className={className}
        aria-label={ariaLabel || "Access denied"}
        aria-describedby={ariaDescribedby}
      >
        {fallback}
        {showDetails && (
          <PermissionDetails results={permissionResults} userRole={userRole} className="mt-4" />
        )}
      </div>
    );
  }

  // Default permission denied UI
  return (
    <div
      className={cn("max-w-md mx-auto", className)}
      aria-label={ariaLabel || "Access denied"}
      aria-describedby={ariaDescribedby}
    >
      <Card className="border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Acesso Negado</CardTitle>
          <CardDescription>
            {hasLicenseIssue && (errorMessages.license || "Licença médica requerida ou inválida")}
            {hasSpecialtyIssue &&
              (errorMessages.specialty || "Especialidade médica não autorizada")}
            {hasCFMIssue && "Registro CFM requerido"}
            {!hasLicenseIssue &&
              !hasSpecialtyIssue &&
              !hasCFMIssue &&
              (errorMessages.denied || "Você não tem permissão para acessar este recurso")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* User context information */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Seu papel: {getRoleDisplayName(userRole)}</span>
          </div>

          {context?.clinicId && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="w-4 h-4" />
              <span>Clínica: {context.clinicId}</span>
            </div>
          )}

          {/* Required permissions */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Permissões necessárias:</p>
            <div className="flex flex-wrap gap-1">
              {deniedResults.map((result, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {result.permission}
                </Badge>
              ))}
            </div>
          </div>

          {/* Emergency override option */}
          {allowEmergencyOverride && hasEmergencyOverride && (
            <Alert className="border-warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="text-sm">
                    {errorMessages.emergency ||
                      "Em caso de emergência médica, você pode solicitar acesso temporário."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEmergencyOverrideRequest(permissionArray[0])}
                    className="w-full"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Solicitar Acesso de Emergência
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Permission details for debugging */}
          {showDetails && <PermissionDetails results={permissionResults} userRole={userRole} />}
        </CardContent>
      </Card>

      {/* Emergency Override Dialog */}
      <EmergencyOverrideDialog
        isOpen={showEmergencyDialog}
        onClose={() => setShowEmergencyDialog(false)}
        onConfirm={handleEmergencyOverrideConfirm}
        permission={emergencyPermission}
        userRole={userRole}
      />
    </div>
  );
}

// ============================================================================
// EMERGENCY OVERRIDE DIALOG
// ============================================================================

function EmergencyOverrideDialog({
  isOpen,
  onClose,
  onConfirm,
  permission,
  userRole,
}: EmergencyOverrideDialogProps) {
  const [reason, setReason] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;

    setIsConfirming(true);
    try {
      await onConfirm(reason);
      setReason("");
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            Acesso de Emergência
          </CardTitle>
          <CardDescription>
            Você está solicitando acesso de emergência para: <strong>{permission}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label htmlFor="emergency-reason" className="block text-sm font-medium mb-2">
              Justificativa da Emergência *
            </label>
            <textarea
              id="emergency-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva a situação de emergência que justifica este acesso..."
              className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <Alert className="border-warning bg-warning/5">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Aviso:</strong> Este acesso será registrado em auditoria e notificará
              automaticamente a supervisão médica e o setor de compliance.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isConfirming}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!reason.trim() || isConfirming}
            >
              {isConfirming ? "Processando..." : "Confirmar Emergência"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// PERMISSION DETAILS COMPONENT
// ============================================================================

function PermissionDetails({ results, userRole, className }: PermissionDetailsProps) {
  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader>
        <CardTitle className="text-sm">Detalhes das Permissões</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs space-y-1">
          <p>
            <strong>Papel do Usuário:</strong> {getRoleDisplayName(userRole)}
          </p>
          <p>
            <strong>Verificações Realizadas:</strong> {results.length}
          </p>
        </div>

        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="border rounded p-2 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.permission}</span>
                <Badge variant={result.granted ? "success" : "destructive"}>
                  {result.granted ? "Concedida" : "Negada"}
                </Badge>
              </div>

              <p className="text-muted-foreground">{result.reason}</p>

              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={result.license_valid ? "success" : "destructive"}
                  className="text-xs"
                >
                  Licença: {result.license_valid ? "Válida" : "Inválida"}
                </Badge>
                <Badge
                  variant={result.specialty_match ? "success" : "destructive"}
                  className="text-xs"
                >
                  Especialidade: {result.specialty_match ? "OK" : "Incompatível"}
                </Badge>
                <Badge
                  variant={result.cfm_compliant ? "success" : "destructive"}
                  className="text-xs"
                >
                  CFM: {result.cfm_compliant ? "Conforme" : "Não conforme"}
                </Badge>
              </div>

              {result.emergency_override && (
                <Badge variant="warning" className="text-xs">
                  Acesso de Emergência Ativo
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRoleDisplayName(role: HealthcareRole): string {
  const roleNames: Record<HealthcareRole, string> = {
    [HealthcareRole.SUPER_ADMIN]: "Super Administrador",
    [HealthcareRole.SYSTEM_ADMIN]: "Administrador do Sistema",
    [HealthcareRole.MEDICAL_DIRECTOR]: "Diretor Médico",
    [HealthcareRole.CLINICAL_COORDINATOR]: "Coordenador Clínico",
    [HealthcareRole.DOCTOR_SPECIALIST]: "Médico Especialista",
    [HealthcareRole.DOCTOR_GENERAL]: "Médico Clínico Geral",
    [HealthcareRole.RESIDENT_DOCTOR]: "Médico Residente",
    [HealthcareRole.NURSE_MANAGER]: "Coordenador de Enfermagem",
    [HealthcareRole.REGISTERED_NURSE]: "Enfermeiro",
    [HealthcareRole.NURSING_TECHNICIAN]: "Técnico de Enfermagem",
    [HealthcareRole.PHYSIOTHERAPIST]: "Fisioterapeuta",
    [HealthcareRole.PSYCHOLOGIST]: "Psicólogo",
    [HealthcareRole.NUTRITIONIST]: "Nutricionista",
    [HealthcareRole.PHARMACIST]: "Farmacêutico",
    [HealthcareRole.RADIOLOGY_TECHNICIAN]: "Técnico em Radiologia",
    [HealthcareRole.LAB_TECHNICIAN]: "Técnico de Laboratório",
    [HealthcareRole.EQUIPMENT_TECHNICIAN]: "Técnico de Equipamentos",
    [HealthcareRole.ADMIN_MANAGER]: "Gerente Administrativo",
    [HealthcareRole.RECEPTIONIST]: "Recepcionista",
    [HealthcareRole.BILLING_SPECIALIST]: "Especialista em Faturamento",
    [HealthcareRole.SECRETARY]: "Secretária",
    [HealthcareRole.COMPLIANCE_OFFICER]: "Oficial de Compliance",
    [HealthcareRole.AUDITOR]: "Auditor",
    [HealthcareRole.QUALITY_MANAGER]: "Gerente de Qualidade",
    [HealthcareRole.PATIENT]: "Paciente",
    [HealthcareRole.PATIENT_FAMILY]: "Familiar do Paciente",
    [HealthcareRole.GUEST]: "Visitante",
    [HealthcareRole.VENDOR]: "Fornecedor",
  };

  return roleNames[role] || role;
}

// ============================================================================
// SPECIALIZED PERMISSION GUARDS
// ============================================================================

/**
 * Clinical Permission Guard - For medical procedures and patient care
 */
export function ClinicalPermissionGuard({
  children,
  patientId,
  allowEmergencyOverride = true,
  ...props
}: Omit<PermissionGuardProps, "permissions"> & {
  patientId?: string;
  permissions?: string[];
}) {
  return (
    <PermissionGuard
      permissions={props.permissions || ["patient.read.own", "procedure.perform.general"]}
      allowEmergencyOverride={allowEmergencyOverride}
      context={{ patientId, ...props.context }}
      errorMessages={{
        denied: "Acesso negado para informações clínicas",
        license: "Licença médica válida requerida para acesso clínico",
        specialty: "Especialidade médica não autorizada para este procedimento",
        emergency: "Em emergências médicas, solicite acesso temporário para atendimento",
      }}
      {...props}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Administrative Permission Guard - For non-clinical operations
 */
export function AdministrativePermissionGuard({
  children,
  ...props
}: Omit<PermissionGuardProps, "permissions"> & {
  permissions?: string[];
}) {
  return (
    <PermissionGuard
      permissions={props.permissions || ["scheduling.manage.clinic", "billing.process.standard"]}
      allowEmergencyOverride={false}
      errorMessages={{
        denied: "Acesso negado para operações administrativas",
        license: "Credenciais administrativas requeridas",
        specialty: "Papel administrativo não autorizado",
        emergency: "Contate seu supervisor para acesso administrativo",
      }}
      {...props}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Compliance Permission Guard - For audit and compliance access
 */
export function CompliancePermissionGuard({
  children,
  ...props
}: Omit<PermissionGuardProps, "permissions"> & {
  permissions?: string[];
}) {
  return (
    <PermissionGuard
      permissions={props.permissions || ["audit.access.clinic", "compliance.report.cfm"]}
      allowEmergencyOverride={false}
      errorMessages={{
        denied: "Acesso negado para informações de compliance",
        license: "Autorização de compliance requerida",
        specialty: "Papel de compliance não autorizado",
        emergency: "Acesso de emergência não disponível para compliance",
      }}
      showDetails={true}
      {...props}
    >
      {children}
    </PermissionGuard>
  );
}

export default PermissionGuard;

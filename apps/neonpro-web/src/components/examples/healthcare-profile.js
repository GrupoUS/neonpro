"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthcareProfile = HealthcareProfile;
var hooks_1 = require("@/lib/trpc/hooks");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var alert_1 = require("@/components/ui/alert");
/**
 * Healthcare Profile Component Example
 * Demonstrates tRPC integration with healthcare compliance
 */
function HealthcareProfile() {
  var _a;
  var _b = (0, hooks_1.useHealthcareAuth)(),
    user = _b.user,
    isLoading = _b.isLoading,
    error = _b.error,
    isAuthenticated = _b.isAuthenticated,
    isMedicalProfessional = _b.isMedicalProfessional,
    isAdmin = _b.isAdmin,
    isLGPDCompliant = _b.isLGPDCompliant,
    canAccessPatientData = _b.canAccessPatientData;
  var _c = (0, hooks_1.useLGPDConsent)(),
    grantConsent = _c.grantConsent,
    revokeConsent = _c.revokeConsent,
    consentLoading = _c.isLoading,
    consentError = _c.error;
  if (isLoading) {
    return (
      <card_1.Card className="w-full max-w-2xl mx-auto">
        <card_1.CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Carregando perfil healthcare...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (error) {
    return (
      <alert_1.Alert variant="destructive" className="w-full max-w-2xl mx-auto">
        <lucide_react_1.AlertCircle className="h-4 w-4" />
        <alert_1.AlertDescription>
          Erro ao carregar perfil: {error.message}
        </alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  if (!isAuthenticated || !user) {
    return (
      <alert_1.Alert className="w-full max-w-2xl mx-auto">
        <lucide_react_1.Shield className="h-4 w-4" />
        <alert_1.AlertDescription>
          Autenticação healthcare necessária para acessar o perfil.
        </alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* User Profile Card */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center space-x-2">
            <lucide_react_1.User className="h-5 w-5" />
            <card_1.CardTitle>Perfil Healthcare</card_1.CardTitle>
          </div>
          <card_1.CardDescription>
            Informações do profissional de saúde com validação LGPD
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="text-sm">
                {((_a = user.profile) === null || _a === void 0 ? void 0 : _a.full_name) ||
                  "Não informado"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Função</label>
              <badge_1.Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "healthcare_professional"
                  ? "Profissional de Saúde"
                  : user.role === "admin"
                    ? "Administrador"
                    : user.role === "patient"
                      ? "Paciente"
                      : "Staff"}
              </badge_1.Badge>
            </div>
            {user.medical_license && (
              <div>
                <label className="text-sm font-medium text-gray-500">CRM</label>
                <p className="text-sm font-mono">{user.medical_license}</p>
              </div>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* LGPD Compliance Card */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center space-x-2">
            <lucide_react_1.Shield className="h-5 w-5" />
            <card_1.CardTitle>Conformidade LGPD</card_1.CardTitle>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isLGPDCompliant
                ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                : <lucide_react_1.AlertCircle className="h-4 w-4 text-red-600" />}
              <span className="text-sm font-medium">
                {isLGPDCompliant ? "Conforme LGPD" : "Não conforme LGPD"}
              </span>
            </div>
            <badge_1.Badge variant={isLGPDCompliant ? "default" : "destructive"}>
              {isLGPDCompliant ? "Ativo" : "Pendente"}
            </badge_1.Badge>
          </div>

          <div className="flex space-x-2">
            {!isLGPDCompliant && (
              <button_1.Button onClick={grantConsent} disabled={consentLoading} size="sm">
                {consentLoading ? "Processando..." : "Conceder Consentimento LGPD"}
              </button_1.Button>
            )}
          </div>

          {consentError && (
            <alert_1.Alert variant="destructive">
              <lucide_react_1.AlertCircle className="h-4 w-4" />
              <alert_1.AlertDescription>
                Erro ao atualizar consentimento: {consentError.message}
              </alert_1.AlertDescription>
            </alert_1.Alert>
          )}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}

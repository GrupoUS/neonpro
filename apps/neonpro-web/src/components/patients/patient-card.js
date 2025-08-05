"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatientCard;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var avatar_1 = require("@/components/ui/avatar");
var checkbox_1 = require("@/components/ui/checkbox");
var card_1 = require("@/components/ui/card");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var progress_1 = require("@/components/ui/progress");
function PatientCard(_a) {
  var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
  var patient = _a.patient,
    selected = _a.selected,
    onSelect = _a.onSelect,
    onAction = _a.onAction;
  // Utility functions
  var formatDate = function (dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };
  var formatCPF = function (cpf) {
    if (!cpf) return "N/A";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };
  var formatPhone = function (phone) {
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
  };
  var calculateAge = function (birthDate) {
    var today = new Date();
    var birth = new Date(birthDate);
    var age = today.getFullYear() - birth.getFullYear();
    var monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  var getRiskLevelColor = function (riskLevel) {
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
  var getRiskLevelBadge = function (riskLevel) {
    switch (riskLevel) {
      case "low":
        return (
          <badge_1.Badge variant="secondary" className="bg-green-100 text-green-800">
            Baixo
          </badge_1.Badge>
        );
      case "medium":
        return (
          <badge_1.Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Médio
          </badge_1.Badge>
        );
      case "high":
        return (
          <badge_1.Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Alto
          </badge_1.Badge>
        );
      case "critical":
        return <badge_1.Badge variant="destructive">Crítico</badge_1.Badge>;
      default:
        return <badge_1.Badge variant="outline">N/A</badge_1.Badge>;
    }
  };
  var getStatusBadge = function (status) {
    switch (status) {
      case "active":
        return (
          <badge_1.Badge variant="secondary" className="bg-green-100 text-green-800">
            Ativo
          </badge_1.Badge>
        );
      case "inactive":
        return (
          <badge_1.Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inativo
          </badge_1.Badge>
        );
      case "vip":
        return (
          <badge_1.Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            VIP ⭐
          </badge_1.Badge>
        );
      case "new":
        return (
          <badge_1.Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Novo
          </badge_1.Badge>
        );
      default:
        return <badge_1.Badge variant="outline">{status}</badge_1.Badge>;
    }
  };
  var getProfileCompletenessColor = function (score) {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };
  return (
    <card_1.Card
      className={"relative transition-all duration-200 hover:shadow-md ".concat(
        selected ? "ring-2 ring-blue-500 bg-blue-50" : "",
      )}
    >
      <card_1.CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <checkbox_1.Checkbox checked={selected} onCheckedChange={onSelect} className="mt-1" />
            <avatar_1.Avatar className="h-12 w-12">
              <avatar_1.AvatarImage
                src={patient.raw_user_meta_data.profile_picture}
                alt={patient.raw_user_meta_data.full_name}
              />
              <avatar_1.AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {patient.raw_user_meta_data.full_name
                  .split(" ")
                  .map(function (name) {
                    return name[0];
                  })
                  .join("")
                  .toUpperCase()}
              </avatar_1.AvatarFallback>
            </avatar_1.Avatar>
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
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <lucide_react_1.MoreHorizontal className="h-4 w-4" />
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end">
              <dropdown_menu_1.DropdownMenuLabel>Ações</dropdown_menu_1.DropdownMenuLabel>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem
                onClick={function () {
                  return onAction("view", patient.id);
                }}
              >
                <lucide_react_1.Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem
                onClick={function () {
                  return onAction("schedule", patient.id);
                }}
              >
                <lucide_react_1.Calendar className="mr-2 h-4 w-4" />
                Agendar Consulta
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem
                onClick={function () {
                  return onAction("edit", patient.id);
                }}
              >
                <lucide_react_1.Edit className="mr-2 h-4 w-4" />
                Editar
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem
                onClick={function () {
                  return onAction("archive", patient.id);
                }}
                className="text-red-600"
              >
                <lucide_react_1.Archive className="mr-2 h-4 w-4" />
                Arquivar
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-4">
        {/* Status and Risk Level */}
        <div className="flex items-center justify-between">
          {getStatusBadge(patient.status)}
          {getRiskLevelBadge(
            (_b = patient.patient_profiles_extended) === null || _b === void 0
              ? void 0
              : _b.risk_level,
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <lucide_react_1.Phone className="h-3 w-3 mr-2" />
            {formatPhone(patient.phone)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <lucide_react_1.Mail className="h-3 w-3 mr-2" />
            <span className="truncate">{patient.email}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="font-medium">CPF:</span>
            <span className="ml-1">{formatCPF(patient.raw_user_meta_data.cpf)}</span>
          </div>
        </div>

        {/* Medical Alerts */}
        {(((_d =
          (_c = patient.patient_profiles_extended) === null || _c === void 0
            ? void 0
            : _c.chronic_conditions) === null || _d === void 0
          ? void 0
          : _d.length) > 0 ||
          ((_f =
            (_e = patient.patient_profiles_extended) === null || _e === void 0
              ? void 0
              : _e.allergies) === null || _f === void 0
            ? void 0
            : _f.length) > 0) && (
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-gray-700">Alertas Médicos</h4>
            {(_g = patient.patient_profiles_extended.chronic_conditions) === null || _g === void 0
              ? void 0
              : _g.map(function (condition, index) {
                  return (
                    <div key={index} className="flex items-center text-xs text-red-600">
                      <lucide_react_1.Heart className="h-3 w-3 mr-1" />
                      {condition}
                    </div>
                  );
                })}
            {(_h = patient.patient_profiles_extended.allergies) === null || _h === void 0
              ? void 0
              : _h.map(function (allergy, index) {
                  return (
                    <div key={index} className="flex items-center text-xs text-orange-600">
                      <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1" />
                      {allergy}
                    </div>
                  );
                })}
          </div>
        )}

        {/* Profile Completeness */}
        {((_j = patient.patient_profiles_extended) === null || _j === void 0
          ? void 0
          : _j.profile_completeness_score) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Perfil Completo</span>
              <span
                className={"text-xs font-medium ".concat(
                  getProfileCompletenessColor(
                    patient.patient_profiles_extended.profile_completeness_score,
                  ),
                )}
              >
                {Math.round(patient.patient_profiles_extended.profile_completeness_score * 100)}%
              </span>
            </div>
            <progress_1.Progress
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
          <button_1.Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={function () {
              return onAction("view", patient.id);
            }}
          >
            <lucide_react_1.Eye className="h-3 w-3 mr-1" />
            Ver
          </button_1.Button>
          <button_1.Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={function () {
              return onAction("schedule", patient.id);
            }}
          >
            <lucide_react_1.Calendar className="h-3 w-3 mr-1" />
            Agendar
          </button_1.Button>
          <button_1.Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={function () {
              return onAction("edit", patient.id);
            }}
          >
            <lucide_react_1.Edit className="h-3 w-3 mr-1" />
            Editar
          </button_1.Button>
        </div>

        {/* Last Assessment */}
        {((_k = patient.patient_profiles_extended) === null || _k === void 0
          ? void 0
          : _k.last_assessment_date) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center">
              <lucide_react_1.Activity className="h-3 w-3 mr-1" />
              Última Avaliação
            </div>
            <span>{formatDate(patient.patient_profiles_extended.last_assessment_date)}</span>
          </div>
        )}

        {/* Risk Score Indicator */}
        {((_l = patient.patient_profiles_extended) === null || _l === void 0
          ? void 0
          : _l.risk_score) !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Score de Risco</span>
            <span
              className={"font-medium ".concat(
                getRiskLevelColor(patient.patient_profiles_extended.risk_level),
              )}
            >
              {patient.patient_profiles_extended.risk_score}/100
            </span>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}

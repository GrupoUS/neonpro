"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientStatsCards = PatientStatsCards;
/**
 * Patient Statistics Cards Component
 *
 * Displays key metrics for patient management dashboard
 */
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
function StatsCard(_a) {
  var title = _a.title,
    value = _a.value,
    description = _a.description,
    icon = _a.icon,
    trend = _a.trend;
  return (
    <card_1.Card>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium">{title}</card_1.CardTitle>
        {icon}
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <p className={"text-xs ".concat(trend.isPositive ? "text-green-600" : "text-red-600")}>
            {trend.value}
          </p>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
function PatientStatsCards(_a) {
  var stats = _a.stats;
  var defaultStats = __assign(
    { totalPatients: 0, newPatients: 0, scheduledAppointments: 0, activePatients: 0 },
    stats,
  );
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total de Pacientes"
        value={defaultStats.totalPatients}
        description="Pacientes cadastrados"
        icon={<lucide_react_1.Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Novos Pacientes"
        value={defaultStats.newPatients}
        description="Este mês"
        icon={<lucide_react_1.UserPlus className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Consultas Agendadas"
        value={defaultStats.scheduledAppointments}
        description="Próximos 7 dias"
        icon={<lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Pacientes Ativos"
        value={defaultStats.activePatients}
        description="Últimos 30 dias"
        icon={<lucide_react_1.Activity className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}

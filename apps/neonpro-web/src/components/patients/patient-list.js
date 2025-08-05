'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatientList;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var avatar_1 = require("@/components/ui/avatar");
var checkbox_1 = require("@/components/ui/checkbox");
var table_1 = require("@/components/ui/table");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var skeleton_1 = require("@/components/ui/skeleton");
var patient_card_1 = require("./patient-card");
function PatientList(_a) {
    var patients = _a.patients, loading = _a.loading, viewMode = _a.viewMode, selectedPatients = _a.selectedPatients, onPatientSelect = _a.onPatientSelect, onSelectAll = _a.onSelectAll;
    var _b = (0, react_1.useState)(1), currentPage = _b[0], setCurrentPage = _b[1];
    var itemsPerPage = (0, react_1.useState)(10)[0];
    // Calculate pagination
    var totalPages = Math.ceil(patients.length / itemsPerPage);
    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = startIndex + itemsPerPage;
    var currentPatients = patients.slice(startIndex, endIndex);
    // Utility functions
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };
    var formatCPF = function (cpf) {
        if (!cpf)
            return 'N/A';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };
    var formatPhone = function (phone) {
        return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
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
    var getRiskLevelBadge = function (riskLevel) {
        switch (riskLevel) {
            case 'low':
                return <badge_1.Badge variant="secondary" className="bg-green-100 text-green-800">Baixo</badge_1.Badge>;
            case 'medium':
                return <badge_1.Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Médio</badge_1.Badge>;
            case 'high':
                return <badge_1.Badge variant="secondary" className="bg-orange-100 text-orange-800">Alto</badge_1.Badge>;
            case 'critical':
                return <badge_1.Badge variant="destructive">Crítico</badge_1.Badge>;
            default:
                return <badge_1.Badge variant="outline">N/A</badge_1.Badge>;
        }
    };
    var getStatusBadge = function (status) {
        switch (status) {
            case 'active':
                return <badge_1.Badge variant="secondary" className="bg-green-100 text-green-800">Ativo</badge_1.Badge>;
            case 'inactive':
                return <badge_1.Badge variant="secondary" className="bg-gray-100 text-gray-800">Inativo</badge_1.Badge>;
            case 'vip':
                return <badge_1.Badge variant="secondary" className="bg-yellow-100 text-yellow-800">VIP ⭐</badge_1.Badge>;
            case 'new':
                return <badge_1.Badge variant="secondary" className="bg-blue-100 text-blue-800">Novo</badge_1.Badge>;
            default:
                return <badge_1.Badge variant="outline">{status}</badge_1.Badge>;
        }
    };
    var handlePatientAction = function (action, patientId) {
        console.log("Action: ".concat(action, " for patient: ").concat(patientId));
        // Implement specific actions here
    };
    // Loading skeleton
    if (loading) {
        return (<div className="space-y-4">
        {Array.from({ length: 5 }).map(function (_, index) { return (<div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
            <skeleton_1.Skeleton className="h-10 w-10 rounded-full"/>
            <div className="space-y-2 flex-1">
              <skeleton_1.Skeleton className="h-4 w-[200px]"/>
              <skeleton_1.Skeleton className="h-4 w-[150px]"/>
            </div>
            <skeleton_1.Skeleton className="h-8 w-20"/>
            <skeleton_1.Skeleton className="h-8 w-8"/>
          </div>); })}
      </div>);
    }
    // Empty state
    if (patients.length === 0) {
        return (<div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <lucide_react_1.FileText className="h-8 w-8 text-muted-foreground"/>
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum paciente encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Tente ajustar os filtros ou adicionar um novo paciente
        </p>
        <button_1.Button>Adicionar Paciente</button_1.Button>
      </div>);
    }
    // Grid view
    if (viewMode === 'grid') {
        return (<div className="space-y-6">
        {/* Grid Header with Select All */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <checkbox_1.Checkbox checked={selectedPatients.size === patients.length && patients.length > 0} onCheckedChange={function (checked) { return onSelectAll(!!checked); }}/>
            <span className="text-sm text-muted-foreground">
              Selecionar todos ({patients.length})
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
        </div>

        {/* Patient Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentPatients.map(function (patient) { return (<patient_card_1.default key={patient.id} patient={patient} selected={selectedPatients.has(patient.id)} onSelect={function () { return onPatientSelect(patient.id); }} onAction={handlePatientAction}/>); })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (<div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} até {Math.min(endIndex, patients.length)} de {patients.length} pacientes
            </div>
            <div className="flex items-center space-x-2">
              <button_1.Button variant="outline" size="sm" onClick={function () { return setCurrentPage(Math.max(1, currentPage - 1)); }} disabled={currentPage === 1}>
                <lucide_react_1.ChevronLeft className="h-4 w-4"/>
                Anterior
              </button_1.Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, function (_, i) {
                    var page = i + 1;
                    return (<button_1.Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={function () { return setCurrentPage(page); }}>
                      {page}
                    </button_1.Button>);
                })}
              </div>
              <button_1.Button variant="outline" size="sm" onClick={function () { return setCurrentPage(Math.min(totalPages, currentPage + 1)); }} disabled={currentPage === totalPages}>
                Próximo
                <lucide_react_1.ChevronRight className="h-4 w-4"/>
              </button_1.Button>
            </div>
          </div>)}
      </div>);
    }
    // Table view (default)
    return (<div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <table_1.Table>
          <table_1.TableHeader>
            <table_1.TableRow>
              <table_1.TableHead className="w-12">
                <checkbox_1.Checkbox checked={selectedPatients.size === patients.length && patients.length > 0} onCheckedChange={function (checked) { return onSelectAll(!!checked); }}/>
              </table_1.TableHead>
              <table_1.TableHead>Paciente</table_1.TableHead>
              <table_1.TableHead>Contato</table_1.TableHead>
              <table_1.TableHead>Idade</table_1.TableHead>
              <table_1.TableHead>Status</table_1.TableHead>
              <table_1.TableHead>Risco</table_1.TableHead>
              <table_1.TableHead>Consultas</table_1.TableHead>
              <table_1.TableHead>Última Visita</table_1.TableHead>
              <table_1.TableHead className="w-12">Ações</table_1.TableHead>
            </table_1.TableRow>
          </table_1.TableHeader>
          <table_1.TableBody>
            {currentPatients.map(function (patient) {
            var _a, _b, _c, _d, _e;
            return (<table_1.TableRow key={patient.id} className={selectedPatients.has(patient.id) ? "bg-muted/50" : ""}>
                <table_1.TableCell>
                  <checkbox_1.Checkbox checked={selectedPatients.has(patient.id)} onCheckedChange={function () { return onPatientSelect(patient.id); }}/>
                </table_1.TableCell>
                
                <table_1.TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <avatar_1.Avatar className="h-10 w-10">
                      <avatar_1.AvatarImage src={patient.raw_user_meta_data.profile_picture} alt={patient.raw_user_meta_data.full_name}/>
                      <avatar_1.AvatarFallback>
                        {patient.raw_user_meta_data.full_name
                    .split(' ')
                    .map(function (name) { return name[0]; })
                    .join('')
                    .toUpperCase()}
                      </avatar_1.AvatarFallback>
                    </avatar_1.Avatar>
                    <div>
                      <div className="font-medium">
                        {patient.raw_user_meta_data.full_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        CPF: {formatCPF(patient.raw_user_meta_data.cpf)}
                      </div>
                      {/* Medical Alerts */}
                      {((_b = (_a = patient.patient_profiles_extended) === null || _a === void 0 ? void 0 : _a.chronic_conditions) === null || _b === void 0 ? void 0 : _b.length) > 0 && (<div className="flex items-center mt-1">
                          <lucide_react_1.Heart className="h-3 w-3 text-red-500 mr-1"/>
                          <span className="text-xs text-red-600">
                            {patient.patient_profiles_extended.chronic_conditions[0]}
                          </span>
                        </div>)}
                      {((_d = (_c = patient.patient_profiles_extended) === null || _c === void 0 ? void 0 : _c.allergies) === null || _d === void 0 ? void 0 : _d.length) > 0 && (<div className="flex items-center">
                          <lucide_react_1.AlertTriangle className="h-3 w-3 text-orange-500 mr-1"/>
                          <span className="text-xs text-orange-600">
                            {patient.patient_profiles_extended.allergies[0]}
                          </span>
                        </div>)}
                    </div>
                  </div>
                </table_1.TableCell>

                <table_1.TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <lucide_react_1.Phone className="h-3 w-3 mr-1 text-muted-foreground"/>
                      {formatPhone(patient.phone)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <lucide_react_1.Mail className="h-3 w-3 mr-1"/>
                      {patient.email}
                    </div>
                  </div>
                </table_1.TableCell>

                <table_1.TableCell>
                  <div className="text-sm">
                    {calculateAge(patient.raw_user_meta_data.date_of_birth)} anos
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {patient.raw_user_meta_data.gender === 'male' ? 'M' :
                    patient.raw_user_meta_data.gender === 'female' ? 'F' : 'O'}
                  </div>
                </table_1.TableCell>

                <table_1.TableCell>
                  {getStatusBadge(patient.status)}
                </table_1.TableCell>

                <table_1.TableCell>
                  {getRiskLevelBadge((_e = patient.patient_profiles_extended) === null || _e === void 0 ? void 0 : _e.risk_level)}
                </table_1.TableCell>

                <table_1.TableCell>
                  <div className="text-sm">
                    {patient.upcoming_appointments || 0} agendadas
                  </div>
                </table_1.TableCell>

                <table_1.TableCell>
                  <div className="text-sm">
                    {patient.last_visit ? formatDate(patient.last_visit) : 'Nunca'}
                  </div>
                </table_1.TableCell>

                <table_1.TableCell>
                  <dropdown_menu_1.DropdownMenu>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                      <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                      </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent align="end">
                      <dropdown_menu_1.DropdownMenuLabel>Ações</dropdown_menu_1.DropdownMenuLabel>
                      <dropdown_menu_1.DropdownMenuSeparator />
                      <dropdown_menu_1.DropdownMenuItem onClick={function () { return handlePatientAction('view', patient.id); }}>
                        <lucide_react_1.Eye className="mr-2 h-4 w-4"/>
                        Ver Detalhes
                      </dropdown_menu_1.DropdownMenuItem>
                      <dropdown_menu_1.DropdownMenuItem onClick={function () { return handlePatientAction('schedule', patient.id); }}>
                        <lucide_react_1.Calendar className="mr-2 h-4 w-4"/>
                        Agendar Consulta
                      </dropdown_menu_1.DropdownMenuItem>
                      <dropdown_menu_1.DropdownMenuItem onClick={function () { return handlePatientAction('edit', patient.id); }}>
                        <lucide_react_1.Edit className="mr-2 h-4 w-4"/>
                        Editar
                      </dropdown_menu_1.DropdownMenuItem>
                      <dropdown_menu_1.DropdownMenuSeparator />
                      <dropdown_menu_1.DropdownMenuItem onClick={function () { return handlePatientAction('archive', patient.id); }} className="text-red-600">
                        <lucide_react_1.Archive className="mr-2 h-4 w-4"/>
                        Arquivar
                      </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuContent>
                  </dropdown_menu_1.DropdownMenu>
                </table_1.TableCell>
              </table_1.TableRow>);
        })}
          </table_1.TableBody>
        </table_1.Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (<div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} até {Math.min(endIndex, patients.length)} de {patients.length} pacientes
          </div>
          <div className="flex items-center space-x-2">
            <button_1.Button variant="outline" size="sm" onClick={function () { return setCurrentPage(Math.max(1, currentPage - 1)); }} disabled={currentPage === 1}>
              <lucide_react_1.ChevronLeft className="h-4 w-4"/>
              Anterior
            </button_1.Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, function (_, i) {
                var page = i + 1;
                return (<button_1.Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={function () { return setCurrentPage(page); }}>
                    {page}
                  </button_1.Button>);
            })}
            </div>
            <button_1.Button variant="outline" size="sm" onClick={function () { return setCurrentPage(Math.min(totalPages, currentPage + 1)); }} disabled={currentPage === totalPages}>
              Próximo
              <lucide_react_1.ChevronRight className="h-4 w-4"/>
            </button_1.Button>
          </div>
        </div>)}
    </div>);
}

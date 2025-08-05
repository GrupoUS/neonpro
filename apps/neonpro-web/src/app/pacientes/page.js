"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatientsPage;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var avatar_1 = require("@/components/ui/avatar");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var dialog_1 = require("@/components/ui/dialog");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var loading_spinner_1 = require("@/components/ui/loading-spinner");
var lucide_react_1 = require("lucide-react");
function PatientsPage() {
    var _this = this;
    var _a = (0, react_1.useState)(true), isLoading = _a[0], setIsLoading = _a[1];
    var _b = (0, react_1.useState)([]), patients = _b[0], setPatients = _b[1];
    var _c = (0, react_1.useState)(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = (0, react_1.useState)("all"), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = (0, react_1.useState)(null), selectedPatient = _e[0], setSelectedPatient = _e[1];
    var _f = (0, react_1.useState)(false), isDialogOpen = _f[0], setIsDialogOpen = _f[1];
    var _g = (0, react_1.useState)(false), isDetailsOpen = _g[0], setIsDetailsOpen = _g[1];
    (0, react_1.useEffect)(function () {
        var loadPatients = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        // Simulate API call
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1200); })];
                    case 1:
                        // Simulate API call
                        _a.sent();
                        setPatients([
                            {
                                id: "1",
                                name: "Ana Silva Santos",
                                email: "ana.silva@email.com",
                                phone: "(11) 99999-9999",
                                dateOfBirth: "1985-03-15",
                                gender: "feminino",
                                address: {
                                    street: "Rua das Flores, 123",
                                    city: "São Paulo",
                                    state: "SP",
                                    zipCode: "01234-567"
                                },
                                emergencyContact: {
                                    name: "João Silva",
                                    phone: "(11) 88888-8888",
                                    relationship: "Esposo"
                                },
                                insurance: {
                                    provider: "Unimed",
                                    planNumber: "123456789"
                                },
                                medicalInfo: {
                                    bloodType: "O+",
                                    allergies: ["Penicilina", "Pólen"],
                                    medications: ["Losartana 50mg"],
                                    conditions: ["Hipertensão", "Diabetes Tipo 2"],
                                    lastVisit: "2024-07-20",
                                    nextAppointment: "2024-08-15"
                                },
                                status: "ativo",
                                registrationDate: "2023-01-15"
                            },
                            {
                                id: "2",
                                name: "Carlos Rodrigues",
                                email: "carlos.rodrigues@email.com",
                                phone: "(11) 88888-8888",
                                dateOfBirth: "1978-11-22",
                                gender: "masculino",
                                address: {
                                    street: "Av. Paulista, 456",
                                    city: "São Paulo",
                                    state: "SP",
                                    zipCode: "01310-100"
                                },
                                emergencyContact: {
                                    name: "Maria Rodrigues",
                                    phone: "(11) 77777-7777",
                                    relationship: "Esposa"
                                },
                                medicalInfo: {
                                    bloodType: "A-",
                                    allergies: [],
                                    medications: ["Sinvastatina 20mg"],
                                    conditions: ["Colesterol Alto"],
                                    lastVisit: "2024-07-18",
                                    nextAppointment: "2024-08-10"
                                },
                                status: "ativo",
                                registrationDate: "2023-03-10"
                            },
                            {
                                id: "3",
                                name: "Maria Oliveira",
                                email: "maria.oliveira@email.com",
                                phone: "(11) 77777-7777",
                                dateOfBirth: "1992-06-08",
                                gender: "feminino",
                                address: {
                                    street: "Rua Augusta, 789",
                                    city: "São Paulo",
                                    state: "SP",
                                    zipCode: "01305-000"
                                },
                                emergencyContact: {
                                    name: "Pedro Oliveira",
                                    phone: "(11) 66666-6666",
                                    relationship: "Pai"
                                },
                                medicalInfo: {
                                    bloodType: "B+",
                                    allergies: ["Lactose"],
                                    medications: [],
                                    conditions: ["Intolerância à Lactose"],
                                    lastVisit: "2024-07-25"
                                },
                                status: "ativo",
                                registrationDate: "2023-05-20"
                            }
                        ]);
                        setIsLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        loadPatients();
    }, []);
    var filteredPatients = patients.filter(function (patient) {
        var matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm);
        var matchesStatus = statusFilter === "all" || patient.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    if (isLoading) {
        return (<div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <loading_spinner_1.LoadingSpinner className="w-8 h-8 mx-auto"/>
          <p className="text-muted-foreground">Carregando pacientes...</p>
        </div>
      </div>);
    }
    return (<main className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Gerenciamento de Pacientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie informações médicas e histórico dos pacientes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.FileText className="w-4 h-4 mr-2"/>
            Exportar Lista
          </button_1.Button>
          <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button className="bg-neon-500 hover:bg-neon-600">
                <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                Novo Paciente
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Cadastrar Novo Paciente</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Preencha as informações do novo paciente
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              <NewPatientForm onClose={function () { return setIsDialogOpen(false); }}/>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total de Pacientes</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-neon-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              {patients.filter(function (p) { return p.status === "ativo"; }).length} ativos
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Novos este Mês</card_1.CardTitle>
            <lucide_react_1.Calendar className="h-4 w-4 text-blue-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +20% vs mês anterior
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Consultas Agendadas</card_1.CardTitle>
            <lucide_react_1.Activity className="h-4 w-4 text-green-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              Para os próximos 7 dias
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Alertas Médicos</card_1.CardTitle>
            <lucide_react_1.AlertCircle className="h-4 w-4 text-red-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Filters and Search */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <input_1.Input placeholder="Buscar por nome, email ou telefone..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
              </div>
            </div>
            
            <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
              <select_1.SelectTrigger className="w-[180px]">
                <select_1.SelectValue placeholder="Status"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos os Status</select_1.SelectItem>
                <select_1.SelectItem value="ativo">Ativo</select_1.SelectItem>
                <select_1.SelectItem value="inativo">Inativo</select_1.SelectItem>
                <select_1.SelectItem value="bloqueado">Bloqueado</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
            
            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.Filter className="w-4 h-4 mr-2"/>
              Mais Filtros
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Patients Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.Users className="w-5 h-5 mr-2 text-neon-500"/>
            Lista de Pacientes
          </card_1.CardTitle>
          <card_1.CardDescription>
            {filteredPatients.length} paciente(s) encontrado(s)
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {filteredPatients.length === 0 ? (<div className="text-center py-12">
              <lucide_react_1.Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50"/>
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Nenhum paciente encontrado
              </p>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros de busca
              </p>
            </div>) : (<div className="overflow-x-auto">
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Paciente</table_1.TableHead>
                    <table_1.TableHead>Contato</table_1.TableHead>
                    <table_1.TableHead>Idade</table_1.TableHead>
                    <table_1.TableHead>Tipo Sanguíneo</table_1.TableHead>
                    <table_1.TableHead>Última Consulta</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {filteredPatients.map(function (patient) { return (<table_1.TableRow key={patient.id} className="hover:bg-muted/50">
                      <table_1.TableCell>
                        <div className="flex items-center space-x-3">
                          <avatar_1.Avatar>
                            <avatar_1.AvatarImage src={patient.avatar}/>
                            <avatar_1.AvatarFallback className="bg-neon-100 text-neon-700">
                              {patient.name.split(' ').map(function (n) { return n[0]; }).join('')}
                            </avatar_1.AvatarFallback>
                          </avatar_1.Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {patient.id}
                            </p>
                          </div>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <lucide_react_1.Phone className="w-3 h-3 mr-1"/>
                            {patient.phone}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <lucide_react_1.Mail className="w-3 h-3 mr-1"/>
                            {patient.email}
                          </div>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="text-sm">
                          <p>{calculateAge(patient.dateOfBirth)} anos</p>
                          <p className="text-muted-foreground">{patient.gender}</p>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <lucide_react_1.Heart className="w-3 h-3 mr-1"/>
                          {patient.medicalInfo.bloodType}
                        </badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="text-sm">
                          {patient.medicalInfo.lastVisit ? (<>
                              <p>{new Date(patient.medicalInfo.lastVisit).toLocaleDateString('pt-BR')}</p>
                              {patient.medicalInfo.nextAppointment && (<p className="text-muted-foreground">
                                  Próxima: {new Date(patient.medicalInfo.nextAppointment).toLocaleDateString('pt-BR')}
                                </p>)}
                            </>) : (<span className="text-muted-foreground">Nunca</span>)}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant="outline" className={getStatusColor(patient.status)}>
                          {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                        </badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center space-x-2">
                          <button_1.Button variant="ghost" size="sm" onClick={function () {
                    setSelectedPatient(patient);
                    setIsDetailsOpen(true);
                }} className="text-neon-600 hover:text-neon-700 hover:bg-neon-50">
                            <lucide_react_1.Eye className="w-4 h-4"/>
                          </button_1.Button>
                          <button_1.Button variant="ghost" size="sm" onClick={function () { return console.log('Edit patient', patient.id); }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <lucide_react_1.Edit className="w-4 h-4"/>
                          </button_1.Button>
                          <button_1.Button variant="ghost" size="sm" onClick={function () { return console.log('Delete patient', patient.id); }} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <lucide_react_1.Trash2 className="w-4 h-4"/>
                          </button_1.Button>
                        </div>
                      </table_1.TableCell>
                    </table_1.TableRow>); })}
                </table_1.TableBody>
              </table_1.Table>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Patient Details Dialog */}
      <dialog_1.Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <dialog_1.DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          {selectedPatient && (<PatientDetailsView patient={selectedPatient} onClose={function () { return setIsDetailsOpen(false); }}/>)}
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </main>);
}
// Helper function for age calculation
var calculateAge = function (dateOfBirth) {
    var today = new Date();
    var birthDate = new Date(dateOfBirth);
    var age = today.getFullYear() - birthDate.getFullYear();
    var monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};
// Helper function for status colors
var getStatusColor = function (status) {
    switch (status) {
        case "ativo": return "bg-green-100 text-green-800 border-green-200";
        case "inativo": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "bloqueado": return "bg-red-100 text-red-800 border-red-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
};
// Patient Details View Component
function PatientDetailsView(_a) {
    var patient = _a.patient, onClose = _a.onClose;
    return (<>
      <dialog_1.DialogHeader>
        <dialog_1.DialogTitle className="flex items-center space-x-3">
          <avatar_1.Avatar className="w-12 h-12">
            <avatar_1.AvatarImage src={patient.avatar}/>
            <avatar_1.AvatarFallback className="bg-neon-100 text-neon-700">
              {patient.name.split(' ').map(function (n) { return n[0]; }).join('')}
            </avatar_1.AvatarFallback>
          </avatar_1.Avatar>
          <div>
            <h2 className="text-xl font-bold">{patient.name}</h2>
            <p className="text-muted-foreground">{calculateAge(patient.dateOfBirth)} anos • {patient.gender}</p>
          </div>
        </dialog_1.DialogTitle>
      </dialog_1.DialogHeader>

      <tabs_1.Tabs defaultValue="personal" className="w-full">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="personal">Pessoal</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="medical">Médico</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="history">Histórico</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="insurance">Convênio</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label_1.Label className="text-sm font-medium text-muted-foreground">Email</label_1.Label>
              <p className="font-medium">{patient.email}</p>
            </div>
            <div>
              <label_1.Label className="text-sm font-medium text-muted-foreground">Telefone</label_1.Label>
              <p className="font-medium">{patient.phone}</p>
            </div>
            <div>
              <label_1.Label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label_1.Label>
              <p className="font-medium">{new Date(patient.dateOfBirth).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <label_1.Label className="text-sm font-medium text-muted-foreground">Gênero</label_1.Label>
              <p className="font-medium capitalize">{patient.gender}</p>
            </div>
          </div>

          <div>
            <label_1.Label className="text-sm font-medium text-muted-foreground">Endereço</label_1.Label>
            <p className="font-medium">
              {patient.address.street}<br />
              {patient.address.city}, {patient.address.state}<br />
              CEP: {patient.address.zipCode}
            </p>
          </div>

          <div>
            <label_1.Label className="text-sm font-medium text-muted-foreground">Contato de Emergência</label_1.Label>
            <p className="font-medium">
              {patient.emergencyContact.name} ({patient.emergencyContact.relationship})<br />
              {patient.emergencyContact.phone}
            </p>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="medical" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label_1.Label className="text-sm font-medium text-muted-foreground">Tipo Sanguíneo</label_1.Label>
              <badge_1.Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <lucide_react_1.Heart className="w-3 h-3 mr-1"/>
                {patient.medicalInfo.bloodType}
              </badge_1.Badge>
            </div>
            <div>
              <label_1.Label className="text-sm font-medium text-muted-foreground">Status</label_1.Label>
              <badge_1.Badge variant="outline" className={getStatusColor(patient.status)}>
                {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
              </badge_1.Badge>
            </div>
          </div>

          <div>
            <label_1.Label className="text-sm font-medium text-muted-foreground">Alergias</label_1.Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {patient.medicalInfo.allergies.length > 0 ? (patient.medicalInfo.allergies.map(function (allergy, index) { return (<badge_1.Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <lucide_react_1.AlertCircle className="w-3 h-3 mr-1"/>
                    {allergy}
                  </badge_1.Badge>); })) : (<span className="text-muted-foreground">Nenhuma alergia conhecida</span>)}
            </div>
          </div>

          <div>
            <label_1.Label className="text-sm font-medium text-muted-foreground">Medicamentos</label_1.Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {patient.medicalInfo.medications.length > 0 ? (patient.medicalInfo.medications.map(function (medication, index) { return (<badge_1.Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {medication}
                  </badge_1.Badge>); })) : (<span className="text-muted-foreground">Nenhum medicamento</span>)}
            </div>
          </div>

          <div>
            <label_1.Label className="text-sm font-medium text-muted-foreground">Condições Médicas</label_1.Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {patient.medicalInfo.conditions.length > 0 ? (patient.medicalInfo.conditions.map(function (condition, index) { return (<badge_1.Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    {condition}
                  </badge_1.Badge>); })) : (<span className="text-muted-foreground">Nenhuma condição conhecida</span>)}
            </div>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label_1.Label className="text-sm font-medium text-muted-foreground">Histórico de Consultas</label_1.Label>
              <button_1.Button variant="outline" size="sm">
                <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                Nova Consulta
              </button_1.Button>
            </div>
            
            <div className="space-y-3">
              {/* Sample medical history - would come from API */}
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">Consulta Geral</p>
                    <p className="text-sm text-muted-foreground">Dr. João Medeiros</p>
                  </div>
                  <badge_1.Badge variant="outline">20/07/2024</badge_1.Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Diagnóstico:</strong> Hipertensão controlada
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Tratamento:</strong> Manter medicação atual, retorno em 30 dias
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">Exames Laboratoriais</p>
                    <p className="text-sm text-muted-foreground">Dr. Ana Beatriz</p>
                  </div>
                  <badge_1.Badge variant="outline">15/06/2024</badge_1.Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Diagnóstico:</strong> Exames dentro da normalidade
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Observações:</strong> Glicemia e colesterol controlados
                </p>
              </div>
            </div>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="insurance" className="space-y-4">
          {patient.insurance ? (<div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label className="text-sm font-medium text-muted-foreground">Operadora</label_1.Label>
                  <p className="font-medium">{patient.insurance.provider}</p>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium text-muted-foreground">Número do Plano</label_1.Label>
                  <p className="font-medium">{patient.insurance.planNumber}</p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <lucide_react_1.CheckCircle className="w-5 h-5 text-green-600 mr-2"/>
                  <span className="font-medium text-green-800">Convênio Ativo</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Todas as consultas podem ser realizadas pelo convênio
                </p>
              </div>
            </div>) : (<div className="text-center py-8">
              <lucide_react_1.AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50"/>
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Sem Convênio Médico
              </p>
              <p className="text-sm text-muted-foreground">
                Paciente realiza consultas particulares
              </p>
            </div>)}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      <div className="flex justify-end space-x-2 pt-4">
        <button_1.Button variant="outline" onClick={onClose}>
          Fechar
        </button_1.Button>
        <button_1.Button className="bg-neon-500 hover:bg-neon-600">
          <lucide_react_1.Edit className="w-4 h-4 mr-2"/>
          Editar Paciente
        </button_1.Button>
      </div>
    </>);
}
// New Patient Form Component
function NewPatientForm(_a) {
    var onClose = _a.onClose;
    var _b = (0, react_1.useState)({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "feminino",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        emergencyName: "",
        emergencyPhone: "",
        emergencyRelationship: "",
        bloodType: "",
        allergies: "",
        medications: "",
        conditions: "",
        insuranceProvider: "",
        planNumber: ""
    }), formData = _b[0], setFormData = _b[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        console.log("New patient:", formData);
        onClose();
    };
    return (<form onSubmit={handleSubmit} className="space-y-6">
      <tabs_1.Tabs defaultValue="personal" className="w-full">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="personal">Dados Pessoais</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="medical">Informações Médicas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="insurance">Convênio</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="personal" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label_1.Label htmlFor="name">Nome Completo</label_1.Label>
              <input_1.Input id="name" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} required/>
            </div>
            <div>
              <label_1.Label htmlFor="email">Email</label_1.Label>
              <input_1.Input id="email" type="email" value={formData.email} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { email: e.target.value })); }} required/>
            </div>
            <div>
              <label_1.Label htmlFor="phone">Telefone</label_1.Label>
              <input_1.Input id="phone" value={formData.phone} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { phone: e.target.value })); }} required/>
            </div>
            <div>
              <label_1.Label htmlFor="dateOfBirth">Data de Nascimento</label_1.Label>
              <input_1.Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { dateOfBirth: e.target.value })); }} required/>
            </div>
          </div>

          <div>
            <label_1.Label htmlFor="gender">Gênero</label_1.Label>
            <select_1.Select value={formData.gender} onValueChange={function (value) { return setFormData(__assign(__assign({}, formData), { gender: value })); }}>
              <select_1.SelectTrigger>
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="feminino">Feminino</select_1.SelectItem>
                <select_1.SelectItem value="masculino">Masculino</select_1.SelectItem>
                <select_1.SelectItem value="outro">Outro</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          <div className="space-y-2">
            <label_1.Label>Endereço</label_1.Label>
            <input_1.Input placeholder="Rua, número" value={formData.street} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { street: e.target.value })); }}/>
            <div className="grid grid-cols-3 gap-2">
              <input_1.Input placeholder="Cidade" value={formData.city} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { city: e.target.value })); }}/>
              <input_1.Input placeholder="Estado" value={formData.state} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { state: e.target.value })); }}/>
              <input_1.Input placeholder="CEP" value={formData.zipCode} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { zipCode: e.target.value })); }}/>
            </div>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="medical" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label_1.Label htmlFor="bloodType">Tipo Sanguíneo</label_1.Label>
              <select_1.Select value={formData.bloodType} onValueChange={function (value) { return setFormData(__assign(__assign({}, formData), { bloodType: value })); }}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="A+">A+</select_1.SelectItem>
                  <select_1.SelectItem value="A-">A-</select_1.SelectItem>
                  <select_1.SelectItem value="B+">B+</select_1.SelectItem>
                  <select_1.SelectItem value="B-">B-</select_1.SelectItem>
                  <select_1.SelectItem value="AB+">AB+</select_1.SelectItem>
                  <select_1.SelectItem value="AB-">AB-</select_1.SelectItem>
                  <select_1.SelectItem value="O+">O+</select_1.SelectItem>
                  <select_1.SelectItem value="O-">O-</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          <div>
            <label_1.Label htmlFor="allergies">Alergias (separadas por vírgula)</label_1.Label>
            <textarea_1.Textarea id="allergies" value={formData.allergies} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { allergies: e.target.value })); }} placeholder="Ex: Penicilina, Pólen, Lactose"/>
          </div>

          <div>
            <label_1.Label htmlFor="medications">Medicamentos Atuais</label_1.Label>
            <textarea_1.Textarea id="medications" value={formData.medications} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { medications: e.target.value })); }} placeholder="Ex: Losartana 50mg, Sinvastatina 20mg"/>
          </div>

          <div>
            <label_1.Label htmlFor="conditions">Condições Médicas</label_1.Label>
            <textarea_1.Textarea id="conditions" value={formData.conditions} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { conditions: e.target.value })); }} placeholder="Ex: Hipertensão, Diabetes, Asma"/>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="insurance" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label_1.Label htmlFor="insuranceProvider">Operadora do Convênio</label_1.Label>
              <input_1.Input id="insuranceProvider" value={formData.insuranceProvider} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { insuranceProvider: e.target.value })); }} placeholder="Ex: Unimed, SulAmérica"/>
            </div>
            <div>
              <label_1.Label htmlFor="planNumber">Número do Plano</label_1.Label>
              <input_1.Input id="planNumber" value={formData.planNumber} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { planNumber: e.target.value })); }} placeholder="Número da carteirinha"/>
            </div>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      <div className="flex justify-end space-x-2">
        <button_1.Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </button_1.Button>
        <button_1.Button type="submit" className="bg-neon-500 hover:bg-neon-600">
          Cadastrar Paciente
        </button_1.Button>
      </div>
    </form>);
}

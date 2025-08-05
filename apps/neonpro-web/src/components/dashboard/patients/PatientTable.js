Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientTable = PatientTable;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var table_1 = require("@/components/ui/table");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var avatar_1 = require("@/components/ui/avatar");
function PatientTable(_a) {
  var data = _a.data,
    loading = _a.loading,
    currentPage = _a.currentPage,
    totalPages = _a.totalPages,
    onPageChange = _a.onPageChange,
    onViewPatient = _a.onViewPatient,
    onEditPatient = _a.onEditPatient,
    onDeletePatient = _a.onDeletePatient;
  var getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  var handleViewPatient = (id) => {
    onViewPatient === null || onViewPatient === void 0 ? void 0 : onViewPatient(id);
  };
  var handleEditPatient = (id) => {
    onEditPatient === null || onEditPatient === void 0 ? void 0 : onEditPatient(id);
  };
  var handleDeletePatient = (id) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.",
      )
    ) {
      onDeletePatient === null || onDeletePatient === void 0 ? void 0 : onDeletePatient(id);
    }
  };
  if (loading) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Pacientes</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (data.length === 0) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Pacientes</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <lucide_react_1.Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum paciente encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros de busca ou cadastre um novo paciente.
            </p>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Pacientes ({data.length})</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="rounded-md border">
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead className="w-[50px]"></table_1.TableHead>
                <table_1.TableHead>Paciente</table_1.TableHead>
                <table_1.TableHead>Idade</table_1.TableHead>
                <table_1.TableHead>Gênero</table_1.TableHead>
                <table_1.TableHead>Contato</table_1.TableHead>
                <table_1.TableHead>Status</table_1.TableHead>
                <table_1.TableHead>Cadastro</table_1.TableHead>
                <table_1.TableHead className="w-[50px]"></table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {data.map((patient) => (
                <table_1.TableRow key={patient.id} className="hover:bg-muted/50">
                  <table_1.TableCell>
                    <avatar_1.Avatar className="h-8 w-8">
                      <avatar_1.AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(patient.name)}
                      </avatar_1.AvatarFallback>
                    </avatar_1.Avatar>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{patient.name}</span>
                      <span className="text-sm text-muted-foreground">
                        Prontuário: {patient.medical_record_number}
                      </span>
                    </div>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <span className="text-sm">{patient.age} anos</span>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <span className="text-sm">{patient.gender}</span>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <div className="flex flex-col gap-1">
                      {patient.phone !== "N/A" && (
                        <div className="flex items-center gap-1 text-sm">
                          <lucide_react_1.Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                    </div>
                  </table_1.TableCell>
                  <table_1.TableCell>{patient.status}</table_1.TableCell>
                  <table_1.TableCell>
                    <span className="text-sm text-muted-foreground">{patient.created_at}</span>
                  </table_1.TableCell>
                  <table_1.TableCell>
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
                          onClick={() => handleViewPatient(patient.id)}
                        >
                          <lucide_react_1.Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem
                          onClick={() => handleEditPatient(patient.id)}
                        >
                          <lucide_react_1.Edit className="mr-2 h-4 w-4" />
                          Editar
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuSeparator />
                        <dropdown_menu_1.DropdownMenuItem
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-destructive"
                        >
                          <lucide_react_1.Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </dropdown_menu_1.DropdownMenuItem>
                      </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>
                  </table_1.TableCell>
                </table_1.TableRow>
              ))}
            </table_1.TableBody>
          </table_1.Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <lucide_react_1.ChevronLeft className="h-4 w-4" />
                Anterior
              </button_1.Button>
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Próxima
                <lucide_react_1.ChevronRight className="h-4 w-4" />
              </button_1.Button>
            </div>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}

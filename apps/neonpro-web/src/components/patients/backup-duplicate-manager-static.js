"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DuplicateManagerStatic;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
// Static component to demonstrate UI without React hooks
function DuplicateManagerStatic(_a) {
  var onMergeComplete = _a.onMergeComplete;
  // Mock data for demonstration
  var duplicates = [
    {
      id: "1",
      patients: [
        {
          id: "p1",
          name: "João Silva",
          email: "joao@email.com",
          phone: "(11) 99999-9999",
          birthDate: "1985-03-15",
          address: "Rua A, 123",
          createdAt: "2024-01-15",
          confidence: 95,
        },
        {
          id: "p2",
          name: "João da Silva",
          email: "joao.silva@email.com",
          phone: "(11) 9999-9999",
          birthDate: "1985-03-15",
          address: "Rua A, 123 - Apt 45",
          createdAt: "2024-01-20",
          confidence: 95,
        },
      ],
      matchFields: ["name", "birthDate", "phone"],
      confidence: 95,
    },
  ];
  var handleMerge = function (duplicateId) {
    console.log("Merging duplicate:", duplicateId);
    onMergeComplete === null || onMergeComplete === void 0 ? void 0 : onMergeComplete();
  };
  var handleDismiss = function (duplicateId) {
    console.log("Dismissing duplicate:", duplicateId);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <lucide_react_1.AlertTriangle className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-semibold">Possíveis Duplicatas Detectadas</h2>
        <badge_1.Badge variant="secondary">{duplicates.length}</badge_1.Badge>
      </div>

      {duplicates.length === 0
        ? <card_1.Card>
            <card_1.CardContent className="text-center py-8">
              <lucide_react_1.Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma duplicata encontrada</p>
            </card_1.CardContent>
          </card_1.Card>
        : <div className="space-y-4">
            {duplicates.map(function (duplicate) {
              return (
                <card_1.Card key={duplicate.id} className="border-orange-200">
                  <card_1.CardHeader>
                    <div className="flex items-center justify-between">
                      <card_1.CardTitle className="text-lg">Possível Duplicata</card_1.CardTitle>
                      <badge_1.Badge variant="outline" className="text-orange-600">
                        {duplicate.confidence}% confiança
                      </badge_1.Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Campos coincidentes: {duplicate.matchFields.join(", ")}
                    </p>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {duplicate.patients.map(function (patient, index) {
                        return (
                          <div key={patient.id} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <lucide_react_1.User className="h-4 w-4" />
                              <span className="font-medium">Paciente {index + 1}</span>
                              <badge_1.Badge variant="outline" className="text-xs">
                                ID: {patient.id}
                              </badge_1.Badge>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{patient.name}</span>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <lucide_react_1.Mail className="h-3 w-3" />
                                <span>{patient.email}</span>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <lucide_react_1.Phone className="h-3 w-3" />
                                <span>{patient.phone}</span>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <lucide_react_1.Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <lucide_react_1.MapPin className="h-3 w-3" />
                                <span>{patient.address}</span>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <lucide_react_1.FileText className="h-3 w-3" />
                                <span>
                                  Criado em{" "}
                                  {new Date(patient.createdAt).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button_1.Button
                        variant="outline"
                        onClick={function () {
                          return handleDismiss(duplicate.id);
                        }}
                        className="gap-2"
                      >
                        <lucide_react_1.X className="h-4 w-4" />
                        Não é duplicata
                      </button_1.Button>
                      <button_1.Button
                        onClick={function () {
                          return handleMerge(duplicate.id);
                        }}
                        className="gap-2"
                      >
                        <lucide_react_1.Check className="h-4 w-4" />
                        Unificar pacientes
                      </button_1.Button>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>}
    </div>
  );
}

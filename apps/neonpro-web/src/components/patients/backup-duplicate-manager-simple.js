"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DuplicateManager;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function DuplicateManager(_a) {
    var onMergeComplete = _a.onMergeComplete;
    var duplicatesState = react_1.default.useState([]);
    var duplicates = duplicatesState[0];
    var setDuplicates = duplicatesState[1];
    var loadingState = react_1.default.useState(true);
    var loading = loadingState[0];
    var setLoading = loadingState[1];
    react_1.default.useEffect(function () {
        // Simulate loading duplicates
        setTimeout(function () {
            setDuplicates([]);
            setLoading(false);
        }, 1000);
    }, []);
    if (loading) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Users className="h-5 w-5"/>
            Carregando duplicatas...
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-center py-8">
            Verificando pacientes duplicados...
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (duplicates.length === 0) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Users className="h-5 w-5"/>
            Gerenciamento de Duplicatas
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <alert_1.Alert>
            <lucide_react_1.CheckCircle className="h-4 w-4"/>
            <alert_1.AlertDescription>
              Nenhuma duplicata pendente encontrada.
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Users className="h-5 w-5"/>
          Gerenciamento de Duplicatas ({duplicates.length})
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-4">
          {duplicates.map(function (duplicate, index) { return (<div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">Duplicata {index + 1}</h4>
                  <badge_1.Badge variant="secondary">Confiança: 95%</badge_1.Badge>
                </div>
                <div className="flex gap-2">
                  <button_1.Button size="sm" variant="outline">
                    <lucide_react_1.Eye className="h-4 w-4 mr-1"/>
                    Comparar
                  </button_1.Button>
                  <button_1.Button size="sm" variant="outline">
                    <lucide_react_1.CheckCircle className="h-4 w-4 mr-1"/>
                    Confirmar
                  </button_1.Button>
                  <button_1.Button size="sm" variant="outline">
                    <lucide_react_1.X className="h-4 w-4 mr-1"/>
                    Rejeitar
                  </button_1.Button>
                </div>
              </div>
            </div>); })}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}

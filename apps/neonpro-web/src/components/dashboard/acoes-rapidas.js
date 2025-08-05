"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcoesRapidas = AcoesRapidas;
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
function AcoesRapidas() {
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-lg">Ações Rápidas</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-3">
        <button_1.Button className="w-full justify-start" size="sm">
          <lucide_react_1.CalendarPlusIcon className="h-4 w-4 mr-2"/>
          Novo Agendamento
        </button_1.Button>

        <button_1.Button variant="outline" className="w-full justify-start" size="sm">
          <lucide_react_1.CreditCardIcon className="h-4 w-4 mr-2"/>
          Registrar Pagamento
        </button_1.Button>

        <button_1.Button variant="secondary" className="w-full justify-start" size="sm">
          <lucide_react_1.Banknote className="h-4 w-4 mr-2"/>
          Fechar Caixa
        </button_1.Button>
      </card_1.CardContent>
    </card_1.Card>);
}

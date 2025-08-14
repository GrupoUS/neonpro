import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, CalendarPlusIcon, CreditCardIcon } from "lucide-react";

export function AcoesRapidas() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start" size="sm">
          <CalendarPlusIcon className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>

        <Button variant="outline" className="w-full justify-start" size="sm">
          <CreditCardIcon className="h-4 w-4 mr-2" />
          Registrar Pagamento
        </Button>

        <Button variant="secondary" className="w-full justify-start" size="sm">
          <Banknote className="h-4 w-4 mr-2" />
          Fechar Caixa
        </Button>
      </CardContent>
    </Card>
  );
}

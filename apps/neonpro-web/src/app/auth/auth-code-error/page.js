Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthCodeErrorPage;
// app/auth/auth-code-error/page.tsx
var link_1 = require("next/link");
var lucide_react_1 = require("lucide-react");
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-4">
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertCircle className="h-4 w-4" />
          <alert_1.AlertTitle>Erro na Autenticação</alert_1.AlertTitle>
          <alert_1.AlertDescription>
            Ocorreu um erro durante o processo de autenticação com o Google. Isso pode acontecer por
            várias razões:
          </alert_1.AlertDescription>
        </alert_1.Alert>

        <div className="bg-card rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Possíveis causas:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>O código de autorização expirou</li>
            <li>A sessão foi cancelada</li>
            <li>Configurações OAuth incorretas</li>
            <li>Erro de comunicação com o servidor</li>
          </ul>

          <div className="pt-4">
            <link_1.default href="/login">
              <button_1.Button className="w-full">Tentar novamente</button_1.Button>
            </link_1.default>
          </div>
        </div>
      </div>
    </div>
  );
}

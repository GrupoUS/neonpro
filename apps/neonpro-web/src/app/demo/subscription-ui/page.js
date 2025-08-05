/**
 * Subscription UI Components Demo Page
 *
 * Demonstrates all the new subscription UI components implemented in Task 4.
 * This page serves as both a showcase and testing ground for the components.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SubscriptionUIDemo;
var subscription_1 = require("@/components/subscription");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
function SubscriptionUIDemo() {
  var handleUpgrade = () => {
    console.log("Navigate to upgrade page");
  };
  var handleManage = () => {
    console.log("Navigate to billing management");
  };
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Subscription UI Components</h1>
        <p className="text-muted-foreground">
          Demonstração dos novos componentes de interface para gestão de assinaturas (Task 4).
        </p>
        <badge_1.Badge variant="secondary">Task 4 - UI Components Implementation</badge_1.Badge>
      </div>

      <separator_1.Separator />

      {/* Subscription Status Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Subscription Status Cards</h2>
          <p className="text-muted-foreground mb-4">
            Cartões para exibir status detalhado da assinatura com informações completas.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Variante Padrão</h3>
            <subscription_1.SubscriptionStatusCard
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Variante Compacta</h3>
            <subscription_1.SubscriptionStatusCard
              variant="compact"
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <h3 className="text-lg font-medium">Variante Detalhada</h3>
            <subscription_1.SubscriptionStatusCard
              variant="detailed"
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>
        </div>
      </section>

      <separator_1.Separator />

      {/* Dashboard Widgets */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Dashboard Widgets</h2>
          <p className="text-muted-foreground mb-4">
            Widgets compactos para exibir informações de assinatura no dashboard.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Widget Compacto</h3>
            <subscription_1.CompactSubscriptionWidget
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Widget Padrão</h3>
            <subscription_1.SubscriptionDashboardWidget
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Widget Detalhado</h3>
            <subscription_1.DetailedSubscriptionWidget
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>
        </div>
      </section>

      <separator_1.Separator />

      {/* Feature Gates */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Feature Gates</h2>
          <p className="text-muted-foreground mb-4">
            Componentes para controlar acesso a funcionalidades baseado na assinatura.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Feature Gate Básico</h3>
            <subscription_1.FeatureGate
              feature="basic_reports"
              requiredPlan="basic"
              onUpgrade={handleUpgrade}
            >
              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <h4 className="font-semibold text-green-600">✅ Acesso Liberado!</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este conteúdo está acessível com seu plano atual.
                  </p>
                </card_1.CardContent>
              </card_1.Card>
            </subscription_1.FeatureGate>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pro Feature Gate</h3>
            <subscription_1.ProFeatureGate feature="advanced_analytics" onUpgrade={handleUpgrade}>
              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <h4 className="font-semibold text-blue-600">⭐ Funcionalidade Pro!</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analytics avançados disponíveis no plano Pro.
                  </p>
                </card_1.CardContent>
              </card_1.Card>
            </subscription_1.ProFeatureGate>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Enterprise Feature Gate</h3>
            <subscription_1.EnterpriseFeatureGate feature="white_label" onUpgrade={handleUpgrade}>
              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <h4 className="font-semibold text-purple-600">👑 Funcionalidade Enterprise!</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    White label customization para clientes enterprise.
                  </p>
                </card_1.CardContent>
              </card_1.Card>
            </subscription_1.EnterpriseFeatureGate>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Usage Limit Gate</h3>
            <subscription_1.UsageLimitGate
              current={85}
              limit={100}
              feature="relatórios mensais"
              onUpgrade={handleUpgrade}
            >
              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <h4 className="font-semibold text-orange-600">⚡ Limite Próximo!</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Você está próximo do limite de uso.
                  </p>
                </card_1.CardContent>
              </card_1.Card>
            </subscription_1.UsageLimitGate>
          </div>
        </div>
      </section>

      <separator_1.Separator />

      {/* Notifications System */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Notifications System</h2>
          <p className="text-muted-foreground mb-4">
            Sistema de notificações e alertas para status de assinatura.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Subscription Alert</h3>
          <subscription_1.SubscriptionAlert />

          <div className="p-4 border border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              📱 <strong>Notification Provider</strong> - Ativo em segundo plano
            </p>
            <p className="text-xs text-muted-foreground">
              O SubscriptionNotificationProvider está ativo e monitora mudanças de status para
              exibir notificações automáticas no canto superior direito da tela.
            </p>
          </div>
        </div>
      </section>

      <separator_1.Separator />

      {/* Implementation Notes */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Task 4 - Implementation Summary</h2>
          <p className="text-muted-foreground mb-4">
            Resumo da implementação dos componentes de UI para assinaturas.
          </p>
        </div>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              ✅ Task 4 Completed - Subscription Status UI Components
            </card_1.CardTitle>
            <card_1.CardDescription>
              Todos os componentes de interface para gestão de assinaturas foram implementados com
              sucesso.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Componentes Implementados:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  ✅ <strong>SubscriptionStatusCard</strong> - Cartão completo com status detalhado
                </li>
                <li>
                  ✅ <strong>FeatureGate Components</strong> - Controle de acesso baseado em planos
                </li>
                <li>
                  ✅ <strong>SubscriptionNotifications</strong> - Sistema de notificações
                  automáticas
                </li>
                <li>
                  ✅ <strong>DashboardWidget</strong> - Widgets para dashboard com métricas
                </li>
                <li>
                  ✅ <strong>UsageLimitGate</strong> - Controle de limites de uso
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Funcionalidades:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Exibição em tempo real do status da assinatura</li>
                <li>• Controle granular de acesso a funcionalidades</li>
                <li>• Notificações automáticas para mudanças de status</li>
                <li>• Widgets responsivos para diferentes layouts</li>
                <li>• Integração completa com hooks de subscription</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Arquivos Criados/Modificados:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground font-mono">
                <li>+ components/subscription/subscription-status-card.tsx</li>
                <li>+ components/subscription/subscription-feature-gate.tsx</li>
                <li>+ components/subscription/subscription-notifications.tsx</li>
                <li>+ components/subscription/subscription-dashboard-widget.tsx</li>
                <li>~ components/subscription/index.ts (updated exports)</li>
                <li>+ app/demo/subscription-ui/page.tsx (demo page)</li>
              </ul>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </section>

      {/* Notification Provider - Must be at the end */}
      <subscription_1.SubscriptionNotificationProvider
        autoHide={true}
        hideAfter={5000}
        showProgress={true}
      />
    </div>
  );
}

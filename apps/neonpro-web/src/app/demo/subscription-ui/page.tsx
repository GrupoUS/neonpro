/**
 * Subscription UI Components Demo Page
 *
 * Demonstrates all the new subscription UI components implemented in Task 4.
 * This page serves as both a showcase and testing ground for the components.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

import {
  CompactSubscriptionWidget,
  DetailedSubscriptionWidget,
  EnterpriseFeatureGate,
  FeatureGate,
  ProFeatureGate,
  SubscriptionAlert,
  SubscriptionDashboardWidget,
  SubscriptionNotificationProvider,
  SubscriptionStatusCard,
  UsageLimitGate,
} from "@/components/subscription";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SubscriptionUIDemo() {
  const handleUpgrade = () => {
    console.log("Navigate to upgrade page");
  };

  const handleManage = () => {
    console.log("Navigate to billing management");
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Subscription UI Components</h1>
        <p className="text-muted-foreground">
          Demonstração dos novos componentes de interface para gestão de
          assinaturas (Task 4).
        </p>
        <Badge variant="secondary">Task 4 - UI Components Implementation</Badge>
      </div>

      <Separator />

      {/* Subscription Status Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Subscription Status Cards
          </h2>
          <p className="text-muted-foreground mb-4">
            Cartões para exibir status detalhado da assinatura com informações
            completas.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Variante Padrão</h3>
            <SubscriptionStatusCard
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Variante Compacta</h3>
            <SubscriptionStatusCard
              variant="compact"
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <h3 className="text-lg font-medium">Variante Detalhada</h3>
            <SubscriptionStatusCard
              variant="detailed"
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Dashboard Widgets */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Dashboard Widgets</h2>
          <p className="text-muted-foreground mb-4">
            Widgets compactos para exibir informações de assinatura no
            dashboard.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Widget Compacto</h3>
            <CompactSubscriptionWidget
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Widget Padrão</h3>
            <SubscriptionDashboardWidget
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Widget Detalhado</h3>
            <DetailedSubscriptionWidget
              onUpgrade={handleUpgrade}
              onManage={handleManage}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Feature Gates */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Feature Gates</h2>
          <p className="text-muted-foreground mb-4">
            Componentes para controlar acesso a funcionalidades baseado na
            assinatura.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Feature Gate Básico</h3>
            <FeatureGate
              feature="basic_reports"
              requiredPlan="basic"
              onUpgrade={handleUpgrade}
            >
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-green-600">
                    ✅ Acesso Liberado!
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este conteúdo está acessível com seu plano atual.
                  </p>
                </CardContent>
              </Card>
            </FeatureGate>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pro Feature Gate</h3>
            <ProFeatureGate
              feature="advanced_analytics"
              onUpgrade={handleUpgrade}
            >
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-blue-600">
                    ⭐ Funcionalidade Pro!
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analytics avançados disponíveis no plano Pro.
                  </p>
                </CardContent>
              </Card>
            </ProFeatureGate>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Enterprise Feature Gate</h3>
            <EnterpriseFeatureGate
              feature="white_label"
              onUpgrade={handleUpgrade}
            >
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-purple-600">
                    👑 Funcionalidade Enterprise!
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    White label customization para clientes enterprise.
                  </p>
                </CardContent>
              </Card>
            </EnterpriseFeatureGate>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Usage Limit Gate</h3>
            <UsageLimitGate
              current={85}
              limit={100}
              feature="relatórios mensais"
              onUpgrade={handleUpgrade}
            >
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-orange-600">
                    ⚡ Limite Próximo!
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Você está próximo do limite de uso.
                  </p>
                </CardContent>
              </Card>
            </UsageLimitGate>
          </div>
        </div>
      </section>

      <Separator />

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
          <SubscriptionAlert />

          <div className="p-4 border border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              📱 <strong>Notification Provider</strong> - Ativo em segundo plano
            </p>
            <p className="text-xs text-muted-foreground">
              O SubscriptionNotificationProvider está ativo e monitora mudanças
              de status para exibir notificações automáticas no canto superior
              direito da tela.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Implementation Notes */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Task 4 - Implementation Summary
          </h2>
          <p className="text-muted-foreground mb-4">
            Resumo da implementação dos componentes de UI para assinaturas.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✅ Task 4 Completed - Subscription Status UI Components
            </CardTitle>
            <CardDescription>
              Todos os componentes de interface para gestão de assinaturas foram
              implementados com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Componentes Implementados:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  ✅ <strong>SubscriptionStatusCard</strong> - Cartão completo
                  com status detalhado
                </li>
                <li>
                  ✅ <strong>FeatureGate Components</strong> - Controle de
                  acesso baseado em planos
                </li>
                <li>
                  ✅ <strong>SubscriptionNotifications</strong> - Sistema de
                  notificações automáticas
                </li>
                <li>
                  ✅ <strong>DashboardWidget</strong> - Widgets para dashboard
                  com métricas
                </li>
                <li>
                  ✅ <strong>UsageLimitGate</strong> - Controle de limites de
                  uso
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
              <h4 className="font-semibold mb-2">
                Arquivos Criados/Modificados:
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground font-mono">
                <li>+ components/subscription/subscription-status-card.tsx</li>
                <li>+ components/subscription/subscription-feature-gate.tsx</li>
                <li>
                  + components/subscription/subscription-notifications.tsx
                </li>
                <li>
                  + components/subscription/subscription-dashboard-widget.tsx
                </li>
                <li>~ components/subscription/index.ts (updated exports)</li>
                <li>+ app/demo/subscription-ui/page.tsx (demo page)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Notification Provider - Must be at the end */}
      <SubscriptionNotificationProvider
        autoHide={true}
        hideAfter={5000}
        showProgress={true}
      />
    </div>
  );
}

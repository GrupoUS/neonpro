import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";

export default function SubscriptionExpiredPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <Card className="max-w-2xl w-full mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Assinatura Expirada
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Sua assinatura do NeonPro expirou. Renove agora para continuar
            usando todas as funcionalidades.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">🚫 Acesso Limitado</h3>
            <p className="mb-4">
              Sua conta está com acesso limitado. Algumas funcionalidades podem
              não estar disponíveis.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                Agendamentos bloqueados
              </li>
              <li className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                Relatórios indisponíveis
              </li>
              <li className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                Novos cadastros bloqueados
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                💳 Renovar Assinatura
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Reative sua assinatura e recupere o acesso completo
                imediatamente.
              </p>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/pricing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Renovar Agora
                </Link>
              </Button>
            </div>

            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                ⚙️ Gerenciar Cobrança
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Atualize seu método de pagamento ou veja faturas pendentes.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/subscription/manage">
                  Gerenciar Conta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              📋 Dados Preservados
            </h4>
            <p className="text-sm text-gray-600">
              Não se preocupe! Todos os seus dados estão seguros e serão
              restaurados assim que você renovar sua assinatura. Isso inclui:
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• Cadastro de pacientes e histórico médico</li>
              <li>• Agendamentos e consultas anteriores</li>
              <li>• Configurações da clínica</li>
              <li>• Relatórios financeiros e dados</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              ❓ Perguntas Frequentes
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-800">
                  Por que minha assinatura expirou?
                </p>
                <p className="text-gray-600">
                  Pode ter ocorrido um problema com seu método de pagamento ou a
                  assinatura foi cancelada.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  Posso recuperar meus dados?
                </p>
                <p className="text-gray-600">
                  Sim! Todos os seus dados são preservados e estarão disponíveis
                  quando você renovar.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  Como reativar rapidamente?
                </p>
                <p className="text-gray-600">
                  Clique em "Renovar Agora" e escolha um plano. A reativação é
                  imediata após o pagamento.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Precisa de ajuda? Entre em contato conosco em{" "}
              <a
                href="mailto:suporte@neonpro.com"
                className="text-blue-600 hover:underline"
              >
                suporte@neonpro.com
              </a>{" "}
              ou pelo WhatsApp{" "}
              <a
                href="https://wa.me/5511999999999"
                className="text-green-600 hover:underline"
              >
                (11) 99999-9999
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

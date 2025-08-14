"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SubscriptionSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking subscription status
    const checkSubscription = async () => {
      try {
        // Wait a moment for webhook processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Here you would typically verify the subscription status
        // For now, we'll assume success
        setSuccess(true);
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Processando sua assinatura...
            </h2>
            <p className="text-gray-600">
              Aguarde um momento enquanto configuramos sua conta.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <Card className="max-w-2xl w-full mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            🎉 Assinatura Ativada com Sucesso!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Bem-vindo ao NeonPro! Sua conta está pronta para uso.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Próximos Passos:</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                Complete o setup da sua clínica
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                Configure seus serviços e preços
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                Adicione sua equipe e profissionais
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                Comece a agendar seus primeiros pacientes
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                🆓 Período de Avaliação
              </h4>
              <p className="text-sm text-gray-600">
                Aproveite os próximos 14 dias para explorar todas as
                funcionalidades sem compromisso.
              </p>
            </div>
            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                🎯 Suporte Especializado
              </h4>
              <p className="text-sm text-gray-600">
                Nossa equipe está pronta para ajudar você a configurar sua
                clínica.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard">
                Acessar Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard/clinic/setup">Configurar Clínica</Link>
            </Button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              📧 Confirmação por Email
            </h4>
            <p className="text-sm text-gray-600">
              Enviamos uma confirmação da sua assinatura para o seu email.
              Verifique também a caixa de spam.
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              💡 Dicas para começar:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • Explore o painel de controle para se familiarizar com as
                funcionalidades
              </li>
              <li>• Configure primeiro os dados básicos da sua clínica</li>
              <li>• Adicione seus serviços mais populares</li>
              <li>• Convide sua equipe para colaborar na plataforma</li>
            </ul>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Precisa de ajuda? Entre em contato conosco em{" "}
              <a
                href="mailto:suporte@neonpro.com"
                className="text-blue-600 hover:underline"
              >
                suporte@neonpro.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

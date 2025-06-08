"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/dashboard");
      }
    };

    checkUser();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            NEONPRO V2.0
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema Premium de Gestão para Clínicas de Estética
          </p>
          <p className="text-lg text-gray-500 mb-12">
            Gerencie clientes, agendamentos, serviços e muito mais com nossa
            plataforma completa.
          </p>

          <div className="space-x-4">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Fazer Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Criar Conta
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gestão de Clientes
            </h3>
            <p className="text-gray-600">
              Organize e acompanhe todos os seus clientes em um só lugar.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Agendamentos
            </h3>
            <p className="text-gray-600">
              Sistema completo de agendamento com notificações automáticas.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Relatórios
            </h3>
            <p className="text-gray-600">
              Analytics detalhados para otimizar seu negócio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

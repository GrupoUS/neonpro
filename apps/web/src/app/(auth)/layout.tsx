import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticação | NeonPro",
  description: "Entre na sua conta ou cadastre-se no NeonPro",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NeonPro</h1>
          <p className="text-gray-600">Plataforma de Gestão para Clínicas de Estética</p>
        </div>
        {children}
      </div>
    </div>
  );
}

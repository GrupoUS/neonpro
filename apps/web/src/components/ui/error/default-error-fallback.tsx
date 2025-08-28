import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";
import * as React from "react";

interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function DefaultErrorFallback({
  error,
  resetError,
}: DefaultErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900">
            Algo deu errado
          </h2>
        </div>

        <p className="text-gray-600 mb-4">
          Ocorreu um erro inesperado. Nossa equipe foi notificada.
        </p>

        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Detalhes técnicos
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>

        <button
          onClick={resetError}
          className="inline-flex items-center justify-center w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

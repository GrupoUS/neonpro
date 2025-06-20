"use client"

import { ThemeToggle } from "@/components/theme-toggle"

export default function TestThemePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">Página de Teste do Seletor de Tema</h1>
        <p className="mb-6 text-muted-foreground">
          Use o botão abaixo para alternar entre os temas claro, escuro e do sistema.
        </p>
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <div className="mt-6 space-y-2 text-sm">
          <p>
            <strong>Verificações:</strong>
          </p>
          <ul className="list-disc pl-5 text-muted-foreground">
            <li>O ícone do botão muda para Sol (claro) / Lua (escuro)?</li>
            <li>O tema da página (fundo, texto) muda ao selecionar uma opção?</li>
            <li>A seleção de tema persiste após recarregar a página?</li>
            <li>Verifique o console do navegador por erros.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

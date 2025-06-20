"use client"

import * as React from "react" // Importar React
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { setTheme, theme } = useTheme() // Adicionar 'theme' para possível placeholder

  // Efeito para definir 'mounted' como true após a montagem inicial no cliente
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Enquanto não estiver montado, renderizar um placeholder ou nada para evitar mismatch de hidratação
  // Isso é especialmente útil se o conteúdo do botão (ícones) depende do tema
  if (!mounted) {
    // Retornar um placeholder do mesmo tamanho para evitar saltos de layout
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className="w-9 h-9 opacity-0" // Mantém o espaço, mas invisível até montar
      />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="dark:bg-background dark:text-foreground dark:hover:bg-muted dark:hover:text-muted-foreground dark:border-border"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Escuro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

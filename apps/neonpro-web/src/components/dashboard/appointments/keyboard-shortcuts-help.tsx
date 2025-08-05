// components/dashboard/appointments/keyboard-shortcuts-help.tsx
// Keyboard shortcuts help dialog
// Story 1.1 Task 8 - Accessibility and Keyboard Navigation

"use client";

import type { Badge } from "@/components/ui/badge";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Separator } from "@/components/ui/separator";
import type { useKeyboardShortcuts } from "@/hooks/appointments/use-keyboard-shortcuts";
import type { Info, Keyboard } from "lucide-react";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const { shortcuts, formatShortcut } = useKeyboardShortcuts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
          <DialogDescription>
            Use estes atalhos para navegar mais rapidamente pela aplicação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{shortcut.description}</span>
                <Badge variant="secondary" className="font-mono">
                  {formatShortcut(shortcut)}
                </Badge>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Info className="h-4 w-4" />
              Navegação do Calendário
            </h4>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Navegar entre datas</span>
                <Badge variant="outline" className="font-mono">
                  ← ↑ ↓ →
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Selecionar data/agendamento</span>
                <Badge variant="outline" className="font-mono">
                  Enter / Space
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Primeiro/último do período</span>
                <Badge variant="outline" className="font-mono">
                  Home / End
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Página anterior/próxima</span>
                <Badge variant="outline" className="font-mono">
                  Page Up / Page Down
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Acessibilidade</h4>
            <div className="text-sm text-muted-foreground">
              <p>• Use Tab para navegar entre elementos</p>
              <p>• Pressione Escape para fechar diálogos</p>
              <p>• Use Space ou Enter para ativar botões</p>
              <p>• Leitor de tela compatível (NVDA, JAWS, VoiceOver)</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

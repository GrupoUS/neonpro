// components/dashboard/appointments/keyboard-shortcuts-help.tsx
// Keyboard shortcuts help dialog
// Story 1.1 Task 8 - Accessibility and Keyboard Navigation
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KeyboardShortcutsHelp;
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var separator_1 = require("@/components/ui/separator");
var use_keyboard_shortcuts_1 = require("@/hooks/appointments/use-keyboard-shortcuts");
var lucide_react_1 = require("lucide-react");
function KeyboardShortcutsHelp(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = (0, use_keyboard_shortcuts_1.useKeyboardShortcuts)(), shortcuts = _b.shortcuts, formatShortcut = _b.formatShortcut;
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="max-w-lg">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.Keyboard className="h-5 w-5"/>
            Atalhos de Teclado
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Use estes atalhos para navegar mais rapidamente pela aplicação
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3">
            {shortcuts.map(function (shortcut, index) { return (<div key={index} className="flex items-center justify-between">
                <span className="text-sm">{shortcut.description}</span>
                <badge_1.Badge variant="secondary" className="font-mono">
                  {formatShortcut(shortcut)}
                </badge_1.Badge>
              </div>); })}
          </div>

          <separator_1.Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <lucide_react_1.Info className="h-4 w-4"/>
              Navegação do Calendário
            </h4>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Navegar entre datas</span>
                <badge_1.Badge variant="outline" className="font-mono">
                  ← ↑ ↓ →
                </badge_1.Badge>
              </div>
              <div className="flex justify-between">
                <span>Selecionar data/agendamento</span>
                <badge_1.Badge variant="outline" className="font-mono">
                  Enter / Space
                </badge_1.Badge>
              </div>
              <div className="flex justify-between">
                <span>Primeiro/último do período</span>
                <badge_1.Badge variant="outline" className="font-mono">
                  Home / End
                </badge_1.Badge>
              </div>
              <div className="flex justify-between">
                <span>Página anterior/próxima</span>
                <badge_1.Badge variant="outline" className="font-mono">
                  Page Up / Page Down
                </badge_1.Badge>
              </div>
            </div>
          </div>

          <separator_1.Separator />

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
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}

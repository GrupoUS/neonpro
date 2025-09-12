"use client";

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleChatButtonProps {
  className?: string;
}

/**
 * Simple Chat Button Component for Testing
 * A basic floating button to test if the issue is with the complex FloatingAIChat
 */
export default function SimpleChatButton({ className }: SimpleChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center",
          "w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-[#294359] to-[#AC9469]",
          "hover:from-[#1e3147] hover:to-[#9a8157]",
          "transition-all duration-300 ease-in-out",
          "focus:outline-none focus:ring-4 focus:ring-[#AC9469]/20"
        )}
        aria-label={isOpen ? "Fechar chat AI" : "Abrir chat AI"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Simple modal when open */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)}>
          <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-xl p-4 z-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#294359]">Chat NeonPro AI</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-gray-50 rounded p-4 mb-4 h-64 overflow-y-auto">
              <p className="text-gray-600 text-sm">
                Olá! Sou o assistente virtual da NeonPro. Como posso ajudá-lo hoje?
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AC9469]"
              />
              <button className="px-4 py-2 bg-[#294359] text-white rounded-md hover:bg-[#1e3147] transition-colors">
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import React from 'react';
import { 
  AIPrompt, 
  AIInputSearch, 
  AILoading, 
  AITextLoading, 
  AIVoice 
} from './ai-chat';

/**
 * AI Chat Components Demo for NeonPro Aesthetic Clinic
 * Demonstrates all AI chat components with aesthetic clinic context
 */
export default function AIChatDemo() {
  const handlePromptSubmit = (prompt: string) => {
    console.log('Prompt enviado:', prompt);
  };

  const handleSearch = (query: string) => {
    console.log('Busca realizada:', query);
  };

  const handleVoiceInput = (audioBlob: Blob) => {
    console.log('Áudio gravado:', audioBlob);
  };

  const handleVoiceOutput = () => {
    console.log('Reproduzir áudio');
  };

  const searchSuggestions = [
    'Botox para rugas',
    'Preenchimento labial',
    'Limpeza de pele',
    'Peeling químico',
    'Harmonização facial'
  ];

  return (
    <div className="space-y-8 p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#112031] mb-6">
        Componentes de IA - NeonPro Clínica Estética
      </h1>

      {/* AI Prompt Component */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#294359]">AI Prompt</h2>
        <AIPrompt onSubmit={handlePromptSubmit} />
      </section>

      {/* AI Input Search Component */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#294359]">Busca Inteligente</h2>
        <AIInputSearch
          onSearch={handleSearch}
          suggestions={searchSuggestions}
        />
      </section>      {/* AI Loading Component */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#294359]">Estados de Carregamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-[#D2D0C8] rounded-lg">
            <h3 className="text-sm font-medium text-[#112031] mb-2">Pequeno</h3>
            <AILoading size="sm" message="Carregando..." />
          </div>
          <div className="p-4 border border-[#D2D0C8] rounded-lg">
            <h3 className="text-sm font-medium text-[#112031] mb-2">Padrão</h3>
            <AILoading message="Processando consulta..." />
          </div>
          <div className="p-4 border border-[#D2D0C8] rounded-lg">
            <h3 className="text-sm font-medium text-[#112031] mb-2">Grande</h3>
            <AILoading size="lg" message="Analisando tratamento..." />
          </div>
        </div>
      </section>

      {/* AI Text Loading Component */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#294359]">Carregamento de Texto</h2>
        <div className="p-4 border border-[#D2D0C8] rounded-lg">
          <AITextLoading message="IA processando sua consulta" />
        </div>
      </section>

      {/* AI Voice Component */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#294359]">Entrada/Saída de Voz</h2>
        <div className="p-4 border border-[#D2D0C8] rounded-lg">
          <AIVoice
            onVoiceInput={handleVoiceInput}
            onVoiceOutput={handleVoiceOutput}
          />
          <p className="text-xs text-[#B4AC9C] mt-2">
            Use o microfone para perguntas por voz e o alto-falante para ouvir respostas
          </p>
        </div>
      </section>

      {/* Combined Example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#294359]">Exemplo Integrado</h2>
        <div className="p-6 border border-[#D2D0C8] rounded-lg bg-gradient-to-br from-white to-[#D2D0C8]/20">
          <div className="space-y-4">
            <AIInputSearch
              onSearch={handleSearch}
              suggestions={searchSuggestions}
              placeholder="Como posso ajudar com seus tratamentos?"
            />
            <div className="flex justify-between items-center">
              <AITextLoading message="Preparando resposta personalizada" />
              <AIVoice
                onVoiceInput={handleVoiceInput}
                onVoiceOutput={handleVoiceOutput}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
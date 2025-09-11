import React from "react";
import { KokonutGradientButton } from "./kokonut-gradient-button";
import { AceternityHoverBorderGradientButton } from "./aceternity-hover-border-gradient-button";

/**
 * NeonPro Gradient Buttons Demo
 * 
 * This file demonstrates usage examples for both gradient button components
 * with NeonPro's aesthetic clinic branding and Pantone palette.
 */

export function GradientButtonsDemo() {
  return (
    <div className="p-8 space-y-8 bg-[#D2D0C8] min-h-screen">
      <h1 className="text-3xl font-bold text-[#112031] mb-8">
        NeonPro Gradient Buttons Demo
      </h1>
      
      {/* KokonutGradientButton Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-[#112031]">
          Kokonut Gradient Buttons
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <KokonutGradientButton variant="primary" size="sm">
            Agendar
          </KokonutGradientButton>
          
          <KokonutGradientButton variant="secondary" size="default">
            Consulta Estética
          </KokonutGradientButton>
          
          <KokonutGradientButton variant="accent" size="lg">
            Tratamento Facial
          </KokonutGradientButton>
          
          <KokonutGradientButton variant="neutral" size="xl">
            Procedimento Premium
          </KokonutGradientButton>
          
          <KokonutGradientButton variant="elegant" size="lg" disabled>
            Indisponível
          </KokonutGradientButton>
        </div>
      </section>

      {/* AceternityHoverBorderGradientButton Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-[#112031]">
          Aceternity Hover Border Gradient Buttons
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <AceternityHoverBorderGradientButton 
            duration={1.5} 
            className="px-6 py-3"
          >
            Consulta Inicial
          </AceternityHoverBorderGradientButton>
          
          <AceternityHoverBorderGradientButton 
            duration={2} 
            clockwise={false}
            className="px-8 py-4 text-lg"
          >
            Tratamento VIP
          </AceternityHoverBorderGradientButton>
          
          <AceternityHoverBorderGradientButton 
            duration={0.8} 
            className="px-4 py-2 text-sm"
          >
            Agendar Retorno
          </AceternityHoverBorderGradientButton>
        </div>
      </section>

      {/* Combined Usage Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-[#112031]">
          Uso Combinado - Interface da Clínica
        </h2>
        
        <div className="bg-white/50 p-6 rounded-lg border border-[#B4AC9C]/30">
          <h3 className="text-lg font-medium text-[#112031] mb-4">
            Painel de Agendamentos
          </h3>
          
          <div className="flex flex-wrap gap-3">
            <KokonutGradientButton variant="primary" size="default">
              Nova Consulta
            </KokonutGradientButton>
            
            <AceternityHoverBorderGradientButton className="px-4 py-2">
              Tratamento Especial
            </AceternityHoverBorderGradientButton>
            
            <KokonutGradientButton variant="neutral" size="default">
              Visualizar Agenda
            </KokonutGradientButton>
          </div>
        </div>
      </section>
    </div>
  );
}
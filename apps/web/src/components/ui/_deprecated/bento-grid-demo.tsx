"use client";

import React from 'react';
import { BentoGrid, BentoGridItem } from './bento-grid';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Heart, 
  Sparkles, 
  Shield, 
  MessageCircle,
  BarChart3,
  Clock,
  Star
} from 'lucide-react';

/**
 * NeonPro Bento Grid Demo
 * Showcases aesthetic clinic features with NeonPro branding
 */
export function BentoGridDemo() {
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#294359] mb-4">
          NeonPro Clínica Estética
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Plataforma completa para gestão de clínicas estéticas com IA integrada, 
          agendamentos inteligentes e experiência premium para seus clientes.
        </p>
      </div>

      <BentoGrid>
        {/* Main Feature - AI Assistant */}
        <BentoGridItem
          size="lg"
          variant="primary"
          title="Assistente IA NeonPro"
          description="Chat inteligente para consultas, agendamentos e suporte 24/7 com compliance LGPD"
          icon={<MessageCircle className="w-6 h-6" />}
          header={
            <div className="h-32 bg-gradient-to-br from-[#294359] to-[#112031] flex items-center justify-center">
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="w-8 h-8 animate-pulse" />
                <span className="text-lg font-medium">IA Conversacional</span>
              </div>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Shield className="w-4 h-4" />
              <span>Compliance LGPD</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Clock className="w-4 h-4" />
              <span>Disponível 24/7</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Star className="w-4 h-4" />
              <span>Personalizado para estética</span>
            </div>
          </div>
        </BentoGridItem>

        {/* Appointments */}
        <BentoGridItem
          size="md"
          variant="secondary"
          title="Agendamentos Inteligentes"
          description="Sistema de agendamento com prevenção de no-show e lembretes automáticos"
          icon={<Calendar className="w-5 h-5" />}
          header={
            <div className="h-24 bg-gradient-to-br from-[#AC9469] to-[#B4AC9C] flex items-center justify-center">
              <Calendar className="w-12 h-12 text-white" />
            </div>
          }
        >
          <div className="text-sm text-white/80">
            <p>• Prevenção de no-show com IA</p>
            <p>• Lembretes por SMS/WhatsApp</p>
            <p>• Sincronização em tempo real</p>
          </div>
        </BentoGridItem>

        {/* Patient Management */}
        <BentoGridItem
          size="md"
          variant="accent"
          title="Gestão de Pacientes"
          description="Prontuários digitais seguros com histórico completo de tratamentos"
          icon={<Users className="w-5 h-5" />}
          header={
            <div className="h-24 bg-gradient-to-br from-[#294359] to-[#AC9469] flex items-center justify-center">
              <Users className="w-12 h-12 text-white" />
            </div>
          }
        >
          <div className="text-sm text-white/80">
            <p>• Prontuários digitais</p>
            <p>• Fotos de progresso</p>
            <p>• Histórico de tratamentos</p>
          </div>
        </BentoGridItem>

        {/* Analytics */}
        <BentoGridItem
          size="sm"
          variant="default"
          title="Relatórios e Analytics"
          description="Dashboards intuitivos com métricas de performance da clínica"
          icon={<BarChart3 className="w-5 h-5 text-[#294359]" />}
          header={
            <div className="h-20 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-[#294359]" />
            </div>
          }
        >
          <div className="text-sm text-muted-foreground">
            <p>• Receita mensal</p>
            <p>• Taxa de conversão</p>
            <p>• Satisfação do cliente</p>
          </div>
        </BentoGridItem>

        {/* Treatments */}
        <BentoGridItem
          size="sm"
          variant="default"
          title="Catálogo de Tratamentos"
          description="Biblioteca completa de procedimentos estéticos com preços e durações"
          icon={<Heart className="w-5 h-5 text-[#AC9469]" />}
          header={
            <div className="h-20 bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
              <Heart className="w-10 h-10 text-[#AC9469]" />
            </div>
          }
        >
          <div className="text-sm text-muted-foreground">
            <p>• Botox e preenchimentos</p>
            <p>• Tratamentos faciais</p>
            <p>• Procedimentos corporais</p>
          </div>
        </BentoGridItem>

        {/* Financial */}
        <BentoGridItem
          size="md"
          variant="default"
          title="Gestão Financeira"
          description="Controle completo de receitas, despesas e fluxo de caixa da clínica"
          icon={<TrendingUp className="w-5 h-5 text-[#294359]" />}
          header={
            <div className="h-24 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-10 h-10 text-[#294359] mx-auto mb-2" />
                <div className="text-sm font-medium text-[#294359]">R$ 45.280</div>
                <div className="text-xs text-muted-foreground">Este mês</div>
              </div>
            </div>
          }
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receita mensal</span>
              <span className="font-medium text-green-600">+12%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Novos clientes</span>
              <span className="font-medium text-blue-600">+8%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de retorno</span>
              <span className="font-medium text-purple-600">85%</span>
            </div>
          </div>
        </BentoGridItem>
      </BentoGrid>
    </div>
  );
}

/**
 * Simplified Bento Grid for smaller screens or sections
 */
export function BentoGridSimple() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <BentoGrid className="grid-cols-1 md:grid-cols-2 gap-3">
        <BentoGridItem
          size="sm"
          variant="primary"
          title="IA Integrada"
          description="Assistente virtual para sua clínica"
          icon={<Sparkles className="w-4 h-4" />}
        />
        
        <BentoGridItem
          size="sm"
          variant="secondary"
          title="Agendamentos"
          description="Sistema inteligente de marcação"
          icon={<Calendar className="w-4 h-4" />}
        />
        
        <BentoGridItem
          size="sm"
          variant="accent"
          title="Pacientes"
          description="Gestão completa de prontuários"
          icon={<Users className="w-4 h-4" />}
        />
        
        <BentoGridItem
          size="sm"
          variant="default"
          title="Relatórios"
          description="Analytics e métricas detalhadas"
          icon={<BarChart3 className="w-4 h-4 text-[#294359]" />}
        />
      </BentoGrid>
    </div>
  );
}
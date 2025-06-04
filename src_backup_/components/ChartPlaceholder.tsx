
import React from 'react';

export function ChartPlaceholder() {
  return (
    <div className="bg-white rounded-xl shadow-elegant border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-serif font-semibold text-dark-blue">Desempenho Mensal</h2>
        <p className="text-sm text-gray-600 mt-1">Visão geral dos agendamentos</p>
      </div>
      
      <div className="p-6">
        <div className="h-64 bg-gradient-to-br from-light-gray/10 to-light-gray/20 rounded-lg border-2 border-dashed border-light-gray/40 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-light-gray/30 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-medium text-dark-blue mb-2">
              Gráfico de Desempenho
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Visualização detalhada do desempenho mensal da clínica.
              Acompanhe tendências e métricas importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

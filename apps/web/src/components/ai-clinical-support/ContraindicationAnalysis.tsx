/**
 * ContraindicationAnalysis Component - Temporariamente Simplificado
 *
 * Este componente foi temporariamente simplificado para resolver problemas de build.
 * TODO: Implementar tipos corretos e funcionalidade completa de análise de contraindicações.
 */


interface ContraindicationAnalysisProps {
  patientId?: string
  procedureId?: string
  treatmentPlanId?: string
  onExportReport?: (analysis: any) => void
}

export function ContraindicationAnalysis({
  patientId,
  procedureId,
  treatmentPlanId,
  onExportReport,
}: ContraindicationAnalysisProps) {
  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-yellow-600 text-lg">🚧</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-yellow-800">
            Análise de Contraindicações
          </h3>
          <p className="text-sm text-yellow-600">
            Componente em desenvolvimento
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded border border-yellow-200">
        <p className="text-yellow-700 mb-3">
          Este componente está temporariamente desabilitado enquanto corrigimos os tipos de dados e integrações de API.
        </p>

        {patientId && (
          <div className="text-xs text-yellow-600 space-y-1">
            <p><strong>Paciente ID:</strong> {patientId}</p>
            {procedureId && <p><strong>Procedimento ID:</strong> {procedureId}</p>}
            {treatmentPlanId && <p><strong>Plano de Tratamento ID:</strong> {treatmentPlanId}</p>}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-700 text-sm">
            <strong>Próximos passos:</strong>
          </p>
          <ul className="text-blue-600 text-xs mt-2 space-y-1">
            <li>• Corrigir tipos ContraindicationRisk na definição de tipos</li>
            <li>• Implementar API aiClinicalSupport.analyzeContraindications</li>
            <li>• Restaurar funcionalidade completa de análise</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

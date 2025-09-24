/**
 * Healthcare Base Components for NeonPro
 * Reusable healthcare-specific components that can be shared across applications
 */

export interface HealthcareComponentProps {
  readonly patientId?: string;
  readonly userRole: 'admin' | 'professional' | 'coordinator';
  readonly lgpdCompliant: boolean;
  readonly onAuditLog?: (
    action: string,
    details?: Record<string, any>,
  ) => void;
}

/**
 * Patient Risk Assessment Card
 * Displays patient no-show risk with intervention suggestions
 */
export interface PatientRiskCardProps extends HealthcareComponentProps {
  patient: {
    id: string;
    name: string;
    nextAppointment?: string;
  };
  riskScore: {
    score: number;
    historicalNoShows: number;
    factors: string[];
  };
  onScheduleIntervention: (interventionType: string) => void;
  className?: string;
}

export function PatientRiskCard({
  patient,
  riskScore,
  onScheduleIntervention,
  onAuditLog,
  lgpdCompliant,
  className = '',
}: PatientRiskCardProps) {
  const getRiskColor = (score: number) => {
    if (score >= 0.7) return 'bg-red-100 border-red-300 text-red-800';
    if (score >= 0.4) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  const handleInterventionClick = (type: string) => {
    if (onAuditLog && lgpdCompliant) {
      onAuditLog('intervention_scheduled', {
        patientId: patient.id,
        interventionType: type,
        riskScore: riskScore.score,
        timestamp: new Date().toISOString(),
      });
    }
    onScheduleIntervention(type);
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        getRiskColor(riskScore.score)
      } ${className}`}
    >
      <div className='flex justify-between items-center mb-2'>
        <h4 className='font-semibold'>{patient.name}</h4>
        <span className='text-sm font-mono'>
          {Math.round(riskScore.score * 100)}% risco
        </span>
      </div>

      {patient.nextAppointment && <p className='text-sm mb-2'>Próximo: {patient.nextAppointment}
      </p>}

      <p className='text-sm mb-3'>
        Histórico: {riskScore.historicalNoShows} faltas
      </p>

      {riskScore.score >= 0.4 && (
        <button
          onClick={() => handleInterventionClick('reminder')}
          className='w-full px-3 py-2 text-sm bg-white bg-opacity-50 rounded border border-current hover:bg-opacity-75 transition-colors'
        >
          Agendar Lembrete
        </button>
      )}
    </div>
  );
}

/**
 * LGPD Compliance Banner
 * Shows data processing consent and privacy information
 */
export interface LGPDComplianceBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  showDetails?: boolean;
  className?: string;
}

export function LGPDComplianceBanner({
  onAccept,
  onDecline,
  showDetails = false,
  className = '',
}: LGPDComplianceBannerProps) {
  return (
    <div
      className={`fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 ${className}`}
    >
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0'>
          <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
            <svg
              className='w-4 h-4 text-blue-600'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        </div>

        <div className='flex-1'>
          <h4 className='text-sm font-semibold text-gray-900 mb-1'>
            Proteção de Dados (LGPD)
          </h4>
          <p className='text-sm text-gray-600 mb-3'>
            Utilizamos seus dados para melhorar sua experiência com tratamentos estéticos. Seus
            dados são protegidos conforme a Lei Geral de Proteção de Dados.
          </p>

          {showDetails && (
            <div className='text-xs text-gray-500 mb-3 p-2 bg-gray-50 rounded'>
              <p>
                • Dados coletados: informações de contato e histórico de tratamentos
              </p>
              <p>• Finalidade: agendamento e personalização de tratamentos</p>
              <p>• Retenção: conforme necessário para prestação do serviço</p>
              <p>• Direitos: acesso, correção, exclusão e portabilidade</p>
            </div>
          )}

          <div className='flex space-x-2'>
            <button
              onClick={onAccept}
              className='px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors'
            >
              Aceitar
            </button>
            <button
              onClick={onDecline}
              className='px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition-colors'
            >
              Recusar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

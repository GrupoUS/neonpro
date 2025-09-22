'use client';

import { Button } from '@neonpro/ui';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Info,
  Sparkles,
  Target,
  XCircle,
  Zap,
} from 'lucide-react';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Tabs } from '../ui/tabs';

export interface ProcedureRecommendation {
  id: string;
  name: string;
  description: string;
  suitabilityScore: number;
  estimatedSessions: number;
  sessionDuration: string;
  estimatedPrice: {
    min: number;
    max: number;
    currency: string;
  };
  benefits: string[];
  risks: string[];
  contraindications: string[];
  downtime: string;
  anvisaApproved: boolean;
  priorityLevel: 'alta' | 'média' | 'baixa';
  category: 'facial' | 'corporal' | 'injetável' | 'laser' | 'peeling';
  technicalDetails: {
    mechanism: string;
    duration: string;
    results: string;
  };
}

export interface ContraindicationAlert {
  type: 'critical' | 'warning' | 'info';
  condition: string;
  description: string;
  restrictions: string[];
  alternatives?: string[];
}

export interface ProcedureRecommendationsProps {
  recommendations: ProcedureRecommendation[];
  contraindications: ContraindicationAlert[];
  patientProfile: {
    age: number;
    skinType: string;
    primaryConcerns: string[];
    medicalHistory: Record<string, boolean | string>;
  };
  onScheduleConsultation: (procedureIds: string[]) => void;
  onRequestMoreInfo: (procedureId: string) => void;
  isLoading?: boolean;
}

export function ProcedureRecommendations({
  recommendations,
  contraindications,
  patientProfile,
  onScheduleConsultation,
  onRequestMoreInfo,
  isLoading = false,
}: ProcedureRecommendationsProps) {
  const [selectedProcedures, setSelectedProcedures] = React.useState<string[]>(
    [],
  );

  const toggleProcedureSelection = (_procedureId: any) => {
    setSelectedProcedures(prev =>
      prev.includes(procedureId)
        ? prev.filter(id => id !== procedureId)
        : [...prev, procedureId]
    );
  };

  const formatPrice = (min: number, max: number, currency: string) => {
    return `${currency} ${min.toLocaleString('pt-BR')} - ${currency} ${
      max.toLocaleString(
        'pt-BR',
      )
    }`;
  };

  const getSuitabilityColor = (_score: any) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPriorityIcon = (_priority: any) => {
    switch (priority) {
      case 'alta':
        return <Target className='h-4 w-4 text-red-500' />;
      case 'média':
        return <Clock className='h-4 w-4 text-yellow-500' />;
      case 'baixa':
        return <Info className='h-4 w-4 text-blue-500' />;
      default:
        return null;
    }
  };

  const criticalContraindications = contraindications.filter(
    c => c.type === 'critical',
  );
  const warningContraindications = contraindications.filter(
    c => c.type === 'warning',
  );

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-6 w-6 text-purple-500' />
            Recomendações de Tratamentos Estéticos
          </CardTitle>
          <CardDescription>
            Análise personalizada baseada no perfil do paciente e conformidade ANVISA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            <Badge variant='outline'>Idade: {patientProfile.age} anos</Badge>
            <Badge variant='outline'>Fototipo: {patientProfile.skinType}</Badge>
            {patientProfile.primaryConcerns.map(concern => (
              <Badge key={concern} variant='secondary'>
                {concern}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Contraindicação */}
      {(criticalContraindications.length > 0
        || warningContraindications.length > 0) && (<div className='space-y-3'>
          {criticalContraindications.map((alert, _index) => (
            <Alert key={index} variant='destructive'>
              <XCircle className='h-4 w-4' />
              <AlertTitle>
                Contraindicação Crítica: {alert.condition}
              </AlertTitle>
              <AlertDescription>
                <p className='mb-2'>{alert.description}</p>
                <ul className='list-disc list-inside space-y-1'>
                  {alert.restrictions.map((restriction, i) => (
                    <li key={i} className='text-sm'>
                      {restriction}
                    </li>
                  ))}
                </ul>
                {alert.alternatives && (
                  <div className='mt-2'>
                    <p className='font-medium text-sm'>
                      Alternativas recomendadas:
                    </p>
                    <p className='text-sm'>{alert.alternatives.join(', ')}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}

          {warningContraindications.map((alert, _index) => (
            <Alert key={index}>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Atenção: {alert.condition}</AlertTitle>
              <AlertDescription>
                <p className='mb-2'>{alert.description}</p>
                <ul className='list-disc list-inside space-y-1'>
                  {alert.restrictions.map((restriction, i) => (
                    <li key={i} className='text-sm'>
                      {restriction}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Recomendações por Categoria */}
      <Tabs defaultValue='all' className='w-full'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='all'>Todos</TabsTrigger>
          <TabsTrigger value='facial'>Facial</TabsTrigger>
          <TabsTrigger value='corporal'>Corporal</TabsTrigger>
          <TabsTrigger value='injetável'>Injetável</TabsTrigger>
          <TabsTrigger value='laser'>Laser</TabsTrigger>
          <TabsTrigger value='peeling'>Peeling</TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='space-y-4'>
          <RecommendationGrid
            recommendations={recommendations}
            selectedProcedures={selectedProcedures}
            onToggleSelection={toggleProcedureSelection}
            onRequestMoreInfo={onRequestMoreInfo}
            formatPrice={formatPrice}
            getSuitabilityColor={getSuitabilityColor}
            getPriorityIcon={getPriorityIcon}
          />
        </TabsContent>

        {['facial', 'corporal', 'injetável', 'laser', 'peeling'].map(
          category => (
            <TabsContent key={category} value={category} className='space-y-4'>
              <RecommendationGrid
                recommendations={recommendations.filter(
                  r => r.category === category,
                )}
                selectedProcedures={selectedProcedures}
                onToggleSelection={toggleProcedureSelection}
                onRequestMoreInfo={onRequestMoreInfo}
                formatPrice={formatPrice}
                getSuitabilityColor={getSuitabilityColor}
                getPriorityIcon={getPriorityIcon}
              />
            </TabsContent>
          ),
        )}
      </Tabs>

      {/* Ações */}
      {selectedProcedures.length > 0 && (
        <Card className='border-2 border-blue-200 bg-blue-50'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-semibold text-blue-900'>
                  {selectedProcedures.length} procedimento(s) selecionado(s)
                </h3>
                <p className='text-sm text-blue-700'>
                  Agende uma consulta para discussão detalhada dos tratamentos
                </p>
              </div>
              <Button
                onClick={() => onScheduleConsultation(selectedProcedures)}
                disabled={isLoading}
                className='bg-blue-600 hover:bg-blue-700'
              >
                <Calendar className='h-4 w-4 mr-2' />
                Agendar Consulta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface RecommendationGridProps {
  recommendations: ProcedureRecommendation[];
  selectedProcedures: string[];
  onToggleSelection: (id: string) => void;
  onRequestMoreInfo: (id: string) => void;
  formatPrice: (min: number, max: number, currency: string) => string;
  getSuitabilityColor: (score: number) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
}

function RecommendationGrid({
  recommendations,
  selectedProcedures,
  onToggleSelection,
  onRequestMoreInfo,
  formatPrice,
  getSuitabilityColor,
  getPriorityIcon,
}: RecommendationGridProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {recommendations.map(procedure => (
        <Card
          key={procedure.id}
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedProcedures.includes(procedure.id)
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : ''
          }`}
          onClick={() => onToggleSelection(procedure.id)}
        >
          <CardHeader className='pb-2'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <CardTitle className='text-lg'>{procedure.name}</CardTitle>
                <div className='flex items-center gap-2 mt-1'>
                  {getPriorityIcon(procedure.priorityLevel)}
                  <Badge variant='outline' className='text-xs'>
                    {procedure.category}
                  </Badge>
                  {procedure.anvisaApproved && (
                    <Badge className='text-xs bg-green-100 text-green-800'>
                      <CheckCircle className='h-3 w-3 mr-1' />
                      ANVISA
                    </Badge>
                  )}
                </div>
              </div>
              <Badge
                className={`text-xs ${getSuitabilityColor(procedure.suitabilityScore)}`}
              >
                {procedure.suitabilityScore}% compatível
              </Badge>
            </div>
          </CardHeader>

          <CardContent className='space-y-3'>
            <p className='text-sm text-gray-600'>{procedure.description}</p>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Sessões:</span>
                <span className='font-medium'>
                  {procedure.estimatedSessions}x
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Duração:</span>
                <span className='font-medium'>{procedure.sessionDuration}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Downtime:</span>
                <span className='font-medium'>{procedure.downtime}</span>
              </div>
            </div>

            <div className='pt-2 border-t'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-green-600'>
                  {formatPrice(
                    procedure.estimatedPrice.min,
                    procedure.estimatedPrice.max,
                    procedure.estimatedPrice.currency,
                  )}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onRequestMoreInfo(procedure.id);
                  }}
                >
                  <Info className='h-3 w-3 mr-1' />
                  Detalhes
                </Button>
              </div>
            </div>

            {procedure.benefits.length > 0 && (
              <div className='space-y-1'>
                <p className='text-xs font-medium text-gray-700'>Benefícios:</p>
                <div className='flex flex-wrap gap-1'>
                  {procedure.benefits.slice(0, 2).map((benefit, i) => (
                    <Badge key={i} variant='secondary' className='text-xs'>
                      {benefit}
                    </Badge>
                  ))}
                  {procedure.benefits.length > 2 && (
                    <Badge variant='secondary' className='text-xs'>
                      +{procedure.benefits.length - 2} mais
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { User, Calendar, Phone, Mail } from 'lucide-react';
import type { Patient, PatientEventHandler, CardComponentProps } from './types/healthcare';

export interface PatientCardProps extends CardComponentProps {
  patient: Patient;
  onViewDetails?: PatientEventHandler;
  onScheduleAppointment?: PatientEventHandler;
}

export function PatientCard({ 
  patient, 
  variant = 'default',
  onViewDetails,
  onScheduleAppointment 
}: PatientCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const cardClassName = variant === 'compact' 
    ? "transition-shadow hover:shadow-md p-4" 
    : "transition-shadow hover:shadow-md";

  return (
    <Card className={cardClassName}>
      <CardHeader className={variant === 'compact' ? "pb-2" : ""}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className={variant === 'compact' ? "text-sm" : ""}>{patient.name}</span>
          </div>
          {getStatusBadge(patient.status)}
        </CardTitle>
      </CardHeader>
      
      <CardContent className={variant === 'compact' ? "pt-0" : ""}>
        <div className="space-y-2 text-sm text-muted-foreground">
          {patient.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span>{patient.email}</span>
            </div>
          )}
          
          {patient.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{patient.phone}</span>
            </div>
          )}
          
          {patient.lastVisit && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Última visita: {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          
          {patient.treatments && (
            <div className="text-xs">
              {patient.treatments} tratamento{patient.treatments !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {variant !== 'compact' && (
          <div className="flex gap-2 mt-4">
            {onViewDetails && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewDetails(patient.id)}
              >
                Ver Detalhes
              </Button>
            )}
            
            {onScheduleAppointment && (
              <Button 
                size="sm"
                onClick={() => onScheduleAppointment(patient.id)}
              >
                Agendar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Animated version for compatibility
export const PatientCardAnimated = PatientCard;

export default PatientCard;
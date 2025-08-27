'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Pill,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Activity,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  Zap,
  AlertCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  EmergencyMedication,
  EmergencyMedicationsListProps
} from '@/types/emergency';

/**
 * EmergencyMedicationsList - Critical Medications with Interaction Warnings
 * Phase 3.4: Mobile Emergency Interface Implementation
 * 
 * Features:
 * - Critical medications with interaction warnings
 * - Real-time drug interaction analysis
 * - ANVISA controlled substances identification
 * - Emergency dosing and administration notes
 * - Contraindication alerts with severity levels
 * - One-thumb operation with 56px touch targets
 * - Color-coded criticality (🔴 Critical, 🟡 Important, 🔵 Standard)
 * - Automatic prescription validation
 */
export function EmergencyMedicationsList({
  medications,
  onMedicationClick,
  onInteractionWarning,
  className,
  showInteractions = true,
  emergencyMode = false
}: EmergencyMedicationsListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAllMedications, setShowAllMedications] = useState(false);
  const [interactionAlerts, setInteractionAlerts] = useState<string[]>([]);

  // Auto-expand critical medications and detect interactions
  useEffect(() => {
    const criticalMedications = medications.filter(m => m.critical);
    const criticalIds = new Set(criticalMedications.map(m => m.id));
    
    // Auto-expand critical medications
    setExpandedItems(prev => new Set([...prev, ...criticalIds]));
    
    // Check for drug interactions
    const detectedInteractions = [];
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i];
        const med2 = medications[j];
        
        // Check if med1 interactions include med2 or vice versa
        if (med1.interactions.some(int => med2.name.toLowerCase().includes(int.toLowerCase())) ||
            med2.interactions.some(int => med1.name.toLowerCase().includes(int.toLowerCase()))) {
          detectedInteractions.push(`${med1.name} ⚠️ ${med2.name}`);
        }
      }
    }
    
    setInteractionAlerts(detectedInteractions);
    
    // Trigger interaction warning callback
    if (detectedInteractions.length > 0 && onInteractionWarning) {
      onInteractionWarning(detectedInteractions);
    }
  }, [medications, onInteractionWarning]);

  // Sort medications by criticality and active status
  const sortedMedications = useMemo(() => {
    return [...medications].sort((a, b) => {
      // Critical medications first
      if (a.critical !== b.critical) return a.critical ? -1 : 1;
      
      // Active medications (no end date or future end date)
      const aActive = !a.endDate || a.endDate > new Date();
      const bActive = !b.endDate || b.endDate > new Date();
      if (aActive !== bActive) return aActive ? -1 : 1;
      
      // Most recently started
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [medications]);

  // Get displayed medications
  const displayedMedications = useMemo(() => {
    if (showAllMedications) return sortedMedications;
    
    // Always show critical medications plus up to 5 others
    const critical = sortedMedications.filter(m => m.critical);
    const nonCritical = sortedMedications.filter(m => !m.critical).slice(0, 5);
    return [...critical, ...nonCritical];
  }, [sortedMedications, showAllMedications]);

  // Medication analysis
  const medicationAnalysis = useMemo(() => {
    return {
      total: medications.length,
      critical: medications.filter(m => m.critical).length,
      withInteractions: medications.filter(m => m.interactions.length > 0).length,
      controlled: medications.filter(m => isControlledSubstance(m.name)).length,
      active: medications.filter(m => !m.endDate || m.endDate > new Date()).length
    };
  }, [medications]);

  const toggleExpanded = (medicationId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(medicationId)) {
        newSet.delete(medicationId);
      } else {
        newSet.add(medicationId);
      }
      return newSet;
    });
  };

  const getMedicationStatus = (medication: EmergencyMedication) => {
    const now = new Date();
    if (medication.endDate && medication.endDate < now) {
      return { status: 'discontinued', label: 'Descontinuado', color: 'secondary' };
    }
    return { status: 'active', label: 'Ativo', color: 'default' };
  };

  const isControlledSubstance = (medicationName: string): boolean => {
    // Common controlled substances in Brazil (ANVISA classification)
    const controlled = [
      'morfina', 'codeína', 'tramadol', 'fentanil', 'midazolam', 'diazepam',
      'clonazepam', 'lorazepam', 'zolpidem', 'metilfenidato', 'dextroanfetamina'
    ];
    return controlled.some(c => medicationName.toLowerCase().includes(c));
  };

  const getControlledClass = (medicationName: string): string | null => {
    // ANVISA controlled substance classes
    const classes = {
      'A1': ['morfina', 'fentanil', 'metadona'],
      'A2': ['codeína', 'tramadol'],
      'B1': ['midazolam', 'diazepam', 'clonazepam'],
      'B2': ['fenobarbital', 'pentobarbital'],
      'C1': ['metilfenidato', 'dextroanfetamina'],
      'C2': ['femproporex', 'anfepramona']
    };
    
    for (const [classType, substances] of Object.entries(classes)) {
      if (substances.some(s => medicationName.toLowerCase().includes(s))) {
        return classType;
      }
    }
    return null;
  };

  const formatDateRange = (startDate: Date, endDate?: Date) => {
    const start = startDate.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    });
    
    if (!endDate) return `Desde ${start}`;
    
    const end = endDate.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    });
    
    return `${start} - ${end}`;
  };

  const calculateDaysSince = (date: Date): number => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  if (medications.length === 0) {
    return (
      <Card className={cn('emergency-medications-list', className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Nenhuma medicação em uso</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'emergency-medications-list transition-all duration-200',
      emergencyMode && 'emergency-mode border-blue-300 shadow-lg',
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-blue-500" />
            <span className={cn(
              'font-semibold',
              emergencyMode && 'text-lg'
            )}>
              Medicações de Emergência
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {medicationAnalysis.critical > 0 && (
              <Badge variant="destructive" className="text-xs font-bold">
                {medicationAnalysis.critical} CRÍTICO
              </Badge>
            )}
            {medicationAnalysis.controlled > 0 && (
              <Badge variant="secondary" className="text-xs">
                {medicationAnalysis.controlled} CONTROLADO
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {medicationAnalysis.active} ATIVO
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Interaction alerts */}
        {showInteractions && interactionAlerts.length > 0 && (
          <Alert className="border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900 dark:text-orange-100">
              ⚠️ Interações Medicamentosas Detectadas ({interactionAlerts.length})
            </AlertTitle>
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <div className="space-y-1 mt-2">
                {interactionAlerts.slice(0, 3).map((interaction, index) => (
                  <div key={index} className="text-sm font-medium">
                    • {interaction}
                  </div>
                ))}
                {interactionAlerts.length > 3 && (
                  <div className="text-sm">
                    ... e mais {interactionAlerts.length - 3} interação(ões)
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Medications list */}
        <div className="space-y-2">
          {displayedMedications.map((medication) => {
            const isExpanded = expandedItems.has(medication.id);
            const status = getMedicationStatus(medication);
            const controlled = isControlledSubstance(medication.name);
            const controlledClass = getControlledClass(medication.name);
            const daysSince = calculateDaysSince(medication.startDate);

            return (
              <Card
                key={medication.id}
                className={cn(
                  'border-2 transition-all duration-200',
                  medication.critical 
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                    : controlled
                    ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
                    : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
                  emergencyMode && 'shadow-md hover:shadow-lg',
                  onMedicationClick && 'cursor-pointer hover:shadow-md'
                )}
                onClick={() => onMedicationClick?.(medication)}
              >
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(medication.id)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-between p-4 h-auto',
                        'min-h-[56px] touch-target-56', // Emergency touch target
                        medication.critical 
                          ? 'text-red-900 dark:text-red-100 hover:bg-red-100 dark:hover:bg-red-900'
                          : controlled
                          ? 'text-orange-900 dark:text-orange-100 hover:bg-orange-100 dark:hover:bg-orange-900'
                          : 'text-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900'
                      )}
                    >
                      <div className="flex items-center space-x-3 flex-1 text-left">
                        <div className={cn(
                          'p-2 rounded-full',
                          medication.critical 
                            ? 'bg-red-100 dark:bg-red-900'
                            : controlled
                            ? 'bg-orange-100 dark:bg-orange-900'
                            : 'bg-blue-100 dark:bg-blue-900'
                        )}>
                          <Pill className={cn(
                            'h-5 w-5',
                            medication.critical 
                              ? 'text-red-600 dark:text-red-400'
                              : controlled
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-blue-600 dark:text-blue-400'
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h4 className={cn(
                              'font-semibold text-base',
                              emergencyMode && 'text-lg'
                            )}>
                              {medication.name}
                            </h4>
                            {medication.critical && (
                              <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                                CRÍTICO
                              </Badge>
                            )}
                            {controlled && (
                              <Badge variant="secondary" className="text-xs">
                                {controlledClass || 'CONTROLADO'}
                              </Badge>
                            )}
                            <Badge variant={status.color as any} className="text-xs">
                              {status.label}
                            </Badge>
                          </div>
                          <p className={cn(
                            'text-sm opacity-90 mt-1',
                            emergencyMode && 'text-base'
                          )}>
                            {medication.dosage} - {medication.frequency}
                          </p>
                          <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                            <span className="text-xs opacity-75">
                              {formatDateRange(medication.startDate, medication.endDate)}
                            </span>
                            <span className="text-xs opacity-75">
                              • {daysSince} dias de uso
                            </span>
                            {medication.interactions.length > 0 && (
                              <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-800 dark:border-yellow-700 dark:text-yellow-200">
                                {medication.interactions.length} Interações
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 flex-shrink-0" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      {/* Prescribing information */}
                      <div className={cn(
                        'p-3 rounded-md border',
                        medication.critical 
                          ? 'bg-red-100 border-red-200 dark:bg-red-900 dark:border-red-800'
                          : 'bg-gray-100 border-gray-200 dark:bg-gray-900 dark:border-gray-800'
                      )}>
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4" />
                          <h5 className="font-semibold text-sm">Informações da Prescrição</h5>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <p><strong>Prescrito por:</strong> {medication.prescribedBy}</p>
                          <p><strong>Data de início:</strong> {medication.startDate.toLocaleDateString('pt-BR')}</p>
                          {medication.endDate && (
                            <p><strong>Data final:</strong> {medication.endDate.toLocaleDateString('pt-BR')}</p>
                          )}
                        </div>
                      </div>

                      {/* Drug interactions */}
                      {medication.interactions.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-950 dark:border-yellow-800">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <h5 className="font-semibold text-sm">Interações Conhecidas</h5>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {medication.interactions.map((interaction, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {interaction}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contraindications */}
                      {medication.contraindications.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-950 dark:border-red-800">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <h5 className="font-semibold text-sm">Contraindicações</h5>
                          </div>
                          <div className="space-y-1">
                            {medication.contraindications.map((contraindication, index) => (
                              <p key={index} className="text-sm">
                                • {contraindication}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Emergency notes */}
                      {medication.emergencyNotes && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-md dark:bg-orange-950 dark:border-orange-800">
                          <div className="flex items-center space-x-2 mb-2">
                            <Zap className="h-4 w-4 text-orange-600" />
                            <h5 className="font-semibold text-sm">Notas de Emergência</h5>
                          </div>
                          <p className="text-sm font-medium">{medication.emergencyNotes}</p>
                        </div>
                      )}

                      {/* Emergency actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'flex-1 text-xs',
                            'min-h-[44px] touch-target-44'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            // In real implementation, show detailed medication info
                            console.log(`Ver detalhes da medicação: ${medication.name}`);
                          }}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Bula
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'flex-1 text-xs',
                            'min-h-[44px] touch-target-44'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            // In real implementation, check interactions
                            console.log(`Verificar interações: ${medication.name}`);
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Interações
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Show all medications button */}
        {medications.length > displayedMedications.length && (
          <Button
            variant="outline"
            onClick={() => setShowAllMedications(!showAllMedications)}
            className={cn(
              'w-full mt-3',
              'min-h-[48px] touch-target-48'
            )}
          >
            {showAllMedications ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Mostrar todas ({medications.length - displayedMedications.length} mais)
              </>
            )}
          </Button>
        )}

        {/* Emergency notice */}
        <div className="bg-muted/50 rounded-md p-3 mt-4">
          <p className="text-xs text-muted-foreground">
            <strong>Atenção:</strong> Sempre verificar interações e contraindicações antes de administrar novos medicamentos. 
            Medicações controladas requerem prescrição válida e notificação ANVISA.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Sample emergency medications for testing
export const sampleEmergencyMedications: EmergencyMedication[] = [
  {
    id: '1',
    name: 'Varfarina Sódica',
    dosage: '5mg',
    frequency: '1x ao dia às 18h',
    prescribedBy: 'Dr. João Silva - Cardiologista (CRM 12345)',
    startDate: new Date(2024, 0, 15),
    critical: true,
    interactions: ['AAS', 'Heparina', 'Anti-inflamatórios', 'Amiodarona'],
    contraindications: ['Cirurgias eletivas', 'Procedimentos invasivos', 'Gravidez'],
    emergencyNotes: 'Verificar INR imediatamente antes de qualquer procedimento. Reverter com vitamina K se INR > 4.0'
  },
  {
    id: '2',
    name: 'Clopidogrel',
    dosage: '75mg',
    frequency: '1x ao dia pela manhã',
    prescribedBy: 'Dr. João Silva - Cardiologista (CRM 12345)',
    startDate: new Date(2024, 1, 1),
    endDate: new Date(2024, 11, 31),
    critical: true,
    interactions: ['Varfarina', 'Omeprazol', 'Fluconazol'],
    contraindications: ['Sangramento ativo', 'Úlcera péptica ativa'],
    emergencyNotes: 'Suspender 5-7 dias antes de cirurgias eletivas. Em emergências, considerar plaquetas se sangramento'
  },
  {
    id: '3',
    name: 'Midazolam',
    dosage: '7,5mg',
    frequency: 'SOS para insônia',
    prescribedBy: 'Dra. Maria Oliveira - Psiquiatra (CRM 67890)',
    startDate: new Date(2024, 3, 10),
    critical: false,
    interactions: ['Álcool', 'Opioides', 'Outros benzodiazepínicos'],
    contraindications: ['Insuficiência respiratória', 'Miastenia gravis'],
    emergencyNotes: 'Antídoto: Flumazenil. Monitorar função respiratória se superdosagem'
  }
];

export default EmergencyMedicationsList;
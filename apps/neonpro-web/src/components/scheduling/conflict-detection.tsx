/**
 * Conflict Detection Component
 * Story 2.2: Intelligent conflict detection and resolution
 * 
 * React component for real-time conflict detection in appointment scheduling
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw, Calendar, Users, MapPin } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Types matching our backend service
interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: SchedulingConflict[];
  resolutionOptions: ResolutionOption[];
  processingTimeMs: number;
}

interface SchedulingConflict {
  id: string;
  type: 'time' | 'staff' | 'room' | 'equipment' | 'business_rules' | 'priority';
  severity: 'low' | 'medium' | 'high' | 'critical';
  resourceId?: string;
  resourceType?: 'room' | 'equipment' | 'service' | 'staff';
  conflictDescription: string;
  affectedAppointments: string[];
  suggestedActions: string[];
}

interface ResolutionOption {
  id: string;
  type: 'reschedule' | 'reassign' | 'waitlist' | 'split' | 'escalate';
  confidence: number;
  description: string;
  impact: 'minimal' | 'low' | 'medium' | 'high' | 'significant';
  alternativeSlots?: any[];
  resourceAlternatives?: any[];
  estimatedResolutionTime: number;
}

interface ConflictDetectionProps {
  appointmentStart: Date;
  appointmentEnd: Date;
  professionalId: string;
  treatmentType: string;
  roomId?: string;
  equipmentIds?: string[];
  onConflictDetected?: (result: ConflictDetectionResult) => void;
  onResolutionSelected?: (option: ResolutionOption) => void;
  autoDetect?: boolean;
}

export default function ConflictDetection({
  appointmentStart,
  appointmentEnd,
  professionalId,
  treatmentType,
  roomId,
  equipmentIds,
  onConflictDetected,
  onResolutionSelected,
  autoDetect = true
}: ConflictDetectionProps) {
  const [detectionResult, setDetectionResult] = useState<ConflictDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<ResolutionOption | null>(null);
  
  const supabase = createClientComponentClient();

  // Auto-detect conflicts when props change
  useEffect(() => {
    if (autoDetect && appointmentStart && appointmentEnd && professionalId && treatmentType) {
      detectConflicts();
    }
  }, [appointmentStart, appointmentEnd, professionalId, treatmentType, roomId, equipmentIds, autoDetect]);

  const detectConflicts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scheduling/conflicts/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentStart: appointmentStart.toISOString(),
          appointmentEnd: appointmentEnd.toISOString(),
          professionalId,
          treatmentType,
          roomId,
          equipmentIds
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to detect conflicts');
      }

      const result = await response.json();
      setDetectionResult(result.data);
      
      if (onConflictDetected) {
        onConflictDetected(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolutionSelect = (option: ResolutionOption) => {
    setSelectedResolution(option);
    if (onResolutionSelected) {
      onResolutionSelected(option);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'time': return <Clock className="w-4 h-4" />;
      case 'staff': return <Users className="w-4 h-4" />;
      case 'room': return <MapPin className="w-4 h-4" />;
      case 'equipment': return <AlertTriangle className="w-4 h-4" />;
      case 'business_rules': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'minimal': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'significant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Conflict Detection Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : detectionResult?.hasConflicts ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : detectionResult && !detectionResult.hasConflicts ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-gray-500" />
                )}
                Conflict Detection
              </CardTitle>
              <CardDescription>
                {isLoading 
                  ? 'Analyzing potential scheduling conflicts...'
                  : detectionResult?.hasConflicts 
                    ? `Found ${detectionResult.conflicts.length} conflict(s) that require attention`
                    : detectionResult && !detectionResult.hasConflicts
                      ? 'No conflicts detected - appointment can be scheduled'
                      : 'Check for scheduling conflicts before confirming appointment'
                }
              </CardDescription>
            </div>
            <Button 
              onClick={detectConflicts} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Re-check
            </Button>
          </div>
        </CardHeader>
        
        {detectionResult && (
          <CardFooter>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Processing time: {detectionResult.processingTimeMs}ms</span>
              <Separator orientation="vertical" className="h-4" />
              <span>
                {detectionResult.conflicts.length} conflict{detectionResult.conflicts.length !== 1 ? 's' : ''} found
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span>
                {detectionResult.resolutionOptions.length} resolution option{detectionResult.resolutionOptions.length !== 1 ? 's' : ''} available
              </span>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Conflicts List */}
      {detectionResult?.hasConflicts && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Detected Conflicts</CardTitle>
            <CardDescription>
              The following conflicts need to be resolved before scheduling this appointment:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detectionResult.conflicts.map((conflict) => (
                <div key={conflict.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getConflictTypeIcon(conflict.type)}
                      <span className="font-medium capitalize">{conflict.type} Conflict</span>
                    </div>
                    <Badge className={getSeverityColor(conflict.severity)}>
                      {conflict.severity}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{conflict.conflictDescription}</p>
                  
                  {conflict.suggestedActions.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Suggested actions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {conflict.suggestedActions.map((action, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {action.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolution Options */}
      {detectionResult?.resolutionOptions && detectionResult.resolutionOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Resolution Options</CardTitle>
            <CardDescription>
              Choose from the following AI-recommended solutions:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detectionResult.resolutionOptions.map((option) => (
                <div 
                  key={option.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedResolution?.id === option.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleResolutionSelect(option)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium capitalize">{option.type} Solution</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {Math.round(option.confidence * 100)}% confidence
                        </Badge>
                        <Badge className={getImpactColor(option.impact)}>
                          {option.impact} impact
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      ~{Math.round(option.estimatedResolutionTime / 60)}min to resolve
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  
                  {option.alternativeSlots && option.alternativeSlots.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Alternative times available:</span>
                      <span className="text-gray-600 ml-1">
                        {option.alternativeSlots.length} option{option.alternativeSlots.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  {option.resourceAlternatives && option.resourceAlternatives.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Alternative resources available:</span>
                      <span className="text-gray-600 ml-1">
                        {option.resourceAlternatives.length} option{option.resourceAlternatives.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          
          {selectedResolution && (
            <CardFooter>
              <Button 
                onClick={() => handleResolutionSelect(selectedResolution)}
                className="w-full"
              >
                Apply {selectedResolution.type} Solution
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Success State */}
      {detectionResult && !detectionResult.hasConflicts && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">
                No Conflicts Detected
              </h3>
              <p className="text-sm text-gray-600">
                This appointment can be scheduled without any conflicts. All resources are available and business rules are satisfied.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
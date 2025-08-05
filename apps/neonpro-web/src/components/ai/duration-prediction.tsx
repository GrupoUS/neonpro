/**
 * AI Duration Prediction Component
 * 
 * Provides intelligent appointment duration suggestions with confidence indicators
 * and manual override capabilities. Integrates with A/B testing framework.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Brain, Clock, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface PredictionRequest {
  appointmentId: string;
  treatmentType: string;
  professionalId: string;
  patientAge?: number;
  isFirstVisit: boolean;
  patientAnxietyLevel?: 'low' | 'medium' | 'high';
  treatmentComplexity?: 'simple' | 'standard' | 'complex';
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  dayOfWeek: number;
  historicalDuration?: number;
  specialRequirements?: string[];
}

interface PredictionResponse {
  success: boolean;
  prediction?: {
    predictedDuration: number;
    confidenceScore: number;
    modelVersion: string;
    uncertaintyRange: {
      min: number;
      max: number;
    };
    isAIPrediction: boolean;
    testGroup: 'control' | 'ai_prediction';
  };
  fallbackDuration?: number;
  error?: string;
}

interface AIDurationPredictionProps {
  appointmentId: string;
  treatmentType: string;
  professionalId: string;
  patientAge?: number;
  isFirstVisit?: boolean;
  historicalDuration?: number;
  onDurationSelected: (duration: number, isAI: boolean) => void;
  onOverride?: (reason: string) => void;
  className?: string;
}

export default function AIDurationPrediction({
  appointmentId,
  treatmentType,
  professionalId,
  patientAge,
  isFirstVisit = false,
  historicalDuration,
  onDurationSelected,
  onOverride,
  className = ''
}: AIDurationPredictionProps) {
  // State
  const [prediction, setPrediction] = useState<PredictionResponse['prediction'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualDuration, setManualDuration] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState('');
  const [useManualOverride, setUseManualOverride] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Advanced options state
  const [anxietyLevel, setAnxietyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [treatmentComplexity, setTreatmentComplexity] = useState<'simple' | 'standard' | 'complex'>('standard');
  const [specialRequirements, setSpecialRequirements] = useState<string>('');

  // Get current time info
  const now = new Date();
  const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
  const dayOfWeek = now.getDay();

  // Generate prediction on component mount and when key props change
  useEffect(() => {
    if (appointmentId && treatmentType && professionalId) {
      generatePrediction();
    }
  }, [appointmentId, treatmentType, professionalId, patientAge, isFirstVisit, historicalDuration]);

  /**
   * Generate AI duration prediction
   */
  const generatePrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestData: PredictionRequest = {
        appointmentId,
        treatmentType,
        professionalId,
        patientAge,
        isFirstVisit,
        patientAnxietyLevel: anxietyLevel,
        treatmentComplexity,
        timeOfDay: timeOfDay as 'morning' | 'afternoon' | 'evening',
        dayOfWeek,
        historicalDuration,
        specialRequirements: specialRequirements ? specialRequirements.split(',').map(s => s.trim()) : []
      };

      const response = await fetch('/api/ai/predict-duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data: PredictionResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate prediction');
      }

      setPrediction(data.prediction || null);
      
      if (data.prediction) {
        setManualDuration(data.prediction.predictedDuration);
        
        // Auto-select AI prediction if confidence is high enough
        if (data.prediction.confidenceScore >= 0.8 && !useManualOverride) {
          onDurationSelected(data.prediction.predictedDuration, data.prediction.isAIPrediction);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('Prediction failed', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle duration selection
   */
  const handleDurationSelect = () => {
    const selectedDuration = useManualOverride ? manualDuration : prediction?.predictedDuration || 30;
    const isAI = !useManualOverride && prediction?.isAIPrediction;
    
    onDurationSelected(selectedDuration, isAI || false);
    
    if (useManualOverride && overrideReason && onOverride) {
      onOverride(overrideReason);
    }
    
    toast.success('Duration selected', {
      description: `${selectedDuration} minutes ${isAI ? '(AI prediction)' : '(manual)'}`
    });
  };

  /**
   * Get confidence badge variant
   */
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' };
    if (confidence >= 0.6) return { variant: 'secondary' as const, icon: Info, color: 'text-blue-600' };
    return { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-orange-600' };
  };

  /**
   * Format confidence percentage
   */
  const formatConfidence = (confidence: number) => `${Math.round(confidence * 100)}%`;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Duration Prediction
        </CardTitle>
        <CardDescription>
          Intelligent appointment duration estimation with confidence scoring
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Generating prediction...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Prediction results */}
        {prediction && !loading && (
          <div className="space-y-4">
            {/* Main prediction display */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {prediction.predictedDuration} minutes
                  </div>
                  <div className="text-sm text-blue-700">
                    Range: {prediction.uncertaintyRange.min}-{prediction.uncertaintyRange.max} min
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {(() => {
                  const { variant, icon: Icon, color } = getConfidenceBadge(prediction.confidenceScore);
                  return (
                    <Badge variant={variant} className="flex items-center gap-1">
                      <Icon className={`h-3 w-3 ${color}`} />
                      {formatConfidence(prediction.confidenceScore)} confidence
                    </Badge>
                  );
                })()}
                <div className="text-xs text-gray-500 mt-1">
                  {prediction.isAIPrediction ? 'AI Model' : 'Baseline'} • {prediction.testGroup}
                </div>
              </div>
            </div>

            {/* Test group info */}
            {prediction.testGroup === 'ai_prediction' && (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  You're part of our AI prediction testing group. This helps us improve our models!
                </AlertDescription>
              </Alert>
            )}

            {/* Manual override option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="manual-override"
                  checked={useManualOverride}
                  onCheckedChange={setUseManualOverride}
                />
                <Label htmlFor="manual-override" className="text-sm font-medium">
                  Manual override
                </Label>
              </div>

              {useManualOverride && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="manual-duration" className="text-sm font-medium">
                      Custom duration (minutes)
                    </Label>
                    <Input
                      id="manual-duration"
                      type="number"
                      min="5"
                      max="300"
                      value={manualDuration}
                      onChange={(e) => setManualDuration(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="override-reason" className="text-sm font-medium">
                      Reason for override
                    </Label>
                    <Textarea
                      id="override-reason"
                      placeholder="Why are you overriding the AI prediction?"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Advanced options */}
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full"
              >
                {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
              </Button>

              {showAdvancedOptions && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="anxiety-level" className="text-sm font-medium">
                        Patient Anxiety Level
                      </Label>
                      <Select value={anxietyLevel} onValueChange={(value: 'low' | 'medium' | 'high') => setAnxietyLevel(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="treatment-complexity" className="text-sm font-medium">
                        Treatment Complexity
                      </Label>
                      <Select value={treatmentComplexity} onValueChange={(value: 'simple' | 'standard' | 'complex') => setTreatmentComplexity(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="complex">Complex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="special-requirements" className="text-sm font-medium">
                      Special Requirements (comma-separated)
                    </Label>
                    <Input
                      id="special-requirements"
                      placeholder="e.g., extensive_buildup, wheelchair_access"
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generatePrediction}
                    disabled={loading}
                    className="w-full"
                  >
                    Regenerate Prediction
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleDurationSelect}
          disabled={loading || !prediction || (useManualOverride && manualDuration <= 0)}
          className="w-full"
        >
          {loading ? 'Generating...' : `Select ${useManualOverride ? manualDuration : prediction?.predictedDuration || 0} minutes`}
        </Button>
      </CardFooter>
    </Card>
  );
}

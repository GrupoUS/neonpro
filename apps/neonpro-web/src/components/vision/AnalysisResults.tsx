'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Clock, 
  TrendingUp, 
  Target, 
  Download, 
  Share2,
  ZoomIn,
  BarChart3,
  Activity
} from 'lucide-react';
import { AnalysisResult, ChangeMetrics, AnnotationData } from '@/lib/vision/analysis-engine';
import { cn } from '@/lib/utils';

interface AnalysisResultsProps {
  analysisResult: AnalysisResult;
  onExport?: () => void;
  onShare?: () => void;
  className?: string;
}

export function AnalysisResults({ 
  analysisResult, 
  onExport, 
  onShare, 
  className 
}: AnalysisResultsProps) {
  const [selectedAnnotation, setSelectedAnnotation] = useState<AnnotationData | null>(null);
  const [imageComparison, setImageComparison] = useState<'before' | 'after' | 'split'>('split');

  const formatProcessingTime = (timeMs: number): string => {
    if (timeMs < 1000) return `${timeMs}ms`;
    return `${(timeMs / 1000).toFixed(1)}s`;
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 0.95) return 'text-green-600';
    if (accuracy >= 0.90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImprovementColor = (improvement: number): string => {
    if (improvement >= 30) return 'text-green-600';
    if (improvement >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderMetricCard = (label: string, value: number | undefined, unit: string = '%') => {
    if (value === undefined) return null;
    
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">{label}</span>
          <span className={cn(
            "text-lg font-bold",
            getImprovementColor(value)
          )}>
            {value.toFixed(1)}{unit}
          </span>
        </div>
        <Progress 
          value={Math.min(value, 100)} 
          className="mt-2 h-2" 
        />
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Key Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Análise de Visão Computacional
            </CardTitle>
            <div className="flex gap-2">
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Accuracy Score */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Precisão</p>
                <p className={cn(
                  "text-xl font-bold",
                  getAccuracyColor(analysisResult.accuracyScore)
                )}>
                  {(analysisResult.accuracyScore * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Processing Time */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tempo de Processamento</p>
                <p className="text-xl font-bold">
                  {formatProcessingTime(analysisResult.processingTime)}
                </p>
              </div>
            </div>

            {/* Overall Improvement */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Melhoria Geral</p>
                <p className={cn(
                  "text-xl font-bold",
                  getImprovementColor(analysisResult.improvementPercentage)
                )}>
                  {analysisResult.improvementPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Confiança</p>
                <p className="text-xl font-bold">
                  {(analysisResult.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 mt-4">
            <Badge 
              variant={analysisResult.accuracyScore >= 0.95 ? "default" : "destructive"}
            >
              {analysisResult.accuracyScore >= 0.95 ? "✓ Precisão Atingida" : "⚠ Precisão Baixa"}
            </Badge>
            <Badge 
              variant={analysisResult.processingTime <= 30000 ? "default" : "destructive"}
            >
              {analysisResult.processingTime <= 30000 ? "✓ Tempo Otimizado" : "⚠ Processamento Lento"}
            </Badge>
            <Badge variant="outline">
              {analysisResult.annotations.length} Anotações
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="annotations">Anotações</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Métricas de Mudança Detalhadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderMetricCard(
                  "Textura da Pele", 
                  analysisResult.changeMetrics.skinTexture
                )}
                {renderMetricCard(
                  "Redução de Rugas", 
                  analysisResult.changeMetrics.wrinkleReduction
                )}
                {renderMetricCard(
                  "Melhoria de Pigmentação", 
                  analysisResult.changeMetrics.pigmentationImprovement
                )}
                {renderMetricCard(
                  "Cicatrização de Lesões", 
                  analysisResult.changeMetrics.lesionHealing
                )}
                {renderMetricCard(
                  "Redução de Cicatrizes", 
                  analysisResult.changeMetrics.scarReduction
                )}
                {renderMetricCard(
                  "Mudança de Volume", 
                  analysisResult.changeMetrics.volumeChange
                )}
                {renderMetricCard(
                  "Melhoria de Simetria", 
                  analysisResult.changeMetrics.symmetryImprovement
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Imagens</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant={imageComparison === 'before' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImageComparison('before')}
                >
                  Antes
                </Button>
                <Button 
                  variant={imageComparison === 'after' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImageComparison('after')}
                >
                  Depois
                </Button>
                <Button 
                  variant={imageComparison === 'split' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImageComparison('split')}
                >
                  Dividido
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                {imageComparison === 'split' && (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">Antes</p>
                      <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                        <span className="text-gray-500">Imagem Antes</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">Depois</p>
                      <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                        <span className="text-gray-500">Imagem Depois</span>
                      </div>
                    </div>
                  </div>
                )}
                {imageComparison !== 'split' && (
                  <div className="text-center w-full">
                    <p className="text-sm font-medium mb-2">
                      {imageComparison === 'before' ? 'Antes' : 'Depois'}
                    </p>
                    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mx-auto max-w-md">
                      <span className="text-gray-500">
                        Imagem {imageComparison === 'before' ? 'Antes' : 'Depois'}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Zoom Control */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-4 right-4"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annotations Tab */}
        <TabsContent value="annotations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anotações e Medições</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.annotations.map((annotation) => (
                  <div 
                    key={annotation.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-colors",
                      selectedAnnotation?.id === annotation.id 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setSelectedAnnotation(annotation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {annotation.type === 'measurement' && 'Medição'}
                          {annotation.type === 'highlight' && 'Destaque'}
                          {annotation.type === 'comparison' && 'Comparação'}
                          {annotation.type === 'annotation' && 'Anotação'}
                        </Badge>
                        <span className="font-medium">{annotation.description}</span>
                      </div>
                      <div className="text-right">
                        {annotation.value && (
                          <span className="text-lg font-bold">
                            {annotation.value.toFixed(1)}{annotation.unit}
                          </span>
                        )}
                        <p className="text-xs text-gray-500">
                          Confiança: {(annotation.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline de Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Análise Concluída</p>
                    <p className="text-sm text-gray-600">
                      {analysisResult.analysisDate.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Processamento Iniciado</p>
                    <p className="text-sm text-gray-600">
                      Duração: {formatProcessingTime(analysisResult.processingTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="font-medium">Imagens Carregadas</p>
                    <p className="text-sm text-gray-600">
                      Antes e depois processadas com sucesso
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AnalysisResults;

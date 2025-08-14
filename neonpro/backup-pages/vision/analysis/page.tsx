'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Eye, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Target,
  TrendingUp,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { AnalysisResults } from '@/components/vision/AnalysisResults';
import { useVisionAnalysis, useAnalysisPerformance } from '@/hooks/useVisionAnalysis';
import { cn } from '@/lib/utils';

interface ImageUpload {
  file: File | null;
  preview: string | null;
  url: string | null;
}

export default function VisionAnalysisPage() {
  const {
    isAnalyzing,
    currentAnalysis,
    analysisHistory,
    error,
    progress,
    startAnalysis,
    loadAnalysisHistory,
    clearCurrentAnalysis,
    clearError,
    exportAnalysis,
    shareAnalysis
  } = useVisionAnalysis();

  const { performanceData, updatePerformanceMetrics } = useAnalysisPerformance();

  const [beforeImage, setBeforeImage] = useState<ImageUpload>({
    file: null,
    preview: null,
    url: null
  });
  
  const [afterImage, setAfterImage] = useState<ImageUpload>({
    file: null,
    preview: null,
    url: null
  });
  
  const [patientId, setPatientId] = useState('');
  const [treatmentType, setTreatmentType] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  /**
   * Handle image file upload
   */
  const handleImageUpload = useCallback((file: File, type: 'before' | 'after') => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Arquivo muito grande. Limite de 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      const imageData = {
        file,
        preview,
        url: preview // In production, this would be uploaded to storage
      };

      if (type === 'before') {
        setBeforeImage(imageData);
      } else {
        setAfterImage(imageData);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  /**
   * Start computer vision analysis
   */
  const handleStartAnalysis = useCallback(async () => {
    if (!beforeImage.url || !afterImage.url) {
      toast.error('Por favor, carregue as imagens antes e depois');
      return;
    }

    if (!patientId.trim()) {
      toast.error('Por favor, informe o ID do paciente');
      return;
    }

    if (!treatmentType) {
      toast.error('Por favor, selecione o tipo de tratamento');
      return;
    }

    try {
      const result = await startAnalysis(
        beforeImage.url,
        afterImage.url,
        patientId.trim(),
        treatmentType
      );

      if (result) {
        updatePerformanceMetrics(result);
        setActiveTab('results');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  }, [beforeImage.url, afterImage.url, patientId, treatmentType, startAnalysis, updatePerformanceMetrics]);

  /**
   * Reset form and clear analysis
   */
  const handleReset = useCallback(() => {
    setBeforeImage({ file: null, preview: null, url: null });
    setAfterImage({ file: null, preview: null, url: null });
    setPatientId('');
    setTreatmentType('');
    clearCurrentAnalysis();
    clearError();
    setActiveTab('upload');
  }, [clearCurrentAnalysis, clearError]);

  /**
   * Load patient history
   */
  const handleLoadHistory = useCallback(async () => {
    if (!patientId.trim()) {
      toast.error('Por favor, informe o ID do paciente');
      return;
    }

    await loadAnalysisHistory(patientId.trim());
    setActiveTab('history');
  }, [patientId, loadAnalysisHistory]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Análise de Visão Computacional</h1>
            <p className="text-gray-600">
              Análise automatizada antes/depois com ≥95% de precisão e processamento &lt;30s
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Precisão Média</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {(performanceData.averageAccuracy * 100).toFixed(1)}%
            </p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Tempo Médio</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {(performanceData.averageProcessingTime / 1000).toFixed(1)}s
            </p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Taxa de Sucesso</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {(performanceData.successRate * 100).toFixed(1)}%
            </p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Total de Análises</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {performanceData.totalAnalyses}
            </p>
          </Card>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="ml-2 h-auto p-1 text-red-600 hover:text-red-800"
            >
              Fechar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload & Análise</TabsTrigger>
          <TabsTrigger value="results" disabled={!currentAnalysis}>
            Resultados
          </TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Upload & Analysis Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Paciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="patientId">ID do Paciente</Label>
                  <Input
                    id="patientId"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="Digite o ID do paciente"
                    disabled={isAnalyzing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="treatmentType">Tipo de Tratamento</Label>
                  <Select value={treatmentType} onValueChange={setTreatmentType} disabled={isAnalyzing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de tratamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skin-aesthetic">Estético - Pele</SelectItem>
                      <SelectItem value="medical-healing">Médico - Cicatrização</SelectItem>
                      <SelectItem value="body-contouring">Contorno Corporal</SelectItem>
                      <SelectItem value="facial-rejuvenation">Rejuvenescimento Facial</SelectItem>
                      <SelectItem value="scar-treatment">Tratamento de Cicatrizes</SelectItem>
                      <SelectItem value="pigmentation">Tratamento de Pigmentação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleLoadHistory}
                    variant="outline"
                    disabled={isAnalyzing || !patientId.trim()}
                    className="flex-1"
                  >
                    <History className="h-4 w-4 mr-2" />
                    Carregar Histórico
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Controles de Análise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing || !beforeImage.url || !afterImage.url || !patientId.trim() || !treatmentType}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isAnalyzing ? 'Analisando...' : 'Iniciar Análise'}
                  </Button>
                  
                  <Button 
                    onClick={handleReset}
                    variant="outline"
                    disabled={isAnalyzing}
                  >
                    Limpar
                  </Button>
                </div>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso da Análise</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <p className="text-xs text-gray-600">
                      Processando imagens com visão computacional...
                    </p>
                  </div>
                )}

                {/* Requirements Status */}
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium text-sm">Status dos Requisitos</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        currentAnalysis?.accuracyScore && currentAnalysis.accuracyScore >= 0.95 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                      )} />
                      <span>Precisão ≥95%</span>
                      {currentAnalysis?.accuracyScore && (
                        <span className="ml-auto font-medium">
                          {(currentAnalysis.accuracyScore * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        currentAnalysis?.processingTime && currentAnalysis.processingTime <= 30000 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                      )} />
                      <span>Processamento &lt;30s</span>
                      {currentAnalysis?.processingTime && (
                        <span className="ml-auto font-medium">
                          {(currentAnalysis.processingTime / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Image */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem Antes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('before-upload')?.click()}
                  >
                    {beforeImage.preview ? (
                      <img 
                        src={beforeImage.preview} 
                        alt="Antes" 
                        className="max-w-full max-h-64 mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="py-8">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Clique para carregar imagem antes</p>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG até 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="before-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'before');
                    }}
                    disabled={isAnalyzing}
                  />
                  {beforeImage.file && (
                    <p className="text-xs text-gray-600">
                      {beforeImage.file.name} ({(beforeImage.file.size / 1024 / 1024).toFixed(1)}MB)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* After Image */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem Depois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('after-upload')?.click()}
                  >
                    {afterImage.preview ? (
                      <img 
                        src={afterImage.preview} 
                        alt="Depois" 
                        className="max-w-full max-h-64 mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="py-8">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Clique para carregar imagem depois</p>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG até 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="after-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'after');
                    }}
                    disabled={isAnalyzing}
                  />
                  {afterImage.file && (
                    <p className="text-xs text-gray-600">
                      {afterImage.file.name} ({(afterImage.file.size / 1024 / 1024).toFixed(1)}MB)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          {currentAnalysis ? (
            <AnalysisResults 
              analysisResult={currentAnalysis}
              onExport={() => exportAnalysis(currentAnalysis.id)}
              onShare={() => shareAnalysis(currentAnalysis.id)}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma análise disponível</p>
                <p className="text-sm text-gray-500">Execute uma análise para ver os resultados</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Análises</CardTitle>
            </CardHeader>
            <CardContent>
              {analysisHistory.length > 0 ? (
                <div className="space-y-4">
                  {analysisHistory.map((analysis) => (
                    <div 
                      key={analysis.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        // Set as current analysis and switch to results tab
                        // In a real implementation, you'd have a setCurrentAnalysis function
                        setActiveTab('results');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Análise {analysis.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {analysis.analysisDate.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {(analysis.accuracyScore * 100).toFixed(1)}% precisão
                          </p>
                          <p className="text-sm text-gray-600">
                            {analysis.improvementPercentage.toFixed(1)}% melhoria
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum histórico encontrado</p>
                  <p className="text-sm text-gray-500">
                    {patientId ? 'Nenhuma análise anterior para este paciente' : 'Informe um ID de paciente para carregar o histórico'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisResults = AnalysisResults;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function AnalysisResults(_a) {
    var analysisResult = _a.analysisResult, onExport = _a.onExport, onShare = _a.onShare, className = _a.className;
    var _b = (0, react_1.useState)(null), selectedAnnotation = _b[0], setSelectedAnnotation = _b[1];
    var _c = (0, react_1.useState)('split'), imageComparison = _c[0], setImageComparison = _c[1];
    var formatProcessingTime = function (timeMs) {
        if (timeMs < 1000)
            return "".concat(timeMs, "ms");
        return "".concat((timeMs / 1000).toFixed(1), "s");
    };
    var getAccuracyColor = function (accuracy) {
        if (accuracy >= 0.95)
            return 'text-green-600';
        if (accuracy >= 0.90)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    var getImprovementColor = function (improvement) {
        if (improvement >= 30)
            return 'text-green-600';
        if (improvement >= 15)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    var renderMetricCard = function (label, value, unit) {
        if (unit === void 0) { unit = '%'; }
        if (value === undefined)
            return null;
        return (<card_1.Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">{label}</span>
          <span className={(0, utils_1.cn)("text-lg font-bold", getImprovementColor(value))}>
            {value.toFixed(1)}{unit}
          </span>
        </div>
        <progress_1.Progress value={Math.min(value, 100)} className="mt-2 h-2"/>
      </card_1.Card>);
    };
    return (<div className={(0, utils_1.cn)("space-y-6", className)}>
      {/* Header with Key Metrics */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Eye className="h-5 w-5"/>
              Análise de Visão Computacional
            </card_1.CardTitle>
            <div className="flex gap-2">
              {onExport && (<button_1.Button variant="outline" size="sm" onClick={onExport}>
                  <lucide_react_1.Download className="h-4 w-4 mr-2"/>
                  Exportar
                </button_1.Button>)}
              {onShare && (<button_1.Button variant="outline" size="sm" onClick={onShare}>
                  <lucide_react_1.Share2 className="h-4 w-4 mr-2"/>
                  Compartilhar
                </button_1.Button>)}
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Accuracy Score */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <lucide_react_1.Target className="h-5 w-5 text-blue-600"/>
              </div>
              <div>
                <p className="text-sm text-gray-600">Precisão</p>
                <p className={(0, utils_1.cn)("text-xl font-bold", getAccuracyColor(analysisResult.accuracyScore))}>
                  {(analysisResult.accuracyScore * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Processing Time */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <lucide_react_1.Clock className="h-5 w-5 text-green-600"/>
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
                <lucide_react_1.TrendingUp className="h-5 w-5 text-purple-600"/>
              </div>
              <div>
                <p className="text-sm text-gray-600">Melhoria Geral</p>
                <p className={(0, utils_1.cn)("text-xl font-bold", getImprovementColor(analysisResult.improvementPercentage))}>
                  {analysisResult.improvementPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <lucide_react_1.Activity className="h-5 w-5 text-orange-600"/>
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
            <badge_1.Badge variant={analysisResult.accuracyScore >= 0.95 ? "default" : "destructive"}>
              {analysisResult.accuracyScore >= 0.95 ? "✓ Precisão Atingida" : "⚠ Precisão Baixa"}
            </badge_1.Badge>
            <badge_1.Badge variant={analysisResult.processingTime <= 30000 ? "default" : "destructive"}>
              {analysisResult.processingTime <= 30000 ? "✓ Tempo Otimizado" : "⚠ Processamento Lento"}
            </badge_1.Badge>
            <badge_1.Badge variant="outline">
              {analysisResult.annotations.length} Anotações
            </badge_1.Badge>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Detailed Analysis Tabs */}
      <tabs_1.Tabs defaultValue="metrics" className="w-full">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="metrics">Métricas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="comparison">Comparação</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="annotations">Anotações</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="timeline">Timeline</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Metrics Tab */}
        <tabs_1.TabsContent value="metrics" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.BarChart3 className="h-5 w-5"/>
                Métricas de Mudança Detalhadas
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderMetricCard("Textura da Pele", analysisResult.changeMetrics.skinTexture)}
                {renderMetricCard("Redução de Rugas", analysisResult.changeMetrics.wrinkleReduction)}
                {renderMetricCard("Melhoria de Pigmentação", analysisResult.changeMetrics.pigmentationImprovement)}
                {renderMetricCard("Cicatrização de Lesões", analysisResult.changeMetrics.lesionHealing)}
                {renderMetricCard("Redução de Cicatrizes", analysisResult.changeMetrics.scarReduction)}
                {renderMetricCard("Mudança de Volume", analysisResult.changeMetrics.volumeChange)}
                {renderMetricCard("Melhoria de Simetria", analysisResult.changeMetrics.symmetryImprovement)}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Image Comparison Tab */}
        <tabs_1.TabsContent value="comparison" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Comparação de Imagens</card_1.CardTitle>
              <div className="flex gap-2">
                <button_1.Button variant={imageComparison === 'before' ? 'default' : 'outline'} size="sm" onClick={function () { return setImageComparison('before'); }}>
                  Antes
                </button_1.Button>
                <button_1.Button variant={imageComparison === 'after' ? 'default' : 'outline'} size="sm" onClick={function () { return setImageComparison('after'); }}>
                  Depois
                </button_1.Button>
                <button_1.Button variant={imageComparison === 'split' ? 'default' : 'outline'} size="sm" onClick={function () { return setImageComparison('split'); }}>
                  Dividido
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="relative bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                {imageComparison === 'split' && (<div className="grid grid-cols-2 gap-4 w-full">
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
                  </div>)}
                {imageComparison !== 'split' && (<div className="text-center w-full">
                    <p className="text-sm font-medium mb-2">
                      {imageComparison === 'before' ? 'Antes' : 'Depois'}
                    </p>
                    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mx-auto max-w-md">
                      <span className="text-gray-500">
                        Imagem {imageComparison === 'before' ? 'Antes' : 'Depois'}
                      </span>
                    </div>
                  </div>)}
                
                {/* Zoom Control */}
                <button_1.Button variant="outline" size="sm" className="absolute top-4 right-4">
                  <lucide_react_1.ZoomIn className="h-4 w-4"/>
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Annotations Tab */}
        <tabs_1.TabsContent value="annotations" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Anotações e Medições</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {analysisResult.annotations.map(function (annotation) { return (<div key={annotation.id} className={(0, utils_1.cn)("p-3 border rounded-lg cursor-pointer transition-colors", (selectedAnnotation === null || selectedAnnotation === void 0 ? void 0 : selectedAnnotation.id) === annotation.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300")} onClick={function () { return setSelectedAnnotation(annotation); }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <badge_1.Badge variant="outline">
                          {annotation.type === 'measurement' && 'Medição'}
                          {annotation.type === 'highlight' && 'Destaque'}
                          {annotation.type === 'comparison' && 'Comparação'}
                          {annotation.type === 'annotation' && 'Anotação'}
                        </badge_1.Badge>
                        <span className="font-medium">{annotation.description}</span>
                      </div>
                      <div className="text-right">
                        {annotation.value && (<span className="text-lg font-bold">
                            {annotation.value.toFixed(1)}{annotation.unit}
                          </span>)}
                        <p className="text-xs text-gray-500">
                          Confiança: {(annotation.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Timeline Tab */}
        <tabs_1.TabsContent value="timeline" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Timeline de Análise</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
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
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
exports.default = AnalysisResults;

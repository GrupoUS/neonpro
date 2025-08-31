"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Table as TableIcon, 
  Download, 
  FileText,
  FileSpreadsheet,
  FileImage,
  Eye,
  Filter,
  Search,
  TrendingUp,
  Calendar,
  Users,
  Activity
} from 'lucide-react';

export interface DataPoint {
  id: string;
  label: string;
  value: number;
  category?: string;
  date?: Date;
  metadata?: Record&lt;string, any&gt;;
}

export interface ChartData {
  title: string;
  data: DataPoint[];
  type: 'bar' | 'line' | 'pie' | 'area';
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface TableData {
  title: string;
  headers: string[];
  rows: (string | number | Date)[][];
  totalRows?: number;
  currentPage?: number;
  pageSize?: number;
}

export interface QueryResult {
  id: string;
  query: string;
  timestamp: Date;
  type: 'chart' | 'table' | 'mixed' | 'text';
  chart?: ChartData;
  table?: TableData;
  textResult?: string;
  confidence: number;
  executionTime: number;
}

export interface ResultsVisualizationProps {
  results: QueryResult[];
  selectedResult?: string;
  onResultSelect?: (resultId: string) => void;
  onExport?: (resultId: string, format: 'pdf' | 'excel' | 'csv' | 'png') => void;
  className?: string;
}

export function ResultsVisualization({
  results,
  selectedResult,
  onResultSelect,
  onExport,
  className
}: ResultsVisualizationProps) {
  const [viewMode, setViewMode] = useState&lt;'grid' | 'detail'&gt;('grid');
  const [filterType, setFilterType] = useState&lt;string&gt;('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and search results
  const filteredResults = useMemo(() => {
    return results
      .filter(result => {
        // Type filter
        if (filterType !== 'all' && result.type !== filterType) return false;
        
        // Search filter
        if (searchTerm && !result.query.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [results, filterType, searchTerm]);

  const currentResult = useMemo(() => {
    if (!selectedResult) return filteredResults[0];
    return results.find(r => r.id === selectedResult) || filteredResults[0];
  }, [selectedResult, results, filteredResults]);

  // Generate sample chart visualization
  const renderChart = (chartData: ChartData) => {
    const maxValue = Math.max(...chartData.data.map(d => d.value));
    
    return (
      &lt;div className="space-y-4"&gt;
        &lt;div className="flex items-center justify-between"&gt;
          &lt;h4 className="font-medium"&gt;{chartData.title}&lt;/h4&gt;
          &lt;div className="flex gap-2"&gt;
            {['bar', 'line', 'pie'].map((type) =&gt; (
              &lt;Button
                key={type}
                variant={chartData.type === type ? 'default' : 'outline'}
                size="sm"
                className="h-8"
              &gt;
                {type === 'bar' && &lt;BarChart3 className="h-3 w-3" /&gt;}
                {type === 'line' && &lt;LineChart className="h-3 w-3" /&gt;}
                {type === 'pie' && &lt;PieChart className="h-3 w-3" /&gt;}
              &lt;/Button&gt;
            ))}
          &lt;/div&gt;
        &lt;/div&gt;

        {/* Simple bar chart visualization */}
        &lt;div className="bg-gray-50 p-4 rounded-lg"&gt;
          &lt;div className="flex items-end justify-between h-40 gap-2"&gt;
            {chartData.data.slice(0, 8).map((point, index) =&gt; (
              &lt;div key={point.id} className="flex flex-col items-center gap-2 flex-1"&gt;
                &lt;div
                  className="bg-blue-500 rounded-t min-w-[20px] transition-all hover:bg-blue-600"
                  style={{
                    height: `${(point.value / maxValue) * 120}px`
                  }}
                  title={`${point.label}: ${point.value}`}
                /&gt;
                &lt;span className="text-xs text-gray-600 text-center truncate w-full"&gt;
                  {point.label}
                &lt;/span&gt;
              &lt;/div&gt;
            ))}
          &lt;/div&gt;
          
          {chartData.yAxisLabel && (
            &lt;div className="mt-2 text-xs text-gray-500 text-center"&gt;
              {chartData.yAxisLabel}
            &lt;/div&gt;
          )}
        &lt;/div&gt;

        {/* Data summary */}
        &lt;div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"&gt;
          &lt;div className="bg-white border rounded p-3"&gt;
            &lt;p className="text-gray-600"&gt;Total de Pontos&lt;/p&gt;
            &lt;p className="font-bold text-lg"&gt;{chartData.data.length}&lt;/p&gt;
          &lt;/div&gt;
          &lt;div className="bg-white border rounded p-3"&gt;
            &lt;p className="text-gray-600"&gt;Valor Máximo&lt;/p&gt;
            &lt;p className="font-bold text-lg"&gt;{maxValue.toLocaleString('pt-BR')}&lt;/p&gt;
          &lt;/div&gt;
          &lt;div className="bg-white border rounded p-3"&gt;
            &lt;p className="text-gray-600"&gt;Valor Mínimo&lt;/p&gt;
            &lt;p className="font-bold text-lg"&gt;
              {Math.min(...chartData.data.map(d => d.value)).toLocaleString('pt-BR')}
            &lt;/p&gt;
          &lt;/div&gt;
          &lt;div className="bg-white border rounded p-3"&gt;
            &lt;p className="text-gray-600"&gt;Média&lt;/p&gt;
            &lt;p className="font-bold text-lg"&gt;
              {Math.round(chartData.data.reduce((acc, d) => acc + d.value, 0) / chartData.data.length).toLocaleString('pt-BR')}
            &lt;/p&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  };

  // Generate table visualization
  const renderTable = (tableData: TableData) => {
    const displayRows = tableData.rows.slice(0, 10); // Show first 10 rows
    
    return (
      &lt;div className="space-y-4"&gt;
        &lt;div className="flex items-center justify-between"&gt;
          &lt;h4 className="font-medium"&gt;{tableData.title}&lt;/h4&gt;
          &lt;Badge variant="secondary"&gt;
            {tableData.totalRows || tableData.rows.length} registros
          &lt;/Badge&gt;
        &lt;/div&gt;

        &lt;div className="border rounded-lg overflow-hidden"&gt;
          &lt;Table&gt;
            &lt;TableHeader&gt;
              &lt;TableRow&gt;
                {tableData.headers.map((header, index) =&gt; (
                  &lt;TableHead key={index} className="font-medium"&gt;
                    {header}
                  &lt;/TableHead&gt;
                ))}
              &lt;/TableRow&gt;
            &lt;/TableHeader&gt;
            &lt;TableBody&gt;
              {displayRows.map((row, rowIndex) =&gt; (
                &lt;TableRow key={rowIndex}&gt;
                  {row.map((cell, cellIndex) =&gt; (
                    &lt;TableCell key={cellIndex}&gt;
                      {cell instanceof Date ? cell.toLocaleDateString('pt-BR') : 
                       typeof cell === 'number' ? cell.toLocaleString('pt-BR') : 
                       String(cell)}
                    &lt;/TableCell&gt;
                  ))}
                &lt;/TableRow&gt;
              ))}
            &lt;/TableBody&gt;
          &lt;/Table&gt;
        &lt;/div&gt;

        {tableData.rows.length > 10 && (
          &lt;div className="text-center text-sm text-gray-500"&gt;
            Mostrando 10 de {tableData.totalRows || tableData.rows.length} registros
          &lt;/div&gt;
        )}
      &lt;/div&gt;
    );
  };

  // Get result type icon
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'chart': return BarChart3;
      case 'table': return TableIcon;
      case 'mixed': return Activity;
      case 'text': return FileText;
      default: return FileText;
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'chart': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'table': return 'bg-green-50 text-green-700 border-green-200';
      case 'mixed': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'text': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    &lt;Card className={cn('w-full', className)}&gt;
      &lt;CardHeader className="pb-4"&gt;
        &lt;div className="flex items-center justify-between"&gt;
          &lt;CardTitle className="flex items-center gap-2"&gt;
            &lt;BarChart3 className="h-5 w-5 text-blue-600" /&gt;
            Visualização de Resultados
          &lt;/CardTitle&gt;
          
          &lt;div className="flex items-center gap-2"&gt;
            &lt;Select value={filterType} onValueChange={setFilterType}&gt;
              &lt;SelectTrigger className="w-32"&gt;
                &lt;SelectValue /&gt;
              &lt;/SelectTrigger&gt;
              &lt;SelectContent&gt;
                &lt;SelectItem value="all"&gt;Todos&lt;/SelectItem&gt;
                &lt;SelectItem value="chart"&gt;Gráficos&lt;/SelectItem&gt;
                &lt;SelectItem value="table"&gt;Tabelas&lt;/SelectItem&gt;
                &lt;SelectItem value="text"&gt;Texto&lt;/SelectItem&gt;
              &lt;/SelectContent&gt;
            &lt;/Select&gt;
            
            &lt;Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() =&gt; setViewMode('grid')}
            &gt;
              Grade
            &lt;/Button&gt;
            
            &lt;Button
              variant={viewMode === 'detail' ? 'default' : 'outline'}
              size="sm"
              onClick={() =&gt; setViewMode('detail')}
            &gt;
              Detalhes
            &lt;/Button&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        {/* Search and Stats */}
        &lt;div className="flex items-center justify-between"&gt;
          &lt;div className="flex items-center gap-2"&gt;
            &lt;div className="relative"&gt;
              &lt;Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /&gt;
              &lt;input
                type="text"
                placeholder="Pesquisar consultas..."
                value={searchTerm}
                onChange={(e) =&gt; setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
              /&gt;
            &lt;/div&gt;
          &lt;/div&gt;
          
          &lt;div className="flex items-center gap-4 text-sm text-gray-600"&gt;
            &lt;span&gt;{filteredResults.length} resultado(s)&lt;/span&gt;
            {currentResult && (
              &lt;&gt;
                &lt;span&gt;•&lt;/span&gt;
                &lt;span&gt;Confiança: {Math.round(currentResult.confidence * 100)}%&lt;/span&gt;
                &lt;span&gt;•&lt;/span&gt;
                &lt;span&gt;Tempo: {currentResult.executionTime}ms&lt;/span&gt;
              &lt;/&gt;
            )}
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/CardHeader&gt;

      &lt;CardContent&gt;
        {filteredResults.length === 0 ? (
          &lt;div className="text-center py-12 text-gray-500"&gt;
            &lt;BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" /&gt;
            &lt;p className="text-lg font-medium"&gt;Nenhum resultado encontrado&lt;/p&gt;
            &lt;p className="text-sm mt-1"&gt;
              {searchTerm ? 'Tente ajustar os filtros ou termo de busca' : 'Execute uma consulta para ver os resultados aqui'}
            &lt;/p&gt;
          &lt;/div&gt;
        ) : viewMode === 'grid' ? (
          // Grid View
          &lt;div className="grid grid-cols-1 lg:grid-cols-2 gap-4"&gt;
            {filteredResults.map((result) =&gt; {
              const IconComponent = getResultIcon(result.type);
              
              return (
                &lt;Card 
                  key={result.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    selectedResult === result.id && 'ring-2 ring-blue-500'
                  )}
                  onClick={() =&gt; onResultSelect?.(result.id)}
                &gt;
                  &lt;CardHeader className="pb-3"&gt;
                    &lt;div className="flex items-start justify-between"&gt;
                      &lt;div className="flex-1 min-w-0"&gt;
                        &lt;p className="text-sm font-medium text-blue-900 truncate"&gt;
                          {result.query}
                        &lt;/p&gt;
                        &lt;p className="text-xs text-gray-500 mt-1"&gt;
                          {result.timestamp.toLocaleString('pt-BR')}
                        &lt;/p&gt;
                      &lt;/div&gt;
                      
                      &lt;div className="flex items-center gap-2 ml-2"&gt;
                        &lt;Badge 
                          variant="outline" 
                          className={cn('text-xs', getResultTypeColor(result.type))}
                        &gt;
                          &lt;IconComponent className="h-3 w-3 mr-1" /&gt;
                          {result.type.toUpperCase()}
                        &lt;/Badge&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;
                  &lt;/CardHeader&gt;

                  &lt;CardContent className="pt-0"&gt;
                    {result.type === 'text' && result.textResult && (
                      &lt;p className="text-sm text-gray-700 line-clamp-3"&gt;
                        {result.textResult}
                      &lt;/p&gt;
                    )}
                    
                    {result.type === 'table' && result.table && (
                      &lt;div className="text-xs text-gray-600"&gt;
                        &lt;p&gt;{result.table.headers.length} colunas, {result.table.rows.length} linhas&lt;/p&gt;
                        &lt;p className="truncate"&gt;Colunas: {result.table.headers.join(', ')}&lt;/p&gt;
                      &lt;/div&gt;
                    )}
                    
                    {result.type === 'chart' && result.chart && (
                      &lt;div className="text-xs text-gray-600"&gt;
                        &lt;p&gt;{result.chart.data.length} pontos de dados&lt;/p&gt;
                        &lt;p&gt;Tipo: {result.chart.type}&lt;/p&gt;
                      &lt;/div&gt;
                    )}

                    &lt;div className="flex items-center justify-between mt-3 pt-3 border-t"&gt;
                      &lt;div className="flex items-center gap-1 text-xs text-gray-500"&gt;
                        &lt;TrendingUp className="h-3 w-3" /&gt;
                        {Math.round(result.confidence * 100)}% confiança
                      &lt;/div&gt;
                      
                      &lt;div className="flex gap-1"&gt;
                        &lt;Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={(e) =&gt; {
                            e.stopPropagation();
                            onExport?.(result.id, 'pdf');
                          }}
                        &gt;
                          &lt;FileText className="h-3 w-3" /&gt;
                        &lt;/Button&gt;
                        
                        &lt;Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={(e) =&gt; {
                            e.stopPropagation();
                            onExport?.(result.id, 'excel');
                          }}
                        &gt;
                          &lt;FileSpreadsheet className="h-3 w-3" /&gt;
                        &lt;/Button&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;
                  &lt;/CardContent&gt;
                &lt;/Card&gt;
              );
            })}
          &lt;/div&gt;
        ) : (
          // Detail View
          currentResult && (
            &lt;div className="space-y-6"&gt;
              {/* Query Info */}
              &lt;Card className="bg-blue-50 border-blue-200"&gt;
                &lt;CardContent className="p-4"&gt;
                  &lt;div className="flex items-start justify-between"&gt;
                    &lt;div className="flex-1"&gt;
                      &lt;h3 className="font-medium text-blue-900 mb-2"&gt;
                        Consulta: {currentResult.query}
                      &lt;/h3&gt;
                      &lt;div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"&gt;
                        &lt;div&gt;
                          &lt;p className="text-blue-700 font-medium"&gt;Timestamp&lt;/p&gt;
                          &lt;p className="text-blue-600"&gt;
                            {currentResult.timestamp.toLocaleString('pt-BR')}
                          &lt;/p&gt;
                        &lt;/div&gt;
                        &lt;div&gt;
                          &lt;p className="text-blue-700 font-medium"&gt;Tipo&lt;/p&gt;
                          &lt;p className="text-blue-600 capitalize"&gt;{currentResult.type}&lt;/p&gt;
                        &lt;/div&gt;
                        &lt;div&gt;
                          &lt;p className="text-blue-700 font-medium"&gt;Confiança&lt;/p&gt;
                          &lt;p className="text-blue-600"&gt;
                            {Math.round(currentResult.confidence * 100)}%
                          &lt;/p&gt;
                        &lt;/div&gt;
                        &lt;div&gt;
                          &lt;p className="text-blue-700 font-medium"&gt;Tempo de Execução&lt;/p&gt;
                          &lt;p className="text-blue-600"&gt;{currentResult.executionTime}ms&lt;/p&gt;
                        &lt;/div&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;
                    
                    &lt;div className="flex gap-2 ml-4"&gt;
                      &lt;Button 
                        variant="outline" 
                        size="sm"
                        onClick={() =&gt; onExport?.(currentResult.id, 'pdf')}
                      &gt;
                        &lt;FileText className="h-4 w-4 mr-2" /&gt;
                        PDF
                      &lt;/Button&gt;
                      &lt;Button 
                        variant="outline" 
                        size="sm"
                        onClick={() =&gt; onExport?.(currentResult.id, 'excel')}
                      &gt;
                        &lt;FileSpreadsheet className="h-4 w-4 mr-2" /&gt;
                        Excel
                      &lt;/Button&gt;
                      &lt;Button 
                        variant="outline" 
                        size="sm"
                        onClick={() =&gt; onExport?.(currentResult.id, 'csv')}
                      &gt;
                        &lt;Download className="h-4 w-4 mr-2" /&gt;
                        CSV
                      &lt;/Button&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                &lt;/CardContent&gt;
              &lt;/Card&gt;

              {/* Result Content */}
              &lt;Card&gt;
                &lt;CardContent className="p-6"&gt;
                  {currentResult.type === 'text' && currentResult.textResult && (
                    &lt;div className="prose max-w-none"&gt;
                      &lt;p&gt;{currentResult.textResult}&lt;/p&gt;
                    &lt;/div&gt;
                  )}
                  
                  {currentResult.type === 'table' && currentResult.table && (
                    renderTable(currentResult.table)
                  )}
                  
                  {currentResult.type === 'chart' && currentResult.chart && (
                    renderChart(currentResult.chart)
                  )}
                  
                  {currentResult.type === 'mixed' && (
                    &lt;div className="space-y-8"&gt;
                      {currentResult.chart && renderChart(currentResult.chart)}
                      {currentResult.table && renderTable(currentResult.table)}
                      {currentResult.textResult && (
                        &lt;div className="prose max-w-none"&gt;
                          &lt;p&gt;{currentResult.textResult}&lt;/p&gt;
                        &lt;/div&gt;
                      )}
                    &lt;/div&gt;
                  )}
                &lt;/CardContent&gt;
              &lt;/Card&gt;

              {/* Result Navigation */}
              {filteredResults.length > 1 && (
                &lt;div className="flex items-center justify-between"&gt;
                  &lt;p className="text-sm text-gray-600"&gt;
                    Resultado {filteredResults.findIndex(r => r.id === currentResult.id) + 1} de {filteredResults.length}
                  &lt;/p&gt;
                  
                  &lt;div className="flex gap-2"&gt;
                    {filteredResults.map((result, index) =&gt; (
                      &lt;Button
                        key={result.id}
                        variant={result.id === currentResult.id ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =&gt; onResultSelect?.(result.id)}
                      &gt;
                        {index + 1}
                      &lt;/Button&gt;
                    ))}
                  &lt;/div&gt;
                &lt;/div&gt;
              )}
            &lt;/div&gt;
          )
        )}
      &lt;/CardContent&gt;
    &lt;/Card&gt;
  );
}
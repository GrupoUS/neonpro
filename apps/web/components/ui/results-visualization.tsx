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
  Search,
  TrendingUp,
  Activity
} from 'lucide-react';

export interface DataPoint {
  id: string;
  label: string;
  value: number;
  category?: string;
  date?: Date;
  metadata?: Record<string, unknown>;
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
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{chartData.title}</h4>
          <div className="flex gap-2">
            {['bar', 'line', 'pie'].map((type) => (
              <Button
                key={type}
                variant={chartData.type === type ? 'default' : 'outline'}
                size="sm"
                className="h-8"
              >
                {type === 'bar' && <BarChart3 className="h-3 w-3" />}
                {type === 'line' && <LineChart className="h-3 w-3" />}
                {type === 'pie' && <PieChart className="h-3 w-3" />}
              </Button>
            ))}
          </div>
        </div>

        {/* Simple bar chart visualization */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-end justify-between h-40 gap-2">
            {chartData.data.slice(0, 8).map((point, _index) => (
              <div key={point.id} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="bg-blue-500 rounded-t min-w-[20px] transition-all hover:bg-blue-600"
                  style={{
                    height: `${(point.value / maxValue) * 120}px`
                  }}
                  title={`${point.label}: ${point.value}`}
                />
                <span className="text-xs text-gray-600 text-center truncate w-full">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
          
          {chartData.yAxisLabel && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              {chartData.yAxisLabel}
            </div>
          )}
        </div>

        {/* Data summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white border rounded p-3">
            <p className="text-gray-600">Total de Pontos</p>
            <p className="font-bold text-lg">{chartData.data.length}</p>
          </div>
          <div className="bg-white border rounded p-3">
            <p className="text-gray-600">Valor Máximo</p>
            <p className="font-bold text-lg">{maxValue.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-white border rounded p-3">
            <p className="text-gray-600">Valor Mínimo</p>
            <p className="font-bold text-lg">
              {Math.min(...chartData.data.map(d => d.value)).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-white border rounded p-3">
            <p className="text-gray-600">Média</p>
            <p className="font-bold text-lg">
              {Math.round(chartData.data.reduce((acc, d) => acc + d.value, 0) / chartData.data.length).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Generate table visualization
  const renderTable = (tableData: TableData) => {
    const displayRows = tableData.rows.slice(0, 10); // Show first 10 rows
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{tableData.title}</h4>
          <Badge variant="secondary">
            {tableData.totalRows || tableData.rows.length} registros
          </Badge>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {tableData.headers.map((header, index) => (
                  <TableHead key={index} className="font-medium">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>
                      {cell instanceof Date ? cell.toLocaleDateString('pt-BR') : 
                       typeof cell === 'number' ? cell.toLocaleString('pt-BR') : 
                       String(cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {tableData.rows.length > 10 && (
          <div className="text-center text-sm text-gray-500">
            Mostrando 10 de {tableData.totalRows || tableData.rows.length} registros
          </div>
        )}
      </div>
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
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Visualização de Resultados
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="chart">Gráficos</SelectItem>
                <SelectItem value="table">Tabelas</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grade
            </Button>
            
            <Button
              variant={viewMode === 'detail' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('detail')}
            >
              Detalhes
            </Button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar consultas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{filteredResults.length} resultado(s)</span>
            {currentResult && (
              <>
                <span>•</span>
                <span>Confiança: {Math.round(currentResult.confidence * 100)}%</span>
                <span>•</span>
                <span>Tempo: {currentResult.executionTime}ms</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredResults.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum resultado encontrado</p>
            <p className="text-sm mt-1">
              {searchTerm ? 'Tente ajustar os filtros ou termo de busca' : 'Execute uma consulta para ver os resultados aqui'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredResults.map((result) => {
              const IconComponent = getResultIcon(result.type);
              
              return (
                <Card 
                  key={result.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    selectedResult === result.id && 'ring-2 ring-blue-500'
                  )}
                  onClick={() => onResultSelect?.(result.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900 truncate">
                          {result.query}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {result.timestamp.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-2">
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getResultTypeColor(result.type))}
                        >
                          <IconComponent className="h-3 w-3 mr-1" />
                          {result.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {result.type === 'text' && result.textResult && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {result.textResult}
                      </p>
                    )}
                    
                    {result.type === 'table' && result.table && (
                      <div className="text-xs text-gray-600">
                        <p>{result.table.headers.length} colunas, {result.table.rows.length} linhas</p>
                        <p className="truncate">Colunas: {result.table.headers.join(', ')}</p>
                      </div>
                    )}
                    
                    {result.type === 'chart' && result.chart && (
                      <div className="text-xs text-gray-600">
                        <p>{result.chart.data.length} pontos de dados</p>
                        <p>Tipo: {result.chart.type}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp className="h-3 w-3" />
                        {Math.round(result.confidence * 100)}% confiança
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExport?.(result.id, 'pdf');
                          }}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExport?.(result.id, 'excel');
                          }}
                        >
                          <FileSpreadsheet className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          // Detail View
          currentResult && (
            <div className="space-y-6">
              {/* Query Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-900 mb-2">
                        Consulta: {currentResult.query}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-blue-700 font-medium">Timestamp</p>
                          <p className="text-blue-600">
                            {currentResult.timestamp.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Tipo</p>
                          <p className="text-blue-600 capitalize">{currentResult.type}</p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Confiança</p>
                          <p className="text-blue-600">
                            {Math.round(currentResult.confidence * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Tempo de Execução</p>
                          <p className="text-blue-600">{currentResult.executionTime}ms</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onExport?.(currentResult.id, 'pdf')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onExport?.(currentResult.id, 'excel')}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onExport?.(currentResult.id, 'csv')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Result Content */}
              <Card>
                <CardContent className="p-6">
                  {currentResult.type === 'text' && currentResult.textResult && (
                    <div className="prose max-w-none">
                      <p>{currentResult.textResult}</p>
                    </div>
                  )}
                  
                  {currentResult.type === 'table' && currentResult.table && (
                    renderTable(currentResult.table)
                  )}
                  
                  {currentResult.type === 'chart' && currentResult.chart && (
                    renderChart(currentResult.chart)
                  )}
                  
                  {currentResult.type === 'mixed' && (
                    <div className="space-y-8">
                      {currentResult.chart && renderChart(currentResult.chart)}
                      {currentResult.table && renderTable(currentResult.table)}
                      {currentResult.textResult && (
                        <div className="prose max-w-none">
                          <p>{currentResult.textResult}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Result Navigation */}
              {filteredResults.length > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Resultado {filteredResults.findIndex(r => r.id === currentResult.id) + 1} de {filteredResults.length}
                  </p>
                  
                  <div className="flex gap-2">
                    {filteredResults.map((result, index) => (
                      <Button
                        key={result.id}
                        variant={result.id === currentResult.id ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onResultSelect?.(result.id)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}

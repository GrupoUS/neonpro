'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  Eye,
  MessageSquare
} from 'lucide-react';
import { ChurnPrediction, ChurnRiskLevel } from '@/types/retention-analytics';
import { cn } from '@/lib/utils';

interface ChurnPredictionsTableProps {
  predictions: ChurnPrediction[];
}

export function ChurnPredictionsTable({ predictions }: ChurnPredictionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<ChurnRiskLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<'probability' | 'last_visit' | 'name'>('probability');

  // Filtrar e ordenar dados
  const filteredPredictions = predictions
    .filter(prediction => {
      const matchesSearch = prediction.patient_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'all' || prediction.risk_level === riskFilter;
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'probability':
          return b.churn_probability - a.churn_probability;
        case 'last_visit':
          return new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime();
        case 'name':
          return a.patient_name.localeCompare(b.patient_name);
        default:
          return 0;
      }
    });

  const getRiskBadgeVariant = (risk: ChurnRiskLevel) => {
    switch (risk) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRiskIcon = (risk: ChurnRiskLevel) => {
    switch (risk) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <TrendingDown className="h-4 w-4" />;
      case 'low':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

  return (
    <div className="space-y-4">
      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={riskFilter} onValueChange={(value: ChurnRiskLevel | 'all') => setRiskFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por risco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            <SelectItem value="high">Alto risco</SelectItem>
            <SelectItem value="medium">Médio risco</SelectItem>
            <SelectItem value="low">Baixo risco</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: 'probability' | 'last_visit' | 'name') => setSortBy(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="probability">Probabilidade</SelectItem>
            <SelectItem value="last_visit">Última visita</SelectItem>
            <SelectItem value="name">Nome</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resumo dos resultados */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{filteredPredictions.length} pacientes encontrados</span>
        <span>•</span>
        <span>{filteredPredictions.filter(p => p.risk_level === 'high').length} alto risco</span>
        <span>•</span>
        <span>{filteredPredictions.filter(p => p.risk_level === 'medium').length} médio risco</span>
      </div>

      {/* Tabela */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Probabilidade</TableHead>
              <TableHead>Última Visita</TableHead>
              <TableHead>LTV</TableHead>
              <TableHead>Fatores de Risco</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPredictions.map((prediction) => (
              <TableRow key={prediction.patient_id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{prediction.patient_name}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {prediction.patient_id}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant={getRiskBadgeVariant(prediction.risk_level)}
                    className="flex items-center gap-1 w-fit"
                  >
                    {getRiskIcon(prediction.risk_level)}
                    {prediction.risk_level === 'high' ? 'Alto' : 
                     prediction.risk_level === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium",
                      prediction.churn_probability > 0.7 ? "text-red-600" :
                      prediction.churn_probability > 0.4 ? "text-orange-600" :
                      "text-green-600"
                    )}>
                      {formatPercentage(prediction.churn_probability)}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {formatDate(prediction.last_visit)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm font-medium">
                    {formatCurrency(prediction.predicted_ltv)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {prediction.risk_factors.slice(0, 2).map((factor, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                    {prediction.risk_factors.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{prediction.risk_factors.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredPredictions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma previsão encontrada com os filtros aplicados
        </div>
      )}
    </div>
  );
}
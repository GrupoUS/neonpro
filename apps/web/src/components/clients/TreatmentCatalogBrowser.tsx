/**
 * Advanced Treatment Catalog Browser for Aesthetic Clinic
 *
 * Comprehensive treatment catalog with advanced filtering, search,
 * comparison tools, and Brazilian healthcare compliance information.
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Progress } from '@/components/ui/progress';
import {
  Search,
  Filter,
  // Heart,
  Star,
  Clock,
  DollarSign,
  Shield,
  // Activity,
  Target,
  // Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  // Info,
  // Camera,
  Package,
  Zap,
  Eye,
  // EyeOff,
  // RefreshCw,
  SortAsc,
  SortDesc,
  Grid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================
// TYPES AND INTERFACES
// =====================================

interface TreatmentProcedure {
  id: string;
  name: string;
  description: string;
  category: 'facial' | 'body' | 'injectable' | 'laser' | 'surgical' | 'combination';
  procedureType: 'minimally_invasive' | 'non_invasive' | 'surgical';
  baseDuration: number; // in minutes
  basePrice: number;
  anvisaRegistration?: string;
  requiresCertification: boolean;
  popularity: number; // 1-5
  effectiveness: number; // 1-5
  safety: number; // 1-5
  downtime: number; // in hours
  resultsDuration: number; // in months
  sessionsRequired: number;
  contraindications: string[];
  specialEquipment: string[];
  recoveryTime: number; // in hours
  maxSessions: number;
  minSessions: number;
  isActive: boolean;
  tags: string[];
  beforeAfterImages?: {
    before: string;
    after: string;
    description: string;
  }[];
  professionals: string[];
  clinicalEvidence?: {
    studies: number;
    satisfactionRate: number;
    complicationRate: number;
  };
  brazilianStandards: {
    anvisaCompliant: boolean;
    cfmApproved: boolean;
    requiresMedicalSupervision: boolean;
    emergencyProtocolRequired: boolean;
  };
}

interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  category: string;
  totalPrice: number;
  packageDiscount: number; // percentage
  totalSessions: number;
  procedures: PackageProcedure[];
  isActive: boolean;
  validityPeriod: number; // in days
  tags: string[];
  popularity: number;
}

interface PackageProcedure {
  id: string;
  procedureId: string;
  procedure: TreatmentProcedure;
  sessions: number;
  price: number;
}

interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  durationRange: [number, number];
  downtimeRange: [number, number];
  effectiveness: number;
  safety: number;
  anvisaApproved: boolean;
  requiresCertification: boolean;
  popularity: number;
}

interface SearchFilters {
  query: string;
  categories: string[];
  priceRange: [number, number];
  durationRange: [number, number];
  downtimeRange: [number, number];
  minEffectiveness: number;
  minSafety: number;
  anvisaApproved: boolean | 'all';
  certificationRequired: boolean | 'all';
  minPopularity: number;
  sortBy: 'name' | 'price' | 'duration' | 'popularity' | 'effectiveness' | 'safety';
  sortOrder: 'asc' | 'desc';
}

const TreatmentSearchSchema = z.object({
  query: z.string().optional(),
  categories: z.array(z.string()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minDuration: z.number().min(0).optional(),
  maxDuration: z.number().min(0).optional(),
  minDowntime: z.number().min(0).optional(),
  maxDowntime: z.number().min(0).optional(),
  minEffectiveness: z.number().min(1).max(5).optional(),
  minSafety: z.number().min(1).max(5).optional(),
  anvisaApproved: z.boolean().optional(),
  certificationRequired: z.boolean().optional(),
  minPopularity: z.number().min(1).max(5).optional(),
});

type TreatmentSearchFormData = z.infer<typeof TreatmentSearchSchema>;

// =====================================
// MAIN COMPONENT
// =====================================

export const TreatmentCatalogBrowser: React.FC = () => {
  const [treatments, setTreatments] = useState<TreatmentProcedure[]>([]);
  const [packages, setPackages] = useState<TreatmentPackage[]>([]);
  const [filteredTreatments, setFilteredTreatments] = useState<TreatmentProcedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentProcedure | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'treatments' | 'packages' | 'compare'>('treatments');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    categories: [],
    priceRange: [0, 50000],
    durationRange: [0, 300],
    downtimeRange: [0, 168],
    minEffectiveness: 1,
    minSafety: 1,
    anvisaApproved: 'all',
    certificationRequired: 'all',
    minPopularity: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const filterForm = useForm<TreatmentSearchFormData>({
    resolver: zodResolver(TreatmentSearchSchema),
    defaultValues: {
      query: '',
      categories: [],
      minPrice: 0,
      maxPrice: 50000,
      minDuration: 0,
      maxDuration: 300,
      minDowntime: 0,
      maxDowntime: 168,
      minEffectiveness: 1,
      minSafety: 1,
      anvisaApproved: false,
      certificationRequired: false,
      minPopularity: 1,
    },
  });

  // Load mock data
  useEffect(() => {
    loadTreatmentData();
  }, []);

  // Filter treatments based on search criteria
  useEffect(() => {
    if (treatments.length > 0) {
      const filtered = treatments.filter((treatment) => {
        // Text search
        if (searchFilters.query) {
          const query = searchFilters.query.toLowerCase();
          const matches = 
            treatment.name.toLowerCase().includes(query) ||
            treatment.description.toLowerCase().includes(query) ||
            treatment.tags.some(tag => tag.toLowerCase().includes(query));
          if (!matches) return false;
        }

        // Category filter
        if (searchFilters.categories.length > 0) {
          if (!searchFilters.categories.includes(treatment.category)) return false;
        }

        // Price filter
        if (treatment.basePrice < searchFilters.priceRange[0] || 
            treatment.basePrice > searchFilters.priceRange[1]) return false;

        // Duration filter
        if (treatment.baseDuration < searchFilters.durationRange[0] || 
            treatment.baseDuration > searchFilters.durationRange[1]) return false;

        // Downtime filter
        if (treatment.downtime < searchFilters.downtimeRange[0] || 
            treatment.downtime > searchFilters.downtimeRange[1]) return false;

        // Effectiveness filter
        if (treatment.effectiveness < searchFilters.minEffectiveness) return false;

        // Safety filter
        if (treatment.safety < searchFilters.minSafety) return false;

        // ANVISA filter
        if (searchFilters.anvisaApproved !== 'all' && 
            treatment.brazilianStandards.anvisaCompliant !== searchFilters.anvisaApproved) return false;

        // Certification filter
        if (searchFilters.certificationRequired !== 'all' && 
            treatment.requiresCertification !== searchFilters.certificationRequired) return false;

        // Popularity filter
        if (treatment.popularity < searchFilters.minPopularity) return false;

        return true;
      });

      // Sort results
      const sorted = [...filtered].sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (searchFilters.sortBy) {
          case 'price':
            aValue = a.basePrice;
            bValue = b.basePrice;
            break;
          case 'duration':
            aValue = a.baseDuration;
            bValue = b.baseDuration;
            break;
          case 'popularity':
            aValue = a.popularity;
            bValue = b.popularity;
            break;
          case 'effectiveness':
            aValue = a.effectiveness;
            bValue = b.effectiveness;
            break;
          case 'safety':
            aValue = a.safety;
            bValue = b.safety;
            break;
          default:
            aValue = a.name;
            bValue = b.name;
        }

        if (typeof aValue === 'string') {
          return searchFilters.sortOrder === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return searchFilters.sortOrder === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      });

      setFilteredTreatments(sorted);
    }
  }, [treatments, searchFilters]);

  const loadTreatmentData = async () => {
    setIsLoading(true);
    try {
      // Mock treatment data
      const mockTreatments: TreatmentProcedure[] = [
        {
          id: 'proc-001',
          name: 'Botox Forehead',
          description: 'Tratamento com toxina botulínica para suavizar linhas de expressão na testa',
          category: 'injectable',
          procedureType: 'minimally_invasive',
          baseDuration: 30,
          basePrice: 1200,
          anvisaRegistration: 'ANVISA 123456789',
          requiresCertification: true,
          popularity: 5,
          effectiveness: 4,
          safety: 4,
          downtime: 0,
          resultsDuration: 4,
          sessionsRequired: 1,
          contraindications: ['Gravidez', 'Amamentação', 'Doenças neuromusculares'],
          specialEquipment: ['Agulhas finas'],
          recoveryTime: 0,
          maxSessions: 1,
          minSessions: 1,
          isActive: true,
          tags: ['antienvelhecimento', 'linhas de expressão', 'botox'],
          professionals: ['Dra. Ana Costa', 'Dr. Carlos Silva'],
          clinicalEvidence: {
            studies: 150,
            satisfactionRate: 95,
            complicationRate: 2,
          },
          brazilianStandards: {
            anvisaCompliant: true,
            cfmApproved: true,
            requiresMedicalSupervision: true,
            emergencyProtocolRequired: true,
          },
        },
        {
          id: 'proc-002',
          name: 'Ácido Hialurônico Lábios',
          description: 'Preenchimento labial com ácido hialurônico para aumento de volume e definição',
          category: 'injectable',
          procedureType: 'minimally_invasive',
          baseDuration: 45,
          basePrice: 1800,
          anvisaRegistration: 'ANVISA 987654321',
          requiresCertification: true,
          popularity: 4,
          effectiveness: 5,
          safety: 4,
          downtime: 24,
          resultsDuration: 12,
          sessionsRequired: 1,
          contraindications: ['Alergia ao ácido hialurônico', 'Infecção ativa', 'Gravidez'],
          specialEquipment: ['Canulas', 'Agulhas'],
          recoveryTime: 24,
          maxSessions: 1,
          minSessions: 1,
          isActive: true,
          tags: ['preenchimento', 'lábios', 'ácido hialurônico'],
          professionals: ['Dra. Ana Costa', 'Dra. Maria Santos'],
          clinicalEvidence: {
            studies: 200,
            satisfactionRate: 92,
            complicationRate: 3,
          },
          brazilianStandards: {
            anvisaCompliant: true,
            cfmApproved: true,
            requiresMedicalSupervision: true,
            emergencyProtocolRequired: true,
          },
        },
        {
          id: 'proc-003',
          name: 'Peeling Químico',
          description: 'Tratamento de superfície da pele com agentes químicos para rejuvenescimento',
          category: 'facial',
          procedureType: 'non_invasive',
          baseDuration: 60,
          basePrice: 800,
          requiresCertification: true,
          popularity: 3,
          effectiveness: 3,
          safety: 4,
          downtime: 72,
          resultsDuration: 3,
          sessionsRequired: 4,
          contraindications: ['Peles sensíveis', 'Rosácea ativa', 'Uso de isotretinoína'],
          specialEquipment: ['Solução química', 'Neutralizante'],
          recoveryTime: 72,
          maxSessions: 6,
          minSessions: 3,
          isActive: true,
          tags: ['rejuvenescimento', 'peeling', 'químico'],
          professionals: ['Dra. Maria Santos', 'Dr. Pedro Oliveira'],
          clinicalEvidence: {
            studies: 80,
            satisfactionRate: 88,
            complicationRate: 5,
          },
          brazilianStandards: {
            anvisaCompliant: true,
            cfmApproved: true,
            requiresMedicalSupervision: false,
            emergencyProtocolRequired: false,
          },
        },
        {
          id: 'proc-004',
          name: 'Laser CO2 Fracional',
          description: 'Tratamento laser para rejuvenescimento, cicatrizes e textura da pele',
          category: 'laser',
          procedureType: 'non_invasive',
          baseDuration: 90,
          basePrice: 3500,
          anvisaRegistration: 'ANVISA 456789123',
          requiresCertification: true,
          popularity: 4,
          effectiveness: 5,
          safety: 3,
          downtime: 168,
          resultsDuration: 24,
          sessionsRequired: 1,
          contraindications: ['Peles escuras (Fitzpatrick V-VI)', 'Herpes ativo', 'Gravidez'],
          specialEquipment: ['Laser CO2', 'Sistema de refrigeração'],
          recoveryTime: 168,
          maxSessions: 3,
          minSessions: 1,
          isActive: true,
          tags: ['rejuvenescimento', 'laser', 'cicatrizes'],
          professionals: ['Dr. Carlos Silva', 'Dra. Ana Costa'],
          clinicalEvidence: {
            studies: 120,
            satisfactionRate: 90,
            complicationRate: 8,
          },
          brazilianStandards: {
            anvisaCompliant: true,
            cfmApproved: true,
            requiresMedicalSupervision: true,
            emergencyProtocolRequired: true,
          },
        },
        {
          id: 'proc-005',
          name: 'Lipoaspiração',
          description: 'Remoção cirúrgica de gordura localizada',
          category: 'surgical',
          procedureType: 'surgical',
          baseDuration: 180,
          basePrice: 15000,
          anvisaRegistration: 'ANVISA 789123456',
          requiresCertification: true,
          popularity: 3,
          effectiveness: 5,
          safety: 3,
          downtime: 336,
          resultsDuration: 60,
          sessionsRequired: 1,
          contraindications: ['Obesidade mórbida', 'Problemas cardíacos', 'Distúrbios de coagulação'],
          specialEquipment: ['Cânula', 'Aspirador', 'Sistema de infusão'],
          recoveryTime: 336,
          maxSessions: 1,
          minSessions: 1,
          isActive: true,
          tags: ['corporal', 'lipoaspiração', 'cirurgia'],
          professionals: ['Dr. Pedro Oliveira', 'Dr. Carlos Silva'],
          clinicalEvidence: {
            studies: 300,
            satisfactionRate: 85,
            complicationRate: 12,
          },
          brazilianStandards: {
            anvisaCompliant: true,
            cfmApproved: true,
            requiresMedicalSupervision: true,
            emergencyProtocolRequired: true,
          },
        },
      ];

      const mockPackages: TreatmentPackage[] = [
        {
          id: 'pkg-001',
          name: 'Pacote Anti-Idade Premium',
          description: 'Combinação completa para rejuvenescimento facial',
          category: 'facial',
          totalPrice: 4800,
          packageDiscount: 15,
          totalSessions: 6,
          isActive: true,
          validityPeriod: 365,
          tags: ['anti-idade', 'premium', 'completo'],
          popularity: 5,
          procedures: [
            {
              id: 'pkg-proc-001',
              procedureId: 'proc-001',
              procedure: mockTreatments[0],
              sessions: 2,
              price: 2400,
            },
            {
              id: 'pkg-proc-002',
              procedureId: 'proc-003',
              procedure: mockTreatments[2],
              sessions: 4,
              price: 2400,
            },
          ],
        },
        {
          id: 'pkg-002',
          name: 'Pacote Lábios Perfeitos',
          description: 'Tratamento completo para aumento e definição labial',
          category: 'injectable',
          totalPrice: 3200,
          packageDiscount: 10,
          totalSessions: 3,
          isActive: true,
          validityPeriod: 180,
          tags: ['lábios', 'preenchimento', 'harmonização'],
          popularity: 4,
          procedures: [
            {
              id: 'pkg-proc-003',
              procedureId: 'proc-002',
              procedure: mockTreatments[1],
              sessions: 2,
              price: 3200,
            },
          ],
        },
      ];

      setTreatments(mockTreatments);
      setPackages(mockPackages);
      setFilteredTreatments(mockTreatments);
    } catch (error) {
      console.error('Error loading treatment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (data: TreatmentSearchFormData) => {
    setSearchFilters(prev => ({
      ...prev,
      query: data.query || '',
      categories: data.categories || [],
      priceRange: [data.minPrice || 0, data.maxPrice || 50000],
      durationRange: [data.minDuration || 0, data.maxDuration || 300],
      downtimeRange: [data.minDowntime || 0, data.maxDowntime || 168],
      minEffectiveness: data.minEffectiveness || 1,
      minSafety: data.minSafety || 1,
      anvisaApproved: data.anvisaApproved !== undefined ? data.anvisaApproved : 'all',
      certificationRequired: data.certificationRequired !== undefined ? data.certificationRequired : 'all',
      minPopularity: data.minPopularity || 1,
    }));
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleCompare = (treatmentId: string) => {
    setCompareList(prev => {
      if (prev.includes(treatmentId)) {
        return prev.filter(id => id !== treatmentId);
      } else if (prev.length < 3) {
        return [...prev, treatmentId];
      }
      return prev;
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'facial':
        return 'bg-blue-100 text-blue-800';
      case 'body':
        return 'bg-green-100 text-green-800';
      case 'injectable':
        return 'bg-purple-100 text-purple-800';
      case 'laser':
        return 'bg-red-100 text-red-800';
      case 'surgical':
        return 'bg-orange-100 text-orange-800';
      case 'combination':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'facial': return 'Facial';
      case 'body': return 'Corporal';
      case 'injectable': return 'Injetável';
      case 'laser': return 'Laser';
      case 'surgical': return 'Cirúrgico';
      case 'combination': return 'Combinado';
      default: return category;
    }
  };

  const getProcedureTypeLabel = (type: string) => {
    switch (type) {
      case 'minimally_invasive': return 'Minimamente Invasivo';
      case 'non_invasive': return 'Não Invasivo';
      case 'surgical': return 'Cirúrgico';
      default: return type;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={cn(
          'h-4 w-4',
          index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        )}
      />
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const formatDowntime = (hours: number) => {
    if (hours === 0) return 'Sem downtime';
    if (hours < 24) return `${hours} horas`;
    const days = Math.floor(hours / 24);
    return `${days} dia${days > 1 ? 's' : ''}`;
  };

  const getCompareTreatments = () => {
    return treatments.filter(t => compareList.includes(t.id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando catálogo de tratamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Package className="h-8 w-8 mr-3" />
            Catálogo de Tratamentos
          </h1>
          <p className="text-gray-600 mt-1">
            Explore tratamentos estéticos com informações completas e conformidade ANVISA
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {compareList.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setActiveTab('compare')}
            >
              Comparar ({compareList.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Buscar e Filtrar
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Search */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tratamentos, categorias ou tags..."
                className="pl-10"
                value={searchFilters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
              />
            </div>
            <Button onClick={filterForm.handleSubmit(handleSearch)}>
              Buscar
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Faixa de Preço</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={searchFilters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), searchFilters.priceRange[1]])}
                  />
                  <span> até </span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={searchFilters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [searchFilters.priceRange[0], Number(e.target.value)])}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Duração</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={searchFilters.durationRange[0]}
                    onChange={(e) => handleFilterChange('durationRange', [Number(e.target.value), searchFilters.durationRange[1]])}
                  />
                  <span> até </span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={searchFilters.durationRange[1]}
                    onChange={(e) => handleFilterChange('durationRange', [searchFilters.durationRange[0], Number(e.target.value)])}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Downtime</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={searchFilters.downtimeRange[0]}
                    onChange={(e) => handleFilterChange('downtimeRange', [Number(e.target.value), searchFilters.downtimeRange[1]])}
                  />
                  <span> até </span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={searchFilters.downtimeRange[1]}
                    onChange={(e) => handleFilterChange('downtimeRange', [searchFilters.downtimeRange[0], Number(e.target.value)])}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Ordenar por</Label>
                <div className="flex space-x-2 mt-1">
                  <Select
                    value={searchFilters.sortBy}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nome</SelectItem>
                      <SelectItem value="price">Preço</SelectItem>
                      <SelectItem value="duration">Duração</SelectItem>
                      <SelectItem value="popularity">Popularidade</SelectItem>
                      <SelectItem value="effectiveness">Efetividade</SelectItem>
                      <SelectItem value="safety">Segurança</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('sortOrder', searchFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {searchFilters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {['facial', 'body', 'injectable', 'laser', 'surgical'].map((category) => (
              <Button
                key={category}
                variant={searchFilters.categories.includes(category) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const newCategories = searchFilters.categories.includes(category)
                    ? searchFilters.categories.filter(c => c !== category)
                    : [...searchFilters.categories, category];
                  handleFilterChange('categories', newCategories);
                }}
              >
                {getCategoryLabel(category)}
              </Button>
            ))}
            <Button
              variant={searchFilters.anvisaApproved === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('anvisaApproved', searchFilters.anvisaApproved === true ? 'all' : true)}
            >
              <Shield className="h-4 w-4 mr-1" />
              ANVISA
            </Button>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filteredTreatments.length} tratamentos encontrados</span>
            <div className="flex items-center space-x-4">
              <span>
                Preço: {formatCurrency(searchFilters.priceRange[0])} - {formatCurrency(searchFilters.priceRange[1])}
              </span>
              <span>
                Duração: {formatDuration(searchFilters.durationRange[0])} - {formatDuration(searchFilters.durationRange[1])}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="treatments">
            Tratamentos ({filteredTreatments.length})
          </TabsTrigger>
          <TabsTrigger value="packages">
            Pacotes ({packages.length})
          </TabsTrigger>
          <TabsTrigger value="compare" disabled={compareList.length === 0}>
            Comparar ({compareList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="treatments" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTreatments.map((treatment) => (
                <Card key={treatment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{treatment.name}</CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getCategoryColor(treatment.category)}>
                            {getCategoryLabel(treatment.category)}
                          </Badge>
                          {treatment.brazilianStandards.anvisaCompliant && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Shield className="h-3 w-3 mr-1" />
                              ANVISA
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCompare(treatment.id)}
                        className={compareList.includes(treatment.id) ? 'text-blue-600' : 'text-gray-400'}
                      >
                        <Target className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {treatment.description}
                    </p>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-gray-500" />
                        <span className="font-medium">{formatCurrency(treatment.basePrice)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>{formatDuration(treatment.baseDuration)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3 text-gray-500" />
                        <span>{formatDowntime(treatment.downtime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span>{treatment.resultsDuration} meses</span>
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          {getRatingStars(treatment.effectiveness)}
                        </div>
                        <span className="text-gray-600">Efetividade</span>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          {getRatingStars(treatment.safety)}
                        </div>
                        <span className="text-gray-600">Segurança</span>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          {getRatingStars(treatment.popularity)}
                        </div>
                        <span className="text-gray-600">Popularidade</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {treatment.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {treatment.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{treatment.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedTreatment(treatment)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                      <Button size="sm" className="flex-1">
                        Agendar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTreatments.map((treatment) => (
                <Card key={treatment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{treatment.name}</h3>
                          <Badge className={getCategoryColor(treatment.category)}>
                            {getCategoryLabel(treatment.category)}
                          </Badge>
                          {treatment.brazilianStandards.anvisaCompliant && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Shield className="h-3 w-3 mr-1" />
                              ANVISA
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{treatment.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-600">Preço</span>
                            <p className="font-medium">{formatCurrency(treatment.basePrice)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Duração</span>
                            <p className="font-medium">{formatDuration(treatment.baseDuration)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Downtime</span>
                            <p className="font-medium">{formatDowntime(treatment.downtime)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Sessões</span>
                            <p className="font-medium">{treatment.sessionsRequired}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Efetividade:</span>
                            <div className="flex">{getRatingStars(treatment.effectiveness)}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Segurança:</span>
                            <div className="flex">{getRatingStars(treatment.safety)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCompare(treatment.id)}
                          className={compareList.includes(treatment.id) ? 'text-blue-600' : 'text-gray-400'}
                        >
                          <Target className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTreatment(treatment)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                        <Button size="sm">
                          Agendar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{pkg.name}</CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getCategoryColor(pkg.category)}>
                          {getCategoryLabel(pkg.category)}
                        </Badge>
                        <Badge variant="destructive">
                          {pkg.packageDiscount}% OFF
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(pkg.totalPrice)}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(pkg.totalPrice / (1 - pkg.packageDiscount / 100))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total de sessões:</span>
                      <span className="ml-2 font-medium">{pkg.totalSessions}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Validade:</span>
                      <span className="ml-2 font-medium">{pkg.validityPeriod} dias</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Procedimentos incluídos:</span>
                    <div className="mt-2 space-y-2">
                      {pkg.procedures.map((proc) => (
                        <div key={proc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{proc.procedure.name}</span>
                            <span className="text-xs text-gray-600 ml-2">({proc.sessions} sessões)</span>
                          </div>
                          <span className="text-sm font-medium">
                            {formatCurrency(proc.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                    <Button size="sm" className="flex-1">
                      Comprar Pacote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Característica</th>
                  {getCompareTreatments().map((treatment) => (
                    <th key={treatment.id} className="text-center p-3 min-w-[200px]">
                      {treatment.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">Preço</td>
                  {getCompareTreatments().map((treatment) => (
                    <td key={treatment.id} className="text-center p-3">
                      {formatCurrency(treatment.basePrice)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Duração</td>
                  {getCompareTreatments().map((treatment) => (
                    <td key={treatment.id} className="text-center p-3">
                      {formatDuration(treatment.baseDuration)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Downtime</td>
                  {getCompareTreatments().map((treatment) => (
                    <td key={treatment.id} className="text-center p-3">
                      {formatDowntime(treatment.downtime)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Efetividade</td>
                  {getCompareTreatments().map((treatment) => (
                    <td key={treatment.id} className="text-center p-3">
                      <div className="flex justify-center">{getRatingStars(treatment.effectiveness)}</div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Segurança</td>
                  {getCompareTreatments().map((treatment) => (
                    <td key={treatment.id} className="text-center p-3">
                      <div className="flex justify-center">{getRatingStars(treatment.safety)}</div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Sessões Necessárias</td>
                  {getCompareTreatments().map((treatment) => (
                    <td key={treatment.id} className="text-center p-3">
                      {treatment.sessionsRequired}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Conformidade ANVISA</td>
                  {getCompareTreatments().map((treatment) => (
                    <td key={treatment.id} className="text-center p-3">
                      {treatment.brazilianStandards.anvisaCompliant ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-medium">Ações</td>
                  {getCompareTreatments().map((treatment) => (
                    <td key={treatment.id} className="text-center p-3">
                      <div className="flex justify-center space-x-2">
                        <Button size="sm" onClick={() => setSelectedTreatment(treatment)}>
                          Detalhes
                        </Button>
                        <Button size="sm" variant="outline">
                          Agendar
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Treatment Detail Modal */}
      {selectedTreatment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedTreatment.name}</h2>
                <Button variant="ghost" onClick={() => setSelectedTreatment(null)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <p className="text-gray-600">{selectedTreatment.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Informações Técnicas</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tipo:</span>
                        <span>{getProcedureTypeLabel(selectedTreatment.procedureType)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Registro ANVISA:</span>
                        <span>{selectedTreatment.anvisaRegistration || 'Não aplicável'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exige certificação:</span>
                        <span>{selectedTreatment.requiresCertification ? 'Sim' : 'Não'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <div className="text-2xl font-bold">{formatCurrency(selectedTreatment.basePrice)}</div>
                    <div className="text-sm text-gray-600">Preço</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <div className="text-2xl font-bold">{formatDuration(selectedTreatment.baseDuration)}</div>
                    <div className="text-sm text-gray-600">Duração</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <div className="text-2xl font-bold">{formatDowntime(selectedTreatment.downtime)}</div>
                    <div className="text-sm text-gray-600">Downtime</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <div className="text-2xl font-bold">{selectedTreatment.resultsDuration}</div>
                    <div className="text-sm text-gray-600">Meses de efeito</div>
                  </div>
                </div>

                {/* Safety and Compliance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Contraindicações</h3>
                    <div className="space-y-2">
                      {selectedTreatment.contraindications.map((contraindication, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">{contraindication}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Conformidade Brasileira</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>ANVISA Compliant:</span>
                        {selectedTreatment.brazilianStandards.anvisaCompliant ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>CFM Aprovado:</span>
                        {selectedTreatment.brazilianStandards.cfmApproved ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Supervisão Médica:</span>
                        {selectedTreatment.brazilianStandards.requiresMedicalSupervision ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinical Evidence */}
                {selectedTreatment.clinicalEvidence && (
                  <div>
                    <h3 className="font-semibold mb-3">Evidências Clínicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded">
                        <div className="text-2xl font-bold">{selectedTreatment.clinicalEvidence.studies}</div>
                        <div className="text-sm text-gray-600">Estudos</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded">
                        <div className="text-2xl font-bold">{selectedTreatment.clinicalEvidence.satisfactionRate}%</div>
                        <div className="text-sm text-gray-600">Satisfação</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded">
                        <div className="text-2xl font-bold">{selectedTreatment.clinicalEvidence.complicationRate}%</div>
                        <div className="text-sm text-gray-600">Complicações</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    Agendar Consulta
                  </Button>
                  <Button className="flex-1">
                    Agendar Tratamento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the component
export default TreatmentCatalogBrowser;
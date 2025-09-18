'use client';

import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search,
  Filter,
  X,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@neonpro/ui';
import { cn } from '@neonpro/utils';

// Brazilian document validation schemas
const cpfSchema = z.string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00')
  .refine((cpf) => {
    // CPF validation algorithm
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numbers)) return false; // All same digits
    
    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit >= 10) firstDigit = 0;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    let secondDigit = 11 - (sum % 11);
    if (secondDigit >= 10) secondDigit = 0;
    
    return parseInt(numbers[9]) === firstDigit && parseInt(numbers[10]) === secondDigit;
  }, 'CPF inválido');

const cnsSchema = z.string()
  .regex(/^\d{3} \d{4} \d{4} \d{4}$/, 'CNS deve estar no formato 000 0000 0000 0000')
  .refine((cns) => {
    // CNS (Cartão Nacional de Saúde) validation
    const numbers = cns.replace(/\D/g, '');
    if (numbers.length !== 15) return false;
    
    // Basic CNS validation algorithm
    const firstDigit = parseInt(numbers[0]);
    if (firstDigit === 7 || firstDigit === 8 || firstDigit === 9) {
      // Temporary CNS validation
      return true;
    } else if (firstDigit === 1 || firstDigit === 2) {
      // Definitive CNS validation (simplified)
      let sum = 0;
      for (let i = 0; i < 11; i++) {
        sum += parseInt(numbers[i]) * (15 - i);
      }
      const remainder = sum % 11;
      return remainder < 2 ? parseInt(numbers[11]) === 0 : parseInt(numbers[11]) === 11 - remainder;
    }
    return false;
  }, 'CNS inválido');

const phoneSchema = z.string()
  .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000');

// Search form schemas
const basicSearchSchema = z.object({
  searchTerm: z.string().min(1, 'Digite um termo de busca'),
  searchType: z.enum(['name', 'cpf', 'phone', 'email']),
});

const advancedSearchSchema = z.object({
  name: z.string().optional(),
  cpf: cpfSchema.optional().or(z.literal('')),
  cns: cnsSchema.optional().or(z.literal('')),
  rg: z.string().optional(),
  phone: phoneSchema.optional().or(z.literal('')),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  birthDateFrom: z.string().optional(),
  birthDateTo: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type BasicSearchData = z.infer<typeof basicSearchSchema>;
type AdvancedSearchData = z.infer<typeof advancedSearchSchema>;

interface PatientSearchResult {
  id: string;
  name: string;
  cpf: string;
  cns?: string;
  rg?: string;
  phone: string;
  email: string;
  birthDate: Date;
  address: {
    city: string;
    state: string;
    zipCode: string;
  };
  status: 'active' | 'inactive' | 'pending';
  lastVisit?: Date;
  consentStatus: 'granted' | 'pending' | 'withdrawn';
  matchScore: number; // Relevance score for search results
  matchReasons: string[]; // Why this result matched
}

interface HealthcareSearchProps {
  onPatientSelect: (patient: PatientSearchResult) => void;
  onCreatePatient?: (searchData?: Partial<AdvancedSearchData>) => void;
  isLoading?: boolean;
  className?: string;
}

// Brazilian states for address validation
const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
  'SP', 'SE', 'TO'
];

// Format Brazilian documents
const formatCpf = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatCns = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
};

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return value;
};

// Document validation status component
const ValidationStatus = ({ isValid, message }: { isValid: boolean; message: string }) => (
  <div className={cn('flex items-center gap-1 text-xs', isValid ? 'text-green-600' : 'text-red-600')}>
    {isValid ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
    <span>{message}</span>
  </div>
);

// Search result card component
const SearchResultCard = ({ 
  patient, 
  onSelect 
}: { 
  patient: PatientSearchResult; 
  onSelect: (patient: PatientSearchResult) => void;
}) => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelect(patient)}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium">{patient.name}</h3>
            <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
              {patient.status === 'active' ? 'Ativo' : 
               patient.status === 'inactive' ? 'Inativo' : 'Pendente'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {Math.round(patient.matchScore * 100)}% match
            </Badge>
          </div>
          
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span className="font-mono">{patient.cpf}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span>{patient.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>{patient.address.city}, {patient.address.state}</span>
            </div>
          </div>

          {patient.matchReasons.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-blue-600">Correspondências encontradas:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {patient.matchReasons.map((reason, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Shield className={cn('h-4 w-4', 
            patient.consentStatus === 'granted' ? 'text-green-600' : 
            patient.consentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
          )} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export function HealthcareSearch({
  onPatientSelect,
  onCreatePatient,
  isLoading = false,
  className,
}: HealthcareSearchProps) {
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  const basicForm = useForm<BasicSearchData>({
    resolver: zodResolver(basicSearchSchema),
    defaultValues: {
      searchTerm: '',
      searchType: 'name',
    },
  });

  const advancedForm = useForm<AdvancedSearchData>({
    resolver: zodResolver(advancedSearchSchema),
    defaultValues: {},
  });

  // Mock search function - replace with actual API call
  const performSearch = useCallback(async (searchData: BasicSearchData | AdvancedSearchData) => {
    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock results - replace with actual search logic
    const mockResults: PatientSearchResult[] = [
      {
        id: '1',
        name: 'Maria Silva Santos',
        cpf: '123.456.789-00',
        cns: '123 4567 8901 2345',
        phone: '(11) 99999-9999',
        email: 'maria.silva@email.com',
        birthDate: new Date('1985-03-15'),
        address: {
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
        status: 'active',
        lastVisit: new Date('2024-01-15'),
        consentStatus: 'granted',
        matchScore: 0.95,
        matchReasons: ['Nome completo', 'CPF'],
      },
      {
        id: '2',
        name: 'João Carlos Oliveira',
        cpf: '987.654.321-00',
        phone: '(11) 88888-8888',
        email: 'joao.oliveira@email.com',
        birthDate: new Date('1975-08-22'),
        address: {
          city: 'São Paulo',
          state: 'SP',
          zipCode: '04567-890',
        },
        status: 'active',
        consentStatus: 'pending',
        matchScore: 0.87,
        matchReasons: ['Nome parcial', 'Telefone'],
      },
    ];
    
    setSearchResults(mockResults);
    setIsSearching(false);
  }, []);

  const handleBasicSearch = async (data: BasicSearchData) => {
    await performSearch(data);
  };

  const handleAdvancedSearch = async (data: AdvancedSearchData) => {
    await performSearch(data);
  };

  const handleCreatePatient = () => {
    const searchData = activeTab === 'advanced' ? advancedForm.getValues() : undefined;
    onCreatePatient?.(searchData);
  };

  // Handle formatted input changes
  const handleCpfChange = (value: string, onChange: (value: string) => void) => {
    const formatted = formatCpf(value);
    if (formatted.length <= 14) onChange(formatted);
  };

  const handleCnsChange = (value: string, onChange: (value: string) => void) => {
    const formatted = formatCns(value);
    if (formatted.length <= 18) onChange(formatted);
  };

  const handlePhoneChange = (value: string, onChange: (value: string) => void) => {
    const formatted = formatPhone(value);
    if (formatted.length <= 15) onChange(formatted);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca de Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Busca Rápida</TabsTrigger>
              <TabsTrigger value="advanced">Busca Avançada</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Form {...basicForm}>
                <form onSubmit={basicForm.handleSubmit(handleBasicSearch)} className="space-y-4">
                  <div className="flex gap-2">
                    <FormField
                      control={basicForm.control}
                      name="searchType"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="name">Nome</SelectItem>
                              <SelectItem value="cpf">CPF</SelectItem>
                              <SelectItem value="phone">Telefone</SelectItem>
                              <SelectItem value="email">E-mail</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={basicForm.control}
                      name="searchTerm"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Digite para buscar..."
                              {...field}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isSearching} className="h-10 px-6">
                      {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Form {...advancedForm}>
                <form onSubmit={advancedForm.handleSubmit(handleAdvancedSearch)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={advancedForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Maria Silva Santos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={advancedForm.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000.000.000-00"
                              value={field.value || ''}
                              onChange={(e) => handleCpfChange(e.target.value, field.onChange)}
                            />
                          </FormControl>
                          {field.value && (
                            <ValidationStatus
                              isValid={cpfSchema.safeParse(field.value).success}
                              message={cpfSchema.safeParse(field.value).success ? 'CPF válido' : 'CPF inválido'}
                            />
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={advancedForm.control}
                      name="cns"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNS (Cartão Nacional de Saúde)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000 0000 0000 0000"
                              value={field.value || ''}
                              onChange={(e) => handleCnsChange(e.target.value, field.onChange)}
                            />
                          </FormControl>
                          {field.value && (
                            <ValidationStatus
                              isValid={cnsSchema.safeParse(field.value).success}
                              message={cnsSchema.safeParse(field.value).success ? 'CNS válido' : 'CNS inválido'}
                            />
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={advancedForm.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 12.345.678-9" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={advancedForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(00) 00000-0000"
                              value={field.value || ''}
                              onChange={(e) => handlePhoneChange(e.target.value, field.onChange)}
                            />
                          </FormControl>
                          {field.value && (
                            <ValidationStatus
                              isValid={phoneSchema.safeParse(field.value).success}
                              message={phoneSchema.safeParse(field.value).success ? 'Telefone válido' : 'Formato inválido'}
                            />
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={advancedForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="exemplo@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={advancedForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="São Paulo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={advancedForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BRAZILIAN_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSearching} className="flex-1">
                      {isSearching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Buscar Pacientes
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => advancedForm.reset()}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Limpar
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Resultados da Busca ({searchResults.length})
              </CardTitle>
              {onCreatePatient && (
                <Button onClick={handleCreatePatient} variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Novo Paciente
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {searchResults.map((patient) => (
              <SearchResultCard
                key={patient.id}
                patient={patient}
                onSelect={onPatientSelect}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchResults.length === 0 && !isSearching && activeTab && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum paciente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os critérios de busca ou cadastrar um novo paciente
            </p>
            {onCreatePatient && (
              <Button onClick={handleCreatePatient}>
                <User className="mr-2 h-4 w-4" />
                Cadastrar Novo Paciente
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default HealthcareSearch;
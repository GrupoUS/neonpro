# Aesthetic Clinic Frontend Components

## 🎨 Component Architecture Overview

The aesthetic clinic frontend is built with React 19, TypeScript, and shadcn/ui components. The architecture follows a modular approach with dedicated components for different functional areas while maintaining full Brazilian healthcare compliance.

## 📁 Component Structure

```
apps/web/src/components/
├── aesthetic/
│   ├── client-management/
│   ├── treatment-planning/
│   ├── session-tracking/
│   ├── scheduling/
│   └── compliance/
├── shared/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   └── modals/
└── layout/
    ├── dashboard/
    ├── navigation/
    └── header/
```

## 👥 Client Management Components

### ClientProfileCard

```typescript
// apps/web/src/components/aesthetic/client-management/ClientProfileCard.tsx
interface ClientProfileCardProps {
  client: AestheticClientProfile;
  onEdit?: (client: AestheticClientProfile) => void;
  onViewDetails?: (clientId: string) => void;
  onDelete?: (clientId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const ClientProfileCard: React.FC<ClientProfileCardProps> = ({
  client,
  onEdit,
  onViewDetails,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const { formatCPF, formatPhone } = useFormatting();
  const { hasPermission } = usePermissions();
  const { showLGPDConsent } = useCompliance();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={client.profilePhotoUrl} />
            <AvatarFallback>
              {getInitials(client.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{client.fullName}</CardTitle>
            <CardDescription>
              {client.profession} • {formatCPF(client.cpf)}
            </CardDescription>
          </div>
        </div>
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hasPermission('clients:read') && (
                <DropdownMenuItem onClick={() => onViewDetails?.(client.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </DropdownMenuItem>
              )}
              {hasPermission('clients:update') && (
                <DropdownMenuItem onClick={() => onEdit?.(client)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {hasPermission('compliance:read') && (
                <DropdownMenuItem onClick={() => showLGPDConsent(client.id)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Ver Consentimento LGPD
                </DropdownMenuItem>
              )}
              {hasPermission('clients:delete') && (
                <DropdownMenuSeparator />
              )}
              {hasPermission('clients:delete') && (
                <DropdownMenuItem 
                  onClick={() => onDelete?.(client.id)}
                  className="text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="mr-2 h-4 w-4" />
              {formatPhone(client.phone)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="mr-2 h-4 w-4" />
              {client.email}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              {format(new Date(client.dateOfBirth), 'dd/MM/yyyy')}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4" />
              {client.skinType} • {client.skinTone}
            </div>
            <div className="flex items-center text-sm">
              <Heart className="mr-2 h-4 w-4" />
              {client.aestheticGoals?.length || 0} objetivos estéticos
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              LGPD: {client.lgpdConsentGiven ? 'Consentido' : 'Pendente'}
            </div>
          </div>
        </div>
        {!compact && client.treatmentHistory && client.treatmentHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Histórico de Tratamentos</span>
              <Badge variant="secondary">{client.treatmentHistory.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {client.treatmentHistory.slice(0, 3).map((treatment, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {treatment}
                </Badge>
              ))}
              {client.treatmentHistory.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{client.treatmentHistory.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

### ClientRegistrationForm

```typescript
// apps/web/src/components/aesthetic/client-management/ClientRegistrationForm.tsx
interface ClientRegistrationFormProps {
  onSubmit: (data: CreateAestheticClientInput) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<CreateAestheticClientInput>;
  isLoading?: boolean;
}

const ClientRegistrationForm: React.FC<ClientRegistrationFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false
}) => {
  const { control, handleSubmit, formState: { errors }, watch } = useForm<CreateAestheticClientInput>({
    resolver: zodResolver(createAestheticClientSchema),
    defaultValues: initialData
  });

  const { showLGPDModal } = useCompliance();
  const [lgpdConsent, setLgpdConsent] = useState(false);

  const watchedValues = watch();

  const handleFormSubmit = async (data: CreateAestheticClientInput) => {
    if (!lgpdConsent) {
      const consent = await showLGPDModal();
      if (!consent) return;
      setLgpdConsent(true);
      data.lgpdConsent = consent;
    }
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Dados básicos do cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Maria Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123.456.789-00"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
          <CardDescription>
            Informações para comunicação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(11) 98765-4321"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input placeholder="maria.silva@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="preferredContactMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferência de Contato</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Médicas</CardTitle>
          <CardDescription>
            Dados relevantes para tratamentos estéticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="skinType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pele</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="seca">Seca</SelectItem>
                      <SelectItem value="oleosa">Oleosa</SelectItem>
                      <SelectItem value="mista">Mista</SelectItem>
                      <SelectItem value="sensivel">Sensível</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="skinTone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tom de Pele</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="claro">Claro</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="escuro">Escuro</SelectItem>
                      <SelectItem value="negro">Negro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={control}
            name="medicalConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condições Médicas</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Liste condições médicas relevantes (separadas por vírgula)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Ex: Diabetes, Hipertensão, Alergias, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="allergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alergias</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Liste alergias conhecidas (separadas por vírgula)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Ex: Alergia a lidocaína, látex, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="aestheticGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objetivos Estéticos</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Quais são os objetivos estéticos do cliente?"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Ex: Redução de rugas, Melhora na textura, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Contato de Emergência</CardTitle>
          <CardDescription>
            Informações para casos de emergência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="emergencyContact.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="emergencyContact.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(11) 98765-4321"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* LGPD Consent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Consentimento LGPD
          </CardTitle>
          <CardDescription>
            Consentimento para tratamento de dados pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                O consentimento LGPD é obrigatório para cadastro de clientes.
              </AlertDescription>
            </Alert>
            
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                const consent = await showLGPDModal();
                if (consent) {
                  setLgpdConsent(true);
                }
              }}
              className="w-full"
            >
              <Shield className="mr-2 h-4 w-4" />
              {lgpdConsent ? 'Consentimento Confirmado' : 'Obter Consentimento LGPD'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !lgpdConsent}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cadastrando...
            </>
          ) : (
            'Cadastrar Cliente'
          )}
        </Button>
      </div>
    </form>
  );
};
```

## 💉 Treatment Planning Components

### TreatmentPlanner

```typescript
// apps/web/src/components/aesthetic/treatment-planning/TreatmentPlanner.tsx
interface TreatmentPlannerProps {
  clientId: string;
  professionalId?: string;
  onSave?: (plan: TreatmentPlan) => void;
  onCancel?: () => void;
}

const TreatmentPlanner: React.FC<TreatmentPlannerProps> = ({
  clientId,
  professionalId,
  onSave,
  onCancel
}) => {
  const { treatments, loading: treatmentsLoading } = useTreatments();
  const { client } = useClient(clientId);
  const { professionals } = useProfessionals();
  const { generateAIRecommendations } = useAI();
  
  const [selectedTreatments, setSelectedTreatments] = useState<SelectedTreatment[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddTreatment = (treatment: AestheticTreatment) => {
    const newTreatment: SelectedTreatment = {
      treatment,
      sessions: treatment.requiredSessions,
      intervalDays: treatment.sessionIntervalDays,
      customNotes: ''
    };
    setSelectedTreatments([...selectedTreatments, newTreatment]);
  };

  const handleRemoveTreatment = (index: number) => {
    setSelectedTreatments(selectedTreatments.filter((_, i) => i !== index));
  };

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const recommendations = await generateAIRecommendations({
        clientId,
        goals: client?.aestheticGoals || [],
        skinType: client?.skinType,
        skinTone: client?.skinTone,
        medicalConditions: client?.medicalConditions || [],
        contraindications: client?.contraindications || []
      });
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateTotalPlan = () => {
    return selectedTreatments.reduce((total, treatment) => {
      return total + (treatment.treatment.basePrice * treatment.sessions);
    }, 0);
  };

  const estimateDuration = () => {
    const days = selectedTreatments.reduce((total, treatment) => {
      return total + (treatment.sessions * treatment.intervalDays);
    }, 0);
    return Math.ceil(days / 30); // Convert to months
  };

  return (
    <div className="space-y-6">
      {/* Client Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Plano de Tratamento</CardTitle>
          <CardDescription>
            Cliente: {client?.fullName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {selectedTreatments.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Tratamentos Selecionados
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {estimateDuration()}
              </div>
              <div className="text-sm text-muted-foreground">
                Meses Estimados
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(calculateTotalPlan())}
              </div>
              <div className="text-sm text-muted-foreground">
                Custo Estimado
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recomendações IA</span>
            <Button
              onClick={handleGenerateRecommendations}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Gerar Recomendações
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiRecommendations.map((rec, index) => (
                <Card key={index} className="cursor-pointer hover:bg-accent/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{rec.treatmentName}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={rec.confidence > 0.8 ? 'default' : 'secondary'}>
                        {Math.round(rec.confidence * 100)}% confiança
                      </Badge>
                      <Badge variant="outline">{rec.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      {rec.reasoning}
                    </p>
                    <div className="space-y-1">
                      <div className="text-xs">
                        <strong>Benefícios:</strong> {rec.benefits.join(', ')}
                      </div>
                      <div className="text-xs">
                        <strong>Riscos:</strong> {rec.risks.join(', ')}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => {
                        const treatment = treatments.find(t => t.id === rec.treatmentId);
                        if (treatment) {
                          handleAddTreatment(treatment);
                        }
                      }}
                    >
                      Adicionar ao Plano
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Clique em "Gerar Recomendações" para sugestões baseadas em IA</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Treatment Catalog */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Tratamentos</CardTitle>
          <CardDescription>
            Selecione os tratamentos para o plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          {treatmentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatments.map((treatment) => (
                <Card key={treatment.id} className="cursor-pointer hover:bg-accent/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{treatment.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{treatment.category}</Badge>
                      <Badge variant={treatment.anvisaRegistration ? 'default' : 'destructive'}>
                        {treatment.anvisaRegistration ? 'ANVISA' : 'Pendente'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {treatment.description}
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Duração:</span>
                        <span>{treatment.durationMinutes} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessões:</span>
                        <span>{treatment.requiredSessions}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Preço:</span>
                        <span>{formatCurrency(treatment.basePrice)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleAddTreatment(treatment)}
                      disabled={selectedTreatments.some(t => t.treatment.id === treatment.id)}
                    >
                      {selectedTreatments.some(t => t.treatment.id === treatment.id) 
                        ? 'Adicionado' 
                        : 'Adicionar ao Plano'
                      }
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Treatments */}
      {selectedTreatments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tratamentos Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTreatments.map((treatment, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{treatment.treatment.name}</h4>
                      <Badge variant="outline">{treatment.treatment.category}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sessões: </span>
                        <Input
                          type="number"
                          value={treatment.sessions}
                          onChange={(e) => {
                            const newTreatments = [...selectedTreatments];
                            newTreatments[index].sessions = parseInt(e.target.value) || 1;
                            setSelectedTreatments(newTreatments);
                          }}
                          className="w-20"
                          min="1"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground">Intervalo: </span>
                        <Input
                          type="number"
                          value={treatment.intervalDays}
                          onChange={(e) => {
                            const newTreatments = [...selectedTreatments];
                            newTreatments[index].intervalDays = parseInt(e.target.value) || 7;
                            setSelectedTreatments(newTreatments);
                          }}
                          className="w-20"
                          min="1"
                        />
                        <span className="text-muted-foreground ml-1">dias</span>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(treatment.treatment.basePrice * treatment.sessions)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTreatment(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          onClick={() => {
            const plan: TreatmentPlan = {
              clientId,
              professionalId: professionalId || professionals[0]?.id,
              name: `Plano de Tratamento - ${client?.fullName}`,
              treatments: selectedTreatments.map(t => ({
                treatmentId: t.treatment.id,
                sessions: t.sessions,
                intervalDays: t.intervalDays,
                notes: t.customNotes
              })),
              totalEstimatedSessions: selectedTreatments.reduce((sum, t) => sum + t.sessions, 0),
              estimatedTotalCost: calculateTotalPlan(),
              status: 'planning'
            };
            onSave?.(plan);
          }}
          disabled={selectedTreatments.length === 0}
        >
          Salvar Plano
        </Button>
      </div>
    </div>
  );
};
```

## 📅 Scheduling Components

### AICalendarScheduler

```typescript
// apps/web/src/components/aesthetic/scheduling/AICalendarScheduler.tsx
interface AICalendarSchedulerProps {
  professionalId?: string;
  clientId?: string;
  treatmentId?: string;
  onAppointmentSelect?: (appointment: AestheticAppointment) => void;
  onAppointmentCreate?: (appointment: CreateAppointmentInput) => Promise<void>;
}

const AICalendarScheduler: React.FC<AICalendarSchedulerProps> = ({
  professionalId,
  clientId,
  treatmentId,
  onAppointmentSelect,
  onAppointmentCreate
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>();
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult>();
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const { appointments, loading } = useAppointments(selectedDate);
  const { professionals } = useProfessionals();
  const { treatments } = useTreatments();
  const { optimizeSchedule } = useAIScheduling();

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(undefined);
  };

  const handleOptimizeSchedule = async () => {
    if (!clientId || !treatmentId) return;
    
    setIsOptimizing(true);
    try {
      const results = await optimizeSchedule({
        clientId,
        treatmentId,
        preferredDates: [{
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate)
        }],
        professionalIds: professionalId ? [professionalId] : undefined,
        constraints: {
          timeWindows: [
            { dayOfWeek: getDay(selectedDate), startTime: '09:00', endTime: '18:00' }
          ],
          professionalAvailability: true,
          roomAvailability: true,
          minimumDuration: treatments.find(t => t.id === treatmentId)?.durationMinutes || 30,
          maximumDuration: 120,
          avoidProfessionalConflicts: true,
          considerNoShowRisk: true
        },
        preferences: {
          preferredTimeOfDay: 'morning',
          allowSameDay: true,
          allowWeekend: false,
          reminderTiming: 24
        }
      });
      
      setOptimizationResults(results);
    } catch (error) {
      console.error('Failed to optimize schedule:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const renderCalendar = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Calendário</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
                {generateCalendarDays(selectedDate).map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "text-center p-2 rounded cursor-pointer transition-colors",
                      isSameDay(day, selectedDate) 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent",
                      isToday(day) && "border-2 border-primary",
                      !isSameMonth(day, selectedDate) && "text-muted-foreground"
                    )}
                    onClick={() => handleDateChange(day)}
                  >
                    <div className="text-sm">{format(day, 'd')}</div>
                    <div className="text-xs">
                      {getAppointmentsForDay(day).length}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Slots */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Horários Disponíveis</CardTitle>
              <CardDescription>
                {format(selectedDate, 'dd/MM/yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generateTimeSlots().map((slot) => (
                  <Button
                    key={slot.start}
                    variant={selectedTimeSlot?.start === slot.start ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedTimeSlot(slot)}
                    disabled={slot.appointments.length >= 3}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                    {slot.appointments.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {slot.appointments.length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderOptimizationResults = () => {
    if (!optimizationResults) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recomendações de Agendamento</CardTitle>
          <CardDescription>
            Baseado em IA e análise de disponibilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizationResults.recommendations.map((rec, index) => (
              <Card key={index} className="cursor-pointer hover:bg-accent/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{rec.professionalName}</span>
                    <Badge variant={rec.confidenceScore > 0.8 ? 'default' : 'secondary'}>
                      {Math.round(rec.confidenceScore * 100)}%
                    </Badge>
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {format(rec.scheduledStart, 'dd/MM/yyyy HH:mm')} - {format(rec.scheduledEnd, 'HH:mm')}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-3 w-3" />
                      Sala {rec.roomId}
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="mr-2 h-3 w-3" />
                      Risco não comparecimento: {Math.round(rec.noShowRisk * 100)}%
                    </div>
                    <div className="flex items-center">
                      <Shield className="mr-2 h-3 w-3" />
                      Score conformidade: {Math.round(rec.complianceScore * 100)}%
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => {
                      setSelectedTimeSlot({
                        start: rec.scheduledStart,
                        end: rec.scheduledEnd,
                        professionalId: rec.professionalId,
                        roomId: rec.roomId
                      });
                    }}
                  >
                    Selecionar Horário
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Professional Selection */}
      {!professionalId && (
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professionals.map((prof) => (
                <Card 
                  key={prof.id} 
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => handleProfessionalSelect(prof.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{prof.fullName}</CardTitle>
                    <Badge variant="outline">{prof.professionalType}</Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground">
                      <div>CRM: {prof.cfmCrmNumber}/{prof.cfmCrmState}</div>
                      <div>Especialidade: {prof.cfmCrmSpecialty}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar and Time Slots */}
      {renderCalendar()}

      {/* AI Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            Otimização Inteligente
          </CardTitle>
          <CardDescription>
            Use IA para encontrar os melhores horários baseados em múltiplos fatores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleOptimizeSchedule}
            disabled={isOptimizing || !clientId || !treatmentId}
            className="w-full"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Otimizando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Otimizar Agendamento
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {renderOptimizationResults()}

      {/* Appointment Creation */}
      {selectedTimeSlot && (
        <AppointmentCreationModal
          timeSlot={selectedTimeSlot}
          clientId={clientId}
          treatmentId={treatmentId}
          professionalId={professionalId}
          onSave={onAppointmentCreate}
          onClose={() => setSelectedTimeSlot(undefined)}
        />
      )}
    </div>
  );
};
```

## 🛡️ Compliance Components

### LGPDConsentModal

```typescript
// apps/web/src/components/aesthetic/compliance/LGPDConsentModal.tsx
interface LGPDConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: (consent: LGPDConsentData) => void;
  clientData?: {
    name: string;
    email: string;
    phone: string;
  };
}

const LGPDConsentModal: React.FC<LGPDConsentModalProps> = ({
  isOpen,
  onClose,
  onConsent,
  clientData
}) => {
  const [consentData, setConsentData] = useState<LGPDConsentData>({
    dataProcessing: false,
    marketing: false,
    communication: false,
    consentDate: new Date(),
    ip: '',
    userAgent: ''
  });
  const [isAccepting, setIsAccepting] = useState(false);

  const handleConsent = async () => {
    setIsAccepting(true);
    try {
      const finalConsent = {
        ...consentData,
        ip: await getClientIP(),
        userAgent: navigator.userAgent,
        consentDate: new Date()
      };
      onConsent(finalConsent);
      onClose();
    } catch (error) {
      console.error('Failed to get client IP:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            Termo de Consentimento LGPD
          </DialogTitle>
          <DialogDescription>
            Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <Alert>
            <User className="h-4 w-4" />
            <AlertTitle>Informações do Titular</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1 text-sm">
                <div><strong>Nome:</strong> {clientData?.name}</div>
                <div><strong>Email:</strong> {clientData?.email}</div>
                <div><strong>Telefone:</strong> {clientData?.phone}</div>
              </div>
            </AlertDescription>
          </Alert>

          {/* LGPD Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">O que é a LGPD?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A Lei Geral de Proteção de Dados (LGPD) estabelece regras sobre a coleta, 
                armazenamento, tratamento e compartilhamento de dados pessoais, garantindo 
                maior transparência e controle aos cidadãos sobre seus dados.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Seus Direitos:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Confirmar existência de tratamento</li>
                    <li>• Acessar seus dados</li>
                    <li>• Corrigir dados incorretos</li>
                    <li>• Solicitar exclusão de dados</li>
                    <li>• Saber sobre compartilhamentos</li>
                    <li>• Revogar consentimento</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Nossos Compromissos:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Transparência no tratamento</li>
                    <li>• Finalidade específica e clara</li>
                    <li>• Duração limitada do armazenamento</li>
                    <li>• Segurança e proteção dos dados</li>
                    <li>• Respeito aos seus direitos</li>
                    <li>• Conformidade com a legislação</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Usamos Seus Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Tratamento Médico</h4>
                    <p className="text-sm text-muted-foreground">
                      Seus dados de saúde são utilizados para fornecer tratamentos estéticos 
                      personalizados e seguros, mantendo total confidencialidade.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Agendamento</h4>
                    <p className="text-sm text-muted-foreground">
                      Informações de contato são usadas para agendamentos, confirmações 
                      e lembretes de consulta.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Histórico e Evolução</h4>
                    <p className="text-sm text-muted-foreground">
                      Seu histórico de tratamentos é armazenado para acompanhamento 
                    da evolução e resultados obtidos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consent Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Autorizações</CardTitle>
              <CardDescription>
                Selecione as autorizações que deseja conceder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="dataProcessing"
                    checked={consentData.dataProcessing}
                    onCheckedChange={(checked) => 
                      setConsentData(prev => ({ ...prev, dataProcessing: !!checked }))
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="dataProcessing" className="font-medium">
                      Tratamento de Dados Pessoais
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Autorizo o tratamento de meus dados pessoais para fins de prestação 
                      de serviços estéticos, em conformidade com a LGPD.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="communication"
                    checked={consentData.communication}
                    onCheckedChange={(checked) => 
                      setConsentData(prev => ({ ...prev, communication: !!checked }))
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="communication" className="font-medium">
                      Comunicação
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Autorizo o envio de comunicações relacionadas a meus tratamentos, 
                      incluindo confirmações, lembretes e follow-ups.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketing"
                    checked={consentData.marketing}
                    onCheckedChange={(checked) => 
                      setConsentData(prev => ({ ...prev, marketing: !!checked }))
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="marketing" className="font-medium">
                      Marketing e Promoções
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Autorizo o envio de comunicações promocionais sobre novos 
                      tratamentos, ofertas especiais e eventos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Proteção de Dados</AlertTitle>
            <AlertDescription>
              Implementamos medidas rigorosas de segurança para proteger seus dados, 
              incluindo criptografia, controle de acesso e monitoramento constante. 
              Você pode revogar este consentimento a qualquer momento.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleConsent}
              disabled={!consentData.dataProcessing || isAccepting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Aceitar e Continuar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

## 📊 Dashboard Components

### AestheticClinicDashboard

```typescript
// apps/web/src/components/aesthetic/dashboard/AestheticClinicDashboard.tsx
interface AestheticClinicDashboardProps {
  dateRange?: {
    start: Date;
    end: Date;
  };
}

const AestheticClinicDashboard: React.FC<AestheticClinicDashboardProps> = ({
  dateRange
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const { analytics, loading } = useAestheticAnalytics(dateRange);
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { clients, loading: clientsLoading } = useClients();
  const { professionals } = useProfessionals();

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.newClientsThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.clientGrowth || 0}% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.appointmentUtilization || 0}% de ocupação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.revenueGrowth || 0}% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.averageSatisfaction?.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Média de avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.revenueTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tratamentos Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.popularTreatments || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="treatmentName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-6">
      {/* Compliance Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LGPD</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.compliance?.lgpd?.complianceScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.compliance?.lgpd?.pendingReviews || 0} revisões pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ANVISA</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.compliance?.anvisa?.validTreatments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              tratamentos validados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CFM</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.compliance?.cfm?.validProfessionals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              profissionais validados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Conformidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.compliance?.alerts?.map((alert) => (
              <Alert key={alert.id} className={getAlertVariant(alert.severity)}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>
                  {alert.description}
                  {alert.dueDate && (
                    <div className="mt-1 text-xs">
                      Prazo: {format(new Date(alert.dueDate), 'dd/MM/yyyy')}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard da Clínica Estética</h1>
          <p className="text-muted-foreground">
            Visão geral das operações e métricas
          </p>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            renderOverviewTab()
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <ClientAnalyticsView dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <AppointmentAnalyticsView dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            renderComplianceTab()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

This comprehensive component architecture provides a robust foundation for the aesthetic clinic frontend with full Brazilian healthcare compliance, AI-powered features, and exceptional user experience.

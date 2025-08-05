'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConsentForm } from '@/app/types/compliance';
import { ConsentService } from '@/app/services/consent.service';
import { Plus, Edit, Eye, Archive, FileText, Calendar, Users, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConsentFormsManagerProps {
  clinicId: string;
  userRole: string;
}

export function ConsentFormsManager({ clinicId, userRole }: ConsentFormsManagerProps) {
  const [consentForms, setConsentForms] = useState<ConsentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<ConsentForm | null>(null);
  const { toast } = useToast();
  const consentService = new ConsentService();

  useEffect(() => {
    loadConsentForms();
  }, [clinicId]);

  const loadConsentForms = async () => {
    try {
      setLoading(true);
      const forms = await consentService.getConsentForms(clinicId);
      setConsentForms(forms);
    } catch (error) {
      console.error('Error loading consent forms:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os formulários de consentimento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveForm = async (formId: string) => {
    try {
      await consentService.deactivateConsentForm(formId);
      toast({
        title: 'Sucesso',
        description: 'Formulário arquivado com sucesso.',
      });
      loadConsentForms();
    } catch (error) {
      console.error('Error archiving form:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível arquivar o formulário.',
        variant: 'destructive',
      });
    }
  };

  const getConsentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      data_processing: 'Processamento de Dados',
      medical_treatment: 'Tratamento Médico',
      marketing: 'Marketing',
      research: 'Pesquisa',
      data_sharing: 'Compartilhamento de Dados',
      telehealth: 'Telemedicina',
      photography: 'Fotografias',
      communication: 'Comunicação'
    };
    return labels[type] || type;
  };

  const getLegalBasisLabel = (basis?: string) => {
    const labels: Record<string, string> = {
      consent: 'Consentimento',
      legitimate_interest: 'Interesse Legítimo',
      vital_interests: 'Interesses Vitais',
      legal_obligation: 'Obrigação Legal',
      public_task: 'Tarefa Pública',
      contract: 'Contrato'
    };
    return basis ? labels[basis] || basis : 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Formulários de Consentimento</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie formulários de consentimento para conformidade com LGPD
          </p>
        </div>
        {userRole === 'admin' && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Formulário
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total de Formulários</p>
                <p className="text-2xl font-bold">{consentForms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Ativos</p>
                <p className="text-2xl font-bold">
                  {consentForms.filter(f => f.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Com Auto-Expiração</p>
                <p className="text-2xl font-bold">
                  {consentForms.filter(f => f.auto_expire).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Tipos de Consentimento</p>
                <p className="text-2xl font-bold">
                  {new Set(consentForms.map(f => f.consent_type)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consent Forms List */}
      <div className="grid gap-4">
        {consentForms.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum formulário encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro formulário de consentimento.
              </p>
              {userRole === 'admin' && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Formulário
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          consentForms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{form.form_name}</CardTitle>
                    <CardDescription className="mt-1">
                      {form.consent_type}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={form.is_active ? 'default' : 'secondary'}
                      className={form.is_active ? 'bg-green-100 text-green-800' : ''}
                    >
                      {form.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">
                      {getConsentTypeLabel(form.consent_type)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Base Legal</p>
                    <p>{getLegalBasisLabel(form.legal_basis)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Versão</p>
                    <p>{form.form_version}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Auto-Expiração</p>
                    <p>{form.auto_expire ? 'Sim' : 'Não'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Criado em</p>
                    <p>{new Date(form.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                {form.auto_expire && form.retention_period_days && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Expira automaticamente em {form.retention_period_days} dias após consentimento
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Última atualização: {new Date(form.updated_at).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                    {userRole === 'admin' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        {form.is_active && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleArchiveForm(form.id)}
                          >
                            <Archive className="w-4 h-4 mr-1" />
                            Arquivar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

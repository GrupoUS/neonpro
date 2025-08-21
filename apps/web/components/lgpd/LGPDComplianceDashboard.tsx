'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings
} from 'lucide-react';

interface DataProcessingRecord {
  id: string;
  category: 'health' | 'identifying' | 'behavioral' | 'financial';
  purpose: string;
  lawfulBasis: string;
  dataCollected: string[];
  retentionPeriod: number;
  lastUpdated: Date;
  status: 'active' | 'deleted' | 'anonymized';
}

interface ConsentRecord {
  id: string;
  type: 'data_processing' | 'marketing' | 'analytics' | 'research';
  status: 'granted' | 'withdrawn' | 'pending';
  grantedAt?: Date;
  withdrawnAt?: Date;
  description: string;
}

interface DataSubjectRights {
  access: { available: boolean; lastRequested?: Date; status?: string };
  rectification: { available: boolean; lastRequested?: Date; status?: string };
  erasure: { available: boolean; lastRequested?: Date; status?: string };
  portability: { available: boolean; lastRequested?: Date; status?: string };
}

export default function LGPDComplianceDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'consent' | 'rights'>('overview');
  const [dataProcessing, setDataProcessing] = useState<DataProcessingRecord[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [rights, setRights] = useState<DataSubjectRights>({
    access: { available: true },
    rectification: { available: true }, 
    erasure: { available: true },
    portability: { available: true }
  });
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<{title: string; description: string}>({
    title: '', description: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Mock data - integrate with real API
    setDataProcessing([
      {
        id: '1',
        category: 'health',
        purpose: 'Prestação de cuidados médicos',
        lawfulBasis: 'Cuidados de saúde (Art. 11, LGPD)',
        dataCollected: ['Nome', 'CPF', 'Histórico médico', 'Exames'],
        retentionPeriod: 20 * 365, // 20 years for medical data
        lastUpdated: new Date(),
        status: 'active'
      },
      {
        id: '2', 
        category: 'identifying',
        purpose: 'Identificação e comunicação',
        lawfulBasis: 'Execução de contrato (Art. 7, II)',
        dataCollected: ['Nome', 'E-mail', 'Telefone', 'Endereço'],
        retentionPeriod: 5 * 365,
        lastUpdated: new Date(),
        status: 'active'
      }
    ]);

    setConsents([
      {
        id: '1',
        type: 'data_processing',
        status: 'granted',
        grantedAt: new Date(),
        description: 'Processamento de dados para prestação de serviços médicos'
      },
      {
        id: '2',
        type: 'marketing', 
        status: 'withdrawn',
        grantedAt: new Date('2024-01-01'),
        withdrawnAt: new Date(),
        description: 'Comunicações de marketing e promoções'
      }
    ]);
  };

  const handleDataSubjectRight = async (rightType: keyof DataSubjectRights) => {
    switch (rightType) {
      case 'access':
        setDialogContent({
          title: 'Direito de Acesso (Art. 15, LGPD)',
          description: 'Solicitação de acesso aos seus dados pessoais processada. Você receberá um relatório completo em até 15 dias.'
        });
        break;
      case 'rectification':
        setDialogContent({
          title: 'Direito de Retificação (Art. 16, LGPD)', 
          description: 'Solicitação de correção de dados processada. Entre em contato com nosso DPO para especificar as correções necessárias.'
        });
        break;
      case 'erasure':
        setDialogContent({
          title: 'Direito ao Apagamento (Art. 16, LGPD)',
          description: 'ATENÇÃO: Esta ação apagará permanentemente seus dados médicos. Dados essenciais podem ser mantidos por obrigação legal.'
        });
        break;
      case 'portability':
        setDialogContent({
          title: 'Direito à Portabilidade (Art. 18, LGPD)',
          description: 'Seus dados serão exportados em formato estruturado. O download estará disponível em até 7 dias.'
        });
        break;
    }
    setShowDialog(true);
    
    // Update rights status
    setRights(prev => ({
      ...prev,
      [rightType]: {
        ...prev[rightType],
        lastRequested: new Date(),
        status: 'processing'
      }
    }));
  };  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': case 'granted': return 'default';
      case 'withdrawn': case 'deleted': return 'destructive';
      case 'pending': case 'processing': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return <Shield className="h-4 w-4" />;
      case 'identifying': return <Eye className="h-4 w-4" />;
      case 'behavioral': return <Settings className="h-4 w-4" />;
      case 'financial': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Painel de Conformidade LGPD</h1>
          <p className="text-gray-600">Gerencie seus direitos e dados pessoais conforme a Lei Geral de Proteção de Dados</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Visão Geral', icon: <Eye className="h-4 w-4" /> },
          { key: 'data', label: 'Meus Dados', icon: <FileText className="h-4 w-4" /> },
          { key: 'consent', label: 'Consentimentos', icon: <CheckCircle className="h-4 w-4" /> },
          { key: 'rights', label: 'Direitos', icon: <Shield className="h-4 w-4" /> }
        ].map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.key as any)}
            className="flex items-center space-x-2"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Dados Processados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataProcessing.filter(d => d.status === 'active').length}</div>
              <p className="text-xs text-gray-600">Categorias ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Consentimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {consents.filter(c => c.status === 'granted').length}
              </div>
              <p className="text-xs text-gray-600">Ativos de {consents.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">98%</div>
              <Progress value={98} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Retenção Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5</div>
              <p className="text-xs text-gray-600">anos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Processing Tab */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          {dataProcessing.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(record.category)}
                    <div>
                      <CardTitle className="text-lg">{record.purpose}</CardTitle>
                      <CardDescription>{record.lawfulBasis}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={getBadgeVariant(record.status)}>
                    {record.status === 'active' ? 'Ativo' : 
                     record.status === 'deleted' ? 'Excluído' : 'Anonimizado'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Dados Coletados</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {record.dataCollected.map((data, idx) => (
                        <li key={idx}>• {data}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Retenção</h4>
                    <p className="text-sm text-gray-600">
                      {Math.floor(record.retentionPeriod / 365)} anos
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Última Atualização</h4>
                    <p className="text-sm text-gray-600">
                      {record.lastUpdated.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}      {/* Consent Management Tab */}
      {activeTab === 'consent' && (
        <div className="space-y-4">
          {consents.map((consent) => (
            <Card key={consent.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {consent.type === 'data_processing' ? 'Processamento de Dados' :
                       consent.type === 'marketing' ? 'Marketing' :
                       consent.type === 'analytics' ? 'Analytics' : 'Pesquisa'}
                    </CardTitle>
                    <CardDescription>{consent.description}</CardDescription>
                  </div>
                  <Badge variant={getBadgeVariant(consent.status)}>
                    {consent.status === 'granted' ? 'Concedido' :
                     consent.status === 'withdrawn' ? 'Retirado' : 'Pendente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {consent.grantedAt && (
                      <p>Concedido em: {consent.grantedAt.toLocaleDateString('pt-BR')}</p>
                    )}
                    {consent.withdrawnAt && (
                      <p>Retirado em: {consent.withdrawnAt.toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>
                  <Button 
                    variant={consent.status === 'granted' ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => {
                      // Handle consent withdrawal/grant
                      const newStatus = consent.status === 'granted' ? 'withdrawn' : 'granted';
                      setConsents(prev => prev.map(c => 
                        c.id === consent.id 
                          ? { ...c, status: newStatus, [newStatus === 'withdrawn' ? 'withdrawnAt' : 'grantedAt']: new Date() }
                          : c
                      ));
                    }}
                  >
                    {consent.status === 'granted' ? 'Retirar Consentimento' : 'Conceder Consentimento'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data Subject Rights Tab */}
      {activeTab === 'rights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Direito de Acesso (Art. 15)</span>
              </CardTitle>
              <CardDescription>
                Solicite uma cópia de todos os seus dados pessoais que processamos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rights.access.lastRequested && (
                <p className="text-sm text-gray-600 mb-3">
                  Última solicitação: {rights.access.lastRequested.toLocaleDateString('pt-BR')}
                </p>
              )}
              <Button 
                onClick={() => handleDataSubjectRight('access')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Solicitar Acesso aos Dados
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>Direito de Retificação (Art. 16)</span>
              </CardTitle>
              <CardDescription>
                Solicite a correção de dados incorretos ou incompletos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rights.rectification.lastRequested && (
                <p className="text-sm text-gray-600 mb-3">
                  Última solicitação: {rights.rectification.lastRequested.toLocaleDateString('pt-BR')}
                </p>
              )}
              <Button 
                onClick={() => handleDataSubjectRight('rectification')}
                className="w-full"
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Solicitar Correção
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                <span>Direito ao Apagamento (Art. 16)</span>
              </CardTitle>
              <CardDescription>
                Solicite a exclusão dos seus dados pessoais (sujeito a obrigações legais).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-3 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Dados médicos podem ter retenção obrigatória</span>
              </div>
              {rights.erasure.lastRequested && (
                <p className="text-sm text-gray-600 mb-3">
                  Última solicitação: {rights.erasure.lastRequested.toLocaleDateString('pt-BR')}
                </p>
              )}
              <Button 
                onClick={() => handleDataSubjectRight('erasure')}
                className="w-full"
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Solicitar Exclusão
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Direito à Portabilidade (Art. 18)</span>
              </CardTitle>
              <CardDescription>
                Exporte seus dados em formato estruturado e legível por máquina.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rights.portability.lastRequested && (
                <p className="text-sm text-gray-600 mb-3">
                  Última solicitação: {rights.portability.lastRequested.toLocaleDateString('pt-BR')}
                </p>
              )}
              <Button 
                onClick={() => handleDataSubjectRight('portability')}
                className="w-full"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowDialog(false)}>
              Confirmar Solicitação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
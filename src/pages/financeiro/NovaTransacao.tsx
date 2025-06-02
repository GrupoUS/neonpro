import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionFormData {
  descricao: string;
  valor: string;
  tipo: 'receita' | 'despesa' | '';
  categoria: string;
  data_transacao: string;
  observacoes?: string;
}

const NovaTransacaoPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    descricao: '',
    valor: '',
    tipo: '',
    categoria: '',
    data_transacao: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  const categorias = {
    receita: [
      'Procedimentos Estéticos',
      'Consultas',
      'Produtos',
      'Outros Serviços'
    ],
    despesa: [
      'Insumos e Materiais',
      'Salários e Encargos',
      'Aluguel',
      'Utilidades (Luz, Água, Internet)',
      'Marketing',
      'Equipamentos',
      'Manutenção',
      'Impostos',
      'Outros'
    ]
  };

  const handleInputChange = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset categoria quando tipo muda
      ...(field === 'tipo' && { categoria: '' })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    // Validações
    if (!formData.descricao || !formData.valor || !formData.tipo || !formData.categoria) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    const valor = parseFloat(formData.valor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      toast({
        title: 'Erro',
        description: 'Valor deve ser um número válido maior que zero',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('transacoes')
        .insert({
          descricao: formData.descricao,
          valor: valor,
          tipo: formData.tipo,
          categoria: formData.categoria,
          data_transacao: formData.data_transacao,
          observacoes: formData.observacoes || null,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Transação criada com sucesso',
        variant: 'default'
      });

      navigate('/financeiro');
    } catch (error: unknown) {
      console.error('Erro ao criar transação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar transação. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <Helmet>
        <title>Nova Transação</title>
        <meta name="description" content="Adicionar nova transação financeira" />
      </Helmet>
      
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="lg:hidden" />
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/financeiro')}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <div className="fade-in-up">
                    <h1 className="text-2xl font-serif font-bold text-dark-blue flex items-center space-x-2">
                      <DollarSign className="w-6 h-6 text-gold" />
                      <span>Nova Transação</span>
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Adicione uma nova entrada ou saída financeira
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <Card className="fade-in-up">
                <CardHeader>
                  <CardTitle>Informações da Transação</CardTitle>
                  <CardDescription>
                    Preencha os dados da nova transação financeira
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo *</Label>
                        <Select
                          value={formData.tipo}
                          onValueChange={(value) => handleInputChange('tipo', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="receita">Receita</SelectItem>
                            <SelectItem value="despesa">Despesa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valor">Valor (R$) *</Label>
                        <Input
                          id="valor"
                          type="text"
                          placeholder="0,00"
                          value={formData.valor}
                          onChange={(e) => {
                            // Permitir apenas números, vírgula e ponto
                            const value = e.target.value.replace(/[^0-9.,]/g, '');
                            handleInputChange('valor', value);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição *</Label>
                      <Input
                        id="descricao"
                        placeholder="Ex: Procedimento de Botox - Cliente Ana Silva"
                        value={formData.descricao}
                        onChange={(e) => handleInputChange('descricao', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoria *</Label>
                        <Select
                          value={formData.categoria}
                          onValueChange={(value) => handleInputChange('categoria', value)}
                          disabled={!formData.tipo}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.tipo && categorias[formData.tipo as 'receita' | 'despesa']?.map((categoria) => (
                              <SelectItem key={categoria} value={categoria}>
                                {categoria}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data_transacao">Data *</Label>
                        <Input
                          id="data_transacao"
                          type="date"
                          value={formData.data_transacao}
                          onChange={(e) => handleInputChange('data_transacao', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        placeholder="Informações adicionais sobre a transação..."
                        value={formData.observacoes}
                        onChange={(e) => handleInputChange('observacoes', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/financeiro')}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-gold hover:bg-gold/80 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Salvando...' : 'Salvar Transação'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default NovaTransacaoPage;

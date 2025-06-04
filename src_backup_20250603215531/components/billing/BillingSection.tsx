import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Download, 
  Plus, 
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  downloadUrl?: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  amount: number;
}

export const BillingSection: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Dados mockados para demonstração
  useEffect(() => {
    // Simular carregamento de dados
    setSubscription({
      id: 'sub_1',
      plan: 'Plano Pro',
      status: 'active',
      currentPeriodEnd: '2025-07-02',
      amount: 99.90
    });

    setPaymentMethods([
      {
        id: 'pm_1',
        type: 'credit_card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true
      }
    ]);

    setInvoices([
      {
        id: 'inv_1',
        date: '2025-06-02',
        amount: 99.90,
        status: 'paid',
        description: 'Plano Pro - Junho 2025',
        downloadUrl: '#'
      },
      {
        id: 'inv_2',
        date: '2025-05-02',
        amount: 99.90,
        status: 'paid',
        description: 'Plano Pro - Maio 2025',
        downloadUrl: '#'
      },
      {
        id: 'inv_3',
        date: '2025-04-02',
        amount: 99.90,
        status: 'paid',
        description: 'Plano Pro - Abril 2025',
        downloadUrl: '#'
      }
    ]);
  }, []);

  const handleAddPaymentMethod = () => {
    toast({
      title: "Em desenvolvimento",
      description: "A integração com Stripe será implementada em breve.",
      variant: "default"
    });
  };

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
    toast({
      title: "Método removido",
      description: "Método de pagamento removido com sucesso.",
      variant: "default"
    });
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast({
      title: "Download iniciado",
      description: `Baixando fatura de ${invoice.description}`,
      variant: "default"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falhou</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      case 'past_due':
        return <Badge className="bg-red-100 text-red-800">Em atraso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Plano de Assinatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-gold" />
            Plano de Assinatura
          </CardTitle>
          <CardDescription>
            Gerencie sua assinatura do NEON PRO
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{subscription.plan}</h3>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(subscription.amount)}/mês
                  </p>
                </div>
                {getStatusBadge(subscription.status)}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Próxima cobrança: {formatDate(subscription.currentPeriodEnd)}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Alterar Plano
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  Cancelar Assinatura
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Nenhuma assinatura ativa</p>
              <Button className="bg-gold hover:bg-gold/80">
                Assinar Plano Pro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métodos de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-gold" />
            Métodos de Pagamento
          </CardTitle>
          <CardDescription>
            Gerencie seus cartões e métodos de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {method.brand} •••• {method.last4}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expira em {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                    </p>
                  </div>
                  {method.isDefault && (
                    <Badge variant="outline" className="text-xs">
                      Padrão
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePaymentMethod(method.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              onClick={handleAddPaymentMethod}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Método de Pagamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Faturamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-gold" />
            Histórico de Faturamento
          </CardTitle>
          <CardDescription>
            Visualize e baixe suas faturas anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                    {invoice.status === 'paid' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{invoice.description}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(invoice.date)} • {formatCurrency(invoice.amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(invoice.status)}
                  {invoice.downloadUrl && invoice.status === 'paid' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

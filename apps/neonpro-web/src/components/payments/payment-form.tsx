'use client';

import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentFormProps {
  invoiceId: string;
  amount: number;
  currency?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export default function PaymentForm({ 
  invoiceId, 
  amount, 
  currency = 'brl',
  onSuccess,
  onError 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe não foi carregado corretamente');
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Elemento do cartão não encontrado');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Criar Payment Intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
          amount,
          currency,
        }),
      });

      const { clientSecret, error: apiError } = await response.json();

      if (apiError) {
        throw new Error(apiError);
      }

      if (!clientSecret) {
        throw new Error('Client secret não foi retornado');
      }

      // Confirmar pagamento
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Erro no pagamento');
      }

      if (paymentIntent?.status === 'succeeded') {
        setSuccess('Pagamento processado com sucesso!');
        toast.success('Pagamento realizado com sucesso');
        
        if (onSuccess) {
          onSuccess(paymentIntent.id);
        }
      } else {
        throw new Error('Pagamento não foi processado corretamente');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro no pagamento: ${errorMessage}`);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Pagamento Concluído
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagamento Seguro
        </CardTitle>
        <CardDescription>
          Total: <span className="font-semibold text-lg">{formatAmount(amount)}</span>
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="card-element" className="text-sm font-medium">
              Dados do Cartão
            </label>
            <div className="p-3 border border-gray-300 rounded-md">
              <CardElement 
                id="card-element"
                options={cardElementOptions}
              />
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Pagamentos processados de forma segura via Stripe</p>
            <p>• Seus dados são protegidos por criptografia SSL</p>
            <p>• Não armazenamos informações do cartão</p>
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            type="submit" 
            disabled={!stripe || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando Pagamento...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pagar {formatAmount(amount)}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

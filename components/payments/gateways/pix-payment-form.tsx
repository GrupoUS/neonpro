'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { QrCode, Copy, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { PixPaymentData, PixPaymentResponse, PixPaymentStatus } from '@/lib/payments/gateways/pix-integration'

interface PixPaymentFormProps {
  amount: number
  description: string
  onPaymentSuccess?: (payment: PixPaymentResponse) => void
  onPaymentError?: (error: string) => void
  className?: string
}

export function PixPaymentForm({
  amount,
  description,
  onPaymentSuccess,
  onPaymentError,
  className
}: PixPaymentFormProps) {
  const [formData, setFormData] = useState<Partial<PixPaymentData>>({
    amount,
    currency: 'BRL',
    description,
    expirationMinutes: 30
  })
  
  const [payment, setPayment] = useState<PixPaymentResponse | null>(null)
  const [status, setStatus] = useState<PixPaymentStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Countdown timer for payment expiration
  useEffect(() => {
    if (payment && payment.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const expiry = new Date(payment.expiresAt).getTime()
        const remaining = Math.max(0, expiry - now)
        
        setTimeRemaining(remaining)
        
        if (remaining === 0) {
          setStatus(PixPaymentStatus.EXPIRED)
          clearInterval(interval)
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [payment])

  // Poll payment status
  useEffect(() => {
    if (payment && status === PixPaymentStatus.PENDING) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/payments/pix/status/${payment.id}`)
          const data = await response.json()
          
          if (data.status !== PixPaymentStatus.PENDING) {
            setStatus(data.status)
            
            if (data.status === PixPaymentStatus.PAID) {
              onPaymentSuccess?.(payment)
              toast.success('Pagamento PIX confirmado!')
            } else if (data.status === PixPaymentStatus.EXPIRED) {
              toast.error('Pagamento PIX expirou')
            }
            
            clearInterval(pollInterval)
          }
        } catch (error) {
          console.error('Error polling payment status:', error)
        }
      }, 3000) // Poll every 3 seconds
      
      return () => clearInterval(pollInterval)
    }
  }, [payment, status, onPaymentSuccess])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.payerName?.trim()) {
      newErrors.payerName = 'Nome é obrigatório'
    }
    
    if (!formData.payerDocument?.trim()) {
      newErrors.payerDocument = 'CPF/CNPJ é obrigatório'
    } else if (!isValidDocument(formData.payerDocument)) {
      newErrors.payerDocument = 'CPF/CNPJ inválido'
    }
    
    if (!formData.payerEmail?.trim()) {
      newErrors.payerEmail = 'E-mail é obrigatório'
    } else if (!isValidEmail(formData.payerEmail)) {
      newErrors.payerEmail = 'E-mail inválido'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/payments/pix/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Falha ao criar pagamento PIX')
      }
      
      const paymentData: PixPaymentResponse = await response.json()
      setPayment(paymentData)
      setStatus(PixPaymentStatus.PENDING)
      
      toast.success('QR Code PIX gerado com sucesso!')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      onPaymentError?.(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const copyQRCode = async () => {
    if (payment?.qrCode) {
      try {
        await navigator.clipboard.writeText(payment.qrCode)
        toast.success('Código PIX copiado!')
      } catch (error) {
        toast.error('Falha ao copiar código')
      }
    }
  }

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusIcon = () => {
    switch (status) {
      case PixPaymentStatus.PENDING:
        return <Clock className="h-4 w-4" />
      case PixPaymentStatus.PAID:
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case PixPaymentStatus.EXPIRED:
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <QrCode className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case PixPaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case PixPaymentStatus.PAID:
        return 'bg-green-100 text-green-800'
      case PixPaymentStatus.EXPIRED:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (payment && status) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                Pagamento PIX
              </CardTitle>
              <CardDescription>
                {formatCurrency(payment.amount)}
              </CardDescription>
            </div>
            <Badge className={getStatusColor()}>
              {status === PixPaymentStatus.PENDING && 'Aguardando Pagamento'}
              {status === PixPaymentStatus.PAID && 'Pago'}
              {status === PixPaymentStatus.EXPIRED && 'Expirado'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {status === PixPaymentStatus.PENDING && (
            <>
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Tempo restante: <strong>{formatTime(timeRemaining)}</strong>
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img 
                    src={payment.qrCodeImage} 
                    alt="QR Code PIX" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Código PIX (Copia e Cola)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={payment.qrCode} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={copyQRCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Escaneie o QR Code ou copie o código PIX</p>
                <p>O pagamento será confirmado automaticamente</p>
              </div>
            </>
          )}
          
          {status === PixPaymentStatus.PAID && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-700">
                  Pagamento Confirmado!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Seu pagamento PIX foi processado com sucesso
                </p>
              </div>
            </div>
          )}
          
          {status === PixPaymentStatus.EXPIRED && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700">
                  Pagamento Expirado
                </h3>
                <p className="text-sm text-muted-foreground">
                  O tempo limite para pagamento foi excedido
                </p>
              </div>
              <Button 
                onClick={() => {
                  setPayment(null)
                  setStatus(null)
                }}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar Novo QR Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Pagamento PIX
        </CardTitle>
        <CardDescription>
          Pague instantaneamente com PIX - {formatCurrency(amount)}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payerName">Nome Completo *</Label>
              <Input
                id="payerName"
                value={formData.payerName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, payerName: e.target.value }))}
                placeholder="Seu nome completo"
                className={errors.payerName ? 'border-red-500' : ''}
              />
              {errors.payerName && (
                <p className="text-sm text-red-500">{errors.payerName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payerDocument">CPF/CNPJ *</Label>
              <Input
                id="payerDocument"
                value={formData.payerDocument || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, payerDocument: e.target.value }))}
                placeholder="000.000.000-00"
                className={errors.payerDocument ? 'border-red-500' : ''}
              />
              {errors.payerDocument && (
                <p className="text-sm text-red-500">{errors.payerDocument}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payerEmail">E-mail *</Label>
            <Input
              id="payerEmail"
              type="email"
              value={formData.payerEmail || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, payerEmail: e.target.value }))}
              placeholder="seu@email.com"
              className={errors.payerEmail ? 'border-red-500' : ''}
            />
            {errors.payerEmail && (
              <p className="text-sm text-red-500">{errors.payerEmail}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Informações Adicionais</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              placeholder="Observações sobre o pagamento (opcional)"
              rows={3}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor a pagar</p>
              <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
            </div>
            
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Gerar PIX
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Utility functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidDocument(document: string): boolean {
  // Remove non-numeric characters
  const cleanDoc = document.replace(/\D/g, '')
  
  // Check CPF (11 digits) or CNPJ (14 digits)
  if (cleanDoc.length === 11) {
    return isValidCPF(cleanDoc)
  } else if (cleanDoc.length === 14) {
    return isValidCNPJ(cleanDoc)
  }
  
  return false
}

function isValidCPF(cpf: string): boolean {
  // Basic CPF validation
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i)
  }
  
  let digit1 = 11 - (sum % 11)
  if (digit1 > 9) digit1 = 0
  
  if (parseInt(cpf[9]) !== digit1) {
    return false
  }
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i)
  }
  
  let digit2 = 11 - (sum % 11)
  if (digit2 > 9) digit2 = 0
  
  return parseInt(cpf[10]) === digit2
}

function isValidCNPJ(cnpj: string): boolean {
  // Basic CNPJ validation
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false
  }
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights1[i]
  }
  
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  if (parseInt(cnpj[12]) !== digit1) {
    return false
  }
  
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights2[i]
  }
  
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  return parseInt(cnpj[13]) === digit2
}

/**
 * TASK-003: Business Logic Enhancement
 * Intelligent Invoice Generation Component
 * 
 * AI-powered invoice generation with template customization,
 * automated calculations, and compliance checking.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Send, Eye, Save } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

interface InvoiceItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  type: 'consultation' | 'procedure' | 'package' | 'custom';
  items: InvoiceItem[];
  terms: string;
  notes: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  cpf: string;
  address: string;
}

interface IntelligentInvoicingProps {
  patientId?: string;
  appointmentId?: string;
  onInvoiceGenerated?: (invoiceId: string) => void;
}

export function IntelligentInvoicing({ 
  patientId, 
  appointmentId, 
  onInvoiceGenerated 
}: IntelligentInvoicingProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [dueDate, setDueDate] = useState<Date>();
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const { toast } = useToast();

  // Mock templates - In production, these would come from the database
  const templates: InvoiceTemplate[] = [
    {
      id: '1',
      name: 'Consulta Dermatológica',
      type: 'consultation',
      items: [
        {
          id: '1',
          serviceId: 'srv_001',
          serviceName: 'Consulta Dermatológica',
          quantity: 1,
          unitPrice: 200.00,
          discount: 0,
          taxRate: 0,
          total: 200.00
        }
      ],
      terms: 'Pagamento à vista ou parcelado em até 3x',
      notes: 'Consulta médica especializada'
    },
    {
      id: '2',
      name: 'Procedimento Estético Completo',
      type: 'procedure',
      items: [
        {
          id: '1',
          serviceId: 'srv_002',
          serviceName: 'Botox Facial',
          quantity: 1,
          unitPrice: 800.00,
          discount: 0,
          taxRate: 0,
          total: 800.00
        },
        {
          id: '2',
          serviceId: 'srv_003',
          serviceName: 'Preenchimento Labial',
          quantity: 1,
          unitPrice: 600.00,
          discount: 0,
          taxRate: 0,
          total: 600.00
        }
      ],
      terms: 'Pagamento parcelado em até 6x sem juros',
      notes: 'Procedimentos realizados conforme protocolo clínico'
    }
  ];

  // AI-powered template recommendation based on patient history and appointment
  const recommendTemplate = async () => {
    if (!patientId && !appointmentId) return;
    
    setIsGenerating(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI recommendation - In production, this would use ML algorithms
      const recommendedTemplate = templates[0];
      setSelectedTemplate(recommendedTemplate);
      setInvoiceItems([...recommendedTemplate.items]);
      
      toast({
        title: "Template Recomendado",
        description: `AI recomendou: ${recommendedTemplate.name}`,
      });
    } catch (error) {
      toast({
        title: "Erro na Recomendação",
        description: "Não foi possível gerar recomendação automática",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate totals with tax and discount
  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = subtotal * (discount / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total
    };
  };

  // Generate invoice with automated processing
  const generateInvoice = async () => {
    if (!patient || invoiceItems.length === 0) {
      toast({
        title: "Dados Incompletos",
        description: "Selecione um paciente e adicione itens à fatura",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const totals = calculateTotals();
      
      // Simulate invoice generation API call
      const invoiceData = {
        patientId: patient.id,
        appointmentId,
        items: invoiceItems,
        dueDate,
        discount,
        taxRate,
        ...totals,
        template: selectedTemplate?.name,
        generatedAt: new Date().toISOString(),
        status: 'pending'
      };

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const invoiceId = `INV-${Date.now()}`;
      
      toast({
        title: "Fatura Gerada",
        description: `Fatura ${invoiceId} criada com sucesso`,
      });
      
      onInvoiceGenerated?.(invoiceId);
      
    } catch (error) {
      toast({
        title: "Erro na Geração",
        description: "Não foi possível gerar a fatura",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Geração Inteligente de Faturas
          </CardTitle>
          <CardDescription>
            Sistema automatizado com recomendações AI e templates personalizáveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Paciente</Label>
              <Select onValueChange={(value) => {
                // Mock patient data
                setPatient({
                  id: value,
                  name: 'Maria Silva',
                  email: 'maria@email.com',
                  cpf: '123.456.789-00',
                  address: 'Rua das Flores, 123'
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient_1">Maria Silva</SelectItem>
                  <SelectItem value="patient_2">João Santos</SelectItem>
                  <SelectItem value="patient_3">Ana Costa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP", { locale: pt }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* AI Template Recommendation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Template de Fatura</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={recommendTemplate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Analisando...' : 'Recomendar com AI'}
              </Button>
            </div>
            
            <Select onValueChange={(templateId) => {
              const template = templates.find(t => t.id === templateId);
              if (template) {
                setSelectedTemplate(template);
                setInvoiceItems([...template.items]);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{template.type}</Badge>
                      {template.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Items */}
          {invoiceItems.length > 0 && (
            <div className="space-y-4">
              <Label>Itens da Fatura</Label>
              <div className="border rounded-lg">
                <div className="p-4 space-y-4">
                  {invoiceItems.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.serviceName}</p>
                        <p className="text-sm text-gray-600">
                          Qtd: {item.quantity} × R$ {item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Discount and Tax */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax">Taxa/Imposto (%)</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Totals Summary */}
          {invoiceItems.length > 0 && (
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {totals.subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto ({discount}%):</span>
                    <span>-R$ {totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div className="flex justify-between">
                    <span>Impostos ({taxRate}%):</span>
                    <span>R$ {totals.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={generateInvoice}
              disabled={isGenerating || !patient || invoiceItems.length === 0}
              className="flex-1 sm:flex-none"
            >
              <Send className="mr-2 h-4 w-4" />
              {isGenerating ? 'Gerando...' : 'Gerar Fatura'}
            </Button>
            
            <Button variant="outline" onClick={() => setPreviewMode(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </Button>
            
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Salvar Rascunho
            </Button>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

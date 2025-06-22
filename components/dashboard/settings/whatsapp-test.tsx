'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, MessageSquare, Send, CheckCircle, XCircle } from 'lucide-react'
import { whatsappService } from '@/lib/whatsapp/whatsapp-service'

export function WhatsAppTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [testPhone, setTestPhone] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  const handleTestConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const result = await whatsappService.testConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erro inesperado: ${(error as Error).message}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTestMessage = async () => {
    if (!testPhone || !selectedTemplate) {
      setSendResult('Por favor, preencha o número e selecione um template')
      return
    }

    setSendingTest(true)
    setSendResult(null)

    try {
      const success = await whatsappService.sendMessage({
        to: testPhone,
        template: selectedTemplate,
        variables: ['Cliente Teste', 'Serviço Teste', '25/06/2025', '14:00', 'Clínica Teste']
      })

      setSendResult(success ? 'Mensagem enviada com sucesso!' : 'Falha ao enviar mensagem')
    } catch (error) {
      setSendResult(`Erro ao enviar: ${(error as Error).message}`)
    } finally {
      setSendingTest(false)
    }
  }

  const templates = whatsappService.getAvailableTemplates()

  return (
    <div className="space-y-6">
      {/* Teste de Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Teste de Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Teste se a configuração do WhatsApp Business está funcionando corretamente.
          </p>

          <Button 
            onClick={handleTestConnection} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Testar Conexão
          </Button>

          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <div className="flex items-center">
                {testResult.success ? (
                  <CheckCircle className="mr-2 h-4 w-4" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                <AlertDescription>{testResult.message}</AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Teste de Envio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="mr-2 h-5 w-5" />
            Teste de Envio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Envie uma mensagem de teste para verificar se os templates estão funcionando.
          </p>

          <div>
            <Label htmlFor="test_phone">Número de Teste</Label>
            <Input
              id="test_phone"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+5511999999999"
            />
          </div>

          <div>
            <Label htmlFor="template">Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.name} value={template.name}>
                    {template.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-1">Preview da mensagem:</p>
              <p className="text-sm text-muted-foreground">
                {templates.find(t => t.name === selectedTemplate)?.sample}
              </p>
            </div>
          )}

          <Button 
            onClick={handleSendTestMessage} 
            disabled={sendingTest || !testPhone || !selectedTemplate}
            className="w-full"
          >
            {sendingTest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Mensagem de Teste
          </Button>

          {sendResult && (
            <Alert variant={sendResult.includes('sucesso') ? "default" : "destructive"}>
              <AlertDescription>{sendResult}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Templates Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.name} className="border rounded-lg p-4">
                <h4 className="font-medium">{template.display_name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.sample}
                </p>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    Variáveis: {template.variables.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

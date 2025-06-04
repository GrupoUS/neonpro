
import React, { useState } from 'react';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatbotConfig } from '@/hooks/useChatbotConfig';

interface ChatbotSettingsProps {
  onClose: () => void;
}

export const ChatbotSettings: React.FC<ChatbotSettingsProps> = ({ onClose }) => {
  const { config, updateConfig } = useChatbotConfig();
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [formData, setFormData] = useState({
    openrouter_api_key: config?.openrouter_api_key || '',
    modelo_preferido: config?.modelo_preferido || 'anthropic/claude-3-sonnet',
    temperatura: config?.temperatura || 0.7,
    max_tokens: config?.max_tokens || 2000,
    personalidade: config?.personalidade?.descricao || '',
  });

  const modelos = [
    { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet (Recomendado)' },
    { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (Rápido)' },
    { value: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Econômico)' },
    { value: 'google/gemini-pro', label: 'Gemini Pro' },
    { value: 'mistralai/mistral-7b-instruct', label: 'Mistral 7B' },
  ];

  const handleSave = async () => {
    await updateConfig({
      openrouter_api_key: formData.openrouter_api_key,
      modelo_preferido: formData.modelo_preferido,
      temperatura: formData.temperatura,
      max_tokens: formData.max_tokens,
      personalidade: {
        descricao: formData.personalidade
      }
    });
    onClose();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-sm">Configurações do Chatbot</h3>
      </div>

      {/* Configurações */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key">Chave API OpenRouter *</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={formData.openrouter_api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, openrouter_api_key: e.target.value }))}
                placeholder="sk-or-v1-..."
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha sua chave em{' '}
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          {/* Modelo */}
          <div className="space-y-2">
            <Label>Modelo de IA</Label>
            <Select
              value={formData.modelo_preferido}
              onValueChange={(value) => setFormData(prev => ({ ...prev, modelo_preferido: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelos.map((modelo) => (
                  <SelectItem key={modelo.value} value={modelo.value}>
                    {modelo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temperatura */}
          <div className="space-y-2">
            <Label>Criatividade (Temperatura): {formData.temperatura}</Label>
            <Slider
              value={[formData.temperatura]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, temperatura: value[0] }))}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              0 = Mais preciso e conservador | 1 = Mais criativo e variado
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label>Máximo de Tokens: {formData.max_tokens}</Label>
            <Slider
              value={[formData.max_tokens]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, max_tokens: value[0] }))}
              min={100}
              max={4000}
              step={100}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controla o tamanho máximo das respostas da IA
            </p>
          </div>

          {/* Personalidade */}
          <div className="space-y-2">
            <Label htmlFor="personalidade">Personalidade Customizada</Label>
            <Textarea
              id="personalidade"
              value={formData.personalidade}
              onChange={(e) => setFormData(prev => ({ ...prev, personalidade: e.target.value }))}
              placeholder="Ex: Seja mais técnico e direto, foque em eficiência operacional..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Instruções adicionais para personalizar o comportamento da IA
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t">
        <Button 
          onClick={handleSave}
          className="w-full"
          disabled={!formData.openrouter_api_key.trim()}
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

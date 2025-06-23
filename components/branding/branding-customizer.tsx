'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useBranding } from '@/hooks/use-branding';
import { 
  Palette, 
  Building, 
  Share2, 
  Download, 
  Upload, 
  RotateCcw,
  Eye,
  Save
} from 'lucide-react';

export function BrandingCustomizer() {
  const {
    branding,
    isLoading,
    updateClinicInfo,
    updateColors,
    updateSocialMedia,
    applyTheme,
    resetToDefault,
    exportBranding,
    importBranding,
    availableThemes
  } = useBranding();

  const [previewMode, setPreviewMode] = useState(false);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importBranding(file)
        .then(() => {
          alert('Configuração importada com sucesso!');
        })
        .catch((error) => {
          alert(`Erro ao importar: ${error.message}`);
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personalização de Marca</h1>
          <p className="text-muted-foreground">
            Customize a aparência e informações da sua clínica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Editar' : 'Visualizar'}
          </Button>
          <Button variant="outline" onClick={exportBranding}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={resetToDefault}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Preview da marca atual */}
      <Card>
        <CardHeader>
          <CardTitle className="clinic-name">{branding.clinicName}</CardTitle>
          <CardDescription className="clinic-slogan">{branding.clinicSlogan}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{branding.clinicDescription}</p>
          <div className="flex items-center space-x-4 mt-4">
            <div className="w-4 h-4 rounded brand-primary"></div>
            <div className="w-4 h-4 rounded brand-secondary"></div>
            <div className="w-4 h-4 rounded brand-accent"></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="clinic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clinic">
            <Building className="h-4 w-4 mr-2" />
            Clínica
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Cores
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="h-4 w-4 mr-2" />
            Redes Sociais
          </TabsTrigger>
          <TabsTrigger value="themes">
            <Eye className="h-4 w-4 mr-2" />
            Temas
          </TabsTrigger>
        </TabsList>

        {/* Informações da Clínica */}
        <TabsContent value="clinic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Clínica</CardTitle>
              <CardDescription>
                Configure as informações básicas da sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Nome da Clínica</Label>
                  <Input
                    id="clinicName"
                    value={branding.clinicName}
                    onChange={(e) => updateClinicInfo({ clinicName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicSlogan">Slogan</Label>
                  <Input
                    id="clinicSlogan"
                    value={branding.clinicSlogan}
                    onChange={(e) => updateClinicInfo({ clinicSlogan: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinicDescription">Descrição</Label>
                <Textarea
                  id="clinicDescription"
                  value={branding.clinicDescription}
                  onChange={(e) => updateClinicInfo({ clinicDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={branding.phone}
                    onChange={(e) => updateClinicInfo({ phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={branding.email}
                    onChange={(e) => updateClinicInfo({ email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={branding.address}
                  onChange={(e) => updateClinicInfo({ address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={branding.website}
                  onChange={(e) => updateClinicInfo({ website: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cores */}
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paleta de Cores</CardTitle>
              <CardDescription>
                Personalize as cores da sua marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary">Cor Primária</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primary"
                      type="color"
                      value={branding.colors.primary}
                      onChange={(e) => updateColors({ primary: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={branding.colors.primary}
                      onChange={(e) => updateColors({ primary: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary">Cor Secundária</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondary"
                      type="color"
                      value={branding.colors.secondary}
                      onChange={(e) => updateColors({ secondary: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={branding.colors.secondary}
                      onChange={(e) => updateColors({ secondary: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accent">Cor de Destaque</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="accent"
                      type="color"
                      value={branding.colors.accent}
                      onChange={(e) => updateColors({ accent: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={branding.colors.accent}
                      onChange={(e) => updateColors({ accent: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redes Sociais */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>
                Configure os links das suas redes sociais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={branding.socialMedia.instagram || ''}
                    onChange={(e) => updateSocialMedia({ instagram: e.target.value })}
                    placeholder="https://instagram.com/sua_clinica"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={branding.socialMedia.facebook || ''}
                    onChange={(e) => updateSocialMedia({ facebook: e.target.value })}
                    placeholder="https://facebook.com/sua_clinica"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={branding.socialMedia.whatsapp || ''}
                    onChange={(e) => updateSocialMedia({ whatsapp: e.target.value })}
                    placeholder="https://wa.me/5511999999999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={branding.socialMedia.tiktok || ''}
                    onChange={(e) => updateSocialMedia({ tiktok: e.target.value })}
                    placeholder="https://tiktok.com/@sua_clinica"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Temas */}
        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temas Predefinidos</CardTitle>
              <CardDescription>
                Escolha um tema predefinido para sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {availableThemes.map((theme) => (
                  <Button
                    key={theme}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => applyTheme(theme)}
                  >
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <div className="w-3 h-3 rounded-full bg-secondary"></div>
                      <div className="w-3 h-3 rounded-full bg-accent"></div>
                    </div>
                    <span className="text-sm font-medium capitalize">{theme}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Importar/Exportar</CardTitle>
              <CardDescription>
                Gerencie suas configurações de branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button onClick={exportBranding}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Configuração
                </Button>
                
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                    id="import-branding"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="import-branding" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Configuração
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

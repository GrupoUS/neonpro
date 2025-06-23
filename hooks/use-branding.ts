'use client';

import { useState, useEffect } from 'react';
import { 
  BrandingConfig, 
  defaultBranding, 
  brandingThemes, 
  generateCustomCSS,
  generatePWAManifest 
} from '@/lib/branding/theme';

const BRANDING_STORAGE_KEY = 'neonpro-branding';

export function useBranding() {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configuração salva do localStorage
  useEffect(() => {
    try {
      const savedBranding = localStorage.getItem(BRANDING_STORAGE_KEY);
      if (savedBranding) {
        const parsed = JSON.parse(savedBranding);
        setBranding({ ...defaultBranding, ...parsed });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de branding:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Aplicar CSS customizado quando o branding mudar
  useEffect(() => {
    if (!isLoading) {
      applyCustomCSS(branding);
      updatePWAManifest(branding);
    }
  }, [branding, isLoading]);

  // Salvar configuração no localStorage
  const saveBranding = (newBranding: Partial<BrandingConfig>) => {
    const updatedBranding = { ...branding, ...newBranding };
    setBranding(updatedBranding);
    
    try {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(updatedBranding));
    } catch (error) {
      console.error('Erro ao salvar configuração de branding:', error);
    }
  };

  // Aplicar tema predefinido
  const applyTheme = (themeName: keyof typeof brandingThemes) => {
    const theme = brandingThemes[themeName];
    saveBranding(theme);
  };

  // Resetar para configuração padrão
  const resetToDefault = () => {
    setBranding(defaultBranding);
    localStorage.removeItem(BRANDING_STORAGE_KEY);
  };

  // Aplicar CSS customizado
  const applyCustomCSS = (brandingConfig: BrandingConfig) => {
    const css = generateCustomCSS(brandingConfig);
    
    // Remover estilo anterior se existir
    const existingStyle = document.getElementById('custom-branding-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Adicionar novo estilo
    const style = document.createElement('style');
    style.id = 'custom-branding-css';
    style.textContent = css;
    document.head.appendChild(style);

    // Atualizar meta theme-color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', brandingConfig.colors.primary);
    }
  };

  // Atualizar manifest PWA
  const updatePWAManifest = (brandingConfig: BrandingConfig) => {
    const manifest = generatePWAManifest(brandingConfig);
    
    // Atualizar link do manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      // Criar blob com o novo manifest
      const manifestBlob = new Blob([JSON.stringify(manifest)], { 
        type: 'application/json' 
      });
      const manifestUrl = URL.createObjectURL(manifestBlob);
      manifestLink.setAttribute('href', manifestUrl);
    }
  };

  // Atualizar informações da clínica
  const updateClinicInfo = (info: Partial<Pick<BrandingConfig, 'clinicName' | 'clinicSlogan' | 'clinicDescription' | 'phone' | 'email' | 'address' | 'website'>>) => {
    saveBranding(info);
  };

  // Atualizar cores
  const updateColors = (colors: Partial<BrandingConfig['colors']>) => {
    saveBranding({
      colors: { ...branding.colors, ...colors }
    });
  };

  // Atualizar logo
  const updateLogo = (logo: Partial<BrandingConfig['logo']>) => {
    saveBranding({
      logo: { ...branding.logo, ...logo }
    });
  };

  // Atualizar redes sociais
  const updateSocialMedia = (socialMedia: Partial<BrandingConfig['socialMedia']>) => {
    saveBranding({
      socialMedia: { ...branding.socialMedia, ...socialMedia }
    });
  };

  // Exportar configuração
  const exportBranding = () => {
    const dataStr = JSON.stringify(branding, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `neonpro-branding-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Importar configuração
  const importBranding = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const importedBranding = JSON.parse(result);
          
          // Validar estrutura básica
          if (importedBranding.clinicName && importedBranding.colors) {
            saveBranding(importedBranding);
            resolve();
          } else {
            reject(new Error('Arquivo de configuração inválido'));
          }
        } catch (error) {
          reject(new Error('Erro ao processar arquivo'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  return {
    branding,
    isLoading,
    saveBranding,
    applyTheme,
    resetToDefault,
    updateClinicInfo,
    updateColors,
    updateLogo,
    updateSocialMedia,
    exportBranding,
    importBranding,
    availableThemes: Object.keys(brandingThemes) as Array<keyof typeof brandingThemes>
  };
}

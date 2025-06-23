// Configuração de tema e branding para NeonPro
// Personalize as cores, fontes e elementos visuais da clínica

export interface BrandingConfig {
  // Informações da clínica
  clinicName: string;
  clinicSlogan: string;
  clinicDescription: string;
  
  // Contato
  phone: string;
  email: string;
  address: string;
  website: string;
  
  // Cores do tema
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  
  // Configurações visuais
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  
  // Redes sociais
  socialMedia: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    tiktok?: string;
  };
  
  // Configurações PWA
  pwa: {
    name: string;
    shortName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
  };
}

// Configuração padrão do NeonPro
export const defaultBranding: BrandingConfig = {
  // Informações da clínica
  clinicName: "NeonPro",
  clinicSlogan: "Sua beleza em primeiro lugar",
  clinicDescription: "Centro de estética e beleza especializado em tratamentos faciais e corporais",
  
  // Contato
  phone: "+55 11 99999-9999",
  email: "contato@neonpro.com.br",
  address: "Rua das Flores, 123 - Centro, São Paulo - SP",
  website: "https://neonpro.com.br",
  
  // Cores do tema (tons de azul e rosa neon)
  colors: {
    primary: "#3b82f6", // Azul vibrante
    secondary: "#ec4899", // Rosa neon
    accent: "#06b6d4", // Ciano
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#f1f5f9",
    border: "#e2e8f0",
  },
  
  // Logo
  logo: {
    url: "/icons/icon-192x192.png",
    alt: "NeonPro Logo",
    width: 192,
    height: 192,
  },
  
  // Redes sociais
  socialMedia: {
    instagram: "https://instagram.com/neonpro",
    facebook: "https://facebook.com/neonpro",
    whatsapp: "https://wa.me/5511999999999",
  },
  
  // PWA
  pwa: {
    name: "NeonPro - Sistema de Gestão",
    shortName: "NeonPro",
    description: "Sistema completo para gestão de clínicas de estética e beleza",
    themeColor: "#3b82f6",
    backgroundColor: "#ffffff",
  },
};

// Temas predefinidos para diferentes tipos de clínica
export const brandingThemes = {
  // Tema elegante (tons de dourado e preto)
  elegant: {
    ...defaultBranding,
    colors: {
      primary: "#d4af37", // Dourado
      secondary: "#1a1a1a", // Preto elegante
      accent: "#f5f5dc", // Bege claro
      background: "#ffffff",
      foreground: "#1a1a1a",
      muted: "#f8f8f8",
      border: "#e5e5e5",
    },
    pwa: {
      ...defaultBranding.pwa,
      themeColor: "#d4af37",
    },
  },
  
  // Tema natural (tons de verde)
  natural: {
    ...defaultBranding,
    colors: {
      primary: "#22c55e", // Verde natural
      secondary: "#16a34a", // Verde escuro
      accent: "#84cc16", // Verde lima
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#f0fdf4",
      border: "#dcfce7",
    },
    pwa: {
      ...defaultBranding.pwa,
      themeColor: "#22c55e",
    },
  },
  
  // Tema luxo (tons de roxo e dourado)
  luxury: {
    ...defaultBranding,
    colors: {
      primary: "#7c3aed", // Roxo luxo
      secondary: "#d4af37", // Dourado
      accent: "#a855f7", // Roxo claro
      background: "#ffffff",
      foreground: "#1e1b4b",
      muted: "#faf5ff",
      border: "#e9d5ff",
    },
    pwa: {
      ...defaultBranding.pwa,
      themeColor: "#7c3aed",
    },
  },
  
  // Tema minimalista (tons de cinza)
  minimal: {
    ...defaultBranding,
    colors: {
      primary: "#374151", // Cinza escuro
      secondary: "#6b7280", // Cinza médio
      accent: "#9ca3af", // Cinza claro
      background: "#ffffff",
      foreground: "#111827",
      muted: "#f9fafb",
      border: "#e5e7eb",
    },
    pwa: {
      ...defaultBranding.pwa,
      themeColor: "#374151",
    },
  },
};

// Função para aplicar tema personalizado
export function applyBrandingTheme(theme: keyof typeof brandingThemes): BrandingConfig {
  return brandingThemes[theme];
}

// Função para gerar CSS customizado baseado no branding
export function generateCustomCSS(branding: BrandingConfig): string {
  return `
    :root {
      --primary: ${branding.colors.primary};
      --secondary: ${branding.colors.secondary};
      --accent: ${branding.colors.accent};
      --background: ${branding.colors.background};
      --foreground: ${branding.colors.foreground};
      --muted: ${branding.colors.muted};
      --border: ${branding.colors.border};
    }
    
    .clinic-name {
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      color: var(--primary);
    }
    
    .clinic-slogan {
      font-family: 'Inter', sans-serif;
      font-weight: 400;
      color: var(--secondary);
      font-style: italic;
    }
    
    .brand-primary {
      background-color: var(--primary);
      color: white;
    }
    
    .brand-secondary {
      background-color: var(--secondary);
      color: white;
    }
    
    .brand-accent {
      background-color: var(--accent);
      color: var(--foreground);
    }
  `;
}

// Função para atualizar manifest.json com branding personalizado
export function generatePWAManifest(branding: BrandingConfig) {
  return {
    name: branding.pwa.name,
    short_name: branding.pwa.shortName,
    description: branding.pwa.description,
    start_url: "/",
    display: "standalone",
    background_color: branding.pwa.backgroundColor,
    theme_color: branding.pwa.themeColor,
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png"
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png"
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png"
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}

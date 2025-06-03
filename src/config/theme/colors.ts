
// Configuração de cores NEON PRO - Identidade "Universo da Sacha"
export const neonColors = {
  // Cores principais da paleta NEON PRO (baseada no "Universo da Sacha")
  'dark-blue': '#112031', // Azul escuro principal
  'dark-blue-rgb': '17, 32, 49',
  'blue': '#294359', // Azul médio
  'blue-rgb': '41, 67, 89',
  'gold': '#AC9469', // Dourado principal NEON PRO
  'gold-rgb': '172, 148, 105',
  'gray-dark': '#B4AC9C', // Cinza escuro
  'gray-light': '#D2D0C8', // Cinza claro
  
  // Variações da paleta principal NEON PRO
  'dark-blue-lighter': '#1a2b42',
  'dark-blue-darker': '#0a1520',
  'blue-lighter': '#3a5a7a',
  'blue-darker': '#1e3347',
  'gold-lighter': '#c4aa7d',
  'gold-darker': '#8a7852',
  
  // Tons neutros complementares
  'cream': '#F5F3F0', // Creme suave
  'warm-white': '#FDFCFA', // Branco quente
  'charcoal': '#2C2C2C', // Carvão
};

export const primaryColors = {
  DEFAULT: '#AC9469', // Dourado NEON PRO como cor principal
  50: '#faf8f5',
  100: '#f5f1ea',
  200: '#ebe2d1',
  300: '#ddd0b3',
  400: '#ccb88f',
  500: '#AC9469', // Cor principal
  600: '#9a7f52',
  700: '#7d6642',
  800: '#665438',
  900: '#544530',
  foreground: '#112031' // Azul escuro para contraste
};

export const secondaryColors = {
  DEFAULT: '#112031', // Azul escuro como secundária
  50: '#f6f7f8',
  100: '#eaedf1',
  200: '#d1d8e0',
  300: '#acbac8',
  400: '#8196ab',
  500: '#607691',
  600: '#4d5f78',
  700: '#3f4e62',
  800: '#294359', // Azul médio
  900: '#112031', // Azul escuro principal
  foreground: '#FDFCFA'
};

export const systemColors = {
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))'
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))'
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))'
  },
  popover: {
    DEFAULT: 'hsl(var(--popover))',
    foreground: 'hsl(var(--popover-foreground))'
  },
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))'
  },
  sidebar: {
    DEFAULT: 'hsl(var(--sidebar-background))',
    foreground: 'hsl(var(--sidebar-foreground))',
    primary: 'hsl(var(--sidebar-primary))',
    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    accent: 'hsl(var(--sidebar-accent))',
    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    border: 'hsl(var(--sidebar-border))',
    ring: 'hsl(var(--sidebar-ring))'
  }
};

// Mantendo compatibilidade com código existente
export const sachaColors = neonColors;


// Configuração de cores NEON PRO
export const neonColors = {
  // Cores principais do gradiente cyan-green
  'cyan': '#00F5FF', // Cyan brilhante
  'cyan-dark': '#00D4DD', // Cyan mais escuro
  'cyan-light': '#33F7FF', // Cyan mais claro
  'green': '#00FA9A', // Verde brilhante (medium spring green)
  'green-dark': '#00D882', // Verde mais escuro
  'green-light': '#33FBA8', // Verde mais claro
  
  // Tons de apoio
  'dark': '#0A0A0F', // Azul muito escuro, quase preto
  'dark-blue': '#1A1A2E', // Azul escuro para fundos
  'gray': '#2D2D3A', // Cinza azulado
  'light-gray': '#B0B0B8', // Cinza claro
  
  // Cores específicas para branding
  'brand': '#00F5FF', // Cor principal da marca
  'subtitle': '#B0B0B8', // Cor para subtítulos
};

// Paleta de cores oficial "Universo da Sacha" - Mantida para compatibilidade
export const sachaColors = {
  'dark-blue': '#112031',
  'dark-blue-rgb': '17, 32, 49',
  'blue': '#294359',
  'blue-rgb': '41, 67, 89',
  'gold': '#AC9469',
  'gold-rgb': '172, 148, 105',
  'gray-dark': '#B4AC9C',
  'gray-light': '#D2D0C8',
  'dark-blue-lighter': '#1a2b42',
  'dark-blue-darker': '#0a1520',
  'blue-lighter': '#3a5a7a',
  'blue-darker': '#1e3347',
  'gold-lighter': '#c4aa7d',
  'gold-darker': '#8a7852',
};

export const primaryColors = {
  DEFAULT: '#00F5FF', // Cyan brilhante como cor principal
  50: '#e6feff',
  100: '#ccfdff',
  200: '#99fbff',
  300: '#66f9ff',
  400: '#33f7ff',
  500: '#00F5FF', // Cor principal
  600: '#00c4cc',
  700: '#009399',
  800: '#006266',
  900: '#003133',
  foreground: '#0A0A0F'
};

export const secondaryColors = {
  DEFAULT: '#00FA9A', // Verde brilhante como secundária
  50: '#e6fffa',
  100: '#ccfff5',
  200: '#99ffeb',
  300: '#66ffe1',
  400: '#33ffd7',
  500: '#00FA9A', // Cor principal
  600: '#00c87b',
  700: '#00965c',
  800: '#00643e',
  900: '#00321f',
  foreground: '#0A0A0F'
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

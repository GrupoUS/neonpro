
// Configuração de cores "NEON PRO" - Identidade Visual Oficial
export const neonColors = {
  // Cores principais da paleta "NEON PRO"
  // Mapeamento para o Tema "GRUPOUS"
  'primary-dark': '#112031', // --color-primary-dark (Azul-Noite)
  'primary-dark-rgb': '17, 32, 49',
  'primary-medium': '#294359', // --color-primary-medium (Azul-Cosmos)
  'primary-medium-rgb': '41, 67, 89',
  'accent': '#AC9469', // --color-accent (Dourado-Celestial / Neon-Gold)
  'accent-rgb': '172, 148, 105',
  'neutral-dark': '#B4AC9C', // --color-neutral-dark (Cinza-Estelar)
  'neutral-light': '#D2D0C8', // --color-neutral-light (Cinza-Neblina)
  
  // Variações da paleta principal (ajustadas para GRUPOUS)
  'primary-dark-lighter': '#1a2b42',
  'primary-dark-darker': '#0a1520',
  'primary-medium-lighter': '#3a5a7a',
  'primary-medium-darker': '#1e3347',
  'accent-lighter': '#c4aa7d',
  'accent-darker': '#8a7852',
  
  // Cores de texto (ajustadas para GRUPOUS)
  'text-light': '#FFFFFF', // --color-text-light (Branco)
  'text-light-alt': '#D2D0C8', // --color-text-light (Cinza-Neblina)
  'text-dark': '#112031', // --color-text-dark (Azul-Noite)
};

export const primaryColors = {
  DEFAULT: '#AC9469', // --color-accent (Dourado-Celestial)
  50: '#faf8f5',
  100: '#f5f1ea',
  200: '#ebe2d1',
  300: '#ddd0b3',
  400: '#ccb88f',
  500: '#AC9469', // Cor principal (Dourado-Celestial)
  600: '#9a7f52',
  700: '#7d6642',
  800: '#665438',
  900: '#544530',
  foreground: '#112031' // --color-primary-dark (Azul-Noite)
};

export const secondaryColors = {
  DEFAULT: '#112031', // --color-primary-dark (Azul-Noite)
  50: '#f6f7f8',
  100: '#eaedf1',
  200: '#d1d8e0',
  300: '#acbac8',
  400: '#8196ab',
  500: '#607691',
  600: '#4d5f78',
  700: '#3f4e62',
  800: '#294359', // --color-primary-medium (Azul-Cosmos)
  900: '#112031', // --color-primary-dark (Azul-Noite)
  foreground: '#FDFCFA' // --color-text-light (Branco)
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

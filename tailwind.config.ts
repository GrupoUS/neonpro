import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				// Tipografias institucionais da identidade visual "Universo da Sacha"
				'sans': ['Inter', 'sans-serif'], // Para textos de corpo
				'display': ['Optima', 'Inter', 'sans-serif'], // Para títulos e destaques
				'optima': ['Optima', 'Inter', 'sans-serif'], // Explícita para títulos
				'inter': ['Inter', 'sans-serif'], // Explícita para textos
			},
			fontWeight: {
				'light': '300',
				'normal': '400',
				'medium': '500',
				'semibold': '600',
				'bold': '700',
				'extrabold': '800',
				'extrablack': '900',
			},
			colors: {
				// Nova paleta NEON PRO - Baseada no hexágono cyan-green
				'neon': {
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
				},
				
				// Paleta de cores oficial "Universo da Sacha" - Mantida para compatibilidade
				'sacha': {
					// ... keep existing code (sacha color definitions)
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
				},
				
				// Atualização das cores principais para NEON PRO
				'primary': {
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
				},
				
				'secondary': {
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
				},
				
				// Aliases para compatibilidade mantidos
				'gold': '#00F5FF', // Mapeado para o novo cyan
				
				// ... keep existing code (system colors)
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
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'xl': '0.75rem',
				'2xl': '1rem',
				'3xl': '1.5rem',
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			},
			backgroundImage: {
				// Novos gradientes NEON PRO
				'gradient-neon': 'linear-gradient(135deg, #00F5FF 0%, #00FA9A 100%)',
				'gradient-neon-dark': 'linear-gradient(135deg, #00D4DD 0%, #00D882 100%)',
				'gradient-neon-vertical': 'linear-gradient(180deg, #00F5FF 0%, #00FA9A 100%)',
				'gradient-neon-radial': 'radial-gradient(circle, #00F5FF 0%, #00FA9A 100%)',
			},
			boxShadow: {
				// Sombras personalizadas seguindo a identidade visual
				'sacha': '0 4px 6px -1px rgba(17, 32, 49, 0.1), 0 2px 4px -1px rgba(17, 32, 49, 0.06)',
				'sacha-lg': '0 10px 15px -3px rgba(17, 32, 49, 0.1), 0 4px 6px -2px rgba(17, 32, 49, 0.05)',
				'sacha-xl': '0 20px 25px -5px rgba(17, 32, 49, 0.1), 0 10px 10px -5px rgba(17, 32, 49, 0.04)',
				'sacha-gold': '0 10px 15px -3px rgba(172, 148, 105, 0.3), 0 4px 6px -2px rgba(172, 148, 105, 0.1)',
				// Novas sombras NEON PRO
				'neon': '0 4px 6px -1px rgba(0, 245, 255, 0.2), 0 2px 4px -1px rgba(0, 250, 154, 0.1)',
				'neon-lg': '0 10px 15px -3px rgba(0, 245, 255, 0.3), 0 4px 6px -2px rgba(0, 250, 154, 0.2)',
				'neon-xl': '0 20px 25px -5px rgba(0, 245, 255, 0.4), 0 10px 10px -5px rgba(0, 250, 154, 0.3)',
				'neon-glow': '0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 250, 154, 0.3)',
				// Mantendo compatibilidade
				'horizon': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'horizon-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'horizon-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			},
			keyframes: {
				// ... keep existing code (accordion, fade, scale animations)
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-in-right': {
					'0%': {
						opacity: '0',
						transform: 'translateX(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'slide-in-left': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				'pulse-gold': {
					'0%, 100%': {
						boxShadow: '0 0 0 0 rgba(172, 148, 105, 0.7)'
					},
					'70%': {
						boxShadow: '0 0 0 10px rgba(172, 148, 105, 0)'
					}
				},
				// Novas animações NEON PRO
				'pulse-neon': {
					'0%, 100%': {
						boxShadow: '0 0 0 0 rgba(0, 245, 255, 0.7)'
					},
					'70%': {
						boxShadow: '0 0 0 15px rgba(0, 245, 255, 0)'
					}
				},
				'glow-neon': {
					'0%, 100%': {
						boxShadow: '0 0 5px rgba(0, 245, 255, 0.5), 0 0 10px rgba(0, 250, 154, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 20px rgba(0, 245, 255, 0.8), 0 0 30px rgba(0, 250, 154, 0.6), 0 0 40px rgba(0, 245, 255, 0.4)'
					}
				},
				'gradient-shift': {
					'0%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					},
					'100%': {
						backgroundPosition: '0% 50%'
					}
				}
			},
			animation: {
				// ... keep existing code (basic animations)
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'slide-in-left': 'slide-in-left 0.5s ease-out',
				'shimmer': 'shimmer 2s infinite',
				'pulse-gold': 'pulse-gold 2s infinite',
				// Novas animações NEON PRO
				'pulse-neon': 'pulse-neon 2s infinite',
				'glow-neon': 'glow-neon 2s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
			},
			backdropBlur: {
				'xs': '2px',
			},
			transitionDuration: {
				'400': '400ms',
				'600': '600ms',
			},
			transitionTimingFunction: {
				'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'sacha-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
			},
			zIndex: {
				'60': '60',
				'70': '70',
				'80': '80',
				'90': '90',
				'100': '100',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;

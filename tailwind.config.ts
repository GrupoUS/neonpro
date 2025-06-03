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
				// Paleta de cores oficial "Universo da Sacha"
				'sacha': {
					// Azul Escuro (Fundo Principal do Modo Escuro) - #112031
					'dark-blue': '#112031',
					'dark-blue-rgb': '17, 32, 49',
					
					// Azul Secundário - #294359  
					'blue': '#294359',
					'blue-rgb': '41, 67, 89',
					
					// Dourado (Cor de Destaque) - #AC9469
					'gold': '#AC9469',
					'gold-rgb': '172, 148, 105',
					
					// Cinzas (Texto, Fundos Secundários)
					'gray-dark': '#B4AC9C', // #B4AC9C
					'gray-light': '#D2D0C8', // #D2D0C8 com 75% opacidade
					
					// Variações para melhor contraste
					'dark-blue-lighter': '#1a2b42',
					'dark-blue-darker': '#0a1520',
					'blue-lighter': '#3a5a7a',
					'blue-darker': '#1e3347',
					'gold-lighter': '#c4aa7d',
					'gold-darker': '#8a7852',
				},
				
				// Aliases para compatibilidade e semântica
				'primary': {
					DEFAULT: '#AC9469', // Dourado principal
					50: '#f7f5f1',
					100: '#ede8dc',
					200: '#dbd0bb',
					300: '#c4aa7d',
					400: '#AC9469', // Cor principal
					500: '#9a8359',
					600: '#8a7852',
					700: '#6f5f42',
					800: '#5c4f38',
					900: '#4d422f',
					foreground: '#112031'
				},
				
				'secondary': {
					DEFAULT: '#294359', // Azul secundário
					50: '#f1f5f9',
					100: '#e2e8f0',
					200: '#cbd5e1',
					300: '#94a3b8',
					400: '#64748b',
					500: '#294359', // Cor principal
					600: '#233a4d',
					700: '#1e3347',
					800: '#182934',
					900: '#0f1c24',
					foreground: '#D2D0C8'
				},
				
				// Sistema de cores semânticas mantido
				'success': '#22c55e',
				'warning': '#f59e0b', 
				'error': '#ef4444',
				'info': '#3b82f6',
				
				// Cores do sistema shadcn/ui mantidas para compatibilidade
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
			boxShadow: {
				// Sombras personalizadas seguindo a identidade visual
				'sacha': '0 4px 6px -1px rgba(17, 32, 49, 0.1), 0 2px 4px -1px rgba(17, 32, 49, 0.06)',
				'sacha-lg': '0 10px 15px -3px rgba(17, 32, 49, 0.1), 0 4px 6px -2px rgba(17, 32, 49, 0.05)',
				'sacha-xl': '0 20px 25px -5px rgba(17, 32, 49, 0.1), 0 10px 10px -5px rgba(17, 32, 49, 0.04)',
				'sacha-gold': '0 10px 15px -3px rgba(172, 148, 105, 0.3), 0 4px 6px -2px rgba(172, 148, 105, 0.1)',
				// Mantendo compatibilidade
				'horizon': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'horizon-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'horizon-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			},
			keyframes: {
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
				'glow-sacha': {
					'0%, 100%': {
						boxShadow: '0 0 5px rgba(172, 148, 105, 0.5)'
					},
					'50%': {
						boxShadow: '0 0 20px rgba(172, 148, 105, 0.8), 0 0 30px rgba(172, 148, 105, 0.6)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'slide-in-left': 'slide-in-left 0.5s ease-out',
				'shimmer': 'shimmer 2s infinite',
				'pulse-gold': 'pulse-gold 2s infinite',
				'glow-sacha': 'glow-sacha 2s ease-in-out infinite',
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

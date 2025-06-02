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
				'sans': ['Plus Jakarta Sans', 'sans-serif'],
				'display': ['Plus Jakarta Sans', 'sans-serif'],
			},
			fontWeight: {
				'light': '300',
				'normal': '400',
				'medium': '500',
				'semibold': '600',
				'bold': '700',
				'extrabold': '800',
			},
			colors: {
				// Horizon UI Core Colors
				'horizon-blue': {
					50: 'hsl(220, 60%, 99%)',
					100: 'hsl(220, 43%, 96%)',
					200: 'hsl(220, 50%, 90%)',
					300: 'hsl(220, 50%, 80%)',
					400: 'hsl(220, 50%, 65%)',
					500: 'hsl(220, 91%, 50%)',
					600: 'hsl(220, 91%, 45%)',
					700: 'hsl(220, 91%, 40%)',
					800: 'hsl(220, 91%, 35%)',
					900: 'hsl(220, 91%, 25%)',
				},
				
				// Neon Gold Accent
				'neon-gold': {
					DEFAULT: 'hsl(51, 100%, 50%)', // #FFD700
					light: 'hsl(51, 100%, 65%)',
					dark: 'hsl(45, 100%, 45%)',
				},
				
				// Professional Gray Scale
				'horizon-gray': {
					50: 'hsl(210, 20%, 98%)',
					100: 'hsl(210, 20%, 95%)',
					200: 'hsl(210, 16%, 93%)',
					300: 'hsl(210, 14%, 89%)',
					400: 'hsl(210, 14%, 83%)',
					500: 'hsl(210, 11%, 71%)',
					600: 'hsl(210, 7%, 56%)',
					700: 'hsl(210, 9%, 31%)',
					800: 'hsl(210, 10%, 23%)',
					900: 'hsl(220, 13%, 18%)',
				},
				
				// Semantic Colors
				'success': 'hsl(142, 76%, 36%)',
				'warning': 'hsl(38, 92%, 50%)',
				'error': 'hsl(0, 84%, 60%)',
				'info': 'hsl(199, 89%, 48%)',
				
				// Base System Colors
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
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
				'horizon': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'horizon-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'horizon-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
				'neon-gold': '0 10px 15px -3px rgba(255, 215, 0, 0.3), 0 4px 6px -2px rgba(255, 215, 0, 0.1)',
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
						boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)'
					},
					'70%': {
						boxShadow: '0 0 0 10px rgba(255, 215, 0, 0)'
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


import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// Importações dos módulos de tema
import { neonColors, primaryColors, secondaryColors, systemColors } from "./src/config/theme/colors";
import { keyframes, animations } from "./src/config/theme/animations";
import { fontFamily, fontWeight } from "./src/config/theme/typography";
import { backgroundImage, boxShadow, transitionTimingFunction, spacing, zIndex } from "./src/config/theme/effects";
import { buttons } from "./src/config/theme/components";

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
			fontFamily,
			fontWeight,
			colors: {
				// Paleta "NEON PRO" - Identidade Oficial
				'neon': neonColors,
				
				// Cores específicas do branding "NEON PRO"
				'neon-brand': '#AC9469', // Dourado principal
				'neon-subtitle': '#B4AC9C', // Cinza escuro para subtítulos  
				'neon-dark': '#112031', // Azul escuro principal
				
				// Cores principais
				'primary': primaryColors,
				'secondary': secondaryColors,
				
				// Cores do sistema
				...systemColors
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'xl': '0.75rem',
				'2xl': '1rem',
				'3xl': '1.5rem',
			},
			spacing,
			backgroundImage,
			boxShadow,
			keyframes,
			animation: animations,
			backdropBlur: {
				'xs': '2px',
			},
			transitionDuration: {
				'400': '400ms',
				'600': '600ms',
			},
			transitionTimingFunction,
			zIndex,
			// Componentes
			buttons,
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;

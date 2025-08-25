"use client";

/**
 * Accessibility Components Index
 * FASE 4: Frontend Components - Accessibility First Design
 * Compliance: WCAG 2.1 AA, LGPD/ANVISA/CFM
 */

export {
	SkipToContentLink,
	ScreenReaderOnly,
	LiveRegion,
	FocusTrap,
	KeyboardHelper,
	AccessibilityPanel,
	StatusAnnouncer,
	announceStatus,
	checkColorContrast,
	useFocusManagement,
} from "./AccessibilityComponents";

// Accessibility types
export interface AccessibilityPreferences {
	fontSize: number;
	highContrast: boolean;
	reducedMotion: boolean;
	screenReader: boolean;
	keyboardNavigation: boolean;
	soundEnabled: boolean;
	autoplay: boolean;
}

export interface FocusManagement {
	trapFocus: (container: HTMLElement) => void;
	releaseFocus: () => void;
}

// ARIA utilities
export const ARIA_LABELS = {
	// Navigation
	mainNavigation: "Navegação principal",
	breadcrumb: "Navegação estrutural",
	pagination: "Navegação de páginas",
	
	// Forms
	required: "Campo obrigatório",
	optional: "Campo opcional",
	invalid: "Campo inválido",
	
	// Interactive elements
	button: "Botão",
	link: "Link",
	menu: "Menu",
	dialog: "Caixa de diálogo",
	
	// Status
	loading: "Carregando",
	error: "Erro",
	success: "Sucesso",
	warning: "Aviso",
	
	// Healthcare specific
	patient: "Informações do paciente",
	medical: "Informações médicas",
	sensitive: "Informação sensível - LGPD",
	compliance: "Conformidade regulatória",
} as const;

// WCAG compliance utilities
export const WCAG_STANDARDS = {
	colorContrast: {
		AA_NORMAL: 4.5,
		AA_LARGE: 3.0,
		AAA_NORMAL: 7.0,
		AAA_LARGE: 4.5,
	},
	touchTarget: {
		minimum: 44, // pixels
		recommended: 48, // pixels
	},
	timing: {
		shortDelay: 3000, // ms
		mediumDelay: 10000, // ms
		longDelay: 30000, // ms
	},
} as const;

// Keyboard navigation constants
export const KEYBOARD_SHORTCUTS = {
	SKIP_CONTENT: "Tab",
	HELP: "?",
	ESCAPE: "Escape",
	ENTER: "Enter",
	SPACE: " ",
	ARROW_UP: "ArrowUp",
	ARROW_DOWN: "ArrowDown",
	ARROW_LEFT: "ArrowLeft",
	ARROW_RIGHT: "ArrowRight",
	HOME: "Home",
	END: "End",
} as const;

// Screen reader utilities
export const SCREEN_READER = {
	ANNOUNCE_POLITE: "polite",
	ANNOUNCE_ASSERTIVE: "assertive",
	ANNOUNCE_OFF: "off",
} as const;

export type ContrastLevel = "AAA" | "AA" | "FAIL";
export type AnnouncementLevel = keyof typeof SCREEN_READER;
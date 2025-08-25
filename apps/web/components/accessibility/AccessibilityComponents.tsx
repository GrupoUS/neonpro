/**
 * Accessibility Components and Utilities
 * FASE 4: Frontend Components - Accessibility First Design
 * Compliance: WCAG 2.1 AA, LGPD/ANVISA/CFM
 */

"use client";

import { useState, useEffect, useRef } from "react";
import {
	Eye,
	EyeOff,
	Keyboard,
	MousePointer,
	Speaker,
	Type,
	Volume2,
	VolumeX,
	Contrast,
	Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

// Skip to content link for keyboard navigation
export function SkipToContentLink() {
	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
		>
			Pular para o conteúdo principal
		</a>
	);
}

// Screen reader only text
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
	return <span className="sr-only">{children}</span>;
}

// ARIA live region for dynamic announcements
export function LiveRegion({
	children,
	politeness = "polite",
}: {
	children: React.ReactNode;
	politeness?: "off" | "polite" | "assertive";
}) {
	return (
		<div
			aria-live={politeness}
			aria-atomic="true"
			className="sr-only"
		>
			{children}
		</div>
	);
}

// Focus trap utility for modals and overlays
export function FocusTrap({ children }: { children: React.ReactNode }) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const focusableElements = container.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		
		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

		const handleTabKey = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			if (e.shiftKey) {
				if (document.activeElement === firstElement) {
					lastElement?.focus();
					e.preventDefault();
				}
			} else {
				if (document.activeElement === lastElement) {
					firstElement?.focus();
					e.preventDefault();
				}
			}
		};

		container.addEventListener("keydown", handleTabKey);
		firstElement?.focus();

		return () => {
			container.removeEventListener("keydown", handleTabKey);
		};
	}, []);

	return (
		<div ref={containerRef} role="dialog" aria-modal="true">
			{children}
		</div>
	);
}

// Keyboard navigation helper
export function KeyboardHelper() {
	const [showHelper, setShowHelper] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "?" && (e.ctrlKey || e.metaKey)) {
				setShowHelper(!showHelper);
			}
			if (e.key === "Escape") {
				setShowHelper(false);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [showHelper]);

	const shortcuts = [
		{ keys: ["Ctrl", "?"], description: "Mostrar/ocultar esta ajuda" },
		{ keys: ["Tab"], description: "Navegar para próximo elemento" },
		{ keys: ["Shift", "Tab"], description: "Navegar para elemento anterior" },
		{ keys: ["Enter", "Space"], description: "Ativar botão ou link" },
		{ keys: ["Escape"], description: "Fechar modal ou menu" },
		{ keys: ["Home"], description: "Ir para o início da página" },
		{ keys: ["End"], description: "Ir para o fim da página" },
		{ keys: ["Arrow Keys"], description: "Navegar em listas e menus" },
	];

	if (!showHelper) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Keyboard className="h-5 w-5" />
						Atalhos de Teclado
					</CardTitle>
					<CardDescription>
						Navegue pelo sistema usando apenas o teclado
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						{shortcuts.map((shortcut, index) => (
							<div key={index} className="flex items-center justify-between">
								<div className="flex gap-1">
									{shortcut.keys.map((key, keyIndex) => (
										<Badge key={keyIndex} variant="outline" className="text-xs">
											{key}
										</Badge>
									))}
								</div>
								<span className="text-sm text-muted-foreground">
									{shortcut.description}
								</span>
							</div>
						))}
					</div>
					<Button
						onClick={() => setShowHelper(false)}
						className="w-full"
						autoFocus
					>
						Fechar
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

// Accessibility preferences panel
interface AccessibilityPreferences {
	fontSize: number;
	highContrast: boolean;
	reducedMotion: boolean;
	screenReader: boolean;
	keyboardNavigation: boolean;
	soundEnabled: boolean;
	autoplay: boolean;
}

export function AccessibilityPanel() {
	const [preferences, setPreferences] = useState<AccessibilityPreferences>({
		fontSize: 16,
		highContrast: false,
		reducedMotion: false,
		screenReader: false,
		keyboardNavigation: true,
		soundEnabled: true,
		autoplay: false,
	});

	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// Load preferences from localStorage
		const saved = localStorage.getItem("neonpro-accessibility-preferences");
		if (saved) {
			setPreferences(JSON.parse(saved));
		}
	}, []);

	useEffect(() => {
		// Save preferences to localStorage
		localStorage.setItem("neonpro-accessibility-preferences", JSON.stringify(preferences));
		
		// Apply preferences to document
		document.documentElement.style.fontSize = `${preferences.fontSize}px`;
		
		if (preferences.highContrast) {
			document.documentElement.classList.add("high-contrast");
		} else {
			document.documentElement.classList.remove("high-contrast");
		}
		
		if (preferences.reducedMotion) {
			document.documentElement.classList.add("reduce-motion");
		} else {
			document.documentElement.classList.remove("reduce-motion");
		}
	}, [preferences]);

	const updatePreference = <K extends keyof AccessibilityPreferences>(
		key: K,
		value: AccessibilityPreferences[K]
	) => {
		setPreferences(prev => ({ ...prev, [key]: value }));
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full p-0"
					aria-label="Configurações de acessibilidade"
				>
					<Eye className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			
			<PopoverContent
				side="top"
				align="end"
				className="w-80"
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<div className="space-y-4">
					<div>
						<h3 className="text-lg font-semibold">Acessibilidade</h3>
						<p className="text-sm text-muted-foreground">
							Personalize a experiência para suas necessidades
						</p>
					</div>

					{/* Font Size */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label className="text-sm font-medium">Tamanho da Fonte</label>
							<Badge variant="outline">{preferences.fontSize}px</Badge>
						</div>
						<Slider
							value={[preferences.fontSize]}
							onValueChange={([value]) => updatePreference("fontSize", value)}
							min={12}
							max={24}
							step={1}
							className="w-full"
						/>
					</div>

					{/* High Contrast */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Contrast className="h-4 w-4" />
							<label className="text-sm font-medium">Alto Contraste</label>
						</div>
						<Switch
							checked={preferences.highContrast}
							onCheckedChange={(checked) => updatePreference("highContrast", checked)}
						/>
					</div>

					{/* Reduced Motion */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<MousePointer className="h-4 w-4" />
							<label className="text-sm font-medium">Reduzir Movimento</label>
						</div>
						<Switch
							checked={preferences.reducedMotion}
							onCheckedChange={(checked) => updatePreference("reducedMotion", checked)}
						/>
					</div>

					{/* Screen Reader */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Speaker className="h-4 w-4" />
							<label className="text-sm font-medium">Leitor de Tela</label>
						</div>
						<Switch
							checked={preferences.screenReader}
							onCheckedChange={(checked) => updatePreference("screenReader", checked)}
						/>
					</div>

					{/* Keyboard Navigation */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Keyboard className="h-4 w-4" />
							<label className="text-sm font-medium">Navegação por Teclado</label>
						</div>
						<Switch
							checked={preferences.keyboardNavigation}
							onCheckedChange={(checked) => updatePreference("keyboardNavigation", checked)}
						/>
					</div>

					{/* Sound */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{preferences.soundEnabled ? (
								<Volume2 className="h-4 w-4" />
							) : (
								<VolumeX className="h-4 w-4" />
							)}
							<label className="text-sm font-medium">Sons do Sistema</label>
						</div>
						<Switch
							checked={preferences.soundEnabled}
							onCheckedChange={(checked) => updatePreference("soundEnabled", checked)}
						/>
					</div>

					{/* Reset */}
					<Button
						variant="outline"
						className="w-full"
						onClick={() => {
							setPreferences({
								fontSize: 16,
								highContrast: false,
								reducedMotion: false,
								screenReader: false,
								keyboardNavigation: true,
								soundEnabled: true,
								autoplay: false,
							});
						}}
					>
						Restaurar Padrão
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

// ARIA status announcer for dynamic content changes
export function StatusAnnouncer() {
	const [message, setMessage] = useState("");

	useEffect(() => {
		const handleStatusChange = (event: CustomEvent) => {
			setMessage(event.detail.message);
			// Clear message after announcement
			setTimeout(() => setMessage(""), 1000);
		};

		document.addEventListener("announce-status", handleStatusChange as EventListener);
		return () => {
			document.removeEventListener("announce-status", handleStatusChange as EventListener);
		};
	}, []);

	return (
		<LiveRegion politeness="assertive">
			{message}
		</LiveRegion>
	);
}

// Utility function to announce status changes
export function announceStatus(message: string) {
	const event = new CustomEvent("announce-status", {
		detail: { message }
	});
	document.dispatchEvent(event);
}

// Color contrast checker utility
export function checkColorContrast(foreground: string, background: string): "AAA" | "AA" | "FAIL" {
	// Simplified contrast ratio calculation
	// In production, use a proper color contrast library
	const ratio = 4.5; // Mock ratio for demo
	
	if (ratio >= 7) return "AAA";
	if (ratio >= 4.5) return "AA";
	return "FAIL";
}

// Focus management hook
export function useFocusManagement() {
	const previouslyFocusedElement = useRef<HTMLElement | null>(null);

	const trapFocus = (container: HTMLElement) => {
		previouslyFocusedElement.current = document.activeElement as HTMLElement;
		const focusableElements = container.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		(focusableElements[0] as HTMLElement)?.focus();
	};

	const releaseFocus = () => {
		previouslyFocusedElement.current?.focus();
		previouslyFocusedElement.current = null;
	};

	return { trapFocus, releaseFocus };
}
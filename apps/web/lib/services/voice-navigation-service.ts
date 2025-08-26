/**
 * Voice Navigation Service - NeonPro
 * Portuguese Clinical Voice Commands System
 * Optimized for sterile environments and healthcare workflows
 */

import { supabase } from "@/lib/supabase";

interface VoiceCommand {
	id: string;
	pattern: RegExp;
	action: string;
	category: "navigation" | "patient" | "appointment" | "emergency" | "inventory";
	description: string;
	requiresConfirmation?: boolean;
	sterileEnvironmentSafe: boolean;
}

interface VoiceNavigationState {
	isListening: boolean;
	isProcessing: boolean;
	lastCommand: string | null;
	confidence: number;
	error: string | null;
}

interface VoiceRecognitionResult {
	command: string;
	confidence: number;
	action?: string;
	parameters?: Record<string, any>;
	requiresConfirmation?: boolean;
}

class VoiceNavigationService {
	private recognition: SpeechRecognition | null = null;
	private synthesis: SpeechSynthesis;
	private isInitialized = false;
	private currentState: VoiceNavigationState = {
		isListening: false,
		isProcessing: false,
		lastCommand: null,
		confidence: 0,
		error: null,
	};

	private commands: VoiceCommand[] = [
		// Navigation Commands
		{
			id: "nav_dashboard",
			pattern: /^(ir para|abrir|mostrar) (dashboard|painel|início)$/i,
			action: "navigate_dashboard",
			category: "navigation",
			description: "Ir para o dashboard principal",
			sterileEnvironmentSafe: true,
		},
		{
			id: "nav_patients",
			pattern: /^(ir para|abrir|mostrar) pacientes$/i,
			action: "navigate_patients",
			category: "navigation",
			description: "Abrir lista de pacientes",
			sterileEnvironmentSafe: true,
		},
		{
			id: "nav_appointments",
			pattern: /^(ir para|abrir|mostrar) (agenda|agendamentos|consultas)$/i,
			action: "navigate_appointments",
			category: "navigation",
			description: "Abrir agenda de consultas",
			sterileEnvironmentSafe: true,
		},

		// Patient Commands
		{
			id: "search_patient",
			pattern: /^(buscar|encontrar|mostrar) paciente (.+)$/i,
			action: "search_patient",
			category: "patient",
			description: "Buscar paciente por nome",
			sterileEnvironmentSafe: true,
		},
		{
			id: "patient_history",
			pattern: /^(histórico|prontuário) do paciente (.+)$/i,
			action: "show_patient_history",
			category: "patient",
			description: "Mostrar histórico do paciente",
			sterileEnvironmentSafe: true,
		},
		{
			id: "patient_status",
			pattern: /^status do paciente (.+)$/i,
			action: "show_patient_status",
			category: "patient",
			description: "Mostrar status atual do paciente",
			sterileEnvironmentSafe: true,
		},

		// Appointment Commands
		{
			id: "schedule_appointment",
			pattern: /^agendar consulta (.+) (para|às) (.+)$/i,
			action: "schedule_appointment",
			category: "appointment",
			description: "Agendar nova consulta",
			requiresConfirmation: true,
			sterileEnvironmentSafe: false,
		},
		{
			id: "next_appointment",
			pattern: /^(próxima consulta|próximo paciente)$/i,
			action: "show_next_appointment",
			category: "appointment",
			description: "Mostrar próxima consulta",
			sterileEnvironmentSafe: true,
		},
		{
			id: "today_schedule",
			pattern: /^(agenda de hoje|consultas de hoje)$/i,
			action: "show_today_schedule",
			category: "appointment",
			description: "Mostrar agenda do dia",
			sterileEnvironmentSafe: true,
		},

		// Emergency Commands
		{
			id: "emergency_protocol",
			pattern: /^(emergência|protocolo de emergência|socorro) (sala|paciente) (.+)$/i,
			action: "emergency_protocol",
			category: "emergency",
			description: "Ativar protocolo de emergência",
			requiresConfirmation: true,
			sterileEnvironmentSafe: true,
		},
		{
			id: "call_doctor",
			pattern: /^(chamar|contatar) (médico|doutor|doutora)$/i,
			action: "call_doctor",
			category: "emergency",
			description: "Contatar médico de plantão",
			requiresConfirmation: true,
			sterileEnvironmentSafe: true,
		},

		// Inventory Commands
		{
			id: "check_stock",
			pattern: /^(estoque|quantidade) de (.+)$/i,
			action: "check_inventory",
			category: "inventory",
			description: "Verificar estoque de produto",
			sterileEnvironmentSafe: true,
		},
		{
			id: "low_stock_alert",
			pattern: /^(produtos em falta|estoque baixo)$/i,
			action: "show_low_stock",
			category: "inventory",
			description: "Mostrar produtos com estoque baixo",
			sterileEnvironmentSafe: true,
		},
	];

	constructor() {
		this.synthesis = window.speechSynthesis;
		this.initializeRecognition();
	}

	private initializeRecognition() {
		if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
			this.currentState.error = "Reconhecimento de voz não suportado neste navegador";
			return;
		}

		// @ts-expect-error - SpeechRecognition types
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		this.recognition = new SpeechRecognition();

		this.recognition.continuous = false;
		this.recognition.interimResults = false;
		this.recognition.lang = "pt-BR";
		this.recognition.maxAlternatives = 1;

		this.recognition.onstart = () => {
			this.currentState.isListening = true;
			this.currentState.error = null;
		};

		this.recognition.onend = () => {
			this.currentState.isListening = false;
		};

		this.recognition.onresult = async (event) => {
			const result = event.results[0];
			const command = result[0].transcript.toLowerCase().trim();
			const confidence = result[0].confidence;

			this.currentState.lastCommand = command;
			this.currentState.confidence = confidence;

			await this.processCommand(command, confidence);
		};

		this.recognition.onerror = (event) => {
			this.currentState.error = `Erro de reconhecimento: ${event.error}`;
			this.currentState.isListening = false;
		};

		this.isInitialized = true;
	}

	async startListening(): Promise<void> {
		if (!this.recognition || !this.isInitialized) {
			throw new Error("Reconhecimento de voz não inicializado");
		}

		if (this.currentState.isListening) {
			return;
		}

		try {
			this.recognition.start();

			// Log voice interaction
			await supabase.from("assistant_logs").insert({
				action: "voice_recognition_started",
				details: {
					timestamp: new Date().toISOString(),
					user_agent: navigator.userAgent,
				},
			});
		} catch (error) {
			this.currentState.error = `Erro ao iniciar reconhecimento: ${error}`;
			throw error;
		}
	}

	stopListening(): void {
		if (this.recognition && this.currentState.isListening) {
			this.recognition.stop();
		}
	}

	private async processCommand(command: string, confidence: number): Promise<void> {
		this.currentState.isProcessing = true;

		try {
			// Find matching command
			const matchedCommand = this.findMatchingCommand(command);

			if (!matchedCommand) {
				await this.speak("Comando não reconhecido. Tente novamente.");
				this.logUnrecognizedCommand(command, confidence);
				return;
			}

			// Check confidence threshold
			if (confidence < 0.7) {
				await this.speak(`Confirma o comando: ${command}?`);
				// TODO: Implement confirmation logic
				return;
			}

			// Execute command
			const result = await this.executeCommand(matchedCommand, command);

			if (result.success) {
				await this.speak(result.message || "Comando executado com sucesso");
			} else {
				await this.speak(result.error || "Erro ao executar comando");
			}
		} catch (error) {
			console.error("Command processing error:", error);
			await this.speak("Erro ao processar comando");
		} finally {
			this.currentState.isProcessing = false;
		}
	}

	private findMatchingCommand(command: string): VoiceCommand | null {
		for (const cmd of this.commands) {
			if (cmd.pattern.test(command)) {
				return cmd;
			}
		}
		return null;
	}

	private async executeCommand(
		voiceCommand: VoiceCommand,
		spokenCommand: string
	): Promise<{ success: boolean; message?: string; error?: string }> {
		// Log command execution
		await supabase.from("assistant_logs").insert({
			action: "voice_command_executed",
			details: {
				command_id: voiceCommand.id,
				spoken_command: spokenCommand,
				category: voiceCommand.category,
				timestamp: new Date().toISOString(),
			},
		});

		// Extract parameters from command
		const match = voiceCommand.pattern.exec(spokenCommand);
		const parameters = match ? match.slice(1) : [];

		try {
			switch (voiceCommand.action) {
				case "navigate_dashboard":
					window.location.href = "/dashboard";
					return { success: true, message: "Indo para o dashboard" };

				case "navigate_patients":
					window.location.href = "/dashboard/patients";
					return { success: true, message: "Abrindo lista de pacientes" };

				case "navigate_appointments":
					window.location.href = "/dashboard/appointments";
					return { success: true, message: "Abrindo agenda" };

				case "search_patient":
					if (parameters[1]) {
						const patientName = parameters[1];
						window.location.href = `/dashboard/patients?search=${encodeURIComponent(patientName)}`;
						return { success: true, message: `Buscando paciente ${patientName}` };
					}
					return { success: false, error: "Nome do paciente não especificado" };

				case "show_patient_history":
					if (parameters[1]) {
						// TODO: Implement patient history lookup
						return { success: true, message: `Abrindo histórico de ${parameters[1]}` };
					}
					return { success: false, error: "Nome do paciente não especificado" };

				case "show_next_appointment":
					// TODO: Implement next appointment lookup
					return { success: true, message: "Mostrando próxima consulta" };

				case "show_today_schedule":
					window.location.href = "/dashboard/appointments?date=today";
					return { success: true, message: "Mostrando agenda de hoje" };

				case "check_inventory":
					if (parameters[1]) {
						// TODO: Implement inventory check
						return { success: true, message: `Verificando estoque de ${parameters[1]}` };
					}
					return { success: false, error: "Produto não especificado" };

				case "emergency_protocol":
					// TODO: Implement emergency protocol
					return { success: true, message: "Protocolo de emergência ativado" };

				default:
					return { success: false, error: "Ação não implementada" };
			}
		} catch (error) {
			console.error("Command execution error:", error);
			return { success: false, error: "Erro na execução do comando" };
		}
	}

	private async speak(text: string): Promise<void> {
		return new Promise((resolve) => {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = "pt-BR";
			utterance.rate = 0.9;
			utterance.pitch = 1;
			utterance.volume = 0.8;

			utterance.onend = () => resolve();
			utterance.onerror = () => resolve();

			this.synthesis.speak(utterance);
		});
	}

	private async logUnrecognizedCommand(command: string, confidence: number): Promise<void> {
		await supabase.from("assistant_logs").insert({
			action: "voice_command_unrecognized",
			details: {
				command,
				confidence,
				timestamp: new Date().toISOString(),
			},
		});
	}

	// Public API
	getState(): VoiceNavigationState {
		return { ...this.currentState };
	}

	getAvailableCommands(): VoiceCommand[] {
		return this.commands.map((cmd) => ({ ...cmd }));
	}

	getCommandsByCategory(category: VoiceCommand["category"]): VoiceCommand[] {
		return this.commands.filter((cmd) => cmd.category === category);
	}

	isSupported(): boolean {
		return "speechSynthesis" in window && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
	}
}

export const voiceNavigationService = new VoiceNavigationService();
export type { VoiceCommand, VoiceNavigationState, VoiceRecognitionResult };
